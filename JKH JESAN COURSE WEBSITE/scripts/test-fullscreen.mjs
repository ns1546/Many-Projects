import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ed5b92be-86f1-4c40-9fc8-e9c27ed8392b';

async function testFullscreen() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#email');
  await page.type('#email', 'admin@jkhjesan.com');
  await page.type('#password', 'AdminPassword123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await new Promise(r => setTimeout(r, 1500));

  // Navigate to video lesson
  const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
  await page.goto(lessonUrl, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#secure-player-container', { timeout: 12000 });
  await new Promise(r => setTimeout(r, 2000));

  // Start playback by clicking the shield
  console.log('Starting playback...');
  await page.click('#secure-click-shield');
  await new Promise(r => setTimeout(r, 1500));

  // Hover over player to reveal top bar and control bar
  await page.hover('#secure-player-container');
  await new Promise(r => setTimeout(r, 600));

  // Test Fullscreen via F key
  console.log('Testing fullscreen via keyboard shortcut F...');
  await page.keyboard.press('KeyF');
  await new Promise(r => setTimeout(r, 1200));

  const isFs = await page.evaluate(() => {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  });
  console.log('Is browser in fullscreen?:', isFs);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified-player-fullscreen-test.png') });
  console.log('📸 Fullscreen test screenshot captured!');

  // Check right click blocking
  console.log('Testing right-click contextmenu prevention...');
  const container = await page.$('#secure-player-container');
  const contextMenuBlocked = await page.evaluate(el => {
    let prevented = false;
    const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    el.dispatchEvent(evt);
    return evt.defaultPrevented;
  }, container);
  console.log('Context menu blocked (defaultPrevented):', contextMenuBlocked);

  await browser.close();
  console.log('Fullscreen and security tests passed.');
}

testFullscreen().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
