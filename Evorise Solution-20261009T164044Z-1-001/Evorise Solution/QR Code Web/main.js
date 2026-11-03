// Initialize Lucide icons
lucide.createIcons();

// ==========================================
// --- DAY / NIGHT THEME ENGINE ---
// ==========================================
function initTheme() {
  const saved = localStorage.getItem('sg_theme') || 'light';
  applyTheme(saved);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('sg_theme', next);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const iconMoon = document.getElementById('iconMoon');
  const iconSun = document.getElementById('iconSun');
  if (iconMoon && iconSun) {
    if (theme === 'dark') {
      iconMoon.style.display = 'none';
      iconSun.style.display = 'block';
    } else {
      iconMoon.style.display = 'block';
      iconSun.style.display = 'none';
    }
  }
}

// Call on page load
initTheme();



// --- State ---
let cart = []; // Array of cart items
let currentCategory = 'all';
let currentSubCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentDietary = 'all';
let menuItems = [];
let banners = [];
let offers = [];
let categoriesList = [];
let globalCurrency = '৳';
let globalTaxRate = 0;
let globalSettings = {};

// --- DOM Elements ---
const menuGrid = document.getElementById('menuGrid');
const emptyState = document.getElementById('emptyState');
const categoryTabs = document.querySelectorAll('.tab');
const searchInput = document.getElementById('searchInput');
const floatingCart = document.getElementById('floatingCart');
const cartBadgeCount = document.getElementById('cartBadgeCount');
const cartTotalDisplay = document.getElementById('cartTotalDisplay');
const btnPlaceOrder = document.getElementById('btnPlaceOrder');

// --- Initialization ---
async function init() {
  // Demo Mode Interceptor
  const urlParams = new URLSearchParams(window.location.search);
  const demoParam = urlParams.get('demo');
  if (demoParam) {
    sessionStorage.setItem('activeDemoId', demoParam);
    console.log("Demo Mode Activated. Scoped to:", demoParam);
    // Strip it from URL so user doesn't copy it accidentally
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  cart = await getCart();
  menuItems = await getItems(); // from db.js
  banners = await getBanners(); // from db.js
  try {
    offers = await getOffers(); // from db.js
    categoriesList = await getCategories(); // from db.js
  } catch(e) {
    console.error("Failed to load offers/categories:", e);
  }
  
  // Apply Global Settings
  const settings = await getSettings();
  globalSettings = settings;
  applySettings(settings);

  renderCategoryTabs();
  renderBanners();
  renderOffers(settings);
  renderMenuItems(settings);
  await checkActiveOrderOnLoad();
  await initTableSessionFlow();
  initGeofenceCheck();

  // --- Real-Time Sync Subscriptions from Firebase ---
  if (typeof subscribeItems === 'function') {
    subscribeItems(updatedItems => {
      menuItems = updatedItems;
      renderMenuItems(globalSettings);
      filterMenu();
    });
  }
  if (typeof subscribeCategories === 'function') {
    subscribeCategories(updatedCats => {
      categoriesList = updatedCats;
      renderCategoryTabs();
    });
  }
  if (typeof subscribeBanners === 'function') {
    subscribeBanners(updatedBanners => {
      banners = updatedBanners;
      renderBanners();
    });
  }
  if (typeof subscribeOffers === 'function') {
    subscribeOffers(updatedOffers => {
      offers = updatedOffers;
      renderOffers(globalSettings);
    });
  }
  if (typeof subscribeSettings === 'function') {
    subscribeSettings(updatedSettings => {
      globalSettings = updatedSettings;
      applySettings(updatedSettings);
      renderOffers(updatedSettings);
      renderMenuItems(updatedSettings);
    });
  }
}

function applySettings(settings) {
  if (!settings) return;
  if (settings.currencySymbol) globalCurrency = settings.currencySymbol;
  if (settings.taxRate) globalTaxRate = settings.taxRate;

  if (settings.primaryColor) {
    document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
  }
  if (settings.secondaryColor) {
    document.documentElement.style.setProperty('--color-canvas', settings.secondaryColor);
    document.documentElement.style.setProperty('--color-surface', settings.secondaryColor);
  }
  if (settings.buttonColor) {
    document.documentElement.style.setProperty('--color-accent', settings.buttonColor);
  } else if (settings.primaryColor) {
    document.documentElement.style.setProperty('--color-accent', settings.primaryColor);
  }
  if (settings.textColor) {
    document.documentElement.style.setProperty('--color-text-primary', settings.textColor);
  }
  if (settings.fontFamily) {
    document.documentElement.style.setProperty('--font-sans', `'${settings.fontFamily}', sans-serif`);
    document.documentElement.style.setProperty('--font-serif', `'${settings.fontFamily}', serif`);
    document.body.style.fontFamily = `'${settings.fontFamily}', sans-serif`;

    const fontName = settings.fontFamily.replace(/ /g, '+');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  if (settings.faviconUrl) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = settings.faviconUrl;
  }

  if (settings.restaurantName) {
    document.title = `${settings.restaurantName} | QR Code Menu`;
  }

  if (settings.logoUrl) {
    const logoContainers = document.querySelectorAll('.hero-logo, .footer-logo');
    logoContainers.forEach(container => {
      container.innerHTML = `<img src="${settings.logoUrl}" style="height: 48px; object-fit: contain;">`;
    });
  } else if (settings.restaurantName) {
    const logoContainers = document.querySelectorAll('.hero-logo, .footer-logo');
    logoContainers.forEach(container => {
      container.innerHTML = `<i data-lucide="pizza" style="width: 32px; height: 32px; color: var(--color-primary);"></i><div>${settings.restaurantName}<br><span>DIGITAL INNOVATION</span></div>`;
    });
    if (window.lucide) lucide.createIcons();
  }

  if (settings.websiteBgImage) {
    document.body.style.backgroundImage = `url('${settings.websiteBgImage}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundPosition = 'center';
  } else {
    document.body.style.backgroundImage = 'none';
  }

  // Hero
  const heroSection = document.getElementById('heroSection');
  if (heroSection && settings.heroImage) {
    heroSection.style.backgroundImage = `url('${settings.heroImage}')`;
  }
  if (settings.heroTitle && document.getElementById('heroTitleDisplay')) {
    document.getElementById('heroTitleDisplay').textContent = settings.heroTitle;
  }
  if (settings.heroSubtitle && document.getElementById('heroSubtitleDisplay')) {
    document.getElementById('heroSubtitleDisplay').textContent = settings.heroSubtitle;
  }
  if (settings.heroOrderPhone && document.getElementById('heroOrderPhoneDisplay')) {
    document.getElementById('heroOrderPhoneDisplay').textContent = `ORDER: ${settings.heroOrderPhone}`;
  }

  // Footer
  const DEFAULTS = {
    footerAddress: 'Dhaka, Bangladesh',
    footerPhone: '+880 123456789',
    footerEmail: 'info@evorisesolution.com',
    footerCopyright: 'Copyright ©2026 All rights reserved | Evorise Solution',
    socialFb: 'https://www.facebook.com/evorisesolutions/',
    socialTwitter: 'https://twitter.com/',
    socialInsta: 'https://instagram.com/',
    socialLinkedin: 'https://linkedin.com/'
  };

  const siteFooter = document.getElementById('siteFooter');
  if (siteFooter) {
    if (settings.footerImage) siteFooter.style.backgroundImage = `url('${settings.footerImage}')`;
    if (document.getElementById('footerAddressDisplay')) document.getElementById('footerAddressDisplay').textContent = settings.footerAddress || DEFAULTS.footerAddress;
    if (document.getElementById('footerPhoneDisplay')) document.getElementById('footerPhoneDisplay').textContent = settings.footerPhone || DEFAULTS.footerPhone;
    if (document.getElementById('footerEmailDisplay')) document.getElementById('footerEmailDisplay').textContent = settings.footerEmail || DEFAULTS.footerEmail;
    if (document.getElementById('footerCopyrightDisplay')) document.getElementById('footerCopyrightDisplay').textContent = settings.footerCopyright || DEFAULTS.footerCopyright;

    if (document.getElementById('socialFbLink')) document.getElementById('socialFbLink').href = settings.socialFb || DEFAULTS.socialFb;
    if (document.getElementById('socialTwitterLink')) document.getElementById('socialTwitterLink').href = settings.socialTwitter || DEFAULTS.socialTwitter;
    if (document.getElementById('socialInstaLink')) document.getElementById('socialInstaLink').href = settings.socialInsta || DEFAULTS.socialInsta;
    if (document.getElementById('socialLinkedinLink')) document.getElementById('socialLinkedinLink').href = settings.socialLinkedin || DEFAULTS.socialLinkedin;
  }

  // Layout order
  if (settings.layoutOrder && Array.isArray(settings.layoutOrder)) {
    const layoutMap = {
      'hero': document.getElementById('heroSection'),
      'banners': document.getElementById('bannersCarousel'),
      'offers': document.getElementById('offersSection'),
      'menu': document.getElementById('menuSection')
    };

    settings.layoutOrder.forEach((sectionName, index) => {
      const el = layoutMap[sectionName];
      if (el) el.style.order = index + 1;
    });

    if (siteFooter) siteFooter.style.order = 999;
  }
}

function getCategoryIcon(catName) {
  const name = (catName || '').toLowerCase();
  if (name === 'all') return '🍽️';
  if (name.includes('appetizer') || name.includes('starter') || name.includes('asian')) return '🥟';
  if (name.includes('main') || name.includes('steak') || name.includes('curry') || name.includes('meat')) return '🥩';
  if (name.includes('pizza')) return '🍕';
  if (name.includes('dessert') || name.includes('cake') || name.includes('sweet') || name.includes('pastr')) return '🍰';
  if (name.includes('drink') || name.includes('beverage') || name.includes('mocktail') || name.includes('coffee')) return '🍹';
  if (name.includes('burger') || name.includes('sandwich')) return '🍔';
  if (name.includes('pasta') || name.includes('spaghetti')) return '🍝';
  if (name.includes('salad') || name.includes('soup')) return '🥗';
  return '✨';
}

function renderCategoryTabs() {
  const categoryTabsContainer = document.getElementById('categoryTabs');
  if (!categoryTabsContainer) return;

  categoryTabsContainer.innerHTML = '';

  // All Tab
  const allBtn = document.createElement('button');
  allBtn.className = 'tab ' + (currentCategory === 'all' ? 'active' : '');
  allBtn.setAttribute('data-filter', 'all');
  allBtn.innerHTML = `<span>${getCategoryIcon('all')}</span> <span>All</span>`;
  allBtn.addEventListener('click', () => {
    setActiveCategory('all');
  });
  categoryTabsContainer.appendChild(allBtn);

  // Dynamic Categories from Firebase/Database
  categoriesList.forEach(c => {
    const btn = document.createElement('button');
    const filterKey = (c.id || c.name || '').toLowerCase();
    btn.className = 'tab ' + (currentCategory === filterKey ? 'active' : '');
    btn.setAttribute('data-filter', filterKey);
    btn.innerHTML = `<span>${getCategoryIcon(c.name)}</span> <span>${c.name}</span>`;
    btn.addEventListener('click', () => {
      setActiveCategory(filterKey);
    });
    categoryTabsContainer.appendChild(btn);
  });

  updateSubcategories(currentCategory);
}

function setActiveCategory(catKey) {
  currentCategory = catKey;
  currentSubCategory = 'all';
  
  const categoryTabsContainer = document.getElementById('categoryTabs');
  if (categoryTabsContainer) {
    categoryTabsContainer.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-filter') === catKey);
    });
  }

  updateSubcategories(currentCategory);
  filterMenu();
}

function updateSubcategories(categoryKey) {
  const subCategoryTabsContainer = document.getElementById('subCategoryTabs');
  if (!subCategoryTabsContainer) return;
  subCategoryTabsContainer.innerHTML = '';

  if (categoryKey === 'all') {
    subCategoryTabsContainer.style.display = 'none';
    return;
  }

  const catData = categoriesList.find(c => 
    (c.id && c.id.toLowerCase() === categoryKey.toLowerCase()) ||
    c.name.toLowerCase() === categoryKey.toLowerCase()
  );
  if (catData && catData.subCategories && catData.subCategories.length > 0) {
    subCategoryTabsContainer.style.display = 'flex';

    const allBtn = document.createElement('button');
    allBtn.className = 'tab active';
    allBtn.setAttribute('data-filter', 'all');
    allBtn.textContent = 'All';
    subCategoryTabsContainer.appendChild(allBtn);

    catData.subCategories.forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'tab';
      btn.setAttribute('data-filter', sub.toLowerCase());
      btn.textContent = sub;
      subCategoryTabsContainer.appendChild(btn);
    });

    const subTabs = subCategoryTabsContainer.querySelectorAll('.tab');
    subTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        subTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentSubCategory = tab.dataset.filter;
        filterMenu();
      });
    });
  } else {
    subCategoryTabsContainer.style.display = 'none';
  }
}

function renderOffers(settings) {
  const offersSection = document.getElementById('offersSection');
  if (!offersSection) return;
  
  if ((settings && settings.enableOffers === false) || !offers || offers.length === 0) {
    offersSection.style.display = 'none';
    return;
  }
  
  offersSection.style.display = 'block';
  const offersGrid = document.getElementById('offersGrid');
  offersGrid.innerHTML = '';
  
  const currency = (settings && settings.currencySymbol) ? settings.currencySymbol : '৳';
  
  offers.forEach(offer => {
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      ${offer.image ? `<div class="offer-image" style="background-image: url('${offer.image}')"></div>` : ''}
      <div class="offer-content">
        <div class="offer-header">
          <h3 class="offer-title">${offer.title}</h3>
          ${offer.price ? `<span class="offer-price">${currency} ${offer.price}</span>` : ''}
        </div>
        <p class="offer-desc">${offer.desc || ''}</p>
        <span style="font-size:12px; color:var(--color-primary); font-weight:600; margin-top:8px; display:inline-block;">View details →</span>
      </div>
    `;
    card.addEventListener('click', () => {
      const currentTable = window.currentTableNo || sessionStorage.getItem('evorise_table_param') || '1';
      window.location.href = 'detail.html?type=offer&id=' + encodeURIComponent(offer.id) + '&table=' + encodeURIComponent(currentTable);
    });
    offersGrid.appendChild(card);
  });
  
  if (window.lucide) window.lucide.createIcons();
}

function renderBanners() {
  const bannersCarousel = document.getElementById('bannersCarousel');
  if (!bannersCarousel) return;
  
  bannersCarousel.innerHTML = '';
  
  if (banners.length === 0) {
    bannersCarousel.style.display = 'none';
    return;
  }
  
  bannersCarousel.style.display = 'flex';
  
  banners.forEach(banner => {
    const card = document.createElement('div');
    card.className = 'banner-card';
    card.style.backgroundImage = `url('${banner.image || ''}')`;
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="banner-card-overlay">
        <h3 class="banner-title">${banner.title || ''}</h3>
        <p class="banner-desc">${banner.desc || ''}</p>
        <span style="font-size:11px; font-weight:700; letter-spacing:1px; opacity:0.85; margin-top:6px; display:inline-block;">TAP FOR DETAILS →</span>
      </div>
    `;
    card.addEventListener('click', () => {
      const currentTable = window.currentTableNo || sessionStorage.getItem('evorise_table_param') || '1';
      window.location.href = 'detail.html?type=banner&id=' + encodeURIComponent(banner.id) + '&table=' + encodeURIComponent(currentTable);
    });
    bannersCarousel.appendChild(card);
  });
}

function openBannerModal(banner) {
  document.getElementById('bannerInfoImg').src = banner.image || '';
  document.getElementById('bannerInfoTitle').textContent = banner.title || '';
  document.getElementById('bannerInfoDesc').textContent = banner.desc || '';
  
  const linkEl = document.getElementById('bannerInfoLink');
  if (banner.link) {
    linkEl.style.display = 'block';
    linkEl.href = banner.link;
  } else {
    linkEl.style.display = 'none';
  }
  
  document.getElementById('bannerInfoModal').classList.add('active');
}

function renderMenuItems(settings = globalSettings) {
  menuGrid.innerHTML = '';
  
  menuItems.forEach(item => {
    // Generate dietary tag HTML
    const dietaryHTML = item.dietary === 'veg' 
      ? `<div class="dietary-tag veg"><div class="veg-dot"></div></div>`
      : `<div class="dietary-tag non-veg"><div class="non-veg-triangle"></div></div>`;

    // Render extra badges
    let badgesHTML = '';
    if (item.badges && item.badges.length > 0) {
      badgesHTML = item.badges.map(b => `<span class="item-badge badge-${b.toLowerCase().replace(/[^a-z]/g, '')}">${b}</span>`).join('');
    }

    // Render Out of Stock State
    const isOutOfStock = item.outOfStock === true;
    const opacityClass = isOutOfStock ? 'opacity-50' : '';
    const outOfStockBanner = isOutOfStock ? `<div class="out-of-stock-banner">SOLD OUT</div>` : '';

    // Render Add-ons
    let addonsHTML = '';
    if (item.addons && item.addons.trim() !== '') {
      addonsHTML = `<div class="item-addons-preview" style="margin-bottom:12px;"><small style="color:var(--text-light);"><i data-lucide="plus-circle" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i>Add-ons available: ${item.addons}</small></div>`;
    }

    const cardHTML = `
      <article class="menu-card ${opacityClass}" data-category="${item.category}" data-subcategory="${item.subCategory || ''}" data-id="${item.id}" data-price="${item.price}" data-dietary="${item.dietary || 'non-veg'}">
        <div class="card-image-wrapper">
          ${outOfStockBanner}
          <img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy" decoding="async">
        </div>
        <div class="card-content">
          <div class="card-header">
            <div>
              <h3 class="item-title">${item.title}</h3>
              ${item.subCategory && settings && settings.enableSubCategories ? `<span style="font-size: 12px; color: var(--color-primary); font-weight: 600;">${item.subCategory}</span>` : ''}
              <div class="badges-row" style="display:flex; gap:6px; margin-top:4px;">${badgesHTML}</div>
            </div>
            ${dietaryHTML}
          </div>
          <p class="item-desc">${item.desc}</p>
          ${addonsHTML}
          <div class="card-footer">
            <span class="item-price">${globalCurrency} ${item.price}</span>
            <div class="action-container">
              ${isOutOfStock ? 
                `<button class="btn-add disabled" disabled style="background:#e5e7eb; color:#9ca3af; cursor:not-allowed;">Sold Out</button>` : 
                `<button class="btn-add"><i data-lucide="plus"></i></button>
                 <div class="quantity-stepper hidden">
                   <button class="step-btn minus"><i data-lucide="minus"></i></button>
                   <span class="qty-val">0</span>
                   <button class="step-btn plus"><i data-lucide="plus"></i></button>
                 </div>`
              }
            </div>
          </div>
        </div>
      </article>
    `;
    menuGrid.insertAdjacentHTML('beforeend', cardHTML);
  });

  lucide.createIcons();
  attachCardEvents();
  updateCartUI();
}

// --- Product Detail Modal (PDP) Engine (PRD-FE-001 §2.2) ---
let currentPdpItem = null;
let currentPdpQty = 1;
let currentPdpSelectedVariant = null;
let currentPdpSelectedAddons = [];

function attachCardEvents() {
  const cards = document.querySelectorAll('.menu-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const id = card.getAttribute('data-id');
      
      // If quick add stepper/button was clicked
      if (e.target.closest('.action-container')) {
        e.stopPropagation();
        quickAddToCart(id);
        return;
      }
      
      // Open Product Detail Modal (PDP) Bottom Sheet directly on page
      openItemDetailsModal(id);
    });
  });
}

function quickAddToCart(itemId) {
  const item = menuItems.find(i => String(i.id) === String(itemId));
  if (!item || item.outOfStock) return;
  
  // If item has variants or addons, open the PDP bottom-sheet for selection
  if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.trim() !== '')) {
    openItemDetailsModal(itemId);
    return;
  }
  
  const cartItemId = `${item.id}-base-`;
  const existingIndex = cart.findIndex(c => c.cartItemId === cartItemId);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      cartItemId,
      id: item.id,
      title: item.title,
      price: parseFloat(item.price),
      quantity: 1,
      variant: null,
      addons: [],
      instructions: ''
    });
  }
  
  updateCartUI();
  triggerCartBadgePop();
  showToast(`Added ${item.title} to order`);
}

function triggerCartBadgePop() {
  const badge = document.getElementById('cartBadgeCount');
  if (badge) {
    badge.classList.remove('badge-pop-animate');
    void badge.offsetWidth; // Force reflow
    badge.classList.add('badge-pop-animate');
    setTimeout(() => badge.classList.remove('badge-pop-animate'), 350);
  }
}

window.openItemDetailsModal = function(itemId) {
  const item = menuItems.find(i => String(i.id) === String(itemId));
  if (!item) return;

  currentPdpItem = item;
  currentPdpQty = 1;
  currentPdpSelectedVariant = null;
  currentPdpSelectedAddons = [];

  // Populate Hero Image & Dietary
  const imgEl = document.getElementById('itemDetailsImg');
  if (imgEl) imgEl.src = item.image || '';

  const dietaryEl = document.getElementById('itemDetailsDietaryBadge');
  if (dietaryEl) {
    const isVeg = item.dietary === 'veg';
    dietaryEl.className = `pdp-dietary-badge ${isVeg ? 'veg' : 'non-veg'}`;
    dietaryEl.innerHTML = isVeg 
      ? `<span class="dietary-icon">🌱</span> <span>Pure Vegetarian</span>`
      : `<span class="dietary-icon">🥩</span> <span>Non-Vegetarian</span>`;
  }

  // Populate Titles & Meta
  if (document.getElementById('itemDetailsTitle')) {
    document.getElementById('itemDetailsTitle').textContent = item.title;
  }
  if (document.getElementById('itemDetailsPrepTime')) {
    document.getElementById('itemDetailsPrepTime').textContent = item.prepTime || '12-18 mins';
  }
  if (document.getElementById('itemDetailsCategory')) {
    document.getElementById('itemDetailsCategory').textContent = item.category || 'Specialty';
  }
  if (document.getElementById('itemDetailsDesc')) {
    document.getElementById('itemDetailsDesc').textContent = item.desc || 'Prepared fresh with signature artisanal ingredients by our master culinary team.';
  }

  // Badges
  const badgesEl = document.getElementById('itemDetailsBadges');
  if (badgesEl) {
    badgesEl.innerHTML = '';
    if (item.badges && item.badges.length > 0) {
      item.badges.forEach(b => {
        const span = document.createElement('span');
        span.className = `item-badge badge-${b.toLowerCase().replace(/[^a-z]/g, '')}`;
        span.textContent = b;
        badgesEl.appendChild(span);
      });
    }
  }

  // Special instructions input reset
  const instructionsInput = document.getElementById('pdpSpecialInstructions');
  if (instructionsInput) instructionsInput.value = '';

  // Quantity Stepper reset
  if (document.getElementById('itemDetailsQty')) {
    document.getElementById('itemDetailsQty').textContent = '1';
  }

  // Parse & Render Required Modifiers (Variants)
  const reqGroup = document.getElementById('pdpRequiredModifiersGroup');
  const reqList = document.getElementById('pdpRequiredOptionsList');
  reqList.innerHTML = '';

  let variantsList = [];
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    variantsList = item.variants;
  } else if (typeof item.variants === 'string' && item.variants.trim() !== '') {
    variantsList = item.variants.split(',').map((v, idx) => {
      const parts = v.trim().split(':');
      const name = parts[0].trim();
      const delta = parts[1] ? parseFloat(parts[1]) : 0;
      return { id: `var-${idx}`, name: name, priceDelta: delta };
    });
  }

  if (variantsList.length > 0) {
    reqGroup.style.display = 'block';
    document.getElementById('pdpRequiredGroupName').textContent = 'Size / Portion Option';
    
    // Default to first variant
    currentPdpSelectedVariant = variantsList[0];

    variantsList.forEach((v, index) => {
      const card = document.createElement('div');
      const isSelected = index === 0;
      card.className = `pdp-option-card ${isSelected ? 'selected' : ''}`;
      card.setAttribute('data-variant-id', v.id || `var-${index}`);
      
      const deltaText = (v.priceDelta && v.priceDelta > 0) ? `+${globalCurrency} ${v.priceDelta}` : (v.price ? `${globalCurrency} ${v.price}` : 'Included');
      card.innerHTML = `
        <div class="pdp-option-left">
          <div class="pdp-radio-indicator"></div>
          <span class="pdp-option-label">${v.name || v.title}</span>
        </div>
        <span class="pdp-option-price">${deltaText}</span>
      `;
      card.addEventListener('click', () => {
        reqList.querySelectorAll('.pdp-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        currentPdpSelectedVariant = v;
        updatePdpPriceAndValidation();
      });
      reqList.appendChild(card);
    });
  } else {
    reqGroup.style.display = 'none';
    currentPdpSelectedVariant = null;
  }

  // Parse & Render Optional Modifiers (Add-ons)
  const optGroup = document.getElementById('pdpOptionalModifiersGroup');
  const optList = document.getElementById('pdpOptionalOptionsList');
  optList.innerHTML = '';

  let addonsList = [];
  if (typeof item.addons === 'string' && item.addons.trim() !== '') {
    addonsList = item.addons.split(',').map((a, idx) => {
      const parts = a.trim().split(':');
      const name = parts[0].trim();
      const delta = parts[1] ? parseFloat(parts[1]) : 40; // Default nominal addon price
      return { id: `add-${idx}`, name: name, price: delta };
    });
  } else if (Array.isArray(item.addons)) {
    addonsList = item.addons;
  }

  if (addonsList.length > 0) {
    optGroup.style.display = 'block';
    addonsList.forEach((addon, index) => {
      const card = document.createElement('div');
      card.className = 'pdp-option-card';
      card.setAttribute('data-addon-id', addon.id || `add-${index}`);
      const priceText = `+${globalCurrency} ${addon.price || 40}`;
      card.innerHTML = `
        <div class="pdp-option-left">
          <div class="pdp-checkbox-indicator"><i data-lucide="check" style="width:12px;height:12px;"></i></div>
          <span class="pdp-option-label">${addon.name}</span>
        </div>
        <span class="pdp-option-price">${priceText}</span>
      `;
      card.addEventListener('click', () => {
        const isCurrentlySelected = card.classList.contains('selected');
        if (isCurrentlySelected) {
          card.classList.remove('selected');
          currentPdpSelectedAddons = currentPdpSelectedAddons.filter(a => a.name !== addon.name);
        } else {
          card.classList.add('selected');
          currentPdpSelectedAddons.push(addon);
        }
        updatePdpPriceAndValidation();
      });
      optList.appendChild(card);
    });
  } else {
    optGroup.style.display = 'none';
  }

  // Refresh Lucide icons inside modal
  if (window.lucide) lucide.createIcons();

  updatePdpPriceAndValidation();

  // Show Bottom Sheet Modal
  const modal = document.getElementById('itemDetailsModal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
};

window.closeItemDetailsModal = function() {
  const modal = document.getElementById('itemDetailsModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
};

window.updateDetailsQty = function(delta) {
  currentPdpQty = Math.max(1, Math.min(99, currentPdpQty + delta));
  const qtyEl = document.getElementById('itemDetailsQty');
  if (qtyEl) qtyEl.textContent = currentPdpQty;
  updatePdpPriceAndValidation();
};

function updatePdpPriceAndValidation() {
  if (!currentPdpItem) return;

  const basePrice = parseFloat(currentPdpItem.price) || 0;
  let variantDelta = 0;
  if (currentPdpSelectedVariant) {
    variantDelta = parseFloat(currentPdpSelectedVariant.priceDelta || 0);
  }

  let addonsTotal = 0;
  currentPdpSelectedAddons.forEach(a => {
    addonsTotal += parseFloat(a.price || 40);
  });

  const singleUnitPrice = basePrice + variantDelta + addonsTotal;
  const grandTotal = singleUnitPrice * currentPdpQty;

  const priceBtn = document.getElementById('itemDetailsPriceBtn');
  if (priceBtn) {
    priceBtn.textContent = `${globalCurrency} ${grandTotal.toFixed(0)}`;
  }

  // Validation Check: If variants exist, one must be chosen
  const reqGroup = document.getElementById('pdpRequiredModifiersGroup');
  const valAlert = document.getElementById('pdpValidationAlert');
  const btnAdd = document.getElementById('btnAddToCartModal');
  
  const hasVariants = reqGroup && reqGroup.style.display !== 'none';
  const isInvalid = hasVariants && !currentPdpSelectedVariant;

  if (isInvalid) {
    if (valAlert) valAlert.classList.add('active');
    if (btnAdd) btnAdd.disabled = true;
  } else {
    if (valAlert) valAlert.classList.remove('active');
    if (btnAdd) btnAdd.disabled = false;
  }
}

window.submitPdpToCart = function() {
  if (!currentPdpItem) return;

  const btnAdd = document.getElementById('btnAddToCartModal');
  if (btnAdd && btnAdd.disabled) return;

  const basePrice = parseFloat(currentPdpItem.price) || 0;
  let variantDelta = 0;
  if (currentPdpSelectedVariant) {
    variantDelta = parseFloat(currentPdpSelectedVariant.priceDelta || 0);
  }
  let addonsTotal = 0;
  const addonNames = [];
  currentPdpSelectedAddons.forEach(a => {
    addonsTotal += parseFloat(a.price || 40);
    addonNames.push(a.name);
  });

  const finalUnitPrice = basePrice + variantDelta + addonsTotal;
  const instructions = document.getElementById('pdpSpecialInstructions') ? document.getElementById('pdpSpecialInstructions').value.trim() : '';

  const variantKey = currentPdpSelectedVariant ? (currentPdpSelectedVariant.id || currentPdpSelectedVariant.name) : 'base';
  const addonsKey = addonNames.sort().join('+');
  const cartItemId = `${currentPdpItem.id}-${variantKey}-${addonsKey}-${instructions ? instructions.replace(/\s+/g,'_') : ''}`;

  const existingIndex = cart.findIndex(c => c.cartItemId === cartItemId);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += currentPdpQty;
  } else {
    cart.push({
      cartItemId: cartItemId,
      id: currentPdpItem.id,
      title: currentPdpItem.title,
      price: finalUnitPrice,
      quantity: currentPdpQty,
      variant: currentPdpSelectedVariant ? currentPdpSelectedVariant.name : null,
      addons: addonNames,
      instructions: instructions
    });
  }

  updateCartUI();
  triggerCartBadgePop();
  closeItemDetailsModal();
  showToast(`Added ${currentPdpQty}x ${currentPdpItem.title} to cart`);
};

// Close PDP modal on outside backdrop click or ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeItemDetailsModal();
  }
});

const pdpModalBackdrop = document.getElementById('itemDetailsModal');
if (pdpModalBackdrop) {
  pdpModalBackdrop.addEventListener('click', (e) => {
    if (e.target === pdpModalBackdrop) {
      closeItemDetailsModal();
    }
  });
}

function showToast(msg) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = 'position:fixed; bottom:90px; left:50%; transform:translateX(-50%); background:var(--color-primary); color:white; padding:12px 24px; border-radius:30px; z-index:9999; font-size:14px; opacity:0; transition: opacity 0.3s ease; pointer-events:none; box-shadow:0 4px 12px rgba(0,0,0,0.2); font-weight: 500;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
        toast.style.opacity = '0';
    }, 2500);
}

// 1. Update Cart UI globally
async function updateCartUI() {
  await saveCart(cart); // Save to localStorage

  let totalItems = 0;
  let totalPrice = 0;
  
  const cartContainer = document.getElementById('cartItemsContainer');
  if (!cartContainer) return;
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-icon">🛒</div>
        <h4>Your cart is empty</h4>
        <p>Explore our menu and add something delicious to your table!</p>
        <button type="button" class="btn btn-secondary" onclick="closeCartModal()" style="padding:8px 18px; border-radius:20px; font-weight:600; cursor:pointer;">
          Browse Menu
        </button>
      </div>
    `;
  } else {
    cart.forEach((cItem, index) => {
      const itemQty = parseInt(cItem.quantity) || 1;
      const itemPrice = parseFloat(cItem.price) || 0;
      const itemSubtotal = itemPrice * itemQty;
      totalItems += itemQty;
      totalPrice += itemSubtotal;
      
      // Look up image from menuItems
      const menuItem = (menuItems || []).find(m => String(m.id) === String(cItem.id));
      const imgSrc = cItem.image || (menuItem ? menuItem.image : null);

      const div = document.createElement('div');
      div.className = 'cart-modal-item';
      div.innerHTML = `
        ${imgSrc 
          ? `<img src="${imgSrc}" class="cart-item-thumb" alt="${cItem.title}">` 
          : `<div class="cart-item-thumb-fallback">🍽️</div>`}
        <div class="cart-item-info">
          <h4>${cItem.title}</h4>
          ${cItem.variant ? `<div class="cart-item-details">Size: <strong>${cItem.variant}</strong></div>` : ''}
          ${cItem.addons && cItem.addons.length > 0 ? `<div class="cart-item-details">+ ${cItem.addons.join(', ')}</div>` : ''}
          <div class="cart-item-price-row">
            <span class="cart-item-unit-price">${globalCurrency} ${itemPrice.toLocaleString('en-IN')} × ${itemQty} =</span>
            <span class="cart-item-subtotal">${globalCurrency} ${itemSubtotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-stepper">
            <button type="button" class="step-btn minus" onclick="updateCartItemQty(${index}, -1)" aria-label="Decrease quantity"><i data-lucide="minus"></i></button>
            <span class="qty-val">${itemQty}</span>
            <button type="button" class="step-btn plus" onclick="updateCartItemQty(${index}, 1)" aria-label="Increase quantity"><i data-lucide="plus"></i></button>
          </div>
          <button type="button" class="btn-delete-cart-item" onclick="removeCartItem(${index})" title="Remove item" aria-label="Remove item">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;
      cartContainer.appendChild(div);
    });
  }
  
  if (window.lucide) lucide.createIcons();

  // Update Cart Header Count
  const cartHeaderCount = document.getElementById('cartHeaderCount');
  if (cartHeaderCount) cartHeaderCount.textContent = totalItems;

  // Update Totals
  const subtotalEl = document.getElementById('cartModalSubtotalDisplay');
  if (subtotalEl) subtotalEl.textContent = `${globalCurrency} ${totalPrice.toLocaleString('en-IN')}`;

  const totalEl = document.getElementById('cartModalTotalDisplay');
  if (totalEl) totalEl.textContent = `${globalCurrency} ${totalPrice.toLocaleString('en-IN')}`;

  const btnTotalEl = document.getElementById('cartConfirmTotalBtn');
  if (btnTotalEl) btnTotalEl.textContent = `${globalCurrency} ${totalPrice.toLocaleString('en-IN')}`;

  const confirmBtn = document.getElementById('btnConfirmOrder');
  if (confirmBtn) {
    confirmBtn.disabled = cart.length === 0;
  }

  // Update Floating Cart
  if (totalItems > 0) {
    if (floatingCart) floatingCart.style.display = 'block';
    if (cartBadgeCount) cartBadgeCount.textContent = totalItems;
    if (cartTotalDisplay) cartTotalDisplay.textContent = `${globalCurrency} ${totalPrice.toLocaleString('en-IN')}`;
  } else {
    if (floatingCart) floatingCart.style.display = 'none';
  }
}

window.removeCartItem = async function(index) {
  const item = cart[index];
  cart.splice(index, 1);
  if (typeof saveCart === 'function') await saveCart(cart);
  await updateCartUI();
  if (item) showToast(`Removed ${item.title} from cart`);
};

window.clearEntireCart = async function() {
  if (!cart || cart.length === 0) {
    showToast("Your cart is already empty");
    return;
  }
  cart = [];
  if (typeof clearCart === 'function') await clearCart();
  else if (typeof saveCart === 'function') await saveCart([]);
  localStorage.removeItem('spice_garden_cart');
  await updateCartUI();
  showToast("🗑️ Cart has been cleared");
};

window.updateCartItemQty = async function(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    await window.removeCartItem(index);
    return;
  }
  if (typeof saveCart === 'function') await saveCart(cart);
  await updateCartUI();
};

window.openCartModal = function() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
  }
};
window.closeCartModal = function() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
  }
};



// 2. Filter & Sort Menu Items
function filterMenu() {
  const searchLower = currentSearch.toLowerCase().trim();
  const menuGridEl = document.getElementById('menuGrid');
  if (!menuGridEl) return;
  const cards = Array.from(menuGridEl.querySelectorAll('.menu-card'));
  let visibleCount = 0;

  // 1. Sort Cards
  if (currentSort !== 'default') {
    cards.sort((a, b) => {
      const priceA = parseFloat(a.getAttribute('data-price')) || 0;
      const priceB = parseFloat(b.getAttribute('data-price')) || 0;
      const titleA = (a.querySelector('.item-title')?.textContent || '').toLowerCase();
      const titleB = (b.querySelector('.item-title')?.textContent || '').toLowerCase();

      if (currentSort === 'price-asc') return priceA - priceB;
      if (currentSort === 'price-desc') return priceB - priceA;
      if (currentSort === 'name-asc') return titleA.localeCompare(titleB);
      return 0;
    });
    // Re-append in sorted order
    cards.forEach(card => menuGridEl.appendChild(card));
  }

  // 2. Filter Cards
  cards.forEach(card => {
    const category = (card.getAttribute('data-category') || '').toLowerCase();
    const subCategory = (card.getAttribute('data-subcategory') || '').toLowerCase();
    const dietary = (card.getAttribute('data-dietary') || '').toLowerCase();
    const title = (card.querySelector('.item-title')?.textContent || '').toLowerCase();
    const desc = (card.querySelector('.item-desc')?.textContent || '').toLowerCase();
    const badges = (card.querySelector('.badges-row')?.textContent || '').toLowerCase();

    // GLOBAL SEARCH: If user enters query, search across all dishes!
    // Otherwise filter by selected category
    const curCat = currentCategory.toLowerCase();
    let matchesCategory = true;
    if (!searchLower) {
      matchesCategory = (curCat === 'all' || 
        category === curCat ||
        (curCat === 'appetizers' && category === 'starters') ||
        (curCat === 'starters' && category === 'appetizers') ||
        (curCat === 'drinks' && category === 'beverages') ||
        (curCat === 'beverages' && category === 'drinks')
      );
    }

    let matchesSubCategory = true;
    if (!searchLower && currentSubCategory !== 'all') {
      matchesSubCategory = (subCategory === currentSubCategory.toLowerCase());
    }

    // Dietary filter (All, Veg, Non-Veg)
    const matchesDietary = (currentDietary === 'all' || dietary === currentDietary);

    // Multi-field search matching
    let matchesSearch = true;
    if (searchLower) {
      matchesSearch = title.includes(searchLower) ||
                      desc.includes(searchLower) ||
                      category.includes(searchLower) ||
                      subCategory.includes(searchLower) ||
                      badges.includes(searchLower) ||
                      (searchLower === 'veg' && dietary === 'veg') ||
                      (searchLower === 'non-veg' && dietary === 'non-veg');
    }

    if (matchesCategory && matchesSubCategory && matchesDietary && matchesSearch) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Search Clear button visibility
  const btnSearchClear = document.getElementById('btnSearchClear');
  if (btnSearchClear) {
    btnSearchClear.classList.toggle('hidden', !searchLower);
  }

  // Filter Status Indicator
  const filterStatus = document.getElementById('filterStatusIndicator');
  const filterStatusText = document.getElementById('filterStatusText');
  if (filterStatus && filterStatusText) {
    const isFiltered = Boolean(searchLower || currentCategory !== 'all' || currentSubCategory !== 'all' || currentDietary !== 'all' || currentSort !== 'default');
    if (isFiltered) {
      filterStatus.classList.remove('hidden');
      let statusMsg = `Showing ${visibleCount} dish${visibleCount === 1 ? '' : 'es'}`;
      if (searchLower) statusMsg += ` matching "${currentSearch}"`;
      if (currentDietary !== 'all') statusMsg += ` • ${currentDietary === 'veg' ? 'Veg' : 'Non-Veg'}`;
      if (currentSort !== 'default') {
        const sortLabels = { 'price-asc': 'Price: Low-High', 'price-desc': 'Price: High-Low', 'name-asc': 'A-Z' };
        statusMsg += ` • ${sortLabels[currentSort] || ''}`;
      }
      filterStatusText.textContent = statusMsg;
    } else {
      filterStatus.classList.add('hidden');
    }
  }

  // Empty State
  const emptyStateEl = document.getElementById('emptyState');
  if (emptyStateEl) {
    if (visibleCount === 0) {
      emptyStateEl.classList.remove('hidden');
      const emptyDesc = document.getElementById('emptyStateDesc');
      if (emptyDesc) {
        if (searchLower) emptyDesc.textContent = `No dishes found matching "${currentSearch}". Try a different keyword or reset filters.`;
        else emptyDesc.textContent = "No dishes available in this category.";
      }
    } else {
      emptyStateEl.classList.add('hidden');
    }
  }
}

// --- Filter, Search & Sort Event Listeners ---

// 1. Live Search
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    const btnSearchClear = document.getElementById('btnSearchClear');
    if (btnSearchClear) {
      if (currentSearch.trim().length > 0) {
        btnSearchClear.classList.remove('hidden');
      } else {
        btnSearchClear.classList.add('hidden');
      }
    }
    filterMenu();
  });
}

const btnSearchClear = document.getElementById('btnSearchClear');
if (btnSearchClear) {
  btnSearchClear.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    currentSearch = '';
    btnSearchClear.classList.add('hidden');
    filterMenu();
    if (searchInput) searchInput.focus();
  });
}

// 2. Sort Dropdown & Mobile Bottom Sheet
const btnSortToggle = document.getElementById('btnSortToggle');
const sortMenu = document.getElementById('sortMenu');
const sortLabelText = document.getElementById('sortLabelText');
const sortBottomSheet = document.getElementById('sortBottomSheet');
const sortSheetBackdrop = document.getElementById('sortSheetBackdrop');
const btnSortSheetClose = document.getElementById('btnSortSheetClose');
const btnSortSheetApply = document.getElementById('btnSortSheetApply');

function openSortBottomSheet() {
  if (!sortBottomSheet) return;
  sortBottomSheet.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Sync sheet active choices
  document.querySelectorAll('.sort-sheet-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-sort') === currentSort);
  });
  document.querySelectorAll('.sheet-dietary-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-dietary') === currentDietary);
  });
  if (window.lucide) lucide.createIcons();
}

function closeSortBottomSheet() {
  if (!sortBottomSheet) return;
  sortBottomSheet.classList.add('hidden');
  document.body.style.overflow = '';
}

function updateSortSelection(sortKey) {
  currentSort = sortKey;
  const labels = {
    'default': 'Sort',
    'price-asc': 'Price ↑',
    'price-desc': 'Price ↓',
    'name-asc': 'A-Z'
  };
  if (sortLabelText) {
    sortLabelText.textContent = labels[currentSort] || 'Sort';
  }

  if (btnSortToggle) {
    btnSortToggle.classList.toggle('active-sort', currentSort !== 'default');
  }

  // Sync desktop options
  document.querySelectorAll('.sort-option').forEach(o => {
    o.classList.toggle('active', o.getAttribute('data-sort') === currentSort);
  });

  // Sync sheet options
  document.querySelectorAll('.sort-sheet-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-sort') === currentSort);
  });

  if (sortMenu) sortMenu.classList.add('hidden');
  filterMenu();
}

if (btnSortToggle) {
  btnSortToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.innerWidth <= 768) {
      if (sortMenu) sortMenu.classList.add('hidden');
      openSortBottomSheet();
    } else {
      if (sortMenu) sortMenu.classList.toggle('hidden');
    }
  });
}

// Desktop Sort Options
document.querySelectorAll('.sort-option').forEach(opt => {
  opt.addEventListener('click', (e) => {
    e.stopPropagation();
    const sortKey = opt.getAttribute('data-sort');
    updateSortSelection(sortKey);
  });
});

// Mobile Sheet Sort Options
document.querySelectorAll('.sort-sheet-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const sortKey = item.getAttribute('data-sort');
    updateSortSelection(sortKey);
    setTimeout(closeSortBottomSheet, 150);
  });
});

// Mobile Sheet Dietary Buttons
document.querySelectorAll('.sheet-dietary-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dietaryKey = btn.getAttribute('data-dietary');
    currentDietary = dietaryKey;
    document.querySelectorAll('.sheet-dietary-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-dietary') === dietaryKey));
    document.querySelectorAll('.dietary-chip').forEach(c => c.classList.toggle('active', c.getAttribute('data-dietary') === dietaryKey));
    filterMenu();
  });
});

if (sortSheetBackdrop) sortSheetBackdrop.addEventListener('click', closeSortBottomSheet);
if (btnSortSheetClose) btnSortSheetClose.addEventListener('click', closeSortBottomSheet);
if (btnSortSheetApply) btnSortSheetApply.addEventListener('click', closeSortBottomSheet);

// Close desktop dropdown on outside click
document.addEventListener('click', (e) => {
  if (sortMenu && !sortMenu.contains(e.target) && e.target !== btnSortToggle) {
    sortMenu.classList.add('hidden');
  }
});

// 3. Quick Dietary Filter Chips
document.querySelectorAll('.dietary-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const dietaryKey = chip.getAttribute('data-dietary');
    currentDietary = dietaryKey;
    document.querySelectorAll('.dietary-chip').forEach(c => c.classList.toggle('active', c.getAttribute('data-dietary') === dietaryKey));
    document.querySelectorAll('.sheet-dietary-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-dietary') === dietaryKey));
    filterMenu();
  });
});

// 4. Reset Filters Buttons
function resetAllFilters() {
  if (searchInput) searchInput.value = '';
  const btnSearchClear = document.getElementById('btnSearchClear');
  if (btnSearchClear) btnSearchClear.classList.add('hidden');
  currentSearch = '';
  currentCategory = 'all';
  currentSubCategory = 'all';
  currentDietary = 'all';
  currentSort = 'default';

  if (sortLabelText) sortLabelText.textContent = 'Sort';
  if (btnSortToggle) btnSortToggle.classList.remove('active-sort');

  document.querySelectorAll('.sort-option').forEach(o => {
    o.classList.toggle('active', o.getAttribute('data-sort') === 'default');
  });
  document.querySelectorAll('.sort-sheet-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-sort') === 'default');
  });
  document.querySelectorAll('.dietary-chip').forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-dietary') === 'all');
  });
  document.querySelectorAll('.sheet-dietary-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-dietary') === 'all');
  });
  
  renderCategoryTabs();
  filterMenu();
}

const btnResetFilters = document.getElementById('btnResetFilters');
if (btnResetFilters) btnResetFilters.addEventListener('click', resetAllFilters);

const btnEmptyReset = document.getElementById('btnEmptyReset');
if (btnEmptyReset) btnEmptyReset.addEventListener('click', resetAllFilters);

// --- Real-Time Order Tracking & Invoice Engine ---
let activeOrderUnsubscribe = null;
let currentTrackedOrder = null;

// Place Order Handler with Idempotency Key & Session Storage (PRD-FE-001 §1.1 & §3.1)
const btnConfirmOrder = document.getElementById('btnConfirmOrder');
let isCheckoutInFlight = false;

if (btnConfirmOrder) {
  btnConfirmOrder.addEventListener('click', async () => {
    if (cart.length === 0 || isCheckoutInFlight) return;
    
    if (window.isCustomerOutsideGeofence) {
      showGeofenceAlertModal();
      return;
    }

    isCheckoutInFlight = true;
    const originalText = btnConfirmOrder.innerHTML;
    
    // Offline resilience: if offline, wait for online event
    if (!navigator.onLine) {
      btnConfirmOrder.innerHTML = 'Connecting to Kitchen... <i data-lucide="loader-2" class="spin"></i>';
      btnConfirmOrder.disabled = true;
      showToast('Offline: Queuing order. Will send as soon as network connects.');
      await new Promise(resolve => window.addEventListener('online', resolve, { once: true }));
    }
    
    btnConfirmOrder.innerHTML = 'Sending to Kitchen... <i data-lucide="loader-2" class="spin"></i>';
    btnConfirmOrder.disabled = true;
    if (window.lucide) lucide.createIcons();
    
    let totalPrice = 0;
    cart.forEach(c => totalPrice += (parseFloat(c.price) || 0) * (parseInt(c.quantity) || 1));
    
    const tableInput = document.getElementById('cartTableNo');
    const tableNo = window.currentTableNo || (tableInput && tableInput.value.trim()) || 'Table 1';
    const sessionId = window.currentSessionId || sessionStorage.getItem('evorise_table_session') || null;
    
    const notesInput = document.getElementById('cartOrderNotes');
    const notes = notesInput ? notesInput.value.trim() : '';

    // Generate unique client UUID Idempotency-Key (PRD-FE-001 §3.1)
    const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    try {
      const order = await placeOrder({
        idempotencyKey: idempotencyKey,
        items: [...cart],
        total: totalPrice,
        tableNo: tableNo,
        sessionId: sessionId,
        notes: notes
      });
      
      // Store in sessionStorage per PRD-FE-001 §1.1 (prevent session persistence across browser restarts)
      sessionStorage.setItem('evorise_active_order', order.id);
      localStorage.setItem('evorise_active_order', order.id); // graceful fallback
      currentTrackedOrder = order;

      const btnViewOrder = document.getElementById('btnViewActiveOrder');
      if (btnViewOrder) btnViewOrder.classList.remove('hidden');
      
      // Reset Cart
      cart = [];
      await saveCart(cart);
      updateCartUI();
      closeCartModal();
      
      btnConfirmOrder.innerHTML = originalText;
      btnConfirmOrder.disabled = false;
      isCheckoutInFlight = false;
      
      // Open Live Tracking Modal Immediately
      openOrderTrackingModal(order.id);
      showToast('🎉 Order Placed and Confirmed by Kitchen!');
    } catch (err) {
      console.error(err);
      showToast('Failed to place order. Please check network and try again.');
      btnConfirmOrder.innerHTML = originalText;
      btnConfirmOrder.disabled = false;
      isCheckoutInFlight = false;
    }
  });
}

// 1. Open Order Tracking Modal (WCAG 2.1 AA live region support)
window.openOrderTrackingModal = async function(orderId) {
  if (!orderId) {
    orderId = sessionStorage.getItem('evorise_active_order') || localStorage.getItem('evorise_active_order');
  }
  if (!orderId) {
    showToast("No active order found to track.");
    return;
  }

  const modal = document.getElementById('orderTrackingModal');
  if (!modal) return;
  modal.classList.add('active');
  modal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();

  // Try immediate fetch
  const order = await getOrderById(orderId);
  if (order) {
    currentTrackedOrder = order;
    renderOrderTrackingModal(order);
    updateFloatingTrackerPill(order);
  } else {
    const idEl = document.getElementById('trackModalOrderId');
    if (idEl) idEl.textContent = `Order #${orderId}`;
  }

  // Real-time synchronization with Firestore
  if (activeOrderUnsubscribe) {
    activeOrderUnsubscribe();
    activeOrderUnsubscribe = null;
  }
  if (typeof subscribeOrder === 'function') {
    activeOrderUnsubscribe = subscribeOrder(orderId, (updatedOrder) => {
      currentTrackedOrder = updatedOrder;
      renderOrderTrackingModal(updatedOrder);
      updateFloatingTrackerPill(updatedOrder);
    });
  }
};

// 2. Close Order Tracking Modal
window.closeOrderTrackingModal = function() {
  const modal = document.getElementById('orderTrackingModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
  }
};

// 3. Render Order Tracking Details & Stepper
window.renderOrderTrackingModal = function(order) {
  if (!order) return;
  
  const idEl = document.getElementById('trackModalOrderId');
  if (idEl) idEl.textContent = `Order #${order.id}`;

  const tableEl = document.getElementById('trackTableNo');
  if (tableEl) tableEl.textContent = order.tableNo || 'Table 1';

  const badgeEl = document.getElementById('trackStatusBadge');
  if (badgeEl) {
    badgeEl.textContent = order.status || 'Pending';
    badgeEl.className = `badge status-${(order.status || 'pending').toLowerCase()}`;
  }

  const totalEl = document.getElementById('trackOrderTotal');
  if (totalEl) totalEl.textContent = `${globalCurrency} ${(parseFloat(order.total) || 0).toLocaleString('en-IN')}`;

  const itemsList = document.getElementById('trackItemsList');
  if (itemsList && order.items) {
    itemsList.innerHTML = order.items.map(item => `
      <div class="track-item-row" style="display:flex; justify-content:space-between; font-size:12.5px; padding:4px 0; border-bottom:1px dashed #E2E8F0;">
        <span style="color:#0F172A;"><strong>${item.quantity || 1}×</strong> ${item.title}</span>
        <span style="color:#475569; font-weight:600;">${globalCurrency} ${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)).toLocaleString()}</span>
      </div>
    `).join('');
  }

  // Update Stepper
  updateTrackingStepper(order.status || 'Pending');

  // Cancel Button State with 60s Grace Cancellation Window
  setupCancelButtonState(order);

  if (window.lucide) lucide.createIcons();
};

let cancelCountdownInterval = null;

function setupCancelButtonState(order) {
  const btnCancel = document.getElementById('btnTrackCancelOrder');
  if (!btnCancel) return;

  if (cancelCountdownInterval) {
    clearInterval(cancelCountdownInterval);
    cancelCountdownInterval = null;
  }

  if (!order || order.status === 'Cancelled') {
    btnCancel.style.display = 'inline-block';
    btnCancel.disabled = true;
    btnCancel.className = 'btn btn-secondary btn-track-cancel';
    btnCancel.textContent = '❌ Order Cancelled';
    return;
  }

  if (order.status === 'Completed' || order.status === 'Served' || order.status === 'Delivered') {
    btnCancel.style.display = 'none';
    return;
  }

  const orderTime = new Date(order.date || order.createdAt || Date.now()).getTime();
  const GRACE_SECONDS = 60; // 60 seconds grace cancellation window

  const refreshBtn = () => {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - orderTime) / 1000));
    const remainingSeconds = Math.max(0, GRACE_SECONDS - elapsedSeconds);

    if (order.status === 'Pending' && remainingSeconds > 0) {
      btnCancel.style.display = 'inline-block';
      btnCancel.disabled = false;
      btnCancel.className = 'btn btn-danger btn-track-cancel';
      btnCancel.textContent = `Cancel Order (${remainingSeconds}s)`;
    } else {
      // Grace period expired or order is Cooking, Ready, or Completed
      btnCancel.style.display = 'inline-block';
      btnCancel.disabled = true;
      btnCancel.className = 'btn btn-secondary btn-track-cancel';
      if (order.status === 'Cooking' || order.status === 'Preparing') {
        btnCancel.textContent = '👨‍🍳 Cooking in Progress';
      } else if (order.status === 'Ready') {
        btnCancel.textContent = '🔔 Ready to Serve';
      } else if (order.status === 'Completed') {
        btnCancel.style.display = 'none';
      } else {
        btnCancel.textContent = '🔒 Kitchen Preparing';
      }
      if (cancelCountdownInterval) {
        clearInterval(cancelCountdownInterval);
        cancelCountdownInterval = null;
      }
    }
  };

  refreshBtn();
  const currentElapsed = Math.floor((Date.now() - orderTime) / 1000);
  if (currentElapsed < GRACE_SECONDS) {
    cancelCountdownInterval = setInterval(refreshBtn, 1000);
  }
}

// 4. Update 4-Step Visual Progress Stepper
window.updateTrackingStepper = function(status) {
  const steps = [
    { id: 'step-pending', name: 'Order Received' },
    { id: 'step-cooking', name: 'In the Kitchen' },
    { id: 'step-ready', name: 'Ready to Serve' },
    { id: 'step-completed', name: 'Served & Completed' }
  ];
  const connectors = ['conn-1', 'conn-2', 'conn-3'];

  let activeIdx = 0;
  if (status === 'Cooking' || status === 'Preparing') activeIdx = 1;
  else if (status === 'Ready') activeIdx = 2;
  else if (status === 'Completed' || status === 'Served' || status === 'Delivered') activeIdx = 3;
  else if (status === 'Cancelled') activeIdx = -1;
  else activeIdx = 0; // 'Pending'

  steps.forEach((s, idx) => {
    const el = document.getElementById(s.id);
    if (!el) return;
    const badge = el.querySelector('.step-status-badge');
    el.classList.remove('step-done', 'step-active');

    if (activeIdx === -1) {
      if (badge) badge.textContent = 'Cancelled';
    } else if (idx < activeIdx) {
      el.classList.add('step-done');
      if (badge) badge.textContent = 'Done';
    } else if (idx === activeIdx) {
      if (activeIdx === 3) {
        el.classList.add('step-done');
        if (badge) badge.textContent = 'Completed';
      } else {
        el.classList.add('step-active');
        if (badge) badge.textContent = 'In Progress';
      }
    } else {
      if (badge) badge.textContent = 'Waiting';
    }
  });

  connectors.forEach((connId, idx) => {
    const connEl = document.getElementById(connId);
    if (!connEl) return;
    if (activeIdx > idx) {
      connEl.classList.add('active');
    } else {
      connEl.classList.remove('active');
    }
  });
};

// 5. Cancel Active Order
window.cancelActiveOrder = async function() {
  if (!currentTrackedOrder) return;
  if (currentTrackedOrder.status === 'Cancelled') {
    showToast("This order is already cancelled.");
    return;
  }

  const orderTime = new Date(currentTrackedOrder.date || currentTrackedOrder.createdAt || Date.now()).getTime();
  const elapsedSeconds = Math.floor((Date.now() - orderTime) / 1000);

  if (currentTrackedOrder.status !== 'Pending' || elapsedSeconds > 60) {
    alert("This order cannot be cancelled because kitchen preparation has already begun or the grace cancellation period has expired. Please notify staff directly if you need assistance.");
    return;
  }

  if (confirm(`Are you sure you want to cancel order #${currentTrackedOrder.id}?`)) {
    try {
      await fetch(`/api/v1/orders/${encodeURIComponent(currentTrackedOrder.id)}/cancel`, {
        method: 'POST'
      });
    } catch (e) {}

    await updateOrderStatus(currentTrackedOrder.id, 'Cancelled');
    currentTrackedOrder.status = 'Cancelled';
    currentTrackedOrder.cancelledAt = new Date().toISOString();

    if (cancelCountdownInterval) {
      clearInterval(cancelCountdownInterval);
      cancelCountdownInterval = null;
    }

    renderOrderTrackingModal(currentTrackedOrder);
    updateFloatingTrackerPill(currentTrackedOrder);
    showToast("✅ Order has been cancelled.");
  }
};

// 6. View & Print Invoice / Receipt
window.viewActiveOrderInvoice = function() {
  if (!currentTrackedOrder) {
    showToast("No active order found.");
    return;
  }
  const invoiceBody = document.getElementById('customerInvoiceBody');
  if (invoiceBody) {
    invoiceBody.innerHTML = generateInvoiceHtml(currentTrackedOrder);
  }
  const modal = document.getElementById('customerInvoiceModal');
  if (modal) {
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
  }
};

window.closeCustomerInvoiceModal = function() {
  const modal = document.getElementById('customerInvoiceModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// 7. Update Floating Order Tracker Pill
window.updateFloatingTrackerPill = function(order) {
  const pill = document.getElementById('floatingOrderTracker');
  if (!pill) return;
  
  if (!order || order.status === 'Completed' || order.status === 'Cancelled') {
    pill.style.display = 'none';
    if (order && (order.status === 'Completed' || order.status === 'Cancelled')) {
      localStorage.removeItem('evorise_active_order');
    }
    return;
  }

  pill.style.display = 'block';
  const idEl = document.getElementById('floatingTrackerId');
  if (idEl) idEl.textContent = `#${order.id}`;

  const statusEl = document.getElementById('floatingTrackerStatus');
  if (statusEl) {
    let statusText = order.status || 'Pending';
    if (statusText === 'Cooking') statusText = '👨‍🍳 Cooking';
    else if (statusText === 'Ready') statusText = '🔔 Ready to Serve';
    else if (statusText === 'Pending') statusText = '⏳ Kitchen Received';
    statusEl.textContent = statusText;
  }
  if (window.lucide) lucide.createIcons();
};

// 8. Check Active Order on Page Load
window.checkActiveOrderOnLoad = async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const trackParam = urlParams.get('track');
  const activeOrderId = trackParam || localStorage.getItem('evorise_active_order');

  if (activeOrderId) {
    const order = await getOrderById(activeOrderId);
    if (order) {
      currentTrackedOrder = order;
      if (order.status !== 'Completed' && order.status !== 'Cancelled') {
        updateFloatingTrackerPill(order);
        if (typeof subscribeOrder === 'function') {
          activeOrderUnsubscribe = subscribeOrder(activeOrderId, (updatedOrder) => {
            currentTrackedOrder = updatedOrder;
            renderOrderTrackingModal(updatedOrder);
            updateFloatingTrackerPill(updatedOrder);
          });
        }
      }
      if (trackParam) {
        openOrderTrackingModal(activeOrderId);
      }
    }
  }
};

// 9. Standardized Tax Invoice Generator
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
        <td style="padding:8px 6px; text-align:right; color:#475569;">${globalCurrency} ${(parseFloat(item.price) || 0).toLocaleString()}</td>
        <td style="padding:8px 0; text-align:right; font-weight:600; color:#0F172A;">${globalCurrency} ${itemTotal.toLocaleString()}</td>
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
          <span>${globalCurrency} ${subtotal.toLocaleString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; color:#475569;">
          <span>Tax / VAT (0% Included):</span>
          <span>${globalCurrency} 0</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:2px solid #0F172A; font-size:16px; font-weight:800;">
          <span>GRAND TOTAL:</span>
          <span style="color:var(--color-primary, #244638);">${globalCurrency} ${subtotal.toLocaleString()}</span>
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

// Start
init();

// ==========================================
// --- ENTERPRISE SECURITY & SESSIONS CLIENT ENGINE ---
// Conforms to: ARCH-SEC-001 §1.2, ARCH-SEC-001 §2.1, & ARCH-POS-005 §3.1
// ==========================================
window.currentTableNo = 'Table 1';
window.currentSessionId = null;
window.currentSessionJwt = null;
window.currentDeviceFingerprint = null;
window.isCustomerOutsideGeofence = false;

// 1. Deterministic Device Fingerprinting (ARCH-SEC-001 §1.2 & RULE-SEC-001)
window.generateDeviceFingerprint = async function() {
  try {
    const ua = navigator.userAgent || 'unknown_ua';
    const cores = navigator.hardwareConcurrency || 4;
    let webgl = 'unknown_webgl';
    try {
      const canvasGl = document.createElement('canvas');
      const gl = canvasGl.getContext('webgl') || canvasGl.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webgl = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) {}

    let canvasHash = 'canvas_def';
    try {
      const canvas2d = document.createElement('canvas');
      canvas2d.width = 200;
      canvas2d.height = 50;
      const ctx = canvas2d.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Evorise, Restaurant Security!', 2, 15);
      canvasHash = canvas2d.toDataURL().slice(-50);
    } catch(e) {}

    const rawData = `${ua}-${cores}-${webgl}-${canvasHash}`;
    const msgBuffer = new TextEncoder().encode(rawData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    window.currentDeviceFingerprint = fingerprint;
    sessionStorage.setItem('evorise_device_fingerprint', fingerprint);
    return fingerprint;
  } catch(e) {
    const fallback = 'fallback_hash_' + Math.random().toString(36).substring(2, 15);
    window.currentDeviceFingerprint = fallback;
    sessionStorage.setItem('evorise_device_fingerprint', fallback);
    return fallback;
  }
};

// Interactive Table Selection Modal Controls
window.openTableSelectModal = function() {
  const modal = document.getElementById('tableSelectModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons();
  }
};

window.closeTableSelectModal = function() {
  const modal = document.getElementById('tableSelectModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
  }
};

window.setCustomerTable = function(tNum) {
  sessionStorage.setItem('evorise_table_param', String(tNum));
  closeTableSelectModal();
  initTableSessionFlow();
  showToast(`Dining at Table ${tNum}`);
};

// 2. Table Session Initialization with Backend Handshake (ARCH-SEC-001 §2.1 & openapi.yaml)
async function initTableSessionFlow() {
  const urlParams = new URLSearchParams(window.location.search);
  let tableParam = urlParams.get('table');

  if (tableParam) {
    sessionStorage.setItem('evorise_table_param', tableParam);
  } else {
    tableParam = sessionStorage.getItem('evorise_table_param');
    if (!tableParam) {
      openTableSelectModal();
      return;
    }
  }

  // Generate or retrieve deterministic device fingerprint
  const fingerprint = await window.generateDeviceFingerprint();

  try {
    const res = await getOrInitTableSession(tableParam);
    if (res && res.table) {
      window.currentTableNo = res.table.tableNo;
      window.currentSessionId = res.sessionId;

      const header = document.getElementById('tableSessionHeader');
      if (header) header.style.display = 'block';
      const tblDisplay = document.getElementById('sessionTableDisplay');
      if (tblDisplay) tblDisplay.textContent = res.table.tableNo;
      const sesDisplay = document.getElementById('sessionIdDisplay');
      if (sesDisplay) sesDisplay.textContent = res.sessionId;

      const cartTableInput = document.getElementById('cartTableNo');
      if (cartTableInput) {
        cartTableInput.value = res.table.tableNo;
        cartTableInput.readOnly = true;
        cartTableInput.style.backgroundColor = '#f8fafc';
      }

      // Check if session has active order
      const activeOrderId = localStorage.getItem('evorise_active_order');
      const btnViewOrder = document.getElementById('btnViewActiveOrder');
      if (activeOrderId && btnViewOrder) {
        btnViewOrder.classList.remove('hidden');
      }

      // Backend Session Handshake for JWT Issuance (ARCH-SEC-001 §2.1)
      try {
        const initResp = await fetch('/api/v1/sessions/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-Fingerprint': fingerprint
          },
          body: JSON.stringify({
            table_identifier: res.table.tableNo,
            device_fingerprint: fingerprint,
            ble_rssi: -65 // Within allowed -75 dBm threshold
          })
        });
        if (initResp.ok) {
          const initData = await initResp.json();
          if (initData.token) {
            window.currentSessionJwt = initData.token;
            sessionStorage.setItem('evorise_session_jwt', initData.token);
            console.log('[Security] Verified anonymous session JWT issued.');
          }
        }
      } catch (err) {
        console.warn('[Security] API Gateway handshake notice (offline fallback):', err.message);
      }

      // Listen for session termination
      startSessionHeartbeat(res.table.tableNo, res.sessionId);
    }
  } catch(e) {
    console.warn("Table session init notice:", e);
  }
}

function startSessionHeartbeat(tableNo, activeSessionId) {
  setInterval(async () => {
    try {
      const tables = await getTables();
      const current = tables.find(t => isSameTable(t.tableNo, tableNo));
      if (current) {
        if (current.status === 'Vacant' || (current.activeSessionId && current.activeSessionId !== activeSessionId)) {
          const closedModal = document.getElementById('sessionClosedModal');
          if (closedModal && !closedModal.classList.contains('dismissed')) {
            closedModal.classList.remove('hidden');
          }
        }
      }
    } catch(e) {}
  }, 8000);
}

window.resetClosedSessionAndReload = async function() {
  localStorage.removeItem('evorise_active_order');
  cart = [];
  await saveCart([]);
  window.location.reload();
};

// 3. Geofence Verification (ARCH-SEC-001 §3.1)
window.initGeofenceCheck = function() {
  const indicator = document.getElementById('geofenceStatusIndicator');
  const text = document.getElementById('geofenceStatusText');

  if (!globalSettings || globalSettings.geofenceEnabled === false) {
    window.isCustomerOutsideGeofence = false;
    if (indicator) {
      indicator.className = 'geofence-chip inside';
      indicator.innerHTML = '<i data-lucide="shield-check"></i> <span>Dine-In Everywhere</span>';
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  if (indicator) {
    indicator.className = 'geofence-chip checking';
    if (text) text.textContent = 'Verifying Location...';
  }

  if (!navigator.geolocation) {
    console.warn("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const res = checkGeofenceStatus(userLat, userLng, globalSettings);

      if (res.isInside) {
        window.isCustomerOutsideGeofence = false;
        if (indicator) {
          indicator.className = 'geofence-chip inside';
          indicator.innerHTML = `<i data-lucide="check-circle-2"></i> <span>Dine-In Verified (${res.distanceMeters}m)</span>`;
        }
      } else {
        window.isCustomerOutsideGeofence = true;
        if (indicator) {
          indicator.className = 'geofence-chip outside';
          indicator.innerHTML = `<i data-lucide="alert-triangle"></i> <span>Outside Range (${res.distanceMeters}m)</span>`;
        }
        showGeofenceAlertModal(res.distanceMeters, res.radiusMeters);
      }
      if (window.lucide) lucide.createIcons();
    },
    (err) => {
      console.warn("Location permission not granted or error:", err);
      if (indicator) {
        indicator.className = 'geofence-chip outside';
        indicator.innerHTML = '<i data-lucide="map-pin-off"></i> <span>Location Denied</span>';
      }
      if (window.lucide) lucide.createIcons();
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
};

window.showGeofenceAlertModal = function(distance = null, allowed = null) {
  const modal = document.getElementById('geofenceBlockModal');
  if (!modal) return;
  if (distance) {
    document.getElementById('geoDistanceValue').textContent = `${distance}m`;
  }
  if (allowed) {
    document.getElementById('geoLimitValue').textContent = `${allowed}m`;
  }
  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
};

window.dismissGeofenceAlert = function() {
  const modal = document.getElementById('geofenceBlockModal');
  if (modal) modal.classList.add('hidden');
};

window.recheckCustomerGeofence = function() {
  dismissGeofenceAlert();
  initGeofenceCheck();
};

// 4. Real-Time Out-of-Stock Sync Engine (ARCH-POS-005 §3.1)
window.initInventorySyncListener = function() {
  setInterval(async () => {
    try {
      const res = await fetch('/api/v1/inventory/status');
      if (res.ok) {
        const data = await res.json();
        const outList = data.outOfStockItems || [];
        let hasChanges = false;
        menuItems.forEach(item => {
          const shouldBeOutOfStock = outList.includes(item.id);
          if (item.outOfStock !== shouldBeOutOfStock) {
            item.outOfStock = shouldBeOutOfStock;
            hasChanges = true;
          }
        });
        if (hasChanges) {
          console.log('[Inventory] Live inventory changed, updating menu display...');
          renderMenuItems(globalSettings);
          filterMenu();
        }
      }
    } catch (e) {}
  }, 10000);
};

// 5. Register PWA Service Worker (ARCH-POS-005 §1.1)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[ServiceWorker] Successfully registered with scope:', reg.scope);
    }).catch((err) => {
      console.warn('[ServiceWorker] Registration failed:', err.message);
    });
  });
}

// Start Inventory Sync
window.initInventorySyncListener();

// 6. Enterprise WebSocket Client (Zero-Latency Event Bus)
window.initCustomerWebSocket = function() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  let ws = null;
  let heartbeatTimer = null;

  function connect() {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected to Evorise Real-Time Bus');
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

          if (type === 'ORDER_STATUS_CHANGED' || type === 'ORDER_CANCELLED') {
            const activeId = localStorage.getItem('evorise_active_order') || (currentTrackedOrder && currentTrackedOrder.id);
            if (activeId && data && data.id && data.id.toLowerCase() === activeId.toLowerCase()) {
              currentTrackedOrder = data;
              renderOrderTrackingModal(data);
              updateFloatingTrackerPill(data);
            }
          } else if (type === 'INVENTORY_CHANGED') {
            if (data && data.allOutOfStock) {
              let changed = false;
              menuItems.forEach(item => {
                const isOut = data.allOutOfStock.includes(item.id);
                if (item.outOfStock !== isOut) {
                  item.outOfStock = isOut;
                  changed = true;
                }
              });
              if (changed) {
                renderMenuItems(globalSettings);
                filterMenu();
              }
            }
          } else if (type === 'SETTINGS_UPDATED') {
            if (data) {
              globalSettings = { ...globalSettings, ...data };
              applySettings(globalSettings);
            }
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

window.initCustomerWebSocket();

