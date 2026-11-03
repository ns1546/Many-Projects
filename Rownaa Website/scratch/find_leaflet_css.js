const fs = require('fs');
const content = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('leaflet') || l.includes('Leaflet')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
