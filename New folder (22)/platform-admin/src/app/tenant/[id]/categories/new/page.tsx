import db from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function NewCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare('SELECT * FROM Tenant WHERE id = ?').get(id) as any;
  if (!tenant) return notFound();

  async function createCategory(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const newId = crypto.randomUUID();
    
    try {
      db.prepare(`
        INSERT INTO Category (id, tenantId, name, slug, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(newId, id, name, slug);
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
         // handle error gracefully if we wanted, but let's keep it simple
      }
    }

    revalidatePath(`/tenant/${id}/categories`);
    redirect(`/tenant/${id}/categories`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/tenant/${id}/categories`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm hover:bg-gray-50">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-black">Add Category</h1>
          </div>
        </div>

        <form action={createCategory} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Category Name *</label>
            <input type="text" name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="e.g. Electronics" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Slug (Optional)</label>
            <input type="text" name="slug" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="e.g. electronics" />
            <p className="text-xs text-gray-400 mt-2">Leave blank to auto-generate from name.</p>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Link href={`/tenant/${id}/categories`} className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50">Cancel</Link>
            <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-black text-white hover:opacity-90">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  );
}
