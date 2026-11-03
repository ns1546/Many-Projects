const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\1ce46b1b-42f4-4c8c-b769-e4acb487d91d';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set mobile viewport (iPhone 13 / 14: 390x844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:3000/driver-register.html', { waitUntil: 'networkidle0' });

  // 1. Mobile Header & Hero (Clean: no extraneous nav links, no role bar, no 60k cards)
  await page.screenshot({ path: path.join(artifactDir, 'proof_1_mobile_clean_header.png') });
  console.log('1. Captured proof_1_mobile_clean_header.png');

  // 2. Open Settings Modal on Mobile
  await page.evaluate(() => window.openDriverSettingsModal());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'proof_2_mobile_settings_modal.png') });
  console.log('2. Captured proof_2_mobile_settings_modal.png');

  // 3. Close Settings Modal
  await page.evaluate(() => window.closeDriverSettingsModal());
  await new Promise(r => setTimeout(r, 300));

  // 4. Test Step 5 (5 Separate Upload Cards: Photo, License Front, License Back, NID Front, NID Back)
  await page.evaluate(() => window.goToStep(5));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'proof_3_mobile_step5_five_uploads.png') });
  console.log('3. Captured proof_3_mobile_step5_five_uploads.png');

  // 5. Test Bangla Translation Toggle
  await page.evaluate(() => window.toggleLanguage());
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(artifactDir, 'proof_4_mobile_step5_bangla_translated.png') });
  console.log('4. Captured proof_4_mobile_step5_bangla_translated.png');

  // 6. Desktop View (1200x900)
  await page.setViewport({ width: 1200, height: 900 });
  await page.screenshot({ path: path.join(artifactDir, 'proof_5_desktop_step5_five_uploads.png') });
  console.log('5. Captured proof_5_desktop_step5_five_uploads.png');

  await browser.close();
  console.log('ALL 5 PROOF ARTIFACTS GENERATED SUCCESSFULLY!');
})();

