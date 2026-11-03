const fs = require('fs');
const checkoutPath = 'g:/Download Official/Rownaa Website/checkout.html';
let content = fs.readFileSync(checkoutPath, 'utf8');

// 1. Upgrade CDN in <head>
const oldCdn = `  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>`;

const newCdn = `  <!-- Pathao / Uber Grade Vector Map Engine (MapLibre GL JS) -->
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>`;

if (content.includes(oldCdn)) {
  content = content.replace(oldCdn, newCdn);
  console.log('✓ Head CDN upgraded to MapLibre GL JS');
} else {
  console.log('Old CDN tags did not match exact string, inspecting head...');
}

// 2. Upgrade CSS customization
const oldCss = `/* Leaflet Dark Customization */
.leaflet-container {
  background: #0d0d0d !important;
  font-family: inherit;
}
.leaflet-bar a {
  background-color: rgba(13, 13, 13, 0.9) !important;
  color: #fff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.leaflet-bar a:hover {
  background-color: #1a1a1a !important;
  color: var(--accent) !important;
}`;

const newCss = `/* MapLibre GL Vector Map Customization (Pathao / Uber Grade) */
.maplibregl-map {
  font-family: var(--font-body, 'Inter', sans-serif);
  width: 100% !important;
  height: 100% !important;
}
.maplibregl-canvas {
  outline: none;
}
.maplibregl-ctrl-group {
  background: rgba(13,13,13,0.92) !important;
  border: 1px solid rgba(255,255,255,0.15) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
}
.maplibregl-ctrl-group button {
  background: transparent !important;
  color: #ffffff !important;
  width: 36px !important;
  height: 36px !important;
}
.maplibregl-ctrl-group button:hover {
  background: rgba(255,255,255,0.1) !important;
}
.maplibregl-ctrl-attrib {
  background: rgba(0,0,0,0.65) !important;
  color: rgba(255,255,255,0.55) !important;
  font-size: 10px !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
}
.maplibregl-ctrl-attrib a { color: rgba(255,255,255,0.6) !important; }

/* Custom VIP Pulse Pin (Uber / Pathao Design) */
.uber-vip-pin {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #d4ff00;
  border: 3px solid #000000;
  box-shadow: 0 0 20px rgba(212, 255, 0, 0.8), 0 4px 12px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 18px;
  cursor: grab;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}
.uber-vip-pin:active {
  cursor: grabbing;
  transform: scale(1.15);
}
.uber-vip-pin::after {
  content: '';
  position: absolute;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 2px solid rgba(212, 255, 0, 0.6);
  animation: mapPinPulse 2s infinite ease-out;
  pointer-events: none;
}
@keyframes mapPinPulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}`;

if (content.includes(oldCss)) {
  content = content.replace(oldCss, newCss);
  console.log('✓ CSS upgraded to MapLibre GL styling');
} else {
  console.log('Old CSS did not match exact string, inspecting...');
}

// 3. Upgrade map search selection & GPS flyTo calls
content = content.replace(
  `    if (mapInstance) {\n      mapInstance.flyTo([lat, lng], 15, { duration: 0.8 });\n      if (mapMarker) mapMarker.setLatLng([lat, lng]);\n    }`,
  `    if (mapInstance) {\n      if (typeof mapInstance.flyTo === 'function') {\n        mapInstance.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });\n      }\n      if (mapMarker) {\n        if (typeof mapMarker.setLngLat === 'function') mapMarker.setLngLat([lng, lat]);\n        else if (typeof mapMarker.setLatLng === 'function') mapMarker.setLatLng([lat, lng]);\n      }\n    }`
);

content = content.replace(
  `        if (mapInstance) {\n          mapInstance.setView([lat, lng], 15);\n          if (mapMarker) mapMarker.setLatLng([lat, lng]);\n        }`,
  `        if (mapInstance) {\n          if (typeof mapInstance.flyTo === 'function') {\n            mapInstance.flyTo({ center: [lng, lat], zoom: 15, duration: 800 });\n          } else if (typeof mapInstance.setView === 'function') {\n            mapInstance.setView([lat, lng], 15);\n          }\n          if (mapMarker) {\n            if (typeof mapMarker.setLngLat === 'function') mapMarker.setLngLat([lng, lat]);\n            else if (typeof mapMarker.setLatLng === 'function') mapMarker.setLatLng([lat, lng]);\n          }\n        }`
);

// 4. Upgrade initOrRefreshMap & toggleMapTheme
const oldMapFuncs = `  let activeMapTheme = 'voyager';
  let currentTileLayer = null;
  const CARTO_API_KEY = 'cb1_50vc_1_90f5d3acb895d00d75d0c680';

  function initOrRefreshMap() {
    const container = document.getElementById('map-canvas');
    if (!container) return;

    if (typeof window.L === 'undefined') {
      container.innerHTML = \`
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center;color:var(--text-secondary);">
          <i class="ph ph-map-pin" style="font-size:3rem;color:var(--accent);margin-bottom:10px;"></i>
          <h4 style="color:#fff;margin-bottom:6px;">Interactive Map Active</h4>
          <p style="font-size:0.85rem;max-width:380px;">Type in the search bar above or tap the map to lock your precise location coordinates.</p>
        </div>
      \`;
      return;
    }

    if (!mapInstance) {
      mapInstance = L.map('map-canvas', {
        center: [selectedMapLocation.lat, selectedMapLocation.lng],
        zoom: 14,
        zoomControl: true
      });

      // CartoDB Authenticated Tiles (Voyager Default with User API Key)
      activeMapTheme = 'voyager';
      currentTileLayer = L.tileLayer(\`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=\${CARTO_API_KEY}\`, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(mapInstance);

      // Custom VIP Neon Marker
      const neonIcon = L.divIcon({
        className: 'custom-neon-pin',
        html: \`<div style="width:36px;height:36px;border-radius:50%;background:#d4ff00;border:3px solid #000;box-shadow:0 0 15px rgba(212,255,0,0.8);display:flex;align-items:center;justify-content:center;color:#000;font-size:16px;"><i class="ph-bold ph-map-pin"></i></div>\`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      mapMarker = L.marker([selectedMapLocation.lat, selectedMapLocation.lng], {
        draggable: true,
        icon: neonIcon
      }).addTo(mapInstance);

      mapMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        reverseGeocodeCoordinates(pos.lat, pos.lng);
      });

      mapInstance.on('click', (e) => {
        const pos = e.latlng;
        mapMarker.setLatLng(pos);
        reverseGeocodeCoordinates(pos.lat, pos.lng);
      });
    } else {
      mapInstance.invalidateSize();
      mapInstance.setView([selectedMapLocation.lat, selectedMapLocation.lng], 14);
      if (mapMarker) mapMarker.setLatLng([selectedMapLocation.lat, selectedMapLocation.lng]);
    }
  }

  function toggleMapTheme() {
    if (!mapInstance || !currentTileLayer) return;
    mapInstance.removeLayer(currentTileLayer);
    const themeIcon = document.getElementById('theme-toggle-icon');
    const themeLabel = document.getElementById('theme-toggle-label');

    if (activeMapTheme === 'voyager') {
      activeMapTheme = 'dark';
      currentTileLayer = L.tileLayer(\`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=\${CARTO_API_KEY}\`, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(mapInstance);
      if (themeIcon) themeIcon.className = 'ph-bold ph-moon';
      if (themeLabel) themeLabel.textContent = 'Dark';
    } else {
      activeMapTheme = 'voyager';
      currentTileLayer = L.tileLayer(\`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=\${CARTO_API_KEY}\`, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(mapInstance);
      if (themeIcon) themeIcon.className = 'ph-bold ph-sun';
      if (themeLabel) themeLabel.textContent = 'Voyager';
    }
  }`;

const newMapFuncs = `  let activeMapTheme = 'voyager';
  let currentTileLayer = null; // Backwards-compatible reference
  const CARTO_API_KEY = 'cb1_50vc_1_90f5d3acb895d00d75d0c680';
  const CARTO_VECTOR_STYLES = {
    voyager: \`https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json?key=\${CARTO_API_KEY}\`,
    dark: \`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=\${CARTO_API_KEY}\`,
    light: \`https://basemaps.cartocdn.com/gl/positron-gl-style/style.json?key=\${CARTO_API_KEY}\`
  };
  const CARTO_RASTER_FALLBACK = {
    voyager: \`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=\${CARTO_API_KEY}\`,
    dark: \`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=\${CARTO_API_KEY}\`
  };

  function initOrRefreshMap() {
    const container = document.getElementById('map-canvas');
    if (!container) return;

    if (typeof maplibregl === 'undefined' && typeof window.L === 'undefined') {
      container.innerHTML = \`
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center;color:var(--text-secondary);">
          <i class="ph ph-map-pin" style="font-size:3rem;color:var(--accent);margin-bottom:10px;"></i>
          <h4 style="color:#fff;margin-bottom:6px;">Interactive Vector Map Active</h4>
          <p style="font-size:0.85rem;max-width:380px;">Type in the search bar above or tap the map to lock your precise location coordinates.</p>
        </div>
      \`;
      return;
    }

    if (!mapInstance) {
      if (typeof maplibregl !== 'undefined') {
        // High-End Vector Map (Pathao & Uber Engine)
        mapInstance = new maplibregl.Map({
          container: 'map-canvas',
          style: activeMapTheme === 'dark' ? CARTO_VECTOR_STYLES.dark : CARTO_VECTOR_STYLES.voyager,
          center: [selectedMapLocation.lng, selectedMapLocation.lat],
          zoom: 14,
          attributionControl: false
        });

        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
        mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

        // Pathao/Uber VIP Glowing Pin
        const pinEl = document.createElement('div');
        pinEl.className = 'uber-vip-pin';
        pinEl.innerHTML = '<i class="ph-bold ph-map-pin"></i>';

        mapMarker = new maplibregl.Marker({ element: pinEl, draggable: true })
          .setLngLat([selectedMapLocation.lng, selectedMapLocation.lat])
          .addTo(mapInstance);

        mapMarker.on('dragend', () => {
          const lngLat = mapMarker.getLngLat();
          reverseGeocodeCoordinates(lngLat.lat, lngLat.lng);
        });

        mapInstance.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          mapMarker.setLngLat([lng, lat]);
          reverseGeocodeCoordinates(lat, lng);
        });
      } else if (typeof window.L !== 'undefined') {
        // Fallback for headless environments without WebGL
        mapInstance = L.map('map-canvas', {
          center: [selectedMapLocation.lat, selectedMapLocation.lng],
          zoom: 14,
          zoomControl: true
        });
        currentTileLayer = L.tileLayer(CARTO_RASTER_FALLBACK[activeMapTheme] || CARTO_RASTER_FALLBACK.voyager, {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 20
        }).addTo(mapInstance);
      }
    } else {
      if (typeof mapInstance.resize === 'function') {
        mapInstance.resize();
      } else if (typeof mapInstance.invalidateSize === 'function') {
        mapInstance.invalidateSize();
      }

      if (typeof mapInstance.flyTo === 'function') {
        mapInstance.flyTo({
          center: [selectedMapLocation.lng, selectedMapLocation.lat],
          zoom: 14,
          duration: 400
        });
      } else if (typeof mapInstance.setView === 'function') {
        mapInstance.setView([selectedMapLocation.lat, selectedMapLocation.lng], 14);
      }

      if (mapMarker) {
        if (typeof mapMarker.setLngLat === 'function') {
          mapMarker.setLngLat([selectedMapLocation.lng, selectedMapLocation.lat]);
        } else if (typeof mapMarker.setLatLng === 'function') {
          mapMarker.setLatLng([selectedMapLocation.lat, selectedMapLocation.lng]);
        }
      }
    }
  }

  function toggleMapTheme() {
    if (!mapInstance) return;
    const themeIcon = document.getElementById('theme-toggle-icon');
    const themeLabel = document.getElementById('theme-toggle-label');

    if (activeMapTheme === 'voyager') {
      activeMapTheme = 'dark';
      if (typeof mapInstance.setStyle === 'function') {
        mapInstance.setStyle(CARTO_VECTOR_STYLES.dark);
        mapInstance.once('styledata', () => {
          if (mapMarker) mapMarker.addTo(mapInstance);
        });
      }
      if (themeIcon) themeIcon.className = 'ph-bold ph-moon';
      if (themeLabel) themeLabel.textContent = 'Dark';
    } else {
      activeMapTheme = 'voyager';
      if (typeof mapInstance.setStyle === 'function') {
        mapInstance.setStyle(CARTO_VECTOR_STYLES.voyager);
        mapInstance.once('styledata', () => {
          if (mapMarker) mapMarker.addTo(mapInstance);
        });
      }
      if (themeIcon) themeIcon.className = 'ph-bold ph-sun';
      if (themeLabel) themeLabel.textContent = 'Voyager';
    }
  }`;

if (content.includes(oldMapFuncs)) {
  content = content.replace(oldMapFuncs, newMapFuncs);
  console.log('✓ initOrRefreshMap & toggleMapTheme successfully upgraded to MapLibre GL JS!');
} else {
  console.log('oldMapFuncs did not match exact string. Investigating...');
}

fs.writeFileSync(checkoutPath, content, 'utf8');
console.log('checkout.html updated successfully.');
