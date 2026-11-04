const fs = require('fs');
let lines = fs.readFileSync('scratch/build_clean_2tab_webhook.js', 'utf8').split('\n');

// Remove lines from index 175 to 178 (0-indexed: 175, 176, 177, 178)
lines.splice(175, 4);

fs.writeFileSync('scratch/build_clean_2tab_webhook.js', lines.join('\n'), 'utf8');
console.log('Removed duplicate lines');

