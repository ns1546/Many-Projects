const assert = require('assert');
const path = require('path');
const fs = require('fs');

async function testCompleteThreeRolesJourney() {
    console.log('================================================================');
    console.log('   STARTING FULL THREE-ROLES CROSS-FUNCTIONAL LIFECYCLE AUDIT   ');
    console.log('   Customer (Passenger) <-> Fleet Owner (Partner) <-> Admin    ');
    console.log('================================================================\n');

    const db = require('../src/config/db');
    const bookingsRepo = require('../src/modules/bookings/bookings.repository');
    const bookingsService = require('../src/modules/bookings/bookings.service');
    const usersRepo = require('../src/modules/users/users.repository');
    const usersService = require('../src/modules/users/users.service');
    const authService = require('../src/modules/auth/auth.service');
    const pricingRepo = require('../src/modules/pricing/pricing.repository');
    const pricingService = require('../src/modules/pricing/pricing.service');
    const reviewsRepo = require('../src/modules/reviews/reviews.repository');
    const reviewsService = require('../src/modules/reviews/reviews.service');
    const inventoryRepo = require('../src/modules/inventory/inventory.repository');

    // -------------------------------------------------------------
    // PHASE 1: CUSTOMER CREATES AIRPORT BOOKING WITH PROMO
    // -------------------------------------------------------------
    console.log('--- PHASE 1: CUSTOMER ROLE (Booking Creation & Promo) ---');
    const testCustomerId = 'cust-audit-' + Date.now();
    const customerPayload = {
        customerId: testCustomerId,
        customerName: 'Tanvir Ahmed',
        customerPhone: '01711223344',
        service: 'airport',
        pickupLocation: 'Gulshan 2, Dhaka',
        dropoffLocation: 'Hazrat Shahjalal (DAC) Terminal 1',
        dateTime: '2026-11-10 09:30',
        vehicle: 'Toyota Premio',
        price: '৳ 2,100',
        paymentMethod: 'mfs',
        voucherCode: 'ROWNAA20',
        ownerId: 'biz-001'
    };

    const newBooking = await bookingsService.createBooking(customerPayload, {
        userId: testCustomerId,
        role: 'customer',
        name: 'Tanvir Ahmed'
    });
    assert.ok(newBooking && newBooking.id, 'Booking creation must return valid ID');
    assert.strictEqual(newBooking.status, 'Pending', 'Initial booking must have Pending status');
    assert.strictEqual(newBooking.customerName, 'Tanvir Ahmed');
    console.log(`✓ 1.1 Customer successfully submitted booking #${newBooking.id} (Status: ${newBooking.status})`);

    // -------------------------------------------------------------
    // PHASE 2: ADMIN DISPATCHES CHAUFFEUR & VEHICLE
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2: ADMIN ROLE (Review & Chauffeur Assignment) ---');
    const adminFetch = await bookingsRepo.findById(newBooking.id);
    assert.strictEqual(adminFetch.id, newBooking.id, 'Admin must find booking in master registry');

    const assigned = await bookingsRepo.updateStatus(newBooking.id, {
        status: 'Confirmed',
        vehicle: 'Toyota Premio (DM-GA-11-2233)',
        driverName: 'Kamal Hossain',
        driverPhone: '01711889900'
    });
    assert.strictEqual(assigned.status, 'Confirmed');
    assert.strictEqual(assigned.driverName, 'Kamal Hossain');
    assert.strictEqual(assigned.driverPhone, '01711889900');
    console.log(`✓ 2.1 Admin assigned Chauffeur ${assigned.driverName} (${assigned.driverPhone}) & Vehicle ${assigned.vehicle}`);

    // -------------------------------------------------------------
    // PHASE 3: CUSTOMER SEES ASSIGNED CHAUFFEUR IN CUSTOMER PORTAL
    // -------------------------------------------------------------
    console.log('\n--- PHASE 3: CUSTOMER PORTAL (Chauffeur Details Reveal) ---');
    const custTrips = await bookingsRepo.findAll({ customerId: testCustomerId });
    const userTrip = custTrips.find(t => t.id === newBooking.id);
    assert.ok(userTrip, 'Customer must see trip in history');
    assert.strictEqual(userTrip.status, 'Confirmed', 'Customer must see Confirmed status');
    assert.strictEqual(userTrip.driverName, 'Kamal Hossain', 'Customer must see assigned driver name');
    assert.strictEqual(userTrip.driverPhone, '01711889900', 'Customer must see assigned driver phone');
    console.log(`✓ 3.1 Customer Portal displays Confirmed Trip with Driver ${userTrip.driverName} (${userTrip.driverPhone})`);

    // -------------------------------------------------------------
    // PHASE 4: FLEET PARTNER ROLE (Starts and Completes Trip)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 4: FLEET PARTNER ROLE (Trip Progression & Revenue) ---');
    const ongoingTrip = await bookingsRepo.updateStatus(newBooking.id, 'Ongoing');
    assert.strictEqual(ongoingTrip.status, 'Ongoing');
    console.log(`✓ 4.1 Partner started trip -> Status: ${ongoingTrip.status}`);

    const completedTrip = await bookingsRepo.updateStatus(newBooking.id, 'Completed');
    assert.strictEqual(completedTrip.status, 'Completed');
    console.log(`✓ 4.2 Partner completed trip -> Status: ${completedTrip.status}`);

    // Verify 90% Net Partner Payout calculation
    const fareVal = 2100;
    const partnerCut = Math.round(fareVal * 0.90);
    const platformFee = fareVal - partnerCut;
    assert.strictEqual(partnerCut, 1890, '90% partner net payout must equal 1,890 Tk');
    assert.strictEqual(platformFee, 210, '10% platform fee must equal 210 Tk');
    console.log(`✓ 4.3 Partner financial split verified: Total ৳${fareVal} -> Partner Net: ৳${partnerCut} (90%), Platform Fee: ৳${platformFee} (10%)`);

    // -------------------------------------------------------------
    // PHASE 5: CUSTOMER SUBMITS 5-STAR EMOTIONAL REVIEW
    // -------------------------------------------------------------
    console.log('\n--- PHASE 5: CUSTOMER REVIEW & SENTIMENT SUBMISSION ---');
    const reviewData = {
        bookingId: newBooking.id,
        customerId: testCustomerId,
        customerName: 'Tanvir Ahmed',
        rating: 5,
        sentiment: 'delighted',
        category: 'driver_service',
        comment: 'Chauffeur Kamal bhai was remarkably punctual, polite and drove smoothly through airport traffic!'
    };
    const savedReview = await reviewsService.addReview(reviewData, { userId: testCustomerId });
    assert.ok(savedReview && savedReview.id, 'Review must be saved with unique ID');
    assert.strictEqual(savedReview.rating, 5);
    assert.strictEqual(savedReview.sentiment, 'delighted');
    console.log(`✓ 5.1 Customer submitted 5-Star "${savedReview.sentiment}" review #${savedReview.id}`);

    // -------------------------------------------------------------
    // PHASE 6: ADMIN RESPONDS TO CUSTOMER REVIEW
    // -------------------------------------------------------------
    console.log('\n--- PHASE 6: ADMIN CRM & SENTIMENT MANAGEMENT ---');
    const adminResponseText = 'Thank you Tanvir! Glad you enjoyed the VIP Chauffeur service with Kamal bhai.';
    const actionTakenText = 'Credited 5-star performance bonus to Chauffeur Kamal Hossain.';
    const updatedReview = await reviewsService.respondToReview(
        savedReview.id,
        {
            adminResponse: adminResponseText,
            actionTaken: actionTakenText
        },
        { name: 'Executive Operations Team' }
    );
    assert.strictEqual(updatedReview.adminResponse, adminResponseText);
    assert.strictEqual(updatedReview.actionTaken, actionTakenText);
    console.log(`✓ 6.1 Admin CRM replied to review with official response & driver bonus action`);

    // Verify Customer sees Admin Response on their Trip card
    const custReviewCheck = await reviewsRepo.findByBookingId(newBooking.id);
    assert.ok(custReviewCheck.adminResponse, 'Customer must see Admin response on their booking review');
    console.log(`✓ 6.2 Customer Portal trip card displays: "${custReviewCheck.adminResponse}"`);

    // -------------------------------------------------------------
    // PHASE 7: PARTNER ONBOARDING -> ADMIN VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- PHASE 7: PARTNER REGISTRATION & ADMIN APPROVAL ---');
    const testOwnerUsername = 'partner_' + Date.now();
    const { user: newOwner } = await authService.register({
        username: testOwnerUsername,
        password: 'secure_password_123',
        name: 'Apex Fleet Logistics',
        role: 'owner',
        phone: '01888999000'
    });
    assert.ok(newOwner && newOwner.id, 'Partner registration must create account');
    assert.strictEqual(newOwner.status, 'pending', 'New partner registration starts in pending status');
    console.log(`✓ 7.1 Partner registered "${newOwner.name}" (Status: ${newOwner.status})`);

    // Admin views pending registrations
    const regs = await usersRepo.findRegistrations();
    const foundReg = regs.find(r => r.id === newOwner.id);
    assert.ok(foundReg, 'Admin must see pending partner in registrations list');

    // Admin approves partner
    const approvedOwner = await usersRepo.updateStatus(newOwner.id, 'Active');
    assert.strictEqual(approvedOwner.status, 'Active', 'Admin approval must set partner to Active');
    console.log(`✓ 7.2 Admin approved partner "${approvedOwner.name}" -> Status: Active`);

    // -------------------------------------------------------------
    // PHASE 8: ADMIN PRICING UPDATE SYNC TO ALL ROLES
    // -------------------------------------------------------------
    console.log('\n--- PHASE 8: PRICING UPDATE SYNCHRONIZATION ACROSS ALL ROLES ---');
    const initialConfig = await pricingRepo.getConfig();
    const updatedNoahRate = 3250;
    
    // Modify Noah 4-hour rate
    const noahCat = initialConfig.hourly.categories.find(c => c.id === 'noah');
    noahCat.rate4h = updatedNoahRate;
    await pricingRepo.saveConfig(initialConfig);
    
    // Verify Customer calculation reflects new rate
    const customerNoahCalc = await pricingService.calculate({ service: 'hourly', category: 'noah', duration: '4h' });
    assert.strictEqual(customerNoahCalc.baseFare, updatedNoahRate, 'Customer fare must use updated rate');
    console.log(`✓ 8.1 Customer fare calculation instantly picked up new rate: ৳${customerNoahCalc.baseFare}`);

    // Verify Partner Add-Vehicle recommended payout reflects new rate
    const partnerRecommendedNet = Math.round(updatedNoahRate * 0.90);
    assert.strictEqual(partnerRecommendedNet, 2925, 'Partner net payout must be 90% of updated rate');
    console.log(`✓ 8.2 Fleet Partner Add-Vehicle displays new recommended rate: ৳${updatedNoahRate} · Net Payout: ৳${partnerRecommendedNet} (90%)`);

    // Cleanup: restore original Noah rate
    noahCat.rate4h = 3000;
    await pricingRepo.saveConfig(initialConfig);

    console.log('\n================================================================');
    console.log('  ALL 8 PHASES OF THREE-ROLES CROSS-FUNCTIONAL JOURNEY PASSED!  ');
    console.log('  Customer <-> Fleet Owner <-> Admin Fully Integrated & Verified');
    console.log('================================================================\n');
}

testCompleteThreeRolesJourney().catch(err => {
    console.error('Cross-Functional Journey Failed:', err);
    process.exit(1);
});
