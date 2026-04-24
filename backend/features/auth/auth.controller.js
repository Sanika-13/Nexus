// features/auth/auth.controller.js
// Handles HTTP requests for authentication.
// Each function calls the auth service for actual business logic.

const { findUserByPhone, createUser } = require('./auth.service');

/**
 * POST /api/auth/login
 * If user with phone exists → return user (login)
 * Else → create new user (register)
 * Body: { name, phone }
 */
const loginOrRegister = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    // Basic validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required.',
      });
    }

    // Check if this phone number already exists
    let user = await findUserByPhone(phone);

    if (user) {
      // User found → it's a login
      return res.status(200).json({
        success: true,
        message: 'Login successful! Welcome back.',
        isNewUser: false,
        user,
      });
    }

    // User not found → create new account (register)
    user = await createUser({ name, phone });
    return res.status(201).json({
      success: true,
      message: 'Account created! Welcome to Precision Farming Optimizer.',
      isNewUser: true,
      user,
    });
  } catch (error) {
    // Pass to global error handler
    next(error);
  }
};

/**
 * GET /api/auth/user/:phone
 * Fetch user profile by phone number.
 */
const getUserByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const user = await findUserByPhone(phone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginOrRegister, getUserByPhone };
