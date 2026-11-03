import db from "@/lib/db";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const tenants = db.prepare(`
    SELECT t.*, 
      (SELECT COUNT(*) FROM Product p WHERE p.tenantId = t.id) as productCount,
      (SELECT COUNT(*) FROM Orders o WHERE o.tenantId = t.id) as orderCount,
      (SELECT SUM(total) FROM Orders o WHERE o.tenantId = t.id) as totalRevenue,
      (SELECT COUNT(*) FROM Customer c WHERE c.tenantId = t.id) as customerCount
    FROM Tenant t
    ORDER BY t.createdAt DESC
  `).all() as any[];

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t: any) => t.status === "ACTIVE").length;
  const totalPlatformRevenue = tenants.reduce((acc: number, t: any) => acc + (t.totalRevenue || 0), 0);
  const totalProducts = tenants.reduce((acc: number, t: any) => acc + (t.productCount || 0), 0);
  const totalOrders = tenants.reduce((acc: number, t: any) => acc + (t.orderCount || 0), 0);
  const totalCustomers = tenants.reduce((acc: number, t: any) => acc + (t.customerCount || 0), 0);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/tenants/new", label: "New Tenant", icon: "➕" },
    { href: "/super-admin/billing", label: "Billing", icon: "💳" },
    { href: "/super-admin/analytics", label: "Analytics", icon: "📈" },
    { href: "/super-admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── SUPER ADMIN SIDEBAR ── */}
      <div className="w-64 bg-gray-950 text-white p-6 flex flex-col shrink-0">
        <div className="mb-10">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">SuperCart</div>
          <div className="font-black text-xl tracking-tight">
            Platform <span className="text-indigo-400">Admin</span>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${link.href === "/" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              SA
            </div>
            <div>
              <div className="text-sm font-bold">Super Admin</div>
              <div className="text-xs text-gray-500">All access</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold">Platform Overview</h1>
            <p className="text-xs text-gray-400">Manage all tenant stores from here</p>
          </div>
          <div className="flex gap-3">
            <Link href="/tenants/new" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition">
              + Add Store
            </Link>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {/* Platform Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
            {[
              { label: "Total Stores", value: totalTenants, icon: "🏪", color: "indigo" },
              { label: "Active", value: activeTenants, icon: "✅", color: "green" },
              { label: "Platform Revenue", value: `$${totalPlatformRevenue.toFixed(0)}`, icon: "💰", color: "yellow" },
              { label: "Total Orders", value: totalOrders, icon: "🛒", color: "blue" },
              { label: "Total Customers", value: totalCustomers, icon: "👥", color: "purple" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-2xl font-black mb-0.5">{s.value}</div>
                <div className="text-gray-500 text-xs font-semibold">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tenants Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-base font-bold">All Tenant Stores</h2>
              <div className="flex gap-3">
                <input type="text" placeholder="Search stores..." className="px-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select className="px-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-bold">Store</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Products</th>
                  <th className="px-6 py-4 font-bold">Orders</th>
                  <th className="px-6 py-4 font-bold">Customers</th>
                  <th className="px-6 py-4 font-bold">Revenue</th>
                  <th className="px-6 py-4 font-bold">Created</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tenants.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm shrink-0"
                          style={{ backgroundColor: t.themeColor || "#000" }}
                        >
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{t.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{t.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{t.productCount}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{t.orderCount}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{t.customerCount}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{t.currency} {(t.totalRevenue || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/tenant/${t.id}`} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">
                          Manage
                        </Link>
                        <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-gray-400">
                      <div className="text-4xl mb-3">🏪</div>
                      <p>No stores yet. Add your first tenant store to get started.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
