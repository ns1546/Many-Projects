"use client";

import { useCart } from "./CartProvider";

export function CartSidebar({ currency = "$" }: { currency?: string }) {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeItem, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-100 transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#fafafa] shadow-[0_0_40px_rgba(0,0,0,0.1)] z-101 flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] selection:bg-black selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200">
          <h2 className="text-3xl font-black tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>Your Curation</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-3 hover:bg-white rounded-full transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-90 transition-transform duration-300"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              </div>
              <p className="text-lg font-medium">Your curation is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 border-black pb-1 text-black hover:text-gray-500 hover:border-gray-500 transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-6 items-center group">
                <div className="w-24 h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0 relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-tr from-gray-200 to-gray-50 flex items-center justify-center"></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm leading-snug">{item.name}</h3>
                  </div>
                  
                  <div className="text-sm font-black">{currency}{(item.price * item.quantity).toFixed(2)}</div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-white border border-gray-200 rounded-full h-8">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-l-full transition-colors"
                      >-</button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 rounded-r-full transition-colors"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-8 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
                <span>Subtotal</span>
                <span>{currency}{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="w-full h-px bg-gray-100"></div>
              <div className="flex justify-between items-center text-xl font-black">
                <span>Total</span>
                <span>{currency}{cartTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <a 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-black text-white text-center py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors relative overflow-hidden"
            >
              Secure Checkout
            </a>
            
            <div className="mt-6 flex justify-center gap-6 opacity-40 grayscale">
              {/* Mock payment icons */}
              <div className="w-8 h-5 bg-gray-200 rounded"></div>
              <div className="w-8 h-5 bg-gray-200 rounded"></div>
              <div className="w-8 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
