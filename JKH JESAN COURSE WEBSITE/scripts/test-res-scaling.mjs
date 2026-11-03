import puppeteer from 'puppeteer-core';

async function testResolutionScaling() {
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

  // Inspect iframe current width, height, and computed style
  const infoBefore = await page.evaluate(() => {
    const iframe = document.querySelector('#secure-player-container iframe');
    if (!iframe) return null;
    const rect = iframe.getBoundingClientRect();
    return {
      offsetWidth: iframe.offsetWidth,
      offsetHeight: iframe.offsetHeight,
      clientWidth: iframe.clientWidth,
      clientHeight: iframe.clientHeight,
      rectWidth: rect.width,
      rectHeight: rect.height,
    };
  });

  console.log('Iframe dimensions before:', infoBefore);

  // Now dynamically set high-res virtual viewport on iframe
  await page.evaluate(() => {
    const iframe = document.querySelector('#secure-player-container iframe');
    const container = document.getElementById('secure-player-container');
    if (!iframe || !container) return;

    // A 1920x1080 canvas scaled into container
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    const targetW = 1920;
    const targetH = 1080;
    const scaleFactor = Math.max(cWidth / targetW, cHeight / targetH) * 1.30;

    iframe.style.width = '1920px';
    iframe.style.height = '1080px';
    iframe.style.transform = `translate(-50%, -50%) scale(${scaleFactor})`;
  });

  await new Promise(r => setTimeout(r, 2000));

  const infoAfter = await page.evaluate(() => {
    const iframe = document.querySelector('#secure-player-container iframe');
    if (!iframe) return null;
    const rect = iframe.getBoundingClientRect();
    return {
      offsetWidth: iframe.offsetWidth,
      offsetHeight: iframe.offsetHeight,
      rectWidth: rect.width,
      rectHeight: rect.height,
      styleWidth: iframe.style.width,
      styleHeight: iframe.style.height,
      styleTransform: iframe.style.transform
    };
  });

  console.log('Iframe dimensions after high-res scaling:', infoAfter);

  await browser.close();
}

testResolutionScaling().catch(err => console.error(err));

