// features/agrolink/components/DevicePanel.jsx
// ═══════════════════════════════════════════════════════════════
// DEVICE HEALTH PANEL
// Lists all registered IoT devices with real-time battery meter,
// soil moisture, temperature, humidity readings, and cluster badge.
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import { Battery, BatteryCharging, Thermometer, Droplets, Wind, Activity, Wifi, WifiOff } from 'lucide-react';
import { batteryStatus, healthStatus } from '../engine/deviceSimulator';

const CLUSTER_COLORS = ['#22c55e', '#38bdf8', '#facc15', '#a78bfa', '#f97316'];
const CLUSTER_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

const DevicePanel = ({ devices, clusters }) => {
  if (!devices.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Wifi size={48} className="text-white/15" />
        <p className="text-white/40 font-semibold">No devices registered yet.</p>
        <p className="text-white/25 text-sm">Use the "QR Onboard" tab to bind IoT sensors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Devices', value: devices.length, icon: Wifi, color: 'text-sky-400' },
          { label: 'Online', value: devices.filter(d => d.battery > 5).length, icon: Activity, color: 'text-green-400' },
          { label: 'Charging', value: devices.filter(d => d.charging).length, icon: BatteryCharging, color: 'text-yellow-400' },
          { label: 'Low Battery', value: devices.filter(d => d.battery < 30).length, icon: Battery, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
            <Icon size={18} className={`${color} mx-auto mb-2`} />
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-white/50 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Device cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {devices.map((device, i) => {
          const bat = batteryStatus(device.battery);
          const health = healthStatus(device.soil_moisture);
          const cluster = clusters.find(c => c.devices.some(d => d.device_id === device.device_id));
          const cId = cluster?.id ?? -1;
          const isOnline = device.battery > 5;
          const timeSince = Math.floor((Date.now() - device.last_seen) / 1000);

          return (
            <motion.div
              key={device.device_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -3 }}
              className={`bg-white/5 border rounded-2xl p-5 transition-all ${health.border}`}
            >
              {/* Device header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isOnline ? '#22c55e' : '#6b7280' }}
                    />
                    <span className="text-white font-bold text-sm">{device.device_id}</span>
                  </div>
                  {cId >= 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${CLUSTER_COLORS[cId % 5]}20`, color: CLUSTER_COLORS[cId % 5] }}
                    >
                      Zone {CLUSTER_NAMES[cId % 5]}
                    </span>
                  )}
                </div>
                {/* Battery */}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    {device.charging ? (
                      <BatteryCharging size={18} className="text-yellow-400" />
                    ) : (
                      <Battery size={18} style={{ color: bat.color }} />
                    )}
                    <span className="font-extrabold text-sm" style={{ color: bat.color }}>
                      {device.battery.toFixed(0)}%
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: bat.color }}>{bat.label}</span>
                </div>
              </div>

              {/* Battery bar */}
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: bat.color, width: `${device.battery}%` }}
                />
              </div>

              {/* Sensor readings */}
              <div className="grid grid-cols-3 gap-2">
                <Reading icon={Droplets} label="Moisture" value={`${device.soil_moisture.toFixed(0)}%`} color={health.color} />
                <Reading icon={Thermometer} label="Temp" value={`${device.temperature.toFixed(0)}°C`} color="#fb923c" />
                <Reading icon={Wind} label="Humidity" value={`${device.humidity.toFixed(0)}%`} color="#38bdf8" />
              </div>

              {/* NDVI badge */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-white/30 text-[10px]">NDVI: <span className="text-white/60 font-bold">{device.ndvi.toFixed(2)}</span></span>
                <span className="text-white/30 text-[10px]">{timeSince < 60 ? `${timeSince}s ago` : 'offline'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Individual reading cell
const Reading = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/5 rounded-xl p-2.5 text-center">
    <Icon size={13} className="mx-auto mb-1" style={{ color }} />
    <p className="font-bold text-xs text-white">{value}</p>
    <p className="text-white/35 text-[9px]">{label}</p>
  </div>
);

export default DevicePanel;
