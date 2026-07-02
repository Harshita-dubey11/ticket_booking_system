const { prisma } = require("../utils/prisma");
const { AppError } = require("../utils/errors");
const { asyncHandler } = require("../utils/asyncHandler");

const joinWaitlist = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const { categoryId } = req.body;
  if (!categoryId) throw new AppError(400, "categoryId is required");

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Event not found");

  const existing = await prisma.waitlist.findFirst({
    where: { userId: req.user.userId, eventId, categoryId, status: { in: ["waiting", "offered"] } },
  });
  if (existing) throw new AppError(409, "You are already on the waitlist for this category");

  const entry = await prisma.waitlist.create({
    data: { userId: req.user.userId, eventId, categoryId },
  });

  res.status(201).json(entry);
});

const getMyWaitlist = asyncHandler(async (req, res) => {
  const entries = await prisma.waitlist.findMany({
    where: { userId: req.user.userId },
    include: {
      event: { select: { id: true, title: true, date: true, venue: { select: { name: true } } } },
      category: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(entries);
});

const leaveWaitlist = asyncHandler(async (req, res) => {
  const entry = await prisma.waitlist.findUnique({ where: { id: req.params.id } });
  if (!entry) throw new AppError(404, "Waitlist entry not found");
  if (entry.userId !== req.user.userId) throw new AppError(403, "Not your entry");

  await prisma.waitlist.update({
    where: { id: req.params.id },
    data: { status: "cancelled" },
  });

  res.json({ message: "Removed from waitlist" });
});

module.exports = { joinWaitlist, getMyWaitlist, leaveWaitlist };
