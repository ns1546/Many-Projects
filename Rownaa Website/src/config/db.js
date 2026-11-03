// ============================================================================
// ROWNAA ENTERPRISE DUAL-ENGINE DATABASE ROUTER (Uber / Pathao Scale)
// Supports High-Concurrency PostgreSQL Connection Pool with PostGIS
// with automatic fallback to optimized SQLite3 WAL Mode
// ============================================================================

const sqliteDb = require('../../database');

let pgPool = null;
let currentEngine = 'sqlite';

// Helper to translate '?' placeholders to '$1, $2, ...' for PostgreSQL
function translateSqlPlaceholders(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
}

// Check if PostgreSQL is configured via environment variables
const isPostgresConfigured = Boolean(
    process.env.DB_ENGINE === 'postgres' ||
    process.env.DATABASE_URL ||
    process.env.PG_HOST ||
    process.env.POSTGRES_HOST
);

if (isPostgresConfigured) {
    try {
        const { Pool } = require('pg');
        const poolConfig = process.env.DATABASE_URL
            ? { connectionString: process.env.DATABASE_URL }
            : {
                host: process.env.PG_HOST || process.env.POSTGRES_HOST || '127.0.0.1',
                port: parseInt(process.env.PG_PORT || process.env.POSTGRES_PORT || '5432', 10),
                user: process.env.PG_USER || process.env.POSTGRES_USER || 'rownaa',
                password: process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD || 'secure_password',
                database: process.env.PG_DATABASE || process.env.POSTGRES_DB || 'rownaa_db',
                max: parseInt(process.env.PG_POOL_SIZE || '25', 10),
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
            };

        pgPool = new Pool(poolConfig);
        currentEngine = 'postgres';

        pgPool.on('error', (err) => {
            console.error('[Enterprise-DB] PostgreSQL unexpected idle client error:', err.message);
        });

        console.log(`[Enterprise-DB] Initialized PostgreSQL connection pool (Max: ${poolConfig.max || 25} clients)`);
    } catch (err) {
        console.warn('[Enterprise-DB] Failed to load pg driver, falling back to SQLite WAL mode:', err.message);
        pgPool = null;
        currentEngine = 'sqlite';
    }
}

// Enterprise Router Object
const dbRouter = {
    getEngineName() {
        return currentEngine === 'postgres' ? 'PostgreSQL' : 'SQLite3-WAL';
    },

    getPoolStats() {
        if (currentEngine === 'postgres' && pgPool) {
            return {
                engine: 'PostgreSQL',
                isConnected: true,
                totalCount: pgPool.totalCount,
                idleCount: pgPool.idleCount,
                waitingCount: pgPool.waitingCount,
                max: pgPool.options?.max || 25
            };
        }
        const base = sqliteDb.getPoolStats ? sqliteDb.getPoolStats() : {};
        return {
            engine: 'SQLite-WAL',
            journalMode: 'WAL',
            busyTimeoutMs: 10000,
            isConnected: true,
            ...base
        };
    },

    async queryOne(sql, params = []) {
        if (currentEngine === 'postgres' && pgPool) {
            const pgSql = translateSqlPlaceholders(sql);
            const res = await pgPool.query(pgSql, params);
            return res.rows[0] || null;
        }
        return await sqliteDb.queryOne(sql, params);
    },

    async queryAll(sql, params = []) {
        if (currentEngine === 'postgres' && pgPool) {
            const pgSql = translateSqlPlaceholders(sql);
            const res = await pgPool.query(pgSql, params);
            return res.rows || [];
        }
        return await sqliteDb.queryAll(sql, params);
    },

    async execute(sql, params = []) {
        if (currentEngine === 'postgres' && pgPool) {
            const pgSql = translateSqlPlaceholders(sql);
            const res = await pgPool.query(pgSql, params);
            return {
                lastID: res.rows[0]?.id || null,
                changes: res.rowCount || 0
            };
        }
        return await sqliteDb.execute(sql, params);
    },

    async transaction(callback) {
        if (currentEngine === 'postgres' && pgPool) {
            const client = await pgPool.connect();
            try {
                await client.query('BEGIN');
                const txExecutor = {
                    queryOne: async (s, p = []) => {
                        const r = await client.query(translateSqlPlaceholders(s), p);
                        return r.rows[0] || null;
                    },
                    queryAll: async (s, p = []) => {
                        const r = await client.query(translateSqlPlaceholders(s), p);
                        return r.rows || [];
                    },
                    execute: async (s, p = []) => {
                        const r = await client.query(translateSqlPlaceholders(s), p);
                        return { lastID: r.rows[0]?.id || null, changes: r.rowCount || 0 };
                    }
                };
                const result = await callback(txExecutor);
                await client.query('COMMIT');
                return result;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }
        return await sqliteDb.transaction(callback);
    },

    // Legacy backwards compatibility proxies for sqlite methods
    run: (...args) => sqliteDb.run(...args),
    get: (...args) => sqliteDb.get(...args),
    all: (...args) => sqliteDb.all(...args),
    serialize: (...args) => sqliteDb.serialize(...args)
};

module.exports = dbRouter;
