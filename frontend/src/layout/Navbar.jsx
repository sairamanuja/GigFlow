import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  return (
    <nav className="bg-[#F9FBFC] backdrop-blur border-none sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white text-lg font-semibold">G</span>
          <span>GigFlow</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center text-sm font-medium text-slate-600">
          <Link to="/browse-gigs" className="hover:text-indigo-600">Browse Gigs</Link>
          <Link to="/my-bids" className="hover:text-indigo-600">My Bids</Link>
          <Link to="/my-gigs" className="hover:text-indigo-600">My Gigs</Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/post-gig"
                className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
              >
                Post Gig
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:border-indigo-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 hover:border-indigo-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none text-slate-700"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-4 space-y-3">
          <Link to="/browse-gigs" className="block" onClick={() => setIsOpen(false)}>
            Browse Gigs
          </Link>
          <Link to="/my-bids" className="block" onClick={() => setIsOpen(false)}>
            My Bids
          </Link>
          <Link to="/my-gigs" className="block" onClick={() => setIsOpen(false)}>
            My Gigs
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/post-gig"
                className="block px-4 py-2 rounded-full bg-indigo-600 text-white"
                onClick={() => setIsOpen(false)}
              >
                Post Gig
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 rounded-full border border-slate-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block w-full text-left px-4 py-2 rounded-full border border-slate-200"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 rounded-full bg-indigo-600 text-white"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
