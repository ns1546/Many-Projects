import db from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function NewBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare('SELECT * FROM Tenant WHERE id = ?').get(id) as any;
  if (!tenant) return notFound();

  async function createBanner(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const ctaText = formData.get("ctaText") as string;
    const ctaLink = formData.get("ctaLink") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isActive = formData.get("isActive") === "on" ? 1 : 0;
    
    const newId = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO StoreBanner (id, tenantId, title, subtitle, imageUrl, ctaText, ctaLink, sortOrder, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(newId, id, title || null, subtitle || null, imageUrl, ctaText || null, ctaLink || null, sortOrder, isActive);

    revalidatePath(`/tenant/${id}/banners`);
    redirect(`/tenant/${id}/banners`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/tenant/${id}/banners`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm hover:bg-gray-50">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-black">Add New Banner</h1>
          </div>
        </div>

        <form action={createBanner} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2 text-gray-700">Image URL *</label>
              <input type="url" name="imageUrl" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="https://example.com/banner.jpg" />
              <p className="text-xs text-gray-400 mt-2">Recommended size: 1920x800px. Minimum height 400px.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2 text-gray-700">Headline</label>
              <input type="text" name="title" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="Summer Collection 2025" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2 text-gray-700">Subtitle</label>
              <textarea name="subtitle" rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none" placeholder="Discover the latest trends..." />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Button Text</label>
              <input type="text" name="ctaText" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="Shop Now" defaultValue="Shop Now" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Button Link</label>
              <input type="text" name="ctaLink" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="/shop" defaultValue="/shop" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Sort Order</label>
              <input type="number" name="sortOrder" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="0" defaultValue="0" />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input type="checkbox" name="isActive" id="isActive" defaultChecked className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
              <label htmlFor="isActive" className="font-bold text-gray-700">Active (Visible on Storefront)</label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t mt-8">
            <Link href={`/tenant/${id}/banners`} className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50">Cancel</Link>
            <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-black text-white hover:opacity-90">Create Banner</button>
          </div>
        </form>
      </div>
    </div>
  );
}
