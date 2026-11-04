const fs = require('fs');

const files = [
  'driver-register.html',
  'netlify-driver-portal/index.html',
  'Rownaa-Frontend-Netlify/driver-register.html'
];

const newCorrectionDrawerHtml = `            <!-- Subtle Returning Applicant Correction Helper (Non-intrusive, collapsed by default) -->
            <div class="correction-helper-bar" style="margin-top:22px; margin-bottom:16px; padding:12px 16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; transition:all 0.3s ease;">
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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Insert right before `<div class="form-nav-actions">\n              <div></div>\n              <button type="button" class="btn-step-next" onclick="validateAndNext(1)"`
  const targetSnippet = '<div class="form-nav-actions">\n              <div></div>\n              <button type="button" class="btn-step-next" onclick="validateAndNext(1)"';
  
  if (content.includes(targetSnippet) && !content.includes('correction-helper-bar')) {
    content = content.replace(targetSnippet, newCorrectionDrawerHtml + '            ' + targetSnippet);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully inserted clean correction helper bar in:', file);
  } else {
    console.log('Skipped or already present in:', file);
  }
});
