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

export default async function TenantCategoriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare("SELECT * FROM Tenant WHERE id = ?").get(id) as any;
  if (!tenant) return notFound();
  const categories = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id) as productCount 
    FROM Category c WHERE c.tenantId = ? ORDER BY c.name ASC
  `).all(id) as any[];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar tenantId={id} themeColor={tenant.themeColor} tenantName={tenant.name} active="Categories" />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">Product Categories</h1>
          <Link href={`/tenant/${id}/categories/new`} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90">+ Add Category</Link>
        </header>
        <main className="p-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-bold">Category Name</th>
                  <th className="px-6 py-4 font-bold">Slug</th>
                  <th className="px-6 py-4 font-bold">Products</th>
                  <th className="px-6 py-4 font-bold">Created</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-sm">{c.name}</td>
                    <td className="px-6 py-4"><code className="text-xs bg-gray-100 px-2 py-1 rounded">{c.slug}</code></td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">{c.productCount}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-bold text-sm hover:underline mr-4">Edit</button>
                      <button className="text-red-500 font-bold text-sm hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400">No categories yet. Add one to organize your products.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
