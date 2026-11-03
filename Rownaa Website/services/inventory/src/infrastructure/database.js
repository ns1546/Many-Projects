
const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres-primary',
    user: process.env.POSTGRES_USER || 'rownaa',
    password: process.env.POSTGRES_PASSWORD || 'secure_password',
    database: process.env.POSTGRES_DB || 'rownaa_db',
    max: 20, // Connection pool size
    idleTimeoutMillis: 30000,
});
module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect()
};
