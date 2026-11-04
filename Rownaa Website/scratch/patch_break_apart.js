const fs = require('fs');

function patchWebhookFile(filePath) {
  let raw = fs.readFileSync(filePath, 'utf8');
  let isCrlf = raw.includes('\r\n');
  let content = raw.replace(/\r\n/g, '\n');

  // 1. In autoAlignAndRepairSheet, add defensive breakApart right after ensuring 36 columns
  const target1 = `  // 2. Ensure at least 36 columns exist
  var currentCols = sheet.getMaxColumns();
  if (currentCols < 36) {
    sheet.insertColumnsAfter(currentCols, 36 - currentCols);
  }`;

  const replace1 = `  // 2. Ensure at least 36 columns exist
  var currentCols = sheet.getMaxColumns();
  if (currentCols < 36) {
    sheet.insertColumnsAfter(currentCols, 36 - currentCols);
  }

  // 2b. DEFENSIVE HEALING: Unfreeze & Break apart any existing merged cells to prevent freeze exceptions
  try {
    sheet.setFrozenRows(0);
    sheet.setFrozenColumns(0);
    var breakR = Math.min(10, sheet.getMaxRows());
    var breakC = Math.max(60, sheet.getMaxColumns());
    sheet.getRange(1, 1, breakR, breakC).breakApart();
  } catch (breakErr) {
    Logger.log("Break apart note: " + breakErr.toString());
  }

  // Clear stale sub-header row if previous experimental sub-columns left Row 2 corrupted
  try {
    if (sheet.getLastRow() >= 2) {
      var r2c1 = String(sheet.getRange(2, 1).getValue()).toLowerCase();
      var r2c2 = String(sheet.getRange(2, 2).getValue()).toLowerCase();
      if ((r2c1.includes("timestamp") || r2c2.includes("application id")) && !r2c2.startsWith("drv-") && !r2c2.startsWith("flt-")) {
        sheet.deleteRow(2);
      }
    }
  } catch (r2Err) {
    Logger.log("Row 2 clean note: " + r2Err.toString());
  }`;

  if (content.includes(target1)) {
    content = content.replace(target1, replace1);
    console.log('Patched target1 in', filePath);
  } else {
    console.error('target1 NOT found in', filePath);
  }

  if (isCrlf) {
    content = content.replace(/\n/g, '\r\n');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated and saved', filePath);
}

patchWebhookFile('google_sheet_webhook.gs');
patchWebhookFile('netlify-driver-portal/google_sheet_webhook.gs');
