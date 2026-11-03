const { z } = require('zod');

// Shared Middleware
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ success: false, error: 'Payload validation failed', details: err.errors });
    }
};

// Auth Schemas
const loginSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
});

const registerSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
    name: z.string().min(2).max(100),
    role: z.enum(['customer', 'owner']).optional(),
});

// Booking Schemas
const createBookingSchema = z.object({
    service: z.string().min(2).max(100),
    vehicle: z.string().min(1).max(100).optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    ownerId: z.string().optional(),
    price: z.string().optional(),
    dateTime: z.string().optional(),
}).passthrough();

const updateBookingStatusSchema = z.object({
    status: z.enum(['Pending', 'Confirmed', 'In Progress', 'Ongoing', 'Completed', 'Cancelled']).optional(),
    vehicle: z.string().optional(),
    driverName: z.string().optional(),
    driverPhone: z.string().optional(),
}).passthrough();

// Inventory Schemas
const createCarSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2).max(100),
    category: z.string().min(2).max(50),
    image: z.string().optional(),
    seats: z.number().int().min(1).max(50).optional(),
    bags: z.number().int().optional(),
    hasAc: z.boolean().optional(),
    serviceTags: z.union([z.array(z.string()), z.string()]).optional(),
    baseRate: z.number().min(0),
    isActive: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).optional(),
    ownerId: z.string().nullable().optional()
});

const updateCarSchema = createCarSchema.partial();

module.exports = {
    validate,
    loginSchema,
    registerSchema,
    createBookingSchema,
    updateBookingStatusSchema,
    createCarSchema,
    updateCarSchema
};
