const fs = require('fs');

let code = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

code = code.replace('dFormula.replace(/^=++?/, "+")', 'dFormula.replace(/^=+\\\\+?/, "+")');
code = code.replace('dFormula.replace(/^=+\\+?/, "+")', 'dFormula.replace(/^=+\\\\+?/, "+")');

fs.writeFileSync('google_sheet_webhook.gs', code, 'utf8');
fs.writeFileSync('netlify-driver-portal/google_sheet_webhook.gs', code, 'utf8');

const vm = require('vm');
try {
  new vm.Script(code);
  console.log('google_sheet_webhook.gs SYNTAX IS 100% VALID!');
} catch (e) {
  console.error('Validation error:', e);
}

