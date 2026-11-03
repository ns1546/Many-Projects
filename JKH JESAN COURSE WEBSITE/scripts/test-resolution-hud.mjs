import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\1abb8e3b-122b-48d2-bdbe-1af74ed5db93';

async function testResolutionAndControls() {
  console.log('Testing Resolution Dropdown and Keyboard controls...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // 1. Direct auth
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const csrf = await csrfRes.json();
  const csrfCookie = csrfRes.headers.get('set-cookie');
  
  const params = new URLSearchParams();
  params.append('csrfToken', csrf.csrfToken);
  params.append('email', 'admin@jkhjesan.com');
  params.append('password', 'AdminPassword123!');
  params.append('redirect', 'false');
  params.append('json', 'true');
  
  const authRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': csrfCookie },
    body: params.toString()
  });

  const setCookiesHeader = authRes.headers.getSetCookie ? authRes.headers.getSetCookie() : [authRes.headers.get('set-cookie')];
  const cookiesToSet = [];
  for (const c of setCookiesHeader) {
    if (!c) continue;
    const parts = c.split(';')[0].split('=');
    cookiesToSet.push({
      name: parts[0].trim(),
      value: parts.slice(1).join('=').trim(),
      domain: 'localhost',
      path: '/',
      httpOnly: true
    });
  }
  await page.setCookie(...cookiesToSet);

  // 2. Navigate to lesson
  const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
  await page.goto(lessonUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForSelector('#secure-player-container', { timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // Pause if playing or play then pause so control bar is fully active
  console.log('Testing bottom resolution button click...');
  const bottomBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.title && b.title.includes('রেজোলিউশন (কোয়ালিটি)'));
  });

  if (bottomBtn) {
    await bottomBtn.click();
    await new Promise(r => setTimeout(r, 800));

    const menuItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('button')).filter(b => 
        b.textContent && (b.textContent.includes('FHD') || b.textContent.includes('720p HD') || b.textContent.includes('480p') || b.textContent.includes('Auto'))
      );
      return items.map(i => i.textContent.trim());
    });
    console.log('Opened bottom quality menu items:', menuItems);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'bottom-quality-menu-open.png') });

    // Click 720p HD
    const clicked720 = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn720 = btns.find(b => b.textContent && b.textContent.includes('720p HD'));
      if (btn720) {
        btn720.click();
        return true;
      }
      return false;
    });
    console.log('Selected 720p HD:', clicked720);
    await new Promise(r => setTimeout(r, 600));

    // Verify HUD toast
    const hud = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const found = all.find(el => el.textContent && el.textContent.includes('রেজোলিউশন:'));
      return found ? found.textContent.trim() : null;
    });
    console.log('Verified HUD Toast on quality switch:', hud);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hud-toast-verified.png') });

    // Check localStorage preferred quality
    const storedQuality = await page.evaluate(() => localStorage.getItem('evorise_preferred_quality'));
    console.log('Stored quality in localStorage:', storedQuality);
  }

  // Test Keyboard shortcuts
  console.log('Testing keyboard Space shortcut for toggle play/pause...');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 1000));
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 1000));

  await browser.close();
  console.log('Resolution and Controls test complete!');
}

testResolutionAndControls().catch(console.error);
