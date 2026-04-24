// features/agrolink/agrolink.service.js
// Business logic for IoT device registration and retrieval.

const IoTDevice = require('./agrolink.model');

/**
 * Register or update an IoT device bound to a farmer.
 * @param {string} ownerId   – farmer's unique identifier (phone)
 * @param {Object} deviceData – QR payload + current lat/lng
 */
const bindDevice = async (ownerId, deviceData) => {
  const { device_id, secret_key, lat, lng } = deviceData;

  // Validate secret key format (must include device_id prefix)
  const expectedPrefix = `sk_${device_id}_`;
  if (!secret_key || !secret_key.startsWith(expectedPrefix)) {
    const err = new Error('Invalid device secret key. Binding rejected.');
    err.statusCode = 403;
    throw err;
  }

  // Upsert: create if new, update lat/lng if already registered
  const device = await IoTDevice.findOneAndUpdate(
    { device_id },
    {
      owner_id: ownerId,
      device_id,
      secret_key,
      lat: lat || 0,
      lng: lng || 0,
      last_seen: new Date(),
      status: 'active',
    },
    { upsert: true, new: true, runValidators: true }
  );

  return device;
};

/**
 * Get all devices belonging to a farmer.
 */
const getDevicesByOwner = async (ownerId) => {
  return IoTDevice.find({ owner_id: ownerId }).sort({ registered_at: -1 });
};

/**
 * Update sensor readings for a device (called by IoT hardware).
 */
const updateDeviceReadings = async (deviceId, readings) => {
  const { soil_moisture, temperature, humidity, ndvi, battery, charging, lat, lng } = readings;

  const device = await IoTDevice.findOneAndUpdate(
    { device_id: deviceId },
    {
      soil_moisture,
      temperature,
      humidity,
      ndvi,
      battery,
      charging,
      lat,
      lng,
      last_seen: new Date(),
      status: battery < 20 ? 'low_battery' : 'active',
    },
    { new: true }
  );

  if (!device) {
    const err = new Error('Device not found');
    err.statusCode = 404;
    throw err;
  }
  return device;
};

/**
 * Remove a device from a farmer's network.
 */
const unbindDevice = async (deviceId, ownerId) => {
  const result = await IoTDevice.findOneAndDelete({ device_id: deviceId, owner_id: ownerId });
  if (!result) {
    const err = new Error('Device not found or not owned by you');
    err.statusCode = 404;
    throw err;
  }
  return result;
};

module.exports = { bindDevice, getDevicesByOwner, updateDeviceReadings, unbindDevice };
