const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/find-cars.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('animate-slide') || l.includes('fc-grid') || l.includes('cars-container')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});
