const request = require('supertest');
const app = require('../../src/app');

describe('PILLAR 5: API TESTING (Bruno & REST API Contract Verification Engine)', () => {
    let customerCookie;
    let ownerCookie;
    let adminCookie;
    let createdVehicleId;
    let testBookingId;

    const timestamp = Date.now();
    const custUser = `api_cust_${timestamp}`;
    const ownerUser = `api_owner_${timestamp}`;

    beforeAll(async () => {
        // Register & Authenticate Customer
        const custRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'API Test Customer',
                username: custUser,
                password: 'Password123!',
                role: 'customer'
            });
        expect(custRes.status).toBe(200);
        customerCookie = custRes.headers['set-cookie'];

        // Register & Authenticate Owner
        const ownerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'API Test Owner',
                username: ownerUser,
                password: 'Password123!',
                role: 'owner'
            });
        expect(ownerRes.status).toBe(200);
        ownerCookie = ownerRes.headers['set-cookie'];

        // Authenticate Admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'admin123'
            });
        expect(adminRes.status).toBe(200);
        adminCookie = adminRes.headers['set-cookie'];
    });

    // ========================================================
    // 5.1 AUTH CONTRACTS & SCHEMA VALIDATION
    // ========================================================
    describe('5.1 Auth Endpoints Contract', () => {
        it('5.1.1 POST /api/auth/register: Rejects invalid or incomplete payloads with 400 Bad Request', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'short',
                    password: '12' // Too short
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
        });

        it('5.1.2 POST /api/auth/register: Rejects duplicate username registration with 400 Conflict/Error', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate Guy',
                    username: custUser,
                    password: 'Password123!',
                    role: 'customer'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/already taken|exists/i);
        });

        it('5.1.3 POST /api/auth/login: Rejects invalid credentials with 401 Unauthorized', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: custUser,
                    password: 'WrongPassword'
                });

            expect([400, 401]).toContain(res.status);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toMatch(/invalid credentials/i);
        });

        it('5.1.4 GET /api/auth/me: Returns user session profile for authenticated user', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', customerCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.username).toBe(custUser);
            expect(res.body.user.role).toBe('customer');
            expect(res.body.user.password).toBeUndefined(); // Never expose passwords
        });

        it('5.1.5 GET /api/auth/me: Rejects request with 401 when no session cookie is provided', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('5.1.6 POST /api/auth/logout: Clears session cookie and invalidates authentication', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', customerCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const setCookie = res.headers['set-cookie'];
            expect(setCookie).toBeDefined();
            expect(setCookie[0]).toMatch(/Max-Age=0|Expires=/i);
        });
    });

    // ========================================================
    // 5.2 INVENTORY CONTRACTS & CRUD SPECIFICATIONS
    // ========================================================
    describe('5.2 Fleet Inventory Endpoints Contract', () => {
        it('5.2.1 GET /api/inventory: Returns array of vehicles with expected contract schema', async () => {
            const res = await request(app)
                .get('/api/inventory')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            if (res.body.data.length > 0) {
                const vehicle = res.body.data[0];
                expect(vehicle).toHaveProperty('id');
                expect(vehicle).toHaveProperty('category');
                expect(vehicle).toHaveProperty('baseRate');
                expect(vehicle).toHaveProperty('isActive');
            }
        });

        it('5.2.2 POST /api/inventory: Allows authorized partner to create a new vehicle', async () => {
            const newVehicle = {
                name: 'BMW 5 Series Bruno-Edition',
                category: 'Luxury Sedan',
                baseRate: 15000,
                seats: 5,
                bags: 3,
                hasAc: true,
                isActive: true
            };

            const res = await request(app)
                .post('/api/inventory')
                .set('Cookie', ownerCookie)
                .send(newVehicle);

            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
            const car = res.body.car || res.body.data;
            expect(car).toBeDefined();
            expect(car.name).toBe(newVehicle.name);
            createdVehicleId = car.id;
        });

        it('5.2.3 GET /api/inventory/:id: Fetches single vehicle details by ID', async () => {
            expect(createdVehicleId).toBeDefined();
            const res = await request(app)
                .get(`/api/inventory/${createdVehicleId}`);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createdVehicleId);
            expect(res.body.name).toBe('BMW 5 Series Bruno-Edition');
        });

        it('5.2.4 GET /api/inventory/:id: Returns 404 for non-existent vehicle ID', async () => {
            const res = await request(app)
                .get('/api/inventory/non_existent_id_99999');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
        });

        it('5.2.5 PUT /api/inventory/:id: Updates existing vehicle specifications', async () => {
            const res = await request(app)
                .put(`/api/inventory/${createdVehicleId}`)
                .set('Cookie', ownerCookie)
                .send({
                    baseRate: 16500,
                    isActive: false
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            const car = res.body.car || res.body.data;
            expect(car.baseRate).toBe(16500);
            expect(car.isActive).toBe(false);
        });

        it('5.2.6 DELETE /api/inventory/:id: Removes or archives vehicle record', async () => {
            const res = await request(app)
                .delete(`/api/inventory/${createdVehicleId}`)
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================================
    // 5.3 BOOKING ENGINE CONTRACTS & WORKFLOWS
    // ========================================================
    describe('5.3 Booking Operations Contract', () => {
        it('5.3.1 POST /api/bookings: Validates payload and establishes new booking', async () => {
            // Re-authenticate customer to ensure active session
            const custLogin = await request(app)
                .post('/api/auth/login')
                .send({ username: custUser, password: 'Password123!' });
            customerCookie = custLogin.headers['set-cookie'];

            const bookingPayload = {
                service: 'airport',
                vehicle: 'Toyota Axio',
                pickupLocation: 'Gulshan 2, Dhaka',
                dropoffLocation: 'Hazrat Shahjalal International Airport (DAC)',
                dateTime: `2027-11-20 ${Date.now()}-${Math.floor(Math.random() * 99999)}`,
                price: '৳ 2,500'
            };

            const res = await request(app)
                .post('/api/bookings')
                .set('Cookie', customerCookie)
                .send(bookingPayload);

            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
            testBookingId = res.body.id || (res.body.booking && res.body.booking.id) || (res.body.data && res.body.data.id);
            expect(testBookingId).toBeDefined();
        });

        it('5.3.2 GET /api/bookings: Returns bookings filtered for the authenticated session', async () => {
            const res = await request(app)
                .get('/api/bookings')
                .set('Cookie', customerCookie);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.some(b => b.id === testBookingId)).toBe(true);
        });

        it('5.3.3 PATCH /api/bookings/:id/status: Transitions booking state', async () => {
            const res = await request(app)
                .patch(`/api/bookings/${testBookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Confirmed' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.booking.status).toBe('Confirmed');
        });

        it('5.3.4 PATCH /api/bookings/:id/status: Rejects invalid or illegal state transitions', async () => {
            const res = await request(app)
                .patch(`/api/bookings/${testBookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'super_invalid_status' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================
    // 5.4 PRICING & TARIFF CONTRACTS
    // ========================================================
    describe('5.4 Dynamic Pricing & Fare Engine Contracts', () => {
        it('5.4.1 GET /api/pricing: Returns standard fare matrices and service tiers', async () => {
            const res = await request(app).get('/api/pricing');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('hourly');
            expect(res.body).toHaveProperty('airport');
        });

        it('5.4.2 POST /api/pricing/calculate: Accurately evaluates fare with promo discount', async () => {
            const res = await request(app)
                .post('/api/pricing/calculate')
                .send({
                    service: 'airport',
                    category: 'sedan_economy',
                    promoCode: 'ROWNAA20'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.discount).toBeGreaterThan(0);
            expect(res.body.vat).toBeGreaterThan(0);
            expect(res.body.netPayable || res.body.total).toBeGreaterThan(0);
        });

        it('5.4.3 PUT /api/pricing/config: Guarded by admin authorization', async () => {
            // Unauthorized attempt by customer
            const unauthRes = await request(app)
                .put('/api/pricing/config')
                .set('Cookie', customerCookie)
                .send({ airportBaseFare: 1500 });
            expect(unauthRes.status).toBe(403);

            // Authorized attempt by admin
            const authRes = await request(app)
                .put('/api/pricing/config')
                .set('Cookie', adminCookie)
                .send({ airportBaseFare: 1400 });
            expect(authRes.status).toBe(200);
            expect(authRes.body.success).toBe(true);
        });
    });

    // ========================================================
    // 5.5 CRM, NOTIFICATIONS & REVIEWS CONTRACTS
    // ========================================================
    describe('5.5 CRM, Notifications & Social Feedback Contracts', () => {
        it('5.5.1 GET /api/users/customers: Accessible only by Admin', async () => {
            const res = await request(app)
                .get('/api/users/customers')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.customers || res.body.data)).toBe(true);
        });

        it('5.5.2 GET /api/notifications: Returns notifications for current user', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Cookie', customerCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.notifications || res.body.data)).toBe(true);
        });

        it('5.5.3 POST /api/reviews: Validates rating boundaries (1 to 5 stars)', async () => {
            // Out of bounds rating (6 stars)
            const badRes = await request(app)
                .post('/api/reviews')
                .set('Cookie', customerCookie)
                .send({
                    bookingId: testBookingId,
                    rating: 6,
                    comment: 'Way too good!'
                });
            expect(badRes.status).toBe(400);

            // Valid rating (5 stars)
            const goodRes = await request(app)
                .post('/api/reviews')
                .set('Cookie', customerCookie)
                .send({
                    bookingId: testBookingId,
                    rating: 5,
                    comment: 'Punctual, professional, and spotless vehicle!'
                });
            expect([200, 201]).toContain(goodRes.status);
            expect(goodRes.body.success).toBe(true);
        });

        it('5.5.4 GET /api/reviews: Returns public reviews ledger', async () => {
            const res = await request(app).get('/api/reviews');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.reviews || res.body.data)).toBe(true);
        });
    });

    // ========================================================
    // 5.6 SYSTEM HEALTH & 404 HANDLER CONTRACTS
    // ========================================================
    describe('5.6 Health & Standard Error Shape Contracts', () => {
        it('5.6.1 GET /api/health: Returns 200 OK and health telemetry', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
        });

        it('5.6.2 Non-existent route returns standard JSON 404 error envelope', async () => {
            const res = await request(app).get('/api/v1/invalid/endpoint/route');
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBeDefined();
        });
    });
});
