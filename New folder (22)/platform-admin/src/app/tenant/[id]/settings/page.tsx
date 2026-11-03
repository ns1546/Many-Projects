import db from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export default async function TenantSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare("SELECT * FROM Tenant WHERE id = ?").get(id) as any;
  if (!tenant) return notFound();
  
  // ensure settings row exists
  db.prepare(`
    INSERT OR IGNORE INTO StoreSettings (id, tenantId, createdAt, updatedAt)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `).run(id, id);
  
  const settings = db.prepare("SELECT * FROM StoreSettings WHERE tenantId = ?").get(id) as any;

  async function updateSettings(formData: FormData) {
    "use server";
    
    // Tenant updates
    const name = formData.get("name") as string;
    const supportEmail = formData.get("supportEmail") as string;
    const supportPhone = formData.get("supportPhone") as string;
    const currency = formData.get("currency") as string;
    const themeColor = formData.get("themeColor") as string;
    
    db.prepare(`
      UPDATE Tenant 
      SET name = ?, supportEmail = ?, supportPhone = ?, currency = ?, themeColor = ?
      WHERE id = ?
    `).run(name, supportEmail, supportPhone, currency, themeColor, id);

    // Settings updates
    const storeDescription = formData.get("storeDescription") as string;
    const taxRate = (parseFloat(formData.get("taxRate") as string) || 0) / 100;
    const freeShippingThreshold = parseFloat(formData.get("freeShippingThreshold") as string) || null;
    const defaultShippingCost = parseFloat(formData.get("defaultShippingCost") as string) || 0;
    const facebookUrl = formData.get("facebookUrl") as string;
    const instagramUrl = formData.get("instagramUrl") as string;
    const twitterUrl = formData.get("twitterUrl") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDescription = formData.get("metaDescription") as string;

    db.prepare(`
      UPDATE StoreSettings
      SET storeDescription = ?, taxRate = ?, freeShippingThreshold = ?, defaultShippingCost = ?,
          facebookUrl = ?, instagramUrl = ?, twitterUrl = ?, metaTitle = ?, metaDescription = ?, updatedAt = datetime('now')
      WHERE tenantId = ?
    `).run(storeDescription, taxRate, freeShippingThreshold, defaultShippingCost, facebookUrl, instagramUrl, twitterUrl, metaTitle, metaDescription, id);

    revalidatePath(`/tenant/${id}/settings`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TenantSidebar tenantId={id} themeColor={tenant.themeColor} tenantName={tenant.name} active="Settings" />
      <div className="flex-1 overflow-y-auto">
        <form action={updateSettings}>
          <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between sticky top-0 z-10">
            <h1 className="text-lg font-bold">Store Settings</h1>
            <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90">Save Changes</button>
          </header>
          <main className="p-8 max-w-4xl mx-auto space-y-8">

            {/* General Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-lg font-bold mb-6">General Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Store Name</label>
                  <input type="text" name="name" defaultValue={tenant.name} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Store Description</label>
                  <textarea name="storeDescription" rows={3} defaultValue={settings?.storeDescription || ""} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none" placeholder="Tell customers about your store..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Support Email</label>
                    <input type="email" name="supportEmail" defaultValue={tenant.supportEmail || ""} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Support Phone</label>
                    <input type="tel" name="supportPhone" defaultValue={tenant.supportPhone || ""} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Currency</label>
                    <select name="currency" defaultValue={tenant.currency} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                      <option value="USD">USD - $</option>
                      <option value="EUR">EUR - €</option>
                      <option value="GBP">GBP - £</option>
                      <option value="BDT">BDT - ৳</option>
                      <option value="INR">INR - ₹</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Theme Color</label>
                    <div className="flex gap-2">
                      <input type="color" name="themeColor" defaultValue={tenant.themeColor} className="w-12 h-12 rounded-lg border cursor-pointer" />
                      <input type="text" defaultValue={tenant.themeColor} className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none font-mono" readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Tax Rate (%)</label>
                    <input type="number" step="0.1" name="taxRate" defaultValue={(settings?.taxRate || 0.05) * 100} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-lg font-bold mb-6">Shipping Settings</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Free Shipping Threshold</label>
                    <input type="number" step="1" name="freeShippingThreshold" defaultValue={settings?.freeShippingThreshold || 100} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                    <p className="text-xs text-gray-400 mt-1">Orders above this amount get free shipping</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Default Shipping Cost</label>
                    <input type="number" step="0.5" name="defaultShippingCost" defaultValue={settings?.defaultShippingCost || 10} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-lg font-bold mb-6">Social Media Links</h2>
              <div className="space-y-4">
                {[
                  { label: "Facebook URL", key: "facebookUrl", icon: "fb" },
                  { label: "Instagram URL", key: "instagramUrl", icon: "ig" },
                  { label: "Twitter URL", key: "twitterUrl", icon: "tw" },
                ].map((s) => (
                  <div key={s.key}>
                    <label className="block text-sm font-bold mb-2 text-gray-700">{s.label}</label>
                    <input type="url" name={s.key} defaultValue={(settings as any)?.[s.key] || ""} placeholder={`https://...`} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                  </div>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-lg font-bold mb-6">SEO Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Meta Title</label>
                  <input type="text" name="metaTitle" defaultValue={settings?.metaTitle || tenant.name} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Meta Description</label>
                  <textarea rows={2} name="metaDescription" defaultValue={settings?.metaDescription || ""} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none" placeholder="Describe your store for search engines..." />
                </div>
              </div>
            </div>
          </main>
        </form>

        {/* Danger Zone */}
        <div className="p-8 max-w-4xl mx-auto pt-0">
          <div className="bg-white rounded-2xl border-2 border-red-200 p-8">
            <h2 className="text-lg font-bold mb-2 text-red-600">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-6">Once you deactivate your store, it will no longer be accessible to customers.</p>
            <button type="button" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition">
              Deactivate Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
