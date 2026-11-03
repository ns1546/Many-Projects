const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const reg = /<script[^>]+src=["']([^"']+)["']/g;
  const seen = {};
  let m;
  const dupes = [];
  while ((m = reg.exec(c)) !== null) {
    if (seen[m[1]]) dupes.push(m[1]);
    else seen[m[1]] = true;
  }
  if (dupes.length) console.log(f, dupes);
});

