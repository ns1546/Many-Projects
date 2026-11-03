const db = require('../../config/db');

class BookingsRepository {
    async findAll({ limit = 50, offset = 0, status, customerId, ownerId, includeDeleted = false }) {
        let sql = 'SELECT * FROM bookings WHERE 1=1';
        const params = [];

        if (!includeDeleted) {
            sql += ' AND deletedAt IS NULL';
        }
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (customerId) {
            sql += ' AND customerId = ?';
            params.push(customerId);
        }
        if (ownerId) {
            sql += ' AND ownerId = ?';
            params.push(ownerId);
        }

        sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return await db.queryAll(sql, params);
    }

    async count({ status, customerId, ownerId, includeDeleted = false }) {
        let sql = 'SELECT COUNT(*) as count FROM bookings WHERE 1=1';
        const params = [];

        if (!includeDeleted) {
            sql += ' AND deletedAt IS NULL';
        }
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (customerId) {
            sql += ' AND customerId = ?';
            params.push(customerId);
        }
        if (ownerId) {
            sql += ' AND ownerId = ?';
            params.push(ownerId);
        }

        const row = await db.queryOne(sql, params);
        return row ? row.count : 0;
    }

    async findById(id) {
        return await db.queryOne('SELECT * FROM bookings WHERE id = ?', [id]);
    }

    async findConflictingBooking(vehicle, dateTime) {
        return await db.queryOne(
            `SELECT * FROM bookings 
             WHERE (vehicle = ? OR service LIKE ?) 
               AND dateTime = ? 
               AND status NOT IN ('Cancelled', 'Completed') 
               AND deletedAt IS NULL`,
            [vehicle, `%${vehicle}%`, dateTime]
        );
    }

    async create(booking) {
        await db.execute(
            `INSERT INTO bookings (
                id, service, customerName, customerId, ownerId, price, status, 
                dateTime, vehicle, pickupLocation, dropoffLocation, customerPhone, createdAt,
                pickupLat, pickupLng, dropoffLat, dropoffLng, distanceKm, estimatedMinutes, surgeMultiplier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                booking.id,
                booking.service,
                booking.customerName,
                booking.customerId,
                booking.ownerId,
                booking.price,
                booking.status,
                booking.dateTime,
                booking.vehicle,
                booking.pickupLocation || '',
                booking.dropoffLocation || '',
                booking.customerPhone || '',
                booking.createdAt,
                booking.pickupLat !== undefined ? booking.pickupLat : null,
                booking.pickupLng !== undefined ? booking.pickupLng : null,
                booking.dropoffLat !== undefined ? booking.dropoffLat : null,
                booking.dropoffLng !== undefined ? booking.dropoffLng : null,
                booking.distanceKm !== undefined ? booking.distanceKm : null,
                booking.estimatedMinutes !== undefined ? booking.estimatedMinutes : null,
                booking.surgeMultiplier !== undefined ? booking.surgeMultiplier : 1.0
            ]
        );
        return this.findById(booking.id);
    }

    async updateStatus(id, updateData) {
        if (typeof updateData === 'string') {
            await db.execute('UPDATE bookings SET status = ? WHERE id = ?', [updateData, id]);
        } else if (typeof updateData === 'object' && updateData !== null) {
            const { status, vehicle, driverName, driverPhone } = updateData;
            const fields = [];
            const values = [];
            if (status) { fields.push('status = ?'); values.push(status); }
            if (vehicle) { fields.push('vehicle = ?'); values.push(vehicle); }
            if (driverName) { fields.push('driverName = ?'); values.push(driverName); }
            if (driverPhone) { fields.push('driverPhone = ?'); values.push(driverPhone); }
            if (fields.length > 0) {
                values.push(id);
                await db.execute(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, values);
            }
        }
        return this.findById(id);
    }

    async softDelete(id) {
        await db.execute('UPDATE bookings SET deletedAt = ? WHERE id = ?', [new Date().toISOString(), id]);
        return true;
    }

    async restore(id) {
        await db.execute('UPDATE bookings SET deletedAt = NULL WHERE id = ?', [id]);
        return this.findById(id);
    }
}

module.exports = new BookingsRepository();
