const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const p = content.indexOf('function selectRoleTile');
console.log(content.slice(p, p + 1000));

