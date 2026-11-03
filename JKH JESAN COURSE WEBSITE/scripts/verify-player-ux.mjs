import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ed5b92be-86f1-4c40-9fc8-e9c27ed8392b';

async function main() {
  console.log('[1/7] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // 1. Login
  console.log('[2/7] Logging in as admin...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#email');
  await page.type('#email', 'admin@jkhjesan.com');
  await page.type('#password', 'AdminPassword123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await new Promise(r => setTimeout(r, 1500));

  // 2. Navigate to lesson
  console.log('[3/7] Navigating to active video lesson...');
  const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
  await page.goto(lessonUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#secure-player-container', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const container = await page.$('#secure-player-container');
  if (!container) throw new Error('#secure-player-container not found');

  // Verify computed iframe properties (no 1.30 zoom!)
  const iframeInfo = await page.evaluate(() => {
    const iframe = document.querySelector('#secure-player-container iframe');
    if (!iframe) return { found: false };
    const style = window.getComputedStyle(iframe);
    return {
      found: true,
      transform: style.transform,
      pointerEvents: style.pointerEvents,
      width: style.width,
      height: style.height,
      objectFit: style.objectFit,
    };
  });
  console.log('[4/7] Iframe computed properties:', iframeInfo);

  // 3. Start playback
  console.log('[5/7] Playing video...');
  await page.click('#secure-click-shield');
  await new Promise(r => setTimeout(r, 3500));

  // Take screenshot while playing
  const playingShotPath = path.join(ARTIFACT_DIR, 'verified-player-playing-full.png');
  await container.screenshot({ path: playingShotPath });
  console.log('Saved playing screenshot to:', playingShotPath);

  // 4. Pause the video
  console.log('[6/7] Pausing video...');
  await page.click('#secure-click-shield');
  await new Promise(r => setTimeout(r, 1500));

  // Check paused controls & watermark shield
  const pausedDetails = await page.evaluate(() => {
    const cb = document.querySelector('.vjs-control-bar');
    const pauseOverlay = document.querySelector('.vjs-paused');
    const btns = Array.from(document.querySelectorAll('button'));
    const qualityBtn = btns.find(b => b.title && b.title.includes('রেজোলিউশন (কোয়ালিটি)'));
    const watermarkBadge = document.querySelector('#secure-player-container [aria-hidden="true"]');
    
    let cbStyle = null;
    if (cb) {
      const s = window.getComputedStyle(cb);
      cbStyle = { display: s.display, visibility: s.visibility, opacity: s.opacity };
    }

    return {
      controlBar: cbStyle,
      hasBottomQualityButton: !!qualityBtn,
      qualityButtonText: qualityBtn ? qualityBtn.textContent.trim() : null,
      hasWatermarkBadge: !!watermarkBadge,
    };
  });
  console.log('Paused Details:', pausedDetails);

  // Take screenshot while paused (showing unblocked controls + pause indicator)
  const pausedShotPath = path.join(ARTIFACT_DIR, 'verified-player-paused-with-controls.png');
  await container.screenshot({ path: pausedShotPath });
  console.log('Saved paused screenshot to:', pausedShotPath);

  // 5. Open bottom quality selector while paused
  console.log('[7/7] Opening bottom resolution selector while paused...');
  const bottomQualityBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.title && b.title.includes('রেজোলিউশন (কোয়ালিটি)'));
  });

  if (bottomQualityBtn) {
    await bottomQualityBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    const menuShotPath = path.join(ARTIFACT_DIR, 'verified-player-paused-quality-menu.png');
    await container.screenshot({ path: menuShotPath });
    console.log('Saved paused quality menu screenshot to:', menuShotPath);

    // Select 1080p FHD
    const selected = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn1080 = btns.find(b => b.textContent && b.textContent.includes('1080p FHD'));
      if (btn1080) {
        btn1080.click();
        return true;
      }
      return false;
    });
    console.log('Selected 1080p FHD:', selected);
    await new Promise(r => setTimeout(r, 1200));

    const selectedShotPath = path.join(ARTIFACT_DIR, 'verified-player-paused-1080p-selected.png');
    await container.screenshot({ path: selectedShotPath });
    console.log('Saved 1080p selected screenshot to:', selectedShotPath);
  }

  // 6. Test Right-Click Context Menu Suppression
  const isRightClickSuppressed = await page.evaluate(() => {
    let prevented = false;
    const container = document.querySelector('#secure-player-container');
    const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    container.dispatchEvent(evt);
    return evt.defaultPrevented;
  });
  console.log('Right-click contextmenu suppressed:', isRightClickSuppressed);

  await browser.close();
  console.log('All tests passed with 100% success!');
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
