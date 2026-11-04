const https = require('https');

const webhookUrl = 'https://script.google.com/macros/s/AKfycby8srbyj_WYsOeL3v8vX3yqmeHTNRHjuEH2nR8YI6sTxTN5DaV3LDQdT2VxVI5bGyJDlQ/exec';

// Minimal 1x1 base64 JPEG
const dummyImg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const payload = {
  applicationId: 'DRV-FLEET-TEST-' + Math.floor(1000 + Math.random() * 9000),
  submittedAt: new Date().toISOString(),
  fullName: 'Tariqul Chowdhury (Fleet Owner)',
  phone: '01719998877',
  nidNumber: '1982269458000456',
  baseCity: 'Dhaka (Gulshan-Banani)',
  emergencyContact: {
    name: 'Mrs. Nahid Chowdhury (Director)',
    phone: '01819998877'
  },
  licenseNumber: 'DK0729482A',
  licenseType: 'Professional Heavy',
  licenseExpiry: '2032-12-31',
  experience: '12+ Years Commercial Operations',
  languages: 'Bangla Native + Fluent English',
  highwayExp: 'All-Bangladesh Highway & Tour Operations',
  services: ['VIP Executive Chauffeur', 'Airport VIP Protocol', 'Corporate Monthly Fleet'],
  availability: 'full_time',
  role: 'rental_fleet_operator',
  driverRole: 'rental_fleet_operator',
  fleetData: {
    totalCars: 2,
    totalDrivers: 2,
    vehicles: [
      { id: 1, model: 'Toyota HiAce Grand Cabin', plate: 'Dhaka Metro Cha 53-9081', seats: '14 Seats', fuel: 'Octane + CNG', year: '2022', fitness: '2027-12-31' },
      { id: 2, model: 'Toyota Noah Hybrid', plate: 'Dhaka Metro GA 45-2231', seats: '7 Seats', fuel: 'Hybrid', year: '2023', fitness: '2028-05-15' }
    ],
    drivers: [
      { id: 1, name: 'Rafiqul Islam', phone: '01711223344', nid: '1985269458000999', license: 'DK0923188A', vehicleIndex: 0 },
      { id: 2, name: 'Alamgir Hossain', phone: '01822334455', nid: '1990269458000888', license: 'CTG882910B', vehicleIndex: 1 }
    ]
  },
  vehicleProfile: 'Rental Fleet (2 Cars, 2 Drivers): 1. Toyota HiAce Grand Cabin [Dhaka Metro Cha 53-9081], 2. Toyota Noah Hybrid [Dhaka Metro GA 45-2231] | Drivers: Rafiqul Islam (01711223344), Alamgir Hossain (01822334455)',
  payoutMethod: 'Bank Transfer',
  payoutNumber: '116.120.0049281',
  payoutWallet: 'Bank: Dutch-Bangla Bank Limited (DBBL) (Banani Branch, Dhaka) - A/C: 116.120.0049281 [Corporate / Fleet Account - Chowdhury Rental Express Ltd.] Routing: 090260481',
  bankDetails: {
    bankName: 'Dutch-Bangla Bank Limited (DBBL)',
    branch: 'Banani Branch, Dhaka',
    accountName: 'Chowdhury Rental Express Ltd.',
    accountNumber: '116.120.0049281',
    routingNumber: '090260481',
    accountType: 'Corporate / Fleet Account'
  },
  status: 'Pending Verification',
  photoBase64: dummyImg,
  licenseFrontBase64: dummyImg,
  licenseBackBase64: dummyImg,
  nidFrontBase64: dummyImg,
  nidBackBase64: dummyImg
};

console.log('Sending test submission to webhook:', webhookUrl);
console.log('App ID:', payload.applicationId);

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
      console.log('HTTP Status:', res.statusCode);
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log('Redirecting to:', res.headers.location);
        // Follow redirect (GAS redirects POST to a GET on googleusercontent.com)
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

postToWebhook(webhookUrl, postData)
  .then(res => {
    console.log('Response body:', res.body);
  })
  .catch(err => {
    console.error('Submission error:', err);
  });

