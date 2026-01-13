import { Gig } from "../models/Gig.js";
import { User } from "../models/User.js";

export const listGigs = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { status: "open" };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    const gigs = await Gig.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ gigs });
  } catch (err) {
    next(err);
  }
};

export const listMyGigs = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { ownerId: req.user.id };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    const gigs = await Gig.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ gigs });
  } catch (err) {
    next(err);
  }
};

export const createGig = async (req, res, next) => {
  try {
    const { title, description, budget } = req.body;
    const gig = await Gig.create({ title, description, budget, ownerId: req.user.id });
    res.status(201).json({ gig });
  } catch (err) {
    next(err);
  }
};

export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id).lean();
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    const owner = await User.findById(gig.ownerId).select("name email").lean();
    const shaped = {
      ...gig,
      owner: owner ? { name: owner.name, email: owner.email, id: owner._id } : null
    };

    res.json({ gig: shaped });
  } catch (err) {
    next(err);
  }
};
