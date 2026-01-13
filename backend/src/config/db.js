import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri, { autoIndex: true });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo connection error", err.message);
    process.exit(1);
  }
};
