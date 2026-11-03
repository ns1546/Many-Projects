// =========================================================
// ROWNAA PRICING ENGINE
// Handles all formula logic for the 5 services
// =========================================================

class RownaaPricingEngine {
  constructor() {
    this.config = getPricingConfig();
  }

  // 1. Hourly Rental
  calculateHourly(categoryId, is10Hour = false, distance = 0, extraHours = 0) {
    const cat = this.config.hourly.categories.find(c => c.id === categoryId);
    if (!cat) return null;

    let base = is10Hour ? cat.rate10h : cat.rate4h;
    
    // Extra Hours
    let extraHourCharge = extraHours * cat.extraHour;

    // Extra KM
    let extraKm = 0;
    if (distance > this.config.hourly.includedDistance) {
      extraKm = distance - this.config.hourly.includedDistance;
    }
    let extraKmCharge = extraKm * cat.extraKm;

    return {
      baseFare: base,
      extraHourCharge: extraHourCharge,
      extraKmCharge: extraKmCharge,
      total: base + extraHourCharge + extraKmCharge,
      breakdown: `Base: ৳${base} + Extra Hrs: ৳${extraHourCharge} + Extra KM: ৳${extraKmCharge}`
    };
  }

  // 2. Intercity (One-Way & Round-Trip)
  calculateIntercity(tierId, distance, isRoundTrip = false, nights = 0) {
    const tier = this.config.intercity.tiers.find(t => t.id === tierId);
    if (!tier) return null;

    // One-Way Price
    let oneWayPrice = tier.baseFare + (distance * tier.perKm);

    if (!isRoundTrip) {
      return { baseFare: tier.baseFare, distanceCharge: (distance * tier.perKm), total: oneWayPrice, type: 'One-Way' };
    }

    // Round Trip Logic
    if (distance <= this.config.intercity.maxSameDayDistance && nights === 0) {
      // Same-Day
      let sameDaySurcharge = tier.baseFare * (this.config.intercity.sameDayReturnChargePercent / 100);
      let total = oneWayPrice + sameDaySurcharge;
      return { 
        oneWayPrice: oneWayPrice,
        returnSurcharge: sameDaySurcharge,
        total: total,
        type: 'Round-Trip (Same Day)'
      };
    } else {
      // Multi-Day
      let waitCharge = nights * this.config.intercity.dailyWaitingCharge;
      let total = oneWayPrice + waitCharge;
      return {
        oneWayPrice: oneWayPrice,
        waitCharge: waitCharge,
        total: total,
        type: `Round-Trip (${nights} Nights)`
      };
    }
  }

  // 3. Corporate
  calculateCorporate(categoryId, days) {
    const rates = this.config.corporate.rates[categoryId];
    if (!rates) return null;

    let dailyRate = 0;
    if (days >= 1 && days <= 6) dailyRate = rates[0];
    else if (days >= 7 && days <= 14) dailyRate = rates[1];
    else if (days >= 15 && days <= 29) dailyRate = rates[2];
    else if (days >= 30) dailyRate = rates[3];

    return {
      dailyRate: dailyRate,
      days: days,
      total: dailyRate * days
    };
  }

  // 4. Airport Transfer
  calculateAirport(zoneId, categoryId, direction, isLateNight = false) {
    const zone = this.config.airport.zones.find(z => z.id === zoneId);
    if (!zone) return null;
    const baseFare = zone.rates[categoryId] || 0;

    let roundTripSurcharge = 0;
    if (direction === 'Round Trip') {
      roundTripSurcharge = this.config.airport.roundTripSurcharge;
    }

    let lateNightCharge = isLateNight ? this.config.airport.lateNightSurcharge : 0;

    return {
      baseFare: baseFare,
      roundTripSurcharge: roundTripSurcharge,
      lateNightCharge: lateNightCharge,
      total: baseFare + roundTripSurcharge + lateNightCharge
    };
  }

  // 5. Travel & Tour
  calculateTour(routeId, categoryId, extraDays = 0) {
    const route = this.config.tour.routes.find(r => r.id === routeId);
    if (!route) return null;

    const baseFare = route.rates[categoryId] || 0;
    
    // Use hourly category for daily rate
    const hCat = this.config.hourly.categories.find(c => c.id === categoryId);
    // Rough estimate: we use 10h rate for extra day rate if not specified explicitly in spec
    let extraDayRate = hCat ? hCat.rate10h : 0; 
    let extraCharge = extraDays * extraDayRate;

    return {
      baseFare: baseFare,
      extraDays: extraDays,
      extraCharge: extraCharge,
      total: baseFare + extraCharge
    };
  }
}

window.PricingEngine = new RownaaPricingEngine();
