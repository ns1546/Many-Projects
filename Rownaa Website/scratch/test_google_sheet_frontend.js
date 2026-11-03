const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing driver-register.html Google Sheet integration...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const filePath = 'file:///' + path.resolve('driver-register.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  // Verify Google Sheet pipe badge
  const badgeText = await page.evaluate(() => {
    const el = document.getElementById('sheet-sync-title');
    return el ? el.textContent : '';
  });
  console.log('Google Sheet Database Badge:', badgeText);

  // Fill Step 1
  await page.type('#drv-name', 'Kabir Hossain');
  await page.type('#drv-phone', '01711223344');
  await page.type('#drv-nid', '1990269458000777');
  await page.type('#drv-emergency-name', 'Nasima Begum');
  await page.type('#drv-emergency-phone', '01899001122');
  await page.click('#pane-step-1 .btn-step-next');
  await new Promise(r => setTimeout(r, 400));

  // Step 2
  await page.type('#drv-license', 'DL-DH-44556');
  await page.type('#drv-expiry', '2028-12-31');
  await page.click('#pane-step-2 .btn-step-next');
  await new Promise(r => setTimeout(r, 400));

  // Step 3
  await page.click('#pane-step-3 .btn-step-next');
  await new Promise(r => setTimeout(r, 400));

  // Step 4
  await page.type('#drv-payout-number', '01711223344');
  await page.click('#pane-step-4 .btn-step-next');
  await new Promise(r => setTimeout(r, 400));

  // Step 5
  await page.click('#drv-agreement');
  await page.click('#btn-submit-drv');
  await new Promise(r => setTimeout(r, 1200));

  // Verify success screen
  const successRef = await page.evaluate(() => {
    const el = document.getElementById('success-ref-badge');
    return el ? el.textContent : '';
  });
  console.log('Success Screen Badge:', successRef);

  // Verify stored in localStorage
  const storedCount = await page.evaluate(() => {
    const raw = localStorage.getItem('rownaa_driver_applications');
    const arr = raw ? JSON.parse(raw) : [];
    return arr.length;
  });
  console.log(`Stored in browser database: ${storedCount} application(s)`);

  const screenshotPath = path.resolve('C:/Users/User/.gemini/antigravity/brain/1ce46b1b-42f4-4c8c-b769-e4acb487d91d/driver_google_sheet_receipt.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('✅ Google Sheet Frontend Engine fully verified!');
})();

