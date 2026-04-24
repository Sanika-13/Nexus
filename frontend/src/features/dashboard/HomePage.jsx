// features/dashboard/HomePage.jsx — updated with AgroLink card
// UPGRADED: Stagger-animated cards, improved stat row, animated welcome text,
// consistent dark AgriTech theme, hover scale on action cards, spacing polish.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Satellite, BarChart2, Cloud, MapPin,
  ArrowRight, Leaf, TrendingUp, Droplets, Zap,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getStoredUser } from '../auth/authService';

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  {
    icon: Leaf,
    label: 'Crop Health',
    value: 'Good',
    sub: 'Avg NDVI: 0.74',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    glow: 'shadow-green-500/10',
  },
  {
    icon: Droplets,
    label: 'Soil Moisture',
    value: '63%',
    sub: 'Optimal range',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    glow: 'shadow-sky-500/10',
  },
  {
    icon: TrendingUp,
    label: 'Yield Forecast',
    value: '+12%',
    sub: 'vs last season',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    glow: 'shadow-yellow-500/10',
  },
  {
    icon: MapPin,
    label: 'Fields Active',
    value: '1',
    sub: 'Monitored zones',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    glow: 'shadow-purple-500/10',
  },
];

const ACTIONS = [
  {
    id: 'card-ndvi',
    icon: Satellite,
    title: 'Analyze Farm (NDVI)',
    description: 'Use satellite imagery to scan your field and get a complete health report in minutes.',
    cta: 'Start Scan',
    route: '/ndvi',
    gradient: 'from-green-600 to-emerald-500',
    border: 'border-green-500/20 hover:border-green-500/40',
    iconBg: 'bg-green-500/15 border-green-500/25',
    iconColor: 'text-green-400',
    badgeText: '🛰️ Live',
    badgeColor: 'bg-green-500/15 text-green-400 border-green-500/20',
    glowColor: 'shadow-green-500/10',
    available: true,
  },
  {
    id: 'card-agrolink',
    icon: Zap,
    title: 'AgroLink IoT Network',
    description: 'Self-organizing smart farm network with AntiGravity AI clustering, 2D/3D visualization, and irrigation insights.',
    cta: 'Open AgroLink',
    route: '/agrolink',
    gradient: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    iconColor: 'text-violet-400',
    badgeText: '🌀 AntiGravity AI',
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    glowColor: 'shadow-violet-500/10',
    available: true,
  },
  {
    id: 'card-reports',
    icon: BarChart2,
    title: 'View Reports',
    description: 'Access historical NDVI trends, crop health data, and detailed field comparisons.',
    cta: 'View Reports',
    route: null,
    gradient: 'from-sky-500 to-blue-600',
    border: 'border-sky-500/15 hover:border-sky-500/30',
    iconBg: 'bg-sky-500/15 border-sky-500/25',
    iconColor: 'text-sky-400',
    badgeText: '📊 Coming Soon',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/15',
    glowColor: 'shadow-sky-500/10',
    available: false,
  },
  {
    id: 'card-weather',
    icon: Cloud,
    title: 'Weather Forecast',
    description: 'Hyperlocal 7-day weather predictions tailored to your farm\'s exact location.',
    cta: 'Check Weather',
    route: null,
    gradient: 'from-yellow-400 to-amber-500',
    border: 'border-yellow-500/15 hover:border-yellow-500/30',
    iconBg: 'bg-yellow-500/15 border-yellow-500/25',
    iconColor: 'text-yellow-400',
    badgeText: '🌤️ Coming Soon',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15',
    glowColor: 'shadow-yellow-500/10',
    available: false,
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const firstName = user?.name?.split(' ')[0] || 'Farmer';

  return (
    <div className="min-h-screen bg-[#020d07] text-white font-sans">

      {/* Subtle ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-10 space-y-10">

        {/* ── Welcome Header ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          {/* Breadcrumb chip */}
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <p className="text-green-400 text-xs font-bold uppercase tracking-[0.18em]">Dashboard</p>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
            Welcome back,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
              {firstName}!
            </span>{' '}
            🌱
          </h1>
          <p className="text-white/45 text-lg">Here's what's happening on your farm today.</p>
        </motion.div>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {STATS.map(({ icon: Icon, label, value, sub, color, bg, glow }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className={`relative border ${bg} rounded-2xl p-5 cursor-default shadow-lg ${glow} transition-shadow`}
              style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
            >
              <Icon size={18} className={`${color} mb-3`} />
              <p className={`text-2xl font-extrabold ${color} mb-0.5`}>{value}</p>
              <p className="text-white/80 text-sm font-semibold">{label}</p>
              <p className="text-white/35 text-xs mt-1">{sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Quick Actions ────────────────────────────────────────────────── */}
        <div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg font-bold text-white/70 mb-5"
          >
            Quick Actions
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {ACTIONS.map(({ id, icon: Icon, title, description, cta, route, gradient, border, iconBg, iconColor, badgeText, badgeColor, glowColor, available }) => (
              <motion.div
                key={id}
                id={id}
                variants={fadeUp}
                transition={{ duration: 0.55 }}
                whileHover={available ? { y: -6, scale: 1.02, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' } : undefined}
                onClick={() => available && route && navigate(route)}
                className={`group relative bg-white/[0.04] border ${border} rounded-3xl p-7 transition-all duration-300 shadow-lg ${glowColor}
                  ${available ? 'cursor-pointer' : 'cursor-default opacity-70'}
                `}
                style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
              >
                {/* Hover gradient accent top edge */}
                <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-60 transition-opacity duration-300 rounded-full`} />

                {/* Badge */}
                <span className={`absolute top-5 right-5 text-[11px] font-bold border px-2.5 py-1 rounded-full ${badgeColor}`}>
                  {badgeText}
                </span>

                {/* Icon */}
                <div className={`w-13 h-13 rounded-2xl border ${iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  style={{ width: '3.25rem', height: '3.25rem' }}
                >
                  <Icon className={iconColor} size={24} />
                </div>

                <h3 className="text-white text-lg font-bold mb-2 leading-snug">{title}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5">{description}</p>

                {/* CTA arrow (only shown for available routes) */}
                {available && (
                  <div className="flex items-center gap-2 text-green-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    {cta} <ArrowRight size={15} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Insight / Tip Banner ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-500/15 rounded-3xl p-8 overflow-hidden"
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          {/* Decorative glow circle */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-yellow-400" />
                <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Today's Insight</p>
              </div>
              <p className="text-white text-base leading-relaxed">
                🌱 <strong className="text-green-300">NDVI values above 0.6</strong> indicate healthy, dense vegetation.
                Values between 0.2–0.5 suggest moderate stress — check soil moisture and nutrient levels.
              </p>
            </div>
            <motion.button
              id="tip-scan-btn"
              onClick={() => navigate('/ndvi')}
              whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(22,163,74,0.4)' }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap shadow-lg shadow-green-900/40 shrink-0"
            >
              <Satellite size={15} />
              Scan My Farm
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
