const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const filesToTest = [
  'index.html',
  'find-cars.html',
  'checkout.html',
  'customer-panel.html',
  'owner-panel.html',
  'admin-panel.html',
  'owner-register.html',
  'login.html',
  'login-sliding.html'
];

async function runHumanAudit() {
  console.log('================================================================');
  console.log('COMPREHENSIVE HUMAN EXPERIENCE & FUNCTIONALITY AUDIT (file:///)');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const report = {};

  for (const file of filesToTest) {
    console.log(`\n>>> Auditing [${file}] as human user...`);
    const page = await browser.newPage();
    const errors = [];
    const dialogs = [];

    page.on('dialog', async dialog => {
      dialogs.push({ type: dialog.type(), message: dialog.message() });
      await dialog.dismiss();
    });

    page.on('pageerror', err => errors.push({ type: 'pageerror', text: err.message }));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push({ type: 'console.error', text: msg.text() });
    });

    const fileUrl = 'file:///' + path.resolve(file).replace(/\\/g, '/');
    try {
      await page.goto(fileUrl, { waitUntil: 'load', timeout: 10000 });
      await new Promise(r => setTimeout(r, 600));

      const title = await page.title();
      const currentUrl = page.url();
      const wasRedirected = currentUrl !== fileUrl;

      // Collect specific details per page
      let pageDetails = {};
      if (file === 'customer-panel.html') {
        pageDetails = await page.evaluate(() => {
          return {
            tripsRendered: document.querySelectorAll('#my-trips-list > *').length,
            fleetRendered: document.querySelectorAll('#customer-fleet-grid > *').length,
            servicesAvailable: Array.from(document.querySelectorAll('.s-tab')).map(el => el.innerText.trim())
          };
        });
      } else if (file === 'admin-panel.html') {
        pageDetails = await page.evaluate(() => {
          return {
            bookingsCount: document.querySelectorAll('#admin-bookings-table tbody tr').length,
            ownersCount: document.querySelectorAll('#admin-owners-table tbody tr, #registrations-table-body tr').length,
            pricingInputs: document.querySelectorAll('input[id*="price"], input[id*="rate"], input[id*="tariff"]').length
          };
        });
      } else if (file === 'owner-panel.html') {
        pageDetails = await page.evaluate(() => {
          return {
            fleetCount: document.querySelectorAll('#owner-fleet-grid > *, #owner-fleet-table tbody tr').length,
            tripsCount: document.querySelectorAll('#owner-trips-list > *, #owner-bookings-table tbody tr').length
          };
        });
      } else if (file === 'checkout.html') {
        pageDetails = await page.evaluate(() => {
          return {
            serviceCards: document.querySelectorAll('.service-type-card, [data-service]').length,
            hasMapTrigger: !!document.querySelector('[onclick*="openMapModal"]'),
            hasGpsTrigger: !!document.querySelector('[onclick*="CurrentLocation"]')
          };
        });
      } else if (file === 'find-cars.html') {
        pageDetails = await page.evaluate(() => {
          return {
            carCards: document.querySelectorAll('.car-card, .fleet-card, [data-car-id]').length,
            cityFilterExists: !!document.getElementById('pickup-city') || !!document.querySelector('[name="city"]')
          };
        });
      }

      // Test clicking interactive tabs safely
      const tabElements = await page.evaluate(() => {
        const els = [];
        document.querySelectorAll('.tab, .nav-item, .s-tab, .nav-btn, [data-tab]').forEach((el, i) => {
          els.push({ index: i, text: el.innerText.trim().slice(0, 30) });
        });
        return els.slice(0, 15);
      });

      for (const t of tabElements) {
        try {
          await page.evaluate(idx => {
            const el = document.querySelectorAll('.tab, .nav-item, .s-tab, .nav-btn, [data-tab]')[idx];
            if (el) el.click();
          }, t.index);
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {}
      }

      report[file] = {
        title,
        redirected: wasRedirected ? currentUrl : false,
        details: pageDetails,
        errors: errors,
        dialogs: dialogs
      };

      console.log(`  Title: "${title}"`);
      console.log(`  Redirected: ${wasRedirected ? 'YES to ' + currentUrl : 'NO'}`);
      console.log(`  Details:`, pageDetails);
      if (dialogs.length > 0) {
        console.log(`  Alerts/Dialogs (${dialogs.length}):`, dialogs.map(d => d.message));
      }
      if (errors.length > 0) {
        console.log(`  ❌ Errors (${errors.length}):`);
        errors.forEach(e => console.log(`     - [${e.type}] ${e.text}`));
      } else {
        console.log(`  ✅ 0 Errors`);
      }

    } catch (pageErr) {
      console.error(`  FATAL ERROR on ${file}:`, pageErr.message);
      report[file] = { fatal: pageErr.message };
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n================================================================');
  console.log('AUDIT SUMMARY COMPLETE');
  console.log('================================================================');
}

runHumanAudit().catch(console.error);
