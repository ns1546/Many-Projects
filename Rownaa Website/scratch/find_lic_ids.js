const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

const regex = /id="[^"]*lic[^"]*"/gi;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(m[0], 'around pos:', m.index);
}

