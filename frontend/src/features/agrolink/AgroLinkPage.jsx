// features/agrolink/AgroLinkPage.jsx
// ═══════════════════════════════════════════════════════════════
// AGROLINK ANTIGRAVITY AI — MAIN PAGE
// Self-Organizing Smart Farm Network dashboard.
// 5 tabs: Network · 2D Map · 3D Twin · Irrigation · Devices
// Real-time simulation updates every 5 seconds.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi, Map, Globe, Droplets, Battery,
  Scan, Activity, Layers, RefreshCw, Radio,
} from 'lucide-react';

import Navbar from '../../components/Navbar';
import QROnboard from './components/QROnboard';
import DevicePanel from './components/DevicePanel';
import FarmMap2D from './components/FarmMap2D';
import FarmTwin3D from './components/FarmTwin3D';
import IrrigationInsights from './components/IrrigationInsights';

import { generateInitialDevices, simulateOneTick } from './engine/deviceSimulator';
import { antiGravityCluster, calculateFarmCoverage } from './engine/antiGravity';
import { getStoredUser } from '../auth/authService';

// ── Tabs ───────────────────────────────────────────────────────
const TABS = [
  { id: 'network', label: 'Network', icon: Scan },
  { id: 'map2d', label: '2D Map', icon: Map },
  { id: '3d', label: '3D Twin', icon: Globe },
  { id: 'irrigation', label: 'Irrigation', icon: Droplets },
  { id: 'devices', label: 'Devices', icon: Battery },
];

const OWNER_ID = 'farmer_123'; // matches seed data

const AgroLinkPage = () => {
  const user = getStoredUser();
  const ownerId = user?.phone || OWNER_ID;

  // ── State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('network');
  const [devices, setDevices] = useState(() => generateInitialDevices(ownerId));
  const [clusters, setClusters] = useState([]);
  const [coverage, setCoverage] = useState({ totalDevices: 0, coveragePct: 0 });
  const [tick, setTick] = useState(0);
  const [liveActive, setLiveActive] = useState(true);
  const intervalRef = useRef(null);

  // ── Run AntiGravity clustering ─────────────────────────────
  const recluster = useCallback((devs) => {
    const { clusters: newClusters } = antiGravityCluster(devs, ownerId, 120, 1);
    setClusters(newClusters);
    setCoverage(calculateFarmCoverage(newClusters));
  }, [ownerId]);

  // ── Initial cluster ────────────────────────────────────────
  useEffect(() => {
    recluster(devices);
  }, []);

  // ── Real-time simulation tick (every 5 s) ──────────────────
  useEffect(() => {
    if (!liveActive) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setDevices((prev) => {
        const next = simulateOneTick(prev);
        recluster(next);
        return next;
      });
      setTick((t) => t + 1);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [liveActive, recluster]);

  // ── Handle new device bound via QR ────────────────────────
  const handleDeviceBound = (boundDevice) => {
    // Add a simulated device with the bound device_id
    const newDev = {
      device_id: boundDevice.device_id,
      owner_id: ownerId,
      lat: boundDevice.lat || (18.5204 + (Math.random() - 0.5) * 0.002),
      lng: boundDevice.lng || (73.8567 + (Math.random() - 0.5) * 0.002),
      soil_moisture: 40 + Math.random() * 30,
      temperature: 28 + Math.random() * 5,
      humidity: 55 + Math.random() * 20,
      battery: 50 + Math.random() * 40,
      charging: Math.random() > 0.7,
      ndvi: 0.4 + Math.random() * 0.3,
      last_seen: Date.now(),
      _clusterIdx: 1,
      _moistureBase: 45,
      _ndviBase: 0.5,
    };
    setDevices((prev) => {
      const updated = [...prev.filter((d) => d.device_id !== newDev.device_id), newDev];
      recluster(updated);
      return updated;
    });
    setActiveTab('map2d'); // jump to map to see new device
  };

  // ── Derived stats ──────────────────────────────────────────
  const onlineDevices = devices.filter((d) => d.battery > 5).length;
  const dryZones = clusters.filter((c) => c.avgMoisture < 30).length;
  const lowBatDevices = devices.filter((d) => d.battery < 30).length;

  return (
    <div className="min-h-screen bg-[#020d07] text-white font-sans">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* ── Page Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/60"
                />
                <span className="text-green-400 text-xs font-bold uppercase tracking-[0.2em]">
                  {liveActive ? 'Live · Tick #' + tick : 'Paused'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                🌀 AgroLink{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-sky-400">
                  AntiGravity AI
                </span>
              </h1>
              <p className="text-white/45 text-base mt-1">
                Self-Organizing Smart Farm Network · {devices.length} nodes · {clusters.length} zones
              </p>
            </div>

            {/* Live toggle */}
            <button
              onClick={() => setLiveActive((v) => !v)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all
                ${liveActive
                  ? 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25'
                  : 'bg-white/5 border-white/15 text-white/50 hover:bg-white/10'}`}
            >
              {liveActive ? <Radio size={16} className="animate-pulse" /> : <RefreshCw size={16} />}
              {liveActive ? 'Live' : 'Resume'}
            </button>
          </div>
        </motion.div>

        {/* ── Stats Strip ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          {[
            { label: 'Total Nodes', value: devices.length, color: 'text-sky-400', icon: Wifi },
            { label: 'Online', value: onlineDevices, color: 'text-green-400', icon: Activity },
            { label: 'Zones', value: clusters.length, color: 'text-purple-400', icon: Layers },
            { label: 'Coverage', value: `${coverage.coveragePct.toFixed(0)}%`, color: 'text-emerald-400', icon: Map },
            { label: 'Dry Zones', value: dryZones, color: dryZones > 0 ? 'text-red-400' : 'text-green-400', icon: Droplets },
            { label: 'Low Battery', value: lowBatDevices, color: lowBatDevices > 0 ? 'text-yellow-400' : 'text-green-400', icon: Battery },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
              <Icon size={15} className={`${color} mx-auto mb-1.5`} />
              <p className={`text-xl font-extrabold ${color} leading-none`}>{value}</p>
              <p className="text-white/40 text-[10px] mt-1">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Tab Bar ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/8 rounded-2xl p-1.5 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200
                ${activeTab === id ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {activeTab === id && (
                <motion.div
                  layoutId="agrolink-tab-bg"
                  className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-sky-600/20 border border-white/10 rounded-xl"
                />
              )}
              <Icon size={15} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {/* NETWORK TAB */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/8 rounded-3xl p-6">
                  <h3 className="text-white font-bold mb-1">🔐 Ownership Gravity Filter Active</h3>
                  <p className="text-white/45 text-sm leading-relaxed mb-4">
                    Each device is validated against your farm's gravitational field.
                    Foreign devices are repelled via the AntiGravity ownership protocol.
                    QR code contains encrypted binding credentials.
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {['Attraction: Same owner_id ✓', 'Repulsion: Foreign devices ✗', 'DBSCAN: 120m epsilon', 'Hull: Convex boundary'].map((t) => (
                      <span key={t} className="bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1.5 rounded-full font-semibold">{t}</span>
                    ))}
                  </div>
                </div>
                <QROnboard registeredIds={devices.map((d) => d.device_id)} onDeviceBound={handleDeviceBound} />
              </div>
            )}

            {/* 2D MAP TAB */}
            {activeTab === 'map2d' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">2D Satellite Farm Map</h3>
                  <p className="text-white/40 text-xs">{clusters.length} zones · {devices.length} devices · {coverage.coveragePct.toFixed(0)}% covered</p>
                </div>
                <FarmMap2D devices={devices} clusters={clusters} />
              </div>
            )}

            {/* 3D TWIN TAB */}
            {activeTab === '3d' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">3D Digital Farm Twin</h3>
                  <p className="text-white/40 text-xs">Height = moisture · Color = health · ⚡ = low battery</p>
                </div>
                <FarmTwin3D devices={devices} clusters={clusters} />
              </div>
            )}

            {/* IRRIGATION TAB */}
            {activeTab === 'irrigation' && (
              <IrrigationInsights clusters={clusters} devices={devices} />
            )}

            {/* DEVICES TAB */}
            {activeTab === 'devices' && (
              <DevicePanel devices={devices} clusters={clusters} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AgroLinkPage;
