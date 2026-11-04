const fs = require('fs');

let code = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

// 1. Update headers in setupSheet()
const targetHeaders = `    "NID (Front)",            // Col Y (25)
    "NID (Back)",             // Col Z (26)
    "Verified By (Operator)", // Col AA (27)
    "Verification Time"       // Col AB (28)
  ];`;

const repHeaders = `    "NID (Front)",            // Col Y (25)
    "NID (Back)",             // Col Z (26)
    "Admin Tracker & Audit",  // Col AA (27) - Duplicate Detection & Resubmission Flag
    "Resubmission Notes",     // Col AB (28) - Correction details & previous ID
    "Verified By (Operator)", // Col AC (29)
    "Verification Time"       // Col AD (30)
  ];`;

if (!code.includes(targetHeaders)) {
  console.error('targetHeaders not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetHeaders, repHeaders);

// 2. Clear data validations in setupSheet for all 30 columns
const targetValidations = `  // CRITICAL: Clear any legacy data validations from all other columns (especially Column R / 18)
  sheet.getRange(2, 1, 1000, 19).clearDataValidations();
  sheet.getRange(2, 21, 1000, 8).clearDataValidations();`;

const repValidations = `  // CRITICAL: Clear any legacy data validations from all other columns (including Column R / 18 and Audit cols)
  sheet.getRange(2, 1, 1000, 19).clearDataValidations();
  sheet.getRange(2, 21, 1000, 10).clearDataValidations();`;

if (!code.includes(targetValidations)) {
  console.error('targetValidations not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetValidations, repValidations);

// 3. Update column widths in setupSheet()
const targetWidths = `    125, // Z: NID Back
    155, // AA: Operator
    145  // AB: Verified Time
  ];`;

const repWidths = `    125, // Z: NID Back
    240, // AA: Admin Tracker & Audit (Duplicate/Resubmission)
    220, // AB: Resubmission Notes & Reasons
    140, // AC: Operator
    140  // AD: Verified Time
  ];`;

if (!code.includes(targetWidths)) {
  console.error('targetWidths not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetWidths, repWidths);

// 4. Update doPost() to perform comprehensive duplicate scanning and resubmission tracking
const targetDoPostScan = `    var payoutStr = "";
    if (data.payoutWallet) {
      payoutStr = String(data.payoutWallet);
    } else if (data.bankDetails) {
      var bd = data.bankDetails;
      payoutStr = "Bank: " + (bd.bankName || "") + " (" + (bd.branch || "") + ") - A/C: " + (bd.accountNumber || "") + " [" + (bd.accountType || "") + " - " + (bd.accountName || "") + "]" + (bd.routingNumber ? " Routing: " + bd.routingNumber : "");
    } else {
      payoutStr = data.payoutMethod ? (data.payoutMethod + " - " + (data.payoutNumber || "")) : "";
    }
    var servicesStr = Array.isArray(data.services) ? data.services.join(", ") : (data.services || "");
    var nextRowIdx = sheet.getLastRow() + 1;`;

const repDoPostScan = `    var payoutStr = "";
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
    var cleanLicForMatch = String(data.licenseNumber || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    var isDriverCorrection = (data.isResubmission === true || data.isResubmission === "true" || !!data.correctionReason);
    var prevAppIdGiven = String(data.previousApplicationId || data.prevAppId || "").trim();

    var duplicateMatches = [];
    var submissionIteration = 1;
    var existingRowCount = sheet.getLastRow();
    
    if (existingRowCount > 1) {
      try {
        var existingValues = sheet.getRange(2, 1, existingRowCount - 1, Math.min(sheet.getLastColumn(), 28)).getValues();
        for (var eIdx = 0; eIdx < existingValues.length; eIdx++) {
          var rowP = String(existingValues[eIdx][3] || "").replace(/[^0-9]/g, "").replace(/^880/, "0");
          var rowN = String(existingValues[eIdx][5] || "").replace(/[^0-9]/g, "");
          var rowL = String(existingValues[eIdx][8] || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
          var rowId = String(existingValues[eIdx][1] || "");
          var matchFields = [];

          if (cleanPhoneForMatch && rowP && cleanPhoneForMatch === rowP) matchFields.push("Phone");
          if (cleanNidForMatch && rowN && cleanNidForMatch === rowN) matchFields.push("NID");
          if (cleanLicForMatch && rowL && cleanLicForMatch === rowL) matchFields.push("License");

          if (matchFields.length > 0) {
            submissionIteration++;
            duplicateMatches.push({
              row: eIdx + 2,
              appId: rowId,
              matchedOn: matchFields.join(" & ")
            });
          }
        }
      } catch(scanErr) {
        // Fallback: continue safely if scan encounters range issues
      }
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
    }`;

if (!code.includes(targetDoPostScan)) {
  console.error('targetDoPostScan not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetDoPostScan, repDoPostScan);

// 5. Update row array construction in doPost()
const targetRowArr = `      photoFormula,                                                   // Col V: Photo Document
      licenseFrontFormula,                                            // Col W: License (Front)
      licenseBackFormula,                                             // Col X: License (Back)
      nidFrontFormula,                                                // Col Y: NID (Front)
      nidBackFormula,                                                 // Col Z: NID (Back)
      "",                                                             // Col AA: Operator
      ""                                                              // Col AB: Verified Time
    ];`;

const repRowArr = `      photoFormula,                                                   // Col V: Photo Document
      licenseFrontFormula,                                            // Col W: License (Front)
      licenseBackFormula,                                             // Col X: License (Back)
      nidFrontFormula,                                                // Col Y: NID (Front)
      nidBackFormula,                                                 // Col Z: NID (Back)
      sanitizeCellValue(auditTrackerStr),                             // Col AA: Admin Tracker & Audit
      sanitizeCellValue(resubmissionNotesStr),                        // Col AB: Resubmission Notes
      "",                                                             // Col AC: Operator
      ""                                                              // Col AD: Verified Time
    ];`;

if (!code.includes(targetRowArr)) {
  console.error('targetRowArr not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetRowArr, repRowArr);

// 6. Update row styling and data validations in doPost()
const targetRowStyle = `    // Clear any rogue data validations from columns other than Status (Col 20)
    sheet.getRange(lastRow, 1, 1, 19).clearDataValidations();
    sheet.getRange(lastRow, 21, 1, 8).clearDataValidations();`;

const repRowStyle = `    // Style Admin Audit Tracker Cell (Col 27 / AA)
    var auditCell = sheet.getRange(lastRow, 27);
    auditCell.setBackground(auditBgColor);
    auditCell.setFontColor(auditFgColor);
    auditCell.setFontWeight("bold");

    // Clear any rogue data validations from columns other than Status (Col 20)
    sheet.getRange(lastRow, 1, 1, 19).clearDataValidations();
    sheet.getRange(lastRow, 21, 1, 10).clearDataValidations();`;

if (!code.includes(targetRowStyle)) {
  console.error('targetRowStyle not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetRowStyle, repRowStyle);

// 7. Update getChauffeurs return data
const targetGetChauffeurs = `        role: r[16],
        vehicle: r[17],
        payout: String(r[18]).replace(/^'/, ""),
        status: r[19],
        docCompleteness: r[20]
      });`;

const repGetChauffeurs = `        role: r[16],
        vehicle: r[17],
        payout: String(r[18]).replace(/^'/, ""),
        status: r[19],
        docCompleteness: r[20],
        auditTracker: r[26] || "—",
        resubmissionNotes: r[27] || "—"
      });`;

if (!code.includes(targetGetChauffeurs)) {
  console.error('targetGetChauffeurs not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetGetChauffeurs, repGetChauffeurs);

// 8. Update return JSON of doPost()
const targetDoPostReturn = `    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Chauffeur application recorded safely into Rownaa Registry with all 5 documents stored!",
      row: lastRow,
      applicationId: appId,`;

const repDoPostReturn = `    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Chauffeur application recorded safely into Rownaa Registry with all 5 documents stored!",
      row: lastRow,
      applicationId: appId,
      auditStatus: auditTrackerStr,
      isResubmission: isDriverCorrection,
      iteration: submissionIteration,`;

if (!code.includes(targetDoPostReturn)) {
  console.error('targetDoPostReturn not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetDoPostReturn, repDoPostReturn);

fs.writeFileSync('google_sheet_webhook.gs', code, 'utf8');
console.log('✅ google_sheet_webhook.gs updated with Duplicate Data Tracker & Resubmission Engine!');
