const fs = require('fs');

const content = fs.readFileSync('admin-panel.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes('<nav') || l.includes('class="nav-item"') || l.includes('switchTab')) {
    console.log(`Line ${i + 1}: ${l.trim().substring(0, 100)}`);
  }
});

