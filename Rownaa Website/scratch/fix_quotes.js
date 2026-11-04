const fs = require('fs');

let code = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

// Replace formula sheet name quotes
code = code.split("'=COUNTA('' + SHEET_REGISTRY_NAME + ''!B2:B)'").join("'=COUNTA(\\'' + SHEET_REGISTRY_NAME + '\\'!B2:B)'");
code = code.split("'=COUNTIF('' + SHEET_REGISTRY_NAME + ''!W2:W").join("'=COUNTIF(\\'' + SHEET_REGISTRY_NAME + '\\'!W2:W");
code = code.split("!W2:W, \"Pending Verification\")'").join("!W2:W, \"Pending Verification\")'");
code = code.split("''!W2:W").join("\\'!W2:W");
code = code.split("''!M2:M").join("\\'!M2:M");
code = code.split("''!G2:G").join("\\'!G2:G");
code = code.split("COUNTIF('' + SHEET_REGISTRY_NAME").join("COUNTIF(\\'' + SHEET_REGISTRY_NAME");

fs.writeFileSync('google_sheet_webhook.gs', code, 'utf8');
fs.writeFileSync('netlify-driver-portal/google_sheet_webhook.gs', code, 'utf8');

const vm = require('vm');
try {
  new vm.Script(code);
  console.log('google_sheet_webhook.gs SYNTAX IS 100% VALID!');
} catch (e) {
  console.log('Still error:', e);
}
