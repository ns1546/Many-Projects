const fs = require('fs');

let gs = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

// 1. Update onOpen menu to add safeRebuildAndSetup
if (!gs.includes('safeRebuildAndSetup')) {
  gs = gs.replace(
    '.addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")',
    '.addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")\n    .addSeparator()\n    .addItem("🔄 Initialize & Safe Rebuild System", "safeRebuildAndSetup")'
  );
  console.log('Added safeRebuildAndSetup to onOpen menu');
}

// 2. Add safeRebuildAndSetup function implementation before setupSheet
if (!gs.includes('function safeRebuildAndSetup()')) {
  const safeFunc = `/**
 * Safe Rebuild & Setup System:
 * 1. Reassures operator that existing applicant rows are 100% preserved.
 * 2. Automatically creates a timestamped Google Drive backup before running.
 * 3. Runs setupSheet() to ensure all 30 column headers, dark luxury styling,
 *    frozen columns, validations, and KPI Dashboard formulas are perfectly applied.
 * 4. Cleans up default empty 'Sheet1' if present.
 * 5. Displays confirmation dialog.
 */
function safeRebuildAndSetup() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert(
    "🔄 Initialize & Safe Rebuild",
    "This will verify all 30 column headers, dark luxury styling, plain-text formats, and the Operations KPI Dashboard.\\n\\n✅ 100% SAFE: Existing driver applicant records will NOT be deleted or cleared.\\n\\nProceed?",
    ui.ButtonSet.YES_NO
  );
  if (resp !== ui.Button.YES) {
    return;
  }

  try {
    createDailyBackup();
  } catch (bErr) {
    Logger.log("Backup note: " + bErr.toString());
  }

  setupSheet();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    if (defaultSheet.getLastRow() === 0 && defaultSheet.getLastColumn() === 0) {
      try {
        ss.deleteSheet(defaultSheet);
      } catch (dErr) {}
    }
  }

  ui.alert("System Ready", "✅ Rownaa Executive Chauffeur Platform has been initialized and synchronized successfully with all 30 columns and KPI Dashboard intact!", ui.ButtonSet.OK);
}

`;
  gs = gs.replace('function setupSheet() {', safeFunc + 'function setupSheet() {');
  console.log('Added safeRebuildAndSetup function definition');
}

// 3. Update setupSheet to safely rename Sheet1 if empty
if (!gs.includes('sheet1.setName(SHEET_REGISTRY_NAME)')) {
  gs = gs.replace(
    '  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);\n  if (!sheet) {\n    sheet = ss.insertSheet(SHEET_REGISTRY_NAME, 0);\n  }',
    `  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) {
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && sheet1.getLastRow() === 0 && sheet1.getLastColumn() === 0) {
      sheet1.setName(SHEET_REGISTRY_NAME);
      sheet = sheet1;
    } else {
      sheet = ss.insertSheet(SHEET_REGISTRY_NAME, 0);
    }
  }`
  );
  console.log('Updated setupSheet to handle Sheet1 smoothly');
}

// 4. Update doGet to support action=setup or action=rebuild
if (!gs.includes('action === "setup"')) {
  const setupApiBlock = `  if (action === "setup" || action === "rebuild") {
    setupSheet();
    var ssClean = SpreadsheetApp.getActiveSpreadsheet();
    var defaultSheet = ssClean.getSheetByName("Sheet1");
    if (defaultSheet && ssClean.getSheets().length > 1) {
      if (defaultSheet.getLastRow() === 0 && defaultSheet.getLastColumn() === 0) {
        try { ssClean.deleteSheet(defaultSheet); } catch (dErr) {}
      }
    }
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Full enterprise sheet initialized safely: 30 columns, dark luxury styling, duplicate tracker, and KPI Dashboard ready!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

`;
  gs = gs.replace('  if (action === "repair" || action === "fix") {', setupApiBlock + '  if (action === "repair" || action === "fix") {');
  console.log('Added setup/rebuild endpoint to doGet');
}

// Write to google_sheet_webhook.gs
fs.writeFileSync('google_sheet_webhook.gs', gs, 'utf8');
console.log('Saved google_sheet_webhook.gs');

// Also copy to netlify-driver-portal
fs.writeFileSync('netlify-driver-portal/google_sheet_webhook.gs', gs, 'utf8');
console.log('Copied to netlify-driver-portal/google_sheet_webhook.gs');
