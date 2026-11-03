import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { getDashboardStats } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const { totalOrders, totalProducts, totalUsers, totalRevenue } = await getDashboardStats();

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, increase: '+14%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Orders', value: totalOrders.toString(), increase: '+8%', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Active Customers', value: totalUsers.toString(), increase: '+22%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Products', value: totalProducts.toString(), increase: '+0%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 text-sm">Store performance at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.increase}
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Revenue Overview</h3>
            <select className="text-sm border-gray-300 rounded-md focus:border-primary focus:ring-primary">
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end gap-2 justify-between mt-8">
            {/* Simple mock chart bars */}
            {[40, 70, 45, 90, 65, 85, 100, 60, 50, 80, 40, 75].map((height, i) => (
              <div key={i} className="w-full bg-blue-100 rounded-t-md relative group">
                <div 
                  className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all duration-1000" 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-4 px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {[
              { name: 'Premium Dog Food', sales: 45, revenue: '$2,250' },
              { name: 'Cat Tree Tower', sales: 28, revenue: '$1,400' },
              { name: 'Chew Toy Bundle', sales: 85, revenue: '$1,275' },
              { name: 'Automatic Feeder', sales: 12, revenue: '$960' },
            ].map((prod, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{prod.name}</p>
                  <p className="text-xs text-gray-500">{prod.sales} sales</p>
                </div>
                <span className="font-bold text-sm text-gray-900">{prod.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
