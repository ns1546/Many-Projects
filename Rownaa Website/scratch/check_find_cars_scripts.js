const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/find-cars.html', 'utf8');

// Find all script tags
const scripts = [];
const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  scripts.push({ tag: match[0].split('>')[0] + '>', inline: match[1].slice(0, 80) });
}
console.log('Scripts in find-cars.html:');
scripts.forEach((s, i) => console.log(i + 1, s.tag, s.inline.trim().replace(/\n/g, ' ')));
