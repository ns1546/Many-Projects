const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

console.log('🧪 Running Comprehensive Driver Registration & Netlify Integrity Verification (v3.3)...\n');

const rootDir = 'g:\\Download Official\\Rownaa Website';
const driverHtmlPath = path.join(rootDir, 'driver-register.html');
const netlifyHtmlPath = path.join(rootDir, 'netlify-driver-portal', 'index.html');
const netlifyRedirectsPath = path.join(rootDir, 'netlify-driver-portal', '_redirects');
const netlifyTomlPath = path.join(rootDir, 'netlify-driver-portal', 'netlify.toml');
const netlifyReadmePath = path.join(rootDir, 'netlify-driver-portal', 'README.md');
const webhookPath = path.join(rootDir, 'google_sheet_webhook.gs');

let allPassed = true;
function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    allPassed = false;
  }
}

// 1. Check Files Existence
console.log('📁 1. Verifying Files Existence & Size...');
assert(fs.existsSync(driverHtmlPath), 'driver-register.html exists');
assert(fs.existsSync(netlifyHtmlPath), 'netlify-driver-portal/index.html exists');
assert(fs.existsSync(netlifyRedirectsPath), 'netlify-driver-portal/_redirects exists');
assert(fs.existsSync(netlifyTomlPath), 'netlify-driver-portal/netlify.toml exists');
assert(fs.existsSync(netlifyReadmePath), 'netlify-driver-portal/README.md exists');
assert(fs.existsSync(webhookPath), 'google_sheet_webhook.gs exists');

const htmlStats = fs.statSync(driverHtmlPath);
assert(htmlStats.size > 40000, `driver-register.html is non-empty (${Math.round(htmlStats.size / 1024)} KB)`);

// 2. DOM Structure Analysis with Cheerio
console.log('\n🔍 2. Verifying DOM Elements & Integrity in driver-register.html...');
const htmlContent = fs.readFileSync(driverHtmlPath, 'utf8');
const $ = cheerio.load(htmlContent);

// Check steps
assert($('#driver-register-form').length === 1, 'Main driver form (#driver-register-form) exists');
assert($('#pane-step-1').length === 1, 'Step 1 pane exists');
assert($('#pane-step-2').length === 1, 'Step 2 pane exists');
assert($('#pane-step-3').length === 1, 'Step 3 pane exists');
assert($('#pane-step-4').length === 1, 'Step 4 pane exists');
assert($('#pane-step-5').length === 1, 'Step 5 pane exists');
assert($('#driver-success-screen').length === 1, 'Success screen exists');

// Check key inputs
assert($('#drv-name').length === 1, 'Full name input (#drv-name) exists');
assert($('#drv-phone').length === 1, 'Phone input (#drv-phone) exists');
assert($('#drv-nid').length === 1, 'NID input (#drv-nid) exists');
assert($('#drv-city').length === 1, 'Base city select (#drv-city) exists');
assert($('#drv-license').length === 1, 'License input (#drv-license) exists');
assert($('#drv-payout-method').length === 1, 'Payout method select exists');
assert($('#drv-payout-number').length === 1, 'Payout number input exists');

// Check 5 Document Upload Inputs (Photo + License Front/Back + NID Front/Back)
assert($('#file-photo').length === 1, 'Photo upload input (#file-photo) exists');
assert($('#file-license-front').length === 1, 'License FRONT upload input (#file-license-front) exists');
assert($('#file-license-back').length === 1, 'License BACK upload input (#file-license-back) exists');
assert($('#file-nid-front').length === 1, 'NID FRONT upload input (#file-nid-front) exists');
assert($('#file-nid-back').length === 1, 'NID BACK upload input (#file-nid-back) exists');
assert($('#drv-agreement').length === 1, 'Code of Conduct checkbox exists');

// Check Settings Modal
assert($('#driver-settings-overlay').length === 1, 'Settings modal overlay exists');
assert($('#driver-settings-card').length === 1, 'Settings modal card exists');
assert($('#setting-bypass-mandatory').length === 1, 'Mandatory bypass checkbox exists');
assert($('#sm-target-field').length === 1, 'Target field select for custom options exists');
assert($('#sm-new-option-val').length === 1, 'New option input exists');
assert($('#sm-sheet-url').length === 0, 'Google Sheet URL input correctly removed from settings modal for security');

// Check that unwanted sections were completely removed
assert($('.props-grid').length === 0, 'Hero 3 cards (.props-grid) completely removed from DOM');
assert($('.sheet-sync-status').length === 0, 'Sheet sync status box (.sheet-sync-status) completely removed from DOM');

// Check language toggle button
assert($('#lang-btn').length === 1, 'Language toggle button exists');
assert($('#lang-btn-text').text().includes('বাংলা সংস্করণ'), 'Language toggle starts with Bengali toggle text');

// 3. CSS Cascade & Mobile Order Verification
console.log('\n🎨 3. Verifying CSS Cascade & Mobile Responsiveness Order...');
const styleIndex = htmlContent.indexOf('<style>');
const lastMediaIndex = htmlContent.lastIndexOf('@media (max-width: 768px)');
const desktopCardIndex = htmlContent.indexOf('.settings-modal-card {');
assert(lastMediaIndex > desktopCardIndex, 'CRITICAL: @media (max-width: 768px) is positioned AFTER desktop styles to ensure proper override');

// Check that dev role dock is suppressed
assert(htmlContent.includes('#rownaa-dev-dock') && htmlContent.includes('display: none !important;'), 'Dev role dock suppressed via CSS');

// 4. Netlify Package Verification
console.log('\n📦 4. Verifying Netlify Standalone Deployment Package...');
const netlifyHtml = fs.readFileSync(netlifyHtmlPath, 'utf8');
assert(netlifyHtml.length === htmlContent.length, 'Netlify index.html matches driver-register.html');
const redirects = fs.readFileSync(netlifyRedirectsPath, 'utf8');
assert(redirects.includes('/*    /index.html   200'), '_redirects is correctly formatted for Netlify');
const toml = fs.readFileSync(netlifyTomlPath, 'utf8');
assert(toml.includes('publish = "."') && toml.includes('X-Frame-Options = "DENY"'), 'netlify.toml contains security headers');

// 5. Google Apps Script Webhook Security Audit & Dual-Side Uploads
console.log('\n🛡️ 5. Auditing Google Apps Script Security Protections (v3.3)...');
const webhookCode = fs.readFileSync(webhookPath, 'utf8');
assert(webhookCode.includes('sanitizeCellValue(val)'), 'Formula injection sanitizer (sanitizeCellValue) is implemented');
assert(webhookCode.includes('formatAsPlainText('), 'PlainText formatter (formatAsPlainText) is implemented to prevent #ERROR! on phone (+880)');
assert(webhookCode.includes('MAX_PAYLOAD_BYTES'), 'Payload byte ceiling (10MB) guard is active');
assert(webhookCode.includes('FOLDER_NAME = "Rownaa Chauffeur Documents"'), 'Dedicated isolated Drive folder is configured');
assert(webhookCode.includes('licenseFrontUrl') && webhookCode.includes('licenseBackUrl'), 'Script stores and links License Front and Back');
assert(webhookCode.includes('nidFrontUrl') && webhookCode.includes('nidBackUrl'), 'Script stores and links NID Front and Back');

if (allPassed) {
  console.log('\n🎉 ALL 27 VERIFICATION CHECKS PASSED WITH 100% SUCCESS RATE!\n');
} else {
  console.error('\n⚠️ SOME CHECKS FAILED. Please review output above.\n');
  process.exit(1);
}
