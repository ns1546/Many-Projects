import db from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function NewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare('SELECT * FROM Tenant WHERE id = ?').get(id) as any;
  if (!tenant) return notFound();

  const categories = db.prepare('SELECT * FROM Category WHERE tenantId = ?').all(id) as any[];

  async function createProduct(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const categoryId = formData.get("categoryId") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const sku = formData.get("sku") as string;
    const isActive = formData.get("isActive") === "on" ? 1 : 0;
    
    const newId = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO Product (id, tenantId, name, description, price, stock, imageUrl, categoryId, sku, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(newId, id, name, description, price, stock, imageUrl, categoryId || null, sku || null, isActive);

    revalidatePath(`/tenant/${id}/products`);
    redirect(`/tenant/${id}/products`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/tenant/${id}/products`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm hover:bg-gray-50">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-black">Add New Product</h1>
            <p className="text-gray-500 text-sm">{tenant.name} Store</p>
          </div>
        </div>

        <form action={createProduct} className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-bold text-lg border-b pb-4">Basic Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-gray-700">Product Name *</label>
                <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="e.g. Premium Wireless Headphones" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-gray-700">Description</label>
                <textarea name="description" rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none" placeholder="Describe the product..." />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Price ({tenant.currency}) *</label>
                <input type="number" step="0.01" name="price" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="0.00" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Stock Quantity *</label>
                <input type="number" name="stock" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="100" defaultValue={0} />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">Category</label>
                <select name="categoryId" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="">No Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">SKU (Optional)</label>
                <input type="text" name="sku" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="PRD-12345" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="font-bold text-lg border-b pb-4">Media & Visibility</h2>
            
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Image URL</label>
              <input type="url" name="imageUrl" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="https://example.com/image.jpg" />
              <p className="text-xs text-gray-400 mt-2">Enter a direct link to the product image.</p>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" name="isActive" id="isActive" defaultChecked className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
              <label htmlFor="isActive" className="font-bold text-gray-700">Active (Visible in Store)</label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href={`/tenant/${id}/products`} className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50">Cancel</Link>
            <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-black text-white hover:opacity-90">Create Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
