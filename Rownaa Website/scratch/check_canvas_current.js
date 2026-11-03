const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');
const lines = html.split('\n');
console.log('--- MAP CANVAS CONTAINER HTML ---');
console.log(lines.slice(2200, 2260).join('\n'));
