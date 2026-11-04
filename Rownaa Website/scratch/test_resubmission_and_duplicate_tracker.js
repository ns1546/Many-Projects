const https = require('https');

const webhookUrl = 'https://script.google.com/macros/s/AKfycby8srbyj_WYsOeL3v8vX3yqmeHTNRHjuEH2nR8YI6sTxTN5DaV3LDQdT2VxVI5bGyJDlQ/exec';

const dummyImg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const payload = {
  applicationId: 'DRV-CORRECTION-TEST-' + Math.floor(1000 + Math.random() * 9000),
  submittedAt: new Date().toISOString(),
  fullName: 'Bashir Ahmed (Executive Fleet)',
  phone: '01899112233', // Matching previous phone to test duplicate detection & iteration
  nidNumber: '1979269458000999', // Corrected NID
  baseCity: 'Dhaka (Uttara-Dhanmondi)',
  emergencyContact: {
    name: 'Karim Ahmed (Operations)',
    phone: '01988112233'
  },
  licenseNumber: 'DK0559482X',
  licenseType: 'Professional Heavy',
  licenseExpiry: '2031-10-15',
  experience: '15+ Years Commercial Operations',
  languages: 'Bangla Native + Conversational English',
  services: ['Choose Your Car (Dedicated Fleet Selection)', 'VIP Executive Chauffeur', 'Corporate Monthly Fleet'],
  availability: 'full_time',
  role: 'rental_fleet_operator',
  driverRole: 'rental_fleet_operator',
  // Resubmission parameters
  isResubmission: true,
  previousApplicationId: 'DRV-FLEET-V8TEST-7281',
  prevAppId: 'DRV-FLEET-V8TEST-7281',
  correctionReason: 'Incorrect NID / Smart Card Number',
  correctionNotes: 'Entered wrong NID digit previously, updating with valid 17-digit smart card and adding Choose Your Car dedicated service preference.',
  fleetData: {
    totalCars: 2,
    totalDrivers: 2,
    vehicles: [
      { id: 1, model: 'Toyota HiAce GL Grand Cabin', plate: 'Dhaka Metro Cha 55-9012', seats: '14 Seats', fuel: 'Octane + CNG', year: '2023', fitness: '2028-12-31' },
      { id: 2, model: 'Toyota Premio 1.5X', plate: 'Dhaka Metro GA 39-1122', seats: '4 Seats', fuel: 'Octane Only', year: '2020', fitness: '2027-08-10' }
    ],
    drivers: [
      { id: 1, name: 'Sohag Mia', phone: '01700112233', nid: '1987269458000333', license: 'DK0662341A', vehicleIndex: 0 },
      { id: 2, name: 'Munna Sheikh', phone: '01800112233', nid: '1992269458000444', license: 'CTG772910C', vehicleIndex: 1 }
    ]
  },
  ownerCar: {
    model: 'Rental Fleet (2 Cars, 2 Drivers)',
    plateNumber: 'Dhaka Metro Cha 55-9012, Dhaka Metro GA 39-1122'
  },
  vehicleProfile: 'Rental Fleet (2 Cars, 2 Drivers): 1. Toyota HiAce GL Grand Cabin [Dhaka Metro Cha 55-9012], 2. Toyota Premio 1.5X [Dhaka Metro GA 39-1122] | Drivers: Sohag Mia (01700112233), Munna Sheikh (01800112233)',
  payoutMethod: 'Bank Transfer',
  payoutNumber: '120.101.008899',
  payoutWallet: 'Bank: City Bank Limited (Uttara Branch) - A/C: 120.101.008899 [Corporate / Fleet Account - Executive Fleet Ltd.] Routing: 225260481',
  bankDetails: {
    bankName: 'City Bank Limited',
    branch: 'Uttara Branch',
    accountName: 'Executive Fleet Ltd.',
    accountNumber: '120.101.008899',
    routingNumber: '225260481',
    accountType: 'Corporate / Fleet Account'
  },
  status: 'Pending Verification',
  photoBase64: dummyImg,
  licenseFrontBase64: dummyImg,
  licenseBackBase64: dummyImg,
  nidFrontBase64: dummyImg,
  nidBackBase64: dummyImg
};

const postData = JSON.stringify(payload);

function postToWebhook(urlStr, data, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return https.get(res.headers.location, (getRes) => {
          let body = '';
          getRes.on('data', chunk => body += chunk);
          getRes.on('end', () => resolve({ statusCode: getRes.statusCode, body }));
        }).on('error', reject);
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

console.log('Sending Resubmission / Correction test payload...');
postToWebhook(webhookUrl, postData)
  .then(res => {
    console.log('Submission Response:');
    console.log(res.body);
  })
  .catch(err => {
    console.error('Submission error:', err);
  });

