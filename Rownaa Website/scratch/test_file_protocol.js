const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFileProtocol() {
  console.log('Testing pages loaded via file:/// protocol (Direct double-click from File Explorer)...\n');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const files = [
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

  for (const file of files) {
    const page = await browser.newPage();
    const errors = [];
    const failedRequests = [];

    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('requestfailed', req => {
      failedRequests.push(`${req.url()} (${req.failure()?.errorText || 'failed'})`);
    });

    const fileUrl = 'file:///' + path.resolve(file).replace(/\\/g, '/');
    console.log(`Checking ${file} (${fileUrl})...`);
    try {
      await page.goto(fileUrl, { waitUntil: 'load', timeout: 5000 });
      await new Promise(r => setTimeout(r, 600));

      const title = await page.title();
      const bodyTextLength = (await page.evaluate(() => document.body.innerText)).length;
      const visibleElements = await page.evaluate(() => {
        return {
          hasHeader: !!document.querySelector('header, .nav, .sidebar'),
          hasContent: document.body.children.length > 0,
          dockVisible: !!document.getElementById('rownaa-dev-dock')
        };
      });

      console.log(`  Title: "${title}", Body Length: ${bodyTextLength}`);
      console.log(`  DOM Health:`, visibleElements);
      if (errors.length > 0) {
        console.log(`  ❌ Console/Page Errors (${errors.length}):`);
        errors.forEach(e => console.log('    -', e));
      } else {
        console.log(`  ✅ 0 Console Errors`);
      }
      if (failedRequests.length > 0) {
        console.log(`  ⚠️ Failed Network Requests (${failedRequests.length}):`);
        failedRequests.forEach(f => console.log('    -', f));
      }
    } catch (e) {
      console.error(`  FATAL on ${file}:`, e.message);
    }
    console.log('----------------------------------------------------------');
    await page.close();
  }

  await browser.close();
}

testFileProtocol().catch(console.error);

