// features/agrolink/components/IrrigationInsights.jsx
// ═══════════════════════════════════════════════════════════════
// SMART IRRIGATION INSIGHTS PANEL
// Combines AntiGravity clusters + NDVI sensor fusion to generate
// actionable irrigation recommendations per zone.
// Shows: coverage stats, per-cluster analysis, NDVI fusion results.
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import {
  Droplets, AlertTriangle, CheckCircle2, Info,
  Battery, TrendingUp, Layers, Wind, Zap,
} from 'lucide-react';
import { calculateFarmCoverage, generateIrrigationInsights, classifyNDVIFusion } from '../engine/antiGravity';
import { healthStatus } from '../engine/deviceSimulator';

const TYPE_STYLES = {
  critical: { bg: 'bg-red-500/10 border-red-500/25', text: 'text-red-300', icon: AlertTriangle, iconColor: 'text-red-400' },
  warning:  { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-300', icon: Info, iconColor: 'text-yellow-400' },
  ok:       { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-300', icon: CheckCircle2, iconColor: 'text-green-400' },
  battery:  { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-300', icon: Battery, iconColor: 'text-orange-400' },
};

const FLOW_DIRECTIONS = ['South → North', 'East → West', 'Northeast → Southwest', 'Clockwise'];

const IrrigationInsights = ({ clusters, devices }) => {
  const insights = generateIrrigationInsights(clusters);
  const coverage = calculateFarmCoverage(clusters);
  const flowDir = FLOW_DIRECTIONS[clusters.length % FLOW_DIRECTIONS.length];

  return (
    <div className="space-y-8">
      {/* ── Coverage Stats Row ──────────────────────────────── */}
      <div>
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Farm Coverage Summary</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Devices', value: coverage.totalDevices, icon: Layers, color: 'text-sky-400', suffix: '' },
            { label: 'Coverage Area', value: (coverage.totalCoverage).toFixed(0), icon: Droplets, color: 'text-blue-400', suffix: ' m²' },
            { label: 'Farm Area', value: (coverage.totalArea || coverage.totalCoverage * 1.3).toFixed(0), icon: TrendingUp, color: 'text-emerald-400', suffix: ' m²' },
            { label: 'Coverage %', value: coverage.coveragePct.toFixed(0), icon: Zap, color: 'text-yellow-400', suffix: '%' },
          ].map(({ label, value, icon: Icon, color, suffix }) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
              <Icon size={18} className={`${color} mx-auto mb-2`} />
              <p className={`text-2xl font-extrabold ${color}`}>{value}{suffix}</p>
              <p className="text-white/45 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Coverage bar */}
        <div className="mt-4 bg-white/5 border border-white/8 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/60 text-sm font-semibold">Irrigation Coverage</span>
            <span className="text-green-400 font-bold">{coverage.coveragePct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-600 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(coverage.coveragePct, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/30">
            <span>0%</span>
            <span className="text-yellow-400">⚠ Threshold: 70%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* ── Per-Cluster Analysis ─────────────────────────────── */}
      <div>
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Zone-by-Zone Analysis</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {clusters.map((cluster) => {
            const health = healthStatus(cluster.avgMoisture);
            const ndviFusion = classifyNDVIFusion(cluster.avgMoisture, cluster.avgNDVI);
            const fusionLabels = {
              critical: { label: '🚨 Crop Stress Critical', color: 'text-red-400' },
              disease_risk: { label: '🦠 Disease Risk', color: 'text-orange-400' },
              optimal: { label: '✅ Optimal', color: 'text-green-400' },
              moderate: { label: '⚠ Moderate', color: 'text-yellow-400' },
            };
            const fusion = fusionLabels[ndviFusion];

            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: cluster.id * 0.1 }}
                className={`border rounded-3xl p-6 ${health.bg} ${health.border}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-bold text-base">Zone {cluster.id + 1}</p>
                    <p className="text-white/40 text-xs">{cluster.devices.length} devices</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${health.bg} ${health.border}`} style={{ color: health.hex }}>
                    {health.label}
                  </span>
                </div>

                {/* Sensor readings */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Metric label="Moisture" value={`${cluster.avgMoisture.toFixed(0)}%`} color={health.hex} />
                  <Metric label="Temperature" value={`${cluster.avgTemp.toFixed(0)}°C`} color="#fb923c" />
                  <Metric label="Humidity" value={`${cluster.avgHumidity.toFixed(0)}%`} color="#38bdf8" />
                  <Metric label="NDVI" value={cluster.avgNDVI.toFixed(2)} color="#a78bfa" />
                </div>

                {/* NDVI Fusion */}
                <div className="bg-black/20 rounded-2xl p-3 mb-3">
                  <p className="text-white/40 text-[10px] font-bold uppercase mb-1">NDVI + Sensor Fusion</p>
                  <p className={`text-sm font-bold ${fusion.color}`}>{fusion.label}</p>
                </div>

                {/* Water flow */}
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Wind size={12} />
                  <span>Flow direction: {flowDir}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── AI Insight Feed ──────────────────────────────────── */}
      <div>
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
          AI Irrigation Recommendations
        </h3>
        {insights.length === 0 ? (
          <div className="text-center py-12 text-white/30">No insights yet — waiting for device data.</div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => {
              const style = TYPE_STYLES[insight.type] || TYPE_STYLES.ok;
              const Icon = style.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-start gap-3 border rounded-2xl p-4 ${style.bg}`}
                >
                  <Icon size={18} className={`${style.iconColor} shrink-0 mt-0.5`} />
                  <p className={`text-sm leading-relaxed ${style.text}`}>{insight.message}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Metric = ({ label, value, color }) => (
  <div className="bg-black/20 rounded-xl p-2.5 text-center">
    <p className="font-extrabold text-sm" style={{ color }}>{value}</p>
    <p className="text-white/35 text-[9px]">{label}</p>
  </div>
);

export default IrrigationInsights;
