import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryNav } from './components/CategoryNav';
import { MenuCard } from './components/MenuCard';
import { FoodDetailsModal } from './components/FoodDetailsModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { CATEGORIES, MENU_ITEMS, MenuItem } from './data';

function App() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => item.categoryId === activeCategory);
  }, [activeCategory]);

  const handleAddToCart = (item: MenuItem, quantity: number, options: any) => {
    let base = item.discountPrice || item.price;
    if (options.selectedVariation !== -1) {
      base += item.variations[options.selectedVariation].price;
    }
    const addonsTotal = options.selectedAddons.reduce((sum: number, index: number) => sum + item.addons[index].price, 0);
    const totalPrice = (base + addonsTotal) * quantity;

    const newCartItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      menuItem: item,
      quantity,
      options,
      totalPrice
    };

    setCartItems([...cartItems, newCartItem]);
    setSelectedItem(null);
    // setIsCartOpen(true); // Automatically open cart? (optional)
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans pb-20 sm:pb-0 relative">
      <Header 
        cartItemCount={cartItems.length} 
        tableNumber="12" 
        onOpenCart={() => setIsCartOpen(true)} 
      />
      
      <main className="max-w-7xl mx-auto sm:px-4 sm:pt-6 relative z-10">
        <div className="sm:rounded-3xl overflow-hidden glass border border-white/10">
          <HeroSection />
          <CategoryNav 
            categories={CATEGORIES} 
            activeCategoryId={activeCategory}
            onSelectCategory={setActiveCategory}
          />
          
          <div className="p-4 sm:p-8 bg-transparent">
            <div className="mb-8 flex justify-between items-end animate-slide-up">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  {CATEGORIES.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-light">Explore our delicious options</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" style={{animationDelay: '100ms'}}>
              {filteredItems.map((item, index) => (
                <div key={item.id} className="animate-scale-in" style={{animationDelay: `${index * 50}ms`}}>
                  <MenuCard 
                    item={item} 
                    onAddClick={setSelectedItem} 
                  />
                </div>
              ))}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-24 text-gray-500">
                <p className="text-xl font-light">No items found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedItem && (
        <FoodDetailsModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}

export default App;
