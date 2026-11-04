const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const regex = /<div[^>]+id="step-[0-9]"[^>]*>/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Match:', m[0], 'at pos:', m.index);
}

// Or search for 'step-1', 'step-2', etc
['step-1', 'step-2', 'step-3', 'step-4', 'step-5'].forEach(s => {
  const pos = content.indexOf(s);
  console.log(s, 'found at:', pos, content.slice(pos - 20, pos + 40));
});

