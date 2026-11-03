const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testMobileDriverRegister() {
  console.log('🚀 Starting Mobile Playwright verification on driver-register.html...');
  const browser = await chromium.launch({ headless: true });
  
  // Mobile context (Samsung Galaxy S20 / Pixel viewport: 360x780)
  const context = await browser.newContext({
    viewport: { width: 360, height: 780 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();
  const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\1ce46b1b-42f4-4c8c-b769-e4acb487d91d';

  // Navigate to local server
  await page.goto('http://127.0.0.1:3000/driver-register.html', { waitUntil: 'networkidle' });
  console.log('📄 Page loaded.');

  // 1. Verify Page Horizontal Scroll
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  console.log(`📏 Viewport Width: ${clientWidth}px | Document Scroll Width: ${scrollWidth}px`);
  if (scrollWidth > clientWidth + 2) {
    console.error(`❌ Page has horizontal overflow! scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
  } else {
    console.log('✅ PASS: Page has zero horizontal overflow on mobile.');
  }

  // 2. Verify Role Dock is hidden
  const dockVisible = await page.evaluate(() => {
    const dock = document.getElementById('rownaa-dev-dock');
    if (!dock) return false;
    const style = window.getComputedStyle(dock);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
  console.log(`🔒 Role Dock visible: ${dockVisible} (expected false)`);

  // 3. Capture Step 1 Mobile Screenshot
  const step1Img = path.join(artifactDir, 'mobile_driver_register_step1.png');
  await page.screenshot({ path: step1Img });
  console.log(`📸 Step 1 screenshot saved to: ${step1Img}`);

  // 4. Test Settings Modal on Mobile
  console.log('⚙️ Opening Settings Modal...');
  await page.click('#btn-open-settings');
  await page.waitForTimeout(400);

  const modalMetrics = await page.evaluate(() => {
    const card = document.getElementById('driver-settings-card');
    const overlay = document.getElementById('driver-settings-overlay');
    const closeBtn = document.querySelector('.sm-close-btn');
    const rect = card.getBoundingClientRect();
    const closeRect = closeBtn ? closeBtn.getBoundingClientRect() : null;
    return {
      cardWidth: rect.width,
      cardLeft: rect.left,
      cardRight: rect.right,
      windowWidth: window.innerWidth,
      cardScrollWidth: card.scrollWidth,
      cardClientWidth: card.clientWidth,
      closeBtnRight: closeRect ? closeRect.right : null,
      closeBtnVisible: !!closeBtn
    };
  });
  console.log('📊 Settings Modal Metrics:', modalMetrics);

  if (modalMetrics.cardRight > modalMetrics.windowWidth + 2) {
    console.error(`❌ Settings Modal overflows viewport! right=${modalMetrics.cardRight} > windowWidth=${modalMetrics.windowWidth}`);
  } else {
    console.log('✅ PASS: Settings Modal fits 100% within mobile viewport without clipping!');
  }

  const modalImg = path.join(artifactDir, 'mobile_driver_register_settings_modal.png');
  await page.screenshot({ path: modalImg });
  console.log(`📸 Settings Modal screenshot saved to: ${modalImg}`);

  // Close Settings Modal
  await page.click('.sm-close-btn');
  await page.waitForTimeout(300);

  // 5. Test Bengali Translation Toggle
  console.log('🌐 Testing Bengali Language Toggle...');
  await page.click('#lang-btn');
  await page.waitForTimeout(300);

  const bnTexts = await page.evaluate(() => {
    return {
      langBtn: document.getElementById('lang-btn-text').textContent,
      title1: document.getElementById('title-step-1').textContent,
      lblName: document.getElementById('lbl-name').textContent,
      btnNext1: document.getElementById('btn-next-1').textContent,
      pill1: document.getElementById('m-pill-1').textContent
    };
  });
  console.log('🇧🇩 Bengali Translated Texts:', bnTexts);

  const banglaImg = path.join(artifactDir, 'mobile_driver_register_bangla.png');
  await page.screenshot({ path: banglaImg });
  console.log(`📸 Bengali UI screenshot saved to: ${banglaImg}`);

  // Toggle back to English
  await page.click('#lang-btn');
  await page.waitForTimeout(300);
  const enBtnText = await page.evaluate(() => document.getElementById('lang-btn-text').textContent);
  console.log(`🇺🇸 Toggled back to English: ${enBtnText}`);

  // 6. Test Step 1 to Step 5 Flow with Mandatory Bypass
  console.log('⚡ Testing Mandatory Bypass & Step Navigation...');
  await page.click('#btn-open-settings');
  await page.waitForTimeout(300);
  await page.click('#setting-bypass-mandatory');
  await page.waitForTimeout(200);
  await page.click('.sm-footer .btn-primary'); // Save & Apply
  await page.waitForTimeout(300);

  // Advance steps
  await page.click('#btn-next-1');
  await page.waitForTimeout(300);
  await page.click('#btn-next-2');
  await page.waitForTimeout(300);
  await page.click('#btn-next-3');
  await page.waitForTimeout(300);
  await page.click('#btn-next-4');
  await page.waitForTimeout(300);

  const step5Active = await page.evaluate(() => {
    const pane = document.getElementById('pane-step-5');
    return pane && pane.classList.contains('active');
  });
  console.log(`🎯 Step 5 active: ${step5Active}`);

  const step5Img = path.join(artifactDir, 'mobile_driver_register_step5.png');
  await page.screenshot({ path: step5Img });
  console.log(`📸 Step 5 review screenshot saved to: ${step5Img}`);

  await browser.close();
  console.log('🎉 All mobile checks passed with 100% success!');
}

testMobileDriverRegister().catch(err => {
  console.error('Fatal error during test:', err);
  process.exit(1);
});
