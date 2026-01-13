import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

const statusColor = {
  open: "bg-emerald-100 text-emerald-700",
  assigned: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700"
};

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [gig, setGig] = useState(null);
  const [gigError, setGigError] = useState(null);
  const [loadingGig, setLoadingGig] = useState(false);

  const [bids, setBids] = useState([]);
  const [bidsError, setBidsError] = useState(null);
  const [loadingBids, setLoadingBids] = useState(false);

  const [note, setNote] = useState("");
  const [price, setPrice] = useState("");
  const [bidError, setBidError] = useState(null);
  const [placingBid, setPlacingBid] = useState(false);

  const isOwner = useMemo(() => gig && user?.id === gig.ownerId, [gig, user]);

  useEffect(() => {
    const controller = new AbortController();
    const loadGig = async () => {
      setLoadingGig(true);
      setGigError(null);
      try {
        const { gig: payload } = await apiFetch(`/gigs/${id}`, { signal: controller.signal });
        setGig(payload);
      } catch (err) {
        if (err.name === "AbortError") return;
        setGigError(err.message || "Unable to load gig");
      } finally {
        setLoadingGig(false);
      }
    };
    loadGig();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!isOwner || !gig) {
      setBids([]);
      return;
    }

    const controller = new AbortController();
    const loadBids = async () => {
      setLoadingBids(true);
      setBidsError(null);
      try {
        const { bids: payload } = await apiFetch(`/bids/${gig._id}`, { signal: controller.signal });
        setBids(payload || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setBidsError(err.message || "Unable to load bids");
        setBids([]);
      } finally {
        setLoadingBids(false);
      }
    };
    loadBids();
    return () => controller.abort();
  }, [gig, isOwner]);

  const placeBid = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setBidError("Login to place a bid.");
      return;
    }
    setBidError(null);
    setPlacingBid(true);
    try {
      await apiFetch("/bids", {
        method: "POST",
        body: { gigId: id, message: note, price }
      });
      setNote("");
      setPrice("");
      navigate("/my-bids");
    } catch (err) {
      const issues = err.issues?.join("; ");
      setBidError(issues || err.message || "Unable to place bid");
    } finally {
      setPlacingBid(false);
    }
  };

  const hireBid = async (bidId) => {
    try {
      await apiFetch(`/bids/${bidId}/hire`, { method: "PATCH" });
      // refresh bids
      setBids((prev) =>
        prev.map((b) =>
          b._id === bidId
            ? { ...b, status: "hired" }
            : { ...b, status: b.status === "pending" ? "rejected" : b.status }
        )
      );
    } catch (err) {
      setBidsError(err.message || "Unable to hire");
    }
  };

  if (loadingGig) {
    return <div className="max-w-6xl mx-auto px-4 py-16">Loading gig...</div>;
  }

  if (gigError || !gig) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-rose-600">{gigError || "Gig not found"}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-8">
      <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-3xl shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Gig</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-2">{gig.title}</h1>
            <p className="text-slate-600 mt-2 max-w-3xl">{gig.description}</p>
            {gig.owner?.name && (
              <p className="text-slate-500 text-sm mt-1">Posted by {gig.owner.name}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[gig.status] || "bg-slate-100 text-slate-700"}`}>
              {gig.status === "open" ? "Open" : "Assigned"}
            </span>
            <span className="text-slate-900 text-lg font-semibold">Budget: {gig.budget}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-2xl shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Bids</h3>

            {!isOwner && <p className="text-slate-600 text-sm">Only the gig owner can view bids.</p>}
            {isOwner && bidsError && <p className="text-sm text-rose-600 mb-3">{bidsError}</p>}
            {isOwner && loadingBids && <p className="text-sm text-slate-600">Loading bids...</p>}

            {isOwner && !loadingBids && (
              <div className="space-y-3">
                {bids.length === 0 ? (
                  <p className="text-slate-600 text-sm">No bids yet.</p>
                ) : (
                  bids.map((bid) => (
                    <div key={bid._id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-2xl px-4 py-3 bg-white">
                      <div>
                        <p className="text-slate-900 font-semibold">{bid.freelancerName || "Freelancer"}</p>
                        <p className="text-slate-600 text-sm">{bid.message}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-semibold">{bid.price}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[bid.status] || "bg-slate-100 text-slate-700"}`}>
                          {bid.status}
                        </span>
                        {bid.status === "pending" && (
                          <button
                            className="px-3 py-2 rounded-full bg-indigo-600 text-white text-sm hover:bg-indigo-500"
                            onClick={() => hireBid(bid._id)}
                          >
                            Hire
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!isOwner && (
            <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-2xl shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Place a Bid</h3>
              <form className="space-y-3" onSubmit={placeBid}>
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Your message</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                    rows="3"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none"
                    placeholder="Share your approach and timeline"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Your price</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none"
                    placeholder="$1,000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={placingBid}
                  className="w-full rounded-full bg-slate-900 text-white py-3 hover:bg-slate-800 text-sm font-semibold"
                >
                  {placingBid ? "Submitting..." : "Submit Bid"}
                </button>
              </form>
              {bidError && <p className="text-sm text-rose-600 mt-3">{bidError}</p>}
            </div>
          )}

          <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-2xl shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] p-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">Quick facts</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>Deliverables: Landing page + handoff</li>
              <li>Timeline: 2 weeks</li>
              <li>Stack: React + Tailwind</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
