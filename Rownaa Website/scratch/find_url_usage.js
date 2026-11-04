const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const p = content.indexOf('DEFAULT_GOOGLE_SHEET_URL');
console.log(content.slice(p, p + 3000));

