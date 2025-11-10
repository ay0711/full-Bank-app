/**
 * Error handling middleware utilities
 */

/**
 * Wraps an async route handler and catches any errors
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            // Log error for debugging
            console.error('Error in async handler:', error);
            
            // Handle specific error types
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ message: validationErrors.join(', ') });
            }
            
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Duplicate entry found' });
            }
            
            // Default server error
            res.status(500).json({ message: 'Server error' });
        });
    };
};

/**
 * Middleware to validate that a user exists
 * Assumes authenticateToken has already run and set req.user
 */
const ensureUserExists = async (req, res, next) => {
    if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
    }
    next();
};

module.exports = { asyncHandler, ensureUserExists };
