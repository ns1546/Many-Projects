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

  await page.goto(url, { waitUntil: 'load', timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    window.openReviewModal('BK-DAC-7821');
  });

  const modalBox = await page.evaluate(() => {
    const el = document.getElementById('review-modal-panel');
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      display: window.getComputedStyle(el).display
    };
  });

  console.log('Modal box geometry when open:', modalBox);

  await browser.close();
})();

