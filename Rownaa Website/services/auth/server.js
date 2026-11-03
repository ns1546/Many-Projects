const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { validate, loginSchema, registerSchema } = require('../../shared/validations');
const db = require('../../database');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Mitigate large payload attacks
app.use(cookieParser());

if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET environment variable is missing.");
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

// Rate Limiter to prevent brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Reasonable threshold for dev and testing
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' }
});

const { randomUUID: uuidv4 } = require('crypto');

app.post('/register', authLimiter, validate(registerSchema), (req, res) => {
    const { username, password, name, role } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (row) return res.status(400).json({ error: 'Username already exists' });
        
        try {
            const hash = await bcrypt.hash(password, 10);
            const id = uuidv4();
            const userRole = role || 'customer';
            
            db.run("INSERT INTO users (id, name, username, password, role) VALUES (?, ?, ?, ?, ?)", 
            [id, name, username, hash, userRole], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to create user' });
                
                const token = jwt.sign({ id, userId: id, role: userRole, name }, JWT_SECRET, { expiresIn: '1d' });
                res.cookie('jwt', token, cookieOptions);
                res.json({ success: true, user: { id, userId: id, role: userRole, name }, role: userRole, name, message: 'Registration secure' });
            });
        } catch (err) {
            console.error("Register Error:", err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.post('/login', authLimiter, validate(loginSchema), (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        try {
            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(400).json({ error: 'Invalid credentials' });

            const token = jwt.sign({ id: user.id, userId: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
            res.cookie('jwt', token, cookieOptions);
            res.json({ success: true, user: { id: user.id, userId: user.id, role: user.role, name: user.name }, role: user.role, name: user.name, message: 'Login secure' });
        } catch (err) {
            console.error("Login Error:", err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.post('/logout', (req, res) => {
    res.clearCookie('jwt', { ...cookieOptions, maxAge: 0 });
    res.json({ success: true, message: 'Logged out securely' });
});

app.get('/me', (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ error: 'No active session' });
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Invalid session' });
    }
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`auth-service running securely on port ${PORT}`));
}

module.exports = app;
