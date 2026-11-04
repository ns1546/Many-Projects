const fs = require('fs');
const c = fs.readFileSync('google_sheet_webhook.gs', 'utf8');
const p = c.indexOf('if (action === "getChauffeurs")');
console.log(c.slice(p, p + 1200));

