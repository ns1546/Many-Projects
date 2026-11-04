const fs = require('fs');
const c = fs.readFileSync('driver-register.html', 'utf8');
const p = c.indexOf('id="pane-step-5"');
console.log(c.slice(p, p + 2200));
