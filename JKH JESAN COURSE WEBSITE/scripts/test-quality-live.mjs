import puppeteer from 'puppeteer-core';

async function testQuality() {
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

  // Start playback
  await page.click('#secure-click-shield');
  await new Promise(r => setTimeout(r, 2000));

  // Inspect YouTube player tech
  const ytInfo = await page.evaluate(() => {
    const videoJsEl = document.querySelector('.video-js');
    const player = window.videojs?.getPlayer(videoJsEl);
    if (!player) return { error: 'No videojs player found' };
    const tech = player.tech_;
    const yt = tech?.ytPlayer;
    if (!yt) return { error: 'No ytPlayer found on tech' };

    const availableLevels = typeof yt.getAvailableQualityLevels === 'function' ? yt.getAvailableQualityLevels() : 'no fn';
    const currentQuality = typeof yt.getPlaybackQuality === 'function' ? yt.getPlaybackQuality() : 'no fn';
    const allMethods = Object.keys(yt).filter(k => typeof yt[k] === 'function');

    return {
      availableLevels,
      currentQuality,
      hasSetPlaybackQuality: typeof yt.setPlaybackQuality === 'function',
      hasSetPlaybackQualityRange: typeof yt.setPlaybackQualityRange === 'function',
      hasLoadVideoById: typeof yt.loadVideoById === 'function',
      allMethods: allMethods.slice(0, 30)
    };
  });

  console.log('YouTube Player Info:', JSON.stringify(ytInfo, null, 2));

  // Test setPlaybackQuality vs loadVideoById
  const changeResult = await page.evaluate(() => {
    const videoJsEl = document.querySelector('.video-js');
    const player = window.videojs?.getPlayer(videoJsEl);
    const yt = player?.tech_?.ytPlayer;
    if (!yt) return { error: 'No yt' };

    const before = yt.getPlaybackQuality?.();
    yt.setPlaybackQuality?.('hd1080');
    if (typeof yt.setPlaybackQualityRange === 'function') {
      yt.setPlaybackQualityRange('hd1080', 'hd1080');
    }
    const immediatelyAfter = yt.getPlaybackQuality?.();

    return { before, immediatelyAfter };
  });

  console.log('Quality Change Test (immediate):', changeResult);

  await new Promise(r => setTimeout(r, 3000));

  const after3s = await page.evaluate(() => {
    const videoJsEl = document.querySelector('.video-js');
    const player = window.videojs?.getPlayer(videoJsEl);
    const yt = player?.tech_?.ytPlayer;
    return yt ? yt.getPlaybackQuality?.() : null;
  });

  console.log('Quality after 3s:', after3s);

  await browser.close();
}

testQuality().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
