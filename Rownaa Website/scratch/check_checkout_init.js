const fs = require('fs');
const html = fs.readFileSync('g:/Download Official/Rownaa Website/checkout.html', 'utf8');

// Check Leaflet CDN vs MapLibre CDN
console.log('Has Leaflet CDN:', html.includes('leaflet@1.9.4'));
console.log('Has MapLibre CDN:', html.includes('maplibre-gl@4.7.1'));

// Check initOrRefreshMap
const idx = html.indexOf('function initOrRefreshMap');
console.log(html.substring(idx, idx + 1200));
