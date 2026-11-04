const fs = require('fs');

let code = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

// Replace kpiFormulas array
const oldKpiBlock = `  var kpiFormulas = [
    '=COUNTA(\\'' + SHEET_REGISTRY_NAME + '\\'!B2:B)',
    '=COUNTIF(\\'' + SHEET_REGISTRY_NAME + '\\'!W2:W, "Pending Verification")',
    '=COUNTIF(\\'' + SHEET_REGISTRY_NAME + '\\'!W2:W, "Under Review")',
    '=COUNTIF(\\'' + SHEET_REGISTRY_NAME + '\\'!W2:W, "Contacted & Scheduled")',
    '=COUNTIF(\\'' + SHEET_REGISTRY_NAME + '\\'!W2:W, "Approved & Verified")',
    '=COUNTIF(\\'' + SHEET_REGISTRY_NAME + '\\'!W2:W, "Rejected")',
    '=COUNTIF(\\'' + SHEET_REGISTRY_NAME + \\'!M2:M, "*Metro*") + COUNTIF(\\'' + SHEET_REGISTRY_NAME + \\'!M2:M, "*GA*") + COUNTIF(\\'' + SHEET_REGISTRY_NAME + \\'!M2:M, "*CHA*")',
    '=IF(A4=0, 0, (E4/A4))'
  ];`;

const newKpiBlock = `  var kpiFormulas = [
    "=COUNTA('" + SHEET_REGISTRY_NAME + "'!B2:B)",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \\"Pending Verification\\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \\"Under Review\\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \\"Contacted & Scheduled\\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \\"Approved & Verified\\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \\"Rejected\\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!M2:M, \\"*Metro*\\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!M2:M, \\"*GA*\\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!M2:M, \\"*CHA*\\")",
    "=IF(A4=0, 0, (E4/A4))"
  ];`;

code = code.replace(oldKpiBlock, newKpiBlock);

// Replace geo formulas
code = code.replace(
  'dash.getRange("B10:C10").merge().setFormula(\'=COUNTIF(\\\'\' + SHEET_REGISTRY_NAME + \\\'!G2:G, "*Gulshan*") + COUNTIF(\\\'\' + SHEET_REGISTRY_NAME + \\\'!G2:G, "*Banani*") + COUNTIF(\\\'\' + SHEET_REGISTRY_NAME + \\\'!G2:G, "*Airport*")\');',
  'dash.getRange("B10:C10").merge().setFormula("=COUNTIF(\'" + SHEET_REGISTRY_NAME + "\'!G2:G, \\"*Gulshan*\\") + COUNTIF(\'" + SHEET_REGISTRY_NAME + "\'!G2:G, \\"*Banani*\\") + COUNTIF(\'" + SHEET_REGISTRY_NAME + "\'!G2:G, \\"*Airport*\\")");'
);

code = code.replace(
  'dash.getRange("B11:C11").merge().setFormula(\'=COUNTIF(\\\'\' + SHEET_REGISTRY_NAME + \\\'!G2:G, "*Uttara*")\');',
  'dash.getRange("B11:C11").merge().setFormula("=COUNTIF(\'" + SHEET_REGISTRY_NAME + "\'!G2:G, \\"*Uttara*\\")");'
);

code = code.replace(
  'dash.getRange("B12:C12").merge().setFormula(\'=COUNTIF(\\\'\' + SHEET_REGISTRY_NAME + \\\'!G2:G, "*Dhanmondi*") + COUNTIF(\\\'\' + SHEET_REGISTRY_NAME + \\\'!G2:G, "*Mirpur*")\');',
  'dash.getRange("B12:C12").merge().setFormula("=COUNTIF(\'" + SHEET_REGISTRY_NAME + "\'!G2:G, \\"*Dhanmondi*\\") + COUNTIF(\'" + SHEET_REGISTRY_NAME + "\'!G2:G, \\"*Mirpur*\\")");'
);

fs.writeFileSync('google_sheet_webhook.gs', code, 'utf8');
fs.writeFileSync('netlify-driver-portal/google_sheet_webhook.gs', code, 'utf8');

const vm = require('vm');
try {
  new vm.Script(code);
  console.log('google_sheet_webhook.gs SYNTAX IS 100% VALID!');
} catch (e) {
  console.error('Validation error:', e);
}
