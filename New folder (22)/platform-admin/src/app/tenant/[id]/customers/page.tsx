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
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${active === link.label ? "bg-white/20 text-white" : "text-white/65 hover:text-white hover:bg-white/10"}`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="pt-6 border-t border-white/20">
        <Link href="/" className="text-sm font-semibold opacity-60 hover:opacity-100 flex items-center gap-2 transition">
          ← Platform Admin
        </Link>
      </div>
    </div>
  );
}

export default async function TenantCustomersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare("SELECT * FROM Tenant WHERE id = ?").get(id) as any;
  if (!tenant) return notFound();

  const customers = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM Orders o WHERE o.customerId = c.id) as orderCount,
      (SELECT SUM(total) FROM Orders o WHERE o.customerId = c.id) as totalSpent
    FROM Customer c 
    WHERE c.tenantId = ? 
    ORDER BY c.createdAt DESC
  `).all(id) as any[];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar tenantId={id} themeColor={tenant.themeColor} tenantName={tenant.name} active="Customers" />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">Customers</h1>
        </header>
        <main className="p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <input type="text" placeholder="Search customers..." className="px-4 py-2 border rounded-lg text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Orders</th>
                  <th className="px-6 py-4 font-bold">Spent</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {c.firstName?.charAt(0) || "?"}
                        </div>
                        <span className="font-semibold text-sm">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.city || "—"}, {c.country || "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold">{c.orderCount || 0}</td>
                    <td className="px-6 py-4 text-sm font-bold">{tenant.currency} {(c.totalSpent || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400">No customers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
