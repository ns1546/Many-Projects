'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" /> 
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-semibold text-slate-800">Cart Items ({items.length})</h3>
                  <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear All</button>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1">
                        <Link href={`/product/${item.slug}`} className="font-semibold text-slate-800 hover:text-primary transition-colors text-lg line-clamp-2 mb-1">
                          {item.name}
                        </Link>
                        <div className="text-primary font-bold mb-4">${item.price.toFixed(2)}</div>
                        
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center bg-slate-100 rounded-lg p-1 w-fit">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-slate-800 hidden sm:block">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-28">
                <h3 className="font-semibold text-slate-800 text-lg mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-medium text-primary uppercase text-xs tracking-wider self-center bg-primary/10 px-2 py-1 rounded">Free</span>
                    ) : (
                      <span className="font-medium text-slate-900">${shipping.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax</span>
                    <span className="font-medium text-slate-900">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-extrabold text-slate-900">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Link 
                  href="/checkout" 
                  className="w-full bg-primary text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 mb-4"
                >
                  Proceed to Checkout <ArrowRight className="h-5 w-5" />
                </Link>
                
                <Link 
                  href="/" 
                  className="w-full block text-center text-slate-500 hover:text-primary font-medium text-sm transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
            
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
