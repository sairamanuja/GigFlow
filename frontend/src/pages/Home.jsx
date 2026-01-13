import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-indigo-50 to-white border border-indigo-50 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] px-6 md:px-12 py-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute right-0 -bottom-16 h-56 w-56 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute inset-6 rounded-[28px] border border-white/70" />
        </div>

        <div className="relative text-center max-w-3xl mx-auto">
          <div className="flex justify-center -space-x-3 mb-4">
            {["https://i.pravatar.cc/60?img=1","https://i.pravatar.cc/60?img=2","https://i.pravatar.cc/60?img=3"].map((src, idx) => (
              <img key={idx} src={src} alt="avatar" className="h-10 w-10 rounded-full border-2 border-white shadow" />
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">
            Your Marketplace for
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 leading-tight">
            Creative <span className="text-indigo-600">&</span> Digital Services
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Scale your professional workforce with freelancers.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/browse-gigs"
              className="px-6 py-3 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800"
            >
              Join Now
            </Link>
            <Link
              to="/post-gig"
              className="px-6 py-3 rounded-full bg-white text-slate-900 border border-slate-200 hover:border-indigo-200"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar Card */}
      <section className="bg-white/90 backdrop-blur rounded-2xl shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)] border border-slate-100 p-6">
        <div className="flex items-center gap-3 text-slate-700 mb-4">
          <span className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">S</span>
          <div>
            <p className="font-semibold">Search Talent</p>
            <p className="text-sm text-slate-500">Tailored talent matches to help you hire the right person faster.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-full px-4 py-3 bg-white">
            <span className="text-slate-500">Categories</span>
            <span className="ml-auto text-slate-400">▾</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-full px-4 py-3 bg-white">
            <span className="text-slate-500">Country</span>
            <span className="ml-auto text-slate-400">▾</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-full px-4 py-3 bg-white">
            <span className="text-slate-500">Your Budget</span>
            <span className="ml-auto text-slate-400">▾</span>
          </div>
          <button className="w-full md:w-auto justify-self-end px-6 py-3 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 text-sm">
            Search Talent
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[{
          title: "Post Gigs",
          text: "Create job listings with budget and requirements in seconds."
        },{
          title: "Bid on Work",
          text: "Freelancers can bid with a message and price that fits the job."
        },{
          title: "Hire Securely",
          text: "Hire one freelancer with atomic logic — others are auto-rejected."
        }].map((item, idx) => (
          <div key={idx} className="bg-white/90 backdrop-blur border border-slate-100 rounded-2xl p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold mb-4">
              {idx + 1}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900">{item.title}</h3>
            <p className="text-slate-600 text-sm">{item.text}</p>
          </div>
        ))}
      </section>

      {/* Trusted Row */}
      <section className="text-center text-slate-500 text-sm">
        <p>Trusted by fast-moving teams</p>
        <div className="mt-3 flex flex-wrap justify-center gap-6 text-slate-400">
          {['Signal', 'Orbit', 'Launchy', 'Stackly'].map((name) => (
            <span key={name} className="px-3 py-1 rounded-full border border-slate-100 bg-white/60 backdrop-blur text-xs font-semibold">{name}</span>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
