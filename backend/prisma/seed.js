const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const orgHash = await bcrypt.hash("org123", 10);
  const custHash = await bcrypt.hash("cust123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: { name: "Admin", email: "admin@test.com", passwordHash: adminHash, role: "admin" },
  });

  const organiser = await prisma.user.upsert({
    where: { email: "org@test.com" },
    update: {},
    create: { name: "Organiser", email: "org@test.com", passwordHash: orgHash, role: "organiser" },
  });

  await prisma.user.upsert({
    where: { email: "cust@test.com" },
    update: {},
    create: { name: "Customer", email: "cust@test.com", passwordHash: custHash, role: "customer" },
  });

  const venue = await prisma.venue.upsert({
    where: { id: "seed-venue-1" },
    update: {},
    create: {
      id: "seed-venue-1",
      name: "Grand Cinema Hall",
      address: "123 Main Street",
      rows: 10,
      columns: 12,
    },
  });

  const premium = await prisma.seatCategory.upsert({
    where: { id: "seed-cat-premium" },
    update: {},
    create: { id: "seed-cat-premium", venueId: venue.id, name: "Premium", color: "#FFD700", description: "First 3 rows" },
  });

  await prisma.seatCategory.upsert({
    where: { id: "seed-cat-standard" },
    update: {},
    create: { id: "seed-cat-standard", venueId: venue.id, name: "Standard", color: "#87CEEB", description: "Rows 4-10" },
  });

  const existingSeats = await prisma.seat.count({ where: { venueId: venue.id } });
  if (existingSeats === 0) {
    const seats = [];
    for (let r = 0; r < venue.rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let c = 1; c <= venue.columns; c++) {
        seats.push({
          venueId: venue.id,
          categoryId: r < 3 ? premium.id : "seed-cat-standard",
          rowLabel,
          colNumber: c,
          label: `${rowLabel}${c}`,
        });
      }
    }
    await prisma.seat.createMany({ data: seats });
    console.log(`${seats.length} seats seeded`);
  }

  console.log("Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
