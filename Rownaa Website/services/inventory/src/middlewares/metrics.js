
// Mock representation of Prom-Client for metrics collection
module.exports = (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        // In reality, this records to a prometheus histogram
        // prometheusHistogram.labels(req.method, req.route.path, res.statusCode).observe(time);
    });
    next();
};
