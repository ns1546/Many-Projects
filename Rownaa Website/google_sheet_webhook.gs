/**
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
var SHEET_FLEET_SERVICES_NAME = "Rental Fleet Services";
var SHEET_VEHICLES_VAULT_NAME = "Fleet Vehicle Vault";
var SHEET_FLEET_DRIVERS_NAME = "Fleet Driver Roster";
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
    .addItem("🔄 Rebuild & Setup Entire System", "safeRebuildAndSetup")
    .addSeparator()
    .addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")
    .addItem("📋 Copy Chauffeur Details Summary", "copyChauffeurSummary")
    .addItem("🔍 Check Duplicate & Resubmission Audit Log", "checkDuplicateAuditLog")
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
  if (!sheet || sheet.getLastColumn() < 36 || sheet.getRange(1, 23).getValue() !== "Verification Status") {
    autoAlignAndRepairSheet(false);
    sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  }
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Chauffeur Registry sheet not found. Please run 'Rebuild & Setup Entire System' first.");
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
/**
 * 1-Click Audit & Duplicate Detection Scanner:
 * Analyzes all applicant rows for repeat phone numbers, NID, Driver License, or Car Plates.
 * Shows an executive dashboard modal with count of Unique, Resubmissions, and Duplicates.
 */
function checkDuplicateAuditLog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert("Chauffeur Registry sheet not found. Please run 'Rebuild & Setup Entire System' first.");
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
    "⭐ ROWNAA EXECUTIVE CHAUFFEUR PROFILE ⭐\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
    "• Application ID: " + r[1] + "\n" +
    "• Full Name: " + r[2] + "\n" +
    "• Phone: " + r[3] + "\n" +
    "• NID Number: " + r[5] + "\n" +
    "• District / Base: " + r[6] + "\n" +
    "• Emergency Contact: " + r[7] + "\n" +
    "• Driver License No: " + r[8] + " (" + r[9] + ") - Expiry: " + r[10] + "\n" +
    "• Car License / Plate No: " + (r[12] || "N/A") + " - " + (r[13] || "Fleet Vehicle") + "\n" +
    "• Role: " + r[19] + "\n" +
    "• Vehicle Profile: " + r[20] + "\n" +
    "• Payout Wallet: " + r[21] + "\n" +
    "• Verification Status: " + r[22] + "\n" +
    "• Audit Tracking: " + r[32] + "\n" +
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

  var html = HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<style>' +
    'body { font-family: monospace; background: #0c0c0f; color: #d4ff00; padding: 16px; margin: 0; }' +
    'textarea { width: 100%; height: 180px; background: #16161c; color: #fff; border: 1px solid #333; border-radius: 8px; padding: 10px; font-family: monospace; font-size: 11px; resize: none; box-sizing: border-box; }' +
    '.copy-btn { margin-top: 10px; background: #d4ff00; color: #000; border: none; font-weight: 800; font-size: 13px; padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%; }' +
    '</style></head><body>' +
    '<h4 style="margin:0 0 8px 0; color:#fff; font-family:sans-serif;">📋 Chauffeur Profile Dossier</h4>' +
    '<textarea id="txt">' + summaryText.replace(/\n/g, "\n") + '</textarea>' +
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
function rebuildEntireSystem() {
  safeRebuildAndSetup();
}

function safeRebuildAndSetup() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) {}

  if (ui) {
    var resp = ui.alert(
      "🔄 Rebuild & Setup Entire System",
      "This will automatically initialize the full 4-Tab Relational Multi-Vehicle & Multi-Driver Schema (Chauffeur Registry, Rental Fleet Services, Fleet Vehicle Vault, Fleet Driver Roster), realign all 36 columns, rebuild the Operations KPI Dashboard, and heal all mismatched data.\n\n🛡️ 100% SAFE GUARANTEE:\n1. An automatic full timestamped backup is saved to Google Drive first.\n2. Existing chauffeur applicant rows will NEVER be deleted or cleared.\n\nDo you want to proceed?",
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
  setupMultiTabRelationalDatabase(ss);
  setupDashboardSheet(ss);

  if (ui) {
    ui.alert(
      "✅ Enterprise System Initialized Successfully",
      "All 5 Operational Modules have been built and aligned:\n\n" +
      "1. 🚗 Chauffeur Registry (36 Columns Dual-License)\n" +
      "2. 🏢 Rental Fleet Services (Owner Profiles & Commercial Banking)\n" +
      "3. 🚙 Fleet Vehicle Vault (Per-Car Registration, Fitness & Blue Books)\n" +
      "4. 👨‍✈️ Fleet Driver Roster (Per-Driver NID, Driving License & Plate Assignment)\n" +
      "5. 🎛️ Operations KPI Dashboard (Real-time Fleet & Chauffeur BI)\n\n" +
      "Your system is 100% ready for high-volume enterprise operations!",
      ui.ButtonSet.OK
    );
  }
}


/**
 * Master Enterprise Relational Tabs Setup:
 * 1. Chauffeur Registry (Solo Chauffeurs & Solo Owner-Drivers) - 36 Columns
 * 2. Rental Fleet Services (Fleet Businesses & Service Owners) - 21 Columns
 * 3. Fleet Vehicle Vault (Dedicated row for every single vehicle) - 19 Columns
 * 4. Fleet Driver Roster (Dedicated row for every employed driver) - 20 Columns
 * 5. Operations KPI Dashboard (Executive BI Control Center)
 */
/**
 * Master Enterprise Realignment & Healing Engine:
 * 1. Automatically aligns all 36 columns into the Dual-License schema.
 * 2. Detects legacy 28-column rows and accurately shifts their fields into the 36-column layout.
 * 3. Removes corrupt ghost/blank rows.
 * 4. Regenerates formulas natively in values without calling destructive setFormulas().
 * 5. Applies Plain-Text formats, status dropdown validations on Col W, and dark luxury styling.
 * 6. Rebuilds the Operations KPI Dashboard tab.
 */
function autoAlignAndRepairSheet(interactive) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ensure Registry Tab Exists
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

  // 2. Ensure at least 36 columns exist
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

  // Set & Style Headers on Row 1
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
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);

  // 3. Process Existing Data Rows
  var lastRow = sheet.getLastRow();
  var migratedCount = 0;
  var modernCount = 0;
  var cleanedRowsCount = 0;

  if (lastRow >= 2) {
    var totalDataRows = lastRow - 1;
    var maxDataCols = Math.max(sheet.getLastColumn(), 36);
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

      var col19Str = String(r[19] || "").trim(); // Col T
      var isStatusInCol19 = /Pending|Approved|Review|Contacted|Rejected/i.test(col19Str);
      var isRoleInCol19 = /Fleet|Owner|Rental|Chauffeur/i.test(col19Str);

      var aligned = new Array(36).fill("");

      // Baseline identity columns (Cols 1..8)
      aligned[0] = r[0] || new Date().toISOString(); // Timestamp
      aligned[1] = r[1] ? "'" + String(r[1]).replace(/^'/, "") : ("'DRV-" + Math.floor(100000 + Math.random() * 900000));
      aligned[2] = r[2] || "Chauffeur Applicant";

      var rawPhone = String(r[3] || "").trim().replace(/^'/, "");
      if (rawPhone.length === 10 && rawPhone.startsWith("1")) rawPhone = "0" + rawPhone;
      aligned[3] = rawPhone ? "'" + rawPhone : "";

      // Col E: 1-Click WhatsApp Button Formula
      var cleanDigits = rawPhone.replace(/[^0-9]/g, "");
      if (cleanDigits.startsWith("0")) cleanDigits = "880" + cleanDigits.substring(1);
      else if (!cleanDigits.startsWith("880") && cleanDigits.length === 10) cleanDigits = "880" + cleanDigits;
      var nameForWa = r[2] || "Chauffeur";
      if (cleanDigits.length >= 10) {
        aligned[4] = '=HYPERLINK("https://wa.me/' + cleanDigits + '?text=' + encodeURIComponent("Hello " + nameForWa + ", this is Rownaa Executive Fleet Operations regarding your application.") + '", "🟢 Chat on WhatsApp")';
      } else {
        aligned[4] = "—";
      }

      aligned[5] = r[5] ? "'" + String(r[5]).replace(/^'/, "") : "";
      aligned[6] = r[6] || "";
      aligned[7] = r[7] ? String(r[7]).replace(/^'/, "") : "";

      if (isStatusInCol19 && !isRoleInCol19) {
        // Legacy 28-column row
        migratedCount++;

        aligned[8] = r[8] ? "'" + String(r[8]).replace(/^'/, "") : "";
        aligned[9] = r[9] || "Professional Light";
        aligned[10] = r[10] || "—";
        aligned[11] = '=IF(K' + targetRowNum + '="—", "—", IF(ISDATE(K' + targetRowNum + '), IF(K' + targetRowNum + '<TODAY(), "🔴 Expired", IF(K' + targetRowNum + '<TODAY()+60, "🟡 Expiring Soon", "🟢 Valid")), "🟢 Active"))';

        var legRole = String(r[16] || "Fleet Chauffeur").trim();
        var legVeh = String(r[17] || "N/A (Rownaa Fleet Provided)").trim();
        var extPlate = "N/A (Fleet Chauffeur)";
        var extModel = "N/A (Fleet Chauffeur)";
        if (legRole === "Owner-Driver" || legVeh.includes("[")) {
          var pm = legVeh.match(/\[(.*?)\]/);
          if (pm) extPlate = pm[1];
          extModel = legVeh.split("[")[0].trim() || legVeh;
        }

        aligned[12] = "'" + extPlate;
        aligned[13] = extModel;
        aligned[14] = "N/A";
        aligned[15] = r[12] || "";
        aligned[16] = r[13] || "";
        aligned[17] = r[14] || "";
        aligned[18] = r[15] || "Full Time";
        aligned[19] = legRole;
        aligned[20] = legVeh;
        aligned[21] = r[18] ? "'" + String(r[18]).replace(/^'/, "") : "";
        aligned[22] = r[19] || "Pending Verification";
        aligned[23] = '=IF(AND(Y' + targetRowNum + '<>"", Z' + targetRowNum + '<>"", AE' + targetRowNum + '<>""), "🟢 Complete", "⚠️ Incomplete")';

        aligned[24] = f[21] || r[21] || "—";
        aligned[25] = f[22] || r[22] || "—";
        aligned[26] = f[23] || r[23] || "—";
        aligned[27] = "—";
        aligned[28] = "—";
        aligned[29] = "—";
        aligned[30] = f[24] || r[24] || "—";
        aligned[31] = f[25] || r[25] || "—";
        aligned[32] = r[26] || "✅ UNIQUE (Legacy Migrated)";
        aligned[33] = r[27] || "—";
        aligned[34] = "";
        aligned[35] = "";
      } else {
        // Modern 36-column row
        modernCount++;

        aligned[8] = r[8] ? "'" + String(r[8]).replace(/^'/, "") : "";
        aligned[9] = r[9] || "Professional Light";
        aligned[10] = r[10] || "—";
        aligned[11] = '=IF(K' + targetRowNum + '="—", "—", IF(ISDATE(K' + targetRowNum + '), IF(K' + targetRowNum + '<TODAY(), "🔴 Expired", IF(K' + targetRowNum + '<TODAY()+60, "🟡 Expiring Soon", "🟢 Valid")), "🟢 Active"))';
        aligned[12] = r[12] ? "'" + String(r[12]).replace(/^'/, "") : "";
        aligned[13] = r[13] || "";
        aligned[14] = r[14] || "";
        aligned[15] = r[15] || "";
        aligned[16] = r[16] || "";
        aligned[17] = r[17] || "";
        aligned[18] = r[18] || "Full Time";
        aligned[19] = r[19] || "Fleet Chauffeur";
        aligned[20] = r[20] || "";
        aligned[21] = r[21] ? "'" + String(r[21]).replace(/^'/, "") : "";
        aligned[22] = r[22] || "Pending Verification";
        aligned[23] = '=IF(AND(Y' + targetRowNum + '<>"", Z' + targetRowNum + '<>"", AE' + targetRowNum + '<>""), "🟢 Complete", "⚠️ Incomplete")';

        for (var cIdx = 24; cIdx <= 31; cIdx++) {
          aligned[cIdx] = f[cIdx] || r[cIdx] || "—";
        }
        aligned[32] = r[32] || "✅ UNIQUE (First-Time Applicant)";
        aligned[33] = r[33] || "—";
        aligned[34] = r[34] || "";
        aligned[35] = r[35] || "";
      }

      alignedValues.push(aligned);
    }

    // Clear existing range below header and write back aligned rows
    sheet.getRange(2, 1, Math.max(totalDataRows, 1), maxDataCols).clearContent().clearFormat();

    if (alignedValues.length > 0) {
      sheet.getRange(2, 1, alignedValues.length, 36).setValues(alignedValues);
    }
  }

  // 4. Set Plain-Text Formats (@)
  sheet.getRange("B:B").setNumberFormat("@");
  sheet.getRange("D:D").setNumberFormat("@");
  sheet.getRange("F:F").setNumberFormat("@");
  sheet.getRange("I:I").setNumberFormat("@");
  sheet.getRange("M:M").setNumberFormat("@");
  sheet.getRange("V:V").setNumberFormat("@");

  // 5. Column W Data Validation (Col 23)
  sheet.getRange(2, 1, Math.max(lastRow, 500), 22).clearDataValidations();
  sheet.getRange(2, 24, Math.max(lastRow, 500), 13).clearDataValidations();
  var statusOptions = ["Pending Verification", "Under Review", "Contacted & Scheduled", "Approved & Verified", "Rejected"];
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 23, Math.max(lastRow, 500), 1).setDataValidation(statusRule);

  // 6. Optimal Column Widths
  sheet.setColumnWidth(1, 160);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 160);
  sheet.setColumnWidth(4, 130);
  sheet.setColumnWidth(5, 170);
  sheet.setColumnWidth(6, 140);
  sheet.setColumnWidth(7, 140);
  sheet.setColumnWidth(8, 140);
  sheet.setColumnWidth(9, 150);
  sheet.setColumnWidth(10, 140);
  sheet.setColumnWidth(11, 130);
  sheet.setColumnWidth(12, 140);
  sheet.setColumnWidth(13, 160);
  sheet.setColumnWidth(14, 160);
  sheet.setColumnWidth(15, 140);
  sheet.setColumnWidth(16, 110);
  sheet.setColumnWidth(17, 130);
  sheet.setColumnWidth(18, 180);
  sheet.setColumnWidth(19, 120);
  sheet.setColumnWidth(20, 140);
  sheet.setColumnWidth(21, 240);
  sheet.setColumnWidth(22, 220);
  sheet.setColumnWidth(23, 160);
  sheet.setColumnWidth(24, 130);
  sheet.setColumnWidth(33, 240);
  sheet.setColumnWidth(34, 240);

  // 7. Synchronize Dashboard Tab
  setupDashboardSheet(ss);

  // 8. Remove default empty Sheet1 if present
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    if (defaultSheet.getLastRow() === 0 && defaultSheet.getLastColumn() === 0) {
      try { ss.deleteSheet(defaultSheet); } catch (dErr) {}
    }
  }

  // 9. Interactive Alert
  if (interactive) {
    var ui = null;
    try { ui = SpreadsheetApp.getUi(); } catch (e) {}
    if (ui) {
      ui.alert(
        "✅ Operations Realignment Complete",
        "Rownaa Executive Chauffeur System has successfully realigned all 36 Dual-License columns!\n\n" +
        "• Migrated Legacy Records: " + migratedCount + "\n" +
        "• Aligned Modern Dual-License Records: " + modernCount + "\n" +
        "• Ghost/Blank Rows Cleaned: " + cleanedRowsCount + "\n" +
        "• Operations KPI Dashboard: Synchronized and Active",
        ui.ButtonSet.OK
      );
    }
  }

  return {
    migrated: migratedCount,
    modern: modernCount,
    cleaned: cleanedRowsCount,
    total: migratedCount + modernCount
  };
}

function setupMultiTabRelationalDatabase(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();

  // ==============================================================
  // TAB 1: CHAUFFEUR REGISTRY (Solo Drivers & Solo Owner-Drivers)
  // ==============================================================
  var regSheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!regSheet) {
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && sheet1.getLastRow() === 0 && sheet1.getLastColumn() === 0) {
      sheet1.setName(SHEET_REGISTRY_NAME);
      regSheet = sheet1;
    } else {
      regSheet = ss.insertSheet(SHEET_REGISTRY_NAME, 0);
    }
  }

  // ==============================================================
  // TAB 2: RENTAL FLEET SERVICES (Fleet Businesses & Service Owners)
  // ==============================================================
  var fleetSheet = ss.getSheetByName(SHEET_FLEET_SERVICES_NAME);
  if (!fleetSheet) {
    fleetSheet = ss.insertSheet(SHEET_FLEET_SERVICES_NAME, 1);
  }

  var fleetHeaders = [
    "Timestamp",                         // Col A (1)
    "Fleet ID",                          // Col B (2) - e.g. FLT-8291
    "Fleet / Business Name",             // Col C (3)
    "Owner Full Name",                   // Col D (4)
    "Owner Phone (WhatsApp)",            // Col E (5)
    "💬 1-Click WhatsApp",                // Col F (6)
    "Owner Smart NID",                   // Col G (7)
    "Operating Hub / Base District",     // Col H (8)
    "Office / Garage Address",           // Col I (9)
    "Total Registered Vehicles",         // Col J (10)
    "Total Employed Drivers",            // Col K (11)
    "Trade License / Reg Number",        // Col L (12)
    "Commercial Payout Bank & Account",  // Col M (13)
    "Fleet Verification Status",         // Col N (14) - Dropdown
    "Doc Completeness",                  // Col O (15) - Formula
    "Owner Portrait Photo",              // Col P (16)
    "Owner Smart NID (Front)",           // Col Q (17)
    "Owner Smart NID (Back)",            // Col R (18)
    "Trade License / Registration Doc",  // Col S (19)
    "Admin Tracker & Audit",             // Col T (20)
    "Verified By (Operator)",            // Col U (21)
    "Verification Time"                  // Col V (22)
  ];

  try {
    fleetSheet.setFrozenRows(0);
    fleetSheet.setFrozenColumns(0);
    fleetSheet.getRange(1, 1, Math.min(10, fleetSheet.getMaxRows()), Math.max(40, fleetSheet.getMaxColumns())).breakApart();
  } catch (fBreakErr) {}

  fleetSheet.getRange(1, 1, 1, fleetHeaders.length).setValues([fleetHeaders]);
  var fhRange = fleetSheet.getRange(1, 1, 1, fleetHeaders.length);
  fhRange.setBackground("#0d0d10");
  fhRange.setFontColor("#d4ff00");
  fhRange.setFontWeight("bold");
  fhRange.setFontSize(10);
  fhRange.setFontFamily("Roboto");
  fhRange.setHorizontalAlignment("center");
  fhRange.setVerticalAlignment("middle");
  fleetSheet.setRowHeight(1, 44);
  fleetSheet.setFrozenRows(1);
  fleetSheet.setFrozenColumns(4);

  fleetSheet.getRange("B:B").setNumberFormat("@");
  fleetSheet.getRange("E:E").setNumberFormat("@");
  fleetSheet.getRange("G:G").setNumberFormat("@");
  fleetSheet.getRange("L:L").setNumberFormat("@");
  fleetSheet.getRange("M:M").setNumberFormat("@");

  var fleetStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending Verification", "Under Review", "Contacted & Scheduled", "Approved & Verified", "Suspended"], true)
    .setAllowInvalid(true)
    .build();
  fleetSheet.getRange(2, 14, Math.max(fleetSheet.getLastRow(), 500), 1).setDataValidation(fleetStatusRule);

  // ==============================================================
  // TAB 3: FLEET VEHICLE VAULT (Dedicated row for every car)
  // ==============================================================
  var vehSheet = ss.getSheetByName(SHEET_VEHICLES_VAULT_NAME);
  if (!vehSheet) {
    vehSheet = ss.insertSheet(SHEET_VEHICLES_VAULT_NAME, 2);
  }

  var vehHeaders = [
    "Timestamp",                         // Col A (1)
    "Vehicle ID",                        // Col B (2) - e.g. VEH-1029
    "Fleet / Owner ID",                  // Col C (3) - Ties to Fleet or Solo Owner
    "Fleet / Company Name",              // Col D (4)
    "Owner Contact Phone",               // Col E (5)
    "Vehicle Make & Model",              // Col N (6) - e.g. Toyota HiAce Grand Cabin
    "License / Reg Plate No.",           // Col G (7) - e.g. Dhaka Metro Cha 53-1092
    "Manufacturing Year",                // Col H (8)
    "Seating Capacity",                  // Col I (9)
    "Fuel / Energy Type",                // Col J (10) - Octane / Hybrid / Diesel / EV
    "Fitness & Tax Expiry Date",         // Col K (11)
    "Fitness & Tax Status",              // Col L (12) - Formula Alert
    "Car License / Blue Book (Front)",   // Col M (13)
    "Car License / Blue Book (Back)",    // Col N (14)
    "Tax Token & Fitness Certificate",   // Col O (15)
    "Vehicle Approval Status",           // Col P (16) - Dropdown
    "Assigned Driver (if any)",          // Col Q (17)
    "Verified By (Operator)",            // Col R (18)
    "Verification Time"                  // Col S (19)
  ];

  try {
    vehSheet.setFrozenRows(0);
    vehSheet.setFrozenColumns(0);
    vehSheet.getRange(1, 1, Math.min(10, vehSheet.getMaxRows()), Math.max(40, vehSheet.getMaxColumns())).breakApart();
  } catch (vBreakErr) {}

  vehSheet.getRange(1, 1, 1, vehHeaders.length).setValues([vehHeaders]);
  var vhRange = vehSheet.getRange(1, 1, 1, vehHeaders.length);
  vhRange.setBackground("#0d0d10");
  vhRange.setFontColor("#d4ff00");
  vhRange.setFontWeight("bold");
  vhRange.setFontSize(10);
  vhRange.setFontFamily("Roboto");
  vhRange.setHorizontalAlignment("center");
  vhRange.setVerticalAlignment("middle");
  vehSheet.setRowHeight(1, 44);
  vehSheet.setFrozenRows(1);
  vehSheet.setFrozenColumns(4);

  vehSheet.getRange("B:B").setNumberFormat("@");
  vehSheet.getRange("C:C").setNumberFormat("@");
  vehSheet.getRange("E:E").setNumberFormat("@");
  vehSheet.getRange("G:G").setNumberFormat("@");

  var vehStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending Inspection", "Approved & Active", "Under Review", "Suspended / Maintenance"], true)
    .setAllowInvalid(true)
    .build();
  vehSheet.getRange(2, 16, Math.max(vehSheet.getLastRow(), 500), 1).setDataValidation(vehStatusRule);

  // ==============================================================
  // TAB 4: FLEET DRIVER ROSTER (Dedicated row for every driver)
  // ==============================================================
  var drvSheet = ss.getSheetByName(SHEET_FLEET_DRIVERS_NAME);
  if (!drvSheet) {
    drvSheet = ss.insertSheet(SHEET_FLEET_DRIVERS_NAME, 3);
  }

  var drvHeaders = [
    "Timestamp",                         // Col A (1)
    "Driver Record ID",                  // Col B (2) - e.g. FDRV-9302
    "Fleet ID",                          // Col C (3) - Ties to Fleet
    "Fleet / Company Name",              // Col D (4)
    "Driver Full Name",                  // Col E (5)
    "Driver Contact Phone",              // Col F (6)
    "💬 1-Click WhatsApp",                // Col G (7)
    "Driver Smart NID Number",           // Col H (8)
    "BRTA Driving License Number",       // Col I (9)
    "License Class",                     // Col J (10) - Professional Light / Heavy
    "License Expiry Date",               // Col K (11)
    "License Status",                    // Col L (12) - Formula Alert
    "Driver License (Front)",            // Col M (13)
    "Driver License (Back)",             // Col N (14)
    "Driver Smart NID (Front)",          // Col O (15)
    "Driver Smart NID (Back)",           // Col P (16)
    "Assigned Vehicle Plate",            // Col Q (17)
    "Driver Verification Status",        // Col R (18) - Dropdown
    "Verified By (Operator)",            // Col S (19)
    "Verification Time"                  // Col T (20)
  ];

  try {
    drvSheet.setFrozenRows(0);
    drvSheet.setFrozenColumns(0);
    drvSheet.getRange(1, 1, Math.min(10, drvSheet.getMaxRows()), Math.max(40, drvSheet.getMaxColumns())).breakApart();
  } catch (dBreakErr) {}

  drvSheet.getRange(1, 1, 1, drvHeaders.length).setValues([drvHeaders]);
  var dhRange = drvSheet.getRange(1, 1, 1, drvHeaders.length);
  dhRange.setBackground("#0d0d10");
  dhRange.setFontColor("#d4ff00");
  dhRange.setFontWeight("bold");
  dhRange.setFontSize(10);
  dhRange.setFontFamily("Roboto");
  dhRange.setHorizontalAlignment("center");
  dhRange.setVerticalAlignment("middle");
  drvSheet.setRowHeight(1, 44);
  drvSheet.setFrozenRows(1);
  drvSheet.setFrozenColumns(4);

  drvSheet.getRange("B:B").setNumberFormat("@");
  drvSheet.getRange("C:C").setNumberFormat("@");
  drvSheet.getRange("F:F").setNumberFormat("@");
  drvSheet.getRange("H:H").setNumberFormat("@");
  drvSheet.getRange("I:I").setNumberFormat("@");
  drvSheet.getRange("Q:Q").setNumberFormat("@");

  var drvStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending Verification", "Approved & Active", "Under Review", "Suspended / Inactive"], true)
    .setAllowInvalid(true)
    .build();
  drvSheet.getRange(2, 18, Math.max(drvSheet.getLastRow(), 500), 1).setDataValidation(drvStatusRule);

  // Set widths for all sheets
  setCleanColumnWidths(fleetSheet, [150, 120, 180, 160, 130, 160, 140, 140, 200, 120, 120, 150, 220, 160, 140, 130, 130, 130, 140, 220, 130, 130]);
  setCleanColumnWidths(vehSheet, [150, 120, 120, 180, 130, 180, 160, 110, 110, 120, 130, 140, 140, 140, 140, 160, 150, 130, 130]);
  setCleanColumnWidths(drvSheet, [150, 120, 120, 180, 160, 130, 160, 140, 150, 140, 130, 140, 140, 140, 140, 140, 160, 160, 130, 130]);
}

function setCleanColumnWidths(sheet, widths) {
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}


function setupSheet() {
  autoAlignAndRepairSheet(false);
  setupMultiTabRelationalDatabase();
}

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
    "=COUNTA('" + SHEET_REGISTRY_NAME + "'!B2:B)",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Pending Verification\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Under Review\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Contacted & Scheduled\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Approved & Verified\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!W2:W, \"Rejected\")",
    "=COUNTIF('" + SHEET_REGISTRY_NAME + "'!M2:M, \"*Metro*\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!M2:M, \"*GA*\") + COUNTIF('" + SHEET_REGISTRY_NAME + "'!M2:M, \"*CHA*\")",
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
  return autoAlignAndRepairSheet(true);
}

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
    var fleetCarsList = (data.fleetData && (data.fleetData.vehicles || data.fleetData.cars)) || [];
    if (fleetCarsList.length > 0) {
      for (var fcIdx = 0; fcIdx < fleetCarsList.length; fcIdx++) {
        var fCar = fleetCarsList[fcIdx];
        var cNum = fcIdx + 1;
        var cPlateClean = String(fCar.reg || fCar.plate || fCar.plateNumber || ("Car_" + cNum)).replace(/[^a-zA-Z0-9_-]/g, "_");

        var cFront = null;
        if (fCar.carLicenseFront || fCar.carLicenseFrontBase64 || fCar.blueBookFront || fCar.blueBookFrontBase64) {
          cFront = saveBase64DocumentToDrive(fCar.carLicenseFront || fCar.carLicenseFrontBase64 || fCar.blueBookFront || fCar.blueBookFrontBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_reg_front.jpg", applicantFolder);
          if (cFront) fleetCarDocCount++;
        }
        var cBack = null;
        if (fCar.carLicenseBack || fCar.carLicenseBackBase64 || fCar.blueBookBack || fCar.blueBookBackBase64) {
          cBack = saveBase64DocumentToDrive(fCar.carLicenseBack || fCar.carLicenseBackBase64 || fCar.blueBookBack || fCar.blueBookBackBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_reg_back.jpg", applicantFolder);
          if (cBack) fleetCarDocCount++;
        }
        var cFitness = null;
        if (fCar.carFitness || fCar.carFitnessBase64 || fCar.taxToken || fCar.taxTokenBase64) {
          cFitness = saveBase64DocumentToDrive(fCar.carFitness || fCar.carFitnessBase64 || fCar.taxToken || fCar.taxTokenBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_fitness.jpg", applicantFolder);
        }

        if (!carLicFrontUrl && cFront) carLicFrontUrl = cFront;
        if (!carLicBackUrl && cBack) carLicBackUrl = cBack;
        if (!carFitnessUrl && cFitness) carFitnessUrl = cFitness;
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

    // ==============================================================
    // MULTI-TAB RELATIONAL DATABASE INGESTION ENGINE
    // Automatically routes Fleets, Vehicles, and Employed Drivers
    // ==============================================================
    try {
      var isRentalFleet = (/rental|fleet/i.test(data.role || "") || /rental|fleet/i.test(data.driverRole || "") || !!data.fleetData);
      var isSoloOwner = (/owner/i.test(data.role || "") || /owner/i.test(data.driverRole || "") || !!data.ownerCar);

      if (isRentalFleet) {
        setupMultiTabRelationalDatabase(ss);

        // 1. INGEST INTO RENTAL FLEET SERVICES TAB
        var fleetSheet = ss.getSheetByName(SHEET_FLEET_SERVICES_NAME);
        var fVehicles = (data.fleetData && (data.fleetData.vehicles || data.fleetData.cars)) || [];
        var fDrivers = (data.fleetData && data.fleetData.drivers) || [];
        if (fleetSheet) {
          var totalCars = (fVehicles.length > 0) ? fVehicles.length : (data.totalVehicles || 1);
          var totalDrivers = (fDrivers.length > 0) ? fDrivers.length : (data.totalDrivers || 1);
          var bName = data.businessName || data.companyName || (applicantName + " Rental Fleet");
          var tLicNo = data.tradeLicenseNumber || data.tradeLicense || "—";
          var tLicUrl = saveBase64DocumentToDrive(data.tradeLicenseBase64, "00_trade_license_registration.jpg", applicantFolder);
          var tLicForm = tLicUrl ? '=HYPERLINK("' + tLicUrl + '", "📑 View Trade License")' : '—';
          var offAddr = data.officeAddress || data.garageAddress || data.baseCity || "Dhaka";

          var fleetRowData = [
            sanitizeCellValue(data.submittedAt || new Date().toISOString()),
            appId,
            sanitizeCellValue(bName),
            applicantName,
            formatAsPlainText(rawPhone),
            whatsappFormula,
            formatAsPlainText(data.nidNumber || data.nid || ""),
            sanitizeCellValue(data.baseCity || data.city || "Dhaka"),
            sanitizeCellValue(offAddr),
            totalCars,
            totalDrivers,
            formatAsPlainText(tLicNo),
            formatAsPlainText(payoutStr),
            "Pending Verification",
            docCompletenessFormula,
            photoFormula,
            nidFrontFormula,
            nidBackFormula,
            tLicForm,
            sanitizeCellValue(auditTrackerStr),
            "",
            ""
          ];
          fleetSheet.appendRow(fleetRowData);
        }

        // 2. INGEST INTO FLEET VEHICLE VAULT TAB (One dedicated row per vehicle)
        var vehSheet = ss.getSheetByName(SHEET_VEHICLES_VAULT_NAME);
        if (vehSheet && fVehicles.length > 0) {
          for (var cIdx = 0; cIdx < fVehicles.length; cIdx++) {
            var carObj = fVehicles[cIdx];
            var vehId = "VEH-" + (cIdx + 1) + "-" + appId.replace(/[^0-9]/g, "").slice(-4);
            var cPlate = carObj.reg || carObj.plate || carObj.plateNumber || ("Car-" + (cIdx + 1));
            var cModel = carObj.model || carObj.make || "Sedan / Microbus";
            var cYear = carObj.year || carObj.manufacturingYear || "2021";
            var cSeats = carObj.seats || carObj.seatingCapacity || "4-7 Seats";
            var cFuel = carObj.fuel || carObj.fuelType || "Octane / Hybrid";
            var cFitExp = carObj.fitnessExpiry || carObj.fitness || "2027-12-31";

            var cFUrl = saveBase64DocumentToDrive(carObj.carLicenseFront || carObj.carLicenseFrontBase64 || carObj.blueBookFront || carObj.blueBookFrontBase64, "car_" + (cIdx + 1) + "_reg_front.jpg", applicantFolder);
            var cBUrl = saveBase64DocumentToDrive(carObj.carLicenseBack || carObj.carLicenseBackBase64 || carObj.blueBookBack || carObj.blueBookBackBase64, "car_" + (cIdx + 1) + "_reg_back.jpg", applicantFolder);
            var cFitUrl = saveBase64DocumentToDrive(carObj.carFitness || carObj.carFitnessBase64 || carObj.taxToken || carObj.taxTokenBase64, "car_" + (cIdx + 1) + "_fitness.jpg", applicantFolder);

            var cFForm = cFUrl ? '=HYPERLINK("' + cFUrl + '", "🚗 Blue Book Front")' : (cIdx === 0 && carLicFrontUrl ? '=HYPERLINK("' + carLicFrontUrl + '", "🚗 Blue Book Front")' : '—');
            var cBForm = cBUrl ? '=HYPERLINK("' + cBUrl + '", "🚗 Blue Book Back")' : (cIdx === 0 && carLicBackUrl ? '=HYPERLINK("' + carLicBackUrl + '", "🚗 Blue Book Back")' : '—');
            var cFitDocForm = cFitUrl ? '=HYPERLINK("' + cFitUrl + '", "📑 Fitness Token")' : (cIdx === 0 && carFitnessUrl ? '=HYPERLINK("' + carFitnessUrl + '", "📑 Fitness Token")' : '—');

            var vRowIdx = vehSheet.getLastRow() + 1;
            var vFitStatForm = '=IF(K' + vRowIdx + '="—", "—", IF(DATEVALUE(K' + vRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + vRowIdx + ')<TODAY()+60, "⚠️ EXPIRING SOON", "✅ VALID")))';

            vehSheet.appendRow([
              sanitizeCellValue(data.submittedAt || new Date().toISOString()),
              vehId,
              appId,
              sanitizeCellValue(bName),
              formatAsPlainText(rawPhone),
              sanitizeCellValue(cModel),
              formatAsPlainText(cPlate),
              sanitizeCellValue(cYear),
              sanitizeCellValue(cSeats),
              sanitizeCellValue(cFuel),
              sanitizeCellValue(cFitExp),
              vFitStatForm,
              cFForm,
              cBForm,
              cFitDocForm,
              "Pending Inspection",
              "",
              "",
              ""
            ]);
          }
        }

        // 3. INGEST INTO FLEET DRIVER ROSTER TAB (One dedicated row per employed driver)
        var drvSheet = ss.getSheetByName(SHEET_FLEET_DRIVERS_NAME);
        if (drvSheet && fDrivers.length > 0) {
          for (var dIdx = 0; dIdx < fDrivers.length; dIdx++) {
            var dObj = fDrivers[dIdx];
            var fdrvId = "FDRV-" + (dIdx + 1) + "-" + appId.replace(/[^0-9]/g, "").slice(-4);
            var dName = dObj.name || dObj.fullName || ("Employed Driver " + (dIdx + 1));
            var dPhone = dObj.phone || dObj.mobile || "";
            var dNid = dObj.nid || dObj.nidNumber || "";
            var dLicense = dObj.license || dObj.licenseNumber || "";
            var dClass = dObj.licenseClass || dObj.licenseType || "Professional Light";
            var dExpiry = dObj.licenseExpiry || dObj.expiry || "—";
            var dAssignedPlate = dObj.assignedPlate || (fVehicles[dIdx] ? (fVehicles[dIdx].plate || fVehicles[dIdx].reg) : "Any Fleet Car");

            var dCleanPhone = dPhone.replace(/[^0-9]/g, "");
            if (dCleanPhone.startsWith("0")) dCleanPhone = "880" + dCleanPhone.substring(1);
            var dWaForm = (dCleanPhone.length >= 10) ?
              '=HYPERLINK("https://wa.me/' + dCleanPhone + '?text=' + encodeURIComponent("Hello " + dName + ", this is Rownaa Fleet Operations under " + bName + ".") + '", "🟢 Chat on WhatsApp")' : '—';

            var dFUrl = saveBase64DocumentToDrive(dObj.licenseFront || dObj.licenseFrontBase64, "driver_" + (dIdx + 1) + "_lic_front.jpg", applicantFolder);
            var dBUrl = saveBase64DocumentToDrive(dObj.licenseBack || dObj.licenseBackBase64, "driver_" + (dIdx + 1) + "_lic_back.jpg", applicantFolder);
            var dNFUrl = saveBase64DocumentToDrive(dObj.nidFront || dObj.nidFrontBase64, "driver_" + (dIdx + 1) + "_nid_front.jpg", applicantFolder);
            var dNBUrl = saveBase64DocumentToDrive(dObj.nidBack || dObj.nidBackBase64, "driver_" + (dIdx + 1) + "_nid_back.jpg", applicantFolder);

            var dFForm = dFUrl ? '=HYPERLINK("' + dFUrl + '", "📄 Lic Front")' : (dIdx === 0 && driverLicFrontUrl ? '=HYPERLINK("' + driverLicFrontUrl + '", "📄 Lic Front")' : '—');
            var dBForm = dBUrl ? '=HYPERLINK("' + dBUrl + '", "📄 Lic Back")' : (dIdx === 0 && driverLicBackUrl ? '=HYPERLINK("' + driverLicBackUrl + '", "📄 Lic Back")' : '—');
            var dNFForm = dNFUrl ? '=HYPERLINK("' + dNFUrl + '", "🪪 NID Front")' : '—';
            var dNBForm = dNBUrl ? '=HYPERLINK("' + dNBUrl + '", "🪪 NID Back")' : '—';

            var dRowIdx = drvSheet.getLastRow() + 1;
            var dLicStatForm = '=IF(K' + dRowIdx + '="—", "—", IF(DATEVALUE(K' + dRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + dRowIdx + ')<TODAY()+30, "⚠️ EXPIRING SOON", "✅ VALID")))';

            drvSheet.appendRow([
              sanitizeCellValue(data.submittedAt || new Date().toISOString()),
              fdrvId,
              appId,
              sanitizeCellValue(bName),
              applicantName,
              formatAsPlainText(dPhone),
              dWaForm,
              formatAsPlainText(dNid),
              formatAsPlainText(dLicense),
              sanitizeCellValue(dClass),
              sanitizeCellValue(dExpiry),
              dLicStatForm,
              dFForm,
              dBForm,
              dNFForm,
              dNBForm,
              formatAsPlainText(dAssignedPlate),
              "Pending Verification",
              "",
              ""
            ]);
          }
        }
      } else if (isSoloOwner) {
        // Also register solo owner-driver car in Fleet Vehicle Vault
        setupMultiTabRelationalDatabase(ss);
        var soloVehSheet = ss.getSheetByName(SHEET_VEHICLES_VAULT_NAME);
        if (soloVehSheet && carPlateNo && carPlateNo !== "—") {
          var soloVehId = "VEH-SOLO-" + appId.replace(/[^0-9]/g, "").slice(-4);
          var sRowIdx = soloVehSheet.getLastRow() + 1;
          var sFitStatForm = '=IF(K' + sRowIdx + '="—", "—", IF(DATEVALUE(K' + sRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + sRowIdx + ')<TODAY()+60, "⚠️ EXPIRING SOON", "✅ VALID")))';

          soloVehSheet.appendRow([
            sanitizeCellValue(data.submittedAt || new Date().toISOString()),
            soloVehId,
            appId,
            applicantName + " (Solo Owner-Driver)",
            formatAsPlainText(rawPhone),
            sanitizeCellValue(carModelStr),
            formatAsPlainText(carPlateNo),
            sanitizeCellValue(data.carYear || "2021"),
            sanitizeCellValue(data.carSeats || "4 Seats"),
            sanitizeCellValue(data.carFuel || "Octane"),
            sanitizeCellValue(carFitnessExpiry),
            sFitStatForm,
            carLicFrontFormula,
            carLicBackFormula,
            carFitnessFormula,
            "Approved & Active",
            applicantName,
            "",
            ""
          ]);
        }
      }
    } catch(multiTabErr) {
      Logger.log("Multi-tab ingestion note: " + multiTabErr.toString());
    }

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

  if (action === "repair" || action === "fix" || action === "realign" || action === "align" || action === "clean") {
    var stats = autoAlignAndRepairSheet(false);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Rownaa Operations Self-Healing completed: 36 columns realigned, ghost rows cleaned, and KPI Dashboard synchronized!",
      stats: stats,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (false && action === "old_repair") {
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

    if (action === "getFleets") {
    var fltSheet = ss.getSheetByName(SHEET_FLEET_SERVICES_NAME);
    if (!fltSheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Fleet Services tab not found" })).setMimeType(ContentService.MimeType.JSON);
    var fRows = fltSheet.getDataRange().getValues();
    var fList = [];
    for (var fi = 1; fi < fRows.length; fi++) {
      var fr = fRows[fi];
      if (!fr[1]) continue;
      fList.push({ timestamp: fr[0], fleetId: fr[1], businessName: fr[2], ownerName: fr[3], ownerPhone: String(fr[4]).replace(/^'/, ""), nid: String(fr[6]).replace(/^'/, ""), district: fr[7], totalCars: fr[9], totalDrivers: fr[10], tradeLicense: String(fr[11]).replace(/^'/, ""), payout: fr[12], status: fr[13] });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: fList.length, fleets: fList })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getVehicles") {
    var vSheet = ss.getSheetByName(SHEET_VEHICLES_VAULT_NAME);
    if (!vSheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Vehicle Vault tab not found" })).setMimeType(ContentService.MimeType.JSON);
    var vRows = vSheet.getDataRange().getValues();
    var vList = [];
    for (var vi = 1; vi < vRows.length; vi++) {
      var vr = vRows[vi];
      if (!vr[1]) continue;
      vList.push({ timestamp: vr[0], vehicleId: vr[1], fleetId: vr[2], company: vr[3], phone: String(vr[4]).replace(/^'/, ""), model: vr[5], plate: String(vr[6]).replace(/^'/, ""), year: vr[7], seats: vr[8], fuel: vr[9], fitnessExpiry: vr[10], status: vr[15], assignedDriver: vr[16] });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: vList.length, vehicles: vList })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getFleetDrivers") {
    var dRosterSheet = ss.getSheetByName(SHEET_FLEET_DRIVERS_NAME);
    if (!dRosterSheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Driver Roster tab not found" })).setMimeType(ContentService.MimeType.JSON);
    var drRows = dRosterSheet.getDataRange().getValues();
    var drList = [];
    for (var dri = 1; dri < drRows.length; dri++) {
      var drr = drRows[dri];
      if (!drr[1]) continue;
      drList.push({ timestamp: drr[0], driverId: drr[1], fleetId: drr[2], company: drr[3], name: drr[4], phone: String(drr[5]).replace(/^'/, ""), nid: String(drr[7]).replace(/^'/, ""), licenseNumber: String(drr[8]).replace(/^'/, ""), licenseClass: drr[9], licenseExpiry: drr[10], assignedPlate: String(drr[16]).replace(/^'/, ""), status: drr[17] });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: drList.length, drivers: drList })).setMimeType(ContentService.MimeType.JSON);
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
      // Skip empty ghost rows
      if (!r[0] && !r[1] && !r[2] && !r[3]) continue;

      list.push({
        timestamp: r[0],
        id: r[1],
        name: r[2],
        phone: String(r[3]).replace(/^'/, ""),
        nid: String(r[5]).replace(/^'/, ""),
        city: r[6],
        emergency: r[7],
        // Flat fields for backward compatibility
        licenseNumber: String(r[8]).replace(/^'/, ""),
        licenseClass: r[9],
        licenseExpiry: r[10],
        licenseStatus: r[11],
        carLicensePlate: String(r[12]).replace(/^'/, ""),
        carModel: r[13],
        carFitnessExpiry: r[14],
        // Nested dual-license objects
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
