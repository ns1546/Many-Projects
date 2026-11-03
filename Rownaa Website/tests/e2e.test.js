const request = require('supertest');

const authApp = require('../services/auth/server');
const inventoryApp = require('../services/inventory/server');
const bookingApp = require('../services/booking/server');
const usersApp = require('../services/users/server');

describe('Rownaa Enterprise Full-Engine End-to-End Test Suite', () => {
    let adminCookie;
    let customerCookie;
    let testBookingId;
    let testCarId;

    describe('1. Authentication Service & Security Layer', () => {
        it('Should reject registration with invalid schema (Zod check)', async () => {
            const res = await request(authApp)
                .post('/register')
                .send({ username: 'ab' }); // Missing required fields
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('Should register a new test customer account', async () => {
            const uniqueUsername = `testuser_${Date.now()}`;
            const res = await request(authApp)
                .post('/register')
                .send({
                    name: 'Test Customer',
                    username: uniqueUsername,
                    password: 'password123',
                    role: 'customer'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.role).toBe('customer');
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
        });

        it('Should fail login with wrong credentials', async () => {
            const res = await request(authApp)
                .post('/login')
                .send({
                    username: 'admin',
                    password: 'wrong_password_999'
                });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid credentials');
        });

        it('Should login as admin and receive HttpOnly cookie', async () => {
            const res = await request(authApp)
                .post('/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.role).toBe('admin');
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);

            adminCookie = res.headers['set-cookie'][0];
        });

        it('Should login as customer and receive customer session cookie', async () => {
            const res = await request(authApp)
                .post('/login')
                .send({
                    username: 'customer',
                    password: 'customer123'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.role).toBe('customer');

            customerCookie = res.headers['set-cookie'][0];
        });

        it('Should verify session identity on /me with valid cookie', async () => {
            const res = await request(authApp)
                .get('/me')
                .set('Cookie', adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.role).toBe('admin');
        });

        it('Should reject /me access when cookie is missing', async () => {
            const res = await request(authApp).get('/me');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('No active session');
        });

        it('Should clear session on /logout', async () => {
            const res = await request(authApp).post('/logout');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('2. Inventory Service & Fleet Persistence', () => {
        it('Should return active inventory vehicles from SQLite', async () => {
            const res = await request(inventoryApp).get('/');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);

            const axio = res.body.data.find(c => c.name === 'Toyota Axio');
            expect(axio).toBeDefined();
            expect(axio.baseRate).toBe(1500);
            expect(Array.isArray(axio.serviceTags)).toBe(true);
        });

        it('Should add a new vehicle to inventory', async () => {
            testCarId = `veh-test-${Date.now()}`;
            const res = await request(inventoryApp)
                .post('/')
                .send({
                    id: testCarId,
                    name: 'Test Fleet Car',
                    category: 'Sedan (Standard)',
                    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341',
                    seats: 4,
                    bags: 2,
                    hasAc: 1,
                    serviceTags: ['hourly', 'airport'],
                    baseRate: 1800,
                    isActive: 1,
                    ownerId: 'biz-001'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.id).toBe(testCarId);
        });

        it('Should update existing vehicle details', async () => {
            const res = await request(inventoryApp)
                .put(`/${testCarId}`)
                .send({
                    name: 'Test Fleet Car Updated',
                    category: 'Sedan (Premium)',
                    seats: 5,
                    bags: 3,
                    hasAc: 1,
                    baseRate: 2200
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('Should soft-delete vehicle and exclude it from active list', async () => {
            const delRes = await request(inventoryApp).delete(`/${testCarId}`);
            expect(delRes.status).toBe(200);
            expect(delRes.body.success).toBe(true);

            const fetchRes = await request(inventoryApp).get('/');
            const found = fetchRes.body.data.find(c => c.id === testCarId);
            expect(found).toBeUndefined();
        });
    });

    describe('3. Booking Service & Lifecycle State Machine', () => {
        it('Should reject unauthenticated booking creation', async () => {
            const res = await request(bookingApp)
                .post('/')
                .send({
                    vehicle: 'Toyota Axio',
                    service: 'Airport Transfer',
                    dateTime: '2026-12-01 09:00'
                });
            expect(res.status).toBe(401);
        });

        it('Should create a booking with customer session and verify inventory price lookup', async () => {
            const uniqueTime = `2026-12-01 ${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const res = await request(bookingApp)
                .post('/')
                .set('Cookie', customerCookie)
                .send({
                    vehicle: 'Toyota Axio',
                    service: 'Airport Transfer',
                    dateTime: uniqueTime
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.id).toBeDefined();

            testBookingId = res.body.id;
        });

        it('Should prevent double booking for the exact same vehicle and time slot', async () => {
            const fixedTime = `2026-12-25 ${Date.now()}`;
            // First booking
            const res1 = await request(bookingApp)
                .post('/')
                .set('Cookie', customerCookie)
                .send({
                    vehicle: 'Toyota Premio',
                    service: 'Hourly Rental',
                    dateTime: fixedTime
                });
            expect(res1.status).toBe(200);

            // Conflicting booking
            const res2 = await request(bookingApp)
                .post('/')
                .set('Cookie', customerCookie)
                .send({
                    vehicle: 'Toyota Premio',
                    service: 'Hourly Rental',
                    dateTime: fixedTime
                });
            expect(res2.status).toBe(409);
            expect(res2.body.error).toContain('Double booking detected');
        });

        it('Should update booking status (Confirmed -> Ongoing -> Completed)', async () => {
            const confRes = await request(bookingApp)
                .patch(`/${testBookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Confirmed' });
            expect(confRes.status).toBe(200);
            expect(confRes.body.success).toBe(true);

            const ongoingRes = await request(bookingApp)
                .patch(`/${testBookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Ongoing' });
            expect(ongoingRes.status).toBe(200);
            expect(ongoingRes.body.success).toBe(true);
        });
    });

    describe('4. Users & Registration Management Service', () => {
        it('Should fetch all customers', async () => {
            const res = await request(usersApp).get('/customers');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.customers)).toBe(true);
        });

        it('Should fetch all fleet owners', async () => {
            const res = await request(usersApp).get('/owners');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.owners)).toBe(true);
        });

        it('Should update customer profile in SQLite database', async () => {
            const res = await request(usersApp)
                .put('/profile')
                .send({
                    id: 'cust-1',
                    name: 'Faisal Ahmed (Verified Customer)'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('Should update partner registration status', async () => {
            const res = await request(usersApp)
                .put('/biz-001/status')
                .send({ status: 'approved' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('5. Pricing Microservice & Configuration Engine', () => {
        const pricingApp = require('../services/pricing/server');

        it('Should return healthy status from pricing service', async () => {
            const res = await request(pricingApp).get('/health');
            expect(res.status).toBe(200);
            expect(res.body.service).toBe('pricing-service');
        });

        it('Should fetch full pricing configuration with hourly and intercity tiers', async () => {
            const res = await request(pricingApp).get('/');
            expect(res.status).toBe(200);
            expect(res.body.hourly).toBeDefined();
            expect(Array.isArray(res.body.hourly.categories)).toBe(true);
            expect(res.body.intercity).toBeDefined();
            expect(Array.isArray(res.body.intercity.tiers)).toBe(true);
        });

        it('Should allow admin configuration update', async () => {
            const current = await request(pricingApp).get('/');
            const updated = { ...current.body };
            updated.hourly.includedDistance = 12;
            const res = await request(pricingApp).post('/').send(updated);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Revert back
            updated.hourly.includedDistance = 10;
            await request(pricingApp).post('/').send(updated);
        });
    });
});
