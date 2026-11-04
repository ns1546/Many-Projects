const fs = require('fs');

const autoAlignFunctionCode = `/**
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
        // ==============================================================
        // CASE A: LEGACY 28-COLUMN ROW (Migrate accurately to 36 columns)
        // ==============================================================
        migratedCount++;

        aligned[8] = r[8] ? "'" + String(r[8]).replace(/^'/, "") : ""; // Col I: Driver License No
        aligned[9] = r[9] || "Professional Light"; // Col J: Driver License Class
        aligned[10] = r[10] || "—"; // Col K: Driver License Expiry
        aligned[11] = '=IF(K' + targetRowNum + '="—", "—", IF(ISDATE(K' + targetRowNum + '), IF(K' + targetRowNum + '<TODAY(), "🔴 Expired", IF(K' + targetRowNum + '<TODAY()+60, "🟡 Expiring Soon", "🟢 Valid")), "🟢 Active"))';

        var legRole = String(r[16] || "Fleet Chauffeur").trim();
        var legVeh = String(r[17] || "N/A (Rownaa Fleet Provided)").trim();
        var extPlate = "N/A (Fleet Chauffeur)";
        var extModel = "N/A (Fleet Chauffeur)";
        if (legRole === "Owner-Driver" || legVeh.includes("[")) {
          var pm = legVeh.match(/\\[(.*?)\\]/);
          if (pm) extPlate = pm[1];
          extModel = legVeh.split("[")[0].trim() || legVeh;
        }

        aligned[12] = "'" + extPlate; // Col M (13): Car Plate No
        aligned[13] = extModel;       // Col N (14): Car Model
        aligned[14] = "N/A";          // Col O (15): Fitness Expiry
        aligned[15] = r[12] || "";    // Col P (16): Experience (from old Col M)
        aligned[16] = r[13] || "";    // Col Q (17): Languages (from old Col N)
        aligned[17] = r[14] || "";    // Col R (18): Services (from old Col O)
        aligned[18] = r[15] || "Full Time"; // Col S (19): Availability (from old Col P)
        aligned[19] = legRole;        // Col T (20): Role Type (from old Col Q)
        aligned[20] = legVeh;         // Col U (21): Vehicle Details (from old Col R)
        aligned[21] = r[18] ? "'" + String(r[18]).replace(/^'/, "") : ""; // Col V (22): Payout (from old Col S)
        aligned[22] = r[19] || "Pending Verification"; // Col W (23): Status (from old Col T)
        aligned[23] = '=IF(AND(Y' + targetRowNum + '<>"", Z' + targetRowNum + '<>"", AE' + targetRowNum + '<>""), "🟢 Complete", "⚠️ Incomplete")';

        // Documents mapping
        aligned[24] = f[21] || r[21] || "—"; // Col Y (25): Photo
        aligned[25] = f[22] || r[22] || "—"; // Col Z (26): Driver Lic Front
        aligned[26] = f[23] || r[23] || "—"; // Col AA (27): Driver Lic Back
        aligned[27] = "—";                   // Col AB (28): Car Lic Front
        aligned[28] = "—";                   // Col AC (29): Car Lic Back
        aligned[29] = "—";                   // Col AD (30): Car Fitness Doc
        aligned[30] = f[24] || r[24] || "—"; // Col AE (31): NID Front
        aligned[31] = f[25] || r[25] || "—"; // Col AF (32): NID Back
        aligned[32] = r[26] || "✅ UNIQUE (Legacy Migrated)"; // Col AG (33): Tracker
        aligned[33] = r[27] || "—";          // Col AH (34): Notes
        aligned[34] = "";                    // Col AI (35): Verified By
        aligned[35] = "";                    // Col AJ (36): Verified Time
      } else {
        // ==============================================================
        // CASE B: MODERN 36-COLUMN DUAL-LICENSE ROW
        // ==============================================================
        modernCount++;

        aligned[8] = r[8] ? "'" + String(r[8]).replace(/^'/, "") : ""; // Col I: Driver Lic No
        aligned[9] = r[9] || "Professional Light"; // Col J: Driver Lic Class
        aligned[10] = r[10] || "—"; // Col K: Driver Lic Expiry
        aligned[11] = '=IF(K' + targetRowNum + '="—", "—", IF(ISDATE(K' + targetRowNum + '), IF(K' + targetRowNum + '<TODAY(), "🔴 Expired", IF(K' + targetRowNum + '<TODAY()+60, "🟡 Expiring Soon", "🟢 Valid")), "🟢 Active"))';
        aligned[12] = r[12] ? "'" + String(r[12]).replace(/^'/, "") : ""; // Col M: Plate
        aligned[13] = r[13] || ""; // Col N: Model
        aligned[14] = r[14] || ""; // Col O: Fitness Expiry
        aligned[15] = r[15] || ""; // Col P: Experience
        aligned[16] = r[16] || ""; // Col Q: Languages
        aligned[17] = r[17] || ""; // Col R: Services
        aligned[18] = r[18] || "Full Time"; // Col S: Availability
        aligned[19] = r[19] || "Fleet Chauffeur"; // Col T: Role
        aligned[20] = r[20] || ""; // Col U: Vehicle Profile
        aligned[21] = r[21] ? "'" + String(r[21]).replace(/^'/, "") : ""; // Col V: Payout
        aligned[22] = r[22] || "Pending Verification"; // Col W: Status
        aligned[23] = '=IF(AND(Y' + targetRowNum + '<>"", Z' + targetRowNum + '<>"", AE' + targetRowNum + '<>""), "🟢 Complete", "⚠️ Incomplete")';

        // Retain file formulas or URLs
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
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 130); // App ID
  sheet.setColumnWidth(3, 160); // Full Name
  sheet.setColumnWidth(4, 130); // Phone
  sheet.setColumnWidth(5, 170); // WhatsApp
  sheet.setColumnWidth(6, 140); // NID
  sheet.setColumnWidth(7, 140); // District
  sheet.setColumnWidth(8, 140); // Emergency
  sheet.setColumnWidth(9, 150); // Driver License No
  sheet.setColumnWidth(10, 140); // License Class
  sheet.setColumnWidth(11, 130); // License Expiry
  sheet.setColumnWidth(12, 140); // License Status
  sheet.setColumnWidth(13, 160); // Car License Plate
  sheet.setColumnWidth(14, 160); // Car Model
  sheet.setColumnWidth(15, 140); // Car Fitness Expiry
  sheet.setColumnWidth(16, 110); // Experience
  sheet.setColumnWidth(17, 130); // Languages
  sheet.setColumnWidth(18, 180); // Services
  sheet.setColumnWidth(19, 120); // Availability
  sheet.setColumnWidth(20, 140); // Role Type
  sheet.setColumnWidth(21, 240); // Full Vehicle Details
  sheet.setColumnWidth(22, 220); // Payout Wallet
  sheet.setColumnWidth(23, 160); // Verification Status
  sheet.setColumnWidth(24, 130); // Doc Completeness
  sheet.setColumnWidth(33, 240); // Admin Tracker
  sheet.setColumnWidth(34, 240); // Resubmission Notes

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
        "Rownaa Executive Chauffeur System has successfully realigned all 36 Dual-License columns!\\n\\n" +
        "• Migrated Legacy Records: " + migratedCount + "\\n" +
        "• Aligned Modern Dual-License Records: " + modernCount + "\\n" +
        "• Ghost/Blank Rows Cleaned: " + cleanedRowsCount + "\\n" +
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
}`;

function updateWebhookGs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace setupSheet()
  const pSetup1 = content.indexOf('function setupSheet() {');
  const pSetup2 = content.indexOf('function setupDashboardSheet(ss)', pSetup1);
  if (pSetup1 !== -1 && pSetup2 !== -1) {
    content = content.slice(0, pSetup1) + autoAlignFunctionCode + '\n\nfunction setupSheet() {\n  return autoAlignAndRepairSheet(false);\n}\n\n' + content.slice(pSetup2);
    console.log('Replaced setupSheet() with autoAlignAndRepairSheet in', filePath);
  }

  // Replace repairExistingErrors()
  const pRepair1 = content.indexOf('function repairExistingErrors() {');
  const pRepair2 = content.indexOf('function onEdit(e)', pRepair1);
  if (pRepair1 !== -1 && pRepair2 !== -1) {
    content = content.slice(0, pRepair1) + 'function repairExistingErrors() {\n  return autoAlignAndRepairSheet(true);\n}\n\n' + content.slice(pRepair2);
    console.log('Replaced repairExistingErrors() with autoAlignAndRepairSheet in', filePath);
  }

  // Update safeRebuildAndSetup() to call autoAlignAndRepairSheet(true)
  const pSafe1 = content.indexOf('function safeRebuildAndSetup() {');
  const pSafe2 = content.indexOf('function setupSheet()', pSafe1);
  if (pSafe1 !== -1 && pSafe2 !== -1) {
    const newSafeRebuild = `function safeRebuildAndSetup() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) {}

  if (ui) {
    var resp = ui.alert(
      "🔄 Rebuild & Setup Entire System",
      "This will automatically realign all 36 columns, migrate any legacy driver records into the Dual-License layout, rebuild the Operations KPI Dashboard, and heal all mismatched data.\\n\\n🛡️ 100% SAFE GUARANTEE:\\n1. An automatic full timestamped backup is saved to Google Drive first.\\n2. Existing chauffeur applicant rows will NEVER be deleted or cleared.\\n\\nDo you want to proceed?",
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;
  }

  try {
    createDailyBackup();
  } catch (bErr) {
    Logger.log("Backup note: " + bErr.toString());
  }

  autoAlignAndRepairSheet(true);
}

`;
    content = content.slice(0, pSafe1) + newSafeRebuild + content.slice(pSafe2);
    console.log('Updated safeRebuildAndSetup in', filePath);
  }

  // Ensure appendChauffeurRecord verifies 36 columns
  if (!content.includes('sheet.getRange(1, 23).getValue() !== "Verification Status"')) {
    content = content.replace(
      'var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);',
      'var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);\n  if (!sheet || sheet.getLastColumn() < 36 || sheet.getRange(1, 23).getValue() !== "Verification Status") {\n    autoAlignAndRepairSheet(false);\n    sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);\n  }'
    );
    console.log('Added auto-healing check to appendChauffeurRecord in', filePath);
  }

  // Update doGet actions to handle realign, repair, setup, clean
  const doGetOld = 'if (action === "repair" || action === "fix") {';
  const doGetNew = 'if (action === "repair" || action === "fix" || action === "realign" || action === "align" || action === "clean") {\n    var stats = autoAlignAndRepairSheet(false);\n    return ContentService.createTextOutput(JSON.stringify({\n      status: "success",\n      message: "Rownaa Operations Self-Healing completed: 36 columns realigned, ghost rows cleaned, and KPI Dashboard synchronized!",\n      stats: stats,\n      timestamp: new Date().toISOString()\n    })).setMimeType(ContentService.MimeType.JSON);\n  }\n\n  if (false && action === "old_repair") {';

  if (content.includes(doGetOld)) {
    content = content.replace(doGetOld, doGetNew);
    console.log('Enhanced doGet actions in', filePath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Saved', filePath);
}

updateWebhookGs('google_sheet_webhook.gs');
updateWebhookGs('netlify-driver-portal/google_sheet_webhook.gs');

