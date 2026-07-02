const { prisma } = require("../utils/prisma");
const { AppError } = require("../utils/errors");
const { asyncHandler } = require("../utils/asyncHandler");
const { emitSeatUpdate } = require("../services/socket");
const { generateQR } = require("../services/qr.service");
const { sendBookingConfirmation, sendWaitlistOffer } = require("../services/email.service");

function generateReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "TKT-";
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

const createBooking = asyncHandler(async (req, res) => {
  const { eventId, showSeatIds } = req.body;
  if (!eventId || !showSeatIds || !Array.isArray(showSeatIds) || showSeatIds.length === 0) {
    throw new AppError(400, "eventId and showSeatIds array are required");
  }

  const result = await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRawUnsafe(
      `SELECT ss.id, ss.seat_id, ss.status, ss.held_by, ss.held_until, s.label, s.category_id, sc.name as category_name
       FROM show_seats ss JOIN seats s ON s.id = ss.seat_id JOIN seat_categories sc ON sc.id = s.category_id
       WHERE ss.id IN (${showSeatIds.map((_, i) => `$${i + 1}`).join(",")}) FOR UPDATE`,
      ...showSeatIds,
    );

    for (const seat of locked) {
      if (seat.status !== "held" || seat.held_by !== req.user.userId) {
        throw new AppError(409, `Seat ${seat.label} is not held by you`);
      }
      if (new Date(seat.held_until) < new Date()) {
        throw new AppError(409, `Hold expired for seat ${seat.label}`);
      }
    }

    const pricing = await tx.eventPricing.findMany({
      where: { eventId },
      include: { category: true },
    });
    const pricingMap = {};
    for (const p of pricing) pricingMap[p.categoryId] = Number(p.price);

    let totalAmount = 0;
    for (const row of locked) {
      const price = pricingMap[row.category_id] || 0;
      totalAmount += price;
    }

    const reference = generateReference();
    const booking = await tx.booking.create({
      data: {
        reference,
        userId: req.user.userId,
        eventId,
        totalAmount,
        status: "confirmed",
        qrCode: "",
      },
    });

    const qrData = JSON.stringify({ ref: reference, event: eventId, seats: showSeatIds });
    const qrBase64 = await generateQR(qrData);

    await tx.booking.update({
      where: { id: booking.id },
      data: { qrCode: qrBase64 },
    });

    for (const row of locked) {
      const price = pricingMap[row.category_id] || 0;

      await tx.showSeat.update({
        where: { id: row.id },
        data: { status: "booked", bookingId: booking.id },
      });

      await tx.bookingSeat.create({
        data: { bookingId: booking.id, showSeatId: row.id, priceAtTime: price },
      });
    }

    return { booking, reference, qrBase64, totalAmount, seats: locked };
  });

  emitSeatUpdate(eventId, showSeatIds, "booked");

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    await sendBookingConfirmation(
      user.email,
      user.name,
      event.title,
      event.date.toLocaleDateString(),
      result.seats.map((s) => ({ label: s.label, category: s.category_name })),
      result.totalAmount.toFixed(2),
      result.reference,
      result.qrBase64,
    );
  } catch (err) {
    console.error("Email send failed:", err.message);
  }

  res.status(201).json({
    id: result.booking.id,
    reference: result.reference,
    totalAmount: result.totalAmount,
    status: "confirmed",
    seats: result.seats.map((s) => ({ id: s.id, label: s.label })),
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.userId },
    include: {
      event: { select: { id: true, title: true, type: true, date: true, venue: { select: { name: true } } } },
      showSeats: { include: { seat: { select: { label: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = bookings.map((b) => ({
    ...b,
    qrCode: b.qrCode || null,
    totalAmount: Number(b.totalAmount),
  }));
  res.json(result);
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      event: { select: { id: true, title: true, type: true, date: true, venue: { select: { name: true } } } },
      showSeats: { include: { seat: { select: { label: true, category: { select: { name: true } } } } } },
    },
  });
  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.userId !== req.user.userId && req.user.role !== "admin") {
    throw new AppError(403, "Not your booking");
  }
  res.json(booking);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { showSeats: { include: { seat: { include: { category: true } } } } },
  });
  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.userId !== req.user.userId) throw new AppError(403, "Not your booking");
  if (booking.status !== "confirmed") throw new AppError(400, "Booking is not active");

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: bookingId }, data: { status: "cancelled" } });

    await tx.bookingSeat.deleteMany({ where: { bookingId } });

    const showSeatIds = booking.showSeats.map((s) => s.id);
    const firstSeat = booking.showSeats[0];
    const categoryId = firstSeat?.seat?.categoryId;

    await tx.showSeat.updateMany({
      where: { id: { in: showSeatIds } },
      data: { status: "available", heldBy: null, heldAt: null, heldUntil: null, bookingId: null },
    });

    emitSeatUpdate(booking.eventId, showSeatIds, "available");

    if (categoryId) {
      const next = await tx.waitlist.findFirst({
        where: { eventId: booking.eventId, categoryId, status: "waiting" },
        orderBy: { createdAt: "asc" },
        include: { user: true },
      });

      if (next) {
        const offerUntil = new Date(Date.now() + 30 * 60 * 1000);
        await tx.waitlist.update({
          where: { id: next.id },
          data: { status: "offered", offeredAt: new Date(), offeredUntil: offerUntil },
        });

        const seatToOffer = showSeatIds[0];
        await tx.showSeat.update({
          where: { id: seatToOffer },
          data: { status: "held", heldBy: next.userId, heldAt: new Date(), heldUntil: offerUntil },
        });

        emitSeatUpdate(booking.eventId, [seatToOffer], "held", next.userId, offerUntil);

        try {
          const event = await tx.event.findUnique({ where: { id: booking.eventId } });
          await sendWaitlistOffer(
            next.user.email,
            next.user.name,
            event.title,
            firstSeat.seat.category.name,
            `${process.env.FRONTEND_URL || "http://localhost:5173"}/events/${booking.eventId}?offer=${next.id}`,
            offerUntil.toLocaleString(),
          );
        } catch (err) {
          console.error("Waitlist email failed:", err.message);
        }
      }
    }
  });

  res.json({ message: "Booking cancelled" });
});

module.exports = { createBooking, getMyBookings, getBooking, cancelBooking };
