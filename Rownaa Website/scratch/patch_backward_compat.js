const fs = require('fs');

let html = fs.readFileSync('driver-register.html', 'utf8');

const targetBlock = `      if (selectedRole === 'rental_fleet_operator') {
        fleetPayload = {
          totalCars: fleetVehicles.length,
          totalDrivers: fleetDrivers.length,
          vehicles: fleetVehicles,
          drivers: fleetDrivers
        };
        const carsSummary = fleetVehicles.map((v, i) => \`\${i + 1}. \${v.model || 'Car'} [\${v.plate || 'No Plate'}]\`).join(', ');
        const driversSummary = fleetDrivers.map(d => \`\${d.name || 'Driver'} (\${d.phone || 'No Phone'})\`).join(', ');
        vehicleProfileDesc = \`Rental Fleet (\${fleetVehicles.length} Cars, \${fleetDrivers.length} Drivers): \${carsSummary} | Drivers: \${driversSummary}\`;
      } else if (selectedRole === 'car_owner_driver') {`;

const repBlock = `      if (selectedRole === 'rental_fleet_operator') {
        fleetPayload = {
          totalCars: fleetVehicles.length,
          totalDrivers: fleetDrivers.length,
          vehicles: fleetVehicles,
          drivers: fleetDrivers
        };
        const carsSummary = fleetVehicles.map((v, i) => \`\${i + 1}. \${v.model || 'Car'} [\${v.plate || 'No Plate'}]\`).join(', ');
        const driversSummary = fleetDrivers.map(d => \`\${d.name || 'Driver'} (\${d.phone || 'No Phone'})\`).join(', ');
        vehicleProfileDesc = \`Rental Fleet (\${fleetVehicles.length} Cars, \${fleetDrivers.length} Drivers): \${carsSummary} | Drivers: \${driversSummary}\`;
        
        // Backward-compatible fallback for Version 8 webhooks:
        ownerCarPayload = {
          model: \`Rental Fleet (\${fleetVehicles.length} Cars, \${fleetDrivers.length} Drivers)\`,
          plateNumber: fleetVehicles.map(v => v.plate).filter(Boolean).join(', ') || 'Multi-Car Fleet'
        };
      } else if (selectedRole === 'car_owner_driver') {`;

if (!html.includes(targetBlock)) {
  console.error('targetBlock not found!');
  process.exit(1);
}

html = html.replace(targetBlock, repBlock);

const appPayloadTarget = `        ownerCar: ownerCarPayload,
        vehicleProfile: vehicleProfileDesc,`;

const appPayloadRep = `        ownerCar: ownerCarPayload,
        carModel: (selectedRole === 'rental_fleet_operator') ? vehicleProfileDesc : (carModelFinal || null),
        vehicleProfile: vehicleProfileDesc,`;

if (!html.includes(appPayloadTarget)) {
  console.error('appPayloadTarget not found!');
  process.exit(1);
}

html = html.replace(appPayloadTarget, appPayloadRep);

fs.writeFileSync('driver-register.html', html, 'utf8');
console.log('✅ Backward-compatible payload updated in driver-register.html');
