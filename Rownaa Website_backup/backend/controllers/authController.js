const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_development_key';

// Cookie options for FAANG-level security
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

exports.register = async (req, res) => {
    try {
        const { username, password, name, role } = req.body;
        
        // Prisma protects against SQL Injection automatically
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) return res.status(400).json({ error: 'Username already exists' });
        
        const hash = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.create({
            data: {
                username,
                password: hash,
                name,
                role: role || 'customer'
            }
        });
        
        const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        
        // Issue Secure HttpOnly Cookie
        res.cookie('jwt', token, cookieOptions);
        res.json({ success: true, role: user.role, name: user.name, message: 'Registration secure' });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });
        
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        
        // Issue Secure HttpOnly Cookie
        res.cookie('jwt', token, cookieOptions);
        res.json({ success: true, role: user.role, name: user.name, message: 'Login secure' });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('jwt', { ...cookieOptions, maxAge: 0 });
    res.json({ success: true, message: 'Logged out securely' });
};

exports.me = (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) return res.status(401).json({ error: 'No active session' });
        
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (err) {
        res.status(401).json({ error: 'Invalid session' });
    }
};
