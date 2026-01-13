import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  const closeMenu = () => setIsOpen(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#F9FBFC]/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 text-xl font-bold text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              G
            </span>
            GigFlow
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/browse-gigs" className="hover:text-indigo-600">Browse Gigs</Link>
            <Link to="/my-bids" className="hover:text-indigo-600">My Bids</Link>
            <Link to="/my-gigs" className="hover:text-indigo-600">My Gigs</Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/post-gig"
                  className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Post Gig
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:border-indigo-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full border border-slate-200 hover:border-indigo-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden text-2xl text-slate-800"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeMenu}
          />

          {/* Mobile Drawer */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white rounded-b-3xl shadow-xl">
            <div className="flex justify-between items-center px-4 py-4 border-b">
              <span className="flex items-center gap-2 font-bold">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                  G
                </span>
                GigFlow
              </span>
              <button
                onClick={closeMenu}
                className="text-2xl"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-5 space-y-4 text-sm">
              <Link to="/browse-gigs" onClick={closeMenu} className="block">
                Browse Gigs
              </Link>
              <Link to="/my-bids" onClick={closeMenu} className="block">
                My Bids
              </Link>
              <Link to="/my-gigs" onClick={closeMenu} className="block">
                My Gigs
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    to="/post-gig"
                    onClick={closeMenu}
                    className="block text-center px-4 py-2 rounded-full bg-indigo-600 text-white"
                  >
                    Post Gig
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="block w-full px-4 py-2 rounded-full border"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block px-4 py-2 rounded-full border"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block text-center px-4 py-2 rounded-full bg-indigo-600 text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
