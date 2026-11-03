export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/data';
import { 
  DollarSign, ShoppingBag, Users, Package, TrendingUp, 
  ArrowUpRight, ArrowRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

export default async function AdminDashboard() {
  let stats_data = { totalOrders: 0, totalProducts: 0, totalUsers: 0, orders: [] as any[], totalRevenue: 0 };
  try {
    stats_data = await getDashboardStats();
  } catch (e) {
    console.warn('Could not fetch dashboard stats:', e);
  }
  const { totalOrders, totalProducts, totalUsers, orders, totalRevenue } = stats_data;

  const stats = [
    { 
      label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, 
      icon: DollarSign, color: 'bg-blue-50 text-blue-600', trend: '+12.5%', up: true 
    },
    { 
      label: 'Total Orders', value: totalOrders.toString(), 
      icon: ShoppingBag, color: 'bg-emerald-50 text-emerald-600', trend: '+8.2%', up: true 
    },
    { 
      label: 'Total Products', value: totalProducts.toString(), 
      icon: Package, color: 'bg-purple-50 text-purple-600', trend: '+3', up: true 
    },
    { 
      label: 'Registered Users', value: totalUsers.toString(), 
      icon: Users, color: 'bg-amber-50 text-amber-600', trend: '+24', up: true 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening with your store.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary text-sm">
          + Add New Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                <ArrowUpRight className="h-3 w-3" /> {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Products', href: '/admin/products', icon: Package, color: 'border-blue-200 text-blue-700 hover:bg-blue-50' },
          { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag, color: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
          { label: 'Add Product', href: '/admin/products/new', icon: TrendingUp, color: 'border-purple-200 text-purple-700 hover:bg-purple-50' },
          { label: 'Visit Store', href: '/', icon: ArrowRight, color: 'border-gray-200 text-gray-700 hover:bg-gray-50' },
        ].map((action) => (
          <Link key={action.label} href={action.href}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border bg-white font-medium text-sm transition-colors ${action.color}`}>
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length > 0 ? (
                orders.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 font-medium">
                      #{(item._id?.toString() || 'MOCK').slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.user?.name || 'Guest Customer'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                    </td>
                    <td className="px-6 py-4">
                      {item.isDelivered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          <Clock className="h-3 w-3" /> Processing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-right">
                      ${(item.totalPrice || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <AlertCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="font-medium text-gray-600">No orders yet</p>
                    <p className="text-gray-400 text-xs mt-1">Customer orders will appear here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
