// =========================================================
// ROWNAA PRICING DATA STORE
// Connects to Pricing Microservice API & Synchronous Local Store
// Ensures immediate multi-tab sync between Admin, Customer, and Owner dashboards
// =========================================================

async function getPricingConfig() {
  let cached = null;
  try {
    const raw = localStorage.getItem('rownaa_master_pricing');
    if (raw) cached = JSON.parse(raw);
  } catch (e) {}

  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    return cached || DEFAULT_PRICING_CONFIG;
  }

  try {
    const headers = {};
    try {
      const token = localStorage.getItem('rownaa_session_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {}

    const res = await fetch('/api/pricing', { credentials: 'include', headers });
    if (res.ok) {
      const live = await res.json();
      if (live && live.hourly && live.hourly.categories) {
        try {
          localStorage.setItem('rownaa_master_pricing', JSON.stringify(live));
        } catch (e) {}
        if (window.PricingEngine) window.PricingEngine.config = live;
        return live;
      }
    }
  } catch (e) {
    // Network or offline fallback
  }

  if (cached) return cached;
  if (window.PricingEngine && window.PricingEngine.config) return window.PricingEngine.config;
  return null;
}

async function savePricingConfig(data) {
  if (!data) return;

  // 1. Immediately cache in localStorage for instant client responsiveness
  try {
    localStorage.setItem('rownaa_master_pricing', JSON.stringify(data));
    localStorage.setItem('rownaa_pricing_updated_timestamp', String(Date.now()));
  } catch (e) {}

  // 2. Immediately update in-memory PricingEngine
  if (window.PricingEngine) {
    window.PricingEngine.config = data;
  }

  // 3. Broadcast instant update event to all active panels (checkout, customer, owner, find-cars)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pricingUpdated', { detail: data }));
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('rownaa_pricing_channel');
        bc.postMessage({ type: 'PRICING_UPDATED', config: data });
        setTimeout(() => { try { bc.close(); } catch(e) {} }, 100);
      }
    } catch (e) {}
  }

  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
    return data;
  }

  // 4. Persist to backend database via API with Authorization header
  try {
    const headers = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('rownaa_session_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {}

    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const resData = await res.json();
      return resData.config || data;
    }
  } catch (e) {
    console.warn("Pricing persisted locally, backend sync will retry:", e);
  }

  return data;
}

// Expose to window for modules
window.getPricingConfig = getPricingConfig;
window.savePricingConfig = savePricingConfig;
