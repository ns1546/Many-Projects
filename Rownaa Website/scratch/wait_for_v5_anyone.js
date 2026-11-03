const https = require('https');

const v5Url = 'https://script.google.com/macros/s/AKfycbyIfi-UfdbxfeNBu_8mo33CAN0SasA1EjBP4ahScIoHWVfuMUzjPoG2DjPwddBzVyNbTQ/exec';

function check() {
  https.get(v5Url, res => {
    const loc = res.headers.location || '';
    if (loc.includes('ServiceLogin')) {
      console.log('Status: Still "Only myself" (Redirects to Google Login)');
    } else if (loc.includes('googleusercontent.com')) {
      console.log('Status: ✅ OPEN! "Who has access" is now set to "Anyone"!');
    } else {
      console.log('Status code:', res.statusCode);
    }
  }).on('error', e => console.error(e.message));
}

check();

