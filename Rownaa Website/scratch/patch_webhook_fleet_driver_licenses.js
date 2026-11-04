const fs = require('fs');

let code = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

const targetDocs = `    // Hyperlink Formulas for 5 Documents
    var photoFormula = photoUrl ? '=HYPERLINK("' + photoUrl + '", "🔍 View Photo")' : '—';
    var licenseFrontFormula = licenseFrontUrl ? '=HYPERLINK("' + licenseFrontUrl + '", "📄 License Front")' : '—';
    var licenseBackFormula = licenseBackUrl ? '=HYPERLINK("' + licenseBackUrl + '", "📄 License Back")' : '—';
    var nidFrontFormula = nidFrontUrl ? '=HYPERLINK("' + nidFrontUrl + '", "🪪 NID Front")' : '—';
    var nidBackFormula = nidBackUrl ? '=HYPERLINK("' + nidBackUrl + '", "🪪 NID Back")' : '—';`;

const repDocs = `    // Save Employed Fleet Drivers' Driving Licenses (Front & Back) into Vault Folder
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

        // If main applicant license wasn't provided, map driver 1's license to columns W & X
        if (!licenseFrontUrl && dLicFrontUrl) {
          licenseFrontUrl = dLicFrontUrl;
        }
        if (!licenseBackUrl && dLicBackUrl) {
          licenseBackUrl = dLicBackUrl;
        }
      }
    }

    // Hyperlink Formulas for 5 Documents (and Fleet Licenses)
    var photoFormula = photoUrl ? '=HYPERLINK("' + photoUrl + '", "🔍 View Photo")' : '—';
    var licenseFrontFormula = licenseFrontUrl ? '=HYPERLINK("' + licenseFrontUrl + '", "📄 License Front")' : '—';
    var licenseBackFormula = licenseBackUrl ? '=HYPERLINK("' + licenseBackUrl + '", "📄 License Back")' : '—';
    var nidFrontFormula = nidFrontUrl ? '=HYPERLINK("' + nidFrontUrl + '", "🪪 NID Front")' : '—';
    var nidBackFormula = nidBackUrl ? '=HYPERLINK("' + nidBackUrl + '", "🪪 NID Back")' : '—';`;

if (!code.includes(targetDocs)) {
  console.error('targetDocs not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetDocs, repDocs);

// Update documentsSaved return in doPost()
const targetSavedReturn = `      documentsSaved: {
        photo: !!photoUrl,
        licenseFront: !!licenseFrontUrl,
        licenseBack: !!licenseBackUrl,
        nidFront: !!nidFrontUrl,
        nidBack: !!nidBackUrl
      }`;

const repSavedReturn = `      documentsSaved: {
        photo: !!photoUrl,
        licenseFront: !!licenseFrontUrl,
        licenseBack: !!licenseBackUrl,
        nidFront: !!nidFrontUrl,
        nidBack: !!nidBackUrl,
        fleetDriverLicenses: fleetDriverLicenseCount
      }`;

if (!code.includes(targetSavedReturn)) {
  console.error('targetSavedReturn not found in google_sheet_webhook.gs!');
  process.exit(1);
}
code = code.replace(targetSavedReturn, repSavedReturn);

fs.writeFileSync('google_sheet_webhook.gs', code, 'utf8');
console.log('✅ google_sheet_webhook.gs updated with Fleet Driver License Front & Back Drive archiver!');

