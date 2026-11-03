/**
 * Enterprise Asynchronous Event Bus & Domain Telemetry Broker
 * Inspired by Uber Cadence / Apache Kafka event patterns.
 * 
 * Provides:
 * - In-process publish/subscribe with asynchronous error isolation
 * - Pluggable WebSocket forwarding (Socket.io bridge)
 * - Domain event metric tracking and auditing
 * - Thread-safe listener registration
 */

const { EventEmitter } = require('events');

class EnterpriseEventBus {
    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(100);
        this.io = null;

        // Metric instrumentation
        this.metrics = {
            totalEmitted: 0,
            eventCounts: {},
            lastEmittedAt: null,
            errorsCount: 0
        };

        // Listen for internal unhandled errors in subscribers
        this.emitter.on('error', (err) => {
            this.metrics.errorsCount++;
            console.error('[EventBus] Internal subscriber error:', err);
        });
    }

    /**
     * Bind Socket.io instance to auto-relay domain events to WebSocket clients
     */
    setSocketIO(io) {
        this.io = io;
    }

    /**
     * Subscribe to a domain event
     * @param {string} event 
     * @param {Function} handler 
     */
    subscribe(event, handler) {
        this.emitter.on(event, async (data) => {
            try {
                await handler(data);
            } catch (err) {
                this.metrics.errorsCount++;
                console.error(`[EventBus] Error executing subscriber for '${event}':`, err.message);
            }
        });
        return this;
    }

    /**
     * Alias for subscribe
     */
    on(event, handler) {
        return this.subscribe(event, handler);
    }

    /**
     * Subscribe once to a domain event
     */
    once(event, handler) {
        this.emitter.once(event, async (data) => {
            try {
                await handler(data);
            } catch (err) {
                this.metrics.errorsCount++;
                console.error(`[EventBus] Error executing once-subscriber for '${event}':`, err.message);
            }
        });
        return this;
    }

    /**
     * Unsubscribe a handler
     */
    unsubscribe(event, handler) {
        this.emitter.off(event, handler);
        return this;
    }

    off(event, handler) {
        return this.unsubscribe(event, handler);
    }

    /**
     * Publish an asynchronous domain event
     * @param {string} event e.g. 'booking:created', 'fleet:location_updated'
     * @param {any} payload 
     * @param {object} [options]
     */
    async publish(event, payload = {}, options = {}) {
        this.metrics.totalEmitted++;
        this.metrics.eventCounts[event] = (this.metrics.eventCounts[event] || 0) + 1;
        this.metrics.lastEmittedAt = new Date().toISOString();

        const envelope = {
            eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            event,
            timestamp: new Date().toISOString(),
            payload
        };

        // Emit internally to all local Node subscribers asynchronously
        setImmediate(() => {
            this.emitter.emit(event, envelope);
        });

        // Forward to WebSocket if active and requested
        if (this.io && options.broadcastWs !== false) {
            try {
                if (options.room) {
                    this.io.to(options.room).emit(event, envelope);
                } else {
                    this.io.emit(event, envelope);
                }
            } catch (wsErr) {
                console.warn('[EventBus] WebSocket relay notice:', wsErr.message);
            }
        }

        return envelope;
    }

    /**
     * Alias for publish
     */
    emit(event, payload, options) {
        return this.publish(event, payload, options);
    }

    /**
     * Retrieve Event Bus operational telemetry
     */
    getMetrics() {
        return {
            totalEmitted: this.metrics.totalEmitted,
            eventCounts: { ...this.metrics.eventCounts },
            lastEmittedAt: this.metrics.lastEmittedAt,
            errorsCount: this.metrics.errorsCount,
            registeredEvents: this.emitter.eventNames()
        };
    }
}

// Export singleton instance
module.exports = new EnterpriseEventBus();
