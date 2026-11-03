const fs = require('fs');
const ap = fs.readFileSync('admin-panel.html', 'utf8');
const reg = /id=["'](pnl-[^"']+)["']/g;
let m;
while ((m = reg.exec(ap)) !== null) {
  console.log(m[1]);
}

