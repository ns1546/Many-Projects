const request = require('supertest');
const app = require('../src/app');

describe('Unified Enterprise Backend Core Test Suite', () => {
    let customerCookie;
    let adminCookie;
    let testBookingId;
    let testCarId;

    describe('1. Unified System Health', () => {
        it('GET /api/health should return ok and uptime', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.engine).toBe('Rownaa Enterprise Full-Stack Core');
        });
    });

    describe('2. Unified Auth & Zero-Trust Sessions', () => {
        const testUsername = `user_${Date.now()}`;

        it('POST /api/auth/register should create user and set HttpOnly cookie', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Enterprise Customer',
                    username: testUsername,
                    password: 'password123',
                    role: 'customer'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
        });

        it('POST /api/auth/login with admin credentials should return admin session', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.role).toBe('admin');
            adminCookie = res.headers['set-cookie'];
        });

        it('POST /api/login (compatibility alias) should work for customer', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    username: 'customer',
                    password: 'customer123'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.role).toBe('customer');
            customerCookie = res.headers['set-cookie'];
        });

        it('GET /api/auth/me should return logged-in session user profile', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', customerCookie);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.role).toBe('customer');
        });

        it('POST /api/auth/logout should clear session cookie', async () => {
            const res = await request(app).post('/api/auth/logout');
            expect(res.status).toBe(200);
            expect(res.headers['set-cookie'][0]).toMatch(/token=;/);
        });
    });

    describe('3. Unified Inventory / Fleet Module', () => {
        it('GET /api/inventory should list active fleet cars', async () => {
            const res = await request(app).get('/api/inventory');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('POST /api/inventory should allow adding a verified vehicle', async () => {
            const res = await request(app)
                .post('/api/inventory')
                .set('Cookie', adminCookie)
                .send({
                    name: 'Toyota Crown Royal',
                    category: 'Sedan (Premium)',
                    baseRate: 4000,
                    seats: 4,
                    hasAc: true,
                    ownerId: 'biz-001'
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.car.name).toBe('Toyota Crown Royal');
            testCarId = res.body.car.id;
        });

        it('PUT /api/inventory/:id should update vehicle status in SQLite', async () => {
            const res = await request(app)
                .put(`/api/inventory/${testCarId}`)
                .set('Cookie', adminCookie)
                .send({
                    isActive: false
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.car.isActive).toBe(false);
        });
    });

    describe('4. Unified Bookings Module', () => {
        const uniqueTime = `2026-12-15 ${Date.now().toString().slice(-4)}`;

        it('POST /api/bookings should reject unauthenticated booking creation', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .send({
                    vehicle: 'Toyota Axio',
                    service: 'Airport Transfer'
                });
            expect(res.status).toBe(401);
        });

        it('POST /api/bookings should create booking and verify inventory pricing', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .set('Cookie', customerCookie)
                .send({
                    vehicle: 'Toyota Axio',
                    service: 'Airport Transfer',
                    dateTime: uniqueTime,
                    pickupLocation: 'Gulshan 2',
                    dropoffLocation: 'Airport'
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.booking.vehicle).toBe('Toyota Axio');
            testBookingId = res.body.id;
        });

        it('POST /api/bookings should prevent double-booking for the exact vehicle and time', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .set('Cookie', customerCookie)
                .send({
                    vehicle: 'Toyota Axio',
                    service: 'Airport Transfer',
                    dateTime: uniqueTime
                });
            expect(res.status).toBe(409);
            expect(res.body.error).toMatch(/Double booking detected/i);
        });

        it('PATCH /api/bookings/:id/status should update lifecycle state (Confirmed -> Completed)', async () => {
            const confirmRes = await request(app)
                .patch(`/api/bookings/${testBookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Confirmed' });
            expect(confirmRes.status).toBe(200);
            expect(confirmRes.body.booking.status).toBe('Confirmed');

            const completeRes = await request(app)
                .patch(`/api/bookings/${testBookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Completed' });
            expect(completeRes.status).toBe(200);
            expect(completeRes.body.booking.status).toBe('Completed');
        });
    });

    describe('5. Unified Pricing Module', () => {
        it('GET /api/pricing should retrieve master configuration', async () => {
            const res = await request(app).get('/api/pricing');
            expect(res.status).toBe(200);
            expect(res.body.hourly).toBeDefined();
            expect(res.body.intercity).toBeDefined();
        });

        it('POST /api/pricing/calculate should dynamically compute fare with promo code & VAT', async () => {
            const res = await request(app)
                .post('/api/pricing/calculate')
                .send({
                    service: 'hourly',
                    category: 'sedan_economy',
                    distance: 15,
                    is10Hour: false,
                    extraHours: 1,
                    promoCode: 'ROWNAA20'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.baseFare).toBe(1600); // Aligned with Rownaa Complete Pricing Specification (Sedan Economy 4h = 1600 Tk)
            expect(res.body.discount).toBeGreaterThan(0);
            expect(res.body.vat).toBeGreaterThan(0);
            expect(res.body.netPayable).toBeDefined();
        });
    });

    describe('6. Unified Users & Partner Management', () => {
        it('GET /api/users/customers should return registered customers', async () => {
            const res = await request(app).get('/api/users/customers');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.customers)).toBe(true);
        });

        it('GET /api/users/owners should return fleet partners', async () => {
            const res = await request(app).get('/api/users/owners');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.owners)).toBe(true);
        });

        it('PUT /api/users/profile should update user details in SQLite', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Cookie', customerCookie)
                .send({
                    name: 'Faisal Ahmed (Verified Pro)'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user.name).toBe('Faisal Ahmed (Verified Pro)');
        });
    });

    describe('7. Unified Notifications & Trip Reviews', () => {
        it('GET /api/notifications should return user notification history', async () => {
            const res = await request(app)
                .get('/api/notifications?userId=cust-1')
                .set('Cookie', customerCookie);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.notifications)).toBe(true);
        });

        it('POST /api/reviews should store trip feedback and rating in SQLite', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .set('Cookie', customerCookie)
                .send({
                    bookingId: testBookingId,
                    rating: 5,
                    comment: 'Exceptional luxury ride. Very professional driver.'
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.review.rating).toBe(5);
        });

        it('GET /api/reviews should return all customer reviews', async () => {
            const res = await request(app).get('/api/reviews');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.reviews.length).toBeGreaterThan(0);
        });
    });
});
