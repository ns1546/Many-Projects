'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, LayoutGrid, List, PawPrint, Filter, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import toast from 'react-hot-toast';

export default function ClientCategoryProducts({ products }: { products: any[] }) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Newest Arrivals');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);


  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images[0] || '',
      slug: product.slug,
      quantity: 1
    });
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images[0] || '',
        slug: product.slug,
        brand: product.brand
      });
      toast.success('Added to wishlist! ❤️');
    }
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Filter
  const filteredProducts = products.filter(p => {

    if (selectedCategories.length > 0) {
      const match = selectedCategories.some(cat =>
        p.title.toLowerCase().includes(cat.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(cat.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(cat.toLowerCase()))
      );
      if (!match) return false;
    }
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Top Rated') return (b.ratings || 0) - (a.ratings || 0);
    return 0;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-28">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-6 border-b border-gray-100 pb-4">
            <Filter className="h-5 w-5" /> Filters
          </div>

          {/* Filter Categories */}
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex justify-between items-center">
              Product Type <ChevronDown className="h-4 w-4" />
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {['Food', 'Toys', 'Accessories', 'Health', 'Beds', 'Grooming'].map(cat => (
                <li key={cat}>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="group-hover:text-primary transition-colors">{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>



          <button
            onClick={() => setSelectedCategories([])}
            className="w-full py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900 font-bold">{sortedProducts.length}</span> of{' '}
            <span className="text-slate-700">{products.length}</span> products
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer bg-slate-50 font-medium text-slate-700 text-sm"
              >
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <PawPrint className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No products found</h3>
            <p className="text-slate-500 mb-4 text-sm">Try adjusting your filters</p>
            <button
              onClick={() => setSelectedCategories([])}
              className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }>
            {sortedProducts.map((item) => (
              <div key={item.id} className={`bg-white border border-gray-200 flex flex-col group relative hover:shadow-md transition-all duration-200 ${viewMode === 'list' ? 'flex-row' : ''}`}>
                {/* Badges */}
                {item.discountPrice && item.discountPrice < item.price && (
                  <div className="absolute top-2 right-2 z-10 bg-[#e05b5b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    {Math.round(((item.price - item.discountPrice) / item.price) * 100)}%
                  </div>
                )}

                <Link href={`/product/${item.slug}`} className={`flex flex-col flex-1 p-4 items-center text-center ${viewMode === 'list' ? 'flex-row text-left items-start' : ''}`}>
                  {/* Image */}
                  <div className={`w-full aspect-square relative mb-4 ${viewMode === 'list' ? 'w-48 mb-0 mr-4' : ''}`}>
                    {item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-50">🐾</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className={`flex flex-col flex-1 w-full ${viewMode === 'list' ? 'justify-center' : 'items-center'}`}>
                    <h3 className={`text-xs font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-relaxed px-2 font-poppins ${viewMode === 'list' ? 'text-lg px-0' : ''}`}>
                      {item.brand ? `${item.brand} ` : ''}{item.title}
                    </h3>

                    {/* Stars */}
                    <div className={`flex items-center gap-1 mb-2 ${viewMode === 'list' ? '' : 'justify-center'}`}>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            className={`h-3 w-3 ${n <= Math.round(item.ratings || 4) ? 'fill-gray-700 text-gray-700' : 'text-gray-200 fill-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">({item.numOfReviews || 0} Reviews)</span>
                    </div>

                    {/* Price */}
                    <div className={`mt-auto flex flex-col ${viewMode === 'list' ? 'items-start' : 'items-center'}`}>
                      <div className="flex items-center gap-2 text-xs">
                        {item.discountPrice && item.discountPrice < item.price ? (
                          <>
                            <span className="text-gray-400">MRP: <span className="line-through">₹{(item.price * 83).toFixed(2)}</span></span>
                            <span className="font-bold text-gray-900">₹{(item.discountPrice * 83).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900">MRP: ₹{(item.price * 83).toFixed(2)}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-0.5">(Inclu of all Taxes)</span>
                    </div>
                  </div>
                </Link>

                {/* Add to Cart Button */}
                <div className={`p-4 pt-2 mt-auto ${viewMode === 'list' ? 'flex items-center' : ''}`}>
                  <button
                    onClick={(e) => handleAddToCart(item, e)}
                    className="w-full bg-[#f6f6f6] text-gray-700 text-[10px] font-bold py-2.5 uppercase tracking-wide hover:bg-gray-200 transition-colors border border-gray-100 rounded-sm"
                    aria-label="Add to cart"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
