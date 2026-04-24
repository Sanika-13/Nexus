// routes/AppRoutes.jsx
// All client-side routes. Protected routes redirect to /login if not authenticated.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from '../pages/LandingPage';

// Feature components
import LoginPage from '../features/auth/LoginPage';
import HomePage from '../features/dashboard/HomePage';
import NDVIPage from '../features/ndvi/NDVIPage';
import AgroLinkPage from '../features/agrolink/AgroLinkPage';

// Route guard
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/ndvi" element={<ProtectedRoute><NDVIPage /></ProtectedRoute>} />

      {/* AgroLink AntiGravity AI — new feature */}
      <Route path="/agrolink" element={<ProtectedRoute><AgroLinkPage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
