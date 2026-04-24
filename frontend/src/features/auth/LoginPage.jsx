// features/auth/LoginPage.jsx
// UPGRADED: Animated background particles, Framer Motion entry animation,
// consistent AgriTech color theme, polished form inputs with focus glow,
// micro-animation on submit button.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Phone, User, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser, storeUser } from './authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter both your name and phone number.');
      return;
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ name: form.name.trim(), phone: form.phone.trim() });
      storeUser(data.user);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020d07] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* ── Ambient background glows ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sky-500/8 rounded-full translate-x-1/2 translate-y-1/2 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-yellow-400/4 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[80px]" />
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-500/15 border border-green-500/25 rounded-2xl mb-5 shadow-xl shadow-green-900/20"
          >
            <Leaf className="text-green-400" size={30} />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Precision Farming</h1>
          <p className="text-green-400 font-semibold mt-1">Optimizer</p>
        </div>

        {/* Form card */}
        <div
          className="border border-white/8 rounded-3xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Card header */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-green-400 text-xs font-bold uppercase tracking-[0.18em]">Farmer Access</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome! 👋</h2>
            <p className="text-white/45 text-sm mt-1">
              New here? We'll create your account automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white/60 mb-2">
                Your Name
              </label>
              <div className="relative group">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/70 group-focus-within:text-green-400 transition-colors"
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 focus:border-green-500/50 focus:bg-white/8 rounded-2xl text-white placeholder-white/25 font-medium outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Phone field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-white/60 mb-2">
                Phone Number
              </label>
              <div className="relative group">
                <Phone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/70 group-focus-within:text-green-400 transition-colors"
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={15}
                  autoComplete="tel"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 focus:border-green-500/50 focus:bg-white/8 rounded-2xl text-white placeholder-white/25 font-medium outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3"
              >
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 28px rgba(22,163,74,0.45)' } : undefined}
              whileTap={!loading ? { scale: 0.97 } : undefined}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-emerald-400 disabled:from-green-900 disabled:to-green-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-green-900/40 disabled:cursor-not-allowed text-[15px]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Getting you in...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-white/25 text-xs mt-6">
            🌾 No password needed — just your name and phone.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
