const fs = require('fs');

const content = fs.readFileSync('google_sheet_webhook.gs', 'utf8');
const lines = content.split('\n');

const idxGet = lines.findIndex(l => l.includes('getChauffeurs'));
console.log('getChauffeurs around line:', idxGet);
if (idxGet >= 0) {
  console.log(lines.slice(idxGet - 5, idxGet + 45).join('\n'));
}

