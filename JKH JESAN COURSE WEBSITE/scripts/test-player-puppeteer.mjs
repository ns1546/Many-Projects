import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ed5b92be-86f1-4c40-9fc8-e9c27ed8392b\\screenshots';

async function main() {
  console.log('[1/6] Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1280, height: 850 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // 1. Log in via UI
  console.log('[2/6] Logging in through /login interface...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"], input[name="email"], input[placeholder*="ইমেইল"]', 'admin@jkhjesan.com');
  await page.type('input[type="password"], input[name="password"], input[placeholder*="পাসওয়ার্ড"]', 'AdminPassword123!');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(r => setTimeout(r, 1500));
  console.log('✅ Auth completed. Current URL:', page.url());

  // 2. Navigate to course lesson
  console.log('[3/6] Navigating to active video lesson page...');
  const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
  await page.goto(lessonUrl, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#secure-player-container', { timeout: 12000 });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 1: Initial Player Loaded
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-player-loaded.png') });
  console.log('📸 01-player-loaded.png captured');

  // 3. Click resolution dropdown button
  console.log('[4/6] Opening resolution selector dropdown...');
  await page.click('button[title*="রেজোলিউশন"]');
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 2: Resolution menu open
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-resolution-menu-open.png') });
  console.log('📸 02-resolution-menu-open.png captured');

  // 4. Select 720p HD resolution
  console.log('[5/6] Selecting 720p HD resolution...');
  const options = await page.$$('button');
  let selectedOptionText = '';
  for (const opt of options) {
    const text = await page.evaluate(el => el.textContent, opt);
    if (text.includes('720p')) {
      selectedOptionText = text;
      await opt.click();
      break;
    }
  }
  console.log('Selected option:', selectedOptionText);
  await new Promise(r => setTimeout(r, 400));

  // Screenshot 3: HUD notification toast
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-hud-toast-notification.png') });
  console.log('📸 03-hud-toast-notification.png captured');

  // 5. Test draft lesson fallback
  console.log('[6/6] Testing draft placeholder lesson fallback...');
  const draftUrl = 'http://localhost:3000/learn/cmuzu6we90001usl406sz6uaf/cmuzu6wea0003usl44k4cacx5';
  await page.goto(draftUrl, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 4: Draft Lesson safe placeholder card
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-draft-lesson-placeholder-card.png') });
  console.log('📸 04-draft-lesson-placeholder-card.png captured');

  await browser.close();
  console.log('\n🎉 ALL REAL BROWSER TESTS EXECUTED AND RECORDED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Puppeteer test execution failed:', err);
  process.exit(1);
});

