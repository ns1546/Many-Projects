// Global Error Handler to prevent the server from crashing on unhandled exceptions
const errorHandler = (err, req, res, next) => {
    console.error('CRITICAL SERVER ERROR:', err.stack);
    
    // Distinguish between operational errors and programming errors
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred. Our engineers have been notified.' 
        : err.message;

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};

const notFoundHandler = (req, res, next) => {
    // If it's an API route that wasn't found
    if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({ error: 'API Endpoint Not Found' });
    }
    // Otherwise fallback to letting express.static serve index.html or handle 404s on frontend
    next();
};

module.exports = { errorHandler, notFoundHandler };
