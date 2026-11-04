const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const regex = /function\s+([a-zA-Z0-9_]*lang[a-zA-Z0-9_]*)\s*\(/gi;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Match:', m[1], 'at pos:', m.index);
}

// Or toggleLang
const p = content.indexOf('toggleLang');
if (p !== -1) {
  console.log('toggleLang found at:', p);
  console.log(content.slice(p, p + 2000));
}

