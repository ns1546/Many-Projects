const fs = require('fs');
let lines = fs.readFileSync('scratch/build_clean_2tab_webhook.js', 'utf8').split('\n');

const cleanDossierLines = [
  '    "• Payout Wallet: " + (r[21] || "N/A") + "\\\\n" +',
  '    "• Verification Status: " + (r[22] || "Pending Verification") + "\\\\n" +',
  '    "• Documents Vault: " + (r[33] || "Drive Folder") + "\\\\n" +',
  '    "• Audit Tracking: " + (r[34] || "Unique") + "\\\\n" +',
  '    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";'
];

// Find where "• Payout Wallet:" begins
const idx = lines.findIndex(l => l.includes('"• Payout Wallet: "'));
if (idx !== -1) {
  // Find where "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; ends
  const endIdx = lines.findIndex(l => l.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  lines.splice(idx, endIdx - idx + 1, ...cleanDossierLines);
  fs.writeFileSync('scratch/build_clean_2tab_webhook.js', lines.join('\n'), 'utf8');
  console.log('Cleaned dossier section successfully');
} else {
  console.error('Payout wallet line not found');
}
