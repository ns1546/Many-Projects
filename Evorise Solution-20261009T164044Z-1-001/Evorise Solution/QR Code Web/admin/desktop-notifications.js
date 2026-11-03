/**
 * EVORISE DESKTOP NOTIFICATIONS & ALERT ENGINE
 * Enterprise POS & Kitchen Management
 */

(function () {
  'use strict';

  // Default Desktop Settings
  const DEFAULT_SETTINGS = {
    notificationsEnabled: true,
    soundAlertsEnabled: true,
    repeatUntilAck: false,
    alertTone: 'pos_chime',
    alertVolume: 0.8,
    osToastEnabled: true,
    flashTaskbar: true,
    showBadges: true,
    autoOpenDrawerOnOrder: false
  };

  // State
  let desktopSettings = loadSettings();
  let unreadNotifications = [];
  let repeatTimer = null;
  let audioContext = null;

  function loadSettings() {
    try {
      const saved = localStorage.getItem('evorise_desktop_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return { ...DEFAULT_SETTINGS };
  }

  function saveSettings(newSettings) {
    desktopSettings = { ...desktopSettings, ...newSettings };
    try {
      localStorage.setItem('evorise_desktop_settings', JSON.stringify(desktopSettings));
    } catch (e) {}
    if (window.desktopAPI?.saveDesktopSettings) {
      window.desktopAPI.saveDesktopSettings(desktopSettings);
    }
    return desktopSettings;
  }

  // ==========================================
  // WEB AUDIO SYNTHESIZER (NO EXTERNAL AUDIO FILES NEEDED)
  // ==========================================
  function getAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function playAlertTone(type, vol) {
    if (!desktopSettings.soundAlertsEnabled) return;
    const tone = type || desktopSettings.alertTone || 'pos_chime';
    const volume = (vol !== undefined ? vol : desktopSettings.alertVolume);
    if (volume <= 0) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (tone === 'bell') {
        // Dual harmonic bell strike (Service Bell)
        [1200, 2400].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime((volume * 0.4) / (i + 1), now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.25);
        });
      } else if (tone === 'kitchen_ding') {
        // Sharp high-pitch kitchen bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.95);
      } else if (tone === 'urgent') {
        // Urgent double warning beep
        [0, 0.22].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(950, now + offset);

          gain.gain.setValueAtTime(0, now + offset);
          gain.gain.linearRampToValueAtTime(volume * 0.35, now + offset + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.2);
        });
      } else {
        // Default: Toast/Square POS Tri-Tone Chime (C-E-G Chord)
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, index) => {
          const startTime = now + (index * 0.12);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(volume * 0.45, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.65);
        });
      }
    } catch (e) {
      console.warn('[Audio Alert] Error playing chime:', e);
    }
  }

  // ==========================================
  // NOTIFICATION BADGE & REPEAT ALERTS
  // ==========================================
  function updateBadge() {
    const count = unreadNotifications.length;
    const badgeEl = document.getElementById('desktopBellBadge');
    
    if (badgeEl) {
      if (count > 0 && desktopSettings.showBadges) {
        badgeEl.textContent = count > 99 ? '99+' : count;
        badgeEl.classList.remove('hidden');
        badgeEl.classList.add('pulse');
      } else {
        badgeEl.classList.add('hidden');
        badgeEl.classList.remove('pulse');
      }
    }

    // Sidebar badge
    const sidebarBadge = document.getElementById('sidebarNotificationBadge');
    if (sidebarBadge) {
      if (count > 0 && desktopSettings.showBadges) {
        sidebarBadge.textContent = count > 99 ? '99+' : count;
        sidebarBadge.classList.remove('hidden');
      } else {
        sidebarBadge.classList.add('hidden');
      }
    }

    // Windows Title & Native Taskbar / Dock integration
    if (count > 0) {
      document.title = `(${count}) Evorise Restaurant Admin`;
    } else {
      document.title = `Evorise Restaurant Admin`;
    }

    if (window.desktopAPI?.setBadgeCount) {
      window.desktopAPI.setBadgeCount(count);
    }

    if (typeof syncPortal === 'function') {
      syncPortal();
    }
  }

  function startRepeatAlertLoop() {
    if (repeatTimer) clearInterval(repeatTimer);
    if (!desktopSettings.repeatUntilAck || unreadNotifications.length === 0) return;

    repeatTimer = setInterval(() => {
      if (unreadNotifications.length > 0 && desktopSettings.repeatUntilAck) {
        playAlertTone();
        if (desktopSettings.flashTaskbar && window.desktopAPI?.flashWindow) {
          window.desktopAPI.flashWindow(true);
        }
      } else {
        clearInterval(repeatTimer);
        repeatTimer = null;
      }
    }, 15000);
  }

  function stopRepeatAlertLoop() {
    if (repeatTimer) {
      clearInterval(repeatTimer);
      repeatTimer = null;
    }
  }

  // ==========================================
  // FLOATING TOAST POPUPS
  // ==========================================
  function showFloatingToast(order) {
    let container = document.getElementById('desktopToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'desktopToastContainer';
      container.className = 'desktop-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'desktop-toast';
    const isUrgent = order.urgent || order.total > 2000;
    if (isUrgent) toast.classList.add('urgent');

    const itemsSummary = (order.items || [])
      .map(i => `${i.quantity || 1}x ${i.name || i.title || 'Item'}`)
      .slice(0, 3)
      .join(', ') + ((order.items || []).length > 3 ? '...' : '');

    const tableLabel = order.tableNo || `Table ${order.tableNumber || '1'}`;
    const totalLabel = order.total ? `৳${order.total}` : 'New Order';

    toast.innerHTML = `
      <div class="desktop-toast-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <div class="desktop-toast-body">
        <div class="desktop-toast-title">
          <span>🔔 ${order.id || 'New Order'}</span>
          <span class="table-tag">${tableLabel}</span>
        </div>
        <div class="desktop-toast-desc">
          <strong>${totalLabel}</strong> — ${itemsSummary || 'Customer placed an order'}
        </div>
        <div class="desktop-toast-actions">
          <button type="button" class="btn-ack" data-id="${order.id}">Acknowledge</button>
          <button type="button" class="btn-dismiss">Dismiss</button>
        </div>
      </div>
    `;

    // Toast click handlers
    const ackBtn = toast.querySelector('.btn-ack');
    ackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      acknowledgeOrder(order.id);
      toast.remove();
    });

    const dismissBtn = toast.querySelector('.btn-dismiss');
    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toast.remove();
    });

    toast.addEventListener('click', () => {
      acknowledgeOrder(order.id);
      toast.remove();
      // Switch view to orders or KDS
      const navOrder = document.querySelector('[data-view="orders"]');
      if (navOrder) navOrder.click();
    });

    container.appendChild(toast);

    // Auto dismiss after 10s if not repeated
    if (!desktopSettings.repeatUntilAck) {
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 10000);
    }
  }

  // ==========================================
  // NATIVE OS TOAST NOTIFICATION
  // ==========================================
  function showNativeOsNotification(order) {
    if (!desktopSettings.osToastEnabled) return;

    const title = `🔔 New Order Received: ${order.tableNo || ('Table ' + (order.tableNumber || '1'))}`;
    const itemsSummary = (order.items || [])
      .map(i => `${i.quantity || 1}x ${i.name || i.title}`)
      .slice(0, 3)
      .join(', ');
    const body = `Total: ৳${order.total || 0} | ${itemsSummary}`;

    // Inside Electron native wrapper
    if (window.desktopAPI?.showNotification) {
      window.desktopAPI.showNotification({
        title,
        body,
        tag: order.id || 'evorise-order'
      });
      return;
    }

    // Fallback: Web Notification API
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
          }
        });
      }
    }
  }

  // ==========================================
  // DISPATCH ORDER ALERT
  // ==========================================
  function triggerNewOrderAlert(order) {
    if (!desktopSettings.notificationsEnabled) return;

    // Add to unread notifications list
    const notifItem = {
      id: order.id || `ORD-${Date.now()}`,
      order,
      title: `Order #${order.id || 'New'} - ${order.tableNo || ('Table ' + (order.tableNumber || '1'))}`,
      desc: `${(order.items || []).length} items • ৳${order.total || 0}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    // Avoid duplicate additions
    if (!unreadNotifications.some(n => n.id === notifItem.id)) {
      unreadNotifications.unshift(notifItem);
    }

    updateBadge();
    renderNotificationList();

    // Sound alert
    playAlertTone();

    // Floating window toast
    showFloatingToast(order);

    // OS notification
    showNativeOsNotification(order);

    // Flash taskbar in Electron
    if (desktopSettings.flashTaskbar && window.desktopAPI?.flashWindow) {
      window.desktopAPI.flashWindow(true);
    }

    // Repeat sound if enabled
    if (desktopSettings.repeatUntilAck) {
      startRepeatAlertLoop();
    }
  }

  function acknowledgeOrder(orderId) {
    unreadNotifications = unreadNotifications.filter(n => n.id !== orderId);
    updateBadge();
    renderNotificationList();
    if (unreadNotifications.length === 0) {
      stopRepeatAlertLoop();
    }
  }

  function acknowledgeAll() {
    unreadNotifications = [];
    updateBadge();
    renderNotificationList();
    stopRepeatAlertLoop();
  }

  // ==========================================
  // NOTIFICATION DRAWER RENDERING
  // ==========================================
  function renderNotificationList() {
    const listEl = document.getElementById('desktopNotificationList');
    if (!listEl) return;

    if (unreadNotifications.length === 0) {
      listEl.innerHTML = `
        <div class="notification-empty-state">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 8px; opacity:0.4; display:block;">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          No pending order alerts. All orders acknowledged!
        </div>
      `;
      return;
    }

    listEl.innerHTML = unreadNotifications.map(n => `
      <div class="notification-item unread" data-id="${n.id}">
        <div class="notification-icon order">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/>
          </svg>
        </div>
        <div class="notification-content">
          <div class="notification-title">
            <span>${n.title}</span>
            <span class="notification-time">${n.time}</span>
          </div>
          <div class="notification-desc">${n.desc}</div>
          <div class="notification-item-actions">
            <button type="button" class="btn-primary-action btn-item-ack" data-id="${n.id}">Acknowledge</button>
            <button type="button" class="btn-item-view" data-id="${n.id}">View Details</button>
          </div>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-item-ack').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        acknowledgeOrder(btn.dataset.id);
      });
    });

    listEl.querySelectorAll('.btn-item-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        acknowledgeOrder(btn.dataset.id);
        const navOrder = document.querySelector('[data-view="orders"]');
        if (navOrder) navOrder.click();
        toggleDrawer(false);
      });
    });
  }

  function toggleDrawer(force) {
    const drawer = document.getElementById('desktopNotificationDrawer');
    const overlay = document.getElementById('desktopDrawerOverlay');
    if (!drawer) return;
    const isOpen = force !== undefined ? force : !drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.add('open');
      if (overlay) overlay.classList.add('open');
      renderNotificationList();
    } else {
      drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    }
  }

  // ==========================================
  // NOTIFICATION SETTINGS MODAL
  // ==========================================
  function openSettingsModal() {
    let modal = document.getElementById('desktopSettingsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'desktopSettingsModal';
      modal.className = 'desktop-modal-overlay';
      modal.innerHTML = `
        <div class="desktop-modal">
          <div class="desktop-modal-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Desktop Notification Settings
            </h3>
            <button type="button" class="desktop-icon-btn" id="btnCloseSettingsModal" style="width:28px; height:28px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="desktop-modal-body">
            <div class="setting-group">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Enable Desktop Notifications</span>
                  <span class="setting-desc">Master switch for visual and audio order alerts</span>
                </div>
                <label class="desktop-switch">
                  <input type="checkbox" id="setDesktopMaster" ${desktopSettings.notificationsEnabled ? 'checked' : ''}>
                  <span class="desktop-slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Sound Alerts (Audio Chime)</span>
                  <span class="setting-desc">Play distinct acoustic chime when new order arrives</span>
                </div>
                <label class="desktop-switch">
                  <input type="checkbox" id="setDesktopSound" ${desktopSettings.soundAlertsEnabled ? 'checked' : ''}>
                  <span class="desktop-slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Repeat Sound Until Acknowledged</span>
                  <span class="setting-desc">Repeats alert every 15s so kitchen staff never miss an order</span>
                </div>
                <label class="desktop-switch">
                  <input type="checkbox" id="setDesktopRepeat" ${desktopSettings.repeatUntilAck ? 'checked' : ''}>
                  <span class="desktop-slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Alert Tone</span>
                  <span class="setting-desc">Acoustic signature for order notifications</span>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                  <select id="setDesktopTone" class="desktop-select">
                    <option value="pos_chime" ${desktopSettings.alertTone === 'pos_chime' ? 'selected' : ''}>Toast POS Chime</option>
                    <option value="bell" ${desktopSettings.alertTone === 'bell' ? 'selected' : ''}>Restaurant Bell</option>
                    <option value="kitchen_ding" ${desktopSettings.alertTone === 'kitchen_ding' ? 'selected' : ''}>Kitchen High Ding</option>
                    <option value="urgent" ${desktopSettings.alertTone === 'urgent' ? 'selected' : ''}>Urgent Warning</option>
                  </select>
                  <button type="button" class="btn-desktop-secondary" id="btnTestSound" style="padding:7px 12px; font-size:12px;">Test</button>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Sound Volume (<span id="valVolume">${Math.round(desktopSettings.alertVolume * 100)}%</span>)</span>
                  <span class="setting-desc">Adjust speaker output volume for noisy environments</span>
                </div>
                <div style="width:140px;">
                  <input type="range" id="setDesktopVolume" class="desktop-range" min="0" max="1" step="0.05" value="${desktopSettings.alertVolume}">
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Windows OS Toast Notifications</span>
                  <span class="setting-desc">Show native Windows notification when app is minimized</span>
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                  <button type="button" class="btn-desktop-secondary" id="btnTestOsToast" style="padding:6px 10px; font-size:11px;">Test OS</button>
                  <label class="desktop-switch">
                    <input type="checkbox" id="setDesktopOsToast" ${desktopSettings.osToastEnabled ? 'checked' : ''}>
                    <span class="desktop-slider"></span>
                  </label>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Flash Taskbar on New Orders</span>
                  <span class="setting-desc">Blink app icon in Windows taskbar for instant visibility</span>
                </div>
                <label class="desktop-switch">
                  <input type="checkbox" id="setDesktopFlash" ${desktopSettings.flashTaskbar ? 'checked' : ''}>
                  <span class="desktop-slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Taskbar & Header Badges</span>
                  <span class="setting-desc">Display live count of unacknowledged orders</span>
                </div>
                <label class="desktop-switch">
                  <input type="checkbox" id="setDesktopBadges" ${desktopSettings.showBadges ? 'checked' : ''}>
                  <span class="desktop-slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-title">Restaurant Server URL</span>
                  <span class="setting-desc">Connection target (Local, LAN IP, or Cloud domain)</span>
                </div>
                <div style="width:200px;">
                  <input type="text" id="setDesktopServerUrl" class="desktop-select" style="width:100%; font-size:11px;" value="${localStorage.getItem('evorise_server_url') || 'http://localhost:3000'}">
                </div>
              </div>
            </div>
          </div>
          <div class="desktop-modal-footer">
            <button type="button" class="btn-desktop-secondary" id="btnCancelSettings">Close</button>
            <button type="button" class="btn-desktop-primary" id="btnSaveSettings">Save Preferences</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Wire modal events
      const close = () => modal.classList.remove('open');
      modal.querySelector('#btnCloseSettingsModal').addEventListener('click', close);
      modal.querySelector('#btnCancelSettings').addEventListener('click', close);
      modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

      // Volume slider preview
      const volInput = modal.querySelector('#setDesktopVolume');
      const volVal = modal.querySelector('#valVolume');
      volInput.addEventListener('input', () => {
        volVal.textContent = `${Math.round(volInput.value * 100)}%`;
      });

      // Test sound button
      modal.querySelector('#btnTestSound').addEventListener('click', () => {
        const tone = modal.querySelector('#setDesktopTone').value;
        const vol = parseFloat(volInput.value);
        playAlertTone(tone, vol);
      });

      // Test OS toast
      modal.querySelector('#btnTestOsToast').addEventListener('click', () => {
        showNativeOsNotification({
          id: 'TEST-ORDER',
          tableNo: 'Table 7',
          total: 1450,
          items: [{ quantity: 2, name: 'Truffle Burger' }, { quantity: 1, name: 'Pink Salt Latte' }]
        });
      });

      // Save preferences
      modal.querySelector('#btnSaveSettings').addEventListener('click', () => {
        const customUrl = (modal.querySelector('#setDesktopServerUrl')?.value || '').trim();
        if (customUrl) {
          const cleanUrl = (customUrl.startsWith('http') ? customUrl : ('http://' + customUrl)).replace(/\/+$/, '');
          localStorage.setItem('evorise_server_url', cleanUrl);
        }

        saveSettings({
          notificationsEnabled: modal.querySelector('#setDesktopMaster').checked,
          soundAlertsEnabled: modal.querySelector('#setDesktopSound').checked,
          repeatUntilAck: modal.querySelector('#setDesktopRepeat').checked,
          alertTone: modal.querySelector('#setDesktopTone').value,
          alertVolume: parseFloat(volInput.value),
          osToastEnabled: modal.querySelector('#setDesktopOsToast').checked,
          flashTaskbar: modal.querySelector('#setDesktopFlash').checked,
          showBadges: modal.querySelector('#setDesktopBadges').checked
        });
        updateBadge();
        close();
      });
    }

    modal.classList.add('open');
  }

  // ==========================================
  // NOTIFICATION PORTAL & DRAWER ENGINE
  // ==========================================
  function syncPortal() {
    const portalCount = document.getElementById('portalPendingAlertCount');
    if (portalCount) portalCount.textContent = unreadNotifications.length;

    const toneNames = {
      pos_chime: 'Toast POS Chime',
      bell: 'Service Bell',
      kitchen_ding: 'Kitchen Ding',
      urgent: 'Urgent Alert'
    };
    const activeToneEl = document.getElementById('portalActiveToneName');
    if (activeToneEl) {
      activeToneEl.textContent = toneNames[desktopSettings.alertTone] || 'Toast POS Chime';
    }

    const soundChk = document.getElementById('portalSettingSoundEnabled');
    if (soundChk) soundChk.checked = !!desktopSettings.soundAlertsEnabled;

    const toneSel = document.getElementById('portalSettingAlertTone');
    if (toneSel) toneSel.value = desktopSettings.alertTone || 'pos_chime';

    const volSlider = document.getElementById('portalSettingVolume');
    const volPct = document.getElementById('portalVolumePercent');
    if (volSlider) {
      volSlider.value = desktopSettings.alertVolume !== undefined ? desktopSettings.alertVolume : 0.8;
      if (volPct) volPct.textContent = `${Math.round(volSlider.value * 100)}%`;
    }

    const repeatChk = document.getElementById('portalSettingRepeat');
    if (repeatChk) repeatChk.checked = !!desktopSettings.repeatUntilAck;

    const flashChk = document.getElementById('portalSettingFlashTaskbar');
    if (flashChk) flashChk.checked = !!desktopSettings.flashTaskbar;

    renderPortalFeed();
  }

  function renderPortalFeed() {
    const listEl = document.getElementById('portalLiveOrderList');
    if (!listEl) return;

    if (unreadNotifications.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:30px 0; color:var(--admin-text-muted);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 8px; opacity:0.5; display:block;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p style="font-size:13px; font-weight:600; margin:0;">All orders acknowledged!</p>
          <span style="font-size:12px;">Waiting for new incoming QR table orders.</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = unreadNotifications.map(n => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-radius:8px; border:1px solid var(--admin-border); background:var(--admin-card-bg, #f8fafc); gap:12px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px;">
            <strong style="font-size:13px; color:var(--admin-text);">${n.title}</strong>
            <span style="font-size:11px; color:var(--admin-text-muted);">${n.time}</span>
          </div>
          <div style="font-size:12px; color:var(--admin-text-muted); margin-top:2px;">${n.desc}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-primary btn-portal-ack" data-id="${n.id}" style="padding:6px 12px; font-size:12px;">
            Acknowledge
          </button>
          <button type="button" class="btn btn-secondary btn-portal-view" data-id="${n.id}" style="padding:6px 10px; font-size:12px;">
            View
          </button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-portal-ack').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        acknowledgeOrder(b.dataset.id);
      });
    });

    listEl.querySelectorAll('.btn-portal-view').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        acknowledgeOrder(b.dataset.id);
        const nav = document.querySelector('[data-view="orders"]');
        if (nav) nav.click();
      });
    });
  }

  function wirePortalEvents() {
    const testBtn = document.getElementById('btnPortalTestTone');
    if (testBtn && !testBtn.dataset.wired) {
      testBtn.dataset.wired = 'true';
      testBtn.addEventListener('click', () => {
        const tone = document.getElementById('portalSettingAlertTone')?.value;
        const vol = parseFloat(document.getElementById('portalSettingVolume')?.value || '0.8');
        playAlertTone(tone, vol);
      });
    }

    const ackAllBtn = document.getElementById('btnPortalAckAll');
    if (ackAllBtn && !ackAllBtn.dataset.wired) {
      ackAllBtn.dataset.wired = 'true';
      ackAllBtn.addEventListener('click', acknowledgeAll);
    }

    const volSlider = document.getElementById('portalSettingVolume');
    if (volSlider && !volSlider.dataset.wired) {
      volSlider.dataset.wired = 'true';
      volSlider.addEventListener('input', (e) => {
        const pct = document.getElementById('portalVolumePercent');
        if (pct) pct.textContent = `${Math.round(e.target.value * 100)}%`;
      });
    }

    const saveBtn = document.getElementById('btnSavePortalSettings');
    if (saveBtn && !saveBtn.dataset.wired) {
      saveBtn.dataset.wired = 'true';
      saveBtn.addEventListener('click', () => {
        const newSettings = {
          soundAlertsEnabled: document.getElementById('portalSettingSoundEnabled')?.checked ?? true,
          alertTone: document.getElementById('portalSettingAlertTone')?.value || 'pos_chime',
          alertVolume: parseFloat(document.getElementById('portalSettingVolume')?.value || '0.8'),
          repeatUntilAck: document.getElementById('portalSettingRepeat')?.checked ?? false,
          flashTaskbar: document.getElementById('portalSettingFlashTaskbar')?.checked ?? true
        };
        saveSettings(newSettings);
        syncPortal();
        showFloatingToast({ id: 'Settings Saved', total: 0, items: [], tableNo: 'Notification System' });
      });
    }
  }

  function injectDesktopControls() {
    // 1. Ensure Drawer overlay and drawer exist in body
    if (!document.getElementById('desktopNotificationDrawer')) {
      const overlay = document.createElement('div');
      overlay.id = 'desktopDrawerOverlay';
      overlay.className = 'notification-drawer-overlay';
      document.body.appendChild(overlay);

      const drawer = document.createElement('div');
      drawer.id = 'desktopNotificationDrawer';
      drawer.className = 'notification-drawer';
      drawer.innerHTML = `
        <div class="notification-drawer-header">
          <h4>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            Order Alerts
          </h4>
          <div class="notification-drawer-actions">
            <button type="button" id="btnAckAll">Acknowledge All</button>
            <button type="button" id="btnOpenSettingsFromDrawer">Settings</button>
          </div>
        </div>
        <div class="notification-list" id="desktopNotificationList">
          <div class="notification-empty-state">No pending order alerts.</div>
        </div>
      `;
      document.body.appendChild(drawer);

      overlay.addEventListener('click', () => toggleDrawer(false));
      document.getElementById('btnAckAll')?.addEventListener('click', acknowledgeAll);
      document.getElementById('btnOpenSettingsFromDrawer')?.addEventListener('click', () => {
        toggleDrawer(false);
        openSettingsModal();
      });
    }

    // 2. Wire topbar bell and settings if present
    const bellBtn = document.getElementById('btnDesktopBell');
    if (bellBtn && !bellBtn.dataset.wired) {
      bellBtn.dataset.wired = 'true';
      bellBtn.addEventListener('click', () => toggleDrawer());
    }

    const settingsBtn = document.getElementById('btnDesktopSettings');
    if (settingsBtn && !settingsBtn.dataset.wired) {
      settingsBtn.dataset.wired = 'true';
      settingsBtn.addEventListener('click', openSettingsModal);
    }

    // 3. Wire portal events and sync state
    wirePortalEvents();
    syncPortal();

    // 4. Request OS notification permission once
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // ==========================================
  // REAL-TIME ORDER LISTENER
  // ==========================================
  function initOrderWatcher() {
    let lastSeenOrders = new Set();
    let isInitialized = false;

    // Listen to window event dispatched by db.js
    window.addEventListener('evorise:data_updated', (e) => {
      if (e.detail?.type === 'orders' && e.detail?.data) {
        const order = e.detail.data;
        if (order && !lastSeenOrders.has(order.id)) {
          lastSeenOrders.add(order.id);
          triggerNewOrderAlert(order);
        }
      }
    });

    // Also poll /api/v1/orders periodically as a safety net
    async function checkNewOrders() {
      try {
        const res = await fetch('/api/v1/orders');
        if (res.ok) {
          const orders = await res.json();
          if (!isInitialized) {
            orders.forEach(o => lastSeenOrders.add(o.id));
            isInitialized = true;
            return;
          }

          orders.forEach(o => {
            if (!lastSeenOrders.has(o.id) && o.status === 'Pending') {
              lastSeenOrders.add(o.id);
              triggerNewOrderAlert(o);
            }
          });
        }
      } catch (err) {}
    }

    setInterval(checkNewOrders, 5000);
    checkNewOrders();
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectDesktopControls();
      initOrderWatcher();
    });
  } else {
    injectDesktopControls();
    initOrderWatcher();
  }

  // Check periodically so controls mount immediately when admin logs in
  setInterval(injectDesktopControls, 1000);

  // Expose API globally
  window.evoriseDesktop = {
    triggerAlert: triggerNewOrderAlert,
    openSettings: openSettingsModal,
    toggleDrawer,
    acknowledgeOrder,
    acknowledgeAll,
    playTone: playAlertTone,
    syncPortal,
    getSettings: () => desktopSettings,
    saveSettings
  };
})();
