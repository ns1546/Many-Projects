/**
 * PILLAR 6: ENTERPRISE UBER / PATHAO SCALE VERIFICATION SUITE
 * 
 * Tests the enterprise capabilities added for ride-hailing/fleet scale:
 * 1. Dual-Engine DB Router & WAL Concurrency
 * 2. Two-Tier Distributed Cache & Hit/Miss Telemetry
 * 3. Atomic Concurrency Mutex & Double-Booking Protection
 * 4. Great-Circle Geospatial Haversine & Zone ETA Dispatching
 * 5. Dynamic Surge Multiplier & Rush-Hour Traffic Engine
 * 6. Asynchronous Event Bus & Real-time Telemetry Endpoints
 */

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');
const cache = require('../../src/infrastructure/cache');
const lockManager = require('../../src/infrastructure/lockManager');
const geospatial = require('../../src/infrastructure/geospatial');
const surgeEngine = require('../../src/modules/pricing/surge.engine');
const eventBus = require('../../src/infrastructure/eventBus');

describe('PILLAR 6: ENTERPRISE UBER / PATHAO SCALE ENGINE', () => {

    // =========================================================================
    // 6.1 DUAL-ENGINE DATABASE ROUTER & HIGH CONCURRENCY WAL MODE
    // =========================================================================
    describe('6.1 Dual-Engine Database Router & Concurrency Pragmas', () => {
        test('Should verify database pool stats and active engine connection', () => {
            const stats = db.getPoolStats();
            expect(stats).toBeDefined();
            expect(stats.isConnected).toBe(true);
            expect(['PostgreSQL', 'SQLite-WAL']).toContain(stats.engine);
        });

        test('Should execute atomic transaction callback successfully', async () => {
            const result = await db.transaction(async () => {
                const countRow = await db.queryOne('SELECT COUNT(*) as cnt FROM inventory WHERE deletedAt IS NULL');
                return parseInt(countRow.cnt);
            });
            expect(result).toBeGreaterThan(0);
        });

        test('Should verify WAL mode and high-concurrency pragmas enabled on SQLite', async () => {
            if (db.engine === 'sqlite') {
                const journalMode = await db.queryOne('PRAGMA journal_mode;');
                expect(journalMode.journal_mode.toLowerCase()).toBe('wal');

                const busyTimeout = await db.queryOne('PRAGMA busy_timeout;');
                expect(parseInt(busyTimeout.timeout)).toBeGreaterThanOrEqual(5000);
            }
        });
    });

    // =========================================================================
    // 6.2 TWO-TIER DISTRIBUTED CACHE ENGINE
    // =========================================================================
    describe('6.2 Distributed Two-Tier Caching & LRU Invalidation', () => {
        beforeEach(async () => {
            await cache.delPattern('test:*');
        });

        test('Should set, get, and invalidate cache values accurately', async () => {
            await cache.set('test:key1', { fleetId: 'veh-99', status: 'available' }, 10);
            const cached = await cache.get('test:key1');
            expect(cached).toEqual({ fleetId: 'veh-99', status: 'available' });

            await cache.del('test:key1');
            const afterDel = await cache.get('test:key1');
            expect(afterDel).toBeNull();
        });

        test('Should resolve and cache via getOrSet without redundant DB hits', async () => {
            let hitCount = 0;
            const resolver = async () => {
                hitCount++;
                return { computed: 'val' };
            };

            const first = await cache.getOrSet('test:resolver', resolver, 10);
            const second = await cache.getOrSet('test:resolver', resolver, 10);

            expect(first).toEqual({ computed: 'val' });
            expect(second).toEqual({ computed: 'val' });
            expect(hitCount).toBe(1); // Only executed once!
        });

        test('Should perform pattern-based invalidation across cache keys', async () => {
            await cache.set('test:fleet:1', 'car1');
            await cache.set('test:fleet:2', 'car2');
            await cache.set('test:other', 'other');

            await cache.delPattern('test:fleet:*');

            expect(await cache.get('test:fleet:1')).toBeNull();
            expect(await cache.get('test:fleet:2')).toBeNull();
            expect(await cache.get('test:other')).toBe('other');
        });

        test('Should track hit ratio and operation telemetry metrics', () => {
            const stats = cache.getStats();
            expect(stats).toBeDefined();
            expect(stats.totalOperations).toBeGreaterThan(0);
            expect(typeof stats.hitRatio).toBe('string');
        });
    });

    // =========================================================================
    // 6.3 ATOMIC CONCURRENCY MUTEX & DOUBLE-BOOKING SHIELD
    // =========================================================================
    describe('6.3 Atomic Mutex Lock Manager (Race Condition Prevention)', () => {
        test('Should acquire and release resource lock sequentially', async () => {
            const lock = await lockManager.acquire('res:test-1', 5);
            expect(lock.acquired).toBe(true);
            expect(typeof lock.token).toBe('string');

            const released = await lock.release();
            expect(released).toBe(true);
        });

        test('Should reject concurrent lock attempt on the same resource with 409 conflict', async () => {
            const resource = `vehicle:premio:${Date.now()}`;

            // Acquire lock on thread 1
            const lock1 = await lockManager.acquire(resource, 5);
            expect(lock1.acquired).toBe(true);

            // Attempt lock on thread 2 before thread 1 releases
            await expect(
                lockManager.withLock(resource, async () => 'success')
            ).rejects.toThrow(/Resource is currently locked/);

            // Thread 1 releases
            await lock1.release();

            // Thread 2 can now acquire successfully
            const result = await lockManager.withLock(resource, async () => 'acquired_now');
            expect(result).toBe('acquired_now');
        });

        test('Should track active lock metrics in LockManager', () => {
            const stats = lockManager.getStats();
            expect(stats).toBeDefined();
            expect(typeof stats.activeLocks).toBe('number');
            expect(typeof stats.totalTracked).toBe('number');
        });
    });

    // =========================================================================
    // 6.4 GEOSPATIAL HAVERSINE & DISPATCH ETA ENGINE
    // =========================================================================
    describe('6.4 Geospatial Haversine & Fleet Dispatching', () => {
        test('Should calculate accurate spherical distance between Gulshan 2 and Airport', () => {
            const gulshan = geospatial.GEO_ZONES['Gulshan 2'];
            const airport = geospatial.GEO_ZONES['Dhaka Airport'];

            const distance = geospatial.haversineDistance(gulshan.lat, gulshan.lng, airport.lat, airport.lng);
            // Gulshan 2 to Hazrat Shahjalal Airport spherical geodesic is ~5.66 km (driving ~8.5 km)
            expect(distance).toBeGreaterThan(5.0);
            expect(distance).toBeLessThan(10.0);
        });

        test('Should compute realistic traffic-adjusted ETA', () => {
            const distanceKm = 10;
            const airportEta = geospatial.estimateDrivingETA(distanceKm, 'Dhaka Airport');
            const motijheelEta = geospatial.estimateDrivingETA(distanceKm, 'Motijheel');

            // Congested commercial zone (Motijheel) should have higher ETA than airport bypass
            expect(motijheelEta).toBeGreaterThan(airportEta);
        });

        test('Should fuzzy-resolve locations into coordinates and zones', () => {
            const resolved = geospatial.resolveLocation('Terminal 1, Hazrat Shahjalal Airport Dhaka');
            expect(resolved.zone).toBe('Dhaka Airport');
            expect(resolved.lat).toBeCloseTo(23.8433, 1);
            expect(resolved.lng).toBeCloseTo(90.4048, 1);
        });

        test('Should rank nearby fleet vehicles by radial proximity', () => {
            const mockFleet = [
                { id: 'car-far', name: 'Far Car', lat: 23.7000, lng: 90.3500 }, // Old Dhaka
                { id: 'car-near', name: 'Near Car', lat: 23.7920, lng: 90.4075 }, // Right next to Gulshan 2
            ];

            const pickup = geospatial.GEO_ZONES['Gulshan 2'];
            const ranked = geospatial.findNearbyFleet(pickup.lat, pickup.lng, mockFleet, 5, 20);

            expect(ranked.length).toBe(2);
            expect(ranked[0].id).toBe('car-near');
            expect(ranked[0].distanceKm).toBeLessThan(ranked[1].distanceKm);
        });
    });

    // =========================================================================
    // 6.5 DYNAMIC SURGE PRICING ENGINE
    // =========================================================================
    describe('6.5 Dynamic Surge Pricing Engine (Uber/Pathao Algorithm)', () => {
        test('Should apply rush hour surge multiplier during morning and evening peaks', () => {
            // Test 8:30 AM morning commute peak
            const morningPeakDate = '2026-11-03 08:30:00';
            const morningSurge = surgeEngine.calculateSurge('Gulshan 2', morningPeakDate);
            expect(morningSurge.multiplier).toBeGreaterThanOrEqual(1.2);
            expect(morningSurge.isSurgeActive).toBe(true);

            // Test 6:00 PM evening rush peak
            const eveningPeakDate = '2026-11-03 18:00:00';
            const eveningSurge = surgeEngine.calculateSurge('Banani', eveningPeakDate);
            expect(eveningSurge.multiplier).toBeGreaterThanOrEqual(1.2);
            expect(eveningSurge.isSurgeActive).toBe(true);
        });

        test('Should evaluate high demand-to-supply ratio into elevated surge', () => {
            // 20 requests competing for only 2 available vehicles in the zone
            const surge = surgeEngine.calculateSurge('Dhanmondi', '2026-11-03 14:00:00', {
                activeRequestsInZone: 20,
                availableFleetInZone: 2
            });

            expect(surge.multiplier).toBeGreaterThanOrEqual(1.8);
            expect(surge.demandSupplyRatio).toBe(10);
            expect(surge.isSurgeActive).toBe(true);
        });
    });

    // =========================================================================
    // 6.6 ASYNCHRONOUS EVENT BUS & ENTERPRISE TELEMETRY API
    // =========================================================================
    describe('6.6 Asynchronous EventBus & Telemetry REST Endpoints', () => {
        test('Should publish and subscribe to domain events with error isolation', async () => {
            let receivedEvent = null;
            eventBus.once('test:domain_event', (envelope) => {
                receivedEvent = envelope;
            });

            await eventBus.publish('test:domain_event', { payloadKey: 'domainValue' });

            // Allow setImmediate turn to process
            await new Promise(r => setTimeout(r, 20));

            expect(receivedEvent).toBeDefined();
            expect(receivedEvent.event).toBe('test:domain_event');
            expect(receivedEvent.payload.payloadKey).toBe('domainValue');
        });

        test('GET /api/telemetry should return complete Uber/Pathao health & vitals', async () => {
            const res = await request(app).get('/api/telemetry');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.status).toBe('HEALTHY');
            expect(res.body.database).toBeDefined();
            expect(res.body.caching).toBeDefined();
            expect(res.body.concurrency).toBeDefined();
            expect(res.body.eventBus).toBeDefined();
            expect(res.body.geospatial).toBeDefined();
            expect(res.body.system).toBeDefined();
        });

        test('POST /api/dispatch/nearby should return closest fleet vehicles to pickup', async () => {
            const res = await request(app)
                .post('/api/dispatch/nearby')
                .send({
                    pickupLocation: 'Gulshan 2, Dhaka',
                    limit: 5,
                    maxRadiusKm: 30
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.pickup.zone).toBe('Gulshan 2');
            expect(Array.isArray(res.body.fleet)).toBe(true);
            expect(res.body.fleet.length).toBeGreaterThan(0);
            expect(res.body.fleet[0]).toHaveProperty('distanceKm');
            expect(res.body.fleet[0]).toHaveProperty('estimatedMinutes');
        });

        test('POST /api/dispatch/estimate should generate complete quote with surge and route ETA', async () => {
            const res = await request(app)
                .post('/api/dispatch/estimate')
                .send({
                    pickupLocation: 'Gulshan 2',
                    dropoffLocation: 'Hazrat Shahjalal International Airport',
                    service: 'airport',
                    category: 'sedan_economy'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.route.distanceKm).toBeGreaterThan(5);
            expect(res.body.route.estimatedMinutes).toBeGreaterThan(10);
            expect(res.body.surge).toBeDefined();
            expect(res.body.fareBreakdown).toBeDefined();
            expect(res.body.fareBreakdown.estimatedTotal).toBeGreaterThan(0);
        });
    });
});
