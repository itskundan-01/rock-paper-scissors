// middleware/auth.js

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from the Authorization header
    const token = req.headers['authorization'];
    
    // Check if token exists
    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded; // Store decoded token in request for access in routes
        next(); // Continue to the next middleware or route
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};
