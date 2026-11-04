const fs = require('fs');
const content = fs.readFileSync('driver-register.html', 'utf8');

function printPane(paneId, len = 1500) {
  const p = content.indexOf(`id="${paneId}"`);
  console.log(`=== ${paneId} ===`);
  console.log(content.slice(p, p + len));
}

printPane('pane-step-3', 1800);

