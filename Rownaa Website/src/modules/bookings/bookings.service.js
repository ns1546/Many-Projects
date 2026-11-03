const { randomUUID } = require('crypto');
const bookingsRepo = require('./bookings.repository');
const db = require('../../config/db');
const { AppError } = require('../../middlewares/errorHandler');
const lockManager = require('../../infrastructure/lockManager');
const geospatial = require('../../infrastructure/geospatial');
const surgeEngine = require('../pricing/surge.engine');
const eventBus = require('../../infrastructure/eventBus');
const smsService = require('../sms/sms.service');

class BookingsService {
    setSocketIO(io) {
        this.io = io;
        smsService.setSocketIO(io);
    }

    async getBookings({ user, page = 1, limit = 10, status, search, includeDeleted = false, ownerId, customerId }) {
        const offset = (page - 1) * limit;
        
        let targetOwnerId = ownerId;
        let targetCustomerId = customerId;

        // Enforce RBAC
        if (user.role === 'customer') {
            targetCustomerId = user.userId;
        } else if (user.role === 'owner') {
            targetOwnerId = user.userId;
        }

        const data = await bookingsRepo.findAll({
            limit,
            offset,
            status,
            customerId: targetCustomerId,
            ownerId: targetOwnerId,
            includeDeleted: user.role === 'admin' ? includeDeleted : false
        });

        const total = await bookingsRepo.count({
            status,
            customerId: targetCustomerId,
            ownerId: targetOwnerId,
            includeDeleted: user.role === 'admin' ? includeDeleted : false
        });

        return {
            data,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit) || 1
        };
    }

    async getBookingById(id, user) {
        const booking = await bookingsRepo.findById(id);
        if (!booking) {
            throw new AppError('Booking not found', 404);
        }

        if (user && user.role === 'customer' && booking.customerId !== user.userId) {
            throw new AppError('Forbidden: Access denied to this booking', 403);
        }
        if (user && user.role === 'owner' && booking.ownerId !== user.userId) {
            throw new AppError('Forbidden: Access denied to this booking', 403);
        }

        return booking;
    }

    async createBooking(bookingData, user) {
        let vehicleName = bookingData.vehicle;
        if (!vehicleName && bookingData.service) {
            const parts = bookingData.service.split(' - ');
            if (parts.length > 1) {
                vehicleName = parts[1].trim();
            }
        }
        if (!vehicleName) vehicleName = 'Toyota Axio';

        // 1. Verify vehicle in inventory
        const car = await db.queryOne(
            'SELECT * FROM inventory WHERE name LIKE ? AND deletedAt IS NULL',
            [`%${vehicleName}%`]
        );

        if (!car) {
            throw new AppError(`Vehicle '${vehicleName}' is currently not available in our fleet.`, 404);
        }

        const targetDateTime = bookingData.dateTime || 'Immediate Dispatch';
        const lockKey = `booking:${car.name}:${targetDateTime}`;

        // Uber/Pathao Concurrency Mutex: Prevent race conditions & simultaneous double bookings
        return await lockManager.withLock(lockKey, async () => {
            // 2. Prevent Double Booking
            const conflicting = await bookingsRepo.findConflictingBooking(car.name, targetDateTime);
            if (conflicting) {
                throw new AppError('Double booking detected: This vehicle is already reserved for the selected date and time.', 409);
            }

            // 3. Geospatial & Telemetry Calculation
            const pickupGeo = (bookingData.pickupLat && bookingData.pickupLng)
                ? { lat: bookingData.pickupLat, lng: bookingData.pickupLng, zone: bookingData.pickupZone || 'Dhaka Central' }
                : geospatial.resolveLocation(bookingData.pickupLocation || 'Dhaka');

            const dropoffGeo = (bookingData.dropoffLat && bookingData.dropoffLng)
                ? { lat: bookingData.dropoffLat, lng: bookingData.dropoffLng, zone: bookingData.dropoffZone || 'Dhaka Central' }
                : geospatial.resolveLocation(bookingData.dropoffLocation || 'Destination');

            let distanceKm = bookingData.distanceKm;
            let estimatedMinutes = bookingData.estimatedMinutes;
            if (!distanceKm && pickupGeo.lat && dropoffGeo.lat) {
                distanceKm = geospatial.haversineDistance(pickupGeo.lat, pickupGeo.lng, dropoffGeo.lat, dropoffGeo.lng);
                estimatedMinutes = geospatial.estimateDrivingETA(distanceKm, pickupGeo.zone);
            }

            // Dynamic Surge Pricing evaluation
            const surgeData = surgeEngine.calculateSurge(pickupGeo.zone || 'Dhaka Central', targetDateTime);
            const surgeMultiplier = bookingData.surgeMultiplier || surgeData.multiplier || 1.0;

            // 4. Construct authoritative booking record
            const id = randomUUID();
            const authenticPrice = bookingData.price || `৳${car.baseRate}`;
            const serviceString = bookingData.service ? (bookingData.service.includes(car.name) ? bookingData.service : `${bookingData.service} - ${car.name}`) : `Standard Rental - ${car.name}`;

            const newBooking = {
                id,
                service: serviceString,
                vehicle: car.name,
                customerName: bookingData.customerName || (user && user.name) || 'Valued Customer',
                customerId: (user && user.userId) ? user.userId : (bookingData.customerId || 'cust-1'),
                customerPhone: bookingData.customerPhone || '',
                pickupLocation: bookingData.pickupLocation || 'Dhaka',
                dropoffLocation: bookingData.dropoffLocation || 'Destination',
                ownerId: car.ownerId || 'biz-001',
                price: authenticPrice,
                status: 'Pending',
                dateTime: targetDateTime,
                createdAt: new Date().toISOString(),
                pickupLat: pickupGeo.lat || null,
                pickupLng: pickupGeo.lng || null,
                dropoffLat: dropoffGeo.lat || null,
                dropoffLng: dropoffGeo.lng || null,
                distanceKm: distanceKm || null,
                estimatedMinutes: estimatedMinutes || null,
                surgeMultiplier: surgeMultiplier
            };

            const created = await bookingsRepo.create(newBooking);

            // 1. Dispatch Booking Confirmation SMS to Customer
            const custPhone = newBooking.customerPhone || '+880 1712-345678';
            await smsService.dispatch({
                recipient: custPhone,
                recipientRole: 'customer',
                message: `Your Rownaa booking #${id.slice(0, 8)} for ${car.name} is confirmed! Route: ${newBooking.pickupLocation || 'Pickup'} -> ${newBooking.dropoffLocation || 'Destination'}. Fare: ${newBooking.price || 'BDT 2,500'}. Chauffeur will be assigned shortly.`,
                type: 'booking_confirmation',
                bookingId: id
            });

            // 2. Dispatch Booking Alert SMS to Operations / Admin
            await smsService.dispatch({
                recipient: 'Operations Dispatch (+880 1700-000000)',
                recipientRole: 'admin',
                message: `[NEW BOOKING ALERT] Trip #${id.slice(0, 8)} booked by ${newBooking.customerName || 'Customer'} (${custPhone}) for ${car.name}. Schedule: ${targetDateTime}. Route: ${newBooking.pickupLocation || 'As directed'} -> ${newBooking.dropoffLocation || 'Destination'}.`,
                type: 'admin_booking_alert',
                bookingId: id
            });

            // 3. Auto-create persistent notification for admin
            await db.execute(
                `INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt)
                 VALUES (?, ?, ?, ?, ?, 0, ?)`,
                [
                    `notif-${randomUUID().slice(0, 8)}`,
                    'admin',
                    'New Booking Confirmed (SMS Sent)',
                    `Booking #${id.slice(0, 8)} for ${car.name} by ${newBooking.customerName || 'Customer'} (${custPhone}). Confirmation SMS dispatched.`,
                    'success',
                    new Date().toISOString()
                ]
            );

            // Auto-create persistent notification for car owner
            if (newBooking.ownerId) {
                await db.execute(
                    `INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt)
                     VALUES (?, ?, ?, ?, ?, 0, ?)`,
                    [
                        `notif-${randomUUID().slice(0, 8)}`,
                        newBooking.ownerId,
                        'New Booking Request',
                        `New booking #${id.slice(0, 8)} for ${car.name} on ${targetDateTime}.`,
                        'info',
                        new Date().toISOString()
                    ]
                );
            }

            // Publish Domain Event & Emit Socket.io
            await eventBus.publish('booking:created', created, {
                room: `owner_${newBooking.ownerId}`,
                broadcastWs: true
            });

            if (this.io) {
                this.io.emit('booking_created', created);
            }

            return created;
        });
    }

    async updateStatus(id, newStatus, user) {
        const existing = await bookingsRepo.findById(id);
        if (!existing) {
            throw new AppError('Booking not found', 404);
        }

        // RBAC on Status updates
        if (user.role === 'customer' && existing.customerId !== user.userId) {
            throw new AppError('Forbidden: You can only update your own bookings.', 403);
        }
        if (user.role === 'owner' && existing.ownerId !== user.userId) {
            throw new AppError('Forbidden: You can only update bookings for your assigned fleet.', 403);
        }

        const statusStr = typeof newStatus === 'string' ? newStatus : (newStatus.status || existing.status);
        const updated = await bookingsRepo.updateStatus(id, newStatus);

        // Auto-create notification for customer
        if (existing.customerId) {
            const driverInfo = typeof newStatus === 'object' && newStatus.driverName ? ` Assigned Driver: ${newStatus.driverName} (${newStatus.driverPhone || 'Contact assigned'}).` : '';
            await db.execute(
                `INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt)
                 VALUES (?, ?, ?, ?, ?, 0, ?)`,
                [
                    `notif-${randomUUID().slice(0, 8)}`,
                    existing.customerId,
                    `Trip Status Updated: ${statusStr}`,
                    `Your booking for ${existing.vehicle || existing.service} is now marked as ${statusStr}.${driverInfo}`,
                    statusStr === 'Confirmed' ? 'success' : 'info',
                    new Date().toISOString()
                ]
            );
        }

        // When driver is assigned or status updated with chauffeur details
        if (typeof newStatus === 'object' && newStatus.driverName) {
            const driverPhone = newStatus.driverPhone || '+880 1715-998877';
            // 1. Dispatch Driver Assignment SMS to Driver
            await smsService.dispatch({
                recipient: driverPhone,
                recipientRole: 'driver',
                message: `Rownaa Chauffeur Dispatch: You are assigned to Trip #${id.slice(0, 8)} (${newStatus.vehicle || existing.vehicle || 'Vehicle'}). Rider: ${existing.customerName} (${existing.customerPhone || 'N/A'}). Pickup: ${existing.pickupLocation || 'As directed'} -> ${existing.dropoffLocation || 'Destination'}.`,
                type: 'driver_assigned',
                bookingId: id
            });

            // 2. Dispatch Chauffeur Assignment SMS to Customer
            const riderPhone = existing.customerPhone || '+880 1712-345678';
            await smsService.dispatch({
                recipient: riderPhone,
                recipientRole: 'customer',
                message: `Chauffeur Assigned! ${newStatus.driverName} (${driverPhone}) will arrive in ${newStatus.vehicle || existing.vehicle || 'your assigned car'} for booking #${id.slice(0, 8)}.`,
                type: 'chauffeur_assigned',
                bookingId: id
            });

            // 3. Persistent notification for admin
            await db.execute(
                `INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt)
                 VALUES (?, ?, ?, ?, ?, 0, ?)`,
                [
                    `notif-${randomUUID().slice(0, 8)}`,
                    'admin',
                    'Driver Assigned (SMS Sent)',
                    `Trip #${id.slice(0, 8)} assigned to chauffeur ${newStatus.driverName} (${driverPhone}). Dispatch SMS sent to rider and driver.`,
                    'success',
                    new Date().toISOString()
                ]
            );
        }

        // Publish Domain Event & Emit Socket.io
        await eventBus.publish('booking:status_updated', updated, {
            room: `user_${existing.customerId}`,
            broadcastWs: true
        });

        if (this.io) {
            this.io.emit('booking_updated', updated);
        }

        return updated;
    }

    async deleteBooking(id, user) {
        const existing = await bookingsRepo.findById(id);
        if (!existing) {
            throw new AppError('Booking not found', 404);
        }

        if (user.role === 'customer' && existing.customerId !== user.userId) {
            throw new AppError('Forbidden', 403);
        }
        if (user.role === 'owner' && existing.ownerId !== user.userId) {
            throw new AppError('Forbidden', 403);
        }

        await bookingsRepo.softDelete(id);
        return { success: true };
    }

    async restoreBooking(id, user) {
        if (user.role !== 'admin') {
            throw new AppError('Forbidden: Only administrators can restore deleted bookings.', 403);
        }
        return await bookingsRepo.restore(id);
    }
}

module.exports = new BookingsService();
