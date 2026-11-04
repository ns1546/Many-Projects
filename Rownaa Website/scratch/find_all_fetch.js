const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const regex = /fetch\([^)]+\)/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Match at pos:', m.index, m[0].slice(0, 100));
  console.log(content.slice(m.index - 200, m.index + 800));
}
