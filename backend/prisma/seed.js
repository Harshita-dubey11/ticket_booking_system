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
    create: { id: "seed-venue-1", name: "Grand Cinema Hall", address: "123 Main Street", rows: 10, columns: 12 },
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

  const existingEvents = await prisma.event.count({ where: { venueId: venue.id } });
  if (existingEvents === 0) {
    await prisma.event.createMany({
      data: [
        {
          title: "Inception",
          type: "movie",
          venueId: venue.id,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          duration: 148,
          createdBy: organiser.id,
          posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
        },
        {
          title: "Interstellar",
          type: "movie",
          venueId: venue.id,
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          duration: 169,
          createdBy: organiser.id,
          posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        },
        {
          title: "Coldplay: Music of the Spheres",
          type: "concert",
          venueId: venue.id,
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          duration: 120,
          createdBy: organiser.id,
          posterUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500",
        },
      ],
    });

    const events = await prisma.event.findMany({ where: { venueId: venue.id } });
    for (const event of events) {
      const seats = await prisma.seat.findMany({ where: { venueId: venue.id } });
      await prisma.showSeat.createMany({
        data: seats.map((s) => ({ eventId: event.id, seatId: s.id })),
      });
    }
    console.log(`${events.length} events seeded with show seats`);
  }

  console.log("Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
