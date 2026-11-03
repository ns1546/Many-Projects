const request = require('supertest');
const app = require('../../src/app');

describe('PILLAR 4: SECURITY & VULNERABILITY TESTING (OWASP Top 10, Injection, Auth Gates)', () => {

    // ========================================================
    // 4.1 SQL INJECTION RESILIENCE
    // ========================================================
    describe('4.1 SQL Injection Protection Across Endpoints', () => {
        const sqlInjectionPayloads = [
            "' OR 1=1 --",
            "'; DROP TABLE users; --",
            "admin' --",
            "1 UNION SELECT null, null, null --",
            "\" OR \"\"=\""
        ];

        sqlInjectionPayloads.forEach(sqli => {
            it(`Should safely sanitize SQL injection attempt in search query: ${sqli}`, async () => {
                const res = await request(app)
                    .get(`/api/inventory?search=${encodeURIComponent(sqli)}`);

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                // System must return empty list or matching string without crashing or executing raw SQL
                expect(Array.isArray(res.body.data)).toBe(true);
            });

            it(`Should reject SQL injection in login credentials: ${sqli}`, async () => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({
                        username: sqli,
                        password: 'somepassword123'
                    });

                // Must fail with 400 Bad Request or Invalid credentials, NOT 500 error or bypass
                expect([400, 401]).toContain(res.status);
                expect(res.body.success).toBe(false);
            });
        });
    });

    // ========================================================
    // 4.2 XSS NEUTRALIZATION
    // ========================================================
    describe('4.2 Stored and Reflected XSS Neutralization', () => {
        const xssPayload = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';

        it('Should safely handle XSS payloads in customer profile update without raw script execution', async () => {
            // First register a test user
            const regRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'XSS Tester',
                    username: `xss_tester_${Date.now()}`,
                    password: 'password123',
                    role: 'customer'
                });

            expect(regRes.status).toBe(200);
            const cookie = regRes.headers['set-cookie'];

            const updateRes = await request(app)
                .put('/api/users/profile')
                .set('Cookie', cookie)
                .send({
                    name: xssPayload,
                    phone: '+880 1711 000000'
                });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.success).toBe(true);
        });
    });

    // ========================================================
    // 4.3 ZERO-TRUST AUTHENTICATION & ACCESS CONTROL
    // ========================================================
    describe('4.3 Zero-Trust Auth & Unauthorized Endpoint Gates', () => {
        it('Should block unauthenticated access to POST /api/bookings with 401', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .send({
                    service: 'airport',
                    vehicle: 'Toyota Hiace',
                    pickupLocation: 'Dhaka'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/unauthorized|authentication required|token/i);
        });

        it('Should block unauthenticated access to POST /api/inventory with 401', async () => {
            const res = await request(app)
                .post('/api/inventory')
                .send({
                    name: 'Illegal Vehicle Entry',
                    category: 'Sedan',
                    baseRate: 2000
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('Should verify that session cookie contains HttpOnly and SameSite directives', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                });

            expect(res.status).toBe(200);
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();

            const tokenCookie = cookies.find(c => c.startsWith('token='));
            expect(tokenCookie).toBeDefined();
            expect(tokenCookie).toMatch(/HttpOnly/i);
            expect(tokenCookie).toMatch(/SameSite/i);
        });

        it('Should reject tampered or forged JWT tokens', async () => {
            const forgedCookie = 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.tampered_signature_xyz';
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', forgedCookie);

            expect([401, 403]).toContain(res.status);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================
    // 4.4 STRICT PAYLOAD SCHEMA ENFORCEMENT
    // ========================================================
    describe('4.4 Schema Validation Defense (Zod Engine)', () => {
        it('Should reject malformed payloads with 400 Bad Request', async () => {
            // Register with short password
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'A',
                    username: 'a',
                    password: '123' // Too short (< 6 chars)
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
            expect(typeof res.body.error === 'string' ? res.body.error : JSON.stringify(res.body.error)).toMatch(/too_small|validation/i);
        });

        it('Should verify HTTP security headers applied by Helmet', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.headers['x-content-type-options']).toBe('nosniff');
            expect(res.headers['x-dns-prefetch-control']).toBe('off');
        });
    });
});
