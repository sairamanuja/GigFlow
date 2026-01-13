import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/browse-gigs");
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="max-w-xl mx-auto bg-white/90 backdrop-blur border border-slate-100 rounded-3xl shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
        <p className="text-slate-600 mb-6">Sign in to continue hiring or bidding.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-600 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-300 focus:outline-none bg-white"
              placeholder="you@gigflow.dev"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-300 focus:outline-none bg-white"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-full bg-slate-900 text-white py-3 hover:bg-slate-800"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}

        <p className="text-sm text-slate-600 mt-6">
          New here? <Link to="/register" className="text-indigo-600 font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
