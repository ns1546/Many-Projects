import db from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

function TenantSidebar({ tenantId, themeColor, tenantName, active }: { tenantId: string; themeColor: string; tenantName: string; active: string }) {
  const links = [
    { href: `/tenant/${tenantId}`, label: "Overview", icon: "📊" },
    { href: `/tenant/${tenantId}/products`, label: "Products", icon: "📦" },
    { href: `/tenant/${tenantId}/orders`, label: "Orders", icon: "🛒" },
    { href: `/tenant/${tenantId}/customers`, label: "Customers", icon: "👥" },
    { href: `/tenant/${tenantId}/coupons`, label: "Coupons", icon: "🎟️" },
    { href: `/tenant/${tenantId}/banners`, label: "Banners", icon: "🖼️" },
    { href: `/tenant/${tenantId}/categories`, label: "Categories", icon: "📁" },
    { href: `/tenant/${tenantId}/settings`, label: "Settings", icon: "⚙️" },
  ];
  return (
    <div className="w-64 text-white p-6 flex flex-col shrink-0" style={{ backgroundColor: themeColor || "#1a1a1a" }}>
      <div className="mb-10">
        <div className="font-black text-lg tracking-tight truncate">{tenantName}</div>
        <div className="text-white/50 text-xs mt-1">Store Dashboard</div>
      </div>
      <nav className="space-y-1 flex-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${active === link.label ? "bg-white/20 text-white" : "text-white/65 hover:text-white hover:bg-white/10"}`}>
            <span>{link.icon}</span>{link.label}
          </Link>
        ))}
      </nav>
      <div className="pt-6 border-t border-white/20">
        <Link href="/" className="text-sm font-semibold opacity-60 hover:opacity-100 flex items-center gap-2 transition">← Platform Admin</Link>
      </div>
    </div>
  );
}

export default async function TenantAdminDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare("SELECT * FROM Tenant WHERE id = ?").get(id) as any;
  if (!tenant) return notFound();

  const products = db.prepare("SELECT * FROM Product WHERE tenantId = ?").all(id) as any[];
  const orders = db.prepare("SELECT * FROM Orders WHERE tenantId = ? ORDER BY createdAt DESC").all(id) as any[];
  const customers = db.prepare("SELECT COUNT(*) as count FROM Customer WHERE tenantId = ?").get(id) as any;
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total, 0);
  const pendingOrders = orders.filter((o: any) => o.status === "PENDING").length;
  const lowStockProducts = products.filter((p: any) => p.stock > 0 && p.stock <= 5);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar tenantId={id} themeColor={tenant.themeColor} tenantName={tenant.name} active="Overview" />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold">Store Overview</h1>
          </div>
          <div className="flex gap-3">
            <Link href={`/tenant/${id}/products`} className="bg-black text-white px-5 py-2 rounded-lg font-bold text-sm hover:opacity-90">+ Add Product</Link>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Total Revenue", value: `${tenant.currency} ${totalRevenue.toFixed(2)}`, icon: "💰", color: "text-green-600", bg: "bg-green-50" },
              { label: "Total Orders", value: orders.length, icon: "🛒", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Customers", value: customers?.count || 0, icon: "👥", color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Pending Orders", value: pendingOrders, icon: "⏳", color: "text-orange-600", bg: "bg-orange-50" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center text-2xl mb-4`}>{s.icon}</div>
                <div className={`text-2xl lg:text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                <div className="text-gray-500 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-base font-bold">Recent Orders</h2>
                <Link href={`/tenant/${id}/orders`} className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider border-b">
                      <th className="px-6 py-3 font-bold">Order</th>
                      <th className="px-6 py-3 font-bold">Customer</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.slice(0, 6).map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3 font-mono text-xs font-bold">#{o.id.substring(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-3">{o.customerId.substring(0, 12)}...</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            o.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                            o.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                            o.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>{o.status}</span>
                        </td>
                        <td className="px-6 py-3 text-right font-bold">{tenant.currency} {o.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">No orders yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Low Stock Alert */}
              {lowStockProducts.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">⚠️</span>
                    <h3 className="font-bold text-orange-800">Low Stock Alert</h3>
                  </div>
                  <div className="space-y-3">
                    {lowStockProducts.slice(0, 4).map((p: any) => (
                      <div key={p.id} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-orange-900 truncate mr-4">{p.name}</span>
                        <span className="font-bold text-orange-600 shrink-0">{p.stock} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold mb-4 text-sm">Product Overview</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Products", value: products.length, color: "bg-gray-400" },
                    { label: "In Stock", value: products.filter((p: any) => p.stock > 0).length, color: "bg-green-400" },
                    { label: "Out of Stock", value: products.filter((p: any) => p.stock === 0).length, color: "bg-red-400" },
                    { label: "Active", value: products.filter((p: any) => p.isActive).length, color: "bg-blue-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                      <span className="text-sm font-bold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
