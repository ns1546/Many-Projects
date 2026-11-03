import db from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default function NewTenantPage() {
  async function createTenant(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;
    const currency = formData.get("currency") as string;
    const themeColor = formData.get("themeColor") as string;
    
    const newId = `tenant_${crypto.randomUUID().split('-')[0]}`; // simple id generation
    
    try {
      db.prepare(`
        INSERT INTO Tenant (id, name, domain, themeColor, currency, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))
      `).run(newId, name, domain || null, themeColor || '#000000', currency);

      // Initialize store settings
      db.prepare(`
        INSERT INTO StoreSettings (id, tenantId, taxRate, freeShippingThreshold, defaultShippingCost, createdAt, updatedAt)
        VALUES (?, ?, 0.05, 100, 10, datetime('now'), datetime('now'))
      `).run(newId, newId);

    } catch (e: any) {
      // handle error gracefully
    }

    revalidatePath(`/`);
    redirect(`/`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── SUPER ADMIN SIDEBAR ── */}
      <div className="w-64 bg-gray-950 text-white p-6 flex flex-col shrink-0">
        <div className="mb-10">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">SuperCart</div>
          <div className="font-black text-xl tracking-tight">
            Platform <span className="text-indigo-400">Admin</span>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition">
            <span>📊</span>Dashboard
          </Link>
          <Link href="/tenants/new" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white transition">
            <span>➕</span>New Tenant
          </Link>
          <Link href="/super-admin/billing" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition">
            <span>💳</span>Billing
          </Link>
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm hover:bg-gray-50 transition">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-black">Create New Store</h1>
              <p className="text-gray-500 text-sm">Provision a new e-commerce tenant</p>
            </div>
          </div>

          <form action={createTenant} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Business / Store Name *</label>
                <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="e.g. Acme Clothing Co." />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Custom Domain (Optional)</label>
                <input type="text" name="domain" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" placeholder="e.g. shop.acme.com" />
                <p className="text-xs text-gray-400 mt-2">Leave blank to use the default platform subdomain.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Default Currency</label>
                  <select name="currency" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Brand Color</label>
                  <div className="flex gap-2">
                    <input type="color" name="themeColor" defaultValue="#000000" className="w-12 h-12 rounded-lg border cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4 border-t mt-8">
              <Link href="/" className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition">Cancel</Link>
              <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">Create Store</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
