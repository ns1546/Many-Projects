const fs = require('fs');

let code = fs.readFileSync('google_sheet_webhook.gs', 'utf8');

const targetVeh = `    var vehicleStr = "";
    if (data.ownerCar) {
      vehicleStr = (typeof data.ownerCar === 'object') ?
        (data.ownerCar.model || "") + " [" + (data.ownerCar.plateNumber || "") + "]" :
        String(data.ownerCar);
    } else {
      vehicleStr = data.carModel ? String(data.carModel) : "N/A (Fleet Chauffeur)";
    }

    var payoutStr = data.payoutWallet || (data.payoutMethod ? (data.payoutMethod + " - " + (data.payoutNumber || "")) : "");`;

const repVeh = `    var vehicleStr = "";
    if (data.vehicleProfile) {
      vehicleStr = String(data.vehicleProfile);
    } else if (data.fleetData) {
      var fd = data.fleetData;
      var vList = Array.isArray(fd.vehicles) ? fd.vehicles.map(function(v, i) { return (i + 1) + ". " + (v.model || "Vehicle") + " [" + (v.plate || "No Plate") + "]"; }).join(", ") : "";
      var dList = Array.isArray(fd.drivers) ? fd.drivers.map(function(d) { return d.name + " (" + d.phone + ")"; }).join(", ") : "";
      vehicleStr = "Rental Fleet (" + (fd.totalCars || 0) + " Cars, " + (fd.totalDrivers || 0) + " Drivers): " + vList + (dList ? " | Drivers: " + dList : "");
    } else if (data.ownerCar) {
      vehicleStr = (typeof data.ownerCar === 'object') ?
        (data.ownerCar.model || "") + " [" + (data.ownerCar.plateNumber || "") + "]" :
        String(data.ownerCar);
    } else {
      vehicleStr = data.carModel ? String(data.carModel) : "N/A (Fleet Chauffeur)";
    }

    var payoutStr = "";
    if (data.payoutWallet) {
      payoutStr = String(data.payoutWallet);
    } else if (data.bankDetails) {
      var bd = data.bankDetails;
      payoutStr = "Bank: " + (bd.bankName || "") + " (" + (bd.branch || "") + ") - A/C: " + (bd.accountNumber || "") + " [" + (bd.accountType || "") + " - " + (bd.accountName || "") + "]" + (bd.routingNumber ? " Routing: " + bd.routingNumber : "");
    } else {
      payoutStr = data.payoutMethod ? (data.payoutMethod + " - " + (data.payoutNumber || "")) : "";
    }`;

if (!code.includes(targetVeh)) {
  console.error('Target not found in google_sheet_webhook.gs');
  process.exit(1);
}

code = code.replace(targetVeh, repVeh);
fs.writeFileSync('google_sheet_webhook.gs', code, 'utf8');
console.log('✅ google_sheet_webhook.gs updated successfully!');

