const https = require('https');

const webhookUrl = 'https://script.google.com/macros/s/AKfycby8srbyj_WYsOeL3v8vX3yqmeHTNRHjuEH2nR8YI6sTxTN5DaV3LDQdT2VxVI5bGyJDlQ/exec';

const dummyImg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

const payload = {
  applicationId: 'DRV-FLEET-DOCS-' + Math.floor(1000 + Math.random() * 9000),
  submittedAt: new Date().toISOString(),
  fullName: 'Faridul Alam (Alam Rental Fleet)',
  phone: '01977665544',
  nidNumber: '1984269458000333',
  baseCity: 'Dhaka (Dhanmondi & Mirpur)',
  emergencyContact: {
    name: 'Nasir Alam (Manager)',
    phone: '01877665544'
  },
  licenseNumber: 'DK0981245P',
  licenseType: 'Professional PSV',
  licenseExpiry: '2030-05-20',
  experience: '10+ Years Fleet Management',
  languages: 'Bangla Native + Conversational English',
  services: ['Choose Your Car (Dedicated Fleet Selection)', 'Airport Transfer', 'Corporate Transport'],
  availability: 'full_time',
  role: 'rental_fleet_operator',
  driverRole: 'rental_fleet_operator',
  fleetData: {
    totalCars: 2,
    totalDrivers: 2,
    vehicles: [
      { id: 1, model: 'Toyota Premio 1.5X', plate: 'Dhaka Metro GA 21-4920', seats: '4 Seats', fuel: 'Octane Only', year: '2021', fitness: '2027-11-15' },
      { id: 2, model: 'Toyota Noah (7-Seater)', plate: 'Dhaka Metro Cha 51-2291', seats: '7 Seats', fuel: 'Octane + CNG', year: '2022', fitness: '2028-06-30' }
    ],
    drivers: [
      {
        id: 1,
        name: 'Belal Hossain',
        phone: '01711002233',
        nid: '1991269458000111',
        license: 'DK0334821A',
        vehicleIndex: 0,
        licenseFront: dummyImg,
        licenseBack: dummyImg,
        licenseFrontBase64: dummyImg,
        licenseBackBase64: dummyImg
      },
      {
        id: 2,
        name: 'Moniruzzaman',
        phone: '01811002233',
        nid: '1993269458000222',
        license: 'DK0554912B',
        vehicleIndex: 1,
        licenseFront: dummyImg,
        licenseBack: dummyImg,
        licenseFrontBase64: dummyImg,
        licenseBackBase64: dummyImg
      }
    ]
  },
  ownerCar: {
    model: 'Rental Fleet (2 Cars, 2 Drivers)',
    plateNumber: 'Dhaka Metro GA 21-4920, Dhaka Metro Cha 51-2291'
  },
  vehicleProfile: 'Rental Fleet (2 Cars, 2 Drivers): 1. Toyota Premio 1.5X [Dhaka Metro GA 21-4920], 2. Toyota Noah (7-Seater) [Dhaka Metro Cha 51-2291] | Drivers: Belal Hossain (01711002233) [Lic Front & Back ✓], Moniruzzaman (01811002233) [Lic Front & Back ✓]',
  payoutMethod: 'Bank Transfer',
  payoutNumber: '116.120.0099881',
  payoutWallet: 'Bank: BRAC Bank PLC (Gulshan Branch) - A/C: 116.120.0099881 [Corporate / Fleet Account - Alam Rental Fleet Ltd.] Routing: 060260481',
  bankDetails: {
    bankName: 'BRAC Bank PLC',
    branch: 'Gulshan Branch',
    accountName: 'Alam Rental Fleet Ltd.',
    accountNumber: '116.120.0099881',
    routingNumber: '060260481',
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

console.log('Dispatching Fleet Driver Licenses submission test...');
postToWebhook(webhookUrl, postData)
  .then(res => {
    console.log('Submission Response:');
    console.log(res.body);
  })
  .catch(err => {
    console.error('Submission error:', err);
  });
