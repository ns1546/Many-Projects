const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

console.log(content.slice(189500, 192500));

