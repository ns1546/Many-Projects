'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Package, User, MapPin, LogOut, Loader2, Heart, 
  ShoppingBag, ChevronRight, Star, Edit2, Plus, Bell, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile as firebaseUpdateProfile, signInWithPopup, signOut } from 'firebase/auth';

export default function AccountPage() {
  const { user, login, logout } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [profileData, setProfileData] = useState({ name: '', phone: '', dob: '' });
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zipCode: '', country: 'United States' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({ ...prev, name: user.name }));
      
      const fetchProfileData = async () => {
        try {
          const profileRes = await fetch('/api/users/profile');
          const profileJson = await profileRes.json();
          if (profileJson.success) {
            setProfileData({
              name: profileJson.data.name || user.name,
              phone: profileJson.data.phone || '',
              dob: profileJson.data.dob || ''
            });
            setAddresses(profileJson.data.addresses || []);
          }
        } catch (e) {
          console.error("Failed to load profile:", e);
        }
      };
      fetchProfileData();
      
      const fetchMyOrders = async () => {
        setOrdersLoading(true);
        try {
          // get token from cookies or store if needed, let's rely on cookies since the API gets it from request
          const res = await fetch('/api/orders/me');
          const json = await res.json();
          if (json.success) {
            setOrders(json.data);
          }
        } catch (err) {
          console.error("Failed to load user orders:", err);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchMyOrders();
    }
  }, [user]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await firebaseUpdateProfile(userCredential.user, { displayName: formData.name });
      }

      const user = userCredential.user;
      const token = await user.getIdToken();
      
      const isAdmin = user.email === 'admin@petopia.com';
      login({ id: user.uid, name: user.displayName || formData.name || 'User', email: user.email!, isAdmin }, token);

      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;

      toast.success(isLogin ? "Welcome back! 🐾" : "Account created! Welcome to Petopia 🎉");
      setFormData({ name: '', email: '', password: '' });
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const token = await user.getIdToken();
      
      const isAdmin = user.email === 'admin@petopia.com';
      login({ id: user.uid, name: user.displayName || 'User', email: user.email!, isAdmin }, token);

      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
      toast.success("Signed in with Google! 🐾");
    } catch (error: any) {
      toast.error(error.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = 'token=; Max-Age=0; path=/';
    logout();
    toast.success("Logged out successfully");
  };

  const updateProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Profile updated successfully! ✅');
        if (user) {
          login({ ...user, name: profileData.name }, null as any); // token unchanged
        }
      } else {
        toast.error(json.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Network error. Failed to update profile');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      const json = await res.json();
      if (json.success) {
        setAddresses(json.data);
        setShowAddressForm(false);
        setAddressForm({ street: '', city: '', state: '', zipCode: '', country: 'United States' });
        toast.success('Address added successfully');
      }
    } catch (e) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/users/addresses/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setAddresses(json.data);
        toast.success('Address removed');
      }
    } catch (e) {
      toast.error('Failed to remove address');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords don't match!");
    }
    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(json.message || 'Failed to update password');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) return;
    try {
      const res = await fetch('/api/users/profile', { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Account deleted successfully');
        logout();
      } else {
        toast.error(json.message || 'Failed to delete account');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="grow flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                Sign In
              </button>
              <button onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                Create Account
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isLogin ? 'Welcome back' : 'Join Petopia'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {isLogin ? 'Sign in to manage your orders & profile' : 'Create your free account today'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleChange} type="text"
                      className="input-field" placeholder="John Doe" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email"
                    className="input-field" placeholder="you@example.com" />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    {isLogin && <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>}
                  </div>
                  <input required name="password" value={formData.password} onChange={handleChange} type="password"
                    className="input-field" placeholder="••••••••" />
                </div>

                {!isLogin && (
                  <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 rounded border-gray-300" required />
                    I agree to the <Link href="/" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/" className="text-primary hover:underline">Privacy Policy</Link>
                  </label>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 mt-2">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isLogin ? 'Sign In to Account' : 'Create Free Account'}
                </button>
              </form>

              <div className="mt-4 mb-4 relative flex items-center justify-center">
                <div className="border-t border-gray-200 w-full absolute"></div>
                <span className="bg-white px-3 text-xs text-gray-400 relative z-10 font-medium uppercase tracking-wider">Or continue with</span>
              </div>

              <button 
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              {isLogin && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-blue-700">
                    💡 <strong>Demo:</strong> Enter any email & password to sign in. Use "admin@petopia.com" for admin access.
                  </p>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: '📦', text: 'Track Orders' },
                { icon: '❤️', text: 'Save Wishlist' },
                { icon: '💰', text: 'Exclusive Deals' },
              ].map(b => (
                <div key={b.text} className="bg-white rounded-xl p-3 text-center border border-gray-200 text-sm">
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="text-gray-600 font-medium text-xs">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  const sidebarTabs = [
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: null },
    { id: 'profile', label: 'My Profile', icon: User, badge: null },
    { id: 'address', label: 'Addresses', icon: MapPin, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-1">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">My Account</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-primary text-white font-bold text-lg rounded-full flex items-center justify-center uppercase">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">{user.name}</h2>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.isAdmin && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg text-center">
                <div><p className="font-bold text-gray-900 text-sm">{orders.length}</p><p className="text-xs text-gray-500">Orders</p></div>
                <div><p className="font-bold text-gray-900 text-sm">0</p><p className="text-xs text-gray-500">Wishlist</p></div>
                <div><p className="font-bold text-gray-900 text-sm">0</p><p className="text-xs text-gray-500">Reviews</p></div>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <nav>
                {sidebarTabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors border-l-2 ${
                      activeTab === tab.id
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                    <span className="flex items-center gap-3">
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </span>
                    {tab.badge !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="border-t border-gray-100">
                {user.isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                    <Package className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* MY ORDERS */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Order History</h2>
                  <span className="text-sm text-gray-500">{orders.length} orders</span>
                </div>
                {ordersLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading your orders...</div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <ShoppingBag className="h-14 w-14 text-gray-200 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-1">No orders yet</h3>
                    <p className="text-gray-500 text-sm mb-4">You haven't placed any orders.</p>
                    <Link href="/shop" className="btn-primary text-sm">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                        {/* Order header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span><span className="font-semibold text-gray-700">Order</span> #{order._id}</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>{order.orderItems?.length || 0} items</span>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{order.orderStatus || 'Pending'}</span>
                        </div>
                        {/* Order body */}
                        <div className="p-5 flex flex-col sm:flex-row items-start gap-4">
                          {order.orderItems && order.orderItems[0] ? (
                            <img src={order.orderItems[0].image} alt={order.orderItems[0].name} className="w-16 h-16 rounded-lg object-cover border border-gray-100" />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200"><Package className="h-6 w-6 text-gray-400" /></div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{order.orderItems?.[0]?.name || 'Unknown item'}</p>
                            {(order.orderItems?.length || 1) > 1 && (
                              <p className="text-xs text-gray-500 mt-0.5">+ {order.orderItems.length - 1} more items</p>
                            )}
                            <p className="font-bold text-gray-900 mt-2">${(order.totalPrice || 0).toFixed(2)}</p>
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                            <Link href={`/track?id=${order._id}`}
                              className="btn-primary text-xs py-2 px-4 text-center block w-full sm:w-auto">
                              Track Order
                            </Link>
                            <Link href={`/invoice/${order._id}`} target="_blank"
                              className="btn-outline text-xs py-2 px-4 text-center block w-full sm:w-auto">
                              Invoice
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">My Wishlist</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                  <Heart className="h-14 w-14 text-gray-200 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-1">Your wishlist is empty</h3>
                  <p className="text-gray-500 text-sm mb-4">Save your favorite products to view them later</p>
                  <Link href="/shop" className="btn-primary text-sm">Browse Products</Link>
                </div>
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">My Profile</h2>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div className="h-16 w-16 bg-primary text-white font-bold text-2xl rounded-full flex items-center justify-center uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button className="ml-auto btn-outline text-xs py-2">
                      <Edit2 className="h-3.5 w-3.5" /> Change Photo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input type="text" className="input-field" value={profileData.name}
                        onChange={e => setProfileData(p => ({...p, name: e.target.value}))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input type="email" className="input-field bg-gray-50 cursor-not-allowed" value={user.email} readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                      <input type="tel" className="input-field" value={profileData.phone}
                        onChange={e => setProfileData(p => ({...p, phone: e.target.value}))} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                      <input type="date" className="input-field" value={profileData.dob}
                        onChange={e => setProfileData(p => ({...p, dob: e.target.value}))} />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={updateProfile} className="btn-primary text-sm">
                      Save Changes
                    </button>
                    <button onClick={() => setProfileData({ name: user.name, phone: '', dob: '' })} className="btn-outline text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESS */}
            {activeTab === 'address' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                  {!showAddressForm && (
                    <button onClick={() => setShowAddressForm(true)} className="btn-primary text-xs py-2 px-4">
                      <Plus className="h-3.5 w-3.5" /> Add Address
                    </button>
                  )}
                </div>
                
                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                        <input required value={addressForm.street} onChange={e=>setAddressForm({...addressForm, street: e.target.value})} type="text" className="input-field" placeholder="123 Pet Lane" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                        <input required value={addressForm.city} onChange={e=>setAddressForm({...addressForm, city: e.target.value})} type="text" className="input-field" placeholder="New York" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                        <input required value={addressForm.state} onChange={e=>setAddressForm({...addressForm, state: e.target.value})} type="text" className="input-field" placeholder="NY" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Zip Code</label>
                        <input required value={addressForm.zipCode} onChange={e=>setAddressForm({...addressForm, zipCode: e.target.value})} type="text" className="input-field" placeholder="10001" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="submit" className="btn-primary text-sm py-2">Save Address</button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline text-sm py-2">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr._id} className={`bg-white rounded-xl border-2 p-5 relative ${addr.isDefault ? 'border-primary' : 'border-gray-200'}`}>
                        {addr.isDefault && <span className="absolute top-3 right-3 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">DEFAULT</span>}
                        <p className="font-semibold text-gray-900 mb-1">{user.name}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {addr.street}<br />
                          {addr.city}, {addr.state} {addr.zipCode}<br />
                          {addr.country}
                        </p>
                        <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                          <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-500 text-xs font-semibold hover:underline">Delete</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowAddressForm(true)}
                      className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-blue-50 transition-all min-h-[160px]">
                      <Plus className="h-8 w-8 mb-2" />
                      <span className="font-medium text-sm">Add New Address</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h2>
                <div className="space-y-4">
                  {/* Notifications */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" /> Email Notifications
                    </h3>
                    {[
                      { label: 'Order updates & tracking', desc: 'Get notified about your order status' },
                      { label: 'Promotions & deals', desc: 'Receive exclusive offers and discounts' },
                      { label: 'Pet care tips', desc: 'Weekly tips from our vet partners' },
                    ].map((item, i) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={i === 0} className="sr-only peer" />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Password */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordUpdate} className="space-y-3 max-w-sm">
                      <input required value={passwordForm.currentPassword} onChange={e=>setPasswordForm({...passwordForm, currentPassword: e.target.value})} type="password" className="input-field" placeholder="Current password" />
                      <input required value={passwordForm.newPassword} onChange={e=>setPasswordForm({...passwordForm, newPassword: e.target.value})} type="password" className="input-field" placeholder="New password" />
                      <input required value={passwordForm.confirmPassword} onChange={e=>setPasswordForm({...passwordForm, confirmPassword: e.target.value})} type="password" className="input-field" placeholder="Confirm new password" />
                      <button type="submit" className="btn-primary text-sm mt-2 w-full">Update Password</button>
                    </form>
                  </div>

                  {/* Danger zone */}
                  <div className="bg-white rounded-xl border border-red-200 p-5">
                    <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-500 mb-3">Once you delete your account, there is no going back.</p>
                    <button onClick={handleDeleteAccount} className="text-xs font-semibold text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
