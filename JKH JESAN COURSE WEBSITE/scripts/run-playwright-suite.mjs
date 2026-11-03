import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ed5b92be-86f1-4c40-9fc8-e9c27ed8392b\\playwright';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const results = {
  timestamp: new Date().toISOString(),
  passed: 0,
  failed: 0,
  tests: [],
  consoleErrors: [],
  failedRequests: []
};

function recordTest(name, status, details = {}) {
  results.tests.push({ name, status, details });
  if (status === 'PASSED') {
    results.passed++;
    console.log(`[PASS] ${name}`);
  } else {
    results.failed++;
    console.error(`[FAIL] ${name}: ${details.error || 'Unknown error'}`);
  }
}

async function main() {
  console.log('====================================================');
  console.log('   LAUNCHING PLAYWRIGHT FULL SYSTEM E2E TEST SUITE   ');
  console.log('====================================================');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Sniff console and network
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      results.consoleErrors.push({ url: page.url(), text });
      console.log(`   [Browser Console Error]: ${text.slice(0, 160)}`);
    }
  });

  page.on('requestfailed', req => {
    const failure = req.failure();
    if (failure && !failure.errorText.includes('ERR_ABORTED')) {
      results.failedRequests.push({ url: req.url(), errorText: failure.errorText });
      console.log(`   [Network Request Failed]: ${req.url()} (${failure.errorText})`);
    }
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Homepage Rendering & Core Elements
    // ----------------------------------------------------
    console.log('\n--- Running Test 1: Homepage Navigation & Structure ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-homepage.png') });

    const title = await page.title();
    const hasHero = (await page.locator('h1').count()) > 0;
    const hasNav = (await page.locator('nav').count()) > 0;
    const hasFooter = (await page.locator('footer').count()) > 0;
    const courseCards = await page.locator('a[href*="/courses/"]').count();

    if (hasHero && hasNav && hasFooter) {
      recordTest('Homepage Structure & Navigation', 'PASSED', { title, courseCards });
    } else {
      recordTest('Homepage Structure & Navigation', 'FAILED', { error: 'Missing essential sections' });
    }

    // ----------------------------------------------------
    // TEST 2: Courses Catalog & Search Filter
    // ----------------------------------------------------
    console.log('\n--- Running Test 2: Courses Catalog & Filters ---');
    await page.goto(`${BASE_URL}/courses`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-courses-catalog.png') });

    const catalogCards = await page.locator('a[href*="/courses/"]').count();
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    const hasSearch = (await searchInput.count()) > 0;

    if (catalogCards > 0 && hasSearch) {
      await searchInput.fill('Vocal');
      await page.waitForTimeout(800);
      const filteredCount = await page.locator('a[href*="/courses/"]').count();
      recordTest('Courses Catalog & Search Filter', 'PASSED', { catalogCards, filteredCount });
    } else {
      recordTest('Courses Catalog & Search Filter', 'FAILED', { error: `Found ${catalogCards} cards, search: ${hasSearch}` });
    }

    // ----------------------------------------------------
    // TEST 3: Course Details & Curriculum
    // ----------------------------------------------------
    console.log('\n--- Running Test 3: Course Details & Curriculum Accordion ---');
    await page.goto(`${BASE_URL}/courses/vocal-processing-course`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-course-detail.png') });

    const courseHeading = await page.locator('h1').first().textContent();
    const curriculumItems = await page.locator('button:has-text("Module"), [data-state], .accordion-trigger').count();
    const enrollBtn = await page.locator('a[href*="/checkout/"], button:has-text("Enroll"), button:has-text("ভর্তি")').first().count();

    if (courseHeading && enrollBtn > 0) {
      recordTest('Course Detail View & Enrollment CTA', 'PASSED', { courseHeading, curriculumItems });
    } else {
      recordTest('Course Detail View & Enrollment CTA', 'FAILED', { error: 'Missing course title or enroll button' });
    }

    // ----------------------------------------------------
    // TEST 4: Contact & Terms Pages
    // ----------------------------------------------------
    console.log('\n--- Running Test 4: Contact & Policy Pages ---');
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    const hasContactForm = (await page.locator('form, input[type="email"]').count()) > 0;

    await page.goto(`${BASE_URL}/terms`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    const hasTerms = (await page.locator('h1, h2').count()) > 0;

    if (hasContactForm && hasTerms) {
      recordTest('Contact and Terms Pages Integrity', 'PASSED');
    } else {
      recordTest('Contact and Terms Pages Integrity', 'FAILED', { error: `Form: ${hasContactForm}, Terms: ${hasTerms}` });
    }

    // ----------------------------------------------------
    // TEST 5: Authentication & Security Gate
    // ----------------------------------------------------
    console.log('\n--- Running Test 5: Authentication & Session Gate ---');
    // Check unauthorized redirect
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    const redirectedToLogin = page.url().includes('/login');

    // Perform Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"], input[name="email"]', 'admin@jkhjesan.com');
    await page.fill('input[type="password"], input[name="password"]', 'AdminPassword123!');
    await page.click('button[type="submit"]');

    // Wait for auth session to establish
    await page.waitForTimeout(3000);

    const loggedInUrl = page.url();
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session-token') || c.name.includes('next-auth'));

    if (redirectedToLogin && sessionCookie) {
      recordTest('Authentication & Protected Route Gate', 'PASSED', { loggedInUrl, cookie: sessionCookie.name });
    } else {
      recordTest('Authentication & Protected Route Gate', 'FAILED', { redirectedToLogin, hasSession: !!sessionCookie, loggedInUrl });
    }

    // ----------------------------------------------------
    // TEST 6: Student Learning Room & Video/Music Player Deep Dive
    // ----------------------------------------------------
    console.log('\n--- Running Test 6: Secure Player & Quality Switcher Deep Dive ---');
    const lessonUrl = `${BASE_URL}/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e`;
    await page.goto(lessonUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-player-initial.png') });

    // Assert Player DOM
    const playerContainer = page.locator('#secure-player-container');
    const hasPlayer = (await playerContainer.count()) > 0;
    const watermark = page.locator('text=admin@jkhjesan.com');
    const hasWatermark = (await watermark.count()) > 0;

    // Quality Selector Interaction
    const resolutionBtn = page.locator('button:has-text("1080p"), button:has-text("720p"), button:has-text("Auto"), button:has-text("HD")').first();
    const hasResolutionBtn = (await resolutionBtn.count()) > 0;

    let qualitySwitched = false;
    let toastRendered = false;

    if (hasResolutionBtn) {
      await resolutionBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-player-quality-menu.png') });

      // Click on 720p HD or Auto
      const targetOption = page.locator('button:has-text("720p"), button:has-text("480p"), button:has-text("Auto")').first();
      if ((await targetOption.count()) > 0) {
        await targetOption.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-player-quality-selected.png') });

        // Check for HUD toast
        const hudToast = page.locator('.animate-in, [role="alert"], text=ভিডিও কোয়ালিটি');
        toastRendered = (await hudToast.count()) > 0;
        qualitySwitched = true;
      }
    }

    // Keyboard controls check: Space (Play/Pause)
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Sidebar lesson navigation check
    const nextLessonLink = page.locator('a[href*="/learn/76011916-44f0-490c-bdf2-eac9145ce69f/"]:has-text("EP - 02"), a[href*="/learn/76011916-44f0-490c-bdf2-eac9145ce69f/"]:has-text("EP 02")').first();
    const hasNextLesson = (await nextLessonLink.count()) > 0;
    let lessonNavSuccess = false;
    if (hasNextLesson) {
      await nextLessonLink.click();
      await page.waitForTimeout(3000);
      lessonNavSuccess = page.url().includes('6e50ea37-b1b7-473e-898b-7059e803aa1a');
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '07-player-next-lesson.png') });
    }

    if (hasPlayer && hasWatermark && hasResolutionBtn && qualitySwitched) {
      recordTest('Secure Video Player & Interactive Quality Selector', 'PASSED', {
        hasPlayer,
        hasWatermark,
        hasResolutionBtn,
        qualitySwitched,
        toastRendered,
        lessonNavSuccess
      });
    } else {
      recordTest('Secure Video Player & Interactive Quality Selector', 'FAILED', {
        hasPlayer,
        hasWatermark,
        hasResolutionBtn,
        qualitySwitched
      });
    }

    // ----------------------------------------------------
    // TEST 7: Draft Lesson Safe Fallback Check
    // ----------------------------------------------------
    console.log('\n--- Running Test 7: Draft Lesson Fallback Integrity ---');
    const draftLessonUrl = `${BASE_URL}/learn/cmuzu6we90001usl406sz6uaf/cmuzu6wea0003usl44k4cacx5`;
    await page.goto(draftLessonUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '08-draft-lesson-fallback.png') });

    const draftNotice = page.locator('text=ভিডিও লিংক শীঘ্রই যুক্ত করা হবে, text=শীঘ্রই আসছে');
    const hasDraftNotice = (await draftNotice.count()) > 0;
    const pageCrashed = (await page.locator('text=Application error, text=500 Internal').count()) > 0;

    if (hasDraftNotice && !pageCrashed) {
      recordTest('Draft Lesson Safe Fallback Handling', 'PASSED', { hasDraftNotice });
    } else {
      recordTest('Draft Lesson Safe Fallback Handling', 'FAILED', { hasDraftNotice, pageCrashed });
    }

    // ----------------------------------------------------
    // TEST 8: Admin Management Pages
    // ----------------------------------------------------
    console.log('\n--- Running Test 8: Admin Panel Health & Sub-routes ---');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '09-admin-dashboard.png') });
    const hasAdminCards = (await page.locator('text=সর্বমোট শিক্ষার্থী, text=Total Students, text=Total Revenue, text=মোট আয়').count()) > 0;

    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const hasOrders = (await page.locator('table, text=অর্ডার আইডি, text=Order ID, text=কোন অর্ডার পাওয়া যায়নি').count()) > 0;

    await page.goto(`${BASE_URL}/admin/settings`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    const hasSettings = (await page.locator('input, button[type="submit"], text=Settings, text=সেটিংস').count()) > 0;

    if (hasAdminCards && hasOrders && hasSettings) {
      recordTest('Admin Management Suite Routes', 'PASSED', { hasAdminCards, hasOrders, hasSettings });
    } else {
      recordTest('Admin Management Suite Routes', 'FAILED', { hasAdminCards, hasOrders, hasSettings });
    }

  } catch (err) {
    console.error('Critical test suite exception:', err);
    recordTest('Global Test Suite Execution', 'FAILED', { error: err.message, stack: err.stack });
  } finally {
    await browser.close();
  }

  // Save full JSON summary
  const reportPath = path.join(ARTIFACTS_DIR, 'playwright-summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log('\n====================================================');
  console.log(`   TEST EXECUTION COMPLETE: ${results.passed} PASSED / ${results.failed} FAILED   `);
  console.log(`   Console Errors Detected: ${results.consoleErrors.length}`);
  console.log(`   Failed Network Requests: ${results.failedRequests.length}`);
  console.log(`   Full JSON Report: ${reportPath}`);
  console.log('====================================================');
}

main().catch(console.error);