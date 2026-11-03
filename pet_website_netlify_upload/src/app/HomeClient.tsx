'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

const TABS = ['All', 'Dogs', 'Cats', 'Small Pets'];

export default function HomeClient({ products }: { products: any[] }) {
  const addItem = useCartStore(state => state.addItem);
  const [wishlisted, setWishlisted] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = activeTab === 'All'
    ? products
    : products.filter(p =>
        p.title?.toLowerCase().includes(activeTab.toLowerCase()) ||
        p.brand?.toLowerCase().includes(activeTab.toLowerCase())
      );

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.title,
      price: product.discountPrice || product.price,
      image: product.images[0] || '',
      slug: product.slug,
      quantity: 1
    });
    toast.success(`Added to cart!`, { duration: 2000 });
  };

  const handleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isWishlisted = wishlisted.includes(productId);
    setWishlisted(prev =>
      isWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!', { duration: 1500 });
  };

  const discountPct = (p: any) =>
    p.discountPrice && p.discountPrice > p.price
      ? Math.round(((p.discountPrice - p.price) / p.discountPrice) * 100)
      : null;

  return (
    <div>


      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-4 py-16 text-center">
            <div className="text-5xl mb-3">🐾</div>
            <p className="text-gray-500 font-medium">No products found for "{activeTab}"</p>
            <button onClick={() => setActiveTab('All')} className="mt-3 text-primary text-sm font-semibold hover:underline">
              View all products
            </button>
          </div>
        ) : (
          filtered.map((product, idx) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 flex flex-col group relative hover:shadow-md transition-all duration-200"
            >
              {/* Badges */}
              {discountPct(product) && (
                <div className="absolute top-2 right-2 z-10 bg-[#e05b5b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  {discountPct(product)}%
                </div>
              )}

              <Link href={`/product/${product.slug}`} className="flex flex-col flex-1 p-4 items-center text-center">
                {/* Image */}
                <div className="w-full aspect-square relative mb-4">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-50">🐾</div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-relaxed px-2 font-poppins">
                  {product.brand ? `${product.brand} ` : ''}{product.title}
                </h3>

                {/* Stars */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        className={`h-3 w-3 ${n <= Math.round(product.ratings || 4) ? 'fill-gray-700 text-gray-700' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">({product.numOfReviews || 0} Reviews)</span>
                </div>

                {/* Price */}
                <div className="mt-auto flex flex-col items-center">
                  <div className="flex items-center gap-2 text-xs">
                    {product.discountPrice && product.discountPrice < product.price ? (
                      <>
                        <span className="text-gray-400">MRP: <span className="line-through">₹{(product.price * 83).toFixed(2)}</span></span>
                        <span className="font-bold text-gray-900">₹{(product.discountPrice * 83).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">MRP: ₹{(product.price * 83).toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5">(Inclu of all Taxes)</span>
                </div>
              </Link>

              {/* Add to Cart Button */}
              <div className="p-4 pt-2 mt-auto">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="w-full bg-[#f6f6f6] text-gray-700 text-[10px] font-bold py-2.5 uppercase tracking-wide hover:bg-gray-200 transition-colors border border-gray-100 rounded-sm"
                  aria-label="Add to cart"
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
