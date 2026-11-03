const fs = require('fs');
const invPath = 'g:/Download Official/Rownaa Website/js/inventory.js';
let content = fs.readFileSync(invPath, 'utf8');
if (!content.includes('window.DEFAULT_FLEET = DEFAULT_FLEET;')) {
  content = content.replace('const DEFAULT_FLEET = [', 'const DEFAULT_FLEET = window.DEFAULT_FLEET = [');
  fs.writeFileSync(invPath, content, 'utf8');
  console.log('window.DEFAULT_FLEET exposed!');
} else {
  console.log('Already exposed.');
}
