const db = require('../../config/db');

class UsersRepository {
    async findCustomers() {
        return await db.queryAll("SELECT id, name, username, phone, status, createdAt FROM users WHERE role = 'customer' ORDER BY name ASC");
    }

    async findOwners() {
        return await db.queryAll("SELECT id, name, username, phone, status, createdAt FROM users WHERE role = 'owner' ORDER BY name ASC");
    }

    async findRegistrations() {
        return await db.queryAll("SELECT id, name, username, phone, status, createdAt FROM users WHERE role = 'owner' ORDER BY createdAt DESC");
    }

    async findById(id) {
        return await db.queryOne("SELECT id, name, username, role, phone, status, createdAt FROM users WHERE id = ?", [id]);
    }

    async updateProfile(id, { name, phone }) {
        await db.execute("UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?", [name, phone, id]);
        return this.findById(id);
    }

    async updateStatus(id, status) {
        await db.execute("UPDATE users SET status = ? WHERE id = ?", [status, id]);
        return this.findById(id);
    }
}

module.exports = new UsersRepository();
