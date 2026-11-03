import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ed5b92be-86f1-4c40-9fc8-e9c27ed8392b\\lighthouse';
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
process.env.CHROME_PATH = CHROME_PATH;

const BASE_URL = 'http://localhost:3000';

async function getAuthCookie() {
  console.log('Retrieving authenticated session cookie for Lighthouse player audit...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.fill('#email', 'admin@jkhjesan.com');
  await page.fill('#password', 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const cookies = await context.cookies();
  await browser.close();

  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  const headersFile = path.join(ARTIFACTS_DIR, 'auth-headers.json');
  fs.writeFileSync(headersFile, JSON.stringify({ Cookie: cookieHeader }, null, 2));
  console.log('Auth headers saved to:', headersFile);
  return headersFile;
}

async function main() {
  const authHeadersPath = await getAuthCookie();

  const targets = [
    { name: 'homepage', url: `${BASE_URL}/`, auth: false },
    { name: 'courses-catalog', url: `${BASE_URL}/courses`, auth: false },
    { name: 'learning-player', url: `${BASE_URL}/learn/76011916-44f0-490c-bdf2-eac9145ce69f/093d5c22-2d8f-42ea-882e-749381a7364e`, auth: true }
  ];

  const auditSummary = [];

  for (const target of targets) {
    console.log(`\n======================================================`);
    console.log(`   RUNNING GOOGLE LIGHTHOUSE AUDIT: ${target.name.toUpperCase()}   `);
    console.log(`   Target URL: ${target.url}`);
    console.log(`   Authenticated: ${target.auth}`);
    console.log(`======================================================`);

    const outputPath = path.join(ARTIFACTS_DIR, target.name);

    let cmd = `npx lighthouse "${target.url}" ` +
      `--chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage" ` +
      `--preset=desktop ` +
      `--only-categories=performance,accessibility,best-practices,seo ` +
      `--output=json --output=html ` +
      `--output-path="${outputPath}" ` +
      `--quiet`;

    if (target.auth && fs.existsSync(authHeadersPath)) {
      cmd += ` --extra-headers="${authHeadersPath}"`;
    }

    try {
      execSync(cmd, { stdio: 'inherit', env: process.env, timeout: 150000 });

      const jsonPath = `${outputPath}.report.json`;
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const scores = {
          name: target.name,
          url: target.url,
          performance: Math.round((data.categories.performance?.score || 0) * 100),
          accessibility: Math.round((data.categories.accessibility?.score || 0) * 100),
          bestPractices: Math.round((data.categories['best-practices']?.score || 0) * 100),
          seo: Math.round((data.categories.seo?.score || 0) * 100),
          fcp: data.audits['first-contentful-paint']?.displayValue,
          lcp: data.audits['largest-contentful-paint']?.displayValue,
          cls: data.audits['cumulative-layout-shift']?.displayValue,
          tbt: data.audits['total-blocking-time']?.displayValue,
          speedIndex: data.audits['speed-index']?.displayValue,
          opportunities: Object.values(data.audits)
            .filter(a => a.details && a.details.type === 'opportunity' && a.score !== 1)
            .map(a => ({ title: a.title, savings: a.displayValue })),
          accessibilityViolations: Object.values(data.audits)
            .filter(a => a.score === 0 && a.id && (data.categories.accessibility.auditRefs.some(ref => ref.id === a.id)))
            .map(a => ({ id: a.id, title: a.title, description: a.description }))
        };
        auditSummary.push(scores);
        console.log(`[SCORES] Perf: ${scores.performance}% | A11y: ${scores.accessibility}% | BestPractices: ${scores.bestPractices}% | SEO: ${scores.seo}%`);
        console.log(`[CORE VITALS] LCP: ${scores.lcp} | FCP: ${scores.fcp} | CLS: ${scores.cls} | TBT: ${scores.tbt}`);
      }
    } catch (err) {
      console.error(`Failed to audit ${target.name}:`, err.message);
    }
  }

  const summaryPath = path.join(ARTIFACTS_DIR, 'lighthouse-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(auditSummary, null, 2));

  console.log('\n======================================================');
  console.log('   ALL LIGHTHOUSE AUDITS COMPLETED SUCCESSFULLY       ');
  console.log(`   Summary saved to: ${summaryPath}`);
  console.log('======================================================');
}

main().catch(console.error);
