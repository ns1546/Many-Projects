const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const p = content.indexOf('step5: {');
console.log(content.slice(p, p + 2500));

