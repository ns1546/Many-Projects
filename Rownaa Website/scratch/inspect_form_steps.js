const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

function showSection(name, startTag, endTag) {
  const s = content.indexOf(startTag);
  const e = content.indexOf(endTag, s);
  console.log('=== ' + name + ' ===');
  console.log(content.slice(s, s + 800));
}

showSection('Step 3 Header', 'id="step-3"', '<!-- Services Grid');
showSection('Step 4 Header', 'id="step-4"', '<!-- Role Tiles');
showSection('Step 5 Header', 'id="step-5"', '<!-- Upload Zone 1');

