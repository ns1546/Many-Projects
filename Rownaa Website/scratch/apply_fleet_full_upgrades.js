const fs = require('fs');

const targetFiles = [
  'driver-register.html',
  'netlify-driver-portal/index.html',
  'Rownaa-Frontend-Netlify/driver-register.html'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing file:', file);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  // 1. Add Fleet Business Profile fields right under lbl-fleet-agency-desc
  const businessProfileSnippet = `              <!-- SUB-SECTION 0: FLEET BUSINESS & TRADE PROFILE -->
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; margin-bottom:18px;">
                <div style="font-size:0.88rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px; margin-bottom:10px;">
                  <i class="ph-bold ph-briefcase" style="color:var(--accent);"></i>
                  <span id="lbl-fleet-biz-heading">Fleet Business & Commercial Registration (বাণিজ্যিক ফ্লিট পরিচিতি)</span>
                </div>
                <div class="grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
                  <div class="f-group" style="margin:0;">
                    <label class="f-label" style="font-size:0.75rem;">Company / Fleet Name (কোম্পানি / ফ্লিটের নাম) <span class="req">*</span></label>
                    <input type="text" id="fleet-company-name" class="f-control no-prefix" placeholder="e.g. Apex Luxury Rent-A-Car Ltd."/>
                  </div>
                  <div class="f-group" style="margin:0;">
                    <label class="f-label" style="font-size:0.75rem;">Trade License / Reg No. (ট্রেড লাইসেন্স নম্বর)</label>
                    <input type="text" id="fleet-trade-license" class="f-control no-prefix" placeholder="e.g. TRAD/DSCC/019284/2024"/>
                  </div>
                  <div class="f-group" style="margin:0;">
                    <label class="f-label" style="font-size:0.75rem;">Garage / Office Address (অফিস বা গ্যারেজের ঠিকানা)</label>
                    <input type="text" id="fleet-office-address" class="f-control no-prefix" placeholder="e.g. House 14, Road 5, Gulshan-1, Dhaka"/>
                  </div>
                </div>
              </div>\n`;

  if (!content.includes('id="fleet-company-name"')) {
    content = content.replace(
      '<!-- SUB-SECTION A: FLEET VEHICLES LIST -->',
      businessProfileSnippet + '              <!-- SUB-SECTION A: FLEET VEHICLES LIST -->'
    );
  }

  // 2. Add Trade License Upload Zone to Step 5
  const tradeLicenseUploadZone = `            <!-- Upload Zone: Trade License / Business Registration Document (Only for Rental Fleet Operators) -->
            <div class="upload-card-full" id="zone-trade-license-doc" style="display:none; margin-top:12px;">
              <div class="upload-card" id="card-trade-license">
                <input type="file" id="file-trade-license" accept="image/*,.pdf" onchange="handleFileSelected(this, 'trade-license-name', 'card-trade-license')"/>
                <div class="upload-icon"><i class="ph-fill ph-file-text"></i></div>
                <div class="upload-title" id="up-title-trade-license">Trade License / Commercial Registration (ট্রেড লাইসেন্স বা কোম্পানি রেজিস্ট্রেশন)</div>
                <div class="upload-subtitle" id="up-sub-trade-license">Clear photograph or PDF of municipal Trade License or Company Incorporation certificate</div>
                <div class="upload-filename" id="trade-license-name"></div>
              </div>
            </div>\n`;

  if (!content.includes('id="zone-trade-license-doc"')) {
    content = content.replace(
      '<!-- Live Review Summary Card -->',
      tradeLicenseUploadZone + '            <!-- Live Review Summary Card -->'
    );
  }

  // 3. Update selectRoleTile to toggle Trade License upload zone in Step 5
  if (!content.includes('tradeZone.style.display')) {
    content = content.replace(
      'if (carFitZone) carFitZone.style.display = hasVehicle ? \'block\' : \'none\';',
      `if (carFitZone) carFitZone.style.display = hasVehicle ? 'block' : 'none';
      const tradeZone = document.getElementById('zone-trade-license-doc');
      if (tradeZone) tradeZone.style.display = (val === 'rental_fleet_operator') ? 'block' : 'none';`
    );
  }

  // 4. Update renderFleetVehicles to include Blue Book Front & Back + Fitness document uploads
  const oldRenderVehiclesRegex = /function renderFleetVehicles\(\)[\s\S]*?\n    function addFleetVehicleCard/;
  const newRenderVehicles = `function renderFleetVehicles() {
      const container = document.getElementById('fleet-vehicles-list');
      if (!container) return;
      updateFleetCounters();

      container.innerHTML = fleetVehicles.map((v, idx) => \`
        <div class="fleet-item-card" data-idx="\${idx}">
          <div class="fleet-item-header">
            <div class="fleet-item-title">
              <i class="ph-bold ph-car" style="color:var(--accent);"></i>
              <span>\${currentLang === 'bn' ? 'গাড়ি' : 'Vehicle'} #\${idx + 1}: \${v.model || (currentLang === 'bn' ? 'নতুন গাড়ি' : 'New Vehicle')} \${v.plate ? '[' + v.plate + ']' : ''}</span>
            </div>
            \${fleetVehicles.length > 1 ? \`
              <button type="button" class="btn-remove-fleet-item" onclick="removeFleetVehicleCard(\${idx})">
                <i class="ph-bold ph-trash"></i> \${currentLang === 'bn' ? 'মুছুন' : 'Remove'}
              </button>
            \` : ''}
          </div>
          <div class="grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'গাড়ির মডেল ও ব্র্যান্ড' : 'Vehicle Make & Model'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${v.model || ''}" placeholder="e.g. Toyota HiAce / Noah / Axio" oninput="updateVehicleField(\${idx}, 'model', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'রেজিস্ট্রেশন নম্বর প্লেট' : 'Registration Plate'} <span class="req">*</span></label>
              <input type="text" class="f-control no-prefix" value="\${v.plate || ''}" placeholder="e.g. Dhaka Metro Cha 53-1092" oninput="updateVehicleField(\${idx}, 'plate', this.value)" required/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'আসন সংখ্যা' : 'Seating Capacity'}</label>
              <select class="f-control no-prefix" onchange="updateVehicleField(\${idx}, 'seats', this.value)">
                <option value="4 Seats" \${v.seats === '4 Seats' ? 'selected' : ''}>4 Seats (Sedan / Premium)</option>
                <option value="7 Seats" \${v.seats === '7 Seats' ? 'selected' : ''}>7 Seats (MPV / Microbus)</option>
                <option value="10-14 Seats" \${v.seats === '10-14 Seats' ? 'selected' : ''}>10-14 Seats (HiAce / Grand Cabin)</option>
                <option value="28-36 Seats" \${v.seats === '28-36 Seats' ? 'selected' : ''}>28-36 Seats (Coaster / Mini Bus)</option>
              </select>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'ফুয়েল / পাওয়ারট্রেন' : 'Fuel / Powertrain'}</label>
              <select class="f-control no-prefix" onchange="updateVehicleField(\${idx}, 'fuel', this.value)">
                <option value="Octane + CNG" \${v.fuel === 'Octane + CNG' ? 'selected' : ''}>Octane + CNG</option>
                <option value="Octane Only" \${v.fuel === 'Octane Only' ? 'selected' : ''}>Octane Only</option>
                <option value="Diesel" \${v.fuel === 'Diesel' ? 'selected' : ''}>Diesel</option>
                <option value="Hybrid (Petrol/Electric)" \${v.fuel === 'Hybrid (Petrol/Electric)' ? 'selected' : ''}>Hybrid (Petrol/Electric)</option>
                <option value="Electric (EV)" \${v.fuel === 'Electric (EV)' ? 'selected' : ''}>Electric (EV)</option>
              </select>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'উৎপাদনের বছর' : 'Year of Manufacture'}</label>
              <input type="number" class="f-control no-prefix" value="\${v.year || ''}" placeholder="e.g. 2021" min="2010" max="2026" oninput="updateVehicleField(\${idx}, 'year', this.value)"/>
            </div>
            <div class="f-group">
              <label class="f-label" style="font-size:0.75rem;">\${currentLang === 'bn' ? 'ফিটনেস মেয়াদ' : 'Fitness Expiry'}</label>
              <input type="date" class="f-control no-prefix" value="\${v.fitness || ''}" oninput="updateVehicleField(\${idx}, 'fitness', this.value)"/>
            </div>

            <!-- Vehicle Document Uploads (Blue Book Front/Back & Fitness Token) -->
            <div style="grid-column: 1 / -1; display:grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap:10px; margin-top:6px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 10px; text-align:center;">
                <div style="font-size:0.72rem; font-weight:700; color:#fff; margin-bottom:4px;">
                  <i class="ph-bold ph-car-profile" style="color:var(--accent);"></i> \${currentLang === 'bn' ? 'ব্লু-বুক (সামনে)' : 'Blue Book (Front)'}
                </div>
                <div style="font-size:0.67rem; color:var(--text-secondary); margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${v.carLicenseFrontName || (currentLang === 'bn' ? 'কোনো ফাইল নেই' : 'No file chosen')}</div>
                <label for="fleet-car-lic-front-\${idx}" class="btn-outline" style="display:inline-block; padding:3px 10px; font-size:0.70rem; cursor:pointer; border-radius:6px;">
                  <i class="ph-bold ph-upload-simple"></i> \${v.carLicenseFront ? (currentLang === 'bn' ? 'পরিবর্তন' : 'Change') : (currentLang === 'bn' ? 'আপলোড' : 'Upload')}
                </label>
                <input type="file" id="fleet-car-lic-front-\${idx}" accept="image/*" style="display:none;" onchange="handleFleetVehicleDocUpload(this, \${idx}, 'carLicenseFront')"/>
              </div>

              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 10px; text-align:center;">
                <div style="font-size:0.72rem; font-weight:700; color:#fff; margin-bottom:4px;">
                  <i class="ph-bold ph-car-profile" style="color:var(--accent);"></i> \${currentLang === 'bn' ? 'ব্লু-বুক (পেছনে)' : 'Blue Book (Back)'}
                </div>
                <div style="font-size:0.67rem; color:var(--text-secondary); margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${v.carLicenseBackName || (currentLang === 'bn' ? 'কোনো ফাইল নেই' : 'No file chosen')}</div>
                <label for="fleet-car-lic-back-\${idx}" class="btn-outline" style="display:inline-block; padding:3px 10px; font-size:0.70rem; cursor:pointer; border-radius:6px;">
                  <i class="ph-bold ph-upload-simple"></i> \${v.carLicenseBack ? (currentLang === 'bn' ? 'পরিবর্তন' : 'Change') : (currentLang === 'bn' ? 'আপলোড' : 'Upload')}
                </label>
                <input type="file" id="fleet-car-lic-back-\${idx}" accept="image/*" style="display:none;" onchange="handleFleetVehicleDocUpload(this, \${idx}, 'carLicenseBack')"/>
              </div>

              <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 10px; text-align:center;">
                <div style="font-size:0.72rem; font-weight:700; color:#fff; margin-bottom:4px;">
                  <i class="ph-bold ph-certificate" style="color:var(--accent);"></i> \${currentLang === 'bn' ? 'ট্যাক্স / ফিটনেস টোকেন' : 'Fitness / Tax Token'}
                </div>
                <div style="font-size:0.67rem; color:var(--text-secondary); margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${v.carFitnessName || (currentLang === 'bn' ? 'কোনো ফাইল নেই' : 'No file chosen')}</div>
                <label for="fleet-car-fit-\${idx}" class="btn-outline" style="display:inline-block; padding:3px 10px; font-size:0.70rem; cursor:pointer; border-radius:6px;">
                  <i class="ph-bold ph-upload-simple"></i> \${v.carFitness ? (currentLang === 'bn' ? 'পরিবর্তন' : 'Change') : (currentLang === 'bn' ? 'আপলোড' : 'Upload')}
                </label>
                <input type="file" id="fleet-car-fit-\${idx}" accept="image/*" style="display:none;" onchange="handleFleetVehicleDocUpload(this, \${idx}, 'carFitness')"/>
              </div>
            </div>
          </div>
        </div>
      \`).join('');

      renderFleetDrivers();
    }

    async function handleFleetVehicleDocUpload(input, idx, field) {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        const compressed = await compressAndEncodeImage(file, 1400, 1400, 0.78);
        if (fleetVehicles[idx]) {
          fleetVehicles[idx][field] = compressed;
          fleetVehicles[idx][field + 'Name'] = '✓ ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB)';
          renderFleetVehicles();
          populateSummary();
        }
      }
    }

    function addFleetVehicleCard`;

  content = content.replace(oldRenderVehiclesRegex, newRenderVehicles);

  // 5. Update handleDriverApplication to extract trade license, business name, and pass cars in fleetPayload
  if (!content.includes('tradeLicBase64')) {
    content = content.replace(
      'const carFitnessFile = document.getElementById(\'file-car-fitness\')?.files?.[0];',
      `const carFitnessFile = document.getElementById('file-car-fitness')?.files?.[0];
      const tradeLicFile = document.getElementById('file-trade-license')?.files?.[0];`
    );

    content = content.replace(
      'compressAndEncodeImage(carFitnessFile, 1400, 1400, 0.78)',
      `compressAndEncodeImage(carFitnessFile, 1400, 1400, 0.78),
        compressAndEncodeImage(tradeLicFile, 1400, 1400, 0.78)`
    );

    content = content.replace(
      'let [photoBase64, licFrontBase64, licBackBase64, nidFrontBase64, nidBackBase64, carLicFrontBase64, carLicBackBase64, carFitnessBase64] = await Promise.all([',
      'let [photoBase64, licFrontBase64, licBackBase64, nidFrontBase64, nidBackBase64, carLicFrontBase64, carLicBackBase64, carFitnessBase64, tradeLicBase64] = await Promise.all(['
    );

    content = content.replace(
      'if (!licFrontBase64 && fleetDrivers[0].licenseFront) licFrontBase64 = fleetDrivers[0].licenseFront;\n        if (!licBackBase64 && fleetDrivers[0].licenseBack) licBackBase64 = fleetDrivers[0].licenseBack;\n      }',
      `if (!licFrontBase64 && fleetDrivers[0].licenseFront) licFrontBase64 = fleetDrivers[0].licenseFront;
        if (!licBackBase64 && fleetDrivers[0].licenseBack) licBackBase64 = fleetDrivers[0].licenseBack;
      }
      if (selectedRole === 'rental_fleet_operator' && fleetVehicles.length > 0) {
        if (!carLicFrontBase64 && fleetVehicles[0].carLicenseFront) carLicFrontBase64 = fleetVehicles[0].carLicenseFront;
        if (!carLicBackBase64 && fleetVehicles[0].carLicenseBack) carLicBackBase64 = fleetVehicles[0].carLicenseBack;
        if (!carFitnessBase64 && fleetVehicles[0].carFitness) carFitnessBase64 = fleetVehicles[0].carFitness;
      }`
    );

    content = content.replace(
      'fleetPayload = {\n          totalCars: fleetVehicles.length,\n          totalDrivers: fleetDrivers.length,\n          vehicles: fleetVehicles,\n          drivers: formattedFleetDrivers\n        };',
      `fleetPayload = {
          totalCars: fleetVehicles.length,
          totalDrivers: fleetDrivers.length,
          vehicles: fleetVehicles,
          cars: fleetVehicles,
          drivers: formattedFleetDrivers
        };`
    );

    content = content.replace(
      'nidDocBase64: nidFrontBase64\n      };',
      `nidDocBase64: nidFrontBase64,
        tradeLicenseBase64: tradeLicBase64,
        businessName: document.getElementById('fleet-company-name')?.value.trim() || '',
        companyName: document.getElementById('fleet-company-name')?.value.trim() || '',
        tradeLicenseNumber: document.getElementById('fleet-trade-license')?.value.trim() || '',
        tradeLicense: document.getElementById('fleet-trade-license')?.value.trim() || '',
        officeAddress: document.getElementById('fleet-office-address')?.value.trim() || ''
      };`
    );
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated fleet & document capabilities in:', file);
});
