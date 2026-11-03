const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

console.log('function cnt defined?', /function\s+cnt\b/.test(content));
console.log('function goBook defined?', /function\s+goBook\b/.test(content));
console.log('nav-burger handled?', content.includes('nav-burger'));
console.log('bs-tab click listeners?', content.includes('bs-tab'));

// Let's print out all script tags in index.html to see what scripts exist
const scriptRegex = /<script\b[^>]*>(.*?)<\/script>/gis;
let sm;
let count = 0;
while ((sm = scriptRegex.exec(content)) !== null) {
  count++;
  console.log(`--- SCRIPT ${count} (length: ${sm[1].length}) ---`);
  if (sm[1].length < 1000) {
    console.log(sm[1]);
  } else {
    console.log(sm[1].slice(0, 300) + '... [TRUNCATED]');
  }
}
