// components/Navbar.jsx
// UPGRADED: True glassmorphism, smooth entry animation, active link indicator,
// user avatar pill, clean logout button with hover state.

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, LogOut, LayoutDashboard, Satellite, User, Zap } from 'lucide-react';
import { clearUser, getStoredUser } from '../features/auth/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  // Nav links config — easy to extend
  const navLinks = [
    { to: '/home', label: 'Dashboard', icon: LayoutDashboard, id: 'nav-dashboard-link' },
    { to: '/ndvi', label: 'NDVI Scan', icon: Satellite, id: 'nav-ndvi-link' },
    { to: '/agrolink', label: 'AgroLink AI', icon: Zap, id: 'nav-agrolink-link' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-white/5"
      style={{
        background: 'rgba(2, 13, 7, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">

        {/* ── Brand logo ──────────────────────────────────────────────────── */}
        <Link to="/home" className="flex items-center gap-2.5 shrink-0 group">
          <div className="bg-green-500/15 border border-green-500/25 p-2 rounded-xl group-hover:bg-green-500/25 transition-colors">
            <Leaf className="text-green-400" size={18} />
          </div>
          <span className="font-extrabold text-[17px] text-white tracking-tight hidden sm:block">
            PrecisionFarm <span className="text-green-400">Optimizer</span>
          </span>
        </Link>

        {/* ── Center nav links ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon, id }) => (
            <Link
              key={to}
              to={to}
              id={id}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive(to)
                  ? 'text-white bg-white/10'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
              {/* Active indicator dot */}
              {isActive(to) && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400"
                />
              )}
            </Link>
          ))}
        </div>

        {/* ── Right side: user + logout ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* User pill */}
          {user && (
            <div className="hidden md:flex items-center gap-2.5 bg-white/5 border border-white/10 pl-2.5 pr-4 py-1.5 rounded-full">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center shrink-0">
                <User size={13} className="text-white font-bold" />
              </div>
              <div>
                <p className="text-white text-xs font-bold leading-none">{user.name}</p>
                <p className="text-white/40 text-[10px] leading-none mt-0.5">{user.phone}</p>
              </div>
            </div>
          )}

          {/* Logout button */}
          <motion.button
            id="logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
