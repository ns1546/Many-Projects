const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchDir(full);
    } else if (f.endsWith('.js')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes('cartocdn') || c.includes('leaflet') || c.includes('mapInstance') || c.includes('mapModal')) {
        console.log('Match in test:', full);
      }
    }
  });
}
searchDir('g:/Download Official/Rownaa Website/tests');
