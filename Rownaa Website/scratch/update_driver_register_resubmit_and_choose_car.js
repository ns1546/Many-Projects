const fs = require('fs');

let html = fs.readFileSync('driver-register.html', 'utf8');

// 1. Insert Resubmission Card in Step 1
const step1Target = `            <div class="f-sec-desc">
              <span id="desc-step-1">Enter your legal identity exactly as shown on your NID (Smart Card) and BRTA Driving License.</span>
            </div>

            <div class="grid-2">`;

const step1Replacement = `            <div class="f-sec-desc">
              <span id="desc-step-1">Enter your legal identity exactly as shown on your NID (Smart Card) and BRTA Driving License.</span>
            </div>

            <!-- Resubmission & Correction Tracker Card -->
            <div class="resubmission-toggle-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(212,255,0,0.25); border-radius:12px; padding:14px 16px; margin-bottom:18px; transition:all 0.3s ease;">
              <label style="display:flex; align-items:flex-start; gap:12px; cursor:pointer; margin:0;">
                <input type="checkbox" id="chk-is-resubmission" onchange="toggleResubmissionFields(this.checked)" style="width:19px; height:19px; accent-color:var(--accent); margin-top:3px; cursor:pointer; flex-shrink:0;"/>
                <div>
                  <div style="font-family:var(--font-display); font-size:0.95rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">
                    <i class="ph-bold ph-arrow-counter-clockwise" style="color:var(--accent);"></i>
                    <span id="lbl-resubmit-title">Resubmission / Correcting a Previous Application?</span>
                  </div>
                  <div style="font-size:0.77rem; color:var(--text-secondary); margin-top:2px;" id="lbl-resubmit-desc">
                    Check this if you submitted wrong information previously and want to register with corrected details for admin tracking.
                  </div>
                </div>
              </label>

              <div id="resubmission-details-box" style="display:none; margin-top:14px; padding-top:14px; border-top:1px dashed rgba(255,255,255,0.12);">
                <div class="grid-2">
                  <div class="f-group">
                    <label class="f-label" for="resubmit-prev-id">
                      <span id="lbl-resubmit-prev-id">Previous Application ID (If Known)</span>
                    </label>
                    <input type="text" id="resubmit-prev-id" class="f-control no-prefix" placeholder="e.g. DRV-DAC-2377 (Optional)"/>
                  </div>
                  <div class="f-group">
                    <label class="f-label" for="resubmit-reason">
                      <span id="lbl-resubmit-reason">Primary Reason for Correction <span class="req">*</span></span>
                    </label>
                    <select id="resubmit-reason" class="f-control no-prefix">
                      <option value="Incorrect NID / Smart Card Number" selected>Incorrect NID / Smart Card Number</option>
                      <option value="Incorrect BRTA License / Expiry Date">Incorrect BRTA License / Expiry Date</option>
                      <option value="Wrong Mobile / WhatsApp Phone Number">Wrong Mobile / WhatsApp Phone Number</option>
                      <option value="Updated Vehicle or Fleet Car Information">Updated Vehicle or Fleet Car Information</option>
                      <option value="Changed Bank Account / Payout Wallet Details">Changed Bank Account / Payout Wallet Details</option>
                      <option value="Blurry / Incomplete Document Photos Uploaded">Blurry / Incomplete Document Photos Uploaded</option>
                      <option value="Other Information Correction">Other Information Correction</option>
                    </select>
                  </div>
                </div>
                <div class="f-group" style="margin-bottom:0;">
                  <label class="f-label" for="resubmit-notes">
                    <span id="lbl-resubmit-notes">Correction Explanation for Admin</span>
                  </label>
                  <textarea id="resubmit-notes" class="f-control no-prefix" rows="2" placeholder="Briefly specify what was wrong previously so the admin can verify your updated information immediately..."></textarea>
                </div>
              </div>
            </div>

            <div class="grid-2">`;

if (!html.includes(step1Target)) {
  console.error('step1Target not found!');
  process.exit(1);
}
html = html.replace(step1Target, step1Replacement);

// 2. Insert "Choose Your Car" Service Tile in Step 3
const step3Target = `              <label class="service-card-tile" onclick="toggleServiceCheckbox(this)">
                <input type="checkbox" name="services" value="Event & Wedding Transport"/>
                <div class="svc-tile-head">
                  <div class="svc-tile-icon"><i class="ph-fill ph-sparkle"></i></div>
                  <div class="svc-tile-title" id="svc-title-event">Event & Wedding VIP</div>
                </div>
                <div class="svc-tile-desc" id="svc-desc-event">Luxury motorcades, wedding fleet convoy, and corporate event VIP delegations.</div>
                <div class="svc-rate-badge">Premium Executive</div>
              </label>

              <div class="service-card-tile add-custom-svc-tile"`;

const step3Replacement = `              <label class="service-card-tile" onclick="toggleServiceCheckbox(this)">
                <input type="checkbox" name="services" value="Event & Wedding Transport"/>
                <div class="svc-tile-head">
                  <div class="svc-tile-icon"><i class="ph-fill ph-sparkle"></i></div>
                  <div class="svc-tile-title" id="svc-title-event">Event & Wedding VIP</div>
                </div>
                <div class="svc-tile-desc" id="svc-desc-event">Luxury motorcades, wedding fleet convoy, and corporate event VIP delegations.</div>
                <div class="svc-rate-badge">Premium Executive</div>
              </label>

              <!-- Choose Your Car (Dedicated Model Selection) -->
              <label class="service-card-tile selected" onclick="toggleServiceCheckbox(this)">
                <input type="checkbox" name="services" value="Choose Your Car (Dedicated Fleet Selection)" checked/>
                <div class="svc-tile-head">
                  <div class="svc-tile-icon"><i class="ph-fill ph-car-profile"></i></div>
                  <div class="svc-tile-title" id="svc-title-choose-car">Choose Your Car (Dedicated Model)</div>
                </div>
                <div class="svc-tile-desc" id="svc-desc-choose-car">Riders specifically select and book your exact vehicle model (Premio, Noah, HiAce) with dedicated chauffeur allocation.</div>
                <div class="svc-rate-badge">VIP Model Selection</div>
              </label>

              <div class="service-card-tile add-custom-svc-tile"`;

if (!html.includes(step3Target)) {
  console.error('step3Target not found!');
  process.exit(1);
}
html = html.replace(step3Target, step3Replacement);

// 3. Update I18N.en
const enI18nTarget = `        step1: {
          title: '1. Personal & Contact Information',
          desc: 'Enter your legal identity exactly as shown on your NID (Smart Card) and BRTA Driving License.',
          lblName: 'Full Legal Name',
          lblPhone: 'Mobile Number (WhatsApp)',
          lblNid: 'National ID (NID / Smart Card)',
          lblCity: 'Base Residential City / Area',
          lblEmName: 'Emergency Contact Name',
          lblEmPhone: 'Emergency Contact Phone',
          btnNext: 'Continue to License & Experience'
        },`;

const enI18nReplacement = `        step1: {
          title: '1. Personal & Contact Information',
          desc: 'Enter your legal identity exactly as shown on your NID (Smart Card) and BRTA Driving License.',
          resubmitTitle: 'Resubmission / Correcting a Previous Application?',
          resubmitDesc: 'Check this if you submitted wrong information previously and want to register with corrected details for admin tracking.',
          lblPrevId: 'Previous Application ID (If Known)',
          lblReason: 'Primary Reason for Correction',
          lblNotes: 'Correction Explanation for Admin',
          lblName: 'Full Legal Name',
          lblPhone: 'Mobile Number (WhatsApp)',
          lblNid: 'National ID (NID / Smart Card)',
          lblCity: 'Base Residential City / Area',
          lblEmName: 'Emergency Contact Name',
          lblEmPhone: 'Emergency Contact Phone',
          btnNext: 'Continue to License & Experience'
        },`;

if (!html.includes(enI18nTarget)) {
  console.error('enI18nTarget not found!');
  process.exit(1);
}
html = html.replace(enI18nTarget, enI18nReplacement);

// 4. Update I18N.bn
const bnI18nTarget = `        step1: {
          title: '১. ব্যক্তিগত তথ্য ও যোগাযোগের বিবরণ',
          desc: 'আপনার জাতীয় পরিচয়পত্র (এনআইডি) এবং ড্রাইভিং লাইসেন্স অনুযায়ী সঠিক তথ্য প্রদান করুন।',
          lblName: 'পূর্ণ নাম (জাতীয় পরিচয়পত্র অনুযায়ী)',
          lblPhone: 'মোবাইল নম্বর (হোয়াটসঅ্যাপ সক্রিয়)',
          lblNid: 'জাতীয় পরিচয়পত্র (এনআইডি নম্বর)',
          lblCity: 'প্রধান কাজের এলাকা / জেলা',
          lblEmName: 'জরুরি যোগাযোগের ব্যক্তির নাম ও সম্পর্ক',
          lblEmPhone: 'জরুরি যোগাযোগের মোবাইল নম্বর',
          btnNext: 'পরবর্তী ধাপ: লাইসেন্স ও অভিজ্ঞতা →'
        },`;

const bnI18nReplacement = `        step1: {
          title: '১. ব্যক্তিগত তথ্য ও যোগাযোগের বিবরণ',
          desc: 'আপনার জাতীয় পরিচয়পত্র (এনআইডি) এবং ড্রাইভিং লাইসেন্স অনুযায়ী সঠিক তথ্য প্রদান করুন।',
          resubmitTitle: 'পূর্ববর্তী আবেদনের ভুল তথ্য সংশোধনের জন্য পুনরায় আবেদন?',
          resubmitDesc: 'আগের আবেদনে কোনো তথ্য বা কাগজপত্র ভুল জমা দিয়ে থাকলে এটি টিক দিন যাতে অ্যাডমিন আপনার সংশোধিত তথ্য সহজে চিহ্নিত করতে পারে।',
          lblPrevId: 'পূর্ববর্তী আবেদন রেফারেন্স নম্বর (যদি জানা থাকে)',
          lblReason: 'তথ্য সংশোধনের প্রধান কারণ',
          lblNotes: 'অ্যাডমিনের জন্য সংশোধনের সংক্ষিপ্ত বিবরণ',
          lblName: 'পূর্ণ নাম (জাতীয় পরিচয়পত্র অনুযায়ী)',
          lblPhone: 'মোবাইল নম্বর (হোয়াটসঅ্যাপ সক্রিয়)',
          lblNid: 'জাতীয় পরিচয়পত্র (এনআইডি নম্বর)',
          lblCity: 'প্রধান কাজের এলাকা / জেলা',
          lblEmName: 'জরুরি যোগাযোগের ব্যক্তির নাম ও সম্পর্ক',
          lblEmPhone: 'জরুরি যোগাযোগের মোবাইল নম্বর',
          btnNext: 'পরবর্তী ধাপ: লাইসেন্স ও অভিজ্ঞতা →'
        },`;

if (!html.includes(bnI18nTarget)) {
  console.error('bnI18nTarget not found!');
  process.exit(1);
}
html = html.replace(bnI18nTarget, bnI18nReplacement);

// 5. Update setLanguage(lang) to update resubmission labels and service label
const setLangTarget = `      const bn1 = document.getElementById('btn-next-1'); if (bn1) bn1.querySelector('span').textContent = s1.btnNext;`;

const setLangReplacement = `      const bn1 = document.getElementById('btn-next-1'); if (bn1) bn1.querySelector('span').textContent = s1.btnNext;
      const rSubTitle = document.getElementById('lbl-resubmit-title'); if (rSubTitle && s1.resubmitTitle) rSubTitle.textContent = s1.resubmitTitle;
      const rSubDesc = document.getElementById('lbl-resubmit-desc'); if (rSubDesc && s1.resubmitDesc) rSubDesc.textContent = s1.resubmitDesc;
      const rPrevId = document.getElementById('lbl-resubmit-prev-id'); if (rPrevId && s1.lblPrevId) rPrevId.textContent = s1.lblPrevId;
      const rReason = document.getElementById('lbl-resubmit-reason'); if (rReason && s1.lblReason) rReason.textContent = s1.lblReason;
      const rNotes = document.getElementById('lbl-resubmit-notes'); if (rNotes && s1.lblNotes) rNotes.textContent = s1.lblNotes;

      // Choose your car service translation
      const scTitle = document.getElementById('svc-title-choose-car');
      const scDesc = document.getElementById('svc-desc-choose-car');
      if (scTitle) scTitle.textContent = (lang === 'bn' ? 'চুজ ইউর কার (নির্দিষ্ট মডেল নির্বাচন)' : 'Choose Your Car (Dedicated Model)');
      if (scDesc) scDesc.textContent = (lang === 'bn' ? 'যাত্রীরা সরাসরি আপনার নির্দিষ্ট মডেলের গাড়ি (প্রিমিও, নোয়া, হায়েস) পছন্দ করে ডেডিকেটেড শফার বুক করবেন।' : 'Riders specifically select and book your exact vehicle model (Premio, Noah, HiAce) with dedicated chauffeur allocation.');`;

if (!html.includes(setLangTarget)) {
  console.error('setLangTarget not found!');
  process.exit(1);
}
html = html.replace(setLangTarget, setLangReplacement);

// 6. Insert toggleResubmissionFields() in JS
const funcInsertTarget = `    // Dynamic Select Field Handlers`;
const funcInsertReplacement = `    function toggleResubmissionFields(isChecked) {
      const box = document.getElementById('resubmission-details-box');
      if (box) box.style.display = isChecked ? 'block' : 'none';
      populateSummary();
    }

    // Dynamic Select Field Handlers`;

if (!html.includes(funcInsertTarget)) {
  console.error('funcInsertTarget not found!');
  process.exit(1);
}
html = html.replace(funcInsertTarget, funcInsertReplacement);

// 7. Update populateSummary() to include Resubmission Badge
const summaryTarget = `      document.getElementById('sum-name').textContent = name;`;
const summaryReplacement = `      // Resubmission status check
      const isResubmit = document.getElementById('chk-is-resubmission')?.checked || false;
      const resubmitReason = isResubmit ? (document.getElementById('resubmit-reason')?.value || 'Information Correction') : '';
      const resubmitPrevId = isResubmit ? (document.getElementById('resubmit-prev-id')?.value.trim() || '') : '';
      
      let sumResubmitRow = document.getElementById('sum-row-resubmit');
      if (isResubmit) {
        if (!sumResubmitRow) {
          sumResubmitRow = document.createElement('div');
          sumResubmitRow.id = 'sum-row-resubmit';
          sumResubmitRow.style.cssText = 'background:rgba(212,255,0,0.1); border:1px solid rgba(212,255,0,0.3); border-radius:8px; padding:10px 14px; margin-bottom:12px; font-size:0.82rem; color:#fff; display:flex; align-items:center; gap:8px;';
          const sumTable = document.querySelector('.summary-card-body') || document.getElementById('driver-summary-table') || document.querySelector('.summary-box');
          if (sumTable) sumTable.insertBefore(sumResubmitRow, sumTable.firstChild);
        }
        sumResubmitRow.innerHTML = \`<i class="ph-bold ph-arrow-counter-clockwise" style="color:var(--accent); font-size:1.1rem;"></i> <div><strong>\${currentLang === 'bn' ? 'আবেদন সংশোধন:' : 'Resubmission Correction:'}</strong> \${resubmitReason} \${resubmitPrevId ? ' (Prev ID: #' + resubmitPrevId + ')' : ''}</div>\`;
        sumResubmitRow.style.display = 'flex';
      } else if (sumResubmitRow) {
        sumResubmitRow.style.display = 'none';
      }

      document.getElementById('sum-name').textContent = name;`;

if (!html.includes(summaryTarget)) {
  console.error('summaryTarget not found!');
  process.exit(1);
}
html = html.replace(summaryTarget, summaryReplacement);

// 8. Update handleDriverApplication(e) to package Resubmission Data & Local Duplicate Tracking
const appTarget = `      const rawName = document.getElementById('drv-name').value.trim();
      const rawPhone = document.getElementById('drv-phone').value.trim();
      const rawNid = document.getElementById('drv-nid').value.trim();`;

const appReplacement = `      const rawName = document.getElementById('drv-name').value.trim();
      const rawPhone = document.getElementById('drv-phone').value.trim();
      const rawNid = document.getElementById('drv-nid').value.trim();

      // Extract Resubmission & Correction Flags
      const isResubmit = document.getElementById('chk-is-resubmission')?.checked || false;
      const resubmitPrevId = document.getElementById('resubmit-prev-id')?.value.trim() || '';
      const resubmitReason = isResubmit ? (document.getElementById('resubmit-reason')?.value || 'Information Correction') : '';
      const resubmitNotes = isResubmit ? (document.getElementById('resubmit-notes')?.value.trim() || '') : '';

      // Local Duplicate Matching against previously saved applications
      let localDuplicateMatch = null;
      let localIteration = 1;
      try {
        const localList = JSON.parse(localStorage.getItem('rownaa_driver_applications') || '[]');
        const normPhone = rawPhone.replace(/[^0-9]/g, '');
        const normNid = rawNid.replace(/[^0-9]/g, '');
        const normLic = (document.getElementById('drv-license')?.value.trim() || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

        for (const app of localList) {
          const appPhone = String(app.phone || '').replace(/[^0-9]/g, '');
          const appNid = String(app.nidNumber || app.nid || '').replace(/[^0-9]/g, '');
          const appLic = String(app.licenseNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

          if ((normPhone && appPhone && normPhone === appPhone) || (normNid && appNid && normNid === appNid) || (normLic && appLic && normLic === appLic)) {
            localIteration++;
            if (!localDuplicateMatch) localDuplicateMatch = app.id || app.applicationId;
          }
        }
      } catch(e) {}`;

if (!html.includes(appTarget)) {
  console.error('appTarget not found!');
  process.exit(1);
}
html = html.replace(appTarget, appReplacement);

// 9. Add Resubmission fields into applicationPayload
const payloadTarget = `        bankDetails: bankDetailsPayload,
        status: 'Pending Verification',`;

const payloadReplacement = `        bankDetails: bankDetailsPayload,
        isResubmission: isResubmit,
        previousApplicationId: resubmitPrevId,
        prevAppId: resubmitPrevId,
        correctionReason: resubmitReason,
        correctionNotes: resubmitNotes,
        localIteration: localIteration,
        localDuplicateMatchId: localDuplicateMatch,
        status: 'Pending Verification',`;

if (!html.includes(payloadTarget)) {
  console.error('payloadTarget not found!');
  process.exit(1);
}
html = html.replace(payloadTarget, payloadReplacement);

fs.writeFileSync('driver-register.html', html, 'utf8');
console.log('✅ driver-register.html updated with Resubmission / Correction Tracker and Choose Your Car service!');

