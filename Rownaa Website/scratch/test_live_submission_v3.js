const https = require('https');

const webhookUrl = 'https://script.google.com/macros/s/AKfycbyIfi-UfdbxfeNBu_8mo33CAN0SasA1EjBP4ahScIoHWVfuMUzjPoG2DjPwddBzVyNbTQ/exec';

// 1x1 transparent PNG in base64
const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const payload = {
  submittedAt: new Date().toISOString(),
  timestamp: new Date().toISOString(),
  applicationId: 'DRV-DAC-2026-' + Math.floor(1000 + Math.random() * 9000),
  fullName: 'Kamal Uddin Majumdar (Verified Chauffeur)',
  name: 'Kamal Uddin Majumdar (Verified Chauffeur)',
  phone: '+880 1711 998877',
  emergencyContact: 'Rehana Begum (+880 1911 223344)',
  nidNumber: '1988269458000192',
  city: 'Dhaka - Gulshan & Airport DAC Zone',
  district: 'Dhaka - Gulshan & Airport DAC Zone',
  licenseNumber: 'DL-DH-77889',
  licenseType: 'Professional Light',
  licenseExpiry: '2028-11-20',
  experience: '7+ Years Executive VIP Experience',
  languages: 'Bangla, English, Hindi',
  services: ['VIP Airport Transfer', 'Corporate Chauffeur', 'Intercity Highway Tour'],
  availability: 'Full Time (24/7 VIP Chauffeur)',
  role: 'Fleet Chauffeur',
  payoutMethod: 'bKash Personal',
  payoutNumber: '01711998877',
  payoutWallet: 'bKash Personal - 01711998877',
  status: 'Pending Verification',
  photoBase64: samplePngBase64,
  licenseFrontBase64: samplePngBase64,
  licenseBackBase64: samplePngBase64,
  licenseDocBase64: samplePngBase64,
  nidFrontBase64: samplePngBase64,
  nidBackBase64: samplePngBase64,
  nidDocBase64: samplePngBase64
};

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

console.log('Testing full payload with documents...');
sendPost(webhookUrl, payload, (err, status, body) => {
  if (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
  console.log('Status:', status);
  console.log('Response:\n', body);
});
