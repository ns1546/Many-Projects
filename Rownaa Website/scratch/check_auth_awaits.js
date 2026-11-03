const fs = require('fs');
const auth = fs.readFileSync('g:/Download Official/Rownaa Website/js/auth.js', 'utf8');
const lines = auth.split('\n');
lines.forEach((l, i) => {
  if (l.includes('await ')) {
    console.log(`Line ${i+1}: ${l.trim()}`);
  }
});
