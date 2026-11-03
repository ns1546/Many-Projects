const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const url = 'file:///' + path.resolve('customer-panel.html').replace(/\\/g, '/');

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 10000 });
    await new Promise(r => setTimeout(r, 800));

    // 1. Screenshot normal customer panel
    await page.screenshot({ path: 'scratch/customer_panel_normal.png', fullPage: false });
    console.log('Saved normal customer panel screenshot');

    // 2. Open Review modal
    await page.evaluate(() => {
      window.openReviewModal('BK-DAC-7821');
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scratch/customer_panel_modal_open.png', fullPage: false });
    console.log('Saved review modal open screenshot');

    // 3. Close Review modal
    await page.evaluate(() => {
      window.closeReviewModal();
    });
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: 'scratch/customer_panel_modal_closed.png', fullPage: false });
    console.log('Saved review modal closed screenshot');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
})();

