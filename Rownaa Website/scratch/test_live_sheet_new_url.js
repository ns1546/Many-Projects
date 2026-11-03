const https = require('https');

const targetUrl = 'https://script.google.com/macros/s/AKfycbyIfi-UfdbxfeNBu_8mo33CAN0SasA1EjBP4ahScIoHWVfuMUzjPoG2DjPwddBzVyNbTQ/exec';

const payload = JSON.stringify({
  action: 'ping',
  source: 'Rownaa Dev Team Verification',
  timestamp: new Date().toISOString()
});

console.log('Sending test POST to new Web App URL:', targetUrl);

const req = https.request(targetUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  console.log('Response Status:', res.statusCode);
  console.log('Response Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response Body:', data);
    if (res.statusCode >= 200 && res.statusCode < 400) {
      console.log('✅ Web App Endpoint reached successfully!');
    }
  });
});

req.on('error', (e) => {
  console.error('Ping error:', e.message);
});

req.write(payload);
req.end();

