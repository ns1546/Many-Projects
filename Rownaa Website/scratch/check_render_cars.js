const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/find-cars.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(370, 440).join('\n'));
