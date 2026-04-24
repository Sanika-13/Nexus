// components/ProtectedRoute.jsx
// Route guard that checks if a user is logged in (stored in localStorage).
// If not logged in → redirect to /login.
// If logged in → render the protected page normally.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../features/auth/authService';

/**
 * Wrap any route element with this to protect it:
 * <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
  const user = getStoredUser();

  if (!user) {
    // No user in localStorage → send to login page
    return <Navigate to="/login" replace />;
  }

  // User exists → render the protected content
  return children;
};

export default ProtectedRoute;
