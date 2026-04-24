// services/api.js
// Centralized Axios instance for all API calls.
// All frontend services import from here — one place to change the base URL.

import axios from 'axios';

// Base URL points to our Express backend.
// In production, replace with your deployed API URL.
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Runs before every request — good place to add auth tokens later
api.interceptors.request.use(
  (config) => {
    // Could add JWT token here in future: config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Runs after every response — handles auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If server returns 401 Unauthorized, clear user and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('nexus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
