// features/agrolink/components/QROnboard.jsx
// ═══════════════════════════════════════════════════════════════
// QR CODE DEVICE ONBOARDING
// Camera-based QR scanner using html5-qrcode.
// Also provides a "Demo Mode" panel with pre-loaded devices
// so the hackathon demo always works without camera access.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { Scan, CheckCircle2, XCircle, Zap, Wifi, Shield, Camera } from 'lucide-react';
import { generateQRPayload } from '../engine/deviceSimulator';
import api from '../../../services/api';
import { getStoredUser } from '../../auth/authService';

// Pre-loaded demo device QR data
const DEMO_DEVICES = [
  { label: 'Sensor Node A', emoji: '🌱', clusterHint: 'Northwest – Dry Zone' },
  { label: 'Sensor Node B', emoji: '💧', clusterHint: 'Southeast – Moderate' },
  { label: 'Sensor Node C', emoji: '🌿', clusterHint: 'East – Healthy Zone' },
];

const QROnboard = ({ registeredIds, onDeviceBound }) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { success, message, device }
  const [bindingId, setBindingId] = useState(null);
  const qrRef = useRef(null);
  const html5QrRef = useRef(null);
  const user = getStoredUser();

  // ── Start camera scanner ────────────────────────────────────
  const startScanner = async () => {
    setScanning(true);
    setScanResult(null);
    await new Promise((r) => setTimeout(r, 100)); // let div render

    try {
      const html5Qr = new Html5Qrcode('qr-reader-div');
      html5QrRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: { width: 240, height: 240 } },
        (decodedText) => handleQRDecoded(decodedText),
        () => {} // ignore per-frame errors
      );
    } catch (err) {
      setScanning(false);
      setScanResult({ success: false, message: 'Camera not available. Use Demo Mode below.' });
    }
  };

  const stopScanner = () => {
    html5QrRef.current?.stop().catch(() => {});
    setScanning(false);
  };

  useEffect(() => () => stopScanner(), []);

  // ── Parse & Bind from QR text ──────────────────────────────
  const handleQRDecoded = async (text) => {
    stopScanner();
    try {
      const payload = JSON.parse(text);
      await bindDevice(payload);
    } catch {
      setScanResult({ success: false, message: 'Invalid QR code format. Expected JSON with device_id, owner_id, secret_key.' });
    }
  };

  // ── Bind device to backend ─────────────────────────────────
  const bindDevice = async (payload) => {
    setBindingId(payload.device_id);
    try {
      const res = await api.post('/api/agrolink/bind', {
        owner_id: user?.phone || payload.owner_id,
        device_id: payload.device_id,
        secret_key: payload.secret_key,
        lat: payload.lat,
        lng: payload.lng,
      });
      setScanResult({ success: true, message: res.data.message, device: res.data.device });
      onDeviceBound && onDeviceBound(res.data.device);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Binding failed. Check connection.';
      setScanResult({ success: false, message: errMsg });
    } finally {
      setBindingId(null);
    }
  };

  // ── Demo mode: simulate QR scan for a demo device ─────────
  const handleDemoAdd = async (idx) => {
    const devId = `node_demo_${idx + 1}`;
    const ownerId = user?.phone || 'farmer_123';
    const payload = JSON.parse(generateQRPayload(devId, ownerId));
    await bindDevice(payload);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* ── Left: Scanner ──────────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
            <Scan className="text-sky-400" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">Camera QR Scanner</h3>
            <p className="text-white/40 text-xs">Point at device QR code to bind</p>
          </div>
        </div>

        {/* Scanner viewport */}
        <div className="relative bg-black/40 rounded-2xl overflow-hidden mb-5" style={{ minHeight: 280 }}>
          {scanning ? (
            <>
              <div id="qr-reader-div" className="w-full" style={{ minHeight: 260 }} />
              {/* Corner frame overlay */}
              <div className="absolute inset-4 pointer-events-none">
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-8 h-8 border-2 border-sky-400 ${i < 2 ? 'rounded-tl-lg' : 'rounded-br-lg'}`} />
                ))}
                <motion.div
                  animate={{ y: [0, 240, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-lg shadow-sky-400/50"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Camera size={48} className="text-white/20" />
              <p className="text-white/30 text-sm text-center">Camera scanner inactive</p>
            </div>
          )}
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 flex items-start gap-3 rounded-2xl p-4 border text-sm
                ${scanResult.success
                  ? 'bg-green-500/10 border-green-500/25 text-green-300'
                  : 'bg-red-500/10 border-red-500/25 text-red-300'}`}
            >
              {scanResult.success ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
              <span>{scanResult.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {scanning ? (
          <button onClick={stopScanner} className="w-full bg-red-500/15 border border-red-500/30 text-red-300 font-bold py-3 rounded-2xl hover:bg-red-500/25 transition-all">
            Stop Scanner
          </button>
        ) : (
          <button onClick={startScanner} className="w-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-bold py-3 rounded-2xl hover:bg-sky-500/25 transition-all flex items-center justify-center gap-2">
            <Camera size={18} /> Start Camera Scanner
          </button>
        )}
      </div>

      {/* ── Right: Demo Mode ──────────────────────────────────── */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/25 flex items-center justify-center">
            <Zap className="text-yellow-400" size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">Demo Mode</h3>
            <p className="text-white/40 text-xs">Simulate QR scan for demonstration</p>
          </div>
        </div>

        {/* Protocol info */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 mb-5 text-xs font-mono text-emerald-300/70">
          <p className="text-white/40 mb-1">// QR payload format:</p>
          <p>{'{'}</p>
          <p className="pl-4">"device_id": "node_1",</p>
          <p className="pl-4">"owner_id": "farmer_123",</p>
          <p className="pl-4">"secret_key": "sk_node_1_farmer"</p>
          <p>{'}'}</p>
        </div>

        {/* Demo devices to add */}
        <div className="space-y-3">
          {DEMO_DEVICES.map((d, i) => (
            <motion.button
              key={i}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleDemoAdd(i)}
              disabled={bindingId !== null}
              className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 rounded-2xl p-4 text-left transition-all group"
            >
              <span className="text-2xl">{d.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{d.label}</p>
                <p className="text-white/40 text-xs truncate">{d.clusterHint}</p>
              </div>
              {bindingId === `node_demo_${i + 1}` ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-green-400/40 border-t-green-400 rounded-full"
                />
              ) : (
                <div className="flex items-center gap-1 text-green-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Wifi size={14} /> Bind
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Security info */}
        <div className="mt-5 flex items-center gap-2 text-white/30 text-xs">
          <Shield size={12} />
          <span>Devices are ownership-filtered via AntiGravity protocol</span>
        </div>
      </div>
    </div>
  );
};

export default QROnboard;
