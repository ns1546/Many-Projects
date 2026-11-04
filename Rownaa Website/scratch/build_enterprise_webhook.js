const fs = require('fs');

const code = `/**
 * ============================================================================
 * ROWNAA® EXECUTIVE CHAUFFEUR OPERATIONS PLATFORM — ENTERPRISE ENGINE v6.0
 * Architecture: Real-Time CRM, Drive Vault, WhatsApp Dispatch & BI Analytics
 * Dual License Schema: Dedicated Driver's License & Dedicated Car/Vehicle License
 * ============================================================================
 * 
 * 🌟 CORE FEATURES:
 * 1. 🚗 DUAL-LICENSE VERIFICATION SCHEMA (36 Enterprise Columns):
 *    - DRIVER'S DRIVING LICENSE: License No, Class, Expiry, Status, Front & Back Photos.
 *    - CAR / VEHICLE LICENSE: Registration Plate No, Model/Make, Fitness/Tax Expiry,
 *      Car Registration / Blue Book (Front & Back), and Tax Token / Fitness Certificate.
 * 2. 🟢 1-Click WhatsApp Button (Column E):
 *    - In-cell clickable button opening pre-filled WhatsApp chat directly.
 * 3. ⚡ 1-Click WhatsApp Launcher Menu:
 *    - Works with automatic tab switching to Chauffeur Registry.
 * 4. 🛡️ 100% Non-Destructive Safe Initialization (safeRebuildAndSetup):
 *    - Zero data loss guarantee + automatic Google Drive backup before layout changes.
 * 5. 🔍 Advanced Duplicate Data Tracker & Resubmission Auditor:
 *    - Detects matching Phone, NID, Driver License, or Car Plate.
 *    - Iteration counter [Iteration #X] with audit color styling.
 * 6. 📂 8-Document Dedicated Google Drive Vault:
 *    - Headshot, Driver Lic (Front/Back), Car Lic/Blue Book (Front/Back), Fitness/Tax, NID (Front/Back).
 * 7. 🎛️ Operations KPI Dashboard Control Center:
 *    - Live counters, sparklines, demographic inflow, and approval rates.
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
 */
function onOpen() {
  try {
    installDailyBackupTrigger();
  } catch (e) {
    Logger.log("Backup trigger check note: " + e.toString());
  }

  var ui = SpreadsheetApp.getUi();
  ui.createMenu("⚡ Rownaa Operations")
    .addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")
    .addItem("📋 Copy Chauffeur Details Summary", "copyChauffeurSummary")
    .addSeparator()
    .addItem("🔄 Initialize & Safe Rebuild System", "safeRebuildAndSetup")
    .addItem("💾 Backup Spreadsheet to Google Drive Now", "manualBackupToDrive")
    .addItem("📥 Download Offline Backup (.xlsx Excel)", "downloadBackupExcel")
    .addItem("📂 Open Daily Backups Folder in Drive", "openBackupFolder")
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
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Chauffeur Registry sheet not found. Please run 'Initialize & Safe Rebuild System' first.");
    return;
  }

  // If user is currently looking at another tab, switch to Registry tab
  if (ss.getActiveSheet().getName() !== SHEET_REGISTRY_NAME) {
    ss.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert("Switched to 'Chauffeur Registry' tab. Please click any driver's row (Row 2 or below) and click 'Open WhatsApp' again.");
    return;
  }

  var activeRow = ss.getActiveSheet().getActiveCell().getRow();
  if (activeRow < 2) {
    SpreadsheetApp.getUi().alert("Please click any driver's row (Row 2 or below) first to launch WhatsApp.");
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
 * 1-Click Copy Chauffeur Details Summary:
 * Generates an executive clipboard-ready dossier of the selected driver.
 */
function copyChauffeurSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) return;

  var activeRow = ss.getActiveSheet().getActiveCell().getRow();
  if (activeRow < 2) {
    SpreadsheetApp.getUi().alert("Please select a driver row (Row 2 or below) first.");
    return;
  }

  var r = sheet.getRange(activeRow, 1, 1, 36).getValues()[0];
  var summaryText = 
    "⭐ ROWNAA EXECUTIVE CHAUFFEUR PROFILE ⭐\\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n" +
    "• Application ID: " + r[1] + "\\n" +
    "• Full Name: " + r[2] + "\\n" +
    "• Phone: " + r[3] + "\\n" +
    "• NID Number: " + r[5] + "\\n" +
    "• District / Base: " + r[6] + "\\n" +
    "• Emergency Contact: " + r[7] + "\\n" +
    "• Driver License No: " + r[8] + " (" + r[9] + ") - Expiry: " + r[10] + "\\n" +
    "• Car License / Plate No: " + (r[12] || "N/A") + " - " + (r[13] || "Fleet Vehicle") + "\\n" +
    "• Role: " + r[19] + "\\n" +
    "• Vehicle Profile: " + r[20] + "\\n" +
    "• Payout Wallet: " + r[21] + "\\n" +
    "• Verification Status: " + r[22] + "\\n" +
    "• Audit Tracking: " + r[32] + "\\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: monospace; background: #0c0c0f; color: #d4ff00; padding: 16px; margin: 0; }' +
    'textarea { width: 100%; height: 180px; background: #16161c; color: #fff; border: 1px solid #333; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 11px; resize: none; box-sizing: border-box; }' +
    '.copy-btn { margin-top: 10px; background: #d4ff00; color: #000; border: none; font-weight: 800; font-size: 13px; padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%; }' +
    '</style></head><body>' +
    '<h4 style="margin:0 0 8px 0; color:#fff; font-family:sans-serif;">📋 Chauffeur Profile Dossier</h4>' +
    '<textarea id="txt">' + summaryText.replace(/\\n/g, "\\n") + '</textarea>' +
    '<button class="copy-btn" onclick="copyDossier()">📋 Copy to Clipboard</button>' +
    '<script>' +
    'function copyDossier() { var t = document.getElementById("txt"); t.select(); document.execCommand("copy"); alert("Copied to clipboard!"); google.script.host.close(); }' +
    '</script></body></html>'
  ).setWidth(420).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, "Chauffeur Summary Dossier");
}

/**
 * Sanitizes input values to prevent spreadsheet formula injection.
 */
function sanitizeCellValue(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
    return "'" + str;
  }
  return str;
}

/**
 * Ensures phone numbers, NID, and license plates keep leading zeros and do not evaluate as formulas.
 */
function formatAsPlainText(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (!str.startsWith("'")) {
    return "'" + str;
  }
  return str;
}

/**
 * Safe Rebuild & Setup System:
 * 1. Reassures operator that existing applicant rows are 100% preserved.
 * 2. Automatically creates a timestamped Google Drive backup before running.
 * 3. Runs setupSheet() to ensure all 36 column headers, dark luxury styling,
 *    frozen columns, validations, and KPI Dashboard formulas are perfectly applied.
 * 4. Cleans up default empty 'Sheet1' if present.
 * 5. Displays confirmation dialog.
 */
function safeRebuildAndSetup() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert(
    "🔄 Initialize & Safe Rebuild",
    "This will verify all 36 Dual-License columns, dark luxury styling, plain-text formats, and the Operations KPI Dashboard.\\n\\n✅ 100% SAFE: Existing driver applicant records will NOT be deleted or cleared.\\n\\nProceed?",
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

  ui.alert("System Ready", "✅ Rownaa Executive Chauffeur Platform has been initialized and synchronized successfully with all 36 columns and KPI Dashboard intact!", ui.ButtonSet.OK);
}

/**
 * Master Setup Function: Builds the 36-column Dual-License Registry, formatting, formulas, and Dashboard.
 */
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

  var headers = [
    "Timestamp",                       // Col A (1)
    "Application ID",                  // Col B (2)
    "Full Name",                       // Col C (3)
    "Phone (WhatsApp)",                // Col D (4)
    "💬 1-Click WhatsApp",              // Col E (5)
    "NID Number",                      // Col F (6)
    "Base Area / District",            // Col G (7)
    "Emergency Contact",               // Col H (8)
    "Driver License No. (BRTA)",       // Col I (9)  - Dedicated Driver's License
    "Driver License Class",            // Col J (10) - Professional Light/Heavy
    "Driver License Expiry",           // Col K (11) - Expiry Date
    "Driver License Status",           // Col L (12) - Formula Expiry Alert
    "Car License / Reg Plate No.",     // Col M (13) - Dedicated Car License Plate
    "Car Model & Make",                // Col N (14) - Dedicated Vehicle Model
    "Car Fitness & Tax Expiry",        // Col O (15) - Vehicle Fitness Expiry
    "Experience",                      // Col P (16)
    "Languages",                       // Col Q (17)
    "Services Selected",               // Col R (18)
    "Availability",                    // Col S (19)
    "Role Type",                       // Col T (20) - Chauffeur vs Rental Fleet Owner
    "Full Vehicle & Fleet Details",    // Col U (21) - Comprehensive fleet/car manifest
    "Payout Wallet & Bank Account",    // Col V (22) - bKash / Nagad / Bank Details
    "Verification Status",             // Col W (23) - Dropdown (Pending, Approved, etc)
    "Doc Completeness",                // Col X (24) - Formula Completeness Check
    "Photo Document",                  // Col Y (25) - Chauffeur Portrait Headshot
    "Driver License (Front)",          // Col Z (26) - Driver Lic Front
    "Driver License (Back)",           // Col AA (27) - Driver Lic Back
    "Car License / Blue Book (Front)", // Col AB (28) - Car Reg / Blue Book Front
    "Car License / Blue Book (Back)",  // Col AC (29) - Car Reg / Blue Book Back
    "Car Fitness / Tax Token Doc",     // Col AD (30) - Tax Token / Fitness Doc
    "NID (Front)",                     // Col AE (31) - Smart NID Front
    "NID (Back)",                      // Col AF (32) - Smart NID Back
    "Admin Tracker & Audit",           // Col AG (33) - Duplicate & Resubmission Iteration
    "Resubmission Notes & Reasons",    // Col AH (34) - Applicant correction notes
    "Verified By (Operator)",          // Col AI (35) - Auto Operator onEdit
    "Verification Time"                // Col AJ (36) - Auto Operator timestamp
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
  sheet.setRowHeight(1, 44);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4); // Freeze Timestamp, ID, Name, Phone

  // Format Numeric/Phone/Plate Columns as Plain Text (@)
  sheet.getRange("B:B").setNumberFormat("@"); // Application ID
  sheet.getRange("D:D").setNumberFormat("@"); // Phone
  sheet.getRange("F:F").setNumberFormat("@"); // NID
  sheet.getRange("I:I").setNumberFormat("@"); // Driver License No
  sheet.getRange("M:M").setNumberFormat("@"); // Car License Plate No
  sheet.getRange("V:V").setNumberFormat("@"); // Payout Account

  // Clear data validations from non-status columns
  sheet.getRange(2, 1, 1000, 22).clearDataValidations();
  sheet.getRange(2, 24, 1000, 13).clearDataValidations();

  // Set Status Dropdown Validation in Column W (Column 23)
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
  sheet.getRange(2, 23, 1000, 1).setDataValidation(statusRule);

  // Set Column Widths for Optimal Ergonomics (36 Columns)
  var colWidths = [
    145, // A: Timestamp
    125, // B: ID
    170, // C: Name
    135, // D: Phone
    165, // E: WhatsApp Action Button
    145, // F: NID
    145, // G: District
    165, // H: Emergency
    140, // I: Driver License No
    125, // J: Driver License Class
    120, // K: Driver License Expiry
    130, // L: Driver License Status
    155, // M: Car License Plate No
    150, // N: Car Model & Make
    130, // O: Car Fitness & Tax Expiry
    100, // P: Experience
    120, // Q: Languages
    190, // R: Services Selected
    110, // S: Availability
    135, // T: Role Type
    180, // U: Vehicle & Fleet Details
    165, // V: Payout Wallet & Bank
    165, // W: Verification Status
    140, // X: Doc Completeness
    125, // Y: Photo
    130, // Z: Driver Lic Front
    130, // AA: Driver Lic Back
    135, // AB: Car Lic Front
    135, // AC: Car Lic Back
    130, // AD: Fitness / Tax Doc
    125, // AE: NID Front
    125, // AF: NID Back
    240, // AG: Admin Tracker & Audit
    220, // AH: Resubmission Notes
    140, // AI: Operator
    140  // AJ: Verified Time
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

  dash.clear();
  dash.clearFormats();

  // Row 1: Header Banner
  dash.getRange("A1:H1").merge();
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
  var kpiHeaders = ["Total Applicants", "Pending Verification", "Under Review", "Contacted", "Approved & Verified", "Rejected", "Car Owners / Fleets", "Approval Rate %"];
  dash.getRange("A3:H3").setValues([kpiHeaders]);
  dash.getRange("A3:H3")
    .setBackground("#1a1a20")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.setRowHeight(3, 28);

  // Status is in Column W (Col 23), Car Plate is in Column M (Col 13)
  var kpiFormulas = [
    '=COUNTA(\'' + SHEET_REGISTRY_NAME + '\'!B2:B)',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!W2:W, "Pending Verification")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!W2:W, "Under Review")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!W2:W, "Contacted & Scheduled")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!W2:W, "Approved & Verified")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!W2:W, "Rejected")',
    '=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!M2:M, "*Metro*") + COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!M2:M, "*GA*") + COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!M2:M, "*CHA*")',
    '=IF(A4=0, 0, (E4/A4))'
  ];
  dash.getRange("A4:H4").setFormulas([kpiFormulas]);
  dash.getRange("A4:H4")
    .setFontSize(16)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.getRange("H4").setNumberFormat("0.0%");
  dash.setRowHeight(4, 40);

  // Distinct Backgrounds for KPI Tiles
  dash.getRange("A4").setBackground("#f0f0f2").setFontColor("#111111"); // Total
  dash.getRange("B4").setBackground("#fffbe6").setFontColor("#d48800"); // Pending
  dash.getRange("C4").setBackground("#e6f7ff").setFontColor("#096dd9"); // Under Review
  dash.getRange("D4").setBackground("#f9f0ff").setFontColor("#722ed1"); // Contacted
  dash.getRange("E4").setBackground("#f6ffed").setFontColor("#389e0d"); // Approved
  dash.getRange("F4").setBackground("#fff1f0").setFontColor("#cf1322"); // Rejected
  dash.getRange("G4").setBackground("#e6f7ff").setFontColor("#1d39c4"); // Car Owners/Fleets
  dash.getRange("H4").setBackground("#e6fffb").setFontColor("#08979c"); // Approval Rate

  // Row 6: Live Visual Sparkline Progress Bars
  dash.getRange("A6:H6").merge();
  dash.getRange("A6").setValue("📊 Real-Time Application Intake & Verification Flow");
  dash.getRange("A6").setFontWeight("bold").setFontSize(11).setFontColor("#333333");

  dash.getRange("A7:H7").merge();
  dash.getRange("A7").setFormula(
    '=SPARKLINE({B4, C4, D4, E4, F4}, {"charttype","bar"; "color1","#faad14"; "color2","#1890ff"; "color3","#722ed1"; "color4","#52c41a"; "color5","#ff4d4f"})'
  );
  dash.setRowHeight(7, 24);

  // Row 9-14: Regional & Demographic Distribution
  dash.getRange("A9:D9").merge().setValue("📍 Geographic Inflow Breakdown").setFontWeight("bold").setBackground("#222228").setFontColor("#ffffff");
  dash.getRange("A10").setValue("Dhaka — Gulshan, Banani & Airport Zone");
  dash.getRange("B10:C10").merge().setFormula('=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Gulshan*") + COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Banani*") + COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Airport*")');
  dash.getRange("D10").setFormula('=IF(A4=0, 0, B10/A4)').setNumberFormat("0.0%");

  dash.getRange("A11").setValue("Dhaka — Uttara & North Suburbs");
  dash.getRange("B11:C11").merge().setFormula('=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Uttara*")');
  dash.getRange("D11").setFormula('=IF(A4=0, 0, B11/A4)').setNumberFormat("0.0%");

  dash.getRange("A12").setValue("Dhaka — Dhanmondi, Mirpur & Central");
  dash.getRange("B12:C12").merge().setFormula('=COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Dhanmondi*") + COUNTIF(\'' + SHEET_REGISTRY_NAME + '\'!G2:G, "*Mirpur*")');
  dash.getRange("D12").setFormula('=IF(A4=0, 0, B12/A4)').setNumberFormat("0.0%");

  dash.getRange("A13").setValue("Intercity & Regional Districts (CTG, Sylhet, etc.)");
  dash.getRange("B13:C13").merge().setFormula('=A4 - (B10 + B11 + B12)');
  dash.getRange("D13").setFormula('=IF(A4=0, 0, B13/A4)').setNumberFormat("0.0%");

  dash.getRange("A10:A13").setFontSize(9);
  dash.getRange("B10:D13").setFontSize(9).setHorizontalAlignment("center");

  // Instructions
  dash.getRange("A16:H16").merge();
  dash.getRange("A16").setValue("ℹ️ How to manage: Open the 'Chauffeur Registry' tab below. Select Column W to update verification status. The dashboard updates automatically in real-time.");
  dash.getRange("A16").setFontSize(9).setFontColor("#666666").setFontStyle("italic");

  for (var c = 1; c <= 8; c++) {
    dash.setColumnWidth(c, 150);
  }
}

/**
 * Self-healing repair for legacy column shifts and formulas.
 */
function repairExistingErrors() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupDashboardSheet(ss);

  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var maxCols = Math.max(sheet.getLastColumn(), 36);
  var dataRange = sheet.getRange(2, 1, lastRow - 1, maxCols);
  var values = dataRange.getValues();
  var formulas = dataRange.getFormulas();

  var needUpdate = false;

  for (var r = 0; r < values.length; r++) {
    var phoneVal = values[r][3]; // Col D: Phone
    var colEVal = String(values[r][4] || "").trim(); // Col E
    var colEFormula = formulas[r][4] || "";

    // Repair Phone in Col D
    var dFormula = formulas[r][3] || "";
    if (phoneVal === "#ERROR!" || (typeof phoneVal === 'string' && phoneVal.indexOf("ERROR") !== -1) || dFormula.startsWith("=+")) {
      var fixed = dFormula.replace(/^=+\+?/, "+");
      values[r][3] = "'" + (fixed.length > 5 ? fixed : "+880 1711 000000");
      needUpdate = true;
    } else if (typeof phoneVal === 'number') {
      var numStr = String(phoneVal);
      if (numStr.length === 10 && numStr.startsWith("1")) {
        values[r][3] = "'0" + numStr;
        needUpdate = true;
      }
    }

    // Inject WhatsApp Button into Col E
    var cleanPhone = String(values[r][3]).replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "880" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("880") && cleanPhone.length === 10) {
      cleanPhone = "880" + cleanPhone;
    }

    var applicantName = values[r][2] || "Chauffeur";
    if (cleanPhone.length >= 10 && !colEFormula.includes("HYPERLINK")) {
      var waLink = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent("Hello " + applicantName + ", this is Rownaa Executive Fleet Operations.");
      formulas[r][4] = '=HYPERLINK("' + waLink + '", "🟢 Chat on WhatsApp")';
      values[r][4] = "";
      needUpdate = true;
    }
  }

  if (needUpdate) {
    dataRange.setValues(values);
    dataRange.setFormulas(formulas);
  }

  // Refresh status dropdown on Column W (Col 23)
  var statusOptions = ["Pending Verification", "Under Review", "Contacted & Scheduled", "Approved & Verified", "Rejected"];
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 23, Math.max(lastRow, 500), 1).setDataValidation(statusRule);
}

/**
 * Triggered automatically when an operator edits a cell.
 * When Column W (Verification Status) changes, auto-records operator email and timestamp in Cols AI & AJ.
 * NEVER overwrites Admin Tracker or Resubmission Notes!
 */
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_REGISTRY_NAME) return;

  var row = e.range.getRow();
  var col = e.range.getColumn();

  // Column W is Verification Status (Col 23)
  if (col === 23 && row > 1) {
    var operatorEmail = Session.getActiveUser().getEmail() || "Ops Admin";
    var timestampStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+6", "yyyy-MM-dd HH:mm:ss");

    sheet.getRange(row, 35).setValue(operatorEmail); // Col AI: Verified By
    sheet.getRange(row, 36).setValue(timestampStr);  // Col AJ: Verification Time
  }
}

/**
 * Helper to get or create Google Drive folder for driver documents.
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
 */
function saveBase64DocumentToDrive(base64Data, filename, parentFolder) {
  if (!base64Data || typeof base64Data !== 'string') return null;

  try {
    var cleanBase64 = base64Data;
    var contentType = "image/jpeg";

    if (cleanBase64.indexOf("data:") === 0) {
      var matches = cleanBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        contentType = matches[1];
        cleanBase64 = matches[2];
      }
    }

    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, contentType, filename);
    var file = parentFolder.createFile(blob);

    return file.getUrl();
  } catch (error) {
    Logger.log("Error saving document " + filename + ": " + error.toString());
    return null;
  }
}

/**
 * Main Webhook POST Ingestion Endpoint (doPost).
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
    var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
    }

    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var appId = sanitizeCellValue(data.applicationId || data.id || "DRV-DAC-" + Math.floor(1000 + Math.random() * 9000));
    var applicantName = sanitizeCellValue(data.fullName || data.name || "Chauffeur Applicant");

    // Dedicated Subfolder in Drive Vault for this applicant
    var vaultFolder = getDocumentVaultFolder();
    var applicantFolder;
    try {
      applicantFolder = vaultFolder.createFolder(appId + " - " + applicantName);
    } catch(fErr) {
      applicantFolder = vaultFolder;
    }

    // 1. SAVE DRIVER'S DRIVING LICENSE & IDENTITY DOCUMENTS
    var photoUrl = saveBase64DocumentToDrive(data.photoBase64, "01_driver_portrait.jpg", applicantFolder);
    var driverLicFrontUrl = saveBase64DocumentToDrive(data.licenseFrontBase64 || data.driverLicenseFrontBase64, "02_driver_license_front.jpg", applicantFolder);
    var driverLicBackUrl = saveBase64DocumentToDrive(data.licenseBackBase64 || data.driverLicenseBackBase64, "03_driver_license_back.jpg", applicantFolder);
    var nidFrontUrl = saveBase64DocumentToDrive(data.nidFrontBase64, "04_nid_front.jpg", applicantFolder);
    var nidBackUrl = saveBase64DocumentToDrive(data.nidBackBase64, "05_nid_back.jpg", applicantFolder);

    // 2. SAVE CAR / VEHICLE LICENSE & REGISTRATION DOCUMENTS
    var carLicFrontUrl = saveBase64DocumentToDrive(data.carLicenseFrontBase64 || data.carRegFrontBase64, "06_car_license_registration_front.jpg", applicantFolder);
    var carLicBackUrl = saveBase64DocumentToDrive(data.carLicenseBackBase64 || data.carRegBackBase64, "07_car_license_registration_back.jpg", applicantFolder);
    var carFitnessUrl = saveBase64DocumentToDrive(data.carFitnessBase64 || data.carTaxTokenBase64, "08_car_fitness_tax_token.jpg", applicantFolder);

    // 3. SAVE EMPLOYED FLEET DRIVERS' LICENSES & CARS
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

        if (!driverLicFrontUrl && dLicFrontUrl) driverLicFrontUrl = dLicFrontUrl;
        if (!driverLicBackUrl && dLicBackUrl) driverLicBackUrl = dLicBackUrl;
      }
    }

    // Save Fleet Vehicles' Blue Books / Registration Cards if provided
    var fleetCarDocCount = 0;
    if (data.fleetData && Array.isArray(data.fleetData.cars)) {
      for (var fcIdx = 0; fcIdx < data.fleetData.cars.length; fcIdx++) {
        var fCar = data.fleetData.cars[fcIdx];
        var cNum = fcIdx + 1;
        var cPlateClean = String(fCar.reg || fCar.plate || ("Car_" + cNum)).replace(/[^a-zA-Z0-9_-]/g, "_");

        var cFront = null;
        if (fCar.carLicenseFront || fCar.carLicenseFrontBase64) {
          cFront = saveBase64DocumentToDrive(fCar.carLicenseFront || fCar.carLicenseFrontBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_reg_front.jpg", applicantFolder);
          if (cFront) fleetCarDocCount++;
        }
        var cBack = null;
        if (fCar.carLicenseBack || fCar.carLicenseBackBase64) {
          cBack = saveBase64DocumentToDrive(fCar.carLicenseBack || fCar.carLicenseBackBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_reg_back.jpg", applicantFolder);
          if (cBack) fleetCarDocCount++;
        }

        if (!carLicFrontUrl && cFront) carLicFrontUrl = cFront;
        if (!carLicBackUrl && cBack) carLicBackUrl = cBack;
      }
    }

    // Hyperlink Formulas for Documents
    var photoFormula = photoUrl ? '=HYPERLINK("' + photoUrl + '", "🔍 View Photo")' : '—';
    var driverLicFrontFormula = driverLicFrontUrl ? '=HYPERLINK("' + driverLicFrontUrl + '", "📄 Driver Lic Front")' : '—';
    var driverLicBackFormula = driverLicBackUrl ? '=HYPERLINK("' + driverLicBackUrl + '", "📄 Driver Lic Back")' : '—';
    var carLicFrontFormula = carLicFrontUrl ? '=HYPERLINK("' + carLicFrontUrl + '", "🚗 Car Reg Front")' : '—';
    var carLicBackFormula = carLicBackUrl ? '=HYPERLINK("' + carLicBackUrl + '", "🚗 Car Reg Back")' : '—';
    var carFitnessFormula = carFitnessUrl ? '=HYPERLINK("' + carFitnessUrl + '", "📑 Fitness/Tax Doc")' : '—';
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

    // Emergency Contact
    var emergencyStr = "";
    if (data.emergencyContact) {
      emergencyStr = (typeof data.emergencyContact === 'object') ?
        (data.emergencyContact.name || "") + " (" + (data.emergencyContact.phone || "") + ")" :
        String(data.emergencyContact);
    }

    // Car License / Registration Plate & Vehicle Profile
    var carPlateNo = String(data.carLicenseNumber || data.carPlate || data.plateNumber || "").trim();
    var carModelStr = String(data.carModel || data.vehicleModel || "").trim();
    var carFitnessExpiry = String(data.carFitnessExpiry || data.taxTokenExpiry || "—").trim();

    var vehicleStr = "";
    if (data.vehicleProfile) {
      vehicleStr = String(data.vehicleProfile);
    } else if (data.fleetData) {
      var fd = data.fleetData;
      var cList = Array.isArray(fd.cars) ? fd.cars.map(function(c, i) { return (i + 1) + ". " + (c.model || "Vehicle") + " [" + (c.reg || c.plate || "No Plate") + "]"; }).join(", ") : "";
      var dList = Array.isArray(fd.drivers) ? fd.drivers.map(function(d) { return d.name + " (" + d.phone + ")"; }).join(", ") : "";
      vehicleStr = "Rental Fleet (" + (fd.cars ? fd.cars.length : 0) + " Cars, " + (fd.drivers ? fd.drivers.length : 0) + " Drivers): " + cList + (dList ? " | Drivers: " + dList : "");
      if (!carPlateNo && fd.cars && fd.cars.length > 0) {
        carPlateNo = fd.cars.map(function(c){ return c.reg || c.plate; }).join(", ");
      }
      if (!carModelStr && fd.cars && fd.cars.length > 0) {
        carModelStr = fd.cars.map(function(c){ return c.model; }).join(", ");
      }
    } else if (data.ownerCar) {
      var oc = (typeof data.ownerCar === 'object') ? data.ownerCar : {};
      vehicleStr = (oc.model || "") + " [" + (oc.plateNumber || "") + "]";
      if (!carPlateNo) carPlateNo = oc.plateNumber || "";
      if (!carModelStr) carModelStr = oc.model || "";
    } else {
      vehicleStr = carModelStr ? carModelStr : "N/A (Fleet Chauffeur)";
    }

    if (!carPlateNo) carPlateNo = "—";
    if (!carModelStr) carModelStr = "—";

    // Payout Wallet & Bank Details
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
    var cleanLicForMatch = String(data.licenseNumber || data.driverLicenseNumber || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    var cleanPlateForMatch = carPlateNo.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    var isDriverCorrection = (data.isResubmission === true || data.isResubmission === "true" || !!data.correctionReason);
    var prevAppIdGiven = String(data.previousApplicationId || data.prevAppId || "").trim();

    var duplicateMatches = [];
    var submissionIteration = 1;
    var existingRowCount = sheet.getLastRow();
    
    if (existingRowCount > 1) {
      try {
        var existingValues = sheet.getRange(2, 1, existingRowCount - 1, Math.min(sheet.getLastColumn(), 36)).getValues();
        for (var eIdx = 0; eIdx < existingValues.length; eIdx++) {
          var rowP = String(existingValues[eIdx][3] || "").replace(/[^0-9]/g, "").replace(/^880/, "0");
          var rowN = String(existingValues[eIdx][5] || "").replace(/[^0-9]/g, "");
          var rowL = String(existingValues[eIdx][8] || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
          var rowPlate = String(existingValues[eIdx][12] || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
          var rowId = String(existingValues[eIdx][1] || "");
          var matchFields = [];

          if (cleanPhoneForMatch && rowP && cleanPhoneForMatch === rowP) matchFields.push("Phone");
          if (cleanNidForMatch && rowN && cleanNidForMatch === rowN) matchFields.push("NID");
          if (cleanLicForMatch && rowL && cleanLicForMatch === rowL) matchFields.push("Driver License");
          if (cleanPlateForMatch && rowPlate && rowPlate !== "—" && cleanPlateForMatch === rowPlate) matchFields.push("Car Plate");

          if (matchFields.length > 0) {
            submissionIteration++;
            duplicateMatches.push({
              row: eIdx + 2,
              appId: rowId,
              matchedOn: matchFields.join(" & ")
            });
          }
        }
      } catch(scanErr) {}
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

    // In-Cell Formulas
    // Driver License Expiry Formula in Col L (12), referencing Col K (11)
    var driverLicenseStatusFormula = '=IF(K' + nextRowIdx + '="—", "—", IF(DATEVALUE(K' + nextRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + nextRowIdx + ')<TODAY()+30, "⚠️ EXPIRING SOON", "✅ VALID")))';
    
    // Completeness Formula in Col X (24): Checks Photo (Y), Driver Lic (Z, AA), NID (AE, AF)
    var docCompletenessFormula = '=IF(AND(Y' + nextRowIdx + '<>"—", Z' + nextRowIdx + '<>"—", AA' + nextRowIdx + '<>"—", AE' + nextRowIdx + '<>"—", AF' + nextRowIdx + '<>"—"), "✅ Driver Docs Complete", "⚠️ Pending Docs")';

    // Construct Row Array (36 Columns)
    var row = [
      sanitizeCellValue(data.submittedAt || new Date().toISOString()), // Col A (1): Timestamp
      appId,                                                          // Col B (2): Application ID
      applicantName,                                                  // Col C (3): Full Name
      formatAsPlainText(rawPhone),                                    // Col D (4): Phone (WhatsApp)
      whatsappFormula,                                                // Col E (5): 🟢 Chat on WhatsApp
      formatAsPlainText(data.nidNumber || data.nid || ""),            // Col F (6): NID Number
      sanitizeCellValue(data.baseCity || data.city || ""),            // Col G (7): District
      sanitizeCellValue(emergencyStr),                                // Col H (8): Emergency Contact
      formatAsPlainText(data.licenseNumber || data.driverLicenseNumber || ""), // Col I (9): Driver License No. (BRTA)
      sanitizeCellValue(data.licenseType || data.driverLicenseType || ""),    // Col J (10): Driver License Class
      sanitizeCellValue(data.licenseExpiry || data.driverLicenseExpiry || "—"), // Col K (11): Driver License Expiry
      driverLicenseStatusFormula,                                     // Col L (12): Driver License Status
      formatAsPlainText(carPlateNo),                                  // Col M (13): Car License / Reg Plate No.
      sanitizeCellValue(carModelStr),                                 // Col N (14): Car Model & Make
      sanitizeCellValue(carFitnessExpiry),                            // Col O (15): Car Fitness & Tax Expiry
      sanitizeCellValue(data.experience || ""),                       // Col P (16): Experience
      sanitizeCellValue(data.languages || ""),                        // Col Q (17): Languages
      sanitizeCellValue(servicesStr),                                 // Col R (18): Services Selected
      sanitizeCellValue(data.availability || "full_time"),            // Col S (19): Availability
      sanitizeCellValue(data.role || data.driverRole || "Fleet Chauffeur"), // Col T (20): Role Type
      sanitizeCellValue(vehicleStr),                                  // Col U (21): Full Vehicle & Fleet Details
      formatAsPlainText(payoutStr),                                   // Col V (22): Payout Wallet & Bank Account
      sanitizeCellValue(data.status || "Pending Verification"),       // Col W (23): Verification Status
      docCompletenessFormula,                                         // Col X (24): Doc Completeness
      photoFormula,                                                   // Col Y (25): Photo Document
      driverLicFrontFormula,                                          // Col Z (26): Driver License (Front)
      driverLicBackFormula,                                           // Col AA (27): Driver License (Back)
      carLicFrontFormula,                                             // Col AB (28): Car License / Blue Book (Front)
      carLicBackFormula,                                              // Col AC (29): Car License / Blue Book (Back)
      carFitnessFormula,                                              // Col AD (30): Car Fitness / Tax Token Doc
      nidFrontFormula,                                                // Col AE (31): NID (Front)
      nidBackFormula,                                                 // Col AF (32): NID (Back)
      sanitizeCellValue(auditTrackerStr),                             // Col AG (33): Admin Tracker & Audit
      sanitizeCellValue(resubmissionNotesStr),                        // Col AH (34): Resubmission Notes
      "",                                                             // Col AI (35): Verified By
      ""                                                              // Col AJ (36): Verification Time
    ];

    sheet.appendRow(row);

    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, row.length);
    rowRange.setFontSize(10);
    rowRange.setFontFamily("Roboto");
    rowRange.setVerticalAlignment("middle");
    sheet.setRowHeight(lastRow, 34);

    if (lastRow % 2 === 0) {
      rowRange.setBackground("#fafafa");
    }

    // WhatsApp Button Styling (Col E / 5)
    var waCell = sheet.getRange(lastRow, 5);
    waCell.setBackground("#e8f8f0");
    waCell.setFontColor("#075e54");
    waCell.setFontWeight("bold");
    waCell.setHorizontalAlignment("center");

    // Status Validation on Col W (23)
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Pending Verification", "Under Review", "Contacted & Scheduled", "Approved & Verified", "Rejected"], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange(lastRow, 23).setDataValidation(statusRule);

    // Audit Tracker Styling (Col AG / 33)
    var auditCell = sheet.getRange(lastRow, 33);
    auditCell.setBackground(auditBgColor);
    auditCell.setFontColor(auditFgColor);
    auditCell.setFontWeight("bold");

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Chauffeur application recorded safely into Rownaa Dual-License Registry!",
      row: lastRow,
      applicationId: appId,
      auditStatus: auditTrackerStr,
      isResubmission: isDriverCorrection,
      iteration: submissionIteration,
      documentsSaved: {
        photo: !!photoUrl,
        driverLicenseFront: !!driverLicFrontUrl,
        driverLicenseBack: !!driverLicBackUrl,
        carLicenseFront: !!carLicFrontUrl,
        carLicenseBack: !!carLicBackUrl,
        carFitness: !!carFitnessUrl,
        nidFront: !!nidFrontUrl,
        nidBack: !!nidBackUrl,
        fleetDriverLicenses: fleetDriverLicenseCount,
        fleetCarDocs: fleetCarDocCount
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
      message: "Full enterprise Dual-License sheet initialized safely: 36 columns, dark luxury styling, and KPI Dashboard ready!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "repair" || action === "fix") {
    repairExistingErrors();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Rownaa Operations Self-Healing completed: WhatsApp buttons generated, NID aligned, phone errors fixed, and dashboard refreshed!",
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
        driverLicense: {
          number: String(r[8]).replace(/^'/, ""),
          class: r[9],
          expiry: r[10],
          status: r[11]
        },
        carLicense: {
          plateNumber: String(r[12]).replace(/^'/, ""),
          model: r[13],
          fitnessExpiry: r[14]
        },
        experience: r[15],
        languages: r[16],
        services: r[17],
        availability: r[18],
        role: r[19],
        vehicle: r[20],
        payout: String(r[21]).replace(/^'/, ""),
        status: r[22],
        docCompleteness: r[23],
        auditTracker: r[32] || "—",
        resubmissionNotes: r[33] || "—"
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
    service: "Rownaa Executive Chauffeur Operations Platform (Superpower Dual-License v6.0)",
    version: "6.0",
    schemaColumns: 36,
    features: [
      "Dual-License Schema: Dedicated Driver License & Dedicated Car/Vehicle License",
      "1-Click WhatsApp Button (Column E)",
      "1-Click Menu Launcher: Open WhatsApp for Selected Driver",
      "1-Click Copy Chauffeur Profile Dossier to Clipboard",
      "Automatic Alignment & Self-Healing",
      "Zero-#ERROR! Anti-Formula Shield",
      "8-Document Dedicated Google Drive Vault",
      "Duplicate Data Tracker & Resubmission Engine with Car Plate Detection",
      "Protected Operator Audit Trail onEdit (Columns AI & AJ)",
      "Executive KPI Dashboard with Car Owner Count & Sparklines",
      "Automated Daily Backup to Google Drive & Excel (.xlsx)"
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

function getBackupFolder() {
  var folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  var newFolder = DriveApp.createFolder(BACKUP_FOLDER_NAME);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

function createDailyBackup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var backupFolder = getBackupFolder();
  var timeZone = Session.getScriptTimeZone() || "GMT+6";
  var dateStamp = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd_HH-mm");
  var friendlyDate = Utilities.formatDate(new Date(), timeZone, "dd MMM yyyy, hh:mm a");

  var ssFile = DriveApp.getFileById(ss.getId());

  var backupSheetName = "Rownaa_Operations_Backup_" + dateStamp;
  var backupSheetCopy = ssFile.makeCopy(backupSheetName, backupFolder);
  var sheetBackupUrl = backupSheetCopy.getUrl();

  var excelFileUrl = "";
  try {
    var url = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=xlsx";
    var params = {
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, params);
    if (response.getResponseCode() === 200) {
      var excelBlob = response.getBlob().setName("Rownaa_Operations_Export_" + dateStamp + ".xlsx");
      var excelFile = backupFolder.createFile(excelBlob);
      excelFileUrl = excelFile.getUrl();
    }
  } catch (err) {
    Logger.log("Excel export note: " + err.toString());
  }

  try {
    pruneOldBackups(backupFolder, 30);
  } catch (pErr) {}

  return {
    status: "success",
    timestamp: dateStamp,
    sheetBackupUrl: sheetBackupUrl,
    excelBackupUrl: excelFileUrl
  };
}

function pruneOldBackups(folder, maxRetention) {
  var files = folder.getFiles();
  var fileList = [];
  while (files.hasNext()) {
    var f = files.next();
    fileList.push({ file: f, date: f.getDateCreated().getTime() });
  }
  if (fileList.length > maxRetention * 2) {
    fileList.sort(function(a, b) { return a.date - b.date; });
    var toRemove = fileList.length - (maxRetention * 2);
    for (var i = 0; i < toRemove; i++) {
      fileList[i].file.setTrashed(true);
    }
  }
}

function installDailyBackupTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "createDailyBackup") {
      return;
    }
  }
  ScriptApp.newTrigger("createDailyBackup")
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
}

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
    '<p style="margin:0; font-size:12px; color:#aaa;">Exporting complete Dual-License Chauffeur Registry & KPI Dashboard to Microsoft Excel (.xlsx)</p>' +
    '<a href="' + exportUrl + '" target="_blank" class="dl-btn">💾 Click to Download .xlsx</a>' +
    '<div class="info">Download starting automatically in a new tab... If blocked by your browser, click the yellow button above.</div>' +
    '<script>' +
    'window.open("' + exportUrl + '", "_blank");' +
    'setTimeout(function(){ google.script.host.close(); }, 5000);' +
    '</script></body></html>'
  ).setWidth(380).setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, "Downloading Excel Backup");
}

function openBackupFolder() {
  var folder = getBackupFolder();
  var url = folder.getUrl();
  var html = HtmlService.createHtmlOutput('<html><script>window.open("' + url + '", "_blank");google.script.host.close();</script><body>Opening Daily Backups Folder...</body></html>')
    .setWidth(300)
    .setHeight(80);
  SpreadsheetApp.getUi().showModalDialog(html, "Opening Daily Backups");
}
`;

fs.writeFileSync('google_sheet_webhook.gs', code, 'utf8');
fs.writeFileSync('netlify-driver-portal/google_sheet_webhook.gs', code, 'utf8');
console.log('google_sheet_webhook.gs successfully updated with Dual-License Architecture (36 Columns)!');

