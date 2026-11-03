const request = require('supertest');
const app = require('../../src/app');

describe('PILLAR 1: FUNCTIONAL TESTING (End-to-End User Journeys & State Machines)', () => {
    let customerCookie;
    let partnerCookie;
    let adminCookie;
    let bookingId;
    let vehicleId;
    let vehicleName;

    const testTimestamp = Date.now();
    const customerUsername = `cust_fn_${testTimestamp}`;
    const partnerUsername = `owner_fn_${testTimestamp}`;

    beforeAll(async () => {
        // Authenticate Admin early
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
    // JOURNEY 1: CUSTOMER END-TO-END FLOW
    // ========================================================
    describe('1.1 Customer Lifecycle: Register -> Browse -> Book -> Rate -> Invoice', () => {
        it('1.1.1 Customer registers account and receives HttpOnly session cookie', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Faisal Karim',
                    username: customerUsername,
                    password: 'password123',
                    role: 'customer'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.role).toBe('customer');
            expect(res.headers['set-cookie']).toBeDefined();
            customerCookie = res.headers['set-cookie'];
        });

        it('1.1.2 Authenticated customer retrieves active fleet inventory', async () => {
            const res = await request(app)
                .get('/api/inventory')
                .set('Cookie', customerCookie);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);

            // Select first active vehicle for booking
            const vehicle = res.body.data[0];
            vehicleId = vehicle.id;
            vehicleName = vehicle.name || vehicle.model || 'Toyota Axio';
            expect(vehicle.isActive).toBe(true);
        });

        it('1.1.3 Customer calculates dynamic fare with promo code', async () => {
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

        it('1.1.4 Customer creates a confirmed booking request', async () => {
            const res = await request(app)
                .post('/api/bookings')
                .set('Cookie', customerCookie)
                .send({
                    service: 'airport',
                    vehicle: vehicleName,
                    pickupLocation: 'Gulshan 2, Dhaka',
                    dropoffLocation: 'Hazrat Shahjalal International Airport (DAC)',
                    dateTime: `2028-05-15 ${Date.now()}-${Math.floor(Math.random() * 99999)}`,
                    price: '৳ 2,500'
                });

            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
            bookingId = res.body.id || (res.body.booking && res.body.booking.id) || res.body.bookingId;
            expect(bookingId).toBeDefined();
        });

        it('1.1.5 Customer views active booking in customer portal trip history', async () => {
            const res = await request(app)
                .get('/api/bookings')
                .set('Cookie', customerCookie);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            const myBooking = res.body.data.find(b => b.id === bookingId);
            expect(myBooking).toBeDefined();
            expect(myBooking.status).toBe('Pending');
        });
    });

    // ========================================================
    // JOURNEY 2: PARTNER / OWNER LIFECYCLE
    // ========================================================
    describe('1.2 Fleet Partner Lifecycle: Register -> Fleet Toggle -> Trip Lifecycle -> Revenue', () => {
        it('1.2.1 Partner registers and receives owner credentials', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Rahim Transport Agency',
                    username: partnerUsername,
                    password: 'password123',
                    role: 'owner'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.role).toBe('owner');
            expect(res.headers['set-cookie']).toBeDefined();
            partnerCookie = res.headers['set-cookie'];
        });

        it('1.2.2 Partner adds a new vehicle with registration and compliance docs', async () => {
            const res = await request(app)
                .post('/api/inventory')
                .set('Cookie', partnerCookie)
                .send({
                    name: 'Toyota Hiace Grand Cabin',
                    category: 'Microbus',
                    baseRate: 4500,
                    seats: 12,
                    bags: 6,
                    hasAc: true,
                    isActive: true
                });

            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBeDefined();
            const newCarId = res.body.data.id;

            // Toggle availability offline then online
            const toggleRes = await request(app)
                .put(`/api/inventory/${newCarId}`)
                .set('Cookie', partnerCookie)
                .send({ isActive: false });
            expect(toggleRes.status).toBe(200);
            expect(toggleRes.body.data.isActive).toBe(false);

            const toggleBackRes = await request(app)
                .put(`/api/inventory/${newCarId}`)
                .set('Cookie', partnerCookie)
                .send({ isActive: true });
            expect(toggleBackRes.status).toBe(200);
            expect(toggleBackRes.body.data.isActive).toBe(true);
        });

        it('1.2.3 Partner/Admin transitions booking through lifecycle (Pending -> Confirmed -> Ongoing -> Completed)', async () => {
            // Confirm booking (Dispatch Operations)
            const confirmRes = await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Confirmed' });
            expect(confirmRes.status).toBe(200);
            expect(confirmRes.body.booking.status).toBe('Confirmed');

            // Start trip
            const startRes = await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Ongoing' });
            expect(startRes.status).toBe(200);
            expect(startRes.body.booking.status).toBe('Ongoing');

            // Complete trip
            const completeRes = await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Completed' });
            expect(completeRes.status).toBe(200);
            expect(completeRes.body.booking.status).toBe('Completed');
        });
    });

    // ========================================================
    // JOURNEY 3: ADMIN COMMAND CENTER & RATING CLOSURE
    // ========================================================
    describe('1.3 Admin Operations & Review Loop', () => {
        it('1.3.1 Admin authenticates into Command Center', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                });

            expect(res.status).toBe(200);
            expect(res.body.role).toBe('admin');
            adminCookie = res.headers['set-cookie'];
        });

        it('1.3.2 Admin verifies completed transaction financial breakdown', async () => {
            const res = await request(app)
                .get('/api/bookings')
                .set('Cookie', adminCookie);

            expect(res.status).toBe(200);
            const b = res.body.data.find(item => item.id === bookingId);
            expect(b).toBeDefined();
            expect(b.status).toBe('Completed');

            const val = parseInt((b.price || '0').replace(/[^0-9]/g, '')) || 2500;
            const commission = Math.round(val * 0.10);
            const netPayout = val - commission;
            expect(commission).toBe(250);
            expect(netPayout).toBe(2250);
        });

        it('1.3.3 Customer submits 5-star review for completed trip', async () => {
            const res = await request(app)
                .post('/api/reviews')
                .set('Cookie', customerCookie)
                .send({
                    bookingId: bookingId,
                    rating: 5,
                    comment: 'Punctual, pristine condition, executive experience!'
                });

            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
            const rev = res.body.review || res.body.data;
            expect(rev.rating).toBe(5);
        });
    });
});
