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
  const errors = [];
  const warnings = [];

  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('CONSOLE-ERROR: ' + msg.text());
    if (msg.type() === 'warning') warnings.push('WARN: ' + msg.text());
  });

  const fileUrl = 'file:///' + path.resolve('customer-panel.html').replace(/\\/g, '/');
  console.log('Navigating to', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Check all sidebar/navigation tabs
  const tabs = ['book', 'trips', 'fleet', 'profile'];
  for (const t of tabs) {
    console.log(`\nTesting Tab: ${t}...`);
    await page.evaluate(tabName => {
      if (typeof switchTab === 'function') switchTab(tabName);
    }, t);
    await new Promise(r => setTimeout(r, 600));
    
    // Check if panel is visible
    const isVisible = await page.evaluate(tabName => {
      const p = document.getElementById(`pnl-${tabName}`);
      return p && p.classList.contains('active');
    }, t);
    console.log(`  Tab ${t} active:`, isVisible);

    if (t === 'trips') {
      const tripCount = await page.evaluate(() => {
        return document.querySelectorAll('#my-trips-list .trip-card, #my-trips-list tr, #my-trips-list > div').length;
      });
      console.log(`  Trips count in list:`, tripCount);
    }

    if (t === 'fleet') {
      const fleetCount = await page.evaluate(() => {
        return document.querySelectorAll('#customer-fleet-grid .fleet-card, #customer-fleet-grid > div').length;
      });
      console.log(`  Fleet vehicles displayed:`, fleetCount);
    }
  }

  // 2. Test booking services
  console.log('\nTesting Booking Services Tabs...');
  await page.evaluate(() => switchTab('book'));
  const services = ['hourly', 'airport', 'intercity', 'corporate', 'tour'];
  for (const s of services) {
    console.log(`  Selecting service: ${s}...`);
    await page.evaluate(svc => {
      if (typeof setService === 'function') setService(svc);
    }, s);
    await new Promise(r => setTimeout(r, 500));
    
    const fareInfo = await page.evaluate(() => {
      return {
        base: document.getElementById('cust-base-fare')?.innerText,
        vat: document.getElementById('cust-vat-val')?.innerText,
        total: document.getElementById('cust-booking-total')?.innerText
      };
    });
    console.log(`  Service ${s} Fare:`, fareInfo);
  }

  console.log('\nTotal Console/Page Errors:', errors.length);
  errors.forEach(e => console.log('  ❌', e));

  await browser.close();
})();

