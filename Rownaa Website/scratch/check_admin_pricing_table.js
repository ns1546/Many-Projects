const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/admin-panel.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(865, 960).join('\n'));
