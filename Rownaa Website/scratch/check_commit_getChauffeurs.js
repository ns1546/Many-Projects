const { execSync } = require('child_process');
const code = execSync('git show 1108208:google_sheet_webhook.gs', { encoding: 'utf8' });
const p = code.indexOf('if (action === "getChauffeurs")');
console.log(code.slice(p + 350, p + 1400));
