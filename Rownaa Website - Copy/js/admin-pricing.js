// =========================================================
// ADMIN PRICING LOGIC
// Connects UI to localStorage
// =========================================================

function switchPricingTab(tabId, el) {
  // Update active tab styling
  document.querySelectorAll('#pricing-tabs .pt-item').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  
  // Update section visibility
  document.querySelectorAll('.pricing-sec').forEach(s => s.style.display = 'none');
  document.getElementById('pricing-' + tabId).style.display = 'block';
}

async function renderPricingAdmin() {
  const config = await getPricingConfig();
  if (!config) return;
  
  // 1. Render Hourly
  const tBodyHourly = document.getElementById('tb-hourly');
  if (tBodyHourly) {
    tBodyHourly.innerHTML = config.hourly.categories.map(c => `
      <tr>
        <td>${c.name}</td>
        <td><input type="number" class="f-input" data-cat="${c.id}" data-field="rate4h" value="${c.rate4h}" style="width:100px"></td>
        <td><input type="number" class="f-input" data-cat="${c.id}" data-field="rate10h" value="${c.rate10h}" style="width:100px"></td>
        <td><input type="number" class="f-input" data-cat="${c.id}" data-field="extraHour" value="${c.extraHour}" style="width:100px"></td>
        <td><input type="number" class="f-input" data-cat="${c.id}" data-field="extraKm" value="${c.extraKm}" style="width:100px"></td>
        <td><div class="toggle-switch ${c.active ? 'on' : ''}" onclick="toggleCat('hourly', '${c.id}', this)"></div></td>
      </tr>
    `).join('');
  }

  // 2. Render Intercity
  const tBodyIntercity = document.getElementById('tb-intercity');
  if (tBodyIntercity) {
    tBodyIntercity.innerHTML = config.intercity.tiers.map(t => `
      <tr>
        <td>${t.name}</td>
        <td><input type="number" class="f-input" data-tier="${t.id}" data-field="baseFare" value="${t.baseFare}" style="width:120px"></td>
        <td><input type="number" class="f-input" data-tier="${t.id}" data-field="perKm" value="${t.perKm}" style="width:100px"></td>
        <td><div class="toggle-switch ${t.active ? 'on' : ''}" onclick="toggleTier('${t.id}', this)"></div></td>
      </tr>
    `).join('');
    
    document.getElementById('tb-intercity-globals').innerHTML = `
      <div class="ig-item">
        <span class="ig-lbl">Extra KM Rate (Tk)</span>
        <input type="number" class="f-input" id="ic-extrakm" value="${config.intercity.extraKmRate}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Same-Day Return Charge (%)</span>
        <input type="number" class="f-input" id="ic-sameday" value="${config.intercity.sameDayReturnChargePercent}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Max Same-Day Distance (km)</span>
        <input type="number" class="f-input" id="ic-maxdist" value="${config.intercity.maxSameDayDistance}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Daily Waiting Charge (Tk)</span>
        <input type="number" class="f-input" id="ic-wait" value="${config.intercity.dailyWaitingCharge}">
      </div>
    `;
  }

  // 3. Render Corporate
  const tBodyCorporate = document.getElementById('tb-corporate');
  if (tBodyCorporate) {
    document.getElementById('tb-corporate-globals').innerHTML = `
      <div class="ig-item">
        <span class="ig-lbl">Max Direct Booking (Days)</span>
        <input type="number" class="f-input" id="corp-max-days" value="${config.corporate.maxBookingDays}">
      </div>
    `;

    const cats = Object.keys(config.corporate.rates);
    tBodyCorporate.innerHTML = cats.map(cat => {
      const vals = config.corporate.rates[cat];
      return `
        <tr>
          <td>${cat.replace('_', ' ').toUpperCase()}</td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="0" value="${vals[0]}" style="width:120px"></td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="1" value="${vals[1]}" style="width:120px"></td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="2" value="${vals[2]}" style="width:120px"></td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="3" value="${vals[3]}" style="width:120px"></td>
        </tr>
      `;
    }).join('');
  }

  // 4. Render Airport
  const tBodyAirport = document.getElementById('tb-airport');
  if (tBodyAirport) {
    tBodyAirport.innerHTML = config.airport.zones.map(z => {
      return `
        <tr>
          <td>${z.name}</td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="sedan_economy" value="${z.rates.sedan_economy}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="sedan_standard" value="${z.rates.sedan_standard}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="sedan_premium" value="${z.rates.sedan_premium}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="noah" value="${z.rates.noah}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="hiace" value="${z.rates.hiace}" style="width:90px"></td>
        </tr>
      `;
    }).join('');
    
    document.getElementById('tb-airport-surcharges').innerHTML = `
      <div class="ig-item">
        <span class="ig-lbl">Free Wait (Send-off) (mins)</span>
        <input type="number" class="f-input" id="air-free-send" value="${config.airport.freeWaitSendOff}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Free Wait (Dom Receive) (mins)</span>
        <input type="number" class="f-input" id="air-free-dom" value="${config.airport.freeWaitReceiveDom}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Free Wait (Int Receive) (mins)</span>
        <input type="number" class="f-input" id="air-free-int" value="${config.airport.freeWaitReceiveInt}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Hourly Wait Charge (Tk)</span>
        <input type="number" class="f-input" id="air-wait" value="${config.airport.hourlyWaitCharge}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Round Trip Surcharge (Tk)</span>
        <input type="number" class="f-input" id="air-round" value="${config.airport.roundTripSurcharge}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Late Night Surcharge (Tk)</span>
        <input type="number" class="f-input" id="air-late" value="${config.airport.lateNightSurcharge}">
      </div>
    `;
  }

  // 5. Render Tour
  const tBodyTour = document.getElementById('tb-tour');
  if (tBodyTour) {
    tBodyTour.innerHTML = config.tour.routes.map(r => {
      return `
        <tr>
          <td><input type="text" class="f-input" data-route="${r.id}" data-field="name" value="${r.name}"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-field="days" value="${r.days}" style="width:70px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="sedan_economy" value="${r.rates.sedan_economy}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="sedan_standard" value="${r.rates.sedan_standard}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="sedan_premium" value="${r.rates.sedan_premium}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="noah" value="${r.rates.noah}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="hiace" value="${r.rates.hiace}" style="width:90px"></td>
        </tr>
      `;
    }).join('');
  }
}

async function toggleCat(type, id, el) {
  const config = await getPricingConfig();
  if (type === 'hourly') {
    const cat = config.hourly.categories.find(c => c.id === id);
    if (cat) cat.active = !cat.active;
  }
  await savePricingConfig(config);
  el.classList.toggle('on');
}

async function toggleTier(id, el) {
  const config = await getPricingConfig();
  const tier = config.intercity.tiers.find(t => t.id === id);
  if (tier) tier.active = !tier.active;
  await savePricingConfig(config);
  el.classList.toggle('on');
}

async function saveHourlyRates() {
  const config = await getPricingConfig();
  document.querySelectorAll('#tb-hourly input').forEach(inp => {
    const cat = config.hourly.categories.find(c => c.id === inp.dataset.cat);
    if (cat) {
      cat[inp.dataset.field] = Math.max(0, parseFloat(inp.value) || 0);
    }
  });
  await savePricingConfig(config);
  alert("Hourly Rates Saved Successfully!");
}

async function saveIntercityRates() {
  const config = await getPricingConfig();
  document.querySelectorAll('#tb-intercity input').forEach(inp => {
    const tier = config.intercity.tiers.find(t => t.id === inp.dataset.tier);
    if (tier) {
      tier[inp.dataset.field] = Math.max(0, parseFloat(inp.value) || 0);
    }
  });
  
  config.intercity.extraKmRate = Math.max(0, parseFloat(document.getElementById('ic-extrakm').value) || 0);
  config.intercity.sameDayReturnChargePercent = Math.max(0, parseFloat(document.getElementById('ic-sameday').value) || 0);
  config.intercity.maxSameDayDistance = Math.max(0, parseFloat(document.getElementById('ic-maxdist').value) || 0);
  config.intercity.dailyWaitingCharge = Math.max(0, parseFloat(document.getElementById('ic-wait').value) || 0);
  
  await savePricingConfig(config);
  alert("Intercity Rates Saved Successfully!");
}

async function saveCorporateRates() {
  const config = await getPricingConfig();
  document.querySelectorAll('#tb-corporate input').forEach(inp => {
    const cat = inp.dataset.cat;
    const idx = parseInt(inp.dataset.idx);
    if (config.corporate.rates[cat]) {
      config.corporate.rates[cat][idx] = Math.max(0, parseFloat(inp.value) || 0);
    }
  });

  config.corporate.maxBookingDays = Math.max(1, parseInt(document.getElementById('corp-max-days').value) || 30);

  await savePricingConfig(config);
  alert("Corporate Rates Saved Successfully!");
}

async function saveAirportRates() {
  const config = await getPricingConfig();
  document.querySelectorAll('#tb-airport input').forEach(inp => {
    const zone = config.airport.zones.find(z => z.id === inp.dataset.zone);
    if (zone) {
      zone.rates[inp.dataset.cat] = Math.max(0, parseFloat(inp.value) || 0);
    }
  });
  
  config.airport.freeWaitSendOff = Math.max(0, parseFloat(document.getElementById('air-free-send').value) || 0);
  config.airport.freeWaitReceiveDom = Math.max(0, parseFloat(document.getElementById('air-free-dom').value) || 0);
  config.airport.freeWaitReceiveInt = Math.max(0, parseFloat(document.getElementById('air-free-int').value) || 0);
  config.airport.hourlyWaitCharge = Math.max(0, parseFloat(document.getElementById('air-wait').value) || 0);
  config.airport.roundTripSurcharge = Math.max(0, parseFloat(document.getElementById('air-round').value) || 0);
  config.airport.lateNightSurcharge = Math.max(0, parseFloat(document.getElementById('air-late').value) || 0);

  await savePricingConfig(config);
  alert("Airport Rates Saved Successfully!");
}

async function saveTourRates() {
  const config = await getPricingConfig();
  document.querySelectorAll('#tb-tour tr').forEach(tr => {
    const inputs = tr.querySelectorAll('input');
    if (inputs.length > 0) {
      const routeId = inputs[0].dataset.route;
      const route = config.tour.routes.find(r => r.id === routeId);
      if (route) {
        inputs.forEach(inp => {
          if (inp.dataset.field === 'name') route.name = inp.value;
          else if (inp.dataset.field === 'days') route.days = Math.max(1, parseInt(inp.value) || 1);
          else if (inp.dataset.cat) route.rates[inp.dataset.cat] = Math.max(0, parseFloat(inp.value) || 0);
        });
      }
    }
  });
  await savePricingConfig(config);
  alert("Tour Packages Saved Successfully!");
}

async function addTourRoute() {
  const config = await getPricingConfig();
  const newId = 'route_' + Date.now();
  config.tour.routes.push({
    id: newId,
    name: 'New Custom Route',
    days: 1,
    rates: { sedan_economy: 0, sedan_standard: 0, sedan_premium: 0, noah: 0, hiace: 0 }
  });
  await savePricingConfig(config);
  renderPricingAdmin(); // re-render to show new row
}

window.switchPricingTab = switchPricingTab;
window.renderPricingAdmin = renderPricingAdmin;
window.toggleCat = toggleCat;
window.toggleTier = toggleTier;
window.saveHourlyRates = saveHourlyRates;
window.saveIntercityRates = saveIntercityRates;
window.saveCorporateRates = saveCorporateRates;
window.saveAirportRates = saveAirportRates;
window.saveTourRates = saveTourRates;
window.addTourRoute = addTourRoute;

document.addEventListener('DOMContentLoaded', () => {
  renderPricingAdmin();
});
