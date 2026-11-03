const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new' });
  const page = await browser.newPage();
  const fileUrl = 'file:///' + path.resolve('admin-panel.html').replace(/\\/g, '/');

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('ERROR:', msg.text());
  });

  await page.goto(fileUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  const stats = await page.evaluate(() => {
    return {
      title: document.title,
      kpiTotalBookings: document.getElementById('kpi-admin-total-bookings')?.textContent,
      kpiTotalRevenue: document.getElementById('kpi-admin-total-rev')?.textContent,
      bookingsTableRows: document.querySelectorAll('#admin-live-bookings tr').length,
      customersTableRows: document.querySelectorAll('#admin-customer-list tr').length,
      ownersTableRows: document.querySelectorAll('#admin-business-list tr').length,
      inventoryCards: document.querySelectorAll('#inventory-list .car-card').length
    };
  });

  console.log('Admin Panel Correct Element Counts:\n', JSON.stringify(stats, null, 2));
  await browser.close();
})();
