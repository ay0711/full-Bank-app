const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Only fetch _id to verify user exists, routes can fetch full user if needed
        const user = await User.findById(decoded.userId).select('_id');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = { _id: user._id };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { authenticateToken };
