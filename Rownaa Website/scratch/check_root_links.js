const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') || f.endsWith('.js'));
const rootRelativeLinks = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // Check href='/... or href="/...
    const mHref = l.match(/href=["'](\/[a-zA-Z0-9_\-\.]+\.html[^"']*)/i);
    if (mHref) rootRelativeLinks.push({ file: f, line: idx + 1, match: mHref[1], text: l.trim() });

    // Check location.href = '/...
    const mLoc = l.match(/location\.(href|replace|assign)\s*=\s*["'](\/[a-zA-Z0-9_\-\.]+\.html[^"']*)/i);
    if (mLoc) rootRelativeLinks.push({ file: f, line: idx + 1, match: mLoc[2], text: l.trim() });

    // Check window.open('/...
    const mOpen = l.match(/window\.open\s*\(\s*["'](\/[a-zA-Z0-9_\-\.]+\.html[^"']*)/i);
    if (mOpen) rootRelativeLinks.push({ file: f, line: idx + 1, match: mOpen[1], text: l.trim() });
  });
});

console.log('Found root-relative page navigations:', rootRelativeLinks.length);
rootRelativeLinks.forEach(r => console.log(`${r.file}:${r.line} -> ${r.match} | ${r.text}`));

