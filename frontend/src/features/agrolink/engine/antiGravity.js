// features/agrolink/engine/antiGravity.js
// ═══════════════════════════════════════════════════════════════
// ANTIGRAVITY CLUSTERING ENGINE
// Core algorithm: DBSCAN with ownership-based gravity filter.
// Devices belonging to the same farmer attract each other;
// devices from other farmers are repelled (ignored entirely).
// ═══════════════════════════════════════════════════════════════

// ── Constants ──────────────────────────────────────────────────
const EARTH_RADIUS_M = 6371000;    // metres
const CLUSTER_EPSILON_M = 120;     // max distance (m) to attract two devices
const DEVICE_COVERAGE_RADIUS_M = 11; // irrigation radius per device (metres)
const NDVI_THRESHOLD_LOW = 0.35;
const NDVI_THRESHOLD_HIGH = 0.6;

// ── Distance Calculation ───────────────────────────────────────
/**
 * Haversine distance between two lat/lng points in metres.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Ownership Gravity Filter ───────────────────────────────────
/**
 * Returns only devices belonging to the authenticated farmer.
 * Devices from other owners are repelled (filtered out).
 */
export function applyOwnershipFilter(devices, farmerId) {
  return devices.filter((d) => d.owner_id === farmerId);
}

// ── DBSCAN Clustering ──────────────────────────────────────────
/**
 * Anti-gravity cluster: DBSCAN on owner-filtered devices.
 * epsilon  – max attraction radius in metres (CLUSTER_EPSILON_M)
 * minPts   – minimum devices to form a cluster (1 for sparse farms)
 */
export function antiGravityCluster(
  allDevices,
  farmerId,
  epsilon = CLUSTER_EPSILON_M,
  minPts = 1
) {
  // ① Apply ownership gravity filter — repel foreign devices
  const devices = applyOwnershipFilter(allDevices, farmerId);
  if (!devices.length) return { clusters: [], noise: [], devices };

  const visited = new Set();
  const clusterAssigned = new Map(); // device_id → clusterId
  const clusters = [];
  let clusterId = 0;

  // Helper: find all neighbours within epsilon
  const neighbours = (idx) =>
    devices.reduce((acc, d, j) => {
      if (j === idx) return acc;
      const dist = haversineDistance(
        devices[idx].lat, devices[idx].lng,
        d.lat, d.lng
      );
      if (dist <= epsilon) acc.push(j);
      return acc;
    }, []);

  // Core DBSCAN expansion
  const expandCluster = (seedIdx, neighborIdxs, cId) => {
    clusterAssigned.set(devices[seedIdx].device_id, cId);
    const queue = [...neighborIdxs];
    while (queue.length) {
      const qIdx = queue.shift();
      if (!visited.has(qIdx)) {
        visited.add(qIdx);
        const qNeighbors = neighbours(qIdx);
        if (qNeighbors.length >= minPts) queue.push(...qNeighbors);
      }
      if (!clusterAssigned.has(devices[qIdx].device_id)) {
        clusterAssigned.set(devices[qIdx].device_id, cId);
      }
    }
  };

  for (let i = 0; i < devices.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);
    const nbrs = neighbours(i);
    if (nbrs.length < minPts) {
      clusterAssigned.set(devices[i].device_id, -1); // noise
    } else {
      expandCluster(i, nbrs, clusterId++);
    }
  }

  // Group devices by cluster id
  const clusterMap = new Map();
  devices.forEach((d) => {
    const cId = clusterAssigned.get(d.device_id) ?? -1;
    if (cId === -1) return;
    if (!clusterMap.has(cId)) clusterMap.set(cId, []);
    clusterMap.get(cId).push({ ...d, cluster_id: cId });
  });

  const noise = devices.filter(
    (d) => (clusterAssigned.get(d.device_id) ?? -1) === -1
  );

  clusterMap.forEach((devs, cId) => {
    const avgMoisture = avg(devs, 'soil_moisture');
    const avgTemp = avg(devs, 'temperature');
    const avgHumidity = avg(devs, 'humidity');
    const avgNDVI = avg(devs, 'ndvi');
    const avgBattery = avg(devs, 'battery');

    clusters.push({
      id: cId,
      devices: devs,
      centroid: centroidOf(devs),
      hull: convexHull(devs.map((d) => [d.lat, d.lng])),
      avgMoisture,
      avgTemp,
      avgHumidity,
      avgNDVI,
      avgBattery,
      health: classifyHealth(avgMoisture, avgNDVI),
      irrigationNeeded: avgMoisture < 35,
      totalArea: estimatePolygonAreaM2(convexHull(devs.map((d) => [d.lat, d.lng]))),
      coverageArea: devs.length * Math.PI * DEVICE_COVERAGE_RADIUS_M ** 2,
    });
  });

  return { clusters, noise, devices };
}

// ── Convex Hull (Graham Scan) ──────────────────────────────────
/**
 * Returns ordered hull points [[lat,lng],...] for the set of points.
 */
export function convexHull(points) {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const cross = (O, A, B) =>
    (A[1] - O[1]) * (B[0] - O[0]) - (A[0] - O[0]) * (B[0] - O[0]);

  const cross2 = (O, A, B) =>
    (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);

  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross2(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross2(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return [...lower, ...upper];
}

// ── Health Classification ──────────────────────────────────────
export function classifyHealth(moisture, ndvi = 0.5) {
  if (moisture < 30) return 'dry';
  if (moisture < 50) return 'moderate';
  return 'healthy';
}

export function classifyNDVIFusion(moisture, ndvi) {
  if (ndvi < NDVI_THRESHOLD_LOW && moisture < 30) return 'critical';
  if (ndvi < NDVI_THRESHOLD_LOW && moisture > 50) return 'disease_risk';
  if (ndvi > NDVI_THRESHOLD_HIGH && moisture >= 30) return 'optimal';
  return 'moderate';
}

// ── Coverage Calculation ───────────────────────────────────────
export function calculateFarmCoverage(clusters) {
  let totalCoverage = 0;
  let totalDevices = 0;
  let totalArea = 0;

  clusters.forEach((c) => {
    totalDevices += c.devices.length;
    totalCoverage += c.coverageArea;
    totalArea += Math.max(c.totalArea, c.coverageArea);
  });

  const coveragePct = totalArea > 0 ? Math.min(100, (totalCoverage / totalArea) * 100) : 0;
  return { totalDevices, totalCoverage, totalArea, coveragePct };
}

// ── Smart Irrigation Insights ──────────────────────────────────
export function generateIrrigationInsights(clusters) {
  const insights = [];
  clusters.forEach((c) => {
    if (c.avgMoisture < 30) {
      insights.push({
        type: 'critical',
        cluster: c.id,
        message: `Cluster ${c.id + 1} is critically dry (${c.avgMoisture.toFixed(0)}% moisture). Immediate irrigation required.`,
        action: 'irrigate_now',
      });
    } else if (c.avgMoisture < 50) {
      insights.push({
        type: 'warning',
        cluster: c.id,
        message: `Cluster ${c.id + 1} has moderate moisture (${c.avgMoisture.toFixed(0)}%). Schedule irrigation within 24 hours.`,
        action: 'schedule_irrigation',
      });
    } else {
      insights.push({
        type: 'ok',
        cluster: c.id,
        message: `Cluster ${c.id + 1} soil is healthy (${c.avgMoisture.toFixed(0)}% moisture). No action needed.`,
        action: 'monitor',
      });
    }
    // NDVI fusion
    const fusion = classifyNDVIFusion(c.avgMoisture, c.avgNDVI);
    if (fusion === 'critical') {
      insights.push({ type: 'critical', cluster: c.id, message: `⚠️ Cluster ${c.id + 1}: Low NDVI + Low moisture → Crop stress critical!`, action: 'emergency' });
    } else if (fusion === 'disease_risk') {
      insights.push({ type: 'warning', cluster: c.id, message: `🦠 Cluster ${c.id + 1}: Low NDVI + High moisture → Disease risk detected!`, action: 'inspect' });
    }
    // Battery alerts
    const lowBat = c.devices.filter((d) => d.battery < 30);
    if (lowBat.length > 0) {
      insights.push({
        type: 'battery',
        cluster: c.id,
        message: `🔋 ${lowBat.map((d) => d.device_id).join(', ')} battery critical. Cluster ${c.id + 1} may go offline.`,
        action: 'charge',
      });
    }
  });
  return insights;
}

// ── Helpers ────────────────────────────────────────────────────
function avg(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((s, d) => s + (d[key] || 0), 0) / arr.length;
}

function centroidOf(devices) {
  return {
    lat: avg(devices, 'lat'),
    lng: avg(devices, 'lng'),
  };
}

function estimatePolygonAreaM2(hullPoints) {
  if (hullPoints.length < 3) return DEVICE_COVERAGE_RADIUS_M ** 2 * Math.PI;
  // Shoelace theorem on lat/lng → approximate m²
  let area = 0;
  const n = hullPoints.length;
  for (let i = 0; i < n; i++) {
    const [lat1, lng1] = hullPoints[i];
    const [lat2, lng2] = hullPoints[(i + 1) % n];
    // Convert degree differences to metres (approx)
    const dLat = (lat2 - lat1) * 111139;
    const dLng = (lng2 - lng1) * 111139 * Math.cos((lat1 * Math.PI) / 180);
    area += lat1 * 111139 * dLng - lng1 * 111139 * Math.cos((lat1 * Math.PI) / 180) * dLat;
  }
  return Math.abs(area) / 2;
}
