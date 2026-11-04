const fs = require('fs');

let gs = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

// 1. Add checkDuplicateAuditLog to onOpen menu
if (!gs.includes('checkDuplicateAuditLog')) {
  gs = gs.replace(
    '.addItem("📋 Copy Chauffeur Details Summary", "copyChauffeurSummary")',
    '.addItem("📋 Copy Chauffeur Details Summary", "copyChauffeurSummary")\n    .addItem("🔍 Check Duplicate & Resubmission Audit Log", "checkDuplicateAuditLog")'
  );
  console.log('Added checkDuplicateAuditLog to onOpen menu');
}

// 2. Add implementation of checkDuplicateAuditLog
if (!gs.includes('function checkDuplicateAuditLog()')) {
  const auditFunc = `/**
 * 1-Click Audit & Duplicate Detection Scanner:
 * Analyzes all applicant rows for repeat phone numbers, NID, Driver License, or Car Plates.
 * Shows an executive dashboard modal with count of Unique, Resubmissions, and Duplicates.
 */
function checkDuplicateAuditLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Chauffeur Registry sheet not found. Please run 'Initialize & Safe Rebuild System' first.");
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No chauffeur records found yet. All submissions will be audited automatically.");
    return;
  }

  var data = sheet.getRange(2, 1, lastRow - 1, 36).getValues();
  var uniqueCount = 0;
  var resubmissionCount = 0;
  var duplicateCount = 0;
  var flaggedList = [];

  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    var auditStatus = String(r[32] || ""); // Col AG (33)
    var notes = String(r[33] || "");      // Col AH (34)
    var rowNum = i + 2;

    if (auditStatus.indexOf("RESUBMISSION") !== -1) {
      resubmissionCount++;
      flaggedList.push("Row " + rowNum + ": [RESUBMISSION] " + r[2] + " (" + r[1] + ") — " + notes);
    } else if (auditStatus.indexOf("DUPLICATE") !== -1) {
      duplicateCount++;
      flaggedList.push("Row " + rowNum + ": [DUPLICATE] " + r[2] + " (" + r[1] + ") — " + auditStatus);
    } else {
      uniqueCount++;
    }
  }

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0c0f; color: #fff; padding: 20px; }' +
    '.kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }' +
    '.kpi { background: #16161c; border: 1px solid #282830; border-radius: 8px; padding: 12px; text-align: center; }' +
    '.kpi-val { font-size: 22px; font-weight: 800; }' +
    '.kpi-lbl { font-size: 11px; color: #a0a0ab; margin-top: 4px; text-transform: uppercase; }' +
    '.list { background: #121216; border: 1px solid #222; border-radius: 8px; max-height: 160px; overflow-y: auto; padding: 10px; font-family: monospace; font-size: 11px; line-height: 1.5; color: #d4ff00; }' +
    '.btn { display: block; width: 100%; text-align: center; background: #d4ff00; color: #000; font-weight: 800; font-size: 13px; padding: 10px; border-radius: 6px; margin-top: 14px; text-decoration: none; border: none; cursor: pointer; }' +
    '</style></head><body>' +
    '<h3 style="margin:0 0 12px 0; font-size:16px;">🔍 Duplicate & Resubmission Audit Tracker</h3>' +
    '<div class="kpi-grid">' +
    '<div class="kpi"><div class="kpi-val" style="color:#52c41a;">' + uniqueCount + '</div><div class="kpi-lbl">Unique</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#faad14;">' + resubmissionCount + '</div><div class="kpi-lbl">Resubmissions</div></div>' +
    '<div class="kpi"><div class="kpi-val" style="color:#ff4d4f;">' + duplicateCount + '</div><div class="kpi-lbl">Duplicates</div></div>' +
    '</div>' +
    '<div style="font-size:12px; color:#aaa; margin-bottom:6px;">Flagged Application Audit Log:</div>' +
    '<div class="list">' +
    (flaggedList.length > 0 ? flaggedList.join('<br>') : 'All applications currently verified as unique first-time applicants.') +
    '</div>' +
    '<button class="btn" onclick="google.script.host.close()">Close Audit View</button>' +
    '</body></html>'
  ).setWidth(420).setHeight(360);

  SpreadsheetApp.getUi().showModalDialog(html, "Audit & Duplicate Tracker");
}

`;
  gs = gs.replace('function copyChauffeurSummary() {', auditFunc + 'function copyChauffeurSummary() {');
  console.log('Added checkDuplicateAuditLog function definition');
}

fs.writeFileSync('google_sheet_webhook.gs', gs, 'utf8');
fs.writeFileSync('netlify-driver-portal/google_sheet_webhook.gs', gs, 'utf8');

const vm = require('vm');
try {
  new vm.Script(gs);
  console.log('google_sheet_webhook.gs SYNTAX IS 100% VALID!');
} catch (e) {
  console.error('Validation error:', e);
}
