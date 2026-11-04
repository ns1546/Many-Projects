const fs = require('fs');

console.log('=== SIMPLIFYING LANGUAGE ACROSS GOOGLE APPS SCRIPT & WEB FORMS ===\n');

// 1. UPDATE GOOGLE APPS SCRIPT FILES
const gsFiles = ['google_sheet_webhook.gs', 'netlify-driver-portal/google_sheet_webhook.gs'];

gsFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Replace Global Config Tab Names with Easy English
  code = code.replace(
    'var FOLDER_NAME = "Rownaa Chauffeur Documents";\nvar BACKUP_FOLDER_NAME = "Rownaa Operations Daily Backups";\nvar SHEET_REGISTRY_NAME = "Chauffeur Registry";\nvar SHEET_FLEET_SERVICES_NAME = "Rental Fleet Services";\nvar SHEET_VEHICLES_VAULT_NAME = "Fleet Vehicle Vault";\nvar SHEET_FLEET_DRIVERS_NAME = "Fleet Driver Roster";\nvar SHEET_DASHBOARD_NAME = "Operations KPI Dashboard";',
    'var FOLDER_NAME = "Rownaa Driver Documents";\nvar BACKUP_FOLDER_NAME = "Rownaa Daily Backups";\nvar SHEET_REGISTRY_NAME = "All Registrations"; // (Main Sheet with All Drivers & Cars)\nvar SHEET_FLEET_SERVICES_NAME = "Rental Companies";\nvar SHEET_VEHICLES_VAULT_NAME = "Cars List";\nvar SHEET_FLEET_DRIVERS_NAME = "Drivers List";\nvar SHEET_DASHBOARD_NAME = "Dashboard";'
  );

  // Update Toolbar Menu with Easy English
  const oldMenuRegex = /ui\.createMenu\("⚡ Rownaa Operations"\)[\s\S]*?\.addToUi\(\);/;
  const newMenu = `ui.createMenu("⚡ Rownaa Driver & Car Manager")
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
    .addToUi();`;
  code = code.replace(oldMenuRegex, newMenu);

  // Update headers in autoAlignAndRepairSheet
  const oldHeadersPattern = /var headers = \[\s*"Timestamp",\s*"Application ID",[\s\S]*?"Verification Time"\s*\];/;
  const newHeaders = `var headers = [
    "Timestamp",                       // Col A (1)
    "Application ID",                  // Col B (2)
    "Full Name",                       // Col C (3)
    "Phone (WhatsApp)",                // Col D (4)
    "💬 1-Click WhatsApp",              // Col E (5)
    "NID Number",                      // Col F (6)
    "City / District",                 // Col G (7)
    "Emergency Contact",               // Col H (8)
    "Driver License No. (BRTA)",       // Col I (9)
    "Driver License Class",            // Col J (10)
    "Driver License Expiry",           // Col K (11)
    "Driver License Status",           // Col L (12)
    "Car Plate Number",                // Col M (13)
    "Car Model & Make",                // Col N (14)
    "Car Fitness Expiry",              // Col O (15)
    "Experience",                      // Col P (16)
    "Languages",                       // Col Q (17)
    "Services Selected",               // Col R (18)
    "Work Type (Full/Part Time)",      // Col S (19)
    "Registration Type",               // Col T (20)
    "Car & Driver Details",            // Col U (21)
    "Payment Method (bKash / Bank)",   // Col V (22)
    "Approval Status",                 // Col W (23)
    "Document Status",                 // Col X (24)
    "Driver Photo",                    // Col Y (25)
    "Driver License (Front)",          // Col Z (26)
    "Driver License (Back)",           // Col AA (27)
    "Car Registration (Front)",        // Col AB (28)
    "Car Registration (Back)",         // Col AC (29)
    "Car Fitness Paper",               // Col AD (30)
    "NID (Front)",                     // Col AE (31)
    "NID (Back)",                      // Col AF (32)
    "Duplicate Check",                 // Col AG (33)
    "Correction / Repeat Notes",       // Col AH (34)
    "Verified By",                     // Col AI (35)
    "Verification Time"                // Col AJ (36)
  ];`;
  code = code.replace(oldHeadersPattern, newHeaders);

  // Auto-migrate legacy sheet names smoothly
  if (!code.includes('var legacyReg = ss.getSheetByName("Chauffeur Registry");')) {
    code = code.replace(
      'var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);\n  if (!sheet) {',
      `var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME);
  if (!sheet) {
    var legacyReg = ss.getSheetByName("Chauffeur Registry");
    if (legacyReg) {
      legacyReg.setName(SHEET_REGISTRY_NAME);
      sheet = legacyReg;
    }
  }
  if (!sheet) {`
    );
  }

  // Update audit tracking tags with easy English
  code = code.replace(
    'auditTrackerStr = "🔄 RESUBMISSION [Iteration #"',
    'auditTrackerStr = "🔄 Repeat / Correction [Iteration #"'
  );
  code = code.replace(
    'auditTrackerStr = "⚠️ DUPLICATE SUBMISSION [Iteration #"',
    'auditTrackerStr = "⚠️ Repeat Application [Iteration #"'
  );
  code = code.replace(
    'auditTrackerStr = "✅ UNIQUE (First-Time Applicant)";',
    'auditTrackerStr = "✅ First-Time Application";'
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log('Updated easy English in:', file);
});

// 2. UPDATE HTML FRONTEND FILES
const htmlFiles = [
  'driver-register.html',
  'netlify-driver-portal/index.html',
  'Rownaa-Frontend-Netlify/driver-register.html'
];

htmlFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  // Replace page header and titles
  html = html.replace('Drive with Rownaa® — Bangladesh Premier Chauffeur Network', 'Drive with Rownaa® — Driver & Car Registration');
  html = html.replace('Elite Chauffeur Network · Bangladesh', 'Driver & Car Registration · Bangladesh');
  html = html.replace('VIP Chauffeur Application', 'Driver & Car Registration');

  // Replace Step 4 Title and Descs
  html = html.replace('4. Chauffeur Role, Payout Wallet & Fleet Info', '4. Driver Role, Payment & Car Details');
  html = html.replace('Specify your employment mode, register multiple fleet vehicles or chauffeurs, and configure payout preferences.', 'Choose if you have your own car or need a company car, or register multiple cars and your drivers.');

  // Replace Role option 1 (Fleet Chauffeur)
  html = html.replace('<span id="role-opt-1-title">Fleet Chauffeur</span>', '<span id="role-opt-1-title">Driver (Need Company Car)</span>');
  html = html.replace('Professional chauffeur looking to be assigned to a Rownaa Fleet Partner\'s vehicle.', 'Professional driver looking to drive a company car.');

  // Replace Role option 2 (Owner-Driver)
  html = html.replace('<span id="role-opt-2-title">Owner-Driver</span>', '<span id="role-opt-2-title">Driver with Own Car</span>');

  // Replace Role option 3 (Rental Fleet Operator)
  html = html.replace('<span id="role-opt-4-title">Rental Fleet / Car Agency</span>', '<span id="role-opt-4-title">Rental Car Business (Multiple Cars)</span>');
  html = html.replace('Agency or owner with multiple vehicles and employed chauffeurs.', 'Rental company or owner with multiple cars and drivers.');

  // Replace Section headers
  html = html.replace('Rental Car Fleet & Driver Operations', 'Rental Car Business: Register Cars & Drivers');
  html = html.replace('Register your rental agency fleet vehicles and list your employed chauffeurs for centralized dispatch, verified bookings, and consolidated payout management.', 'Register your rental company cars and add your employed drivers for dispatch, bookings, and payments.');
  html = html.replace('1. Registered Fleet Vehicles', '1. Registered Cars');
  html = html.replace('+ Add Another Vehicle', '+ Add Another Car');
  html = html.replace('2. Employed Chauffeurs / Assigned Drivers', '2. Your Employed Drivers');
  html = html.replace('+ Add Another Employed Chauffeur / Driver', '+ Add Another Driver');

  // Replace Step 5 Title and Submit Button
  html = html.replace('5. Verification Documents & Application Review', '5. Upload Documents & Review Summary');
  html = html.replace('Upload clear photographs of your identity documents (Front & Back) and review your application summary.', 'Upload clear photos of your identity documents (Front & Back) and review your summary.');
  html = html.replace('Chauffeur Portrait Photo', 'Driver Photo (Portrait)');
  html = html.replace('Submit Chauffeur Application', 'Submit Registration');

  // Replace I18N objects
  html = html.replace(
    "stepLabels: ['Personal & NID', 'License & Skills', 'Services & Time', 'Role & Payout', 'Documents & Review'],",
    "stepLabels: ['Personal & NID', 'License & Skills', 'Services & Time', 'Role & Car Info', 'Documents & Review'],"
  );
  html = html.replace(
    "mobileStepNames: [\n          'Personal & NID Credentials',\n          'Driving License & Road Expertise',\n          'Preferred Services & Working Hours',\n          'Role, Payout & Fleet Profile',\n          'Document Uploads & Final Affirmation'\n        ],",
    "mobileStepNames: [\n          'Personal Information & NID',\n          'Driving License & Experience',\n          'Services & Working Time',\n          'Role, Payment & Car Details',\n          'Upload Documents & Review'\n        ],"
  );
  html = html.replace(
    "role1Title: 'Fleet Chauffeur',\n        role1Desc: 'Professional chauffeur looking to be assigned to a Rownaa Fleet Partner\\'s vehicle.',",
    "role1Title: 'Driver (Need Company Car)',\n        role1Desc: 'Professional driver looking to drive a company car.',"
  );
  html = html.replace(
    "role4Title: 'Rental Fleet / Agency',\n        role4Desc: 'Register multiple agency vehicles and list your employed chauffeurs.',",
    "role4Title: 'Rental Car Business',\n        role4Desc: 'Register multiple cars and add your employed drivers.',"
  );

  fs.writeFileSync(file, html, 'utf8');
  console.log('Updated easy English in:', file);
});

console.log('\n=== ALL FILES SUCCESSFULLY SIMPLIFIED! ===');
