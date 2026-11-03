// Initialize Lucide icons
lucide.createIcons();

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
    document.getElementById(`view-${view}`).classList.remove('hidden');
    
    // Update Title
    pageTitle.textContent = nav.textContent.trim();
  });
});

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
  if (settings.restaurantName) settingRestaurantName.value = settings.restaurantName;
  if (settings.logoUrl) settingLogoUrl.value = settings.logoUrl;
  if (settings.faviconUrl) settingFaviconUrl.value = settings.faviconUrl;
  if (settings.primaryColor) settingPrimaryColor.value = settings.primaryColor;
  if (settings.secondaryColor) settingSecondaryColor.value = settings.secondaryColor;
  if (settings.buttonColor) settingButtonColor.value = settings.buttonColor;
  if (settings.textColor) settingTextColor.value = settings.textColor;
  if (settings.themePreset) settingThemePreset.value = settings.themePreset;
  if (settings.fontFamily) settingFontFamily.value = settings.fontFamily;
  if (settings.currencySymbol) settingCurrencySymbol.value = settings.currencySymbol;
  if (settings.taxRate) settingTaxRate.value = settings.taxRate;
  if (settings.customBadges) document.getElementById('settingCustomBadges').value = settings.customBadges;
  
  if (settings.websiteBgImage) settingWebsiteBg.value = settings.websiteBgImage;
  if (settings.heroImage) settingHeroImage.value = settings.heroImage;
  if (settings.heroTitle) settingHeroTitle.value = settings.heroTitle;
  if (settings.heroSubtitle) settingHeroSubtitle.value = settings.heroSubtitle;
  if (settings.heroOrderPhone) settingHeroPhone.value = settings.heroOrderPhone;
  
  if (settings.footerImage) settingFooterImage.value = settings.footerImage;
  if (settings.footerAddress) settingFooterAddress.value = settings.footerAddress;
  if (settings.footerPhone) settingFooterPhone.value = settings.footerPhone;
  if (settings.footerEmail) settingFooterEmail.value = settings.footerEmail;
  if (settings.footerCopyright) settingFooterCopyright.value = settings.footerCopyright;
  
  if (settings.socialFb) settingSocialFb.value = settings.socialFb;
  if (settings.socialTwitter) settingSocialTwitter.value = settings.socialTwitter;
  if (settings.socialInsta) settingSocialInsta.value = settings.socialInsta;
  if (settings.socialLinkedin) settingSocialLinkedin.value = settings.socialLinkedin;

  // Dynamic Categories
  const enableSubCat = settings.enableSubCategories || false;
  document.getElementById('settingEnableSubCategories').checked = enableSubCat;
  
  const enableOffers = settings.enableOffers !== false;
  document.getElementById('settingEnableOffers').checked = enableOffers;
  
  const enableDemoContent = settings.enableDemoContent === true;
  document.getElementById('settingEnableDemoContent').checked = enableDemoContent;
  
  // Layout Builder
  const defaultLayout = ['hero', 'banners', 'offers', 'menu'];
  let layoutOrder = settings.layoutOrder;
  if (!layoutOrder || !Array.isArray(layoutOrder) || layoutOrder.length !== 4) {
    layoutOrder = defaultLayout;
  }
  document.getElementById('settingLayoutOrder').value = JSON.stringify(layoutOrder);
  renderLayoutBuilder(layoutOrder);

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
  if (typeof subscribeOffers === 'function') {
    subscribeOffers(updatedOffers => renderOffers(updatedOffers));
  }
  if (typeof subscribeCategories === 'function') {
    subscribeCategories(updatedCats => {
      window.allCategories = updatedCats;
      renderCategories(updatedCats);
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

function renderOrdersTable(orders) {
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

window.printOrderInvoice = async function(orderId) {
  let order = (window.allOrders || []).find(o => String(o.id) === String(orderId));
  if (!order && typeof getOrderById === 'function') {
    order = await getOrderById(orderId);
  }
  if (!order) {
    alert("Order not found.");
    return;
  }

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

    currentSettings.restaurantName = settingRestaurantName.value;
    currentSettings.logoUrl = await uploadInput('settingLogo', settingLogoUrl.value);
    currentSettings.faviconUrl = await uploadInput('settingFavicon', settingFaviconUrl.value);
    currentSettings.websiteBgImage = await uploadInput('settingWebsiteBg', settingWebsiteBg.value);
    currentSettings.heroImage = await uploadInput('settingHeroImage', settingHeroImage.value);
    currentSettings.footerImage = await uploadInput('settingFooterImage', settingFooterImage.value);

    currentSettings.primaryColor = settingPrimaryColor.value;
    currentSettings.secondaryColor = settingSecondaryColor.value;
    currentSettings.buttonColor = settingButtonColor.value;
    currentSettings.textColor = settingTextColor.value;
    currentSettings.themePreset = settingThemePreset.value;
    currentSettings.fontFamily = settingFontFamily.value;
    currentSettings.currencySymbol = settingCurrencySymbol.value;
    currentSettings.taxRate = parseFloat(settingTaxRate.value) || 0;
    
    currentSettings.enableSubCategories = document.getElementById('settingEnableSubCategories').checked;
    currentSettings.enableOffers = document.getElementById('settingEnableOffers').checked;
    currentSettings.enableDemoContent = document.getElementById('settingEnableDemoContent').checked;
    try {
      currentSettings.layoutOrder = JSON.parse(document.getElementById('settingLayoutOrder').value);
    } catch(e) {}
    currentSettings.customBadges = document.getElementById('settingCustomBadges').value;
    
    currentSettings.heroTitle = settingHeroTitle.value;
    currentSettings.heroSubtitle = settingHeroSubtitle.value;
    currentSettings.heroOrderPhone = settingHeroPhone.value;
    
    currentSettings.footerAddress = settingFooterAddress.value;
    currentSettings.footerPhone = settingFooterPhone.value;
    currentSettings.footerEmail = settingFooterEmail.value;
    currentSettings.footerCopyright = settingFooterCopyright.value;
    
    currentSettings.socialFb = settingSocialFb.value;
    currentSettings.socialTwitter = settingSocialTwitter.value;
    currentSettings.socialInsta = settingSocialInsta.value;
    currentSettings.socialLinkedin = settingSocialLinkedin.value;
    
    await saveSettings(currentSettings);
    
    // Update local values with uploaded ones
    settingLogoUrl.value = currentSettings.logoUrl;
    settingFaviconUrl.value = currentSettings.faviconUrl;
    settingWebsiteBg.value = currentSettings.websiteBgImage;
    settingHeroImage.value = currentSettings.heroImage;
    settingFooterImage.value = currentSettings.footerImage;
    
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

