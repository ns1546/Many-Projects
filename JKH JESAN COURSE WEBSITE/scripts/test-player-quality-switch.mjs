import puppeteer from 'puppeteer-core';

async function testPlayerQualitySwitch() {
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
  await new Promise(r => setTimeout(r, 2000));

  // Check what videojs methods exist
  const res = await page.evaluate(() => {
    const videoJsEl = document.querySelector('.video-js');
    // In video.js, getPlayers() contains all active players!
    const allPlayers = (window.videojs ? window.videojs.getPlayers() : {}) || {};
    const playerKeys = Object.keys(allPlayers);
    let player = playerKeys.length > 0 ? allPlayers[playerKeys[0]] : null;

    if (!player && (window.videojs)) {
      player = window.videojs.getPlayer(videoJsEl);
    }

    if (!player) {
      // Find player from DOM node
      const techEl = document.querySelector('.vjs-tech');
      return { found: false, playerKeys, hasWindowVideoJs: !!window.videojs };
    }

    const tech = player.tech_;
    const yt = tech?.ytPlayer;

    return {
      found: true,
      currentTime: player.currentTime(),
      duration: player.duration(),
      hasYt: !!yt,
      hasLoadVideoById: typeof yt?.loadVideoById === 'function',
      hasSetPlaybackQuality: typeof yt?.setPlaybackQuality === 'function',
    };
  });

  console.log('Player Inspection:', res);
  await browser.close();
}

testPlayerQualitySwitch().catch(err => console.error(err));

