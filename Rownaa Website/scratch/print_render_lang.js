const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const p = content.indexOf('function renderLanguage()');
console.log(content.slice(p, p + 2500));

