import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';

import Layout from './layout/Layout';
import Home from './pages/Home';
import BrowseGigs from './pages/BrowseGigs';
import MyBids from './pages/MyBids';
import MyGigs from './pages/MyGigs';
import Login from './pages/Login';
import Register from './pages/Register';
import PostGig from './pages/PostGig';
import GigDetail from './pages/GigDetail';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="browse-gigs" element={<BrowseGigs />} />
                <Route path="my-bids" element={<MyBids />} />
                <Route path="my-gigs" element={<MyGigs />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="post-gig" element={<PostGig />} />
                <Route path="gigs/:id" element={<GigDetail />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
