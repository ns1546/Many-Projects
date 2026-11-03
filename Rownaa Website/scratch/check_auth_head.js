const fs = require('fs');
const auth = fs.readFileSync('g:/Download Official/Rownaa Website/js/auth.js', 'utf8');
const lines = auth.split('\n');
console.log(lines.slice(0, 50).join('\n'));
