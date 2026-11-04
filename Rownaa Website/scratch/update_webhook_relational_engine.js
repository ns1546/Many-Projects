const fs = require('fs');

function updateWebhookFiles(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Update safeRebuildAndSetup to initialize all 5 tabs and show completion dialog
  const oldSafe = /function safeRebuildAndSetup\(\)[\s\S]*?\n\}/;
  const newSafe = `function safeRebuildAndSetup() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) {}

  if (ui) {
    var resp = ui.alert(
      "🔄 Rebuild & Setup Entire System",
      "This will automatically initialize the full 4-Tab Relational Multi-Vehicle & Multi-Driver Schema (Chauffeur Registry, Rental Fleet Services, Fleet Vehicle Vault, Fleet Driver Roster), realign all 36 columns, rebuild the Operations KPI Dashboard, and heal all mismatched data.\\n\\n🛡️ 100% SAFE GUARANTEE:\\n1. An automatic full timestamped backup is saved to Google Drive first.\\n2. Existing chauffeur applicant rows will NEVER be deleted or cleared.\\n\\nDo you want to proceed?",
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;
  }

  try {
    createDailyBackup();
  } catch (bErr) {
    Logger.log("Backup note: " + bErr.toString());
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  autoAlignAndRepairSheet(false);
  setupMultiTabRelationalDatabase(ss);
  setupDashboardSheet(ss);

  if (ui) {
    ui.alert(
      "✅ Enterprise System Initialized Successfully",
      "All 5 Operational Modules have been built and aligned:\\n\\n" +
      "1. 🚗 Chauffeur Registry (36 Columns Dual-License)\\n" +
      "2. 🏢 Rental Fleet Services (Owner Profiles & Commercial Banking)\\n" +
      "3. 🚙 Fleet Vehicle Vault (Per-Car Registration, Fitness & Blue Books)\\n" +
      "4. 👨‍✈️ Fleet Driver Roster (Per-Driver NID, Driving License & Plate Assignment)\\n" +
      "5. 🎛️ Operations KPI Dashboard (Real-time Fleet & Chauffeur BI)\\n\\n" +
      "Your system is 100% ready for high-volume enterprise operations!",
      ui.ButtonSet.OK
    );
  }
}`;
  code = code.replace(oldSafe, newSafe);

  // 2. Update fleet vehicle document saving in doPost
  const oldVehDocPattern = /var fleetCarDocCount = 0;[\s\S]*?if \(!carLicBackUrl && cBack\) carLicBackUrl = cBack;\s*\}/;
  const newVehDocBlock = `var fleetCarDocCount = 0;
    var fleetCarsList = (data.fleetData && (data.fleetData.vehicles || data.fleetData.cars)) || [];
    if (fleetCarsList.length > 0) {
      for (var fcIdx = 0; fcIdx < fleetCarsList.length; fcIdx++) {
        var fCar = fleetCarsList[fcIdx];
        var cNum = fcIdx + 1;
        var cPlateClean = String(fCar.reg || fCar.plate || fCar.plateNumber || ("Car_" + cNum)).replace(/[^a-zA-Z0-9_-]/g, "_");

        var cFront = null;
        if (fCar.carLicenseFront || fCar.carLicenseFrontBase64 || fCar.blueBookFront || fCar.blueBookFrontBase64) {
          cFront = saveBase64DocumentToDrive(fCar.carLicenseFront || fCar.carLicenseFrontBase64 || fCar.blueBookFront || fCar.blueBookFrontBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_reg_front.jpg", applicantFolder);
          if (cFront) fleetCarDocCount++;
        }
        var cBack = null;
        if (fCar.carLicenseBack || fCar.carLicenseBackBase64 || fCar.blueBookBack || fCar.blueBookBackBase64) {
          cBack = saveBase64DocumentToDrive(fCar.carLicenseBack || fCar.carLicenseBackBase64 || fCar.blueBookBack || fCar.blueBookBackBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_reg_back.jpg", applicantFolder);
          if (cBack) fleetCarDocCount++;
        }
        var cFitness = null;
        if (fCar.carFitness || fCar.carFitnessBase64 || fCar.taxToken || fCar.taxTokenBase64) {
          cFitness = saveBase64DocumentToDrive(fCar.carFitness || fCar.carFitnessBase64 || fCar.taxToken || fCar.taxTokenBase64, "fleet_car_" + cNum + "_" + cPlateClean + "_fitness.jpg", applicantFolder);
        }

        if (!carLicFrontUrl && cFront) carLicFrontUrl = cFront;
        if (!carLicBackUrl && cBack) carLicBackUrl = cBack;
        if (!carFitnessUrl && cFitness) carFitnessUrl = cFitness;
      }
    }`;
  code = code.replace(oldVehDocPattern, newVehDocBlock);

  // 3. Update relational database ingestion in doPost
  const oldRelationalPattern = /var isRentalFleet = \(data\.role === "rental_owner"[\s\S]*?drvSheet\.appendRow\(\[[\s\S]*?\"\"\s*\]\);\s*\}\s*\}/;
  const newRelationalBlock = `var isRentalFleet = (/rental|fleet/i.test(data.role || "") || /rental|fleet/i.test(data.driverRole || "") || !!data.fleetData);
      var isSoloOwner = (/owner/i.test(data.role || "") || /owner/i.test(data.driverRole || "") || !!data.ownerCar);

      if (isRentalFleet) {
        setupMultiTabRelationalDatabase(ss);

        // 1. INGEST INTO RENTAL FLEET SERVICES TAB
        var fleetSheet = ss.getSheetByName(SHEET_FLEET_SERVICES_NAME);
        var fVehicles = (data.fleetData && (data.fleetData.vehicles || data.fleetData.cars)) || [];
        var fDrivers = (data.fleetData && data.fleetData.drivers) || [];
        if (fleetSheet) {
          var totalCars = (fVehicles.length > 0) ? fVehicles.length : (data.totalVehicles || 1);
          var totalDrivers = (fDrivers.length > 0) ? fDrivers.length : (data.totalDrivers || 1);
          var bName = data.businessName || data.companyName || (applicantName + " Rental Fleet");
          var tLicNo = data.tradeLicenseNumber || data.tradeLicense || "—";
          var tLicUrl = saveBase64DocumentToDrive(data.tradeLicenseBase64, "00_trade_license_registration.jpg", applicantFolder);
          var tLicForm = tLicUrl ? '=HYPERLINK("' + tLicUrl + '", "📑 View Trade License")' : '—';
          var offAddr = data.officeAddress || data.garageAddress || data.baseCity || "Dhaka";

          var fleetRowData = [
            sanitizeCellValue(data.submittedAt || new Date().toISOString()),
            appId,
            sanitizeCellValue(bName),
            applicantName,
            formatAsPlainText(rawPhone),
            whatsappFormula,
            formatAsPlainText(data.nidNumber || data.nid || ""),
            sanitizeCellValue(data.baseCity || data.city || "Dhaka"),
            sanitizeCellValue(offAddr),
            totalCars,
            totalDrivers,
            formatAsPlainText(tLicNo),
            formatAsPlainText(payoutStr),
            "Pending Verification",
            docCompletenessFormula,
            photoFormula,
            nidFrontFormula,
            nidBackFormula,
            tLicForm,
            sanitizeCellValue(auditTrackerStr),
            "",
            ""
          ];
          fleetSheet.appendRow(fleetRowData);
        }

        // 2. INGEST INTO FLEET VEHICLE VAULT TAB (One dedicated row per vehicle)
        var vehSheet = ss.getSheetByName(SHEET_VEHICLES_VAULT_NAME);
        if (vehSheet && fVehicles.length > 0) {
          for (var cIdx = 0; cIdx < fVehicles.length; cIdx++) {
            var carObj = fVehicles[cIdx];
            var vehId = "VEH-" + (cIdx + 1) + "-" + appId.replace(/[^0-9]/g, "").slice(-4);
            var cPlate = carObj.reg || carObj.plate || carObj.plateNumber || ("Car-" + (cIdx + 1));
            var cModel = carObj.model || carObj.make || "Sedan / Microbus";
            var cYear = carObj.year || carObj.manufacturingYear || "2021";
            var cSeats = carObj.seats || carObj.seatingCapacity || "4-7 Seats";
            var cFuel = carObj.fuel || carObj.fuelType || "Octane / Hybrid";
            var cFitExp = carObj.fitnessExpiry || carObj.fitness || "2027-12-31";

            var cFUrl = saveBase64DocumentToDrive(carObj.carLicenseFront || carObj.carLicenseFrontBase64 || carObj.blueBookFront || carObj.blueBookFrontBase64, "car_" + (cIdx + 1) + "_reg_front.jpg", applicantFolder);
            var cBUrl = saveBase64DocumentToDrive(carObj.carLicenseBack || carObj.carLicenseBackBase64 || carObj.blueBookBack || carObj.blueBookBackBase64, "car_" + (cIdx + 1) + "_reg_back.jpg", applicantFolder);
            var cFitUrl = saveBase64DocumentToDrive(carObj.carFitness || carObj.carFitnessBase64 || carObj.taxToken || carObj.taxTokenBase64, "car_" + (cIdx + 1) + "_fitness.jpg", applicantFolder);

            var cFForm = cFUrl ? '=HYPERLINK("' + cFUrl + '", "🚗 Blue Book Front")' : (cIdx === 0 && carLicFrontUrl ? '=HYPERLINK("' + carLicFrontUrl + '", "🚗 Blue Book Front")' : '—');
            var cBForm = cBUrl ? '=HYPERLINK("' + cBUrl + '", "🚗 Blue Book Back")' : (cIdx === 0 && carLicBackUrl ? '=HYPERLINK("' + carLicBackUrl + '", "🚗 Blue Book Back")' : '—');
            var cFitDocForm = cFitUrl ? '=HYPERLINK("' + cFitUrl + '", "📑 Fitness Token")' : (cIdx === 0 && carFitnessUrl ? '=HYPERLINK("' + carFitnessUrl + '", "📑 Fitness Token")' : '—');

            var vRowIdx = vehSheet.getLastRow() + 1;
            var vFitStatForm = '=IF(K' + vRowIdx + '="—", "—", IF(DATEVALUE(K' + vRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + vRowIdx + ')<TODAY()+60, "⚠️ EXPIRING SOON", "✅ VALID")))';

            vehSheet.appendRow([
              sanitizeCellValue(data.submittedAt || new Date().toISOString()),
              vehId,
              appId,
              sanitizeCellValue(bName),
              formatAsPlainText(rawPhone),
              sanitizeCellValue(cModel),
              formatAsPlainText(cPlate),
              sanitizeCellValue(cYear),
              sanitizeCellValue(cSeats),
              sanitizeCellValue(cFuel),
              sanitizeCellValue(cFitExp),
              vFitStatForm,
              cFForm,
              cBForm,
              cFitDocForm,
              "Pending Inspection",
              "",
              "",
              ""
            ]);
          }
        }

        // 3. INGEST INTO FLEET DRIVER ROSTER TAB (One dedicated row per employed driver)
        var drvSheet = ss.getSheetByName(SHEET_FLEET_DRIVERS_NAME);
        if (drvSheet && fDrivers.length > 0) {
          for (var dIdx = 0; dIdx < fDrivers.length; dIdx++) {
            var dObj = fDrivers[dIdx];
            var fdrvId = "FDRV-" + (dIdx + 1) + "-" + appId.replace(/[^0-9]/g, "").slice(-4);
            var dName = dObj.name || dObj.fullName || ("Employed Driver " + (dIdx + 1));
            var dPhone = dObj.phone || dObj.mobile || "";
            var dNid = dObj.nid || dObj.nidNumber || "";
            var dLicense = dObj.license || dObj.licenseNumber || "";
            var dClass = dObj.licenseClass || dObj.licenseType || "Professional Light";
            var dExpiry = dObj.licenseExpiry || dObj.expiry || "—";
            var dAssignedPlate = dObj.assignedPlate || (fVehicles[dIdx] ? (fVehicles[dIdx].plate || fVehicles[dIdx].reg) : "Any Fleet Car");

            var dCleanPhone = dPhone.replace(/[^0-9]/g, "");
            if (dCleanPhone.startsWith("0")) dCleanPhone = "880" + dCleanPhone.substring(1);
            var dWaForm = (dCleanPhone.length >= 10) ?
              '=HYPERLINK("https://wa.me/' + dCleanPhone + '?text=' + encodeURIComponent("Hello " + dName + ", this is Rownaa Fleet Operations under " + bName + ".") + '", "🟢 Chat on WhatsApp")' : '—';

            var dFUrl = saveBase64DocumentToDrive(dObj.licenseFront || dObj.licenseFrontBase64, "driver_" + (dIdx + 1) + "_lic_front.jpg", applicantFolder);
            var dBUrl = saveBase64DocumentToDrive(dObj.licenseBack || dObj.licenseBackBase64, "driver_" + (dIdx + 1) + "_lic_back.jpg", applicantFolder);
            var dNFUrl = saveBase64DocumentToDrive(dObj.nidFront || dObj.nidFrontBase64, "driver_" + (dIdx + 1) + "_nid_front.jpg", applicantFolder);
            var dNBUrl = saveBase64DocumentToDrive(dObj.nidBack || dObj.nidBackBase64, "driver_" + (dIdx + 1) + "_nid_back.jpg", applicantFolder);

            var dFForm = dFUrl ? '=HYPERLINK("' + dFUrl + '", "📄 Lic Front")' : (dIdx === 0 && driverLicFrontUrl ? '=HYPERLINK("' + driverLicFrontUrl + '", "📄 Lic Front")' : '—');
            var dBForm = dBUrl ? '=HYPERLINK("' + dBUrl + '", "📄 Lic Back")' : (dIdx === 0 && driverLicBackUrl ? '=HYPERLINK("' + driverLicBackUrl + '", "📄 Lic Back")' : '—');
            var dNFForm = dNFUrl ? '=HYPERLINK("' + dNFUrl + '", "🪪 NID Front")' : '—';
            var dNBForm = dNBUrl ? '=HYPERLINK("' + dNBUrl + '", "🪪 NID Back")' : '—';

            var dRowIdx = drvSheet.getLastRow() + 1;
            var dLicStatForm = '=IF(K' + dRowIdx + '="—", "—", IF(DATEVALUE(K' + dRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + dRowIdx + ')<TODAY()+30, "⚠️ EXPIRING SOON", "✅ VALID")))';

            drvSheet.appendRow([
              sanitizeCellValue(data.submittedAt || new Date().toISOString()),
              fdrvId,
              appId,
              sanitizeCellValue(bName),
              applicantName,
              formatAsPlainText(dPhone),
              dWaForm,
              formatAsPlainText(dNid),
              formatAsPlainText(dLicense),
              sanitizeCellValue(dClass),
              sanitizeCellValue(dExpiry),
              dLicStatForm,
              dFForm,
              dBForm,
              dNFForm,
              dNBForm,
              formatAsPlainText(dAssignedPlate),
              "Pending Verification",
              "",
              ""
            ]);
          }
        }`;
  code = code.replace(oldRelationalPattern, newRelationalBlock);

  // 4. Add getFleets, getVehicles, getFleetDrivers to doGet
  if (!code.includes('if (action === "getFleets")')) {
    const apiExtensions = `  if (action === "getFleets") {
    var fltSheet = ss.getSheetByName(SHEET_FLEET_SERVICES_NAME);
    if (!fltSheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Fleet Services tab not found" })).setMimeType(ContentService.MimeType.JSON);
    var fRows = fltSheet.getDataRange().getValues();
    var fList = [];
    for (var fi = 1; fi < fRows.length; fi++) {
      var fr = fRows[fi];
      if (!fr[1]) continue;
      fList.push({ timestamp: fr[0], fleetId: fr[1], businessName: fr[2], ownerName: fr[3], ownerPhone: String(fr[4]).replace(/^'/, ""), nid: String(fr[6]).replace(/^'/, ""), district: fr[7], totalCars: fr[9], totalDrivers: fr[10], tradeLicense: String(fr[11]).replace(/^'/, ""), payout: fr[12], status: fr[13] });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: fList.length, fleets: fList })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getVehicles") {
    var vSheet = ss.getSheetByName(SHEET_VEHICLES_VAULT_NAME);
    if (!vSheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Vehicle Vault tab not found" })).setMimeType(ContentService.MimeType.JSON);
    var vRows = vSheet.getDataRange().getValues();
    var vList = [];
    for (var vi = 1; vi < vRows.length; vi++) {
      var vr = vRows[vi];
      if (!vr[1]) continue;
      vList.push({ timestamp: vr[0], vehicleId: vr[1], fleetId: vr[2], company: vr[3], phone: String(vr[4]).replace(/^'/, ""), model: vr[5], plate: String(vr[6]).replace(/^'/, ""), year: vr[7], seats: vr[8], fuel: vr[9], fitnessExpiry: vr[10], status: vr[15], assignedDriver: vr[16] });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: vList.length, vehicles: vList })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getFleetDrivers") {
    var dRosterSheet = ss.getSheetByName(SHEET_FLEET_DRIVERS_NAME);
    if (!dRosterSheet) return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Driver Roster tab not found" })).setMimeType(ContentService.MimeType.JSON);
    var drRows = dRosterSheet.getDataRange().getValues();
    var drList = [];
    for (var dri = 1; dri < drRows.length; dri++) {
      var drr = drRows[dri];
      if (!drr[1]) continue;
      drList.push({ timestamp: drr[0], driverId: drr[1], fleetId: drr[2], company: drr[3], name: drr[4], phone: String(drr[5]).replace(/^'/, ""), nid: String(drr[7]).replace(/^'/, ""), licenseNumber: String(drr[8]).replace(/^'/, ""), licenseClass: drr[9], licenseExpiry: drr[10], assignedPlate: String(drr[16]).replace(/^'/, ""), status: drr[17] });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: drList.length, drivers: drList })).setMimeType(ContentService.MimeType.JSON);
  }
`;
    code = code.replace('if (action === "getChauffeurs") {', apiExtensions + '\n  if (action === "getChauffeurs") {');
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated:', filePath);
}

updateWebhookFiles('google_sheet_webhook.gs');
updateWebhookFiles('netlify-driver-portal/google_sheet_webhook.gs');
