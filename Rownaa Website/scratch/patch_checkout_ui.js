const fs = require('fs');
const checkoutPath = 'g:/Download Official/Rownaa Website/checkout.html';
let content = fs.readFileSync(checkoutPath, 'utf8');

// 1. Replace Leaflet CSS with Uber/Pathao Center Pin and MapLibre Vector CSS
const oldCssBlock = `    /* Leaflet Dark Customization */
    .leaflet-container {
      background: #18181b !important;
      font-family: var(--font-ui) !important;
    }
    .leaflet-bar a {
      background-color: #141414 !important;
      color: #f5f5f7 !important;
      border-color: #27272a !important;
    }
    .leaflet-bar a:hover {
      background-color: #27272a !important;
      color: var(--accent) !important;
    }`;

const newCssBlock = `    /* MapLibre GL Vector Map (Pathao & Uber Technology) */
    .maplibregl-map {
      font-family: var(--font-body, 'Inter', sans-serif);
      width: 100% !important;
      height: 100% !important;
      cursor: grab;
    }
    .maplibregl-map:active {
      cursor: grabbing;
    }
    .maplibregl-canvas {
      outline: none;
    }
    .maplibregl-ctrl-group {
      background: rgba(18, 18, 20, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6) !important;
      overflow: hidden;
    }
    .maplibregl-ctrl-group button {
      background: transparent !important;
      color: #ffffff !important;
      width: 34px !important;
      height: 34px !important;
      border: none !important;
    }
    .maplibregl-ctrl-group button:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }
    .maplibregl-ctrl-attrib {
      background: rgba(0, 0, 0, 0.75) !important;
      color: rgba(255, 255, 255, 0.6) !important;
      font-size: 10px !important;
      border-radius: 4px !important;
      padding: 3px 8px !important;
    }
    .maplibregl-ctrl-attrib a { color: var(--accent, #d4ff00) !important; }

    /* Uber & Pathao Signature Center Pin Overlay */
    .uber-center-pin-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -100%);
      pointer-events: none;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .uber-center-pin-container.moving {
      transform: translate(-50%, -125%);
    }
    .pin-bubble {
      background: rgba(14, 14, 16, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 6px 14px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
      margin-bottom: 8px;
      white-space: nowrap;
      backdrop-filter: blur(10px);
      animation: fadeIn 0.2s ease;
    }
    .pin-bubble .bubble-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent, #d4ff00);
      box-shadow: 0 0 10px var(--accent, #d4ff00);
    }
    .pin-bubble .bubble-text {
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffffff;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .uber-pin-marker {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .pin-head {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #000000;
      border: 3px solid var(--accent, #d4ff00);
      color: var(--accent, #d4ff00);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 25px rgba(212, 255, 0, 0.8), 0 6px 20px rgba(0, 0, 0, 0.9);
      transition: transform 0.2s;
    }
    .pin-needle {
      width: 3px;
      height: 12px;
      background: var(--accent, #d4ff00);
      box-shadow: 0 0 10px rgba(212, 255, 0, 0.8);
    }
    .pin-shadow {
      width: 18px;
      height: 6px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      filter: blur(2px);
      margin-top: -3px;
      transition: all 0.22s ease;
    }
    .uber-center-pin-container.moving .pin-shadow {
      transform: scale(0.5);
      opacity: 0.25;
    }
    .btn-floating-pitch {
      background: #141416;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      transition: all 0.2s;
    }
    .btn-floating-pitch:hover {
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }`;

if (content.includes(oldCssBlock)) {
  content = content.replace(oldCssBlock, newCssBlock);
  console.log('✓ CSS upgraded to MapLibre GL and Uber pin styles');
} else {
  console.log('oldCssBlock not matched exactly.');
}

// 2. Upgrade the Map Modal Container to include the Uber Center Pin Overlay and 3D Toggle
const oldCanvasHtml = `    <!-- Leaflet Interactive Canvas with Floating GPS Locate Button & Theme Switcher -->
    <div class="map-canvas-container">
      <div id="map-canvas"></div>
      <div class="map-floating-controls">
        <button type="button" class="btn-floating-theme" id="btn-floating-theme" onclick="toggleMapTheme()" title="Switch Map Theme (Voyager / Dark)">
          <i class="ph-bold ph-sun" id="theme-toggle-icon"></i> <span id="theme-toggle-label">Voyager</span>
        </button>
        <button type="button" class="btn-floating-locate" id="btn-floating-locate" onclick="locateUserCurrentPosition()" title="Use Current GPS Location">
          <i class="ph-bold ph-crosshair"></i>
        </button>
      </div>
    </div>`;

const newCanvasHtml = `    <!-- Uber & Pathao Vector Canvas with Centered Interactive Pin -->
    <div class="map-canvas-container" id="map-canvas-container">
      <div id="map-canvas"></div>

      <!-- Signature Uber / Pathao Interactive Center Pin Overlay -->
      <div class="uber-center-pin-container" id="uber-center-pin">
        <div class="pin-bubble" id="pin-address-bubble">
          <span class="bubble-dot"></span>
          <span class="bubble-text" id="pin-bubble-text">Gulshan 2 Circle, Dhaka</span>
        </div>
        <div class="uber-pin-marker">
          <div class="pin-head">
            <i class="ph-bold ph-map-pin" id="pin-icon"></i>
          </div>
          <div class="pin-needle"></div>
        </div>
        <div class="pin-shadow"></div>
      </div>

      <div class="map-floating-controls">
        <button type="button" class="btn-floating-pitch" id="btn-floating-pitch" onclick="toggleMapPitch()" title="Toggle 3D / 2D Perspective">
          <i class="ph-bold ph-cube"></i> <span id="pitch-toggle-label">3D</span>
        </button>
        <button type="button" class="btn-floating-theme" id="btn-floating-theme" onclick="toggleMapTheme()" title="Switch Map Theme (Voyager / Dark / Positron)">
          <i class="ph-bold ph-sun" id="theme-toggle-icon"></i> <span id="theme-toggle-label">Voyager</span>
        </button>
        <button type="button" class="btn-floating-locate" id="btn-floating-locate" onclick="locateUserCurrentPosition()" title="Use Current GPS Location">
          <i class="ph-bold ph-crosshair"></i>
        </button>
      </div>
    </div>`;

if (content.includes(oldCanvasHtml)) {
  content = content.replace(oldCanvasHtml, newCanvasHtml);
  console.log('✓ Map Canvas HTML upgraded with Uber Center Pin and 3D toggle');
} else {
  console.log('oldCanvasHtml not matched exactly.');
}

fs.writeFileSync(checkoutPath, content, 'utf8');
console.log('checkout.html structure updated.');
