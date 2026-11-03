// =========================================================
// ROWNAA PRICING DATA STORE
// Connects to Pricing Microservice API
// =========================================================

async function getPricingConfig() {
  try {
    const res = await fetch('/api/pricing', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch pricing');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed to fetch pricing data.", e);
    return null;
  }
}

async function savePricingConfig(data) {
  try {
    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save pricing');
    return await res.json();
  } catch (e) {
    console.error("Storage failed: ", e);
    alert("Failed to save pricing data to the server.");
  }
}

// Expose to window for modules
window.getPricingConfig = getPricingConfig;
window.savePricingConfig = savePricingConfig;
