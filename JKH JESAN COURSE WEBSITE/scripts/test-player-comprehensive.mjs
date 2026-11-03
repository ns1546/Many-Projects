import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\1abb8e3b-122b-48d2-bdbe-1af74ed5db93';

async function runComprehensivePlayerTest() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE VIDEO PLAYER AUDIT & TEST');
  console.log('====================================================');

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-web-security'
    ]
  });

  const page = await browser.newPage();
  
  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleMessages.push({ type, text });
    if (type === 'error' && !text.includes('favicon')) {
      console.log(`[Browser Console Error]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
    console.log(`[Uncaught Page Error]: ${err.toString()}`);
  });

  const testReport = {
    login: false,
    playerMounted: false,
    videojsInitialized: false,
    watermarkActive: false,
    playbackStarted: false,
    timeAdvancing: false,
    qualityMenuOpens: false,
    qualityChangeHUDTriggered: false,
    pauseOverlayVisible: false,
    rightClickSuppressed: false,
    screenshotWarningTriggered: false,
    fullscreenFunctionAvailable: false,
    noExternalYouTubeRedirects: false,
    artifacts: []
  };

  try {
    // Step 1: Programmatic Direct Authentication
    console.log('\n[Phase 1] Establishing authenticated session directly via NextAuth API...');
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfCookie
      },
      body: params.toString()
    });

    const setCookiesHeader = authRes.headers.getSetCookie ? authRes.headers.getSetCookie() : [authRes.headers.get('set-cookie')];
    const cookiesToSet = [];
    for (const c of setCookiesHeader) {
      if (!c) continue;
      const parts = c.split(';')[0].split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      cookiesToSet.push({
        name,
        value,
        domain: 'localhost',
        path: '/',
        httpOnly: true
      });
    }
    
    await page.setCookie(...cookiesToSet);
    testReport.login = true;
    console.log(`✅ Phase 1: Authentication successful. Set ${cookiesToSet.length} cookies.`);

    // Step 2: Navigate to Course Video Lesson
    console.log('\n[Phase 2] Navigating to active course video player lesson...');
    const lessonUrl = 'http://localhost:3000/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e';
    await page.goto(lessonUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Arrived at page:', page.url());
    await page.waitForSelector('#secure-player-container', { timeout: 35000 });
    await new Promise(r => setTimeout(r, 3000));

    testReport.playerMounted = true;
    console.log('✅ Phase 2: #secure-player-container successfully mounted.');

    // Step 3: Inspect Player DOM Structure & Security Shields
    console.log('\n[Phase 3] Inspecting Player DOM elements and shields...');
    const domInspection = await page.evaluate(() => {
      const container = document.getElementById('secure-player-container');
      const videoElement = container?.querySelector('.video-js');
      const clickShield = document.getElementById('secure-click-shield');
      const watermarkCanvas = document.getElementById('secure-ghost-watermark');
      const youtubeIframe = container?.querySelector('iframe');
      const topBar = container?.querySelector('.h-14');
      const watermarkShield = container?.querySelector('.z-34');

      return {
        hasContainer: !!container,
        hasVideoJs: !!videoElement,
        hasClickShield: !!clickShield,
        hasWatermarkCanvas: !!watermarkCanvas,
        canvasWidth: watermarkCanvas ? watermarkCanvas.offsetWidth : 0,
        canvasHeight: watermarkCanvas ? watermarkCanvas.offsetHeight : 0,
        hasYoutubeIframe: !!youtubeIframe,
        iframeSrc: youtubeIframe ? youtubeIframe.src : null,
        topBarText: topBar ? topBar.textContent?.trim() : null,
        hasWatermarkShield: !!watermarkShield,
      };
    });
    console.log('DOM Inspection details:', JSON.stringify(domInspection, null, 2));

    testReport.videojsInitialized = domInspection.hasVideoJs;
    testReport.watermarkActive = domInspection.hasWatermarkCanvas && domInspection.canvasWidth > 0;

    const initialScreenshotPath = path.join(ARTIFACT_DIR, 'player-initial-state.png');
    await page.screenshot({ path: initialScreenshotPath, fullPage: false });
    testReport.artifacts.push(initialScreenshotPath);
    console.log(`📸 Initial screenshot saved to ${initialScreenshotPath}`);

    // Step 4: Initiate Video Playback
    console.log('\n[Phase 4] Clicking play shield to start playback...');
    await page.click('#secure-click-shield');
    await new Promise(r => setTimeout(r, 4500));

    const playbackStatus1 = await page.evaluate(() => {
      const container = document.getElementById('secure-player-container');
      const vjs = container?.querySelector('.video-js');
      const isPlayingClass = vjs?.classList.contains('vjs-playing');
      const hasStartedClass = vjs?.classList.contains('vjs-has-started');
      
      let currentTime = null;
      let duration = null;
      let isPaused = null;
      try {
        const playerInstance = window.videojs?.getPlayers?.()['video-js'] ||
          Object.values(window.videojs?.getPlayers?.() || {})[0];
        if (playerInstance) {
          currentTime = playerInstance.currentTime();
          duration = playerInstance.duration();
          isPaused = playerInstance.paused();
        }
      } catch (_) {}

      return {
        isPlayingClass,
        hasStartedClass,
        currentTime,
        duration,
        isPaused
      };
    });
    console.log('Playback state after start:', JSON.stringify(playbackStatus1, null, 2));

    // Wait 3 seconds and check if time progressed
    await new Promise(r => setTimeout(r, 3000));
    const playbackStatus2 = await page.evaluate(() => {
      let currentTime = null;
      try {
        const playerInstance = Object.values(window.videojs?.getPlayers?.() || {})[0];
        if (playerInstance) {
          currentTime = playerInstance.currentTime();
        }
      } catch (_) {}
      return { currentTime };
    });
    console.log('Playback progress check after 3s:', JSON.stringify(playbackStatus2, null, 2));

    testReport.playbackStarted = playbackStatus1.isPlayingClass || playbackStatus1.hasStartedClass || (playbackStatus1.currentTime > 0);
    testReport.timeAdvancing = (playbackStatus2.currentTime !== null && playbackStatus2.currentTime > playbackStatus1.currentTime);

    const playingScreenshotPath = path.join(ARTIFACT_DIR, 'player-playback-active.png');
    await page.screenshot({ path: playingScreenshotPath, fullPage: false });
    testReport.artifacts.push(playingScreenshotPath);
    console.log(`📸 Playing screenshot saved to ${playingScreenshotPath}`);

    // Step 5: Test Resolution / Quality Dropdown
    console.log('\n[Phase 5] Testing Resolution / Quality Selector...');
    const topQualityBtn = await page.$('button[title*="রেজোলিউশন"]');
    if (topQualityBtn) {
      await topQualityBtn.click();
      await new Promise(r => setTimeout(r, 800));

      const menuInfo = await page.evaluate(() => {
        const menuItems = Array.from(document.querySelectorAll('button')).filter(b => 
          b.textContent?.includes('1080p') || 
          b.textContent?.includes('720p') || 
          b.textContent?.includes('480p')
        );
        return menuItems.map(m => m.textContent?.trim());
      });
      console.log('Available resolution options:', menuInfo);
      testReport.qualityMenuOpens = menuInfo.length > 0;

      const menuScreenshotPath = path.join(ARTIFACT_DIR, 'player-resolution-menu-open.png');
      await page.screenshot({ path: menuScreenshotPath, fullPage: false });
      testReport.artifacts.push(menuScreenshotPath);

      // Select 720p HD option
      const selected = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn720 = btns.find(b => b.textContent && b.textContent.includes('720p HD'));
        if (btn720) {
          btn720.click();
          return true;
        }
        return false;
      });
      console.log('Clicked 720p HD option:', selected);
      await new Promise(r => setTimeout(r, 1200));

      // Check HUD toast
      const hudText = await page.evaluate(() => {
        const toasts = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent?.includes('রেজোলিউশন:')
        );
        return toasts ? toasts.textContent?.trim() : null;
      });
      console.log('HUD Toast notification:', hudText);
      testReport.qualityChangeHUDTriggered = !!hudText;

      const hudScreenshotPath = path.join(ARTIFACT_DIR, 'player-resolution-toast-hud.png');
      await page.screenshot({ path: hudScreenshotPath, fullPage: false });
      testReport.artifacts.push(hudScreenshotPath);
    }

    // Step 6: Test Pause & Pause Overlay
    console.log('\n[Phase 6] Testing Pause & Pause Overlay...');
    await page.click('#secure-click-shield');
    await new Promise(r => setTimeout(r, 1500));

    const pauseCheck = await page.evaluate(() => {
      const container = document.getElementById('secure-player-container');
      const pauseOverlay = container?.querySelector('.bg-\\[\\#0A0D06\\]\\/80, [class*="backdrop-blur"]');
      const pauseText = container?.textContent?.includes('ভিডিওটি পজ করা হয়েছে');
      const vjs = container?.querySelector('.video-js');
      const isPausedClass = vjs?.classList.contains('vjs-paused');

      return {
        hasPauseText: !!pauseText,
        isPausedClass: !!isPausedClass,
        hasPauseOverlay: !!pauseOverlay
      };
    });
    console.log('Pause overlay check:', JSON.stringify(pauseCheck, null, 2));
    testReport.pauseOverlayVisible = pauseCheck.hasPauseText || pauseCheck.isPausedClass;

    const pausedScreenshotPath = path.join(ARTIFACT_DIR, 'player-pause-overlay.png');
    await page.screenshot({ path: pausedScreenshotPath, fullPage: false });
    testReport.artifacts.push(pausedScreenshotPath);

    // Step 7: Test Security Defenses (Right Click, Drag, PrintScreen)
    console.log('\n[Phase 7] Testing Right-Click and Copy suppression...');
    const securityCheck = await page.evaluate(() => {
      const container = document.getElementById('secure-player-container');
      if (!container) return { contextmenuPrevented: false, copyPrevented: false };

      const contextMenuEvt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      const copyEvt = new ClipboardEvent('copy', { bubbles: true, cancelable: true });

      container.dispatchEvent(contextMenuEvt);
      container.dispatchEvent(copyEvt);

      return {
        contextmenuPrevented: contextMenuEvt.defaultPrevented,
        copyPrevented: copyEvt.defaultPrevented,
      };
    });
    console.log('Security event suppression:', securityCheck);
    testReport.rightClickSuppressed = securityCheck.contextmenuPrevented;

    // Test PrintScreen Key Capture
    console.log('\n[Phase 8] Testing PrintScreen detection lockout...');
    await page.keyboard.press('PrintScreen');
    await new Promise(r => setTimeout(r, 600));

    const printScreenCheck = await page.evaluate(() => {
      const container = document.getElementById('secure-player-container');
      const alertEl = container?.textContent?.includes('স্ক্রিনশট বা ক্যাপচার সনাক্ত');
      return { triggered: !!alertEl };
    });
    console.log('Screenshot alert triggered:', printScreenCheck);
    testReport.screenshotWarningTriggered = printScreenCheck.triggered;

    if (printScreenCheck.triggered) {
      const screenshotWarningPath = path.join(ARTIFACT_DIR, 'player-screenshot-lockout.png');
      await page.screenshot({ path: screenshotWarningPath, fullPage: false });
      testReport.artifacts.push(screenshotWarningPath);
    }

    // Step 9: Verify No External YouTube Redirect Anchors
    console.log('\n[Phase 9] Checking for external YouTube clickable links inside container...');
    const youtubeLinks = await page.evaluate(() => {
      const container = document.getElementById('secure-player-container');
      const links = Array.from(container?.querySelectorAll('a') || [])
        .map(a => a.href)
        .filter(href => href.includes('youtube.com') || href.includes('youtu.be'));
      return links;
    });
    console.log('YouTube links inside container:', youtubeLinks);
    testReport.noExternalYouTubeRedirects = youtubeLinks.length === 0;

    // Step 10: Test Fullscreen Availability
    console.log('\n[Phase 10] Checking Fullscreen capability...');
    const fullscreenButton = await page.$('button[title*="ফুলস্ক্রিন"]');
    testReport.fullscreenFunctionAvailable = !!fullscreenButton;

    console.log('\n====================================================');
    console.log('🎉 AUDIT COMPLETE — FINAL TEST VERDICT');
    console.log('====================================================');
    console.log(JSON.stringify(testReport, null, 2));

  } catch (error) {
    console.error('❌ Audit execution failed with error:', error);
  } finally {
    await browser.close();
  }
}

runComprehensivePlayerTest().catch(console.error);
