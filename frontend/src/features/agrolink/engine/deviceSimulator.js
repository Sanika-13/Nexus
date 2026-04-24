// features/agrolink/engine/deviceSimulator.js
// ═══════════════════════════════════════════════════════════════
// REAL-TIME DEVICE SIMULATOR
// Generates realistic IoT sensor readings and battery behaviour.
// Battery follows a solar charging model:
//   - Daytime (06:00–18:00): charging devices gain ~0.3%/tick
//   - Night: discharge ~0.1%/tick
// Sensor values do a bounded random walk each tick.
// ═══════════════════════════════════════════════════════════════

// ── Farm Centre (Pune, Maharashtra, India) ────────────────────
const FARM_CENTER = { lat: 18.5204, lng: 73.8567 };

// ── Cluster definitions: offset from farm centre (degrees) ───
const CLUSTER_SEEDS = [
  // Cluster A – Northwest – DRY zone
  { latOff: 0.0015, lngOff: -0.0012, moistureBase: 22, ndviBase: 0.28 },
  // Cluster B – Southeast – MODERATE zone
  { latOff: -0.0010, lngOff: 0.0015, moistureBase: 45, ndviBase: 0.52 },
  // Cluster C – East – HEALTHY zone
  { latOff: 0.0005, lngOff: 0.0020, moistureBase: 68, ndviBase: 0.74 },
];

// ── Device spread within a cluster (degrees, ~10-30 m per device) ─
const INTRA_CLUSTER_SPREAD = [
  [0.0000, 0.0000],
  [0.0001, 0.0002],
  [-0.0001, 0.0001],
  [0.0002, -0.0001],
];

// ── Generate initial device list ───────────────────────────────
export function generateInitialDevices(ownerId = 'farmer_123') {
  const devices = [];
  let devIdx = 1;

  CLUSTER_SEEDS.forEach((seed, clusterIdx) => {
    INTRA_CLUSTER_SPREAD.forEach(([dLat, dLng], spreadIdx) => {
      // Skip a couple positions for cluster C so it has 2 devices
      if (clusterIdx === 2 && spreadIdx >= 2) return;

      const id = `node_${devIdx++}`;
      const battery = 40 + Math.floor(Math.random() * 60); // 40–100
      // Some devices are solar charging
      const charging = [0, 3, 6, 8].includes(devIdx - 2);

      devices.push({
        device_id: id,
        owner_id: ownerId,
        lat: FARM_CENTER.lat + seed.latOff + dLat,
        lng: FARM_CENTER.lng + seed.lngOff + dLng,
        soil_moisture: clamp(seed.moistureBase + rand(-8, 8), 0, 100),
        temperature: 28 + rand(-3, 5),
        humidity: 55 + rand(-10, 15),
        battery,
        charging,
        ndvi: clamp(seed.ndviBase + rand(-0.05, 0.05), 0, 1),
        cluster_id: null, // filled by antiGravity algorithm
        last_seen: Date.now(),
        // Internal sim state
        _clusterIdx: clusterIdx,
        _moistureBase: seed.moistureBase,
        _ndviBase: seed.ndviBase,
      });
    });
  });

  return devices;
}

// ── Simulate one tick (called every 5 s) ───────────────────────
/**
 * Returns a new device array with updated sensor values.
 * Mutates nothing in place — pure function for React state safety.
 */
export function simulateOneTick(devices) {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour <= 18;

  return devices.map((d) => {
    // ── Battery ────────────────────────────────────────────────
    let newBattery = d.battery;
    if (d.charging && isDaytime) {
      newBattery = clamp(newBattery + 0.3 + Math.random() * 0.2, 0, 100);
    } else {
      newBattery = clamp(newBattery - 0.08 - Math.random() * 0.05, 0, 100);
    }

    // ── Soil Moisture (slow random walk, tends toward base) ───
    const moistureDrift = (d._moistureBase - d.soil_moisture) * 0.05;
    const newMoisture = clamp(d.soil_moisture + moistureDrift + rand(-1.5, 1.5), 0, 100);

    // ── Temperature: peaks at midday ──────────────────────────
    const tempOffset = isDaytime ? Math.sin(((hour - 6) / 12) * Math.PI) * 5 : -2;
    const newTemp = clamp(28 + tempOffset + rand(-1, 1), 15, 48);

    // ── Humidity (inverse relation to temp) ───────────────────
    const newHumidity = clamp(70 - newTemp * 0.5 + rand(-3, 3), 20, 95);

    // ── NDVI (slow drift toward base) ─────────────────────────
    const ndviDrift = (d._ndviBase - d.ndvi) * 0.02;
    const newNDVI = clamp(d.ndvi + ndviDrift + rand(-0.01, 0.01), 0, 1);

    return {
      ...d,
      soil_moisture: +newMoisture.toFixed(1),
      temperature: +newTemp.toFixed(1),
      humidity: +newHumidity.toFixed(1),
      battery: +newBattery.toFixed(1),
      ndvi: +newNDVI.toFixed(3),
      last_seen: Date.now(),
    };
  });
}

// ── QR Payload Generator (for demo buttons) ───────────────────
export function generateQRPayload(deviceId, ownerId) {
  return JSON.stringify({
    device_id: deviceId,
    owner_id: ownerId,
    secret_key: `sk_${deviceId}_${ownerId.slice(0, 6)}`,
    lat: FARM_CENTER.lat + rand(-0.001, 0.001),
    lng: FARM_CENTER.lng + rand(-0.001, 0.001),
  });
}

// ── Battery status helper ─────────────────────────────────────
export function batteryStatus(pct) {
  if (pct > 70) return { label: 'Good', color: '#22c55e', text: 'text-green-400' };
  if (pct > 30) return { label: 'Moderate', color: '#facc15', text: 'text-yellow-400' };
  return { label: 'Critical', color: '#ef4444', text: 'text-red-400' };
}

// ── Health status helper ──────────────────────────────────────
export function healthStatus(moisture) {
  if (moisture < 30) return { label: 'Dry', color: '#ef4444', bg: 'bg-red-500/15', border: 'border-red-500/30', hex: '#ef4444' };
  if (moisture < 50) return { label: 'Moderate', color: '#facc15', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', hex: '#facc15' };
  return { label: 'Healthy', color: '#22c55e', bg: 'bg-green-500/15', border: 'border-green-500/30', hex: '#22c55e' };
}

// ── Utility ───────────────────────────────────────────────────
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(min, max) { return min + Math.random() * (max - min); }

export { FARM_CENTER };
