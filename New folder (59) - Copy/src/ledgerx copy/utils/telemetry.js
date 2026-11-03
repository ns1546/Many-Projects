/**
 * LedgerX Enterprise Telemetry & Client Flight-Recorder Engine
 * Modeled on Datadog / Sentry / Google Analytics architecture.
 * 
 * Features:
 * 1. Rolling Action Flight-Recorder (retains last 50 UI actions to diagnose exact steps leading to crash)
 * 2. Silent Remote Crash Telemetry (dispatches unhandled errors to backend /api/telemetry/crash-report)
 * 3. Machine & Environment Fingerprint collector
 * 4. Zero performance overhead (buffered async dispatch, non-blocking)
 */

class TelemetryEngine {
  constructor() {
    this.actionHistory = [];
    this.maxHistory = 50;
    this.backendUrl = 'http://localhost:3001';
    this.tenantId = 'DEFAULT_TENANT';
    this.appVersion = '6.0.0';
    this.isInitialized = false;
  }

  /**
   * Initializes global crash hooks on window object
   */
  init(tenantId = 'DEFAULT_TENANT', appVersion = '6.0.0', backendUrl = 'http://localhost:3001') {
    if (this.isInitialized) return;
    this.tenantId = tenantId;
    this.appVersion = appVersion;
    this.backendUrl = backendUrl;

    if (typeof window !== 'undefined') {
      // 1. Global unhandled error hook
      window.addEventListener('error', (event) => {
        this.captureCrash(event.error || new Error(event.message), {
          type: 'UNCAUGHT_GLOBAL_ERROR',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      // 2. Global unhandled promise rejection hook
      window.addEventListener('unhandledrejection', (event) => {
        this.captureCrash(event.reason || new Error('Unhandled Promise Rejection'), {
          type: 'UNHANDLED_PROMISE_REJECTION',
        });
      });

      this.isInitialized = true;
      this.recordAction('SYSTEM_BOOT', { version: appVersion, timestamp: Date.now() });
    }
  }

  /**
   * Records a user/system action into the in-memory flight recorder ring buffer
   */
  recordAction(actionName, metadata = {}) {
    const entry = {
      action: actionName,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.actionHistory.push(entry);
    if (this.actionHistory.length > this.maxHistory) {
      this.actionHistory.shift();
    }
  }

  /**
   * Captures and reports a crash report to central backend & local emergency store
   */
  async captureCrash(error, context = {}) {
    try {
      const errorPayload = {
        tenantId: this.tenantId,
        appVersion: this.appVersion,
        timestamp: new Date().toISOString(),
        error: error?.message || String(error),
        stack: error?.stack || null,
        context,
        flightRecorder: [...this.actionHistory],
        systemInfo: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
          screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
          url: typeof window !== 'undefined' ? window.location.href : '',
          memory: typeof performance !== 'undefined' && performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
          } : null,
        },
      };

      // 1. Save emergency snapshot locally
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('LX_LAST_CRASH_SNAPSHOT', JSON.stringify(errorPayload));
      }

      // 2. Silently dispatch to backend server (Fire & Forget, timeout 2000ms)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      fetch(`${this.backendUrl}/api/telemetry/crash-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorPayload),
        signal: controller.signal,
      }).catch(() => {
        // Silent catch: network may be offline, local snapshot already captured
      }).finally(() => {
        clearTimeout(timeoutId);
      });

      return errorPayload;
    } catch (e) {
      console.error('[Telemetry Failure]', e);
      return null;
    }
  }

  /**
   * Retrieves current flight recorder log
   */
  getFlightLog() {
    return [...this.actionHistory];
  }
}

export const telemetry = new TelemetryEngine();
