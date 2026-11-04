const fs = require('fs');
const vm = require('vm');

let content = fs.readFileSync('scratch/build_clean_2tab_webhook.js', 'utf8');

// 1. Update headers list to include Col 34: 📂 All Documents Vault (Drive Folder)
const oldHeaders = `  var headers = [
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
    "Admin Tracker & Audit",                  // Col AH (34) - Duplicate & Resubmission Iteration
    "Resubmission Notes & Reasons",           // Col AI (35) - Applicant correction notes
    "Verified By (Operator)",                 // Col AJ (36) - Auto Operator onEdit
    "Verification Time"                       // Col AK (37) - Auto Operator timestamp
  ];`;

const newHeaders = `  var headers = [
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
  ];`;

content = content.replace(oldHeaders, newHeaders);

// 2. Update column checks and array sizes from 37 to 38
content = content.replace(/Ensure at least 37 columns exist/g, 'Ensure at least 38 columns exist');
content = content.replace(/currentCols < 37/g, 'currentCols < 38');
content = content.replace(/insertColumnsAfter\(currentCols, 37 - currentCols\)/g, 'insertColumnsAfter(currentCols, 38 - currentCols)');
content = content.replace(/new Array\(37\)\.fill\(""\)/g, 'new Array(38).fill("")');
content = content.replace(/maxDataCols = Math\.max\(sheet\.getLastColumn\(\), 37\)/g, 'maxDataCols = Math.max(sheet.getLastColumn(), 38)');
content = content.replace(/setValues\(alignedValues\);[\s\S]*?sheet\.getRange\(2, 1, alignedValues\.length, 37\)/g, 'sheet.getRange(2, 1, alignedValues.length, 38)');

// In autoAlignAndRepair loop:
const oldLoopTail = `      // Document Links (Cols Y..AG / 25..33)
      for (var dCol = 24; dCol <= 32; dCol++) {
        aligned[dCol] = f[dCol] || r[dCol] || "—";
      }

      // Audit Tracker (Col AH / 34) & Resubmission Notes (Col AI / 35)
      aligned[33] = r[33] || r[32] || "✅ First-Time Application";
      aligned[34] = r[34] || r[33] || "—";

      // Operator Audit Trail (Cols AJ..AK / 36..37)
      aligned[35] = r[35] || "";
      aligned[36] = r[36] || "";`;

const newLoopTail = `      // Document Links (Cols Y..AG / 25..33)
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
      aligned[37] = r[37] || "";`;

content = content.replace(oldLoopTail, newLoopTail);

// Update widths array in autoAlignAndRepairSheet
const oldWidths = `  var widths = [
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
    240, // 34: Admin Tracker & Audit
    240, // 35: Resubmission Notes
    140, // 36: Verified By
    140  // 37: Verification Time
  ];`;

const newWidths = `  var widths = [
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
  ];`;

content = content.replace(oldWidths, newWidths);

// In doPost: Loop through all cars and drivers to save all multiple documents in applicantFolder
const oldDocSave = `    // 1. SAVE DRIVER IDENTITY & LICENSE DOCUMENTS
    var photoUrl = saveBase64DocumentToDrive(data.photoBase64, "01_driver_portrait.jpg", applicantFolder);
    var driverLicFrontUrl = saveBase64DocumentToDrive(data.licenseFrontBase64 || data.driverLicenseFrontBase64, "02_driver_license_front.jpg", applicantFolder);
    var driverLicBackUrl = saveBase64DocumentToDrive(data.licenseBackBase64 || data.driverLicenseBackBase64, "03_driver_license_back.jpg", applicantFolder);
    var nidFrontUrl = saveBase64DocumentToDrive(data.nidFrontBase64, "04_nid_front.jpg", applicantFolder);
    var nidBackUrl = saveBase64DocumentToDrive(data.nidBackBase64, "05_nid_back.jpg", applicantFolder);

    // 2. SAVE CAR REGISTRATION & TAX/FITNESS DOCUMENTS
    var carLicFrontUrl = saveBase64DocumentToDrive(data.carLicenseFrontBase64 || data.carRegFrontBase64, "06_car_license_registration_front.jpg", applicantFolder);
    var carLicBackUrl = saveBase64DocumentToDrive(data.carLicenseBackBase64 || data.carRegBackBase64, "07_car_license_registration_back.jpg", applicantFolder);
    var carFitnessUrl = saveBase64DocumentToDrive(data.carFitnessBase64 || data.carTaxTokenBase64, "08_car_fitness_tax_token.jpg", applicantFolder);

    // 3. SAVE TRADE LICENSE (FOR RENTAL FLEETS)
    var tradeLicUrl = saveBase64DocumentToDrive(data.tradeLicenseBase64, "09_trade_license_registration.jpg", applicantFolder);

    // Hyperlink Formulas for Documents
    var photoFormula = photoUrl ? '=HYPERLINK("' + photoUrl + '", "🔍 View Photo")' : '—';
    var driverLicFrontFormula = driverLicFrontUrl ? '=HYPERLINK("' + driverLicFrontUrl + '", "📄 Lic Front")' : '—';
    var driverLicBackFormula = driverLicBackUrl ? '=HYPERLINK("' + driverLicBackUrl + '", "📄 Lic Back")' : '—';
    var carLicFrontFormula = carLicFrontUrl ? '=HYPERLINK("' + carLicFrontUrl + '", "🚗 Blue Book Front")' : '—';
    var carLicBackFormula = carLicBackUrl ? '=HYPERLINK("' + carLicBackUrl + '", "🚗 Blue Book Back")' : '—';
    var carFitnessFormula = carFitnessUrl ? '=HYPERLINK("' + carFitnessUrl + '", "📑 Fitness/Tax Doc")' : '—';
    var nidFrontFormula = nidFrontUrl ? '=HYPERLINK("' + nidFrontUrl + '", "🪪 NID Front")' : '—';
    var nidBackFormula = nidBackUrl ? '=HYPERLINK("' + nidBackUrl + '", "🪪 NID Back")' : '—';
    var tradeLicFormula = tradeLicUrl ? '=HYPERLINK("' + tradeLicUrl + '", "🏢 Trade License")' : '—';`;

const newDocSave = `    var totalSavedDocsCount = 0;

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
    var vaultFolderFormula = '=HYPERLINK("' + vaultFolderUrl + '", "📂 Open Vault (' + totalSavedDocsCount + ' Files)")';`;

content = content.replace(oldDocSave, newDocSave);

// In doPost: Update row array to 38 items
const oldRowArr = `    // Construct Flat Row Array (37 Columns)
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
      sanitizeCellValue(auditTrackerStr),                             // Col AH (34): Admin Tracker & Audit
      sanitizeCellValue(resubmissionNotesStr),                        // Col AI (35): Resubmission Notes
      "",                                                             // Col AJ (36): Verified By
      ""                                                              // Col AK (37): Verification Time
    ];`;

const newRowArr = `    // Construct Flat Row Array (38 Columns)
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
    ];`;

content = content.replace(oldRowArr, newRowArr);

// In doPost: Update Audit Tracker Styling cell to Col AI / 35
content = content.replace(/var auditCell = sheet\.getRange\(lastRow, 34\);/g, 'var auditCell = sheet.getRange(lastRow, 35);');

// In onEdit: Update columns to Col AK (37) and Col AL (38)
content = content.replace(/sheet\.getRange\(row, 36\)\.setValue\(operatorEmail\);/g, 'sheet.getRange(row, 37).setValue(operatorEmail);');
content = content.replace(/sheet\.getRange\(row, 37\)\.setValue\(timestampStr\);/g, 'sheet.getRange(row, 38).setValue(timestampStr);');

// Update checkDuplicateAuditLog: maxCols to 38, Col AI is 35 (idx 34)
content = content.replace(/var maxCols = Math\.min\(sheet\.getLastColumn\(\), 37\);/g, 'var maxCols = Math.min(sheet.getLastColumn(), 38);');
content = content.replace(/var auditStatus = String\(r\[33\] \|\| r\[32\] \|\| ""\);/g, 'var auditStatus = String(r[34] || r[33] || "");');
content = content.replace(/var notes = String\(r\[34\] \|\| r\[33\] \|\| ""\);/g, 'var notes = String(r[35] || r[34] || "");');

// Update copyChauffeurSummary
content = content.replace(/• Audit Tracking: " \+ \(r\[33\] \|\| "Unique"\)/g, '• Documents Vault: " + (r[33] || "Drive Folder") + "\\n• Audit Tracking: " + (r[34] || "Unique")');

// Update schemaColumns: 38
content = content.replace(/schemaColumns: 37/g, 'schemaColumns: 38');

fs.writeFileSync('scratch/build_clean_2tab_webhook.js', content, 'utf8');
console.log('Updated scratch/build_clean_2tab_webhook.js for Multi-Document Drive Vault');
