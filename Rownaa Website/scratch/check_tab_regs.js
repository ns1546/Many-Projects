const fs = require('fs');

const content = fs.readFileSync('admin-panel.html', 'utf8');
const lines = content.split('\n');

const idxRegs = lines.findIndex(l => l.includes('id="tab-regs"') || l.includes('data-tab="regs"'));
console.log('tab-regs at line:', idxRegs);
if (idxRegs >= 0) {
  console.log(lines.slice(idxRegs, idxRegs + 40).join('\n'));
}
