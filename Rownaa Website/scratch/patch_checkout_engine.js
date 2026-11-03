const fs = require('fs');
const checkoutPath = 'g:/Download Official/Rownaa Website/checkout.html';
let content = fs.readFileSync(checkoutPath, 'utf8');

// 1. Update reverseGeocodeCoordinates to also update pin bubble text
const oldGeoUpdate = `      selectedMapLocation.name = closest.name;
      document.getElementById('map-display-address').textContent = closest.name;
      document.getElementById('map-display-coords').textContent = \`\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E (Near \${closest.name})\`;
      return;`;

const newGeoUpdate = `      selectedMapLocation.name = closest.name;
      document.getElementById('map-display-address').textContent = closest.name;
      document.getElementById('map-display-coords').textContent = \`\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E (Near \${closest.name})\`;
      const bubble = document.getElementById('pin-bubble-text');
      if (bubble) bubble.textContent = closest.name;
      return;`;

content = content.replace(oldGeoUpdate, newGeoUpdate);

// Also in Nominatim result:
const oldNomUpdate = `          selectedMapLocation.name = shortName;
          document.getElementById('map-display-address').textContent = shortName;
          document.getElementById('map-display-coords').textContent = \`\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E (GPS Pinned)\`;
          return;`;

const newNomUpdate = `          selectedMapLocation.name = shortName;
          document.getElementById('map-display-address').textContent = shortName;
          document.getElementById('map-display-coords').textContent = \`\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E (GPS Pinned)\`;
          const bubble = document.getElementById('pin-bubble-text');
          if (bubble) bubble.textContent = shortName;
          return;`;

content = content.replace(oldNomUpdate, newNomUpdate);

// Also in fallback:
const oldFallUpdate = `    selectedMapLocation.name = \`Location (\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E), Dhaka\`;
    document.getElementById('map-display-address').textContent = selectedMapLocation.name;
    document.getElementById('map-display-coords').textContent = \`\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E (Precision Coordinates)\`;`;

const newFallUpdate = `    selectedMapLocation.name = \`Location (\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E), Dhaka\`;
    document.getElementById('map-display-address').textContent = selectedMapLocation.name;
    document.getElementById('map-display-coords').textContent = \`\${lat.toFixed(4)}° N, \${lng.toFixed(4)}° E (Precision Coordinates)\`;
    const bubble = document.getElementById('pin-bubble-text');
    if (bubble) bubble.textContent = selectedMapLocation.name;`;

content = content.replace(oldFallUpdate, newFallUpdate);

// 2. Replace initOrRefreshMap & toggleMapTheme with the complete Pathao/Uber Engine
const oldMapSystem = `  let activeMapTheme = 'voyager';
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

const newMapSystem = `  // =========================================================
  // PATHAO & UBER GRADE MAPLIBRE GL VECTOR MAPPING ENGINE
  // =========================================================
  let activeMapTheme = 'voyager';
  let isMap3D = false;
  let currentTileLayer = null; // Backwards-compatible reference for tests
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
          <p style="font-size:0.85rem;max-width:380px;">Type in the search bar above or pan the map to set your exact location.</p>
        </div>
      \`;
      return;
    }

    if (!mapInstance) {
      if (typeof maplibregl !== 'undefined') {
        // High-Performance Vector Map (Pathao & Uber Engine)
        mapInstance = new maplibregl.Map({
          container: 'map-canvas',
          style: CARTO_VECTOR_STYLES[activeMapTheme] || CARTO_VECTOR_STYLES.voyager,
          center: [selectedMapLocation.lng, selectedMapLocation.lat],
          zoom: 15,
          pitch: isMap3D ? 45 : 0,
          bearing: isMap3D ? -12 : 0,
          attributionControl: false
        });

        // Top-left Navigation Controls (Zoom In/Out + Reset Bearing)
        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-left');
        mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

        // Initial pin bubble text sync
        const bubble = document.getElementById('pin-bubble-text');
        if (bubble) bubble.textContent = selectedMapLocation.name;

        // Signature Uber / Pathao Center Pin Interaction
        mapInstance.on('movestart', () => {
          const pinEl = document.getElementById('uber-center-pin');
          if (pinEl) pinEl.classList.add('moving');
          const bubbleText = document.getElementById('pin-bubble-text');
          if (bubbleText) bubbleText.textContent = 'Locating pickup point...';
        });

        mapInstance.on('moveend', () => {
          const pinEl = document.getElementById('uber-center-pin');
          if (pinEl) pinEl.classList.remove('moving');
          
          const center = mapInstance.getCenter();
          selectedMapLocation.lat = center.lat;
          selectedMapLocation.lng = center.lng;
          reverseGeocodeCoordinates(center.lat, center.lng);
        });

        // Click to center map and pin
        mapInstance.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          mapInstance.flyTo({ center: [lng, lat], duration: 500, essential: true });
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
          zoom: 15,
          pitch: isMap3D ? 45 : 0,
          duration: 400
        });
      } else if (typeof mapInstance.setView === 'function') {
        mapInstance.setView([selectedMapLocation.lat, selectedMapLocation.lng], 14);
      }

      const bubble = document.getElementById('pin-bubble-text');
      if (bubble) bubble.textContent = selectedMapLocation.name;
    }
  }

  // Toggle 3D Perspective (Uber & Google Maps Tilt Angle)
  function toggleMapPitch() {
    if (!mapInstance || typeof mapInstance.easeTo !== 'function') return;
    isMap3D = !isMap3D;
    mapInstance.easeTo({
      pitch: isMap3D ? 45 : 0,
      bearing: isMap3D ? -15 : 0,
      duration: 800
    });
    const label = document.getElementById('pitch-toggle-label');
    if (label) label.textContent = isMap3D ? '2D' : '3D';
  }

  // Toggle Theme: Voyager (Pathao Day) -> Dark Matter (Uber Black) -> Positron (Google Clean)
  const THEME_CYCLE = ['voyager', 'dark', 'light'];
  function toggleMapTheme() {
    if (!mapInstance) return;
    const currentIdx = THEME_CYCLE.indexOf(activeMapTheme);
    activeMapTheme = THEME_CYCLE[(currentIdx + 1) % THEME_CYCLE.length];

    if (typeof mapInstance.setStyle === 'function') {
      mapInstance.setStyle(CARTO_VECTOR_STYLES[activeMapTheme]);
    }

    const themeIcon = document.getElementById('theme-toggle-icon');
    const themeLabel = document.getElementById('theme-toggle-label');
    
    if (themeLabel) {
      if (activeMapTheme === 'voyager') themeLabel.textContent = 'Voyager';
      else if (activeMapTheme === 'dark') themeLabel.textContent = 'Dark';
      else themeLabel.textContent = 'Positron';
    }

    if (themeIcon) {
      if (activeMapTheme === 'dark') themeIcon.className = 'ph-bold ph-moon';
      else if (activeMapTheme === 'voyager') themeIcon.className = 'ph-bold ph-sun';
      else themeIcon.className = 'ph-bold ph-map-trifold';
    }
  }`;

if (content.includes(oldMapSystem)) {
  content = content.replace(oldMapSystem, newMapSystem);
  console.log('✓ Successfully installed complete Pathao/Uber Vector Mapping Engine!');
} else {
  console.log('oldMapSystem did not match exact string, manual inspect required.');
}

// 3. Expose toggleMapPitch globally
if (!content.includes('window.toggleMapPitch = toggleMapPitch;')) {
  content = content.replace('window.toggleMapTheme = toggleMapTheme;', 'window.toggleMapTheme = toggleMapTheme;\n  window.toggleMapPitch = toggleMapPitch;');
}

fs.writeFileSync(checkoutPath, content, 'utf8');
console.log('checkout.html fully saved.');
