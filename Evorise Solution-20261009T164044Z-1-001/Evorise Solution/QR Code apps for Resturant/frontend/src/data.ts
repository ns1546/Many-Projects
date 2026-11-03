export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  isVegetarian: boolean;
  isPopular: boolean;
  categoryId: string;
  preparationTime: number;
  ingredients: string[];
  allergens: string[];
  variations: { name: string; price: number }[];
  addons: { name: string; price: number }[];
}

export interface Category {
  id: string;
  name: string;
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Popular' },
  { id: '2', name: 'Starters' },
  { id: '3', name: 'Main Course' },
  { id: '4', name: 'Burger' },
  { id: '5', name: 'Pizza' },
  { id: '6', name: 'Drinks' },
  { id: '7', name: 'Desserts' }
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    categoryId: '4',
    name: 'Classic Chicken Burger',
    description: 'Grilled chicken, cheese, lettuce & special sauce.',
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500',
    isVegetarian: false,
    isPopular: true,
    preparationTime: 15,
    ingredients: ['Chicken patty', 'Brioche bun', 'Cheddar cheese', 'Lettuce', 'Tomato', 'House sauce'],
    allergens: ['Gluten', 'Dairy'],
    variations: [
      { name: 'Regular', price: 0 },
      { name: 'Large', price: 80 }
    ],
    addons: [
      { name: 'Extra Cheese', price: 50 },
      { name: 'Extra Patty', price: 120 },
      { name: 'Bacon', price: 80 }
    ]
  },
  {
    id: 'm2',
    categoryId: '5',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil on a crispy crust.',
    price: 650,
    imageUrl: 'https://images.unsplash.com/photo-1604068549290-dea0e4a30536?auto=format&fit=crop&q=80&w=500',
    isVegetarian: true,
    isPopular: true,
    preparationTime: 20,
    ingredients: ['Pizza dough', 'San Marzano tomatoes', 'Fresh mozzarella', 'Basil', 'Olive oil'],
    allergens: ['Gluten', 'Dairy'],
    variations: [
      { name: '10 inch', price: 0 },
      { name: '14 inch', price: 300 }
    ],
    addons: [
      { name: 'Extra Cheese', price: 100 },
      { name: 'Olives', price: 50 }
    ]
  },
  {
    id: 'm3',
    categoryId: '2',
    name: 'Crispy Calamari',
    description: 'Lightly battered and fried squid rings served with tartare sauce.',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1599487405270-87dc34c56b6b?auto=format&fit=crop&q=80&w=500',
    isVegetarian: false,
    isPopular: false,
    preparationTime: 10,
    ingredients: ['Calamari rings', 'Flour', 'Spices', 'Lemon'],
    allergens: ['Seafood', 'Gluten'],
    variations: [],
    addons: []
  },
  {
    id: 'm4',
    categoryId: '3',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with roasted vegetables and lemon butter sauce.',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80&w=500',
    isVegetarian: false,
    isPopular: true,
    preparationTime: 25,
    ingredients: ['Salmon fillet', 'Asparagus', 'Baby potatoes', 'Lemon', 'Butter'],
    allergens: ['Seafood', 'Dairy'],
    variations: [],
    addons: []
  },
  {
    id: 'm5',
    categoryId: '6',
    name: 'Mojito Mocktail',
    description: 'Refreshing mint and lime drink with crushed ice.',
    price: 250,
    discountPrice: 200,
    imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=500',
    isVegetarian: true,
    isPopular: true,
    preparationTime: 5,
    ingredients: ['Mint leaves', 'Lime juice', 'Sugar syrup', 'Soda water'],
    allergens: [],
    variations: [],
    addons: []
  }
];
