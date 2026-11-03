// ============================================================================
// ROWNAA DYNAMIC SURGE & TRAFFIC MULTIPLIER ENGINE (Uber / Pathao Scale)
// Computes real-time demand/supply multipliers and peak-hour traffic adjustments
// ============================================================================

class SurgePricingEngine {
    /**
     * Compute dynamic surge multiplier based on zone load and time
     * Supports both signature forms:
     *   calculateSurge(zoneKey, dateTime, options)
     *   calculateSurge({ zoneKey, dateTime, activeRequests, availableFleet })
     */
    calculateSurge(zoneKeyOrOptions = 'gulshan', maybeDateTime, maybeOptions = {}) {
        let zoneKey = 'gulshan';
        let dateTime = null;
        let activeRequests = 0;
        let availableFleet = 5;

        if (typeof zoneKeyOrOptions === 'object' && zoneKeyOrOptions !== null) {
            zoneKey = zoneKeyOrOptions.zoneKey || zoneKeyOrOptions.zone || 'gulshan';
            dateTime = zoneKeyOrOptions.dateTime || null;
            activeRequests = zoneKeyOrOptions.activeRequests || zoneKeyOrOptions.activeRequestsInZone || 0;
            availableFleet = zoneKeyOrOptions.availableFleet || zoneKeyOrOptions.availableFleetInZone || 5;
        } else {
            zoneKey = zoneKeyOrOptions || 'gulshan';
            dateTime = maybeDateTime;
            if (typeof maybeOptions === 'object' && maybeOptions !== null) {
                activeRequests = maybeOptions.activeRequests || maybeOptions.activeRequestsInZone || 0;
                availableFleet = maybeOptions.availableFleet || maybeOptions.availableFleetInZone || 5;
            }
        }

        let surgeMultiplier = 1.0;
        let reasons = [];

        // 1. Demand / Supply Ratio evaluation (Uber Heatmap Model)
        const safeFleet = Math.max(1, availableFleet);
        const demandRatio = activeRequests / safeFleet;

        if (demandRatio >= 8.0) {
            surgeMultiplier = 2.0;
            reasons.push('Extreme Demand Spike (>8x active requests)');
        } else if (demandRatio >= 4.0) {
            surgeMultiplier = 1.8;
            reasons.push('High Congestion Surge (>4x requests)');
        } else if (demandRatio > 2.0) {
            surgeMultiplier = 1.6;
            reasons.push('High Demand Zone (>2x booking requests vs available fleet)');
        } else if (demandRatio > 1.3) {
            surgeMultiplier = 1.25;
            reasons.push('Elevated Demand in Zone');
        } else if (demandRatio > 0.8) {
            surgeMultiplier = 1.1;
            reasons.push('Moderate Traffic Density');
        }

        // 2. Time-of-Day Rush Hour evaluation (Dhaka Commute Windows)
        let hour = -1;
        if (dateTime) {
            if (typeof dateTime === 'string' && dateTime.includes(':')) {
                const parts = dateTime.split(' ');
                const timeStr = parts.length > 1 ? parts[1] : (dateTime.includes('T') ? dateTime.split('T')[1] : null);
                if (timeStr) {
                    const parsed = parseInt(timeStr.split(':')[0], 10);
                    if (!isNaN(parsed)) hour = parsed;
                }
            }
            if (hour === -1) {
                const d = new Date(dateTime);
                if (!isNaN(d.getTime())) hour = d.getHours();
            }
        } else {
            hour = new Date().getHours();
        }

        const isMorningRush = (hour >= 8 && hour <= 10);
        const isEveningRush = (hour >= 17 && hour <= 20);
        const isLateNight = (hour >= 23 || (hour >= 0 && hour <= 4));

        if (isMorningRush) {
            surgeMultiplier = Math.max(surgeMultiplier, 1.25);
            reasons.push('Morning Peak Traffic Window');
        } else if (isEveningRush) {
            surgeMultiplier = Math.max(surgeMultiplier, 1.3);
            reasons.push('Evening Peak Commute Window');
        } else if (isLateNight) {
            surgeMultiplier = Math.max(surgeMultiplier, 1.15);
            reasons.push('Night Safety & Shift Premium');
        }

        // Cap maximum surge at 2.5x to preserve fair market standards
        surgeMultiplier = Math.min(2.5, parseFloat(surgeMultiplier.toFixed(2)));

        const reason = reasons.length > 0 ? reasons.join(' + ') : 'Standard Fare (No Surge)';

        return {
            multiplier: surgeMultiplier,
            surgeMultiplier,
            isSurgeActive: surgeMultiplier > 1.0,
            demandRatio: parseFloat(demandRatio.toFixed(2)),
            demandSupplyRatio: parseFloat(demandRatio.toFixed(2)),
            zone: zoneKey,
            reason,
            description: reason
        };
    }
}

module.exports = new SurgePricingEngine();
