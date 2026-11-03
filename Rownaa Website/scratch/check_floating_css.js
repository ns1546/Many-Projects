const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('btn-floating') || l.includes('map-floating-controls')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
