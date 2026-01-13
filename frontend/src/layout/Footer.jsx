import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-700 py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold mb-3 text-slate-900">GigFlow</h3>
          <p className="text-sm text-slate-500">Your freelance marketplace</p>
        </div>
        
        <div>
          <h3 className="font-bold mb-3 text-slate-900">Quick Links</h3>
          <ul className="text-sm text-slate-500 space-y-2">
            <li><a href="#" className="hover:text-indigo-600">About Us</a></li>
            <li><a href="#" className="hover:text-indigo-600">Contact</a></li>
            <li><a href="#" className="hover:text-indigo-600">Help</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-bold mb-3 text-slate-900">Legal</h3>
          <ul className="text-sm text-slate-500 space-y-2">
            <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
        © 2024 GigFlow. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
