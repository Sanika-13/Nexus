// features/auth/auth.model.js
// Defines the User schema for MongoDB using Mongoose.
// Users are identified by their phone number (unique).

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Farmer's name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  // Phone number acts as the unique identifier (like a username)
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  // Automatically set on creation
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
