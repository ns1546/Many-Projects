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

export default async function TenantProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const tenant = db.prepare('SELECT * FROM Tenant WHERE id = ?').get(id) as any;
  if (!tenant) return notFound();

  const products = db.prepare(`
    SELECT p.*, c.name as categoryName 
    FROM Product p 
    LEFT JOIN Category c ON p.categoryId = c.id 
    WHERE p.tenantId = ? 
    ORDER BY p.createdAt DESC
  `).all(id) as any[];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar tenantId={id} themeColor={tenant.themeColor} tenantName={tenant.name} active="Products" />
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-lg font-bold">Products</h1>
          <Link href={`/tenant/${id}/products/new`} className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90">+ Add Product</Link>
        </header>
        <main className="p-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <input type="text" placeholder="Search products..." className="px-4 py-2 border rounded-lg text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-black" />
              <div className="flex gap-2">
                <select className="px-4 py-2 border rounded-lg text-sm focus:outline-none bg-white">
                  <option>All Categories</option>
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>
            
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                  <th className="px-6 py-4 font-bold">Product</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Inventory</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Price</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 overflow-hidden border">
                          {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{p.name}</div>
                          <div className="text-xs text-gray-500">SKU: {p.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${p.stock < 10 ? 'text-red-500' : 'text-gray-600'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {p.categoryName || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {tenant.currency} {p.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-bold text-sm hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      You haven't added any products yet.
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
