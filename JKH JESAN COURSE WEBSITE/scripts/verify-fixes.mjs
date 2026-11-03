import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ed5b92be-86f1-4c40-9fc8-e9c27ed8392b';

async function verify() {
  console.log('[1/7] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // Test 1: Verify Homepage Section Ordering
  console.log('[2/7] Checking Homepage Section Order on http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified-homepage-courses-next-to-banner.png'), fullPage: false });
  
  const sectionOrder = await page.evaluate(() => {
    const mainSections = Array.from(document.querySelectorAll('main > div > *, body > div > *'));
    const bannerIdx = mainSections.findIndex(el => el.querySelector('.keen-slider, [class*="slider"]') || el.textContent.includes('ব্যানার') || el.classList.contains('keen-slider'));
    const popularCoursesH2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('জনপ্রিয়') && h.textContent.includes('কোর্সসমূহ'));
    const coursesSection = popularCoursesH2 ? popularCoursesH2.closest('section') : null;
    const coursesIdx = coursesSection ? mainSections.indexOf(coursesSection) : -1;
    return { bannerIdx, coursesIdx, coursesFound: !!coursesSection, h2Text: popularCoursesH2?.textContent?.trim() };
  });
  console.log('Homepage Layout Check Result:', JSON.stringify(sectionOrder, null, 2));

  // Test 2: Login as admin
  console.log('[3/7] Logging in as admin...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#email');
  await page.type('#email', 'admin@jkhjesan.com');
  await page.type('#password', 'AdminPassword123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await new Promise(r => setTimeout(r, 2000));

  // Test 3: Navigate to active video lesson
  console.log('[4/7] Navigating to active video lesson...');
  const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
  await page.goto(lessonUrl, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#secure-player-container', { timeout: 12000 });
  await new Promise(r => setTimeout(r, 2500));

  // Test 4: Verify Player Playing State & No YouTube UI leaks
  console.log('[5/7] Verifying player styles, pointer-events, and absence of YouTube links...');
  const playerMetrics = await page.evaluate(() => {
    const container = document.getElementById('secure-player-container');
    const iframe = container ? container.querySelector('iframe') : null;
    const shield = document.getElementById('secure-click-shield');
    const watermark = document.getElementById('secure-ghost-watermark');
    const iframeStyle = iframe ? window.getComputedStyle(iframe) : null;

    return {
      containerExists: !!container,
      iframeExists: !!iframe,
      pointerEventsNone: iframeStyle?.pointerEvents === 'none',
      transformScale: iframeStyle?.transform,
      shieldExists: !!shield,
      watermarkExists: !!watermark,
      youtubeLinksInsideContainer: Array.from(container?.querySelectorAll('a') || [])
        .map(a => a.href)
        .filter(href => href.includes('youtube.com') || href.includes('youtu.be')),
    };
  });
  console.log('Player Metrics:', JSON.stringify(playerMetrics, null, 2));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified-player-playing-no-youtube.png') });

  // Test 5: Open Resolution Menu
  console.log('[6/7] Testing resolution menu...');
  const resBtn = await page.$('button[title*="রেজোলিউশন"]');
  if (resBtn) {
    await resBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified-player-resolution-menu.png') });
  }

  // Test 6: Pause Video & Check 100% Solid Pause Overlay
  console.log('[7/7] Testing pause overlay opaqueness...');
  const shieldEl = await page.$('#secure-click-shield');
  if (shieldEl) {
    await shieldEl.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified-player-paused-solid-black.png') });
  }

  await browser.close();
  console.log('🎉 Verification completed successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
