// app.js
// Sets up the Express application with all middleware and routes.
// Separated from server.js so app can be tested independently.

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors()); // Allow all origins (fine for hackathon, restrict in production)
app.use(express.json()); // Parse JSON request bodies

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🌾 Precision Farming Optimizer API is running!', status: 'ok' });
});

// ─── Feature Routes ─────────────────────────────────────────────────────────
// Authentication routes (login / register)
app.use('/api/auth', require('./features/auth/auth.routes'));

// Farm / NDVI routes (existing — untouched)
app.use('/api/farms', require('./routes/farmRoutes'));

// AgroLink IoT device management routes
app.use('/api/agrolink', require('./features/agrolink/agrolink.routes'));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be LAST — catches errors from all routes above
app.use(errorHandler);

module.exports = app;
