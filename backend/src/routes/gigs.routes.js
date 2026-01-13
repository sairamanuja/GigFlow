import { Router } from "express";
import { z } from "zod";
import { listGigs, listMyGigs, createGig, getGig } from "../controllers/gigs.controller.js";
import { authRequired } from "../middleware/authRequired.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

const createGigSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    budget: z.string().min(1)
  })
});

router.get("/", listGigs);
router.get("/mine", authRequired, listMyGigs);
router.get("/:id", validateRequest(z.object({ params: z.object({ id: z.string().min(1) }) })), getGig);
router.post("/", authRequired, validateRequest(createGigSchema), createGig);

export default router;
