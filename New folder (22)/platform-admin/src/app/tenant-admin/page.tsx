import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export default async function TenantAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId: string }>
}) {
  const resolvedParams = await searchParams
  const tenantId = resolvedParams.tenantId

  if (!tenantId) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-900"><div className="text-xl font-bold">Missing tenantId parameter.</div></div>
  }

  const tenant = db.prepare('SELECT * FROM Tenant WHERE id = ?').get(tenantId) as any

  if (!tenant) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-900"><div className="text-xl font-bold text-red-600">Tenant not found.</div></div>
  }

  // Analytics queries
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as totalOrders,
      SUM(total) as revenue,
      COUNT(DISTINCT customerId) as totalCustomers
    FROM Orders WHERE tenantId = ?
  `).get(tenantId) as any

  const products = db.prepare('SELECT p.*, c.name as categoryName FROM Product p LEFT JOIN Category c ON p.categoryId = c.id WHERE p.tenantId = ? ORDER BY p.createdAt DESC').all(tenantId) as any[]
  const orders = db.prepare('SELECT * FROM Orders WHERE tenantId = ? ORDER BY createdAt DESC').all(tenantId) as any[]
  const categories = db.prepare('SELECT * FROM Category WHERE tenantId = ?').all(tenantId) as any[]
  const customers = db.prepare('SELECT * FROM Customer WHERE tenantId = ? ORDER BY createdAt DESC').all(tenantId) as any[]

  async function addProduct(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const compareAtPrice = parseFloat(formData.get("compareAtPrice") as string)
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const sku = formData.get("sku") as string

    if (!name || isNaN(price)) return

    const id = "prod_" + crypto.randomBytes(8).toString("hex")
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(3).toString("hex")

    db.prepare(`
      INSERT INTO Product (id, name, slug, description, sku, price, compareAtPrice, stock, categoryId, tenantId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, description || null, sku || null, price, isNaN(compareAtPrice) ? null : compareAtPrice, stock || 0, categoryId || null, tenantId)

    revalidatePath(`/tenant-admin`)
  }

  async function addCategory(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    if(!name) return
    
    const id = "cat_" + crypto.randomBytes(6).toString("hex")
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    db.prepare('INSERT INTO Category (id, name, slug, tenantId) VALUES (?, ?, ?, ?)').run(id, name, slug, tenantId)
    revalidatePath(`/tenant-admin`)
  }

  async function updateSettings(formData: FormData) {
    "use server"
    const themeColor = formData.get("themeColor") as string
    const currency = formData.get("currency") as string
    
    db.prepare('UPDATE Tenant SET themeColor = ?, currency = ? WHERE id = ?').run(themeColor, currency, tenantId)
    revalidatePath(`/tenant-admin`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Top Navbar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-black" style={{ backgroundColor: tenant.themeColor }}></div>
            <h1 className="text-xl font-bold">{tenant.name} <span className="text-sm font-normal text-slate-500">Workspace</span></h1>
          </div>
          <div className="text-sm text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded">
            Tenant: {tenant.id}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="text-sm text-slate-500 font-semibold mb-1">Total Revenue</div>
            <div className="text-3xl font-bold">${(stats.revenue || 0).toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="text-sm text-slate-500 font-semibold mb-1">Total Orders</div>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="text-sm text-slate-500 font-semibold mb-1">Total Customers</div>
            <div className="text-3xl font-bold">{stats.totalCustomers}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="text-sm text-slate-500 font-semibold mb-1">Total Products</div>
            <div className="text-3xl font-bold">{products.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Products & Orders) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold">Products Catalog</h2>
                <span className="text-sm font-medium bg-slate-200 px-2 py-1 rounded">{products.length} Items</span>
              </div>
              <div className="overflow-x-auto max-h-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white sticky top-0 shadow-sm">
                    <tr className="text-slate-500">
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">SKU</th>
                      <th className="p-4 font-semibold text-right">Price</th>
                      <th className="p-4 font-semibold text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500">{product.categoryName || 'Uncategorized'}</div>
                        </td>
                        <td className="p-4 font-mono text-xs">{product.sku || 'N/A'}</td>
                        <td className="p-4 text-right">
                          {product.compareAtPrice && <span className="line-through text-slate-400 mr-2">${product.compareAtPrice.toFixed(2)}</span>}
                          <span className="font-medium">${product.price.toFixed(2)}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-500">No products added yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-5 border-b bg-slate-50">
                <h2 className="text-lg font-bold">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto max-h-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white sticky top-0 shadow-sm">
                    <tr className="text-slate-500">
                      <th className="p-4 font-semibold">Order</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Payment</th>
                      <th className="p-4 font-semibold text-right">Total</th>
                      <th className="p-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4 font-mono text-xs font-medium text-indigo-600">{order.id}</td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{order.status}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{order.paymentStatus}</div>
                          <div className="text-xs text-slate-500">{order.paymentMethod}</div>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">${order.total.toFixed(2)}</td>
                        <td className="p-4 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No orders placed yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Customers List */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
               <div className="p-5 border-b bg-slate-50">
                <h2 className="text-lg font-bold">Customers Registry</h2>
              </div>
              <div className="p-5">
                 {customers.length === 0 ? <p className="text-slate-500 text-sm">No customers yet.</p> : 
                    <div className="space-y-4">
                      {customers.map(c => (
                         <div key={c.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                           <div>
                              <div className="font-bold">{c.firstName} {c.lastName}</div>
                              <div className="text-xs text-slate-500">{c.email} | {c.city}, {c.country}</div>
                           </div>
                           <div className="text-right">
                              <div className="text-sm font-semibold">${c.totalSpent.toFixed(2)}</div>
                              <div className="text-xs text-slate-500">{c.totalOrders} Orders</div>
                           </div>
                         </div>
                      ))}
                    </div>
                 }
              </div>
            </div>

          </div>
          
          {/* Sidebar Area (Forms & Settings) */}
          <div className="space-y-8">
            
            {/* Add Product Form */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-5 border-b bg-slate-50">
                <h2 className="font-bold">Add New Product</h2>
              </div>
              <form action={addProduct} className="p-5 space-y-4 text-sm">
                <div>
                  <label className="block font-medium mb-1">Product Name *</label>
                  <input name="name" type="text" className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block font-medium mb-1">Category</label>
                  <select name="categoryId" className="w-full border rounded-lg p-2 bg-white">
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Price *</label>
                    <input name="price" type="number" step="0.01" className="w-full border rounded-lg p-2" required />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Compare At</label>
                    <input name="compareAtPrice" type="number" step="0.01" className="w-full border rounded-lg p-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Stock</label>
                    <input name="stock" type="number" className="w-full border rounded-lg p-2" defaultValue="0" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">SKU</label>
                    <input name="sku" type="text" className="w-full border rounded-lg p-2" />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea name="description" rows={3} className="w-full border rounded-lg p-2"></textarea>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-black transition" style={{ backgroundColor: tenant.themeColor }}>
                  Create Product
                </button>
              </form>
            </div>

            {/* Add Category Form */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-5 border-b bg-slate-50">
                <h2 className="font-bold">Create Category</h2>
              </div>
              <form action={addCategory} className="p-5 space-y-4 text-sm flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Category Name</label>
                  <input name="name" type="text" className="w-full border rounded-lg p-2" required />
                </div>
                <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition">
                  Add
                </button>
              </form>
            </div>

            {/* Store Settings Form */}
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-5 border-b bg-slate-50">
                <h2 className="font-bold">Store Settings</h2>
              </div>
              <form action={updateSettings} className="p-5 space-y-4 text-sm">
                <div>
                  <label className="block font-medium mb-1">Brand Theme Color (Hex)</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" className="w-10 h-10 border rounded cursor-pointer" defaultValue={tenant.themeColor} />
                    <input name="themeColor" type="text" className="flex-1 border rounded-lg p-2 uppercase font-mono" defaultValue={tenant.themeColor} required />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Currency Code</label>
                  <select name="currency" className="w-full border rounded-lg p-2 bg-white" defaultValue={tenant.currency}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-slate-100 text-slate-800 rounded-lg py-2.5 font-semibold hover:bg-slate-200 transition border">
                  Save Changes
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
