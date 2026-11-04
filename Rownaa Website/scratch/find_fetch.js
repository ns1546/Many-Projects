const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const regex = /fetch\(\s*GOOGLE_SHEET_WEBHOOK_URL/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Match at pos:', m.index);
  console.log(content.slice(m.index - 500, m.index + 1500));
}

