import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import gigRoutes from "./routes/gigs.routes.js";
import bidRoutes from "./routes/bids.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { getSocketCorsConfig, initSocket } from "./realtime/socket.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: getSocketCorsConfig() });
initSocket(io);

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  server.listen(env.port, () => {
    console.log(`API + Socket running on port ${env.port}`);
  });
};

start();
