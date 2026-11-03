const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/find-cars.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(275, 365).join('\n'));
