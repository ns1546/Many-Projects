'use client';

import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, BarChart2, Tag, Bell, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
          <span className="font-bold text-white">Petopia Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Main Menu</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-gray-800 pt-4">
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Store</p>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            View Storefront
          </Link>
        </div>
      </nav>

      {/* Bottom user info */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center font-bold text-sm">A</div>
          <div>
            <p className="text-sm font-semibold text-white">Admin User</p>
            <p className="text-xs text-gray-500">admin@petopia.com</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors">
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </Link>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const currentPage = navItems.find(n => n.href === pathname)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar pathname={pathname} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="bg-gray-900/60 fixed inset-0" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex flex-col w-64 h-full bg-gray-900">
            <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <AdminSidebar pathname={pathname} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">{currentPage}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Petopia E-commerce Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute top-full right-12 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">1 New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <Link 
                    href="/admin/orders" 
                    onClick={() => setNotificationsOpen(false)}
                    className="p-4 border-b border-gray-50 hover:bg-gray-50 flex gap-3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex flex-shrink-0 items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">New Order Received</p>
                      <p className="text-xs text-gray-500 mt-0.5">A new customer order was just placed.</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Just now</p>
                    </div>
                  </Link>
                  <div className="p-3 text-center bg-gray-50">
                    <Link href="/admin/orders" onClick={() => setNotificationsOpen(false)} className="text-xs text-primary font-bold hover:underline">
                      View all orders
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <Link href="/admin/products/new" className="hidden sm:flex btn-primary text-xs py-2 px-4">
              + Add Product
            </Link>
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
