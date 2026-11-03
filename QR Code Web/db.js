// Database layer supporting real-time Firebase Firestore with seamless localStorage offline fallback

/* --- FIREBASE BACKEND CONFIGURATION --- */
const USE_FIREBASE = true;

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
      orderStatuses: ['Pending', 'Cooking', 'Ready', 'Served', 'Cancelled']
    }));
  }
}

// --- Real-time Subscriptions for Firestore ---
function subscribeItems(callback) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('items')).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(items));
          callback(items);
        }
      }, err => console.warn("Real-time items error:", err));
    } catch(e) { console.warn("subscribeItems error:", e); }
  }
  return null;
}

function subscribeCategories(callback) {
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
    } catch(e) { console.warn("subscribeCategories error:", e); }
  }
  return null;
}

function subscribeBanners(callback) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('banners')).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
          callback(banners);
        }
      }, err => console.warn("Real-time banners error:", err));
    } catch(e) { console.warn("subscribeBanners error:", e); }
  }
  return null;
}

function subscribeOffers(callback) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('offers')).onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
          callback(offers);
        }
      }, err => console.warn("Real-time offers error:", err));
    } catch(e) { console.warn("subscribeOffers error:", e); }
  }
  return null;
}

function subscribeSettings(callback) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('config')).doc('settings').onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(data));
          callback(data);
        }
      }, err => console.warn("Real-time settings error:", err));
    } catch(e) { console.warn("subscribeSettings error:", e); }
  }
  return null;
}

function subscribeOrders(callback) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('orders')).onSnapshot(snapshot => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        orders.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
        localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
        callback(orders);
      }, err => console.warn("Real-time orders error:", err));
    } catch(e) { console.warn("subscribeOrders error:", e); }
  }
  return null;
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
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('config')).doc('settings').set(settings, { merge: true });
    } catch (e) { console.error("Firebase saveSettings error:", e); }
  }
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

// Item Methods
async function getItems() {
  if (USE_FIREBASE && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection(getCollectionPath('items')).get();
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.warn("Firestore Error in getItems, falling back to local storage:", e);
    }
  }
  let localItems = JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]');
  if (localItems.length === 0) {
    localItems = [...demoMockItems];
    localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(localItems));
  }
  return localItems;
}

async function getItem(id) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      const doc = await firestoreDB.collection(getCollectionPath('items')).doc(id.toString()).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
    } catch (e) {
      console.warn("Firestore Error in getItem:", e);
    }
  }
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

  if (USE_FIREBASE && firestoreDB) {
    try {
      const colPath = getCollectionPath('items');
      console.log(`[Firestore] Saving item ${item.id} to ${colPath}...`);
      await firestoreDB.collection(colPath).doc(item.id.toString()).set(item, { merge: true });
      console.log(`[Firestore] Item ${item.id} saved successfully!`);
    } catch (e) {
      console.warn("Firestore saveItem error, trying root items collection:", e);
      try {
        await firestoreDB.collection('items').doc(item.id.toString()).set(item, { merge: true });
        console.log(`[Firestore] Fallback to root items succeeded for ${item.id}!`);
      } catch (err2) {
        console.error("Firestore root items save failed:", err2);
        throw new Error("Firebase write failed: " + (err2.message || err2));
      }
    }
  }
  
  let items = JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]');
  if (items.length === 0) items = [...demoMockItems];
  const idx = items.findIndex(i => String(i.id) === String(item.id));
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...item };
  } else {
    items.unshift(item);
  }
  localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(items));
  return item;
}

async function deleteItem(id) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('items')).doc(id.toString()).delete();
    } catch (e) {
      console.warn("Firebase deleteItem trying root items:", e);
      try {
        await firestoreDB.collection('items').doc(id.toString()).delete();
      } catch (err2) {
        console.error("Firebase delete error:", err2);
      }
    }
  }
  
  let items = JSON.parse(localStorage.getItem(DB_KEY_ITEMS) || '[]');
  const newItems = items.filter(i => String(i.id) !== String(id));
  localStorage.setItem(DB_KEY_ITEMS, JSON.stringify(newItems));
}

// Order Methods
async function getOrders() {
  if (USE_FIREBASE && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection(getCollectionPath('orders')).get();
      if (!snapshot.empty) {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        orders.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
        localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
        return orders;
      }
    } catch (e) {
      console.warn("Firestore Error in getOrders, falling back to local storage:", e);
    }
  }
  return JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
}

async function placeOrder(orderData) {
  // Generate friendly readable Order ID, e.g. ORD-739281
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const orderId = orderData.id || ('ORD-' + randomSuffix);

  const order = {
    id: orderId,
    date: new Date().toISOString(),
    items: orderData.items || [],
    total: parseFloat(orderData.total) || 0,
    tableNo: (orderData.tableNo && orderData.tableNo.trim()) ? orderData.tableNo.trim() : 'Table 1',
    customerName: orderData.customerName || 'Customer',
    customerPhone: orderData.customerPhone || '',
    notes: orderData.notes || '',
    paymentStatus: orderData.paymentStatus || 'Unpaid (Pay at Counter)',
    status: orderData.status || 'Pending'
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
  if (USE_FIREBASE && firestoreDB) {
    try {
      return firestoreDB.collection(getCollectionPath('orders')).doc(id.toString()).onSnapshot(doc => {
        if (doc.exists) {
          callback({ id: doc.id, ...doc.data() });
        }
      }, err => console.warn("Real-time single order error:", err));
    } catch(e) { console.warn("subscribeOrder error:", e); }
  }
  return null;
}

async function updateOrderStatus(id, status) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('orders')).doc(id.toString()).update({ status });
      console.log("Firebase order status updated:", id, status);
    } catch (e) { console.error("Firebase updateOrderStatus error:", e); }
  }
  
  const orders = await getOrders();
  const order = orders.find(o => String(o.id) === String(id));
  if (order) {
    order.status = status;
    localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
  }
}

// --- BANNERS API ---
async function getBanners() {
  if (USE_FIREBASE && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection(getCollectionPath('banners')).get();
      if (!snapshot.empty) {
        const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
        return banners;
      }
    } catch (e) {
      console.warn("Firestore Error in getBanners:", e);
    }
  }
  let banners = JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
  if (banners.length === 0) {
    banners = [...demoMockBanners];
    localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
  }
  return banners;
}

async function saveBanner(banner) {
  if (!banner.id) banner.id = 'BNR-' + Date.now();
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('banners')).doc(banner.id.toString()).set(banner, { merge: true });
    } catch(e) { console.error("Firebase saveBanner error:", e); }
  }
  let banners = JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
  if (banners.length === 0) banners = [...demoMockBanners];
  const index = banners.findIndex(b => String(b.id) === String(banner.id));
  if (index > -1) banners[index] = { ...banners[index], ...banner };
  else banners.unshift(banner);
  localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
  return banner;
}

async function deleteBanner(id) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('banners')).doc(id.toString()).delete();
    } catch(e) { console.error("Firebase deleteBanner error:", e); }
  }
  let banners = JSON.parse(localStorage.getItem(DB_KEY_BANNERS) || '[]');
  banners = banners.filter(b => String(b.id) !== String(id));
  localStorage.setItem(DB_KEY_BANNERS, JSON.stringify(banners));
}

// --- OFFERS API ---
async function getOffers() {
  if (USE_FIREBASE && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection(getCollectionPath('offers')).get();
      if (!snapshot.empty) {
        const offers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
        return offers;
      }
    } catch (e) {
      console.warn("Firestore Error in getOffers:", e);
    }
  }
  let offers = JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]');
  if (offers.length === 0) {
    offers = [...demoMockOffers];
    localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
  }
  return offers;
}

async function saveOffer(offer) {
  if (!offer.id || offer.id === '') offer.id = 'OFF-' + Date.now();
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('offers')).doc(offer.id.toString()).set(offer, { merge: true });
    } catch(e) { console.error("Firebase saveOffer error:", e); }
  }
  let offers = JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]');
  if (offers.length === 0) offers = [...demoMockOffers];
  const index = offers.findIndex(o => String(o.id) === String(offer.id));
  if (index > -1) offers[index] = { ...offers[index], ...offer };
  else offers.unshift(offer);
  localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
  return offer;
}

async function deleteOffer(id) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('offers')).doc(id.toString()).delete();
    } catch(e) { console.error("Firebase deleteOffer error:", e); }
  }
  let offers = JSON.parse(localStorage.getItem(DB_KEY_OFFERS) || '[]');
  offers = offers.filter(o => String(o.id) !== String(id));
  localStorage.setItem(DB_KEY_OFFERS, JSON.stringify(offers));
}

// --- CATEGORIES API ---
async function getCategories() {
  if (USE_FIREBASE && firestoreDB) {
    try {
      const snapshot = await firestoreDB.collection(getCollectionPath('categories')).get();
      if (!snapshot.empty) {
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        categories.sort((a,b) => (a.order || 0) - (b.order || 0));
        localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
        return categories;
      }
    } catch (e) {
      console.warn("Firestore Error in getCategories:", e);
    }
  }
  let categories = JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
  if (categories.length === 0) {
    categories = [...demoMockCategories];
    localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
  }
  return categories;
}

async function saveCategory(category) {
  if (!category.id) category.id = 'CAT-' + Date.now();
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('categories')).doc(category.id.toString()).set(category, { merge: true });
    } catch(e) { console.error("Firebase saveCategory error:", e); }
  }
  let categories = JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
  if (categories.length === 0) categories = [...demoMockCategories];
  const index = categories.findIndex(c => String(c.id) === String(category.id));
  if (index > -1) categories[index] = { ...categories[index], ...category };
  else categories.push(category);
  localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
  return category;
}

async function deleteCategory(id) {
  if (USE_FIREBASE && firestoreDB) {
    try {
      await firestoreDB.collection(getCollectionPath('categories')).doc(id.toString()).delete();
    } catch(e) { console.error("Firebase deleteCategory error:", e); }
  }
  let categories = JSON.parse(localStorage.getItem(DB_KEY_CATEGORIES) || '[]');
  categories = categories.filter(c => String(c.id) !== String(id));
  localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
}

// Initialize on script load
initDB();
