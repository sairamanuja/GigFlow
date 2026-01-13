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
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="bg-white/95 backdrop-blur border border-slate-100 rounded-3xl shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Post a Gig</h1>
        <p className="text-slate-600 mb-6 text-sm sm:text-base">Share what you need and set a budget. Freelancers will start bidding.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-600 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none text-sm sm:text-base"
              placeholder="Build a landing page"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600 block">Budget</label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none text-sm sm:text-base"
              placeholder="$800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-indigo-300 focus:outline-none text-sm sm:text-base"
              placeholder="What are the requirements?"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto sm:min-w-[10rem] rounded-full bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-500 text-sm sm:text-base"
          >
            {isSubmitting ? "Publishing..." : "Publish Gig"}
          </button>
        </form>

        {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default PostGig;
