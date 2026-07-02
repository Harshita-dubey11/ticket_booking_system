const { prisma } = require("../utils/prisma");
const { AppError } = require("../utils/errors");
const { asyncHandler } = require("../utils/asyncHandler");

const browseEvents = asyncHandler(async (req, res) => {
  const { type, search, date, venueId } = req.query;
  const where = {};
  if (type) where.type = type;
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (date) where.date = new Date(date);
  if (venueId) where.venueId = venueId;

  const events = await prisma.event.findMany({
    where,
    include: {
      venue: { select: { id: true, name: true } },
      eventPricings: { include: { category: { select: { id: true, name: true, color: true } } } },
      _count: { select: { bookings: true } },
    },
    orderBy: { date: "asc" },
  });
  res.json(events);
});

const getMyEvents = asyncHandler(async (req, res) => {
  const events = await prisma.event.findMany({
    where: { createdBy: req.user.userId },
    include: {
      venue: { select: { id: true, name: true } },
      eventPricings: { include: { category: { select: { id: true, name: true, color: true } } } },
      _count: { select: { bookings: true, waitlist: true } },
    },
    orderBy: { date: "desc" },
  });
  res.json(events);
});

const getEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      venue: { include: { seatCategories: true } },
      eventPricings: { include: { category: true } },
      creator: { select: { id: true, name: true } },
    },
  });
  if (!event) throw new AppError(404, "Event not found");
  res.json(event);
});

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, type, venueId, date, duration, posterUrl } = req.body;
  if (!title || !type || !venueId || !date || !duration) {
    throw new AppError(400, "title, type, venueId, date, and duration are required");
  }

  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) throw new AppError(404, "Venue not found");

  const event = await prisma.event.create({
    data: {
      title,
      description,
      type,
      venueId,
      date: new Date(date),
      duration,
      posterUrl: posterUrl || null,
      createdBy: req.user.userId,
    },
  });

  await prisma.showSeat.createMany({
    data: (await prisma.seat.findMany({ where: { venueId } })).map((seat) => ({
      eventId: event.id,
      seatId: seat.id,
    })),
  });

  res.status(201).json(event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, type, date, duration } = req.body;
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) throw new AppError(404, "Event not found");
  if (event.createdBy !== req.user.userId && req.user.role !== "admin") {
    throw new AppError(403, "Not your event");
  }

  const updated = await prisma.event.update({
    where: { id: req.params.id },
    data: { title, description, type, date: date ? new Date(date) : undefined, duration },
  });
  res.json(updated);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) throw new AppError(404, "Event not found");
  if (event.createdBy !== req.user.userId && req.user.role !== "admin") {
    throw new AppError(403, "Not your event");
  }
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ message: "Event deleted" });
});

const setPricing = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { venue: { include: { seatCategories: true } } },
  });
  if (!event) throw new AppError(404, "Event not found");
  if (event.createdBy !== req.user.userId) throw new AppError(403, "Not your event");

  const { prices } = req.body;
  if (!Array.isArray(prices)) throw new AppError(400, "prices array is required");

  await prisma.eventPricing.deleteMany({ where: { eventId } });
  for (const p of prices) {
    if (!p.categoryId || p.price == null) continue;
    await prisma.eventPricing.create({
      data: { eventId, categoryId: p.categoryId, price: p.price },
    });
  }

  const updated = await prisma.eventPricing.findMany({
    where: { eventId },
    include: { category: true },
  });
  res.json(updated);
});

const getRevenue = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Event not found");
  if (event.createdBy !== req.user.userId) throw new AppError(403, "Not your event");

  const bookings = await prisma.booking.findMany({
    where: { eventId, status: "confirmed" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  res.json({ totalRevenue, bookingCount: bookings.length, bookings });
});

const getSeatMap = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { venue: { include: { seatCategories: true } } },
  });
  if (!event) throw new AppError(404, "Event not found");

  const showSeats = await prisma.showSeat.findMany({
    where: { eventId },
    include: { seat: { include: { category: true } } },
    orderBy: [{ seat: { rowLabel: "asc" } }, { seat: { colNumber: "asc" } }],
  });

  const rows = {};
  for (const ss of showSeats) {
    const row = ss.seat.rowLabel;
    if (!rows[row]) rows[row] = { rowLabel: row, seats: [] };
    rows[row].seats.push({
      id: ss.id,
      seatId: ss.seat.id,
      label: ss.seat.label,
      category: { id: ss.seat.category.id, name: ss.seat.category.name, color: ss.seat.category.color },
      status: ss.status,
      heldBy: ss.heldBy,
      heldUntil: ss.heldUntil,
    });
  }

  res.json({
    event: { id: event.id, title: event.title, type: event.type, date: event.date, duration: event.duration, posterUrl: event.posterUrl },
    venue: { id: event.venue.id, name: event.venue.name, rows: event.venue.rows, columns: event.venue.columns },
    categories: event.venue.seatCategories,
    seatGrid: Object.values(rows).sort((a, b) => a.rowLabel.localeCompare(b.rowLabel)),
  });
});

module.exports = {
  browseEvents, getMyEvents, getEvent, getSeatMap,
  browseEvents, getMyEvents, getEvent,
  createEvent, updateEvent, deleteEvent,
  setPricing, getRevenue,
};
