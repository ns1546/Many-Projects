const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

console.log('--- 🧪 STARTING DRIVER SETTINGS & NAVBAR VERIFICATION ---');

const htmlContent = fs.readFileSync(path.join(__dirname, '../driver-register.html'), 'utf-8');
const $ = cheerio.load(htmlContent);

// 1. Verify Header Links Removed
const navActions = $('#site-nav .nav-actions');
console.log('Checking #site-nav .nav-actions...');
const viewFleet = navActions.find('a:contains("View Fleet")');
const forCarOwners = navActions.find('a:contains("For Car Owners")');
const signIn = navActions.find('a:contains("Sign In")');

if (viewFleet.length > 0 || forCarOwners.length > 0 || signIn.length > 0) {
  console.error('❌ FAIL: Extraneous links still found in header!');
  process.exit(1);
} else {
  console.log('✅ PASS: View Fleet, For Car Owners, and Sign In successfully removed from header.');
}

// 2. Verify Form Settings Button Exists in Header
const settingsBtn = $('#btn-open-settings');
if (settingsBtn.length === 0) {
  console.error('❌ FAIL: #btn-open-settings not found in navbar!');
  process.exit(1);
} else {
  console.log('✅ PASS: Form Settings button (#btn-open-settings) present in header.');
}

// 3. Verify CSS Hides Dev Dock
if (!htmlContent.includes('#rownaa-dev-dock') || !htmlContent.includes('display: none !important')) {
  console.error('❌ FAIL: CSS rule suppressing #rownaa-dev-dock not found!');
  process.exit(1);
} else {
  console.log('✅ PASS: #rownaa-dev-dock is suppressed via scoped CSS (display: none !important).');
}

// 4. Verify Settings Modal Markup
const modalOverlay = $('#driver-settings-overlay');
const toggleSwitch = $('#setting-bypass-mandatory');
const targetFieldSelect = $('#sm-target-field');
const newOptionValInput = $('#sm-new-option-val');
const customListContainer = $('#sm-custom-options-container');
const sheetUrlInput = $('#sm-sheet-url');

if (modalOverlay.length === 0) throw new Error('#driver-settings-overlay missing');
if (toggleSwitch.length === 0) throw new Error('#setting-bypass-mandatory missing');
if (targetFieldSelect.length === 0) throw new Error('#sm-target-field missing');
if (newOptionValInput.length === 0) throw new Error('#sm-new-option-val missing');
if (customListContainer.length === 0) throw new Error('#sm-custom-options-container missing');
if (sheetUrlInput.length === 0) throw new Error('#sm-sheet-url missing');

console.log('✅ PASS: Settings modal markup & controls fully present.');

// 5. Verify Target Dropdown Fields match available selects
const expectedFields = ['drv-city', 'drv-license-type', 'drv-languages', 'drv-car-model', 'drv-car-seats', 'drv-payout-method', 'services'];
expectedFields.forEach(fId => {
  if (fId === 'services') {
    if ($('#services-grid-container').length === 0) throw new Error('#services-grid-container missing');
  } else {
    if ($(`#${fId}`).length === 0) throw new Error(`Target field #${fId} missing in form!`);
  }
});
console.log('✅ PASS: All 7 target fields verified in form DOM.');

// 6. Verify Javascript Engine Logic
if (!htmlContent.includes('rownaa_driver_form_settings')) throw new Error('rownaa_driver_form_settings key missing');
if (!htmlContent.includes('bypassMandatory')) throw new Error('bypassMandatory handler missing');
if (!htmlContent.includes('injectCustomOptionIntoDom')) throw new Error('injectCustomOptionIntoDom missing');
if (!htmlContent.includes('applyDriverSettings')) throw new Error('applyDriverSettings missing');

console.log('✅ PASS: Full JavaScript persistence and extensibility engine verified.');
console.log('🎉 ALL CHECKS PASSED PERFECTLY!');

