import React, { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const statusColor = {
  pending: "bg-slate-100 text-slate-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700"
};

const MyBids = () => {
  const { isLoggedIn } = useAuth();
  const { socket } = useSocket();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBids = useCallback(async (signal) => {
    if (!isLoggedIn) {
      setBids([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { bids: payload } = await apiFetch("/bids/mine", { signal });
      setBids(payload || []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load bids");
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const controller = new AbortController();
    fetchBids(controller.signal);
    return () => controller.abort();
  }, [fetchBids]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchBids();
    socket.on("hire", handler);
    return () => socket.off("hire", handler);
  }, [socket, fetchBids]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] p-8 space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">My Bids</h2>
          <p className="text-slate-600">Track your proposals and their status.</p>
        </div>

        {!isLoggedIn && <p className="text-slate-600 text-sm">Login to see your bids.</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {loading ? (
          <p className="text-slate-600 text-sm">Loading bids...</p>
        ) : (
          <div className="space-y-3">
            {bids.length === 0 && isLoggedIn && !error ? (
              <p className="text-slate-600 text-sm">No bids yet.</p>
            ) : (
              bids.map((bid) => (
                <div key={bid._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
                  <div>
                    <p className="text-slate-900 font-semibold">{bid.gig?.title || "Gig"}</p>
                    <p className="text-slate-600 text-sm">Your offer: {bid.price}</p>
                    {bid.message && <p className="text-slate-500 text-xs mt-1">{bid.message}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {bid.gig?.status && (
                      <span className="text-xs text-slate-500">Gig: {bid.gig.status}</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[bid.status] || "bg-slate-100 text-slate-700"}`}>
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
