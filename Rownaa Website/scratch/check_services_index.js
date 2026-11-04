const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const lines = indexHtml.split('\n');

console.log('Total lines in index.html:', lines.length);

lines.forEach((l, i) => {
  const low = l.toLowerCase();
  if (low.includes('id="services"') || low.includes('class="services') || low.includes('our services') || low.includes('choose your car')) {
    console.log(`Line ${i + 1}: ${l.trim().substring(0, 100)}`);
  }
});

