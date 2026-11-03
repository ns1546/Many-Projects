const db = require('../../config/db');

class DriversRepository {
    async findAll(status) {
        if (status) {
            return await db.queryAll('SELECT * FROM drivers WHERE status = ? ORDER BY createdAt DESC', [status]);
        }
        return await db.queryAll('SELECT * FROM drivers ORDER BY createdAt DESC', []);
    }

    async findById(id) {
        return await db.queryOne('SELECT * FROM drivers WHERE id = ?', [id]);
    }

    async findByPhone(phone) {
        return await db.queryOne('SELECT * FROM drivers WHERE phone = ?', [phone]);
    }

    async create({ id, name, phone, licenseNumber, nidNumber, vehicleAssigned, status = 'available', rating = 5.0, totalTrips = 0, createdAt }) {
        await db.execute(
            `INSERT INTO drivers (id, name, phone, licenseNumber, nidNumber, vehicleAssigned, status, rating, totalTrips, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, phone, licenseNumber, nidNumber, vehicleAssigned, status, rating, totalTrips, createdAt]
        );
        return await this.findById(id);
    }

    async updateStatus(id, status) {
        await db.execute('UPDATE drivers SET status = ? WHERE id = ?', [status, id]);
        return await this.findById(id);
    }

    async incrementTrips(id) {
        await db.execute('UPDATE drivers SET totalTrips = totalTrips + 1 WHERE id = ?', [id]);
        return await this.findById(id);
    }
}

module.exports = new DriversRepository();
