const fs = require('fs');
const inv = fs.readFileSync('g:/Download Official/Rownaa Website/js/inventory.js', 'utf8');
const fleetMatch = inv.match(/const DEFAULT_FLEET = (\[[\s\S]*?\]);/);
if (fleetMatch) {
  const fleet = eval(fleetMatch[1]);
  console.log('Total cars in DEFAULT_FLEET:', fleet.length);
  fleet.forEach((c, i) => {
    console.log(i + 1, c.name, '| category:', c.category, '| seats:', c.seats, '| image:', !!c.image);
  });
}
