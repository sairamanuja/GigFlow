import { Router } from "express";
import { z } from "zod";
import { register, login, logout, me } from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { authRequired } from "../middleware/authRequired.js";

const router = Router();

const authSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email(),
    password: z.string().min(6)
  })
});

router.post("/register", validateRequest(authSchema), register);
router.post("/login", validateRequest(authSchema), login);
router.post("/logout", authRequired, logout);
router.get("/me", authRequired, me);

export default router;
