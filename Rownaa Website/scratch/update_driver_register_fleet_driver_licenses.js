const fs = require('fs');

let html = fs.readFileSync('driver-register.html', 'utf8');

// 1. Update initial fleetDrivers state in JS
const targetInitialDrivers = `    let fleetDrivers = [
      {
        id: 1,
        name: 'Md. Kamal Hossain',
        phone: '01712000001',
        nid: '1989269458000123',
        license: 'DK0892341A',
        vehicleIndex: 0
      }
    ];`;

const repInitialDrivers = `    let fleetDrivers = [
      {
        id: 1,
        name: 'Md. Kamal Hossain',
        phone: '01712000001',
        nid: '1989269458000123',
        license: 'DK0892341A',
        vehicleIndex: 0,
        licenseFront: null,
        licenseFrontName: '',
        licenseBack: null,
        licenseBackName: ''
      }
    ];`;

if (!html.includes(targetInitialDrivers)) {
  console.error('targetInitialDrivers not found in driver-register.html!');
  process.exit(1);
}
html = html.replace(targetInitialDrivers, repInitialDrivers);

// 2. Update addFleetDriverCard() in JS
const targetAddDriver = `    function addFleetDriverCard() {
      fleetDrivers.push({
        id: Date.now(),
        name: '',
        phone: '',
        nid: '',
        license: '',
        vehicleIndex: 0
      });
      renderFleetDrivers();
    }`;

const repAddDriver = `    function addFleetDriverCard() {
      fleetDrivers.push({
        id: Date.now(),
        name: '',
        phone: '',
        nid: '',
        license: '',
        vehicleIndex: 0,
        licenseFront: null,
        licenseFrontName: '',
        licenseBack: null,
        licenseBackName: ''
      });
      renderFleetDrivers();
    }`;

if (!html.includes(targetAddDriver)) {
  console.error('targetAddDriver not found in driver-register.html!');
  process.exit(1);
}
html = html.replace(targetAddDriver, repAddDriver);

// 3. Update renderFleetDrivers() to include License Front and Back Upload Cards
const targetRenderDrivers = `          <div class="grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'ড্রাইভারের পূর্ণ নাম' : 'Driver Full Name'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${d.name || ''}" placeholder="e.g. Md. Kamal Hossain" oninput="updateDriverField(\${idx}, 'name', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'মোবাইল / হোয়াটসঅ্যাপ' : 'Mobile / WhatsApp'} <span class="req">*</span></label>
              <input type="tel" class="f-control no-prefix" value="\${d.phone || ''}" placeholder="e.g. 01712000000" oninput="updateDriverField(\${idx}, 'phone', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'জাতীয় পরিচয়পত্র (NID)' : 'NID Smart Card'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${d.nid || ''}" placeholder="10 / 17 digit NID" oninput="updateDriverField(\${idx}, 'nid', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'বিআরটিএ লাইসেন্স নম্বর' : 'BRTA License No'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${d.license || ''}" placeholder="e.g. DK0892341A" oninput="updateDriverField(\${idx}, 'license', this.value)" required/>
            </div>
            <div class="f-group" style="grid-column:span 2;">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'নির্ধারিত গাড়ি (Assigned Car)' : 'Assigned Fleet Vehicle'}</label>
              <select class="f-control no-prefix driver-vehicle-select" onchange="updateDriverField(\${idx}, 'vehicleIndex', this.value)">
                \${fleetVehicles.map((v, vIdx) => \`
                  <option value="\${vIdx}" \${d.vehicleIndex == vIdx ? 'selected' : ''}>
                    \${currentLang === 'bn' ? 'গাড়ি' : 'Car'} #\${vIdx + 1}: \${v.model || (currentLang === 'bn' ? 'গাড়ি ' + (vIdx + 1) : 'Vehicle ' + (vIdx + 1))} \${v.plate ? '[' + v.plate + ']' : ''}
                  </option>
                \`).join('')}
                <option value="-1" \${d.vehicleIndex == -1 ? 'selected' : ''}>🔄 \${currentLang === 'bn' ? 'ঘূর্ণায়মান পুল / স্ট্যান্ডবাই' : 'Rotating / Standby Pool'}</option>
              </select>
            </div>
          </div>
        </div>`;

const repRenderDrivers = `          <div class="grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'ড্রাইভারের পূর্ণ নাম' : 'Driver Full Name'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${d.name || ''}" placeholder="e.g. Md. Kamal Hossain" oninput="updateDriverField(\${idx}, 'name', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'মোবাইল / হোয়াটসঅ্যাপ' : 'Mobile / WhatsApp'} <span class="req">*</span></label>
              <input type="tel" class="f-control no-prefix" value="\${d.phone || ''}" placeholder="e.g. 01712000000" oninput="updateDriverField(\${idx}, 'phone', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'জাতীয় পরিচয়পত্র (NID)' : 'NID Smart Card'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${d.nid || ''}" placeholder="10 / 17 digit NID" oninput="updateDriverField(\${idx}, 'nid', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'বিআরটিএ লাইসেন্স নম্বর' : 'BRTA License No'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${d.license || ''}" placeholder="e.g. DK0892341A" oninput="updateDriverField(\${idx}, 'license', this.value)" required/>
            </div>
            <div class="f-group" style="grid-column:span 2;">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'নির্ধারিত গাড়ি (Assigned Car)' : 'Assigned Fleet Vehicle'}</label>
              <select class="f-control no-prefix driver-vehicle-select" onchange="updateDriverField(\${idx}, 'vehicleIndex', this.value)">
                \${fleetVehicles.map((v, vIdx) => \`
                  <option value="\${vIdx}" \${d.vehicleIndex == vIdx ? 'selected' : ''}>
                    \${currentLang === 'bn' ? 'গাড়ি' : 'Car'} #\${vIdx + 1}: \${v.model || (currentLang === 'bn' ? 'গাড়ি ' + (vIdx + 1) : 'Vehicle ' + (vIdx + 1))} \${v.plate ? '[' + v.plate + ']' : ''}
                  </option>
                \`).join('')}
                <option value="-1" \${d.vehicleIndex == -1 ? 'selected' : ''}>🔄 \${currentLang === 'bn' ? 'ঘূর্ণায়মান পুল / স্ট্যান্ডবাই' : 'Rotating / Standby Pool'}</option>
              </select>
            </div>

            <!-- Driving License Document Uploads (Front & Back) for this Fleet Driver -->
            <div style="grid-column: 1 / -1; display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:10px; margin-top:6px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
              <!-- License Front -->
              <div class="f-group" style="margin-bottom:0;">
                <label class="f-label" style="font-size:0.72rem; display:flex; justify-content:space-between; align-items:center;">
                  <span>\${currentLang === 'bn' ? 'ড্রাইভিং লাইসেন্স (সামনের অংশ)' : 'Driving License (Front)'}</span>
                  <span style="font-size:0.65rem; color:var(--text-tertiary);">JPG/PNG</span>
                </label>
                <input type="file" id="fleet-lic-front-\${idx}" accept="image/*" style="display:none;" onchange="handleFleetDriverLicenseUpload(this, \${idx}, 'licenseFront')"/>
                <button type="button" onclick="document.getElementById('fleet-lic-front-\${idx}').click()" style="width:100%; padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid \${d.licenseFront ? 'var(--accent)' : 'rgba(255,255,255,0.12)'}; border-radius:8px; color:\${d.licenseFront ? 'var(--accent)' : '#fff'}; font-size:0.75rem; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; transition:all 0.2s;">
                  <i class="ph-bold \${d.licenseFront ? 'ph-check-circle' : 'ph-upload-simple'}"></i>
                  <span>\${d.licenseFrontName || (currentLang === 'bn' ? 'লাইসেন্স (সামনে) আপলোড' : 'Upload License (Front)')}</span>
                </button>
              </div>

              <!-- License Back -->
              <div class="f-group" style="margin-bottom:0;">
                <label class="f-label" style="font-size:0.72rem; display:flex; justify-content:space-between; align-items:center;">
                  <span>\${currentLang === 'bn' ? 'ড্রাইভিং লাইসেন্স (পেছনের অংশ)' : 'Driving License (Back)'}</span>
                  <span style="font-size:0.65rem; color:var(--text-tertiary);">JPG/PNG</span>
                </label>
                <input type="file" id="fleet-lic-back-\${idx}" accept="image/*" style="display:none;" onchange="handleFleetDriverLicenseUpload(this, \${idx}, 'licenseBack')"/>
                <button type="button" onclick="document.getElementById('fleet-lic-back-\${idx}').click()" style="width:100%; padding:8px 12px; background:rgba(255,255,255,0.03); border:1px solid \${d.licenseBack ? 'var(--accent)' : 'rgba(255,255,255,0.12)'}; border-radius:8px; color:\${d.licenseBack ? 'var(--accent)' : '#fff'}; font-size:0.75rem; font-weight:600; display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; transition:all 0.2s;">
                  <i class="ph-bold \${d.licenseBack ? 'ph-check-circle' : 'ph-upload-simple'}"></i>
                  <span>\${d.licenseBackName || (currentLang === 'bn' ? 'লাইসেন্স (পেছনে) আপলোড' : 'Upload License (Back)')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>`;

if (!html.includes(targetRenderDrivers)) {
  console.error('targetRenderDrivers not found in driver-register.html!');
  process.exit(1);
}
html = html.replace(targetRenderDrivers, repRenderDrivers);

// 4. Add handleFleetDriverLicenseUpload in JS
const targetFuncAdd = `    function updateDriverField(index, field, value) {
      if (fleetDrivers[index]) {
        fleetDrivers[index][field] = value;
      }
    }`;

const repFuncAdd = `    function updateDriverField(index, field, value) {
      if (fleetDrivers[index]) {
        fleetDrivers[index][field] = value;
      }
    }

    async function handleFleetDriverLicenseUpload(input, idx, field) {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const compressed = await compressAndEncodeImage(file, 1400, 1400, 0.78);
        if (fleetDrivers[idx]) {
          fleetDrivers[idx][field] = compressed;
          fleetDrivers[idx][field + 'Name'] = '✓ ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB)';
          renderFleetDrivers();
          populateSummary();
        }
      }
    }`;

if (!html.includes(targetFuncAdd)) {
  console.error('targetFuncAdd not found in driver-register.html!');
  process.exit(1);
}
html = html.replace(targetFuncAdd, repFuncAdd);

// 5. Update handleDriverApplication(e) when serializing fleetPayload
const targetFleetPayload = `      if (selectedRole === 'rental_fleet_operator') {
        fleetPayload = {
          totalCars: fleetVehicles.length,
          totalDrivers: fleetDrivers.length,
          vehicles: fleetVehicles,
          drivers: fleetDrivers
        };`;

const repFleetPayload = `      if (selectedRole === 'rental_fleet_operator') {
        // Prepare fleet drivers with license front & back documents
        const formattedFleetDrivers = fleetDrivers.map((d, dIdx) => ({
          name: d.name || ('Driver #' + (dIdx + 1)),
          phone: d.phone || 'N/A',
          nid: d.nid || 'N/A',
          license: d.license || 'N/A',
          vehicleIndex: d.vehicleIndex,
          licenseFront: d.licenseFront || null,
          licenseBack: d.licenseBack || null,
          licenseFrontBase64: d.licenseFront || null,
          licenseBackBase64: d.licenseBack || null,
          hasLicenseDocs: !!(d.licenseFront && d.licenseBack)
        }));

        fleetPayload = {
          totalCars: fleetVehicles.length,
          totalDrivers: fleetDrivers.length,
          vehicles: fleetVehicles,
          drivers: formattedFleetDrivers
        };`;

if (!html.includes(targetFleetPayload)) {
  console.error('targetFleetPayload not found in driver-register.html!');
  process.exit(1);
}
html = html.replace(targetFleetPayload, repFleetPayload);

// 6. Fallback fleet driver #1 license for main applicant license front/back if empty
const targetLicFallback = `      const [photoBase64, licFrontBase64, licBackBase64, nidFrontBase64, nidBackBase64] = await Promise.all([
        compressAndEncodeImage(photoFile, 1280, 1280, 0.80),
        compressAndEncodeImage(licFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(licBackFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidBackFile, 1400, 1400, 0.78)
      ]);`;

const repLicFallback = `      let [photoBase64, licFrontBase64, licBackBase64, nidFrontBase64, nidBackBase64] = await Promise.all([
        compressAndEncodeImage(photoFile, 1280, 1280, 0.80),
        compressAndEncodeImage(licFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(licBackFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidFrontFile, 1400, 1400, 0.78),
        compressAndEncodeImage(nidBackFile, 1400, 1400, 0.78)
      ]);

      // If registering as Rental Fleet and main license inputs were skipped in Step 5,
      // fallback to fleet driver #1's uploaded license front & back
      if (selectedRole === 'rental_fleet_operator' && fleetDrivers.length > 0) {
        if (!licFrontBase64 && fleetDrivers[0].licenseFront) licFrontBase64 = fleetDrivers[0].licenseFront;
        if (!licBackBase64 && fleetDrivers[0].licenseBack) licBackBase64 = fleetDrivers[0].licenseBack;
      }`;

if (!html.includes(targetLicFallback)) {
  console.error('targetLicFallback not found in driver-register.html!');
  process.exit(1);
}
html = html.replace(targetLicFallback, repLicFallback);

fs.writeFileSync('driver-register.html', html, 'utf8');
console.log('✅ driver-register.html successfully updated with Fleet Drivers Driving License Front & Back upload options!');
