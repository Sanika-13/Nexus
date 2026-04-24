// features/agrolink/components/FarmMap2D.jsx
// ═══════════════════════════════════════════════════════════════
// 2D FARM MAP (Leaflet)
// Shows: device markers with battery indicators, convex hull
// cluster zones, irrigation coverage circles, and a heatmap
// color scheme (red=dry, yellow=moderate, green=healthy).
// ═══════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Polygon,
  Circle, Tooltip, useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FARM_CENTER } from '../engine/deviceSimulator';
import { healthStatus } from '../engine/deviceSimulator';

const CLUSTER_COLORS = ['#22c55e', '#38bdf8', '#facc15', '#a78bfa', '#f97316'];
const DEVICE_RADIUS_M = 11; // metres

// ── Map auto-fit to all devices ────────────────────────────────
const AutoFit = ({ devices }) => {
  const map = useMap();
  useMemo(() => {
    if (!devices.length) return;
    const lats = devices.map((d) => d.lat);
    const lngs = devices.map((d) => d.lng);
    const bounds = [
      [Math.min(...lats) - 0.0003, Math.min(...lngs) - 0.0003],
      [Math.max(...lats) + 0.0003, Math.max(...lngs) + 0.0003],
    ];
    if (lats.length) map.fitBounds(bounds, { padding: [30, 30] });
  }, [devices.length]);
  return null;
};

const FarmMap2D = ({ devices, clusters }) => {
  const center = [FARM_CENTER.lat, FARM_CENTER.lng];

  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: 520 }}>
      <MapContainer
        center={center}
        zoom={17}
        style={{ height: '100%', width: '100%', background: '#020d07' }}
        zoomControl={true}
      >
        {/* Satellite tile layer */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="Satellite"
        />
        <AutoFit devices={devices} />

        {/* ── Cluster zone polygons (convex hull) ──────────── */}
        {clusters.map((cluster) => {
          if (cluster.hull.length < 3) return null;
          const color = CLUSTER_COLORS[cluster.id % CLUSTER_COLORS.length];
          return (
            <Polygon
              key={`hull-${cluster.id}`}
              positions={cluster.hull}
              pathOptions={{
                color,
                weight: 2,
                fillOpacity: 0.08,
                fillColor: color,
                dashArray: '6 4',
              }}
            >
              <Tooltip sticky>
                Zone {cluster.id + 1} · {cluster.devices.length} devices · {cluster.avgMoisture.toFixed(0)}% moisture
              </Tooltip>
            </Polygon>
          );
        })}

        {/* ── Device coverage circles (irrigation radius) ───── */}
        {devices.map((device) => {
          const health = healthStatus(device.soil_moisture);
          return (
            <Circle
              key={`cov-${device.device_id}`}
              center={[device.lat, device.lng]}
              radius={DEVICE_RADIUS_M}
              pathOptions={{
                color: health.hex,
                weight: 1,
                fillOpacity: 0.12,
                fillColor: health.hex,
              }}
            />
          );
        })}

        {/* ── Device markers ────────────────────────────────── */}
        {devices.map((device) => {
          const health = healthStatus(device.soil_moisture);
          const batLow = device.battery < 30;
          const cluster = clusters.find((c) =>
            c.devices.some((d) => d.device_id === device.device_id)
          );
          const cColor = cluster
            ? CLUSTER_COLORS[cluster.id % CLUSTER_COLORS.length]
            : '#9ca3af';

          return (
            <CircleMarker
              key={device.device_id}
              center={[device.lat, device.lng]}
              radius={batLow ? 9 : 8}
              pathOptions={{
                color: batLow ? '#ef4444' : cColor,
                weight: batLow ? 3 : 2,
                fillColor: health.hex,
                fillOpacity: 0.9,
              }}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -8]}>
                <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
                  <strong>{device.device_id}</strong><br />
                  💧 {device.soil_moisture.toFixed(0)}% · 🌡️ {device.temperature.toFixed(0)}°C<br />
                  🔋 {device.battery.toFixed(0)}%{device.charging ? ' ⚡' : ''}<br />
                  NDVI: {device.ndvi.toFixed(2)}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* ── Legend overlay ──────────────────────────────────── */}
      <div
        className="absolute bottom-4 left-4 bg-black/70 backdrop-blur border border-white/15 rounded-2xl p-3 text-xs pointer-events-none z-[1000]"
        style={{ position: 'relative', marginTop: -110, marginLeft: 12, display: 'inline-block', zIndex: 1000 }}
      >
        <p className="text-white/60 font-bold mb-2 uppercase tracking-widest text-[9px]">Legend</p>
        {[['#22c55e', 'Healthy >50%'], ['#facc15', 'Moderate 30–50%'], ['#ef4444', 'Dry <30%']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-white/70">{l}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="w-3 h-3 rounded border border-dashed border-white/40" />
          <span className="text-white/70">Zone boundary</span>
        </div>
      </div>
    </div>
  );
};

export default FarmMap2D;
