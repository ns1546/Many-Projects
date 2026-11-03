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

export default async function TenantCouponsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare("SELECT * FROM Tenant WHERE id = ?").get(id) as any;
  if (!tenant) return notFound();
  const coupons = db.prepare("SELECT * FROM Coupon WHERE tenantId = ? ORDER BY createdAt DESC").all(id) as any[];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar tenantId={id} themeColor={tenant.themeColor} tenantName={tenant.name} active="Coupons" />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">Coupons & Discounts</h1>
          <Link href={`/tenant/${id}/coupons/new`} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90">+ Create Coupon</Link>
        </header>
        <main className="p-8 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[
              { label: "Active Coupons", value: coupons.filter(c => c.isActive).length },
              { label: "Total Uses", value: coupons.reduce((s: number, c: any) => s + c.usedCount, 0) },
              { label: "Avg Discount", value: coupons.length ? `${(coupons.reduce((s: number, c: any) => s + c.value, 0) / coupons.length).toFixed(0)}%` : "0%" },
            ].map(s => (
              <div key={s.label} className="bg-white p-6 rounded-2xl border border-gray-200">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{s.label}</div>
                <div className="text-3xl font-black">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-bold">Code</th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Discount</th>
                  <th className="px-6 py-4 font-bold">Min Order</th>
                  <th className="px-6 py-4 font-bold">Uses</th>
                  <th className="px-6 py-4 font-bold">Expires</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4"><span className="font-mono font-bold bg-gray-100 px-3 py-1 rounded-lg text-sm">{c.code}</span></td>
                    <td className="px-6 py-4 text-sm">{c.type}</td>
                    <td className="px-6 py-4 font-bold text-green-600">{c.type === "PERCENT" ? `${c.value}%` : `${tenant.currency}${c.value}`} off</td>
                    <td className="px-6 py-4 text-sm">{c.minOrderAmount > 0 ? `${tenant.currency}${c.minOrderAmount}` : "None"}</td>
                    <td className="px-6 py-4 text-sm">{c.usedCount}/{c.maxUses || "∞"}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400">No coupons created yet. Create your first coupon to offer discounts!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
