const fs = require('fs');
const inv = fs.readFileSync('g:/Download Official/Rownaa Website/js/inventory.js', 'utf8');
const idx = inv.indexOf('getPaginated');
console.log(inv.substring(idx, idx + 1800));
