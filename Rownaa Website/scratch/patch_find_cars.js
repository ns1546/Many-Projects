const fs = require('fs');
const fcPath = 'g:/Download Official/Rownaa Website/find-cars.html';
let content = fs.readFileSync(fcPath, 'utf8');

// 1. Remove duplicate inventory.js from head
content = content.replace('  <script src="js/inventory.js"></script>\n', '');

// 2. Make renderCarsFiltered 100% resilient
const oldRender = `  async function renderCarsFiltered(options) {
    if(!window.InventoryManager) return;
    const res = await window.InventoryManager.getPaginated(options);
    const cars = (res && res.data) ? res.data : [];
    
    const grid = document.getElementById('cars-container');
    if(!grid) return;`;

const newRender = `  async function renderCarsFiltered(options) {
    const grid = document.getElementById('cars-container');
    if(!grid) return;

    if (!window.InventoryManager) {
      setTimeout(() => renderCarsFiltered(options), 80);
      return;
    }

    let cars = [];
    try {
      const res = await window.InventoryManager.getPaginated(options);
      cars = (res && res.data) ? res.data : [];
    } catch (err) {
      console.warn('[FindCars] Inventory fetch fallback:', err);
      if (window.DEFAULT_FLEET) {
        cars = window.DEFAULT_FLEET;
      }
    }`;

if (content.includes(oldRender)) {
  content = content.replace(oldRender, newRender);
  fs.writeFileSync(fcPath, content, 'utf8');
  console.log('Successfully upgraded renderCarsFiltered in find-cars.html!');
} else {
  console.log('Could not match oldRender exactly. Checking...');
}
