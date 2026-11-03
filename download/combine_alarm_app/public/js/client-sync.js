/**
 * CombineAlarm Client-Sync Protocol
 * Robust WebSocket communication with auto-reconnect, local state persistence,
 * and battery telemetry.
 */
class ClientSync {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 20;
    this.reconnectDelay = 2000;
    this.listeners = new Map(); // event -> array of callbacks
    this.isConnected = false;

    // Load or generate device ID and user profile
    this.deviceId = localStorage.getItem('combine_device_id') || this.generateUUID();
    localStorage.setItem('combine_device_id', this.deviceId);

    this.deviceName = localStorage.getItem('combine_device_name') || this.generateDefaultName();
    this.roomId = localStorage.getItem('combine_room_id') || 'ALPHA-7';
    this.serverHost = localStorage.getItem('combine_server_host') || '';
  }

  generateUUID() {
    return 'dev-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
  }

  generateDefaultName() {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const os = isMobile ? (navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Android') : 'PC';
    const rand = Math.floor(100 + Math.random() * 900);
    return `${os} #${rand}`;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try { cb(data); } catch (e) { console.error('Listener error:', e); }
      });
    }
  }

  async getBatteryLevel() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        return Math.round(battery.level * 100);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async requestNotificationPermission() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return null;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = 'BHeTFhLZC_3Zci-uze7szf9SyhBGTmlzd_eS3MlWEAC7ycZdP4yv-Kv0e26SByxB4v7UX5xYOPR8ToNwmNi0_yI';
        
        const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
        const base64 = (vapidPublicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: outputArray
        });

        console.log('✅ Web Push / FCM subscription active:', subscription.endpoint);
        this.send({
          type: 'REGISTER_FCM_TOKEN',
          fcmToken: JSON.stringify(subscription)
        });
        return subscription;
      }
    } catch (e) {
      console.warn('Push notification subscription info:', e);
    }
    return null;
  }

  setServerHost(newHost) {
    if (newHost && newHost.trim()) {
      localStorage.setItem('combine_server_host', newHost.trim());
      this.serverHost = newHost.trim();
    } else {
      localStorage.removeItem('combine_server_host');
      this.serverHost = '';
    }
    this.reconnectAttempts = 0;
    this.connect();
  }

  connect() {
    let savedHost = localStorage.getItem('combine_server_host');

    // Purge old dead tunnels from localStorage
    if (savedHost && (savedHost.includes('loca.lt') || savedHost.includes('calm-rocks') || savedHost.includes('five-zebras'))) {
      localStorage.removeItem('combine_server_host');
      savedHost = null;
    }

    let host = savedHost;

    // If opened directly in a browser (e.g. on another phone), always use that browser's host
    if (typeof window !== 'undefined' && window.location.host && !window.location.hostname.startsWith('localhost') && !window.location.hostname.startsWith('127.0.0.1')) {
      host = window.location.host;
    }

    const activeCloudTunnel = 'rca-tested-episode-belkin.trycloudflare.com';
    const localLanHost = '192.168.0.100:3000';

    if (!host) {
      if (typeof window !== 'undefined' && window.location.host && !window.location.hostname.startsWith('localhost') && !window.location.hostname.startsWith('127.0.0.1')) {
        host = window.location.host;
      } else {
        // APK or Localhost: Try Cloudflare Tunnel first (works globally over 4G/Cellular), then fallback to LAN IP
        const pool = [activeCloudTunnel, localLanHost];
        host = pool[this.reconnectAttempts % pool.length];
      }
    }

    // Clean up host string
    const cleanHost = host.replace(/^https?:\/\//i, '').replace(/^wss?:\/\//i, '').replace(/\/$/, '');

    // Determine secure WebSocket: if current page is HTTPS, or host is Cloudflare/tunnel/not an IP:3000, use wss:
    const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isCloudHost = cleanHost.includes('.trycloudflare.com') || cleanHost.includes('.loca.lt') || (!cleanHost.includes('192.168.') && !cleanHost.includes('localhost') && !cleanHost.includes(':3000'));
    const protocol = (isHttpsPage || isCloudHost) ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${cleanHost}`;

    console.log(`🔌 [Auto-Connect] Target: ${wsUrl} (Attempt #${this.reconnectAttempts + 1})`);
    try {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        this.ws.close();
      }
    } catch (e) {}

    try {
      this.ws = new WebSocket(wsUrl);
    } catch (err) {
      console.warn('WebSocket init error:', err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = async () => {
      console.log(`✅ Connected to Evo Alarm Server at: ${wsUrl}`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true, host: host });

      const battery = await this.getBatteryLevel();

      // Request native notification and Web Push permission
      this.requestNotificationPermission();

      // Send join room packet
      this.send({
        type: 'JOIN_ROOM',
        roomId: this.roomId,
        deviceId: this.deviceId,
        deviceName: this.deviceName,
        platform: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        battery
      });

      // Flush any actions that were queued while offline
      if (Array.isArray(this.pendingQueue) && this.pendingQueue.length > 0) {
        console.log(`📤 Flushing ${this.pendingQueue.length} queued offline packets to server...`);
        const queue = [...this.pendingQueue];
        this.pendingQueue = [];
        queue.forEach(item => this.send(item));
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (err) {
        console.error('Failed to parse incoming message:', err);
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.emit('connection_status', { connected: false });
      console.warn('❌ Disconnected from Evo Alarm Server. Auto-reconnecting...');
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      try { this.ws.close(); } catch (e) {}
    };
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(1.2, this.reconnectAttempts), 8000);
      setTimeout(() => this.connect(), delay);
    }
  }

  send(data) {
    if (!this.pendingQueue) this.pendingQueue = [];
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not open. Action saved to offline queue:', data.type);
      if (['CREATE_ALARM', 'UPDATE_ALARM', 'DELETE_ALARM', 'ADD_MANUAL_MEMBER', 'DELETE_MEMBER'].includes(data.type)) {
        this.pendingQueue.push(data);
      }
    }
  }

  handleMessage(data) {
    const { type } = data;
    switch (type) {
      case 'ROOM_STATE_SYNC':
        this.emit('room_state_sync', data);
        break;
      case 'DEVICE_LIST_UPDATED':
        this.emit('devices_updated', data.devices);
        if (data.members) this.emit('members_updated', data.members);
        break;
      case 'MEMBERS_LIST_UPDATED':
        this.emit('members_updated', data.members);
        if (data.devices) this.emit('devices_updated', data.devices);
        break;
      case 'ALARM_LIST_UPDATED':
        this.emit('alarms_updated', data);
        break;
      case 'ALARM_RING_TRIGGERED':
        this.emit('alarm_ring_triggered', data);
        break;
      case 'ALARM_DISMISSED':
        this.emit('alarm_dismissed', data);
        break;
      case 'USER_CHECKED_IN':
        this.emit('user_checked_in', data);
        break;
      case 'ALARM_SNOOZED':
        this.emit('alarm_snoozed', data);
        break;
      case 'ROOM_LOG':
        this.emit('room_log', data.log);
        break;
      default:
        console.log('Unhandled packet:', data);
    }
  }

  // Action methods
  joinRoom(newRoomId, newDeviceName) {
    this.roomId = (newRoomId || 'ALPHA-7').toUpperCase().trim();
    if (newDeviceName) this.deviceName = newDeviceName;
    localStorage.setItem('combine_room_id', this.roomId);
    localStorage.setItem('combine_device_name', this.deviceName);

    if (this.isConnected) {
      this.send({
        type: 'JOIN_ROOM',
        roomId: this.roomId,
        deviceId: this.deviceId,
        deviceName: this.deviceName,
        platform: /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      });
    } else {
      this.connect();
    }
  }

  createAlarm(alarmData) {
    this.send({
      type: 'CREATE_ALARM',
      alarm: alarmData
    });
  }

  updateAlarm(alarmData) {
    this.send({
      type: 'UPDATE_ALARM',
      alarm: alarmData
    });
  }

  deleteAlarm(alarmId) {
    this.send({
      type: 'DELETE_ALARM',
      alarmId
    });
  }

  triggerInstantAlert(priority, message, sound) {
    this.send({
      type: 'TRIGGER_INSTANT_ALERT',
      priority,
      message,
      sound
    });
  }

  dismissAlarm(alarmId, mode = 'any') {
    this.send({
      type: 'DISMISS_ALARM',
      alarmId,
      mode
    });
  }

  snoozeAlarm(alarmId, minutes = 5) {
    this.send({
      type: 'SNOOZE_ALARM',
      alarmId,
      minutes
    });
  }

  addManualMember(name) {
    this.send({
      type: 'ADD_MANUAL_MEMBER',
      name
    });
  }

  deleteMember(memberId) {
    this.send({
      type: 'DELETE_MEMBER',
      memberId
    });
  }
}

window.clientSync = new ClientSync();
