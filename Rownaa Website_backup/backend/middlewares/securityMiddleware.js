const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting to prevent DDoS and Brute Force attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true, 
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register requests per hour
    message: { error: 'Too many authentication attempts, please try again later' },
    standardHeaders: true, 
    legacyHeaders: false,
});

// Production CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? ['https://www.rownaa.com'] : '*', // Restrict in production
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

const setupSecurity = (app) => {
    // Set Security HTTP Headers (prevents XSS, Clickjacking, Sniffing)
    app.use(helmet());
    
    // Cross-Origin Resource Sharing
    app.use(cors(corsOptions));
    
    // Apply general API rate limiting to all /api/ routes
    app.use('/api/', apiLimiter);
    
    // Apply strict rate limiting to auth routes
    app.use('/api/register', authLimiter);
    app.use('/api/login', authLimiter);
};

module.exports = { setupSecurity };
