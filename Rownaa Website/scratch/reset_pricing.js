const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new' });
  const adminPage = await browser.newPage();
  const adminUrl = 'file:///' + path.resolve('admin-panel.html').replace(/\\/g, '/');
  await adminPage.goto(adminUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));

  await adminPage.evaluate(() => {
    const inp = document.querySelector('input[data-cat="sedan_standard"][data-field="rate4h"]');
    if (inp) {
      inp.value = '2000';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  adminPage.on('dialog', async d => await d.accept());
  await adminPage.evaluate(async () => { await saveHourlyRates(); });
  console.log('Reset standard sedan rate to official 2000 Tk.');
  await browser.close();
})();

