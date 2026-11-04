const fs = require('fs');

const html = fs.readFileSync('find-cars.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (l.includes('Toyota') || l.includes('Premio') || l.includes('Noah') || l.includes('HiAce') || l.includes('Axio') || l.includes('Prado')) {
    console.log(`${i + 1}: ${l.trim().substring(0, 100)}`);
  }
});

