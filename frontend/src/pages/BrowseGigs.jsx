import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

const statusColor = {
  open: "bg-emerald-100 text-emerald-700",
  assigned: "bg-amber-100 text-amber-700"
};

const BrowseGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchGigs = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = query ? `?search=${encodeURIComponent(query)}` : "";
        const { gigs: payload } = await apiFetch(`/gigs${params}`, { signal: controller.signal });
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
  }, [query]);

  const onSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-6">
      <div className="bg-white/90 backdrop-blur rounded-3xl border border-slate-100 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Browse Gigs</h2>
            <p className="text-slate-600">Explore open work tailored for freelancers.</p>
          </div>
          <form className="md:w-80 flex gap-2" onSubmit={onSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none text-sm"
              placeholder="Search gigs by title"
            />
            <button type="submit" className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
              Go
            </button>
          </form>
        </div>

        {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}
        {loading ? (
          <p className="text-slate-600 text-sm">Loading gigs...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gigs.length === 0 && !error ? (
              <p className="text-slate-600 text-sm">No gigs found.</p>
            ) : (
              gigs.map((gig) => (
                <div key={gig._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)] flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{gig.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[gig.status] || "bg-slate-100 text-slate-700"}`}>
                      {gig.status}
                    </span>
                  </div>
                  <p className="text-slate-700 font-semibold">{gig.budget}</p>
                  <p className="text-slate-600 text-sm line-clamp-3">{gig.description}</p>
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="mt-auto inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
                  >
                    View Details
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseGigs;
