'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Clock, CheckCircle2, Truck, XCircle, RefreshCw, Search, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  Pending:          'bg-yellow-100 text-yellow-700',
  Confirmed:        'bg-blue-100 text-blue-700',
  Processing:       'bg-indigo-100 text-indigo-700',
  Packed:           'bg-purple-100 text-purple-700',
  Shipped:          'bg-cyan-100 text-cyan-700',
  'Out for delivery': 'bg-orange-100 text-orange-700',
  Delivered:        'bg-green-100 text-green-700',
  Cancelled:        'bg-red-100 text-red-700',
};

const ALL_STATUSES = ['Pending','Confirmed','Processing','Packed','Shipped','Out for delivery','Delivered','Cancelled'];
const ITEMS_PER_PAGE = 10;

const getCustomerName = (order: any) => {
  const fName = order.shippingAddress?.firstName;
  const lName = order.shippingAddress?.lastName;
  if (fName || lName) return `${fName || ''} ${lName || ''}`.trim();
  return order.user?.name || 'Guest Customer';
};

const formatOrderTime = (dateString: string) => {
  if (!dateString) return 'Today';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', 
    hour: 'numeric', minute: '2-digit', hour12: true 
  });
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Feature states
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Action states
  const [emailModal, setEmailModal] = useState<{ isOpen: boolean; orderId: string; email: string; customerName: string; body: string }>({
    isOpen: false, orderId: '', email: '', customerName: '', body: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders?limit=1000');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(json.message || 'Failed to update status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to permanently delete this order?')) return;
    setDeletingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setOrders(orders.filter(o => o._id !== orderId));
        toast.success('Order deleted successfully');
      } else {
        toast.error(json.message || 'Failed to delete order');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailModal.email,
          subject: `Update on your Petopia Order #${emailModal.orderId}`,
          body: emailModal.body
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Email sent successfully!');
        setEmailModal(prev => ({ ...prev, isOpen: false }));
      } else {
        toast.error(json.message || 'Failed to send email');
      }
    } catch {
      toast.error('Network error while sending email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    if (activeTab !== 'All' && order.orderStatus !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = getCustomerName(order).toLowerCase();
      const email = (order.shippingAddress?.email || order.user?.email || '').toLowerCase();
      const phone = (order.shippingAddress?.phone || '').toLowerCase();
      const id = (order._id || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !id.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const exportCSV = () => {
    const headers = ['Order ID', 'Date & Time', 'Customer Name', 'Email', 'Phone', 'Status', 'Total ($)'];
    const rows = filteredOrders.map(order => [
      order._id,
      order.createdAt ? formatOrderTime(order.createdAt) : 'N/A',
      getCustomerName(order),
      order.shippingAddress?.email || order.user?.email || 'N/A',
      order.shippingAddress?.phone || 'N/A',
      order.orderStatus || 'Pending',
      (order.totalPrice || 0).toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `petopia_orders_${activeTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported');
  };

  return (
    <div className="pb-12">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage, track, and update customer orders</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCSV} className="btn-outline text-sm flex items-center gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={fetchOrders} className="bg-primary text-white font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-primary-dark">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex-1 w-full max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search by name, email, phone, or order ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 && 's'}
          </div>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200">
          {['All', ...ALL_STATUSES].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-primary text-primary bg-blue-50/30' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          Loading orders...
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShoppingBag className="h-14 w-14 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-700 mb-1">No orders found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your search or tab filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Order ID</p>
                    <p className="font-mono font-semibold text-gray-800 text-xs">#{order._id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Customer</p>
                    <p className="font-medium text-gray-800">{getCustomerName(order)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Time Placed</p>
                    <p className="text-gray-700 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {formatOrderTime(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Total</p>
                    <p className="font-bold text-green-700">${(order.totalPrice || 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                    {order.orderStatus || 'Pending'}
                  </span>
                  <button 
                    onClick={() => deleteOrder(order._id)}
                    disabled={deletingId === order._id}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-3 mb-4">
                  {(order.orderItems || []).slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />}
                      <div>
                        <p className="text-xs font-medium text-gray-800 line-clamp-1 max-w-[140px]">{item.name}</p>
                        <p className="text-[11px] text-gray-500 font-semibold">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {(order.orderItems?.length || 0) > 3 && (
                    <div className="flex items-center px-4 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500">
                      +{order.orderItems.length - 3} more
                    </div>
                  )}
                </div>

                {/* Shipping Address & Details */}
                <div className="text-sm text-gray-600 mb-4 bg-blue-50/30 border border-blue-100 p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-800"><span className="font-semibold text-primary">📦 Ship to:</span> {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}</p>
                      {expandedOrderId === order._id && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                          <div>
                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Contact Info</p>
                            <p><strong>Name:</strong> {getCustomerName(order)}</p>
                            <p><strong>Email:</strong> {order.shippingAddress?.email || order.user?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {order.shippingAddress?.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Shipping Details</p>
                            <p><strong>Postal Code:</strong> {order.shippingAddress?.zip || 'N/A'}</p>
                            {order.notes && <p className="text-amber-700 bg-amber-50 p-2 rounded mt-2 text-xs"><strong>Notes:</strong> {order.notes}</p>}
                          </div>
                          
                          {/* Admin Email Button */}
                          {(order.shippingAddress?.email || order.user?.email) && (
                            <div className="md:col-span-2 pt-2 mt-2 border-t border-gray-100">
                              <button 
                                onClick={() => setEmailModal({
                                  isOpen: true,
                                  orderId: order._id,
                                  email: order.shippingAddress?.email || order.user?.email,
                                  customerName: getCustomerName(order),
                                  body: `Hi ${getCustomerName(order)},\n\nHere is an update regarding your recent order!\n\nTracking Number: ${order._id}\nCurrent Status: ${order.orderStatus}\n\nYou can track your order live at: https://petopia.com/track\n\nThank you for shopping with Petopia!`
                                })}
                                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                              >
                                ✉️ Send Email to Customer
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                      className="text-primary font-bold text-xs hover:underline whitespace-nowrap ml-4 bg-blue-50 px-3 py-1.5 rounded-full"
                    >
                      {expandedOrderId === order._id ? 'Hide Details' : 'View Full Details'}
                    </button>
                  </div>
                  
                  {expandedOrderId === order._id && (order.orderItems?.length || 0) > 0 && (
                    <div className="mt-4 pt-4">
                      <p className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Order Summary</p>
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                        {order.orderItems.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <span className="flex items-center gap-2"><span className="text-gray-400 font-medium">{item.quantity}x</span> {item.name}</span>
                            <span className="font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-gray-200 mt-2 pt-3 text-sm font-bold text-gray-900">
                          <span>Total Paid</span>
                          <span className="text-primary text-lg">${(order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Update */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Update Status:</span>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map(status => (
                      <button
                         key={status}
                        disabled={order.orderStatus === status || updatingId === order._id}
                        onClick={() => updateOrderStatus(order._id, status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                          order.orderStatus === status
                            ? 'border-primary bg-primary text-white cursor-default'
                            : 'border-gray-200 text-gray-600 bg-white hover:border-primary hover:text-primary hover:bg-blue-50 active:scale-95'
                        }`}
                      >
                        {updatingId === order._id && order.orderStatus !== status ? '...' : status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-6">
              <span className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> of <span className="font-bold text-gray-900">{filteredOrders.length}</span> orders
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        currentPage === page 
                          ? 'bg-primary text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Modal */}
      {emailModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Email Customer</h3>
              <button onClick={() => setEmailModal(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-gray-600 transition-colors hover:scale-110">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="p-6">
              <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p><strong>To:</strong> {emailModal.customerName} &lt;{emailModal.email}&gt;</p>
                <p className="mt-1"><strong>Subject:</strong> Update on your Petopia Order #{emailModal.orderId}</p>
              </div>
              <textarea
                className="w-full h-48 p-4 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none shadow-inner"
                value={emailModal.body}
                onChange={e => setEmailModal(prev => ({ ...prev, body: e.target.value }))}
                required
              />
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEmailModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={sendingEmail} className="btn-primary px-6 py-2 text-sm flex items-center gap-2 shadow-sm">
                  {sendingEmail ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
