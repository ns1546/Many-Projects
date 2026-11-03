
const Redis = require('ioredis'); // Enterprise Redis Client
const redis = new Redis({
    host: process.env.REDIS_HOST || 'redis-cache',
    port: 6379,
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    }
});
module.exports = redis;
