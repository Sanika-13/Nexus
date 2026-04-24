// middleware/errorHandler.js
// Global error handler — catches any errors passed via next(err) in routes.
// Must be the LAST middleware registered in app.js.

const errorHandler = (err, req, res, next) => {
  // Log the full error stack in development for easy debugging
  console.error('🔴 Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    // Only show stack trace in development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
