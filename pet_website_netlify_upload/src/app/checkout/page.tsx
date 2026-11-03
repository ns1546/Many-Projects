'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, MapPin, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCartStore } from '@/store/useCartStore';

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const subtotal = getCartTotal();
  const [shippingZone, setShippingZone] = useState('inside');
  const shipping = shippingZone === 'inside' ? 80 : 120;
  const total = subtotal + shipping;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    notes: ''
  });
  const [orderedItems, setOrderedItems] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderId, setOrderId] = useState('');


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items,
          address: formData,
          itemsPrice: subtotal,
          taxPrice: 0,
          shippingPrice: shipping,
          totalPrice: total
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error('Failed to place order');

      const newOrderId = json.data._id || 'ORD-' + Math.floor(Math.random() * 10000);
      setOrderId(newOrderId);
      setOrderedItems([...items]);
      setOrderTotal(total);



      // Clear cart on successful order
      clearCart();
      setStep(3);
    } catch (error) {
      console.error(error);
      alert('There was an issue placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="grow flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
            <Link href="/" className="btn-primary">Return to Shop</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
              </div>
              <span className="text-sm font-medium">Shipping Info</span>
            </div>
            <div className={`w-24 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
              <span className="text-sm font-medium">Order Review</span>
            </div>
            <div className={`w-24 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-primary' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                3
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {step === 3 ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 text-center mb-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Order Placed Successfully!</h2>
              <p className="text-slate-600 mb-8">
                Thank you for your purchase. Your order number is <span className="font-bold text-slate-900">#{orderId}</span>.
                We'll send you an email confirmation with tracking details once your items ship.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
                <div className="bg-slate-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-2">Delivery Details</h4>
                  <p className="text-sm text-slate-600 mb-1"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p className="text-sm text-slate-600 mb-1"><strong>Address:</strong> {formData.street}, {formData.city}, {formData.state} {formData.zip}</p>
                  <p className="text-sm text-slate-600 mb-1"><strong>Phone:</strong> {formData.phone}</p>
                  <p className="text-sm text-slate-600"><strong>Payment:</strong> Cash on Delivery (COD)</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-2">Order Summary</h4>
                  <div className="space-y-3 max-h-[120px] overflow-y-auto mb-3">
                    {orderedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600 truncate pr-4">{item.quantity}x {item.name}</span>
                        <span className="text-slate-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                    <span>Total Paid</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href="/" className="btn-primary inline-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Form Area */}
            <div className="lg:col-span-2">
              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handlePlaceOrder}>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                  <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-slate-800">Shipping Information</h2>
                  </div>

                  <div className={`p-6 space-y-6 ${step !== 1 ? 'hidden' : 'block'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                        <input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="input-field" placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                        <input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="input-field" placeholder="Doe" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                        <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="input-field" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                        <input required name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="input-field" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Street Address *</label>
                      <input required name="street" value={formData.street} onChange={handleInputChange} type="text" className="input-field" placeholder="123 Main St, Apt 4B" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                        <input required name="city" value={formData.city} onChange={handleInputChange} type="text" className="input-field" placeholder="New York" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">State/Province *</label>
                        <input required name="state" value={formData.state} onChange={handleInputChange} type="text" className="input-field" placeholder="NY" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">ZIP / Postal Code *</label>
                        <input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" className="input-field" placeholder="10001" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Order Notes (Optional)</label>
                      <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="input-field h-24 resize-none" placeholder="Special instructions for delivery..."></textarea>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button type="submit" className="btn-primary px-8">Continue to Review</button>
                    </div>
                  </div>

                  {/* Minified view when on step 2 */}
                  {step === 2 && (
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-800">{formData.firstName} {formData.lastName}</p>
                          <p className="text-slate-600 text-sm">{formData.street}, {formData.city}, {formData.state} {formData.zip}</p>
                          <p className="text-slate-600 text-sm">{formData.email} • {formData.phone}</p>
                        </div>
                        <button type="button" onClick={() => setStep(1)} className="text-sm text-primary font-medium hover:underline">Edit</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 ${step === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="p-6 border-b border-gray-100 bg-slate-50/50 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-slate-800">Payment Method</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start p-4 border-2 border-primary rounded-xl bg-primary/5">
                      <input type="radio" name="payment" value="cod" className="w-5 h-5 text-primary mt-1" checked readOnly />
                      <div className="ml-4 flex-1">
                        <span className="block font-bold text-slate-800 text-lg">Cash on Delivery (COD)</span>
                        <span className="block text-sm text-slate-500 mt-1">Pay with cash when your order is delivered to your doorstep. Safe and secure.</span>
                        
                        <div className="flex flex-col gap-3 mt-4 border-t border-primary/20 pt-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="shippingZone" value="inside" checked={shippingZone === 'inside'} onChange={() => setShippingZone('inside')} className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-slate-800">Inside Dhaka (80 Tk)</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="radio" name="shippingZone" value="outside" checked={shippingZone === 'outside'} onChange={() => setShippingZone('outside')} className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-slate-800">Outside Dhaka (120 Tk)</span>
                          </label>
                        </div>
                      </div>
                      <ShieldCheck className="h-8 w-8 text-primary opacity-50" />
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                      * Due to high demand, we are currently only accepting Cash on Delivery orders to ensure successful fulfillment.
                    </p>
                  </div>
                </div>

                {step === 2 && (
                  <div className="flex justify-between mt-8">
                    <button type="button" onClick={() => setStep(1)} className="btn-outline" disabled={loading}>Back</button>
                    <button type="submit" disabled={loading} className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all text-lg flex items-center gap-2">
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-28">
                <h3 className="font-bold text-slate-800 text-lg mb-6 border-b border-gray-100 pb-4">Order Review</h3>

                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-md overflow-hidden border border-slate-100 shrink-0 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-2 -right-2 bg-slate-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-slate-800 line-clamp-2">{item.name}</p>
                        <p className="text-slate-500 mt-1">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6 pt-4 border-t border-slate-100 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping ({shippingZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                    <span className="font-medium text-slate-900">${shipping.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
