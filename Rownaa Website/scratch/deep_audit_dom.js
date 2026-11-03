const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'owner-panel.html',
  'customer-panel.html',
  'admin-panel.html',
  'checkout.html',
  'find-cars.html',
  'login-sliding.html',
  'login.html',
  'register.html',
  'owner-register.html',
  'invoice.html'
];

console.log('=== 1. CHECKING getElementById AND querySelector(#id) ACROSS ALL HTML FILES ===');

const results = {};

files.forEach(htmlFile => {
  const content = fs.readFileSync(htmlFile, 'utf8');
  const getElemMatches = [...content.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
  const qsMatches = [...content.matchAll(/querySelector\(['"]#([^'" .,>:)]+)['"]\)/g)].map(m => m[1]);
  const allIdsNeeded = new Set([...getElemMatches, ...qsMatches]);

  const missingIds = [];
  allIdsNeeded.forEach(id => {
    // Check if id exists in html file
    const regex = new RegExp('id=["\']' + id + '["\']');
    if (!regex.test(content)) {
      missingIds.push(id);
    }
  });

  results[htmlFile] = { total: allIdsNeeded.size, missing: missingIds };
  if (missingIds.length > 0) {
    console.log(`[MISSING DOM ID] in ${htmlFile} (${missingIds.length} missing):`, missingIds);
  } else {
    console.log(`[OK] ${htmlFile}: All ${allIdsNeeded.size} referenced IDs exist in DOM.`);
  }
});
