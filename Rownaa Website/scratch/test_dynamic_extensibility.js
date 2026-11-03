const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 1000 }
  });

  const page = await browser.newPage();
  const url = 'file:///' + path.resolve('driver-register.html').replace(/\\/g, '/');

  try {
    console.log('Testing Dynamic Extensibility on:', url);
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    await new Promise(r => setTimeout(r, 600));

    // Fill Step 1 with custom area
    await page.type('#drv-name', 'Anisur Rahman');
    await page.type('#drv-phone', '01922334455');
    await page.type('#drv-nid', '19952692500000000');
    
    // Select Custom Area
    await page.select('#drv-city', '__custom__');
    await page.type('#drv-city-custom', 'Savar Industrial Zone & EPZ Hub');

    await page.type('#drv-emergency-name', 'Md. Shofiqul Islam (Uncle)');
    await page.type('#drv-emergency-phone', '01799887766');

    // Proceed to Step 2
    await page.click('#pane-step-1 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));

    // Fill Step 2 with custom language
    await page.type('#drv-license', 'DK0987654L');
    await page.type('#drv-expiry', '2029-06-30');
    await page.select('#drv-languages', '__custom__');
    await page.type('#drv-lang-custom', 'Arabic (Hajj & Umrah VIP Flights) + English');

    // Proceed to Step 3
    await page.click('#pane-step-2 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));

    // In Step 3: Add a Custom Service!
    await page.click('#btn-add-custom-service-tile');
    await page.type('#new-svc-name', 'VIP Armed Security Escort Convoy');
    await page.type('#new-svc-badge', '৳3,500/day Standby');
    await page.click('#custom-svc-creator-box button.btn-submit-custom-svc');
    await new Promise(r => setTimeout(r, 400));

    // Proceed to Step 4
    await page.click('#pane-step-3 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));

    // Fill Step 4 with custom payout wallet
    await page.select('#drv-payout-method', '__custom__');
    await page.type('#drv-payout-custom', 'Cellfin & MCash (IBBL)');
    await page.type('#drv-payout-number', '01922334455');

    // Proceed to Step 5
    await page.click('#pane-step-4 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));

    // Capture Step 5 Review showing dynamic fields
    await page.screenshot({ path: 'scratch/dynamic_step5_review.png' });
    console.log('Captured Step 5 Review Screen with dynamic custom fields');

    // Agree and Submit
    await page.click('#drv-agreement');
    await page.click('#btn-submit-drv');
    await new Promise(r => setTimeout(r, 1200));

    // Verify stored application in localStorage
    const saved = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('rownaa_driver_applications') || '[]');
    });
    console.log('SUCCESS! Stored dynamic application:');
    console.log(JSON.stringify(saved[0], null, 2));

  } catch (err) {
    console.error('Error in dynamic test:', err);
  } finally {
    await browser.close();
  }
})();
