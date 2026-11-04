const fs = require('fs');

const content = fs.readFileSync('admin-panel.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('nav-item') || l.includes('tab-pane') || l.includes('section-title') || l.includes('Chauffeur') || l.includes('Driver')) {
    if (i < 400) console.log(`Line ${i + 1}: ${l.trim().substring(0, 100)}`);
  }
});

