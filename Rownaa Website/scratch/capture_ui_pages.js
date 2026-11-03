const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const pages = [
    { file: 'index.html', name: '01_landing' },
    { file: 'find-cars.html', name: '02_find_cars' },
    { file: 'checkout.html', name: '03_checkout' },
    { file: 'customer-panel.html', name: '04_customer_panel' },
    { file: 'owner-panel.html', name: '05_owner_panel' },
    { file: 'admin-panel.html', name: '06_admin_panel' }
  ];

  for (const p of pages) {
    const page = await browser.newPage();
    const url = 'file:///' + path.resolve(p.file).replace(/\\/g, '/');
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 10000 });
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({ path: `scratch/ui_audit_${p.name}.png`, fullPage: false });
      console.log(`Captured screenshot for ${p.file}`);
    } catch (e) {
      console.error(`Failed ${p.file}:`, e.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();

