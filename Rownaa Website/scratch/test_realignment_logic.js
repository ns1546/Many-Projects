// Test script to verify realignment logic on both 28-column and 36-column rows

const sample28Row = [
  "2026-11-04T08:17:37.294Z", // 0: Timestamp
  "DRV-U-402909",            // 1: ID
  "Kamrul Islam",             // 2: Name
  "01714029091",              // 3: Phone
  '=HYPERLINK("...", "WA")',  // 4: WA
  "199240290988",             // 5: NID
  "Dhaka (Uttara)",           // 6: District
  1811000111,                 // 7: Emergency
  "DK-U-402909",              // 8: Lic No
  "Professional Light",       // 9: Lic Class
  "—",                        // 10: Lic Expiry
  "—",                        // 11: Lic Status
  "6 Years",                  // 12: Experience (Old Col M)
  "English, Bengali",         // 13: Languages (Old Col N)
  "VIP Protocol Escort",      // 14: Services (Old Col O)
  "Full Time",                // 15: Availability (Old Col P)
  "Fleet Chauffeur",          // 16: Role (Old Col Q)
  "N/A (Rownaa Fleet Provided)", // 17: Vehicle (Old Col R)
  "bKash: 01714029091",       // 18: Payout (Old Col S)
  "Pending Verification",     // 19: Status (Old Col T)
  "⚠️ Incomplete",             // 20: Completeness (Old Col U)
  "https://photo.url",        // 21: Photo (Old Col V)
  "https://licf.url",         // 22: Lic Front (Old Col W)
  "https://licb.url",         // 23: Lic Back (Old Col X)
  "https://nidf.url",         // 24: NID Front (Old Col Y)
  "https://nidb.url",         // 25: NID Back (Old Col Z)
  "✅ UNIQUE",                 // 26: Admin Tracker
  "—"                         // 27: Notes
];

const sample36Row = [
  "2026-11-04T08:29:46.700Z", // 0: Timestamp
  "DRV-RSB-7634",            // 1: ID
  "Jahirul Haque",            // 2: Name
  "01725092472",              // 3: Phone
  '=HYPERLINK("...", "WA")',  // 4: WA
  "198850924777",             // 5: NID
  "Dhaka (Dhanmondi)",        // 6: District
  "01822000222",              // 7: Emergency
  "DK-O-509247",              // 8: Driver Lic No (Col I)
  "Professional Light",       // 9: Driver Lic Class (Col J)
  "2028-11-04",               // 10: Driver Lic Expiry (Col K)
  "🟢 Valid",                 // 11: Driver Lic Status (Col L)
  "Dhaka Metro GA-21-5092",   // 12: Car Plate No (Col M)
  "Toyota Premio F",          // 13: Car Model (Col N)
  "2027-11-04",               // 14: Car Fitness Expiry (Col O)
  "8 Years",                  // 15: Experience (Col P)
  "English, Bengali",         // 16: Languages (Col Q)
  "VIP Protocol Escort",      // 17: Services (Col R)
  "full_time",                // 18: Availability (Col S)
  "Owner-Driver",             // 19: Role Type (Col T)
  "Toyota Premio F [Dhaka Metro GA-21-5092] (4 Seats, 2021)", // 20: Vehicle (Col U)
  "Dutch Bangla Bank",        // 21: Payout (Col V)
  "Pending Verification",     // 22: Status (Col W)
  "🟢 Complete",              // 23: Completeness (Col X)
  "https://photo.url",        // 24: Photo (Col Y)
  "https://licf.url",         // 25: Driver Lic Front (Col Z)
  "https://licb.url",         // 26: Driver Lic Back (Col AA)
  "https://carf.url",         // 27: Car Lic Front (Col AB)
  "https://carb.url",         // 28: Car Lic Back (Col AC)
  "https://carfit.url",       // 29: Car Fitness Doc (Col AD)
  "https://nidf.url",         // 30: NID Front (Col AE)
  "https://nidb.url",         // 31: NID Back (Col AF)
  "🔄 RESUBMISSION",          // 32: Tracker (Col AG)
  "Corrected fitness date",   // 33: Notes (Col AH)
  "",                         // 34: Verified By (Col AI)
  ""                          // 35: Verified Time (Col AJ)
];

function migrateRow(r, i) {
  var col19Str = String(r[19] || "").trim(); // Col T
  var col22Str = String(r[22] || "").trim(); // Col W
  var isStatusInCol19 = /Pending|Approved|Review|Contacted|Rejected/i.test(col19Str);
  var isRoleInCol19 = /Fleet|Owner|Rental|Chauffeur/i.test(col19Str);

  var aligned = new Array(36).fill("");
  aligned[0] = r[0]; // Timestamp
  aligned[1] = r[1]; // App ID
  aligned[2] = r[2]; // Name
  aligned[3] = "'" + String(r[3] || "").replace(/^'/, ""); // Phone
  aligned[4] = r[4]; // WA
  aligned[5] = "'" + String(r[5] || "").replace(/^'/, ""); // NID
  aligned[6] = r[6]; // District
  aligned[7] = r[7]; // Emergency

  if (isStatusInCol19 && !isRoleInCol19) {
    // Legacy 28-col row
    aligned[8] = "'" + String(r[8] || "").replace(/^'/, ""); // Driver Lic No
    aligned[9] = r[9] || "Professional Light"; // Driver Lic Class
    aligned[10] = r[10] || "—"; // Driver Lic Expiry
    aligned[11] = r[11] || "🟢 Active"; // Driver Lic Status

    var legRole = String(r[16] || "Fleet Chauffeur").trim();
    var legVeh = String(r[17] || "N/A (Rownaa Fleet Provided)").trim();
    var extPlate = "N/A (Fleet Chauffeur)";
    var extModel = "N/A (Fleet Chauffeur)";
    if (legRole === "Owner-Driver" || legVeh.includes("[")) {
      var pm = legVeh.match(/\[(.*?)\]/);
      if (pm) extPlate = pm[1];
      extModel = legVeh.split("[")[0].trim() || legVeh;
    }
    aligned[12] = "'" + extPlate; // Col M: Car Plate
    aligned[13] = extModel;       // Col N: Car Model
    aligned[14] = "N/A";          // Col O: Fitness Expiry
    aligned[15] = r[12] || "";    // Col P: Experience
    aligned[16] = r[13] || "";    // Col Q: Languages
    aligned[17] = r[14] || "";    // Col R: Services
    aligned[18] = r[15] || "Full Time"; // Col S: Availability
    aligned[19] = legRole;        // Col T: Role Type
    aligned[20] = legVeh;         // Col U: Vehicle Profile
    aligned[21] = "'" + String(r[18] || "").replace(/^'/, ""); // Col V: Payout
    aligned[22] = r[19] || "Pending Verification"; // Col W: Status
    aligned[23] = r[20] || "⚠️ Incomplete"; // Col X: Doc Completeness
    aligned[24] = r[21] || "—"; // Col Y: Photo Doc
    aligned[25] = r[22] || "—"; // Col Z: Driver Lic Front
    aligned[26] = r[23] || "—"; // Col AA: Driver Lic Back
    aligned[27] = "—";          // Col AB: Car Lic Front
    aligned[28] = "—";          // Col AC: Car Lic Back
    aligned[29] = "—";          // Col AD: Car Fitness Doc
    aligned[30] = r[24] || "—"; // Col AE: NID Front
    aligned[31] = r[25] || "—"; // Col AF: NID Back
    aligned[32] = r[26] || "✅ UNIQUE (Legacy Migrated)"; // Col AG: Tracker
    aligned[33] = r[27] || "—"; // Col AH: Notes
    aligned[34] = "";
    aligned[35] = "";
  } else {
    // Already 36-column
    for (var j = 8; j < 36; j++) {
      aligned[j] = r[j] !== undefined ? r[j] : "";
    }
  }
  return aligned;
}

const migrated28 = migrateRow(sample28Row, 0);
const migrated36 = migrateRow(sample36Row, 1);

console.log('Migrated 28-col row length:', migrated28.length);
console.log('Col M (Car Plate):', migrated28[12]);
console.log('Col P (Experience):', migrated28[15]);
console.log('Col T (Role Type):', migrated28[19]);
console.log('Col W (Status):', migrated28[22]);

console.log('\nMigrated 36-col row length:', migrated36.length);
console.log('Col M (Car Plate):', migrated36[12]);
console.log('Col P (Experience):', migrated36[15]);
console.log('Col T (Role Type):', migrated36[19]);
console.log('Col W (Status):', migrated36[22]);

if (migrated28[15] === "6 Years" && migrated28[19] === "Fleet Chauffeur" && migrated28[22] === "Pending Verification" &&
    migrated36[12] === "Dhaka Metro GA-21-5092" && migrated36[19] === "Owner-Driver" && migrated36[22] === "Pending Verification") {
  console.log('\nSUCCESS! REALIGNMENT LOGIC PERFECTLY ALIGNS BOTH LEGACY AND DUAL-LICENSE ROWS!');
} else {
  console.error('\nFAILURE IN REALIGNMENT LOGIC!');
  process.exit(1);
}

