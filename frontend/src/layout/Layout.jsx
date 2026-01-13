import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">
      <Navbar />
      
      <main className="flex-grow px-4 md:px-8 pb-16 pt-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
