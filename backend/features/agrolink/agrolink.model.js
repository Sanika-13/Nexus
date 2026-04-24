// features/agrolink/agrolink.model.js
// Mongoose schema for IoT devices bound to a farmer via QR code.

const mongoose = require('mongoose');

const IoTDeviceSchema = new mongoose.Schema({
  // Unique hardware identifier (encoded in QR code)
  device_id: { type: String, required: true, unique: true },

  // The farmer this device is bound to (phone number as owner_id)
  owner_id: { type: String, required: true, index: true },

  // Secret key for binding validation (from QR)
  secret_key: { type: String, required: true },

  // GPS position of the device
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },

  // Live sensor readings
  soil_moisture: { type: Number, default: 50 }, // 0–100 %
  temperature: { type: Number, default: 28 },   // °C
  humidity: { type: Number, default: 60 },       // %
  ndvi: { type: Number, default: 0.5 },          // 0–1

  // Device health
  battery: { type: Number, default: 100 }, // %
  charging: { type: Boolean, default: false },

  // Assigned cluster (updated by backend after each clustering run)
  cluster_id: { type: Number, default: null },

  // Status derived from battery + connectivity
  status: {
    type: String,
    enum: ['active', 'inactive', 'low_battery'],
    default: 'active',
  },

  last_seen: { type: Date, default: Date.now },
  registered_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('IoTDevice', IoTDeviceSchema);
