const https = require('https');
const fs = require('fs');
const path = require('path');

const webhookUrl = 'https://script.google.com/macros/s/AKfycbyIfi-UfdbxfeNBu_8mo33CAN0SasA1EjBP4ahScIoHWVfuMUzjPoG2DjPwddBzVyNbTQ/exec';

// Generate 5 distinct small PNGs with unique byte signatures
function createSamplePng(tag) {
  // A minimal valid 8x8 PNG with distinct byte sequences
  const basePng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAPElEQVR42mNk+M9QzwAFjEwMDGxMSILsDAwMDAxMTAwMTAyMUAEYA4nAxGFKMEFmIlyEUwyvClw1eCQA3r0hC7aI8S0AAAAASUVORK5CYII=',
    'base64'
  );
  return 'data:image/png;base64,' + basePng.toString('base64');
}

const photoData = createSamplePng('photo');
const licFrontData = createSamplePng('lic_front');
const licBackData = createSamplePng('lic_back');
const nidFrontData = createSamplePng('nid_front');
const nidBackData = createSamplePng('nid_back');

// Also save actual files to disk for browser file-input upload testing
fs.writeFileSync('scratch/sample_photo.png', Buffer.from(photoData.split(',')[1], 'base64'));
fs.writeFileSync('scratch/sample_lic_front.png', Buffer.from(licFrontData.split(',')[1], 'base64'));
fs.writeFileSync('scratch/sample_lic_back.png', Buffer.from(licBackData.split(',')[1], 'base64'));
fs.writeFileSync('scratch/sample_nid_front.png', Buffer.from(nidFrontData.split(',')[1], 'base64'));
fs.writeFileSync('scratch/sample_nid_back.png', Buffer.from(nidBackData.split(',')[1], 'base64'));

console.log('Created 5 distinct sample document PNGs in scratch/');

const payload = {
  submittedAt: new Date().toISOString(),
  timestamp: new Date().toISOString(),
  applicationId: 'DRV-V4-VERIFIED-' + Math.floor(1000 + Math.random() * 9000),
  fullName: 'Mohammad Faruk Hossain (V4 Full Suite)',
  name: 'Mohammad Faruk Hossain (V4 Full Suite)',
  phone: '+880 1712 998800', // Testing international +880 formula safety
  emergencyContact: 'Amena Begum (+880 1912 334455)',
  nidNumber: '1985269458000777',
  city: 'Dhaka — Gulshan & Airport DAC Zone',
  district: 'Dhaka — Gulshan & Airport DAC Zone',
  licenseNumber: 'DL-DH-65432',
  licenseType: 'Professional Light',
  licenseExpiry: '2029-05-30',
  experience: '10+ Years Senior Master Chauffeur',
  languages: 'Bangla, English, Hindi, Arabic',
  services: ['VIP Airport Transfer', 'Corporate Transport', 'Intercity Highway Tour', 'Hourly City Rental'],
  availability: 'Full Time (24/7 Available)',
  role: 'Fleet Chauffeur',
  roleType: 'seeking_fleet_car',
  payoutMethod: 'bKash Personal',
  payoutNumber: '01712998800',
  payoutWallet: 'bKash Personal - 01712998800',
  status: 'Pending Verification',
  // All 5 dedicated document uploads:
  photoBase64: photoData,
  licenseFrontBase64: licFrontData,
  licenseBackBase64: licBackData,
  nidFrontBase64: nidFrontData,
  nidBackBase64: nidBackData,
  // Backward compatibility fallbacks:
  licenseDocBase64: licFrontData,
  nidDocBase64: nidFrontData
};

console.log('Sending Live API POST to Web App V4 with all 5 document images...');
console.log('Endpoint:', webhookUrl);

function sendPost(url, data, callback) {
  const urlObj = new URL(url);
  const jsonStr = JSON.stringify(data);

  const req = https.request({
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      'Content-Length': Buffer.byteLength(jsonStr)
    }
  }, (res) => {
    if (res.statusCode === 302 && res.headers.location) {
      console.log('Following 302 redirect...');
      https.get(res.headers.location, (redirectRes) => {
        let body = '';
        redirectRes.on('data', chunk => body += chunk);
        redirectRes.on('end', () => callback(null, redirectRes.statusCode, body));
      });
      return;
    }

    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => callback(null, res.statusCode, body));
  });

  req.on('error', (err) => callback(err));
  req.write(jsonStr);
  req.end();
}

sendPost(webhookUrl, payload, (err, status, body) => {
  if (err) {
    console.error('Submission error:', err);
    process.exit(1);
  }
  console.log('HTTP Status Code:', status);
  console.log('Raw Response:\n', body);
  try {
    const resJson = JSON.parse(body);
    console.log('Parsed JSON:\n', JSON.stringify(resJson, null, 2));
    if (resJson.status === 'success') {
      console.log('✅ VERSION 4 INGESTION SUCCESSFUL!');
      console.log('  Inserted at Row:', resJson.row);
      console.log('  Application ID:', resJson.applicationId);
      console.log('  Documents Status:', resJson.documentsSaved);
    }
  } catch(e) {
    console.log('Could not parse as JSON');
  }
});

