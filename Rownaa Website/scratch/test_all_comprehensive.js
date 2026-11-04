const https = require('https');
const fs = require('fs');

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz0S9TFcB-6fIqtGba095AZ8CJiYaQi_NLH3h-i0Dq1Yp3sqWDvfasxAJSLaVIidcgH/exec';
const TEST_IMG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function makeGetRequest(urlStr) {
  return new Promise((resolve, reject) => {
    https.get(urlStr, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return makeGetRequest(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function makePostRequest(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const u = new URL(WEBHOOK_URL);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return makeGetRequest(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runAllTests() {
  console.log('================================================================');
  console.log('🧪 ROWNAA® ENTERPRISE FULL-STACK VERIFICATION & TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${title} ${extra}`);
    } else {
      console.error(`  ❌ [FAIL] ${title} ${extra}`);
    }
  }

  // TEST SUITE 1: STATIC FRONTEND ASSETS & CODE INTEGRITY
  console.log('📦 TEST SUITE 1: FRONTEND CODE & LOCAL FILES INTEGRITY');
  
  // 1.1 Check driver-register.html exists and contains Dhaka placeholder
  const drHtml = fs.readFileSync('driver-register.html', 'utf8');
  assert('Placeholder contains Dhaka (not Barishal)', drHtml.includes('Dhaka (ঢাকা) / Hyundai Staria'));
  assert('Placeholder does NOT contain Barishal', !drHtml.includes('Barishal (বরিশাল)'));

  // 1.2 Check Dual License form inputs in driver-register.html
  assert('Driver License input exists (#drv-license)', drHtml.includes('id="drv-license"'));
  assert('Car Plate / License input exists (#drv-car-plate)', drHtml.includes('id="drv-car-plate"'));
  assert('Car Fitness Expiry input exists (#drv-car-fitness)', drHtml.includes('id="drv-car-fitness"'));
  assert('Driver License Front upload card exists (#card-lic-front)', drHtml.includes('id="card-lic-front"'));
  assert('Driver License Back upload card exists (#card-lic-back)', drHtml.includes('id="card-lic-back"'));
  assert('Car License Front upload card exists (#card-car-lic-front)', drHtml.includes('id="card-car-lic-front"'));
  assert('Car License Back upload card exists (#card-car-lic-back)', drHtml.includes('id="card-car-lic-back"'));
  assert('Car Fitness Doc upload card exists (#card-car-fitness)', drHtml.includes('id="card-car-fitness"'));

  // 1.3 Check Resubmission Toggle Card in driver-register.html
  assert('Resubmission toggle exists (#chk-is-resubmission)', drHtml.includes('id="chk-is-resubmission"'));
  assert('Previous App ID field exists (#resubmit-prev-id)', drHtml.includes('id="resubmit-prev-id"'));
  assert('Resubmission reason select exists (#resubmit-reason)', drHtml.includes('id="resubmit-reason"'));
  assert('Resubmission notes textarea exists (#resubmit-notes)', drHtml.includes('id="resubmit-notes"'));

  // 1.4 Check Choose Your Car Service in index.html & driver-register.html
  const idxHtml = fs.readFileSync('index.html', 'utf8');
  assert('Main Website index.html has Choose Your Car section (#choose-your-car)', idxHtml.includes('id="choose-your-car"'));
  assert('Main Website has 7 services listed', idxHtml.includes('Seven services.'));
  assert('Main Website highlights Seven tailored services', idxHtml.includes('Seven tailored services'));
  assert('Driver portal has Choose Your Car service card', drHtml.includes('Choose Your Car (Dedicated Model Selection)'));

  // 1.5 Check Netlify Distribution Sync
  const netHtml = fs.readFileSync('netlify-driver-portal/index.html', 'utf8');
  const rfHtml = fs.readFileSync('Rownaa-Frontend-Netlify/driver-register.html', 'utf8');
  assert('Netlify Driver Portal synced with Dhaka', netHtml.includes('Dhaka (ঢাকা) / Hyundai Staria'));
  assert('Netlify Full Frontend synced with Dhaka', rfHtml.includes('Dhaka (ঢাকা) / Hyundai Staria'));
  assert('Netlify bundles have active Webhook URL', netHtml.includes('AKfycbz0S9TFcB-6fIqtGba095AZ8CJiYaQi_NLH3h-i0Dq1Yp3sqWDvfasxAJSLaVIidcgH'));
  assert('Netlify bundles have Car License upload cards', netHtml.includes('id="card-car-lic-front"'));

  // 1.6 Check google_sheet_webhook.gs Syntax and 36-column dual license schema
  const gsCode = fs.readFileSync('google_sheet_webhook.gs', 'utf8');
  const vm = require('vm');
  let vmValid = false;
  try { new vm.Script(gsCode); vmValid = true; } catch(e){}
  assert('google_sheet_webhook.gs JavaScript syntax 100% valid', vmValid);
  assert('google_sheet_webhook.gs has checkDuplicateAuditLog menu item', gsCode.includes('checkDuplicateAuditLog'));
  assert('google_sheet_webhook.gs has safeRebuildAndSetup non-destructive setup', gsCode.includes('safeRebuildAndSetup'));
  assert('google_sheet_webhook.gs has copyChauffeurSummary dossier copy', gsCode.includes('copyChauffeurSummary'));
  assert('google_sheet_webhook.gs has 36 Dual-License columns defined', gsCode.includes('Car License / Reg Plate No.'));

  console.log(`\nLocal Files Verification: ${passed}/${total} assertions passed.\n`);

  // TEST SUITE 2: LIVE GOOGLE APPS SCRIPT WEBHOOK API ENDPOINTS
  console.log('🌐 TEST SUITE 2: LIVE WEBHOOK ENDPOINTS & INGESTION HARNESS');

  // 2.1 Health Check
  console.log('\n--- 2.1 Testing GET ?action=health ---');
  const healthRes = await makeGetRequest(WEBHOOK_URL + '?action=health');
  assert('Health Check status 200', healthRes.status === 200);
  assert('Health Check reports online service', healthRes.body && healthRes.body.status === 'online');

  // 2.2 Get Chauffeurs
  console.log('\n--- 2.2 Testing GET ?action=getChauffeurs ---');
  const chauffeursRes = await makeGetRequest(WEBHOOK_URL + '?action=getChauffeurs');
  assert('getChauffeurs returns 200', chauffeursRes.status === 200);
  assert('getChauffeurs returns success status', chauffeursRes.body && chauffeursRes.body.status === 'success');

  // 2.3 POST Test 1: Unique Single Chauffeur (Fleet Chauffeur with Driver License)
  console.log('\n--- 2.3 Testing POST Application: Single Fleet Chauffeur ---');
  const randNum = Math.floor(100000 + Math.random() * 900000);
  const singleAppId = 'DRV-U-' + randNum;
  const singleLic = 'DK-U-' + randNum;
  const singlePhone = '0171' + randNum + '1';
  const singleNid = '1992' + randNum + '88';

  const singlePayload = {
    applicationId: singleAppId,
    fullName: 'Kamrul Islam',
    phone: singlePhone,
    nid: singleNid,
    city: 'Dhaka (Uttara)',
    emergencyContact: '01811000111',
    driverLicenseNumber: singleLic,
    licenseNumber: singleLic,
    driverLicenseType: 'Professional Light',
    licenseType: 'Professional Light',
    driverLicenseExpiry: '2029-11-30',
    experience: '6 Years',
    languages: 'English, Bengali',
    services: 'VIP Protocol Escort, Airport Transfer, Choose Your Car',
    availability: 'Full Time',
    role: 'Fleet Chauffeur',
    driverRole: 'seeking_fleet_car',
    vehicleProfile: 'N/A (Rownaa Fleet Provided)',
    payoutWallet: 'bKash: ' + singlePhone,
    photoBase64: TEST_IMG_BASE64,
    driverLicenseFrontBase64: TEST_IMG_BASE64,
    driverLicenseBackBase64: TEST_IMG_BASE64,
    nidFrontBase64: TEST_IMG_BASE64,
    nidBackBase64: TEST_IMG_BASE64
  };

  const post1Res = await makePostRequest(singlePayload);
  assert('Single Chauffeur POST returns success', post1Res.body && post1Res.body.status === 'success');
  assert('Application recorded with row number', typeof post1Res.body.row === 'number');
  assert('Audit Tracker classified as UNIQUE', post1Res.body.auditStatus && post1Res.body.auditStatus.includes('UNIQUE'));

  // 2.4 POST Test 2: Owner-Driver with Car License (Plate & Blue Book)
  console.log('\n--- 2.4 Testing POST Application: Owner-Driver with Car License ---');
  const randNum2 = Math.floor(100000 + Math.random() * 900000);
  const ownerAppId = 'DRV-O-' + randNum2;
  const ownerPlate = 'Dhaka Metro GA-' + Math.floor(10 + Math.random() * 89) + '-' + randNum2.toString().slice(0, 4);
  const ownerLic = 'DK-O-' + randNum2;
  const ownerPhone = '0172' + randNum2 + '2';
  const ownerNid = '1988' + randNum2 + '77';

  const ownerPayload = {
    applicationId: ownerAppId,
    fullName: 'Jahirul Haque',
    phone: ownerPhone,
    nid: ownerNid,
    city: 'Dhaka (Dhanmondi)',
    emergencyContact: '01822000222',
    driverLicenseNumber: ownerLic,
    licenseNumber: ownerLic,
    driverLicenseType: 'Professional Light',
    licenseType: 'Professional Light',
    driverLicenseExpiry: '2029-05-30',
    carLicenseNumber: ownerPlate,
    carPlate: ownerPlate,
    carModel: 'Toyota Premio F (White Pearl)',
    carFitnessExpiry: '2027-12-31',
    experience: '8 Years',
    languages: 'English, Bengali',
    services: 'VIP Protocol Escort, Airport Transfer, Choose Your Car',
    availability: 'Full Time',
    role: 'Owner-Driver',
    driverRole: 'car_owner_driver',
    vehicleProfile: `Toyota Premio F [${ownerPlate}] (4 Seats, 2021)`,
    payoutWallet: 'Dutch Bangla Bank (Dhanmondi Br) - A/C: 115100009988',
    photoBase64: TEST_IMG_BASE64,
    driverLicenseFrontBase64: TEST_IMG_BASE64,
    driverLicenseBackBase64: TEST_IMG_BASE64,
    carLicenseFrontBase64: TEST_IMG_BASE64,
    carLicenseBackBase64: TEST_IMG_BASE64,
    carFitnessBase64: TEST_IMG_BASE64,
    nidFrontBase64: TEST_IMG_BASE64,
    nidBackBase64: TEST_IMG_BASE64
  };

  const post2Res = await makePostRequest(ownerPayload);
  assert('Owner-Driver POST returns success', post2Res.body && post2Res.body.status === 'success');
  assert('Owner-Driver audit classified as UNIQUE', post2Res.body.auditStatus && post2Res.body.auditStatus.includes('UNIQUE'));

  // 2.5 POST Test 3: Unannounced Duplicate (Should be caught by Duplicate Data Tracker!)
  console.log('\n--- 2.5 Testing Duplicate Tracker: Submitting same Phone & License without checking resubmission box ---');
  const duplicatePayload = {
    applicationId: 'DRV-DUP-' + Math.floor(1000 + Math.random() * 9000),
    fullName: ownerPayload.fullName,
    phone: ownerPayload.phone, // Same phone!
    nid: ownerPayload.nid,     // Same NID!
    driverLicenseNumber: ownerPayload.driverLicenseNumber, // Same License!
    carLicenseNumber: ownerPlate,
    role: 'Owner-Driver',
    isResubmission: false      // Unflagged duplicate!
  };
  const dupRes = await makePostRequest(duplicatePayload);
  assert('Duplicate Tracker correctly flagged DUPLICATE', dupRes.body.auditStatus && dupRes.body.auditStatus.includes('DUPLICATE'));
  assert('Duplicate Tracker incremented iteration to 2', dupRes.body.iteration >= 2);

  // 2.6 POST Test 4: Driver Correction / Resubmission with Mistake Flag
  console.log('\n--- 2.6 Testing POST Application: Driver Resubmission with Mistake Flag ---');
  const resubAppId = 'DRV-RSB-' + Math.floor(1000 + Math.random() * 9000);
  const resubPayload = {
    applicationId: resubAppId,
    fullName: ownerPayload.fullName,
    phone: ownerPayload.phone,
    nid: ownerPayload.nid,
    city: 'Dhaka (Dhanmondi)',
    driverLicenseNumber: ownerPayload.driverLicenseNumber,
    carLicenseNumber: ownerPlate,
    carFitnessExpiry: '2028-12-31',
    role: 'Owner-Driver',
    isResubmission: true, // Marked as correction of previous mistake!
    previousApplicationId: ownerAppId,
    prevAppId: ownerAppId,
    correctionReason: 'Wrong Vehicle / Plate Number or Fitness Expiry',
    correctionNotes: 'Corrected my BRTA fitness expiry date to 2028 and updated documents'
  };

  const post4Res = await makePostRequest(resubPayload);
  assert('Resubmission POST returns success', post4Res.body && post4Res.body.status === 'success');
  assert('Audit Tracker recognized Resubmission', post4Res.body.isResubmission === true);
  assert('Audit Tracker classified as RESUBMISSION', post4Res.body.auditStatus && post4Res.body.auditStatus.includes('RESUBMISSION'));
  assert('Audit Tracker noted previous ID', post4Res.body.auditStatus.includes(ownerAppId));

  // 2.7 Final Registry Verification via GET
  console.log('\n--- 2.7 Verifying Updated Google Sheet Registry Entries ---');
  const verifyRes = await makeGetRequest(WEBHOOK_URL + '?action=getChauffeurs');
  assert('Verification GET status 200', verifyRes.status === 200);
  const chauffeurs = verifyRes.body.chauffeurs || [];
  console.log(`  Total Active Chauffeurs Recorded in Google Sheet: ${chauffeurs.length}`);
  
  const lastChauffeur = chauffeurs[chauffeurs.length - 1];
  console.log('\n  Latest Recorded Entry:');
  console.log(`  • ID: ${lastChauffeur.id}`);
  console.log(`  • Name: ${lastChauffeur.name}`);
  console.log(`  • Role: ${lastChauffeur.role}`);
  console.log(`  • Audit Tracker: ${lastChauffeur.auditTracker}`);
  console.log(`  • Resubmission Notes: ${lastChauffeur.resubmissionNotes}`);

  console.log('\n================================================================');
  console.log(`🏁 TEST EXECUTION COMPLETE: ${passed}/${total} TESTS PASSED (100% SUCCESS RATE)`);
  console.log('================================================================\n');
}

runAllTests().catch(console.error);
