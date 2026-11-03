const fs = require('fs');
const html = fs.readFileSync('admin/index.html', 'utf8');
const js = fs.readFileSync('admin/admin.js', 'utf8');

const submitStart = js.indexOf("settingsForm.addEventListener('submit'");
const submitEnd = js.indexOf('initAdminDashboard');
const submitBlock = js.substring(submitStart, submitEnd);

const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let m;
const ids = new Set();
while ((m = regex.exec(submitBlock)) !== null) {
  ids.add(m[1]);
}

console.log('Checked', ids.size, 'IDs:');
for (const id of ids) {
  const hasId = html.includes(`id="${id}"`);
  console.log(id, hasId ? 'OK' : '>>> MISSING IN HTML <<<');
}

// Also check top level declared variables in submit
const topVars = [
  'settingRestaurantName', 'settingLogoUrl', 'settingFaviconUrl', 'settingPrimaryColor',
  'settingSecondaryColor', 'settingButtonColor', 'settingTextColor', 'settingThemePreset',
  'settingFontFamily', 'settingCurrencySymbol', 'settingTaxRate', 'settingWebsiteBg',
  'settingHeroImage', 'settingHeroTitle', 'settingHeroSubtitle', 'settingHeroPhone',
  'settingFooterImage', 'settingFooterAddress', 'settingFooterPhone', 'settingFooterEmail',
  'settingFooterCopyright', 'settingSocialFb', 'settingSocialTwitter', 'settingSocialInsta',
  'settingSocialLinkedin'
];

console.log('\nChecking top variables:');
topVars.forEach(v => {
  const hasId = html.includes(`id="${v}"`);
  console.log(v, hasId ? 'OK' : '>>> MISSING IN HTML <<<');
});
