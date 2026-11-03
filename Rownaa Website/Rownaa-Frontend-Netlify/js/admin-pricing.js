// =========================================================
// ADMIN PRICING LOGIC (Aligned with Rownaa Complete Pricing Specification)
// Live admin configuration with instant persistence & multi-page sync
// =========================================================

function switchPricingTab(tabId, el) {
  document.querySelectorAll('#pricing-tabs .pt-item').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  
  document.querySelectorAll('.pricing-sec').forEach(s => s.style.display = 'none');
  const target = document.getElementById('pricing-' + tabId);
  if (target) target.style.display = 'block';
}

async function renderPricingAdmin() {
  const config = await getPricingConfig();
  if (!config) return;
  
  // 1. Render Hourly
  const tBodyHourlyGlobals = document.getElementById('tb-hourly-globals');
  if (tBodyHourlyGlobals) {
    tBodyHourlyGlobals.innerHTML = `
      <div class="ig-item">
        <span class="ig-lbl">Included Package Distance (KM)</span>
        <input type="number" class="f-input" id="hourly-inc-dist" value="${config.hourly.includedDistance || 40}">
      </div>
      <div class="ig-item">
        <span class="ig-lbl">Rounding Policy</span>
        <input type="text" class="f-input" value="Round up to nearest hour" disabled style="opacity:0.75">
      </div>
    `;
  }

  const tBodyHourly = document.getElementById('tb-hourly');
  if (tBodyHourly && config.hourly?.categories) {
    tBodyHourly.innerHTML = config.hourly.categories.map(c => `
      <tr>
        <td style="font-weight:600">${c.name}</td>
        <td><span class="badge" style="background:rgba(255,255,255,0.08);padding:4px 8px;border-radius:4px">${c.seats || 4} seats</span></td>
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
  if (tBodyIntercity && config.intercity?.tiers) {
    tBodyIntercity.innerHTML = config.intercity.tiers.map(t => `
      <tr>
        <td style="font-weight:600">${t.name}</td>
        <td><input type="number" class="f-input" data-tier="${t.id}" data-field="baseFare" value="${t.baseFare}" style="width:120px"></td>
        <td><input type="number" class="f-input" data-tier="${t.id}" data-field="perKm" value="${t.perKm}" style="width:100px"></td>
        <td><div class="toggle-switch ${t.active ? 'on' : ''}" onclick="toggleTier('${t.id}', this)"></div></td>
      </tr>
    `).join('');
    
    const interGlobals = document.getElementById('tb-intercity-globals');
    if (interGlobals) {
      interGlobals.innerHTML = `
        <div class="ig-item">
          <span class="ig-lbl">Extra KM Rate (Tk/km)</span>
          <input type="number" class="f-input" id="ic-extrakm" value="${config.intercity.extraKmRate || 40}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Same-Day Return Surcharge (%)</span>
          <input type="number" class="f-input" id="ic-sameday" value="${config.intercity.sameDayReturnChargePercent || 50}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Max Same-Day Distance (km, one-way)</span>
          <input type="number" class="f-input" id="ic-maxdist" value="${config.intercity.maxSameDayDistance || 250}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Daily Waiting Charge (Tk/night)</span>
          <input type="number" class="f-input" id="ic-wait" value="${config.intercity.dailyWaitingCharge || 2000}">
        </div>
      `;
    }
  }

  // 3. Render Corporate (Fixed Daily Rate Model)
  const tBodyCorporate = document.getElementById('tb-corporate');
  if (tBodyCorporate && config.corporate?.rates) {
    const corpGlobals = document.getElementById('tb-corporate-globals');
    if (corpGlobals) {
      corpGlobals.innerHTML = `
        <div class="ig-item">
          <span class="ig-lbl">Max Direct Booking Allowed (Days)</span>
          <input type="number" class="f-input" id="corp-max-days" value="${config.corporate.maxBookingDays || 30}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Model Type</span>
          <input type="text" class="f-input" value="Fixed Daily Rate Model (Admin Set)" disabled style="opacity:0.75">
        </div>
      `;
    }

    const cats = Object.keys(config.corporate.rates);
    tBodyCorporate.innerHTML = cats.map(cat => {
      const vals = config.corporate.rates[cat];
      const catLabel = cat.replace(/_/g, ' ').toUpperCase();
      return `
        <tr>
          <td style="font-weight:600">${catLabel}</td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="0" value="${vals[0]}" style="width:120px"></td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="1" value="${vals[1]}" style="width:120px"></td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="2" value="${vals[2]}" style="width:120px"></td>
          <td><input type="number" class="f-input" data-cat="${cat}" data-idx="3" value="${vals[3]}" style="width:120px"></td>
        </tr>
      `;
    }).join('');
  }

  // 4. Render Airport (8 Distance Zones)
  const tBodyAirport = document.getElementById('tb-airport');
  if (tBodyAirport && config.airport?.zones) {
    tBodyAirport.innerHTML = config.airport.zones.map(z => {
      return `
        <tr>
          <td style="font-weight:600;font-size:0.85rem">${z.name}</td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="sedan_economy" value="${z.rates.sedan_economy || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="sedan_standard" value="${z.rates.sedan_standard || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="sedan_premium" value="${z.rates.sedan_premium || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="noah" value="${z.rates.noah || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-zone="${z.id}" data-cat="hiace" value="${z.rates.hiace || 0}" style="width:90px"></td>
        </tr>
      `;
    }).join('');
    
    const airSurcharges = document.getElementById('tb-airport-surcharges');
    if (airSurcharges) {
      airSurcharges.innerHTML = `
        <div class="ig-item">
          <span class="ig-lbl">Free Wait (Send-off) (mins)</span>
          <input type="number" class="f-input" id="air-free-send" value="${config.airport.freeWaitSendOff || 30}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Free Wait (Dom Receive) (mins)</span>
          <input type="number" class="f-input" id="air-free-dom" value="${config.airport.freeWaitReceiveDom || 30}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Free Wait (Intl Receive) (mins)</span>
          <input type="number" class="f-input" id="air-free-int" value="${config.airport.freeWaitReceiveInt || 60}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Hourly Wait Charge (Tk/hr)</span>
          <input type="number" class="f-input" id="air-wait" value="${config.airport.hourlyWaitCharge || 150}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Round Trip Surcharge (Tk)</span>
          <input type="number" class="f-input" id="air-round" value="${config.airport.roundTripSurcharge || 500}">
        </div>
        <div class="ig-item">
          <span class="ig-lbl">Late Night Surcharge (1AM-5AM) (Tk)</span>
          <input type="number" class="f-input" id="air-late" value="${config.airport.lateNightSurcharge || 300}">
        </div>
      `;
    }
  }

  // 5. Render Tour
  const tBodyTour = document.getElementById('tb-tour');
  if (tBodyTour && config.tour?.routes) {
    tBodyTour.innerHTML = config.tour.routes.map(r => {
      return `
        <tr>
          <td><input type="text" class="f-input" data-route="${r.id}" data-field="name" value="${r.name}" style="min-width:220px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-field="days" value="${r.days}" style="width:70px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="sedan_economy" value="${r.rates.sedan_economy || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="sedan_standard" value="${r.rates.sedan_standard || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="sedan_premium" value="${r.rates.sedan_premium || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="noah" value="${r.rates.noah || 0}" style="width:90px"></td>
          <td><input type="number" class="f-input" data-route="${r.id}" data-cat="hiace" value="${r.rates.hiace || 0}" style="width:90px"></td>
        </tr>
      `;
    }).join('');
  }
}

async function toggleCat(type, id, el) {
  const config = await getPricingConfig();
  if (type === 'hourly' && config.hourly?.categories) {
    const cat = config.hourly.categories.find(c => c.id === id);
    if (cat) cat.active = !cat.active;
  }
  await savePricingConfig(config);
  el.classList.toggle('on');
}

async function toggleTier(id, el) {
  const config = await getPricingConfig();
  if (config.intercity?.tiers) {
    const tier = config.intercity.tiers.find(t => t.id === id);
    if (tier) tier.active = !tier.active;
  }
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

  const distInput = document.getElementById('hourly-inc-dist');
  if (distInput) {
    config.hourly.includedDistance = Math.max(0, parseFloat(distInput.value) || 40);
  }

  await savePricingConfig(config);
  alert("Hourly Rental Rates & Included Distance Saved Successfully!");
}

async function saveIntercityRates() {
  const config = await getPricingConfig();
  document.querySelectorAll('#tb-intercity input').forEach(inp => {
    const tier = config.intercity.tiers.find(t => t.id === inp.dataset.tier);
    if (tier) {
      tier[inp.dataset.field] = Math.max(0, parseFloat(inp.value) || 0);
    }
  });
  
  config.intercity.extraKmRate = Math.max(0, parseFloat(document.getElementById('ic-extrakm')?.value) || 40);
  config.intercity.sameDayReturnChargePercent = Math.max(0, parseFloat(document.getElementById('ic-sameday')?.value) || 50);
  config.intercity.maxSameDayDistance = Math.max(0, parseFloat(document.getElementById('ic-maxdist')?.value) || 250);
  config.intercity.dailyWaitingCharge = Math.max(0, parseFloat(document.getElementById('ic-wait')?.value) || 2000);
  
  await savePricingConfig(config);
  alert("Intercity Rates & Variables Saved Successfully!");
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

  config.corporate.maxBookingDays = Math.max(1, parseInt(document.getElementById('corp-max-days')?.value) || 30);

  await savePricingConfig(config);
  alert("Corporate Fixed Daily Rates Saved Successfully!");
}

async function saveAirportRates() {
  const config = await getPricingConfig();
  document.querySelectorAll('#tb-airport input').forEach(inp => {
    const zone = config.airport.zones.find(z => z.id === inp.dataset.zone);
    if (zone && zone.rates) {
      zone.rates[inp.dataset.cat] = Math.max(0, parseFloat(inp.value) || 0);
    }
  });
  
  config.airport.freeWaitSendOff = Math.max(0, parseFloat(document.getElementById('air-free-send')?.value) || 30);
  config.airport.freeWaitReceiveDom = Math.max(0, parseFloat(document.getElementById('air-free-dom')?.value) || 30);
  config.airport.freeWaitReceiveInt = Math.max(0, parseFloat(document.getElementById('air-free-int')?.value) || 60);
  config.airport.hourlyWaitCharge = Math.max(0, parseFloat(document.getElementById('air-wait')?.value) || 150);
  config.airport.roundTripSurcharge = Math.max(0, parseFloat(document.getElementById('air-round')?.value) || 500);
  config.airport.lateNightSurcharge = Math.max(0, parseFloat(document.getElementById('air-late')?.value) || 300);

  await savePricingConfig(config);
  alert("Airport Transfer 8-Zone Grid & Surcharges Saved Successfully!");
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
  alert("Travel & Tour Packages Saved Successfully!");
}

async function addTourRoute() {
  const config = await getPricingConfig();
  const newId = 'route_' + Date.now();
  config.tour.routes.push({
    id: newId,
    name: 'New Custom Package',
    days: 2,
    rates: { sedan_economy: 12000, sedan_standard: 14000, sedan_premium: 16000, noah: 18000, hiace: 20000 }
  });
  await savePricingConfig(config);
  renderPricingAdmin();
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
