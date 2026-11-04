const fs = require('fs');

console.log('=== UPGRADING SPREADSHEET ENGINE TO 2-TIER SUB-COLUMN ARCHITECTURE ===\n');

const subColumnsCode = `/**
 * Master Enterprise Realignment & Healing Engine:
 * 2-TIER SUB-COLUMN ARCHITECTURE (52 Dedicated Columns):
 * - Row 1: Merged Category Banners (Applicant Info, Solo Driver, Rental Business & Bank, Car 1, Car 2, Car 3, Driver 1, Driver 2, Driver 3, Primary Documents, Audit & Status)
 * - Row 2: Sub-Column Headers
 * - Row 3+: Data Rows (Frozen 2 Rows, Frozen 4 Columns)
 */
function autoAlignAndRepairSheet(interactive) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ensure Registry Tab Exists
  var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) {
    var legacyReg = ss.getSheetByName("Chauffeur Registry");
    if (legacyReg) {
      legacyReg.setName(SHEET_REGISTRY_NAME);
      sheet = legacyReg;
    }
  }
  if (!sheet) {
    var sheet1 = ss.getSheetByName("Sheet1");
    if (sheet1 && sheet1.getLastRow() === 0 && sheet1.getLastColumn() === 0) {
      sheet1.setName(SHEET_REGISTRY_NAME);
      sheet = sheet1;
    } else {
      sheet = ss.insertSheet(SHEET_REGISTRY_NAME, 0);
    }
  }

  // 2. Ensure at least 52 columns exist
  var currentCols = sheet.getMaxColumns();
  if (currentCols < 52) {
    sheet.insertColumnsAfter(currentCols, 52 - currentCols);
  }

  // 3. ROW 2: SUB-COLUMN HEADERS (52 Columns)
  var subHeaders = [
    "Timestamp",                         // Col A (1)
    "Application ID",                    // Col B (2)
    "Full Name / Owner",                 // Col C (3)
    "Phone (WhatsApp)",                  // Col D (4)
    "💬 1-Click WhatsApp",                // Col E (5)
    "NID Number",                        // Col F (6)
    "City / District",                   // Col G (7)
    "Emergency Contact",                 // Col H (8)
    "Solo License No.",                  // Col I (9)
    "License Class",                     // Col J (10)
    "License Expiry",                    // Col K (11)
    "License Status",                    // Col L (12)
    "Registration Type",                 // Col M (13)
    "Services Selected",                 // Col N (14)
    "Work Type (Availability)",          // Col O (15)
    "Company / Fleet Name",              // Col P (16)
    "Trade License No.",                 // Col Q (17)
    "Office / Garage Address",           // Col R (18)
    "Payment Method (bKash/Bank)",       // Col S (19)
    "Trade License Document",            // Col T (20)
    "Car 1 Model & Plate",               // Col U (21)
    "Car 1 Year, Seats & Fuel",          // Col V (22)
    "Car 1 Fitness Expiry",              // Col W (23)
    "Car 1 Blue Book & Fitness Docs",    // Col X (24)
    "Car 2 Model & Plate",               // Col Y (25)
    "Car 2 Year, Seats & Fuel",          // Col Z (26)
    "Car 2 Fitness Expiry",              // Col AA (27)
    "Car 2 Blue Book & Fitness Docs",    // Col AB (28)
    "Car 3 Model & Plate",               // Col AC (29)
    "Car 3 Year, Seats & Fuel",          // Col AD (30)
    "Car 3 Fitness Expiry",              // Col AE (31)
    "Car 3 Blue Book & Fitness Docs",    // Col AF (32)
    "Driver 1 Name & Phone",             // Col AG (33)
    "Driver 1 NID & License",            // Col AH (34)
    "Driver 1 License Docs",             // Col AI (35)
    "Driver 2 Name & Phone",             // Col AJ (36)
    "Driver 2 NID & License",            // Col AK (37)
    "Driver 2 License Docs",             // Col AL (38)
    "Driver 3 Name & Phone",             // Col AM (39)
    "Driver 3 NID & License",            // Col AN (40)
    "Driver 3 License Docs",             // Col AO (41)
    "Driver / Owner Photo",              // Col AP (42)
    "Driver License (Front)",            // Col AQ (43)
    "Driver License (Back)",             // Col AR (44)
    "Owner NID (Front)",                 // Col AS (45)
    "Owner NID (Back)",                  // Col AT (46)
    "All Cars & Drivers Manifest",       // Col AU (47)
    "Approval Status",                   // Col AV (48)
    "Document Status",                   // Col AW (49)
    "Duplicate Check",                   // Col AX (50)
    "Correction / Repeat Notes",         // Col AY (51)
    "Verified By & Time"                 // Col AZ (52)
  ];

  // 4. UNMERGE ROW 1 & ROW 2 TO PREVENT MERGE CONFLICTS
  try {
    sheet.getRange(1, 1, 2, 52).breakApart();
  } catch(mErr) {}

  // 5. WRITE & FORMAT ROW 2 (SUB-COLUMNS)
  sheet.getRange(2, 1, 1, subHeaders.length).setValues([subHeaders]);
  var subHeaderRange = sheet.getRange(2, 1, 1, subHeaders.length);
  subHeaderRange.setBackground("#1a1a22");
  subHeaderRange.setFontColor("#f0f0f5");
  subHeaderRange.setFontWeight("bold");
  subHeaderRange.setFontSize(9);
  subHeaderRange.setFontFamily("Roboto");
  subHeaderRange.setHorizontalAlignment("center");
  subHeaderRange.setVerticalAlignment("middle");
  subHeaderRange.setWrap(false);
  sheet.setRowHeight(2, 38);

  // 6. WRITE & MERGE ROW 1 (CATEGORY BANNERS)
  var categories = [
    { range: "A1:H1", title: "👤 APPLICANT & CONTACT INFO (আবেদনকারীর তথ্য)", bg: "#0d0d10", fg: "#d4ff00" },
    { range: "I1:L1", title: "🪪 SOLO DRIVER LICENSE (একক চালক)", bg: "#16161d", fg: "#00e5ff" },
    { range: "M1:O1", title: "🛠️ PREFERENCES (কাজের ধরণ)", bg: "#1f1f28", fg: "#ffffff" },
    { range: "P1:T1", title: "🏢 RENTAL BUSINESS & PAYMENT (রেন্ট-এ-কার ও ব্যাংক)", bg: "#142216", fg: "#52d68a" },
    { range: "U1:X1", title: "🚗 CAR 1 DETAILS (১ম গাড়ি)", bg: "#1f2214", fg: "#d4ff00" },
    { range: "Y1:AB1", title: "🚙 CAR 2 DETAILS (২য় গাড়ি)", bg: "#1f2214", fg: "#d4ff00" },
    { range: "AC1:AF1", title: "🚐 CAR 3 DETAILS (৩য় গাড়ি)", bg: "#1f2214", fg: "#d4ff00" },
    { range: "AG1:AI1", title: "👨‍✈️ DRIVER 1 DETAILS (১ম ড্রাইভার)", bg: "#17202a", fg: "#5dade2" },
    { range: "AJ1:AL1", title: "👨‍✈️ DRIVER 2 DETAILS (২য় ড্রাইভার)", bg: "#17202a", fg: "#5dade2" },
    { range: "AM1:AO1", title: "👨‍✈️ DRIVER 3 DETAILS (৩য় ড্রাইভার)", bg: "#17202a", fg: "#5dade2" },
    { range: "AP1:AU1", title: "📑 PRIMARY DOCUMENTS (মূল কাগজপত্র)", bg: "#251c14", fg: "#f39c12" },
    { range: "AV1:AZ1", title: "🛡️ AUDIT & STATUS (যাচাই ও স্ট্যাটাস)", bg: "#211425", fg: "#bb86fc" }
  ];

  for (var c = 0; c < categories.length; c++) {
    var cat = categories[c];
    var r = sheet.getRange(cat.range);
    r.merge();
    r.setValue(cat.title);
    r.setBackground(cat.bg);
    r.setFontColor(cat.fg);
    r.setFontWeight("bold");
    r.setFontSize(10);
    r.setFontFamily("Roboto");
    r.setHorizontalAlignment("center");
    r.setVerticalAlignment("middle");
  }
  sheet.setRowHeight(1, 42);

  // Freeze top 2 rows (Category + Sub-Columns) & 4 columns
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(4);

  // 7. READ & MIGRATE EXISTING DATA ROWS (Starting from Row 2 or Row 3)
  var lastRow = sheet.getLastRow();
  var migratedCount = 0;

  if (lastRow > 2) {
    var totalDataRows = lastRow - 2;
    var maxCols = Math.max(sheet.getLastColumn(), 52);
    var rawValues = sheet.getRange(3, 1, totalDataRows, maxCols).getValues();
    var rawFormulas = sheet.getRange(3, 1, totalDataRows, maxCols).getFormulas();
    var alignedValues = [];

    for (var i = 0; i < totalDataRows; i++) {
      var r = rawValues[i];
      var f = rawFormulas[i];
      var targetRowNum = alignedValues.length + 3;

      // Filter empty ghost rows
      var hasContent = false;
      for (var k = 0; k < Math.min(r.length, 10); k++) {
        if (r[k] && String(r[k]).trim() !== "") {
          hasContent = true;
          break;
        }
      }
      if (!hasContent) continue;

      var aligned = new Array(52).fill("");

      // Cols 1..8: Applicant info
      aligned[0] = r[0] || new Date().toISOString();
      aligned[1] = r[1] ? "'" + String(r[1]).replace(/^'/, "") : ("'DRV-" + Math.floor(100000 + Math.random() * 900000));
      aligned[2] = r[2] || "Driver Applicant";

      var rawPhone = String(r[3] || "").trim().replace(/^'/, "");
      if (rawPhone.length === 10 && rawPhone.startsWith("1")) rawPhone = "0" + rawPhone;
      aligned[3] = rawPhone ? "'" + rawPhone : "";

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

      // Cols 9..12: Solo License
      aligned[8] = r[8] ? "'" + String(r[8]).replace(/^'/, "") : "";
      aligned[9] = r[9] || "Professional Light";
      aligned[10] = r[10] || "—";
      aligned[11] = '=IF(K' + targetRowNum + '="—", "—", IF(DATEVALUE(K' + targetRowNum + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + targetRowNum + ')<TODAY()+30, "⚠️ EXPIRING SOON", "✅ VALID")))';

      // Cols 13..15: Preferences
      aligned[12] = r[19] || r[12] || "Driver";
      aligned[13] = r[17] || r[13] || "";
      aligned[14] = r[18] || r[14] || "Full Time";

      // Cols 16..20: Rental Business & Bank
      aligned[15] = r[15] || "";
      aligned[16] = r[16] || "";
      aligned[17] = "";
      aligned[18] = r[21] ? "'" + String(r[21]).replace(/^'/, "") : "";
      aligned[19] = "—";

      // Cols 21..24: Car 1
      var legacyPlate = r[12] || "";
      var legacyModel = r[13] || "";
      var legacyFit = r[14] || "";
      aligned[20] = legacyModel ? (legacyModel + (legacyPlate ? (" [" + legacyPlate + "]") : "")) : "—";
      aligned[21] = "—";
      aligned[22] = legacyFit || "—";
      aligned[23] = f[27] || r[27] || "—";

      // Cols 25..32: Car 2 & 3
      aligned[24] = "—"; aligned[25] = "—"; aligned[26] = "—"; aligned[27] = "—";
      aligned[28] = "—"; aligned[29] = "—"; aligned[30] = "—"; aligned[31] = "—";

      // Cols 33..41: Drivers 1, 2, 3
      aligned[32] = "—"; aligned[33] = "—"; aligned[34] = "—";
      aligned[35] = "—"; aligned[36] = "—"; aligned[37] = "—";
      aligned[38] = "—"; aligned[39] = "—"; aligned[40] = "—";

      // Cols 42..47: Primary Documents & Manifest
      aligned[41] = f[24] || r[24] || "—"; // Photo
      aligned[42] = f[25] || r[25] || "—"; // Lic Front
      aligned[43] = f[26] || r[26] || "—"; // Lic Back
      aligned[44] = f[30] || r[30] || "—"; // NID Front
      aligned[45] = f[31] || r[31] || "—"; // NID Back
      aligned[46] = r[20] || "—";          // Full Manifest

      // Cols 48..52: Status & Audit
      aligned[47] = r[22] || "Pending Verification";
      aligned[48] = '=IF(AND(AP' + targetRowNum + '<>"—", AQ' + targetRowNum + '<>"—", AS' + targetRowNum + '<>"—"), "✅ Complete", "⚠️ Pending Docs")';
      aligned[49] = r[32] || "✅ First-Time Application";
      aligned[50] = r[33] || "—";
      aligned[51] = "";

      alignedValues.push(aligned);
      migratedCount++;
    }

    // Clear range starting from row 3 and write back aligned rows
    sheet.getRange(3, 1, Math.max(totalDataRows, 1), maxCols).clearContent().clearFormat();
    if (alignedValues.length > 0) {
      sheet.getRange(3, 1, alignedValues.length, 52).setValues(alignedValues);
    }
  }

  // 8. PLAIN TEXT FORMATTING (@)
  sheet.getRange("B:B").setNumberFormat("@");
  sheet.getRange("D:D").setNumberFormat("@");
  sheet.getRange("F:F").setNumberFormat("@");
  sheet.getRange("I:I").setNumberFormat("@");
  sheet.getRange("Q:Q").setNumberFormat("@");
  sheet.getRange("S:S").setNumberFormat("@");

  // 9. STATUS DROPDOWN VALIDATION ON COL AV (Col 48)
  var statusOptions = ["Pending Verification", "Under Review", "Contacted & Scheduled", "Approved & Verified", "Rejected"];
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statusOptions, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(3, 48, Math.max(sheet.getLastRow(), 500), 1).setDataValidation(statusRule);

  // 10. CLEAN COLUMN WIDTHS
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 130); // ID
  sheet.setColumnWidth(3, 170); // Full Name
  sheet.setColumnWidth(4, 130); // Phone
  sheet.setColumnWidth(5, 170); // WhatsApp Button
  sheet.setColumnWidth(6, 140); // NID
  sheet.setColumnWidth(7, 130); // City
  sheet.setColumnWidth(8, 140); // Emergency
  sheet.setColumnWidth(9, 150); // Solo Lic
  sheet.setColumnWidth(10, 130);
  sheet.setColumnWidth(11, 120);
  sheet.setColumnWidth(12, 130);
  sheet.setColumnWidth(13, 150); // Role
  sheet.setColumnWidth(14, 170);
  sheet.setColumnWidth(15, 120);
  sheet.setColumnWidth(16, 190); // Company Name
  sheet.setColumnWidth(17, 150); // Trade Lic
  sheet.setColumnWidth(18, 180); // Address
  sheet.setColumnWidth(19, 210); // Payment
  sheet.setColumnWidth(20, 150); // Trade Lic Doc
  sheet.setColumnWidth(21, 210); // Car 1 Model & Plate
  sheet.setColumnWidth(22, 160); // Car 1 Year, Seats, Fuel
  sheet.setColumnWidth(23, 140); // Car 1 Fit Expiry
  sheet.setColumnWidth(24, 180); // Car 1 Blue Book Docs
  sheet.setColumnWidth(25, 210); // Car 2 Model & Plate
  sheet.setColumnWidth(26, 160); // Car 2 Year, Seats, Fuel
  sheet.setColumnWidth(27, 140); // Car 2 Fit Expiry
  sheet.setColumnWidth(28, 180); // Car 2 Blue Book Docs
  sheet.setColumnWidth(29, 210); // Car 3 Model & Plate
  sheet.setColumnWidth(30, 160); // Car 3 Year, Seats, Fuel
  sheet.setColumnWidth(31, 140); // Car 3 Fit Expiry
  sheet.setColumnWidth(32, 180); // Car 3 Blue Book Docs
  sheet.setColumnWidth(33, 180); // Driver 1 Name & Phone
  sheet.setColumnWidth(34, 180); // Driver 1 NID & Lic
  sheet.setColumnWidth(35, 150); // Driver 1 Lic Docs
  sheet.setColumnWidth(36, 180); // Driver 2 Name & Phone
  sheet.setColumnWidth(37, 180); // Driver 2 NID & Lic
  sheet.setColumnWidth(38, 150); // Driver 2 Lic Docs
  sheet.setColumnWidth(39, 180); // Driver 3 Name & Phone
  sheet.setColumnWidth(40, 180); // Driver 3 NID & Lic
  sheet.setColumnWidth(41, 150); // Driver 3 Lic Docs
  sheet.setColumnWidth(47, 240); // Manifest
  sheet.setColumnWidth(48, 150); // Status
  sheet.setColumnWidth(50, 220); // Duplicate Check
  sheet.setColumnWidth(51, 200); // Notes

  // 11. SYNCHRONIZE DASHBOARD & HELPER TABS
  setupMultiTabRelationalDatabase(ss);
  setupDashboardSheet(ss);

  if (interactive) {
    var ui = null;
    try { ui = SpreadsheetApp.getUi(); } catch (e) {}
    if (ui) {
      ui.alert(
        "✅ 2-Tier Sub-Column Layout Initialized",
        "Your Google Sheet has been successfully upgraded to the 2-Tier Sub-Column Architecture!\\n\\n" +
        "• Row 1: Merged Category Banners (Applicant Info, Payment, Car 1, Car 2, Car 3, Driver 1, Driver 2, Driver 3)\\n" +
        "• Row 2: Sub-Column Headers\\n" +
        "• Row 3+: All registrations with sub-columns for each car and driver\\n\\n" +
        "Everything is on ONE single screen with easy English words!",
        ui.ButtonSet.OK
      );
    }
  }

  return { migrated: migratedCount };
}`;

// Inject subColumnsCode into both files
const files = ['google_sheet_webhook.gs', 'netlify-driver-portal/google_sheet_webhook.gs'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace autoAlignAndRepairSheet
  const autoAlignRegex = /function autoAlignAndRepairSheet\(interactive\)[\s\S]*?\nfunction setupMultiTabRelationalDatabase/;
  content = content.replace(autoAlignRegex, subColumnsCode + '\n\nfunction setupMultiTabRelationalDatabase');

  // Update doPost appending logic to fill all 52 sub-columns
  const doPostRowPattern = /var row = \[\s*sanitizeCellValue\(data\.submittedAt \|\| new Date\(\)\.toISOString\(\)\),[\s\S]*?""\s*\];\s*sheet\.appendRow\(row\);/;
  
  const newDoPostRow = `// SUB-COLUMN POPULATION LOGIC (Cars 1..3 & Drivers 1..3)
    var fVehicles = (data.fleetData && (data.fleetData.vehicles || data.fleetData.cars)) || [];
    var fDrivers = (data.fleetData && data.fleetData.drivers) || [];

    // Car 1 Sub-Columns (Cols 21..24)
    var c1ModelPlate = "—";
    var c1Details = "—";
    var c1Fit = "—";
    var c1Docs = "—";
    if (fVehicles.length > 0) {
      var v1 = fVehicles[0];
      c1ModelPlate = (v1.model || "Car 1") + " [" + (v1.plate || v1.reg || "No Plate") + "]";
      c1Details = (v1.year || "2021") + " | " + (v1.seats || "4-7 Seats") + " | " + (v1.fuel || "Octane/Hybrid");
      c1Fit = v1.fitnessExpiry || v1.fitness || "—";
      var v1F = saveBase64DocumentToDrive(v1.carLicenseFront || v1.carLicenseFrontBase64, "car_1_reg_front.jpg", applicantFolder);
      var v1B = saveBase64DocumentToDrive(v1.carLicenseBack || v1.carLicenseBackBase64, "car_1_reg_back.jpg", applicantFolder);
      c1Docs = (v1F ? ('=HYPERLINK("' + v1F + '", "📄 Front")') : '—') + (v1B ? (' & ' + '=HYPERLINK("' + v1B + '", "📄 Back")') : '');
    } else if (carPlateNo && carPlateNo !== "—") {
      c1ModelPlate = carModelStr + " [" + carPlateNo + "]";
      c1Details = "Solo Owner Car";
      c1Fit = carFitnessExpiry || "—";
      c1Docs = (carLicFrontUrl ? ('=HYPERLINK("' + carLicFrontUrl + '", "📄 Front")') : '—') + (carLicBackUrl ? (' & ' + '=HYPERLINK("' + carLicBackUrl + '", "📄 Back")') : '');
    }

    // Car 2 Sub-Columns (Cols 25..28)
    var c2ModelPlate = "—";
    var c2Details = "—";
    var c2Fit = "—";
    var c2Docs = "—";
    if (fVehicles.length > 1) {
      var v2 = fVehicles[1];
      c2ModelPlate = (v2.model || "Car 2") + " [" + (v2.plate || v2.reg || "No Plate") + "]";
      c2Details = (v2.year || "2021") + " | " + (v2.seats || "4-7 Seats") + " | " + (v2.fuel || "Octane/Hybrid");
      c2Fit = v2.fitnessExpiry || v2.fitness || "—";
      var v2F = saveBase64DocumentToDrive(v2.carLicenseFront || v2.carLicenseFrontBase64, "car_2_reg_front.jpg", applicantFolder);
      var v2B = saveBase64DocumentToDrive(v2.carLicenseBack || v2.carLicenseBackBase64, "car_2_reg_back.jpg", applicantFolder);
      c2Docs = (v2F ? ('=HYPERLINK("' + v2F + '", "📄 Front")') : '—') + (v2B ? (' & ' + '=HYPERLINK("' + v2B + '", "📄 Back")') : '');
    }

    // Car 3 Sub-Columns (Cols 29..32)
    var c3ModelPlate = "—";
    var c3Details = "—";
    var c3Fit = "—";
    var c3Docs = "—";
    if (fVehicles.length > 2) {
      var v3 = fVehicles[2];
      c3ModelPlate = (v3.model || "Car 3") + " [" + (v3.plate || v3.reg || "No Plate") + "]";
      c3Details = (v3.year || "2021") + " | " + (v3.seats || "4-7 Seats") + " | " + (v3.fuel || "Octane/Hybrid");
      c3Fit = v3.fitnessExpiry || v3.fitness || "—";
      var v3F = saveBase64DocumentToDrive(v3.carLicenseFront || v3.carLicenseFrontBase64, "car_3_reg_front.jpg", applicantFolder);
      var v3B = saveBase64DocumentToDrive(v3.carLicenseBack || v3.carLicenseBackBase64, "car_3_reg_back.jpg", applicantFolder);
      c3Docs = (v3F ? ('=HYPERLINK("' + v3F + '", "📄 Front")') : '—') + (v3B ? (' & ' + '=HYPERLINK("' + v3B + '", "📄 Back")') : '');
    }

    // Driver 1 Sub-Columns (Cols 33..35)
    var d1NamePhone = "—";
    var d1NidLic = "—";
    var d1Docs = "—";
    if (fDrivers.length > 0) {
      var dr1 = fDrivers[0];
      d1NamePhone = (dr1.name || "Driver 1") + " (" + (dr1.phone || "No Phone") + ")";
      d1NidLic = "NID: " + (dr1.nid || "—") + " | Lic: " + (dr1.license || "—");
      var d1F = saveBase64DocumentToDrive(dr1.licenseFront || dr1.licenseFrontBase64, "drv_1_lic_front.jpg", applicantFolder);
      var d1B = saveBase64DocumentToDrive(dr1.licenseBack || dr1.licenseBackBase64, "drv_1_lic_back.jpg", applicantFolder);
      d1Docs = (d1F ? ('=HYPERLINK("' + d1F + '", "📄 Front")') : '—') + (d1B ? (' & ' + '=HYPERLINK("' + d1B + '", "📄 Back")') : '');
    } else {
      d1NamePhone = applicantName + " (Solo Applicant)";
      d1NidLic = "NID: " + (data.nidNumber || data.nid || "—") + " | Lic: " + (data.licenseNumber || "—");
    }

    // Driver 2 Sub-Columns (Cols 36..38)
    var d2NamePhone = "—";
    var d2NidLic = "—";
    var d2Docs = "—";
    if (fDrivers.length > 1) {
      var dr2 = fDrivers[1];
      d2NamePhone = (dr2.name || "Driver 2") + " (" + (dr2.phone || "No Phone") + ")";
      d2NidLic = "NID: " + (dr2.nid || "—") + " | Lic: " + (dr2.license || "—");
      var d2F = saveBase64DocumentToDrive(dr2.licenseFront || dr2.licenseFrontBase64, "drv_2_lic_front.jpg", applicantFolder);
      var d2B = saveBase64DocumentToDrive(dr2.licenseBack || dr2.licenseBackBase64, "drv_2_lic_back.jpg", applicantFolder);
      d2Docs = (d2F ? ('=HYPERLINK("' + d2F + '", "📄 Front")') : '—') + (d2B ? (' & ' + '=HYPERLINK("' + d2B + '", "📄 Back")') : '');
    }

    // Driver 3 Sub-Columns (Cols 39..41)
    var d3NamePhone = "—";
    var d3NidLic = "—";
    var d3Docs = "—";
    if (fDrivers.length > 2) {
      var dr3 = fDrivers[2];
      d3NamePhone = (dr3.name || "Driver 3") + " (" + (dr3.phone || "No Phone") + ")";
      d3NidLic = "NID: " + (dr3.nid || "—") + " | Lic: " + (dr3.license || "—");
      var d3F = saveBase64DocumentToDrive(dr3.licenseFront || dr3.licenseFrontBase64, "drv_3_lic_front.jpg", applicantFolder);
      var d3B = saveBase64DocumentToDrive(dr3.licenseBack || dr3.licenseBackBase64, "drv_3_lic_back.jpg", applicantFolder);
      d3Docs = (d3F ? ('=HYPERLINK("' + d3F + '", "📄 Front")') : '—') + (d3B ? (' & ' + '=HYPERLINK("' + d3B + '", "📄 Back")') : '');
    }

    var tLicUrl = saveBase64DocumentToDrive(data.tradeLicenseBase64, "00_trade_license_doc.jpg", applicantFolder);
    var tLicLink = tLicUrl ? ('=HYPERLINK("' + tLicUrl + '", "📑 View Trade Lic")') : '—';

    // Construct Row Array (52 Columns)
    var row = [
      sanitizeCellValue(data.submittedAt || new Date().toISOString()), // Col 1 (A): Timestamp
      appId,                                                          // Col 2 (B): Application ID
      applicantName,                                                  // Col 3 (C): Full Name / Owner
      formatAsPlainText(rawPhone),                                    // Col 4 (D): Phone (WhatsApp)
      whatsappFormula,                                                // Col 5 (E): 💬 1-Click WhatsApp
      formatAsPlainText(data.nidNumber || data.nid || ""),            // Col 6 (F): NID Number
      sanitizeCellValue(data.baseCity || data.city || ""),            // Col 7 (G): City / District
      sanitizeCellValue(emergencyStr),                                // Col 8 (H): Emergency Contact
      formatAsPlainText(data.licenseNumber || data.driverLicenseNumber || ""), // Col 9 (I): Solo License No.
      sanitizeCellValue(data.licenseType || data.driverLicenseType || ""),    // Col 10 (J): License Class
      sanitizeCellValue(data.licenseExpiry || data.driverLicenseExpiry || "—"), // Col 11 (K): License Expiry
      driverLicenseStatusFormula,                                     // Col 12 (L): License Status
      sanitizeCellValue(data.role || data.driverRole || "Driver"),     // Col 13 (M): Registration Type
      sanitizeCellValue(servicesStr),                                 // Col 14 (N): Services Selected
      sanitizeCellValue(data.availability || "Full Time"),            // Col 15 (O): Work Type
      sanitizeCellValue(data.businessName || data.companyName || "—"), // Col 16 (P): Company Name
      formatAsPlainText(data.tradeLicenseNumber || data.tradeLicense || "—"), // Col 17 (Q): Trade Lic No.
      sanitizeCellValue(data.officeAddress || "—"),                   // Col 18 (R): Office Address
      formatAsPlainText(payoutStr),                                   // Col 19 (S): Payment Method
      tLicLink,                                                       // Col 20 (T): Trade Lic Doc
      sanitizeCellValue(c1ModelPlate),                                // Col 21 (U): Car 1 Model & Plate
      sanitizeCellValue(c1Details),                                   // Col 22 (V): Car 1 Year, Seats, Fuel
      sanitizeCellValue(c1Fit),                                       // Col 23 (W): Car 1 Fit Expiry
      c1Docs,                                                         // Col 24 (X): Car 1 Blue Book Docs
      sanitizeCellValue(c2ModelPlate),                                // Col 25 (Y): Car 2 Model & Plate
      sanitizeCellValue(c2Details),                                   // Col 26 (Z): Car 2 Year, Seats, Fuel
      sanitizeCellValue(c2Fit),                                       // Col 27 (AA): Car 2 Fit Expiry
      c2Docs,                                                         // Col 28 (AB): Car 2 Blue Book Docs
      sanitizeCellValue(c3ModelPlate),                                // Col 29 (AC): Car 3 Model & Plate
      sanitizeCellValue(c3Details),                                   // Col 30 (AD): Car 3 Year, Seats, Fuel
      sanitizeCellValue(c3Fit),                                       // Col 31 (AE): Car 3 Fit Expiry
      c3Docs,                                                         // Col 32 (AF): Car 3 Blue Book Docs
      sanitizeCellValue(d1NamePhone),                                 // Col 33 (AG): Driver 1 Name & Phone
      sanitizeCellValue(d1NidLic),                                    // Col 34 (AH): Driver 1 NID & Lic
      d1Docs,                                                         // Col 35 (AI): Driver 1 Docs
      sanitizeCellValue(d2NamePhone),                                 // Col 36 (AJ): Driver 2 Name & Phone
      sanitizeCellValue(d2NidLic),                                    // Col 37 (AK): Driver 2 NID & Lic
      d2Docs,                                                         // Col 38 (AL): Driver 2 Docs
      sanitizeCellValue(d3NamePhone),                                 // Col 39 (AM): Driver 3 Name & Phone
      sanitizeCellValue(d3NidLic),                                    // Col 40 (AN): Driver 3 NID & Lic
      d3Docs,                                                         // Col 41 (AO): Driver 3 Docs
      photoFormula,                                                   // Col 42 (AP): Photo
      driverLicFrontFormula,                                          // Col 43 (AQ): Solo Lic Front
      driverLicBackFormula,                                           // Col 44 (AR): Solo Lic Back
      nidFrontFormula,                                                // Col 45 (AS): Owner NID Front
      nidBackFormula,                                                 // Col 46 (AT): Owner NID Back
      sanitizeCellValue(vehicleStr),                                  // Col 47 (AU): Full Manifest
      sanitizeCellValue(data.status || "Pending Verification"),       // Col 48 (AV): Status
      docCompletenessFormula,                                         // Col 49 (AW): Doc Completeness
      sanitizeCellValue(auditTrackerStr),                             // Col 50 (AX): Duplicate Check
      sanitizeCellValue(resubmissionNotesStr),                        // Col 51 (AY): Notes
      ""                                                              // Col 52 (AZ): Verified By & Time
    ];

    sheet.appendRow(row);`;

  content = content.replace(doPostRowPattern, newDoPostRow);

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully installed 52-column sub-column architecture into:', file);
});

