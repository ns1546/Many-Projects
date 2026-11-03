const db = require('../../config/db');

class AuthRepository {
    async findByUsername(username) {
        return await db.queryOne('SELECT * FROM users WHERE username = ?', [username]);
    }

    async findById(id) {
        return await db.queryOne('SELECT id, name, username, role, status, phone, createdAt FROM users WHERE id = ?', [id]);
    }

    async create({ id, name, username, password, role, status, phone, createdAt }) {
        await db.execute(
            `INSERT INTO users (id, name, username, password, role, status, phone, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, username, password, role, status, phone || null, createdAt]
        );
        return this.findById(id);
    }
}

module.exports = new AuthRepository();
