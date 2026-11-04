const fs = require('fs');

const content = fs.readFileSync('admin-panel.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('rownaa_driver_applications') || l.includes('getChauffeurs') || l.includes('drivers-table') || l.includes('renderDrivers')) {
    console.log(`Line ${i + 1}: ${l.trim().substring(0, 100)}`);
  }
});

