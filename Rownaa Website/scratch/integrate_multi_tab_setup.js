// Script to build the Enterprise Multi-Tab Architecture for google_sheet_webhook.gs
const fs = require('fs');

console.log('Building Enterprise Multi-Tab Google Sheet Webhook...');

// Read current google_sheet_webhook.gs
let content = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

// Update global config constants
const oldGlobals = `var FOLDER_NAME = "Rownaa Chauffeur Documents";
var BACKUP_FOLDER_NAME = "Rownaa Operations Daily Backups";
var SHEET_REGISTRY_NAME = "Chauffeur Registry";
var SHEET_DASHBOARD_NAME = "Operations KPI Dashboard";
var MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB security ceiling`;

const newGlobals = `var FOLDER_NAME = "Rownaa Chauffeur Documents";
var BACKUP_FOLDER_NAME = "Rownaa Operations Daily Backups";
var SHEET_REGISTRY_NAME = "Chauffeur Registry";
var SHEET_FLEET_SERVICES_NAME = "Rental Fleet Services";
var SHEET_VEHICLES_VAULT_NAME = "Fleet Vehicle Vault";
var SHEET_FLEET_DRIVERS_NAME = "Fleet Driver Roster";
var SHEET_DASHBOARD_NAME = "Operations KPI Dashboard";
var MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10MB security ceiling`;

content = content.replace(oldGlobals, newGlobals);

// Now let's define the Multi-Tab Setup function:
const multiTabSetupCode = `
/**
 * Master Enterprise Relational Tabs Setup:
 * 1. Chauffeur Registry (Solo Chauffeurs & Solo Owner-Drivers) - 36 Columns
 * 2. Rental Fleet Services (Fleet Businesses & Service Owners) - 21 Columns
 * 3. Fleet Vehicle Vault (Dedicated row for every single vehicle) - 19 Columns
 * 4. Fleet Driver Roster (Dedicated row for every employed driver) - 20 Columns
 * 5. Operations KPI Dashboard (Executive BI Control Center)
 */
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
`;

// Insert multiTabSetupCode right after autoAlignAndRepairSheet
content = content.replace(
  'function setupSheet() {\n  return autoAlignAndRepairSheet(false);\n}',
  multiTabSetupCode + '\n\nfunction setupSheet() {\n  autoAlignAndRepairSheet(false);\n  setupMultiTabRelationalDatabase();\n}'
);

fs.writeFileSync('google_sheet_webhook.gs', content, 'utf8');
fs.writeFileSync('netlify-driver-portal/google_sheet_webhook.gs', content, 'utf8');
console.log('Multi-tab database setup added to webhook scripts.');
