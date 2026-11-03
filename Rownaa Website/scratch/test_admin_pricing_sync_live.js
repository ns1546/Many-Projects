const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTest() {
  console.log('--- STARTING LIVE BROWSER MULTI-PANEL PRICING SYNC TEST ---\n');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  // Step 1: Open admin-panel.html under file:///
  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1280, height: 900 });
  const adminUrl = 'file:///' + path.resolve('admin-panel.html').replace(/\\/g, '/');
  console.log('1. Loading Admin Panel:', adminUrl);
  await adminPage.goto(adminUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  // Navigate to Pricing tab
  await adminPage.evaluate(() => {
    switchTab('pricing');
  });
  await new Promise(r => setTimeout(r, 400));

  // Edit Sedan (Standard) 4h rate to 2750
  console.log('2. Modifying Sedan (Standard) 4h rate to 2750 Tk in Admin Panel...');
  await adminPage.evaluate(() => {
    const inp = document.querySelector('input[data-cat="sedan_standard"][data-field="rate4h"]');
    if (inp) {
      inp.value = '2750';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  // Save Hourly Rates
  console.log('3. Triggering saveHourlyRates() in Admin...');
  adminPage.on('dialog', async dialog => {
    console.log('   Admin Alert received:', dialog.message());
    await dialog.accept();
  });
  await adminPage.evaluate(async () => {
    await saveHourlyRates();
  });
  await new Promise(r => setTimeout(r, 500));

  // Step 2: Open checkout.html under file:///
  const checkoutPage = await browser.newPage();
  const checkoutUrl = 'file:///' + path.resolve('checkout.html').replace(/\\/g, '/') + '?car=Toyota%20Allion%20A15';
  console.log('\n4. Loading Checkout Page for Toyota Allion A15 (Standard Sedan):', checkoutUrl);
  await checkoutPage.goto(checkoutUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  const checkoutPrice = await checkoutPage.evaluate(() => {
    return {
      baseFareText: document.getElementById('s-base')?.textContent,
      totalText: document.getElementById('s-total')?.textContent,
      vatText: document.getElementById('s-vat')?.textContent
    };
  });
  console.log('   Checkout Dynamically Calculated:', checkoutPrice);

  // Step 3: Open customer-panel.html under file:///
  const custPage = await browser.newPage();
  const custUrl = 'file:///' + path.resolve('customer-panel.html').replace(/\\/g, '/');
  console.log('\n5. Loading Customer Panel:', custUrl);
  await custPage.goto(custUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  const custPrice = await custPage.evaluate(() => {
    if (typeof setService === 'function') setService('hourly');
    const sel = document.getElementById('book-car-select');
    if (sel) {
      sel.value = 'sedan_standard';
      calculateCustomerBookingFare();
    }
    return {
      baseFare: document.getElementById('cust-base-fare')?.textContent,
      total: document.getElementById('cust-booking-total')?.textContent
    };
  });
  console.log('   Customer Panel Booking Calculator:', custPrice);

  // Step 4: Open owner-register.html under file:///
  const ownerRegPage = await browser.newPage();
  const ownerRegUrl = 'file:///' + path.resolve('owner-register.html').replace(/\\/g, '/');
  console.log('\n6. Loading Owner Registration Page:', ownerRegUrl);
  await ownerRegPage.goto(ownerRegUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  const ownerTariff = await ownerRegPage.evaluate(() => {
    return {
      adminBase: document.getElementById('reg-admin-base')?.textContent,
      partnerPayout: document.getElementById('reg-partner-payout')?.textContent
    };
  });
  console.log('   Owner Register Partner Payout:', ownerTariff);

  console.log('\n--- VALIDATION SUMMARY ---');
  const pass1 = checkoutPrice.baseFareText === '৳2750';
  const pass2 = custPrice.baseFare.includes('2,750');
  const pass3 = ownerTariff.adminBase.includes('2,750');
  console.log('Checkout Base Fare updated to ৳2750:', pass1 ? '✅ PASS' : '❌ FAIL (' + checkoutPrice.baseFareText + ')');
  console.log('Customer Panel Base Fare updated to ৳2,750:', pass2 ? '✅ PASS' : '❌ FAIL (' + custPrice.baseFare + ')');
  console.log('Owner Register Admin Base updated to ৳2,750:', pass3 ? '✅ PASS' : '❌ FAIL (' + ownerTariff.adminBase + ')');

  await browser.close();
  if (pass1 && pass2 && pass3) {
    console.log('\n🎯 ALL 3 PANELS 100% SYNCHRONIZED WITH ADMIN PRICING EDITS!');
  } else {
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
