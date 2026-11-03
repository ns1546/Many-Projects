
const app = require('./app');
const { connectMQ } = require('./infrastructure/rabbitmq');
const db = require('./infrastructure/database');
const cache = require('./infrastructure/cache');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    await connectMQ(); // Connect Message Broker
    
    const server = app.listen(PORT, () => {
        console.log(`[Inventory-Service] Enterprise Server running on port ${PORT}`);
    });

    // Graceful Shutdown (Kubernetes / Docker Standard)
    const shutdown = async (signal) => {
        console.log(`
${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            console.log('HTTP server closed.');
            await cache.quit(); // Close Redis
            // Close PG Pool
            console.log('Database connections closed.');
            process.exit(0);
        });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

bootstrap();
