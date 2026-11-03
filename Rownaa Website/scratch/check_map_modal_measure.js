const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  // 1. Checkout page map modal
  const page1 = await browser.newPage();
  const fileUrl1 = 'file:///' + path.resolve('checkout.html').replace(/\\/g, '/');
  await page1.goto(fileUrl1, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Calling openMapModal("pickup") in checkout.html...');
  await page1.evaluate(() => {
    window.openMapModal('pickup');
  });
  await new Promise(r => setTimeout(r, 2000));
  await page1.screenshot({ path: 'scratch/checkout_modal_live.png' });

  const checkoutBoxes = await page1.evaluate(() => {
    const pitch = document.getElementById('btn-floating-pitch')?.getBoundingClientRect();
    const theme = document.getElementById('btn-floating-theme')?.getBoundingClientRect();
    const locate = document.getElementById('btn-floating-locate')?.getBoundingClientRect();
    const modalBox = document.querySelector('.map-modal-box')?.getBoundingClientRect();
    return {
      pitch: pitch ? { top: pitch.top, left: pitch.left, width: pitch.width, height: pitch.height } : null,
      theme: theme ? { top: theme.top, left: theme.left, width: theme.width, height: theme.height } : null,
      locate: locate ? { top: locate.top, left: locate.left, width: locate.width, height: locate.height } : null,
      modalBox: modalBox ? { top: modalBox.top, left: modalBox.left, width: modalBox.width, height: modalBox.height } : null
    };
  });
  console.log('Checkout Map Boxes:\n', JSON.stringify(checkoutBoxes, null, 2));

  // 2. Customer Panel map modal
  const page2 = await browser.newPage();
  const fileUrl2 = 'file:///' + path.resolve('customer-panel.html').replace(/\\/g, '/');
  await page2.goto(fileUrl2, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Calling openCustomerMapModal("hourly-pickup") in customer-panel.html...');
  await page2.evaluate(() => {
    window.openCustomerMapModal('hourly-pickup');
  });
  await new Promise(r => setTimeout(r, 2000));
  await page2.screenshot({ path: 'scratch/customer_modal_live.png' });

  const custBoxes = await page2.evaluate(() => {
    const pitch = document.querySelector('#cust-map-container .btn-floating-pitch')?.getBoundingClientRect();
    const theme = document.querySelector('#cust-map-container .btn-floating-theme')?.getBoundingClientRect();
    const locate = document.querySelector('#cust-map-container button[title="Center to GPS"]')?.getBoundingClientRect();
    const modalBox = document.querySelector('#custMapModal > div')?.getBoundingClientRect();
    return {
      pitch: pitch ? { top: pitch.top, left: pitch.left, width: pitch.width, height: pitch.height } : null,
      theme: theme ? { top: theme.top, left: theme.left, width: theme.width, height: theme.height } : null,
      locate: locate ? { top: locate.top, left: locate.left, width: locate.width, height: locate.height } : null,
      modalBox: modalBox ? { top: modalBox.top, left: modalBox.left, width: modalBox.width, height: modalBox.height } : null
    };
  });
  console.log('Customer Map Boxes:\n', JSON.stringify(custBoxes, null, 2));

  await browser.close();
})();
