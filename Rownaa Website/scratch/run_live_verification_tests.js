const https = require('https');

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz0S9TFcB-6fIqtGba095AZ8CJiYaQi_NLH3h-i0Dq1Yp3sqWDvfasxAJSLaVIidcgH/exec';

// 1x1 transparent PNG base64 for doc testing
const DUMMY_IMG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Test 1: Rental Car Fleet Owner
const test1FleetPayload = {
  applicationId: 'DRV-FLEET-' + Math.floor(1000 + Math.random() * 9000),
  fullName: 'Farhan Rental & Chauffeur Services',
  phone: '01719876543',
  nid: '19889988776655443',
  city: 'Dhaka (Gulshan-2)',
  emergency: '01819876543',
  licenseNumber: 'DK-FL-998877',
  licenseClass: 'Professional',
  licenseExpiry: '2029-06-30',
  licenseStatus: 'Valid',
  experience: '10+ Years',
  languages: 'English, Bengali, Hindi',
  services: 'Rental Car Fleet, VIP Protocol Escort, Airport Transfer, Choose Your Car',
  availability: 'Full Time (24/7 Operations)',
  role: 'Rental Car Service Owner',
  vehicle: 'Rental Fleet: 3 Vehicles [Toyota Premio, Toyota Noah, Toyota HiAce Grand Cabin]',
  payout: 'Bank Asia (Gulshan Br) - A/C: 2049182049182 - Farhan Transport Ltd',
  photoBase64: DUMMY_IMG_BASE64,
  licenseFrontBase64: DUMMY_IMG_BASE64,
  licenseBackBase64: DUMMY_IMG_BASE64,
  nidFrontBase64: DUMMY_IMG_BASE64,
  nidBackBase64: DUMMY_IMG_BASE64,
  fleetData: {
    cars: [
      { model: 'Toyota Premio F', reg: 'Dhaka Metro GA-33-4455', color: 'Pearl White', year: '2021', seatCount: 4, fuelType: 'Octane' },
      { model: 'Toyota Noah Hybrid', reg: 'Dhaka Metro CHA-55-6677', color: 'Black Metallic', year: '2022', seatCount: 7, fuelType: 'Hybrid' },
      { model: 'Toyota HiAce Super GL', reg: 'Dhaka Metro D-11-2244', color: 'Silver', year: '2020', seatCount: 11, fuelType: 'Diesel' }
    ],
    drivers: [
      {
        name: 'Kamal Hossain',
        phone: '01811223344',
        nid: '19921122334455667',
        license: 'DK-992211',
        experience: '7 Years',
        licenseFrontBase64: DUMMY_IMG_BASE64,
        licenseBackBase64: DUMMY_IMG_BASE64
      },
      {
        name: 'Rashid Ahmed',
        phone: '01922334455',
        nid: '19952233445566778',
        license: 'DK-993322',
        experience: '5 Years',
        licenseFrontBase64: DUMMY_IMG_BASE64,
        licenseBackBase64: DUMMY_IMG_BASE64
      }
    ]
  }
};

// Test 2: Resubmission / Correction of Previous Data
const test2ResubmissionPayload = {
  applicationId: 'DRV-RESUB-' + Math.floor(1000 + Math.random() * 9000),
  fullName: 'Farhan Rental & Chauffeur Services',
  phone: '01719876543', // Same phone triggers duplicate detection
  nid: '19889988776655443',
  city: 'Dhaka (Gulshan-2)',
  emergency: '01819876543',
  licenseNumber: 'DK-FL-998877',
  licenseClass: 'Professional',
  licenseExpiry: '2029-06-30',
  licenseStatus: 'Valid',
  experience: '10+ Years',
  languages: 'English, Bengali',
  services: 'Rental Car Fleet, VIP Protocol Escort, Airport Transfer',
  availability: 'Full Time',
  role: 'Rental Car Service Owner',
  vehicle: 'Rental Fleet: 3 Vehicles',
  payout: 'Bank Asia (Gulshan Br) - A/C: 2049182049182',
  isResubmission: true,
  resubmitPreviousId: test1FleetPayload.applicationId,
  resubmitReason: 'Incorrect Bank Account / Phone / Vehicle details corrected',
  resubmitNotes: 'Updated commercial license and added 3rd vehicle details'
};

function postPayload(payload) {
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
        return https.get(res.headers.location, (redirectRes) => {
          let rData = '';
          redirectRes.on('data', chunk => rData += chunk);
          redirectRes.on('end', () => resolve(JSON.parse(rData)));
        });
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('=== RUNNING TEST 1: RENTAL CAR FLEET SUBMISSION ===');
  const t1 = await postPayload(test1FleetPayload);
  console.log('Test 1 Response:', JSON.stringify(t1, null, 2));

  console.log('\n=== RUNNING TEST 2: RESUBMISSION WITH CORRECTION TRACKING ===');
  const t2 = await postPayload(test2ResubmissionPayload);
  console.log('Test 2 Response:', JSON.stringify(t2, null, 2));

  console.log('\n=== FETCHING ALL CHAUFFEURS FROM REGISTRY TO CONFIRM SHEET DATA ===');
  https.get(WEBHOOK_URL + '?action=getChauffeurs', (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      https.get(res.headers.location, (rRes) => {
        let d = '';
        rRes.on('data', c => d += c);
        rRes.on('end', () => {
          const list = JSON.parse(d);
          console.log('Total Chauffeurs in Google Sheet:', list.count);
          list.chauffeurs.forEach((c, idx) => {
            console.log(`[Row ${idx + 2}] ID: ${c.id} | Name: ${c.name} | Role: ${c.role} | Audit: ${c.auditTracker} | Notes: ${c.resubmissionNotes}`);
          });
        });
      });
    }
  });
}

run().catch(console.error);

