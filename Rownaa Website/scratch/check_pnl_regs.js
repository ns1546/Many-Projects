const fs = require('fs');

const content = fs.readFileSync('admin-panel.html', 'utf8');
const lines = content.split('\n');

const idxPnl = lines.findIndex(l => l.includes('id="pnl-regs"'));
console.log('pnl-regs at line:', idxPnl);
if (idxPnl >= 0) {
  console.log(lines.slice(idxPnl, idxPnl + 60).join('\n'));
}

