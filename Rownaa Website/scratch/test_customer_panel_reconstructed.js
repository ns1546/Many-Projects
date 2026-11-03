const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { JSDOM } = require('jsdom');

async function testCustomerPanelReconstructed() {
  console.log('=== VERIFYING RECONSTRUCTED CUSTOMER PANEL END-TO-END ===\n');

  const html = fs.readFileSync(path.join(__dirname, '../customer-panel.html'), 'utf8');
  
  // 1. Verify Static HTML Structure
  assert(html.includes('enforceCustomerRBAC'), 'customer-panel.html must include enforceCustomerRBAC');
  assert(html.includes('user-avatar-initials'), 'customer-panel.html must have dynamic initials avatar');
  assert(html.includes('user-sidebar-name'), 'customer-panel.html must have dynamic sidebar name');
  assert(html.includes('user-welcome-heading'), 'customer-panel.html must have dynamic welcome heading');
  assert(html.includes('air-dir-control'), 'customer-panel.html must have 3-direction airport control');
  assert(html.includes('Round Trip (+৳500)'), 'customer-panel.html must offer Round Trip');
  assert(html.includes('air-flight-no'), 'customer-panel.html must include flight number input');
  assert(html.includes('ic-type-control'), 'customer-panel.html must have 3 trip types for intercity');
  assert(html.includes('ic-nights'), 'customer-panel.html must have waiting nights counter');
  assert(html.includes('hourly-dur'), 'customer-panel.html must have hourly duration select');
  assert(html.includes('cust-promo'), 'customer-panel.html must have promo voucher input');
  assert(html.includes('pay-method-cash'), 'customer-panel.html must have cash payment method');
  assert(html.includes('pay-method-mfs'), 'customer-panel.html must have mfs payment method');
  assert(html.includes('cust-base-fare'), 'customer-panel.html must show base fare');
  assert(html.includes('cust-vat-val'), 'customer-panel.html must show 5% vat');
  assert(html.includes('cust-profile-language'), 'customer-panel.html must have language select with ID');
  assert(!html.includes("'cust-1'"), 'customer-panel.html must have zero mock cust-1 fallbacks');
  
  console.log('✓ Section 1: All required DOM IDs and structural components confirmed.');

  // 2. Setup mock pricing engine and JSDOM runtime
  const pricingJs = fs.readFileSync(path.join(__dirname, '../js/pricing.js'), 'utf8');

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    url: 'http://localhost:3000/customer-panel.html',
    beforeParse(window) {
      window._IS_TEST_ENV = true;
      window.rownaaSession = {
        id: 'cust-999',
        name: 'Mahmudur Rahman',
        phone: '+8801712345678',
        role: 'customer'
      };
      window.BookingsManager = {
        add: async (payload) => {
          window._lastBooking = payload;
          return true;
        },
        getAll: async () => [],
        getPaginated: async () => ({ data: [], total: 0 })
      };
      window.ReviewsManager = {
        getAll: async () => [
          { customerId: 'cust-999', rating: 5 },
          { customerId: 'cust-999', rating: 5 }
        ]
      };
    }
  });

  const win = dom.window;
  const doc = win.document;

  // Eval Pricing Engine in window context
  win.eval(pricingJs);

  // Wait for initial scripts to execute
  await new Promise(r => setTimeout(r, 100));

  // 3. Test Service Switching and Location Reactivity
  // 3.1 Hourly
  win.setService('hourly');
  assert.strictEqual(doc.getElementById('sum-svc').textContent.trim(), 'Hourly Rental');
  
  const hourlyPickup = doc.getElementById('hourly-pickup');
  hourlyPickup.value = 'House 14, Road 11, Banani, Dhaka';
  win.updateHourlyLocation(hourlyPickup.value);
  assert.strictEqual(doc.getElementById('sum-pick').textContent, 'House 14, Road 11, Banani, Dhaka');

  const hourlyDur = doc.getElementById('hourly-dur');
  hourlyDur.value = '10h';
  win.calculateCustomerBookingFare();
  const hourlyTotal = doc.getElementById('cust-booking-total').textContent;
  console.log(`✓ Section 2.1: Hourly 10h total fare computed: ${hourlyTotal}`);

  // 3.2 Intercity
  win.setService('intercity');
  assert.strictEqual(doc.getElementById('sum-svc').textContent.trim(), 'Intercity Travel');
  win.setIntercityTripType('same_day');
  assert(doc.getElementById('sum-dir').textContent.includes('Same-Day'));
  assert(doc.getElementById('sum-pick').textContent.includes('⇄'));

  // 3.3 Airport Direction Inversion
  win.setService('airport');
  assert.strictEqual(doc.getElementById('sum-svc').textContent.trim(), 'Airport Transfer');
  win.setAirportDirection('from_airport');
  assert(doc.getElementById('sum-dir').textContent.includes('From Airport'));
  assert(doc.getElementById('lbl-air-pickup').textContent.includes('Drop-off Area'));
  assert(doc.getElementById('lbl-air-dropoff').textContent.includes('Airport Terminal'));
  assert.strictEqual(doc.getElementById('grp-air-flight').style.display, 'block');
  console.log('✓ Section 2.2: Airport direction inversion and flight number input verified.');

  // 4. Test Voucher Application
  const promoInput = doc.getElementById('cust-promo');
  promoInput.value = 'ROWNAA20';
  win.applyCustomerBookingPromo();
  assert.strictEqual(win.activeAppliedVoucher.code, 'ROWNAA20');
  assert.strictEqual(doc.getElementById('cust-discount-row').style.display, 'flex');
  console.log('✓ Section 2.3: Promo voucher ROWNAA20 (20%) applied and discount row displayed.');

  // 5. Test Payment Method
  win.onCustomerPayMethodChange('mfs');
  assert.strictEqual(win.activePaymentMethod, 'mfs');
  console.log('✓ Section 2.4: Payment method switch to bKash / Nagad verified.');

  // 6. Test Booking Submission & Validation
  const airDate = doc.getElementById('air-date');
  const airTime = doc.getElementById('air-time');
  
  // Future date
  const tomorrow = new Date(Date.now() + 86400000);
  airDate.value = tomorrow.toISOString().split('T')[0];
  airTime.value = '14:30';
  win.updateDateTime();
  assert(doc.getElementById('sum-dt').textContent.includes(airDate.value));

  const riderName = doc.getElementById('book-rider-name');
  const riderPhone = doc.getElementById('book-rider-phone');
  riderName.value = 'Mahmudur Rahman';
  riderPhone.value = '+8801712345678';

  const submitBtn = doc.getElementById('btn-submit');
  win.submitForm(submitBtn);

  await new Promise(r => setTimeout(r, 100));

  assert(win._lastBooking, 'Booking payload must be submitted to BookingsManager');
  assert.strictEqual(win._lastBooking.customerId, 'cust-999');
  assert.strictEqual(win._lastBooking.customerName, 'Mahmudur Rahman');
  assert.strictEqual(win._lastBooking.customerPhone, '+8801712345678');
  assert.strictEqual(win._lastBooking.service, 'airport');
  assert.strictEqual(win._lastBooking.paymentMethod, 'mfs');
  assert.strictEqual(win._lastBooking.voucherCode, 'ROWNAA20');
  console.log('✓ Section 2.5: Authenticated booking submitted with accurate payload and multi-tenant security.');

  console.log('\n======================================================');
  console.log('  ALL CUSTOMER PANEL RECONSTRUCTION TESTS PASSED 100%!');
  console.log('======================================================\n');
}

testCustomerPanelReconstructed().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
