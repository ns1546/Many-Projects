const fs = require('fs');

['admin-panel.html', 'checkout.html', 'owner-panel.html'].forEach(filename => {
  const lines = fs.readFileSync(filename, 'utf8').split('\n');
  console.log(`=== ${filename} ===`);
  lines.forEach((l, i) => {
    if (l.includes('<script') && l.includes('src=')) {
      console.log(`${i + 1}: ${l.trim()}`);
    }
  });
});

