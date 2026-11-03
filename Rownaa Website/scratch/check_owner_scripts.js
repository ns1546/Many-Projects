const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/owner-panel.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('<script')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
