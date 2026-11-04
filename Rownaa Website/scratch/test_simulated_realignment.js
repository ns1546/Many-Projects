// Comprehensive simulation test for realignAndMigrateAllRows
const fs = require('fs');

const legacyRow = [
  "2026-11-04T08:17:37.294Z", "DRV-U-402909", "Kamrul Islam", "01714029091",
  '=HYPERLINK("https://wa.me/8801714029091", "WA")', "199240290988", "Dhaka (Uttara)", "01811000111",
  "DK-U-402909", "Professional Light", "2027-10-10", "🟢 Valid",
  "6 Years", "English, Bengali", "VIP Protocol Escort", "Full Time", "Fleet Chauffeur",
  "N/A (Rownaa Fleet Provided)", "bKash: 01714029091", "Pending Verification", "⚠️ Incomplete",
  '=HYPERLINK("https://drive.google.com/photo", "View Photo")',
  '=HYPERLINK("https://drive.google.com/licf", "View Lic Front")',
  '=HYPERLINK("https://drive.google.com/licb", "View Lic Back")',
  '=HYPERLINK("https://drive.google.com/nidf", "View NID Front")',
  '=HYPERLINK("https://drive.google.com/nidb", "View NID Back")',
  "✅ UNIQUE (First-Time Applicant)", "—"
];

const modern36Row = [
  "2026-11-04T08:29:46.700Z", "DRV-O-509247", "Jahirul Haque", "01725092472",
  '=HYPERLINK("https://wa.me/8801725092472", "WA")', "198850924777", "Dhaka (Dhanmondi)", "01822000222",
  "DK-O-509247", "Professional Light", "2028-11-04", '=IF(...)',
  "Dhaka Metro GA-21-5092", "Toyota Premio F", "2027-11-04",
  "8 Years", "English, Bengali", "VIP Protocol Escort", "full_time", "Owner-Driver",
  "Toyota Premio F [Dhaka Metro GA-21-5092] (4 Seats, 2021)", "Dutch Bangla Bank", "Pending Verification",
  '=IF(...)',
  '=HYPERLINK("https://drive.google.com/photo", "Photo")',
  '=HYPERLINK("https://drive.google.com/licf", "Lic Front")',
  '=HYPERLINK("https://drive.google.com/licb", "Lic Back")',
  '=HYPERLINK("https://drive.google.com/carf", "Car Lic Front")',
  '=HYPERLINK("https://drive.google.com/carb", "Car Lic Back")',
  '=HYPERLINK("https://drive.google.com/carfit", "Car Fit Doc")',
  '=HYPERLINK("https://drive.google.com/nidf", "NID Front")',
  '=HYPERLINK("https://drive.google.com/nidb", "NID Back")',
  "✅ UNIQUE", "—", "", ""
];

const blankRow = [
  "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
];

function simulateRealignment(rawRows) {
  var newValues = [];

  for (var i = 0; i < rawRows.length; i++) {
    var r = rawRows[i];
    var rowNum = newValues.length + 2;

    // Filter out completely blank ghost rows
    var hasContent = false;
    for (var k = 0; k < Math.min(r.length, 8); k++) {
      if (r[k] && String(r[k]).trim() !== "") { hasContent = true; break; }
    }
    if (!hasContent) continue;

    var col19Str = String(r[19] || "").trim(); // Col T
    var col22Str = String(r[22] || "").trim(); // Col W
    var isStatusInCol19 = /Pending|Approved|Review|Contacted|Rejected/i.test(col19Str);
    var isRoleInCol19 = /Fleet|Owner|Rental|Chauffeur/i.test(col19Str);

    var aligned = new Array(36).fill("");

    // Baseline fields (Cols 1..8)
    aligned[0] = r[0]; // Timestamp
    aligned[1] = r[1] ? "'" + String(r[1]).replace(/^'/, "") : ""; // App ID
    aligned[2] = r[2] || ""; // Name

    var rawPhone = String(r[3] || "").trim().replace(/^'/, "");
    if (rawPhone.length === 10 && rawPhone.startsWith("1")) rawPhone = "0" + rawPhone;
    aligned[3] = rawPhone ? "'" + rawPhone : "";

    // WhatsApp formula in Col E (idx 4)
    var cleanDigits = rawPhone.replace(/[^0-9]/g, "");
    if (cleanDigits.startsWith("0")) cleanDigits = "880" + cleanDigits.substring(1);
    else if (!cleanDigits.startsWith("880") && cleanDigits.length === 10) cleanDigits = "880" + cleanDigits;
    var nameForWa = r[2] || "Chauffeur";
    if (cleanDigits.length >= 10) {
      aligned[4] = '=HYPERLINK("https://wa.me/' + cleanDigits + '?text=' + encodeURIComponent("Hello " + nameForWa + ", this is Rownaa Executive Fleet Operations.") + '", "🟢 Chat on WhatsApp")';
    } else {
      aligned[4] = "—";
    }

    aligned[5] = r[5] ? "'" + String(r[5]).replace(/^'/, "") : ""; // NID
    aligned[6] = r[6] || ""; // District
    aligned[7] = r[7] ? String(r[7]).replace(/^'/, "") : ""; // Emergency

    if (isStatusInCol19 && !isRoleInCol19) {
      // -----------------------------------------------------------------
      // CASE A: LEGACY 28-COLUMN ROW (Migrate accurately to 36 columns)
      // -----------------------------------------------------------------
      aligned[8] = r[8] ? "'" + String(r[8]).replace(/^'/, "") : ""; // Col I: Driver License No
      aligned[9] = r[9] || "Professional Light"; // Col J: Driver License Class
      aligned[10] = r[10] || "—"; // Col K: Driver License Expiry
      aligned[11] = '=IF(K' + rowNum + '="—", "—", IF(ISDATE(K' + rowNum + '), IF(K' + rowNum + '<TODAY(), "🔴 Expired", IF(K' + rowNum + '<TODAY()+60, "🟡 Expiring Soon", "🟢 Valid")), "🟢 Active"))';

      var legRole = String(r[16] || "Fleet Chauffeur").trim();
      var legVeh = String(r[17] || "N/A (Rownaa Fleet Provided)").trim();
      var extPlate = "N/A (Fleet Chauffeur)";
      var extModel = "N/A (Fleet Chauffeur)";
      if (legRole === "Owner-Driver" || legVeh.includes("[")) {
        var pm = legVeh.match(/\[(.*?)\]/);
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
      aligned[23] = '=IF(AND(Y' + rowNum + '<>"", Z' + rowNum + '<>"", AE' + rowNum + '<>""), "🟢 Complete", "⚠️ Incomplete")';

      aligned[24] = r[21] || "—"; // Col Y (25): Photo
      aligned[25] = r[22] || "—"; // Col Z (26): Driver Lic Front
      aligned[26] = r[23] || "—"; // Col AA (27): Driver Lic Back
      aligned[27] = "—";          // Col AB (28): Car Lic Front
      aligned[28] = "—";          // Col AC (29): Car Lic Back
      aligned[29] = "—";          // Col AD (30): Car Fitness Doc
      aligned[30] = r[24] || "—"; // Col AE (31): NID Front
      aligned[31] = r[25] || "—"; // Col AF (32): NID Back
      aligned[32] = r[26] || "✅ UNIQUE (Legacy Migrated)"; // Col AG (33): Tracker
      aligned[33] = r[27] || "—"; // Col AH (34): Notes
      aligned[34] = "";           // Col AI (35): Verified By
      aligned[35] = "";           // Col AJ (36): Verified Time
    } else {
      // -----------------------------------------------------------------
      // CASE B: 36-COLUMN DUAL-LICENSE ROW
      // -----------------------------------------------------------------
      aligned[8] = r[8] ? "'" + String(r[8]).replace(/^'/, "") : ""; // Col I
      aligned[9] = r[9] || "Professional Light"; // Col J
      aligned[10] = r[10] || "—"; // Col K
      aligned[11] = '=IF(K' + rowNum + '="—", "—", IF(ISDATE(K' + rowNum + '), IF(K' + rowNum + '<TODAY(), "🔴 Expired", IF(K' + rowNum + '<TODAY()+60, "🟡 Expiring Soon", "🟢 Valid")), "🟢 Active"))';
      aligned[12] = r[12] ? "'" + String(r[12]).replace(/^'/, "") : ""; // Col M: Plate
      aligned[13] = r[13] || ""; // Col N: Model
      aligned[14] = r[14] || ""; // Col O: Fitness
      aligned[15] = r[15] || ""; // Col P: Experience
      aligned[16] = r[16] || ""; // Col Q: Languages
      aligned[17] = r[17] || ""; // Col R: Services
      aligned[18] = r[18] || "Full Time"; // Col S: Availability
      aligned[19] = r[19] || "Fleet Chauffeur"; // Col T: Role
      aligned[20] = r[20] || ""; // Col U: Vehicle
      aligned[21] = r[21] ? "'" + String(r[21]).replace(/^'/, "") : ""; // Col V: Payout
      aligned[22] = r[22] || "Pending Verification"; // Col W: Status
      aligned[23] = '=IF(AND(Y' + rowNum + '<>"", Z' + rowNum + '<>"", AE' + rowNum + '<>""), "🟢 Complete", "⚠️ Incomplete")';

      for (var colIdx = 24; colIdx <= 31; colIdx++) {
        aligned[colIdx] = r[colIdx] || "—";
      }
      aligned[32] = r[32] || "✅ UNIQUE (First-Time Applicant)";
      aligned[33] = r[33] || "—";
      aligned[34] = r[34] || "";
      aligned[35] = r[35] || "";
    }

    newValues.push(aligned);
  }

  return newValues;
}

const inputRows = [legacyRow, blankRow, modern36Row];
const result = simulateRealignment(inputRows);

console.log('Total migrated rows (excluding blank):', result.length);
console.log('Row 0 (Migrated Legacy) - Col M (Plate):', result[0][12]);
console.log('Row 0 (Migrated Legacy) - Col P (Exp):', result[0][15]);
console.log('Row 0 (Migrated Legacy) - Col T (Role):', result[0][19]);
console.log('Row 0 (Migrated Legacy) - Col W (Status):', result[0][22]);
console.log('Row 0 (Migrated Legacy) - Col Z (Lic Front):', result[0][25]);

console.log('\nRow 1 (Modern 36) - Col M (Plate):', result[1][12]);
console.log('Row 1 (Modern 36) - Col P (Exp):', result[1][15]);
console.log('Row 1 (Modern 36) - Col T (Role):', result[1][19]);
console.log('Row 1 (Modern 36) - Col W (Status):', result[1][22]);
console.log('Row 1 (Modern 36) - Col AB (Car Lic Front):', result[1][27]);

if (result.length === 2 &&
    result[0][15] === "6 Years" && result[0][19] === "Fleet Chauffeur" && result[0][22] === "Pending Verification" &&
    result[1][12] === "'Dhaka Metro GA-21-5092" && result[1][19] === "Owner-Driver" && result[1][22] === "Pending Verification") {
  console.log('\n✅ 100% SUCCESSFUL: ALL ROWS PERFECTLY MIGRATED AND ALIGNED!');
} else {
  console.error('\n❌ FAILURE IN REALIGNMENT SIMULATION!');
  process.exit(1);
}

