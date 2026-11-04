const fs = require('fs');

function updateGetChauffeurs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldGetChauffeurs = `    var list = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      list.push({
        timestamp: r[0],
        id: r[1],
        name: r[2],
        phone: String(r[3]).replace(/^'/, ""),
        nid: String(r[5]).replace(/^'/, ""),
        city: r[6],
        emergency: r[7],
        driverLicense: {
          number: String(r[8]).replace(/^'/, ""),
          class: r[9],
          expiry: r[10],
          status: r[11]
        },
        carLicense: {
          plateNumber: String(r[12]).replace(/^'/, ""),
          model: r[13],
          fitnessExpiry: r[14]
        },
        experience: r[15],
        languages: r[16],
        services: r[17],
        availability: r[18],
        role: r[19],
        vehicle: r[20],
        payout: String(r[21]).replace(/^'/, ""),
        status: r[22],
        docCompleteness: r[23],
        auditTracker: r[32] || "—",
        resubmissionNotes: r[33] || "—"
      });
    }`;

  const newGetChauffeurs = `    var list = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      // Skip empty ghost rows
      if (!r[0] && !r[1] && !r[2] && !r[3]) continue;

      list.push({
        timestamp: r[0],
        id: r[1],
        name: r[2],
        phone: String(r[3]).replace(/^'/, ""),
        nid: String(r[5]).replace(/^'/, ""),
        city: r[6],
        emergency: r[7],
        // Flat fields for backward compatibility
        licenseNumber: String(r[8]).replace(/^'/, ""),
        licenseClass: r[9],
        licenseExpiry: r[10],
        licenseStatus: r[11],
        carLicensePlate: String(r[12]).replace(/^'/, ""),
        carModel: r[13],
        carFitnessExpiry: r[14],
        // Nested dual-license objects
        driverLicense: {
          number: String(r[8]).replace(/^'/, ""),
          class: r[9],
          expiry: r[10],
          status: r[11]
        },
        carLicense: {
          plateNumber: String(r[12]).replace(/^'/, ""),
          model: r[13],
          fitnessExpiry: r[14]
        },
        experience: r[15],
        languages: r[16],
        services: r[17],
        availability: r[18],
        role: r[19],
        vehicle: r[20],
        payout: String(r[21]).replace(/^'/, ""),
        status: r[22],
        docCompleteness: r[23],
        auditTracker: r[32] || "—",
        resubmissionNotes: r[33] || "—"
      });
    }`;

  if (content.includes(oldGetChauffeurs)) {
    content = content.replace(oldGetChauffeurs, newGetChauffeurs);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated getChauffeurs in', filePath);
  } else {
    console.log('Could not find exact oldGetChauffeurs in', filePath);
  }
}

updateGetChauffeurs('google_sheet_webhook.gs');
updateGetChauffeurs('netlify-driver-portal/google_sheet_webhook.gs');
