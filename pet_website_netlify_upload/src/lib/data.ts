import { adminDb } from './firebase-admin';

// ─── In-memory fallback data when Firebase is completely empty ───────────
export const MOCK_PRODUCTS: any[] = [
  {
    _id: 'prod_1',
    title: 'Premium Grain-Free Dry Dog Food - 15kg',
    slug: 'premium-grain-free-dry-dog-food',
    brand: 'Royal Canin',
    category: { name: 'Dogs', slug: 'dogs' },
    price: 45.99,
    discountPrice: 59.99,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80'],
    description: 'High quality grain-free dog food perfect for adult dogs. Made with real chicken and vegetables for optimal health.',
    ratings: 4.8,
    numOfReviews: 124,
    isFeatured: true,
    createdAt: new Date(),
  },
  {
    _id: 'prod_2',
    title: 'Interactive Chew Toy for Aggressive Chewers',
    slug: 'interactive-chew-toy',
    brand: 'ToughPaws',
    category: { name: 'Dogs', slug: 'dogs' },
    price: 12.99,
    stock: 50,
    images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&q=80'],
    description: 'Durable chew toy that will keep your pet entertained for hours. Made from natural rubber.',
    ratings: 4.5,
    numOfReviews: 89,
    isFeatured: false,
    createdAt: new Date(Date.now() - 100000),
  },
  {
    _id: 'prod_3',
    title: 'Orthopedic Memory Foam Pet Bed',
    slug: 'orthopedic-memory-foam-bed',
    brand: 'SleepyPets',
    category: { name: 'Dogs', slug: 'dogs' },
    price: 89.99,
    discountPrice: 110.00,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80'],
    description: 'Luxurious memory foam bed for maximum comfort and joint support. Perfect for older pets.',
    ratings: 4.9,
    numOfReviews: 215,
    isFeatured: true,
    createdAt: new Date(Date.now() - 200000),
  },
  {
    _id: 'prod_4',
    title: 'Self-Cleaning Cat Litter Box',
    slug: 'self-cleaning-cat-litter-box',
    brand: 'KittyTech',
    category: { name: 'Cats', slug: 'cats' },
    price: 199.99,
    stock: 5,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80'],
    description: 'Automatic self-cleaning litter box that does the dirty work for you. Odor control system included.',
    ratings: 4.2,
    numOfReviews: 56,
    isFeatured: true,
    createdAt: new Date(Date.now() - 300000),
  },
  {
    _id: 'prod_5',
    title: 'Natural Catnip Blend - 2oz',
    slug: 'natural-catnip-blend',
    brand: 'HappyCat',
    category: { name: 'Cats', slug: 'cats' },
    price: 8.99,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80'],
    description: '100% organic, highly potent catnip blend. Hand-harvested for maximum freshness.',
    ratings: 4.7,
    numOfReviews: 342,
    isFeatured: false,
    createdAt: new Date(Date.now() - 400000),
  },
  {
    _id: 'prod_6',
    title: 'Premium Aquarium Starter Kit - 20 Gallon',
    slug: 'premium-aquarium-starter-kit',
    brand: 'AquaLife',
    category: { name: 'Fish', slug: 'fish' },
    price: 129.99,
    discountPrice: 115.00,
    stock: 8,
    images: ['https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=800&q=80'],
    description: 'Complete 20-gallon aquarium kit including LED lighting, power filter, heater, and fish net.',
    ratings: 4.6,
    numOfReviews: 45,
    isFeatured: false,
    createdAt: new Date(Date.now() - 500000),
  },
  {
    _id: 'prod_7',
    title: 'Gourmet Bird Seed Mix - 5lbs',
    slug: 'gourmet-bird-seed-mix',
    brand: 'FeatherFriends',
    category: { name: 'Birds', slug: 'birds' },
    price: 15.99,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1552728089-5716900f0744?w=800&q=80'],
    description: 'Nutritious blend of seeds, nuts, and dried fruits suitable for most parrot species.',
    ratings: 4.9,
    numOfReviews: 78,
    isFeatured: false,
    createdAt: new Date(Date.now() - 600000),
  },
  {
    _id: 'prod_8',
    title: 'Large Guinea Pig/Rabbit Cage',
    slug: 'large-small-pet-cage',
    brand: 'CritterHome',
    category: { name: 'Small Pets', slug: 'small-pets' },
    price: 65.99,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80'],
    description: 'Spacious habitat with deep base to prevent messes. Includes water bottle and food dish.',
    ratings: 4.3,
    numOfReviews: 23,
    isFeatured: false,
    createdAt: new Date(Date.now() - 700000),
  },
];

export function getAllMockProducts() {
  return [...MOCK_PRODUCTS];
}

export const MOCK_BRANDS = [
  { _id: 'b1', name: 'Royal Canin', slug: 'royal-canin', imageUrl: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc1a2?w=400&q=80', description: 'Premium pet nutrition' },
  { _id: 'b2', name: 'ToughPaws', slug: 'toughpaws', imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80', description: 'Durable pet toys' },
  { _id: 'b3', name: 'SleepyPets', slug: 'sleepypets', imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80', description: 'Orthopedic pet beds' },
  { _id: 'b4', name: 'KittyTech', slug: 'kittytech', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80', description: 'Smart cat litter boxes' },
  { _id: 'b5', name: 'HappyCat', slug: 'happycat', imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80', description: 'Organic catnip blends' },
  { _id: 'b6', name: 'AquaLife', slug: 'aqualife', imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&q=80', description: 'Premium aquariums' },
];

// ─── Products Fetching (Server-Side) ──────────────────────────────────────────

const FETCH_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number = FETCH_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Firebase request timed out after ${ms}ms`)), ms)
    )
  ]);
}

export async function getLatestProducts(limit = 8) {
  try {
    const snapshot = await withTimeout<any>(adminDb.collection('products')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get());
    
    if (snapshot.empty) return MOCK_PRODUCTS.slice(0, limit);
    
    return snapshot.docs.map((doc: any) => ({ _id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return MOCK_PRODUCTS.slice(0, limit);
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const snapshot = await withTimeout<any>(adminDb.collection('products').where('slug', '==', slug).limit(1).get());
    if (snapshot.empty) return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
    
    return { _id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }
}

export async function getAllProducts() {
  try {
    const snapshot = await withTimeout<any>(adminDb.collection('products').orderBy('createdAt', 'desc').get());
    if (snapshot.empty) return [...MOCK_PRODUCTS];
    
    return snapshot.docs.map((doc: any) => ({ _id: doc.id, ...doc.data() }));
  } catch (error) {
    return [...MOCK_PRODUCTS];
  }
}

export async function getProductsByCategory(slug: string) {
  try {
    const snapshot = await withTimeout<any>(adminDb.collection('products').where('category.slug', '==', slug).get());
    
    if (snapshot.empty) {
      return MOCK_PRODUCTS.filter(p => p.category?.slug === slug || p.category?.name?.toLowerCase() === slug.toLowerCase());
    }
    
    return snapshot.docs.map((doc: any) => ({ _id: doc.id, ...doc.data() }));
  } catch (error) {
    return MOCK_PRODUCTS.filter(p => p.category?.slug === slug || p.category?.name?.toLowerCase() === slug.toLowerCase());
  }
}

export async function getBrands(): Promise<any[]> {
  try {
    const snapshot = await withTimeout<any>(adminDb.collection('brands').orderBy('name', 'asc').get());
    if (snapshot.empty) return [...MOCK_BRANDS];
    
    return snapshot.docs.map((doc: any) => ({ _id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [...MOCK_BRANDS];
  }
}

// ─── Dashboard Stats (Server-Side) ──────────────────────────────────────────

export async function getDashboardStats() {
  try {
    const [ordersSnapshot, productsSnapshot, usersSnapshot, recentOrdersSnapshot] = await Promise.all([
      withTimeout<any>(adminDb.collection('orders').count().get()),
      withTimeout<any>(adminDb.collection('products').count().get()),
      withTimeout<any>(adminDb.collection('users').count().get()),
      withTimeout<any>(adminDb.collection('orders').orderBy('createdAt', 'desc').limit(5).get())
    ]);

    const allOrdersSnapshot = await withTimeout<any>(adminDb.collection('orders').get());
    const totalRevenue = allOrdersSnapshot.docs.reduce((sum: any, doc: any) => {
      const data = doc.data();
      return data.isPaid ? sum + (data.totalPrice || 0) : sum;
    }, 0);

    return {
      totalOrders: ordersSnapshot.data().count,
      totalProducts: productsSnapshot.data().count,
      totalUsers: usersSnapshot.data().count,
      orders: recentOrdersSnapshot.docs.map((doc: any) => ({ _id: doc.id, ...doc.data() })),
      totalRevenue
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalOrders: 0, totalProducts: 0, totalUsers: 0,
      orders: [], totalRevenue: 0,
    };
  }
}
