// features/auth/authService.js
// Authentication helpers: API calls + localStorage management.
// Used by LoginPage and ProtectedRoute.

import api from '../../services/api';

// Key used to store user data in localStorage
const USER_KEY = 'nexus_user';

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Login if user exists, or register if new.
 * @param {Object} credentials - { name, phone }
 * @returns {Promise<{ user, isNewUser, message }>}
 */
export const loginUser = async ({ name, phone }) => {
  const response = await api.post('/api/auth/login', { name, phone });
  return response.data;
};

// ─── localStorage Helpers ─────────────────────────────────────────────────────

/**
 * Save logged-in user to localStorage so they stay logged in on refresh.
 * @param {Object} user
 */
export const storeUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get the currently logged-in user from localStorage.
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Remove user from localStorage (logout).
 */
export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};
