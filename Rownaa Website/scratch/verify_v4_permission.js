const https = require('https');

const v4Url = 'https://script.google.com/macros/s/AKfycbyIfi-UfdbxfeNBu_8mo33CAN0SasA1EjBP4ahScIoHWVfuMUzjPoG2DjPwddBzVyNbTQ/exec';

https.get(v4Url, res => {
  console.log('V4 Initial Status:', res.statusCode);
  console.log('Location:', res.headers.location);
  if (res.headers.location && res.headers.location.includes('ServiceLogin')) {
    console.log('❌ V4 is currently restricted: "Who has access" is set to "Only myself".');
  } else if (res.headers.location && res.headers.location.includes('googleusercontent.com')) {
    console.log('✅ V4 is OPEN: "Who has access" is set to "Anyone"!');
  }
});

