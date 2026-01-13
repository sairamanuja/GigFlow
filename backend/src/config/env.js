import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/gigflow",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  cookieName: process.env.COOKIE_NAME || "gigflow_token",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development"
};
