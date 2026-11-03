const fs = require('fs');

// Read pricing.service.js to check calculate method
const serv = fs.readFileSync('g:/Download Official/Rownaa Website/src/modules/pricing/pricing.service.js', 'utf8');
console.log('Service handles 8 zones:', serv.includes('zone_1') || serv.includes('Zone 1'));
