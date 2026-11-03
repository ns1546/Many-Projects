const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../customer-panel.html');
let content = fs.readFileSync(targetFile, 'utf8');

// ============================================================================
// 1. HEAD & RBAC ENFORCEMENT & CONSOLIDATED SCRIPTS
// ============================================================================
const oldHeadScripts = `  <!-- Professional Icon Library (Phosphor Icons) -->
  <script src="/socket.io/socket.io.js"></script>
  <script type="module" src="https://unpkg.com/@phosphor-icons/web"></script>
  <script>
    window.AppState = window.AppState || { user: null, inventory: [], socket: null };
  </script>
  <script src="js/state.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/pricing-data.js"></script>
  <script src="js/pricing.js"></script>
  <script src="js/bookings.js"></script>
  <script src="js/inventory.js"></script>`;

const newHeadScripts = `  <!-- Professional Icon Library (Phosphor Icons) -->
  <script src="/socket.io/socket.io.js"></script>
  <script type="module" src="https://unpkg.com/@phosphor-icons/web"></script>
  <script>
    window.AppState = window.AppState || { user: null, inventory: [], socket: null };
  </script>
  <script src="js/state.js"></script>
  <script src="js/auth.js"></script>
  <script>
    // FAANG Enterprise Security: Strict RBAC Guard for Customer Portal
    async function enforceCustomerRBAC() {
      if (window.hydrateStatePromise) {
        await window.hydrateStatePromise;
      }
      let attempts = 0;
      while ((!window.AppState || !window.AppState.user) && (!window.rownaaSession) && attempts < 12) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      const user = (window.AppState && window.AppState.user) || window.rownaaSession;
      if (!user || (user.role !== 'customer' && user.role !== 'admin')) {
        console.warn('[Security] Unauthorized Role or Unauthenticated. Redirecting to login.');
        if (typeof window !== 'undefined' && window.location && typeof window.location.replace === 'function') {
          window.location.replace('login-sliding.html?redirect=customer-panel.html');
        }
      }
    }
    enforceCustomerRBAC();
    window.enforceCustomerRBAC = enforceCustomerRBAC;
  </script>
  <script src="js/pricing-data.js"></script>
  <script src="js/pricing.js"></script>
  <script src="js/bookings.js"></script>
  <script src="js/inventory.js"></script>
  <script src="js/notifications.js"></script>
  <script src="js/reviews.js"></script>`;

if (content.includes(oldHeadScripts)) {
  content = content.replace(oldHeadScripts, newHeadScripts);
  console.log('✓ 1. Head scripts & enforceCustomerRBAC() installed');
} else {
  console.log('⚠ 1. Old head scripts did not match exact string');
}

// ============================================================================
// 2. DYNAMIC SIDEBAR USER IDENTITY
// ============================================================================
const oldSidebarProfile = `    <div class="user-profile">
      <div class="avatar">RK</div>
      <div class="user-info">
        <div class="user-name">Rafiq Karim</div>
        <div class="user-tier"><i class="ph-fill ph-seal-check" style="color:var(--accent)"></i> Verified Account</div>
      </div>
    </div>`;

const newSidebarProfile = `    <div class="user-profile">
      <div class="avatar" id="user-avatar-initials">CU</div>
      <div class="user-info">
        <div class="user-name" id="user-sidebar-name">Customer Account</div>
        <div class="user-tier"><i class="ph-fill ph-seal-check" style="color:var(--accent)"></i> Verified Account</div>
      </div>
    </div>`;

if (content.includes(oldSidebarProfile)) {
  content = content.replace(oldSidebarProfile, newSidebarProfile);
  console.log('✓ 2. Sidebar identity elements made dynamic');
} else {
  console.log('⚠ 2. Old sidebar profile did not match');
}

// ============================================================================
// 3. DASHBOARD WELCOME HEADING
// ============================================================================
const oldWelcome = `      <div class="page-heading animate-slide">
        <h1 class="ph-title">Welcome back, Rafiq.</h1>
        <p class="ph-subtitle">Here is a summary of your corporate and personal travel.</p>
      </div>`;

const newWelcome = `      <div class="page-heading animate-slide">
        <h1 class="ph-title" id="user-welcome-heading">Welcome back.</h1>
        <p class="ph-subtitle">Here is a summary of your corporate and personal travel.</p>
      </div>`;

if (content.includes(oldWelcome)) {
  content = content.replace(oldWelcome, newWelcome);
  console.log('✓ 3. Dashboard welcome heading made dynamic');
} else {
  console.log('⚠ 3. Old welcome did not match');
}

// ============================================================================
// 4. BOOKING FORMS OVERHAUL (AIRPORT, HOURLY, INTERCITY, CORPORATE, VOUCHER)
// ============================================================================
const oldBookingContainerStart = `          <!-- Common Details -->
          <div class="form-section">
            <div class="fs-title"><i class="ph-fill ph-user-circle"></i> Rider Details</div>
            <div class="grid-2">
              <div class="f-group">
                <label class="f-label">Full Name <span class="req">*</span></label>
                <input type="text" class="f-input" id="book-rider-name" value="Faisal Ahmed"/>
              </div>
              <div class="f-group">
                <label class="f-label">Phone <span class="req">*</span></label>
                <input type="text" class="f-input" id="book-rider-phone" value="+880 1711 000000"/>
              </div>
            </div>
          </div>`;

const newBookingContainerStart = `          <!-- Common Details -->
          <div class="form-section">
            <div class="fs-title"><i class="ph-fill ph-user-circle"></i> Rider Details</div>
            <div class="grid-2">
              <div class="f-group">
                <label class="f-label" for="book-rider-name">Full Name <span class="req">*</span></label>
                <input type="text" class="f-input" id="book-rider-name" placeholder="Your full name" value=""/>
              </div>
              <div class="f-group">
                <label class="f-label" for="book-rider-phone">Phone Number <span class="req">*</span></label>
                <input type="tel" class="f-input" id="book-rider-phone" placeholder="e.g. +880 1711 000000" value=""/>
              </div>
            </div>
          </div>`;

if (content.includes(oldBookingContainerStart)) {
  content = content.replace(oldBookingContainerStart, newBookingContainerStart);
  console.log('✓ 4. Rider details inputs updated');
} else {
  console.log('⚠ 4. Old rider details did not match');
}

// Replace #frm-airport
const oldFrmAirport = `          <!-- Specific: Airport -->
          <div id="frm-airport" class="form-section svc-form active">
            <div class="fs-title"><i class="ph-fill ph-airplane-tilt"></i> Airport Transfer</div>
            <div class="grid-1" style="margin-bottom:20px">
              <div class="f-group">
                <label class="f-label">Direction</label>
                <div class="seg-control">
                  <div class="seg-btn active" onclick="toggleSeg(this); document.getElementById('sum-dir').textContent='To Airport'">To Airport</div>
                  <div class="seg-btn" onclick="toggleSeg(this); document.getElementById('sum-dir').textContent='From Airport'">From Airport</div>
                </div>
              </div>
            </div>
            <div class="grid-2">
              <div class="f-group">
                <label class="f-label">Pickup Area <span class="req">*</span></label>
                <select class="f-input" onchange="document.getElementById('sum-pick').textContent=this.value||'Not set'">
                  <option value="">Select Area...</option><option>Uttara</option><option>Gulshan</option><option>Dhanmondi</option>
                </select>
              </div>
              <div class="f-group">
                <label class="f-label">Airport <span class="req">*</span></label>
                <select class="f-input">
                  <option>Hazrat Shahjalal (DAC)</option><option>Shah Amanat (CGP)</option>
                </select>
              </div>
              <div class="f-group">
                <label class="f-label">Date <span class="req">*</span></label>
                <input type="date" class="f-input" onchange="updateDateTime()"/>
              </div>
              <div class="f-group">
                <label class="f-label">Time <span class="req">*</span></label>
                <input type="time" class="f-input" onchange="updateDateTime()"/>
              </div>
            </div>
          </div>`;

const newFrmAirport = `          <!-- Specific: Airport -->
          <div id="frm-airport" class="form-section svc-form active">
            <div class="fs-title"><i class="ph-fill ph-airplane-tilt"></i> Airport Transfer</div>
            <div class="grid-1" style="margin-bottom:20px">
              <div class="f-group">
                <label class="f-label">Direction</label>
                <div class="seg-control" id="air-dir-control">
                  <div class="seg-btn active" onclick="setAirportDirection('to_airport', this)">To Airport</div>
                  <div class="seg-btn" onclick="setAirportDirection('from_airport', this)">From Airport</div>
                  <div class="seg-btn" onclick="setAirportDirection('round_trip', this)">Round Trip (+৳500)</div>
                </div>
              </div>
            </div>
            <div class="grid-2">
              <div class="f-group" id="grp-air-pickup">
                <label class="f-label" id="lbl-air-pickup">Pickup Area <span class="req">*</span></label>
                <select class="f-input" id="air-pickup-select" onchange="onAirportPickupChange(this.value)">
                  <option value="">Select Dhaka Area...</option>
                  <option value="Uttara">Uttara (Zone 1 - 0-8 km)</option>
                  <option value="Khilkhet">Khilkhet / Tongi (Zone 2 - 8-12 km)</option>
                  <option value="Gulshan">Gulshan / Banani / Bashundhara (Zone 3 - 12-16 km)</option>
                  <option value="Badda">Badda / Tejgaon / Mohakhali (Zone 4 - 16-20 km)</option>
                  <option value="Mirpur">Mirpur / Cantonment (Zone 5 - 20-25 km)</option>
                  <option value="Motijheel">Motijheel / Dhanmondi / Ramna (Zone 6 - 25-30 km)</option>
                  <option value="Old Dhaka">Old Dhaka / Lalbagh (Zone 7 - 30-35 km)</option>
                  <option value="Savar">Savar / Ashulia / Keraniganj (Zone 8 - 35-45 km)</option>
                </select>
              </div>
              <div class="f-group" id="grp-air-dropoff">
                <label class="f-label" id="lbl-air-dropoff">Airport Terminal <span class="req">*</span></label>
                <select class="f-input" id="air-airport-select" onchange="onAirportTerminalChange(this.value)">
                  <option value="Hazrat Shahjalal (DAC) Terminal 1">Hazrat Shahjalal (DAC) Terminal 1</option>
                  <option value="Hazrat Shahjalal (DAC) Terminal 2">Hazrat Shahjalal (DAC) Terminal 2</option>
                  <option value="Hazrat Shahjalal (DAC) Domestic">Hazrat Shahjalal (DAC) Domestic</option>
                  <option value="Shah Amanat (CGP)">Shah Amanat (CGP)</option>
                </select>
              </div>
              <div class="f-group col-span-2" id="grp-air-flight" style="display:none;">
                <label class="f-label" for="air-flight-no">Flight Number & Arrival Details</label>
                <input type="text" class="f-input" id="air-flight-no" placeholder="e.g. BG 085 / EK 582 (Driver monitors flight ETA)"/>
              </div>
              <div class="f-group">
                <label class="f-label" for="air-date">Date <span class="req">*</span></label>
                <input type="date" class="f-input" id="air-date" onchange="updateDateTime()"/>
              </div>
              <div class="f-group">
                <label class="f-label" for="air-time">Pickup Time <span class="req">*</span></label>
                <input type="time" class="f-input" id="air-time" value="09:00" onchange="updateDateTime()"/>
              </div>
            </div>
          </div>`;

if (content.includes(oldFrmAirport)) {
  content = content.replace(oldFrmAirport, newFrmAirport);
  console.log('✓ 5. #frm-airport overhauled (3 directions, 8 zones, flight info, inversion)');
} else {
  console.log('⚠ 5. Old #frm-airport did not match');
}

// Replace #frm-corporate
const oldFrmCorp = `          <!-- Specific: Corporate -->
          <div id="frm-corporate" class="form-section svc-form">
            <div class="fs-title"><i class="ph-fill ph-buildings"></i> Corporate Fleet</div>
            <div class="grid-2">
              <div class="f-group col-span-2">
                <label class="f-label">Company Name <span class="req">*</span></label>
                <input type="text" class="f-input" placeholder="Enter company name"/>
              </div>
              <div class="f-group">
                <label class="f-label">Contract Type</label>
                <select class="f-input"><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
              </div>
              <div class="f-group">
                <label class="f-label">Start Date <span class="req">*</span></label>
                <input type="date" class="f-input"/>
              </div>
              <div class="f-group">
                <label class="f-label">Start Time <span class="req">*</span></label>
                <input type="time" class="f-input" value="09:00"/>
              </div>
            </div>
          </div>`;

const newFrmCorp = `          <!-- Specific: Corporate -->
          <div id="frm-corporate" class="form-section svc-form">
            <div class="fs-title"><i class="ph-fill ph-buildings"></i> Corporate Fleet</div>
            <div class="grid-2">
              <div class="f-group col-span-2">
                <label class="f-label" for="corp-company">Company / Organization <span class="req">*</span></label>
                <input type="text" class="f-input" id="corp-company" placeholder="e.g. Grameenphone / Unilever" oninput="updateCorporateLocation(this.value)" onchange="updateCorporateLocation(this.value)"/>
              </div>
              <div class="f-group">
                <label class="f-label" for="corp-contract">Contract Duration</label>
                <select class="f-input" id="corp-contract" onchange="calculateCustomerBookingFare()">
                  <option value="1">1 Day Fixed (Daily Corporate Rate)</option>
                  <option value="7">7 Days (Weekly Fleet Contract)</option>
                  <option value="15">15 Days (Bi-Weekly Fleet Contract)</option>
                  <option value="30">30 Days (Monthly Dedicated Fleet)</option>
                </select>
              </div>
              <div class="f-group">
                <label class="f-label" for="corp-duty">Daily Duty Hours</label>
                <select class="f-input" id="corp-duty">
                  <option value="10">10 Hours / Day</option>
                  <option value="12">12 Hours / Day</option>
                </select>
              </div>
              <div class="f-group">
                <label class="f-label" for="corp-date">Start Date <span class="req">*</span></label>
                <input type="date" class="f-input" id="corp-date" onchange="updateDateTime()"/>
              </div>
              <div class="f-group">
                <label class="f-label" for="corp-time">Start Time <span class="req">*</span></label>
                <input type="time" class="f-input" id="corp-time" value="09:00" onchange="updateDateTime()"/>
              </div>
            </div>
          </div>`;

if (content.includes(oldFrmCorp)) {
  content = content.replace(oldFrmCorp, newFrmCorp);
  console.log('✓ 6. #frm-corporate overhauled with id, event handlers, and official rates');
} else {
  console.log('⚠ 6. Old #frm-corporate did not match');
}

// Replace #frm-intercity
const oldFrmIc = `          <!-- Specific: Intercity -->
          <div id="frm-intercity" class="form-section svc-form">
            <div class="fs-title"><i class="ph-fill ph-path"></i> Intercity Travel</div>
            <div class="grid-2">
              <div class="f-group">
                <label class="f-label">Origin City <span class="req">*</span></label>
                <select class="f-input"><option>Dhaka</option><option>Chittagong</option><option>Sylhet</option></select>
              </div>
              <div class="f-group">
                <label class="f-label">Destination City <span class="req">*</span></label>
                <select class="f-input"><option>Chittagong</option><option>Dhaka</option><option>Sylhet</option></select>
              </div>
              <div class="f-group">
                <label class="f-label">Date <span class="req">*</span></label>
                <input type="date" class="f-input"/>
              </div>
              <div class="f-group">
                <label class="f-label">Time <span class="req">*</span></label>
                <input type="time" class="f-input"/>
              </div>
            </div>
          </div>`;

const newFrmIc = `          <!-- Specific: Intercity -->
          <div id="frm-intercity" class="form-section svc-form">
            <div class="fs-title"><i class="ph-fill ph-path"></i> Intercity Travel</div>
            <div class="grid-1" style="margin-bottom:20px">
              <div class="f-group">
                <label class="f-label">Trip Type</label>
                <div class="seg-control" id="ic-type-control">
                  <div class="seg-btn active" onclick="setIntercityTripType('one_way', this)">One-Way</div>
                  <div class="seg-btn" onclick="setIntercityTripType('same_day', this)">Same-Day Round Trip (+50%)</div>
                  <div class="seg-btn" onclick="setIntercityTripType('multi_day', this)">Multi-Day Round Trip</div>
                </div>
              </div>
            </div>
            <div class="grid-2">
              <div class="f-group">
                <label class="f-label" for="ic-origin">Origin City <span class="req">*</span></label>
                <select class="f-input" id="ic-origin" onchange="onIntercityRouteChanged()">
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Cox's Bazar">Cox's Bazar</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Bogura">Bogura</option>
                </select>
              </div>
              <div class="f-group">
                <label class="f-label" for="ic-dest">Destination City <span class="req">*</span></label>
                <select class="f-input" id="ic-dest" onchange="onIntercityRouteChanged()">
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Cox's Bazar">Cox's Bazar</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Bogura">Bogura</option>
                  <option value="Barishal">Barishal</option>
                  <option value="Rangpur">Rangpur</option>
                </select>
              </div>
              <div class="f-group col-span-2" id="grp-ic-nights" style="display:none;">
                <label class="f-label" for="ic-nights">Chauffeur Waiting Nights (৳2,000/night)</label>
                <input type="number" class="f-input" id="ic-nights" value="1" min="1" max="14" onchange="calculateCustomerBookingFare()"/>
              </div>
              <div class="f-group">
                <label class="f-label" for="ic-date">Departure Date <span class="req">*</span></label>
                <input type="date" class="f-input" id="ic-date" onchange="updateDateTime()"/>
              </div>
              <div class="f-group">
                <label class="f-label" for="ic-time">Pickup Time <span class="req">*</span></label>
                <input type="time" class="f-input" id="ic-time" value="08:00" onchange="updateDateTime()"/>
              </div>
            </div>
          </div>`;

if (content.includes(oldFrmIc)) {
  content = content.replace(oldFrmIc, newFrmIc);
  console.log('✓ 7. #frm-intercity overhauled with 3 trip types, nights counter, and event handlers');
} else {
  console.log('⚠ 7. Old #frm-intercity did not match');
}

// Replace #frm-hourly
const oldFrmHourly = `          <!-- Specific: Hourly -->
          <div id="frm-hourly" class="form-section svc-form">
            <div class="fs-title"><i class="ph-fill ph-clock"></i> Hourly Rental</div>
            <div class="grid-2">
              <div class="f-group">
                <label class="f-label">Pickup Location <span class="req">*</span></label>
                <input type="text" class="f-input" placeholder="Full address"/>
              </div>
              <div class="f-group">
                <label class="f-label">Duration</label>
                <select class="f-input"><option>4 Hours</option><option>8 Hours</option><option>Full Day</option></select>
              </div>
              <div class="f-group">
                <label class="f-label">Date <span class="req">*</span></label>
                <input type="date" class="f-input"/>
              </div>
              <div class="f-group">
                <label class="f-label">Time <span class="req">*</span></label>
                <input type="time" class="f-input"/>
              </div>
            </div>
          </div>`;

const newFrmHourly = `          <!-- Specific: Hourly -->
          <div id="frm-hourly" class="form-section svc-form">
            <div class="fs-title"><i class="ph-fill ph-clock"></i> Hourly Rental (Inside Dhaka Metro)</div>
            <div class="grid-2">
              <div class="f-group col-span-2">
                <label class="f-label" for="hourly-pickup">Pickup Address in Dhaka <span class="req">*</span></label>
                <input type="text" class="f-input" id="hourly-pickup" placeholder="e.g. House 12, Road 7, Gulshan 2, Dhaka" oninput="updateHourlyLocation(this.value)" onchange="updateHourlyLocation(this.value)"/>
              </div>
              <div class="f-group col-span-2">
                <label class="f-label" for="hourly-dur">Rental Duration Package</label>
                <select class="f-input" id="hourly-dur" onchange="calculateCustomerBookingFare()">
                  <option value="4h">4 Hours Package (Standard - 40 km included)</option>
                  <option value="10h">10 Hours Package (Full Day - 40 km included)</option>
                </select>
              </div>
              <div class="f-group">
                <label class="f-label" for="hourly-date">Date <span class="req">*</span></label>
                <input type="date" class="f-input" id="hourly-date" onchange="updateDateTime()"/>
              </div>
              <div class="f-group">
                <label class="f-label" for="hourly-time">Pickup Time <span class="req">*</span></label>
                <input type="time" class="f-input" id="hourly-time" value="09:00" onchange="updateDateTime()"/>
              </div>
            </div>
          </div>`;

if (content.includes(oldFrmHourly)) {
  content = content.replace(oldFrmHourly, newFrmHourly);
  console.log('✓ 8. #frm-hourly overhauled with 4h/10h official packages, 40km tag, and input handlers');
} else {
  console.log('⚠ 8. Old #frm-hourly did not match');
}

// Replace Summary Panel
const oldSummaryPanel = `        <!-- Summary Side -->
        <div class="summary-panel">
          <div class="sp-head">Trip Summary</div>
          <div class="sp-body">
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-airplane-tilt"></i> Service</div>
              <div class="sp-val" id="sum-svc">Airport Transfer</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-map-pin"></i> Location</div>
              <div class="sp-val empty" id="sum-pick">Not Set</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-arrows-left-right"></i> Direction</div>
              <div class="sp-val" id="sum-dir">To Airport</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-calendar-blank"></i> Schedule</div>
              <div class="sp-val empty" id="sum-dt">Select Date</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-car"></i> Vehicle</div>
              <div class="sp-val" id="sum-car">Standard Sedan (4 Seats)</div>
            </div>

            <div class="sp-divider"></div>

            <div class="sp-total">
              <span>Total Estimate</span>
              <span id="cust-booking-total">৳ 2,000</span>
            </div>
            <div class="sp-note" id="cust-booking-note">Real-time estimate synced with Admin Tariff.</div>

            <button class="btn-submit" id="btn-submit" onclick="submitForm(this)">
              Confirm Booking <i class="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>`;

const newSummaryPanel = `        <!-- Summary Side -->
        <div class="summary-panel">
          <div class="sp-head">Trip Summary</div>
          <div class="sp-body">
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-airplane-tilt"></i> Service</div>
              <div class="sp-val" id="sum-svc">Airport Transfer</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-map-pin"></i> Location</div>
              <div class="sp-val empty" id="sum-pick">Not Set</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-arrows-left-right"></i> Direction / Type</div>
              <div class="sp-val" id="sum-dir">To Airport</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-calendar-blank"></i> Schedule</div>
              <div class="sp-val empty" id="sum-dt">Select Date</div>
            </div>
            
            <div class="sp-row">
              <div class="sp-key"><i class="ph ph-car"></i> Vehicle</div>
              <div class="sp-val" id="sum-car">Standard Sedan (4 Seats)</div>
            </div>

            <div class="sp-divider"></div>

            <!-- Promo Code / Voucher Box -->
            <div style="margin-bottom:14px;">
              <label class="f-label" for="cust-booking-promo" style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:6px; display:block;">Promo Voucher</label>
              <div style="display:flex; gap:6px;">
                <input type="text" id="cust-booking-promo" class="f-input" placeholder="e.g. ROWNAA20" style="text-transform:uppercase; font-size:0.8rem; padding:8px 12px; height:38px;" />
                <button type="button" class="btn-primary" id="btn-apply-cust-promo" onclick="applyCustomerBookingPromo()" style="padding:0 14px; height:38px; font-size:0.75rem; font-weight:700;">Apply</button>
              </div>
              <div id="cust-promo-status" style="font-size:0.72rem; margin-top:4px; display:none;"></div>
            </div>

            <!-- Payment Method Selector -->
            <div style="margin-bottom:14px;">
              <label class="f-label" style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:6px; display:block;">Payment Method</label>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
                <label style="display:flex; align-items:center; gap:6px; font-size:0.75rem; background:var(--bg-elevated); padding:8px 10px; border-radius:6px; border:1px solid var(--border-subtle); cursor:pointer;">
                  <input type="radio" name="cust_pay_method" id="pay-method-cash" value="cash" checked onchange="onCustomerPayMethodChange('cash')" /> Cash Chauffeur
                </label>
                <label style="display:flex; align-items:center; gap:6px; font-size:0.75rem; background:var(--bg-elevated); padding:8px 10px; border-radius:6px; border:1px solid var(--border-subtle); cursor:pointer;">
                  <input type="radio" name="cust_pay_method" id="pay-method-mfs" value="mfs" onchange="onCustomerPayMethodChange('mfs')" /> bKash / Nagad
                </label>
              </div>
            </div>

            <!-- Fare Line Items -->
            <div class="sp-row" style="font-size:0.8rem; color:var(--text-secondary);">
              <div>Base Tariff</div>
              <div id="cust-base-fare">৳ 2,000</div>
            </div>
            <div class="sp-row" id="cust-discount-row" style="font-size:0.8rem; color:var(--accent); display:none;">
              <div>Voucher Discount</div>
              <div id="cust-discount-val">-৳ 0</div>
            </div>
            <div class="sp-row" style="font-size:0.8rem; color:var(--text-secondary);">
              <div>Govt VAT (5%)</div>
              <div id="cust-vat-val">৳ 100</div>
            </div>

            <div class="sp-divider"></div>

            <div class="sp-total">
              <span>Total Payable</span>
              <span id="cust-booking-total">৳ 2,100</span>
            </div>
            <div class="sp-note" id="cust-booking-note">Real-time estimate synced with Admin Tariff.</div>

            <button class="btn-submit" id="btn-submit" onclick="submitForm(this)">
              Confirm Booking <i class="ph ph-arrow-right"></i>
            </button>
          </div>
        </div>`;

if (content.includes(oldSummaryPanel)) {
  content = content.replace(oldSummaryPanel, newSummaryPanel);
  console.log('✓ 9. Summary Panel upgraded with voucher engine, payment options, and line items');
} else {
  console.log('⚠ 9. Old summary panel did not match');
}

// ============================================================================
// 5. PROFILE PREFERENCES & FIX ORPHAN DIVS
// ============================================================================
const oldFleetDivEnd = `      <div id="customer-fleet-pagination" style="padding:16px; display:flex; justify-content:space-between; align-items:center; color:var(--text-secondary); font-size:0.9rem;"></div>
      </div>
      </div>
    </div>`;

const newFleetDivEnd = `      <div id="customer-fleet-pagination" style="padding:16px; display:flex; justify-content:space-between; align-items:center; color:var(--text-secondary); font-size:0.9rem;"></div>
    </div>`;

if (content.includes(oldFleetDivEnd)) {
  content = content.replace(oldFleetDivEnd, newFleetDivEnd);
  console.log('✓ 10. Removed orphan </div> tags');
} else {
  console.log('⚠ 10. Old fleet div end did not match');
}

const oldProfileLang = `           <div class="f-group" style="margin-bottom:16px">
             <label class="f-label" style="display:block;margin-bottom:8px;font-size:0.85rem;color:var(--text-secondary)">Language</label>
             <select class="f-input" style="width:100%;padding:10px;background:var(--bg-elevated);border:1px solid var(--border-strong);color:#fff;border-radius:6px;">
               <option>English</option>
               <option>Bengali</option>
             </select>
           </div>`;

const newProfileLang = `           <div class="f-group" style="margin-bottom:16px">
             <label class="f-label" for="cust-profile-language" style="display:block;margin-bottom:8px;font-size:0.85rem;color:var(--text-secondary)">Language</label>
             <select id="cust-profile-language" class="f-input" style="width:100%;padding:10px;background:var(--bg-elevated);border:1px solid var(--border-strong);color:#fff;border-radius:6px;">
               <option value="en">English (Default)</option>
               <option value="bn">Bengali (বাংলা)</option>
             </select>
           </div>`;

if (content.includes(oldProfileLang)) {
  content = content.replace(oldProfileLang, newProfileLang);
  console.log('✓ 11. Profile language select given explicit ID and options');
} else {
  console.log('⚠ 11. Old profile language did not match');
}

// ============================================================================
// 6. CORE LOGIC FUNCTIONS: REACTION, VOUCHERS, TARIFFS, VALIDATION & HYDRATION
// ============================================================================
const oldLogicBlock = `function toggleSeg(el) {
  const p = el.parentElement;
  p.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  if (typeof calculateCustomerBookingFare === 'function') calculateCustomerBookingFare();
}

function updateDateTime() {
  const dateStr = document.querySelector('#frm-airport input[type="date"]').value;
  const timeStr = document.querySelector('#frm-airport input[type="time"]').value;
  const el = document.getElementById('sum-dt');
  
  if(dateStr && timeStr) {
    el.textContent = dateStr + ' at ' + timeStr;
    el.classList.remove('empty');
  }
  if (typeof calculateCustomerBookingFare === 'function') calculateCustomerBookingFare();
}

function calculateCustomerBookingFare() {
  if (!window.PricingEngine) return;

  let activeSvcId = 'airport';
  document.querySelectorAll('.svc-form').forEach(f => {
    if (f.classList.contains('active')) {
      activeSvcId = f.id.replace('frm-', '');
    }
  });

  const carSelect = document.getElementById('book-car-select');
  const cat = carSelect ? carSelect.value : 'sedan_standard';

  const totalEl = document.getElementById('cust-booking-total');
  const noteEl = document.getElementById('cust-booking-note');
  if (!totalEl) return;

  if (activeSvcId === 'airport') {
    const parent = document.getElementById('frm-airport');
    const selects = parent ? parent.querySelectorAll('select') : [];
    const pickupVal = selects[0] ? selects[0].value : 'Dhaka';
    const dirText = document.getElementById('sum-dir')?.textContent || 'To Airport';
    const direction = dirText.includes('Round') ? 'Round Trip' : 'Airport Drop-off';
    
    const normZone = window.PricingEngine._normalizeZone(pickupVal);
    const p = window.PricingEngine.calculateAirport(normZone, cat, direction, false);
    if (p) {
      totalEl.textContent = \`৳ \${p.total.toLocaleString()}\`;
      if (noteEl) noteEl.textContent = \`Zone flat fare: ৳\${p.baseFare}\${p.roundTripSurcharge ? ' + Round Trip Surcharge: ৳' + p.roundTripSurcharge : ''} (\${p.freeWaitMinutes}m free wait).\`;
    }
  } else if (activeSvcId === 'hourly') {
    const parent = document.getElementById('frm-hourly');
    const durSelect = parent ? parent.querySelector('select') : null;
    const durVal = durSelect ? durSelect.value : '4 Hours';
    const is10h = durVal.includes('8') || durVal.includes('10') || durVal.includes('Day');
    
    const p = window.PricingEngine.calculateHourly(cat, is10h, 0, 0);
    if (p) {
      totalEl.textContent = \`৳ \${p.total.toLocaleString()}\`;
      if (noteEl) noteEl.textContent = \`\${p.package} includes \${p.includedDistance}km. Extra hr: ৳\${p.extraHourCharge || 0}, Extra km: ৳\${p.extraKmCharge || 0}.\`;
    }
  } else if (activeSvcId === 'intercity') {
    const parent = document.getElementById('frm-intercity');
    const selects = parent ? parent.querySelectorAll('select') : [];
    const dest = selects[1] ? selects[1].value : 'Chittagong';
    let dist = 200;
    if (dest.includes('Chittagong')) dist = 250;
    else if (dest.includes('Sylhet')) dist = 240;

    const p = window.PricingEngine.calculateIntercity(cat, dist, false, 0);
    if (p) {
      totalEl.textContent = \`৳ \${p.total.toLocaleString()}\`;
      if (noteEl) noteEl.textContent = \`Base Fare: ৳\${p.baseFare} + Road Distance (\${dist}km × ৳\${p.perKm}/km).\`;
    }
  } else if (activeSvcId === 'corporate') {
    const parent = document.getElementById('frm-corporate');
    const contractSelect = parent ? parent.querySelector('select') : null;
    const cType = contractSelect ? contractSelect.value : 'Daily';
    let days = 1;
    if (cType === 'Weekly') days = 7;
    else if (cType === 'Monthly') days = 30;

    const p = window.PricingEngine.calculateCorporate(cat, days);
    if (p) {
      totalEl.textContent = \`৳ \${p.total.toLocaleString()}\`;
      if (noteEl) noteEl.textContent = \`Fixed Daily Rate: ৳\${p.dailyRate}/day for \${days} days booking.\`;
    }
  }
}

function submitForm(btn) {
  if(btn.disabled) return;
  const orig = btn.innerHTML;
  
  // Figure out active service
  let activeSvcId = null;
  document.querySelectorAll('.svc-form').forEach(f => {
    if(f.classList.contains('active')) {
      activeSvcId = f.id.replace('frm-', '');
    }
  });
  if(!activeSvcId) activeSvcId = 'airport';

  let pickup = '';
  let dropoff = '';
  let dt = '';

  const parent = document.getElementById('frm-' + activeSvcId);
  const dateInput = parent.querySelector('input[type="date"]');
  const timeInput = parent.querySelector('input[type="time"]');
  const timeVal = (timeInput && timeInput.value) ? timeInput.value : '09:00';
  
  if(dateInput && dateInput.value) {
    dt = dateInput.value + ' ' + timeVal;
  } else {
    alert("Please select trip date and time.");
    return;
  }
  
  if (activeSvcId === 'airport') {
    const selects = parent.querySelectorAll('select');
    pickup = (selects[0] && selects[0].value) ? selects[0].value : 'Dhaka';
    dropoff = (selects[1] && selects[1].value) ? selects[1].value : 'Airport';
  } else if (activeSvcId === 'corporate') {
    pickup = (parent.querySelector('input[type="text"]') && parent.querySelector('input[type="text"]').value) || 'Corporate';
    dropoff = 'Corporate';
  } else if (activeSvcId === 'intercity') {
    const selects = parent.querySelectorAll('select');
    pickup = (selects[0] && selects[0].value) ? selects[0].value : 'Dhaka';
    dropoff = (selects[1] && selects[1].value) ? selects[1].value : 'Chittagong';
  } else if (activeSvcId === 'hourly') {
    pickup = (parent.querySelector('input[type="text"]') && parent.querySelector('input[type="text"]').value) || 'Dhaka';
    dropoff = 'Hourly / As directed';
  }
  
  const customerName = document.getElementById('book-rider-name')?.value.trim() || window.AppState?.user?.name || 'Customer';
  const customerPhone = document.getElementById('book-rider-phone')?.value.trim() || window.AppState?.user?.phone || '+880 1711 000000';

  const vehicle = document.getElementById('sum-car')?.textContent || 'Standard Sedan';
  const price = document.getElementById('cust-booking-total')?.textContent || document.querySelector('.sp-total span:last-child')?.textContent || '৳ 2,000';

  const payload = {
    customerId: window.AppState?.user?.id || window.AppState?.user?.userId || 'cust-1',
    customerName,
    customerPhone,
    service: activeSvcId,
    pickupLocation: pickup,
    dropoffLocation: dropoff,
    dateTime: dt,
    vehicle: vehicle,
    price: price,
    ownerId: 'biz-001'
  };

  btn.disabled = true;
  btn.innerHTML = \`<i class="ph ph-spinner" style="animation:spin 1s linear infinite"></i> Processing...\`;
  
  window.BookingsManager.add(payload).then((success) => {
    if(success) {
      btn.style.background = 'var(--success)';
      btn.style.color = '#fff';
      btn.innerHTML = \`<i class="ph ph-check-circle"></i> Booking Confirmed\`;
      
      setTimeout(() => {
        if(typeof renderTrips === 'function') renderTrips();
        switchTab('trips');
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
        btn.innerHTML = orig;
      }, 1500);
    } else {
      alert("Booking failed. Try again.");
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });
}`;

const newLogicBlock = `// Active Trip State & Voucher Cache
let activeAirportDirection = 'to_airport';
let activeIntercityTripType = 'one_way';
let activeAppliedVoucher = null;
let activePaymentMethod = 'cash';

function setAirportDirection(dir, el) {
  activeAirportDirection = dir;
  if (el) {
    const parent = el.parentElement;
    parent.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }
  
  const dirLabel = document.getElementById('sum-dir');
  const lblPickup = document.getElementById('lbl-air-pickup');
  const lblDropoff = document.getElementById('lbl-air-dropoff');
  const flightGrp = document.getElementById('grp-air-flight');

  if (dir === 'to_airport') {
    if (dirLabel) dirLabel.textContent = 'To Airport (Departure)';
    if (lblPickup) lblPickup.innerHTML = 'Pickup Area in Dhaka <span class="req">*</span>';
    if (lblDropoff) lblDropoff.innerHTML = 'Airport Destination <span class="req">*</span>';
    if (flightGrp) flightGrp.style.display = 'none';
  } else if (dir === 'from_airport') {
    if (dirLabel) dirLabel.textContent = 'From Airport (Arrival)';
    if (lblPickup) lblPickup.innerHTML = 'Drop-off Area in Dhaka <span class="req">*</span>';
    if (lblDropoff) lblDropoff.innerHTML = 'Airport Terminal Pickup <span class="req">*</span>';
    if (flightGrp) flightGrp.style.display = 'block';
  } else if (dir === 'round_trip') {
    if (dirLabel) dirLabel.textContent = 'Round Trip (+৳500)';
    if (lblPickup) lblPickup.innerHTML = 'Pickup Area in Dhaka <span class="req">*</span>';
    if (lblDropoff) lblDropoff.innerHTML = 'Airport <span class="req">*</span>';
    if (flightGrp) flightGrp.style.display = 'block';
  }

  const selectVal = document.getElementById('air-pickup-select')?.value;
  onAirportPickupChange(selectVal);
  if (typeof calculateCustomerBookingFare === 'function') calculateCustomerBookingFare();
}

function onAirportPickupChange(val) {
  const sumPick = document.getElementById('sum-pick');
  if (!sumPick) return;
  if (!val) {
    sumPick.textContent = 'Not Set';
    sumPick.classList.add('empty');
    return;
  }
  sumPick.classList.remove('empty');
  if (activeAirportDirection === 'from_airport') {
    sumPick.textContent = \`Airport → \${val}, Dhaka\`;
  } else if (activeAirportDirection === 'round_trip') {
    sumPick.textContent = \`\${val} ⇄ Airport (Round Trip)\`;
  } else {
    sumPick.textContent = \`\${val} → Airport\`;
  }
  if (typeof calculateCustomerBookingFare === 'function') calculateCustomerBookingFare();
}

function onAirportTerminalChange(val) {
  onAirportPickupChange(document.getElementById('air-pickup-select')?.value);
}

function setIntercityTripType(type, el) {
  activeIntercityTripType = type;
  if (el) {
    const parent = el.parentElement;
    parent.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }

  const dirLabel = document.getElementById('sum-dir');
  const nightsGrp = document.getElementById('grp-ic-nights');

  if (type === 'one_way') {
    if (dirLabel) dirLabel.textContent = 'One-Way Highway';
    if (nightsGrp) nightsGrp.style.display = 'none';
  } else if (type === 'same_day') {
    if (dirLabel) dirLabel.textContent = 'Same-Day Return (+50%)';
    if (nightsGrp) nightsGrp.style.display = 'none';
  } else if (type === 'multi_day') {
    if (dirLabel) dirLabel.textContent = 'Multi-Day Round Trip';
    if (nightsGrp) nightsGrp.style.display = 'block';
  }

  onIntercityRouteChanged();
}

function onIntercityRouteChanged() {
  const orig = document.getElementById('ic-origin')?.value || 'Dhaka';
  const dest = document.getElementById('ic-dest')?.value || 'Chittagong';
  const sumPick = document.getElementById('sum-pick');
  if (sumPick) {
    sumPick.classList.remove('empty');
    if (activeIntercityTripType === 'one_way') {
      sumPick.textContent = \`\${orig} → \${dest}\`;
    } else {
      sumPick.textContent = \`\${orig} ⇄ \${dest}\`;
    }
  }
  if (typeof calculateCustomerBookingFare === 'function') calculateCustomerBookingFare();
}

function updateHourlyLocation(val) {
  const sumPick = document.getElementById('sum-pick');
  if (sumPick) {
    if (val && val.trim()) {
      sumPick.textContent = val.trim();
      sumPick.classList.remove('empty');
    } else {
      sumPick.textContent = 'Not Set';
      sumPick.classList.add('empty');
    }
  }
}

function updateCorporateLocation(val) {
  const sumPick = document.getElementById('sum-pick');
  if (sumPick) {
    if (val && val.trim()) {
      sumPick.textContent = \`Corporate: \${val.trim()}\`;
      sumPick.classList.remove('empty');
    } else {
      sumPick.textContent = 'Not Set';
      sumPick.classList.add('empty');
    }
  }
}

function onCustomerPayMethodChange(method) {
  activePaymentMethod = method;
}

function applyCustomerBookingPromo() {
  const input = document.getElementById('cust-booking-promo');
  const statusEl = document.getElementById('cust-promo-status');
  if (!input || !statusEl) return;

  const code = (input.value || '').trim().toUpperCase();
  if (!code) {
    statusEl.style.display = 'block';
    statusEl.style.color = '#ef4444';
    statusEl.textContent = 'Please enter a voucher code.';
    return;
  }

  const VOUCHERS = {
    'ROWNAA20': { type: 'pct', value: 0.20, label: '20% Special Discount' },
    'WELCOME50': { type: 'flat', value: 250, label: '৳250 Welcome Voucher' },
    'AIRPORTVIP': { type: 'flat', value: 300, label: '৳300 Airport VIP Rebate' },
    'EID100': { type: 'flat', value: 500, label: '৳500 Festival Discount' },
    'INTERCITY15': { type: 'pct', value: 0.15, label: '15% Intercity Highway Discount' }
  };

  if (VOUCHERS[code]) {
    activeAppliedVoucher = { code, ...VOUCHERS[code] };
    statusEl.style.display = 'block';
    statusEl.style.color = 'var(--accent)';
    statusEl.textContent = \`✓ Applied: \${activeAppliedVoucher.label}\`;
    input.disabled = true;
    const btn = document.getElementById('btn-apply-cust-promo');
    if (btn) btn.textContent = 'Applied';
  } else {
    activeAppliedVoucher = null;
    statusEl.style.display = 'block';
    statusEl.style.color = '#ef4444';
    statusEl.textContent = 'Invalid promo code. Try ROWNAA20 or WELCOME50.';
  }
  calculateCustomerBookingFare();
}

function toggleSeg(el) {
  const p = el.parentElement;
  p.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  if (typeof calculateCustomerBookingFare === 'function') calculateCustomerBookingFare();
}

function updateDateTime() {
  const activeForm = document.querySelector('.svc-form.active') || document.getElementById('frm-airport');
  if (!activeForm) return;

  const dateInput = activeForm.querySelector('input[type="date"]');
  const timeInput = activeForm.querySelector('input[type="time"]');
  const dateStr = dateInput ? dateInput.value : '';
  const timeStr = timeInput ? timeInput.value : '';
  const el = document.getElementById('sum-dt');
  
  if (el) {
    if (dateStr && timeStr) {
      el.textContent = dateStr + ' at ' + timeStr;
      el.classList.remove('empty');
    } else if (dateStr) {
      el.textContent = dateStr;
      el.classList.remove('empty');
    } else {
      el.textContent = 'Select Date';
      el.classList.add('empty');
    }
  }
  if (typeof calculateCustomerBookingFare === 'function') calculateCustomerBookingFare();
}

function calculateCustomerBookingFare() {
  if (!window.PricingEngine) return;

  let activeSvcId = 'airport';
  document.querySelectorAll('.svc-form').forEach(f => {
    if (f.classList.contains('active')) {
      activeSvcId = f.id.replace('frm-', '');
    }
  });

  const carSelect = document.getElementById('book-car-select');
  const cat = carSelect ? carSelect.value : 'sedan_standard';

  const baseFareEl = document.getElementById('cust-base-fare');
  const discRow = document.getElementById('cust-discount-row');
  const discValEl = document.getElementById('cust-discount-val');
  const vatEl = document.getElementById('cust-vat-val');
  const totalEl = document.getElementById('cust-booking-total');
  const noteEl = document.getElementById('cust-booking-note');
  if (!totalEl) return;

  let baseAmount = 2000;
  let noteText = '';

  if (activeSvcId === 'airport') {
    const pickupVal = document.getElementById('air-pickup-select')?.value || 'Gulshan';
    const isRound = activeAirportDirection === 'round_trip';
    const direction = isRound ? 'Round Trip' : 'Airport Drop-off';
    
    const normZone = window.PricingEngine._normalizeZone(pickupVal);
    const p = window.PricingEngine.calculateAirport(normZone, cat, direction, false);
    if (p) {
      baseAmount = p.total;
      noteText = \`Zone flat fare: ৳\${p.baseFare}\${p.roundTripSurcharge ? ' + Round Trip Surcharge: ৳' + p.roundTripSurcharge : ''} (\${p.freeWaitMinutes}m free wait).\`;
    }
  } else if (activeSvcId === 'hourly') {
    const durVal = document.getElementById('hourly-dur')?.value || '4h';
    const is10h = durVal === '10h';
    
    const p = window.PricingEngine.calculateHourly(cat, is10h, 0, 0);
    if (p) {
      baseAmount = p.total;
      noteText = \`\${p.package} includes \${p.includedDistance}km inside Dhaka Metro. Extra hr: ৳\${p.extraHourCharge || 0}, Extra km: ৳\${p.extraKmCharge || 0}.\`;
    }
  } else if (activeSvcId === 'intercity') {
    const orig = document.getElementById('ic-origin')?.value || 'Dhaka';
    const dest = document.getElementById('ic-dest')?.value || 'Chittagong';
    let dist = 240;
    if (dest.includes('Chittagong')) dist = 250;
    else if (dest.includes('Sylhet')) dist = 240;
    else if (dest.includes('Cox')) dist = 400;
    else if (dest.includes('Rajshahi')) dist = 250;
    else if (dest.includes('Khulna')) dist = 260;
    else if (dest.includes('Bogura')) dist = 210;

    const isSameDay = activeIntercityTripType === 'same_day';
    const isMultiDay = activeIntercityTripType === 'multi_day';
    const nights = isMultiDay ? (parseInt(document.getElementById('ic-nights')?.value, 10) || 1) : 0;

    const p = window.PricingEngine.calculateIntercity(cat, dist, isSameDay, nights);
    if (p) {
      baseAmount = p.total;
      noteText = \`Base Fare: ৳\${p.baseFare} + Road Distance (\${dist}km × ৳\${p.perKm}/km)\${p.sameDayReturnSurcharge ? ' + Same-Day 50% Surcharge' : ''}\${p.waitingNightsCharge ? ' + Waiting (' + nights + 'n × ৳2000)' : ''}.\`;
    }
  } else if (activeSvcId === 'corporate') {
    const days = parseInt(document.getElementById('corp-contract')?.value, 10) || 1;
    const p = window.PricingEngine.calculateCorporate(cat, days);
    if (p) {
      baseAmount = p.total;
      noteText = \`Fixed Daily Rate: ৳\${p.dailyRate}/day for \${days} day(s) contract. Fuel, maintenance & driver included.\`;
    }
  }

  // Calculate Voucher Discount
  let discountAmount = 0;
  if (activeAppliedVoucher) {
    if (activeAppliedVoucher.type === 'pct') {
      discountAmount = Math.round(baseAmount * activeAppliedVoucher.value);
    } else {
      discountAmount = Math.min(baseAmount, activeAppliedVoucher.value);
    }
  }

  const subtotalAfterDiscount = Math.max(0, baseAmount - discountAmount);
  const vat = Math.round(subtotalAfterDiscount * 0.05);
  const finalTotal = subtotalAfterDiscount + vat;

  if (baseFareEl) baseFareEl.textContent = \`৳ \${baseAmount.toLocaleString()}\`;
  if (discRow && discValEl) {
    if (discountAmount > 0) {
      discRow.style.display = 'flex';
      discValEl.textContent = \`-৳ \${discountAmount.toLocaleString()}\`;
    } else {
      discRow.style.display = 'none';
    }
  }
  if (vatEl) vatEl.textContent = \`৳ \${vat.toLocaleString()}\`;
  if (totalEl) totalEl.textContent = \`৳ \${finalTotal.toLocaleString()}\`;
  if (noteEl) noteEl.textContent = noteText;
}

function submitForm(btn) {
  if (btn.disabled) return;
  const orig = btn.innerHTML;
  
  // Figure out active service
  let activeSvcId = 'airport';
  document.querySelectorAll('.svc-form').forEach(f => {
    if (f.classList.contains('active')) {
      activeSvcId = f.id.replace('frm-', '');
    }
  });

  let pickup = '';
  let dropoff = '';
  let dt = '';

  const parent = document.getElementById('frm-' + activeSvcId);
  if (!parent) return;

  const dateInput = parent.querySelector('input[type="date"]');
  const timeInput = parent.querySelector('input[type="time"]');
  const dateVal = dateInput ? dateInput.value : '';
  const timeVal = (timeInput && timeInput.value) ? timeInput.value : '09:00';
  
  if (!dateVal) {
    alert("Please select a trip date.");
    if (dateInput) dateInput.focus();
    return;
  }

  // Validate Past Date Booking
  const tripDateTime = new Date(\`\${dateVal}T\${timeVal}\`);
  if (!isNaN(tripDateTime.getTime())) {
    const minAllowed = new Date(Date.now() - 300000); // 5 min grace
    if (tripDateTime < minAllowed) {
      alert("Invalid travel schedule: Selected pickup date and time is in the past. Please choose a future schedule.");
      if (dateInput) dateInput.focus();
      return;
    }
  }

  dt = \`\${dateVal} \${timeVal}\`;
  
  if (activeSvcId === 'airport') {
    const area = document.getElementById('air-pickup-select')?.value || 'Gulshan';
    const airport = document.getElementById('air-airport-select')?.value || 'Hazrat Shahjalal (DAC)';
    const flight = document.getElementById('air-flight-no')?.value?.trim();
    if (activeAirportDirection === 'from_airport') {
      pickup = \`\${airport}\${flight ? ' (Flight: ' + flight + ')' : ''}\`;
      dropoff = \`\${area}, Dhaka\`;
    } else if (activeAirportDirection === 'round_trip') {
      pickup = \`\${area}, Dhaka\`;
      dropoff = \`\${airport} (Round Trip)\`;
    } else {
      pickup = \`\${area}, Dhaka\`;
      dropoff = airport;
    }
  } else if (activeSvcId === 'corporate') {
    const comp = document.getElementById('corp-company')?.value?.trim() || 'Corporate Client';
    const days = document.getElementById('corp-contract')?.value || '1';
    pickup = \`Corporate HQ: \${comp}\`;
    dropoff = \`Dedicated Fleet (\${days} Days Contract)\`;
  } else if (activeSvcId === 'intercity') {
    const orig = document.getElementById('ic-origin')?.value || 'Dhaka';
    const dest = document.getElementById('ic-dest')?.value || 'Chittagong';
    pickup = \`\${orig} City Terminal\`;
    dropoff = \`\${dest} City Terminal (\${activeIntercityTripType})\`;
  } else if (activeSvcId === 'hourly') {
    const addr = document.getElementById('hourly-pickup')?.value?.trim() || 'Dhaka Metro';
    const dur = document.getElementById('hourly-dur')?.value || '4h';
    pickup = addr;
    dropoff = \`Hourly Rental (\${dur === '10h' ? '10h Full Day' : '4h Standard'})\`;
  }
  
  const currentUser = (window.AppState && window.AppState.user) || window.rownaaSession;
  const customerName = document.getElementById('book-rider-name')?.value.trim() || currentUser?.name || 'Customer';
  const customerPhone = document.getElementById('book-rider-phone')?.value.trim() || currentUser?.phone || '';

  // Validate Bangladesh Phone Number Regex
  const bdPhoneRegex = /^(?:\\+?880|0)?1[3-9]\\d{8}$/;
  if (!customerPhone || !bdPhoneRegex.test(customerPhone.replace(/[\\s-]/g, ''))) {
    alert("Please enter a valid Bangladesh contact phone number (e.g. +8801711000000 or 01711000000).");
    const phoneInput = document.getElementById('book-rider-phone');
    if (phoneInput) phoneInput.focus();
    return;
  }

  const vehicle = document.getElementById('sum-car')?.textContent || 'Standard Sedan';
  const price = document.getElementById('cust-booking-total')?.textContent || '৳ 2,100';

  const customerId = currentUser?.id || currentUser?.userId || ('cust-' + Date.now());

  const payload = {
    customerId: customerId,
    customerName,
    customerPhone,
    service: activeSvcId,
    pickupLocation: pickup,
    dropoffLocation: dropoff,
    dateTime: dt,
    vehicle: vehicle,
    price: price,
    paymentMethod: activePaymentMethod,
    voucherCode: activeAppliedVoucher ? activeAppliedVoucher.code : null,
    ownerId: 'fleet-rownaa-official'
  };

  btn.disabled = true;
  btn.innerHTML = \`<i class="ph ph-spinner" style="animation:spin 1s linear infinite"></i> Processing...\`;
  
  window.BookingsManager.add(payload).then((success) => {
    if (success) {
      btn.style.background = 'var(--success)';
      btn.style.color = '#fff';
      btn.innerHTML = \`<i class="ph ph-check-circle"></i> Booking Confirmed\`;
      
      setTimeout(() => {
        if (typeof renderTrips === 'function') renderTrips();
        switchTab('trips');
        btn.disabled = false;
        btn.style.background = '';
        btn.style.color = '';
        btn.innerHTML = orig;
      }, 1500);
    } else {
      alert("Booking failed. Try again.");
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });
}`;

if (content.includes(oldLogicBlock)) {
  content = content.replace(oldLogicBlock, newLogicBlock);
  console.log('✓ 12. Full reactive logic, pricing engine integration, voucher, and validation replaced');
} else {
  console.log('⚠ 12. Old logic block did not match');
}

// ============================================================================
// 7. REMOVE DUPLICATE SCRIPT TAGS AT LINE 1231
// ============================================================================
const oldDuplicateScripts = `</script>
<script src="js/bookings.js"></script>
<script src="js/inventory.js"></script>
<script src="js/auth.js"></script>
<script src="js/notifications.js"></script>
<script src="js/reviews.js"></script>
<script>`;

const newConsolidatedScripts = `// Global Exports
window.setAirportDirection = setAirportDirection;
window.onAirportPickupChange = onAirportPickupChange;
window.onAirportTerminalChange = onAirportTerminalChange;
window.setIntercityTripType = setIntercityTripType;
window.onIntercityRouteChanged = onIntercityRouteChanged;
window.updateHourlyLocation = updateHourlyLocation;
window.updateCorporateLocation = updateCorporateLocation;
window.onCustomerPayMethodChange = onCustomerPayMethodChange;
window.applyCustomerBookingPromo = applyCustomerBookingPromo;
`;

if (content.includes(oldDuplicateScripts)) {
  content = content.replace(oldDuplicateScripts, newConsolidatedScripts);
  console.log('✓ 13. Removed duplicate script tags in footer');
} else {
  console.log('⚠ 13. Old duplicate script tags did not match');
}

// ============================================================================
// 8. UPDATE DOMCONTENTLOADED HYDRATION & STATS (AVG RATING DYNAMIC)
// ============================================================================
const oldDomLoaded = `    // Dynamically calculate and display real stats on the dashboard
    if (window.BookingsManager) {
      const uid = window.AppState?.user?.id || customerState.trips.customerId || 'cust-1';
      const allBooks = (await window.BookingsManager.getAll()).filter(b => b.customerId === uid);
      const totalTrips = allBooks.length;
      const upcoming = allBooks.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
      let totalSpend = 0;
      allBooks.forEach(b => {
        const val = parseInt((b.price || '0').replace(/[^0-9]/g, '')) || 0;
        totalSpend += val;
      });

      const statVals = document.querySelectorAll('.stat-val');
      if (statVals.length >= 3) {
        statVals[0].textContent = totalTrips;
        statVals[1].textContent = upcoming;
        statVals[2].textContent = totalSpend >= 1000 ? \`৳ \${(totalSpend/1000).toFixed(1)}K\` : \`৳ \${totalSpend}\`;
      }
    }`;

const newDomLoaded = `    // Dynamically calculate and display real stats on the dashboard
    if (window.BookingsManager) {
      const uid = window.AppState?.user?.id || window.AppState?.user?.userId || customerState.trips.customerId;
      const allBooks = uid ? (await window.BookingsManager.getAll()).filter(b => b.customerId === uid) : [];
      const totalTrips = allBooks.length;
      const upcoming = allBooks.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
      let totalSpend = 0;
      allBooks.forEach(b => {
        const val = parseInt((b.price || '0').replace(/[^0-9]/g, '')) || 0;
        totalSpend += val;
      });

      // Calculate dynamic average rating given
      let avgRatingStr = '5.0';
      if (window.ReviewsManager && typeof window.ReviewsManager.getAll === 'function') {
        const userReviews = (await window.ReviewsManager.getAll()).filter(r => r.customerId === uid);
        if (userReviews.length > 0) {
          const sum = userReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
          avgRatingStr = (sum / userReviews.length).toFixed(1);
        }
      }

      const statVals = document.querySelectorAll('.stat-val');
      if (statVals.length >= 4) {
        statVals[0].textContent = totalTrips;
        statVals[1].textContent = upcoming;
        statVals[2].textContent = totalSpend >= 1000 ? \`৳ \${(totalSpend/1000).toFixed(1)}K\` : \`৳ \${totalSpend}\`;
        statVals[3].textContent = avgRatingStr;
      }
    }`;

if (content.includes(oldDomLoaded)) {
  content = content.replace(oldDomLoaded, newDomLoaded);
  console.log('✓ 14. Average rating stat dynamically calculated from ReviewsManager');
} else {
  console.log('⚠ 14. Old dom loaded did not match');
}

// Profile hydration helper
const oldUserHydrate = `    if (window.AppState?.user) {
      const u = window.AppState.user;
      if (document.getElementById('cust-profile-name')) document.getElementById('cust-profile-name').value = u.name || '';
      if (document.getElementById('cust-profile-username')) document.getElementById('cust-profile-username').value = u.username || u.name || '';
      if (document.getElementById('cust-profile-phone') && u.phone) document.getElementById('cust-profile-phone').value = u.phone;
      if (document.getElementById('book-rider-name')) document.getElementById('book-rider-name').value = u.name || '';
      if (document.getElementById('book-rider-phone') && u.phone) document.getElementById('book-rider-phone').value = u.phone;
      const nameDisplay = document.querySelector('.user-name');
      if (nameDisplay && u.name) nameDisplay.textContent = u.name;
      const avatarEl = document.querySelector('.avatar');
      if (avatarEl && u.name) {
        const initials = u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }
      const welcomeEl = document.querySelector('.ph-title');
      if (welcomeEl && u.name) welcomeEl.textContent = \`Welcome back, \${u.name.split(' ')[0]}.\`;
    }`;

const newUserHydrate = `    const u = (window.AppState && window.AppState.user) || window.rownaaSession;
    if (u) {
      if (document.getElementById('cust-profile-name')) document.getElementById('cust-profile-name').value = u.name || '';
      if (document.getElementById('cust-profile-username')) document.getElementById('cust-profile-username').value = u.username || u.name || '';
      if (document.getElementById('cust-profile-phone') && u.phone) document.getElementById('cust-profile-phone').value = u.phone;
      if (document.getElementById('book-rider-name')) document.getElementById('book-rider-name').value = u.name || '';
      if (document.getElementById('book-rider-phone') && u.phone) document.getElementById('book-rider-phone').value = u.phone;
      const nameDisplay = document.getElementById('user-sidebar-name') || document.querySelector('.user-name');
      if (nameDisplay && u.name) nameDisplay.textContent = u.name;
      const avatarEl = document.getElementById('user-avatar-initials') || document.querySelector('.avatar');
      if (avatarEl && u.name) {
        const initials = u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
        avatarEl.textContent = initials;
      }
      const welcomeEl = document.getElementById('user-welcome-heading') || document.querySelector('.ph-title');
      if (welcomeEl && u.name) welcomeEl.textContent = \`Welcome back, \${u.name.split(' ')[0]}.\`;
      customerState.trips.customerId = u.id || u.userId || '';
    }`;

if (content.includes(oldUserHydrate)) {
  content = content.replace(oldUserHydrate, newUserHydrate);
  console.log('✓ 15. Dynamic user profile hydration updated');
} else {
  console.log('⚠ 15. Old user hydration did not match');
}

// Eliminate remaining 'cust-1' fallbacks
content = content.replace(/customerState\.trips\.customerId \|\| 'cust-1'/g, "customerState.trips.customerId || ''");
content = content.replace(/uid \|\| 'cust-1'/g, "uid || ''");
content = content.replace(/if \(!customerState\.trips\.customerId\) customerState\.trips\.customerId = 'cust-1';/g, "// customerId set from session");

fs.writeFileSync(targetFile, content, 'utf8');
console.log('\nCustomer Panel Patch Completed Successfully!');

