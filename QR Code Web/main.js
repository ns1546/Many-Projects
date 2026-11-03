// Initialize Lucide icons
lucide.createIcons();

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
      window.location.href = 'detail.html?type=offer&id=' + encodeURIComponent(offer.id);
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
      window.location.href = 'detail.html?type=banner&id=' + encodeURIComponent(banner.id);
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

function attachCardEvents() {
  const cards = document.querySelectorAll('.menu-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const id = card.getAttribute('data-id');
      
      // Check if quick add was clicked
      if (e.target.closest('.action-container')) {
          e.stopPropagation();
          quickAddToCart(id);
          return;
      }
      
      // Navigate to separate item details page
      window.location.href = 'detail.html?type=item&id=' + encodeURIComponent(id);
    });
  });
}

function quickAddToCart(itemId) {
    const item = menuItems.find(i => String(i.id) === String(itemId));
    if (!item || item.outOfStock) return;
    
    // If it has variants or addons, open the item details page
    if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.trim() !== '')) {
        window.location.href = 'detail.html?type=item&id=' + encodeURIComponent(itemId);
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
            addons: []
        });
    }
    updateCartUI();
    showToast(`Added ${item.title} to cart`);
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

window.removeCartItem = function(index) {
  const item = cart[index];
  cart.splice(index, 1);
  updateCartUI();
  if (item) showToast(`Removed ${item.title} from cart`);
};

window.clearEntireCart = function() {
  if (cart.length === 0) return;
  if (confirm("Are you sure you want to clear all items from your cart?")) {
    cart = [];
    updateCartUI();
    showToast("Cart cleared");
  }
};

window.updateCartItemQty = function(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    window.removeCartItem(index);
    return;
  }
  updateCartUI();
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

let currentModalItem = null;
let currentModalQty = 1;

window.openItemDetailsModal = function(id) {
  const item = menuItems.find(i => i.id === id);
  if (!item) return;
  if (item.outOfStock) {
    alert("This item is currently out of stock.");
    return;
  }
  
  currentModalItem = item;
  currentModalQty = 1;
  document.getElementById('itemDetailsQty').textContent = currentModalQty;
  
  document.getElementById('itemDetailsTitle').textContent = item.title;
  
  const badgesContainer = document.getElementById('itemDetailsBadges');
  badgesContainer.innerHTML = '';
  if (item.badges && item.badges.length > 0) {
    badgesContainer.innerHTML = item.badges.map(b => `<span class="item-badge badge-${b.toLowerCase().replace(/[^a-z]/g, '')}">${b}</span>`).join('');
  }
  
  let descHtml = item.desc;
  if (item.portion) {
    descHtml += `<br><br><span style="font-weight:600; color:var(--admin-primary);"><i data-lucide="scale" style="width:14px; height:14px; display:inline-block; vertical-align:middle;"></i> Portion: ${item.portion}</span>`;
  }
  document.getElementById('itemDetailsDesc').innerHTML = descHtml;
  
  // Gallery logic
  const slider = document.getElementById('immersiveGallerySlider');
  const dotsContainer = document.getElementById('immersiveGalleryDots');
  const controls = document.getElementById('immersiveGalleryControls');
  slider.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  let images = [];
  if (item.image) images.push(item.image);
  if (item.additionalImages && item.additionalImages.length > 0) {
    images = images.concat(item.additionalImages);
  }
  
  if (images.length === 0) {
    // fallback if no image
    slider.innerHTML = `<div class="gallery-slide" style="background:#e5e7eb; display:flex; align-items:center; justify-content:center; color:#9ca3af;">No Image</div>`;
    controls.style.display = 'none';
  } else {
    images.forEach((imgSrc, idx) => {
      slider.innerHTML += `<img src="${imgSrc}" class="gallery-slide" alt="Gallery Image ${idx+1}">`;
      if (images.length > 1) {
        dotsContainer.innerHTML += `<div class="gallery-dot ${idx === 0 ? 'active' : ''}" onclick="goToGalleryImage(${idx})"></div>`;
      }
    });
    if (images.length > 1) {
      controls.style.display = 'flex';
    } else {
      controls.style.display = 'none';
    }
  }
  window.currentGalleryIndex = 0;
  updateGalleryTransform();
  
  // Variants
  const variantsContainer = document.getElementById('itemDetailsVariantsContainer');
  const variantsList = document.getElementById('itemDetailsVariantsList');
  variantsList.innerHTML = '';
  if (item.variants && item.variants.trim() !== '') {
    const variants = item.variants.split(',').map(v => v.trim());
    variants.forEach((v, idx) => {
      const parts = v.split(':');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const price = parseFloat(parts[1].trim());
        variantsList.innerHTML += `
          <label style="display:flex; justify-content:space-between; padding:12px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; cursor:pointer;">
            <div>
              <input type="radio" name="modalVariant" value="${name}" data-price="${price}" ${idx === 0 ? 'checked' : ''} onchange="updateModalPrice()">
              <span style="margin-left:8px; font-weight:500;">${name}</span>
            </div>
            <span style="font-weight:600; color:var(--color-primary);">${globalCurrency} ${price}</span>
          </label>
        `;
      }
    });
    variantsContainer.style.display = 'block';
  } else {
    variantsContainer.style.display = 'none';
  }
  
  // Addons
  const addonsContainer = document.getElementById('itemDetailsAddonsContainer');
  const addonsList = document.getElementById('itemDetailsAddonsList');
  addonsList.innerHTML = '';
  if (item.addons && item.addons.trim() !== '') {
    const addons = item.addons.split(',').map(a => a.trim());
    addons.forEach(a => {
      addonsList.innerHTML += `
        <label style="display:flex; align-items:center; padding:12px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; cursor:pointer;">
          <input type="checkbox" name="modalAddon" value="${a}">
          <span style="margin-left:8px; font-weight:500;">${a}</span>
        </label>
      `;
    });
    addonsContainer.style.display = 'block';
  } else {
    addonsContainer.style.display = 'none';
  }
  
  updateModalPrice();
  lucide.createIcons();
  document.getElementById('itemDetailsModal').classList.add('active');
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';
};

window.updateGalleryTransform = function() {
  const slider = document.getElementById('immersiveGallerySlider');
  const dots = document.querySelectorAll('.gallery-dot');
  slider.style.transform = `translateX(-${currentGalleryIndex * 100}%)`;
  dots.forEach((dot, idx) => {
    if(idx === currentGalleryIndex) dot.classList.add('active');
    else dot.classList.remove('active');
  });
};

window.prevGalleryImage = function() {
  if (!currentModalItem) return;
  let maxIdx = 0;
  if(currentModalItem.image) maxIdx++;
  if(currentModalItem.additionalImages) maxIdx += currentModalItem.additionalImages.length;
  if (maxIdx <= 1) return;
  
  currentGalleryIndex = (currentGalleryIndex - 1 + maxIdx) % maxIdx;
  updateGalleryTransform();
};

window.nextGalleryImage = function() {
  if (!currentModalItem) return;
  let maxIdx = 0;
  if(currentModalItem.image) maxIdx++;
  if(currentModalItem.additionalImages) maxIdx += currentModalItem.additionalImages.length;
  if (maxIdx <= 1) return;
  
  currentGalleryIndex = (currentGalleryIndex + 1) % maxIdx;
  updateGalleryTransform();
};

window.goToGalleryImage = function(idx) {
  currentGalleryIndex = idx;
  updateGalleryTransform();
};

window.closeItemDetailsModal = function() {
  document.getElementById('itemDetailsModal').classList.remove('active');
  document.body.style.overflow = '';
};

window.updateDetailsQty = function(delta) {
  currentModalQty += delta;
  if (currentModalQty < 1) currentModalQty = 1;
  document.getElementById('itemDetailsQty').textContent = currentModalQty;
  updateModalPrice();
};

window.updateModalPrice = function() {
  if (!currentModalItem) return;
  let basePrice = parseFloat(currentModalItem.price);
  
  const selectedVariant = document.querySelector('input[name="modalVariant"]:checked');
  if (selectedVariant) {
    basePrice = parseFloat(selectedVariant.getAttribute('data-price'));
  }
  
  const total = basePrice * currentModalQty;
  document.getElementById('itemDetailsPriceBtn').textContent = `${globalCurrency} ${total.toLocaleString('en-IN')}`;
};

document.getElementById('btnAddToCartModal').addEventListener('click', () => {
  if (!currentModalItem) return;
  
  let basePrice = parseFloat(currentModalItem.price);
  let variantName = null;
  const selectedVariant = document.querySelector('input[name="modalVariant"]:checked');
  if (selectedVariant) {
    variantName = selectedVariant.value;
    basePrice = parseFloat(selectedVariant.getAttribute('data-price'));
  }
  
  const selectedAddons = Array.from(document.querySelectorAll('input[name="modalAddon"]:checked')).map(cb => cb.value);
  
  const cartItemId = `${currentModalItem.id}-${variantName || 'base'}-${selectedAddons.join('-')}`;
  
  const cartItem = {
    cartItemId,
    id: currentModalItem.id,
    title: currentModalItem.title,
    price: basePrice,
    quantity: currentModalQty,
    variant: variantName,
    addons: selectedAddons
  };
  
  const existingIndex = cart.findIndex(c => c.cartItemId === cartItemId);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += currentModalQty;
  } else {
    cart.push(cartItem);
  }
  
  updateCartUI();
  closeItemDetailsModal();
});

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

// Place Order Handler
const btnConfirmOrder = document.getElementById('btnConfirmOrder');
if (btnConfirmOrder) {
  btnConfirmOrder.addEventListener('click', async () => {
    if (cart.length === 0) return;
    
    const originalText = btnConfirmOrder.innerHTML;
    btnConfirmOrder.innerHTML = 'Placing Order... <i data-lucide="loader-2" class="spin"></i>';
    btnConfirmOrder.disabled = true;
    if (window.lucide) lucide.createIcons();
    
    let totalPrice = 0;
    cart.forEach(c => totalPrice += (parseFloat(c.price) || 0) * (parseInt(c.quantity) || 1));
    
    const tableInput = document.getElementById('cartTableNo');
    const tableNo = (tableInput && tableInput.value.trim()) ? tableInput.value.trim() : 'Table 1';
    
    const notesInput = document.getElementById('cartOrderNotes');
    const notes = notesInput ? notesInput.value.trim() : '';
    
    try {
      const order = await placeOrder({
        items: [...cart],
        total: totalPrice,
        tableNo: tableNo,
        notes: notes
      });
      
      // Save active order ID for live tracking
      localStorage.setItem('evorise_active_order', order.id);
      currentTrackedOrder = order;
      
      // Reset Cart
      cart = [];
      await saveCart(cart);
      updateCartUI();
      closeCartModal();
      
      btnConfirmOrder.innerHTML = originalText;
      btnConfirmOrder.disabled = false;
      
      // Open Live Tracking Modal Immediately
      openOrderTrackingModal(order.id);
      showToast('🎉 Order Placed Successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to place order. Please try again.');
      btnConfirmOrder.innerHTML = originalText;
      btnConfirmOrder.disabled = false;
    }
  });
}

// 1. Open Order Tracking Modal
window.openOrderTrackingModal = async function(orderId) {
  if (!orderId) {
    orderId = localStorage.getItem('evorise_active_order');
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

  // Cancel Button state
  const btnCancel = document.getElementById('btnTrackCancelOrder');
  if (btnCancel) {
    if (order.status === 'Pending') {
      btnCancel.style.display = 'inline-block';
      btnCancel.disabled = false;
      btnCancel.textContent = 'Cancel Order';
    } else if (order.status === 'Cancelled') {
      btnCancel.style.display = 'inline-block';
      btnCancel.disabled = true;
      btnCancel.textContent = 'Order Cancelled';
    } else {
      btnCancel.style.display = 'none';
    }
  }

  if (window.lucide) lucide.createIcons();
};

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
  if (status === 'Cooking') activeIdx = 1;
  else if (status === 'Ready') activeIdx = 2;
  else if (status === 'Completed') activeIdx = 3;
  else if (status === 'Cancelled') activeIdx = -1;

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
      if (badge) badge.textContent = 'Pending';
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
  if (currentTrackedOrder.status !== 'Pending') {
    alert("This order cannot be cancelled because the kitchen has already started preparing it.");
    return;
  }

  if (confirm(`Are you sure you want to cancel order #${currentTrackedOrder.id}?`)) {
    await updateOrderStatus(currentTrackedOrder.id, 'Cancelled');
    currentTrackedOrder.status = 'Cancelled';
    renderOrderTrackingModal(currentTrackedOrder);
    updateFloatingTrackerPill(currentTrackedOrder);
    showToast("Order has been cancelled.");
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
