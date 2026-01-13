import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { env } from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken({ id: user._id, email: user.email });
    res.cookie(env.cookieName, token, cookieOptions);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken({ id: user._id, email: user.email });
    res.cookie(env.cookieName, token, cookieOptions);
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production"
  });
  res.json({ message: "Logged out" });
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name email").lean();
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ user: { id: req.user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};
