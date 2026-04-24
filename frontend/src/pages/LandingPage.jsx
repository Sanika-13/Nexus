// pages/LandingPage.jsx
// UPGRADED: Framer Motion animations, animated gradient background,
// glassmorphism cards, improved typography, consistent AgriTech color theme.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Leaf, Satellite, CloudRain, Target, Globe, ArrowRight, Sprout, ChevronDown } from 'lucide-react';

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ─── Multi-language Translations (preserved from original) ─────────────────────
const translations = {
  en: {
    title: 'Precision Farming',
    highlight: 'Optimizer',
    subtext: 'AI-powered crop monitoring using satellite imagery & real-time NDVI analysis. Know your farm like never before.',
    btnStart: 'Get Started — It\'s Free',
    btnLearn: 'See How It Works',
    featureTitle: 'Advanced Precision Technology',
    feat1Title: 'Satellite Vision',
    feat1Desc: 'Monitor plant health using NDVI from high-resolution satellite imagery.',
    feat2Title: 'Weather Sync',
    feat2Desc: 'Live updates and rain forecasts directly to your dashboard.',
    feat3Title: 'Smart Targeting',
    feat3Desc: 'Identify exact spots that need water or nutrients instantly.',
    badge: 'Powered by Satellite & AI',
  },
  hi: {
    title: 'प्रिसिजन फार्मिंग',
    highlight: 'ऑप्टिमाइज़र',
    subtext: 'सैटेलाइट इमेजरी और रीयल-टाइम NDVI विश्लेषण से AI-संचालित फसल निगरानी।',
    btnStart: 'शुरू करें — मुफ़्त',
    btnLearn: 'और जानें',
    featureTitle: 'उन्नत सटीक तकनीक',
    feat1Title: 'सैटेलाइट विज़न',
    feat1Desc: 'NDVI का उपयोग करके पौधों के स्वास्थ्य की निगरानी करें।',
    feat2Title: 'वेदर सिंक',
    feat2Desc: 'लाइव अपडेट और बारिश का पूर्वानुमान।',
    feat3Title: 'स्मार्ट टार्गेटिंग',
    feat3Desc: 'उन जगहों की पहचान करें जिन्हें पानी या पोषक तत्व चाहिए।',
    badge: 'सैटेलाइट और AI द्वारा संचालित',
  },
  mr: {
    title: 'प्रिसिजन फार्मिंग',
    highlight: 'ऑप्टिमायझर',
    subtext: 'सॅटेलाइट इमेजरी आणि रिअल-टाइम NDVI विश्लेषणाद्वारे AI-चालित पीक देखरेख.',
    btnStart: 'सुरू करा — मोफत',
    btnLearn: 'अधिक जाणा',
    featureTitle: 'प्रगत अचूक तंत्रज्ञान',
    feat1Title: 'सॅटेलाइट व्हिजन',
    feat1Desc: 'NDVI वापरून पिकांच्या आरोग्यावर लक्ष ठेवा.',
    feat2Title: 'हवामान अपडेट',
    feat2Desc: 'थेट हवामान अपडेट आणि पावसाचा अंदाज.',
    feat3Title: 'स्मार्ट टार्गेटिंग',
    feat3Desc: 'पाणी किंवा खतांची गरज असलेल्या जागा ओळखा.',
    badge: 'सॅटेलाइट आणि AI द्वारे समर्थित',
  },
};

// ─── Feature card data ──────────────────────────────────────────────────────────
const getFeatures = (t) => [
  {
    icon: Satellite,
    title: t.feat1Title,
    desc: t.feat1Desc,
    gradient: 'from-green-500 to-emerald-600',
    glow: 'shadow-emerald-500/30',
    iconBg: 'bg-emerald-500/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    icon: CloudRain,
    title: t.feat2Title,
    desc: t.feat2Desc,
    gradient: 'from-sky-500 to-blue-600',
    glow: 'shadow-sky-500/30',
    iconBg: 'bg-sky-500/20 border-sky-500/30',
    iconColor: 'text-sky-400',
  },
  {
    icon: Target,
    title: t.feat3Title,
    desc: t.feat3Desc,
    gradient: 'from-yellow-400 to-amber-500',
    glow: 'shadow-amber-500/30',
    iconBg: 'bg-yellow-500/20 border-yellow-500/30',
    iconColor: 'text-yellow-400',
  },
];

// ─── Stats data ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: '10K+', label: 'Farmers' },
  { value: '98%', label: 'Accuracy' },
  { value: '30+', label: 'Crops Supported' },
];

const LandingPage = () => {
  const [lang, setLang] = useState('en');
  const navigate = useNavigate();
  const t = translations[lang];
  const features = getFeatures(t);
  const shouldReduceMotion = useReducedMotion();

  // Disable animations if user prefers reduced motion
  const animProps = shouldReduceMotion
    ? {}
    : { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 } };

  return (
    <div className="min-h-screen bg-[#020d07] text-white overflow-x-hidden font-sans">

      {/* ── Animated blob background ──────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Primary green glow */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-green-600/10 blur-[120px] animate-pulse" />
        {/* Blue accent glow */}
        <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] rounded-full bg-sky-500/8 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Yellow accent glow — bottom */}
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-yellow-400/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(2, 13, 7, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-green-500/15 border border-green-500/30 p-2 rounded-xl">
              <Leaf className="text-green-400" size={20} />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-white">
              PrecisionFarm <span className="text-green-400">Optimizer</span>
            </span>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 rounded-full text-sm">
              <Globe size={14} className="text-green-400 shrink-0" />
              <select
                id="lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-green-200 font-semibold outline-none cursor-pointer text-xs"
              >
                <option value="en" className="bg-[#020d07]">English</option>
                <option value="hi" className="bg-[#020d07]">हिंदी</option>
                <option value="mr" className="bg-[#020d07]">मराठी</option>
              </select>
            </div>

            {/* CTA button */}
            <motion.button
              id="nav-get-started-btn"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-green-900/40"
            >
              {t.btnStart.split('—')[0].trim()}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left: text + CTAs */}
          <motion.div
            variants={staggerContainer}
            {...animProps}
            initial="hidden"
            animate="visible"
          >
            {/* Live badge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/25 text-green-400 font-semibold text-xs px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/60 animate-pulse" />
                {t.badge}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6"
            >
              {t.title}{' '}
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-300 to-sky-400"
              >
                {t.highlight}
              </span>
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-white/60 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl"
            >
              {t.subtext}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <motion.button
                id="hero-get-started-btn"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(22,163,74,0.5)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-green-900/40 transition-all"
              >
                {t.btnStart}
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                id="hero-learn-more-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all"
              >
                {t.btnLearn}
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex gap-8 pt-8 border-t border-white/8"
            >
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-green-400">{value}</p>
                  <p className="text-white/50 text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: hero card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-green-500/20 to-sky-500/10 blur-2xl scale-105" />

            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000"
                alt="Lush agricultural field — satellite view"
                className="w-full h-[420px] object-cover"
                style={{ filter: 'brightness(0.85) saturate(1.1)' }}
              />

              {/* Overlay scanline for satellite effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020d07]/80 via-transparent to-transparent" />

              {/* Live badge overlay */}
              <div className="absolute bottom-6 left-5 right-5 flex items-center gap-3 bg-black/60 border border-white/10 backdrop-blur-md rounded-2xl px-5 py-3.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">SATELLITE X-RAY ACTIVE</p>
                  <p className="text-green-400 text-xs truncate">Live NDVI feed — monitoring your farm</p>
                </div>
                <Sprout size={20} className="text-green-400 shrink-0" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8 relative">
        {/* subtle separator line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent via-green-500/40 to-transparent" />

        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            variants={staggerContainer}
            {...animProps}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} transition={{ duration: 0.5 }}
              className="text-green-400 font-bold text-sm uppercase tracking-[0.2em] mb-3"
            >
              Why PrecisionFarm?
            </motion.p>
            <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight"
            >
              {t.featureTitle}
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.6 }}
              className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed"
            >
              Everything you need to maximize yield and minimize waste.
            </motion.p>
          </motion.div>

          {/* Cards */}
          <motion.div
            variants={staggerContainer}
            {...animProps}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, title, desc, gradient, glow, iconBg, iconColor }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`group relative bg-white/5 border border-white/8 hover:border-white/15 rounded-3xl p-8 cursor-default transition-shadow duration-300 hover:shadow-xl ${glow}`}
                style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
              >
                {/* Icon container */}
                <div className={`w-14 h-14 rounded-2xl border ${iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={iconColor} size={26} />
                </div>

                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`} />

                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-white/50 leading-relaxed text-[15px]">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8">
        <motion.div
          variants={fadeUp}
          {...animProps}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center relative overflow-hidden bg-gradient-to-r from-green-900/40 to-sky-900/30 border border-white/8 rounded-[2.5rem] px-8 py-16"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-sky-500/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Ready to optimize<br className="hidden sm:block" /> your farm? 🌱
            </h2>
            <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of farmers using satellite technology to grow smarter.
            </p>
            <motion.button
              id="cta-get-started-btn"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(22,163,74,0.55)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-emerald-400 text-white font-bold px-10 py-5 rounded-2xl text-lg shadow-2xl shadow-green-900/50 transition-all"
            >
              {t.btnStart}
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-5 sm:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={16} className="text-green-400" />
          <span className="text-green-400 font-bold text-sm">Precision Farming Optimizer</span>
        </div>
        <p className="text-white/25 text-xs">
          © 2026 — AI-powered crop monitoring using satellite & NDVI technology.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
