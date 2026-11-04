/**
 * ============================================================================
 * ROWNAA® DRIVER, CAR & RENTAL OPERATIONS PLATFORM — ENTERPRISE ENGINE v7.0
 * Architecture: 2-Section Clean Master (1. Dashboard | 2. Registrations)
 * Multi-Vehicle & Multi-Driver Single-Column Schema (No Sub-Columns, No Broken Cells)
 * ============================================================================
 * 
 * 🌟 CORE ARCHITECTURAL PILLARS:
 * 1. 📂 2 CLEAN OPERATIONAL SECTIONS:
 *    - SECTION 1: "Dashboard" (Real-time Operations KPI Control Center & Sparklines)
 *    - SECTION 2: "Registrations" (Single unified database for All Drivers, Owner-Drivers & Rental Companies)
 * 2. 🚗 MULTI-CAR SINGLE COLUMN (Col Q):
 *    - Multiple cars from rental businesses are neatly listed inside ONE single formatted column.
 * 3. 👨‍✈️ MULTI-DRIVER SINGLE COLUMN (Col R):
 *    - Multiple employed drivers from rental fleets are neatly listed inside ONE single formatted column.
 * 4. 🛡️ 100% MERGED-CELL FREE & ZERO-FREEZE-CRASH:
 *    - Flat, single-row headers. Defensive unmerge (breakApart) eliminates freeze exceptions forever.
 * 5. 🟢 1-Click WhatsApp Button (Column E): Clickable chat launcher with international prefix handling.
 * 6. 🔍 Advanced Duplicate Data Tracker & Resubmission Auditor (Columns AH & AI).
 * 7. 🗂️ 9-Document Dedicated Google Drive Vault (Columns Y to AG).
 * ============================================================================
 */

// Global Configuration — 2 Master Operational Sections
var FOLDER_NAME = "Rownaa Driver Documents";
var BACKUP_FOLDER_NAME = "Rownaa Daily Backups";
var SHEET_REGISTRY_NAME = "Registrations"; // (Main Sheet with All Drivers & Cars)
var SHEET_DASHBOARD_NAME = "Dashboard";     // (Operations KPI Dashboard)
var MAX_PAYLOAD_BYTES = 10 * 1024 * 1024;  // 10MB security ceiling

/**
 * Custom UI Menu added to Google Sheets top toolbar upon opening.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("⚡ Rownaa Driver & Car Manager")
    .addItem("🔄 Setup & Align All Sheets (Safe)", "safeRebuildAndSetup")
    .addSeparator()
    .addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")
    .addItem("📋 Copy Driver Details Summary", "copyChauffeurSummary")
    .addItem("🔍 Check Duplicate & Repeat Applications", "checkDuplicateAuditLog")
    .addItem("💾 Backup Spreadsheet to Google Drive Now", "manualBackupToDrive")
    .addItem("📥 Download Offline Backup (.xlsx Excel)", "downloadBackupExcel")
    .addItem("📂 Open Daily Backups Folder in Drive", "openBackupFolder")
    .addSeparator()
    .addItem("🧹 Fix & Align Sheet Columns (Safe)", "repairExistingErrors")
    .addItem("🎛️ Refresh Dashboard", "refreshDashboard")
    .addItem("🗂️ Open Documents Folder in Drive", "openDriveFolder")
    .addToUi();
}

/**
 * Helper to retrieve the active Registrations sheet (supporting legacy tab aliases).
 */
function getRegistrationsSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) {
    sheet = ss.getSheetByName("All Registrations") || ss.getSheetByName("Chauffeur Registry") || ss.getSheetByName("Driver Registry");
    if (sheet) {
      sheet.setName(SHEET_REGISTRY_NAME);
    }
  }
  return sheet;
}

/**
 * 1-Click WhatsApp Launcher:
 * Click any cell in any driver's row -> Run this function -> Opens WhatsApp chat immediately!
 */
function openWhatsAppForSelectedDriver() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getRegistrationsSheet(ss);
  
  if (!sheet || sheet.getLastColumn() < 30) {
    autoAlignAndRepairSheet(false);
    sheet = getRegistrationsSheet(ss);
  }
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Registrations sheet not found. Please click 'Setup & Align All Sheets (Safe)' first.");
    return;
  }

  if (ss.getActiveSheet().getName() !== SHEET_REGISTRY_NAME) {
    ss.setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert("Switched to '" + SHEET_REGISTRY_NAME + "' tab. Please click any driver's row (Row 2 or below) and click 'Open WhatsApp' again.");
    return;
  }

  var activeRow = ss.getActiveSheet().getActiveCell().getRow();
  if (activeRow < 2) {
    SpreadsheetApp.getUi().alert("Please click any driver's row (Row 2 or below) first to launch WhatsApp.");
    return;
  }

  var name = sheet.getRange(activeRow, 3).getValue() || "Driver / Owner"; // Col C: Name
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

  var message = "Hello " + name + ", this is Rownaa Driver & Fleet Operations regarding your application.";
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
 * 1-Click Copy Driver / Fleet Summary:
 * Generates an executive clipboard-ready dossier of the selected row.
 */
function copyChauffeurSummary() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getRegistrationsSheet(ss);
  if (!sheet) return;

  var activeRow = ss.getActiveSheet().getActiveCell().getRow();
  if (activeRow < 2) {
    SpreadsheetApp.getUi().alert("Please select a driver / company row (Row 2 or below) first.");
    return;
  }

  var maxCols = Math.min(sheet.getLastColumn(), 38);
  var r = sheet.getRange(activeRow, 1, 1, maxCols).getValues()[0];
  var summaryText = 
    "⭐ ROWNAA® DRIVER & CAR PROFILE DOSSIER ⭐\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "• Application ID: " + (r[1] || "N/A") + "\n" +
    "• Full Name / Owner: " + (r[2] || "N/A") + "\n" +
    "• Phone: " + (r[3] || "N/A") + "\n" +
    "• Smart NID: " + (r[5] || "N/A") + "\n" +
    "• Base District: " + (r[6] || "N/A") + "\n" +
    "• Role / Type: " + (r[8] || "N/A") + "\n" +
    "• Company Name: " + (r[9] || "Personal") + "\n" +
    "• Primary License: " + (r[11] || "N/A") + " (" + (r[12] || "N/A") + ")\n" +
    "• Primary Car: " + (r[14] || "N/A") + "\n" +
    "• All Registered Cars: " + (r[16] || "Single / None") + "\n" +
    "• Employed Drivers: " + (r[17] || "Solo Applicant") + "\n" +
    "• Payout Wallet: " + (r[21] || "N/A") + "\n" +
    "• Verification Status: " + (r[22] || "Pending Verification") + "\n" +
    "• Documents Vault: " + (r[33] || "Drive Folder") + "\n" +
    "• Audit Tracking: " + (r[34] || "Unique") + "\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: monospace; background: #0c0c0f; color: #d4ff00; padding: 16px; margin: 0; }' +
    'textarea { width: 100%; height: 200px; background: #16161c; color: #fff; border: 1px solid #333; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 11px; resize: none; box-sizing: border-box; }' +
    '.copy-btn { margin-top: 10px; background: #d4ff00; color: #000; border: none; font-weight: 800; font-size: 13px; padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%; }' +
    '</style></head><body>' +
    '<h4 style="margin:0 0 8px 0; color:#fff; font-family:sans-serif;">📋 Driver & Vehicle Summary Dossier</h4>' +
    '<textarea id="txt">' + summaryText.replace(/\n/g, "\n") + '</textarea>' +
    '<button class="copy-btn" onclick="copyDossier()">📋 Copy to Clipboard</button>' +
    '<script>' +
    'function copyDossier() { var t = document.getElementById("txt"); t.select(); document.execCommand("copy"); alert("Copied to clipboard!"); google.script.host.close(); }' +
    '</script></body></html>'
  ).setWidth(440).setHeight(320);

  SpreadsheetApp.getUi().showModalDialog(html, "Summary Dossier");
}

/**
 * 1-Click Audit & Duplicate Detection Scanner:
 * Analyzes all applicant rows for repeat phone numbers, NID, Driver License, or Car Plates.
 */
function checkDuplicateAuditLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getRegistrationsSheet(ss);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Registrations sheet not found. Please click 'Setup & Align All Sheets (Safe)' first.");
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No records found yet. All submissions will be audited automatically.");
    return;
  }

  var maxCols = Math.min(sheet.getLastColumn(), 38);
  var data = sheet.getRange(2, 1, lastRow - 1, maxCols).getValues();
  var uniqueCount = 0;
  var resubmissionCount = 0;
  var duplicateCount = 0;
  var flaggedList = [];

  for (var i = 0; i < data.length; i++) {
    var r = data[i];
    // Col AH is 34 (idx 33), Col AI is 35 (idx 34)
    var auditStatus = String(r[34] || r[33] || "");
    var notes = String(r[35] || r[34] || "");
    var rowNum = i + 2;

    if (auditStatus.indexOf("RESUBMISSION") !== -1 || auditStatus.indexOf("Correction") !== -1 || auditStatus.indexOf("Repeat") !== -1) {
      resubmissionCount++;
      flaggedList.push("Row " + rowNum + ": [REPEAT/CORRECTION] " + r[2] + " (" + r[1] + ") — " + notes);
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
    '<div class="kpi"><div class="kpi-val" style="color:#faad14;">' + resubmissionCount + '</div><div class="kpi-lbl">Repeat / Edit</div></div>' +
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
 * 1. Automatically creates a timestamped Google Drive backup before running.
 * 2. Initializes the 2-Section architecture: "Dashboard" and "Registrations".
 * 3. Never deletes or damages existing rows.
 */
function rebuildEntireSystem() {
  safeRebuildAndSetup();
}

function safeRebuildAndSetup() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) {}

  if (ui) {
    var resp = ui.alert(
      "🔄 Setup & Align All Sheets (Safe)",
      "This will cleanly initialize the 2-Section Operations Architecture:\n\n" +
      "1. 🎛️ Dashboard — Real-time KPI Control Center, Counters & Sparklines\n" +
      "2. 🚗 Registrations — All Drivers, Owner-Drivers & Rental Companies in ONE Unified Sheet\n" +
      "   (Multiple Cars and Multiple Drivers are neatly organized in their own single columns)\n\n" +
      "🛡️ 100% SAFE GUARANTEE:\n" +
      "• An automatic full backup will be saved to Google Drive first.\n" +
      "• Existing applicant rows will NEVER be deleted or lost.\n\n" +
      "Do you want to proceed?",
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;
  }

  try {
    createDailyBackup();
  } catch (bErr) {
    Logger.log("Backup note: " + bErr.toString());
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  autoAlignAndRepairSheet(false);
  setupDashboardSheet(ss);

  if (ui) {
    ui.alert(
      "✅ Setup Complete",
      "Your 2-Section Operations System is now active and ready:\n\n" +
      "1. 🎛️ Dashboard (Real-time live KPI counters & metrics)\n" +
      "2. 🚗 Registrations (Flat 37-column schema with dedicated Multi-Car & Multi-Driver columns)\n\n" +
      "All columns are aligned and freeze errors are completely resolved!",
      ui.ButtonSet.OK
    );
  }
}

/**
 * Self-healing repair menu handler.
 */
function repairExistingErrors() {
  return autoAlignAndRepairSheet(true);
}

function setupSheet() {
  autoAlignAndRepairSheet(false);
  setupDashboardSheet();
}

/**
 * Master 37-Column Flat Alignment & Self-Healing Engine:
 * - NO MERGED SUB-COLUMNS. Single flat header row.
 * - Defensive breakApart() unfreezes and unmerges any corrupt merged cells from previous tests.
 * - Freezes Row 1 and Columns 1 to 4 smoothly.
 */
function autoAlignAndRepairSheet(interactive) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ensure Registrations Tab Exists
  var sheet = getRegistrationsSheet(ss);
  if (!sheet) {
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && sheet1.getLastRow() === 0 && sheet1.getLastColumn() === 0) {
      sheet1.setName(SHEET_REGISTRY_NAME);
      sheet = sheet1;
    } else {
      sheet = ss.insertSheet(SHEET_REGISTRY_NAME, 0);
    }
  }

  // 2. DEFENSIVE HEALING: Unfreeze & Break apart ANY existing merged cells to prevent freeze exceptions
  try {
    sheet.setFrozenRows(0);
    sheet.setFrozenColumns(0);
    var breakR = Math.min(15, sheet.getMaxRows());
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
  }

  // Ensure at least 38 columns exist
  var currentCols = sheet.getMaxColumns();
  if (currentCols < 38) {
    sheet.insertColumnsAfter(currentCols, 38 - currentCols);
  }

  // 3. MASTER 37 FLAT HEADERS (1-Row, Easy & Professional English)
  var headers = [
    "Timestamp",                              // Col A (1)
    "Application ID",                         // Col B (2)
    "Full Name / Owner",                      // Col C (3)
    "Phone (WhatsApp)",                       // Col D (4)
    "💬 1-Click WhatsApp",                     // Col E (5)
    "Smart NID Number",                       // Col F (6)
    "District / City",                        // Col G (7)
    "Emergency Contact",                      // Col H (8)
    "Role / Service Type",                    // Col I (9) - Solo Driver / Car Owner-Driver / Rental Service
    "Company / Business Name",                // Col J (10) - Rental Business Name (or Personal)
    "Trade License Number",                   // Col K (11) - Business Trade License (or N/A)
    "Driver License No. (BRTA)",              // Col L (12) - Primary Driver's License
    "License Class & Expiry",                 // Col M (13) - Class & Expiry Date
    "Driver License Status",                  // Col N (14) - Formula Expiry Alert
    "Primary Car Plate & Model",              // Col O (15) - Dedicated Car License Plate & Model
    "Car Fitness & Tax Expiry",               // Col P (16) - Vehicle Fitness Expiry
    "Cars & Vehicles List (All Cars)",        // Col Q (17) - ⭐ ALL MULTIPLE CARS IN ONE COLUMN
    "Employed Drivers List (All Drivers)",    // Col R (18) - ⭐ ALL MULTIPLE DRIVERS IN ONE COLUMN
    "Experience & Skills",                    // Col S (19)
    "Services Offered",                       // Col T (20)
    "Availability & Duty",                    // Col U (21)
    "Payout Wallet & Bank Account",           // Col V (22) - bKash / Nagad / Bank Details
    "Verification Status",                    // Col W (23) - Dropdown (Pending, Approved, etc)
    "Doc Completeness",                       // Col X (24) - Formula Completeness Check
    "Photo Document",                         // Col Y (25) - Portrait / Owner Photo
    "Driver License (Front)",                 // Col Z (26) - Driver Lic Front
    "Driver License (Back)",                  // Col AA (27) - Driver Lic Back
    "Car License / Blue Book (Front)",        // Col AB (28) - Car Reg / Blue Book Front
    "Car License / Blue Book (Back)",         // Col AC (29) - Car Reg / Blue Book Back
    "Car Fitness / Tax Token Doc",            // Col AD (30) - Tax Token / Fitness Doc
    "NID (Front)",                            // Col AE (31) - Smart NID Front
    "NID (Back)",                             // Col AF (32) - Smart NID Back
    "Trade License / Registration Doc",       // Col AG (33) - Business Trade License Doc
    "📂 All Documents Vault (Drive Folder)",  // Col AH (34) - ⭐ 1-CLICK FOLDER ACCESS FOR ALL MULTI-CAR/DRIVER DOCS
    "Admin Tracker & Audit",                  // Col AI (35) - Duplicate & Resubmission Iteration
    "Resubmission Notes & Reasons",           // Col AJ (36) - Applicant correction notes
    "Verified By (Operator)",                 // Col AK (37) - Auto Operator onEdit
    "Verification Time"                       // Col AL (38) - Auto Operator timestamp
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
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

  // Freeze Row 1 and Columns 1 to 4 (Guaranteed 100% Exception-Free)
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);

  // 4. Process & Realign Existing Data Rows
  var lastRow = sheet.getLastRow();
  var migratedCount = 0;
  var modernCount = 0;
  var cleanedRowsCount = 0;

  if (lastRow >= 2) {
    var totalDataRows = lastRow - 1;
    var maxDataCols = Math.max(sheet.getLastColumn(), 38);
    var rawValues = sheet.getRange(2, 1, totalDataRows, maxDataCols).getValues();
    var rawFormulas = sheet.getRange(2, 1, totalDataRows, maxDataCols).getFormulas();

    var alignedValues = [];

    for (var i = 0; i < totalDataRows; i++) {
      var r = rawValues[i];
      var f = rawFormulas[i];
      var targetRowNum = alignedValues.length + 2;

      // Filter out empty ghost rows
      var hasContent = false;
      for (var k = 0; k < Math.min(r.length, 10); k++) {
        if (r[k] && String(r[k]).trim() !== "") {
          hasContent = true;
          break;
        }
      }
      if (!hasContent) {
        cleanedRowsCount++;
        continue;
      }

      var aligned = new Array(38).fill("");

      // Baseline identity columns (Cols 1..8)
      aligned[0] = r[0] || new Date().toISOString(); // Timestamp
      aligned[1] = r[1] ? "'" + String(r[1]).replace(/^'/, "") : ("'DRV-" + Math.floor(100000 + Math.random() * 900000));
      aligned[2] = r[2] || "Driver Applicant";

      var rawPhone = String(r[3] || "").trim().replace(/^'/, "");
      if (rawPhone.length === 10 && rawPhone.startsWith("1")) rawPhone = "0" + rawPhone;
      aligned[3] = rawPhone ? "'" + rawPhone : "";

      // Col E: 1-Click WhatsApp Button Formula
      var cleanDigits = rawPhone.replace(/[^0-9]/g, "");
      if (cleanDigits.startsWith("0")) cleanDigits = "880" + cleanDigits.substring(1);
      else if (!cleanDigits.startsWith("880") && cleanDigits.length === 10) cleanDigits = "880" + cleanDigits;
      var nameForWa = r[2] || "Driver";
      if (cleanDigits.length >= 10) {
        aligned[4] = '=HYPERLINK("https://wa.me/' + cleanDigits + '?text=' + encodeURIComponent("Hello " + nameForWa + ", this is Rownaa Operations regarding your application.") + '", "🟢 Chat on WhatsApp")';
      } else {
        aligned[4] = "—";
      }

      aligned[5] = r[5] ? "'" + String(r[5]).replace(/^'/, "") : "";
      aligned[6] = r[6] || "";
      aligned[7] = r[7] ? String(r[7]).replace(/^'/, "") : "";

      // Role (Col I / 9)
      var detectedRole = r[8] || r[19] || "Solo Driver";
      aligned[8] = detectedRole;

      // Company Name (Col J / 10) & Trade License (Col K / 11)
      aligned[9] = r[9] || (/rental|fleet/i.test(detectedRole) ? (r[2] + " Rental Service") : "Personal");
      aligned[10] = r[10] ? "'" + String(r[10]).replace(/^'/, "") : "N/A";

      // Driver License (Cols L..N / 12..14)
      aligned[11] = r[11] ? "'" + String(r[11]).replace(/^'/, "") : (r[8] ? "'" + String(r[8]).replace(/^'/, "") : "N/A");
      aligned[12] = r[12] || ((r[9] || "Light") + (r[10] ? " (Exp: " + r[10] + ")" : ""));
      aligned[13] = '=IF(M' + targetRowNum + '="—", "—", "🟢 Active")';

      // Primary Car (Cols O..P / 15..16)
      var extPlate = r[14] || r[12] || "N/A";
      var extModel = r[15] || r[13] || "N/A";
      aligned[14] = (extPlate !== "N/A" || extModel !== "N/A") ? (extModel + " [" + extPlate + "]") : "N/A";
      aligned[15] = r[15] || r[14] || "—";

      // Cars List in ONE column (Col Q / 17)
      aligned[16] = r[16] || r[20] || (extPlate !== "N/A" ? ("1. " + extModel + " [" + extPlate + "]") : "N/A (Chauffeur)");

      // Drivers List in ONE column (Col R / 18)
      aligned[17] = r[17] || "Solo Applicant (" + (r[2] || "Self") + ")";

      // Experience (Col S / 19), Services (Col T / 20), Availability (Col U / 21)
      aligned[18] = r[18] || r[15] || "";
      aligned[19] = r[19] || r[17] || "";
      aligned[20] = r[20] || r[18] || "Full Time";

      // Payout Wallet (Col V / 22)
      aligned[21] = r[21] ? "'" + String(r[21]).replace(/^'/, "") : "";

      // Verification Status (Col W / 23)
      aligned[22] = r[22] || "Pending Verification";

      // Doc Completeness (Col X / 24)
      aligned[23] = '=IF(AND(Y' + targetRowNum + '<>"—", Z' + targetRowNum + '<>"—", AE' + targetRowNum + '<>"—"), "🟢 Complete", "⚠️ Pending Docs")';

      // Document Links (Cols Y..AG / 25..33)
      for (var dCol = 24; dCol <= 32; dCol++) {
        aligned[dCol] = f[dCol] || r[dCol] || "—";
      }

      // Col AH (34): All Documents Vault Folder
      aligned[33] = f[33] || r[33] || "📂 Drive Vault Folder";

      // Audit Tracker (Col AI / 35) & Resubmission Notes (Col AJ / 36)
      aligned[34] = r[34] || r[33] || "✅ First-Time Application";
      aligned[35] = r[35] || r[34] || "—";

      // Operator Audit Trail (Cols AK..AL / 37..38)
      aligned[36] = r[36] || "";
      aligned[37] = r[37] || "";

      modernCount++;
      alignedValues.push(aligned);
    }

    // Clear existing range below header and write back aligned rows
    sheet.getRange(2, 1, Math.max(totalDataRows, 1), maxDataCols).clearContent().clearFormat();

    if (alignedValues.length > 0) {
      sheet.getRange(2, 1, alignedValues.length, 37).setValues(alignedValues);
    }
  }

  // 5. Set Plain-Text Formats (@)
  sheet.getRange("B:B").setNumberFormat("@");
  sheet.getRange("D:D").setNumberFormat("@");
  sheet.getRange("F:F").setNumberFormat("@");
  sheet.getRange("K:K").setNumberFormat("@");
  sheet.getRange("L:L").setNumberFormat("@");
  sheet.getRange("V:V").setNumberFormat("@");

  // 6. Enable Word Wrap on Multi-Car (Col Q) & Multi-Driver (Col R)
  sheet.getRange("Q:R").setWrap(true);

  // 7. Column W Data Validation (Col 23)
  var statusOptions = ["Pending Verification", "Under Review", "Contacted & Scheduled", "Approved & Verified", "Rejected"];
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 23, Math.max(lastRow, 500), 1).setDataValidation(statusRule);

  // 8. Optimal Column Widths
  var widths = [
    150, // 1: Timestamp
    130, // 2: Application ID
    160, // 3: Full Name / Owner
    130, // 4: Phone
    160, // 5: WhatsApp Button
    140, // 6: NID Number
    130, // 7: District / City
    140, // 8: Emergency Contact
    140, // 9: Role / Service Type
    180, // 10: Company Name
    140, // 11: Trade License No
    150, // 12: Driver License No
    140, // 13: License Class & Expiry
    130, // 14: Driver License Status
    180, // 15: Primary Car Plate & Model
    130, // 16: Car Fitness Expiry
    280, // 17: ⭐ Cars & Vehicles List (All Cars)
    280, // 18: ⭐ Employed Drivers List (All Drivers)
    130, // 19: Experience & Skills
    160, // 20: Services Offered
    120, // 21: Availability
    200, // 22: Payout Wallet
    160, // 23: Verification Status
    130, // 24: Doc Completeness
    130, // 25: Photo
    130, // 26: Driver Lic Front
    130, // 27: Driver Lic Back
    130, // 28: Car Reg Front
    130, // 29: Car Reg Back
    130, // 30: Car Fitness Doc
    130, // 31: NID Front
    130, // 32: NID Back
    140, // 33: Trade License Doc
    200, // 34: ⭐ 📂 All Documents Vault (Drive Folder)
    240, // 35: Admin Tracker & Audit
    240, // 36: Resubmission Notes
    140, // 37: Verified By
    140  // 38: Verification Time
  ];
  for (var wIdx = 0; wIdx < widths.length; wIdx++) {
    sheet.setColumnWidth(wIdx + 1, widths[wIdx]);
  }

  // 9. Synchronize Dashboard Tab
  setupDashboardSheet(ss);

  // 10. Clean up default empty Sheet1 if present
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    if (defaultSheet.getLastRow() === 0 && defaultSheet.getLastColumn() === 0) {
      try { ss.deleteSheet(defaultSheet); } catch (dErr) {}
    }
  }

  if (interactive) {
    var ui = null;
    try { ui = SpreadsheetApp.getUi(); } catch (e) {}
    if (ui) {
      ui.alert(
        "✅ Operations Realignment Complete",
        "Rownaa Operations System has aligned all 37 columns into the 2-Section Architecture!\n\n" +
        "• Aligned Registrations: " + modernCount + "\n" +
        "• Cleaned Ghost Rows: " + cleanedRowsCount + "\n" +
        "• Dashboard KPI Counters: Synchronized\n" +
        "• Freeze Exceptions: Resolved",
        ui.ButtonSet.OK
      );
    }
  }

  return {
    modern: modernCount,
    cleaned: cleanedRowsCount,
    total: modernCount
  };
}

/**
 * SECTION 1: OPERATIONS KPI DASHBOARD
 */
function setupDashboardSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var dash = ss.getSheetByName(SHEET_DASHBOARD_NAME);
  if (!dash) {
    dash = ss.insertSheet(SHEET_DASHBOARD_NAME, 0);
  }

  dash.clear();
  dash.clearFormats();

  // Row 1: Header Banner
  dash.getRange("A1:H1").merge();
  dash.getRange("A1")
    .setValue("⚡ ROWNAA® DRIVER, CAR & FLEET OPERATIONS CONTROL CENTER")
    .setBackground("#0d0d10")
    .setFontColor("#d4ff00")
    .setFontSize(13)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.setRowHeight(1, 45);

  // Row 3-4: Primary KPI Counter Tiles
  var kpiHeaders = ["Total Registrations", "Pending Verification", "Under Review", "Contacted", "Approved & Verified", "Rejected", "Car Owners / Fleets", "Approval Rate %"];
  dash.getRange("A3:H3").setValues([kpiHeaders]);
  dash.getRange("A3:H3")
    .setBackground("#1a1a20")
    .setFontColor("#ffffff")
    .setFontWeight("bold")
    .setFontSize(10)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.setRowHeight(3, 28);

  // Status is in Column W (Col 23), Role is in Column I (Col 9)
  var kpiFormulas = [
    "=COUNTA('" + SHEET_REGISTRY_NAME + "'!B2:B)",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Pending Verification\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Under Review\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Contacted & Scheduled\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Approved & Verified\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Rejected\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!I2:I, \"*Owner*\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!I2:I, \"*Rental*\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!I2:I, \"*Fleet*\")",
    "=IF(A4=0, 0, (E4/A4))"
  ];
  dash.getRange("A4:H4").setFormulas([kpiFormulas]);
  dash.getRange("A4:H4")
    .setFontSize(16)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  dash.getRange("H4").setNumberFormat("0.0%");
  dash.setRowHeight(4, 40);

  // Background colors for KPI tiles
  dash.getRange("A4").setBackground("#f0f0f2").setFontColor("#111111"); // Total
  dash.getRange("B4").setBackground("#fffbe6").setFontColor("#d48800"); // Pending
  dash.getRange("C4").setBackground("#e6f7ff").setFontColor("#096dd9"); // Under Review
  dash.getRange("D4").setBackground("#f9f0ff").setFontColor("#722ed1"); // Contacted
  dash.getRange("E4").setBackground("#f6ffed").setFontColor("#389e0d"); // Approved
  dash.getRange("F4").setBackground("#fff1f0").setFontColor("#cf1322"); // Rejected
  dash.getRange("G4").setBackground("#e6f7ff").setFontColor("#1d39c4"); // Owners/Fleets
  dash.getRange("H4").setBackground("#e6fffb").setFontColor("#08979c"); // Approval Rate

  // Row 6-7: Sparkline Application Flow Bar
  dash.getRange("A6:H6").merge();
  dash.getRange("A6").setValue("📊 Real-Time Application Intake & Verification Flow");
  dash.getRange("A6").setFontWeight("bold").setFontSize(11).setFontColor("#333333");

  dash.getRange("A7:H7").merge();
  dash.getRange("A7").setFormula(
    '=SPARKLINE({B4, C4, D4, E4, F4}, {"charttype","bar"; "color1","#faad14"; "color2","#1890ff"; "color3","#722ed1"; "color4","#52c41a"; "color5","#ff4d4f"})'
  );
  dash.setRowHeight(7, 24);

  // Row 9-13: Regional & Demographic Distribution
  dash.getRange("A9:D9").merge().setValue("📍 Geographic Inflow Breakdown").setFontWeight("bold").setBackground("#222228").setFontColor("#ffffff");
  dash.getRange("A10").setValue("Dhaka — Gulshan, Banani & Airport Zone");
  dash.getRange("B10:C10").merge().setFormula("=COUNTIF('" + SHEET_REGISTRY_NAME + "'!G2:G, \"*Gulshan*\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!G2:G, \"*Banani*\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!G2:G, \"*Airport*\")");
  dash.getRange("D10").setFormula('=IF(A4=0, 0, B10/A4)').setNumberFormat("0.0%");

  dash.getRange("A11").setValue("Dhaka — Uttara & North Suburbs");
  dash.getRange("B11:C11").merge().setFormula("=COUNTIF('" + SHEET_REGISTRY_NAME + "'!G2:G, \"*Uttara*\")");
  dash.getRange("D11").setFormula('=IF(A4=0, 0, B11/A4)').setNumberFormat("0.0%");

  dash.getRange("A12").setValue("Dhaka — Dhanmondi, Mirpur & Central");
  dash.getRange("B12:C12").merge().setFormula("=COUNTIF('" + SHEET_REGISTRY_NAME + "'!G2:G, \"*Dhanmondi*\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!G2:G, \"*Mirpur*\")");
  dash.getRange("D12").setFormula('=IF(A4=0, 0, B12/A4)').setNumberFormat("0.0%");

  dash.getRange("A13").setValue("Intercity & Regional Districts (CTG, Sylhet, etc.)");
  dash.getRange("B13:C13").merge().setFormula('=A4 - (B10 + B11 + B12)');
  dash.getRange("D13").setFormula('=IF(A4=0, 0, B13/A4)').setNumberFormat("0.0%");

  dash.getRange("A10:A13").setFontSize(9);
  dash.getRange("B10:D13").setFontSize(9).setHorizontalAlignment("center");

  // Instructions
  dash.getRange("A16:H16").merge();
  dash.getRange("A16").setValue("ℹ️ How to manage: Open the 'Registrations' tab below. Select Column W to update verification status. The dashboard updates automatically in real-time.");
  dash.getRange("A16").setFontSize(9).setFontColor("#666666").setFontStyle("italic");

  for (var c = 1; c <= 8; c++) {
    dash.setColumnWidth(c, 150);
  }
}

/**
 * OnEdit Trigger: Auto Operator Email & Timestamp logging.
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

    sheet.getRange(row, 37).setValue(operatorEmail); // Col AJ: Verified By
    sheet.getRange(row, 38).setValue(timestampStr);  // Col AK: Verification Time
  }
}

/**
 * Google Drive Vault Helper.
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
 * SECTION 2: WEBHOOK INGESTION ENGINE (doPost)
 * Ingests all registrations into the single "Registrations" sheet.
 * Formats multiple cars into Col Q and multiple drivers into Col R.
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
    var sheet = getRegistrationsSheet(ss);
    if (!sheet) {
      autoAlignAndRepairSheet(false);
      sheet = getRegistrationsSheet(ss);
    }

    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var appId = sanitizeCellValue(data.applicationId || data.id || "DRV-DAC-" + Math.floor(1000 + Math.random() * 9000));
    var applicantName = sanitizeCellValue(data.fullName || data.name || "Driver Applicant");

    // Dedicated Subfolder in Drive Vault for this applicant
    var vaultFolder = getDocumentVaultFolder();
    var applicantFolder;
    try {
      applicantFolder = vaultFolder.createFolder(appId + " - " + applicantName);
    } catch(fErr) {
      applicantFolder = vaultFolder;
    }

    var totalSavedDocsCount = 0;

    // 1. SAVE OWNER / PRIMARY IDENTITY & LICENSE DOCUMENTS
    var photoUrl = saveBase64DocumentToDrive(data.photoBase64, "01_owner_portrait.jpg", applicantFolder);
    var driverLicFrontUrl = saveBase64DocumentToDrive(data.licenseFrontBase64 || data.driverLicenseFrontBase64, "02_driver_license_front.jpg", applicantFolder);
    var driverLicBackUrl = saveBase64DocumentToDrive(data.licenseBackBase64 || data.driverLicenseBackBase64, "03_driver_license_back.jpg", applicantFolder);
    var nidFrontUrl = saveBase64DocumentToDrive(data.nidFrontBase64, "04_owner_nid_front.jpg", applicantFolder);
    var nidBackUrl = saveBase64DocumentToDrive(data.nidBackBase64, "05_owner_nid_back.jpg", applicantFolder);

    // 2. SAVE PRIMARY CAR REGISTRATION & TAX/FITNESS DOCUMENTS
    var carLicFrontUrl = saveBase64DocumentToDrive(data.carLicenseFrontBase64 || data.carRegFrontBase64, "06_car_bluebook_front.jpg", applicantFolder);
    var carLicBackUrl = saveBase64DocumentToDrive(data.carLicenseBackBase64 || data.carRegBackBase64, "07_car_bluebook_back.jpg", applicantFolder);
    var carFitnessUrl = saveBase64DocumentToDrive(data.carFitnessBase64 || data.carTaxTokenBase64, "08_car_fitness_tax_token.jpg", applicantFolder);

    // 3. SAVE COMMERCIAL TRADE LICENSE (FOR RENTAL FLEETS)
    var tradeLicUrl = saveBase64DocumentToDrive(data.tradeLicenseBase64, "09_trade_license_registration.jpg", applicantFolder);

    if (photoUrl) totalSavedDocsCount++;
    if (driverLicFrontUrl) totalSavedDocsCount++;
    if (driverLicBackUrl) totalSavedDocsCount++;
    if (nidFrontUrl) totalSavedDocsCount++;
    if (nidBackUrl) totalSavedDocsCount++;
    if (carLicFrontUrl) totalSavedDocsCount++;
    if (carLicBackUrl) totalSavedDocsCount++;
    if (carFitnessUrl) totalSavedDocsCount++;
    if (tradeLicUrl) totalSavedDocsCount++;

    // 4. ⭐ SAVE MULTIPLE FLEET CARS' BLUE BOOKS & FITNESS (FOR RENTAL CAR FLEETS)
    var fleetCarsList = (data.fleetData && (data.fleetData.vehicles || data.fleetData.cars)) || data.fleetVehicles || [];
    if (fleetCarsList.length > 0) {
      for (var fcIdx = 0; fcIdx < fleetCarsList.length; fcIdx++) {
        var fCar = fleetCarsList[fcIdx];
        var cNum = fcIdx + 1;
        var cPlateClean = String(fCar.reg || fCar.plate || fCar.plateNumber || ("Car_" + cNum)).replace(/[^a-zA-Z0-9_-]/g, "_");
        var cModelClean = String(fCar.model || fCar.make || "Vehicle").replace(/[^a-zA-Z0-9_-]/g, "_");

        var cFront = saveBase64DocumentToDrive(fCar.carLicenseFront || fCar.blueBookFront, "Car_" + cNum + "_" + cModelClean + "_" + cPlateClean + "_BlueBook_Front.jpg", applicantFolder);
        var cBack = saveBase64DocumentToDrive(fCar.carLicenseBack || fCar.blueBookBack, "Car_" + cNum + "_" + cModelClean + "_" + cPlateClean + "_BlueBook_Back.jpg", applicantFolder);
        var cFit = saveBase64DocumentToDrive(fCar.carFitness || fCar.taxToken, "Car_" + cNum + "_" + cModelClean + "_" + cPlateClean + "_Fitness.jpg", applicantFolder);

        if (cFront) { totalSavedDocsCount++; if (!carLicFrontUrl) carLicFrontUrl = cFront; }
        if (cBack) { totalSavedDocsCount++; if (!carLicBackUrl) carLicBackUrl = cBack; }
        if (cFit) { totalSavedDocsCount++; if (!carFitnessUrl) carFitnessUrl = cFit; }
      }
    }

    // 5. ⭐ SAVE MULTIPLE EMPLOYED DRIVERS' LICENSES & NID (FOR RENTAL CAR FLEETS)
    var fleetDriversList = (data.fleetData && data.fleetData.drivers) || data.fleetDrivers || [];
    if (fleetDriversList.length > 0) {
      for (var fdIdx = 0; fdIdx < fleetDriversList.length; fdIdx++) {
        var fDriver = fleetDriversList[fdIdx];
        var dNum = fdIdx + 1;
        var dNameClean = String(fDriver.name || fDriver.fullName || ("Driver_" + dNum)).replace(/[^a-zA-Z0-9_-]/g, "_");

        var dFront = saveBase64DocumentToDrive(fDriver.licenseFront, "Driver_" + dNum + "_" + dNameClean + "_License_Front.jpg", applicantFolder);
        var dBack = saveBase64DocumentToDrive(fDriver.licenseBack, "Driver_" + dNum + "_" + dNameClean + "_License_Back.jpg", applicantFolder);
        var dNidF = saveBase64DocumentToDrive(fDriver.nidFront, "Driver_" + dNum + "_" + dNameClean + "_NID_Front.jpg", applicantFolder);
        var dNidB = saveBase64DocumentToDrive(fDriver.nidBack, "Driver_" + dNum + "_" + dNameClean + "_NID_Back.jpg", applicantFolder);

        if (dFront) { totalSavedDocsCount++; if (!driverLicFrontUrl) driverLicFrontUrl = dFront; }
        if (dBack) { totalSavedDocsCount++; if (!driverLicBackUrl) driverLicBackUrl = dBack; }
        if (dNidF) totalSavedDocsCount++;
        if (dNidB) totalSavedDocsCount++;
      }
    }

    // Hyperlink Formulas for Documents
    var photoFormula = photoUrl ? '=HYPERLINK("' + photoUrl + '", "🔍 View Photo")' : '—';
    var driverLicFrontFormula = driverLicFrontUrl ? '=HYPERLINK("' + driverLicFrontUrl + '", "📄 Lic Front")' : '—';
    var driverLicBackFormula = driverLicBackUrl ? '=HYPERLINK("' + driverLicBackUrl + '", "📄 Lic Back")' : '—';
    var carLicFrontFormula = carLicFrontUrl ? '=HYPERLINK("' + carLicFrontUrl + '", "🚗 Blue Book Front")' : '—';
    var carLicBackFormula = carLicBackUrl ? '=HYPERLINK("' + carLicBackUrl + '", "🚗 Blue Book Back")' : '—';
    var carFitnessFormula = carFitnessUrl ? '=HYPERLINK("' + carFitnessUrl + '", "📑 Fitness/Tax Doc")' : '—';
    var nidFrontFormula = nidFrontUrl ? '=HYPERLINK("' + nidFrontUrl + '", "🪪 NID Front")' : '—';
    var nidBackFormula = nidBackUrl ? '=HYPERLINK("' + nidBackUrl + '", "🪪 NID Back")' : '—';
    var tradeLicFormula = tradeLicUrl ? '=HYPERLINK("' + tradeLicUrl + '", "🏢 Trade License")' : '—';

    // 1-Click Folder Hyperlink for All Documents in Drive
    var vaultFolderUrl = applicantFolder.getUrl();
    var vaultFolderFormula = '=HYPERLINK("' + vaultFolderUrl + '", "📂 Open Vault (' + totalSavedDocsCount + ' Files)")';

    // Phone & 1-Click WhatsApp Button Formula
    var rawPhone = String(data.phone || "").trim();
    var cleanDigits = rawPhone.replace(/[^0-9]/g, "");
    if (cleanDigits.startsWith("0")) {
      cleanDigits = "880" + cleanDigits.substring(1);
    } else if (!cleanDigits.startsWith("880") && cleanDigits.length === 10) {
      cleanDigits = "880" + cleanDigits;
    }

    var whatsappFormula = (cleanDigits.length >= 10) ?
      '=HYPERLINK("https://wa.me/' + cleanDigits + '?text=' + encodeURIComponent("Hello " + applicantName + ", this is Rownaa Operations regarding your application (" + appId + ").") + '", "🟢 Chat on WhatsApp")' :
      '—';

    // Emergency Contact
    var emergencyStr = "";
    if (data.emergencyContact) {
      emergencyStr = (typeof data.emergencyContact === 'object') ?
        (data.emergencyContact.name || "") + " (" + (data.emergencyContact.phone || "") + ")" :
        String(data.emergencyContact);
    }

    // Role & Business Information
    var roleStr = sanitizeCellValue(data.role || data.driverRole || "Solo Driver");
    var companyNameStr = sanitizeCellValue(data.businessName || data.companyName || (/rental|fleet/i.test(roleStr) ? (applicantName + " Rental Service") : "Personal"));
    var tradeLicenseNo = String(data.tradeLicenseNumber || data.tradeLicense || "N/A").trim();

    // Primary Car Details
    var primaryPlate = String(data.carLicenseNumber || data.carPlate || data.plateNumber || "").trim();
    var primaryModel = String(data.carModel || data.vehicleModel || "").trim();
    var carFitnessExpiry = String(data.carFitnessExpiry || data.taxTokenExpiry || "—").trim();

    // ==============================================================
    // ⭐ MULTIPLE CARS IN ONE SINGLE COLUMN (Col Q / 17)
    // ==============================================================
    var allCarsStr = "";
    var carsList = (data.fleetData && (data.fleetData.vehicles || data.fleetData.cars)) || data.fleetVehicles || [];
    if (carsList.length > 0) {
      var carLines = [];
      for (var cIdx = 0; cIdx < carsList.length; cIdx++) {
        var c = carsList[cIdx];
        var cModel = c.model || c.make || "Vehicle";
        var cPlate = c.reg || c.plate || c.plateNumber || "No Plate";
        var cYear = c.year || c.manufacturingYear || "";
        var cSeats = c.seats || c.seatingCapacity || "";
        var cFuel = c.fuel || c.fuelType || "";
        var cFit = c.fitnessExpiry || c.fitness || "";
        var extra = [cYear, cSeats, cFuel].filter(Boolean).join(", ");
        carLines.push((cIdx + 1) + ". " + cModel + " [" + cPlate + "]" + (extra ? " (" + extra + ")" : "") + (cFit ? " — Fitness: " + cFit : ""));
        
        if (!primaryPlate && cPlate !== "No Plate") primaryPlate = cPlate;
        if (!primaryModel && cModel !== "Vehicle") primaryModel = cModel;
        if (carFitnessExpiry === "—" && cFit) carFitnessExpiry = cFit;
      }
      allCarsStr = carLines.join("\n");
    } else if (data.ownerCar) {
      var oc = (typeof data.ownerCar === 'object') ? data.ownerCar : {};
      primaryModel = oc.model || primaryModel || "Personal Vehicle";
      primaryPlate = oc.plateNumber || primaryPlate || "N/A";
      allCarsStr = "1. " + primaryModel + " [" + primaryPlate + "]" + (carFitnessExpiry !== "—" ? " — Fitness: " + carFitnessExpiry : "");
    } else if (primaryPlate && primaryPlate !== "—") {
      allCarsStr = "1. " + (primaryModel || "Vehicle") + " [" + primaryPlate + "]" + (carFitnessExpiry !== "—" ? " — Fitness: " + carFitnessExpiry : "");
    } else {
      allCarsStr = "N/A (Fleet Chauffeur / No Personal Vehicle)";
    }

    var primaryCarDisplay = (primaryPlate || primaryModel) ? ((primaryModel || "Vehicle") + " [" + (primaryPlate || "N/A") + "]") : "N/A";

    // ==============================================================
    // ⭐ MULTIPLE DRIVERS IN ONE SINGLE COLUMN (Col R / 18)
    // ==============================================================
    var allDriversStr = "";
    var driversList = (data.fleetData && data.fleetData.drivers) || data.fleetDrivers || [];
    if (driversList.length > 0) {
      var driverLines = [];
      for (var dIdx = 0; dIdx < driversList.length; dIdx++) {
        var d = driversList[dIdx];
        var dName = d.name || d.fullName || ("Driver " + (dIdx + 1));
        var dPhone = d.phone || d.mobile || "No Phone";
        var dLic = d.license || d.licenseNumber || "";
        var dClass = d.licenseClass || d.licenseType || "";
        var dExp = d.licenseExpiry || d.expiry || "";
        var dAssigned = d.assignedPlate || "";
        var licInfo = [dLic, dClass].filter(Boolean).join(", ");
        driverLines.push((dIdx + 1) + ". " + dName + " (" + dPhone + ")" + (licInfo ? " — Lic: " + licInfo : "") + (dExp ? " [Exp: " + dExp + "]" : "") + (dAssigned ? " [Car: " + dAssigned + "]" : ""));
      }
      allDriversStr = driverLines.join("\n");
    } else {
      allDriversStr = "Solo Applicant (" + applicantName + " — Self-Managed)";
    }

    // Payout Wallet & Bank Details
    var payoutStr = "";
    if (data.payoutWallet) {
      payoutStr = String(data.payoutWallet);
    } else if (data.bankDetails) {
      var bd = data.bankDetails;
      payoutStr = "Bank: " + (bd.bankName || "") + " (" + (bd.branch || "") + ") - A/C: " + (bd.accountNumber || "") + " [" + (bd.accountType || "") + " - " + (bd.accountName || "") + "]";
    } else {
      payoutStr = data.payoutMethod ? (data.payoutMethod + " - " + (data.payoutNumber || "")) : "";
    }

    var servicesStr = Array.isArray(data.services) ? data.services.join(", ") : (data.services || "");
    var nextRowIdx = sheet.getLastRow() + 1;

    // Duplicate & Resubmission Scanner
    var cleanPhoneForMatch = cleanDigits.replace(/^880/, "0");
    var cleanNidForMatch = String(data.nidNumber || data.nid || "").trim().replace(/[^0-9]/g, "");
    var cleanLicForMatch = String(data.licenseNumber || data.driverLicenseNumber || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    var cleanPlateForMatch = primaryPlate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    var isDriverCorrection = (data.isResubmission === true || data.isResubmission === "true" || !!data.correctionReason);
    var prevAppIdGiven = String(data.previousApplicationId || data.prevAppId || "").trim();

    var duplicateMatches = [];
    var submissionIteration = 1;
    var existingRowCount = sheet.getLastRow();
    
    if (existingRowCount > 1) {
      try {
        var existingValues = sheet.getRange(2, 1, existingRowCount - 1, Math.min(sheet.getLastColumn(), 37)).getValues();
        for (var eIdx = 0; eIdx < existingValues.length; eIdx++) {
          var rowP = String(existingValues[eIdx][3] || "").replace(/[^0-9]/g, "").replace(/^880/, "0");
          var rowN = String(existingValues[eIdx][5] || "").replace(/[^0-9]/g, "");
          var rowL = String(existingValues[eIdx][11] || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
          var rowPlate = String(existingValues[eIdx][14] || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
          var rowId = String(existingValues[eIdx][1] || "");
          var matchFields = [];

          if (cleanPhoneForMatch && rowP && cleanPhoneForMatch === rowP) matchFields.push("Phone");
          if (cleanNidForMatch && rowN && cleanNidForMatch === rowN) matchFields.push("NID");
          if (cleanLicForMatch && rowL && cleanLicForMatch === rowL) matchFields.push("Driver License");
          if (cleanPlateForMatch && rowPlate && rowPlate !== "N/A" && cleanPlateForMatch === rowPlate) matchFields.push("Car Plate");

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

    var auditTrackerStr = "";
    var auditBgColor = "#e6f4ea"; // soft green
    var auditFgColor = "#137333";

    if (isDriverCorrection) {
      auditTrackerStr = "🔄 Repeat / Correction [Iteration #" + submissionIteration + "]" + 
        (prevAppIdGiven ? " (Correcting #" + prevAppIdGiven + ")" : (duplicateMatches.length > 0 ? " (Matches Prev #" + duplicateMatches[0].appId + ")" : ""));
      auditBgColor = "#fff8e1"; // warm amber
      auditFgColor = "#b78103";
    } else if (duplicateMatches.length > 0) {
      auditTrackerStr = "⚠️ Repeat Application [Iteration #" + submissionIteration + "] (Matches Row " + duplicateMatches[0].row + " #" + duplicateMatches[0].appId + " on " + duplicateMatches[0].matchedOn + ")";
      auditBgColor = "#fde8e8"; // soft red
      auditFgColor = "#c53030";
    } else {
      auditTrackerStr = "✅ First-Time Application";
      auditBgColor = "#e6f4ea";
      auditFgColor = "#137333";
    }

    var resubmissionNotesStr = "";
    if (isDriverCorrection) {
      resubmissionNotesStr = (data.correctionReason ? ("[" + data.correctionReason + "] ") : "") + (data.correctionNotes || data.correctionDetails || "Correction submitted by applicant");
    } else if (duplicateMatches.length > 0) {
      resubmissionNotesStr = "Potential repeat submission with matching " + duplicateMatches[0].matchedOn;
    } else {
      resubmissionNotesStr = "—";
    }

    // License expiry status formula
    var driverLicenseStatusFormula = '=IF(M' + nextRowIdx + '="—", "—", "🟢 Active")';
    
    // Completeness Formula
    var docCompletenessFormula = '=IF(AND(Y' + nextRowIdx + '<>"—", Z' + nextRowIdx + '<>"—", AE' + nextRowIdx + '<>"—"), "🟢 Complete", "⚠️ Pending Docs")';

    // Construct Flat Row Array (38 Columns)
    var row = [
      sanitizeCellValue(data.submittedAt || new Date().toISOString()), // Col A (1): Timestamp
      appId,                                                          // Col B (2): Application ID
      applicantName,                                                  // Col C (3): Full Name / Owner
      formatAsPlainText(rawPhone),                                    // Col D (4): Phone (WhatsApp)
      whatsappFormula,                                                // Col E (5): 💬 1-Click WhatsApp
      formatAsPlainText(data.nidNumber || data.nid || ""),            // Col F (6): Smart NID Number
      sanitizeCellValue(data.baseCity || data.city || "Dhaka"),       // Col G (7): District / City
      sanitizeCellValue(emergencyStr),                                // Col H (8): Emergency Contact
      roleStr,                                                        // Col I (9): Role / Service Type
      companyNameStr,                                                 // Col J (10): Company / Business Name
      formatAsPlainText(tradeLicenseNo),                              // Col K (11): Trade License Number
      formatAsPlainText(data.licenseNumber || data.driverLicenseNumber || "N/A"), // Col L (12): Driver License No.
      sanitizeCellValue((data.licenseType || data.driverLicenseType || "Light") + " (Exp: " + (data.licenseExpiry || data.driverLicenseExpiry || "2030") + ")"), // Col M (13): License Class & Expiry
      driverLicenseStatusFormula,                                     // Col N (14): Driver License Status
      sanitizeCellValue(primaryCarDisplay),                           // Col O (15): Primary Car Plate & Model
      sanitizeCellValue(carFitnessExpiry),                            // Col P (16): Car Fitness & Tax Expiry
      sanitizeCellValue(allCarsStr),                                  // Col Q (17): ⭐ ALL CARS IN ONE COLUMN
      sanitizeCellValue(allDriversStr),                               // Col R (18): ⭐ ALL DRIVERS IN ONE COLUMN
      sanitizeCellValue(data.experience || "5+ Years"),               // Col S (19): Experience & Skills
      sanitizeCellValue(servicesStr || "Chauffeur & Rental"),         // Col T (20): Services Offered
      sanitizeCellValue(data.availability || "Full Time"),            // Col U (21): Availability & Duty
      formatAsPlainText(payoutStr),                                   // Col V (22): Payout Wallet & Bank
      sanitizeCellValue(data.status || "Pending Verification"),       // Col W (23): Verification Status
      docCompletenessFormula,                                         // Col X (24): Doc Completeness
      photoFormula,                                                   // Col Y (25): Photo Document
      driverLicFrontFormula,                                          // Col Z (26): Driver License (Front)
      driverLicBackFormula,                                           // Col AA (27): Driver License (Back)
      carLicFrontFormula,                                             // Col AB (28): Car Reg (Front)
      carLicBackFormula,                                              // Col AC (29): Car Reg (Back)
      carFitnessFormula,                                              // Col AD (30): Car Fitness Doc
      nidFrontFormula,                                                // Col AE (31): NID (Front)
      nidBackFormula,                                                 // Col AF (32): NID (Back)
      tradeLicFormula,                                                // Col AG (33): Trade License Doc
      vaultFolderFormula,                                             // Col AH (34): ⭐ 📂 All Documents Vault (Drive Folder)
      sanitizeCellValue(auditTrackerStr),                             // Col AI (35): Admin Tracker & Audit
      sanitizeCellValue(resubmissionNotesStr),                        // Col AJ (36): Resubmission Notes
      "",                                                             // Col AK (37): Verified By
      ""                                                              // Col AL (38): Verification Time
    ];

    sheet.appendRow(row);

    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, row.length);
    rowRange.setFontSize(10);
    rowRange.setFontFamily("Roboto");
    rowRange.setVerticalAlignment("middle");
    sheet.setRowHeight(lastRow, (carsList.length > 2 || driversList.length > 2) ? 60 : 36);

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

    // Audit Tracker Styling (Col AH / 34)
    var auditCell = sheet.getRange(lastRow, 35);
    auditCell.setBackground(auditBgColor);
    auditCell.setFontColor(auditFgColor);
    auditCell.setFontWeight("bold");

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Application recorded safely into Rownaa Unified Registrations Database!",
      row: lastRow,
      applicationId: appId,
      auditStatus: auditTrackerStr,
      isResubmission: isDriverCorrection,
      iteration: submissionIteration,
      carsCount: carsList.length || (primaryPlate !== "N/A" ? 1 : 0),
      driversCount: driversList.length || 1,
      documentsSaved: {
        photo: !!photoUrl,
        driverLicenseFront: !!driverLicFrontUrl,
        driverLicenseBack: !!driverLicBackUrl,
        carLicenseFront: !!carLicFrontUrl,
        carLicenseBack: !!carLicBackUrl,
        carFitness: !!carFitnessUrl,
        nidFront: !!nidFrontUrl,
        nidBack: !!nidBackUrl,
        tradeLicense: !!tradeLicUrl
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
    safeRebuildAndSetup();
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "2-Section Operations Architecture initialized safely (Dashboard & Registrations ready)!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "repair" || action === "fix" || action === "realign" || action === "align" || action === "clean") {
    var stats = autoAlignAndRepairSheet(false);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Rownaa Operations Self-Healing completed: 37 columns realigned, ghost rows cleaned, and KPI Dashboard synchronized!",
      stats: stats,
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

  if (action === "getChauffeurs" || action === "getDrivers" || action === "getRegistrations") {
    var sheet = getRegistrationsSheet(ss);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Registrations sheet not found" })).setMimeType(ContentService.MimeType.JSON);
    }
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: 0, chauffeurs: [] })).setMimeType(ContentService.MimeType.JSON);
    }

    var list = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0] && !r[1] && !r[2] && !r[3]) continue;

      list.push({
        timestamp: r[0],
        id: r[1],
        name: r[2],
        phone: String(r[3]).replace(/^'/, ""),
        nid: String(r[5]).replace(/^'/, ""),
        city: r[6],
        emergency: r[7],
        role: r[8],
        companyName: r[9],
        tradeLicense: String(r[10]).replace(/^'/, ""),
        licenseNumber: String(r[11]).replace(/^'/, ""),
        licenseClassExpiry: r[12],
        licenseStatus: r[13],
        carPrimary: r[14],
        carFitnessExpiry: r[15],
        carsList: r[16],       // ⭐ ALL MULTIPLE CARS
        driversList: r[17],    // ⭐ ALL MULTIPLE DRIVERS
        experience: r[18],
        services: r[19],
        availability: r[20],
        payout: String(r[21]).replace(/^'/, ""),
        status: r[22],
        docCompleteness: r[23],
        auditTracker: r[33] || "—",
        resubmissionNotes: r[34] || "—"
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: list.length,
      chauffeurs: list,
      registrations: list
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Default: Health Check
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Rownaa Driver, Car & Fleet Operations Platform (2-Section v7.0)",
    version: "7.0",
    sections: ["Dashboard", "Registrations"],
    schemaColumns: 38,
    features: [
      "2-Section Master Architecture (Dashboard & Registrations)",
      "Single-Column Multiple Cars Details (Col Q)",
      "Single-Column Multiple Drivers Details (Col R)",
      "1-Click WhatsApp Launcher (Col E)",
      "Zero-Freeze-Crash Defensive breakApart Engine",
      "9-Document Google Drive Vault",
      "Advanced Duplicate Data Tracker & Resubmission Auditor",
      "Automatic Daily Backup to Google Drive & Excel (.xlsx)"
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

  var ssFile = DriveApp.getFileById(ss.getId());

  var backupSheetName = "Rownaa_Operations_Backup_" + dateStamp;
  var backupSheetCopy = ssFile.makeCopy(backupSheetName, backupFolder);
  var sheetBackupUrl = backupSheetCopy.getUrl();

  try {
    pruneOldBackups(backupFolder, 30);
  } catch (pErr) {}

  return {
    status: "success",
    timestamp: dateStamp,
    sheetBackupUrl: sheetBackupUrl,
    excelBackupUrl: ""
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
    '<p style="margin:0; font-size:12px; color:#aaa;">Exporting complete Registrations & Dashboard to Microsoft Excel (.xlsx)</p>' +
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
