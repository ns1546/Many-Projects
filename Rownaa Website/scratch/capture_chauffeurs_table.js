const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto('http://127.0.0.1:3000/admin-panel.html', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.switchTab('drivers');
  });

  await new Promise(r => setTimeout(r, 1000));

  const screenshotPath = path.resolve('C:/Users/User/.gemini/antigravity/brain/1ce46b1b-42f4-4c8c-b769-e4acb487d91d/admin_chauffeurs_table_verified.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`Saved screenshot to: ${screenshotPath}`);

  await browser.close();
})();

