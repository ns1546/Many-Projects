const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(2830, 2920).join('\n'));
