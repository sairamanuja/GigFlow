import { env } from "../config/env.js";

const userSockets = new Map(); // userId -> Set(socketId)
let ioInstance = null;

const addSocket = (userId, socketId) => {
  if (!userId) return;
  const uid = userId.toString();
  const existing = userSockets.get(uid) || new Set();
  existing.add(socketId);
  userSockets.set(uid, existing);
};

const removeSocket = (userId, socketId) => {
  if (!userId) return;
  const uid = userId.toString();
  const existing = userSockets.get(uid);
  if (!existing) return;
  existing.delete(socketId);
  if (existing.size === 0) {
    userSockets.delete(uid);
  } else {
    userSockets.set(uid, existing);
  }
};

export const initSocket = (io) => {
  ioInstance = io;
  io.on("connection", (socket) => {
    const userId = socket.handshake.query?.userId;
    if (userId) {
      addSocket(userId, socket.id);
      socket.join(userId.toString());
    }

    socket.on("disconnect", () => {
      if (userId) removeSocket(userId, socket.id);
    });
  });
};

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance || !userId) return false;
  const uid = userId.toString();
  const hasDirectSockets = userSockets.has(uid);
  if (hasDirectSockets) {
    ioInstance.to(uid).emit(event, payload);
    return true;
  }
  return false;
};

export const getSocketCorsConfig = () => ({
  origin: env.clientOrigin || "*",
  credentials: true
});
