const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = [...content.matchAll(/id=["']([^"']*(?:modal|overlay|slide-panel|popup)[^"']*)["']/gi)];
  if (matches.length > 0) {
    console.log(f, matches.map(m => m[1]));
  }
}

