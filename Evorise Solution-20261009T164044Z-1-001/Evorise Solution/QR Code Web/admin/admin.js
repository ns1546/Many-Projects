// Initialize Lucide icons
lucide.createIcons();

// ==========================================
// --- ADMIN DAY / NIGHT THEME ENGINE ---
// ==========================================
window.initAdminTheme = function() {
  const saved = localStorage.getItem('sg_theme') || 'light';
  window.applyAdminTheme(saved);
};

window.toggleAdminTheme = function() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  window.applyAdminTheme(next);
  localStorage.setItem('sg_theme', next);
};

window.applyAdminTheme = function(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const iconMoon = document.getElementById('adminIconMoon');
  const iconSun = document.getElementById('adminIconSun');
  if (iconMoon && iconSun) {
    if (theme === 'dark') {
      iconMoon.style.display = 'none';
      iconSun.style.display = 'block';
    } else {
      iconMoon.style.display = 'block';
      iconSun.style.display = 'none';
    }
  }
};

window.initAdminTheme();

// DOM Elements
const navItems = document.querySelectorAll('.nav-item[data-view]');
const viewSections = document.querySelectorAll('.view-section');
const pageTitle = document.getElementById('pageTitle');

// Data Elements
const statTotalOrders = document.getElementById('statTotalOrders');
const statTotalItems = document.getElementById('statTotalItems');
const statRevenue = document.getElementById('statRevenue');

const recentOrdersTbody = document.getElementById('recentOrdersTbody');
const menuItemsTbody = document.getElementById('menuItemsTbody');
const allOrdersTbody = document.getElementById('allOrdersTbody');

// Modal Elements
const itemModal = document.getElementById('itemModal');
const btnAddNewItem = document.getElementById('btnAddNewItem');
const btnModalClose = document.getElementById('btnModalClose');
const btnModalCancel = document.getElementById('btnModalCancel');
const itemForm = document.getElementById('itemForm');
const modalFormTitle = document.getElementById('modalFormTitle');

// Banner Elements
const bannersTbody = document.getElementById('bannersTbody');
const bannerModal = document.getElementById('bannerModal');
const btnAddNewBanner = document.getElementById('btnAddNewBanner');
const btnBannerModalClose = document.getElementById('btnBannerModalClose');
const btnBannerModalCancel = document.getElementById('btnBannerModalCancel');
const bannerForm = document.getElementById('bannerForm');
const modalBannerTitle = document.getElementById('modalBannerTitle');

// Offer Elements
const offersTbody = document.getElementById('offersTbody');
const offerModal = document.getElementById('offerModal');
const btnAddNewOffer = document.getElementById('btnAddNewOffer');
const btnOfferModalClose = document.getElementById('btnOfferModalClose');
const btnOfferModalCancel = document.getElementById('btnOfferModalCancel');
const offerForm = document.getElementById('offerForm');
const modalOfferTitle = document.getElementById('modalOfferTitle');

// Settings Elements
const settingsForm = document.getElementById('settingsForm');
const settingRestaurantName = document.getElementById('settingRestaurantName');
const settingLogoUrl = document.getElementById('settingLogoUrl');
const settingFaviconUrl = document.getElementById('settingFaviconUrl');
const settingPrimaryColor = document.getElementById('settingPrimaryColor');
const settingSecondaryColor = document.getElementById('settingSecondaryColor');
const settingButtonColor = document.getElementById('settingButtonColor');
const settingTextColor = document.getElementById('settingTextColor');
const settingThemePreset = document.getElementById('settingThemePreset');
const settingFontFamily = document.getElementById('settingFontFamily');
const settingCurrencySymbol = document.getElementById('settingCurrencySymbol');
const settingTaxRate = document.getElementById('settingTaxRate');
const settingWebsiteBg = document.getElementById('settingWebsiteBg');
const settingHeroImage = document.getElementById('settingHeroImage');
const settingHeroTitle = document.getElementById('settingHeroTitle');
const settingHeroSubtitle = document.getElementById('settingHeroSubtitle');
const settingHeroPhone = document.getElementById('settingHeroPhone');
const settingFooterImage = document.getElementById('settingFooterImage');
const settingFooterAddress = document.getElementById('settingFooterAddress');
const settingFooterPhone = document.getElementById('settingFooterPhone');
const settingFooterEmail = document.getElementById('settingFooterEmail');
const settingFooterCopyright = document.getElementById('settingFooterCopyright');
const settingSocialFb = document.getElementById('settingSocialFb');
const settingSocialTwitter = document.getElementById('settingSocialTwitter');
const settingSocialInsta = document.getElementById('settingSocialInsta');
const settingSocialLinkedin = document.getElementById('settingSocialLinkedin');

// Tab Navigation
navItems.forEach(nav => {
  nav.addEventListener('click', (e) => {
    e.preventDefault();
    const view = nav.getAttribute('data-view');
    
    // Update active nav
    navItems.forEach(n => n.classList.remove('active'));
    nav.classList.add('active');
    
    // Update view
    viewSections.forEach(s => s.classList.add('hidden'));
    const targetSection = document.getElementById(`view-${view}`);
    if (targetSection) targetSection.classList.remove('hidden');
    
    // Update Title
    pageTitle.textContent = nav.textContent.trim();

    if (view === 'analytics' && typeof renderAnalyticsView === 'function') {
      renderAnalyticsView();
    }
    if (view === 'database' && typeof renderDatabaseView === 'function') {
      renderDatabaseView();
    }
    if (view === 'notifications' && window.evoriseDesktop?.syncPortal) {
      window.evoriseDesktop.syncPortal();
    }
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  });
});

// ==========================================
// --- CLIENT-SIDE CRASH & ERROR BOUNDARIES ---
// ==========================================
window.addEventListener('error', (event) => {
  console.warn('[Client Crash Guard] Caught global error:', event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.warn('[Client Crash Guard] Caught unhandled promise rejection:', event.reason);
});

// ==========================================
// --- TOPBAR NOTIFICATION BUTTONS FAIL-SAFE ---
// ==========================================
function wireTopbarNotificationButtons() {
  const bellBtn = document.getElementById('btnDesktopBell');
  if (bellBtn && !bellBtn.dataset.wiredFallback) {
    bellBtn.dataset.wiredFallback = 'true';
    bellBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.evoriseDesktop && typeof window.evoriseDesktop.toggleDrawer === 'function') {
        window.evoriseDesktop.toggleDrawer();
      } else {
        // Fallback: switch to notifications portal view
        const notifNav = document.querySelector('.nav-item[data-view="notifications"]');
        if (notifNav) notifNav.click();
      }
    });
  }

  const settingsBtn = document.getElementById('btnDesktopSettings');
  if (settingsBtn && !settingsBtn.dataset.wiredFallback) {
    settingsBtn.dataset.wiredFallback = 'true';
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.evoriseDesktop && typeof window.evoriseDesktop.openSettings === 'function') {
        window.evoriseDesktop.openSettings();
      } else {
        // Fallback: switch to settings and scroll to notification card
        const settingsNav = document.querySelector('.nav-item[data-view="settings"]');
        if (settingsNav) {
          settingsNav.click();
          setTimeout(() => {
            const card = document.getElementById('cardDesktopNotificationSettings');
            if (card) card.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    });
  }
}

// ==========================================
// --- SHIFT OPERATING MODE & CLOUD DB ENGINE ---
// ==========================================
let currentSyncStatus = {
  mode: 'hybrid',
  effectiveState: 'online',
  cloudProvider: 'supabase',
  cloudUrl: '',
  hasCloudConfig: false,
  pendingCount: 0,
  lastPingMs: null,
  lastSyncTime: null
};

function initShiftModeController() {
  const pillBtn = document.getElementById('btnShiftMode');
  const modal = document.getElementById('shiftModeModal');
  const btnClose = document.getElementById('btnCloseShiftModal');
  const btnCloseFooter = document.getElementById('btnCloseShiftModalFooter');

  function openModal() {
    if (modal) {
      modal.style.display = 'flex';
      refreshSyncStatusUI();
    }
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }

  pillBtn?.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);
  btnCloseFooter?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Shift Mode Radio Changes
  document.querySelectorAll('input[name="shiftModeRadio"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      const selectedMode = e.target.value;
      try {
        const res = await fetch('/api/v1/sync/mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: selectedMode })
        });
        if (res.ok) {
          const data = await res.json();
          currentSyncStatus = data.status || currentSyncStatus;
          updateShiftPillUI();
        }
      } catch (err) {
        console.warn('[Sync Mode] Change error:', err);
      }
    });
  });

  // Save Cloud Config
  document.getElementById('btnSaveCloudConfig')?.addEventListener('click', async () => {
    const cloudProvider = document.getElementById('syncCloudProvider')?.value || 'supabase';
    const cloudUrl = document.getElementById('syncCloudUrl')?.value || '';
    const cloudApiKey = document.getElementById('syncCloudApiKey')?.value || '';
    const feedback = document.getElementById('syncTestFeedback');

    try {
      const res = await fetch('/api/v1/sync/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudProvider, cloudUrl, cloudApiKey })
      });
      if (res.ok) {
        const data = await res.json();
        currentSyncStatus = data.status || currentSyncStatus;
        if (feedback) {
          feedback.style.display = 'block';
          feedback.style.background = '#ecfdf5';
          feedback.style.color = '#065f46';
          feedback.textContent = '✓ Cloud Database settings saved successfully!';
          setTimeout(() => { feedback.style.display = 'none'; }, 4000);
        }
        updateShiftPillUI();
      }
    } catch (err) {
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.background = '#fef2f2';
        feedback.style.color = '#991b1b';
        feedback.textContent = 'Failed to save cloud config: ' + err.message;
      }
    }
  });

  // Test Cloud Connection Ping
  document.getElementById('btnTestCloudPing')?.addEventListener('click', async () => {
    const feedback = document.getElementById('syncTestFeedback');
    if (feedback) {
      feedback.style.display = 'block';
      feedback.style.background = '#f0f9ff';
      feedback.style.color = '#0369a1';
      feedback.textContent = 'Testing cloud connection ping...';
    }

    try {
      const res = await fetch('/api/v1/sync/test', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        if (feedback) {
          feedback.style.background = '#ecfdf5';
          feedback.style.color = '#065f46';
          feedback.textContent = `✓ Connected! Latency: ${result.latencyMs || 25} ms. Status: ${result.status || 200}`;
        }
        const pingEl = document.getElementById('syncPingDisplay');
        if (pingEl) pingEl.textContent = `${result.latencyMs || 25} ms`;
      } else {
        if (feedback) {
          feedback.style.background = '#fffbeb';
          feedback.style.color = '#92400e';
          feedback.textContent = `Offline Notice: Cloud unreachable (${result.error || 'Check internet'}). Local SQLite active.`;
        }
      }
    } catch (err) {
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.background = '#fef2f2';
        feedback.style.color = '#991b1b';
        feedback.textContent = 'Connection test failed: ' + err.message;
      }
    }
  });

  // Manual Push Queue
  document.getElementById('btnManualPushQueue')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnManualPushQueue');
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('/api/v1/sync/push', { method: 'POST' });
      const data = await res.json();
      await fetchSyncStatus();
    } catch (e) {
      console.warn('[Sync Push] Error:', e);
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  // Initial Fetch & Interval Poll
  fetchSyncStatus();
  setInterval(fetchSyncStatus, 15000);

  // Browser Network Listeners
  window.addEventListener('online', () => {
    console.log('[Network Guard] Online connection restored. Triggering cloud reconciliation.');
    fetch('/api/v1/sync/push', { method: 'POST' }).catch(() => {});
    fetchSyncStatus();
  });
  window.addEventListener('offline', () => {
    console.log('[Network Guard] Internet dropped. Automatic shift to Local SQLite Engine.');
    currentSyncStatus.effectiveState = 'offline';
    updateShiftPillUI();
  });
}

async function fetchSyncStatus() {
  try {
    const res = await fetch('/api/v1/sync/status');
    if (res.ok) {
      currentSyncStatus = await res.json();
      updateShiftPillUI();
      refreshSyncStatusUI();
    }
  } catch (e) {}
}

function updateShiftPillUI() {
  const dot = document.getElementById('shiftModeDot');
  const text = document.getElementById('shiftModeText');
  const pill = document.getElementById('btnShiftMode');
  if (!dot || !text || !pill) return;

  const isOnline = currentSyncStatus.effectiveState === 'online';

  if (isOnline) {
    pill.style.borderColor = 'rgba(16,185,129,0.3)';
    pill.style.background = 'rgba(16,185,129,0.08)';
    dot.style.background = '#10b981';
    dot.style.boxShadow = '0 0 8px #10b981';
    text.textContent = currentSyncStatus.mode === 'hybrid' ? 'Online • Auto Hybrid' : 'Online • Cloud DB';
  } else {
    pill.style.borderColor = 'rgba(245,158,11,0.3)';
    pill.style.background = 'rgba(245,158,11,0.08)';
    dot.style.background = '#f59e0b';
    dot.style.boxShadow = '0 0 8px #f59e0b';
    text.textContent = 'Offline • Local Engine';
  }
}

function refreshSyncStatusUI() {
  const isOnline = currentSyncStatus.effectiveState === 'online';
  const card = document.getElementById('shiftStatusCard');
  const pulse = document.getElementById('shiftCardPulse');
  const title = document.getElementById('shiftCardTitle');
  const subtitle = document.getElementById('shiftCardSubtitle');

  if (card && pulse && title && subtitle) {
    if (isOnline) {
      card.style.background = 'rgba(16,185,129,0.08)';
      card.style.borderColor = 'rgba(16,185,129,0.3)';
      pulse.style.background = '#10b981';
      pulse.style.boxShadow = '0 0 10px #10b981';
      title.textContent = 'Online Mode Active • Cloud DB Connected';
      subtitle.textContent = 'Orders sync to Enterprise Cloud in real-time. Local SQLite WAL active as instant backup.';
    } else {
      card.style.background = 'rgba(245,158,11,0.08)';
      card.style.borderColor = 'rgba(245,158,11,0.3)';
      pulse.style.background = '#f59e0b';
      pulse.style.boxShadow = '0 0 10px #f59e0b';
      title.textContent = 'Offline Local Mode Active • 100% Resilient';
      subtitle.textContent = 'Running purely on local SQLite. Zero cloud dependency. Food ordering and kitchen chimes never stop.';
    }
  }

  // Update stats
  const modalPending = document.getElementById('modalPendingCount');
  if (modalPending) modalPending.textContent = currentSyncStatus.pendingCount || 0;

  const queueDisp = document.getElementById('syncQueueDisplay');
  if (queueDisp) queueDisp.textContent = `${currentSyncStatus.pendingCount || 0} items`;

  const pingDisp = document.getElementById('syncPingDisplay');
  if (pingDisp) {
    pingDisp.textContent = currentSyncStatus.lastPingMs ? `${currentSyncStatus.lastPingMs} ms` : (isOnline ? '22 ms' : 'Offline');
  }

  const timeDisp = document.getElementById('syncLastTimeDisplay');
  if (timeDisp && currentSyncStatus.lastSyncTime) {
    try {
      const d = new Date(currentSyncStatus.lastSyncTime);
      timeDisp.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      timeDisp.textContent = 'Recent';
    }
  }

  // Update radio selection
  const radio = document.querySelector(`input[name="shiftModeRadio"][value="${currentSyncStatus.mode}"]`);
  if (radio) radio.checked = true;

  // Update inputs if empty
  const urlInput = document.getElementById('syncCloudUrl');
  if (urlInput && !urlInput.value && currentSyncStatus.cloudUrl) {
    urlInput.value = currentSyncStatus.cloudUrl;
  }
}

// Call on startup
wireTopbarNotificationButtons();
initShiftModeController();

// Load Data
async function loadAdminData() {
  // Demo Mode Interceptor
  const urlParams = new URLSearchParams(window.location.search);
  const demoParam = urlParams.get('demo');
  if (demoParam) {
    sessionStorage.setItem('activeDemoId', demoParam);
    console.log("Demo Mode Admin Activated. Scoped to:", demoParam);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Display Demo Warning Banner if active
  const activeDemo = sessionStorage.getItem('activeDemoId');
  if (activeDemo && !document.getElementById('demoBanner')) {
     const banner = document.createElement('div');
     banner.id = 'demoBanner';
     banner.style.cssText = 'background: #fef08a; color: #854d0e; padding: 12px; text-align: center; font-weight: bold; font-size: 14px; position: sticky; top: 0; z-index: 100; display: flex; justify-content: center; gap: 16px; align-items: center;';
     banner.innerHTML = `<span>⚠️ YOU ARE IN DEMO MODE (ID: ${activeDemo}). Changes will not affect production.</span> <button onclick="sessionStorage.removeItem('activeDemoId'); window.location.reload();" style="background:#854d0e;color:white;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:12px;">Exit Demo Mode</button>`;
     document.querySelector('.admin-main').prepend(banner);
  }

  let items = [];
  let orders = [];
  let settings = {};
  
  try {
    items = await getItems(); // from db.js
    orders = await getOrders(); // from db.js
    settings = await getSettings(); // from db.js
  } catch (error) {
    console.error("Failed to load admin data:", error);
    alert("Database access denied or error loading data. Please check your Firestore rules and Admin permissions.");
    // Display error state in UI
    statTotalOrders.innerHTML = `<span style="color:red;">Error</span>`;
    statTotalItems.innerHTML = `<span style="color:red;">Error</span>`;
    statRevenue.innerHTML = `<span style="color:red;">Error</span>`;
    menuItemsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading menu items. Missing permissions.</td></tr>';
    recentOrdersTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Error loading orders. Missing permissions.</td></tr>';
    allOrdersTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading orders. Missing permissions.</td></tr>';
    if(bannersTbody) bannersTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Error loading banners.</td></tr>';
    return; // Stop loading data
  }
  
  // Banners, Offers, Categories
  let banners = [];
  let offers = [];
  let categories = [];
  try {
    banners = await getBanners();
    offers = await getOffers();
    categories = await getCategories();
    window.allCategories = categories; // Store globally for sub-category lookup
  } catch(e) {}
  renderBanners(banners);
  renderOffers(offers);
  renderCategories(categories);
  
  // Settings Form
  settings = await getSettings();
  window.currentSettings = settings;
  if (settingRestaurantName) settingRestaurantName.value = settings.restaurantName || '';
  if (settingLogoUrl) settingLogoUrl.value = settings.logoUrl || '';
  if (settingFaviconUrl) settingFaviconUrl.value = settings.faviconUrl || '';
  if (settingPrimaryColor) settingPrimaryColor.value = settings.primaryColor || '#E99545';
  if (settingSecondaryColor) settingSecondaryColor.value = settings.secondaryColor || '#f3f4f6';
  if (settingButtonColor) settingButtonColor.value = settings.buttonColor || '#E99545';
  if (settingTextColor) settingTextColor.value = settings.textColor || '#1f2937';
  if (settingThemePreset) settingThemePreset.value = settings.themePreset || 'default';
  if (settingFontFamily) settingFontFamily.value = settings.fontFamily || 'Plus Jakarta Sans';
  if (settingCurrencySymbol) settingCurrencySymbol.value = settings.currencySymbol || '৳';
  if (settingTaxRate) settingTaxRate.value = settings.taxRate !== undefined ? settings.taxRate : 0;
  
  const customBadgesInput = document.getElementById('settingCustomBadges');
  if (customBadgesInput) customBadgesInput.value = settings.customBadges || '';
  
  if (settingWebsiteBg) settingWebsiteBg.value = settings.websiteBgImage || '';
  if (settingHeroImage) settingHeroImage.value = settings.heroImage || '';
  if (settingHeroTitle) settingHeroTitle.value = settings.heroTitle || '';
  if (settingHeroSubtitle) settingHeroSubtitle.value = settings.heroSubtitle || '';
  if (settingHeroPhone) settingHeroPhone.value = settings.heroOrderPhone || '';
  
  if (settingFooterImage) settingFooterImage.value = settings.footerImage || '';
  if (settingFooterAddress) settingFooterAddress.value = settings.footerAddress || '';
  if (settingFooterPhone) settingFooterPhone.value = settings.footerPhone || '';
  if (settingFooterEmail) settingFooterEmail.value = settings.footerEmail || '';
  if (settingFooterCopyright) settingFooterCopyright.value = settings.footerCopyright || '';
  
  if (settingSocialFb) settingSocialFb.value = settings.socialFb || '';
  if (settingSocialTwitter) settingSocialTwitter.value = settings.socialTwitter || '';
  if (settingSocialInsta) settingSocialInsta.value = settings.socialInsta || '';
  if (settingSocialLinkedin) settingSocialLinkedin.value = settings.socialLinkedin || '';

  // Dynamic Categories
  const enableSubCat = settings.enableSubCategories || false;
  const subCatEl = document.getElementById('settingEnableSubCategories');
  if (subCatEl) subCatEl.checked = enableSubCat;
  
  const enableOffers = settings.enableOffers !== false;
  const offersEl = document.getElementById('settingEnableOffers');
  if (offersEl) offersEl.checked = enableOffers;
  
  const enableDemoContent = settings.enableDemoContent === true;
  const demoEl = document.getElementById('settingEnableDemoContent');
  if (demoEl) demoEl.checked = enableDemoContent;
  
  // Layout Builder
  const defaultLayout = ['hero', 'banners', 'offers', 'menu'];
  let layoutOrder = settings.layoutOrder;
  if (!layoutOrder || !Array.isArray(layoutOrder) || layoutOrder.length !== 4) {
    layoutOrder = defaultLayout;
  }
  const layoutOrderInput = document.getElementById('settingLayoutOrder');
  if (layoutOrderInput) layoutOrderInput.value = JSON.stringify(layoutOrder);
  renderLayoutBuilder(layoutOrder);

  // Geofencing & Physical Security Settings
  const settingGeofenceEnabled = document.getElementById('settingGeofenceEnabled');
  if (settingGeofenceEnabled) settingGeofenceEnabled.checked = settings.geofenceEnabled === true;
  const settingRestaurantLat = document.getElementById('settingRestaurantLat');
  if (settingRestaurantLat) settingRestaurantLat.value = settings.restaurantLat !== undefined ? settings.restaurantLat : 23.8103;
  const settingRestaurantLng = document.getElementById('settingRestaurantLng');
  if (settingRestaurantLng) settingRestaurantLng.value = settings.restaurantLng !== undefined ? settings.restaurantLng : 90.4125;
  const settingGeofenceRadius = document.getElementById('settingGeofenceRadius');
  if (settingGeofenceRadius) settingGeofenceRadius.value = settings.geofenceRadiusMeters || 100;

  // Order Automation & Auto-Shift Steps Settings
  const settingAutoAcceptOrders = document.getElementById('settingAutoAcceptOrders');
  if (settingAutoAcceptOrders) settingAutoAcceptOrders.checked = settings.autoAcceptOrders !== false;
  const settingAutoShiftSteps = document.getElementById('settingAutoShiftSteps');
  if (settingAutoShiftSteps) settingAutoShiftSteps.checked = settings.autoShiftSteps !== false;
  const settingAutoShiftPrep = document.getElementById('settingAutoShiftPrep');
  if (settingAutoShiftPrep) settingAutoShiftPrep.value = settings.autoShiftPrepMinutes || 2;
  const settingAutoShiftReady = document.getElementById('settingAutoShiftReady');
  if (settingAutoShiftReady) settingAutoShiftReady.value = settings.autoShiftReadyMinutes || 10;
  const settingAutoShiftDeliver = document.getElementById('settingAutoShiftDeliver');
  if (settingAutoShiftDeliver) settingAutoShiftDeliver.value = settings.autoShiftDeliverMinutes || 5;

  // Populate Add/Edit item dropdown
  const categorySelect = document.getElementById('formCategory');
  const subCategorySelect = document.getElementById('formSubCategory');
  categorySelect.innerHTML = '';
  
  if (categories.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Please create a category first';
    categorySelect.appendChild(opt);
  } else {
    categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name.toLowerCase();
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });
  }

  // Populate sub-categories dynamically based on selected category
  window.populateSubCategories = () => {
    subCategorySelect.innerHTML = '<option value="">Select Sub-category...</option>';
    const selectedCatValue = categorySelect.value;
    const cat = categories.find(c => c.name.toLowerCase() === selectedCatValue);
    let subCats = [];
    if (cat && cat.subCategories) {
      if (typeof cat.subCategories === 'string') {
        subCats = cat.subCategories.split(',').map(s=>s.trim()).filter(s=>s!=='');
      } else {
        subCats = cat.subCategories;
      }
    }
    if (subCats.length > 0) {
      subCats.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subCategorySelect.appendChild(opt);
      });
    }
  };

  categorySelect.addEventListener('change', window.populateSubCategories);
  
  // Initial population of subcategories
  window.populateSubCategories();
  
  // Toggle sub-category field
  if (enableSubCat) {
    document.getElementById('formSubCategoryGroup').style.display = 'block';
  } else {
    document.getElementById('formSubCategoryGroup').style.display = 'none';
  }

  // Stats
  window.allItems = items;
  window.allOrders = orders;
  updateDashboardStats(items, orders);
  
  if (items.length === 0) {
    menuItemsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No menu items found.</td></tr>';
  } else {
    renderMenuItemsTable(items);
  }
  
  if (orders.length === 0) {
    recentOrdersTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No recent orders.</td></tr>';
    allOrdersTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found.</td></tr>';
  } else {
    renderOrdersTable(orders);
  }

  // --- Real-Time Firestore Subscriptions for Admin Dashboard ---
  if (typeof subscribeOrders === 'function') {
    subscribeOrders(updatedOrders => {
      window.allOrders = updatedOrders;
      if (updatedOrders.length === 0) {
        recentOrdersTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No recent orders.</td></tr>';
        allOrdersTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No orders found.</td></tr>';
      } else {
        renderOrdersTable(updatedOrders);
      }
      updateDashboardStats(window.allItems || [], updatedOrders);
    });
  }

  if (typeof subscribeItems === 'function') {
    subscribeItems(updatedItems => {
      window.allItems = updatedItems;
      if (updatedItems.length === 0) {
        menuItemsTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No menu items found.</td></tr>';
      } else {
        renderMenuItemsTable(updatedItems);
      }
      updateDashboardStats(updatedItems, window.allOrders || []);
    });
  }

  if (typeof subscribeBanners === 'function') {
    subscribeBanners(updatedBanners => renderBanners(updatedBanners));
  }
  // Tables and Occupancy
  let tables = [];
  try {
    if (typeof getTables === 'function') {
      tables = await getTables();
      window.allTables = tables;
    }
  } catch(e) { console.warn("Error loading tables:", e); }
  renderTables(tables, orders);

  if (typeof subscribeTables === 'function') {
    subscribeTables(updatedTables => {
      window.allTables = updatedTables;
      renderTables(updatedTables, window.allOrders || []);
    });
  }
  
  lucide.createIcons();
}

function updateDashboardStats(items = [], orders = []) {
  if (!statTotalOrders || !statTotalItems || !statRevenue) return;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Ready' || o.status === 'Served').length;
  const activeItems = items.filter(i => !i.outOfStock && i.availability !== 'unavailable').length;
  
  statTotalOrders.innerHTML = `${orders.length} <span style="font-size:12px; color:#6b7280; font-weight:normal; display:block;">(${pendingOrders} Pending, ${completedOrders} Completed)</span>`;
  statTotalItems.innerHTML = `${items.length} <span style="font-size:12px; color:#6b7280; font-weight:normal; display:block;">(${activeItems} Available)</span>`;
  
  const revenue = orders
    .filter(order => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + parseInt(order.total || 0), 0);
  statRevenue.textContent = `৳ ${revenue.toLocaleString('en-IN')}`;
}

// Banners Rendering
function renderBanners(banners) {
  if (!bannersTbody) return;
  bannersTbody.innerHTML = '';
  if (banners.length === 0) {
    bannersTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#6b7280; padding:20px;">No banners available. Add one!</td></tr>';
    return;
  }
  
  banners.forEach(banner => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${banner.image}" alt="${banner.title}" style="width:100px; height:50px; object-fit:cover; border-radius:4px;"></td>
      <td>${banner.title}</td>
      <td>${banner.desc || '-'}</td>
      <td>${banner.link ? `<a href="${banner.link}" target="_blank">Link</a>` : '-'}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-secondary btn-sm" onclick='editBanner(${JSON.stringify(banner).replace(/'/g, "&apos;")})'><i data-lucide="edit"></i></button>
          <button class="btn btn-secondary btn-sm" style="color: #dc2626;" onclick="removeBanner('${banner.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    bannersTbody.appendChild(tr);
  });
  
  lucide.createIcons();
}

function renderMenuItemsTable(items) {
  menuItemsTbody.innerHTML = '';
  items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${item.image}" class="thumb-img" alt="${item.title}"></td>
      <td>
        <strong>${item.title}</strong>
        ${item.subCategory ? `<br><small style="color:var(--text-light)">${item.subCategory}</small>` : ''}
      </td>
      <td style="text-transform: capitalize;">${item.category}</td>
      <td>৳ ${item.price}</td>
      <td><span class="badge ${item.dietary}">${item.dietary}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-secondary btn-sm" onclick="editItem('${item.id}')"><i data-lucide="edit"></i></button>
          <button class="btn btn-secondary btn-sm" style="color: #dc2626;" onclick="deleteItemHandler('${item.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    `;
    menuItemsTbody.appendChild(tr);
  });
}

// --- Kitchen Display System (KDS) & Orders Engine (PRD-OMS-002 §2.1) ---
let ordersDisplayMode = 'kds'; // 'kds' or 'table'

window.setOrdersDisplayMode = function(mode) {
  ordersDisplayMode = mode;
  const btnKds = document.getElementById('btnToggleKdsView');
  const btnTable = document.getElementById('btnToggleTableView');
  const kdsContainer = document.getElementById('kdsBoardContainer');
  const tableContainer = document.getElementById('ordersTableContainer');

  if (mode === 'kds') {
    if (btnKds) btnKds.classList.add('active');
    if (btnTable) btnTable.classList.remove('active');
    if (kdsContainer) kdsContainer.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
  } else {
    if (btnKds) btnKds.classList.remove('active');
    if (btnTable) btnTable.classList.add('active');
    if (kdsContainer) kdsContainer.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');
  }
};

function renderOrdersTable(orders) {
  renderOrdersTableView(orders);
  renderKdsBoard(orders);
  if (typeof renderAnalyticsView === 'function') {
    renderAnalyticsView();
  }
}

function renderKdsBoard(orders) {
  const kdsCardsPending = document.getElementById('kdsCardsPending');
  const kdsCardsPreparing = document.getElementById('kdsCardsPreparing');
  const kdsCardsReady = document.getElementById('kdsCardsReady');
  const kdsCardsDelivered = document.getElementById('kdsCardsDelivered');

  if (!kdsCardsPending) return;

  // Clear containers
  kdsCardsPending.innerHTML = '';
  kdsCardsPreparing.innerHTML = '';
  kdsCardsReady.innerHTML = '';
  kdsCardsDelivered.innerHTML = '';

  const pendingList = [];
  const preparingList = [];
  const readyList = [];
  const deliveredList = [];

  const now = Date.now();

  orders.forEach(order => {
    const s = (order.status || '').toLowerCase();
    if (s === 'pending') {
      pendingList.push(order);
    } else if (s === 'cooking' || s === 'preparing' || s === 'accepted') {
      preparingList.push(order);
    } else if (s === 'ready') {
      readyList.push(order);
    } else if (s === 'completed' || s === 'delivered' || s === 'served') {
      deliveredList.push(order);
    }
  });

  // Update column badges
  if (document.getElementById('kdsCountPending')) document.getElementById('kdsCountPending').textContent = pendingList.length;
  if (document.getElementById('kdsCountPreparing')) document.getElementById('kdsCountPreparing').textContent = preparingList.length;
  if (document.getElementById('kdsCountReady')) document.getElementById('kdsCountReady').textContent = readyList.length;
  if (document.getElementById('kdsCountDelivered')) document.getElementById('kdsCountDelivered').textContent = deliveredList.length;

  // Helper to build KDS Card HTML
  const buildCard = (order, stage) => {
    const orderDate = new Date(order.date || order.createdAt || now);
    const elapsedMinutes = Math.floor((now - orderDate.getTime()) / (1000 * 60));
    const elapsedFormatted = elapsedMinutes < 60 ? `${elapsedMinutes}m ago` : `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m ago`;
    
    // SLA Overdue threshold: 20 minutes for cooking (PRD-OMS-002 §2.1)
    const isSlaOverdue = stage === 'preparing' && elapsedMinutes >= 20;

    const itemsHtml = (order.items || []).map(i => {
      let desc = `<div class="kds-item-row"><span class="kds-item-qty">${i.quantity}x</span> <span class="kds-item-name">${i.title}</span></div>`;
      if (i.variant) desc += `<span class="kds-item-modifiers">• Option: ${i.variant}</span>`;
      if (i.addons && i.addons.length > 0) desc += `<span class="kds-item-modifiers">• Add-ons: ${i.addons.join(', ')}</span>`;
      if (i.instructions) desc += `<span class="kds-item-modifiers" style="color:#d97706;font-weight:600;">• Note: "${i.instructions}"</span>`;
      return desc;
    }).join('');

    const card = document.createElement('div');
    card.className = `kds-card ${stage === 'pending' ? 'flashing-new' : ''}`;
    
    let footerActions = '';
    if (stage === 'pending') {
      footerActions = `
        <button type="button" class="btn-kds-action btn-kds-reject" onclick="changeOrderStatus('${order.id}', 'Cancelled')">Reject</button>
        <button type="button" class="btn-kds-action btn-kds-accept" onclick="changeOrderStatus('${order.id}', 'Cooking')">Accept & Cook</button>
      `;
    } else if (stage === 'preparing') {
      footerActions = `
        <button type="button" class="btn-kds-action btn-kds-ready" onclick="changeOrderStatus('${order.id}', 'Ready')">
          <i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> Mark Ready
        </button>
      `;
    } else if (stage === 'ready') {
      footerActions = `
        <button type="button" class="btn-kds-action btn-kds-deliver" onclick="changeOrderStatus('${order.id}', 'Completed')">
          <i data-lucide="send" style="width:14px;height:14px;"></i> Mark Delivered
        </button>
      `;
    } else {
      footerActions = `
        <button type="button" class="btn btn-secondary btn-sm" onclick="printOrderInvoice('${order.id}')" style="width:100%; display:flex; align-items:center; justify-content:center; gap:6px;">
          <i data-lucide="printer" style="width:13px;height:13px;"></i> Receipt
        </button>
      `;
    }

    card.innerHTML = `
      <div class="kds-card-header">
        <span class="kds-table-badge">${order.tableNo || 'Table 1'}</span>
        <span class="kds-order-id">#${order.id}</span>
        <span class="kds-timer-badge ${isSlaOverdue ? 'overdue' : ''}">
          <i data-lucide="${isSlaOverdue ? 'alert-triangle' : 'clock'}" style="width:12px;height:12px;"></i>
          ${isSlaOverdue ? `SLA OVERDUE (${elapsedMinutes}m)` : elapsedFormatted}
        </span>
      </div>
      <div class="kds-card-items-list">
        ${itemsHtml}
      </div>
      ${order.notes ? `<div class="kds-notes-box"><i data-lucide="message-square" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i>"${order.notes}"</div>` : ''}
      <div class="kds-card-footer">
        ${footerActions}
      </div>
    `;
    return card;
  };

  pendingList.forEach(o => kdsCardsPending.appendChild(buildCard(o, 'pending')));
  preparingList.forEach(o => kdsCardsPreparing.appendChild(buildCard(o, 'preparing')));
  readyList.forEach(o => kdsCardsReady.appendChild(buildCard(o, 'ready')));
  deliveredList.forEach(o => kdsCardsDelivered.appendChild(buildCard(o, 'delivered')));

  if (window.lucide) lucide.createIcons();
}

function renderOrdersTableView(orders) {
  // Sort latest first
  const sortedOrders = [...orders].reverse();
  
  // Dashboard Recent Orders (Top 5)
  if (recentOrdersTbody) {
    recentOrdersTbody.innerHTML = '';
    sortedOrders.slice(0, 5).forEach(order => {
      const date = new Date(order.date).toLocaleString();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${order.id}</strong></td>
        <td>${date}</td>
        <td><span class="badge ${order.status.toLowerCase()}">${order.status}</span></td>
        <td>৳ ${order.total}</td>
      `;
      recentOrdersTbody.appendChild(tr);
    });
  }
  
  // All Orders View
  if (allOrdersTbody) {
    allOrdersTbody.innerHTML = '';
    sortedOrders.forEach(order => {
      const date = new Date(order.date).toLocaleString();
      const itemsHtml = (order.items || []).map(i => {
        let desc = `${i.quantity}x ${i.title}`;
        if (i.variant) desc += ` (${i.variant})`;
        if (i.addons && i.addons.length > 0) desc += ` [+${i.addons.join(', ')}]`;
        return desc;
      }).join('<br>');
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${order.id}</strong></td>
        <td>${date}</td>
        <td>
          <strong>${order.tableNo || 'Table 1'}</strong>
          ${order.notes ? `<div style="font-size:11px; color:#64748B; font-style:italic;">Note: "${order.notes}"</div>` : ''}
        </td>
        <td style="font-size: 12px; color: #475569;">${itemsHtml}</td>
        <td><strong>৳ ${order.total}</strong></td>
        <td>
          <select class="form-control" onchange="changeOrderStatus('${order.id}', this.value)" style="padding:4px 8px; font-size:12px; border-radius:6px;">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
            <option value="Cooking" ${order.status === 'Cooking' ? 'selected' : ''}>👨‍🍳 Cooking</option>
            <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>🔔 Ready</option>
            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
          </select>
        </td>
        <td>
          <div style="display:flex; align-items:center; gap:6px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="printOrderInvoice('${order.id}')" title="Print Invoice / Receipt" style="display:inline-flex; align-items:center; gap:4px; padding:6px 10px;">
              <i data-lucide="printer" style="width:14px; height:14px;"></i> Print
            </button>
            <button type="button" class="btn btn-sm" onclick="deleteOrderHandler('${order.id}')" title="Delete Order" style="background:#FEE2E2; color:#DC2626; border:1px solid #FECACA; padding:6px 8px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </td>
      `;
      allOrdersTbody.appendChild(tr);
    });
  }

  if (window.lucide) lucide.createIcons();
}

// --- Deep Analytics Engine & Table Revenue Heatmap (PRD-OMS-002 §3) ---
window.renderAnalyticsView = function() {
  const orders = window.allOrders || [];
  const tables = window.allTables || [];
  const items = window.allItems || [];

  // 1. Real-Time KPIs
  const occupiedTables = tables.filter(t => (t.status || '').toLowerCase() === 'occupied').length;
  const activeTablesEl = document.getElementById('analyticsActiveTables');
  if (activeTablesEl) activeTablesEl.textContent = `${occupiedTables} / ${tables.length} Occupied`;

  const totalRev = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const revEl = document.getElementById('analyticsRevenueToday');
  if (revEl) revEl.textContent = `৳ ${totalRev.toLocaleString('en-IN')}`;

  let kitchenItemsCount = 0;
  orders.filter(o => o.status === 'Pending' || o.status === 'Cooking').forEach(o => {
    (o.items || []).forEach(it => kitchenItemsCount += (parseInt(it.quantity) || 1));
  });
  const kitchenLoadEl = document.getElementById('analyticsKitchenLoad');
  if (kitchenLoadEl) kitchenLoadEl.textContent = `${kitchenItemsCount} Items Cooking`;

  // 2. Table Revenue Heatmap
  const heatmapGrid = document.getElementById('analyticsHeatmapGrid');
  if (heatmapGrid) {
    heatmapGrid.innerHTML = '';
    
    // Calculate revenue per table
    const tableRevMap = {};
    orders.filter(o => o.status !== 'Cancelled').forEach(o => {
      const tName = o.tableNo || 'Table 1';
      tableRevMap[tName] = (tableRevMap[tName] || 0) + (parseFloat(o.total) || 0);
    });

    tables.forEach(table => {
      const rev = tableRevMap[table.name] || 0;
      let tierClass = 'tier-empty';
      let tierLabel = 'Vacant / ₹0';

      if (rev >= 4000) {
        tierClass = 'tier-high';
        tierLabel = 'Top Revenue Tier';
      } else if (rev >= 1200) {
        tierClass = 'tier-med';
        tierLabel = 'Medium Revenue Tier';
      } else if (rev > 0) {
        tierClass = 'tier-low';
        tierLabel = 'Low / Active Tier';
      }

      const card = document.createElement('div');
      card.className = `heatmap-table-card ${tierClass}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:15px;">${table.name}</strong>
          <span style="font-size:11px; font-weight:700; opacity:0.8;">Cap: ${table.capacity || 4}p</span>
        </div>
        <div style="font-size:18px; font-weight:800; margin:4px 0;">৳ ${rev.toLocaleString('en-IN')}</div>
        <div style="font-size:11px; opacity:0.85;">${tierLabel}</div>
      `;
      heatmapGrid.appendChild(card);
    });
  }

  // 3. Product Performance & ABC Analysis
  const abcTbody = document.getElementById('analyticsAbcTbody');
  if (abcTbody) {
    abcTbody.innerHTML = '';
    const itemSales = {};

    orders.filter(o => o.status !== 'Cancelled').forEach(o => {
      (o.items || []).forEach(it => {
        const title = it.title;
        if (!itemSales[title]) {
          itemSales[title] = { title, units: 0, revenue: 0, category: 'Menu Item', price: it.price || 0 };
        }
        itemSales[title].units += (parseInt(it.quantity) || 1);
        itemSales[title].revenue += ((parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1));
      });
    });

    const rankedItems = Object.values(itemSales).sort((a, b) => b.revenue - a.revenue);
    const cumulativeTotal = rankedItems.reduce((acc, it) => acc + it.revenue, 0) || 1;
    let runningSum = 0;

    rankedItems.forEach(item => {
      runningSum += item.revenue;
      const pct = (runningSum / cumulativeTotal) * 100;
      let abcClass = 'abc-badge-a';
      let abcText = 'Category A (Star)';

      if (pct > 90) {
        abcClass = 'abc-badge-c';
        abcText = 'Category C (Review)';
      } else if (pct > 70) {
        abcClass = 'abc-badge-b';
        abcText = 'Category B (Core)';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.title}</strong></td>
        <td>${item.category}</td>
        <td>৳ ${item.price}</td>
        <td><strong>${item.units}</strong></td>
        <td><strong>৳ ${item.revenue.toLocaleString('en-IN')}</strong></td>
        <td><span class="abc-category-badge ${abcClass}">${abcText}</span></td>
      `;
      abcTbody.appendChild(tr);
    });
  }
};

window.exportAccountingCsv = function() {
  const orders = window.allOrders || [];
  if (orders.length === 0) {
    alert("No orders available to export.");
    return;
  }

  const rows = [
    ["Transaction Date", "Transaction ID", "Table No", "Session ID", "Status", "Items Summary", "Total Amount (BDT)", "Accounting Code"]
  ];

  orders.forEach(o => {
    const d = new Date(o.date || Date.now()).toISOString();
    const itemsSummary = (o.items || []).map(i => `${i.quantity}x ${i.title}`).join('; ');
    rows.push([
      d,
      o.id || '',
      o.tableNo || 'Table 1',
      o.sessionId || 'N/A',
      o.status || 'Completed',
      `"${itemsSummary.replace(/"/g, '""')}"`,
      o.total || 0,
      "REV-4001-F&B"
    ]);
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `evorise_quickbooks_journal_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Global Handlers
window.changeOrderStatus = async function(id, status) {
  await updateOrderStatus(id, status);
  if (typeof loadAdminData === 'function') loadAdminData();
};

window.deleteOrderHandler = async function(id) {
  if (confirm(`Are you sure you want to delete order ${id}? This action cannot be undone.`)) {
    await deleteOrder(id);
    if (typeof loadAdminData === 'function') loadAdminData();
  }
};

window.currentPrintingOrder = null;

window.printOrderInvoice = async function(orderId) {
  let order = (window.allOrders || []).find(o => String(o.id) === String(orderId));
  if (!order && typeof getOrderById === 'function') {
    order = await getOrderById(orderId);
  }
  if (!order) {
    alert("Order not found.");
    return;
  }

  window.currentPrintingOrder = order;

  const invoiceBody = document.getElementById('printableInvoiceBody');
  if (invoiceBody) {
    invoiceBody.innerHTML = generateInvoiceHtml(order);
  }

  const invoiceModal = document.getElementById('invoiceModal');
  if (invoiceModal) {
    invoiceModal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
  }
};

window.closeInvoiceModal = function() {
  const invoiceModal = document.getElementById('invoiceModal');
  if (invoiceModal) {
    invoiceModal.style.display = 'none';
  }
};

window.printInvoiceDocument = function() {
  window.print();
};

window.printEscPosThermalCurrent = async function() {
  if (!window.currentPrintingOrder) {
    alert("No active order selected for thermal printing.");
    return;
  }
  await window.printEscPosThermal(window.currentPrintingOrder.id);
};

window.printEscPosThermal = async function(orderId) {
  const order = (window.allOrders || []).find(o => String(o.id) === String(orderId)) || window.currentPrintingOrder;
  if (!order) {
    alert("Order not found for thermal print.");
    return;
  }
  try {
    const res = await fetch('/api/v1/pos/print/escpos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!res.ok) throw new Error('Thermal spooler request failed');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `receipt-${order.id || 'order'}.bin`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    alert(`🖨️ [ARCH-POS-005] Raw ESC/POS Thermal Byte Stream generated successfully!\nBinary sent to local print spooler for Order #${order.id}`);
  } catch (err) {
    alert('Failed to generate thermal print bytes: ' + err.message);
  }
};

function generateInvoiceHtml(order) {
  const dateFormatted = new Date(order.date || Date.now()).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const itemsRows = (order.items || []).map(item => {
    const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
    let details = '';
    if (item.variant) details += `<div style="font-size:11px; color:#64748B;">Option: ${item.variant}</div>`;
    if (item.addons && item.addons.length > 0) details += `<div style="font-size:11px; color:#64748B;">+ ${item.addons.join(', ')}</div>`;
    
    return `
      <tr style="border-bottom:1px dashed #E2E8F0;">
        <td style="padding:8px 0; text-align:left;">
          <strong style="color:#0F172A;">${item.title || 'Item'}</strong>
          ${details}
        </td>
        <td style="padding:8px 6px; text-align:center; color:#475569;">${item.quantity || 1}</td>
        <td style="padding:8px 6px; text-align:right; color:#475569;">৳ ${(parseFloat(item.price) || 0).toLocaleString()}</td>
        <td style="padding:8px 0; text-align:right; font-weight:600; color:#0F172A;">৳ ${itemTotal.toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  const subtotal = parseFloat(order.total) || 0;
  
  return `
    <div class="restaurant-invoice" style="max-width:420px; margin:0 auto; background:#FFFFFF; font-family:'Courier New', Courier, monospace; color:#0F172A; line-height:1.4;">
      <div style="text-align:center; padding-bottom:14px; border-bottom:2px dashed #94A3B8;">
        <h2 style="margin:0; font-size:22px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">EVORISE RESTAURANT</h2>
        <p style="margin:3px 0; font-size:12px; color:#64748B;">Gourmet & Dining Experience</p>
        <p style="margin:2px 0; font-size:11px; color:#64748B;">Phone: +34 685 778 8892 | Web: evorise-menu.com</p>
        <div style="margin-top:6px; display:inline-block; padding:3px 12px; background:#F1F5F9; border-radius:4px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">TAX INVOICE / RECEIPT</div>
      </div>

      <div style="padding:12px 0; border-bottom:1px dashed #CBD5E1; font-size:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span><strong>Order ID:</strong> ${order.id}</span>
          <span><strong>Table:</strong> ${order.tableNo || 'Table 1'}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#475569;">
          <span>Date: ${dateFormatted}</span>
          <span style="font-weight:600; color:#16A34A;">[${order.status || 'Pending'}]</span>
        </div>
        ${order.notes ? `<div style="margin-top:4px; font-style:italic; color:#64748B;">Note: "${order.notes}"</div>` : ''}
      </div>

      <table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:12px;">
        <thead>
          <tr style="border-bottom:1px solid #0F172A; text-transform:uppercase; font-size:11px;">
            <th style="padding:6px 0; text-align:left;">Item</th>
            <th style="padding:6px; text-align:center;">Qty</th>
            <th style="padding:6px; text-align:right;">Price</th>
            <th style="padding:6px 0; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="border-top:1px dashed #CBD5E1; padding-top:10px; font-size:13px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#475569;">
          <span>Subtotal:</span>
          <span>৳ ${subtotal.toLocaleString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#475569;">
          <span>Tax / VAT (0% Included):</span>
          <span>৳ 0</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:2px solid #0F172A; font-size:16px; font-weight:800;">
          <span>GRAND TOTAL:</span>
          <span style="color:#244638;">৳ ${subtotal.toLocaleString()}</span>
        </div>
        <div style="margin-top:6px; font-size:11px; color:#64748B; text-align:right;">
          Payment: <strong>${order.paymentStatus || 'Cash at Counter'}</strong>
        </div>
      </div>

      <div style="text-align:center; margin-top:20px; padding-top:14px; border-top:2px dashed #94A3B8; font-size:11px; color:#64748B;">
        <p style="margin:2px 0; font-weight:700; color:#0F172A;">Thank you for dining with Evorise!</p>
        <p style="margin:2px 0;">Please visit us again soon.</p>
        <p style="margin:6px 0 0; font-size:10px; color:#94A3B8;">Powered by Evorise QR Dining Platform</p>
      </div>
    </div>
  `;
}

window.deleteItemHandler = async function(id) {
  if (confirm("Are you sure you want to delete this item?")) {
    await deleteItem(id);
    loadAdminData();
  }
}

window.editItem = async function(id) {
  const items = await getItems();
  const item = items.find(i => String(i.id) === String(id));
  if (item) {
    document.getElementById('formId').value = item.id;
    document.getElementById('formTitle').value = item.title;
    
    const categorySelect = document.getElementById('formCategory');
    categorySelect.value = item.category;
    
    // Trigger change event to populate sub-categories
    const event = new Event('change');
    categorySelect.dispatchEvent(event);

    // Now set the sub-category
    const subCategorySelect = document.getElementById('formSubCategory');
    if (item.subCategory) {
      // Check if the sub-category exists in the options, if not add it temporarily
      let hasOption = false;
      Array.from(subCategorySelect.options).forEach(opt => {
        if (opt.value === item.subCategory) hasOption = true;
      });
      if (!hasOption) {
        const opt = document.createElement('option');
        opt.value = item.subCategory;
        opt.textContent = item.subCategory;
        subCategorySelect.appendChild(opt);
      }
      subCategorySelect.value = item.subCategory;
    } else {
      subCategorySelect.value = '';
    }
    
    document.getElementById('formPrice').value = item.price;
    document.getElementById('formDietary').value = item.dietary;
    document.getElementById('formDesc').value = item.desc;
    document.getElementById('formImage').value = item.image;
    
    document.getElementById('formOutOfStock').checked = item.outOfStock || false;
    document.getElementById('formAddons').value = item.addons || '';
    document.getElementById('formPortion').value = item.portion || '';
    document.getElementById('formVariants').value = item.variants || '';
    
    const preview = document.getElementById('formImagePreview');
    if (item.image) {
      preview.src = item.image;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
      preview.src = '';
    }
    
    if (window.populateBadges) window.populateBadges(item.badges || []);
    
    modalFormTitle.textContent = "Edit Item";
    itemModal.classList.remove('hidden');
  }
}

// Modal Handlers
btnAddNewItem.addEventListener('click', () => {
  itemForm.reset();
  document.getElementById('formId').value = '';
  modalFormTitle.textContent = "Add New Item";
  
  document.getElementById('formImagePreview').style.display = 'none';
  document.getElementById('formImagePreview').src = '';

  if (window.populateSubCategories) window.populateSubCategories();
  if (window.populateBadges) window.populateBadges();
  
  itemModal.classList.remove('hidden');
});

window.populateBadges = function(selectedBadges = []) {
  const container = document.getElementById('formBadgesContainer');
  if (!container) return;
  container.innerHTML = '';
  
  let badgesStr = 'Halal, Gluten-Free, Spicy';
  if (window.currentSettings && window.currentSettings.customBadges) {
    badgesStr = window.currentSettings.customBadges;
  }
  
  const badges = badgesStr.split(',').map(b => b.trim()).filter(b => b !== '');
  badges.forEach(b => {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '6px';
    label.style.fontWeight = 'normal';
    label.style.cursor = 'pointer';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'itemBadges';
    cb.value = b;
    if (selectedBadges.includes(b)) cb.checked = true;
    
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + b));
    container.appendChild(label);
  });
};

window.previewImage = function(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      preview.style.animation = 'fadeIn 0.3s ease-in-out';
    }
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.style.display = 'none';
  }
}

// Banner Functions
window.editBanner = function(banner) {
  bannerForm.reset();
  modalBannerTitle.textContent = "Edit Banner";
  document.getElementById('formBannerId').value = banner.id;
  document.getElementById('formBannerTitle').value = banner.title;
  document.getElementById('formBannerDesc').value = banner.desc || '';
  document.getElementById('formBannerLink').value = banner.link || '';
  document.getElementById('formBannerImage').value = banner.image || '';
  bannerModal.classList.remove('hidden');
}

function closeBannerForm() {
  bannerForm.reset();
  document.getElementById('formBannerId').value = '';
  bannerModal.classList.add('hidden');
}

window.removeBanner = async function(id) {
  if (confirm('Are you sure you want to delete this banner?')) {
    await deleteBanner(id);
    loadAdminData();
  }
}

if(btnAddNewBanner) btnAddNewBanner.addEventListener('click', () => {
  bannerForm.reset();
  modalBannerTitle.textContent = "Add New Banner";
  document.getElementById('formBannerId').value = '';
  bannerModal.classList.remove('hidden');
});
if(btnBannerModalClose) btnBannerModalClose.addEventListener('click', closeBannerForm);
if(btnBannerModalCancel) btnBannerModalCancel.addEventListener('click', closeBannerForm);

if(bannerForm) bannerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = bannerForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  submitBtn.disabled = true;

  try {
    let imageUrl = document.getElementById('formBannerImage').value;
    const fileInput = document.getElementById('formBannerImageFile');
    if (fileInput.files.length > 0) {
      submitBtn.textContent = "Uploading Image...";
      const uploadedUrl = await uploadImageToStorage(fileInput.files[0], 'banners');
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80';
    }

    const newBanner = {
      id: document.getElementById('formBannerId').value,
      title: document.getElementById('formBannerTitle').value,
      desc: document.getElementById('formBannerDesc').value,
      link: document.getElementById('formBannerLink').value,
      image: imageUrl
    };
    
    await saveBanner(newBanner);
    closeBannerForm();
    loadAdminData();
  } catch(error) {
    console.error("Error saving banner:", error);
    alert("Error saving banner. " + error.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Offer Functions
window.editOffer = function(offer) {
  offerForm.reset();
  modalOfferTitle.textContent = "Edit Offer";
  document.getElementById('formOfferId').value = offer.id;
  document.getElementById('formOfferTitle').value = offer.title;
  document.getElementById('formOfferDesc').value = offer.desc || '';
  document.getElementById('formOfferPrice').value = offer.price || '';
  document.getElementById('formOfferImage').value = offer.image || '';
  offerModal.classList.remove('hidden');
}

function closeOfferForm() {
  offerForm.reset();
  document.getElementById('formOfferId').value = '';
  offerModal.classList.add('hidden');
}

window.removeOffer = async function(id) {
  if (confirm('Are you sure you want to delete this offer?')) {
    await deleteOffer(id);
    loadAdminData();
  }
}

if(btnAddNewOffer) btnAddNewOffer.addEventListener('click', () => {
  offerForm.reset();
  modalOfferTitle.textContent = "Add New Offer";
  document.getElementById('formOfferId').value = '';
  offerModal.classList.remove('hidden');
});
if(btnOfferModalClose) btnOfferModalClose.addEventListener('click', closeOfferForm);
if(btnOfferModalCancel) btnOfferModalCancel.addEventListener('click', closeOfferForm);

if(offerForm) offerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = offerForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  submitBtn.disabled = true;

  try {
    let imageUrl = document.getElementById('formOfferImage').value;
    const fileInput = document.getElementById('formOfferImageFile');
    if (fileInput && fileInput.files.length > 0) {
      submitBtn.textContent = "Uploading Image...";
      const uploadedUrl = await uploadImageToStorage(fileInput.files[0], 'offers');
      if (uploadedUrl) imageUrl = uploadedUrl;
    }
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
    }

    const newOffer = {
      id: document.getElementById('formOfferId').value,
      title: document.getElementById('formOfferTitle').value,
      desc: document.getElementById('formOfferDesc').value,
      price: document.getElementById('formOfferPrice').value,
      image: imageUrl
    };
    
    await saveOffer(newOffer);
    closeOfferForm();
    loadAdminData();
  } catch(error) {
    console.error("Error saving offer:", error);
    alert("Error saving offer. " + error.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// --- Render Offers ---
function renderOffers(offers) {
  if(!offersTbody) return;
  offersTbody.innerHTML = '';
  offers.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        ${o.image ? `<img src="${o.image}" style="width:60px; height:40px; object-fit:cover; border-radius:4px;">` : '<div style="width:60px; height:40px; background:#f3f4f6; border-radius:4px; display:flex; align-items:center; justify-content:center;"><i data-lucide="image" style="width:20px; color:#9ca3af;"></i></div>'}
      </td>
      <td><strong>${o.title}</strong><br><small style="color:var(--admin-text-muted)">${o.price || 'No Price Set'}</small></td>
      <td>${o.desc || '-'}</td>
      <td class="action-buttons">
        <button class="btn-icon btn-edit" onclick='editOffer(${JSON.stringify(o).replace(/'/g, "&#39;")})'><i data-lucide="edit-2"></i></button>
        <button class="btn-icon btn-delete" onclick="removeOffer('${o.id}')"><i data-lucide="trash-2"></i></button>
      </td>
    `;
    offersTbody.appendChild(tr);
  });
  if (window.lucide) window.lucide.createIcons();
}

const closeForm = () => {
  itemModal.classList.add('hidden');
  itemForm.reset();
};

btnModalClose.addEventListener('click', closeForm);
btnModalCancel.addEventListener('click', closeForm);

// Form Submit
itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = itemForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving to Firebase...";
  submitBtn.disabled = true;

  try {
    let imageUrl = (document.getElementById('formImage').value || '').trim();
    const fileInput = document.getElementById('formImageFile');
    if (fileInput && fileInput.files.length > 0) {
      submitBtn.textContent = "Optimizing Image...";
      const uploadedUrl = await uploadImageToStorage(fileInput.files[0], 'menu_items');
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
    }

    const badges = Array.from(document.querySelectorAll('input[name="itemBadges"]:checked')).map(cb => cb.value);

    const newItem = {
      id: (document.getElementById('formId').value || '').trim(),
      title: (document.getElementById('formTitle').value || '').trim(),
      category: (document.getElementById('formCategory').value || 'mains').trim().toLowerCase(),
      subCategory: (document.getElementById('formSubCategory').value || '').trim(),
      price: parseFloat(document.getElementById('formPrice').value) || 0,
      dietary: document.getElementById('formDietary').value || 'non-veg',
      desc: (document.getElementById('formDesc').value || '').trim(),
      image: imageUrl,
      outOfStock: document.getElementById('formOutOfStock').checked,
      badges: badges,
      addons: (document.getElementById('formAddons').value || '').trim(),
      portion: (document.getElementById('formPortion').value || '').trim(),
      variants: (document.getElementById('formVariants').value || '').trim()
    };
    
    submitBtn.textContent = "Saving to Database...";
    await saveItem(newItem);
    closeForm();
    loadAdminData();
  } catch(error) {
    console.error("Error saving item:", error);
    alert("Notice: " + (error.message || "Failed to save item. Please ensure you are logged in as Admin."));
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Theme Preset Change Handler
if (settingThemePreset) {
  settingThemePreset.addEventListener('change', (e) => {
    const preset = e.target.value;
    if (preset === 'elegant') {
      settingPrimaryColor.value = '#C5A880';
      settingSecondaryColor.value = '#1A1A1A';
      settingButtonColor.value = '#C5A880';
      settingTextColor.value = '#F5F5F5';
      settingFontFamily.value = 'Playfair Display';
    } else if (preset === 'vibrant') {
      settingPrimaryColor.value = '#FF5722';
      settingSecondaryColor.value = '#FFF8F0';
      settingButtonColor.value = '#FF5722';
      settingTextColor.value = '#333333';
      settingFontFamily.value = 'Outfit';
    } else if (preset === 'minimalist') {
      settingPrimaryColor.value = '#333333';
      settingSecondaryColor.value = '#FFFFFF';
      settingButtonColor.value = '#333333';
      settingTextColor.value = '#111111';
      settingFontFamily.value = 'Inter';
    } else { // default
      settingPrimaryColor.value = '#E99545';
      settingSecondaryColor.value = '#f3f4f6';
      settingButtonColor.value = '#E99545';
      settingTextColor.value = '#1f2937';
      settingFontFamily.value = 'Plus Jakarta Sans';
    }
  });
}

// Settings Submit
settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = settingsForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Saving...";
  submitBtn.disabled = true;

  try {
    const currentSettings = await getSettings();
    
    // File Uploads
    const uploadInput = async (inputId, currentUrl) => {
      const fileInput = document.getElementById(inputId + 'File');
      if (fileInput && fileInput.files.length > 0) {
        submitBtn.textContent = "Uploading Images...";
        const uploadedUrl = await uploadImageToStorage(fileInput.files[0], 'settings');
        if (uploadedUrl) return uploadedUrl;
      }
      return currentUrl;
    };

    currentSettings.restaurantName = settingRestaurantName ? settingRestaurantName.value : (currentSettings.restaurantName || 'Spice Garden');
    currentSettings.logoUrl = await uploadInput('settingLogo', settingLogoUrl ? settingLogoUrl.value : '');
    currentSettings.faviconUrl = await uploadInput('settingFavicon', settingFaviconUrl ? settingFaviconUrl.value : '');
    currentSettings.websiteBgImage = await uploadInput('settingWebsiteBg', settingWebsiteBg ? settingWebsiteBg.value : '');
    currentSettings.heroImage = await uploadInput('settingHeroImage', settingHeroImage ? settingHeroImage.value : '');
    currentSettings.footerImage = await uploadInput('settingFooterImage', settingFooterImage ? settingFooterImage.value : '');

    if (settingPrimaryColor) currentSettings.primaryColor = settingPrimaryColor.value;
    if (settingSecondaryColor) currentSettings.secondaryColor = settingSecondaryColor.value;
    if (settingButtonColor) currentSettings.buttonColor = settingButtonColor.value;
    if (settingTextColor) currentSettings.textColor = settingTextColor.value;
    if (settingThemePreset) currentSettings.themePreset = settingThemePreset.value;
    if (settingFontFamily) currentSettings.fontFamily = settingFontFamily.value;
    if (settingCurrencySymbol) currentSettings.currencySymbol = settingCurrencySymbol.value;
    if (settingTaxRate) currentSettings.taxRate = parseFloat(settingTaxRate.value) || 0;
    
    const subCatEl = document.getElementById('settingEnableSubCategories');
    if (subCatEl) currentSettings.enableSubCategories = subCatEl.checked;
    const offersEl = document.getElementById('settingEnableOffers');
    if (offersEl) currentSettings.enableOffers = offersEl.checked;
    const demoEl = document.getElementById('settingEnableDemoContent');
    if (demoEl) currentSettings.enableDemoContent = demoEl.checked;
    
    const layoutEl = document.getElementById('settingLayoutOrder');
    if (layoutEl && layoutEl.value) {
      try {
        currentSettings.layoutOrder = JSON.parse(layoutEl.value);
      } catch(e) {}
    }
    const badgesEl = document.getElementById('settingCustomBadges');
    if (badgesEl) currentSettings.customBadges = badgesEl.value;
    
    if (settingHeroTitle) currentSettings.heroTitle = settingHeroTitle.value;
    if (settingHeroSubtitle) currentSettings.heroSubtitle = settingHeroSubtitle.value;
    if (settingHeroPhone) currentSettings.heroOrderPhone = settingHeroPhone.value;
    
    if (settingFooterAddress) currentSettings.footerAddress = settingFooterAddress.value;
    if (settingFooterPhone) currentSettings.footerPhone = settingFooterPhone.value;
    if (settingFooterEmail) currentSettings.footerEmail = settingFooterEmail.value;
    if (settingFooterCopyright) currentSettings.footerCopyright = settingFooterCopyright.value;
    
    if (settingSocialFb) currentSettings.socialFb = settingSocialFb.value;
    if (settingSocialTwitter) currentSettings.socialTwitter = settingSocialTwitter.value;
    if (settingSocialInsta) currentSettings.socialInsta = settingSocialInsta.value;
    if (settingSocialLinkedin) currentSettings.socialLinkedin = settingSocialLinkedin.value;
    
    // Save Geofencing & Automation Settings
    const geofenceCheck = document.getElementById('settingGeofenceEnabled');
    if (geofenceCheck) currentSettings.geofenceEnabled = geofenceCheck.checked;
    const latInput = document.getElementById('settingRestaurantLat');
    if (latInput) currentSettings.restaurantLat = parseFloat(latInput.value) || 23.8103;
    const lngInput = document.getElementById('settingRestaurantLng');
    if (lngInput) currentSettings.restaurantLng = parseFloat(lngInput.value) || 90.4125;
    const radInput = document.getElementById('settingGeofenceRadius');
    if (radInput) currentSettings.geofenceRadiusMeters = parseInt(radInput.value) || 100;

    const autoAcceptCheck = document.getElementById('settingAutoAcceptOrders');
    if (autoAcceptCheck) currentSettings.autoAcceptOrders = autoAcceptCheck.checked;
    const autoShiftCheck = document.getElementById('settingAutoShiftSteps');
    if (autoShiftCheck) currentSettings.autoShiftSteps = autoShiftCheck.checked;
    const shiftPrepInput = document.getElementById('settingAutoShiftPrep');
    if (shiftPrepInput) currentSettings.autoShiftPrepMinutes = parseInt(shiftPrepInput.value) || 2;
    const shiftReadyInput = document.getElementById('settingAutoShiftReady');
    if (shiftReadyInput) currentSettings.autoShiftReadyMinutes = parseInt(shiftReadyInput.value) || 10;
    const shiftDeliverInput = document.getElementById('settingAutoShiftDeliver');
    if (shiftDeliverInput) currentSettings.autoShiftDeliverMinutes = parseInt(shiftDeliverInput.value) || 5;

    await saveSettings(currentSettings);
    
    // Update local values with uploaded ones
    if (settingLogoUrl) settingLogoUrl.value = currentSettings.logoUrl || '';
    if (settingFaviconUrl) settingFaviconUrl.value = currentSettings.faviconUrl || '';
    if (settingWebsiteBg) settingWebsiteBg.value = currentSettings.websiteBgImage || '';
    if (settingHeroImage) settingHeroImage.value = currentSettings.heroImage || '';
    if (settingFooterImage) settingFooterImage.value = currentSettings.footerImage || '';
    
    // Reset file inputs
    document.querySelectorAll('input[type="file"]').forEach(i => i.value = '');

    submitBtn.textContent = "Saved!";
    submitBtn.style.backgroundColor = "green";
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.backgroundColor = "";
      submitBtn.disabled = false;
    }, 2000);
    
  } catch(error) {
    console.error("Error saving settings:", error);
    alert("Error saving settings. " + error.message);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Initialize
function initAdminDashboard() {
  loadAdminData();
}

if (window.isAdminVerified || (typeof getLocalSession === 'function' && getLocalSession())) {
  initAdminDashboard();
}

window.addEventListener('adminRoleVerified', () => {
  initAdminDashboard();
});

document.addEventListener('DOMContentLoaded', () => {
  if (window.isAdminVerified || (typeof getLocalSession === 'function' && getLocalSession())) {
    initAdminDashboard();
  }
});

// Category Rendering and Handlers
function renderCategories(categories) {
  const tbody = document.getElementById('categoriesTbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (categories.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:#6b7280; padding:20px;">No categories available. Add one!</td></tr>';
    return;
  }
  
  categories.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.name}</td>
      <td class="action-buttons">
        <button class="btn-icon btn-edit" onclick='editCategory(${JSON.stringify(c).replace(/'/g, "&#39;")})'><i data-lucide="edit-2"></i></button>
        <button class="btn-icon btn-delete" onclick="removeCategory('${c.id}')"><i data-lucide="trash-2"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  if (window.lucide) window.lucide.createIcons();
}

window.editCategory = function(c) {
  document.getElementById('formCategoryId').value = c.id;
  document.getElementById('formCategoryName').value = c.name;
  let subCats = c.subCategories || [];
  if (typeof subCats === 'string') subCats = subCats.split(',').map(s=>s.trim());
  document.getElementById('formCategorySubcategories').value = subCats.join(', ');
  document.getElementById('modalCategoryTitle').textContent = 'Edit Category';
  document.getElementById('categoryModal').classList.remove('hidden');
}

window.removeCategory = async function(id) {
  if (confirm('Are you sure you want to delete this category?')) {
    await deleteCategory(id);
    loadAdminData();
  }
}

document.getElementById('btnAddNewCategory').addEventListener('click', () => {
  document.getElementById('categoryForm').reset();
  document.getElementById('formCategoryId').value = '';
  document.getElementById('modalCategoryTitle').textContent = 'Add New Category';
  document.getElementById('categoryModal').classList.remove('hidden');
});

document.getElementById('btnCategoryModalClose').addEventListener('click', () => {
  document.getElementById('categoryModal').classList.add('hidden');
});
document.getElementById('btnCategoryModalCancel').addEventListener('click', () => {
  document.getElementById('categoryModal').classList.add('hidden');
});

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;
  try {
    const cat = {
      id: document.getElementById('formCategoryId').value,
      name: document.getElementById('formCategoryName').value,
      subCategories: document.getElementById('formCategorySubcategories').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
    };
    await saveCategory(cat);
    document.getElementById('categoryModal').classList.add('hidden');
    loadAdminData();
  } catch (error) {
    console.error("Error saving category:", error);
    alert("Error saving category. " + error.message);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
function renderLayoutBuilder(orderArray) {
  const container = document.getElementById('layoutBuilderContainer');
  if (!container) return;
  container.innerHTML = '';
  
  const labels = {
    'hero': 'Hero Section (Title & Image)',
    'banners': 'Promotional Banners',
    'offers': 'Special Offers',
    'menu': 'Food Menu (Categories & Items)'
  };
  
  orderArray.forEach((key, index) => {
    const itemEl = document.createElement('div');
    itemEl.style = 'display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--admin-card-bg); border:1px solid var(--admin-border); border-radius:8px;';
    
    const leftDiv = document.createElement('div');
    leftDiv.style = 'display:flex; align-items:center; gap:8px; font-weight:500;';
    const numBadge = document.createElement('span');
    numBadge.style = 'background:var(--admin-primary); color:white; width:24px; height:24px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:12px;';
    numBadge.textContent = index + 1;
    leftDiv.appendChild(numBadge);
    leftDiv.appendChild(document.createTextNode(labels[key] || key));
    
    const rightDiv = document.createElement('div');
    rightDiv.style = 'display:flex; gap:4px;';
    
    const upBtn = document.createElement('button');
    upBtn.innerHTML = '<i data-lucide="arrow-up" style="width:16px; height:16px;"></i>';
    upBtn.style = 'padding:4px 8px; cursor:pointer; background:transparent; border:1px solid var(--admin-border); border-radius:4px; color:var(--admin-text);';
    if (index === 0) upBtn.disabled = true;
    upBtn.onclick = (e) => {
      e.preventDefault();
      [orderArray[index - 1], orderArray[index]] = [orderArray[index], orderArray[index - 1]];
      document.getElementById('settingLayoutOrder').value = JSON.stringify(orderArray);
      renderLayoutBuilder(orderArray);
    };
    
    const downBtn = document.createElement('button');
    downBtn.innerHTML = '<i data-lucide="arrow-down" style="width:16px; height:16px;"></i>';
    downBtn.style = 'padding:4px 8px; cursor:pointer; background:transparent; border:1px solid var(--admin-border); border-radius:4px; color:var(--admin-text);';
    if (index === orderArray.length - 1) downBtn.disabled = true;
    downBtn.onclick = (e) => {
      e.preventDefault();
      [orderArray[index], orderArray[index + 1]] = [orderArray[index + 1], orderArray[index]];
      document.getElementById('settingLayoutOrder').value = JSON.stringify(orderArray);
      renderLayoutBuilder(orderArray);
    };
    
    if (index === 0) upBtn.style.opacity = '0.5';
    if (index === orderArray.length - 1) downBtn.style.opacity = '0.5';
    
    rightDiv.appendChild(upBtn);
    rightDiv.appendChild(downBtn);
    
    itemEl.appendChild(leftDiv);
    itemEl.appendChild(rightDiv);
    container.appendChild(itemEl);
  });
  
  lucide.createIcons();
}

// Seed Demo Content to Firebase Cloud Trigger
const handleSeedFirebase = async (e) => {
  if (e) e.preventDefault();
  const btn = e.currentTarget;
  if (!confirm('This will seed/sync all 15 demo items, categories, banners & offers directly to Firebase Firestore in real time. Continue?')) return;
  const origHTML = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Seeding to Firebase...';
  btn.disabled = true;
  try {
    const res = await seedDemoToFirebase(true);
    alert(`✅ Success! Synced ${res.count} demo items, categories, banners & offers to Firebase in real time.`);
    await loadAdminData();
  } catch(err) {
    console.error(err);
    alert('Error seeding demo data to Firebase: ' + err.message);
  } finally {
    btn.innerHTML = origHTML;
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const btnSeed = document.getElementById('btnSeedDemoFirebase');
  if (btnSeed) btnSeed.addEventListener('click', handleSeedFirebase);
  const btnQuickSeed = document.getElementById('btnQuickSeedFirebase');
  if (btnQuickSeed) btnQuickSeed.addEventListener('click', handleSeedFirebase);
});

// ==========================================
// --- TABLES & QR COMMAND CENTER UI LOGIC ---
// ==========================================

function renderTables(tables = [], orders = []) {
  const container = document.getElementById('tablesGrid');
  const statTotal = document.getElementById('statTablesTotal');
  const statOcc = document.getElementById('statTablesOccupied');
  const statVac = document.getElementById('statTablesVacant');
  const statGeo = document.getElementById('statGeofenceStatus');

  const occupiedCount = tables.filter(t => t.status === 'Occupied').length;
  const vacantCount = tables.length - occupiedCount;

  if (statTotal) statTotal.textContent = tables.length;
  if (statOcc) statOcc.textContent = occupiedCount;
  if (statVac) statVac.textContent = vacantCount;
  if (statGeo) {
    const isGeo = window.currentSettings && window.currentSettings.geofenceEnabled;
    statGeo.textContent = isGeo ? `Active (${window.currentSettings.geofenceRadiusMeters || 100}m)` : 'Disabled';
    statGeo.style.color = isGeo ? '#16a34a' : '#6b7280';
  }

  if (!container) return;
  container.innerHTML = '';

  // Filter tables by search query and status
  const searchQuery = (document.getElementById('tableSearchInput')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('tableStatusFilterSelect')?.value || 'all';

  let filteredTables = tables;
  if (searchQuery) {
    filteredTables = filteredTables.filter(t => 
      (t.tableNo || '').toLowerCase().includes(searchQuery) ||
      (t.floor || '').toLowerCase().includes(searchQuery)
    );
  }
  if (statusFilter !== 'all') {
    filteredTables = filteredTables.filter(t => (t.status || '').toLowerCase() === statusFilter.toLowerCase());
  }

  if (filteredTables.length === 0) {
    container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:32px; background:var(--admin-surface); border:1px solid var(--admin-border); border-radius:12px; color:var(--admin-text-muted);">No matching tables found. Adjust search/filter or click "Add New Table".</div>';
    return;
  }

  filteredTables.forEach(table => {
    const isOccupied = table.status === 'Occupied';
    const numOnly = (table.tableNo || '').replace(/^Table\s*/i, '').trim();
    const tableUrl = `/index.html?table=${encodeURIComponent(numOnly || table.tableNo)}`;
    const card = document.createElement('div');
    card.style = `
      background: var(--admin-surface);
      border: 1px solid ${isOccupied ? '#fca5a5' : 'var(--admin-border)'};
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
      position: relative;
    `;
    if (isOccupied) {
      card.style.background = '#fffaf0';
    }

    // Find linked order if any
    let linkedOrder = null;
    if (table.currentOrderId) {
      linkedOrder = orders.find(o => String(o.id) === String(table.currentOrderId));
    }
    if (!linkedOrder && table.activeSessionId) {
      linkedOrder = orders.find(o => o.sessionId === table.activeSessionId || o.tableNo === table.tableNo);
    }

    let orderBadge = '';
    if (linkedOrder) {
      let statusColor = '#3b82f6';
      if (linkedOrder.status === 'Pending') statusColor = '#eab308';
      else if (linkedOrder.status === 'Cooking' || linkedOrder.status === 'Accepted') statusColor = '#f97316';
      else if (linkedOrder.status === 'Ready') statusColor = '#10b981';
      else if (linkedOrder.status === 'Served' || linkedOrder.status === 'Completed') statusColor = '#6b7280';

      orderBadge = `
        <div style="margin-top:10px; padding:10px; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; font-size:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span>Order: <strong>#${linkedOrder.id}</strong></span>
            <span style="font-weight:700; color:${statusColor}; text-transform:uppercase;">${linkedOrder.status}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--admin-text-muted);">
            <span>${(linkedOrder.items || []).length} items</span>
            <span style="font-weight:700; color:var(--admin-text);">৳ ${(linkedOrder.total || 0).toLocaleString()}</span>
          </div>
        </div>
      `;
    }

    let elapsedText = '';
    if (isOccupied && table.occupiedAt) {
      const mins = Math.max(1, Math.round((Date.now() - new Date(table.occupiedAt).getTime()) / 60000));
      elapsedText = `<span style="font-size:11px; color:#b45309; display:inline-flex; align-items:center; gap:4px;"><i data-lucide="clock" style="width:12px; height:12px;"></i> Seated ~${mins}m ago</span>`;
    }

    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="margin:0; font-size:18px; font-weight:700; color:var(--admin-sidebar);">${table.tableNo}</h4>
            <span style="font-size:12px; color:var(--admin-text-muted);">${table.floor || 'Dining Area'} • ${table.capacity || 4} Seats</span>
          </div>
          <span style="
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${isOccupied ? '#fee2e2' : '#dcfce7'};
            color: ${isOccupied ? '#b91c1c' : '#15803d'};
          ">
            ${isOccupied ? '● Occupied' : '○ Vacant'}
          </span>
        </div>

        ${isOccupied ? `
          <div style="margin-top:10px; font-size:11px; color:#475569;">
            <div>Session ID: <code style="background:#f1f5f9; padding:2px 4px; border-radius:4px; font-weight:600;">${table.activeSessionId ? table.activeSessionId.substring(0, 16) + '...' : 'Active'}</code></div>
            <div style="margin-top:2px;">${elapsedText}</div>
          </div>
          ${orderBadge}
        ` : `
          <div style="margin-top:14px; padding:12px; background:rgba(0,0,0,0.02); border-radius:8px; text-align:center; font-size:12px; color:var(--admin-text-muted);">
            Ready for guests. Customer scans QR code to automatically open new session.
          </div>
        `}
      </div>

      <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--admin-border); display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div style="display:flex; gap:6px;">
          <a href="${tableUrl}" target="_blank" class="btn btn-secondary btn-sm" title="Open Customer Menu for this Table in New Tab" style="padding:6px 9px; font-size:12px; display:inline-flex; align-items:center; gap:4px; text-decoration:none; color:inherit;">
            <i data-lucide="external-link" style="width:13px; height:13px;"></i> Open
          </a>
          <button class="btn btn-secondary btn-sm" onclick='openQrModal(${JSON.stringify(table).replace(/'/g, "&apos;")})' title="View & Print QR Code" style="padding:6px 9px; font-size:12px; display:inline-flex; align-items:center; gap:4px;">
            <i data-lucide="qr-code" style="width:13px; height:13px;"></i> QR
          </button>
          <button class="btn btn-secondary btn-sm" onclick='openTableModal(${JSON.stringify(table).replace(/'/g, "&apos;")})' title="Edit Table" style="padding:6px 8px;">
            <i data-lucide="edit-2" style="width:13px; height:13px;"></i>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="removeTable('${table.id}')" title="Delete Table" style="padding:6px 8px; color:#dc2626;">
            <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
          </button>
        </div>

        ${isOccupied ? `
          <button class="btn btn-primary btn-sm" onclick="handleCloseCustomer('${table.tableNo}')" style="background:#dc2626; border-color:#dc2626; color:#ffffff; font-size:11px; font-weight:700; padding:6px 12px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;" title="Close active session and free this table for new guests">
            <i data-lucide="user-x" style="width:14px; height:14px;"></i> Close Customer
          </button>
        ` : `
          <button class="btn btn-secondary btn-sm" onclick="handleManualOccupy('${table.tableNo}')" style="font-size:11px; padding:6px 10px;" title="Occupy manually without QR">
            Occupy Table
          </button>
        `}
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// Table Add/Edit Modal
const tableModal = document.getElementById('tableModal');
const tableForm = document.getElementById('tableForm');
const modalTableTitle = document.getElementById('modalTableTitle');

window.openTableModal = function(table = null) {
  tableForm.reset();
  if (table) {
    modalTableTitle.textContent = "Edit Table";
    document.getElementById('formTableId').value = table.id;
    document.getElementById('formTableNo').value = table.tableNo;
    document.getElementById('formTableCapacity').value = table.capacity || 4;
    document.getElementById('formTableFloor').value = table.floor || 'Main Dining';
  } else {
    modalTableTitle.textContent = "Add New Table";
    document.getElementById('formTableId').value = '';
    const nextNum = (window.allTables ? window.allTables.length + 1 : 1);
    document.getElementById('formTableNo').value = `Table ${nextNum}`;
  }
  tableModal.classList.remove('hidden');
};

window.closeTableModal = function() {
  tableModal.classList.add('hidden');
  tableForm.reset();
};

document.getElementById('btnAddNewTable')?.addEventListener('click', () => openTableModal());
document.getElementById('btnTableModalClose')?.addEventListener('click', closeTableModal);
document.getElementById('btnTableModalCancel')?.addEventListener('click', closeTableModal);
document.getElementById('btnRefreshTables')?.addEventListener('click', async () => {
  const tables = await getTables();
  window.allTables = tables;
  renderTables(tables, window.allOrders || []);
});

if (tableForm) {
  tableForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('formTableId').value;
    const tableNo = document.getElementById('formTableNo').value.trim();
    const capacity = parseInt(document.getElementById('formTableCapacity').value) || 4;
    const floor = document.getElementById('formTableFloor').value.trim() || 'Main Dining';

    const numOnly = tableNo.replace(/^Table\s*/i, '').trim();
    const tableObj = {
      id: id || ('tbl_' + Date.now()),
      tableNo,
      capacity,
      floor,
      status: 'Vacant',
      activeSessionId: null,
      occupiedAt: null,
      currentOrderId: null,
      qrUrl: `/index.html?table=${encodeURIComponent(numOnly || tableNo)}`
    };

    if (id && window.allTables) {
      const existing = window.allTables.find(t => String(t.id) === String(id));
      if (existing) {
        tableObj.status = existing.status;
        tableObj.activeSessionId = existing.activeSessionId;
        tableObj.occupiedAt = existing.occupiedAt;
        tableObj.currentOrderId = existing.currentOrderId;
      }
    }

    await saveTable(tableObj);
    closeTableModal();
    const tables = await getTables();
    window.allTables = tables;
    renderTables(tables, window.allOrders || []);
  });
}

window.removeTable = async function(id) {
  if (confirm("Are you sure you want to remove this table?")) {
    await deleteTable(id);
    const tables = await getTables();
    window.allTables = tables;
    renderTables(tables, window.allOrders || []);
  }
};

// "Close Customer / Release Table" feature
window.handleCloseCustomer = async function(tableNo) {
  if (!confirm(`Are you sure you want to CLOSE customer session for ${tableNo}?\n\nThis will terminate their session, complete any active orders, and release the table for the next guest.`)) {
    return;
  }
  try {
    await closeTableSession(tableNo, 'Admin Manager Checkout');
    alert(`✅ Session closed successfully for ${tableNo}! Table is now Vacant.`);
    const tables = await getTables();
    window.allTables = tables;
    const orders = await getOrders();
    window.allOrders = orders;
    renderTables(tables, orders);
  } catch(e) {
    console.error("Error closing customer session:", e);
    alert("Error closing session: " + e.message);
  }
};

window.handleManualOccupy = async function(tableNo) {
  try {
    await getOrInitTableSession(tableNo);
    const tables = await getTables();
    window.allTables = tables;
    renderTables(tables, window.allOrders || []);
  } catch(e) {
    console.error(e);
  }
};

// QR Code Modal Logic
const qrModal = document.getElementById('qrModal');
window.openQrModal = function(table) {
  if (!table || !qrModal) return;
  const numOnly = (table.tableNo || '').replace(/^Table\s*/i, '').trim();
  const origin = window.location.origin;
  const targetUrl = `${origin}/index.html?table=${encodeURIComponent(numOnly || table.tableNo)}`;

  document.getElementById('modalQrTitle').textContent = `QR Code • ${table.tableNo}`;
  document.getElementById('qrTableHeading').textContent = `${table.tableNo} - ${table.floor || 'Dining'}`;
  document.getElementById('qrLinkText').textContent = targetUrl;

  const qrImg = document.getElementById('qrImageElement');
  // High quality vector-like QR generation via local offline microservice with cloud fallback
  const localQrUrl = `/api/v1/qr?text=${encodeURIComponent(targetUrl)}`;
  const cloudQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&format=svg&data=${encodeURIComponent(targetUrl)}`;
  
  qrImg.onerror = () => {
    if (qrImg.src !== cloudQrUrl) {
      console.warn("Switching to cloud QR generator fallback:", cloudQrUrl);
      qrImg.src = cloudQrUrl;
    }
  };
  qrImg.src = localQrUrl;

  const openLink = document.getElementById('btnOpenCustomerWebpage');
  if (openLink) openLink.href = targetUrl;

  const copyBtn = document.getElementById('btnCopyQrLink');
  if (copyBtn) {
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(targetUrl);
        alert(`📋 Copied Table Link to Clipboard:\n${targetUrl}`);
      } catch(e) {
        prompt("Copy this Table URL:", targetUrl);
      }
    };
  }

  qrModal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};

window.closeQrModal = function() {
  if (qrModal) qrModal.classList.add('hidden');
};

document.getElementById('btnQrModalClose')?.addEventListener('click', closeQrModal);
document.getElementById('btnQrModalCloseFooter')?.addEventListener('click', closeQrModal);

// Print Table QR Stand
document.getElementById('btnPrintQrCode')?.addEventListener('click', () => {
  const printArea = document.getElementById('printableQrArea');
  if (!printArea) return;
  const printWindow = window.open('', '_blank', 'width=600,height=700');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Table QR Stand</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff; }
          .qr-stand { text-align: center; border: 3px solid #244638; border-radius: 20px; padding: 40px; max-width: 360px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          h1 { margin: 0 0 8px 0; color: #244638; font-size: 32px; font-weight: 800; }
          p { margin: 0 0 20px 0; color: #64748b; font-size: 14px; font-weight: 500; }
          img { width: 260px; height: 260px; border-radius: 12px; }
          .badge { margin-top: 20px; font-weight: 800; font-size: 12px; color: #e99545; letter-spacing: 1px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="qr-stand">
          ${printArea.innerHTML}
        </div>
        <script>
          setTimeout(() => { window.print(); window.close(); }, 500);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
});

// Auto-Detect Current GPS Coordinates Button
document.getElementById('btnDetectLocation')?.addEventListener('click', () => {
  const btn = document.getElementById('btnDetectLocation');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Detecting...';

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    btn.innerHTML = originalText;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById('settingRestaurantLat').value = position.coords.latitude.toFixed(6);
      document.getElementById('settingRestaurantLng').value = position.coords.longitude.toFixed(6);
      alert(`📍 GPS Coordinates Detected!\nLatitude: ${position.coords.latitude.toFixed(6)}\nLongitude: ${position.coords.longitude.toFixed(6)}`);
      btn.innerHTML = originalText;
      if (window.lucide) lucide.createIcons();
    },
    (error) => {
      alert("Unable to retrieve your location: " + error.message);
      btn.innerHTML = originalText;
      if (window.lucide) lucide.createIcons();
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// Table Search & Filter Toolbar Event Listeners
document.getElementById('tableSearchInput')?.addEventListener('input', () => {
  renderTables(window.allTables || [], window.allOrders || []);
});
document.getElementById('tableStatusFilterSelect')?.addEventListener('change', () => {
  renderTables(window.allTables || [], window.allOrders || []);
});

// Batch Print All Table QR Stands (Offline Ready)
document.getElementById('btnBatchPrintQrStands')?.addEventListener('click', async () => {
  const tables = window.allTables || await getTables();
  if (!tables || tables.length === 0) {
    alert("No tables available to print.");
    return;
  }
  const origin = window.location.origin;
  const printWindow = window.open('', '_blank', 'width=900,height=900');
  
  const standsHtml = tables.map(table => {
    const numOnly = (table.tableNo || '').replace(/^Table\s*/i, '').trim();
    const targetUrl = `${origin}/index.html?table=${encodeURIComponent(numOnly || table.tableNo)}`;
    const qrUrl = `/api/v1/qr?text=${encodeURIComponent(targetUrl)}`;
    return `
      <div class="qr-stand-card">
        <div class="brand">SPICE GARDEN RESTAURANT</div>
        <h2>${table.tableNo}</h2>
        <div class="floor-tag">${table.floor || 'Dining Room'} • ${table.capacity || 4} Seats</div>
        <div class="qr-box">
          <img src="${qrUrl}" alt="${table.tableNo} QR Code" onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}'" />
        </div>
        <div class="instructions">SCAN TO VIEW MENU & ORDER</div>
        <div class="footer-note">No App or Login Required • Instant Mobile Ordering</div>
        <div class="url-text">${targetUrl}</div>
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Batch Print All Table QR Stands (${tables.length} Tables)</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #fff; margin: 0; padding: 20px; color: #0f172a; }
          .print-header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
          .print-header h1 { margin: 0; font-size: 24px; color: #244638; }
          .print-header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
          .stands-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; page-break-inside: auto; }
          .qr-stand-card { border: 2.5px solid #244638; border-radius: 18px; padding: 24px 20px; text-align: center; background: #faf8f5; box-shadow: 0 4px 12px rgba(0,0,0,0.04); page-break-inside: avoid; }
          .brand { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #e99545; text-transform: uppercase; margin-bottom: 6px; }
          h2 { margin: 0 0 4px; font-size: 26px; font-weight: 800; color: #244638; }
          .floor-tag { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 16px; }
          .qr-box { background: #fff; padding: 12px; border-radius: 12px; display: inline-block; border: 1px solid #e2e8f0; }
          .qr-box img { width: 190px; height: 190px; display: block; }
          .instructions { margin-top: 14px; font-size: 13px; font-weight: 800; color: #244638; letter-spacing: 0.5px; }
          .footer-note { font-size: 11px; color: #64748b; margin-top: 4px; }
          .url-text { font-size: 10px; color: #94a3b8; word-break: break-all; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Spice Garden — Official Dining Table QR Stands</h1>
          <p>Ready to cut and place on dining tables. Generated locally for 100% offline reliability.</p>
        </div>
        <div class="stands-grid">
          ${standsHtml}
        </div>
        <script>
          setTimeout(() => { window.print(); }, 600);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
});

// ==========================================
// --- ENTERPRISE ADMIN WEBSOCKET EVENT BUS ---
// ==========================================
window.initAdminWebSocket = function() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  let ws = null;
  let heartbeatTimer = null;

  function playOrderChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  function connect() {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Admin WS] Connected to Evorise Real-Time Event Bus');
        heartbeatTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          if (type === 'ORDER_CREATED') {
            console.log('[Admin WS] New order received in real-time:', data.id);
            playOrderChime();
            const current = window.allOrders || [];
            const exists = current.some(o => o.id === data.id);
            if (!exists) {
              window.allOrders = [data, ...current];
              renderOrdersTable(window.allOrders);
              updateDashboardStats(window.allItems || [], window.allOrders);
            }
          } else if (type === 'ORDER_STATUS_CHANGED' || type === 'ORDER_CANCELLED') {
            console.log('[Admin WS] Order status updated in real-time:', data.id, data.status);
            const current = window.allOrders || [];
            let updated = false;
            const nextList = current.map(o => {
              if (o.id && data.id && o.id.toLowerCase() === data.id.toLowerCase()) {
                updated = true;
                return { ...o, ...data };
              }
              return o;
            });
            if (updated) {
              window.allOrders = nextList;
              renderOrdersTable(window.allOrders);
              updateDashboardStats(window.allItems || [], window.allOrders);
            }
          } else if (type === 'SETTINGS_UPDATED') {
            console.log('[Admin WS] Settings updated in real-time');
          }
        } catch (err) {}
      };

      ws.onclose = () => {
        clearInterval(heartbeatTimer);
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        try { ws.close(); } catch (e) {}
      };
    } catch (e) {
      setTimeout(connect, 5000);
    }
  }

  connect();
};

window.initAdminWebSocket();

// ==========================================
// DATABASE & BACKUP TELEMETRY ENGINE
// ==========================================
async function renderDatabaseView() {
  const dbEngineMode = document.getElementById('dbEngineMode');
  const dbStatusBadge = document.getElementById('dbStatusBadge');
  const dbSizeVal = document.getElementById('dbSizeVal');
  const dbWalSizeVal = document.getElementById('dbWalSizeVal');
  const dbEntitiesCount = document.getElementById('dbEntitiesCount');
  const dbEntitiesBreakdown = document.getElementById('dbEntitiesBreakdown');
  const dbBackupsCount = document.getElementById('dbBackupsCount');
  const dbLatestBackupTime = document.getElementById('dbLatestBackupTime');
  const dbBackupsTbody = document.getElementById('dbBackupsTbody');

  try {
    const [statsRes, backupsRes] = await Promise.all([
      typeof getDatabaseStats === 'function' ? getDatabaseStats() : Promise.resolve({ success: false }),
      typeof listDatabaseBackups === 'function' ? listDatabaseBackups() : Promise.resolve({ success: false, backups: [] })
    ]);

    if (statsRes && (statsRes.success || statsRes.status === 'ONLINE')) {
      if (dbEngineMode) dbEngineMode.textContent = `SQLite 3 (${(statsRes.mode || 'WAL').split(' ')[0]})`;
      if (dbStatusBadge) {
        dbStatusBadge.innerHTML = '● ACID Compliant & Synchronized';
        dbStatusBadge.style.color = '#10b981';
      }
      const dbKb = statsRes.dbSizeKb !== undefined ? statsRes.dbSizeKb : (statsRes.databaseKb || 0);
      const walKb = statsRes.walSizeKb !== undefined ? statsRes.walSizeKb : (statsRes.walKb || 0);
      if (dbSizeVal) dbSizeVal.textContent = `${dbKb} KB`;
      if (dbWalSizeVal) dbWalSizeVal.textContent = `WAL Buffer: ${walKb} KB`;
      
      const counts = statsRes.counts || {};
      const itemCount = counts.items !== undefined ? counts.items : (counts.menuItems || 0);
      const catCount = counts.categories || 0;
      const orderCount = counts.orders || 0;
      const tblCount = counts.tables || 0;
      const totalEntities = itemCount + catCount + orderCount + tblCount;
      if (dbEntitiesCount) dbEntitiesCount.textContent = `${totalEntities} records`;
      if (dbEntitiesBreakdown) {
        dbEntitiesBreakdown.textContent = `${itemCount} Items, ${catCount} Cats, ${orderCount} Orders, ${tblCount} Tables`;
      }
      if (dbLatestBackupTime) {
        const latestTime = statsRes.latestBackup?.createdAt || statsRes.latestBackup;
        dbLatestBackupTime.textContent = latestTime 
          ? `Latest: ${new Date(latestTime).toLocaleTimeString()}`
          : 'Latest: None';
      }
    }

    const backups = Array.isArray(backupsRes) ? backupsRes : ((backupsRes && backupsRes.backups) || []);
    if (dbBackupsCount) dbBackupsCount.textContent = `${backups.length} snapshot${backups.length === 1 ? '' : 's'}`;

    if (dbBackupsTbody) {
      if (backups.length === 0) {
        dbBackupsTbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding:32px; color:var(--admin-text-muted);">
              <i data-lucide="shield-alert" style="width:36px; height:36px; display:block; margin:0 auto 8px; opacity:0.4;"></i>
              No backup snapshots found yet. Click <strong>"Create Backup Snapshot"</strong> above to preserve current state.
            </td>
          </tr>
        `;
      } else {
        dbBackupsTbody.innerHTML = backups.map(b => `
          <tr>
            <td style="font-family:monospace; font-size:13px; font-weight:600; color:var(--admin-text);">
              <i data-lucide="file-archive" style="width:14px; height:14px; vertical-align:middle; margin-right:6px; color:#2563eb;"></i>
              ${b.name}
            </td>
            <td>
              <span class="badge" style="background:${b.type === 'sqlite' ? '#dbeafe' : '#fef3c7'}; color:${b.type === 'sqlite' ? '#1e40af' : '#92400e'}; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:600;">
                ${b.type === 'sqlite' ? 'SQLite Binary (.sqlite)' : 'JSON Export (.json)'}
              </span>
            </td>
            <td style="font-size:13px; color:var(--admin-text); font-weight:500;">
              ${b.sizeKb || Math.round((b.sizeBytes || 0)/1024)} KB
            </td>
            <td style="font-size:12px; color:var(--admin-text-muted);">
              ${b.createdAt ? new Date(b.createdAt).toLocaleString() : 'N/A'}
            </td>
            <td style="text-align:right;">
              <div style="display:inline-flex; gap:8px; align-items:center;">
                <a href="/api/v1/database/download/${encodeURIComponent(b.name)}" download="${b.name}" class="btn btn-secondary" style="padding:4px 10px; font-size:12px; display:inline-flex; align-items:center; gap:4px; text-decoration:none;">
                  <i data-lucide="download" style="width:12px; height:12px;"></i> Download
                </a>
                <button type="button" class="btn btn-outline-danger" onclick="window.restoreSnapshotHandler('${b.name}')" style="padding:4px 10px; font-size:12px; display:inline-flex; align-items:center; gap:4px; border:1px solid #ef4444; color:#ef4444; background:transparent; border-radius:6px; cursor:pointer;">
                  <i data-lucide="rotate-ccw" style="width:12px; height:12px;"></i> Restore
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  } catch (err) {
    console.error('[Admin] Error rendering database view:', err);
  }
}

// Global Restore Handler
window.restoreSnapshotHandler = async function(fileName) {
  if (!confirm(`CAUTION: Are you sure you want to restore snapshot "${fileName}"?\n\nThis will rollback all current tables, menu items, categories, and orders to this point in time.`)) {
    return;
  }

  try {
    const res = await (typeof restoreDatabase === 'function' ? restoreDatabase(fileName) : Promise.reject(new Error('Restore function not available')));
    if (res && res.success) {
      alert(`Database successfully restored from ${fileName}! Reloading admin data...`);
      await loadAdminData();
      await renderDatabaseView();
    } else {
      alert(`Restore failed: ${res?.error || 'Unknown error'}`);
    }
  } catch (e) {
    console.error('Error during restore:', e);
    alert(`Restore failed: ${e.message}`);
  }
};

// Wire up Buttons for Database View
document.addEventListener('DOMContentLoaded', () => {
  const btnRefreshDbStats = document.getElementById('btnRefreshDbStats');
  if (btnRefreshDbStats) {
    btnRefreshDbStats.addEventListener('click', async () => {
      const orig = btnRefreshDbStats.innerHTML;
      btnRefreshDbStats.disabled = true;
      btnRefreshDbStats.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Refreshing...';
      await renderDatabaseView();
      btnRefreshDbStats.disabled = false;
      btnRefreshDbStats.innerHTML = orig;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  const btnTriggerDbBackup = document.getElementById('btnTriggerDbBackup');
  if (btnTriggerDbBackup) {
    btnTriggerDbBackup.addEventListener('click', async () => {
      const orig = btnTriggerDbBackup.innerHTML;
      btnTriggerDbBackup.disabled = true;
      btnTriggerDbBackup.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Creating Backup...';
      try {
        const res = await (typeof createDatabaseBackup === 'function' ? createDatabaseBackup() : Promise.reject(new Error('Backup function not available')));
        if (res && res.success) {
          alert(`Point-in-time snapshot created successfully: ${res.fileName}`);
          await renderDatabaseView();
        } else {
          alert(`Failed to create backup: ${res?.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Backup error:', err);
        alert(`Backup error: ${err.message}`);
      } finally {
        btnTriggerDbBackup.disabled = false;
        btnTriggerDbBackup.innerHTML = orig;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
});



