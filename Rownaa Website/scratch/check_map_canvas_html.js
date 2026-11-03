const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(2190, 2235).join('\n'));
