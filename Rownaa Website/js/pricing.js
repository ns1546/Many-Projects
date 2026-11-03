// =========================================================
// ROWNAA PRICING ENGINE (Aligned with Rownaa Complete Pricing Specification)
// Handles all formula logic for the 5 services:
// 1. Hourly Rental (7 Categories, 4h & 10h packages, 40km included, extra hour & extra km)
// 2. Intercity Travel (One-Way, Round-Trip Same-Day & Multi-Day, Extra-KM tracking)
// 3. Corporate Transport (Fixed Daily Rate Model, 4 Duration Tiers, Max Direct Booking)
// 4. Airport Transfer (8 Flattened Distance Zones, Trip Direction Windows, Surcharges)
// 5. Travel & Tour (Fixed All-Inclusive Multi-Day Packages + Extra Days)
// =========================================================

const DEFAULT_PRICING_CONFIG = {
  hourly: {
    includedDistance: 40,
    categories: [
      { id: 'sedan_economy', name: 'Sedan Economy', seats: 4, rate4h: 1600, rate10h: 2800, extraHour: 250, extraKm: 12, active: true },
      { id: 'sedan_standard', name: 'Sedan (Standard)', seats: 4, rate4h: 2000, rate10h: 3500, extraHour: 300, extraKm: 15, active: true },
      { id: 'sedan_premium', name: 'Sedan Premium', seats: 4, rate4h: 2800, rate10h: 4800, extraHour: 400, extraKm: 18, active: true },
      { id: 'noah', name: 'Noah', seats: 7, rate4h: 3000, rate10h: 5200, extraHour: 500, extraKm: 20, active: true },
      { id: 'chander_gari', name: 'Chander Gari', seats: 8, rate4h: 3500, rate10h: 6000, extraHour: 550, extraKm: 22, active: true },
      { id: 'hiace', name: 'HiAce', seats: 11, rate4h: 4000, rate10h: 7000, extraHour: 600, extraKm: 25, active: true },
      { id: 'luxury_prado', name: 'Luxury (Prado/Camry)', seats: 6, rate4h: 4500, rate10h: 8000, extraHour: 700, extraKm: 25, active: true }
    ]
  },
  intercity: {
    extraKmRate: 40,
    extraKmEnabled: true,
    sameDayReturnChargePercent: 50,
    maxSameDayDistance: 250,
    dailyWaitingCharge: 2000,
    tiers: [
      { id: 'sedan_economy', name: 'Sedan Economy', seats: 4, baseFare: 3000, perKm: 40, active: true },
      { id: 'sedan_standard', name: 'Sedan (Standard)', seats: 4, baseFare: 3500, perKm: 40, active: true },
      { id: 'sedan_premium', name: 'Sedan Premium', seats: 4, baseFare: 4500, perKm: 40, active: true },
      { id: 'noah', name: 'Noah', seats: 7, baseFare: 4500, perKm: 40, active: true },
      { id: 'chander_gari', name: 'Chander Gari', seats: 8, baseFare: 5000, perKm: 42, active: true },
      { id: 'hiace', name: 'HiAce', seats: 11, baseFare: 6000, perKm: 45, active: true }
    ]
  },
  corporate: {
    maxBookingDays: 30,
    rates: {
      sedan_economy: [3000, 2600, 2400, 2150],
      sedan_standard: [3800, 3300, 3050, 2750],
      sedan_premium: [5000, 4350, 4000, 3600],
      noah: [6500, 5650, 5200, 4700],
      hiace: [8500, 7400, 6800, 6150]
    }
  },
  airport: {
    freeWaitSendOff: 30,
    freeWaitReceiveDom: 30,
    freeWaitReceiveInt: 60,
    hourlyWaitCharge: 150,
    roundTripSurcharge: 500,
    lateNightSurcharge: 300,
    zones: [
      { id: 'zone1', name: 'Zone 1: Airport Core (Uttara, Ashkona, Diabari, Nikunja)', rates: { sedan_economy: 500, sedan_standard: 650, sedan_premium: 800, noah: 1000, hiace: 1200 } },
      { id: 'zone2', name: 'Zone 2: Near North (Khilkhet, Dakshinkhan, Uttarkhan, Turag, Tongi)', rates: { sedan_economy: 800, sedan_standard: 1000, sedan_premium: 1200, noah: 1500, hiace: 1800 } },
      { id: 'zone3', name: 'Zone 3: Gulshan–Banani–Bashundhara Corridor', rates: { sedan_economy: 1300, sedan_standard: 1600, sedan_premium: 1900, noah: 2300, hiace: 2700 } },
      { id: 'zone4', name: 'Zone 4: Mid Dhaka East (Badda, Rampura, Tejgaon, Hatirjheel)', rates: { sedan_economy: 1500, sedan_standard: 1800, sedan_premium: 2100, noah: 2500, hiace: 2900 } },
      { id: 'zone5', name: 'Zone 5: Mid Dhaka West (Mirpur, Pallabi, Kafrul, Kazipara)', rates: { sedan_economy: 1600, sedan_standard: 1900, sedan_premium: 2200, noah: 2600, hiace: 3000 } },
      { id: 'zone6', name: 'Zone 6: Central Core (Motijheel, Dhanmondi, Shahbagh, Mohammadpur)', rates: { sedan_economy: 2000, sedan_standard: 2400, sedan_premium: 2800, noah: 3300, hiace: 3800 } },
      { id: 'zone7', name: 'Zone 7: Old Dhaka Core (Lalbagh, Sutrapur, Wari, Jatrabari, Sadarghat)', rates: { sedan_economy: 2600, sedan_standard: 3000, sedan_premium: 3400, noah: 3900, hiace: 4400 } },
      { id: 'zone8', name: 'Zone 8: Extended Outskirts (Savar, Ashulia, Narayanganj, Keraniganj, Gazipur border)', rates: { sedan_economy: 3500, sedan_standard: 4000, sedan_premium: 4500, noah: 5200, hiace: 6000 } }
    ]
  },
  tour: {
    routes: [
      { id: 'rt_cox', name: "Dhaka ↔ Cox's Bazar (4 Days)", days: 4, rates: { sedan_economy: 24000, sedan_standard: 26000, sedan_premium: 27000, noah: 30000, hiace: 30000 } },
      { id: 'rt_sreemangal', name: 'Dhaka ↔ Sreemangal (2 Days)', days: 2, rates: { sedan_economy: 10500, sedan_standard: 11500, sedan_premium: 13000, noah: 14500, hiace: 14500 } },
      { id: 'rt_sylhet', name: 'Dhaka ↔ Sreemangal ↔ Sylhet (3 Days)', days: 3, rates: { sedan_economy: 15000, sedan_standard: 18000, sedan_premium: 21000, noah: 22000, hiace: 24000 } }
    ]
  }
};

class RownaaPricingEngine {
  constructor() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_PRICING_CONFIG));
    this._loadCachedConfig();
    this._setupSyncListeners();
    this.init();
  }

  _loadCachedConfig() {
    try {
      const cached = localStorage.getItem('rownaa_master_pricing');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.hourly && parsed.hourly.categories) {
          this.config = parsed;
        }
      }
    } catch (e) {
      // LocalStorage unavailable, keep default
    }
  }

  _setupSyncListeners() {
    if (typeof window === 'undefined') return;
    
    // Listen to custom in-page events (fired when admin clicks save)
    window.addEventListener('pricingUpdated', (e) => {
      if (e.detail) {
        this.config = e.detail;
      }
    });

    // Listen to cross-tab BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this._bc = new BroadcastChannel('rownaa_pricing_channel');
        this._bc.onmessage = (msg) => {
          if (msg.data && msg.data.config) {
            this.config = msg.data.config;
            window.dispatchEvent(new CustomEvent('pricingUpdated', { detail: this.config }));
          }
        };
      }
    } catch (e) {}

    // Listen to cross-tab storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'rownaa_master_pricing' && e.newValue) {
        try {
          this.config = JSON.parse(e.newValue);
          window.dispatchEvent(new CustomEvent('pricingUpdated', { detail: this.config }));
        } catch (err) {}
      }
    });
  }

  async init() {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
      return;
    }
    try {
      const headers = {};
      try {
        const token = localStorage.getItem('rownaa_session_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      } catch (e) {}

      const res = await fetch('/api/pricing', { credentials: 'include', headers });
      if (res.ok) {
        const live = await res.json();
        if (live && live.hourly && live.hourly.categories) {
          const localTs = parseInt(localStorage.getItem('rownaa_pricing_updated_timestamp') || '0', 10);
          // If admin saved pricing recently (within 4 hours) and local is modified, push to backend instead of reverting
          if (localTs && (Date.now() - localTs < 14400000) && this.config) {
            fetch('/api/pricing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...headers },
              credentials: 'include',
              body: JSON.stringify(this.config)
            }).catch(() => {});
          } else {
            this.config = live;
            try {
              localStorage.setItem('rownaa_master_pricing', JSON.stringify(live));
            } catch (e) {}
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('pricingUpdated', { detail: live }));
            }
          }
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }

  _normalizeCategory(id) {
    if (!id) return 'sedan_standard';
    const s = String(id).toLowerCase().replace(/[_-]/g, ' ').trim();
    if (s.includes('allion') || s.includes('premio')) return 'sedan_standard';
    if (s.includes('axio') || s.includes('corolla') || s.includes('economy')) return 'sedan_economy';
    if (s === 'sedan standard' || s === 'standard sedan' || s === 'standard') return 'sedan_standard';
    if (s.includes('camry') || s.includes('crown') || s.includes('premium') || s.includes('executive')) return 'sedan_premium';
    if (s.includes('noah') || s.includes('voxy') || s.includes('esquire')) return 'noah';
    if (s.includes('chander') || s.includes('gari')) return 'chander_gari';
    if (s.includes('hiace') || s.includes('microbus') || s.includes('minibus')) return 'hiace';
    if (s.includes('luxury') || s.includes('prado') || s.includes('harrier')) return 'luxury_prado';
    if (s.includes('sedan')) return 'sedan_standard';
    return id;
  }

  _normalizeZone(id) {
    if (!id) return 'zone3';
    const s = String(id).toLowerCase().trim();
    if (s === 'zone1' || s === 'z1' || s.includes('core') || s.includes('uttara') || s.includes('diabari') || s.includes('nikunja')) return 'zone1';
    if (s === 'zone2' || s === 'z2' || s.includes('khilkhet') || s.includes('tongi') || s.includes('dakshinkhan')) return 'zone2';
    if (s === 'zone3' || s === 'z3' || s.includes('gulshan') || s.includes('banani') || s.includes('bashundhara') || s === 'dhaka_north') return 'zone3';
    if (s === 'zone4' || s === 'z4' || s.includes('badda') || s.includes('tejgaon') || s.includes('rampura') || s.includes('hatirjheel')) return 'zone4';
    if (s === 'zone5' || s === 'z5' || s.includes('mirpur') || s.includes('pallabi') || s.includes('kafrul')) return 'zone5';
    if (s === 'zone6' || s === 'z6' || s.includes('motijheel') || s.includes('dhanmondi') || s.includes('shahbagh') || s.includes('mohammadpur') || s === 'dhaka_south') return 'zone6';
    if (s === 'zone7' || s === 'z7' || s.includes('old dhaka') || s.includes('lalbagh') || s.includes('wari') || s.includes('jatrabari') || s.includes('sadarghat')) return 'zone7';
    if (s === 'zone8' || s === 'z8' || s.includes('savar') || s.includes('ashulia') || s.includes('narayanganj') || s.includes('keraniganj') || s.includes('outskirts')) return 'zone8';
    return id;
  }

  // 1. Hourly Rental
  calculateHourly(categoryId, is10Hour = false, distance = 0, extraHours = 0) {
    const normId = this._normalizeCategory(categoryId);
    const cat = this.config.hourly.categories.find(c => c.id === normId) || this.config.hourly.categories[0];
    if (!cat) return null;

    const base = is10Hour ? cat.rate10h : cat.rate4h;
    const extraHoursRounded = Math.ceil(Math.max(0, extraHours));
    const extraHourCharge = extraHoursRounded * (cat.extraHour || 250);

    const includedDist = this.config.hourly.includedDistance || 40;
    let extraKm = 0;
    if (distance > includedDist) {
      extraKm = distance - includedDist;
    }
    const extraKmCharge = extraKm * (cat.extraKm || 12);

    return {
      service: 'Hourly Rental',
      category: cat.name,
      package: is10Hour ? '10 Hours' : '4 Hours',
      includedDistance: includedDist,
      baseFare: base,
      extraHours: extraHoursRounded,
      extraHourCharge: extraHourCharge,
      extraKm: extraKm,
      extraKmCharge: extraKmCharge,
      total: base + extraHourCharge + extraKmCharge,
      breakdown: `Base (${is10Hour ? '10h' : '4h'}, incl ${includedDist}km): ৳${base} + Extra Hrs: ৳${extraHourCharge} + Extra KM: ৳${extraKmCharge}`
    };
  }

  // 2. Intercity (One-Way & Round-Trip)
  calculateIntercity(tierId, distance, isRoundTrip = false, nights = 0) {
    const normId = this._normalizeCategory(tierId);
    const tier = this.config.intercity.tiers.find(t => t.id === normId) || this.config.intercity.tiers[0];
    if (!tier) return null;

    const oneWayPrice = tier.baseFare + (distance * tier.perKm);

    if (!isRoundTrip) {
      return { 
        service: 'Intercity (One-Way)',
        baseFare: tier.baseFare, 
        distance: distance,
        perKm: tier.perKm,
        distanceCharge: (distance * tier.perKm), 
        total: oneWayPrice, 
        type: 'One-Way' 
      };
    }

    const maxSameDay = this.config.intercity.maxSameDayDistance || 250;
    const sameDayPercent = this.config.intercity.sameDayReturnChargePercent || 50;
    const waitChargePerDay = this.config.intercity.dailyWaitingCharge || 2000;

    if (distance <= maxSameDay && nights === 0) {
      const sameDaySurcharge = Math.round(tier.baseFare * (sameDayPercent / 100));
      const total = oneWayPrice + sameDaySurcharge;
      return { 
        service: 'Intercity (Round-Trip Same Day)',
        oneWayPrice: oneWayPrice,
        returnSurcharge: sameDaySurcharge,
        total: total,
        type: 'Round-Trip (Same Day)'
      };
    } else {
      const waitCharge = nights * waitChargePerDay;
      const total = oneWayPrice + waitCharge;
      return {
        service: `Intercity (Round-Trip ${nights} Nights)`,
        oneWayPrice: oneWayPrice,
        nights: nights,
        waitCharge: waitCharge,
        total: total,
        type: `Round-Trip (${nights} Nights)`
      };
    }
  }

  // 3. Corporate (Fixed Daily Rate Model)
  calculateCorporate(categoryId, days = 1) {
    const normId = this._normalizeCategory(categoryId);
    const rates = this.config.corporate.rates[normId] || this.config.corporate.rates['sedan_economy'] || [3000, 2600, 2400, 2150];
    if (!rates) return null;

    let dailyRate = 0;
    if (days >= 1 && days <= 6) dailyRate = rates[0];
    else if (days >= 7 && days <= 14) dailyRate = rates[1];
    else if (days >= 15 && days <= 29) dailyRate = rates[2];
    else dailyRate = rates[3];

    const maxDays = this.config.corporate.maxBookingDays || 30;
    const inquiryRequired = days > maxDays;

    return {
      service: 'Corporate Transport',
      dailyRate: dailyRate,
      days: days,
      maxBookingDays: maxDays,
      inquiryRequired: inquiryRequired,
      message: inquiryRequired ? 'For bookings exceeding this limit, our team will contact you to discuss details and confirm the booking.' : null,
      total: dailyRate * days
    };
  }

  // 4. Airport Transfer
  calculateAirport(zoneId, categoryId, direction = 'Airport Drop-off', isLateNight = false) {
    const normZone = this._normalizeZone(zoneId);
    const normCat = this._normalizeCategory(categoryId);

    const zone = this.config.airport.zones.find(z => z.id === normZone) || this.config.airport.zones[0];
    if (!zone) return null;
    const baseFare = (zone.rates && zone.rates[normCat] !== undefined) ? zone.rates[normCat] : (zone.rates?.sedan_economy || 500);

    let roundTripSurcharge = 0;
    if (direction === 'Round Trip') {
      roundTripSurcharge = this.config.airport.roundTripSurcharge || 500;
    }

    const lateNightCharge = isLateNight ? (this.config.airport.lateNightSurcharge || 300) : 0;

    return {
      service: 'Airport Transfer',
      zone: zone.name,
      category: normCat,
      direction: direction,
      baseFare: baseFare,
      roundTripSurcharge: roundTripSurcharge,
      lateNightCharge: lateNightCharge,
      freeWaitMinutes: direction === 'Airport Pickup' ? (this.config.airport.freeWaitReceiveInt || 60) : (this.config.airport.freeWaitSendOff || 30),
      total: baseFare + roundTripSurcharge + lateNightCharge
    };
  }

  // 5. Travel & Tour
  calculateTour(routeId = 'rt_cox', categoryId, extraDays = 0) {
    const normCat = this._normalizeCategory(categoryId);
    const route = this.config.tour.routes.find(r => r.id === routeId) || this.config.tour.routes[0];
    if (!route) return null;

    const baseFare = (route.rates && route.rates[normCat] !== undefined) ? route.rates[normCat] : 24000;
    const hCat = this.config.hourly.categories.find(c => c.id === normCat);
    const extraDayRate = hCat ? hCat.rate10h : 2800; 
    const extraCharge = extraDays * extraDayRate;

    return {
      service: 'Travel & Tour',
      route: route.name,
      days: route.days,
      baseFare: baseFare,
      extraDays: extraDays,
      extraCharge: extraCharge,
      total: baseFare + extraCharge
    };
  }
}

window.PricingEngine = new RownaaPricingEngine();
