import { env } from "../config/env.js";
import { verifyToken } from "../utils/jwt.js";

export const authRequired = (req, res, next) => {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
