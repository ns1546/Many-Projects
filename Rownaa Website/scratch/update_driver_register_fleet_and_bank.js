const fs = require('fs');

let html = fs.readFileSync('driver-register.html', 'utf8');

// 1. Update I18N.en.step4
const enStep4Target = `        step4: {
          title: '4. Chauffeur Role, Payout Wallet & Fleet Info',
          desc: 'Specify your employment mode and provide your mobile wallet for instant payments and trip allowances.',
          lblRole: 'Select Your Driving Status',
          role1Title: 'Fleet Chauffeur',
          role1Desc: 'Professional chauffeur looking to be assigned to a Rownaa Fleet Partner\\'s vehicle.',
          role2Title: 'Owner-Driver',
          role2Desc: 'I own a personal vehicle (Sedan/SUV/HiAce) and will drive it myself for Rownaa.',
          role3Title: 'On-Demand Standby',
          role3Desc: 'Available for airport emergency dispatch, tour replacement, and VIP standbys.',`;

const enStep4Replacement = `        step4: {
          title: '4. Chauffeur Role, Payout Wallet & Fleet Info',
          desc: 'Specify your employment mode, register multiple fleet vehicles or chauffeurs, and configure payout preferences.',
          lblRole: 'Select Your Driving Status',
          role1Title: 'Fleet Chauffeur',
          role1Desc: 'Professional chauffeur looking to be assigned to a Rownaa Fleet Partner\\'s vehicle.',
          role2Title: 'Owner-Driver',
          role2Desc: 'I own a personal vehicle (Sedan/SUV/HiAce) and will drive it myself for Rownaa.',
          role4Title: 'Rental Car & Fleet Service',
          role4Desc: 'Rental agency or fleet owner with multiple registered vehicles and employed drivers.',
          role3Title: 'On-Demand Standby',
          role3Desc: 'Available for airport emergency dispatch, tour replacement, and VIP standbys.',
          fleetAgencyTitle: 'Rental Car Fleet & Driver Operations',
          fleetAgencyDesc: 'Register your rental agency fleet vehicles and list your employed chauffeurs for centralized dispatch, verified bookings, and consolidated payout management.',
          fleetCarsHeading: '1. Registered Fleet Vehicles',
          fleetDriversHeading: '2. Employed Chauffeurs / Assigned Drivers',
          btnAddCar: '+ Add Another Vehicle',
          btnAddDriver: '+ Add Another Driver',`;

if (!html.includes(enStep4Target)) {
  console.error('Target enStep4Target not found!');
  process.exit(1);
}
html = html.replace(enStep4Target, enStep4Replacement);

// 2. Update I18N.bn.step4
const bnStep4Target = `        step4: {
          title: '৪. কাজের ভূমিকা, পেমেন্ট ওয়ালেট ও গাড়ির তথ্য',
          desc: 'নিজের গাড়ি চালাবেন নাকি কোম্পানির গাড়ি চালাবেন তা নির্ধারণ করুন এবং পেমেন্ট নম্বর দিন।',
          lblRole: 'আপনার কাজের ধরন নির্বাচন করুন',
          role1Title: 'ফ্লিট শফার (কোম্পানির গাড়ি)',
          role1Desc: 'রওনার নিবন্ধিত ফ্লিট পার্টনারের গাড়ি ড্রাইভ করতে ইচ্ছুক পেশাদার ড্রাইভার।',
          role2Title: 'ওনার-ড্রাইভার (নিজের গাড়ি)',
          role2Desc: 'আমার নিজস্ব ব্যক্তিগত গাড়ি রয়েছে (সেডান/এসইউভি) এবং আমি নিজেই ড্রাইভ করব।',
          role3Title: 'অন-ডিমান্ড স্ট্যান্ডবাই',
          role3Desc: 'জরুরি এয়ারপোর্ট ট্রান্সফার ও ট্যুর রিপ্লেসমেন্ট ড্রাইভার হিসেবে কাজ।',`;

const bnStep4Replacement = `        step4: {
          title: '৪. কাজের ভূমিকা, পেমেন্ট ওয়ালেট ও গাড়ির তথ্য',
          desc: 'কাজের ভূমিকা নির্ধারণ করুন, একাধিক গাড়ি ও ড্রাইভারের তথ্য যুক্ত করুন এবং পেমেন্ট বিবরণ প্রদান করুন।',
          lblRole: 'আপনার কাজের ধরন নির্বাচন করুন',
          role1Title: 'ফ্লিট শফার (কোম্পানির গাড়ি)',
          role1Desc: 'রওনার নিবন্ধিত ফ্লিট পার্টনারের গাড়ি ড্রাইভ করতে ইচ্ছুক পেশাদার ড্রাইভার।',
          role2Title: 'ওনার-ড্রাইভার (নিজের গাড়ি)',
          role2Desc: 'আমার নিজস্ব ব্যক্তিগত গাড়ি রয়েছে (সেডান/এসইউভি) এবং আমি নিজেই ড্রাইভ করব।',
          role4Title: 'রেন্ট-এ-কার ও ফ্লিট সার্ভিস',
          role4Desc: 'একাধিক গাড়ি ও শফার সম্বলিত রেন্ট-এ-কার ব্যবসা বা ফ্লিট সেবা প্রতিষ্ঠান।',
          role3Title: 'অন-ডিমান্ড স্ট্যান্ডবাই',
          role3Desc: 'জরুরি এয়ারপোর্ট ট্রান্সফার ও ট্যুর রিপ্লেসমেন্ট ড্রাইভার হিসেবে কাজ।',
          fleetAgencyTitle: 'রেন্ট-এ-কার ফ্লিট ও ড্রাইভার পরিচালনা',
          fleetAgencyDesc: 'আপনার রেন্ট-এ-কার সার্ভিসের আওতাধীন একাধিক গাড়ি ও চালকদের তালিকা প্রদান করুন।',
          fleetCarsHeading: '১. নিবন্ধিত ফ্লিটের গাড়িসমূহ',
          fleetDriversHeading: '২. নিয়োজিত শফার / অ্যাসাইনকৃত ড্রাইভারবৃন্দ',
          btnAddCar: '+ আরও গাড়ি যোগ করুন',
          btnAddDriver: '+ আরও ড্রাইভার যোগ করুন',`;

if (!html.includes(bnStep4Target)) {
  console.error('Target bnStep4Target not found!');
  process.exit(1);
}
html = html.replace(bnStep4Target, bnStep4Replacement);

// 3. Update setLanguage(lang) to update role-opt-4 and fleet labels
const setLangTarget = `      const r3t = document.getElementById('role-opt-3-title'); if (r3t) r3t.textContent = s4.role3Title;
      const r3d = document.getElementById('role-opt-3-desc'); if (r3d) r3d.textContent = s4.role3Desc;`;

const setLangReplacement = `      const r3t = document.getElementById('role-opt-3-title'); if (r3t) r3t.textContent = s4.role3Title;
      const r3d = document.getElementById('role-opt-3-desc'); if (r3d) r3d.textContent = s4.role3Desc;
      const r4t = document.getElementById('role-opt-4-title'); if (r4t && s4.role4Title) r4t.textContent = s4.role4Title;
      const r4d = document.getElementById('role-opt-4-desc'); if (r4d && s4.role4Desc) r4d.textContent = s4.role4Desc;
      const fTitle = document.getElementById('lbl-fleet-agency-title'); if (fTitle && s4.fleetAgencyTitle) fTitle.textContent = s4.fleetAgencyTitle;
      const fDesc = document.getElementById('lbl-fleet-agency-desc'); if (fDesc && s4.fleetAgencyDesc) fDesc.textContent = s4.fleetAgencyDesc;
      const fCarsHead = document.getElementById('lbl-fleet-cars-heading'); if (fCarsHead && s4.fleetCarsHeading) fCarsHead.textContent = s4.fleetCarsHeading;
      const fDrvsHead = document.getElementById('lbl-fleet-drivers-heading'); if (fDrvsHead && s4.fleetDriversHeading) fDrvsHead.textContent = s4.fleetDriversHeading;
      const fAddCar = document.getElementById('lbl-btn-add-car'); if (fAddCar && s4.btnAddCar) fAddCar.textContent = s4.btnAddCar;
      const fAddDrv = document.getElementById('lbl-btn-add-driver'); if (fAddDrv && s4.btnAddDriver) fAddDrv.textContent = s4.btnAddDriver;`;

if (!html.includes(setLangTarget)) {
  console.error('Target setLangTarget not found!');
  process.exit(1);
}
html = html.replace(setLangTarget, setLangReplacement);

// 4. Update selectRoleTile and insert Fleet State Engine and Payout Engine
const selectRoleTarget = `    function selectRoleTile(tileEl, val) {
      selectTile(tileEl, 'drv-role-val', val);
      const vehicleSec = document.getElementById('owner-vehicle-section');
      if (vehicleSec) {
        vehicleSec.style.display = (val === 'car_owner_driver') ? 'block' : 'none';
      }
    }`;

const selectRoleReplacement = `    // =========================================================
    // DYNAMIC RENTAL CAR FLEET & MULTIPLE DRIVERS ENGINE
    // =========================================================
    let fleetVehicles = [
      {
        id: 1,
        model: 'Toyota Noah (7-Seater)',
        plate: 'Dhaka Metro Cha 53-1092',
        seats: '7 Seats',
        fuel: 'Octane + CNG',
        year: '2021',
        fitness: '2027-06-30'
      }
    ];

    let fleetDrivers = [
      {
        id: 1,
        name: 'Md. Kamal Hossain',
        phone: '01712000001',
        nid: '1989269458000123',
        license: 'DK0892341A',
        vehicleIndex: 0
      }
    ];

    function updateFleetCounters() {
      const cNum = document.getElementById('cars-count-num');
      const dNum = document.getElementById('drivers-count-num');
      if (cNum) cNum.textContent = fleetVehicles.length;
      if (dNum) dNum.textContent = fleetDrivers.length;
    }

    function renderFleetVehicles() {
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
          </div>
        </div>
      \`).join('');

      renderFleetDrivers();
    }

    function addFleetVehicleCard() {
      fleetVehicles.push({
        id: Date.now(),
        model: '',
        plate: '',
        seats: '7 Seats',
        fuel: 'Octane + CNG',
        year: '2022',
        fitness: '2027-12-31'
      });
      renderFleetVehicles();
    }

    function removeFleetVehicleCard(index) {
      if (fleetVehicles.length <= 1) {
        alert(currentLang === 'bn' ? 'কমপক্ষে একটি গাড়ির তথ্য থাকতে হবে।' : 'At least one vehicle must remain registered.');
        return;
      }
      fleetVehicles.splice(index, 1);
      renderFleetVehicles();
    }

    function updateVehicleField(index, field, value) {
      if (fleetVehicles[index]) {
        fleetVehicles[index][field] = value;
        if (field === 'model' || field === 'plate') {
          updateDriverAssignedVehicleOptions();
        }
      }
    }

    function renderFleetDrivers() {
      const container = document.getElementById('fleet-drivers-list');
      if (!container) return;
      updateFleetCounters();

      container.innerHTML = fleetDrivers.map((d, idx) => \`
        <div class="fleet-item-card" data-idx="\${idx}">
          <div class="fleet-item-header">
            <div class="fleet-item-title">
              <i class="ph-bold ph-identification-badge" style="color:var(--accent);"></i>
              <span>\${currentLang === 'bn' ? 'ড্রাইভার' : 'Driver'} #\${idx + 1}: \${d.name || (currentLang === 'bn' ? 'নতুন শফার' : 'New Chauffeur')} \${d.phone ? '(' + d.phone + ')' : ''}</span>
            </div>
            \${fleetDrivers.length > 1 ? \`
              <button type="button" class="btn-remove-fleet-item" onclick="removeFleetDriverCard(\${idx})">
                <i class="ph-bold ph-trash"></i> \${currentLang === 'bn' ? 'মুছুন' : 'Remove'}
              </button>
            \` : ''}
          </div>
          <div class="grid-3" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px;">
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
        </div>
      \`).join('');
    }

    function updateDriverAssignedVehicleOptions() {
      document.querySelectorAll('.driver-vehicle-select').forEach((sel, dIdx) => {
        const curVal = fleetDrivers[dIdx]?.vehicleIndex ?? 0;
        sel.innerHTML = fleetVehicles.map((v, vIdx) => \`
          <option value="\${vIdx}" \${curVal == vIdx ? 'selected' : ''}>
            \${currentLang === 'bn' ? 'গাড়ি' : 'Car'} #\${vIdx + 1}: \${v.model || (currentLang === 'bn' ? 'গাড়ি ' + (vIdx + 1) : 'Vehicle ' + (vIdx + 1))} \${v.plate ? '[' + v.plate + ']' : ''}
          </option>
        \`).join('') + \`<option value="-1" \${curVal == -1 ? 'selected' : ''}>🔄 \${currentLang === 'bn' ? 'ঘূর্ণায়মান পুল / স্ট্যান্ডবাই' : 'Rotating / Standby Pool'}</option>\`;
      });
    }

    function addFleetDriverCard() {
      fleetDrivers.push({
        id: Date.now(),
        name: '',
        phone: '',
        nid: '',
        license: '',
        vehicleIndex: 0
      });
      renderFleetDrivers();
    }

    function removeFleetDriverCard(index) {
      if (fleetDrivers.length <= 1) {
        alert(currentLang === 'bn' ? 'কমপক্ষে একজন ড্রাইভারের তথ্য থাকতে হবে।' : 'At least one driver must remain registered.');
        return;
      }
      fleetDrivers.splice(index, 1);
      renderFleetDrivers();
    }

    function updateDriverField(index, field, value) {
      if (fleetDrivers[index]) {
        fleetDrivers[index][field] = value;
      }
    }

    function selectRoleTile(tileEl, val) {
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

if (!html.includes(selectRoleTarget)) {
  console.error('Target selectRoleTarget not found!');
  process.exit(1);
}
html = html.replace(selectRoleTarget, selectRoleReplacement);

// 5. Update handleDynamicPayoutSelect and add handleDynamicBankSelect
const payoutTarget = `    function handleDynamicPayoutSelect(val) {
      const wrap = document.getElementById('wrap-custom-payout');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }`;

const payoutReplacement = `    function handleDynamicPayoutSelect(val) {
      const customWrap = document.getElementById('wrap-custom-payout');
      if (customWrap) customWrap.style.display = (val === '__custom__') ? 'block' : 'none';

      const mfsContainer = document.getElementById('payout-mfs-container');
      const bankContainer = document.getElementById('payout-bank-container');
      const mfsInput = document.getElementById('drv-payout-number');
      const isBypass = !!(driverSettings && driverSettings.bypassMandatory);

      if (val === 'Bank Transfer') {
        if (mfsContainer) mfsContainer.style.display = 'none';
        if (bankContainer) bankContainer.style.display = 'block';
        if (mfsInput) mfsInput.required = false;

        ['bank-name', 'bank-branch', 'bank-account-name', 'bank-account-number'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.required = !isBypass;
        });
      } else {
        if (mfsContainer) mfsContainer.style.display = 'block';
        if (bankContainer) bankContainer.style.display = 'none';
        if (mfsInput) mfsInput.required = !isBypass;

        ['bank-name', 'bank-branch', 'bank-account-name', 'bank-account-number'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.required = false;
        });
      }
    }

    function handleDynamicBankSelect(val) {
      const wrap = document.getElementById('wrap-custom-bank');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }`;

if (!html.includes(payoutTarget)) {
  console.error('Target payoutTarget not found!');
  process.exit(1);
}
html = html.replace(payoutTarget, payoutReplacement);

// 6. Update populateSummary()
const summaryTarget = `      const roleMap = {
        'seeking_fleet_car': currentLang === 'bn' ? 'ফ্লিট শফার' : 'Fleet Chauffeur',
        'car_owner_driver': currentLang === 'bn' ? 'ওনার-ড্রাইভার' : 'Owner-Driver',
        'part_time_freelance': currentLang === 'bn' ? 'অন-ডিমান্ড স্ট্যান্ডবাই' : 'On-Demand Standby'
      };
      const city = resolveFieldValue('drv-city', 'drv-city-custom');
      const payoutMethod = resolveFieldValue('drv-payout-method', 'drv-payout-custom');
      const payoutNum = document.getElementById('drv-payout-number').value || '—';`;

const summaryReplacement = `      const roleMap = {
        'seeking_fleet_car': currentLang === 'bn' ? 'ফ্লিট শফার' : 'Fleet Chauffeur',
        'car_owner_driver': currentLang === 'bn' ? 'ওনার-ড্রাইভার' : 'Owner-Driver',
        'rental_fleet_operator': currentLang === 'bn' ? \`রেন্ট-এ-কার ফ্লিট (\${fleetVehicles.length} গাড়ি, \${fleetDrivers.length} ড্রাইভার)\` : \`Rental Fleet (\${fleetVehicles.length} Cars, \${fleetDrivers.length} Drivers)\`,
        'part_time_freelance': currentLang === 'bn' ? 'অন-ডিমান্ড স্ট্যান্ডবাই' : 'On-Demand Standby'
      };
      const city = resolveFieldValue('drv-city', 'drv-city-custom');
      const payoutMethod = resolveFieldValue('drv-payout-method', 'drv-payout-custom');
      
      let payoutDisplay = '—';
      if (payoutMethod === 'Bank Transfer') {
        const bankNameFinal = resolveFieldValue('bank-name', 'bank-name-custom');
        const branch = document.getElementById('bank-branch')?.value || '';
        const accName = document.getElementById('bank-account-name')?.value || '';
        const accNum = document.getElementById('bank-account-number')?.value || '';
        payoutDisplay = \`\${bankNameFinal || 'Bank'} (\${branch || 'Branch'}) - A/C: \${accNum || '—'} [\${accName || '—'}]\`;
      } else {
        const payoutNum = document.getElementById('drv-payout-number')?.value || '—';
        payoutDisplay = \`\${payoutMethod} (\${payoutNum})\`;
      }`;

if (!html.includes(summaryTarget)) {
  console.error('Target summaryTarget not found!');
  process.exit(1);
}
html = html.replace(summaryTarget, summaryReplacement);

const sumPayoutTarget = `      document.getElementById('sum-payout').textContent = \`\${payoutMethod} (\${payoutNum})\`;`;
const sumPayoutReplacement = `      document.getElementById('sum-payout').textContent = payoutDisplay;`;
if (!html.includes(sumPayoutTarget)) {
  console.error('Target sumPayoutTarget not found!');
  process.exit(1);
}
html = html.replace(sumPayoutTarget, sumPayoutReplacement);

// 7. Update handleDriverApplication(e)
const appPayloadTarget = `        role: document.getElementById('drv-role-val').value || 'seeking_fleet_car',
        driverRole: document.getElementById('drv-role-val').value || 'seeking_fleet_car',
        ownerCar: (document.getElementById('drv-role-val').value === 'car_owner_driver') ? {
          model: carModelFinal || 'Toyota Premio',
          plateNumber: document.getElementById('drv-car-plate').value.trim() || 'Dhaka Metro GA',
          seats: carSeatsFinal || '4 Seats',
          year: document.getElementById('drv-car-year').value || '2019',
          fitnessExpiry: document.getElementById('drv-car-fitness').value || '2027-01-01'
        } : null,
        payoutMethod: payoutMethodFinal || 'bKash Personal',
        payoutNumber: document.getElementById('drv-payout-number').value.trim() || rawPhone,
        payoutWallet: \`\${payoutMethodFinal || 'bKash'} - \${document.getElementById('drv-payout-number').value.trim() || rawPhone}\`,`;

const appPayloadReplacement = `        role: selectedRole,
        driverRole: selectedRole,
        ownerCar: ownerCarPayload,
        vehicleProfile: vehicleProfileDesc,
        fleetData: fleetPayload,
        payoutMethod: (payoutMethodFinal === 'Bank Transfer') ? 'Bank Transfer' : (payoutMethodFinal || 'bKash Personal'),
        payoutNumber: payoutNumberFinal,
        payoutWallet: finalPayoutString,
        bankDetails: bankDetailsPayload,`;

const beforePayloadTarget = `      const rawName = document.getElementById('drv-name').value.trim();
      const rawPhone = document.getElementById('drv-phone').value.trim();
      const rawNid = document.getElementById('drv-nid').value.trim();

      const appId = 'DRV-DAC-' + Math.floor(1000 + Math.random() * 9000);
      const submissionTimestamp = new Date().toISOString();`;

const beforePayloadReplacement = `      const rawName = document.getElementById('drv-name').value.trim();
      const rawPhone = document.getElementById('drv-phone').value.trim();
      const rawNid = document.getElementById('drv-nid').value.trim();

      // Prepare Vehicle Profile & Fleet Data
      const selectedRole = document.getElementById('drv-role-val').value || 'seeking_fleet_car';
      let vehicleProfileDesc = 'N/A (Fleet Chauffeur)';
      let fleetPayload = null;
      let ownerCarPayload = null;

      if (selectedRole === 'rental_fleet_operator') {
        fleetPayload = {
          totalCars: fleetVehicles.length,
          totalDrivers: fleetDrivers.length,
          vehicles: fleetVehicles,
          drivers: fleetDrivers
        };
        const carsSummary = fleetVehicles.map((v, i) => \`\${i + 1}. \${v.model || 'Car'} [\${v.plate || 'No Plate'}]\`).join(', ');
        const driversSummary = fleetDrivers.map(d => \`\${d.name || 'Driver'} (\${d.phone || 'No Phone'})\`).join(', ');
        vehicleProfileDesc = \`Rental Fleet (\${fleetVehicles.length} Cars, \${fleetDrivers.length} Drivers): \${carsSummary} | Drivers: \${driversSummary}\`;
      } else if (selectedRole === 'car_owner_driver') {
        ownerCarPayload = {
          model: carModelFinal || 'Toyota Premio',
          plateNumber: document.getElementById('drv-car-plate').value.trim() || 'Dhaka Metro GA',
          seats: carSeatsFinal || '4 Seats',
          year: document.getElementById('drv-car-year').value || '2019',
          fitnessExpiry: document.getElementById('drv-car-fitness').value || '2027-01-01'
        };
        vehicleProfileDesc = \`\${ownerCarPayload.model} [\${ownerCarPayload.plateNumber}] (\${ownerCarPayload.seats}, \${ownerCarPayload.year})\`;
      }

      // Prepare Payout Channel & Bank Details
      let bankDetailsPayload = null;
      let finalPayoutString = '';
      let payoutNumberFinal = '';

      if (payoutMethodFinal === 'Bank Transfer') {
        const bankNameFinal = resolveFieldValue('bank-name', 'bank-name-custom') || 'Commercial Bank';
        const bankBranchFinal = document.getElementById('bank-branch')?.value.trim() || 'Principal Branch';
        const bankAccountNameFinal = document.getElementById('bank-account-name')?.value.trim() || rawName;
        const bankAccountNumberFinal = document.getElementById('bank-account-number')?.value.trim() || 'N/A';
        const bankRoutingFinal = document.getElementById('bank-routing-number')?.value.trim() || '';
        const bankAccountTypeFinal = document.getElementById('bank-account-type')?.value || 'Savings Account';

        bankDetailsPayload = {
          bankName: bankNameFinal,
          branch: bankBranchFinal,
          accountName: bankAccountNameFinal,
          accountNumber: bankAccountNumberFinal,
          routingNumber: bankRoutingFinal,
          accountType: bankAccountTypeFinal
        };
        payoutNumberFinal = bankAccountNumberFinal;
        finalPayoutString = \`Bank: \${bankNameFinal} (\${bankBranchFinal}) - A/C: \${bankAccountNumberFinal} [\${bankAccountTypeFinal} - \${bankAccountNameFinal}]\${bankRoutingFinal ? ' Routing: ' + bankRoutingFinal : ''}\`;
      } else {
        payoutNumberFinal = document.getElementById('drv-payout-number')?.value.trim() || rawPhone;
        finalPayoutString = \`\${payoutMethodFinal || 'bKash'} - \${payoutNumberFinal}\`;
      }

      const appId = 'DRV-DAC-' + Math.floor(1000 + Math.random() * 9000);
      const submissionTimestamp = new Date().toISOString();`;

if (!html.includes(beforePayloadTarget)) {
  console.error('Target beforePayloadTarget not found!');
  process.exit(1);
}
html = html.replace(beforePayloadTarget, beforePayloadReplacement);

if (!html.includes(appPayloadTarget)) {
  console.error('Target appPayloadTarget not found!');
  process.exit(1);
}
html = html.replace(appPayloadTarget, appPayloadReplacement);

fs.writeFileSync('driver-register.html', html, 'utf8');
console.log('✅ driver-register.html successfully updated with dynamic rental fleet & bank features!');
