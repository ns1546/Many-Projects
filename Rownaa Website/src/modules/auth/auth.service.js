const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const authRepo = require('./auth.repository');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');
const { AppError } = require('../../middlewares/errorHandler');

class AuthService {
    async register({ name, username, password, role = 'customer', phone }) {
        const existing = await authRepo.findByUsername(username);
        if (existing) {
            throw new AppError('A user with this username already exists.', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = role === 'owner' ? `biz-${randomUUID().slice(0, 8)}` : `cust-${randomUUID().slice(0, 8)}`;
        const status = role === 'owner' ? 'pending' : 'approved';
        const createdAt = new Date().toISOString();

        const user = await authRepo.create({
            id,
            name,
            username,
            password: hashedPassword,
            role,
            status,
            phone,
            createdAt
        });

        const token = this.generateToken(user);
        return { user, token };
    }

    async login({ username, password }) {
        const user = await authRepo.findByUsername(username);
        if (!user) {
            throw new AppError('Invalid credentials', 400);
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new AppError('Invalid credentials', 400);
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            status: user.status
        };

        const token = this.generateToken(safeUser);
        return { user: safeUser, token };
    }

    async getProfile(userId) {
        const user = await authRepo.findById(userId);
        if (!user) {
            throw new AppError('User profile not found', 404);
        }
        return user;
    }

    generateToken(user) {
        return jwt.sign(
            { userId: user.id, username: user.username, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }
}

module.exports = new AuthService();
