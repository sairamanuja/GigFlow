import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const PostGig = () => {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Login to post a gig.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await apiFetch("/gigs", {
        method: "POST",
        body: { title, budget, description }
      });
      navigate("/my-gigs");
    } catch (err) {
      const issues = err.issues?.join("; ");
      setError(issues || err.message || "Unable to post gig");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-white/90 backdrop-blur border border-slate-100 rounded-3xl shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Post a Gig</h1>
        <p className="text-slate-600 mb-6">Share what you need and set a budget. Freelancers will start bidding.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-600 block mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none"
              placeholder="Build a landing page"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-1">Budget</label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none"
              placeholder="$800"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none"
              placeholder="What are the requirements?"
            />
          </div>
          <button type="submit" className="rounded-full bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-500">
            {isSubmitting ? "Publishing..." : "Publish Gig"}
          </button>
        </form>

        {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default PostGig;
