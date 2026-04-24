// features/agrolink/components/FarmTwin3D.jsx
// ═══════════════════════════════════════════════════════════════
// 3D FARM DIGITAL TWIN (Canvas Isometric Renderer)
// Pure canvas — no Three.js dependency.
// Each cluster occupies a grid region; each device is one cube.
// Cube HEIGHT = soil moisture (normalized)
// Cube COLOR  = health status (green/yellow/red)
// Animations: pulsing red glow for dry zones, battery sparks.
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { healthStatus, batteryStatus } from '../engine/deviceSimulator';

// ── Isometric constants ────────────────────────────────────────
const TW = 56;          // tile width  (px)
const TH = 30;          // tile height (px)
const MAX_CUBE_H = 90;  // max cube height in px (100% moisture)
const BASE_H = 12;      // minimum cube height (empty)
const GUTTER = 3;       // gap between cubes

// ── Cluster grid layout  ──────────────────────────────────────
// Each cluster occupies one row of the isometric grid.
// Within a row, each device gets one column.
const CLUSTER_GRID_OFFSET = [
  { row: 0, colStart: 0 },
  { row: 3, colStart: 0 },
  { row: 6, colStart: 0 },
  { row: 9, colStart: 0 },
];

// ── Colour utils ───────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
function darken(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  const d = (v) => Math.max(0, Math.floor(v * factor));
  return `rgb(${d(r)},${d(g)},${d(b)})`;
}
function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Draw one isometric cube ────────────────────────────────────
function drawCube(ctx, screenX, screenY, cubeH, topHex, glowPulse = 0, batLow = false) {
  const halfW = TW / 2;
  const halfH = TH / 2;

  // ── Top face ─────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(screenX, screenY - cubeH);
  ctx.lineTo(screenX + halfW, screenY - cubeH + halfH);
  ctx.lineTo(screenX, screenY - cubeH + TH);
  ctx.lineTo(screenX - halfW, screenY - cubeH + halfH);
  ctx.closePath();
  ctx.fillStyle = topHex;
  ctx.fill();
  if (glowPulse > 0) {
    ctx.strokeStyle = withAlpha('#ef4444', glowPulse);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ── Left face ─────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(screenX - halfW, screenY - cubeH + halfH);
  ctx.lineTo(screenX, screenY - cubeH + TH);
  ctx.lineTo(screenX, screenY + TH - 2);
  ctx.lineTo(screenX - halfW, screenY + halfH - 2);
  ctx.closePath();
  ctx.fillStyle = darken(topHex, 0.55);
  ctx.fill();

  // ── Right face ────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(screenX + halfW, screenY - cubeH + halfH);
  ctx.lineTo(screenX, screenY - cubeH + TH);
  ctx.lineTo(screenX, screenY + TH - 2);
  ctx.lineTo(screenX + halfW, screenY + halfH - 2);
  ctx.closePath();
  ctx.fillStyle = darken(topHex, 0.72);
  ctx.fill();

  // ── Battery-low spark ─────────────────────────────────────
  if (batLow) {
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.fillText('⚡', screenX - 6, screenY - cubeH - 4);
  }
}

// ── Grid to screen coordinates (isometric) ────────────────────
function isoToScreen(col, row, originX, originY) {
  return {
    x: originX + (col - row) * (TW / 2 + GUTTER),
    y: originY + (col + row) * (TH / 2 + GUTTER / 2),
  };
}

// ── Main component ────────────────────────────────────────────
const FarmTwin3D = ({ devices, clusters }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const tickRef = useRef(0);
  const [tooltip, setTooltip] = useState(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    tickRef.current += 1;
    const t = tickRef.current;

    // ── Clear ──────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020d07';
    ctx.fillRect(0, 0, W, H);

    // ── Draw grid floor dots ───────────────────────────────
    const originX = W * 0.45;
    const originY = H * 0.25;
    for (let r = -1; r < 16; r++) {
      for (let c = -1; c < 16; c++) {
        const { x, y } = isoToScreen(c, r, originX, originY);
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
      }
    }

    if (!devices.length) {
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.textAlign = 'center';
      ctx.fillText('No devices to visualise', W / 2, H / 2);
      return;
    }

    // ── Render cubes per cluster ───────────────────────────
    clusters.forEach((cluster, cIdx) => {
      const gridOffset = CLUSTER_GRID_OFFSET[cIdx % CLUSTER_GRID_OFFSET.length] || { row: cIdx * 3, colStart: 0 };

      cluster.devices.forEach((device, devIdx) => {
        const col = gridOffset.colStart + devIdx;
        const row = gridOffset.row;

        const { x: sx, y: sy } = isoToScreen(col, row, originX, originY);

        // Moisture → height
        const moisture = device.soil_moisture ?? 50;
        const cubeH = BASE_H + (moisture / 100) * (MAX_CUBE_H - BASE_H);

        // Health → color
        const health = healthStatus(moisture);
        const topColor = health.hex;

        // Pulsing glow for dry zones
        const isDry = moisture < 30;
        const glowPulse = isDry ? 0.4 + 0.5 * Math.abs(Math.sin(t * 0.05 + devIdx)) : 0;

        // Battery low?
        const batLow = device.battery < 30;

        drawCube(ctx, sx, sy, cubeH, topColor, glowPulse, batLow);

        // ── Device label ────────────────────────────────────
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(device.device_id, sx, sy - cubeH - 6);

        // ── Moisture text on top face ──────────────────────
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillText(`${moisture.toFixed(0)}%`, sx, sy - cubeH + TH / 2 + 4);
      });

      // ── Cluster zone label ─────────────────────────────────
      if (cluster.devices.length > 0) {
        const firstDev = cluster.devices[0];
        const { x: lx, y: ly } = isoToScreen(
          gridOffset.colStart + Math.floor(cluster.devices.length / 2),
          gridOffset.row - 1,
          originX,
          originY
        );
        const health = healthStatus(cluster.avgMoisture);
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = health.hex;
        ctx.textAlign = 'center';
        ctx.fillText(`Zone ${cIdx + 1} · ${cluster.health.toUpperCase()}`, lx, ly);
      }
    });

    // ── Legend annotation ──────────────────────────────────
    ctx.textAlign = 'left';
    const ly = H - 80;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('Height = Soil Moisture    Colour = Health    ⚡ = Low Battery', 20, ly);
    [
      ['#22c55e', 'Healthy (>50%)'],
      ['#facc15', 'Moderate (30–50%)'],
      ['#ef4444', 'Dry (<30%) — pulsing'],
    ].forEach(([hex, label], i) => {
      ctx.fillStyle = hex;
      ctx.fillRect(20, ly + 16 + i * 16, 12, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(label, 38, ly + 25 + i * 16);
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, [devices, clusters]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // Resize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 500;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 500 }} />
      {/* Corner label */}
      <div className="absolute top-4 left-5 bg-black/50 backdrop-blur border border-white/10 rounded-xl px-3 py-2">
        <p className="text-white font-bold text-sm">🌐 3D Farm Digital Twin</p>
        <p className="text-white/40 text-xs">Isometric · Real-time · AntiGravity Zones</p>
      </div>
    </div>
  );
};

export default FarmTwin3D;
