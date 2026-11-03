const http = require('http');
const server = require('../server');

const PORT = 3000;

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const reqHeaders = { ...headers };
        let payload = null;
        if (body) {
            payload = JSON.stringify(body);
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = http.request({
            hostname: '127.0.0.1',
            port: PORT,
            path: path,
            method: method,
            headers: reqHeaders
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try {
                    parsed = JSON.parse(data);
                } catch(e) {}
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed,
                    raw: data
                });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runVerification() {
    await new Promise((resolve) => {
        server.listen(PORT, () => {
            console.log(`Server listening on http://127.0.0.1:${PORT}`);
            resolve();
        });
    });

    console.log('========================================================');
    console.log('🚀 LIVE PLATFORM VERIFICATION (Real HTTP End-to-End)   ');
    console.log('========================================================\n');

    let passed = 0;
    let failed = 0;

    async function check(name, testFn) {
        try {
            await testFn();
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`❌ [FAIL] ${name}: ${err.message}`);
            failed++;
        }
    }

    // 1. Static HTML Pages
    const pages = [
        '/',
        '/index.html',
        '/login-sliding.html',
        '/login.html',
        '/find-cars.html',
        '/checkout.html',
        '/customer-panel.html',
        '/owner-panel.html',
        '/admin-panel.html',
        '/owner-register.html',
        '/register.html',
        '/invoice.html'
    ];

    console.log('--- Phase 1: Checking Web Page Availability ---');
    for (const p of pages) {
        await check(`Page ${p} loads with HTTP 200`, async () => {
            const res = await request('GET', p);
            if (res.status !== 200) throw new Error(`Status was ${res.status}`);
            if (!res.raw.includes('<!DOCTYPE html>') && !res.raw.includes('<html')) {
                throw new Error('Response did not contain HTML markup');
            }
        });
    }

    // 2. Core API Endpoints
    console.log('\n--- Phase 2: Core API Endpoints ---');
    await check('GET /api/health responds with status ok', async () => {
        const res = await request('GET', '/api/health');
        if (res.status !== 200 || res.body.status !== 'ok') throw new Error(`Health check failed: ${res.raw}`);
    });

    await check('GET /api/inventory returns vehicle array', async () => {
        const res = await request('GET', '/api/inventory');
        if (res.status !== 200) throw new Error(`Status was ${res.status}`);
        const list = res.body.data || res.body;
        if (!Array.isArray(list) || list.length === 0) throw new Error('Inventory returned empty array or invalid structure');
    });

    await check('GET /api/pricing returns pricing configurations', async () => {
        const res = await request('GET', '/api/pricing');
        if (res.status !== 200) throw new Error(`Status was ${res.status}`);
        if (!res.body.hourly && !res.body.intercity) throw new Error('Pricing configuration missing services');
    });

    // 3. User Authentication & Cookie Verification
    console.log('\n--- Phase 3: User Authentication & Sessions ---');
    let adminCookie = '';
    let customerCookie = '';
    let ownerCookie = '';

    await check('POST /api/login for Admin user', async () => {
        const res = await request('POST', '/api/login', { username: 'admin', password: 'admin123' });
        if (res.status !== 200 || !res.body.success) throw new Error(`Login failed: ${res.raw}`);
        if (res.body.role !== 'admin') throw new Error(`Expected admin role, got ${res.body.role}`);
        if (!res.headers['set-cookie']) throw new Error('HttpOnly cookie not set in response header');
        adminCookie = res.headers['set-cookie'][0].split(';')[0];
    });

    await check('POST /api/login for Customer user', async () => {
        const res = await request('POST', '/api/login', { username: 'customer', password: 'customer123' });
        if (res.status !== 200 || !res.body.success) throw new Error(`Login failed: ${res.raw}`);
        if (res.body.role !== 'customer') throw new Error(`Expected customer role, got ${res.body.role}`);
        customerCookie = res.headers['set-cookie'][0].split(';')[0];
    });

    await check('POST /api/login for Owner user', async () => {
        const res = await request('POST', '/api/login', { username: 'owner', password: 'owner123' });
        if (res.status !== 200 || !res.body.success) throw new Error(`Login failed: ${res.raw}`);
        if (res.body.role !== 'owner') throw new Error(`Expected owner role, got ${res.body.role}`);
        ownerCookie = res.headers['set-cookie'][0].split(';')[0];
    });

    await check('GET /api/me verifies authenticated session via Cookie', async () => {
        const res = await request('GET', '/api/me', null, { 'Cookie': customerCookie });
        if (res.status !== 200 || !res.body.success || !res.body.user) {
            throw new Error(`Session verify failed: ${res.raw}`);
        }
    });

    // 4. Booking Creation Flow
    console.log('\n--- Phase 4: Reservation & Booking Engine ---');
    let createdBookingId = null;
    await check('POST /api/bookings creates valid booking', async () => {
        const payload = {
            customerId: 'cust-1',
            customerName: 'Verification Test Rider',
            customerPhone: '+8801700000000',
            customerEmail: 'rider@example.com',
            service: 'hourly',
            vehicle: 'Toyota Premio',
            pickupLocation: 'Gulshan 2, Dhaka',
            dropoffLocation: 'Banani, Dhaka',
            dateTime: `2026-12-${Math.floor(10 + Math.random() * 15)} ${Math.floor(1 + Math.random() * 12)}:00 PM`,
            price: '৳3,500'
        };
        const res = await request('POST', '/api/bookings', payload, { 'Cookie': customerCookie });
        if (res.status !== 200 && res.status !== 201) throw new Error(`Booking creation failed: ${res.raw}`);
        const data = res.body.data || res.body.booking || res.body;
        createdBookingId = data.id || res.body.id;
        if (!createdBookingId) throw new Error(`No booking ID returned: ${res.raw}`);
    });

    if (createdBookingId) {
        await check(`GET /api/bookings retrieves newly created booking #${createdBookingId}`, async () => {
            const res = await request('GET', '/api/bookings', null, { 'Cookie': adminCookie });
            if (res.status !== 200) throw new Error(`Fetch bookings failed: ${res.raw}`);
            const list = res.body.data || res.body;
            const found = list.find(b => b.id === createdBookingId);
            if (!found) throw new Error('Created booking was not found in bookings list');
        });
    }

    console.log('\n========================================================');
    console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('========================================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runVerification().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
