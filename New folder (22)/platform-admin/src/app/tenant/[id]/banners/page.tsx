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

export default async function TenantBannersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare("SELECT * FROM Tenant WHERE id = ?").get(id) as any;
  if (!tenant) return notFound();
  const banners = db.prepare("SELECT * FROM StoreBanner WHERE tenantId = ? ORDER BY sortOrder ASC").all(id) as any[];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar tenantId={id} themeColor={tenant.themeColor} tenantName={tenant.name} active="Banners" />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">Hero Banners</h1>
          <Link href={`/tenant/${id}/banners/new`} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90">+ Add Banner</Link>
        </header>
        <main className="p-8 max-w-5xl mx-auto">
          <p className="text-gray-500 text-sm mb-8">Manage the hero banners that appear on your storefront homepage.</p>

          {banners.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-xl font-bold mb-2">No banners yet</h3>
              <p className="text-gray-500 text-sm mb-6">Add a hero banner to make your storefront look professional.</p>
              <button className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm">Add First Banner</button>
            </div>
          ) : (
            <div className="space-y-6">
              {banners.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="relative h-48 bg-gray-200">
                    <img src={b.imageUrl} alt={b.title || ""} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                      <div className="text-white">
                        <h3 className="text-2xl font-black">{b.title}</h3>
                        <p className="text-white/80 text-sm">{b.subtitle}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`badge ${b.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      CTA: <span className="font-semibold text-gray-700">{b.ctaText || "Shop Now"}</span> → <span className="text-blue-600">{b.ctaLink || "#"}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50">Edit</button>
                      <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
