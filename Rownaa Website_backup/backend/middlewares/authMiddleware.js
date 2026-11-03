const jwt = require('jsonwebtoken');

// FAANG Standard: HttpOnly Cookie Validation (Prevents XSS token theft)
const authenticate = (req, res, next) => {
    try {
        // Read token securely from HttpOnly cookie, NOT from localStorage/Authorization header
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({ error: 'Access Denied: No Token Provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_development_key');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Access Denied: Invalid Token' });
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient Permissions' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
