const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/admin-panel.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('pricing') || l.includes('tb-hourly') || l.includes('tb-intercity') || l.includes('tb-airport')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
