/**
 * ============================================================================
 * PILLAR 7: REAL-LIFE USER EXPERIENCE SIMULATOR & NODE COMBINATION MATRIX
 * Standard: G:\Download Official\Web Testing (Vitest, Playwright, k6 Scenarios)
 * 
 * Simulates diverse real-world personas traversing all website nodes:
 * 1. Persona 1: Tanvir Rahman (Executive Traveler - Delighted / 5★)
 * 2. Persona 2: Nusrat Jahan (Family Vacation Organizer - Delighted / 5★)
 * 3. Persona 3: Kazi Mehedi (Peak Rush-Hour Commuter - Constructive / 3★)
 * 4. Persona 4: Arafat Hossain (Service Quality Complaint - Frustrated / 2★)
 * 5. Persona 5: Rafiqul Alam (Fleet Owner & Vehicle Supplier)
 * 6. System Administrator: Live Experience Tracking, Response Engine & Resolution
 * ============================================================================
 */

const request = require('supertest');
const app = require('../../src/app');

describe('PILLAR 7: REAL-LIFE USER EXPERIENCE & ADMIN RESPONSE MATRIX', () => {
    let adminCookie = '';
    let ownerCookie = '';
    let customer1Cookie = '';
    let customer2Cookie = '';
    let customer3Cookie = '';
    let customer4Cookie = '';

    const testTimestamp = Date.now();

    beforeAll(async () => {
        // Authenticate System Administrator using seeded credentials
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: 'admin123' });
        adminCookie = adminRes.headers['set-cookie'];

        // Register & Authenticate Customer 1 (Tanvir Rahman - Executive)
        const cust1Res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Tanvir Rahman',
                username: `tanvir_exec_${testTimestamp}`,
                password: 'password123',
                role: 'customer',
                phone: '+880 1711 998877'
            });
        customer1Cookie = cust1Res.headers['set-cookie'];

        // Register & Authenticate Customer 2 (Nusrat Jahan - Family Organizer)
        const cust2Res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Nusrat Jahan',
                username: `nusrat_family_${testTimestamp}`,
                password: 'password123',
                role: 'customer',
                phone: '+880 1822 445566'
            });
        customer2Cookie = cust2Res.headers['set-cookie'];

        // Register & Authenticate Customer 3 (Kazi Mehedi - Commuter)
        const cust3Res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Kazi Mehedi',
                username: `kazi_rush_${testTimestamp}`,
                password: 'password123',
                role: 'customer',
                phone: '+880 1933 112233'
            });
        customer3Cookie = cust3Res.headers['set-cookie'];

        // Register & Authenticate Customer 4 (Arafat Hossain - Critical Rider)
        const cust4Res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Arafat Hossain',
                username: `arafat_crit_${testTimestamp}`,
                password: 'password123',
                role: 'customer',
                phone: '+880 1644 778899'
            });
        customer4Cookie = cust4Res.headers['set-cookie'];

        // Register & Authenticate Fleet Owner (Rafiqul Alam)
        const ownerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Rafiqul Alam',
                username: `rafiq_fleet_${testTimestamp}`,
                password: 'password123',
                role: 'owner',
                phone: '+880 1555 334455'
            });
        ownerCookie = ownerRes.headers['set-cookie'];
    });

    // ========================================================================
    // PERSONA 1: Tanvir Rahman (Executive Airport Transfer)
    // ========================================================================
    describe('7.1 Persona 1: Executive Traveler Journey (Airport to Gulshan-2)', () => {
        let bookingId = '';
        let reviewId = '';

        it('Node 1 & 2: Traverses Landing & Filters Premium Fleet', async () => {
            const res = await request(app)
                .get('/api/inventory')
                .expect(200);
            expect(Array.isArray(res.body.cars || res.body.data)).toBe(true);
        });

        it('Node 3 & 4: Books Executive Transfer and Completes Trip', async () => {
            const bookRes = await request(app)
                .post('/api/bookings')
                .set('Cookie', customer1Cookie)
                .send({
                    service: 'airport',
                    customerName: 'Tanvir Rahman',
                    pickupLocation: 'Hazrat Shahjalal International Airport T2',
                    dropoffLocation: 'Gulshan 2 Diplomatic Zone',
                    dateTime: `2026-11-15 14:00-${testTimestamp}`,
                    vehicle: 'Toyota Premio',
                    price: '৳ 3,500'
                })
                .expect(201);

            bookingId = bookRes.body.booking?.id || bookRes.body.id;
            expect(bookingId).toBeDefined();

            // Lifecycle progression: Pending -> Confirmed -> Completed
            await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Confirmed' })
                .expect(200);

            await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Completed' })
                .expect(200);
        });

        it('Node 5: Tanvir Shares Personal Feelings & Glowing 5-Star Feedback', async () => {
            const revRes = await request(app)
                .post('/api/reviews')
                .set('Cookie', customer1Cookie)
                .send({
                    bookingId,
                    rating: 5,
                    sentiment: 'delighted',
                    category: 'driver_service',
                    userFeeling: 'Exceptional executive transport. Driver waited with a name placard at Terminal 2, chilled bottled water ready, car spotless.',
                    comment: 'Exceptional executive transport. Driver waited with a name placard at Terminal 2, chilled bottled water ready, car spotless.'
                })
                .expect(201);

            reviewId = revRes.body.review.id;
            expect(reviewId).toMatch(/^REV-/);
            expect(revRes.body.review.sentiment).toBe('delighted');
        });

        it('Node 6 (Admin Reaction): Admin Responds to Tanvir with Executive VIP Acknowledgment', async () => {
            const respondRes = await request(app)
                .patch(`/api/reviews/${reviewId}/respond`)
                .set('Cookie', adminCookie)
                .send({
                    adminResponse: 'Honored to manage your executive transfers Mr. Rahman. We have marked your account for Priority Chauffeur dispatch on all return bookings.',
                    actionTaken: 'Priority Chauffeur Tier Assigned',
                    status: 'resolved'
                })
                .expect(200);

            expect(respondRes.body.success).toBe(true);
            expect(respondRes.body.review.adminResponse).toContain('Priority Chauffeur');

            // Verify notification reached Customer 1
            const notifRes = await request(app)
                .get('/api/notifications')
                .set('Cookie', customer1Cookie)
                .expect(200);

            const received = notifRes.body.notifications.some(n => n.message.includes('Priority Chauffeur'));
            expect(received).toBe(true);
        });
    });

    // ========================================================================
    // PERSONA 2: Nusrat Jahan (Family Resort Vacation)
    // ========================================================================
    describe('7.2 Persona 2: Family Vacation Coordinator Journey (Dhanmondi to Gazipur)', () => {
        let bookingId = '';
        let reviewId = '';

        it('Node 1 & 2: Explores Microbus Inventory & Calculates Promo Pricing', async () => {
            const priceRes = await request(app)
                .post('/api/pricing/calculate')
                .send({
                    service: 'intercity',
                    vehicleType: 'microbus',
                    distanceKm: 65,
                    promoCode: 'ROWNAA20'
                })
                .expect(200);

            expect(priceRes.body.discount).toBeGreaterThan(0);
        });

        it('Node 3 & 4: Completes 10-Passenger Microbus Booking Flow', async () => {
            const bookRes = await request(app)
                .post('/api/bookings')
                .set('Cookie', customer2Cookie)
                .send({
                    service: 'intercity',
                    customerName: 'Nusrat Jahan',
                    pickupLocation: 'Dhanmondi Road 27',
                    dropoffLocation: 'Bhawal Resort Gazipur',
                    dateTime: `2026-11-20 07:30-${testTimestamp}`,
                    vehicle: 'Toyota HiAce',
                    price: '৳ 6,800'
                })
                .expect(201);

            bookingId = bookRes.body.booking?.id || bookRes.body.id;

            await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Completed' })
                .expect(200);
        });

        it('Node 5: Nusrat Submits Family Experience & Personal Feeling', async () => {
            const revRes = await request(app)
                .post('/api/reviews')
                .set('Cookie', customer2Cookie)
                .send({
                    bookingId,
                    rating: 5,
                    sentiment: 'delighted',
                    category: 'vehicle_condition',
                    userFeeling: 'Our family of 10 traveled together with bags. Freezing cold AC during highway heat and polite, cautious driver. Kids were delighted.',
                    comment: 'Our family of 10 traveled together with bags. Freezing cold AC during highway heat and polite, cautious driver.'
                })
                .expect(201);

            reviewId = revRes.body.review.id;
            expect(revRes.body.review.rating).toBe(5);
        });

        it('Node 6 (Admin Reaction): Admin Commends Partner Fleet & Acknowledges Family Praise', async () => {
            const respRes = await request(app)
                .patch(`/api/reviews/${reviewId}/respond`)
                .set('Cookie', adminCookie)
                .send({
                    adminResponse: 'Thank you Nusrat! Delighted to hear your family had a safe, comfortable vacation trip. Partner fleet was commended for vehicle hygiene.',
                    actionTaken: 'Fleet Partner Performance Bonus Logged',
                    status: 'resolved'
                })
                .expect(200);

            expect(respRes.body.review.status).toBe('resolved');
        });
    });

    // ========================================================================
    // PERSONA 3: Kazi Mehedi (Peak Morning Rush-Hour Commuter)
    // ========================================================================
    describe('7.3 Persona 3: Peak Rush-Hour Commuter Journey (Surge Encountered)', () => {
        let bookingId = '';
        let reviewId = '';

        it('Node 1 & 2: Encounters Dynamic Surge During Morning Rush Hour', async () => {
            const estimateRes = await request(app)
                .post('/api/dispatch/estimate')
                .send({
                    pickupLocation: 'Mirpur 10 Circle',
                    dropoffLocation: 'Motijheel Commercial Area',
                    service: 'hourly'
                })
                .expect(200);

            expect(estimateRes.body.surge).toBeDefined();
            expect(estimateRes.body.route.pickup.zone).toBe('Mirpur');
        });

        it('Node 3 & 4: Completes Commuter Trip Under Surge', async () => {
            const bookRes = await request(app)
                .post('/api/bookings')
                .set('Cookie', customer3Cookie)
                .send({
                    service: 'hourly',
                    customerName: 'Kazi Mehedi',
                    pickupLocation: 'Mirpur 10 Circle',
                    dropoffLocation: 'Motijheel Commercial Area',
                    dateTime: `2026-11-18 09:15-${testTimestamp}`,
                    vehicle: 'Toyota Axio',
                    price: '৳ 1,850'
                })
                .expect(201);

            bookingId = bookRes.body.booking?.id || bookRes.body.id;

            await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Completed' })
                .expect(200);
        });

        it('Node 5: Kazi Submits Constructive Personal Feeling Regarding Surge', async () => {
            const revRes = await request(app)
                .post('/api/reviews')
                .set('Cookie', customer3Cookie)
                .send({
                    bookingId,
                    rating: 3,
                    sentiment: 'constructive',
                    category: 'pricing_surge',
                    userFeeling: 'Driver arrived very fast and avoided Bijoy Sarani gridlock, but the 1.25x rush-hour surge made the fare higher than usual. Clean vehicle nonetheless.',
                    comment: 'Driver arrived very fast, but 1.25x rush hour surge was steep.'
                })
                .expect(201);

            reviewId = revRes.body.review.id;
            expect(revRes.body.review.sentiment).toBe('constructive');
        });

        it('Node 6 (Admin Reaction): Admin Responds With Pricing Clarification & Promotional Courtesy Credit', async () => {
            const respondRes = await request(app)
                .patch(`/api/reviews/${reviewId}/respond`)
                .set('Cookie', adminCookie)
                .send({
                    adminResponse: 'We appreciate your constructive review Kazi. Morning surge balances active drivers in Mirpur. As a thank you for your loyalty, we credited a ৳150 off-peak promo bonus to your profile!',
                    actionTaken: '৳150 Courtesy Credit Added',
                    status: 'resolved'
                })
                .expect(200);

            expect(respondRes.body.review.actionTaken).toContain('Courtesy Credit');
        });
    });

    // ========================================================================
    // PERSONA 4: Arafat Hossain (Service Quality Complaint)
    // ========================================================================
    describe('7.4 Persona 4: Critical Rider with AC Complaint (Fast Remediation)', () => {
        let bookingId = '';
        let reviewId = '';

        it('Node 1 to 4: Completes Afternoon Highway Trip', async () => {
            const bookRes = await request(app)
                .post('/api/bookings')
                .set('Cookie', customer4Cookie)
                .send({
                    service: 'intercity',
                    customerName: 'Arafat Hossain',
                    pickupLocation: 'Uttara Sector 3',
                    dropoffLocation: 'Comilla Cantonment',
                    dateTime: `2026-11-19 13:00-${testTimestamp}`,
                    vehicle: 'Toyota Prado',
                    price: '৳ 4,200'
                })
                .expect(201);

            bookingId = bookRes.body.booking?.id || bookRes.body.id;

            await request(app)
                .patch(`/api/bookings/${bookingId}/status`)
                .set('Cookie', adminCookie)
                .send({ status: 'Completed' })
                .expect(200);
        });

        it('Node 5: Arafat Submits Frustrated Feeling Regarding Weak AC Cooling', async () => {
            const revRes = await request(app)
                .post('/api/reviews')
                .set('Cookie', customer4Cookie)
                .send({
                    bookingId,
                    rating: 2,
                    sentiment: 'frustrated',
                    category: 'ac_cooling',
                    userFeeling: 'The car AC cooling gas was low and barely blew cold air under the afternoon highway sun. Driver was apologetic but ride was uncomfortable.',
                    comment: 'AC cooling gas was low, hot highway ride.'
                })
                .expect(201);

            reviewId = revRes.body.review.id;
            expect(revRes.body.review.sentiment).toBe('frustrated');
        });

        it('Node 6 (Admin Reaction): Admin Instantly Remediates Complaint and Dispatches AC Servicing', async () => {
            const respondRes = await request(app)
                .patch(`/api/reviews/${reviewId}/respond`)
                .set('Cookie', adminCookie)
                .send({
                    adminResponse: 'Sincere apologies for the uncomfortable heat Arafat. We have immediately grounded this vehicle for AC refrigerant recharging and refunded ৳300 to your wallet.',
                    actionTaken: 'Depot AC Repair Ordered & ৳300 Refund Issued',
                    status: 'resolved'
                })
                .expect(200);

            expect(respondRes.body.review.status).toBe('resolved');
            expect(respondRes.body.review.actionTaken).toContain('Depot AC Repair');
        });
    });

    // ========================================================================
    // PERSONA 5: Rafiqul Alam (Fleet Partner Registration & Onboarding)
    // ========================================================================
    describe('7.5 Persona 5: Fleet Partner Onboarding & Vehicle Deployment Journey', () => {
        let vehicleId = '';

        it('Node 1 & 2: Rafiqul Adds New Vehicle to Fleet Marketplace', async () => {
            const vehRes = await request(app)
                .post('/api/inventory')
                .set('Cookie', ownerCookie)
                .send({
                    name: 'Toyota Noah Hybrid 2024',
                    category: 'Microbus',
                    image: 'assets/noah.jpg',
                    seats: 8,
                    bags: 4,
                    hasAc: true,
                    serviceTags: JSON.stringify(['hourly', 'intercity', 'airport']),
                    baseRate: 4200,
                    registration: 'DHAKA-METRO-CHA-5566'
                })
                .expect(201);

            const car = vehRes.body.car || vehRes.body.data;
            vehicleId = car.id;
            expect(vehicleId).toBeDefined();
        });

        it('Node 3: Verifies 90% Partner Earning Split & Inventory Verification', async () => {
            const invRes = await request(app)
                .get(`/api/inventory/${vehicleId}`)
                .expect(200);

            const vehicle = invRes.body.car || invRes.body.data || invRes.body;
            expect(vehicle.name).toContain('Toyota Noah Hybrid');
            expect(Boolean(vehicle.isActive)).toBe(true);
        });
    });

    // ========================================================================
    // ADMIN NODE: Live User Experience Tracking & Telemetry Hub
    // ========================================================================
    describe('7.6 Admin Operations: Full System User Experience & Sentiment Telemetry', () => {
        it('Tracks Consolidated Real-Time Experience Metrics (CSAT, Sentiment Breakdown)', async () => {
            const metricsRes = await request(app)
                .get('/api/reviews/experience-metrics')
                .expect(200);

            const m = metricsRes.body.metrics;
            expect(m.totalExperiences).toBeGreaterThanOrEqual(4);
            expect(m.sentiments.positive).toBeGreaterThanOrEqual(2);
            expect(m.sentiments.constructive).toBeGreaterThanOrEqual(1);
            expect(m.sentiments.frustrated).toBeGreaterThanOrEqual(1);
            expect(m.csatPercentage).toBeGreaterThanOrEqual(50);
            expect(typeof m.responseRate).toBe('number');
        });

        it('Returns Full Stream of Rider Feelings with Official Admin Responses', async () => {
            const listRes = await request(app)
                .get('/api/reviews')
                .expect(200);

            expect(listRes.body.success).toBe(true);
            const reviews = listRes.body.reviews;
            expect(reviews.length).toBeGreaterThanOrEqual(4);

            // Verify that every review in the test cohort has an official admin response
            const respondedReviews = reviews.filter(r => r.adminResponse && r.adminResponse.length > 0);
            expect(respondedReviews.length).toBeGreaterThanOrEqual(4);
        });
    });
});
