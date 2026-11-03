/**
 * Enterprise Dispatch & Fleet Matching Service
 * High-performance nearest-neighbor dispatching inspired by Uber / Pathao.
 */

const geospatial = require('../../infrastructure/geospatial');
const surgeEngine = require('../pricing/surge.engine');
const pricingService = require('../pricing/pricing.service');
const inventoryService = require('../inventory/inventory.service');
const eventBus = require('../../infrastructure/eventBus');
const { AppError } = require('../../middlewares/errorHandler');

class DispatchService {
    /**
     * Locate nearest active fleet vehicles to a given pickup point
     */
    async findNearbyFleet({ lat, lng, pickupLocation, category, limit = 10, maxRadiusKm = 25 }) {
        let pickupCoords = { lat, lng };

        if (!pickupCoords.lat || !pickupCoords.lng) {
            if (!pickupLocation) {
                throw new AppError('Either lat/lng coordinates or pickupLocation string is required.', 400);
            }
            const resolved = geospatial.resolveLocation(pickupLocation);
            pickupCoords = { lat: resolved.lat, lng: resolved.lng, zone: resolved.zone };
        } else {
            pickupCoords.zone = geospatial.detectZone(pickupCoords.lat, pickupCoords.lng);
        }

        // Fetch all active fleet
        const fleet = await inventoryService.getInventory({ includeDeleted: false });

        // Filter by category if requested
        let candidates = fleet;
        if (category) {
            const catLower = category.toLowerCase();
            candidates = fleet.filter(car => 
                (car.category && car.category.toLowerCase().includes(catLower)) ||
                (car.name && car.name.toLowerCase().includes(catLower))
            );
        }

        // Run Great-Circle Haversine nearest-neighbor dispatch ranking
        const rankedVehicles = geospatial.findNearbyFleet(
            pickupCoords.lat,
            pickupCoords.lng,
            candidates,
            parseInt(limit),
            parseFloat(maxRadiusKm)
        );

        // Fetch current surge status for this zone
        const surge = surgeEngine.calculateSurge(pickupCoords.zone);

        return {
            pickup: {
                location: pickupLocation || `${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)}`,
                lat: pickupCoords.lat,
                lng: pickupCoords.lng,
                zone: pickupCoords.zone
            },
            surge: {
                multiplier: surge.multiplier,
                isSurgeActive: surge.isSurgeActive,
                reason: surge.reason
            },
            totalCandidates: candidates.length,
            nearbyCount: rankedVehicles.length,
            fleet: rankedVehicles
        };
    }

    /**
     * Calculate Uber/Pathao style trip estimate with distance, ETA, surge, and pricing
     */
    async estimateTrip({ pickupLocation, dropoffLocation, category, service = 'hourly', isRoundTrip = false, nights = 0, days = 1, promoCode }) {
        if (!pickupLocation || !dropoffLocation) {
            throw new AppError('Both pickupLocation and dropoffLocation are required for trip estimation.', 400);
        }

        const pickupGeo = geospatial.resolveLocation(pickupLocation);
        const dropoffGeo = geospatial.resolveLocation(dropoffLocation);

        const distanceKm = geospatial.haversineDistance(pickupGeo.lat, pickupGeo.lng, dropoffGeo.lat, dropoffGeo.lng);
        const estimatedMinutes = geospatial.estimateDrivingETA(distanceKm, pickupGeo.zone);
        const surge = surgeEngine.calculateSurge(pickupGeo.zone);

        // Calculate authoritative fare
        const fareQuote = await pricingService.calculate({
            service,
            category,
            zone: pickupGeo.zone,
            distance: distanceKm,
            isRoundTrip,
            nights,
            days,
            promoCode
        });

        // Apply surge multiplier to estimate total if surge is active
        const baseTotal = fareQuote.total || 0;
        const surgedTotal = Math.round(baseTotal * surge.multiplier);

        return {
            route: {
                pickup: {
                    name: pickupLocation,
                    lat: pickupGeo.lat,
                    lng: pickupGeo.lng,
                    zone: pickupGeo.zone
                },
                dropoff: {
                    name: dropoffLocation,
                    lat: dropoffGeo.lat,
                    lng: dropoffGeo.lng,
                    zone: dropoffGeo.zone
                },
                distanceKm,
                estimatedMinutes
            },
            surge: {
                multiplier: surge.multiplier,
                isSurgeActive: surge.isSurgeActive,
                reason: surge.reason
            },
            fareBreakdown: {
                ...fareQuote,
                subtotal: baseTotal,
                surgeMultiplier: surge.multiplier,
                estimatedTotal: surgedTotal
            }
        };
    }

    /**
     * Live GPS ping telemetry update for a vehicle in the fleet
     */
    async recordTelemetryPing({ vehicleId, lat, lng, heading = 0, speed = 0 }, user) {
        if (!vehicleId || lat === undefined || lng === undefined) {
            throw new AppError('vehicleId, lat, and lng are required for telemetry ping.', 400);
        }

        const currentZone = geospatial.detectZone(lat, lng);
        const updated = await inventoryService.updateLocation(vehicleId, {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            currentZone
        });

        // Broadcast telemetry ping on eventBus
        const pingEvent = {
            vehicleId,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            heading,
            speed,
            currentZone,
            timestamp: new Date().toISOString()
        };

        await eventBus.publish('telemetry:location_updated', pingEvent, { broadcastWs: true });

        return {
            success: true,
            telemetry: pingEvent,
            vehicle: updated
        };
    }
}

module.exports = new DispatchService();
