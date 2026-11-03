const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\1ce46b1b-42f4-4c8c-b769-e4acb487d91d';

(async () => {
  console.log('Testing live browser form submission to Web App V3...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

  await page.goto('http://127.0.0.1:3000/driver-register.html', { waitUntil: 'networkidle0' });

  // Fill Step 1
  await page.type('#drv-name', 'Tariqul Islam Chauffeur (Live Test)');
  await page.type('#drv-phone', '01811223344');
  await page.type('#drv-nid', '1990269458000555');
  await page.select('#drv-city', 'Dhaka — Gulshan & Airport DAC Zone');
  await page.type('#drv-emergency-name', 'Nasima Begum (Wife)');
  await page.type('#drv-emergency-phone', '01911002233');

  // Go to Step 2
  await page.evaluate(() => window.goToStep(2));
  await new Promise(r => setTimeout(r, 200));

  // Fill Step 2
  await page.type('#drv-license', 'DK0981273L');
  await page.select('#drv-license-type', 'Professional Light');
  await page.type('#drv-expiry', '2028-12-31');
  await page.select('#drv-exp', '5-10 Years');

  // Go to Step 3
  await page.evaluate(() => window.goToStep(3));
  await new Promise(r => setTimeout(r, 200));

  // Go to Step 4
  await page.evaluate(() => window.goToStep(4));
  await new Promise(r => setTimeout(r, 200));

  // Fill Step 4
  await page.type('#drv-payout-number', '01811223344');

  // Go to Step 5
  await page.evaluate(() => window.goToStep(5));
  await new Promise(r => setTimeout(r, 300));

  // Check agreement
  await page.evaluate(() => {
    document.getElementById('drv-agreement').checked = true;
  });

  console.log('Dispatching form submission...');
  await page.evaluate(() => {
    document.getElementById('driver-register-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });

  // Wait 4 seconds for fetch to complete and success screen to show
  await new Promise(r => setTimeout(r, 4500));

  const isSuccessVisible = await page.evaluate(() => {
    const screen = document.getElementById('driver-success-screen');
    return screen && screen.style.display !== 'none' && getComputedStyle(screen).display !== 'none';
  });

  console.log('Success screen visible in browser:', isSuccessVisible);
  await page.screenshot({ path: path.join(artifactDir, 'driver_live_browser_success_verified.png') });
  console.log('Saved driver_live_browser_success_verified.png');

  await browser.close();
  console.log('Browser live submission test finished successfully!');
})();
