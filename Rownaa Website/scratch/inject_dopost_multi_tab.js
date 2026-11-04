const fs = require('fs');

console.log('Integrating multi-tab ingestion in doPost...');

function updateDoPostMultiTab(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find where auditCell is styled in doPost
  const targetSnippet = `    // Audit Tracker Styling (Col AG / 33)
    var auditCell = sheet.getRange(lastRow, 33);
    auditCell.setBackground(auditBgColor);
    auditCell.setFontColor(auditFgColor);
    auditCell.setFontWeight("bold");`;

  const multiTabAppendLogic = `    // Audit Tracker Styling (Col AG / 33)
    var auditCell = sheet.getRange(lastRow, 33);
    auditCell.setBackground(auditBgColor);
    auditCell.setFontColor(auditFgColor);
    auditCell.setFontWeight("bold");

    // ==============================================================
    // MULTI-TAB RELATIONAL DATABASE INGESTION ENGINE
    // Automatically routes Fleets, Vehicles, and Employed Drivers
    // ==============================================================
    try {
      var isRentalFleet = (data.role === "rental_owner" || data.driverRole === "rental_owner" || !!data.fleetData);
      var isSoloOwner = (data.role === "owner_driver" || data.driverRole === "owner_driver" || !!data.ownerCar);

      if (isRentalFleet) {
        setupMultiTabRelationalDatabase(ss);

        // 1. INGEST INTO RENTAL FLEET SERVICES TAB
        var fleetSheet = ss.getSheetByName(SHEET_FLEET_SERVICES_NAME);
        if (fleetSheet) {
          var totalCars = (data.fleetData && Array.isArray(data.fleetData.cars)) ? data.fleetData.cars.length : (data.totalVehicles || 1);
          var totalDrivers = (data.fleetData && Array.isArray(data.fleetData.drivers)) ? data.fleetData.drivers.length : (data.totalDrivers || 1);
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
        if (vehSheet && data.fleetData && Array.isArray(data.fleetData.cars)) {
          for (var cIdx = 0; cIdx < data.fleetData.cars.length; cIdx++) {
            var carObj = data.fleetData.cars[cIdx];
            var vehId = "VEH-" + (cIdx + 1) + "-" + appId.replace(/[^0-9]/g, "").slice(-4);
            var cPlate = carObj.reg || carObj.plate || ("Car-" + (cIdx + 1));
            var cModel = carObj.model || "Sedan / Microbus";
            var cYear = carObj.year || "2021";
            var cSeats = carObj.seats || "4-7 Seats";
            var cFuel = carObj.fuel || "Octane / Hybrid";
            var cFitExp = carObj.fitnessExpiry || "2027-12-31";

            var cFUrl = saveBase64DocumentToDrive(carObj.carLicenseFront || carObj.carLicenseFrontBase64, "car_" + (cIdx + 1) + "_reg_front.jpg", applicantFolder);
            var cBUrl = saveBase64DocumentToDrive(carObj.carLicenseBack || carObj.carLicenseBackBase64, "car_" + (cIdx + 1) + "_reg_back.jpg", applicantFolder);
            var cFitUrl = saveBase64DocumentToDrive(carObj.carFitness || carObj.carFitnessBase64, "car_" + (cIdx + 1) + "_fitness.jpg", applicantFolder);

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
        if (drvSheet && data.fleetData && Array.isArray(data.fleetData.drivers)) {
          for (var dIdx = 0; dIdx < data.fleetData.drivers.length; dIdx++) {
            var dObj = data.fleetData.drivers[dIdx];
            var fdrvId = "FDRV-" + (dIdx + 1) + "-" + appId.replace(/[^0-9]/g, "").slice(-4);
            var dName = dObj.name || ("Employed Driver " + (dIdx + 1));
            var dPhone = dObj.phone || "";
            var dNid = dObj.nid || "";
            var dLicense = dObj.license || dObj.licenseNumber || "";
            var dClass = dObj.licenseClass || "Professional Light";
            var dExpiry = dObj.licenseExpiry || "—";
            var dAssignedPlate = dObj.assignedPlate || (data.fleetData.cars && data.fleetData.cars[dIdx] ? data.fleetData.cars[dIdx].reg : "Any Fleet Car");

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
              sanitizeCellValue(dName),
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
        }
      } else if (isSoloOwner) {
        // Also register solo owner-driver car in Fleet Vehicle Vault
        setupMultiTabRelationalDatabase(ss);
        var soloVehSheet = ss.getSheetByName(SHEET_VEHICLES_VAULT_NAME);
        if (soloVehSheet && carPlateNo && carPlateNo !== "—") {
          var soloVehId = "VEH-SOLO-" + appId.replace(/[^0-9]/g, "").slice(-4);
          var sRowIdx = soloVehSheet.getLastRow() + 1;
          var sFitStatForm = '=IF(K' + sRowIdx + '="—", "—", IF(DATEVALUE(K' + sRowIdx + ')<TODAY(), "⛔ EXPIRED", IF(DATEVALUE(K' + sRowIdx + ')<TODAY()+60, "⚠️ EXPIRING SOON", "✅ VALID")))';

          soloVehSheet.appendRow([
            sanitizeCellValue(data.submittedAt || new Date().toISOString()),
            soloVehId,
            appId,
            applicantName + " (Solo Owner-Driver)",
            formatAsPlainText(rawPhone),
            sanitizeCellValue(carModelStr),
            formatAsPlainText(carPlateNo),
            sanitizeCellValue(data.carYear || "2021"),
            sanitizeCellValue(data.carSeats || "4 Seats"),
            sanitizeCellValue(data.carFuel || "Octane"),
            sanitizeCellValue(carFitnessExpiry),
            sFitStatForm,
            carLicFrontFormula,
            carLicBackFormula,
            carFitnessFormula,
            "Approved & Active",
            applicantName,
            "",
            ""
          ]);
        }
      }
    } catch(multiTabErr) {
      Logger.log("Multi-tab ingestion note: " + multiTabErr.toString());
    }`;

  if (content.includes(targetSnippet)) {
    content = content.replace(targetSnippet, multiTabAppendLogic);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully added multi-tab ingestion to', filePath);
  } else {
    console.log('Could not find targetSnippet in', filePath);
  }
}

updateDoPostMultiTab('google_sheet_webhook.gs');
updateDoPostMultiTab('netlify-driver-portal/google_sheet_webhook.gs');
