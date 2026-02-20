/**
 * Error handling middleware for Express
 * Ensures all errors are returned as JSON, not HTML
 */

// Middleware to catch unhandled routes and errors
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default to 500 if no status is set
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Always respond with JSON
  res.status(status).json({
    success: false,
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware to handle 404s with JSON response
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    status: 404
  });
};

// Middleware to ensure responses are JSON
const jsonContentType = (req, res, next) => {
  // Set default JSON content type
  res.setHeader('Content-Type', 'application/json');
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  jsonContentType
};
