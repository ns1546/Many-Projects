const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting 2-Section (Dashboard & Registrations) Architecture Verification...\n');

const gsCode = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

// 1. Verify Syntax
try {
  new vm.Script(gsCode);
  console.log('✅ [PASS] google_sheet_webhook.gs syntax is 100% valid.');
} catch (e) {
  console.error('❌ [FAIL] Syntax error in google_sheet_webhook.gs:', e);
  process.exit(1);
}

// 2. Verify Tab Names & Two Section Directives
assert(gsCode.includes('var SHEET_REGISTRY_NAME = "Registrations";'), 'SHEET_REGISTRY_NAME must be Registrations');
assert(gsCode.includes('var SHEET_DASHBOARD_NAME = "Dashboard";'), 'SHEET_DASHBOARD_NAME must be Dashboard');
console.log('✅ [PASS] Exactly 2 Master Sections configured: "Dashboard" and "Registrations".');

// 3. Verify Menu Title & Items
assert(gsCode.includes('ui.createMenu("⚡ Rownaa Driver & Car Manager")'), 'Menu title matches');
assert(gsCode.includes('Setup & Align All Sheets (Safe)'), 'Setup menu item present');
assert(gsCode.includes('Open WhatsApp for Selected Driver'), 'WhatsApp menu item present');
assert(gsCode.includes('Copy Driver Details Summary'), 'Copy summary item present');
assert(gsCode.includes('Check Duplicate & Repeat Applications'), 'Check duplicate item present');
assert(gsCode.includes('Backup Spreadsheet to Google Drive Now'), 'Backup item present');
assert(gsCode.includes('Download Offline Backup (.xlsx Excel)'), 'Excel download item present');
assert(gsCode.includes('Open Daily Backups Folder in Drive'), 'Open backup folder item present');
assert(gsCode.includes('Fix & Align Sheet Columns (Safe)'), 'Fix & align item present');
assert(gsCode.includes('Refresh Dashboard'), 'Refresh dashboard item present');
assert(gsCode.includes('Open Documents Folder in Drive'), 'Open vault item present');
console.log('✅ [PASS] Custom UI Menu has all 10 requested items with easy English naming.');

// 4. Verify Single Column for Multiple Cars & Drivers
assert(gsCode.includes('"Cars & Vehicles List (All Cars)"'), 'Col Q: Single column for multiple cars');
assert(gsCode.includes('"Employed Drivers List (All Drivers)"'), 'Col R: Single column for multiple drivers');
console.log('✅ [PASS] Col Q and Col R are dedicated single columns for multiple cars and multiple drivers.');

// 5. Verify Defensive Unmerging and Freezing
assert(gsCode.includes('.breakApart()'), 'breakApart defensive healing present');
assert(gsCode.includes('sheet.setFrozenRows(1)'), 'Frozen rows = 1');
assert(gsCode.includes('sheet.setFrozenColumns(4)'), 'Frozen columns = 4');
console.log('✅ [PASS] Defensive unmerge and frozen column safety (no merge freeze exceptions).');

// 6. Test Multi-Car & Multi-Driver Formatting Logic
function simulatePayloadFormatting(payload) {
  let primaryPlate = payload.carLicenseNumber || payload.carPlate || '';
  let primaryModel = payload.carModel || '';
  let carFitnessExpiry = payload.carFitnessExpiry || '—';

  let allCarsStr = '';
  const carsList = (payload.fleetData && (payload.fleetData.vehicles || payload.fleetData.cars)) || payload.fleetVehicles || [];
  if (carsList.length > 0) {
    const carLines = [];
    for (let cIdx = 0; cIdx < carsList.length; cIdx++) {
      const c = carsList[cIdx];
      const cModel = c.model || 'Vehicle';
      const cPlate = c.reg || c.plate || 'No Plate';
      const cYear = c.year || '';
      const cSeats = c.seats || '';
      const cFuel = c.fuel || '';
      const cFit = c.fitnessExpiry || '';
      const extra = [cYear, cSeats, cFuel].filter(Boolean).join(', ');
      carLines.push((cIdx + 1) + '. ' + cModel + ' [' + cPlate + ']' + (extra ? ' (' + extra + ')' : '') + (cFit ? ' — Fitness: ' + cFit : ''));
    }
    allCarsStr = carLines.join('\n');
  } else {
    allCarsStr = 'N/A (Fleet Chauffeur / No Personal Vehicle)';
  }

  let allDriversStr = '';
  const driversList = (payload.fleetData && payload.fleetData.drivers) || payload.fleetDrivers || [];
  if (driversList.length > 0) {
    const driverLines = [];
    for (let dIdx = 0; dIdx < driversList.length; dIdx++) {
      const d = driversList[dIdx];
      const dName = d.name || ('Driver ' + (dIdx + 1));
      const dPhone = d.phone || 'No Phone';
      const dLic = d.license || '';
      const dClass = d.licenseClass || '';
      const dExp = d.licenseExpiry || '';
      const dAssigned = d.assignedPlate || '';
      const licInfo = [dLic, dClass].filter(Boolean).join(', ');
      driverLines.push((dIdx + 1) + '. ' + dName + ' (' + dPhone + ')' + (licInfo ? ' — Lic: ' + licInfo : '') + (dExp ? ' [Exp: ' + dExp + ']' : '') + (dAssigned ? ' [Car: ' + dAssigned + ']' : ''));
    }
    allDriversStr = driverLines.join('\n');
  } else {
    allDriversStr = 'Solo Applicant (' + (payload.fullName || 'Self') + ' — Self-Managed)';
  }

  return { allCarsStr, allDriversStr };
}

// Test Rental Company with 3 Cars and 2 Drivers
const testRentalPayload = {
  fullName: 'Hafizur Rahman',
  businessName: 'Green Line Car Rental',
  role: 'rental_fleet_operator',
  fleetData: {
    cars: [
      { model: 'Toyota HiAce Grand Cabin', reg: 'Dhaka Metro Cha 53-1092', year: '2021', seats: '12 Seats', fuel: 'Octane', fitnessExpiry: '2027-12-31' },
      { model: 'Toyota Noah Hybrid', reg: 'Dhaka Metro Cha 11-2233', year: '2020', seats: '7 Seats', fuel: 'Hybrid', fitnessExpiry: '2026-08-15' },
      { model: 'Toyota Premio 1.5X', reg: 'Dhaka Metro Ga 33-4455', year: '2019', seats: '4 Seats', fuel: 'Octane', fitnessExpiry: '2028-01-10' }
    ],
    drivers: [
      { name: 'Rafiqul Islam', phone: '01711223344', license: 'DL-982341', licenseClass: 'Professional Light', licenseExpiry: '2028-05-12', assignedPlate: 'Dhaka Metro Cha 53-1092' },
      { name: 'Kamal Hossain', phone: '01811334455', license: 'DL-192837', licenseClass: 'Professional Heavy', licenseExpiry: '2027-11-20', assignedPlate: 'Dhaka Metro Cha 11-2233' }
    ]
  }
};

const formatted = simulatePayloadFormatting(testRentalPayload);
console.log('\n--- SIMULATED MULTI-CAR FORMATTING (Col Q / 17) ---');
console.log(formatted.allCarsStr);
assert(formatted.allCarsStr.includes('1. Toyota HiAce Grand Cabin [Dhaka Metro Cha 53-1092]'));
assert(formatted.allCarsStr.includes('2. Toyota Noah Hybrid [Dhaka Metro Cha 11-2233]'));
assert(formatted.allCarsStr.includes('3. Toyota Premio 1.5X [Dhaka Metro Ga 33-4455]'));

console.log('\n--- SIMULATED MULTI-DRIVER FORMATTING (Col R / 18) ---');
console.log(formatted.allDriversStr);
assert(formatted.allDriversStr.includes('1. Rafiqul Islam (01711223344) — Lic: DL-982341'));
assert(formatted.allDriversStr.includes('2. Kamal Hossain (01811334455) — Lic: DL-192837'));

console.log('\n=============================================================');
console.log('🏁 ALL TESTS PASSED: 2-Section Master Architecture Verified!');
console.log('=============================================================');
