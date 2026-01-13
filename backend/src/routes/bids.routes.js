import { Router } from "express";
import { z } from "zod";
import { createBid, listBidsForGig, listMyBids, hireBid } from "../controllers/bids.controller.js";
import { authRequired } from "../middleware/authRequired.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

const createBidSchema = z.object({
  body: z.object({
    gigId: z.string().min(1),
    message: z.string().min(5),
    price: z.string().min(1)
  })
});

router.post("/", authRequired, validateRequest(createBidSchema), createBid);
router.get("/mine", authRequired, listMyBids);
router.get("/:gigId", authRequired, validateRequest(z.object({ params: z.object({ gigId: z.string().min(1) }) })), listBidsForGig);
router.patch("/:bidId/hire", authRequired, validateRequest(z.object({ params: z.object({ bidId: z.string().min(1) }) })), hireBid);

export default router;
