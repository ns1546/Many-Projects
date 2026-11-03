const fs = require('fs');
const path = require('path');

const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
const results = [];

jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join('js', file), 'utf8');
  const fetches = (content.match(/fetch\s*\(/g) || []).length;
  const catches = (content.match(/\.catch\s*\(/g) || []).length;
  const tryCatches = (content.match(/try\s*\{/g) || []).length;
  results.push({ file, fetches, catches, tryCatches });
});

console.table(results);
