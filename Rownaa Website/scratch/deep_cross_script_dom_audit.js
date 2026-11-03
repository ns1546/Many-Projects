const fs = require('fs');
const path = require('path');

// Map of HTML files to their imported JS scripts
const htmlToJs = {
  'index.html': ['js/app.js'],
  'customer-panel.html': ['js/state.js', 'js/auth.js', 'js/bookings.js', 'js/inventory.js', 'js/notifications.js', 'js/reviews.js', 'js/users.js'],
  'owner-panel.html': ['js/state.js', 'js/auth.js', 'js/bookings.js', 'js/inventory.js', 'js/notifications.js'],
  'admin-panel.html': ['js/state.js', 'js/auth.js', 'js/bookings.js', 'js/inventory.js', 'js/notifications.js', 'js/users.js', 'js/admin-pricing.js', 'js/reviews.js'],
  'checkout.html': ['js/state.js', 'js/auth.js', 'js/bookings.js', 'js/pricing.js', 'js/notifications.js'],
  'find-cars.html': ['js/state.js', 'js/auth.js', 'js/inventory.js'],
  'owner-register.html': ['js/business.js'],
  'invoice.html': ['js/state.js', 'js/bookings.js']
};

console.log('=== DEEP CROSS-SCRIPT DOM INTEGRITY AUDIT ===\n');

for (const [htmlFile, scripts] of Object.entries(htmlToJs)) {
  const htmlContent = fs.readFileSync(htmlFile, 'utf8');
  console.log(`--- Checking ${htmlFile} ---`);
  
  scripts.forEach(scriptPath => {
    if (!fs.existsSync(scriptPath)) {
      console.log(`[ERROR] Script not found: ${scriptPath}`);
      return;
    }
    const jsContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Extract getElementById & querySelector(#id)
    const getElemMatches = [...jsContent.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
    const qsMatches = [...jsContent.matchAll(/querySelector\(['"]#([^'" .,>:)]+)['"]\)/g)].map(m => m[1]);
    const neededIds = [...new Set([...getElemMatches, ...qsMatches])];
    
    const missing = [];
    neededIds.forEach(id => {
      // Check if ID is in HTML or created dynamically via template strings in the JS files
      const regex = new RegExp('id=["\']' + id + '["\']');
      const inHtml = regex.test(htmlContent);
      const inJs = regex.test(jsContent);
      
      // If not in HTML and not generated in this script or inline scripts
      if (!inHtml && !inJs && !htmlContent.includes(`id="${id}"`) && !htmlContent.includes(`id='${id}'`)) {
        missing.push(id);
      }
    });

    if (missing.length > 0) {
      console.log(`  [Script ${scriptPath}] Missing IDs in ${htmlFile} (${missing.length}):`, missing);
    } else {
      console.log(`  [Script ${scriptPath}] ALL ${neededIds.length} target IDs resolved.`);
    }
  });
  console.log('');
}
