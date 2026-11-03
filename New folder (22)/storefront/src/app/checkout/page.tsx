"use client";

import { useCart } from "@/components/CartProvider";
import { useState } from "react";
import { submitOrder } from "./actions";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0 && status !== "success") {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 selection:bg-black selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        <h1 className="text-5xl font-black mb-6 text-center tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>Your curation is empty.</h1>
        <p className="text-gray-500 text-lg text-center mb-10 max-w-md leading-relaxed">Discover objects designed to elevate your everyday rituals.</p>
        <a href="/shop" className="bg-black text-white px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
          Return to Collection
        </a>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center selection:bg-white selection:text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center mb-12 mx-auto relative">
          <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-6">Order Received</p>
        <h1 className="text-5xl md:text-7xl font-serif italic mb-8 font-light">Thank You.</h1>
        <p className="text-white/60 text-lg mb-12 max-w-lg leading-relaxed">
          Your curation is being prepared with uncompromising care. You will receive an email confirmation shortly.
        </p>
        <a href="/" className="bg-white text-black px-12 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors">
          Continue Exploring
        </a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    const tenantId = "tenant_test123";
    try {
      const result = await submitOrder(tenantId, data, items);
      if (result.success) {
        clearCart();
        setStatus("success");
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError("An error occurred while placing your order. Please try again.");
      setStatus("idle");
    }
  }

  const shipping = cartTotal > 250 ? 0 : 25;
  const taxes = cartTotal * 0.08; // Example 8% tax
  const finalTotal = cartTotal + shipping + taxes;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 selection:bg-black selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 h-24 flex items-center justify-center sticky top-0 z-50">
        <a href="/" className="text-[10px] font-black tracking-[0.3em] uppercase text-black hover:opacity-50 transition-opacity">
          Secure Checkout
        </a>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        {/* Left: Checkout Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-16">
            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-medium border border-red-100 flex items-start gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}
            
            <section>
              <div className="flex items-end justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tighter">Contact</h2>
                <a href="/login" className="text-xs font-bold uppercase tracking-[0.1em] border-b border-black pb-0.5">Log in</a>
              </div>
              <div className="space-y-6">
                <div className="relative group">
                   <input required type="email" name="email" id="email" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="Email Address" />
                   <label htmlFor="email" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Email Address</label>
                </div>
                <div className="relative group">
                   <input required type="tel" name="phone" id="phone" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="Phone Number" />
                   <label htmlFor="phone" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Phone Number</label>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black tracking-tighter mb-8">Shipping</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative group">
                     <input required type="text" name="firstName" id="firstName" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="First Name" />
                     <label htmlFor="firstName" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">First Name</label>
                  </div>
                  <div className="relative group">
                     <input required type="text" name="lastName" id="lastName" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="Last Name" />
                     <label htmlFor="lastName" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Last Name</label>
                  </div>
                </div>
                
                <div className="relative group">
                   <input required type="text" name="address" id="address" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="Address" />
                   <label htmlFor="address" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Address</label>
                </div>
                
                <div className="relative group">
                   <input type="text" name="apartment" id="apartment" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="Apartment, suite, etc. (optional)" />
                   <label htmlFor="apartment" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">Apartment, suite, etc. (optional)</label>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="relative group col-span-1">
                     <input required type="text" name="city" id="city" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="City" />
                     <label htmlFor="city" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">City</label>
                  </div>
                  <div className="relative group col-span-1">
                     <input required type="text" name="state" id="state" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="State" />
                     <label htmlFor="state" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">State</label>
                  </div>
                  <div className="relative group col-span-1">
                     <input required type="text" name="zip" id="zip" className="peer w-full bg-transparent border-b-2 border-gray-200 py-4 text-black focus:outline-none focus:border-black transition-colors placeholder-transparent" placeholder="ZIP Code" />
                     <label htmlFor="zip" className="absolute left-0 top-4 text-gray-400 text-sm font-semibold transition-all peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-black peer-focus:uppercase peer-focus:tracking-[0.1em] peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-black peer-not-placeholder-shown:uppercase peer-not-placeholder-shown:tracking-[0.1em]">ZIP Code</label>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black tracking-tighter mb-8">Payment</h2>
              <div className="bg-white border border-gray-200 rounded-[2rem] p-8 flex flex-col gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                    <input type="radio" name="paymentMethod" value="cod" defaultChecked className="peer appearance-none w-full h-full border-2 border-gray-300 rounded-full checked:border-black transition-colors" />
                    <div className="absolute w-3 h-3 bg-black rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="font-bold text-lg text-gray-900 group-hover:text-black transition-colors">Cash on Delivery</span>
                </label>
                
                <div className="w-full h-px bg-gray-100"></div>
                
                <label className="flex items-start gap-4 opacity-50 cursor-not-allowed">
                  <div className="relative flex items-center justify-center w-6 h-6 shrink-0 mt-0.5">
                    <input type="radio" name="paymentMethod" value="card" disabled className="appearance-none w-full h-full border-2 border-gray-300 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-lg text-gray-900">Credit Card</span>
                    <span className="text-sm font-semibold text-gray-400">Currently unavailable for this region.</span>
                  </div>
                </label>
              </div>
            </section>

            <div className="pt-8">
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="w-full bg-black text-white text-[12px] uppercase tracking-[0.2em] font-bold py-6 rounded-full shadow-2xl hover:bg-gray-800 transition disabled:opacity-75 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {status === "submitting" ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Authorizing
                  </span>
                ) : "Confirm & Pay"}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 bg-white p-10 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-gray-100">
            <h2 className="text-3xl font-black tracking-tighter mb-8 font-serif italic">Summary</h2>
            
            <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 items-center">
                  <div className="w-20 h-24 bg-gray-100 rounded-2xl overflow-hidden relative shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-50 flex items-center justify-center"></div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <h4 className="text-sm font-bold leading-tight">{item.name}</h4>
                  </div>
                  <div className="text-sm font-black shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-500 font-semibold">
                <span>Subtotal</span>
                <span className="text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-semibold">
                <span>Shipping</span>
                <span className="text-gray-900">{shipping === 0 ? "Complimentary" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-semibold">
                <span>Taxes (Estimated)</span>
                <span className="text-gray-900">${taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-8 mt-4 border-t-2 border-black text-2xl font-black">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
