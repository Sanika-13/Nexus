// features/agrolink/agrolink.controller.js
// Route handlers for IoT device management.

const {
  bindDevice,
  getDevicesByOwner,
  updateDeviceReadings,
  unbindDevice,
} = require('./agrolink.service');

/**
 * POST /api/agrolink/bind
 * Bind an IoT device to the authenticated farmer after QR scan.
 * Body: { owner_id, device_id, secret_key, lat?, lng? }
 */
const bindDeviceHandler = async (req, res, next) => {
  try {
    const { owner_id, device_id, secret_key, lat, lng } = req.body;
    if (!owner_id || !device_id || !secret_key) {
      return res.status(400).json({ success: false, message: 'owner_id, device_id and secret_key are required.' });
    }
    const device = await bindDevice(owner_id, { device_id, secret_key, lat, lng });
    res.status(201).json({ success: true, message: 'Device bound successfully! 🛰️', device });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/agrolink/devices/:ownerId
 * Fetch all devices registered to a farmer.
 */
const getDevicesHandler = async (req, res, next) => {
  try {
    const { ownerId } = req.params;
    const devices = await getDevicesByOwner(ownerId);
    res.json({ success: true, count: devices.length, devices });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/agrolink/devices/:deviceId/readings
 * Update live sensor readings from an IoT device.
 * Body: { soil_moisture, temperature, humidity, ndvi, battery, charging, lat, lng }
 */
const updateReadingsHandler = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const device = await updateDeviceReadings(deviceId, req.body);
    res.json({ success: true, device });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/agrolink/devices/:deviceId
 * Remove a device from the farm network.
 * Body: { owner_id }
 */
const unbindDeviceHandler = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { owner_id } = req.body;
    if (!owner_id) return res.status(400).json({ success: false, message: 'owner_id is required.' });
    const removed = await unbindDevice(deviceId, owner_id);
    res.json({ success: true, message: 'Device unbound.', device: removed });
  } catch (err) {
    next(err);
  }
};

module.exports = { bindDeviceHandler, getDevicesHandler, updateReadingsHandler, unbindDeviceHandler };
