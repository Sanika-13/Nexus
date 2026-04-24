// server.js
// Entry point for the Node.js server.
// Responsibilities: load env vars → connect to DB → start listening.

const dotenv = require('dotenv');
dotenv.config(); // Load .env FIRST before anything else imports it

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
