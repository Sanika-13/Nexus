// features/auth/auth.service.js
// Business logic layer for authentication.
// Controllers call these functions — keeps controllers thin and logic testable.

const User = require('./auth.model');

/**
 * Find a user by their phone number.
 * @param {string} phone
 * @returns {Promise<User|null>}
 */
const findUserByPhone = async (phone) => {
  return await User.findOne({ phone });
};

/**
 * Create a new user in the database.
 * @param {Object} userData - { name, phone }
 * @returns {Promise<User>}
 */
const createUser = async ({ name, phone }) => {
  const newUser = new User({ name, phone });
  return await newUser.save();
};

module.exports = { findUserByPhone, createUser };
