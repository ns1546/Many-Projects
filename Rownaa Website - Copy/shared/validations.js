const { z } = require('zod');

// Shared Middleware
const validate = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ error: 'Payload validation failed', details: err.errors });
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
    customerName: z.string().optional(),
    ownerId: z.string().optional(),
    price: z.string().optional(),
    dateTime: z.string().optional(),
});

const updateBookingStatusSchema = z.object({
    status: z.enum(['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']),
});

// Inventory Schemas
const createCarSchema = z.object({
    brand: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    year: z.string().max(4),
    licensePlate: z.string().max(20),
    pricePerDay: z.string(),
    features: z.string().optional(),
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
