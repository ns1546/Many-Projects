const fs = require('fs');
const invPath = 'g:/Download Official/Rownaa Website/js/inventory.js';
let content = fs.readFileSync(invPath, 'utf8');

// Ensure AppState is safe at top of file
if (!content.startsWith('window.AppState =')) {
  content = 'window.AppState = window.AppState || { user: null, inventory: [] };\n' + content;
}

// In getPaginated, ensure window.AppState exists before setting inventory
content = content.replace(
  'window.AppState.inventory = cars;',
  'if (!window.AppState) window.AppState = { user: null, inventory: [] };\n    window.AppState.inventory = cars;'
);

fs.writeFileSync(invPath, content, 'utf8');
console.log('Successfully patched js/inventory.js!');
