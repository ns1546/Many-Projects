const https = require('https');
const assert = require('assert');

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwgSv5OXT-z0dKr06cWRs5r1T-lrT3OYhVmvLQHbwQ7DuteyRoKrjMvAjrfRv9X35dW/exec';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 TESTING NEW APPS SCRIPT DEPLOYMENT');
console.log('URL: ' + WEBHOOK_URL);
console.log('═══════════════════════════════════════════════════════════════\n');

// Helper to make HTTPS requests with automatic redirect following
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      if (!reqOptions.headers['Content-Type']) {
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = https.request(reqOptions, (res) => {
      // Handle Google Apps Script 302 Redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(request(res.headers.location, { method: 'GET' }));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json: json
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(35000, () => {
      req.destroy();
      reject(new Error('Request timed out after 35 seconds'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

const sampleDummyImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function runTestSuite() {
  let passed = 0;
  let total = 0;

  function test(desc, condition) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
    }
  }

  try {
    // ============================================================
    // TEST 1: Health Check (GET ?action=health)
    // ============================================================
    console.log('--- TEST 1: GET ?action=health ---');
    const healthRes = await request(WEBHOOK_URL + '?action=health');
    test('Health Check returns HTTP 200', healthRes.statusCode === 200);
    test('Health Check returns valid JSON', healthRes.json !== null);
    test('Health Check reports status online', healthRes.json && healthRes.json.status === 'online');
    test('Health Check confirms 2-Section architecture', healthRes.json && healthRes.json.service.includes('2-Section') || healthRes.json.sections);
    console.log('  Health Payload:', JSON.stringify(healthRes.json, null, 2));

    // ============================================================
    // TEST 2: Self-Healing / Realign (GET ?action=repair)
    // ============================================================
    console.log('\n--- TEST 2: GET ?action=repair (Self-Healing & Alignment) ---');
    const repairRes = await request(WEBHOOK_URL + '?action=repair');
    test('Repair Check returns HTTP 200', repairRes.statusCode === 200);
    test('Repair reports success message', repairRes.json && repairRes.json.status === 'success');
    console.log('  Repair Output:', repairRes.json && repairRes.json.message);

    // ============================================================
    // TEST 3: Google Drive Daily Backup (GET ?action=backup)
    // ============================================================
    console.log('\n--- TEST 3: GET ?action=backup (Google Drive Backup) ---');
    const backupRes = await request(WEBHOOK_URL + '?action=backup');
    test('Backup returns HTTP 200', backupRes.statusCode === 200);
    test('Backup reports success', backupRes.json && backupRes.json.status === 'success');
    console.log('  Backup Result:', backupRes.json && backupRes.json.message);

    // ============================================================
    // TEST 4: Initial Registrations Check (GET ?action=getRegistrations)
    // ============================================================
    console.log('\n--- TEST 4: GET ?action=getRegistrations ---');
    const regRes = await request(WEBHOOK_URL + '?action=getRegistrations');
    test('getRegistrations returns HTTP 200', regRes.statusCode === 200);
    test('getRegistrations returns valid JSON array', regRes.json && Array.isArray(regRes.json.chauffeurs || regRes.json.registrations));
    const initialCount = (regRes.json && (regRes.json.chauffeurs || regRes.json.registrations) || []).length;
    console.log(`  Current active rows in spreadsheet: ${initialCount}`);

    // ============================================================
    // TEST 5: POST Solo Driver Application
    // ============================================================
    console.log('\n--- TEST 5: POST Solo Driver Application ---');
    const testPhone = '01712' + Math.floor(100000 + Math.random() * 900000);
    const testNid = '199' + Math.floor(1000000 + Math.random() * 9000000);
    const testLic = 'DL-TEST-' + Math.floor(1000 + Math.random() * 9000);
    const soloAppId = 'DRV-SOLO-' + Math.floor(1000 + Math.random() * 9000);

    const soloPayload = {
      applicationId: soloAppId,
      fullName: 'Anwar Hossain',
      phone: testPhone,
      nidNumber: testNid,
      baseCity: 'Dhaka',
      emergencyContact: { name: 'Rezaul Karim', phone: '01819998877' },
      role: 'solo_chauffeur',
      driverRole: 'solo_chauffeur',
      licenseNumber: testLic,
      licenseType: 'Professional Light',
      licenseExpiry: '2029-08-30',
      experience: '7 Years',
      services: ['Executive Chauffeur', 'Airport Transfer'],
      availability: 'full_time',
      payoutMethod: 'bKash Personal',
      payoutNumber: testPhone,
      photoBase64: sampleDummyImage,
      licenseFrontBase64: sampleDummyImage,
      nidFrontBase64: sampleDummyImage
    };

    const soloPostRes = await request(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(soloPayload)
    });

    test('Solo Driver POST returns HTTP 200', soloPostRes.statusCode === 200);
    test('Solo Driver POST reports success status', soloPostRes.json && soloPostRes.json.status === 'success');
    test('Solo Driver classified as UNIQUE first-time applicant', soloPostRes.json && (soloPostRes.json.auditStatus.includes('First-Time') || soloPostRes.json.auditStatus.includes('UNIQUE')));
    console.log('  Solo Post Response:', JSON.stringify(soloPostRes.json, null, 2));

    // ============================================================
    // TEST 6: POST Rental Car Owner (MULTIPLE CARS & DRIVERS)
    // ============================================================
    console.log('\n--- TEST 6: POST Rental Car Service (Multiple Cars & Multiple Drivers) ---');
    const rentalPhone = '01815' + Math.floor(100000 + Math.random() * 900000);
    const rentalNid = '198' + Math.floor(1000000 + Math.random() * 9000000);
    const rentalAppId = 'FLT-DAC-' + Math.floor(1000 + Math.random() * 9000);
    const tradeLicenseNo = 'TRD-DHK-' + Math.floor(10000 + Math.random() * 90000);

    const multiCarsList = [
      { model: 'Toyota HiAce Grand Cabin', reg: 'Dhaka Metro Cha 53-1092', year: '2021', seats: '12 Seats', fuel: 'Octane', fitnessExpiry: '2027-12-31', blueBookFront: sampleDummyImage },
      { model: 'Toyota Noah Hybrid', reg: 'Dhaka Metro Cha 11-2233', year: '2020', seats: '7 Seats', fuel: 'Hybrid', fitnessExpiry: '2026-08-15', blueBookFront: sampleDummyImage },
      { model: 'Toyota Premio 1.5X', reg: 'Dhaka Metro Ga 33-4455', year: '2019', seats: '4 Seats', fuel: 'Octane', fitnessExpiry: '2028-01-10', blueBookFront: sampleDummyImage }
    ];

    const multiDriversList = [
      { name: 'Rafiqul Islam', phone: '01711223344', license: 'DL-982341', licenseClass: 'Professional Light', licenseExpiry: '2028-05-12', assignedPlate: 'Dhaka Metro Cha 53-1092', licenseFront: sampleDummyImage },
      { name: 'Kamal Hossain', phone: '01811334455', license: 'DL-192837', licenseClass: 'Professional Heavy', licenseExpiry: '2027-11-20', assignedPlate: 'Dhaka Metro Cha 11-2233', licenseFront: sampleDummyImage }
    ];

    const rentalPayload = {
      applicationId: rentalAppId,
      fullName: 'Hafizur Rahman',
      businessName: 'Green Line Luxury Rental Services',
      phone: rentalPhone,
      nidNumber: rentalNid,
      baseCity: 'Dhaka',
      officeAddress: 'House 14, Road 7, Sector 3, Uttara, Dhaka',
      role: 'rental_fleet_operator',
      driverRole: 'rental_fleet_operator',
      tradeLicenseNumber: tradeLicenseNo,
      fleetData: {
        cars: multiCarsList,
        drivers: multiDriversList
      },
      payoutMethod: 'Bank Transfer',
      bankDetails: { bankName: 'Dutch Bangla Bank', accountNumber: '123.120.987654', accountName: 'Green Line Rental' },
      photoBase64: sampleDummyImage,
      nidFrontBase64: sampleDummyImage,
      tradeLicenseBase64: sampleDummyImage
    };

    const rentalPostRes = await request(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(rentalPayload)
    });

    test('Rental Service POST returns HTTP 200', rentalPostRes.statusCode === 200);
    test('Rental Service POST reports success status', rentalPostRes.json && rentalPostRes.json.status === 'success');
    test('Rental Service accurately counted multiple cars', rentalPostRes.json && rentalPostRes.json.carsCount === 3);
    test('Rental Service accurately counted multiple drivers', rentalPostRes.json && rentalPostRes.json.driversCount === 2);
    test('Rental Service saved trade license and documents', rentalPostRes.json && rentalPostRes.json.documentsSaved && rentalPostRes.json.documentsSaved.tradeLicense);
    console.log('  Rental Post Response:', JSON.stringify(rentalPostRes.json, null, 2));

    // ============================================================
    // TEST 7: Duplicate Data Tracker Verification
    // ============================================================
    console.log('\n--- TEST 7: Duplicate Data Tracker (Submitting repeat phone without resubmission check) ---');
    const duplicatePayload = {
      applicationId: 'DRV-DUP-' + Math.floor(1000 + Math.random() * 9000),
      fullName: 'Anwar Hossain (Duplicate Test)',
      phone: testPhone, // Same phone as Solo Driver
      nidNumber: testNid, // Same NID
      baseCity: 'Dhaka',
      role: 'solo_chauffeur',
      licenseNumber: testLic,
      isResubmission: false
    };

    const dupRes = await request(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(duplicatePayload)
    });

    test('Duplicate submission returns HTTP 200', dupRes.statusCode === 200);
    test('Duplicate Tracker flagged REPEAT/DUPLICATE application', dupRes.json && (dupRes.json.auditStatus.includes('Repeat') || dupRes.json.auditStatus.includes('DUPLICATE')));
    test('Duplicate Tracker incremented iteration counter to 2', dupRes.json && dupRes.json.iteration === 2);
    console.log('  Duplicate Detection Flag:', dupRes.json && dupRes.json.auditStatus);

    // ============================================================
    // TEST 8: Resubmission / Correction Tracking
    // ============================================================
    console.log('\n--- TEST 8: Resubmission / Correction Tracking (Applicant correcting mistake) ---');
    const resubmitPayload = {
      applicationId: 'DRV-CORR-' + Math.floor(1000 + Math.random() * 9000),
      fullName: 'Anwar Hossain (Corrected)',
      phone: testPhone, // Same phone
      nidNumber: testNid,
      baseCity: 'Dhaka',
      role: 'solo_chauffeur',
      licenseNumber: testLic,
      isResubmission: true,
      previousApplicationId: soloAppId,
      correctionReason: 'Incorrect BRTA License / Expiry Date',
      correctionNotes: 'Corrected my license expiry date to 2030 and re-uploaded clear photo'
    };

    const resubmitRes = await request(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(resubmitPayload)
    });

    test('Resubmission returns HTTP 200', resubmitRes.statusCode === 200);
    test('Resubmission classified as Repeat / Correction', resubmitRes.json && (resubmitRes.json.auditStatus.includes('Correction') || resubmitRes.json.auditStatus.includes('RESUBMISSION')));
    test('Resubmission links back to previous Application ID', resubmitRes.json && resubmitRes.json.auditStatus.includes(soloAppId));
    test('Resubmission incremented iteration counter to 3', resubmitRes.json && resubmitRes.json.iteration === 3);
    console.log('  Resubmission Audit String:', resubmitRes.json && resubmitRes.json.auditStatus);

    // ============================================================
    // TEST 9: Final Database Ingestion Verification (GET)
    // ============================================================
    console.log('\n--- TEST 9: Verifying Sheet Database Rows via GET ---');
    const finalGetRes = await request(WEBHOOK_URL + '?action=getRegistrations');
    test('Final GET status is HTTP 200', finalGetRes.statusCode === 200);
    const allRecords = (finalGetRes.json && (finalGetRes.json.chauffeurs || finalGetRes.json.registrations)) || [];
    test('Final record count is greater than initial', allRecords.length > initialCount);
    console.log(`  Total Registrations in Sheet: ${allRecords.length}`);

    // Verify Rental Service record in the sheet
    const rentalRecord = allRecords.find(r => r.id === rentalAppId || (r.companyName && r.companyName.includes('Green Line')));
    test('Rental Service record found in sheet', !!rentalRecord);
    if (rentalRecord) {
      test('Rental Service has multiple cars listed in Col Q (carsList)', rentalRecord.carsList && rentalRecord.carsList.includes('HiAce') && rentalRecord.carsList.includes('Noah'));
      test('Rental Service has multiple drivers listed in Col R (driversList)', rentalRecord.driversList && rentalRecord.driversList.includes('Rafiqul') && rentalRecord.driversList.includes('Kamal'));
      console.log('\n  ⭐ Verified Ingested Rental Service Details in Google Sheet:');
      console.log(`  • Company: ${rentalRecord.companyName}`);
      console.log(`  • Owner: ${rentalRecord.name} (${rentalRecord.phone})`);
      console.log(`  • Trade License: ${rentalRecord.tradeLicense}`);
      console.log(`  • Cars List (Col Q):\n${rentalRecord.carsList.split('\n').map(l => '      ' + l).join('\n')}`);
      console.log(`  • Drivers List (Col R):\n${rentalRecord.driversList.split('\n').map(l => '      ' + l).join('\n')}`);
    }

  } catch (err) {
    console.error('❌ Exception during test execution:', err);
    test('Test suite execution without fatal errors', false);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`🏁 TEST COMPLETE: ${passed} / ${total} ASSERTIONS PASSED (${Math.round(passed / total * 100)}%)`);
  console.log('═══════════════════════════════════════════════════════════════');
}

runTestSuite();

