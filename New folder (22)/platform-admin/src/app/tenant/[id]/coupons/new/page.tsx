import db from "@/lib/db";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function NewCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = db.prepare('SELECT * FROM Tenant WHERE id = ?').get(id) as any;
  if (!tenant) return notFound();

  async function createCoupon(formData: FormData) {
    "use server";
    
    const code = formData.get("code") as string;
    const type = formData.get("type") as string;
    const value = parseFloat(formData.get("value") as string);
    const minOrderAmount = parseFloat(formData.get("minOrderAmount") as string) || 0;
    const maxUses = parseInt(formData.get("maxUses") as string) || null;
    const expiresAt = formData.get("expiresAt") as string || null;
    const isActive = formData.get("isActive") === "on" ? 1 : 0;
    
    const newId = crypto.randomUUID();
    
    try {
      db.prepare(`
        INSERT INTO Coupon (id, tenantId, code, type, value, minOrderAmount, maxUses, usedCount, expiresAt, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, datetime('now'), datetime('now'))
      `).run(newId, id, code.toUpperCase(), type, value, minOrderAmount, maxUses, expiresAt ? new Date(expiresAt).toISOString() : null, isActive);
    } catch (e: any) {
      // Handle unique constraint on code
    }

    revalidatePath(`/tenant/${id}/coupons`);
    redirect(`/tenant/${id}/coupons`);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/tenant/${id}/coupons`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm hover:bg-gray-50">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-black">Create Coupon</h1>
          </div>
        </div>

        <form action={createCoupon} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2 text-gray-700">Coupon Code *</label>
              <input type="text" name="code" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white uppercase" placeholder="SUMMER2025" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Discount Type *</label>
              <select name="type" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white">
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ({tenant.currency})</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Discount Value *</label>
              <input type="number" step="0.01" name="value" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="20" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Min Order Amount ({tenant.currency})</label>
              <input type="number" step="0.01" name="minOrderAmount" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="50.00" />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Max Total Uses</label>
              <input type="number" name="maxUses" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" placeholder="Leave empty for unlimited" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2 text-gray-700">Expiration Date</label>
              <input type="datetime-local" name="expiresAt" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input type="checkbox" name="isActive" id="isActive" defaultChecked className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
              <label htmlFor="isActive" className="font-bold text-gray-700">Active (Customers can use it)</label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t mt-8">
            <Link href={`/tenant/${id}/coupons`} className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50">Cancel</Link>
            <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-black text-white hover:opacity-90">Create Coupon</button>
          </div>
        </form>
      </div>
    </div>
  );
}
