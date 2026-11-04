const fs = require('fs');
let content = fs.readFileSync('scratch/build_clean_2tab_webhook.js', 'utf8');
let lines = content.split('\n');

lines[171] = '    "• Audit Tracking: " + (r[34] || "Unique") + "\\\\n" +';

fs.writeFileSync('scratch/build_clean_2tab_webhook.js', lines.join('\n'), 'utf8');
console.log('Fixed line 172 cleanly');
