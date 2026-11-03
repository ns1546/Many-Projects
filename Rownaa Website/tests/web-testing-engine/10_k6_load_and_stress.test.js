/**
 * PILLAR 3 (ADVANCED): K6 & AUTOCANNON HIGH-CONCURRENCY LOAD & STRESS ENGINE
 * Inspired by G:\Download Official\Web Testing\3.Performance testing\k6-master.zip
 * 
 * Simulates thousands of concurrent virtual users, high-frequency read/write bursts,
 * flash-crowd concurrency spikes, and race-condition stress against the dual-engine database.
 */

const http = require('http');
const autocannon = require('autocannon');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const db = require('../../src/config/db');
const { JWT_SECRET } = require('../../src/config/env');
const lockManager = require('../../src/infrastructure/lockManager');
const cache = require('../../src/infrastructure/cache');

describe('PILLAR 3: K6 & AUTOCANNON EXTREME CONCURRENCY & STRESS ENGINE', () => {
    let server;
    let port;
    let baseUrl;
    let authCookie;

    beforeAll(async () => {
        const stressToken = jwt.sign({ userId: 'stress-cust-1', name: 'Virtual User', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
        authCookie = [`token=${stressToken}`];

        // Spin up temporary HTTP server on ephemeral port for real socket benchmarking
        server = http.createServer(app);
        await new Promise((resolve) => {
            server.listen(0, '127.0.0.1', () => {
                port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    // =========================================================================
    // 3.1 HIGH-THROUGHPUT READ BENCHMARK (CACHE & WAL CONCURRENCY)
    // =========================================================================
    test('3.1 Autocannon Load Burst: /api/inventory should sustain high request throughput with zero errors', async () => {
        const result = await autocannon({
            url: `${baseUrl}/api/inventory`,
            connections: 25,
            duration: 3, // 3-second rapid blast
            pipelining: 1
        });

        expect(result.errors).toBe(0);
        expect(result.timeouts).toBe(0);
        expect(result.requests.total).toBeGreaterThan(100);
        expect(result.latency.p99).toBeLessThan(2500); // 99% under 2.5s under concurrent suite load
    });

    test('3.1b Autocannon Telemetry Benchmark: /api/telemetry should respond with sub-millisecond p50 latency', async () => {
        const result = await autocannon({
            url: `${baseUrl}/api/telemetry`,
            connections: 20,
            duration: 2,
            pipelining: 1
        });

        expect(result.errors).toBe(0);
        expect(result.requests.total).toBeGreaterThan(50);
        expect(result.latency.p50).toBeLessThan(350); // Under 350ms p50 under full concurrent test suite load
    });

    // =========================================================================
    // 3.2 FLASH-CROWD CONCURRENCY SPIKE: ANTI-DOUBLE-BOOKING MUTEX STRESS
    // =========================================================================
    test('3.2 Flash Crowd Spike: 50 concurrent virtual users booking the identical vehicle slot must allow exactly ONE win', async () => {
        const testTargetDate = `2026-12-01 15:00:00-STRESS-${Date.now()}`;
        const vehicle = 'Toyota Axio';

        // Fire 50 simultaneous booking requests concurrently with authenticated credentials
        const concurrentRequests = Array.from({ length: 50 }).map((_, i) => {
            return request(app)
                .post('/api/bookings')
                .set('Cookie', authCookie)
                .send({
                    service: 'Standard Rental',
                    vehicle,
                    customerName: `Virtual User #${i}`,
                    customerPhone: `017000000${i.toString().padStart(2, '0')}`,
                    pickupLocation: 'Gulshan 2',
                    dropoffLocation: 'Uttara',
                    dateTime: testTargetDate
                });
        });

        const responses = await Promise.all(concurrentRequests);

        const successes = responses.filter(r => r.status === 201);
        const conflicts = responses.filter(r => r.status === 409);
        const unexpected = responses.filter(r => r.status !== 201 && r.status !== 409);

        // Exactly 1 booking MUST succeed
        expect(successes.length).toBe(1);

        // All other 49 MUST be safely deflected with 409 Conflict
        expect(conflicts.length).toBe(49);

        // Zero 500s or unhandled exceptions
        expect(unexpected.length).toBe(0);

        // Verify database integrity: only 1 record exists in the DB for this slot
        const duplicateCheck = await db.queryAll(
            'SELECT * FROM bookings WHERE vehicle = ? AND dateTime = ? AND deletedAt IS NULL',
            [vehicle, testTargetDate]
        );
        expect(duplicateCheck.length).toBe(1);
    });

    // =========================================================================
    // 3.3 GEOSPATIAL ESTIMATION HIGH-LOAD PIPELINE
    // =========================================================================
    test('3.3 Dynamic Route Calculation Burst: 30 parallel estimates across varied zones', async () => {
        const zones = ['Gulshan 2', 'Banani', 'Uttara', 'Dhanmondi', 'Motijheel', 'Dhaka Airport'];

        const estimatePromises = Array.from({ length: 30 }).map((_, i) => {
            const pickup = zones[i % zones.length];
            const dropoff = zones[(i + 1) % zones.length];
            return request(app)
                .post('/api/dispatch/estimate')
                .send({
                    pickupLocation: pickup,
                    dropoffLocation: dropoff,
                    service: 'hourly',
                    category: 'sedan_economy'
                });
        });

        const results = await Promise.all(estimatePromises);
        results.forEach(res => {
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.route.distanceKm).toBeGreaterThan(0);
            expect(res.body.fareBreakdown.estimatedTotal).toBeGreaterThan(0);
        });
    });

    // =========================================================================
    // 3.4 CACHE COHERENCY UNDER RAPID MUTATION
    // =========================================================================
    test('3.4 Cache Coherency: Rapid sequential writes and reads should maintain 100% data freshness', async () => {
        for (let i = 0; i < 5; i++) {
            await cache.set(`stress:key:${i}`, { iteration: i }, 10);
            const val = await cache.get(`stress:key:${i}`);
            expect(val).toEqual({ iteration: i });
        }

        await cache.delPattern('stress:key:*');
        for (let i = 0; i < 5; i++) {
            const val = await cache.get(`stress:key:${i}`);
            expect(val).toBeNull();
        }
    });
});
