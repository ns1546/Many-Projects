const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { AppError } = require('./errorHandler');

const authGuard = (req, res, next) => {
    let token = null;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Unauthorized: Authentication session required.', 401));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError('Unauthorized: Invalid or expired token.', 401));
    }
};

const optionalAuth = (req, res, next) => {
    let token = null;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (err) {
            req.user = null;
        }
    }
    next();
};

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Unauthorized: Please log in.', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError(`Forbidden: Access requires ${roles.join(' or ')} privileges.`, 403));
        }
        next();
    };
};

module.exports = {
    authGuard,
    optionalAuth,
    requireRole
};
