const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
        password: z.string().min(8).max(100),
        name: z.string().min(2).max(50),
        role: z.enum(['customer', 'owner', 'admin']).optional()
    })
});

const loginSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(30),
        password: z.string().min(8).max(100)
    })
});

module.exports = { registerSchema, loginSchema };
