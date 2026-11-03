const fs = require('fs');
const assert = require('assert');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log('--- STARTING CHECKOUT FEATURES & AUTH GATE RIGOROUS VERIFICATION ---');

const checkoutHtml = fs.readFileSync(path.join(__dirname, '../checkout.html'), 'utf8');

// Test 1: HTML Structure and Element Existence
const dom = new JSDOM(checkoutHtml, {
  runScripts: "dangerously",
  url: "http://localhost:3000/checkout.html?name=Tanvir+Rahman&phone=01711998877&email=tanvir%40example.com"
});

const doc = dom.window.document;

// Inject PricingEngine into window
const pricingDataCode = fs.readFileSync(path.join(__dirname, '../js/pricing-data.js'), 'utf8');
const pricingCode = fs.readFileSync(path.join(__dirname, '../js/pricing.js'), 'utf8');
dom.window.eval(pricingDataCode);
dom.window.eval(pricingCode);

// Trigger DOMContentLoaded so page scripts initialize query params
dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

// 1. Interactive Map Selection Verification (Uber Style with Authenticated CartoDB Key)
console.log('Checking Feature 1: Uber Interactive Map with Official CartoDB API Key...');
assert(doc.getElementById('mapModal'), '#mapModal must exist');
assert(doc.getElementById('map-canvas'), '#map-canvas container must exist');
assert(doc.querySelector('button[onclick*="openMapModal(\'pickup\')"]'), 'Pick on Map button for pickup must exist');
assert(doc.querySelector('button[onclick*="openMapModal(\'dropoff\')"]'), 'Pick on Map button for dropoff must exist');

// Uber Search and Autocomplete Elements
assert(doc.getElementById('map-search-input'), '#map-search-input must exist for Uber-style place search');
assert(doc.getElementById('uber-suggestions'), '#uber-suggestions dropdown must exist');
assert(doc.getElementById('btn-floating-locate'), '#btn-floating-locate button must exist for centering current location');
assert(doc.getElementById('btn-floating-theme'), '#btn-floating-theme button must exist for switching Voyager/Dark themes');
assert(doc.getElementById('btn-confirm-map-loc'), '#btn-confirm-map-loc button must exist');

// Verify Official CartoDB API key and Tile URLs
assert(checkoutHtml.includes('cb1_50vc_1_90f5d3acb895d00d75d0c680'), 'Must contain user official CartoDB API key');
assert(checkoutHtml.includes('rastertiles/voyager'), 'Must support CartoDB Voyager raster tiles');
assert(checkoutHtml.includes('rastertiles/dark_all'), 'Must support CartoDB DarkAll raster tiles');
assert(!checkoutHtml.includes('tile.openstreetmap.org'), 'Must not use blocked OpenStreetMap volunteer tile server');

// Landmark chips clutter has been eliminated in favor of Uber search
const landmarkChips = doc.querySelectorAll('.landmark-chip');
assert.strictEqual(landmarkChips.length, 0, 'Cluttered landmark chips must be removed for clean Uber UX');
console.log('✓ Feature 1 Passed: CartoDB authenticated Voyager/Dark tiles, search, and GPS floating button verified.');

// 2. User-Friendly Travel Date & Pickup Time Selector
console.log('Checking Feature 2: Clean Custom Travel Date & Time Selector...');
assert(doc.getElementById('c-date'), '#c-date direct input must exist for user-chosen date');
assert(doc.getElementById('c-time'), '#c-time direct input must exist for user-chosen time');
assert(doc.getElementById('schedule-preview-badge'), '#schedule-preview-badge live dispatch preview must exist');

// Cluttered fixed pill rows removed
const datePillRows = doc.querySelectorAll('#date-pills-row');
assert.strictEqual(datePillRows.length, 0, 'Fixed date pills row must be removed for user freedom');
console.log('✓ Feature 2 Passed: Clean user-chosen date/time inputs and live schedule badge verified.');

// 3. Vouchers & Promo Codes Hub
console.log('Checking Feature 3: Vouchers & Promo Hub Modal...');
assert(doc.getElementById('vouchersModal'), '#vouchersModal must exist');
const voucherCards = doc.querySelectorAll('.voucher-card');
assert(voucherCards.length === 5, 'Must have exactly 5 active voucher cards (found: ' + voucherCards.length + ')');
const applyButtons = doc.querySelectorAll('.btn-apply-voucher-action');
assert(applyButtons.length === 5, 'Every voucher card must have an Apply Voucher button');
const voucherCodes = Array.from(doc.querySelectorAll('.vc-code')).map(el => el.textContent.trim());
assert(voucherCodes.includes('ROWNAA20'), 'Must include ROWNAA20');
assert(voucherCodes.includes('WELCOME50'), 'Must include WELCOME50');
assert(voucherCodes.includes('AIRPORTVIP'), 'Must include AIRPORTVIP');
assert(voucherCodes.includes('INTERCITY10'), 'Must include INTERCITY10');
assert(voucherCodes.includes('CASHBACK100'), 'Must include CASHBACK100');
console.log('✓ Feature 3 Passed: 5 active vouchers verified: ' + voucherCodes.join(', '));

// 4. Payment Methods (Strictly 2 Options)
console.log('Checking Feature 4: Payment Methods (Strictly 2)...');
const pmOptions = doc.querySelectorAll('.pm-option');
assert(pmOptions.length === 2, 'Must have exactly 2 payment options (Cash and bKash/Nagad), found: ' + pmOptions.length);
assert(doc.getElementById('pm-cash'), '#pm-cash must exist');
assert(doc.getElementById('pm-mfs'), '#pm-mfs must exist');
assert(!checkoutHtml.includes('Corporate Billing'), 'Corporate Billing must be removed from checkout');
assert(doc.getElementById('mfs-instructions'), '#mfs-instructions must exist');
console.log('✓ Feature 4 Passed: Exactly 2 payment options (Cash on Completion and bKash/Nagad) verified.');

// 5. Folded Passenger Profile Card with Clean VIP Vibe
console.log('Checking Feature 5: Folded Passenger Profile Card & Cookies...');
assert(doc.getElementById('rider-folded-card'), '#rider-folded-card must exist');
assert(doc.getElementById('rider-form-fields'), '#rider-form-fields must exist');
assert(doc.querySelector('.btn-edit-profile'), 'Edit profile button must exist');
assert.strictEqual(doc.getElementById('rfc-display-name').textContent, 'Tanvir Rahman');
assert.strictEqual(doc.getElementById('rfc-avatar-icon').textContent, 'TR');
assert(doc.getElementById('rider-form-fields').classList.contains('collapsed'), 'Form fields must be folded (.collapsed) when profile exists');
console.log('✓ Feature 5 Passed: Folded passenger profile card rendered with initials and folded form.');

// 6. Auth Gate Modal (Require Login/Register to Create Trip)
console.log('Checking Feature 6: Auth Gate Modal & Customer Panel Transition...');
assert(doc.getElementById('authGateModal'), '#authGateModal must exist');
assert(doc.getElementById('btn-agm-login'), '#btn-agm-login must exist');
assert(doc.getElementById('btn-agm-register'), '#btn-agm-register must exist');
assert(doc.getElementById('agm-login-user'), '#agm-login-user input must exist');
assert(doc.getElementById('agm-login-pass'), '#agm-login-pass input must exist');
console.log('✓ Feature 6 Passed: Auth Gate Modal, sign-in, registration tabs verified.');

// 7. Interactive Functions in DOM Window
console.log('Checking Feature 7: Interactive Functions & Auth Gate Logic...');
const win = dom.window;

// Test applying voucher
win.applyVoucher('ROWNAA20');
assert.strictEqual(win.document.getElementById('c-promo').value, 'ROWNAA20');
assert(win.document.getElementById('s-discount-row').style.display !== 'none', 'Discount row must be visible');
console.log('✓ Feature 7.1: applyVoucher successfully applied ROWNAA20');

// Test Payment method toggle
win.selectPaymentMethod('mfs');
assert(win.document.getElementById('pm-mfs').classList.contains('selected'), '#pm-mfs must be selected');
assert(win.document.getElementById('mfs-instructions').classList.contains('active'), '#mfs-instructions must be active');
assert.strictEqual(win.document.getElementById('c-payment-method').value, 'bKash / Nagad Instant');

win.selectPaymentMethod('cash');
assert(win.document.getElementById('pm-cash').classList.contains('selected'), '#pm-cash must be selected');
assert(!win.document.getElementById('mfs-instructions').classList.contains('active'), '#mfs-instructions must be inactive');
assert.strictEqual(win.document.getElementById('c-payment-method').value, 'Cash on Completion');
console.log('✓ Feature 7.2: selectPaymentMethod toggle verified for both Cash and MFS');

// Test Uber Location Search & Autocomplete
win.onMapSearchInput('Gulshan 2');
const suggestions = win.document.querySelectorAll('#uber-suggestions .uber-suggestion-item');
assert(suggestions.length > 0, 'Must render search suggestions for "Gulshan 2"');
console.log('✓ Feature 7.3: onMapSearchInput returned ' + suggestions.length + ' suggestion items');

// Test Selecting a Search Result
win.selectSearchResult(0, 23.7936, 90.4137, 'Gulshan 2 Circle');
assert.strictEqual(win.document.getElementById('map-display-address').textContent, 'Gulshan 2 Circle');
win.confirmMapLocation();
assert.strictEqual(win.document.getElementById('c-pickup').value, 'Gulshan 2 Circle');
console.log('✓ Feature 7.4: selectSearchResult & confirmMapLocation locked location accurately');

// Test Custom Date & Time Change
win.document.getElementById('c-date').value = '2026-12-25';
win.document.getElementById('c-time').value = '14:30';
win.onCustomDateChange();
win.onCustomTimeChange();
assert(win.document.getElementById('schedule-preview-text').textContent.includes('2:30 PM'), 'Schedule preview should format 14:30 to 2:30 PM');
console.log('✓ Feature 7.5: Direct custom date/time change and preview verified');

// Test Profile Toggle
assert(win.document.getElementById('rider-form-fields').classList.contains('collapsed'));
win.toggleRiderProfile();
assert(!win.document.getElementById('rider-form-fields').classList.contains('collapsed'), 'Should unfold fields on toggle');
win.toggleRiderProfile();
assert(win.document.getElementById('rider-form-fields').classList.contains('collapsed'), 'Should fold fields on toggle');
console.log('✓ Feature 7.6: toggleRiderProfile verified');

// Test Auth Gate Modal Open & Close
win.openAuthGateModal();
assert(win.document.getElementById('authGateModal').classList.contains('active'), 'Auth Gate modal must open when unauthenticated');
win.closeAuthGateModal();
assert(!win.document.getElementById('authGateModal').classList.contains('active'), 'Auth Gate modal must close');
console.log('✓ Feature 7.7: Auth Gate Modal open/close verified');

// Test ProcessBooking Triggers Auth Gate when unauthenticated
win.rownaaSession = null;
if (win.AppState) win.AppState.user = null;
win.processBooking();
assert(win.document.getElementById('authGateModal').classList.contains('active'), 'Calling processBooking while unauthenticated MUST prompt Auth Gate Modal');
win.closeAuthGateModal();
console.log('✓ Feature 7.8: processBooking safely gates guest bookings behind Auth Modal');

console.log('\n--- ALL 7 CHECKOUT & AUTH-GATE FEATURES FULLY VERIFIED AND PASSING! ---');
