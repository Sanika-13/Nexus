// features/auth/auth.routes.js
// Wires HTTP routes to their controller functions.
// This router is mounted at /api/auth in app.js.

const express = require('express');
const router = express.Router();
const { loginOrRegister, getUserByPhone } = require('./auth.controller');

// POST /api/auth/login — login if user exists, else register
router.post('/login', loginOrRegister);

// POST /api/auth/register — alias for login (same logic, upsert behavior)
router.post('/register', loginOrRegister);

// GET /api/auth/user/:phone — get user profile by phone
router.get('/user/:phone', getUserByPhone);

module.exports = router;
