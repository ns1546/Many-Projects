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

  const reviewDisplay = await page.evaluate(() => {
    const el = document.getElementById('review-modal-panel');
    const ov = document.getElementById('review-modal-overlay');
    return {
      panelDisplay: window.getComputedStyle(el).display,
      panelVisibility: window.getComputedStyle(el).visibility,
      panelOffsetTop: el.offsetTop,
      overlayDisplay: window.getComputedStyle(ov).display
    };
  });

  console.log('Review modal initial state:', reviewDisplay);

  await browser.close();
})();

