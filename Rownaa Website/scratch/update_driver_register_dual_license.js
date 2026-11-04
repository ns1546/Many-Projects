const fs = require('fs');

let html = fs.readFileSync('driver-register.html', 'utf8');

// 1. In Step 4 (owner-vehicle-section): Add Car Fitness & Tax Token Expiry if not present
if (!html.includes('id="drv-car-fitness"')) {
  const targetGrid = '<div class="grid-3">';
  const replacement = `<!-- Vehicle License & Registration Validity -->
              <div class="grid-2" style="margin-top:10px;">
                <div class="f-group">
                  <label class="f-label" for="drv-car-fitness"><span id="lbl-car-fitness">Car Fitness & Tax Token Expiry</span></label>
                  <input type="date" id="drv-car-fitness" class="f-control no-prefix" value="2027-06-30"/>
                </div>
                <div class="f-group">
                  <label class="f-label" for="drv-car-fuel"><span id="lbl-car-fuel">Fuel / Powertrain Type</span></label>
                  <select id="drv-car-fuel" class="f-control no-prefix">
                    <option value="Octane / Petrol" selected>Octane / Petrol</option>
                    <option value="Hybrid (Octane+Electric)">Hybrid (Octane + Electric)</option>
                    <option value="Diesel">Diesel</option>
                    <option value="CNG + Octane">CNG + Octane</option>
                    <option value="Electric Vehicle (EV)">100% Electric Vehicle (EV)</option>
                  </select>
                </div>
              </div>
              <div class="grid-3">`;
  html = html.replace(targetGrid, replacement);
  console.log('Added Car Fitness & Tax Token Expiry to Step 4');
}

// 2. In Step 5: Update Driver License titles and add Car License (Front & Back) + Fitness upload zone
if (!html.includes('id="zone-car-license-docs"')) {
  // Update Driver License titles to clearly say "Driver's Driving License"
  html = html.replace(
    '<div class="upload-title" id="up-title-lic-front">BRTA License (Front)</div>',
    '<div class="upload-title" id="up-title-lic-front">Driver\'s Driving License (Front)</div>'
  );
  html = html.replace(
    '<div class="upload-subtitle" id="up-sub-lic-front">Clear front side of card</div>',
    '<div class="upload-subtitle" id="up-sub-lic-front">Clear front of BRTA Driving License card</div>'
  );
  html = html.replace(
    '<div class="upload-title" id="up-title-lic-back">BRTA License (Back)</div>',
    '<div class="upload-title" id="up-title-lic-back">Driver\'s Driving License (Back)</div>'
  );
  html = html.replace(
    '<div class="upload-subtitle" id="up-sub-lic-back">Clear back side of card</div>',
    '<div class="upload-subtitle" id="up-sub-lic-back">Clear back of BRTA Driving License card</div>'
  );

  // Add Car License & Vehicle Documents after NID uploads
  const afterNidZone = `<!-- Upload Zone 4 & 5: NID Smart Card Front & Back -->`;
  const endOfNidZone = `</div>\n            </div>\n\n            <!-- Application Review Summary -->`;
  
  const carDocsHtml = `<!-- Upload Zone 6 & 7: Car / Vehicle License (Registration & Blue Book) -->
            <div class="upload-section-divider" id="car-docs-heading" style="margin-top:22px; margin-bottom:12px; padding-top:14px; border-top:1px dashed var(--border-subtle);">
              <div style="font-family:var(--font-display); font-size:0.95rem; font-weight:700; color:var(--accent); display:flex; align-items:center; gap:8px;">
                <i class="ph-fill ph-car"></i> <span id="title-car-docs">Car License & Vehicle Documents (গাড়ির লাইসেন্স ও ব্লু-বুক)</span>
              </div>
              <p style="font-size:0.75rem; color:var(--text-secondary); margin:4px 0 0 0;" id="desc-car-docs">
                Required for Owner-Drivers & Rental Fleets: Upload clear photos of your BRTA Registration Card / Blue Book and Fitness Token.
              </p>
            </div>

            <div class="upload-subgrid" id="zone-car-license-docs">
              <div class="upload-card" id="card-car-lic-front">
                <input type="file" id="file-car-lic-front" accept="image/*,.pdf" onchange="handleFileSelected(this, 'car-lic-front-name', 'card-car-lic-front')"/>
                <div class="upload-icon"><i class="ph-fill ph-car-profile"></i></div>
                <div class="upload-title" id="up-title-car-lic-front">Car License / Blue Book (Front)</div>
                <div class="upload-subtitle" id="up-sub-car-lic-front">Clear front of vehicle registration</div>
                <div class="upload-filename" id="car-lic-front-name"></div>
              </div>

              <div class="upload-card" id="card-car-lic-back">
                <input type="file" id="file-car-lic-back" accept="image/*,.pdf" onchange="handleFileSelected(this, 'car-lic-back-name', 'card-car-lic-back')"/>
                <div class="upload-icon"><i class="ph-fill ph-car-profile"></i></div>
                <div class="upload-title" id="up-title-car-lic-back">Car License / Blue Book (Back)</div>
                <div class="upload-subtitle" id="up-sub-car-lic-back">Clear back of vehicle registration</div>
                <div class="upload-filename" id="car-lic-back-name"></div>
              </div>
            </div>

            <!-- Upload Zone 8: Tax Token / Fitness Certificate -->
            <div class="upload-card-full" id="zone-car-fitness-doc" style="margin-top:12px;">
              <div class="upload-card" id="card-car-fitness">
                <input type="file" id="file-car-fitness" accept="image/*,.pdf" onchange="handleFileSelected(this, 'car-fitness-name', 'card-car-fitness')"/>
                <div class="upload-icon"><i class="ph-fill ph-certificate"></i></div>
                <div class="upload-title" id="up-title-car-fitness">Car Tax Token & Fitness Certificate (Optional)</div>
                <div class="upload-subtitle" id="up-sub-car-fitness">Clear photo of valid BRTA Tax Token or Fitness paper</div>
                <div class="upload-filename" id="car-fitness-name"></div>
              </div>
            </div>

            <!-- Application Review Summary -->`;

  html = html.replace('<!-- Application Review Summary -->', carDocsHtml);
  console.log('Added Car License & Vehicle Documents upload cards to Step 5');
}

// 3. Update Submission Handler to compress and send Car License documents
const oldExtraction = `      const photoFile = document.getElementById('file-photo')?.files?.[0];
      const licFrontFile = document.getElementById('file-license-front')?.files?.[0];
      const licBackFile = document.getElementById('file-license-back')?.files?.[0];
      const nidFrontFile = document.getElementById('file-nid-front')?.files?.[0];
      const nidBackFile = document.getElementById('file-nid-back')?.files?.[0];

      // Compress and encode all 5 documents in parallel via off-screen HTML5 Canvas (takes ~100ms)
      let [photoBase64, licFrontBase64, licBackBase64, nidFrontBase64, nidBackBase64] = await Promise.all([
        compressAndEncodeImage(photoFile, 1280, 1280, 0.80),
        compressAndEncodeImage(licFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(licBackFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidBackFile, 1400, 1400, 0.78)
      ]);`;

const newExtraction = `      const photoFile = document.getElementById('file-photo')?.files?.[0];
      const licFrontFile = document.getElementById('file-license-front')?.files?.[0];
      const licBackFile = document.getElementById('file-license-back')?.files?.[0];
      const nidFrontFile = document.getElementById('file-nid-front')?.files?.[0];
      const nidBackFile = document.getElementById('file-nid-back')?.files?.[0];
      const carLicFrontFile = document.getElementById('file-car-lic-front')?.files?.[0];
      const carLicBackFile = document.getElementById('file-car-lic-back')?.files?.[0];
      const carFitnessFile = document.getElementById('file-car-fitness')?.files?.[0];

      // Compress and encode all Driver & Car documents in parallel via off-screen HTML5 Canvas
      let [photoBase64, licFrontBase64, licBackBase64, nidFrontBase64, nidBackBase64, carLicFrontBase64, carLicBackBase64, carFitnessBase64] = await Promise.all([
        compressAndEncodeImage(photoFile, 1280, 1280, 0.80),
        compressAndEncodeImage(licFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(licBackFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidBackFile, 1400, 1400, 0.78),
        compressAndEncodeImage(carLicFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(carLicBackFile, 1400, 1400, 0.78),
        compressAndEncodeImage(carFitnessFile, 1400, 1400, 0.78)
      ]);`;

html = html.replace(oldExtraction, newExtraction);
console.log('Updated document compression for dual licenses');

// 4. Update applicationPayload with separate Driver License & Car License fields
const oldPayloadLic = `        licenseNumber: document.getElementById('drv-license').value.trim() || 'N/A',
        licenseType: licTypeFinal || 'Professional Light',
        licenseExpiry: document.getElementById('drv-expiry').value || '2030-01-01',`;

const newPayloadLic = `        licenseNumber: document.getElementById('drv-license').value.trim() || 'N/A',
        licenseType: licTypeFinal || 'Professional Light',
        licenseExpiry: document.getElementById('drv-expiry').value || '2030-01-01',
        driverLicenseNumber: document.getElementById('drv-license').value.trim() || 'N/A',
        driverLicenseType: licTypeFinal || 'Professional Light',
        driverLicenseExpiry: document.getElementById('drv-expiry').value || '2030-01-01',
        carLicenseNumber: (selectedRole === 'car_owner_driver' ? (document.getElementById('drv-car-plate')?.value.trim() || '') : (selectedRole === 'rental_fleet_operator' ? (fleetVehicles.map(v => v.plate).filter(Boolean).join(', ')) : '')),
        carPlate: (selectedRole === 'car_owner_driver' ? (document.getElementById('drv-car-plate')?.value.trim() || '') : (selectedRole === 'rental_fleet_operator' ? (fleetVehicles.map(v => v.plate).filter(Boolean).join(', ')) : '')),
        carFitnessExpiry: (selectedRole === 'car_owner_driver' ? (document.getElementById('drv-car-fitness')?.value || '') : ''),`;

html = html.replace(oldPayloadLic, newPayloadLic);

const oldPayloadBase64 = `        photoBase64: photoBase64,
        licenseFrontBase64: licFrontBase64,
        licenseBackBase64: licBackBase64,
        licenseDocBase64: licFrontBase64, // Legacy fallback
        nidFrontBase64: nidFrontBase64,
        nidBackBase64: nidBackBase64,
        nidDocBase64: nidFrontBase64 // Legacy fallback`;

const newPayloadBase64 = `        photoBase64: photoBase64,
        licenseFrontBase64: licFrontBase64,
        licenseBackBase64: licBackBase64,
        driverLicenseFrontBase64: licFrontBase64,
        driverLicenseBackBase64: licBackBase64,
        carLicenseFrontBase64: carLicFrontBase64,
        carLicenseBackBase64: carLicBackBase64,
        carFitnessBase64: carFitnessBase64,
        carTaxTokenBase64: carFitnessBase64,
        licenseDocBase64: licFrontBase64,
        nidFrontBase64: nidFrontBase64,
        nidBackBase64: nidBackBase64,
        nidDocBase64: nidFrontBase64`;

html = html.replace(oldPayloadBase64, newPayloadBase64);
console.log('Updated applicationPayload with dual license schema');

// Write back
fs.writeFileSync('driver-register.html', html, 'utf8');
console.log('Successfully saved driver-register.html');

