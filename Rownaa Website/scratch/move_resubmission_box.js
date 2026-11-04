const fs = require('fs');

const targetFiles = [
  'driver-register.html',
  'netlify-driver-portal/index.html',
  'Rownaa-Frontend-Netlify/driver-register.html'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Find the old Resubmission block at the top of Step 1
  const oldCardStart = '<!-- Resubmission & Correction Tracker Card -->';
  const oldCardEnd = '<!-- Emergency Contact -->';
  
  const sIdx = content.indexOf(oldCardStart);
  const nameIdx = content.indexOf('<div class="f-group">\n                <label class="f-label" for="drv-name">');
  
  if (sIdx !== -1 && nameIdx !== -1 && sIdx < nameIdx) {
    // Cut out the old resubmission card from the top
    const oldCardHtml = content.substring(sIdx, nameIdx);
    content = content.replace(oldCardHtml, '');
    console.log('Removed resubmission card from top of Step 1 in:', file);
  }

  // 2. Prepare the clean, subtle bottom-of-step-1 correction drawer
  const newCorrectionDrawerHtml = `
            <!-- Subtle Returning Applicant Correction Helper (Non-intrusive, collapsed by default) -->
            <div class="correction-helper-bar" style="margin-top:22px; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; transition:all 0.3s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="font-size:0.78rem; color:var(--text-secondary); display:flex; align-items:center; gap:8px;">
                  <i class="ph-bold ph-arrow-counter-clockwise" style="color:var(--accent);"></i>
                  <span id="lbl-correction-hint">Already submitted before and need to correct wrong information? (আগে ভুল তথ্য দিয়ে থাকলে সংশোধন করুন)</span>
                </div>
                <button type="button" id="btn-toggle-correction" onclick="toggleCorrectionDrawer()" class="btn-outline" style="padding:5px 12px; font-size:0.74rem; border-radius:7px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.04);">
                  <i class="ph-bold ph-pencil-simple"></i>
                  <span id="btn-correction-label">Update / Correct Previous Application</span>
                </button>
              </div>

              <!-- Collapsible Correction Drawer -->
              <div id="resubmission-details-box" style="display:none; margin-top:14px; padding-top:14px; border-top:1px dashed rgba(255,255,255,0.12);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                  <input type="checkbox" id="chk-is-resubmission" onchange="toggleResubmissionFields(this.checked)" checked style="width:16px; height:16px; accent-color:var(--accent); cursor:pointer;"/>
                  <span style="font-size:0.82rem; font-weight:700; color:#fff;" id="lbl-resubmit-active-badge">Mark this submission as a correction of previous application</span>
                </div>

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
            </div>\n`;

  // Place it right before the Next button of Step 1:
  // Find <button type="button" class="btn-primary btn-next" onclick="validateAndNext(1)">
  const nextBtnMarker = 'onclick="validateAndNext(1)"';
  const markerIdx = content.indexOf(nextBtnMarker);
  if (markerIdx !== -1) {
    const paneActionsIdx = content.lastIndexOf('<div class="pane-actions">', markerIdx);
    if (paneActionsIdx !== -1 && !content.includes('id="btn-toggle-correction"')) {
      content = content.substring(0, paneActionsIdx) + newCorrectionDrawerHtml + '            ' + content.substring(paneActionsIdx);
      console.log('Inserted clean correction helper drawer at bottom of Step 1 in:', file);
    }
  }

  // 3. Add toggleCorrectionDrawer() function to script
  if (!content.includes('function toggleCorrectionDrawer()')) {
    const helperFunction = `    function toggleCorrectionDrawer() {
      const box = document.getElementById('resubmission-details-box');
      const chk = document.getElementById('chk-is-resubmission');
      const btnLabel = document.getElementById('btn-correction-label');
      if (!box || !chk) return;

      if (box.style.display === 'none' || !box.style.display) {
        box.style.display = 'block';
        chk.checked = true;
        if (btnLabel) btnLabel.textContent = (currentLang === 'bn' ? 'সংশোধন অপশন বন্ধ করুন' : 'Close Correction Form');
      } else {
        box.style.display = 'none';
        chk.checked = false;
        if (btnLabel) btnLabel.textContent = (currentLang === 'bn' ? 'পূর্বের তথ্য সংশোধন করুন' : 'Update / Correct Previous Application');
      }
      populateSummary();
    }\n\n`;

    content = content.replace('function toggleResubmissionFields', helperFunction + '    function toggleResubmissionFields');
    console.log('Added toggleCorrectionDrawer() function in:', file);
  }

  // 4. Add smart phone auto-detection on blur
  if (!content.includes('checkPhoneForPreviousApplication()')) {
    const phoneCheckScript = `
    // Smart auto-check for returning applicant when phone is entered
    document.addEventListener('DOMContentLoaded', () => {
      const phoneInput = document.getElementById('drv-phone');
      if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
          const raw = phoneInput.value.trim().replace(/[^0-9]/g, '');
          if (raw.length >= 10) {
            try {
              const localApps = JSON.parse(localStorage.getItem('rownaa_driver_applications') || '[]');
              const match = localApps.find(a => (a.phone || '').replace(/[^0-9]/g, '') === raw);
              if (match) {
                const prevIdInput = document.getElementById('resubmit-prev-id');
                if (prevIdInput && !prevIdInput.value) {
                  prevIdInput.value = match.applicationId || match.id || '';
                }
              }
            } catch(e) {}
          }
        });
      }
    });\n`;

    content = content.replace('function resetDriverForm()', phoneCheckScript + '\n    function resetDriverForm()');
    console.log('Added phone auto-detection script in:', file);
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log('\n=== STEP 1 CLEANUP COMPLETED! ===');
