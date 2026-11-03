const fs = require('fs');
fs.copyFileSync('google_sheet_webhook.gs', 'netlify-driver-portal/google_sheet_webhook.gs');
console.log('Synchronized google_sheet_webhook.gs to netlify-driver-portal/');

