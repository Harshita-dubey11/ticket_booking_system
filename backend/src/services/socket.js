let io = null;

function initSocket(httpServer) {
  const { Server } = require("socket.io");
  io = new Server(httpServer, { cors: { origin: "*" } });
  return io;
}

function getIO() {
  return io;
}

function emitSeatUpdate(eventId, showSeatIds, status, heldBy = null, heldUntil = null) {
  if (!io) return;
  io.to(`event:${eventId}`).emit("seat:updated", { showSeatIds, status, heldBy, heldUntil });
}

module.exports = { initSocket, getIO, emitSeatUpdate };
