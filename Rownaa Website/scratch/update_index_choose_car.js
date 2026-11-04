const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update Services count and add 7th service item
const targetServices = `    <div class="se-head">
      <h2 class="se-title">Six services.<br />One platform.</h2>
      <p class="se-sub">Every type of journey across Bangladesh — handled with precision.</p>
    </div>`;

const repServices = `    <div class="se-head">
      <h2 class="se-title">Seven services.<br />One platform.</h2>
      <p class="se-sub">Every type of journey across Bangladesh — handled with precision.</p>
    </div>`;

if (!html.includes(targetServices)) {
  console.error('targetServices not found in index.html!');
  process.exit(1);
}
html = html.replace(targetServices, repServices);

const targetSvcListEnd = `      <div class="se-item" onclick="selectSvc('corporate')">
        <div class="se-num">06</div>
        <div class="se-body">
          <div class="se-name">Corporate Transport</div>
          <div class="se-desc">Daily, weekly, or monthly contracts. Professional. Reliable. Scalable.</div>
        </div>
        <div class="se-arrow">↗</div>
      </div>
    </div>`;

const repSvcListEnd = `      <div class="se-item" onclick="selectSvc('corporate')">
        <div class="se-num">06</div>
        <div class="se-body">
          <div class="se-name">Corporate Transport</div>
          <div class="se-desc">Daily, weekly, or monthly contracts. Professional. Reliable. Scalable.</div>
        </div>
        <div class="se-arrow">↗</div>
      </div>
      <div class="se-item" onclick="document.getElementById('choose-your-car').scrollIntoView({behavior:'smooth'})" style="border-left:3px solid var(--accent); background:rgba(212,255,0,0.02);">
        <div class="se-num" style="color:var(--accent);">07</div>
        <div class="se-body">
          <div class="se-name" style="color:var(--accent); font-weight:700;">Choose Your Car</div>
          <div class="se-desc">Handpick your exact vehicle model with real specs, passenger capacity, verified photos, and transparent pricing.</div>
        </div>
        <div class="se-arrow" style="color:var(--accent);">↗</div>
      </div>
    </div>`;

if (!html.includes(targetSvcListEnd)) {
  console.error('targetSvcListEnd not found in index.html!');
  process.exit(1);
}
html = html.replace(targetSvcListEnd, repSvcListEnd);

// 2. Insert the interactive "Choose Your Car" Showcase section right after services
const targetAfterServices = `  </section>

  <!-- HOW IT WORKS — Cinematic numbered steps -->`;

const repAfterServices = `  </section>

  <!-- CHOOSE YOUR CAR — Interactive Vehicle Selection & Fleet Showcase -->
  <section class="choose-car-section" id="choose-your-car">
    <div class="cyc-container">
      <div class="cyc-header-wrap">
        <div>
          <div class="cyc-tag">
            <i class="ph-bold ph-car-profile"></i> Handpick Your Exact Vehicle
          </div>
          <h2 class="cyc-main-title">
            Choose Your Car.<br/><span class="cyc-main-sub">Transparent specs. Dedicated chauffeur.</span>
          </h2>
          <p class="cyc-lead-p">
            Select the exact car model tailored to your journey, passengers, and luggage requirements across Bangladesh.
          </p>
        </div>
        <!-- Filter Tabs -->
        <div class="cyc-filter-tabs">
          <button type="button" class="cyc-tab-btn active" onclick="filterCycFleet('all', this)">All Fleet (5)</button>
          <button type="button" class="cyc-tab-btn" onclick="filterCycFleet('sedan', this)">Executive Sedan</button>
          <button type="button" class="cyc-tab-btn" onclick="filterCycFleet('mpv', this)">7-Seater MPV</button>
          <button type="button" class="cyc-tab-btn" onclick="filterCycFleet('microbus', this)">14-Seater HiAce</button>
          <button type="button" class="cyc-tab-btn" onclick="filterCycFleet('suv', this)">VIP Luxury SUV</button>
        </div>
      </div>

      <!-- Fleet Grid -->
      <div class="cyc-fleet-grid" id="cyc-fleet-grid">
        <!-- 1: Toyota Premio -->
        <div class="cyc-card" data-cat="sedan">
          <div class="cyc-card-img-wrap">
            <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" alt="Toyota Premio" class="cyc-card-img" loading="lazy"/>
            <span class="cyc-badge-pill">Executive VIP Sedan</span>
          </div>
          <div class="cyc-card-content">
            <div class="cyc-card-head">
              <h3 class="cyc-car-name">Toyota Premio / Allion</h3>
              <div class="cyc-car-price">৳2,800 <span class="cyc-price-sub">/ trip</span></div>
            </div>
            <p class="cyc-car-desc">Premium executive comfort for corporate executives, weddings, and airport VIP meet & greet.</p>
            <div class="cyc-specs-row">
              <span class="cyc-spec-item"><i class="ph-bold ph-users"></i> 4 Seats</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-suitcase"></i> 3 Bags</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-snowflake"></i> Chilled AC</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-gas-can"></i> Octane</span>
            </div>
            <div class="cyc-perk-line">
              <i class="ph-fill ph-check-circle" style="color:var(--accent);"></i> Suited Executive Chauffeur Included
            </div>
            <div class="cyc-card-actions">
              <a href="find-cars.html?car=Toyota+Premio&service=hourly" class="cyc-btn-book">
                <span>Select This Car</span> <i class="ph-bold ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 2: Toyota Noah Hybrid -->
        <div class="cyc-card" data-cat="mpv">
          <div class="cyc-card-img-wrap">
            <img src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80" alt="Toyota Noah" class="cyc-card-img" loading="lazy"/>
            <span class="cyc-badge-pill" style="background:rgba(0,255,163,0.15); color:#00ffa3; border-color:rgba(0,255,163,0.3);">7-Seater Family MPV</span>
          </div>
          <div class="cyc-card-content">
            <div class="cyc-card-head">
              <h3 class="cyc-car-name">Toyota Noah / Voxy</h3>
              <div class="cyc-car-price">৳3,800 <span class="cyc-price-sub">/ trip</span></div>
            </div>
            <p class="cyc-car-desc">Spacious 7-seater multi-purpose vehicle designed for highway tours, airport luggage, and family trips.</p>
            <div class="cyc-specs-row">
              <span class="cyc-spec-item"><i class="ph-bold ph-users"></i> 7 Seats</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-suitcase"></i> 4 Bags</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-snowflake"></i> Dual AC</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-leaf"></i> Hybrid</span>
            </div>
            <div class="cyc-perk-line">
              <i class="ph-fill ph-check-circle" style="color:var(--accent);"></i> Highway Tour Expert Driver Included
            </div>
            <div class="cyc-card-actions">
              <a href="find-cars.html?car=Toyota+Noah&service=tour" class="cyc-btn-book">
                <span>Select This Car</span> <i class="ph-bold ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 3: Toyota HiAce Grand Cabin -->
        <div class="cyc-card" data-cat="microbus">
          <div class="cyc-card-img-wrap">
            <img src="https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=800&q=80" alt="Toyota HiAce" class="cyc-card-img" loading="lazy"/>
            <span class="cyc-badge-pill" style="background:rgba(255,193,7,0.15); color:#ffc107; border-color:rgba(255,193,7,0.3);">14-Seater Grand Cabin</span>
          </div>
          <div class="cyc-card-content">
            <div class="cyc-card-head">
              <h3 class="cyc-car-name">Toyota HiAce Super GL</h3>
              <div class="cyc-car-price">৳4,800 <span class="cyc-price-sub">/ trip</span></div>
            </div>
            <p class="cyc-car-desc">High-roof microbus for corporate teams, wedding delegations, and intercity group tours.</p>
            <div class="cyc-specs-row">
              <span class="cyc-spec-item"><i class="ph-bold ph-users"></i> 14 Seats</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-suitcase"></i> 8 Bags</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-snowflake"></i> Full Cabin AC</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-gas-can"></i> Dual Fuel</span>
            </div>
            <div class="cyc-perk-line">
              <i class="ph-fill ph-check-circle" style="color:var(--accent);"></i> Heavy Commercial BRTA Master Driver
            </div>
            <div class="cyc-card-actions">
              <a href="find-cars.html?car=Toyota+HiAce&service=intercity" class="cyc-btn-book">
                <span>Select This Car</span> <i class="ph-bold ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 4: Toyota Land Cruiser Prado -->
        <div class="cyc-card" data-cat="suv">
          <div class="cyc-card-img-wrap">
            <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80" alt="Toyota Prado" class="cyc-card-img" loading="lazy"/>
            <span class="cyc-badge-pill" style="background:rgba(212,255,0,0.18); color:var(--accent); border-color:rgba(212,255,0,0.4);">VIP Luxury 4x4 SUV</span>
          </div>
          <div class="cyc-card-content">
            <div class="cyc-card-head">
              <h3 class="cyc-car-name">Toyota Land Cruiser Prado</h3>
              <div class="cyc-car-price">৳9,500 <span class="cyc-price-sub">/ day</span></div>
            </div>
            <p class="cyc-car-desc">Flagship executive SUV for embassy guests, high-profile delegations, and luxury motorcades.</p>
            <div class="cyc-specs-row">
              <span class="cyc-spec-item"><i class="ph-bold ph-users"></i> 7 Seats</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-suitcase"></i> 5 Bags</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-snowflake"></i> Quad Climate</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-shield-check"></i> 4WD Armor</span>
            </div>
            <div class="cyc-perk-line">
              <i class="ph-fill ph-check-circle" style="color:var(--accent);"></i> VIP Protocol & Security-Trained Chauffeur
            </div>
            <div class="cyc-card-actions">
              <a href="find-cars.html?car=Toyota+Prado&service=event" class="cyc-btn-book">
                <span>Select This Car</span> <i class="ph-bold ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        <!-- 5: Toyota Axio -->
        <div class="cyc-card" data-cat="sedan">
          <div class="cyc-card-img-wrap">
            <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" alt="Toyota Axio" class="cyc-card-img" loading="lazy"/>
            <span class="cyc-badge-pill">Economy City Sedan</span>
          </div>
          <div class="cyc-card-content">
            <div class="cyc-card-head">
              <h3 class="cyc-car-name">Toyota Axio / Corolla</h3>
              <div class="cyc-car-price">৳2,200 <span class="cyc-price-sub">/ trip</span></div>
            </div>
            <p class="cyc-car-desc">Reliable, efficient sedan for city office runs, personal errands, and budget-friendly airport pickups.</p>
            <div class="cyc-specs-row">
              <span class="cyc-spec-item"><i class="ph-bold ph-users"></i> 4 Seats</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-suitcase"></i> 2 Bags</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-snowflake"></i> Chilled AC</span>
              <span class="cyc-spec-item"><i class="ph-bold ph-gas-can"></i> CNG / Octane</span>
            </div>
            <div class="cyc-perk-line">
              <i class="ph-fill ph-check-circle" style="color:var(--accent);"></i> Verified City Chauffeur Included
            </div>
            <div class="cyc-card-actions">
              <a href="find-cars.html?car=Toyota+Axio&service=hourly" class="cyc-btn-book">
                <span>Select This Car</span> <i class="ph-bold ph-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS — Cinematic numbered steps -->`;

if (!html.includes(targetAfterServices)) {
  console.error('targetAfterServices not found in index.html!');
  process.exit(1);
}
html = html.replace(targetAfterServices, repAfterServices);

// 3. Add CSS for Choose Your Car Section
const cssBlock = `
  <style>
    /* CHOOSE YOUR CAR SECTION STYLES */
    .choose-car-section {
      padding: 90px 24px;
      background: #08080a;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .cyc-container {
      max-width: 1280px;
      margin: 0 auto;
    }
    .cyc-header-wrap {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 24px;
      margin-bottom: 36px;
    }
    .cyc-tag {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--accent, #d4ff00);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cyc-main-title {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(2rem, 3.8vw, 3rem);
      font-weight: 800;
      color: #fff;
      line-height: 1.15;
      margin: 0 0 10px 0;
    }
    .cyc-main-sub {
      color: var(--text-secondary, #a1a1aa);
      font-weight: 400;
    }
    .cyc-lead-p {
      font-size: 0.88rem;
      color: var(--text-secondary, #a1a1aa);
      max-width: 560px;
      margin: 0;
    }
    .cyc-filter-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 6px;
      border-radius: 9999px;
    }
    .cyc-tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary, #a1a1aa);
      font-size: 0.82rem;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .cyc-tab-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.06);
    }
    .cyc-tab-btn.active {
      background: var(--accent, #d4ff00);
      color: #000;
      font-weight: 700;
    }
    .cyc-fleet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    .cyc-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }
    .cyc-card:hover {
      border-color: rgba(212,255,0,0.35);
      transform: translateY(-4px);
      box-shadow: 0 16px 36px rgba(0,0,0,0.4);
    }
    .cyc-card-img-wrap {
      position: relative;
      width: 100%;
      height: 200px;
      background: #111;
      overflow: hidden;
    }
    .cyc-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }
    .cyc-card:hover .cyc-card-img {
      transform: scale(1.05);
    }
    .cyc-badge-pill {
      position: absolute;
      top: 14px;
      left: 14px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 5px 12px;
      border-radius: 9999px;
      background: rgba(0,0,0,0.75);
      color: var(--accent, #d4ff00);
      border: 1px solid rgba(212,255,0,0.3);
      backdrop-filter: blur(8px);
    }
    .cyc-card-content {
      padding: 22px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .cyc-card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      gap: 12px;
    }
    .cyc-car-name {
      font-family: var(--font-display, sans-serif);
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }
    .cyc-car-price {
      font-family: var(--font-display, sans-serif);
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--accent, #d4ff00);
      white-space: nowrap;
    }
    .cyc-price-sub {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-tertiary, #71717a);
    }
    .cyc-car-desc {
      font-size: 0.8rem;
      color: var(--text-secondary, #a1a1aa);
      line-height: 1.45;
      margin: 0 0 16px 0;
    }
    .cyc-specs-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }
    .cyc-spec-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.74rem;
      color: var(--text-secondary, #a1a1aa);
      background: rgba(255,255,255,0.04);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .cyc-perk-line {
      font-size: 0.76rem;
      color: #fff;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 7px;
      margin-bottom: 18px;
      margin-top: auto;
    }
    .cyc-card-actions {
      margin-top: auto;
    }
    .cyc-btn-book {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 11px;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.25s ease;
    }
    .cyc-btn-book:hover {
      background: var(--accent, #d4ff00);
      color: #000;
      border-color: var(--accent, #d4ff00);
    }
    @media (max-width: 768px) {
      .cyc-fleet-grid { grid-template-columns: 1fr; }
      .cyc-filter-tabs { width: 100%; justify-content: flex-start; overflow-x: auto; flex-wrap: nowrap; padding: 4px; }
      .cyc-tab-btn { white-space: nowrap; font-size: 0.78rem; padding: 7px 14px; }
    }
  </style>
`;

// Insert CSS before </head>
html = html.replace('</head>', `${cssBlock}\n</head>`);

// 4. Add filter JS function before </body>
const jsBlock = `
  <script>
    function filterCycFleet(cat, btnEl) {
      document.querySelectorAll('.cyc-tab-btn').forEach(b => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');

      const cards = document.querySelectorAll('.cyc-card');
      cards.forEach(c => {
        if (cat === 'all' || c.getAttribute('data-cat') === cat) {
          c.style.display = 'flex';
        } else {
          c.style.display = 'none';
        }
      });
    }
  </script>
`;

html = html.replace('</body>', `${jsBlock}\n</body>`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ index.html updated with 7th Service and Choose Your Car Interactive Showcase section!');
