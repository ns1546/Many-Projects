const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');
const lines = html.split('\n');
console.log('Lines around map implementation:');
console.log(lines.slice(2760, 2840).join('\n'));
