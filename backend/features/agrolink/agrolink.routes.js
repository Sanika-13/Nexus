// features/agrolink/agrolink.routes.js
// Express router for AgroLink IoT device management.

const express = require('express');
const router = express.Router();
const {
  bindDeviceHandler,
  getDevicesHandler,
  updateReadingsHandler,
  unbindDeviceHandler,
} = require('./agrolink.controller');

// POST   /api/agrolink/bind                    – QR bind device
router.post('/bind', bindDeviceHandler);

// GET    /api/agrolink/devices/:ownerId         – list farmer's devices
router.get('/devices/:ownerId', getDevicesHandler);

// PATCH  /api/agrolink/devices/:deviceId/readings – update sensor data
router.patch('/devices/:deviceId/readings', updateReadingsHandler);

// DELETE /api/agrolink/devices/:deviceId        – unbind device
router.delete('/devices/:deviceId', unbindDeviceHandler);

module.exports = router;
