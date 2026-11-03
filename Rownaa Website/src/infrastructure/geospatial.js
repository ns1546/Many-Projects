// ============================================================================
// ROWNAA GEOSPATIAL & FLEET DISPATCH ENGINE (Uber / Pathao Scale)
// Haversine Geodesic Distance, ETA Estimator, Zone Geofences & Fleet Dispatch
// ============================================================================

const EARTH_RADIUS_KM = 6371;

// Verified Geospatial Coordinates for Bangladesh Hubs & Dhaka Mega-Zones
const BASE_ZONES = {
    'airport':      { id: 'airport', zone: 'Dhaka Airport', name: 'Hazrat Shahjalal International Airport', lat: 23.8433, lng: 90.4043, trafficFactor: 1.1 },
    'gulshan':      { id: 'gulshan', zone: 'Gulshan 2', name: 'Gulshan Diplomatic Zone', lat: 23.7925, lng: 90.4078, trafficFactor: 1.4 },
    'banani':       { id: 'banani', zone: 'Banani', name: 'Banani Commercial Area', lat: 23.7940, lng: 90.4043, trafficFactor: 1.3 },
    'uttara':       { id: 'uttara', zone: 'Uttara', name: 'Uttara Residential Model Town', lat: 23.8759, lng: 90.3795, trafficFactor: 1.2 },
    'dhanmondi':    { id: 'dhanmondi', zone: 'Dhanmondi', name: 'Dhanmondi', lat: 23.7461, lng: 90.3742, trafficFactor: 1.5 },
    'mirpur':       { id: 'mirpur', zone: 'Mirpur', name: 'Mirpur', lat: 23.8071, lng: 90.3686, trafficFactor: 1.3 },
    'motijheel':    { id: 'motijheel', zone: 'Motijheel', name: 'Motijheel Commercial Area', lat: 23.7330, lng: 90.4172, trafficFactor: 1.6 },
    'bashundhara':  { id: 'bashundhara', zone: 'Bashundhara', name: 'Bashundhara R/A', lat: 23.8191, lng: 90.4526, trafficFactor: 1.1 },
    'mohammadpur':  { id: 'mohammadpur', zone: 'Mohammadpur', name: 'Mohammadpur', lat: 23.7658, lng: 90.3584, trafficFactor: 1.4 },
    'chittagong':   { id: 'chittagong', zone: 'Chittagong', name: 'Chittagong Hub', lat: 22.3569, lng: 91.7832, trafficFactor: 1.0 },
    'sylhet':       { id: 'sylhet', zone: 'Sylhet', name: 'Sylhet Hub', lat: 24.8949, lng: 91.8687, trafficFactor: 1.0 },
    'coxsbazar':    { id: 'coxsbazar', zone: "Cox's Bazar", name: "Cox's Bazar", lat: 21.4272, lng: 92.0058, trafficFactor: 1.0 },
    'rajshahi':     { id: 'rajshahi', zone: 'Rajshahi', name: 'Rajshahi Hub', lat: 24.3636, lng: 88.6241, trafficFactor: 1.0 },
    'khulna':       { id: 'khulna', zone: 'Khulna', name: 'Khulna Hub', lat: 22.8456, lng: 89.5403, trafficFactor: 1.0 },
    'barisal':      { id: 'barisal', zone: 'Barisal', name: 'Barisal Hub', lat: 22.7010, lng: 90.3535, trafficFactor: 1.0 }
};

// Aliases lookup
const ZONES = { ...BASE_ZONES };
for (const [key, item] of Object.entries(BASE_ZONES)) {
    ZONES[item.zone] = item;
    ZONES[item.name] = item;
}

class GeospatialEngine {
    constructor() {
        this.GEO_ZONES = ZONES;
    }

    /**
     * Compute Great-Circle Distance (Haversine formula) in kilometers
     */
    calculateDistanceKm(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 10.0; // standard default trip distance
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((EARTH_RADIUS_KM * c).toFixed(2));
    }

    haversineDistance(lat1, lon1, lat2, lon2) {
        return this.calculateDistanceKm(lat1, lon1, lat2, lon2);
    }

    /**
     * Estimate driving duration in minutes factoring city traffic density
     */
    estimateDurationMinutes(distKm, trafficFactor = 1.25) {
        // Average city transit speed ~22 km/h; highway ~50 km/h
        const avgSpeedKmh = distKm > 50 ? 55 : 22;
        const rawHours = distKm / avgSpeedKmh;
        const minutes = Math.round(rawHours * 60 * trafficFactor);
        return Math.max(10, minutes);
    }

    /**
     * Estimate driving duration with zone awareness
     */
    estimateDrivingETA(distKm, zoneOrFactor = 1.25) {
        let factor = 1.25;
        if (typeof zoneOrFactor === 'number') {
            factor = zoneOrFactor;
        } else if (typeof zoneOrFactor === 'string') {
            const z = this.resolveLocation(zoneOrFactor);
            factor = z.trafficFactor || 1.25;
        }
        return this.estimateDurationMinutes(distKm, factor);
    }

    /**
     * Fuzzy geocode any freeform location query to verified zone coordinates
     */
    resolveLocation(queryText) {
        if (!queryText || typeof queryText !== 'string') {
            return { ...BASE_ZONES['gulshan'], matched: 'default' };
        }
        const s = queryText.toLowerCase();

        for (const [key, zone] of Object.entries(BASE_ZONES)) {
            if (s.includes(key) || s.includes(zone.name.toLowerCase()) || s.includes(zone.zone.toLowerCase())) {
                return { ...zone, matched: key };
            }
        }

        // Neighborhood mappings
        if (s.includes('airport') || s.includes('biman') || s.includes('terminal') || s.includes('flight') || s.includes('shahjalal')) {
            return { ...BASE_ZONES['airport'], matched: 'airport' };
        }
        if (s.includes('gulshan') || s.includes('baridhara') || s.includes('niketan')) {
            return { ...BASE_ZONES['gulshan'], matched: 'gulshan' };
        }
        if (s.includes('banani') || s.includes('mohakhali') || s.includes('tejgaon')) {
            return { ...BASE_ZONES['banani'], matched: 'banani' };
        }
        if (s.includes('uttara') || s.includes('airport road') || s.includes('khilkhet') || s.includes('kawla')) {
            return { ...BASE_ZONES['uttara'], matched: 'uttara' };
        }
        if (s.includes('dhanmondi') || s.includes('shahbagh') || s.includes('farmgate')) {
            return { ...BASE_ZONES['dhanmondi'], matched: 'dhanmondi' };
        }
        if (s.includes('motijheel') || s.includes('paltan') || s.includes('shantinagar') || s.includes('wari')) {
            return { ...BASE_ZONES['motijheel'], matched: 'motijheel' };
        }
        if (s.includes('ctg') || s.includes('chattogram') || s.includes('chittagong')) {
            return { ...BASE_ZONES['chittagong'], matched: 'chittagong' };
        }

        return { ...BASE_ZONES['gulshan'], matched: 'fallback' };
    }

    /**
     * Detect closest zone given latitude and longitude coordinates
     */
    detectZone(lat, lng) {
        let closestZone = BASE_ZONES['gulshan'].zone;
        let minDistance = Infinity;

        for (const zone of Object.values(BASE_ZONES)) {
            const d = this.calculateDistanceKm(lat, lng, zone.lat, zone.lng);
            if (d < minDistance) {
                minDistance = d;
                closestZone = zone.zone;
            }
        }
        return closestZone;
    }

    /**
     * Uber/Pathao style Nearest Vehicle Matcher
     * Ranks available fleet vehicles by distance to pickup coordinate
     */
    findNearbyFleet(pickupLat, pickupLng, fleetCars, limitOrRadius = 10, maybeRadius = 25) {
        if (!Array.isArray(fleetCars) || fleetCars.length === 0) return [];

        let limit = 10;
        let radiusKm = 25;

        if (typeof limitOrRadius === 'number' && typeof maybeRadius === 'number') {
            limit = limitOrRadius;
            radiusKm = maybeRadius;
        } else if (typeof limitOrRadius === 'number') {
            radiusKm = limitOrRadius;
        }

        const assigned = fleetCars.map(car => {
            const fallbackZone = car.currentZone && ZONES[car.currentZone] ? ZONES[car.currentZone] : BASE_ZONES['gulshan'];
            const carLat = car.lat || fallbackZone.lat;
            const carLng = car.lng || fallbackZone.lng;

            const dist = this.calculateDistanceKm(pickupLat, pickupLng, carLat, carLng);
            const etaMinutes = this.estimateDurationMinutes(dist, fallbackZone.trafficFactor || 1.2);

            return {
                ...car,
                distanceKm: dist,
                estimatedMinutes: etaMinutes,
                etaMinutes: etaMinutes,
                isWithinRadius: dist <= radiusKm
            };
        });

        // Filter within radius if applicable, then sort by proximity
        const filtered = assigned.filter(c => c.isWithinRadius);
        const sorted = (filtered.length > 0 ? filtered : assigned).sort((a, b) => a.distanceKm - b.distanceKm);

        return sorted.slice(0, limit);
    }

    getAllZones() {
        return Object.values(BASE_ZONES);
    }
}

const instance = new GeospatialEngine();
instance.GEO_ZONES = ZONES;
module.exports = instance;
module.exports.GEO_ZONES = ZONES;
