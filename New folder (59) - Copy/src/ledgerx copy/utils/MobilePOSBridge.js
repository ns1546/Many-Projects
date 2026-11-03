/**
 * LedgerX Mobile POS Realtime Bridge & Web Audio Synthesizer
 * Connects desktop POS terminal with mobile smartphone via WebRTC (PeerJS) & Local Mesh
 */
import { Peer } from 'peerjs';

class MobilePOSBridgeService {
  constructor() {
    this.sessionId = null;
    this.sessionPin = null;
    this.role = null; // 'HOST' (Desktop) | 'CLIENT' (Mobile)
    this.connectionStatus = 'DISCONNECTED'; // 'DISCONNECTED' | 'PAIRING' | 'CONNECTED'
    this.connectedDevice = null;
    this.listeners = new Map();
    this.broadcastChannel = null;
    this.audioCtx = null;
    this.heartbeatTimer = null;
    this.lastPingSent = 0;
    this.latencyMs = 0;

    // WebRTC PeerJS State
    this.peer = null;
    this.activeDataConn = null;
    this.detectedLanIp = '192.168.0.100'; // Default auto-detected local Wi-Fi IP

    this.initAudio();
    this.initBroadcastChannel();
  }

  // ── Web Audio Synthesizer (Instant Physical POS Beep without audio files) ────
  initAudio() {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.AudioContextClass = AudioContextClass;
    }
  }

  ensureAudioContext() {
    if (!this.audioCtx && this.AudioContextClass) {
      try {
        this.audioCtx = new this.AudioContextClass();
      } catch (e) {
        console.warn('AudioContext init failed:', e);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  playSuccessBeep() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } catch (e) {}
  }

  playErrorBeep() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, this.audioCtx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    } catch (e) {}
  }

  triggerHaptic() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40]);
      } catch (e) {}
    }
  }

  // ── Local Mesh Transport (Multi-tab/Same Origin Fallback) ───────────────────
  initBroadcastChannel() {
    if (typeof window === 'undefined') return;

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('ledgerx_mobile_pos_mesh');
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };
      }
    } catch (e) {}

    window.addEventListener('storage', (e) => {
      if (e.key === 'ledgerx_mobile_pos_relay' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.senderRole !== this.role) {
            this.handleIncomingMessage(payload);
          }
        } catch (err) {}
      }
    });
  }

  // Set LAN IP override
  setLanIp(ip) {
    if (ip && typeof ip === 'string') {
      this.detectedLanIp = ip.trim();
    }
  }

  getPairingUrl(pin, customIp, protocolOverride) {
    if (typeof window === 'undefined') return '';
    const ip = customIp || this.detectedLanIp;
    const port = window.location.port || '4173';
    // Ensure clean HTTP for local LAN IPs so phones can open without untrusted certificate errors
    const protocol = protocolOverride || (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') || ip === 'localhost' ? 'http:' : (window.location.protocol || 'http:'));
    
    const origin = `${protocol}//${ip}:${port}`;
    return `${origin}/mobile-pos?pair=${pin || this.sessionPin}`;
  }

  // ── Host (Desktop POS) Peer Initialization ──────────────────────────────────
  createHostSession(tenantId = 'default', customLanIp, forceNew = false) {
    this.role = 'HOST';
    if (customLanIp) this.detectedLanIp = customLanIp;

    // If an active session already exists and forceNew is false, preserve it!
    if (!forceNew && this.sessionId && this.sessionPin && this.peer && !this.peer.destroyed) {
      return {
        sessionId: this.sessionId,
        sessionPin: this.sessionPin,
        pairingUrl: this.getPairingUrl(this.sessionPin),
        lanIp: this.detectedLanIp,
      };
    }

    // Generate memorable 6-digit numeric PIN
    this.sessionPin = String(Math.floor(100000 + Math.random() * 900000));
    this.sessionId = `lxpos-${this.sessionPin}`;
    this.connectionStatus = 'PAIRING';
    this.connectedDevice = null;

    // Initialize WebRTC Peer Server Host
    this.initHostWebRTC(this.sessionId);

    // Save session in local storage for local tab testing
    const sessionData = {
      sessionId: this.sessionId,
      sessionPin: this.sessionPin,
      tenantId,
      lanIp: this.detectedLanIp,
      createdAt: Date.now(),
      status: 'PAIRING',
    };
    try {
      localStorage.setItem(`ledgerx_pos_session_${this.sessionPin}`, JSON.stringify(sessionData));
    } catch (e) {}

    this.startHeartbeat();
    this.emit('status_change', { status: this.connectionStatus, sessionPin: this.sessionPin });

    return {
      sessionId: this.sessionId,
      sessionPin: this.sessionPin,
      pairingUrl: this.getPairingUrl(this.sessionPin),
      lanIp: this.detectedLanIp,
    };
  }

  initHostWebRTC(peerId) {
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
    }

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        console.log('⚡ LedgerX Host Peer Ready:', id);
      });

      this.peer.on('connection', (conn) => {
        console.log('📱 Phone connected to desktop via WebRTC DataChannel!');
        this.activeDataConn = conn;

        conn.on('open', () => {
          this.connectionStatus = 'CONNECTED';
          this.playSuccessBeep();

          // Acknowledge connection
          this.send({
            type: 'PAIR_ACCEPTED',
            hostDevice: {
              name: 'LedgerX Enterprise Desktop',
              activeStore: 'প্রধান কার্যালয় / কেন্দ্রীয় শোরুম',
            },
          });
        });

        conn.on('data', (data) => {
          this.handleIncomingMessage(data);
        });

        conn.on('close', () => {
          console.log('Mobile DataChannel closed');
          this.connectionStatus = 'PAIRING';
          this.connectedDevice = null;
          this.emit('status_change', { status: 'PAIRING' });
          this.emit('device_disconnected');
        });

        conn.on('error', (err) => {
          console.warn('DataChannel error:', err);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host error:', err);
      });
    } catch (e) {
      console.warn('WebRTC init failed:', e);
    }
  }

  // ── Client (Mobile Phone) Connection ────────────────────────────────────────
  connectAsClient(pin, deviceInfo = {}) {
    this.role = 'CLIENT';
    this.sessionPin = String(pin).trim();
    const hostPeerId = `lxpos-${this.sessionPin}`;
    this.connectionStatus = 'PAIRING';

    const clientDevice = {
      deviceName: deviceInfo.deviceName || this.detectDeviceName(),
      browser: deviceInfo.browser || this.detectBrowserName(),
      battery: deviceInfo.battery || '100%',
      operatingMode: deviceInfo.mode || 'SCANNER_GUN',
      connectedAt: Date.now(),
    };

    this.connectedDevice = clientDevice;

    // Connect via WebRTC DataChannel to Desktop Peer
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
    }

    try {
      this.peer = new Peer({ debug: 1 });

      this.peer.on('open', () => {
        console.log('📱 Connecting to Host Peer:', hostPeerId);
        const conn = this.peer.connect(hostPeerId, {
          reliable: true,
        });
        this.activeDataConn = conn;

        conn.on('open', () => {
          console.log('⚡ WebRTC Connected to Desktop POS!');
          this.connectionStatus = 'CONNECTED';
          this.playSuccessBeep();
          this.triggerHaptic();

          // Send Pair Request
          this.send({
            type: 'PAIR_REQUEST',
            pin: this.sessionPin,
            device: clientDevice,
          });

          this.emit('status_change', { status: 'CONNECTED' });
        });

        conn.on('data', (data) => {
          this.handleIncomingMessage(data);
        });

        conn.on('close', () => {
          this.connectionStatus = 'DISCONNECTED';
          this.emit('status_change', { status: 'DISCONNECTED' });
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Client Peer error:', err);
        // Fall back to local mesh
        this.send({
          type: 'PAIR_REQUEST',
          pin: this.sessionPin,
          device: clientDevice,
        });
      });
    } catch (e) {
      console.warn('Client WebRTC error:', e);
    }

    this.startHeartbeat();
    this.emit('status_change', { status: this.connectionStatus });
  }

  // ── Message Dispatcher ───────────────────────────────────────────────────────
  send(message) {
    const payload = {
      ...message,
      sessionId: this.sessionId,
      sessionPin: this.sessionPin,
      senderRole: this.role,
      timestamp: Date.now(),
    };

    // 1. Primary: Direct WebRTC DataChannel (Cross-Device P2P)
    if (this.activeDataConn && this.activeDataConn.open) {
      try {
        this.activeDataConn.send(payload);
      } catch (e) {
        console.warn('WebRTC send failed:', e);
      }
    }

    // 2. Secondary: BroadcastChannel (Multi-tab/Local fallback)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {}
    }

    // 3. LocalStorage relay
    try {
      localStorage.setItem('ledgerx_mobile_pos_relay', JSON.stringify(payload));
    } catch (e) {}
  }

  handleIncomingMessage(data) {
    if (!data || !data.type) return;

    if (this.sessionPin && data.sessionPin && data.sessionPin !== this.sessionPin) {
      return;
    }

    if (data.senderRole === this.role) return;

    switch (data.type) {
      case 'PAIR_REQUEST':
        if (this.role === 'HOST' && data.pin === this.sessionPin) {
          this.connectedDevice = data.device;
          this.connectionStatus = 'CONNECTED';
          this.playSuccessBeep();

          this.send({
            type: 'PAIR_ACCEPTED',
            hostDevice: {
              name: 'LedgerX Enterprise Desktop',
              activeStore: 'প্রধান কার্যালয় / কেন্দ্রীয় শোরুম',
            },
          });

          this.emit('status_change', {
            status: 'CONNECTED',
            device: this.connectedDevice,
          });
          this.emit('device_connected', this.connectedDevice);
        }
        break;

      case 'PAIR_ACCEPTED':
        if (this.role === 'CLIENT') {
          this.connectionStatus = 'CONNECTED';
          this.playSuccessBeep();
          this.triggerHaptic();
          this.emit('status_change', {
            status: 'CONNECTED',
            host: data.hostDevice,
          });
        }
        break;

      case 'BARCODE_SCANNED':
        if (this.role === 'HOST') {
          this.playSuccessBeep();
          this.emit('barcode_scanned', {
            barcode: data.barcode,
            timestamp: data.timestamp,
            device: data.device || this.connectedDevice,
          });

          // Universal Software Integration:
          // 1. Dispatch custom DOM event across window for any page listener
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('ledgerx_mobile_barcode_scan', {
                detail: { barcode: data.barcode, device: data.device || this.connectedDevice },
              })
            );

            // 2. Hardware Scanner Keyboard Emulation
            // If any input/textarea is currently focused in LedgerX (Product Add, Stock, Search),
            // type the barcode directly and trigger Enter event
            try {
              const activeEl = document.activeElement;
              if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') && !activeEl.readOnly && !activeEl.disabled) {
                const nativeSetter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  'value'
                )?.set;
                if (nativeSetter) {
                  nativeSetter.call(activeEl, data.barcode);
                } else {
                  activeEl.value = data.barcode;
                }
                activeEl.dispatchEvent(new Event('input', { bubbles: true }));
                activeEl.dispatchEvent(new Event('change', { bubbles: true }));

                activeEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                activeEl.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                activeEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
              }
            } catch (e) {}
          }
        }
        break;

      case 'CART_SYNC':
        if (this.role === 'CLIENT') {
          this.emit('cart_sync', {
            cart: data.cart || [],
            totals: data.totals || {},
          });
        }
        break;

      case 'CHECKOUT_COMPLETE':
        if (this.role === 'HOST') {
          this.playSuccessBeep();
          this.emit('checkout_complete', data);
        }
        break;

      case 'PING':
        this.send({ type: 'PONG', replyTo: data.timestamp });
        break;

      case 'PONG':
        if (data.replyTo) {
          this.latencyMs = Math.max(1, Date.now() - data.replyTo);
          this.emit('latency_update', this.latencyMs);
        }
        break;

      case 'DISCONNECT':
        this.connectionStatus = this.role === 'HOST' ? 'PAIRING' : 'DISCONNECTED';
        this.connectedDevice = null;
        this.emit('status_change', { status: this.connectionStatus });
        this.emit('device_disconnected');
        break;

      default:
        this.emit(data.type.toLowerCase(), data);
        break;
    }
  }

  emitScannedBarcode(barcode) {
    if (!barcode) return;
    const clean = String(barcode).trim();
    this.playSuccessBeep();
    this.triggerHaptic();

    this.send({
      type: 'BARCODE_SCANNED',
      barcode: clean,
      device: this.connectedDevice,
    });

    this.emit('self_scanned', clean);
  }

  syncCartToMobile(cart, totals) {
    if (this.role !== 'HOST' || this.connectionStatus !== 'CONNECTED') return;
    this.send({
      type: 'CART_SYNC',
      cart,
      totals,
    });
  }

  disconnect() {
    this.send({ type: 'DISCONNECT' });
    this.stopHeartbeat();
    if (this.activeDataConn) {
      try {
        this.activeDataConn.close();
      } catch (e) {}
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
    }
    this.connectionStatus = 'DISCONNECTED';
    this.connectedDevice = null;
    this.emit('status_change', { status: 'DISCONNECTED' });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.connectionStatus === 'CONNECTED') {
        this.lastPingSent = Date.now();
        this.send({ type: 'PING', timestamp: this.lastPingSent });
      }
    }, 4000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {}
      });
    }
  }

  detectDeviceName() {
    if (typeof navigator === 'undefined') return 'Mobile Terminal';
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'Apple iPhone';
    if (/iPad/i.test(ua)) return 'Apple iPad';
    if (/Samsung|SM-/i.test(ua)) return 'Samsung Galaxy';
    if (/Pixel/i.test(ua)) return 'Google Pixel';
    if (/Xiaomi|Redmi/i.test(ua)) return 'Xiaomi Phone';
    if (/Android/i.test(ua)) return 'Android Smartphone';
    return 'Mobile Device';
  }

  detectBrowserName() {
    if (typeof navigator === 'undefined') return 'Mobile Web';
    const ua = navigator.userAgent;
    if (/CriOS|Chrome/i.test(ua)) return 'Chrome Mobile';
    if (/FxiOS|Firefox/i.test(ua)) return 'Firefox Mobile';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Mobile Safari';
    return 'Web Browser';
  }
}

export const mobilePOSBridge = new MobilePOSBridgeService();
