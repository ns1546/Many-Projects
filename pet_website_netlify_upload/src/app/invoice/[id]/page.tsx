'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { Package, Printer } from 'lucide-react';
import Link from 'next/link';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/track/${resolvedParams.id}`);
        const json = await res.json();
        if (json.success) setOrder(json.data);
      } catch (e) {
        console.error("Error fetching invoice", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading invoice...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
        <p className="text-gray-500 mb-6">We couldn't find the requested invoice.</p>
        <Link href="/account" className="btn-primary">Return to Account</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Action Bar (Hidden when printing) */}
        <div className="bg-gray-100 px-8 py-4 border-b border-gray-200 flex justify-between items-center print:hidden">
          <Link href="/account" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            &larr; Back to Orders
          </Link>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Printer className="h-4 w-4" /> Print Invoice
          </button>
        </div>

        {/* Invoice Content */}
        <div className="p-8 sm:p-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-8 w-8 text-primary" />
                <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Petopia</span>
              </div>
              <p className="text-sm text-gray-500">123 Pet Street, Suite 100</p>
              <p className="text-sm text-gray-500">San Francisco, CA 94103</p>
              <p className="text-sm text-gray-500">support@petopia.com</p>
            </div>
            <div className="text-left sm:text-right">
              <h2 className="text-3xl font-light text-gray-900 mb-2 uppercase tracking-widest">Invoice</h2>
              <p className="text-sm font-bold text-gray-800">#{order._id}</p>
              <p className="text-sm text-gray-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Status: <span className="font-medium text-gray-800">{order.orderStatus}</span></p>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="text-sm font-semibold text-gray-900">{order.user?.name || order.shippingAddress?.firstName + ' ' + order.shippingAddress?.lastName}</p>
              <p className="text-sm text-gray-500">{order.user?.email}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipped To</h3>
              <p className="text-sm font-semibold text-gray-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress?.street}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p className="text-sm text-gray-500">{order.shippingAddress?.country}</p>
              {order.shippingAddress?.phone && <p className="text-sm text-gray-500 mt-1">{order.shippingAddress?.phone}</p>}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">Item Description</th>
                  <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                  <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Price</th>
                  <th className="py-3 px-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(order.orderItems || []).map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4 px-2 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="py-4 px-2 text-sm text-gray-600 text-center">{item.quantity}</td>
                    <td className="py-4 px-2 text-sm text-gray-600 text-right">${Number(item.price).toFixed(2)}</td>
                    <td className="py-4 px-2 text-sm text-gray-900 font-bold text-right">${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end border-t border-gray-200 pt-6">
            <div className="w-full sm:w-1/2 md:w-1/3 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${order.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>${order.shippingPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>${order.taxPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Thank you for shopping with Petopia!</p>
            <p>If you have any questions concerning this invoice, contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
