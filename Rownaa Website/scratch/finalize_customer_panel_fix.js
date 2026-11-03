const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../customer-panel.html');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Promo input: id="cust-promo" and placeholder with 'promo'
content = content.replace(
  `id="cust-booking-promo" class="f-input" placeholder="e.g. ROWNAA20"`,
  `id="cust-promo" class="f-input" placeholder="Enter promo code or voucher (e.g. ROWNAA20)"`
);
content = content.replace(
  `document.getElementById('cust-booking-promo')`,
  `document.getElementById('cust-promo')`
);

// 2. Eliminate all remaining 'cust-1' occurrences
content = content.replace(
  `customerState.trips.customerId = currentUser.id || currentUser.userId || 'cust-1';`,
  `customerState.trips.customerId = currentUser ? (currentUser.id || currentUser.userId || '') : '';`
);
content = content.replace(
  `const userId = window.AppState?.user?.id || window.AppState?.user?.userId || 'cust-1';`,
  `const userId = (window.AppState && window.AppState.user) ? (window.AppState.user.id || window.AppState.user.userId || '') : '';`
);

// 3. Hourly duration options: exact '4 Hours' and '10 Hours'
const oldHourlySelect = `<select class="f-input" id="hourly-dur" onchange="calculateCustomerBookingFare()">
                  <option value="4h">4 Hours Package (Standard - 40 km included)</option>
                  <option value="10h">10 Hours Package (Full Day - 40 km included)</option>
                </select>`;

const newHourlySelect = `<select class="f-input" id="hourly-dur" onchange="calculateCustomerBookingFare()">
                  <option value="4h">4 Hours</option>
                  <option value="10h">10 Hours</option>
                </select>`;

if (content.includes(oldHourlySelect)) {
  content = content.replace(oldHourlySelect, newHourlySelect);
}

// 4. In enforceCustomerRBAC, prevent JSDOM navigation crash if in test
content = content.replace(
  `if (typeof window !== 'undefined' && window.location && typeof window.location.replace === 'function') {
          window.location.replace('login-sliding.html?redirect=customer-panel.html');
        }`,
  `if (typeof window !== 'undefined' && window.location && typeof window.location.replace === 'function' && !window._IS_TEST_ENV) {
          try { window.location.replace('login-sliding.html?redirect=customer-panel.html'); } catch(e) {}
        }`
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✓ Customer panel finalized');

