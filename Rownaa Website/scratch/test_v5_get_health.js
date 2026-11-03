const https = require('https');

const v5Url = 'https://script.google.com/macros/s/AKfycbyIfi-UfdbxfeNBu_8mo33CAN0SasA1EjBP4ahScIoHWVfuMUzjPoG2DjPwddBzVyNbTQ/exec';

console.log('Testing GET (Health & Permissions) on Version 5 endpoint...');
console.log('URL:', v5Url);

https.get(v5Url, (res) => {
  console.log('Initial Status Code:', res.statusCode);
  console.log('Location Header:', res.headers.location);

  if (res.statusCode === 302 && res.headers.location) {
    if (res.headers.location.includes('ServiceLogin')) {
      console.log('❌ Version 5 is still set to "Only myself". Redirected to Google Login.');
      return;
    }

    console.log('Following 302 redirect to content...');
    https.get(res.headers.location, (redRes) => {
      let body = '';
      redRes.on('data', chunk => body += chunk);
      redRes.on('end', () => {
        console.log('Redirected Final Status:', redRes.statusCode);
        console.log('Response Body:\n', body);
        try {
          const json = JSON.parse(body);
          console.log('Parsed JSON:\n', JSON.stringify(json, null, 2));
          if (json.status === 'online') {
            console.log('🎉 VERSION 5 ACCESS IS FULLY OPEN AND OPERATIONAL!');
          }
        } catch(e) {
          console.log('Could not parse response as JSON');
        }
      });
    });
  } else {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Body:\n', body));
  }
}).on('error', err => console.error('Error:', err));

