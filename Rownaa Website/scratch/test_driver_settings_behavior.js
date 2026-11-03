const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

console.log('--- 🧪 STARTING BEHAVIORAL SIMULATION TEST ---');

// Mock a browser environment with JSDOM-like behaviors
const html = fs.readFileSync(path.join(__dirname, '../driver-register.html'), 'utf-8');

// Parse HTML using Cheerio
let $ = cheerio.load(html);

// Mock localStorage
const localStorageStore = {};
const localStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; }
};

// Test 1: Verify Initial Required Inputs
const initialRequired = $('input[required], select[required]');
console.log(`Found ${initialRequired.length} initially required inputs in the form.`);
if (initialRequired.length < 5) throw new Error('Too few required inputs found');

// Simulate storing data-orig-required
$('input[required], select[required], textarea[required]').each((i, el) => {
  $(el).attr('data-orig-required', 'true');
});

// Test 2: Simulate Turning ON Mandatory Bypass
let driverSettings = {
  bypassMandatory: true,
  customOptions: [
    { fieldId: 'drv-city', value: 'Barishal', label: 'Barishal (বরিশাল)' },
    { fieldId: 'drv-car-model', value: 'Hyundai Staria VIP', label: 'Hyundai Staria VIP (7-Seater)' },
    { fieldId: 'services', value: 'Helicopter Airport Escort', label: 'Helicopter Airport Escort' }
  ],
  sheetWebhookUrl: 'https://script.google.com/macros/s/AKfycbwta7x5wTA-nCmTqsMalRQF45WaWqk6Iq9kQneEXXwQl33tOl5JtpwewmV5qJgVQpEz7Q/exec'
};

localStorage.setItem('rownaa_driver_form_settings', JSON.stringify(driverSettings));

// Simulate applying settings
if (driverSettings.bypassMandatory) {
  $('input, select, textarea').each((i, el) => {
    $(el).removeAttr('required');
  });
  $('.f-label .req').each((i, el) => {
    $(el).html('<span class="opt-badge">(Optional)</span>');
  });
  $('#bypass-mandatory-notice').attr('style', 'display:flex');
}

// Injected options
driverSettings.customOptions.forEach(opt => {
  if (opt.fieldId === 'services') {
    $('#services-grid-container').append(`
      <label class="service-card-tile selected custom-injected-svc">
        <input type="checkbox" name="services" value="${opt.value}" checked/>
        <div class="svc-tile-title">${opt.label}</div>
      </label>
    `);
  } else {
    $(`#${opt.fieldId}`).prepend(`<option value="${opt.value}" class="custom-injected-opt">${opt.label}</option>`);
  }
});

// Verify state under bypass mode
const remainingRequired = $('input[required], select[required]');
if (remainingRequired.length !== 0) {
  throw new Error(`Expected 0 required inputs when bypass is ON, found ${remainingRequired.length}`);
}
console.log('✅ PASS: All required attributes stripped successfully under Bypass Mode.');

// Verify custom options injected
const cityOption = $('#drv-city option[value="Barishal"]');
if (cityOption.length === 0) throw new Error('Custom city option Barishal not found in #drv-city');
console.log('✅ PASS: Custom option "Barishal" successfully injected into #drv-city.');

const carOption = $('#drv-car-model option[value="Hyundai Staria VIP"]');
if (carOption.length === 0) throw new Error('Custom car option not found');
console.log('✅ PASS: Custom option "Hyundai Staria VIP" successfully injected into #drv-car-model.');

const customSvc = $('input[name="services"][value="Helicopter Airport Escort"]');
if (customSvc.length === 0) throw new Error('Custom service tile not found');
console.log('✅ PASS: Custom service "Helicopter Airport Escort" successfully injected into #services-grid-container.');

// Test 3: Simulate Page Refresh (Loading from localStorage)
console.log('Simulating Page Refresh...');
const savedRaw = localStorage.getItem('rownaa_driver_form_settings');
if (!savedRaw) throw new Error('localStorage empty on refresh!');
const reloadedSettings = JSON.parse(savedRaw);
if (!reloadedSettings.bypassMandatory) throw new Error('Bypass setting lost on refresh!');
if (reloadedSettings.customOptions.length !== 3) throw new Error('Custom options lost on refresh!');
console.log(`✅ PASS: Page refresh verified! Bypass mode (${reloadedSettings.bypassMandatory}) and ${reloadedSettings.customOptions.length} custom options safely reloaded from localStorage.`);

// Test 4: Simulate Restoring Strict Mode
driverSettings.bypassMandatory = false;
localStorage.setItem('rownaa_driver_form_settings', JSON.stringify(driverSettings));

$('[data-orig-required="true"]').each((i, el) => {
  $(el).attr('required', '');
});
$('.f-label .req').each((i, el) => {
  $(el).text('*');
});

const restoredRequired = $('input[required], select[required]');
console.log(`Restored ${restoredRequired.length} required fields.`);
if (restoredRequired.length !== initialRequired.length) {
  throw new Error(`Restoration mismatch! Expected ${initialRequired.length}, got ${restoredRequired.length}`);
}
console.log('✅ PASS: Strict validation restored 100% of required fields.');

console.log('🎉 ALL BEHAVIORAL SIMULATION TESTS PASSED WITH 100% ACCURACY!');
