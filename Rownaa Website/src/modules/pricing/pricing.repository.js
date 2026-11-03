const db = require('../../config/db');

const DEFAULT_CONFIG = {
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

class PricingRepository {
    async getConfig() {
        const row = await db.queryOne("SELECT configData FROM pricing_config WHERE configKey = 'master_pricing'");
        if (!row || !row.configData) {
            await this.saveConfig(DEFAULT_CONFIG);
            return DEFAULT_CONFIG;
        }
        try {
            const parsed = JSON.parse(row.configData);
            // Migrate if stored config lacks complete 7 hourly categories, 8 airport zones, or has outdated initial values
            if (!parsed.hourly || !parsed.hourly.categories || parsed.hourly.categories.length < 7 || 
                !parsed.airport || !parsed.airport.zones || parsed.airport.zones.length < 8 || 
                parsed.hourly.includedDistance <= 10 || 
                (parsed.corporate?.rates?.sedan_economy && parsed.corporate.rates.sedan_economy[0] > 10000)) {
                const migrated = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
                await this.saveConfig(migrated);
                return migrated;
            }
            return parsed;
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    }

    _deepMerge(target, source) {
        const out = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                out[key] = this._deepMerge(target[key] || {}, source[key]);
            } else {
                out[key] = source[key];
            }
        }
        return out;
    }

    async saveConfig(partialConfig) {
        let current = {};
        try {
            const row = await db.queryOne("SELECT configData FROM pricing_config WHERE configKey = 'master_pricing'");
            if (row && row.configData) {
                current = JSON.parse(row.configData);
            } else {
                current = DEFAULT_CONFIG;
            }
        } catch (e) {
            current = DEFAULT_CONFIG;
        }

        const merged = this._deepMerge({ ...DEFAULT_CONFIG, ...current }, partialConfig);
        const jsonStr = JSON.stringify(merged);
        const now = new Date().toISOString();
        await db.execute(
            `INSERT INTO pricing_config (id, configKey, configData, updatedAt)
             VALUES ('cfg-1', 'master_pricing', ?, ?)
             ON CONFLICT(configKey) DO UPDATE SET
                configData = excluded.configData,
                updatedAt = excluded.updatedAt`,
            [jsonStr, now]
        );
        return merged;
    }
}

module.exports = new PricingRepository();

