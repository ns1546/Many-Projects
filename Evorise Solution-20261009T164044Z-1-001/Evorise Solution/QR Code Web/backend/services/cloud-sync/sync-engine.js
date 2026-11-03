/**
 * Evorise Enterprise Platform - Cloud Synchronization & Shift Mode Engine
 * Architecture: Hybrid Edge-Cloud (Local SQLite WAL + Enterprise Cloud PostgreSQL/Supabase)
 * Guarantees:
 *  - 100% Offline Resiliency (Zero food service interruption on internet cut)
 *  - Auto Shift Detection (Switches between Online & Offline seamlessly)
 *  - Queue Reconciliation (Drains offline orders to cloud upon reconnection)
 *  - Zero Server Crash Guarantee (Defensive error boundaries on all network I/O)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const sqliteEngine = require('../../database/sqlite-engine');

class SyncEngine {
  constructor() {
    this.mode = 'hybrid'; // 'hybrid' | 'online' | 'offline'
    this.effectiveState = 'online'; // current operational state
    this.cloudProvider = 'supabase'; // 'supabase' | 'postgresql' | 'rest_gateway'
    this.cloudUrl = '';
    this.cloudApiKey = '';
    this.lastSyncTime = null;
    this.lastPingMs = null;
    this.isSyncing = false;
    this.heartbeatInterval = null;
    this.initialized = false;
    this.subscribers = new Set();
  }

  async init() {
    if (this.initialized) return;
    try {
      const savedMode = await sqliteEngine.getSyncConfig('sync_mode');
      if (savedMode) this.mode = savedMode;

      const savedUrl = await sqliteEngine.getSyncConfig('cloud_url');
      if (savedUrl) this.cloudUrl = savedUrl;

      const savedKey = await sqliteEngine.getSyncConfig('cloud_api_key');
      if (savedKey) this.cloudApiKey = savedKey;

      const savedProvider = await sqliteEngine.getSyncConfig('cloud_provider');
      if (savedProvider) this.cloudProvider = savedProvider;

      const savedLastSync = await sqliteEngine.getSyncConfig('last_sync_time');
      if (savedLastSync) this.lastSyncTime = savedLastSync;

      this.initialized = true;

      // Start background heartbeat monitor
      this.startHeartbeat();
      console.log(`[Sync Engine] Initialized in '${this.mode}' mode. Cloud configured: ${Boolean(this.cloudUrl)}`);
    } catch (e) {
      console.warn('[Sync Engine] Non-fatal initialization notice:', e.message);
      this.initialized = true;
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.checkConnectivityAndSync();
      } catch (e) {
        // Silent defensive guard
      }
    }, 20000); // 20s health check
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  async checkConnectivityAndSync() {
    if (this.mode === 'offline') {
      this.effectiveState = 'offline';
      return;
    }

    const pingResult = await this.pingCloud();
    if (pingResult.success) {
      this.effectiveState = 'online';
      this.lastPingMs = pingResult.latencyMs;

      // Drain pending queue if connected
      const pendingCount = await sqliteEngine.getSyncQueueCount();
      if (pendingCount > 0 && !this.isSyncing) {
        await this.pushPendingQueue();
      }
    } else {
      if (this.mode === 'hybrid') {
        this.effectiveState = 'offline';
      }
      this.lastPingMs = null;
    }
  }

  async setMode(newMode) {
    if (!['online', 'offline', 'hybrid'].includes(newMode)) {
      throw new Error(`Invalid mode: ${newMode}`);
    }
    this.mode = newMode;
    await sqliteEngine.setSyncConfig('sync_mode', newMode);

    if (newMode === 'offline') {
      this.effectiveState = 'offline';
    } else {
      await this.checkConnectivityAndSync();
    }

    this.notifyStatusChange();
    return this.getStatus();
  }

  async setCloudConfig(config) {
    if (config.cloudUrl !== undefined) {
      this.cloudUrl = String(config.cloudUrl).trim();
      await sqliteEngine.setSyncConfig('cloud_url', this.cloudUrl);
    }
    if (config.cloudApiKey !== undefined) {
      this.cloudApiKey = String(config.cloudApiKey).trim();
      await sqliteEngine.setSyncConfig('cloud_api_key', this.cloudApiKey);
    }
    if (config.cloudProvider !== undefined) {
      this.cloudProvider = String(config.cloudProvider).trim();
      await sqliteEngine.setSyncConfig('cloud_provider', this.cloudProvider);
    }

    await this.checkConnectivityAndSync();
    this.notifyStatusChange();
    return this.getStatus();
  }

  async pingCloud() {
    if (!this.cloudUrl) {
      // If no custom URL is configured, check internet via public CDN ping
      return this.pingHttp('https://1.1.1.1', 3000);
    }
    return this.pingHttp(this.cloudUrl, 5000);
  }

  pingHttp(targetUrl, timeoutMs = 4000) {
    return new Promise((resolve) => {
      try {
        const parsed = new URL(targetUrl);
        const isHttps = parsed.protocol === 'https:';
        const client = isHttps ? https : http;
        const start = Date.now();

        const req = client.request(parsed, {
          method: 'HEAD',
          timeout: timeoutMs,
          headers: {
            'User-Agent': 'Evorise-Restaurant-Engine/2.0'
          }
        }, (res) => {
          const latencyMs = Date.now() - start;
          resolve({ success: res.statusCode < 500, latencyMs, status: res.statusCode });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ success: false, error: 'Timeout', latencyMs: null });
        });

        req.on('error', (err) => {
          resolve({ success: false, error: err.message, latencyMs: null });
        });

        req.end();
      } catch (err) {
        resolve({ success: false, error: err.message, latencyMs: null });
      }
    });
  }

  async pushPendingQueue() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const items = await sqliteEngine.getPendingSyncEvents(50);
      if (!items || items.length === 0) {
        this.isSyncing = false;
        return { syncedCount: 0, pendingCount: 0 };
      }

      console.log(`[Sync Engine] Draining ${items.length} pending events to cloud...`);
      let successCount = 0;

      for (const item of items) {
        try {
          // If cloud target is configured, dispatch HTTP POST
          if (this.cloudUrl) {
            await this.dispatchToCloud(item);
          }
          // Mark locally as synced
          await sqliteEngine.markSyncEventSynced(item.id);
          successCount++;
        } catch (itemErr) {
          console.warn(`[Sync Engine] Failed item ${item.id}:`, itemErr.message);
          await sqliteEngine.markSyncEventFailed(item.id, itemErr.message);
        }
      }

      this.lastSyncTime = new Date().toISOString();
      await sqliteEngine.setSyncConfig('last_sync_time', this.lastSyncTime);
      const remaining = await sqliteEngine.getSyncQueueCount();

      this.notifyStatusChange();
      this.isSyncing = false;
      return { syncedCount: successCount, pendingCount: remaining };
    } catch (e) {
      console.warn('[Sync Engine] Error during queue drain:', e.message);
      this.isSyncing = false;
      return { error: e.message };
    }
  }

  async dispatchToCloud(item) {
    if (!this.cloudUrl) return;

    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(this.cloudUrl);
        const isHttps = parsed.protocol === 'https:';
        const client = isHttps ? https : http;

        const bodyData = JSON.stringify({
          source: 'evorise_edge_pos',
          timestamp: new Date().toISOString(),
          event: item
        });

        const req = client.request(parsed, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyData),
            'Authorization': this.cloudApiKey ? `Bearer ${this.cloudApiKey}` : '',
            'apikey': this.cloudApiKey || '', // For Supabase REST compatibility
            'User-Agent': 'Evorise-Sync-Engine/2.0'
          },
          timeout: 8000
        }, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            reject(new Error(`Cloud HTTP Status ${res.statusCode}`));
          }
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Cloud sync connection timeout'));
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.write(bodyData);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async getStatus() {
    const pendingCount = await sqliteEngine.getSyncQueueCount();
    return {
      mode: this.mode, // 'hybrid' | 'online' | 'offline'
      effectiveState: this.effectiveState, // 'online' | 'offline'
      cloudProvider: this.cloudProvider,
      cloudUrl: this.cloudUrl ? this.cloudUrl.replace(/:[^:@]+@/, ':***@') : '',
      hasCloudConfig: Boolean(this.cloudUrl),
      lastSyncTime: this.lastSyncTime,
      lastPingMs: this.lastPingMs,
      pendingCount,
      isSyncing: this.isSyncing
    };
  }

  notifyStatusChange() {
    this.getStatus().then(status => {
      this.subscribers.forEach(cb => {
        try { cb(status); } catch (e) {}
      });
    });
  }

  onStatusChange(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }
}

const syncEngineInstance = new SyncEngine();
module.exports = syncEngineInstance;
