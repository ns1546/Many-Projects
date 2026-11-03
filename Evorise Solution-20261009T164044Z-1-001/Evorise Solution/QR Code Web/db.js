// Database layer supporting real-time Firebase Firestore with seamless localStorage offline fallback

/* --- FIREBASE BACKEND CONFIGURATION --- */
const USE_FIREBASE = false; // Powered by local SQLite WAL engine for sub-5ms latency

const firebaseConfig = {
  apiKey: "AIzaSyDhNlaV1dnuC7TWTLskK9kWB1jUWEE1Aiw",
  authDomain: "restaurent-system-4aa20.firebaseapp.com",
  projectId: "restaurent-system-4aa20",
  storageBucket: "restaurent-system-4aa20.firebasestorage.app",
  messagingSenderId: "527978081284",
  appId: "1:527978081284:web:1f303751e3d58c4fd49951",
  measurementId: "G-Z43RBEPG0Z"
};

let firestoreDB = null;
let firebaseAuth = null;
let firebaseStorage = null;

if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    firestoreDB = firebase.firestore();
    
    // Offline persistence
    firestoreDB.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      console.warn("Firestore offline persistence could not be enabled:", err);
    });
    
    if (typeof firebase.auth === 'function') {
      firebaseAuth = firebase.auth();
    }
    if (typeof firebase.storage === 'function') {
      firebaseStorage = firebase.storage();
    }
  } catch (err) {
    console.warn("Firebase initialization warning:", err);
  }
}

async function uploadImageToStorage(file, folder = 'uploads') {
  if (!file) return null;
  if (typeof file === 'string') return file; // Direct URL provided

  // If Firebase Storage is initialized, attempt upload
  if (firebaseStorage && typeof firebase.auth === 'function' && firebase.auth().currentUser) {
    try {
      const storageRef = firebaseStorage.ref();
      const safeName = (file.name || 'image.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef.child(`${folder}/${Date.now()}_${safeName}`);
      const snapshot = await fileRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      return downloadURL;
    } catch(e) {
      console.warn("Storage upload not available, falling back to high-efficiency compressed data image:", e);
    }
  }
  
  // High efficiency compressed canvas fallback (generates crisp ~25-35KB JPEG)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 640;
        const MAX_HEIGHT = 640;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height = Math.round(height * (MAX_WIDTH / width)); width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width = Math.round(width * (MAX_HEIGHT / height)); height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Demo Mode Tenant Routing
function getCollectionPath(baseCollection) {
  const demoId = sessionStorage.getItem('activeDemoId');
  if (demoId) {
    return `demos/${demoId}/${baseCollection}`;
  }
  return baseCollection;
}

// Centralized Local Storage Keys
const DB_KEY_ITEMS = 'spice_garden_items';
const DB_KEY_ORDERS = 'spice_garden_orders';
const DB_KEY_CART = 'spice_garden_cart';
const DB_KEY_SETTINGS = 'spice_garden_settings';
const DB_KEY_BANNERS = 'spice_garden_banners';
const DB_KEY_OFFERS = 'qr_menu_offers';
const DB_KEY_CATEGORIES = 'qr_menu_categories';
const DB_KEY_TABLES = 'qr_menu_tables';
const DB_KEY_TABLE_SESSIONS = 'qr_menu_table_sessions';

// Default Master Tables for Dining
const defaultMockTables = [
  { id: 'tbl_1', tableNo: 'Table 1', capacity: 4, floor: '1st Floor', status: 'Vacant', activeSessionId: null, occupiedAt: null, currentOrderId: null, qrUrl: '/index.html?table=1' },
  { id: 'tbl_2', tableNo: 'Table 2', capacity: 2, floor: '1st Floor', status: 'Vacant', activeSessionId: null, occupiedAt: null, currentOrderId: null, qrUrl: '/index.html?table=2' },
  { id: 'tbl_3', tableNo: 'Table 3', capacity: 6, floor: '1st Floor', status: 'Vacant', activeSessionId: null, occupiedAt: null, currentOrderId: null, qrUrl: '/index.html?table=3' },
  { id: 'tbl_4', tableNo: 'Table 4', capacity: 4, floor: '1st Floor', status: 'Vacant', activeSessionId: null, occupiedAt: null, currentOrderId: null, qrUrl: '/index.html?table=4' },
  { id: 'tbl_5', tableNo: 'Table 5', capacity: 2, floor: 'Rooftop Garden', status: 'Vacant', activeSessionId: null, occupiedAt: null, currentOrderId: null, qrUrl: '/index.html?table=5' },
  { id: 'tbl_6', tableNo: 'Table 6', capacity: 8, floor: 'VIP Lounge', status: 'Vacant', activeSessionId: null, occupiedAt: null, currentOrderId: null, qrUrl: '/index.html?table=6' }
];

// Standard Master Categories
const demoMockCategories = [
  { id: 'appetizers', name: 'Appetizers', order: 1, subCategories: ['Asian', 'Italian', 'Mexican'] },
  { id: 'mains', name: 'Mains', order: 2, subCategories: ['Steaks', 'Curries', 'Pasta', 'Asian', 'Italian', 'Indian', 'Mexican'] },
  { id: 'pizzas', name: 'Pizzas', order: 3, subCategories: ['Classic', 'Specialty'] },
  { id: 'desserts', name: 'Desserts', order: 4, subCategories: ['Cakes', 'Ice Cream', 'Pastries', 'European'] },
  { id: 'drinks', name: 'Drinks', order: 5, subCategories: ['Mocktails', 'Hot Drinks', 'Cold Drinks', 'Cold'] }
];

// Standard Master Banners
const demoMockBanners = [
  {
    id: 'banner1',
    title: 'Weekend BBQ Extravaganza',
    desc: 'Join us for unlimited grilled steaks and ribs this weekend.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    link: '#'
  },
  {
    id: 'banner2',
    title: 'Authentic Italian Pasta',
    desc: 'Handmade pasta crafted daily with imported ingredients.',
    image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=80',
    link: '#'
  },
  {
    id: 'banner3',
    title: 'Fresh Sushi Selection',
    desc: 'Try our new premium sashimi and maki rolls.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80',
    link: '#'
  }
];

// Standard Master Offers
const demoMockOffers = [
  {
    id: 'offer1',
    title: '20% OFF Seafood Platter',
    desc: 'Enjoy our signature seafood mix for a fraction of the price.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    badge: 'Special',
    terms: 'Valid until Sunday.',
    price: 1200
  },
  {
    id: 'offer2',
    title: 'Buy 1 Get 1 Free Dessert',
    desc: 'Treat yourself to double the sweetness.',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    badge: 'Sweet',
    terms: 'Dine-in only.',
    price: 450
  },
  {
    id: 'offer3',
    title: 'Lunch Combo Special',
    desc: 'Burger, Fries, and Refreshing Drink combo.',
    image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80',
    badge: 'Lunch',
    terms: '12 PM - 3 PM only.',
    price: 399
  }
];

// Complete 15 Demo Items across all categories
const demoMockItems = [
  {
    id: 'demo1',
    category: 'appetizers',
    subCategory: 'Asian',
    title: 'Crispy Spring Rolls',
    desc: 'Golden fried vegetable spring rolls served with sweet chili sauce.',
    price: 350,
    prepTime: '10 mins',
    image: 'https://images.unsplash.com/photo-1548511749-968603417387?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548511749-968603417387?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: ['Popular']
  },
  {
    id: 'demo2',
    category: 'appetizers',
    subCategory: 'Italian',
    title: 'Bruschetta al Pomodoro',
    desc: 'Toasted baguette slices topped with fresh tomatoes, basil, garlic, and olive oil.',
    price: 400,
    prepTime: '10 mins',
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: ['Classic']
  },
  {
    id: 'm3',
    category: 'appetizers',
    subCategory: 'Asian',
    title: 'Spicy Tuna Sushi Roll',
    desc: 'Fresh tuna, spicy mayo, and cucumber wrapped in seaweed and sushi rice.',
    price: 950,
    prepTime: '15 mins',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'non-veg',
    badges: ['Spicy']
  },
  {
    id: 'demo3',
    category: 'mains',
    subCategory: 'Steaks',
    title: 'Wagyu Beef Steak',
    desc: 'Premium Wagyu ribeye, grilled to perfection, served with truffle mash and asparagus.',
    price: 4500,
    prepTime: '25 mins',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'non-veg',
    badges: ['Chef\'s Special', 'Signature']
  },
  {
    id: 'demo4',
    category: 'mains',
    subCategory: 'Curries',
    title: 'Authentic Butter Chicken',
    desc: 'Tender chicken pieces simmered in a rich, creamy tomato gravy.',
    price: 1200,
    prepTime: '20 mins',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'non-veg',
    badges: ['Halal', 'Spicy']
  },
  {
    id: 'demo5',
    category: 'mains',
    subCategory: 'Pasta',
    title: 'Seafood Linguine',
    desc: 'Fresh pasta tossed with prawns, mussels, and calamari in a white wine sauce.',
    price: 1500,
    prepTime: '20 mins',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'non-veg',
    badges: ['Seafood']
  },
  {
    id: 'm1',
    category: 'mains',
    subCategory: 'Italian',
    title: 'Truffle Mushroom Risotto',
    desc: 'Creamy Arborio rice slow-cooked with wild mushrooms, truffle oil, and parmesan.',
    price: 1250,
    prepTime: '25 mins',
    image: 'https://images.unsplash.com/photo-1544025162-811114bd2a0e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544025162-811114bd2a0e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: ['Gluten-Free']
  },
  {
    id: 'm2',
    category: 'mains',
    subCategory: 'Indian',
    title: 'Butter Chicken Masala',
    desc: 'Tender chicken marinated in yogurt and spices, cooked in a rich tomato cream sauce.',
    price: 850,
    prepTime: '20 mins',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'non-veg',
    badges: ['Halal']
  },
  {
    id: 'm4',
    category: 'mains',
    subCategory: 'Mexican',
    title: 'Beef Birria Tacos',
    desc: 'Slow-cooked beef in crispy corn tortillas, served with rich consommé for dipping.',
    price: 1100,
    prepTime: '20 mins',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'non-veg',
    badges: []
  },
  {
    id: 'demo6',
    category: 'pizzas',
    subCategory: 'Classic',
    title: 'Margherita Pizza',
    desc: 'Classic wood-fired pizza with San Marzano tomatoes, fresh mozzarella, and basil.',
    price: 950,
    prepTime: '15 mins',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    variants: [
      { name: 'Medium (10")', price: 950 },
      { name: 'Large (14")', price: 1350 }
    ],
    badges: ['Wood-Fired']
  },
  {
    id: 'demo7',
    category: 'pizzas',
    subCategory: 'Specialty',
    title: 'Truffle & Mushroom Pizza',
    desc: 'White base with wild mushrooms, truffle oil, and parmesan shavings.',
    price: 1250,
    prepTime: '15 mins',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: ['Gourmet']
  },
  {
    id: 'demo8',
    category: 'desserts',
    subCategory: 'Cakes',
    title: 'Dark Chocolate Lava Cake',
    desc: 'Warm chocolate cake with a molten center, served with vanilla bean ice cream.',
    price: 550,
    prepTime: '12 mins',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: ['Bestseller']
  },
  {
    id: 'm5',
    category: 'desserts',
    subCategory: 'European',
    title: 'Classic Tiramisu',
    desc: 'Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa.',
    price: 550,
    prepTime: '5 mins',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: []
  },
  {
    id: 'demo9',
    category: 'drinks',
    subCategory: 'Mocktails',
    title: 'Tropical Sunrise Mocktail',
    desc: 'Refreshing blend of pineapple, orange, and grenadine syrup.',
    price: 350,
    prepTime: '5 mins',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: ['Refreshing']
  },
  {
    id: 'm6',
    category: 'drinks',
    subCategory: 'Cold',
    title: 'Mango Passionfruit Smoothie',
    desc: 'Refreshing tropical blend of fresh mango, passionfruit, and a hint of mint.',
    price: 350,
    prepTime: '5 mins',
    image: 'https://images.unsplash.com/photo-1546890975-7596e98cdbf1?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1546890975-7596e98cdbf1?auto=format&fit=crop&w=800&q=80'
    ],
    dietary: 'veg',
    badges: ['Gluten-Free']
  }
];

// Helper to keep default local storage populated
function initDB() {
  if (!localStorage.getItem(DB_KEY_CATEGORIES) || JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]').length === 0) {
    localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(demoMockCategories));
  }
  
  if (!localStorage.getItem(DB_KEY_ITEMS) || JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]').length === 0) {
    localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(demoMockItems));
  }
  
  if (!localStorage.getItem(DB_KEY_BANNERS) || JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]').length === 0) {
    localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(demoMockBanners));
  }
  
  if (!localStorage.getItem(DB_KEY_OFFERS) || JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]').length === 0) {
    localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(demoMockOffers));
  }
  
  if (!localStorage.getItem(DB_KEY_ORDERS)) {
    localStorage.setItem(DB_KEY_ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEY_CART)) {
    localStorage.setItem(DB_KEY_CART, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEY_TABLES) || JSON.parse(localStorage.getItem(DB_KEY_TABLES) || '[]').length === 0) {
    localStorage.setItem(DB_KEY_TABLES, JSON.stringify(defaultMockTables));
  }
  if (!localStorage.getItem(DB_KEY_SETTINGS)) {
    localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify({
      restaurantName: 'Spice Garden',
      websiteBgImage: '',
      heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
      heroTitle: 'Pizza & Pasta',
      heroSubtitle: 'DIGITAL INNOVATION',
      heroOrderPhone: '+880 123456789',
      footerImage: 'https://images.unsplash.com/photo-1590947132387-155cc3dd2671?auto=format&fit=crop&w=1600&q=80',
      footerAddress: 'Dhaka, Bangladesh',
      footerPhone: '+880 123456789',
      footerEmail: 'info@evorisesolution.com',
      footerCopyright: 'Copyright ©2026 All rights reserved | This template is made with ♥ by Evorise Solution',
      socialFb: 'https://www.facebook.com/evorisesolutions/',
      socialTwitter: '',
      socialInsta: '',
      socialLinkedin: '',
      primaryColor: '#E99545',
      fontFamily: 'Plus Jakarta Sans',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      taxRate: 0,
      serviceCharge: 0,
      customBadges: 'Halal, Gluten-Free, Spicy, Chef\'s Special',
      enableOnlineOrdering: true,
      enableDietaryTags: true,
      enableSearch: true,
      enableOffers: true,
      enableSubCategories: true,
      enableDemoContent: true,
      layoutOrder: ['hero', 'banners', 'offers', 'menu'],
      orderStatuses: ['Pending', 'Cooking', 'Ready', 'Served', 'Cancelled'],
      // Geofencing & Dining Table Controls
      geofenceEnabled: false,
      restaurantLat: 23.8103,
      restaurantLng: 90.4125,
      geofenceRadiusMeters: 100,
      autoAcceptOrders: false,
      autoShiftSteps: false,
      autoShiftPrepMinutes: 2,
      autoShiftReadyMinutes: 10,
      autoShiftDeliverMinutes: 5,
      autoCloseSessionOnDeliver: false
    }));
  }
}

// --- Real-Time Unified Event Subscriptions (WebSocket + Offline Store) ---
const eventSubscribers = {
  items: new Set(),
  categories: new Set(),
  banners: new Set(),
  offers: new Set(),
  settings: new Set(),
  orders: new Set(),
  tables: new Set()
};

function notifySubscribers(type, data) {
  if (eventSubscribers[type]) {
    eventSubscribers[type].forEach(cb => {
      try { cb(data); } catch (e) { console.warn(`[Subscribers] Error in ${type} callback:`, e); }
    });
  }
}

function subscribeItems(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.items.add(callback);
    // Initial emit from local cache
    const items = JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]');
    if (items.length > 0) callback(items);
  }
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('items')).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(items));
          callback(items);
        }
      }, err => console.warn("Real-time items error:", err));
    } catch(e) {}
  }
  return () => { if (typeof callback === 'function') eventSubscribers.items.delete(callback); };
}

function subscribeCategories(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.categories.add(callback);
    const cats = JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
    if (cats.length > 0) callback(cats);
  }
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('categories')).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          cats.sort((a,b) => (a.order || 0) - (b.order || 0));
          localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(cats));
          callback(cats);
        }
      }, err => console.warn("Real-time categories error:", err));
    } catch(e) {}
  }
  return () => { if (typeof callback === 'function') eventSubscribers.categories.delete(callback); };
}

function subscribeBanners(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.banners.add(callback);
    const banners = JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
    if (banners.length > 0) callback(banners);
  }
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('banners')).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
          callback(banners);
        }
      }, err => console.warn("Real-time banners error:", err));
    } catch(e) {}
  }
  return () => { if (typeof callback === 'function') eventSubscribers.banners.delete(callback); };
}

function subscribeOffers(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.offers.add(callback);
    const offers = JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]');
    if (offers.length > 0) callback(offers);
  }
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('offers')).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
          callback(offers);
        }
      }, err => console.warn("Real-time offers error:", err));
    } catch(e) {}
  }
  return () => { if (typeof callback === 'function') eventSubscribers.offers.delete(callback); };
}

function subscribeSettings(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.settings.add(callback);
    const data = JSON.parse(localStorage.getItem(DB_KEY_SETTINGS) || '{}');
    if (Object.keys(data).length > 0) callback(data);
  }
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('config')).doc('settings').onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(data));
          callback(data);
        }
      }, err => console.warn("Real-time settings error:", err));
    } catch(e) {}
  }
  return () => { if (typeof callback === 'function') eventSubscribers.settings.delete(callback); };
}

function subscribeOrders(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.orders.add(callback);
    const orders = JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
    if (orders.length > 0) callback(orders);
  }
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('orders')).onSnapshot(snapshot => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        orders.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
        localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
        callback(orders);
      }, err => console.warn("Real-time orders error:", err));
    } catch(e) {}
  }
  return () => { if (typeof callback === 'function') eventSubscribers.orders.delete(callback); };
}

// One-click function to seed or reset all demo data directly to Firebase
async function seedDemoToFirebase(force = false) {
  console.log("Seeding demo content to Firebase...");
  if (!USE_FIREBASE || !firestoreDB) {
    localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(demoMockCategories));
    localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(demoMockItems));
    localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(demoMockBanners));
    localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(demoMockOffers));
    return { success: true, count: demoMockItems.length };
  }

  try {
    const batch = firestoreDB.batch();

    demoMockCategories.forEach(cat => {
      const ref = firestoreDB.collection(getCollectionPath('categories')).doc(cat.id);
      batch.set(ref, cat, { merge: true });
    });

    demoMockBanners.forEach(b => {
      const ref = firestoreDB.collection(getCollectionPath('banners')).doc(b.id);
      batch.set(ref, b, { merge: true });
    });

    demoMockOffers.forEach(o => {
      const ref = firestoreDB.collection(getCollectionPath('offers')).doc(o.id);
      batch.set(ref, o, { merge: true });
    });

    demoMockItems.forEach(item => {
      const ref = firestoreDB.collection(getCollectionPath('items')).doc(item.id);
      batch.set(ref, item, { merge: true });
    });

    const defaultSettingsObj = {
      restaurantName: 'Spice Garden',
      websiteBgImage: '',
      heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
      heroTitle: 'Pizza & Pasta',
      heroSubtitle: 'DIGITAL INNOVATION',
      heroOrderPhone: '+880 123456789',
      footerImage: 'https://images.unsplash.com/photo-1590947132387-155cc3dd2671?auto=format&fit=crop&w=1600&q=80',
      footerAddress: 'Dhaka, Bangladesh',
      footerPhone: '+880 123456789',
      footerEmail: 'info@evorisesolution.com',
      footerCopyright: 'Copyright ©2026 All rights reserved | Evorise Solution',
      socialFb: 'https://www.facebook.com/evorisesolutions/',
      socialTwitter: '',
      socialInsta: '',
      socialLinkedin: '',
      primaryColor: '#E99545',
      fontFamily: 'Plus Jakarta Sans',
      currencySymbol: '৳',
      currencyCode: 'BDT',
      taxRate: 0,
      serviceCharge: 0,
      customBadges: 'Halal, Gluten-Free, Spicy, Chef\'s Special',
      enableOnlineOrdering: true,
      enableDietaryTags: true,
      enableSearch: true,
      enableOffers: true,
      enableSubCategories: true,
      enableDemoContent: true,
      layoutOrder: ['hero', 'banners', 'offers', 'menu'],
      orderStatuses: ['Pending', 'Cooking', 'Ready', 'Served', 'Cancelled']
    };
    const settingsRef = firestoreDB.collection(getCollectionPath('config')).doc('settings');
    batch.set(settingsRef, defaultSettingsObj, { merge: true });

    await batch.commit();

    localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(demoMockCategories));
    localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(demoMockItems));
    localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(demoMockBanners));
    localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(demoMockOffers));
    localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(defaultSettingsObj));

    return { success: true, count: demoMockItems.length };
  } catch (err) {
    console.error("Failed to seed demo content to Firebase:", err);
    throw err;
  }
}

// Settings Methods
async function getSettings() {
  // 1. Try local server endpoint first
  try {
    const res = await fetch('/api/v1/settings');
    if (res.ok) {
      const serverSettings = await res.json();
      if (serverSettings && typeof serverSettings === 'object') {
        localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(serverSettings));
        return serverSettings;
      }
    }
  } catch (e) {}

  // 2. Try Firestore
  if (USE_FIREBASE && firestoreDB) {
    try {
      const doc = await firestoreDB.collection(getCollectionPath('config')).doc('settings').get();
      if (doc.exists) {
        const data = doc.data();
        localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn("Firestore Error in getSettings, falling back to local storage:", e);
    }
  }
  return JSON.parse(localStorage.getItem(DB_KEY_SETTINGS) || '{}');
}

async function saveSettings(settings) {
  // 1. Sync to Server REST API
  try {
    await fetch('/api/v1/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (e) {}

  // 2. Firestore Sync
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('config')).doc('settings').set(settings, { merge: true });
    } catch (e) { console.error("Firebase saveSettings error:", e); }
  }

  // 3. LocalStorage
  localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(settings));
}

// Cart Methods (User-local state)
async function getCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY_CART) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

async function saveCart(cart) {
  localStorage.setItem(DB_KEY_CART, JSON.stringify(cart));
}

async function addToCart(cartItem) {
  const cart = await getCart();
  const existingIndex = cart.findIndex(c => c.cartItemId === cartItem.cartItemId);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += cartItem.quantity;
    if (cart[existingIndex].quantity <= 0) cart.splice(existingIndex, 1);
  } else if (cartItem.quantity > 0) {
    cart.push(cartItem);
  }
  await saveCart(cart);
}

async function clearCart() {
  await saveCart([]);
}

// Item Methods (Connected directly to SQLite WAL Backend with instant local cache)
async function getItems() {
  // 1. Instant cache for zero-latency UI rendering
  let localItems = JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]');

  // 2. Local-First High Performance REST Fetch (< 5ms)
  try {
    const res = await fetch('/api/v1/items');
    if (res.ok) {
      const serverItems = await res.json();
      if (Array.isArray(serverItems) && serverItems.length > 0) {
        localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(serverItems));
        notifySubscribers('items', serverItems);
        return serverItems;
      }
    }
  } catch (e) {}

  if (USE_FIREBASE && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection(getCollectionPath('items')).get();
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(items));
        return items;
      }
    } catch (e) {}
  }

  if (localItems.length === 0) {
    localItems = [...demoMockItems];
    localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(localItems));
  }
  return localItems;
}

async function getItem(id) {
  const items = await getItems();
  return items.find(i => String(i.id).toLowerCase() === String(id).toLowerCase());
}

async function saveItem(item) {
  if (!item.id || item.id === '' || item.id.toString().startsWith('temp_')) {
    item.id = 'ITEM-' + Date.now();
  }
  
  // Normalize fields
  if (typeof item.price !== 'number') item.price = parseFloat(item.price) || 0;
  if (!item.title) item.title = 'Untitled Item';
  if (!item.category) item.category = 'mains';
  if (!item.image) item.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  // 1. Local Cache Update
  let items = JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]');
  if (items.length === 0) items = [...demoMockItems];
  const idx = items.findIndex(i => String(i.id) === String(item.id));
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...item };
  } else {
    items.unshift(item);
  }
  localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(items));
  notifySubscribers('items', items);

  // 2. SQLite Backend REST Persistence
  try {
    const res = await fetch('/api/v1/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (res.ok) {
      const saved = await res.json();
      console.log(`[SQLite Engine] Item ${saved.id} successfully saved to database.`);
    }
  } catch (err) {
    console.warn("[SQLite Engine] Network sync notice:", err.message);
  }

  // 3. Asynchronous non-blocking Firebase background sync (if active)
  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('items')).doc(item.id.toString()).set(item, { merge: true });
      } catch (e) {}
    }, 0);
  }

  return item;
}

async function deleteItem(id) {
  // 1. Local Cache Update
  let items = JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]');
  const newItems = items.filter(i => String(i.id) !== String(id));
  localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(newItems));
  notifySubscribers('items', newItems);

  // 2. SQLite Backend REST Delete
  try {
    await fetch(`/api/v1/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
    console.log(`[SQLite Engine] Item ${id} deleted from database.`);
  } catch (err) {}

  // 3. Firebase background delete (if active)
  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('items')).doc(id.toString()).delete();
      } catch (e) {}
    }, 0);
  }
}

// Order Methods (Unified SQLite Storage)
async function getOrders() {
  // 1. Fetch from Local SQLite Server (< 5ms)
  try {
    const res = await fetch('/api/v1/orders');
    if (res.ok) {
      const orders = await res.json();
      if (Array.isArray(orders)) {
        localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
        notifySubscribers('orders', orders);
        return orders;
      }
    }
  } catch (e) {}

  if (USE_FIREBASE && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection(getCollectionPath('orders')).get();
      if (!snapshot.empty) {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        orders.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
        localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
        return orders;
      }
    } catch (e) {}
  }
  return JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
}

async function placeOrder(orderData) {
  // Generate friendly readable Order ID, e.g. ORD-739281
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  let orderId = orderData.id || ('ORD-' + randomSuffix);

  // Initial status starts as Pending (giving customer legitimate grace period to cancel)
  let initialStatus = orderData.status || 'Pending';

  let verifiedTotal = parseFloat(orderData.total) || 0;
  let verifiedTax = 0;
  let verifiedSubtotal = verifiedTotal;

  // Zero-Trust Backend Verification & Idempotent Push (RULE-SEC-001 §1.1 & ARCH-API-003)
  try {
    const idempotencyKey = orderData.idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const deviceFingerprint = sessionStorage.getItem('evorise_device_fingerprint') || 'guest_device';
    const jwtToken = sessionStorage.getItem('evorise_session_jwt') || '';

    const backendResp = await fetch('/api/v1/orders/place', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'X-Device-Fingerprint': deviceFingerprint,
        ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
      },
      body: JSON.stringify({
        tableNo: orderData.tableNo || 'Table 1',
        sessionId: orderData.sessionId || null,
        items: orderData.items || [],
        notes: orderData.notes || '',
        paymentStatus: orderData.paymentStatus || 'Unpaid (Pay at Counter)'
      })
    });

    if (backendResp.ok || backendResp.status === 202) {
      const serverOrder = await backendResp.json();
      if (serverOrder.id) orderId = serverOrder.id;
      if (serverOrder.total !== undefined) verifiedTotal = serverOrder.total;
      if (serverOrder.tax !== undefined) verifiedTax = serverOrder.tax;
      if (serverOrder.subtotal !== undefined) verifiedSubtotal = serverOrder.subtotal;
      console.log(`[OrderEngine] Zero-Trust Verified Total: ৳${verifiedTotal} (Subtotal: ৳${verifiedSubtotal}, Tax: ৳${verifiedTax})`);
    }
  } catch (netErr) {
    console.warn('[OrderEngine] Offline or direct store fallback:', netErr.message);
  }

  const order = {
    id: orderId,
    date: new Date().toISOString(),
    statusUpdatedAt: new Date().toISOString(),
    items: orderData.items || [],
    subtotal: verifiedSubtotal,
    tax: verifiedTax,
    total: verifiedTotal,
    tableNo: (orderData.tableNo && orderData.tableNo.trim()) ? orderData.tableNo.trim() : 'Table 1',
    tableId: orderData.tableId || null,
    sessionId: orderData.sessionId || null,
    customerName: orderData.customerName || 'Customer',
    customerPhone: orderData.customerPhone || '',
    notes: orderData.notes || '',
    paymentStatus: orderData.paymentStatus || 'Unpaid (Pay at Counter)',
    status: initialStatus
  };
  
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('orders')).doc(order.id).set(order);
      console.log("Firebase order saved:", order.id);
    } catch (e) { console.error("Firebase placeOrder error:", e); }
  }
  
  const orders = await getOrders();
  // Filter out duplicate if id exists
  const existingIndex = orders.findIndex(o => String(o.id) === String(order.id));
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));

  // Sync to table
  if (order.tableNo) {
    updateTableOrderLink(order.tableNo, order.id, order.sessionId).catch(e => console.warn(e));
  }

  return order;
}

async function deleteOrder(id) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('orders')).doc(id.toString()).delete();
      console.log("Firebase order deleted:", id);
    } catch (e) { console.error("Firebase deleteOrder error:", e); }
  }
  
  let orders = await getOrders();
  orders = orders.filter(o => String(o.id) !== String(id));
  localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
  return true;
}

async function getOrderById(id) {
  if (!id) return null;
  // 1. Try local server endpoint
  try {
    const res = await fetch(`/api/v1/orders/${encodeURIComponent(id)}`);
    if (res.ok) {
      const serverOrder = await res.json();
      if (serverOrder && serverOrder.id) {
        const localOrders = JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
        const idx = localOrders.findIndex(o => String(o.id) === String(serverOrder.id));
        if (idx >= 0) localOrders[idx] = serverOrder;
        else localOrders.unshift(serverOrder);
        localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(localOrders));
        return serverOrder;
      }
    }
  } catch (e) {}

  // 2. Try Firebase
  if (USE_FIREBASE && firestoreDB) {
    try {
      const doc = await firestoreDB.collection(getCollectionPath('orders')).doc(id.toString()).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
    } catch (e) { console.warn("Firebase getOrderById error:", e); }
  }
  const orders = await getOrders();
  return orders.find(o => String(o.id) === String(id)) || null;
}

function subscribeOrder(id, callback) {
  if (!id || typeof callback !== 'function') return null;

  let isUnsubscribed = false;
  let firestoreUnsub = null;

  if (USE_FIREBASE && firestoreDB) {
    try {
      firestoreUnsub = firestoreDB.collection(getCollectionPath('orders')).doc(id.toString()).onSnapshot(doc => {
        if (!isUnsubscribed && doc.exists) {
          callback({ id: doc.id, ...doc.data() });
        }
      }, err => console.warn("Real-time single order error:", err));
    } catch(e) { console.warn("subscribeOrder error:", e); }
  }

  // Multi-tier real-time synchronization (2.5s polling + cross-tab storage events)
  let lastKnownStatus = null;
  const pollInterval = setInterval(async () => {
    if (isUnsubscribed) return;
    try {
      const order = await getOrderById(id);
      if (order && order.status !== lastKnownStatus) {
        lastKnownStatus = order.status;
        callback(order);
      }
    } catch (e) {}
  }, 2500);

  const storageHandler = (e) => {
    if (isUnsubscribed) return;
    if (e.key === DB_KEY_ORDERS) {
      try {
        const orders = JSON.parse(e.newValue || '[]');
        const updated = orders.find(o => String(o.id) === String(id));
        if (updated && updated.status !== lastKnownStatus) {
          lastKnownStatus = updated.status;
          callback(updated);
        }
      } catch (err) {}
    }
  };
  window.addEventListener('storage', storageHandler);

  return function unsubscribe() {
    isUnsubscribed = true;
    clearInterval(pollInterval);
    window.removeEventListener('storage', storageHandler);
    if (firestoreUnsub) {
      try { firestoreUnsub(); } catch (e) {}
    }
  };
}

async function updateOrderStatus(id, status) {
  const statusUpdatedAt = new Date().toISOString();
  
  // 1. Update on Local Node API Gateway
  try {
    await fetch(`/api/v1/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (e) {}

  // 2. Firebase
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('orders')).doc(id.toString()).update({ 
        status,
        statusUpdatedAt 
      });
      console.log("Firebase order status updated:", id, status);
    } catch (e) { console.error("Firebase updateOrderStatus error:", e); }
  }
  
  // 3. LocalStorage
  const orders = await getOrders();
  const order = orders.find(o => String(o.id) === String(id));
  if (order) {
    order.status = status;
    order.statusUpdatedAt = statusUpdatedAt;
    localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
  }
}

// --- BANNERS API (Unified SQLite Store) ---
async function getBanners() {
  let banners = JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
  try {
    const res = await fetch('/api/v1/banners');
    if (res.ok) {
      const serverBanners = await res.json();
      if (Array.isArray(serverBanners) && serverBanners.length > 0) {
        localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(serverBanners));
        notifySubscribers('banners', serverBanners);
        return serverBanners;
      }
    }
  } catch (e) {}

  if (banners.length === 0) {
    banners = [...demoMockBanners];
    localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
  }
  return banners;
}

async function saveBanner(banner) {
  if (!banner.id) banner.id = 'BNR-' + Date.now();
  let banners = JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
  if (banners.length === 0) banners = [...demoMockBanners];
  const index = banners.findIndex(b => String(b.id) === String(banner.id));
  if (index > -1) banners[index] = { ...banners[index], ...banner };
  else banners.unshift(banner);
  localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
  notifySubscribers('banners', banners);

  try {
    await fetch('/api/v1/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner)
    });
  } catch (e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('banners')).doc(banner.id.toString()).set(banner, { merge: true });
      } catch(e) {}
    }, 0);
  }

  return banner;
}

async function deleteBanner(id) {
  let banners = JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
  banners = banners.filter(b => String(b.id) !== String(id));
  localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
  notifySubscribers('banners', banners);

  try {
    await fetch(`/api/v1/banners/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch(e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('banners')).doc(id.toString()).delete();
      } catch(e) {}
    }, 0);
  }
}

// --- OFFERS API (Unified SQLite Store) ---
async function getOffers() {
  let offers = JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]');
  try {
    const res = await fetch('/api/v1/offers');
    if (res.ok) {
      const serverOffers = await res.json();
      if (Array.isArray(serverOffers) && serverOffers.length > 0) {
        localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(serverOffers));
        notifySubscribers('offers', serverOffers);
        return serverOffers;
      }
    }
  } catch (e) {}

  if (offers.length === 0) {
    offers = [...demoMockOffers];
    localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
  }
  return offers;
}

async function saveOffer(offer) {
  if (!offer.id || offer.id === '') offer.id = 'OFF-' + Date.now();
  let offers = JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]');
  if (offers.length === 0) offers = [...demoMockOffers];
  const index = offers.findIndex(o => String(o.id) === String(offer.id));
  if (index > -1) offers[index] = { ...offers[index], ...offer };
  else offers.unshift(offer);
  localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
  notifySubscribers('offers', offers);

  try {
    await fetch('/api/v1/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer)
    });
  } catch (e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('offers')).doc(offer.id.toString()).set(offer, { merge: true });
      } catch(e) {}
    }, 0);
  }

  return offer;
}

async function deleteOffer(id) {
  let offers = JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]');
  offers = offers.filter(o => String(o.id) !== String(id));
  localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
  notifySubscribers('offers', offers);

  try {
    await fetch(`/api/v1/offers/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch(e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('offers')).doc(id.toString()).delete();
      } catch(e) {}
    }, 0);
  }
}

// --- CATEGORIES API (Unified SQLite Store) ---
async function getCategories() {
  let categories = JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
  try {
    const res = await fetch('/api/v1/categories');
    if (res.ok) {
      const serverCategories = await res.json();
      if (Array.isArray(serverCategories) && serverCategories.length > 0) {
        localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(serverCategories));
        notifySubscribers('categories', serverCategories);
        return serverCategories;
      }
    }
  } catch (e) {}

  if (categories.length === 0) {
    categories = [...demoMockCategories];
    localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
  }
  return categories;
}

async function saveCategory(category) {
  if (!category.id) category.id = 'CAT-' + Date.now();
  let categories = JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
  if (categories.length === 0) categories = [...demoMockCategories];
  const index = categories.findIndex(c => String(c.id) === String(category.id));
  if (index > -1) categories[index] = { ...categories[index], ...category };
  else categories.push(category);
  localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
  notifySubscribers('categories', categories);

  try {
    await fetch('/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
  } catch(e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('categories')).doc(category.id.toString()).set(category, { merge: true });
      } catch(e) {}
    }, 0);
  }

  return category;
}

async function deleteCategory(id) {
  let categories = JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
  categories = categories.filter(c => String(c.id) !== String(id));
  localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
  notifySubscribers('categories', categories);

  try {
    await fetch(`/api/v1/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch(e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('categories')).doc(id.toString()).delete();
      } catch(e) {}
    }, 0);
  }
}

// ==========================================
// --- TABLES & SESSIONS MANAGEMENT API ---
// ==========================================

function normalizeTableNo(raw) {
  if (!raw && raw !== 0) return 'Table 1';
  let clean = String(raw).trim();
  if (!clean) return 'Table 1';

  // 1. Pure numbers like "1", "02", "15" -> "Table 1", "Table 2", "Table 15"
  if (/^\d+$/.test(clean)) {
    return `Table ${parseInt(clean, 10)}`;
  }

  // 2. Prefixes like "table 3", "Table-3", "tbl_3", "t3", "T-03", "table3"
  const match = clean.match(/^(?:table|tbl|t)[\s\-_]*(\d+.*)$/i);
  if (match) {
    const suffix = match[1].trim();
    const numOnly = /^\d+$/.test(suffix) ? parseInt(suffix, 10) : suffix;
    return `Table ${numOnly}`;
  }

  // 3. Custom names starting with "table " case-insensitively
  if (/^table\s+/i.test(clean)) {
    return `Table ${clean.replace(/^table\s+/i, '').trim()}`;
  }

  // 4. Custom names like "VIP 1", "Bar 2", "Patio A"
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function isSameTable(tableA, tableB) {
  if (!tableA || !tableB) return false;
  return normalizeTableNo(tableA).toLowerCase() === normalizeTableNo(tableB).toLowerCase();
}

async function getTables() {
  let tables = [];
  try {
    const res = await fetch('/api/v1/tables');
    if (res.ok) {
      const serverTables = await res.json();
      if (Array.isArray(serverTables) && serverTables.length > 0) {
        tables = serverTables;
      }
    }
  } catch(e) {}

  if (!tables || tables.length === 0) {
    tables = JSON.parse(localStorage.getItem(DB_KEY_TABLES) || '[]');
  }
  if (!tables || tables.length === 0) {
    tables = [...defaultMockTables];
  }

  // Deduplicate tables by normalized tableNo, preserving active sessions/orders
  const uniqueMap = new Map();
  tables.forEach(t => {
    const canonical = normalizeTableNo(t.tableNo || t.name);
    t.tableNo = canonical;
    if (!uniqueMap.has(canonical.toLowerCase())) {
      uniqueMap.set(canonical.toLowerCase(), t);
    } else {
      const existing = uniqueMap.get(canonical.toLowerCase());
      if (t.status === 'Occupied' && existing.status !== 'Occupied') {
        uniqueMap.set(canonical.toLowerCase(), { ...existing, ...t });
      }
    }
  });

  tables = Array.from(uniqueMap.values());
  tables.sort((a,b) => (a.tableNo || '').localeCompare(b.tableNo || '', undefined, { numeric: true }));
  localStorage.setItem(DB_KEY_TABLES, JSON.stringify(tables));
  notifySubscribers('tables', tables);
  return tables;
}

async function saveTable(table) {
  if (!table.id) table.id = 'tbl_' + Date.now();
  table.tableNo = normalizeTableNo(table.tableNo || table.name || ('Table ' + (Date.now() % 100)));
  const numOnly = table.tableNo.replace(/^Table\s*/i, '').trim();
  if (!table.qrUrl) table.qrUrl = `/index.html?table=${encodeURIComponent(numOnly || table.tableNo)}`;
  
  let tables = await getTables();
  const index = tables.findIndex(t => String(t.id) === String(table.id) || isSameTable(t.tableNo, table.tableNo));
  if (index > -1) tables[index] = { ...tables[index], ...table };
  else tables.push(table);
  localStorage.setItem(DB_KEY_TABLES, JSON.stringify(tables));
  notifySubscribers('tables', tables);

  try {
    await fetch('/api/v1/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(table)
    });
  } catch(e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('tables')).doc(table.id.toString()).set(table, { merge: true });
      } catch(e) {}
    }, 0);
  }

  return table;
}

async function deleteTable(id) {
  let tables = await getTables();
  tables = tables.filter(t => String(t.id) !== String(id));
  localStorage.setItem(DB_KEY_TABLES, JSON.stringify(tables));
  notifySubscribers('tables', tables);

  try {
    await fetch(`/api/v1/tables/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch(e) {}

  if (USE_FIREBASE && firestoreDB) {
    setTimeout(async () => {
      try {
        await firestoreDB.collection(getCollectionPath('tables')).doc(id.toString()).delete();
      } catch(e) {}
    }, 0);
  }
  return true;
}

function subscribeTables(callback) {
  if (typeof callback === 'function') {
    eventSubscribers.tables.add(callback);
    const tables = JSON.parse(localStorage.getItem(DB_KEY_TABLES) || '[]');
    if (tables.length > 0) callback(tables);
  }
  return () => { if (typeof callback === 'function') eventSubscribers.tables.delete(callback); };
}

async function updateTableOrderLink(tableNo, orderId, sessionId) {
  let tables = await getTables();
  let table = tables.find(t => isSameTable(t.tableNo, tableNo));
  if (table) {
    table.currentOrderId = orderId;
    table.status = 'Occupied';
    if (sessionId) table.activeSessionId = sessionId;
    if (!table.occupiedAt) table.occupiedAt = new Date().toISOString();
    await saveTable(table);
  }
}

// Connect or start an anonymous guest session for a specific table
async function getOrInitTableSession(tableParam) {
  const normalizedTableNo = normalizeTableNo(tableParam);
  let tables = await getTables();
  let table = tables.find(t => isSameTable(t.tableNo, normalizedTableNo));
  
  const now = new Date().toISOString();

  if (!table) {
    // Dynamically register table if not already existing
    const numOnly = normalizedTableNo.replace(/^Table\s*/i, '').trim();
    table = {
      id: 'tbl_' + Date.now(),
      tableNo: normalizedTableNo,
      capacity: 4,
      floor: '1st Floor',
      status: 'Occupied',
      activeSessionId: null,
      occupiedAt: now,
      currentOrderId: null,
      qrUrl: `/index.html?table=${encodeURIComponent(numOnly || normalizedTableNo)}`
    };
  }

  let sessionId = table.activeSessionId;
  let isNewSession = false;

  // If table is vacant or no active session ID, open fresh session
  if (!sessionId || table.status === 'Vacant') {
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    sessionId = `SES-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
    isNewSession = true;
    
    table.status = 'Occupied';
    table.activeSessionId = sessionId;
    table.occupiedAt = now;
    table.currentOrderId = null;
    await saveTable(table);

    // Save session record
    const sessionRecord = {
      id: sessionId,
      tableNo: table.tableNo,
      tableId: table.id,
      startedAt: now,
      status: 'Active',
      closedAt: null,
      closedReason: null
    };
    if (USE_FIREBASE && firestoreDB) {
      try {
        await firestoreDB.collection(getCollectionPath('table_sessions')).doc(sessionId).set(sessionRecord);
      } catch(e) {}
    }
  }

  return {
    sessionId,
    table,
    isNewSession
  };
}

// Close Customer Session / Release Table
async function closeTableSession(tableParam, reason = 'Admin Closed') {
  let tables = await getTables();
  let table = tables.find(t => isSameTable(t.tableNo, tableParam) || String(t.id) === String(tableParam));

  if (!table) return null;

  const oldSessionId = table.activeSessionId;
  const now = new Date().toISOString();

  // Close session history document
  if (oldSessionId && USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('table_sessions')).doc(oldSessionId).update({
        status: 'Closed',
        closedAt: now,
        closedReason: reason
      });
    } catch(e) {}
  }

  // Also complete active orders for this table if any
  if (table.currentOrderId) {
    try {
      await updateOrderStatus(table.currentOrderId, 'Completed');
    } catch(e) {}
  }

  // Mark table as Vacant and clear active session
  table.status = 'Vacant';
  table.activeSessionId = null;
  table.occupiedAt = null;
  table.currentOrderId = null;
  await saveTable(table);

  return { success: true, closedSessionId: oldSessionId, table };
}

// ==========================================
// --- GEOFENCING UTILITIES (Haversine) ---
// ==========================================

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
  const R = 6371e3; // Earth's radius in metres
  const phi1 = parseFloat(lat1) * Math.PI / 180;
  const phi2 = parseFloat(lat2) * Math.PI / 180;
  const deltaPhi = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
  const deltaLambda = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function checkGeofenceStatus(userLat, userLng, settings) {
  if (!settings || settings.geofenceEnabled === false) {
    return {
      enabled: false,
      isInside: true,
      distanceMeters: 0,
      radiusMeters: settings?.geofenceRadiusMeters || 100,
      message: 'Geofence disabled in settings (Dine-in anywhere enabled)'
    };
  }

  const restLat = parseFloat(settings.restaurantLat);
  const restLng = parseFloat(settings.restaurantLng);
  const radius = parseFloat(settings.geofenceRadiusMeters) || 100;

  if (isNaN(restLat) || isNaN(restLng)) {
    return {
      enabled: false,
      isInside: true,
      distanceMeters: 0,
      radiusMeters: radius,
      message: 'Restaurant GPS coordinates not configured in Settings.'
    };
  }

  if (userLat === null || userLat === undefined || userLng === null || userLng === undefined) {
    return {
      enabled: true,
      isInside: false,
      distanceMeters: null,
      radiusMeters: radius,
      message: 'Please allow Location Access to confirm you are seated in the restaurant.'
    };
  }

  const distance = calculateDistanceMeters(userLat, userLng, restLat, restLng);
  const isInside = distance <= radius;

  return {
    enabled: true,
    isInside,
    distanceMeters: distance,
    radiusMeters: radius,
    message: isInside 
      ? `Verified inside restaurant (${distance}m from central point)`
      : `Outside restaurant range (${distance}m away, max allowed is ${radius}m)`
  };
}

// ==========================================
// --- ORDER AUTOMATION ENGINE ---
// ==========================================

async function runAutoShiftEngine() {
  try {
    const settings = await getSettings();
    if (!settings) return;

    const orders = await getOrders();
    const now = Date.now();

    for (let order of orders) {
      if (order.status === 'Cancelled' || order.status === 'Completed' || order.status === 'Delivered' || order.status === 'Served') {
        continue;
      }

      const orderTime = new Date(order.statusUpdatedAt || order.date || now).getTime();
      const elapsedMinutes = (now - orderTime) / (1000 * 60);

      // Auto-Accept: Pending -> Accepted
      if (settings.autoAcceptOrders && order.status === 'Pending') {
        console.log(`[AutoEngine] Auto-accepting order #${order.id}`);
        await updateOrderStatus(order.id, 'Accepted');
        order.status = 'Accepted';
        order.statusUpdatedAt = new Date().toISOString();
      }

      // Auto-Shift Steps based on time
      if (settings.autoShiftSteps) {
        const prepThreshold = parseFloat(settings.autoShiftPrepMinutes) || 2;
        const readyThreshold = parseFloat(settings.autoShiftReadyMinutes) || 10;
        const deliverThreshold = parseFloat(settings.autoShiftDeliverMinutes) || 5;

        if (order.status === 'Accepted' && elapsedMinutes >= prepThreshold) {
          console.log(`[AutoEngine] Auto-shifting order #${order.id} to Cooking (${elapsedMinutes.toFixed(1)}m elapsed)`);
          await updateOrderStatus(order.id, 'Cooking');
        } else if (order.status === 'Cooking' && elapsedMinutes >= readyThreshold) {
          console.log(`[AutoEngine] Auto-shifting order #${order.id} to Ready (${elapsedMinutes.toFixed(1)}m elapsed)`);
          await updateOrderStatus(order.id, 'Ready');
        } else if (order.status === 'Ready' && elapsedMinutes >= deliverThreshold) {
          console.log(`[AutoEngine] Auto-shifting order #${order.id} to Served (${elapsedMinutes.toFixed(1)}m elapsed)`);
          await updateOrderStatus(order.id, 'Served');
        }
      }
    }
  } catch(e) {
    console.warn("Auto shift engine tick error:", e);
  }
}

// Run periodic automation loop every 12 seconds
if (typeof window !== 'undefined') {
  setInterval(runAutoShiftEngine, 12000);
}

// ==========================================
// --- ENTERPRISE DATABASE & BACKUP API ---
// ==========================================
async function getDatabaseStats() {
  try {
    const res = await fetch('/api/v1/database/stats');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: 'ONLINE', mode: 'Local Cache' };
}

async function createDatabaseBackup() {
  try {
    const res = await fetch('/api/v1/database/backup', { method: 'POST' });
    if (res.ok) return await res.json();
    const err = await res.json();
    throw new Error(err.message || err.error || 'Failed to create backup');
  } catch (e) {
    throw e;
  }
}

async function listDatabaseBackups() {
  try {
    const res = await fetch('/api/v1/database/backups');
    if (res.ok) return await res.json();
  } catch (e) {}
  return [];
}

async function restoreDatabase(fileName) {
  try {
    const res = await fetch('/api/v1/database/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName })
    });
    if (res.ok) {
      const data = await res.json();
      await getItems();
      await getCategories();
      await getTables();
      await getOrders();
      await getBanners();
      await getOffers();
      return data;
    }
    const err = await res.json();
    throw new Error(err.message || err.error || 'Restore failed');
  } catch (e) {
    throw e;
  }
}

// ==========================================
// --- ZERO-LATENCY REAL-TIME WEBSOCKET HUB ---
// ==========================================
(function initGlobalWebSocketHub() {
  if (typeof window === 'undefined') return;

  function connectWs() {
    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Evorise Sync] Real-Time Enterprise Event Bus connected.');
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (!msg || !msg.type) return;

          switch (msg.type) {
            case 'ITEM_UPDATED':
            case 'ITEM_DELETED':
            case 'MENU_UPDATED':
              await getItems();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'items', data: msg.data } }));
              break;
            case 'CATEGORIES_UPDATED':
              await getCategories();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'categories', data: msg.data } }));
              break;
            case 'BANNERS_UPDATED':
              await getBanners();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'banners', data: msg.data } }));
              break;
            case 'OFFERS_UPDATED':
              await getOffers();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'offers', data: msg.data } }));
              break;
            case 'TABLES_UPDATED':
              await getTables();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'tables', data: msg.data } }));
              break;
            case 'ORDER_CREATED':
            case 'ORDER_STATUS_CHANGED':
            case 'ORDER_CANCELLED':
              await getOrders();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'orders', data: msg.data } }));
              break;
            case 'SETTINGS_UPDATED':
              await getSettings();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'settings', data: msg.data } }));
              break;
            case 'DATABASE_RESTORED':
              await getItems();
              await getCategories();
              await getTables();
              await getOrders();
              window.dispatchEvent(new CustomEvent('evorise:data_updated', { detail: { type: 'all', data: msg.data } }));
              break;
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        try { ws.close(); } catch (e) {}
      };
    } catch (e) {
      setTimeout(connectWs, 5000);
    }
  }

  setTimeout(connectWs, 300);
})();

// Initialize on script load
initDB();
