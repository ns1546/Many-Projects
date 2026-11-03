'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Package, MapPin, CheckCircle2, Clock, Truck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // Auto-track if ID is passed in URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setTrackingId(id);
      fetchOrder(id);
    }
  }, []);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return toast.error('Please enter a tracking number');
    
    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch(`/api/track/${id.trim()}`);
      const json = await res.json();
      
      if (json.success) {
        setOrder(json.data);
      } else {
        toast.error(json.message || 'Order not found');
      }
    } catch {
      toast.error('Network error while tracking order');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(trackingId);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Delivered') return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    if (status === 'Shipped' || status === 'Out for delivery') return <Truck className="h-6 w-6 text-blue-500" />;
    return <Clock className="h-6 w-6 text-amber-500" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Track Your Order</h1>
          <p className="text-slate-600 max-w-lg mx-auto">Enter your Order ID below to check the real-time shipping status and delivery updates for your package.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                placeholder="Enter Tracking Number (e.g., 64f1...)"
                className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-sm hover:bg-primary-dark transition-all disabled:opacity-70 flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Track Order'}
            </button>
          </form>
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Order Number</p>
                  <p className="font-mono font-bold text-lg text-slate-900">#{order._id}</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                  {getStatusIcon(order.orderStatus)}
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current Status</p>
                    <p className="font-bold text-slate-900">{order.orderStatus || 'Pending'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative mt-8 mb-4">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
                  <div style={{ width: order.orderStatus === 'Pending' ? '25%' : order.orderStatus === 'Shipped' ? '60%' : order.orderStatus === 'Delivered' ? '100%' : '10%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
              {/* Delivery Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 space-y-1">
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                  <p>{order.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Order Items
                </h3>
                <div className="space-y-3">
                  {(order.orderItems || []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-xs">{item.quantity}x</span>
                        <span className="text-slate-800 font-medium line-clamp-1">{item.name}</span>
                      </div>
                      <span className="text-slate-600 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-100 pt-3 mt-3 flex justify-between font-bold text-slate-900">
                    <span>Total Paid</span>
                    <span>${order.totalPrice?.toFixed(2)}</span>
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
