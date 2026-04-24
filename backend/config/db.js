// config/db.js
// This file handles the MongoDB connection.
// We separated it from server.js to keep things clean and modular.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus'
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure if DB doesn't connect
  }
};

module.exports = connectDB;
