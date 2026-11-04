const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const p = content.indexOf('const I18N =');
console.log(content.slice(p, p + 2000));

