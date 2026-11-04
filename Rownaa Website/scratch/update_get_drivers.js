const fs = require('fs');

['google_sheet_webhook.gs', 'netlify-driver-portal/google_sheet_webhook.gs'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  const oldGetBlock = /if \(action === "getChauffeurs"\) \{[\s\S]*?return ContentService\.createTextOutput\(JSON\.stringify\(\{\s*status: "success",\s*count: list\.length,\s*chauffeurs: list\s*\}\)\)\.setMimeType\(ContentService\.MimeType\.JSON\);\s*\}/;

  const newGetBlock = `if (action === "getChauffeurs" || action === "getDrivers") {
    var sheet = ss.getSheetByName(SHEET_REGISTRY_NAME) || ss.getSheetByName("Chauffeur Registry");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Registry sheet not found" })).setMimeType(ContentService.MimeType.JSON);
    }
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", count: 0, chauffeurs: [] })).setMimeType(ContentService.MimeType.JSON);
    }

    var list = [];
    var startIdx = 1;
    if (rows.length > 2 && (rows[1][1] === "Application ID" || String(rows[1][0]).toLowerCase().includes("timestamp"))) {
      startIdx = 2;
    }

    for (var i = startIdx; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0] && !r[1] && !r[2] && !r[3]) continue;
      if (r[1] === "Application ID") continue;

      var is52Col = (r.length >= 48);

      list.push({
        timestamp: r[0],
        id: r[1],
        name: r[2],
        phone: String(r[3]).replace(/^'/, ""),
        nid: String(r[5]).replace(/^'/, ""),
        city: r[6],
        emergency: r[7],
        licenseNumber: String(r[8]).replace(/^'/, ""),
        licenseClass: r[9],
        licenseExpiry: r[10],
        licenseStatus: r[11],
        role: is52Col ? r[12] : r[19],
        services: is52Col ? r[13] : r[17],
        availability: is52Col ? r[14] : r[18],
        companyName: is52Col ? r[15] : "",
        tradeLicense: is52Col ? String(r[16]).replace(/^'/, "") : "",
        payout: is52Col ? String(r[18]).replace(/^'/, "") : String(r[21]).replace(/^'/, ""),
        car1: is52Col ? r[20] : (r[13] + " [" + r[12] + "]"),
        car2: is52Col ? r[24] : "—",
        car3: is52Col ? r[28] : "—",
        driver1: is52Col ? r[32] : "—",
        driver2: is52Col ? r[35] : "—",
        driver3: is52Col ? r[38] : "—",
        manifest: is52Col ? r[46] : r[20],
        status: is52Col ? r[47] : r[22],
        docCompleteness: is52Col ? r[48] : r[23],
        auditTracker: is52Col ? (r[49] || "—") : (r[32] || "—"),
        resubmissionNotes: is52Col ? (r[50] || "—") : (r[33] || "—")
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: list.length,
      chauffeurs: list
    })).setMimeType(ContentService.MimeType.JSON);
  }`;

  content = content.replace(oldGetBlock, newGetBlock);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated getChauffeurs in:', file);
});
