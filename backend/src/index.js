const express = require("express");
const cors = require("cors");
const http = require("http");
const cron = require("node-cron");
const { config } = require("./config");
const { errorHandler } = require("./middleware/errorHandler");
const { prisma } = require("./utils/prisma");
const { initSocket, emitSeatUpdate } = require("./services/socket");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const eventRoutes = require("./routes/events");
const holdRoutes = require("./routes/holds");

const app = express();
const server = http.createServer(app);

const io = initSocket(server);

io.on("connection", (socket) => {
  socket.on("join:event", (eventId) => {
    socket.join(`event:${eventId}`);
  });
  socket.on("leave:event", (eventId) => {
    socket.leave(`event:${eventId}`);
  });
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/holds", holdRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

cron.schedule("* * * * *", async () => {
  const now = new Date();
  try {
    const expired = await prisma.showSeat.findMany({
      where: { status: "held", heldUntil: { lt: now } },
      select: { id: true, eventId: true },
    });

    if (expired.length === 0) return;

    await prisma.showSeat.updateMany({
      where: { id: { in: expired.map((s) => s.id) } },
      data: { status: "available", heldBy: null, heldAt: null, heldUntil: null },
    });

    const byEvent = {};
    for (const s of expired) {
      if (!byEvent[s.eventId]) byEvent[s.eventId] = [];
      byEvent[s.eventId].push(s.id);
    }

    for (const [eventId, ids] of Object.entries(byEvent)) {
      emitSeatUpdate(eventId, ids, "available");
    }

    console.log(`Released ${expired.length} expired holds`);
  } catch (err) {
    console.error("Cron release error:", err);
  }
});

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
