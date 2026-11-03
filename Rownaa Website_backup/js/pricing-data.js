// =========================================================
// ROWNAA PRICING DATA STORE
// Initial seeds for local storage
// =========================================================

const DEFAULT_PRICING_CONFIG = {
  hourly: {
    includedDistance: 40,
    categories: [
      { id: "sedan_economy", name: "Sedan Economy", seats: 4, rate4h: 1600, rate10h: 2800, extraHour: 250, extraKm: 12, active: true },
      { id: "sedan_standard", name: "Sedan (Standard)", seats: 4, rate4h: 2000, rate10h: 3500, extraHour: 300, extraKm: 15, active: true },
      { id: "sedan_premium", name: "Sedan Premium", seats: 4, rate4h: 2800, rate10h: 4800, extraHour: 400, extraKm: 18, active: true },
      { id: "noah", name: "Noah", seats: 7, rate4h: 3000, rate10h: 5200, extraHour: 500, extraKm: 20, active: true },
      { id: "chander_gari", name: "Chander Gari", seats: 8, rate4h: 3500, rate10h: 6000, extraHour: 550, extraKm: 22, active: true },
      { id: "hiace", name: "HiAce", seats: 11, rate4h: 4000, rate10h: 7000, extraHour: 600, extraKm: 25, active: true },
      { id: "luxury", name: "Luxury (Prado/Camry)", seats: 6, rate4h: 4500, rate10h: 8000, extraHour: 700, extraKm: 25, active: true }
    ]
  },
  intercity: {
    extraKmEnabled: true,
    extraKmRate: 40,
    perKmRate: 40,
    sameDayReturnChargePercent: 50,
    maxSameDayDistance: 250,
    dailyWaitingCharge: 2000,
    multiDayEnabled: true,
    tiers: [
      { id: "economy", name: "Economy", baseFare: 3000, perKm: 40, active: true, categories: ["sedan_economy", "sedan_standard"] },
      { id: "premium", name: "Premium", baseFare: 4500, perKm: 40, active: true, categories: ["sedan_premium", "noah", "hiace"] },
      { id: "luxury", name: "Luxury", baseFare: 6000, perKm: 50, active: false, categories: ["luxury"] }
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
    freeWaitSendOff: 30, // mins
    freeWaitReceiveDom: 30,
    freeWaitReceiveInt: 60,
    hourlyWaitCharge: 200,
    roundTripSurcharge: 500,
    lateNightSurcharge: 300, // 1 AM - 5 AM
    zones: [
      { id: "z1", name: "Zone 1 (Uttara, Airport)", rates: { sedan_economy: 500, sedan_standard: 650, sedan_premium: 800, noah: 1000, hiace: 1200 } },
      { id: "z2", name: "Zone 2 (Khilkhet, Turag)", rates: { sedan_economy: 800, sedan_standard: 1000, sedan_premium: 1200, noah: 1500, hiace: 1800 } },
      { id: "z3", name: "Zone 3 (Gulshan, Banani)", rates: { sedan_economy: 1300, sedan_standard: 1600, sedan_premium: 1900, noah: 2300, hiace: 2700 } },
      { id: "z4", name: "Zone 4 (Badda, Tejgaon)", rates: { sedan_economy: 1500, sedan_standard: 1800, sedan_premium: 2100, noah: 2500, hiace: 2900 } },
      { id: "z5", name: "Zone 5 (Mirpur, Pallabi)", rates: { sedan_economy: 1600, sedan_standard: 1900, sedan_premium: 2200, noah: 2600, hiace: 3000 } },
      { id: "z6", name: "Zone 6 (Motijheel, Dhanmondi)", rates: { sedan_economy: 2000, sedan_standard: 2400, sedan_premium: 2800, noah: 3300, hiace: 3800 } },
      { id: "z7", name: "Zone 7 (Old Dhaka)", rates: { sedan_economy: 2600, sedan_standard: 3000, sedan_premium: 3400, noah: 3900, hiace: 4400 } },
      { id: "z8", name: "Zone 8 (Savar, Ashulia)", rates: { sedan_economy: 3500, sedan_standard: 4000, sedan_premium: 4500, noah: 5200, hiace: 6000 } }
    ]
  },
  tour: {
    routes: [
      {
        id: "cox", name: "Dhaka ↔ Cox's Bazar", days: 4,
        rates: { sedan_economy: 25000, sedan_standard: 26000, sedan_premium: 27000, noah: 30000, hiace: 30000 }
      },
      {
        id: "sreemangal", name: "Dhaka ↔ Sreemangal", days: 2,
        rates: { sedan_economy: 10500, sedan_standard: 11500, sedan_premium: 13000, noah: 14500, hiace: 14500 }
      }
    ]
  }
};

function initPricingData() {
  if (!localStorage.getItem('rownaaPricing')) {
    localStorage.setItem('rownaaPricing', JSON.stringify(DEFAULT_PRICING_CONFIG));
  }
}

function getPricingConfig() {
  initPricingData();
  try {
    const data = JSON.parse(localStorage.getItem('rownaaPricing'));
    return data || DEFAULT_PRICING_CONFIG;
  } catch (e) {
    console.error("Failed to parse pricing data, falling back to default.", e);
    return DEFAULT_PRICING_CONFIG;
  }
}

function savePricingConfig(data) {
  try {
    localStorage.setItem('rownaaPricing', JSON.stringify(data));
  } catch (e) {
    console.error("Storage failed: ", e);
    alert("Failed to save pricing data. Storage might be full or disabled.");
  }
}

// Initialize immediately
initPricingData();
