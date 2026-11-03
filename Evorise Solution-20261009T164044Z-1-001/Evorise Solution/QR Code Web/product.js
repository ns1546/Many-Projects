// Initialize Lucide icons
lucide.createIcons();

// --- State ---
let cart = {}; // from db.js
let product = null;
let allItems = [];
let globalCurrency = '৳';

// --- DOM Elements ---
const productGallery = document.getElementById('productGallery');
const productTitle = document.getElementById('productTitle');
const productDietary = document.getElementById('productDietary');
const productPrepTime = document.getElementById('productPrepTime');
const productDesc = document.getElementById('productDesc');
const productPrice = document.getElementById('productPrice');
const actionContainer = document.getElementById('actionContainer');

const floatingCart = document.getElementById('floatingCart');
const cartBadgeCount = document.getElementById('cartBadgeCount');
const cartTotalDisplay = document.getElementById('cartTotalDisplay');
const btnPlaceOrder = document.getElementById('btnPlaceOrder');
const galleryDots = document.getElementById('galleryDots');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');

// --- Initialization ---
async function init() {
  cart = await getCart();
  allItems = await getItems();
  
  const settings = await getSettings();
  if (settings.currencySymbol) globalCurrency = settings.currencySymbol;
  
  if (settings.primaryColor) {
    document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
  }
  if (settings.fontFamily) {
    document.documentElement.style.setProperty('--font-primary', settings.fontFamily);
    document.body.style.fontFamily = settings.fontFamily;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    window.location.href = 'index.html';
    return;
  }
  
  product = allItems.find(i => i.id === productId);
  if (!product) {
    window.location.href = 'index.html';
    return;
  }
  
  renderProduct();
  updateCartUI();
}

function renderProduct() {
  // Render Gallery
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  productGallery.innerHTML = images.map(img => `<img src="${img}" class="gallery-image" alt="${product.title}" loading="lazy" decoding="async">`).join('');
  
  if (images.length > 1) {
    galleryDots.innerHTML = images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('');
    
    galleryPrev.classList.remove('hidden');
    galleryNext.classList.remove('hidden');

    galleryPrev.addEventListener('click', () => {
      productGallery.scrollBy({ left: -productGallery.clientWidth, behavior: 'smooth' });
    });

    galleryNext.addEventListener('click', () => {
      productGallery.scrollBy({ left: productGallery.clientWidth, behavior: 'smooth' });
    });

    // Add Scroll Listener for Dots
    productGallery.addEventListener('scroll', () => {
      const scrollLeft = productGallery.scrollLeft;
      const width = productGallery.clientWidth;
      const activeIndex = Math.round(scrollLeft / width);
      
      const dots = galleryDots.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
      
      // Toggle arrows
      galleryPrev.style.opacity = activeIndex === 0 ? '0.5' : '1';
      galleryNext.style.opacity = activeIndex === images.length - 1 ? '0.5' : '1';
    });
    
    // Initial arrow state
    galleryPrev.style.opacity = '0.5';

  } else {
    galleryDots.innerHTML = '';
    galleryPrev.classList.add('hidden');
    galleryNext.classList.add('hidden');
  }
  
  // Text Content
  productTitle.textContent = product.title;
  productDesc.textContent = product.desc;
  productPrice.textContent = `${globalCurrency} ${product.price}`;
  productPrepTime.textContent = product.prepTime || '15 mins';
  
  // Dietary
  productDietary.innerHTML = product.dietary === 'veg' 
    ? `<div class="dietary-tag veg"><div class="veg-dot"></div></div>`
    : `<div class="dietary-tag non-veg"><div class="non-veg-triangle"></div></div>`;
    
  // Actions
  actionContainer.innerHTML = `
    <button class="btn-add" id="btnAdd"><i data-lucide="plus"></i></button>
    <div class="quantity-stepper hidden" id="stepper">
      <button class="step-btn minus" id="btnMinus"><i data-lucide="minus"></i></button>
      <span class="qty-val" id="qtyVal">0</span>
      <button class="step-btn plus" id="btnPlus"><i data-lucide="plus"></i></button>
    </div>
  `;
  
  // Action Listeners
  const btnAdd = document.getElementById('btnAdd');
  const btnMinus = document.getElementById('btnMinus');
  const btnPlus = document.getElementById('btnPlus');
  
  btnAdd.addEventListener('click', () => {
    cart[product.id] = 1;
    updateCartUI();
  });
  
  btnPlus.addEventListener('click', () => {
    cart[product.id] = (cart[product.id] || 0) + 1;
    updateCartUI();
  });
  
  btnMinus.addEventListener('click', () => {
    if (cart[product.id] > 0) {
      cart[product.id] -= 1;
      if (cart[product.id] === 0) delete cart[product.id];
      updateCartUI();
    }
  });

  lucide.createIcons();
}

// Update Cart globally
async function updateCartUI() {
  await saveCart(cart);

  let totalItems = 0;
  let totalPrice = 0;

  for (const [id, qty] of Object.entries(cart)) {
    if (qty > 0) {
      totalItems += qty;
      const itemData = allItems.find(i => i.id === id);
      if (itemData) {
        totalPrice += (parseInt(itemData.price) * qty);
      }
    }
  }

  // Update Page Action State
  const qty = cart[product.id] || 0;
  const btnAdd = document.getElementById('btnAdd');
  const stepper = document.getElementById('stepper');
  const qtyVal = document.getElementById('qtyVal');
  
  if (btnAdd && stepper && qtyVal) {
    if (qty > 0) {
      btnAdd.classList.add('hidden');
      stepper.classList.remove('hidden');
      qtyVal.textContent = qty;
    } else {
      btnAdd.classList.remove('hidden');
      stepper.classList.add('hidden');
    }
  }

  // Update Floating Cart
  if (totalItems > 0) {
    floatingCart.style.display = 'block';
    cartBadgeCount.textContent = totalItems;
    cartTotalDisplay.textContent = `${globalCurrency} ${totalPrice.toLocaleString('en-IN')}`;
    floatingCart.dataset.total = totalPrice;
  } else {
    floatingCart.style.display = 'none';
  }
}

// Place Order
if (btnPlaceOrder) {
  btnPlaceOrder.addEventListener('click', () => {
    const orderItems = [];
    for (const [id, qty] of Object.entries(cart)) {
      if (qty > 0) {
        const item = allItems.find(i => i.id === id);
        if (item) {
          orderItems.push({ id, title: item.title, price: item.price, quantity: qty, image: item.image });
        }
      }
    }
    
    if (orderItems.length > 0) {
      btnPlaceOrder.disabled = true;
      btnPlaceOrder.textContent = 'Processing...';
      placeOrder({
        items: orderItems,
        total: floatingCart.dataset.total,
        tableNo: 'Table 1'
      }).then((order) => {
        // Reset Cart
        cart = {};
        updateCartUI();
        localStorage.setItem('evorise_active_order', order.id);
        alert('Order Placed Successfully! Redirecting to live tracking.');
        window.location.href = 'index.html?track=' + encodeURIComponent(order.id);
      }).catch(err => {
        console.error(err);
        btnPlaceOrder.disabled = false;
        btnPlaceOrder.textContent = 'Checkout';
        alert('Failed to place order.');
      });
    }
  });
}

init();
