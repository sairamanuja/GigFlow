import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

const statusColor = {
  open: "bg-emerald-100 text-emerald-700",
  assigned: "bg-amber-100 text-amber-700",
  closed: "bg-slate-200 text-slate-700"
};

const MyGigs = () => {
  const { isLoggedIn } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      setGigs([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchGigs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = query ? `?search=${encodeURIComponent(query)}` : "";
        const { gigs: payload } = await apiFetch(`/gigs/mine${params}`, { signal: controller.signal });
        setGigs(payload || []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Unable to load gigs");
        setGigs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
    return () => controller.abort();
  }, [isLoggedIn, query]);

  const onSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">My Gigs</h2>
            <p className="text-slate-600">Manage everything you have posted.</p>
          </div>
          <form onSubmit={onSearch} className="flex gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your gigs"
              className="w-full md:w-72 rounded-full border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none text-sm"
            />
            <button type="submit" className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
              Search
            </button>
          </form>
        </div>

        {!isLoggedIn && (
          <p className="text-slate-600 text-sm">Login to see gigs you have posted.</p>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {loading ? (
          <p className="text-slate-600 text-sm">Loading your gigs...</p>
        ) : (
          <div className="space-y-3">
            {gigs.length === 0 && isLoggedIn && !error ? (
              <p className="text-slate-600 text-sm">No gigs posted yet.</p>
            ) : (
              gigs.map((gig) => (
                <Link
                  key={gig._id}
                  to={`/gigs/${gig._id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] hover:border-indigo-200 transition-colors"
                >
                  <div>
                    <p className="text-slate-900 font-semibold">{gig.title}</p>
                    <p className="text-slate-600 text-sm">Budget: {gig.budget}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[gig.status] || "bg-slate-100 text-slate-700"}`}>
                    {gig.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
