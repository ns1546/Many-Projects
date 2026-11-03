const { randomUUID } = require('crypto');
const driversRepo = require('./drivers.repository');
const db = require('../../config/db');
const eventBus = require('../../infrastructure/eventBus');
const { AppError } = require('../../middlewares/errorHandler');

class DriversService {
    constructor() {
        this.io = null;
    }

    setSocketIO(io) {
        this.io = io;
    }

    async getAllDrivers(status) {
        return await driversRepo.findAll(status);
    }

    async getDriverById(id) {
        const driver = await driversRepo.findById(id);
        if (!driver) {
            throw new AppError('Driver not found', 404);
        }
        return driver;
    }

    async registerDriver(driverData) {
        const { name, phone, licenseNumber, nidNumber, vehicleAssigned, rating = 5.0, status = 'available' } = driverData;

        if (!name || !name.trim()) {
            throw new AppError('Driver name is required', 400);
        }
        if (!phone || !phone.trim()) {
            throw new AppError('Driver phone number is required', 400);
        }

        const existing = await driversRepo.findByPhone(phone.trim());
        if (existing) {
            throw new AppError(`Driver with phone ${phone} is already registered`, 409);
        }

        const id = `drv-${randomUUID().slice(0, 8)}`;
        const createdAt = new Date().toISOString();

        const created = await driversRepo.create({
            id,
            name: name.trim(),
            phone: phone.trim(),
            licenseNumber: licenseNumber ? licenseNumber.trim().toUpperCase() : `DL-DH-${Math.floor(10000 + Math.random() * 90000)}`,
            nidNumber: nidNumber ? nidNumber.trim() : null,
            vehicleAssigned: vehicleAssigned ? vehicleAssigned.trim() : null,
            status,
            rating: parseFloat(rating) || 5.0,
            totalTrips: 0,
            createdAt
        });

        try {
            const username = `driver_${phone.replace(/\D/g, '').slice(-8) || randomUUID().slice(0, 6)}`;
            const existingUser = await db.queryOne('SELECT id FROM users WHERE username = ?', [username]);
            if (!existingUser) {
                await db.execute(
                    `INSERT INTO users (id, name, username, password, role, status, phone, createdAt)
                     VALUES (?, ?, ?, ?, 'driver', 'active', ?, ?)`,
                    [id, name.trim(), username, 'driver_default_pass', phone.trim(), createdAt]
                );
            }
        } catch (e) {
            console.warn('[DriversService] Driver user sync warning:', e.message);
        }

        await eventBus.publish('driver:registered', created, {
            room: 'admin',
            broadcastWs: true
        });

        if (this.io) {
            this.io.emit('driver_registered', created);
        }

        return created;
    }

    async updateStatus(id, status) {
        const validStatuses = ['available', 'on_trip', 'offline', 'suspended'];
        if (!validStatuses.includes(status)) {
            throw new AppError(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`, 400);
        }
        const updated = await driversRepo.updateStatus(id, status);
        if (!updated) {
            throw new AppError('Driver not found', 404);
        }

        if (this.io) {
            this.io.emit('driver_status_updated', updated);
        }

        return updated;
    }
}

module.exports = new DriversService();
