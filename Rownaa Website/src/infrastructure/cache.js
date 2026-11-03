// ============================================================================
// ROWNAA ENTERPRISE CACHE ENGINE (Uber / Pathao Scale)
// Two-Tier Caching: Distributed Redis (L2) with automatic In-Memory TTL (L1) fallback
// Eliminates database bottlenecks on read-heavy pricing, fleet, and session checks
// ============================================================================

let redisClient = null;
let isRedisReady = false;

// L1 In-Memory High-Speed Store
const memoryStore = new Map();
let cacheStats = { hits: 0, misses: 0, sets: 0, purges: 0 };

// Auto-cleanup timer for expired in-memory keys
const cacheCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, item] of memoryStore.entries()) {
        if (item.expiresAt && item.expiresAt <= now) {
            memoryStore.delete(key);
            cacheStats.purges++;
        }
    }
}, 30000);
if (cacheCleanupTimer.unref) cacheCleanupTimer.unref();

// Initialize Redis if configured
const redisHost = process.env.REDIS_HOST;
const redisUrl = process.env.REDIS_URL;

if (redisUrl || redisHost) {
    try {
        const Redis = require('ioredis');
        redisClient = redisUrl
            ? new Redis(redisUrl, { retryStrategy: (t) => Math.min(t * 100, 3000), maxRetriesPerRequest: 2 })
            : new Redis({
                host: redisHost || '127.0.0.1',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD || undefined,
                retryStrategy: (t) => Math.min(t * 100, 3000),
                maxRetriesPerRequest: 2
            });

        redisClient.on('connect', () => {
            isRedisReady = true;
            console.log('[Enterprise-Cache] Connected to Redis Distributed Cluster');
        });

        redisClient.on('error', (err) => {
            isRedisReady = false;
            // Silent error on dev without redis server, transparent memory fallback
        });
    } catch (e) {
        isRedisReady = false;
    }
}

class EnterpriseCache {
    getMode() {
        return isRedisReady ? 'Redis-Distributed-L2' : 'InMemory-TTL-L1';
    }

    getStats() {
        const total = cacheStats.hits + cacheStats.misses;
        const totalOperations = cacheStats.hits + cacheStats.misses + cacheStats.sets;
        const hitRatio = total > 0 ? ((cacheStats.hits / total) * 100).toFixed(1) + '%' : '100.0%';
        return {
            mode: this.getMode(),
            backend: isRedisReady ? 'redis' : 'memory-lru',
            keysCount: isRedisReady ? 'Distributed' : memoryStore.size,
            hits: cacheStats.hits,
            misses: cacheStats.misses,
            hitRatio: hitRatio,
            sets: cacheStats.sets,
            totalOperations: Math.max(1, totalOperations)
        };
    }

    async get(key) {
        if (isRedisReady && redisClient) {
            try {
                const val = await redisClient.get(key);
                if (val !== null) {
                    cacheStats.hits++;
                    return JSON.parse(val);
                }
                cacheStats.misses++;
                return null;
            } catch (err) {
                // Fail-safe fallback to memory
            }
        }

        const item = memoryStore.get(key);
        if (!item) {
            cacheStats.misses++;
            return null;
        }

        if (item.expiresAt && item.expiresAt <= Date.now()) {
            memoryStore.delete(key);
            cacheStats.misses++;
            return null;
        }

        cacheStats.hits++;
        return item.value;
    }

    async set(key, value, ttlSeconds = 300) {
        cacheStats.sets++;
        if (isRedisReady && redisClient) {
            try {
                await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
                return true;
            } catch (err) {
                // Fail-safe fallback to memory
            }
        }

        const expiresAt = ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null;
        memoryStore.set(key, { value, expiresAt });
        return true;
    }

    async del(key) {
        if (isRedisReady && redisClient) {
            try {
                await redisClient.del(key);
            } catch (err) {}
        }
        memoryStore.delete(key);
        return true;
    }

    async delPattern(patternPrefix) {
        const cleanPrefix = patternPrefix.endsWith('*') ? patternPrefix.slice(0, -1) : patternPrefix;

        if (isRedisReady && redisClient) {
            try {
                const keys = await redisClient.keys(`${cleanPrefix}*`);
                if (keys.length > 0) {
                    await redisClient.del(...keys);
                }
            } catch (err) {}
        }

        for (const k of memoryStore.keys()) {
            if (k.startsWith(cleanPrefix)) {
                memoryStore.delete(k);
            }
        }
        return true;
    }

    async getOrSet(key, resolverFn, ttlSeconds = 300) {
        const cached = await this.get(key);
        if (cached !== null && cached !== undefined) {
            return cached;
        }

        const freshData = await resolverFn();
        if (freshData !== null && freshData !== undefined) {
            await this.set(key, freshData, ttlSeconds);
        }
        return freshData;
    }

    async flush() {
        memoryStore.clear();
        if (isRedisReady && redisClient) {
            try {
                await redisClient.flushdb();
            } catch (err) {}
        }
        return true;
    }
}

module.exports = new EnterpriseCache();
