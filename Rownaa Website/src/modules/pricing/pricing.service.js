const pricingRepo = require('./pricing.repository');
const cache = require('../../infrastructure/cache');

class PricingService {
    async getConfig() {
        return await cache.getOrSet('pricing:master_config', async () => {
            return await pricingRepo.getConfig();
        }, 300);
    }

    async updateConfig(newConfig) {
        const saved = await pricingRepo.saveConfig(newConfig);
        await cache.del('pricing:master_config');
        return saved;
    }

    _normalizeCategory(id) {
        if (!id) return 'sedan_economy';
        const s = String(id).toLowerCase().replace(/[_-]/g, ' ').trim();
        if (s.includes('economy') || s === 'sedan economy') return 'sedan_economy';
        if (s === 'sedan standard' || s === 'standard sedan' || s === 'standard') return 'sedan_standard';
        if (s.includes('premium') || s.includes('executive')) return 'sedan_premium';
        if (s.includes('noah') || s.includes('voxy')) return 'noah';
        if (s.includes('chander') || s.includes('gari')) return 'chander_gari';
        if (s.includes('hiace') || s.includes('microbus') || s.includes('minibus')) return 'hiace';
        if (s.includes('luxury') || s.includes('prado') || s.includes('camry')) return 'luxury_prado';
        if (s === 'sedan') return 'sedan_standard';
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

    async calculate({ service, category, zone, distance = 0, is10Hour = false, extraHours = 0, isRoundTrip = false, nights = 0, days = 1, direction = 'Airport Drop-off', isLateNight = false, routeId = 'rt_cox', extraDays = 0, promoCode }) {
        const config = await this.getConfig();
        const normCat = this._normalizeCategory(category);
        let result = null;

        if (service === 'hourly') {
            const cat = config.hourly.categories.find(c => c.id === normCat) || config.hourly.categories[0];
            const base = is10Hour ? cat.rate10h : cat.rate4h;
            const extraHoursRounded = Math.ceil(Math.max(0, extraHours));
            const extraHourCharge = extraHoursRounded * (cat.extraHour || 250);
            const includedDist = config.hourly.includedDistance || 40;
            const extraKm = distance > includedDist ? distance - includedDist : 0;
            const extraKmCharge = extraKm * (cat.extraKm || 12);
            result = {
                service: 'Hourly Rental',
                category: cat.name,
                package: is10Hour ? '10 Hours' : '4 Hours',
                includedDistance: includedDist,
                baseFare: base,
                extraHours: extraHoursRounded,
                extraHourCharge,
                extraKm,
                extraKmCharge,
                total: base + extraHourCharge + extraKmCharge
            };
        } else if (service === 'intercity') {
            const tier = config.intercity.tiers.find(t => t.id === normCat) || config.intercity.tiers[0];
            const oneWayPrice = tier.baseFare + (distance * tier.perKm);
            if (!isRoundTrip) {
                result = { service: 'Intercity (One-Way)', baseFare: tier.baseFare, distance, perKm: tier.perKm, distanceCharge: distance * tier.perKm, total: oneWayPrice };
            } else {
                const maxSameDay = config.intercity.maxSameDayDistance || 250;
                const sameDayPercent = config.intercity.sameDayReturnChargePercent || 50;
                const waitChargePerDay = config.intercity.dailyWaitingCharge || 2000;
                if (distance <= maxSameDay && nights === 0) {
                    const surcharge = Math.round(tier.baseFare * (sameDayPercent / 100));
                    result = { service: 'Intercity (Round-Trip Same Day)', oneWayPrice, returnSurcharge: surcharge, total: oneWayPrice + surcharge };
                } else {
                    const waitCharge = nights * waitChargePerDay;
                    result = { service: `Intercity (Round-Trip ${nights} Nights)`, oneWayPrice, nights, waitCharge, total: oneWayPrice + waitCharge };
                }
            }
        } else if (service === 'airport') {
            const normZone = this._normalizeZone(zone);
            const z = config.airport.zones.find(item => item.id === normZone) || config.airport.zones[0];
            const baseFare = (z.rates && z.rates[normCat] !== undefined) ? z.rates[normCat] : (z.rates?.sedan_economy || 500);
            const roundTripSurcharge = direction === 'Round Trip' ? (config.airport.roundTripSurcharge || 500) : 0;
            const lateNightCharge = isLateNight ? (config.airport.lateNightSurcharge || 300) : 0;
            result = {
                service: 'Airport Transfer',
                zone: z.name,
                category: normCat,
                direction,
                baseFare,
                roundTripSurcharge,
                lateNightCharge,
                freeWaitMinutes: direction === 'Airport Pickup' ? config.airport.freeWaitReceiveInt : config.airport.freeWaitSendOff,
                total: baseFare + roundTripSurcharge + lateNightCharge
            };
        } else if (service === 'corporate') {
            const rates = config.corporate.rates[normCat] || config.corporate.rates['sedan_economy'] || [3000, 2600, 2400, 2150];
            let dailyRate = 0;
            if (days >= 1 && days <= 6) dailyRate = rates[0];
            else if (days >= 7 && days <= 14) dailyRate = rates[1];
            else if (days >= 15 && days <= 29) dailyRate = rates[2];
            else dailyRate = rates[3];

            const maxDays = config.corporate.maxBookingDays || 30;
            const inquiryRequired = days > maxDays;
            result = {
                service: 'Corporate Transport',
                dailyRate,
                days,
                maxBookingDays: maxDays,
                inquiryRequired,
                message: inquiryRequired ? 'For bookings exceeding this limit, our team will contact you to discuss the details and confirm the booking.' : null,
                total: dailyRate * days
            };
        } else if (service === 'tour') {
            const route = config.tour.routes.find(r => r.id === routeId) || config.tour.routes[0];
            const baseFare = (route.rates && route.rates[normCat] !== undefined) ? route.rates[normCat] : 24000;
            const hCat = config.hourly.categories.find(c => c.id === normCat);
            const extraDayRate = hCat ? hCat.rate10h : 2800;
            const extraCharge = extraDays * extraDayRate;
            result = {
                service: 'Travel & Tour',
                route: route.name,
                days: route.days,
                baseFare,
                extraDays,
                extraCharge,
                total: baseFare + extraCharge
            };
        }

        if (!result) {
            result = { service: service || 'Standard', total: 2000 };
        }

        // Apply Promo Code
        let discount = 0;
        const code = promoCode ? promoCode.trim().toUpperCase() : '';
        if (code === 'ROWNAA20' || code === 'VIP20') {
            discount = Math.round(result.total * 0.20);
        } else if (code === 'ROWNAA10') {
            discount = Math.round(result.total * 0.10);
        } else if (code === 'WELCOME5') {
            discount = Math.round(result.total * 0.05);
        }
        const vat = Math.round((result.total - discount) * 0.05);

        return {
            ...result,
            discount,
            vat,
            netPayable: result.total - discount + vat
        };
    }
}

module.exports = new PricingService();

