'use client';

import Link from 'next/link';
import { Heart, ArrowLeft, Trash2, ShoppingCart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { user } = useAuthStore();
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();
  const addItem = useCartStore(state => state.addItem);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push('/account');
    }
  }, [user, router]);

  if (!mounted || !user) return null;

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.image,
      slug: item.slug,
      quantity: 1
    });
    toast.success('Added to cart!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" /> 
          My Wishlist
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-rose-300 fill-current opacity-50" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-8">Save your favorite items here to view them later.</p>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
                <div className="relative aspect-square bg-slate-50">
                  <Link href={`/product/${item.slug}`} className="absolute inset-0 z-0"></Link>
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button 
                    onClick={() => {
                      removeFromWishlist(item.id);
                      toast.success('Removed from wishlist');
                    }}
                    className="absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5 flex flex-col">
                  <span className="text-xs font-bold tracking-wider text-secondary uppercase mb-1">{item.brand}</span>
                  <Link href={`/product/${item.slug}`} className="block mb-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-1 hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-bold text-lg text-slate-900">${item.price.toFixed(2)}</span>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="bg-slate-100 p-2 rounded-lg text-slate-700 hover:bg-primary hover:text-white transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

