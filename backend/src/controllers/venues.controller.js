const { prisma } = require("../utils/prisma");
const { AppError } = require("../utils/errors");
const { asyncHandler } = require("../utils/asyncHandler");

const getVenues = asyncHandler(async (_req, res) => {
  const venues = await prisma.venue.findMany({
    include: { seatCategories: true, _count: { select: { seats: true } } },
  });
  res.json(venues);
});

const getVenue = asyncHandler(async (req, res) => {
  const venue = await prisma.venue.findUnique({
    where: { id: req.params.id },
    include: {
      seatCategories: true,
      seats: { include: { category: true }, orderBy: [{ rowLabel: "asc" }, { colNumber: "asc" }] },
    },
  });
  if (!venue) throw new AppError(404, "Venue not found");
  res.json(venue);
});

const createVenue = asyncHandler(async (req, res) => {
  const { name, address, rows, columns } = req.body;
  if (!name || !rows || !columns) throw new AppError(400, "name, rows, and columns are required");
  const venue = await prisma.venue.create({ data: { name, address, rows, columns } });
  res.status(201).json(venue);
});

const updateVenue = asyncHandler(async (req, res) => {
  const { name, address, rows, columns } = req.body;
  const venue = await prisma.venue.update({
    where: { id: req.params.id },
    data: { name, address, rows, columns },
  });
  res.json(venue);
});

const deleteVenue = asyncHandler(async (req, res) => {
  await prisma.venue.delete({ where: { id: req.params.id } });
  res.json({ message: "Venue deleted" });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, color, description } = req.body;
  if (!name || !color) throw new AppError(400, "name and color are required");
  const category = await prisma.seatCategory.create({
    data: { venueId: req.params.id, name, color, description },
  });
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, color, description } = req.body;
  const category = await prisma.seatCategory.update({
    where: { id: req.params.id },
    data: { name, color, description },
  });
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.seatCategory.delete({ where: { id: req.params.id } });
  res.json({ message: "Category deleted" });
});

const generateSeats = asyncHandler(async (req, res) => {
  const venueId = req.params.id;
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    include: { seatCategories: true },
  });
  if (!venue) throw new AppError(404, "Venue not found");
  if (venue.seatCategories.length === 0) throw new AppError(400, "Create at least one seat category first");

  const categories = venue.seatCategories;
  const catCount = categories.length;
  const existing = await prisma.seat.count({ where: { venueId } });
  if (existing > 0) throw new AppError(400, "Seats already generated for this venue");

  const seats = [];
  for (let r = 0; r < venue.rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    for (let c = 1; c <= venue.columns; c++) {
      const catIndex = Math.min(Math.floor((r * categories.length) / venue.rows), categories.length - 1);
      seats.push({
        venueId,
        categoryId: categories[catIndex].id,
        rowLabel,
        colNumber: c,
        label: `${rowLabel}${c}`,
      });
    }
  }
  await prisma.seat.createMany({ data: seats });
  res.status(201).json({ message: `${seats.length} seats generated` });
});

const updateSeatCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;
  const seat = await prisma.seat.update({
    where: { id: req.params.id },
    data: { categoryId },
    include: { category: true },
  });
  res.json(seat);
});

module.exports = {
  getVenues, getVenue, createVenue, updateVenue, deleteVenue,
  createCategory, updateCategory, deleteCategory,
  generateSeats, updateSeatCategory,
};
