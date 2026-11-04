const fs = require('fs');

// 1. Update driver-register.html
let drHtml = fs.readFileSync('driver-register.html', 'utf8');

const targetPoint = '<!-- Live Review Summary Card -->';
const carDocsMarkup = `<!-- Upload Zone 6 & 7: Car / Vehicle License (Registration & Blue Book) -->
            <div class="upload-section-divider" id="car-docs-heading" style="display:none; margin-top:22px; margin-bottom:12px; padding-top:14px; border-top:1px dashed var(--border-subtle);">
              <div style="font-family:var(--font-display); font-size:0.95rem; font-weight:700; color:var(--accent); display:flex; align-items:center; gap:8px;">
                <i class="ph-fill ph-car"></i> <span id="title-car-docs">Car License & Vehicle Documents (গাড়ির লাইসেন্স ও ব্লু-বুক)</span>
              </div>
              <p style="font-size:0.75rem; color:var(--text-secondary); margin:4px 0 0 0;" id="desc-car-docs">
                Required for Owner-Drivers & Rental Fleets: Upload clear photos of your BRTA Registration Card / Blue Book and Fitness Token.
              </p>
            </div>

            <div class="upload-subgrid" id="zone-car-license-docs" style="display:none;">
              <div class="upload-card" id="card-car-lic-front">
                <input type="file" id="file-car-lic-front" accept="image/*,.pdf" onchange="handleFileSelected(this, 'car-lic-front-name', 'card-car-lic-front')"/>
                <div class="upload-icon"><i class="ph-fill ph-car-profile"></i></div>
                <div class="upload-title" id="up-title-car-lic-front">Car License / Blue Book (Front)</div>
                <div class="upload-subtitle" id="up-sub-car-lic-front">Clear front of vehicle registration</div>
                <div class="upload-filename" id="car-lic-front-name"></div>
              </div>

              <div class="upload-card" id="card-car-lic-back">
                <input type="file" id="file-car-lic-back" accept="image/*,.pdf" onchange="handleFileSelected(this, 'car-lic-back-name', 'card-car-lic-back')"/>
                <div class="upload-icon"><i class="ph-fill ph-car-profile"></i></div>
                <div class="upload-title" id="up-title-car-lic-back">Car License / Blue Book (Back)</div>
                <div class="upload-subtitle" id="up-sub-car-lic-back">Clear back of vehicle registration</div>
                <div class="upload-filename" id="car-lic-back-name"></div>
              </div>
            </div>

            <!-- Upload Zone 8: Tax Token / Fitness Certificate -->
            <div class="upload-card-full" id="zone-car-fitness-doc" style="display:none; margin-top:12px;">
              <div class="upload-card" id="card-car-fitness">
                <input type="file" id="file-car-fitness" accept="image/*,.pdf" onchange="handleFileSelected(this, 'car-fitness-name', 'card-car-fitness')"/>
                <div class="upload-icon"><i class="ph-fill ph-certificate"></i></div>
                <div class="upload-title" id="up-title-car-fitness">Car Tax Token & Fitness Certificate (Optional)</div>
                <div class="upload-subtitle" id="up-sub-car-fitness">Clear photo of valid BRTA Tax Token or Fitness paper</div>
                <div class="upload-filename" id="car-fitness-name"></div>
              </div>
            </div>

            <!-- Live Review Summary Card -->`;

if (!drHtml.includes('id="card-car-lic-front"')) {
  drHtml = drHtml.replace(targetPoint, carDocsMarkup);
  fs.writeFileSync('driver-register.html', drHtml, 'utf8');
  console.log('Successfully injected Car License upload cards into driver-register.html');
}

// 2. Update index.html
let idxHtml = fs.readFileSync('index.html', 'utf8');
if (idxHtml.includes('Six tailored services for every kind of journey')) {
  idxHtml = idxHtml.replace('Six tailored services for every kind of journey', 'Seven tailored services for every kind of journey');
  fs.writeFileSync('index.html', idxHtml, 'utf8');
  console.log('Successfully updated index.html to Seven tailored services');
}

// 3. Sync to Netlify folders
fs.copyFileSync('driver-register.html', 'netlify-driver-portal/index.html');
fs.copyFileSync('driver-register.html', 'Rownaa-Frontend-Netlify/driver-register.html');
fs.copyFileSync('index.html', 'Rownaa-Frontend-Netlify/index.html');
console.log('Synchronized to Netlify bundles');

