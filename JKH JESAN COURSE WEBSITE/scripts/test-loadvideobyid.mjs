import puppeteer from 'puppeteer-core';

async function testLoadVideoById() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#email');
  await page.type('#email', 'admin@jkhjesan.com');
  await page.type('#password', 'AdminPassword123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await new Promise(r => setTimeout(r, 1500));

  const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
  await page.goto(lessonUrl, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#secure-player-container', { timeout: 12000 });
  await new Promise(r => setTimeout(r, 2000));

  // Start playback
  await page.click('#secure-click-shield');
  await new Promise(r => setTimeout(r, 3000));

  // Check quality change via loadVideoById in page context
  const res = await page.evaluate(() => {
    const vContainer = document.querySelector('[data-vjs-player]');
    const vjsEl = vContainer?.querySelector('.video-js');
    if (!vjsEl) return { error: 'No vjsEl' };
    
    // We can get the videojs player instance from the element id
    const playerId = vjsEl.id;
    return { playerId };
  });

  console.log('Player ID:', res);
  await browser.close();
}

testLoadVideoById().catch(err => console.error(err));

