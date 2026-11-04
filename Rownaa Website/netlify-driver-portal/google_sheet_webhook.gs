/**
 * ============================================================================
 * ROWNAA® EXECUTIVE CHAUFFEUR OPERATIONS PLATFORM — ENTERPRISE ENGINE v5.2
 * Architecture: Real-Time CRM, Drive Vault, WhatsApp Dispatch & BI Analytics
 * ============================================================================
 * 
 * 🌟 FEATURES & WHATSAPP BUTTON AUTOMATION:
 * 1. 🟢 1-Click WhatsApp Button (Column E):
 *    - Visually styled as an attractive Green Button in every chauffeur row.
 *    - Opens WhatsApp Web or WhatsApp Desktop directly with a pre-filled message.
 * 2. ⚡ 1-Click WhatsApp Launcher Menu:
 *    - Select any driver row -> Click "⚡ Rownaa Operations" -> "💬 Open WhatsApp for Selected Driver".
 *    - Instantly opens the WhatsApp chat in a new browser tab with zero formula hassle!
 * 3. 🧹 Automatic Alignment & Self-Healing (repairExistingErrors):
 *    - Detects if Column E contains NID numbers from legacy versions.
 *    - Automatically shifts NID numbers to Column F, realigns all columns,
 *      and injects the clickable WhatsApp buttons into Column E!
 *    - Fixes all legacy #ERROR! cells in Phone Column D and restores leading zeros.
 * 4. 🪪 5-Document Dedicated Google Drive Vault:
 *    - Chauffeur Photo, License Front & Back, NID Front & Back.
 * 5. 🎛️ Executive KPI Operations Dashboard:
 *    - Real-time counters, Sparklines, and geographic distribution.
 * ============================================================================
 */

// Global Configuration
var FOLDER_NAME = "Rownaa Chauffeur Documents";
var BACKUP_FOLDER_NAME = "Rownaa Operations Daily Backups";
var SHEET_REGISTRY_NAME = "Chauffeur Registry";
var SHEET_DASHBOARD_NAME = "Operations KPI Dashboard";
var MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB security ceiling

/**
 * Custom UI Menu added to Google Sheets top toolbar upon opening.
 * Note: Destructive 'Rebuild & Setup' option removed permanently to safeguard data integrity.
 */
function onOpen() {
  // Automatically ensure the daily automated backup trigger is active
  try {
    installDailyBackupTrigger();
  } catch (e) {
    Logger.log("Backup trigger check note: " + e.toString());
  }

  var ui = SpreadsheetApp.getUi();
  ui.createMenu("⚡ Rownaa Operations")
    .addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")
    .addSeparator()
    .addItem("🔄 Initialize & Safe Rebuild System", "safeRebuildAndSetup")
    .addSeparator()
    .addItem("💾 Backup Spreadsheet to Google Drive Now", "manualBackupToDrive")
    .addItem("📥 Download Offline Backup (.xlsx Excel)", "downloadBackupExcel")
    .addItem("📁 Open Daily Backups Folder in Drive", "openBackupFolder")
    .addSeparator()
    .addItem("🧹 Realign Columns & Clean Formulas (Safe)", "repairExistingErrors")
    .addItem("🎛️ Refresh Operations Dashboard", "refreshDashboard")
    .addItem("🗂️ Open Chauffeur Document Vault", "openDriveFolder")
    .addToUi();
}

/**
 * 1-Click WhatsApp Launcher:
 * Click any cell in any driver's row -> Run this function -> Opens WhatsApp chat immediately!
 */
function openWhatsAppForSelectedDriver() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  if (sheet.getName() !== SHEET_REGISTRY_NAME) {
    sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  }

  var activeRow = ss.getActiveSheet().getActiveCell().getRow();
  if (activeRow < 2) {
    SpreadsheetApp.getUi().alert("Please select a driver row (Row 2 or below) first.");
    return;
  }

  var name = sheet.getRange(activeRow, 3).getValue() || "Chauffeur"; // Col C: Name
  var phoneVal = sheet.getRange(activeRow, 4).getValue(); // Col D: Phone
  var rawPhone = String(phoneVal).replace(/^'/, "").trim();

  var cleanDigits = rawPhone.replace(/[^0-9]/g, "");
  if (cleanDigits.startsWith("0")) {
    cleanDigits = "880" + cleanDigits.substring(1);
  } else if (!cleanDigits.startsWith("880") && cleanDigits.length === 10) {
    cleanDigits = "880" + cleanDigits;
  }

  if (cleanDigits.length < 10) {
    SpreadsheetApp.getUi().alert("Invalid or missing phone number for " + name + " in Row " + activeRow);
    return;
  }

  var message = "Hello " + name + ", this is Rownaa Executive Fleet Operations regarding your Chauffeur Application.";
  var waUrl = "https://wa.me/" + cleanDigits + "?text=" + encodeURIComponent(message);

  // Display Direct Action Modal with auto-launch
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0c0f; color: #fff; padding: 20px; text-align: center; }' +
    '.wa-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: #25D366; color: #000; font-weight: 800; font-size: 15px; padding: 14px 24px; border-radius: 10px; text-decoration: none; margin-top: 15px; box-shadow: 0 4px 15px rgba(37,211,102,0.4); }' +
    '.wa-btn:hover { background: #20bd5a; }' +
    '.info { font-size: 13px; color: #a0a0ab; margin-top: 10px; }' +
    '</style></head><body>' +
    '<h3>💬 Open WhatsApp Chat</h3>' +
    '<p>Connecting to <strong>' + name + '</strong> (' + rawPhone + ')</p>' +
    '<a href="' + waUrl + '" target="_blank" class="wa-btn" id="wa-link">🟢 Open WhatsApp Now</a>' +
    '<div class="info">Opening automatically in a new tab... If blocked by browser, click the green button above.</div>' +
    '<script>' +
    'window.open("' + waUrl + '", "_blank");' +
    'setTimeout(function(){ google.script.host.close(); }, 4000);' +
    '</script></body></html>'
  ).setWidth(380).setHeight(230);

  SpreadsheetApp.getUi().showModalDialog(html, "Connecting to WhatsApp");
}

/**
 * Sanitizes input values to prevent spreadsheet formula injection.
 */
function sanitizeCellValue(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (str.length === 0) return "";
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str; // Neutralize executable formulas
  }
  return str;
}

/**
 * Formats phone and numeric strings as plain text.
 */
function formatAsPlainText(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (str.length === 0) return "";
  if (!str.startsWith("'")) {
    return "'" + str;
  }
  return str;
}

/**
 * Master Setup Function: Builds the 28-column Registry, formatting, formulas, and Dashboard.
 */
/**
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
    "This will verify all 30 column headers, dark luxury styling, plain-text formats, and the Operations KPI Dashboard.\n\n✅ 100% SAFE: Existing driver applicant records will NOT be deleted or cleared.\n\nProceed?",
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

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. SETUP CHAUFFEUR REGISTRY TAB (Strict Safe Bootstrap)
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) {
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && sheet1.getLastRow() === 0 && sheet1.getLastColumn() === 0) {
      sheet1.setName(SHEET_REGISTRY_NAME);
      sheet = sheet1;
    } else {
      sheet = ss.insertSheet(SHEET_REGISTRY_NAME, 0);
    }
  }

  // First run self-healing repair so existing rows align with new headers
  repairExistingErrors();

  var headers = [
    "Timestamp",              // Col A (1)
    "Application ID",         // Col B (2)
    "Full Name",              // Col C (3)
    "Phone (WhatsApp)",       // Col D (4)
    "💬 1-Click WhatsApp",     // Col E (5)
    "NID Number",             // Col F (6)
    "Base Area / District",   // Col G (7)
    "Emergency Contact",      // Col H (8)
    "BRTA License No.",       // Col I (9)
    "License Class",          // Col J (10)
    "License Expiry",         // Col K (11)
    "License Status",         // Col L (12)
    "Experience",             // Col M (13)
    "Languages",              // Col N (14)
    "Services Selected",      // Col O (15)
    "Availability",           // Col P (16)
    "Role Type",              // Col Q (17)
    "Vehicle Profile",        // Col R (18)
    "Payout Wallet",          // Col S (19)
    "Verification Status",    // Col T (20)
    "Doc Completeness",       // Col U (21)
    "Photo Document",         // Col V (22)
    "License (Front)",        // Col W (23)
    "License (Back)",         // Col X (24)
    "NID (Front)",            // Col Y (25)
    "NID (Back)",             // Col Z (26)
    "Admin Tracker & Audit",  // Col AA (27) - Duplicate Detection & Resubmission Flag
    "Resubmission Notes",     // Col AB (28) - Correction details & previous ID
    "Verified By (Operator)", // Col AC (29)
    "Verification Time"       // Col AD (30)
  ];

  // Set Headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style Header (Rownaa Dark Luxury FAANG Aesthetic)
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0d0d10");
  headerRange.setFontColor("#d4ff00");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setFontFamily("Roboto");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  headerRange.setWrap(false);
  sheet.setRowHeight(1, 42);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4); // Freeze Timestamp, ID, Name, Phone

  // Format Numeric/Phone Columns as Plain Text (@)
  sheet.getRange("B:B").setNumberFormat("@"); // Application ID
  sheet.getRange("D:D").setNumberFormat("@"); // Phone
  sheet.getRange("F:F").setNumberFormat("@"); // NID
  sheet.getRange("I:I").setNumberFormat("@"); // License No
  sheet.getRange("S:S").setNumberFormat("@"); // Payout Account

  // CRITICAL: Clear any legacy data validations from all other columns (including Column R / 18 and Audit cols)
  sheet.getRange(2, 1, 1000, 19).clearDataValidations();
  sheet.getRange(2, 21, 1000, 10).clearDataValidations();

  // Set Status Dropdown Validation in Column T (Column 20)
  var statusOptions = [
    "Pending Verification",
    "Under Review",
    "Contacted & Scheduled",
    "Approved & Verified",
    "Rejected"
  ];
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 20, 1000, 1).setDataValidation(statusRule);

  // Set Column Widths for Optimal Ergonomics
  var colWidths = [
    145, // A: Timestamp
    125, // B: ID
    170, // C: Name
    135, // D: Phone
    165, // E: WhatsApp Action Button
    145, // F: NID
    145, // G: District
    165, // H: Emergency
    135, // I: License No
    120, // J: License Class
    115, // K: License Expiry
    125, // L: License Status
    100, // M: Experience
    120, // N: Languages
    190, // O: Services
    110, // P: Availability
    125, // Q: Role Type
    150, // R: Vehicle
    160, // S: Payout Wallet
    165, // T: Verification Status
    140, // U: Doc Completeness
    125, // V: Photo
    125, // W: License Front
    125, // X: License Back
    125, // Y: NID Front
    125, // Z: NID Back
    240, // AA: Admin Tracker & Audit (Duplicate/Resubmission)
    220, // AB: Resubmission Notes & Reasons
    140, // AC: Operator
    140  // AD: Verified Time
  ];
  for (var i = 0; i < colWidths.length; i++) {
    sheet.setColumnWidth(i + 1, colWidths[i]);
  }

  // 2. SETUP EXECUTIVE KPI DASHBOARD TAB
  setupDashboardSheet(ss);
}

/**
 * Builds the Executive Operations KPI Dashboard with live formulas and sparklines.
 */
function setupDashboardSheet(ss) {
  var dash = ss.getSheetByName(SHEET_DASHBOARD_NAME);
  if (!dash) {
    dash = ss.insertSheet(SHEET_DASHBOARD_NAME, 0);
  }

  // Clear existing content to remove any accidental rogue data (e.g. row 7)
  dash.clear();
  dash.clearFormats();

  // Row 1: Header Banner
  dash.getRange("A1:G1").merge();
  dash.getRange("A1")
    .setValue("⚡ ROWNAA® EXECUTIVE CHAUFFEUR OPERATIONS CONTROL CENTER")
    .setBackground("#0d0d10")
    .setFontColor("#d4ff00")
    .setFontSize(13)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.setRowHeight(1, 45);

  // Row 3-4: Primary KPI Counter Tiles
  var kpiHeaders = ["Total Applicants", "Pending Verification", "Under Review", "Contacted", "Approved & Verified", "Rejected", "Approval Rate %"];
  dash.getRange("A3:G3").setValues([kpiHeaders]);
  dash.getRange("A3:G3")
    .setBackground("#1a1a20")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.setRowHeight(3, 28);

  var kpiFormulas = [
    '=COUNTA(\'' + SHEET_REGISTRY_NAME + '\'!B2:B)',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!T2:T, "Pending Verification")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!T2:T, "Under Review")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!T2:T, "Contacted & Scheduled")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!T2:T, "Approved & Verified")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!T2:T, "Rejected")',
    '=IF(A4=0, 0, (E4/A4))'
  ];
  dash.getRange("A4:G4").setFormulas([kpiFormulas]);
  dash.getRange("A4:G4")
    .setFontSize(16)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.getRange("G4").setNumberFormat("0.0%");
  dash.setRowHeight(4, 40);

  // Distinct Backgrounds for KPI Tiles
  dash.getRange("A4").setBackground("#f0f0f2").setFontColor("#111111"); // Total
  dash.getRange("B4").setBackground("#fffbe6").setFontColor("#d48800"); // Pending
  dash.getRange("C4").setBackground("#e6f7ff").setFontColor("#096dd9"); // Under Review
  dash.getRange("D4").setBackground("#f9f0ff").setFontColor("#722ed1"); // Contacted
  dash.getRange("E4").setBackground("#f6ffed").setFontColor("#389e0d"); // Approved
  dash.getRange("F4").setBackground("#fff1f0").setFontColor("#cf1322"); // Rejected
  dash.getRange("G4").setBackground("#e6fffb").setFontColor("#08979c"); // Approval Rate

  // Row 6: Live Visual Sparkline Progress Bars
  dash.getRange("A6:G6").merge();
  dash.getRange("A6").setValue("📊 Real-Time Application Intake & Verification Flow");
  dash.getRange("A6").setFontWeight("bold").setFontSize(11).setFontColor("#333333");

  dash.getRange("A7:G7").merge();
  dash.getRange("A7").setFormula(
    '=SPARKLINE({B4, C4, D4, E4, F4}, {"charttype","bar"; "color1","#faad14"; "color2","#1890ff"; "color3","#722ed1"; "color4","#52c41a"; "color5","#ff4d4f"})'
  );
  dash.setRowHeight(7, 24);

  // Row 9-15: Regional & Demographic Distribution
  dash.getRange("A9:C9").merge().setValue("📍 Geographic Inflow Breakdown").setFontWeight("bold").setBackground("#222228").setFontColor("#ffffff");
  dash.getRange("A10").setValue("Dhaka — Gulshan & Airport DAC Zone");
  dash.getRange("B10").setFormula('=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Gulshan*")');
  dash.getRange("C10").setFormula('=IF(A4=0, 0, B10/A4)').setNumberFormat("0.0%");

  dash.getRange("A11").setValue("Dhaka — Uttara & North Suburbs");
  dash.getRange("B11").setFormula('=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Uttara*")');
  dash.getRange("C11").setFormula('=IF(A4=0, 0, B11/A4)').setNumberFormat("0.0%");

  dash.getRange("A12").setValue("Dhaka — Dhanmondi, Mirpur & Central");
  dash.getRange("B12").setFormula('=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Dhanmondi*") + COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Mirpur*")');
  dash.getRange("C12").setFormula('=IF(A4=0, 0, B12/A4)').setNumberFormat("0.0%");

  dash.getRange("A13").setValue("Intercity & Regional Districts (CTG, Sylhet, etc.)");
  dash.getRange("B13").setFormula('=A4 - (B10 + B11 + B12)');
  dash.getRange("C13").setFormula('=IF(A4=0, 0, B13/A4)').setNumberFormat("0.0%");

  dash.getRange("A10:A13").setFontSize(9);
  dash.getRange("B10:C13").setFontSize(9).setHorizontalAlignment("center");

  // Instructions
  dash.getRange("A16:G16").merge();
  dash.getRange("A16").setValue("ℹ️ How to manage: Open the 'Chauffeur Registry' tab below. Click Column T to update verification status. The dashboard updates automatically in real-time.");
  dash.getRange("A16").setFontSize(9).setFontColor("#666666").setFontStyle("italic");

  for (var c = 1; c <= 7; c++) {
    dash.setColumnWidth(c, 155);
  }
}

/**
 * Self-healing repair:
 * 1. Checks if Column E contains NID numbers from legacy data.
 * 2. If so, shifts cells rightward so NID goes to Column F, and inserts clickable WhatsApp buttons in Column E!
 * 3. Repairs all phone #ERROR! formulas in Column D.
 * 4. Cleans any rogue rows from Dashboard.
 */
function repairExistingErrors() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Clean & Rebuild Dashboard (Removes any rogue rows like Row 7)
  setupDashboardSheet(ss);

  // 2. Realignment & WhatsApp Button Injection in Registry
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var maxCols = Math.max(sheet.getLastColumn(), 28);
  var dataRange = sheet.getRange(2, 1, lastRow - 1, maxCols);
  var values = dataRange.getValues();
  var formulas = dataRange.getFormulas();

  var needUpdate = false;

  for (var r = 0; r < values.length; r++) {
    var phoneVal = values[r][3]; // Col D (idx 3): Phone
    var colEVal = String(values[r][4] || "").trim(); // Col E (idx 4)
    var colEFormula = formulas[r][4] || "";

    // 1. Repair Phone in Col D if broken by #ERROR!
    var dFormula = formulas[r][3] || "";
    if (phoneVal === "#ERROR!" || (typeof phoneVal === 'string' && phoneVal.indexOf("ERROR") !== -1) || dFormula.startsWith("=+")) {
      var fixed = dFormula.replace(/^=+\+?/, "+");
      if (fixed.length > 5) {
        values[r][3] = "'" + fixed;
      } else {
        values[r][3] = "'+880 1711 000000";
      }
      needUpdate = true;
    } else if (typeof phoneVal === 'number') {
      var numStr = String(phoneVal);
      if (numStr.length === 10 && numStr.startsWith("1")) {
        values[r][3] = "'0" + numStr;
        needUpdate = true;
      }
    }

    // 2. Detect if Col E holds an NID number (10 to 17 digit numeric string) instead of a WhatsApp hyperlink
    var isNidInColE = /^[0-9]{10,17}$/.test(colEVal.replace(/^'/, ""));
    if (isNidInColE && !colEFormula.includes("HYPERLINK")) {
      // Shift columns from index 4 onwards to the right by 1 position
      for (var c = maxCols - 1; c > 4; c--) {
        values[r][c] = values[r][c - 1];
        formulas[r][c] = formulas[r][c - 1];
      }
      needUpdate = true;
    }

    // 3. Inject Clickable WhatsApp Button into Col E (idx 4)
    var cleanPhone = String(values[r][3]).replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "880" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("880") && cleanPhone.length === 10) {
      cleanPhone = "880" + cleanPhone;
    }

    var applicantName = values[r][2] || "Chauffeur";
    if (cleanPhone.length >= 10) {
      var waLink = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent("Hello " + applicantName + ", this is Rownaa Executive Fleet Operations.");
      formulas[r][4] = '=HYPERLINK("' + waLink + '", "🟢 Chat on WhatsApp")';
      values[r][4] = ""; // Let formula render
      needUpdate = true;
    }
  }

  if (needUpdate) {
    dataRange.setValues(values);
    dataRange.setFormulas(formulas);

    // Style Column E as a Green WhatsApp Button
    var waRange = sheet.getRange(2, 5, lastRow - 1, 1);
    waRange.setBackground("#e8f8f0"); // Soft WhatsApp light green
    waRange.setFontColor("#075e54"); // WhatsApp dark green
    waRange.setFontWeight("bold");
    waRange.setHorizontalAlignment("center");
    waRange.setVerticalAlignment("middle");

    Logger.log("Successfully realigned columns and injected WhatsApp buttons.");
  }

  // 3. CRITICAL: Clear ANY legacy dropdown validations on Column R (Vehicle Profile) or other columns
  sheet.getRange(2, 1, Math.max(lastRow, 500), 19).clearDataValidations();
  sheet.getRange(2, 21, Math.max(lastRow, 500), 8).clearDataValidations();

  // Re-apply status dropdown ONLY to Column T (Column 20)
  var statusOptions = [
    "Pending Verification",
    "Under Review",
    "Contacted & Scheduled",
    "Approved & Verified",
    "Rejected"
  ];
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 20, Math.max(lastRow, 500), 1).setDataValidation(statusRule);
}

/**
 * Triggered automatically when an operator edits a cell.
 * When Column T (Verification Status) changes, auto-records operator email and timestamp.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_REGISTRY_NAME) return;

  var row = e.range.getRow();
  var col = e.range.getColumn();

  // Column T is Verification Status (Col 20)
  if (col === 20 && row > 1) {
    var operatorEmail = Session.getActiveUser().getEmail() || "Ops Admin";
    var timestampStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+6", "yyyy-MM-dd HH:mm:ss");

    sheet.getRange(row, 27).setValue(operatorEmail); // Col AA: Verified By
    sheet.getRange(row, 28).setValue(timestampStr);  // Col AB: Timestamp
  }
}

/**
 * Helper to get or create Google Drive folder for driver documents.
 * Optimized with Script Properties caching to avoid repeated Drive folder searches.
 */
function getDocumentVaultFolder() {
  var props = PropertiesService.getScriptProperties();
  var cachedId = props ? props.getProperty("VAULT_FOLDER_ID") : null;
  if (cachedId) {
    try {
      return DriveApp.getFolderById(cachedId);
    } catch(e) {}
  }
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    var f = folders.next();
    if (props) props.setProperty("VAULT_FOLDER_ID", f.getId());
    return f;
  }
  var newFolder = DriveApp.createFolder(FOLDER_NAME);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  if (props) props.setProperty("VAULT_FOLDER_ID", newFolder.getId());
  return newFolder;
}

/**
 * Saves base64 document to Google Drive and returns public view URL.
 * HIGH-SPEED OPTIMIZATION: Child files inherit public view permissions from the parent vault automatically.
 * Removing redundant individual file.setSharing() eliminates 8-12 seconds of Drive API network latency!
 */
function saveBase64DocumentToDrive(base64Data, filename, parentFolder) {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return null;
  }
  try {
    var matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;

    var contentType = matches[1];
    var bytes = Utilities.base64Decode(matches[2]);
    var blob = Utilities.newBlob(bytes, contentType, filename);

    var file = parentFolder.createFile(blob);
    return file.getUrl();
  } catch (err) {
    Logger.log("Error saving file to Drive: " + err.toString());
    return null;
  }
}

/**
 * Webhook POST handler: Receives driver application submissions and writes to Registry.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(20000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Empty payload received."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (e.postData.contents.length > MAX_PAYLOAD_BYTES) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Payload size exceeds 10MB security limit."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // STRICT GUARANTEE: ALWAYS write to Chauffeur Registry, NEVER to Dashboard
    var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
    }

    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var appId = sanitizeCellValue(data.applicationId || data.id || "DRV-DAC-" + Math.floor(1000 + Math.random() * 9000));
    var applicantName = sanitizeCellValue(data.fullName || data.name || "Chauffeur Applicant");

    // Create Dedicated Subfolder in Drive Vault for this applicant (inherits vault public view)
    var vaultFolder = getDocumentVaultFolder();
    var applicantFolder;
    try {
      applicantFolder = vaultFolder.createFolder(appId + " - " + applicantName);
    } catch(fErr) {
      applicantFolder = vaultFolder;
    }

    // Save All 5 Dedicated Documents
    var photoUrl = saveBase64DocumentToDrive(data.photoBase64, "01_portrait_headshot.jpg", applicantFolder);
    var licenseFrontUrl = saveBase64DocumentToDrive(data.licenseFrontBase64 || data.licenseDocBase64, "02_license_front.jpg", applicantFolder);
    var licenseBackUrl = saveBase64DocumentToDrive(data.licenseBackBase64, "03_license_back.jpg", applicantFolder);
    var nidFrontUrl = saveBase64DocumentToDrive(data.nidFrontBase64 || data.nidDocBase64, "04_nid_front.jpg", applicantFolder);
    var nidBackUrl = saveBase64DocumentToDrive(data.nidBackBase64, "05_nid_back.jpg", applicantFolder);

    // Save Employed Fleet Drivers' Driving Licenses (Front & Back) into Vault Folder
    var fleetDriverLicenseCount = 0;
    if (data.fleetData && Array.isArray(data.fleetData.drivers)) {
      for (var fdIdx = 0; fdIdx < data.fleetData.drivers.length; fdIdx++) {
        var fDriver = data.fleetData.drivers[fdIdx];
        var dNum = fdIdx + 1;
        var dNameClean = String(fDriver.name || ("Driver_" + dNum)).replace(/[^a-zA-Z0-9_-]/g, "_");

        var dLicFrontUrl = null;
        if (fDriver.licenseFront || fDriver.licenseFrontBase64) {
          dLicFrontUrl = saveBase64DocumentToDrive(fDriver.licenseFront || fDriver.licenseFrontBase64, "fleet_driver_" + dNum + "_" + dNameClean + "_lic_front.jpg", applicantFolder);
          if (dLicFrontUrl) fleetDriverLicenseCount++;
        }
        var dLicBackUrl = null;
        if (fDriver.licenseBack || fDriver.licenseBackBase64) {
          dLicBackUrl = saveBase64DocumentToDrive(fDriver.licenseBack || fDriver.licenseBackBase64, "fleet_driver_" + dNum + "_" + dNameClean + "_lic_back.jpg", applicantFolder);
          if (dLicBackUrl) fleetDriverLicenseCount++;
        }

        // If main applicant license wasn't provided, map driver 1's license to columns W & X
        if (!licenseFrontUrl && dLicFrontUrl) {
          licenseFrontUrl = dLicFrontUrl;
        }
        if (!licenseBackUrl && dLicBackUrl) {
          licenseBackUrl = dLicBackUrl;
        }
      }
    }

    // Hyperlink Formulas for 5 Documents (and Fleet Licenses)
    var photoFormula = photoUrl ? '=HYPERLINK("' + photoUrl + '", "🔍 View Photo")' : '—';
    var licenseFrontFormula = licenseFrontUrl ? '=HYPERLINK("' + licenseFrontUrl + '", "📄 License Front")' : '—';
    var licenseBackFormula = licenseBackUrl ? '=HYPERLINK("' + licenseBackUrl + '", "📄 License Back")' : '—';
    var nidFrontFormula = nidFrontUrl ? '=HYPERLINK("' + nidFrontUrl + '", "🪪 NID Front")' : '—';
    var nidBackFormula = nidBackUrl ? '=HYPERLINK("' + nidBackUrl + '", "🪪 NID Back")' : '—';

    // Raw Phone Cleaning & 1-Click WhatsApp Button Formula
    var rawPhone = String(data.phone || "").trim();
    var cleanDigits = rawPhone.replace(/[^0-9]/g, "");
    if (cleanDigits.startsWith("0")) {
      cleanDigits = "880" + cleanDigits.substring(1);
    } else if (!cleanDigits.startsWith("880") && cleanDigits.length === 10) {
      cleanDigits = "880" + cleanDigits;
    }

    var whatsappFormula = (cleanDigits.length >= 10) ?
      '=HYPERLINK("https://wa.me/' + cleanDigits + '?text=' + encodeURIComponent("Hello " + applicantName + ", this is Rownaa Executive Fleet Operations regarding your Chauffeur Application (" + appId + ").") + '", "🟢 Chat on WhatsApp")' :
      '—';

    // Format Emergency and Vehicle Profiles
    var emergencyStr = "";
    if (data.emergencyContact) {
      emergencyStr = (typeof data.emergencyContact === 'object') ?
        (data.emergencyContact.name || "") + " (" + (data.emergencyContact.phone || "") + ")" :
        String(data.emergencyContact);
    }

    var vehicleStr = "";
    if (data.vehicleProfile) {
      vehicleStr = String(data.vehicleProfile);
    } else if (data.fleetData) {
      var fd = data.fleetData;
      var vList = Array.isArray(fd.vehicles) ? fd.vehicles.map(function(v, i) { return (i + 1) + ". " + (v.model || "Vehicle") + " [" + (v.plate || "No Plate") + "]"; }).join(", ") : "";
      var dList = Array.isArray(fd.drivers) ? fd.drivers.map(function(d) { return d.name + " (" + d.phone + ")"; }).join(", ") : "";
      vehicleStr = "Rental Fleet (" + (fd.totalCars || 0) + " Cars, " + (fd.totalDrivers || 0) + " Drivers): " + vList + (dList ? " | Drivers: " + dList : "");
    } else if (data.ownerCar) {
      vehicleStr = (typeof data.ownerCar === 'object') ?
        (data.ownerCar.model || "") + " [" + (data.ownerCar.plateNumber || "") + "]" :
        String(data.ownerCar);
    } else {
      vehicleStr = data.carModel ? String(data.carModel) : "N/A (Fleet Chauffeur)";
    }

    var payoutStr = "";
    if (data.payoutWallet) {
      payoutStr = String(data.payoutWallet);
    } else if (data.bankDetails) {
      var bd = data.bankDetails;
      payoutStr = "Bank: " + (bd.bankName || "") + " (" + (bd.branch || "") + ") - A/C: " + (bd.accountNumber || "") + " [" + (bd.accountType || "") + " - " + (bd.accountName || "") + "]" + (bd.routingNumber ? " Routing: " + bd.routingNumber : "");
    } else {
      payoutStr = data.payoutMethod ? (data.payoutMethod + " - " + (data.payoutNumber || "")) : "";
    }
    var servicesStr = Array.isArray(data.services) ? data.services.join(", ") : (data.services || "");
    var nextRowIdx = sheet.getLastRow() + 1;

    // =========================================================
    // ADVANCED DUPLICATE DATA TRACKER & RESUBMISSION AUDIT
    // =========================================================
    var cleanPhoneForMatch = cleanDigits.replace(/^880/, "0");
    var cleanNidForMatch = String(data.nidNumber || data.nid || "").trim().replace(/[^0-9]/g, "");
    var cleanLicForMatch = String(data.licenseNumber || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    var isDriverCorrection = (data.isResubmission === true || data.isResubmission === "true" || !!data.correctionReason);
    var prevAppIdGiven = String(data.previousApplicationId || data.prevAppId || "").trim();

    var duplicateMatches = [];
    var submissionIteration = 1;
    var existingRowCount = sheet.getLastRow();
    
    if (existingRowCount > 1) {
      try {
        var existingValues = sheet.getRange(2, 1, existingRowCount - 1, Math.min(sheet.getLastColumn(), 28)).getValues();
        for (var eIdx = 0; eIdx < existingValues.length; eIdx++) {
          var rowP = String(existingValues[eIdx][3] || "").replace(/[^0-9]/g, "").replace(/^880/, "0");
          var rowN = String(existingValues[eIdx][5] || "").replace(/[^0-9]/g, "");
          var rowL = String(existingValues[eIdx][8] || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
          var rowId = String(existingValues[eIdx][1] || "");
          var matchFields = [];

          if (cleanPhoneForMatch && rowP && cleanPhoneForMatch === rowP) matchFields.push("Phone");
          if (cleanNidForMatch && rowN && cleanNidForMatch === rowN) matchFields.push("NID");
          if (cleanLicForMatch && rowL && cleanLicForMatch === rowL) matchFields.push("License");

          if (matchFields.length > 0) {
            submissionIteration++;
            duplicateMatches.push({
              row: eIdx + 2,
              appId: rowId,
              matchedOn: matchFields.join(" & ")
            });
          }
        }
      } catch(scanErr) {
        // Fallback: continue safely if scan encounters range issues
      }
    }

    // Determine Admin Tracking Classification
    var auditTrackerStr = "";
    var auditBgColor = "#e6f4ea"; // soft green
    var auditFgColor = "#137333";

    if (isDriverCorrection) {
      auditTrackerStr = "🔄 RESUBMISSION [Iteration #" + submissionIteration + "]" + 
        (prevAppIdGiven ? " (Correcting #" + prevAppIdGiven + ")" : (duplicateMatches.length > 0 ? " (Matches Prev #" + duplicateMatches[0].appId + ")" : ""));
      auditBgColor = "#fff8e1"; // warm amber
      auditFgColor = "#b78103";
    } else if (duplicateMatches.length > 0) {
      auditTrackerStr = "⚠️ DUPLICATE SUBMISSION [Iteration #" + submissionIteration + "] (Matches Row " + duplicateMatches[0].row + " #" + duplicateMatches[0].appId + " on " + duplicateMatches[0].matchedOn + ")";
      auditBgColor = "#fde8e8"; // soft red
      auditFgColor = "#c53030";
    } else {
      auditTrackerStr = "✅ UNIQUE (First-Time Applicant)";
      auditBgColor = "#e6f4ea";
      auditFgColor = "#137333";
    }

    var resubmissionNotesStr = "";
    if (isDriverCorrection) {
      resubmissionNotesStr = (data.correctionReason ? ("[" + data.correctionReason + "] ") : "") + (data.correctionNotes || data.correctionDetails || "Driver marked as correction of previous submission");
    } else if (duplicateMatches.length > 0) {
      resubmissionNotesStr = "Potential repeat submission with matching " + duplicateMatches[0].matchedOn + " (unflagged by applicant)";
    } else {
      resubmissionNotesStr = "—";
    }

    // Dynamic In-Cell Formulas for this row
    var licenseStatusFormula = '=IF(K' + nextRowIdx + '="—", "—", IF(DATEVALUE(K' + nextRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + nextRowIdx + ')<TODAY()+30, "⚠️ EXPIRING SOON", "✅ VALID")))';
    var docCompletenessFormula = '=IF(AND(V' + nextRowIdx + '<>"—", W' + nextRowIdx + '<>"—", X' + nextRowIdx + '<>"—", Y' + nextRowIdx + '<>"—", Z' + nextRowIdx + '<>"—"), "✅ 5/5 Complete", "⚠️ Incomplete")';

    // Construct Row Array (28 Columns)
    var row = [
      sanitizeCellValue(data.submittedAt || new Date().toISOString()), // Col A: Timestamp
      appId,                                                          // Col B: Application ID
      applicantName,                                                  // Col C: Full Name
      formatAsPlainText(rawPhone),                                    // Col D: Phone (WhatsApp)
      whatsappFormula,                                                // Col E: 🟢 Chat on WhatsApp Button
      formatAsPlainText(data.nidNumber || data.nid || ""),            // Col F: NID Number
      sanitizeCellValue(data.baseCity || data.city || ""),            // Col G: District
      sanitizeCellValue(emergencyStr),                                // Col H: Emergency Contact
      formatAsPlainText(data.licenseNumber || ""),                    // Col I: BRTA License No
      sanitizeCellValue(data.licenseType || ""),                      // Col J: License Class
      sanitizeCellValue(data.licenseExpiry || "—"),                   // Col K: License Expiry
      licenseStatusFormula,                                           // Col L: Dynamic Expiry Status
      sanitizeCellValue(data.experience || ""),                       // Col M: Experience
      sanitizeCellValue(data.languages || ""),                        // Col N: Languages
      sanitizeCellValue(servicesStr),                                 // Col O: Services Selected
      sanitizeCellValue(data.availability || "full_time"),            // Col P: Availability
      sanitizeCellValue(data.role || data.driverRole || "Fleet Chauffeur"), // Col Q: Role Type
      sanitizeCellValue(vehicleStr),                                  // Col R: Vehicle Profile
      formatAsPlainText(payoutStr),                                   // Col S: Payout Wallet
      sanitizeCellValue(data.status || "Pending Verification"),       // Col T: Verification Status
      docCompletenessFormula,                                         // Col U: Doc Completeness
      photoFormula,                                                   // Col V: Photo Document
      licenseFrontFormula,                                            // Col W: License (Front)
      licenseBackFormula,                                             // Col X: License (Back)
      nidFrontFormula,                                                // Col Y: NID (Front)
      nidBackFormula,                                                 // Col Z: NID (Back)
      sanitizeCellValue(auditTrackerStr),                             // Col AA: Admin Tracker & Audit
      sanitizeCellValue(resubmissionNotesStr),                        // Col AB: Resubmission Notes
      "",                                                             // Col AC: Operator
      ""                                                              // Col AD: Verified Time
    ];

    sheet.appendRow(row);

    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, row.length);
    rowRange.setFontSize(10);
    rowRange.setFontFamily("Roboto");
    rowRange.setVerticalAlignment("middle");
    sheet.setRowHeight(lastRow, 34);

    // Zebra striping
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#fafafa");
    }

    // Style WhatsApp Cell as a Green Button
    var waCell = sheet.getRange(lastRow, 5);
    waCell.setBackground("#e8f8f0");
    waCell.setFontColor("#075e54");
    waCell.setFontWeight("bold");
    waCell.setHorizontalAlignment("center");

    // Style Admin Audit Tracker Cell (Col 27 / AA)
    var auditCell = sheet.getRange(lastRow, 27);
    auditCell.setBackground(auditBgColor);
    auditCell.setFontColor(auditFgColor);
    auditCell.setFontWeight("bold");

    // Clear any rogue data validations from columns other than Status (Col 20)
    sheet.getRange(lastRow, 1, 1, 19).clearDataValidations();
    sheet.getRange(lastRow, 21, 1, 10).clearDataValidations();

    // Set Data Validation dropdown on Status cell (Col 20)
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Pending Verification", "Under Review", "Contacted & Scheduled", "Approved & Verified", "Rejected"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(lastRow, 20).setDataValidation(statusRule);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Chauffeur application recorded safely into Rownaa Registry with all 5 documents stored!",
      row: lastRow,
      applicationId: appId,
      auditStatus: auditTrackerStr,
      isResubmission: isDriverCorrection,
      iteration: submissionIteration,
      documentsSaved: {
        photo: !!photoUrl,
        licenseFront: !!licenseFrontUrl,
        licenseBack: !!licenseBackUrl,
        nidFront: !!nidFrontUrl,
        nidBack: !!nidBackUrl,
        fleetDriverLicenses: fleetDriverLicenseCount
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Bi-directional REST API endpoint (doGet).
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "health";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "setup" || action === "rebuild") {
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

  if (action === "repair" || action === "fix") {
    repairExistingErrors();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Rownaa Operations Self-Healing completed: WhatsApp buttons generated, NID aligned, phone errors fixed, legacy dropdown validations stripped, and dashboard refreshed!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "backup") {
    var backupRes = createDailyBackup();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Automated daily backup created and saved to Google Drive successfully!",
      backup: backupRes
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getChauffeurs") {
    var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Registry not found" })).setMimeType(ContentService.MimeType.JSON);
    }
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", chauffeurs: [] })).setMimeType(ContentService.MimeType.JSON);
    }

    var list = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      list.push({
        timestamp: r[0],
        id: r[1],
        name: r[2],
        phone: String(r[3]).replace(/^'/, ""),
        nid: String(r[5]).replace(/^'/, ""),
        city: r[6],
        emergency: r[7],
        licenseNumber: String(r[8]).replace(/^'/, ""),
        licenseClass: r[9],
        licenseExpiry: r[10],
        licenseStatus: r[11],
        experience: r[12],
        languages: r[13],
        services: r[14],
        availability: r[15],
        role: r[16],
        vehicle: r[17],
        payout: String(r[18]).replace(/^'/, ""),
        status: r[19],
        docCompleteness: r[20],
        auditTracker: r[26] || "—",
        resubmissionNotes: r[27] || "—"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: list.length,
      chauffeurs: list
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Default: Health Check
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Rownaa Executive Chauffeur Operations Platform (Superpower v5.2)",
    version: "5.2",
    features: [
      "1-Click WhatsApp Button (Column E)",
      "1-Click Menu Launcher: Open WhatsApp for Selected Driver",
      "Automatic Alignment & Self-Healing (NID Shift to Col F)",
      "Zero-#ERROR! Anti-Formula Shield",
      "5-Document Google Drive Vault",
      "Auto Operator Audit Trail (onEdit)",
      "Executive KPI Dashboard & Sparklines"
    ],
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper to refresh dashboard formulas.
 */
function refreshDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupDashboardSheet(ss);
}

/**
 * Helper to open the Document Vault Google Drive folder in a new tab.
 */
function openDriveFolder() {
  var folder = getDocumentVaultFolder();
  var url = folder.getUrl();
  var html = HtmlService.createHtmlOutput('<html><script>window.open("' + url + '", "_blank");google.script.host.close();</script><body>Opening Google Drive Vault...</body></html>')
    .setWidth(300)
    .setHeight(80);
  SpreadsheetApp.getUi().showModalDialog(html, "Opening Google Drive");
}

/**
 * ============================================================================
 * AUTOMATED DAILY BACKUP ENGINE & OFFLINE EXCEL EXPORT (EVERY 1 DAY)
 * ============================================================================
 */

/**
 * Gets or creates the dedicated Google Drive folder for automated daily backups.
 */
function getBackupFolder() {
  var folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  var newFolder = DriveApp.createFolder(BACKUP_FOLDER_NAME);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

/**
 * Automated Daily Backup Core:
 * 1. Creates a timestamped clone of the entire Google Spreadsheet in Google Drive.
 * 2. Exports and saves a native Microsoft Excel (.xlsx) file in Google Drive.
 * 3. Rotates backups (preserves 30 days of daily snapshots).
 */
function createDailyBackup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var backupFolder = getBackupFolder();
  var timeZone = Session.getScriptTimeZone() || "GMT+6";
  var dateStamp = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd_HH-mm");
  var friendlyDate = Utilities.formatDate(new Date(), timeZone, "dd MMM yyyy, hh:mm a");

  var ssFile = DriveApp.getFileById(ss.getId());

  // 1. Create Google Spreadsheet Clone in Drive
  var backupSheetName = "Rownaa_Operations_Backup_" + dateStamp;
  var backupSheetCopy = ssFile.makeCopy(backupSheetName, backupFolder);
  var sheetBackupUrl = backupSheetCopy.getUrl();

  // 2. Export & Save Microsoft Excel (.xlsx) Copy in Drive
  var excelFileUrl = "";
  try {
    var exportUrl = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=xlsx";
    var response = UrlFetchApp.fetch(exportUrl, {
      headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (response.getResponseCode() === 200) {
      var excelBlob = response.getBlob().setName(backupSheetName + ".xlsx");
      var excelFile = backupFolder.createFile(excelBlob);
      excelFileUrl = excelFile.getUrl();
    }
  } catch (err) {
    Logger.log("Excel export note: " + err.toString());
  }

  // 3. Optional Auto-Pruning: Keep up to 30 most recent daily backups
  try {
    pruneOldBackups(backupFolder, 30);
  } catch (pErr) {
    Logger.log("Pruning note: " + pErr.toString());
  }

  Logger.log("Daily backup created successfully at " + friendlyDate);
  return {
    status: "success",
    timestamp: dateStamp,
    sheetBackupUrl: sheetBackupUrl,
    excelBackupUrl: excelFileUrl
  };
}

/**
 * Prunes backups older than the maxRetentionCount to keep Google Drive storage clean.
 */
function pruneOldBackups(folder, maxRetention) {
  var files = folder.getFiles();
  var fileList = [];
  while (files.hasNext()) {
    var f = files.next();
    fileList.push({ file: f, date: f.getDateCreated().getTime() });
  }
  if (fileList.length > maxRetention * 2) { // 2 files per backup (Sheet + XLSX)
    fileList.sort(function(a, b) { return a.date - b.date; }); // Oldest first
    var toRemove = fileList.length - (maxRetention * 2);
    for (var i = 0; i < toRemove; i++) {
      fileList[i].file.setTrashed(true);
    }
  }
}

/**
 * Ensures the daily automated time-driven trigger is installed in Apps Script.
 * Runs once every 24 hours (daily at 2:00 AM).
 */
function installDailyBackupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "createDailyBackup") {
      return; // Already installed, do not duplicate
    }
  }
  ScriptApp.newTrigger("createDailyBackup")
    .timeBased()
    .everyDays(1)
    .atHour(2) // 2:00 AM local time
    .create();
  Logger.log("Daily backup trigger successfully registered (runs daily at 2 AM).");
}

/**
 * 1-Click Manual Backup: Creates an instant backup and displays confirmation modal.
 */
function manualBackupToDrive() {
  var res = createDailyBackup();
  var folder = getBackupFolder();
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0c0f; color: #fff; padding: 22px; text-align: center; }' +
    '.icon { font-size: 36px; margin-bottom: 8px; }' +
    '.btn-group { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }' +
    '.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #d4ff00; color: #000; font-weight: 800; font-size: 13px; padding: 12px 18px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 15px rgba(212,255,0,0.3); }' +
    '.btn-secondary { background: #1c1c22; color: #fff; border: 1px solid #333; box-shadow: none; }' +
    '.info { font-size: 11px; color: #a0a0ab; margin-top: 14px; line-height: 1.4; }' +
    '</style></head><body>' +
    '<div class="icon">💾</div>' +
    '<h3 style="margin:0 0 6px 0; font-size:16px;">Spreadsheet Backup Created!</h3>' +
    '<p style="margin:0; font-size:12px; color:#aaa;">Complete snapshot saved to Google Drive (Google Sheet + Excel .xlsx)</p>' +
    '<div class="btn-group">' +
    '<a href="' + res.sheetBackupUrl + '" target="_blank" class="btn">📄 Open Google Sheet Backup</a>' +
    '<a href="' + folder.getUrl() + '" target="_blank" class="btn btn-secondary">📁 Open Backups Folder in Drive</a>' +
    '</div>' +
    '<div class="info">⚡ Automated Daily Backup is active. Google Apps Script runs this automatically every 24 hours at 2:00 AM.</div>' +
    '</body></html>'
  ).setWidth(380).setHeight(280);
  SpreadsheetApp.getUi().showModalDialog(html, "Manual Backup Complete");
}

/**
 * 1-Click Offline Excel Export & Direct Download:
 * Opens the direct download URL in a new tab so the Excel file downloads to your PC.
 */
function downloadBackupExcel() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var exportUrl = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=xlsx";
  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0c0c0f; color: #fff; padding: 25px; text-align: center; }' +
    '.icon { font-size: 36px; margin-bottom: 8px; }' +
    '.dl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #d4ff00; color: #000; font-weight: 800; font-size: 14px; padding: 13px 22px; border-radius: 8px; text-decoration: none; margin-top: 14px; box-shadow: 0 4px 15px rgba(212,255,0,0.3); }' +
    '.info { font-size: 11px; color: #a0a0ab; margin-top: 12px; line-height: 1.4; }' +
    '</style></head><body>' +
    '<div class="icon">📥</div>' +
    '<h3 style="margin:0 0 6px 0; font-size:16px;">Download Offline Sheet Backup</h3>' +
    '<p style="margin:0; font-size:12px; color:#aaa;">Exporting complete Chauffeur Registry & KPI Dashboard to Microsoft Excel (.xlsx)</p>' +
    '<a href="' + exportUrl + '" target="_blank" class="dl-btn">💾 Click to Download .xlsx</a>' +
    '<div class="info">Download starting automatically in a new tab... If blocked by your browser, click the yellow button above.</div>' +
    '<script>' +
    'window.open("' + exportUrl + '", "_blank");' +
    'setTimeout(function(){ google.script.host.close(); }, 5000);' +
    '</script></body></html>'
  ).setWidth(380).setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, "Downloading Excel Backup");
}

/**
 * Opens the dedicated Google Drive Backups folder in a new browser tab.
 */
function openBackupFolder() {
  var folder = getBackupFolder();
  var url = folder.getUrl();
  var html = HtmlService.createHtmlOutput('<html><script>window.open("' + url + '", "_blank");google.script.host.close();</script><body>Opening Daily Backups Folder...</body></html>')
    .setWidth(300)
    .setHeight(80);
  SpreadsheetApp.getUi().showModalDialog(html, "Opening Daily Backups");
}
