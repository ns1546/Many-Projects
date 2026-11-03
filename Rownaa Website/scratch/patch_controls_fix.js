const fs = require('fs');
const checkoutPath = 'g:/Download Official/Rownaa Website/checkout.html';
let content = fs.readFileSync(checkoutPath, 'utf8');

// 1. Separate #btn-floating-locate from .map-floating-controls
const oldHtml = `      <div class="map-floating-controls">
        <button type="button" class="btn-floating-pitch" id="btn-floating-pitch" onclick="toggleMapPitch()" title="Toggle 3D / 2D Perspective">
          <i class="ph-bold ph-cube"></i> <span id="pitch-toggle-label">3D</span>
        </button>
        <button type="button" class="btn-floating-theme" id="btn-floating-theme" onclick="toggleMapTheme()" title="Switch Map Theme (Voyager / Dark / Positron)">
          <i class="ph-bold ph-sun" id="theme-toggle-icon"></i> <span id="theme-toggle-label">Voyager</span>
        </button>
        <button type="button" class="btn-floating-locate" id="btn-floating-locate" onclick="locateUserCurrentPosition()" title="Use Current GPS Location">
          <i class="ph-bold ph-crosshair"></i>
        </button>
      </div>`;

const newHtml = `      <div class="map-floating-controls">
        <button type="button" class="btn-floating-pitch" id="btn-floating-pitch" onclick="toggleMapPitch()" title="Toggle 3D / 2D Perspective">
          <i class="ph-bold ph-cube"></i> <span id="pitch-toggle-label">3D</span>
        </button>
        <button type="button" class="btn-floating-theme" id="btn-floating-theme" onclick="toggleMapTheme()" title="Switch Map Theme (Voyager / Dark / Positron)">
          <i class="ph-bold ph-sun" id="theme-toggle-icon"></i> <span id="theme-toggle-label">Voyager</span>
        </button>
      </div>

      <!-- Floating Uber GPS Locate Button (Clean Bottom-Right, No Overlap) -->
      <button type="button" class="btn-floating-locate" id="btn-floating-locate" onclick="locateUserCurrentPosition()" title="Center to Present GPS Location">
        <i class="ph-bold ph-crosshair"></i>
      </button>`;

if (content.includes(oldHtml)) {
  content = content.replace(oldHtml, newHtml);
  console.log('✓ Separated btn-floating-locate from map-floating-controls to fix overlap');
} else {
  console.log('oldHtml not matched exactly');
}

// 2. Add quick location bar under search input
const oldSearchBox = `      <div class="uber-search-box">
        <i class="ph ph-magnifying-glass uber-search-icon"></i>
        <input type="text" id="map-search-input" class="uber-search-input" placeholder="Search street, landmark, area (e.g. Airport, Gulshan, Banani, Dhanmondi)..." autocomplete="off" oninput="onMapSearchInput(this.value)" />
        <button type="button" class="uber-search-clear" id="btn-clear-search" onclick="clearMapSearch()" style="display:none;">
          <i class="ph ph-x"></i>
        </button>
      </div>
      <div class="uber-suggestions-dropdown" id="uber-suggestions" style="display:none;"></div>`;

const newSearchBox = `      <div class="uber-search-box">
        <i class="ph ph-magnifying-glass uber-search-icon"></i>
        <input type="text" id="map-search-input" class="uber-search-input" placeholder="Search street, landmark, area (e.g. Airport, Gulshan, Banani, Dhanmondi)..." autocomplete="off" oninput="onMapSearchInput(this.value)" onfocus="onMapSearchFocus()" />
        <button type="button" class="uber-search-clear" id="btn-clear-search" onclick="clearMapSearch()" style="display:none;">
          <i class="ph ph-x"></i>
        </button>
      </div>
      
      <!-- Quick Uber / Pathao Present Location Pill -->
      <div class="uber-quick-location-bar">
        <button type="button" class="btn-quick-gps" onclick="locateUserCurrentPosition()">
          <i class="ph-bold ph-crosshair"></i> Use Present Location (GPS)
        </button>
      </div>

      <div class="uber-suggestions-dropdown" id="uber-suggestions" style="display:none;"></div>`;

if (content.includes(oldSearchBox)) {
  content = content.replace(oldSearchBox, newSearchBox);
  console.log('✓ Added quick GPS pill under search box');
} else {
  console.log('oldSearchBox not matched');
}

// 3. Add CSS for btn-quick-gps and clean button styling
const cssToAdd = `    /* Quick GPS Pill under search */
    .uber-quick-location-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px 2px;
    }
    .btn-quick-gps {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(212, 255, 0, 0.08);
      border: 1px solid rgba(212, 255, 0, 0.35);
      color: var(--accent, #d4ff00);
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.8rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-quick-gps:hover {
      background: var(--accent, #d4ff00);
      color: #000000;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(212, 255, 0, 0.4);
    }
    .usi-icon.gps-icon {
      background: rgba(212, 255, 0, 0.15) !important;
      color: var(--accent, #d4ff00) !important;
    }`;

content = content.replace('/* Map Floating Controls & Theme Switcher */', cssToAdd + '\n    /* Map Floating Controls & Theme Switcher */');

// 4. Update renderSearchSuggestions to always prepend "Use Present Location" item
const oldRenderSug = `    dropdown.innerHTML = items.map((item, idx) => \`
      <div class="uber-suggestion-item" onclick="selectSearchResult(\${idx}, \${item.lat}, \${item.lng}, '\${item.name.replace(/'/g, "\\\\'")}')">
        <div class="usi-icon"><i class="ph-fill ph-map-pin"></i></div>
        <div class="usi-text">
          <div class="usi-primary">\${item.name}</div>
          <div class="usi-secondary">\${item.area || 'Bangladesh'}</div>
        </div>
      </div>
    \`).join('');`;

const newRenderSug = `    const gpsItemHtml = \`
      <div class="uber-suggestion-item" onclick="locateUserCurrentPosition()" style="background:rgba(212,255,0,0.06);border-bottom:1px solid rgba(255,255,255,0.08);">
        <div class="usi-icon gps-icon"><i class="ph-bold ph-crosshair"></i></div>
        <div class="usi-text">
          <div class="usi-primary" style="color:var(--accent);">Use Your Present Location (GPS)</div>
          <div class="usi-secondary">Tap to center pin to real device coordinates</div>
        </div>
      </div>
    \`;
    dropdown.innerHTML = gpsItemHtml + items.map((item, idx) => \`
      <div class="uber-suggestion-item" onclick="selectSearchResult(\${idx}, \${item.lat}, \${item.lng}, '\${item.name.replace(/'/g, "\\\\'")}')">
        <div class="usi-icon"><i class="ph-fill ph-map-pin"></i></div>
        <div class="usi-text">
          <div class="usi-primary">\${item.name}</div>
          <div class="usi-secondary">\${item.area || 'Bangladesh'}</div>
        </div>
      </div>
    \`).join('');`;

if (content.includes(oldRenderSug)) {
  content = content.replace(oldRenderSug, newRenderSug);
  console.log('✓ Prepend GPS item in renderSearchSuggestions');
} else {
  console.log('oldRenderSug not matched');
}

// 5. Add onMapSearchFocus helper
if (!content.includes('function onMapSearchFocus()')) {
  const focusFunc = `
  function onMapSearchFocus() {
    const input = document.getElementById('map-search-input');
    if (input && !input.value.trim()) {
      renderSearchSuggestions(LOCATION_DATABASE.slice(0, 4));
    }
  }
  window.onMapSearchFocus = onMapSearchFocus;
`;
  content = content.replace('function onMapSearchInput(query) {', focusFunc + 'function onMapSearchInput(query) {');
}

fs.writeFileSync(checkoutPath, content, 'utf8');
console.log('checkout.html updated with clean non-overlapping controls & GPS options.');
