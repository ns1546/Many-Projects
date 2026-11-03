import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import crypto from "crypto"

export default async function SuperAdminPage() {
  const tenants = db.prepare(`
    SELECT t.*, 
           (SELECT COUNT(*) FROM Orders o WHERE o.tenantId = t.id) as totalOrders,
           (SELECT SUM(total) FROM Orders o WHERE o.tenantId = t.id) as totalRevenue
    FROM Tenant t 
    ORDER BY t.createdAt DESC
  `).all() as any[]

  const globalStats = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === 'ACTIVE').length,
    totalPlatformRevenue: tenants.reduce((acc, t) => acc + (t.totalRevenue || 0), 0)
  }

  async function createTenant(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const domain = formData.get("domain") as string

    if (!name) return

    const id = "tenant_" + crypto.randomBytes(8).toString("hex")

    db.prepare('INSERT INTO Tenant (id, name, domain) VALUES (?, ?, ?)').run(id, name, domain || null)
    
    revalidatePath("/super-admin")
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-800 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Dashboard</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm font-medium">
          Logged in as Super Admin
        </div>
      </div>
      
      {/* Platform Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col">
          <span className="text-sm text-slate-500 uppercase font-semibold">Total Tenants</span>
          <span className="text-3xl font-bold mt-2">{globalStats.totalTenants}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col">
          <span className="text-sm text-slate-500 uppercase font-semibold">Active Stores</span>
          <span className="text-3xl font-bold mt-2 text-green-600">{globalStats.activeTenants}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col">
          <span className="text-sm text-slate-500 uppercase font-semibold">Platform GMV</span>
          <span className="text-3xl font-bold mt-2 text-indigo-600">${globalStats.totalPlatformRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
        <h2 className="text-xl font-bold mb-4">Onboard New Tenant</h2>
        <form action={createTenant} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1 text-slate-700">Business Name</label>
            <input name="name" type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none" required placeholder="e.g. Acme Corp" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1 text-slate-700">Custom Domain (Optional)</label>
            <input name="domain" type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-black outline-none" placeholder="e.g. acme.com" />
          </div>
          <button type="submit" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition">Create Workspace</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="font-bold text-lg">Active Businesses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-semibold">Store</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Orders</th>
                <th className="p-4 font-semibold text-right">Revenue</th>
                <th className="p-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tenants.map(tenant => (
                <tr key={tenant.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{tenant.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{tenant.id} | {tenant.domain || 'No custom domain'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">{tenant.totalOrders || 0}</td>
                  <td className="p-4 text-right font-bold text-slate-900">${(tenant.totalRevenue || 0).toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <Link href={`/tenant-admin?tenantId=${tenant.id}`} className="inline-block bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition">
                      Manage Store &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No tenants found. Create one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
