const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');
const lines = html.split('\n');
console.log('--- LINES 1310-1350 ---');
console.log(lines.slice(1310, 1345).join('\n'));
console.log('--- LINES 1630-1685 ---');
console.log(lines.slice(1630, 1685).join('\n'));
