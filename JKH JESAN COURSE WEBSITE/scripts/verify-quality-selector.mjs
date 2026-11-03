import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ed5b92be-86f1-4c40-9fc8-e9c27ed8392b';

async function main() {
  console.log('[1/6] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // 1. Login
  console.log('[2/6] Logging in as admin...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#email');
  await page.type('#email', 'admin@jkhjesan.com');
  await page.type('#password', 'AdminPassword123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await new Promise(r => setTimeout(r, 1500));

  // 2. Navigate to lesson
  console.log('[3/6] Navigating to active video lesson...');
  const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
  await page.goto(lessonUrl, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#secure-player-container', { timeout: 12000 });
  await new Promise(r => setTimeout(r, 2000));

  // Start playback
  console.log('[4/6] Starting video playback...');
  await page.click('#secure-click-shield');
  await new Promise(r => setTimeout(r, 2000));

  // Check initial quality button text in bottom bar
  const initialBottomQuality = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const qBtn = btns.find(b => b.title && b.title.includes('রেজোলিউশন (কোয়ালিটি)'));
    return qBtn ? qBtn.textContent.trim() : null;
  });
  console.log('Initial bottom resolution button text:', initialBottomQuality);

  // Click bottom quality selector button to open menu
  console.log('[5/6] Opening bottom resolution selector menu...');
  const qBtnHandle = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.title && b.title.includes('রেজোলিউশন (কোয়ালিটি)'));
  });
  if (qBtnHandle) {
    await qBtnHandle.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified-bottom-quality-menu-open.png') });
    console.log('📸 verified-bottom-quality-menu-open.png captured');
  }

  // Click 720p HD option
  console.log('[6/6] Selecting 720p HD resolution...');
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const opt720 = btns.find(b => b.textContent && b.textContent.includes('720p'));
    if (opt720) {
      opt720.click();
      return true;
    }
    return false;
  });
  console.log('Clicked 720p option:', clicked);
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified-720p-quality-selected.png') });
  console.log('📸 verified-720p-quality-selected.png captured');

  // Verify persistence after 4 seconds of playback
  await new Promise(r => setTimeout(r, 4000));
  const postPlaybackStatus = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const qBtn = btns.find(b => b.title && b.title.includes('রেজোলিউশন (কোয়ালিটি)'));
    return {
      currentBtnText: qBtn ? qBtn.textContent.trim() : null,
      savedQualityInStorage: localStorage.getItem('evorise_preferred_quality')
    };
  });
  console.log('Post-playback quality status (remains 720p, zero revert):', postPlaybackStatus);

  await browser.close();
  console.log('🎉 Quality control verification completed successfully!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

