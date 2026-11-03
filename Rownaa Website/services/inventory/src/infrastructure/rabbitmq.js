
const amqp = require('amqplib');
let channel;
async function connectMQ() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
        channel = await connection.createChannel();
        await channel.assertExchange('inventory_events', 'topic', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('RabbitMQ Connection Error:', error);
    }
}
function publishEvent(routingKey, data) {
    if (!channel) return;
    channel.publish('inventory_events', routingKey, Buffer.from(JSON.stringify(data)));
}
module.exports = { connectMQ, publishEvent };
