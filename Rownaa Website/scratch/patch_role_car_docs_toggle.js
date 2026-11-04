const fs = require('fs');

let html = fs.readFileSync('driver-register.html', 'utf8');

const targetFunction = `function selectRoleTile(tileEl, val) {
      selectTile(tileEl, 'drv-role-val', val);
      const ownerSec = document.getElementById('owner-vehicle-section');
      const fleetSec = document.getElementById('rental-fleet-master-section');
      if (ownerSec) {
        ownerSec.style.display = (val === 'car_owner_driver') ? 'block' : 'none';
      }
      if (fleetSec) {
        fleetSec.style.display = (val === 'rental_fleet_operator') ? 'block' : 'none';
        if (val === 'rental_fleet_operator') {
          if (fleetVehicles.length === 0) addFleetVehicleCard();
          else renderFleetVehicles();
          if (fleetDrivers.length === 0) addFleetDriverCard();
          else renderFleetDrivers();
        }
      }
    }`;

const updatedFunction = `function selectRoleTile(tileEl, val) {
      selectTile(tileEl, 'drv-role-val', val);
      const ownerSec = document.getElementById('owner-vehicle-section');
      const fleetSec = document.getElementById('rental-fleet-master-section');
      if (ownerSec) {
        ownerSec.style.display = (val === 'car_owner_driver') ? 'block' : 'none';
      }
      if (fleetSec) {
        fleetSec.style.display = (val === 'rental_fleet_operator') ? 'block' : 'none';
        if (val === 'rental_fleet_operator') {
          if (fleetVehicles.length === 0) addFleetVehicleCard();
          else renderFleetVehicles();
          if (fleetDrivers.length === 0) addFleetDriverCard();
          else renderFleetDrivers();
        }
      }

      // Dynamically toggle Car License Upload Cards in Step 5 based on vehicle ownership
      const carDocsHeading = document.getElementById('car-docs-heading');
      const carDocsZone = document.getElementById('zone-car-license-docs');
      const carFitZone = document.getElementById('zone-car-fitness-doc');
      const hasVehicle = (val === 'car_owner_driver' || val === 'rental_fleet_operator');
      if (carDocsHeading) carDocsHeading.style.display = hasVehicle ? 'block' : 'none';
      if (carDocsZone) carDocsZone.style.display = hasVehicle ? 'grid' : 'none';
      if (carFitZone) carFitZone.style.display = hasVehicle ? 'block' : 'none';
    }`;

html = html.replace(targetFunction, updatedFunction);

// Also set default style to display:none on initial load for seeking_fleet_car
html = html.replace('id="car-docs-heading" style="margin-top:22px;', 'id="car-docs-heading" style="display:none; margin-top:22px;');
html = html.replace('id="zone-car-license-docs">', 'id="zone-car-license-docs" style="display:none;">');
html = html.replace('id="zone-car-fitness-doc" style="margin-top:12px;">', 'id="zone-car-fitness-doc" style="display:none; margin-top:12px;">');

fs.writeFileSync('driver-register.html', html, 'utf8');
console.log('Successfully wired dynamic Car License document visibility based on chauffeur role!');
