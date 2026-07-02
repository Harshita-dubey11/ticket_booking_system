const { prisma } = require("../utils/prisma");
const { AppError } = require("../utils/errors");
const { asyncHandler } = require("../utils/asyncHandler");
const { emitSeatUpdate } = require("../services/socket");

const HOLD_TTL_MS = parseInt(process.env.SEAT_HOLD_TTL_MINUTES || "10", 10) * 60 * 1000;

const placeHold = asyncHandler(async (req, res) => {
  const { eventId, showSeatIds } = req.body;
  if (!eventId || !showSeatIds || !Array.isArray(showSeatIds) || showSeatIds.length === 0) {
    throw new AppError(400, "eventId and showSeatIds array are required");
  }

  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRawUnsafe(
      `SELECT id, status FROM show_seats WHERE id IN (${showSeatIds.map((_, i) => `$${i + 1}`).join(",")}) FOR UPDATE`,
      ...showSeatIds,
    );

    const unavailable = rows.filter((r) => r.status !== "available");
    if (unavailable.length > 0) {
      throw new AppError(409, `Seats no longer available: ${unavailable.map((r) => r.id).join(", ")}`);
    }

    const now = new Date();
    const heldUntil = new Date(now.getTime() + HOLD_TTL_MS);

    await tx.$executeRawUnsafe(
      `UPDATE show_seats SET status = 'held', held_by = $1, held_at = $2, held_until = $3 WHERE id IN (${showSeatIds.map((_, i) => `$${i + 4}`).join(",")})`,
      req.user.userId, now, heldUntil, ...showSeatIds,
    );

    return { heldUntil };
  });

  emitSeatUpdate(eventId, showSeatIds, "held", req.user.userId, result.heldUntil);
  res.json({ message: "Seats held", heldUntil: result.heldUntil });
});

const releaseHold = asyncHandler(async (req, res) => {
  const { eventId, showSeatIds } = req.body;
  if (!eventId || !showSeatIds || !Array.isArray(showSeatIds) || showSeatIds.length === 0) {
    throw new AppError(400, "eventId and showSeatIds array are required");
  }

  const result = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRawUnsafe(
      `SELECT id, held_by FROM show_seats WHERE id IN (${showSeatIds.map((_, i) => `$${i + 1}`).join(",")}) FOR UPDATE`,
      ...showSeatIds,
    );

    const notYours = rows.filter((r) => r.held_by !== req.user.userId);
    if (notYours.length > 0) {
      throw new AppError(403, "Not all seats are held by you");
    }

    await tx.$executeRawUnsafe(
      `UPDATE show_seats SET status = 'available', held_by = NULL, held_at = NULL, held_until = NULL WHERE id IN (${showSeatIds.map((_, i) => `$${i + 1}`).join(",")})`,
      ...showSeatIds,
    );

    return true;
  });

  emitSeatUpdate(eventId, showSeatIds, "available");
  res.json({ message: "Seats released" });
});

const getHolds = asyncHandler(async (req, res) => {
  const seats = await prisma.showSeat.findMany({
    where: { heldBy: req.user.userId, status: "held", heldUntil: { gte: new Date() } },
    include: { seat: { include: { category: true } } },
  });
  res.json(seats);
});

module.exports = { placeHold, releaseHold, getHolds };
