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
    console.log('Navigating to:', url);
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    await new Promise(r => setTimeout(r, 600));

    // 1. Screenshot Step 1
    await page.screenshot({ path: 'scratch/driver_step1_personal.png' });
    console.log('Captured Step 1');

    // Fill Step 1
    await page.type('#drv-name', 'Md. Kamal Hossain');
    await page.type('#drv-phone', '01711223344');
    await page.type('#drv-nid', '19882692500000000');
    await page.type('#drv-emergency-name', 'Md. Rafiqul Islam (Brother)');
    await page.type('#drv-emergency-phone', '01811998877');

    // Proceed to Step 2
    await page.click('#pane-step-1 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/driver_step2_license.png' });
    console.log('Captured Step 2');

    // Fill Step 2
    await page.type('#drv-license', 'DK0129384L');
    await page.type('#drv-expiry', '2028-12-31');

    // Proceed to Step 3
    await page.click('#pane-step-2 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/driver_step3_services.png' });
    console.log('Captured Step 3');

    // Proceed to Step 4
    await page.click('#pane-step-3 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));
    
    // Fill Step 4
    await page.type('#drv-payout-number', '01711223344');
    await page.screenshot({ path: 'scratch/driver_step4_payout.png' });
    console.log('Captured Step 4');

    // Proceed to Step 5
    await page.click('#pane-step-4 .btn-step-next');
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/driver_step5_review.png' });
    console.log('Captured Step 5');

    // Agree and Submit
    await page.click('#drv-agreement');
    await page.click('#btn-submit-drv');
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot Success Screen
    await page.screenshot({ path: 'scratch/driver_success_screen.png' });
    console.log('Captured Success Screen');

    // Verify localStorage data
    const saved = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('rownaa_driver_applications') || '[]');
    });
    console.log('Total Driver Applications in Storage:', saved.length);
    console.log('Latest Application Data:', JSON.stringify(saved[0], null, 2));

  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await browser.close();
  }
})();
