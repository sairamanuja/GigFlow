import mongoose from "mongoose";
import { Bid } from "../models/Bid.js";
import { Gig } from "../models/Gig.js";
import { emitToUser } from "../realtime/socket.js";

export const createBid = async (req, res, next) => {
  try {
    const { gigId, message, price } = req.body;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.ownerId.toString() === req.user.id) {
      return res.status(400).json({ message: "Owners cannot bid on their own gig" });
    }
    if (gig.status !== "open") return res.status(400).json({ message: "Gig is not open" });

    const bid = await Bid.create({ gigId, message, price, freelancerId: req.user.id });
    res.status(201).json({ bid });
  } catch (err) {
    next(err);
  }
};

export const listBidsForGig = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (gig.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }
    const bids = await Bid.find({ gigId })
      .sort({ createdAt: -1 })
      .populate({ path: "freelancerId", select: "name email" })
      .lean();

    const shaped = bids.map((bid) => ({
      _id: bid._id,
      price: bid.price,
      status: bid.status,
      message: bid.message,
      freelancerName: bid.freelancerId?.name || bid.freelancerId?.email || "Freelancer",
      freelancerEmail: bid.freelancerId?.email || null
    }));

    res.json({ bids: shaped });
  } catch (err) {
    next(err);
  }
};

export const listMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.id })
      .sort({ createdAt: -1 })
      .populate({ path: "gigId", select: "title status" })
      .lean();

    const shaped = bids.map((bid) => ({
      _id: bid._id,
      price: bid.price,
      status: bid.status,
      message: bid.message,
      gig: bid.gigId ? { id: bid.gigId._id, title: bid.gigId.title, status: bid.gigId.status } : null
    }));

    res.json({ bids: shaped });
  } catch (err) {
    next(err);
  }
};

export const hireBid = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const bid = await Bid.findById(req.params.bidId).session(session);
      if (!bid) throw Object.assign(new Error("Bid not found"), { status: 404 });

      const gig = await Gig.findById(bid.gigId).session(session);
      if (!gig) throw Object.assign(new Error("Gig not found"), { status: 404 });
      if (gig.ownerId.toString() !== req.user.id) {
        throw Object.assign(new Error("Not allowed"), { status: 403 });
      }
      if (gig.status !== "open") {
        throw Object.assign(new Error("Gig already assigned"), { status: 409 });
      }

      const updatedGig = await Gig.findOneAndUpdate(
        { _id: gig._id, status: "open" },
        { status: "assigned" },
        { new: true, session }
      );
      if (!updatedGig) {
        throw Object.assign(new Error("Gig already assigned"), { status: 409 });
      }

      const hired = await Bid.findOneAndUpdate(
        { _id: bid._id, status: "pending" },
        { status: "hired" },
        { new: true, session }
      );
      if (!hired) {
        throw Object.assign(new Error("Bid already processed"), { status: 409 });
      }

      await Bid.updateMany({ gigId: bid.gigId, _id: { $ne: bid._id } }, { status: "rejected" }, { session });

      res.locals.result = { gig: updatedGig, hiredBid: hired };
    }, { readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });

    res.json(res.locals.result);

    // Notify hired freelancer in real time (best-effort)
    const payload = { gigId: res.locals.result.gig._id.toString(), gigTitle: res.locals.result.gig.title };
    emitToUser(res.locals.result.hiredBid.freelancerId.toString(), "hire", payload);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ message: err.message || "Error hiring" });
  } finally {
    await session.endSession();
  }
};
