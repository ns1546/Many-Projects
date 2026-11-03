const { AppError } = require('./errorHandler');

const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse(req.body);
        req.body = parsed;
        next();
    } catch (err) {
        if (err.errors && Array.isArray(err.errors)) {
            const issues = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new AppError(`Validation Error: ${issues}`, 400));
        }
        return next(new AppError(err.message || 'Validation failed', 400));
    }
};

module.exports = {
    validate
};
