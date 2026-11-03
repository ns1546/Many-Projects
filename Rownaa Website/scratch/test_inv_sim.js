const fs = require('fs');
const inventoryCode = fs.readFileSync('g:/Download Official/Rownaa Website/js/inventory.js', 'utf8');

// Simulate browser environment
const window = {
  location: { protocol: 'file:' },
  AppState: { user: null, inventory: [] }
};
global.window = window;

eval(inventoryCode);

console.log('InventoryManager available:', !!window.InventoryManager);
window.InventoryManager.getPaginated({}).then(res => {
  console.log('Default getPaginated count:', res.data.length);
  return window.InventoryManager.getPaginated({ category: 'Microbus' });
}).then(res => {
  console.log('Microbus filtered count:', res.data.length);
  res.data.forEach(c => console.log(' -', c.name, `(${c.category})`));
}).catch(err => {
  console.error('Test error:', err);
});
