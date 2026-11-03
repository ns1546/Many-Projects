'use client';

import { useState, useEffect } from 'react';
import { Upload, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

const CATEGORIES = ['Dogs', 'Cats', 'Small Pets', 'Birds', 'Fish', 'Reptiles'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    brand: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    imageUrl: '',
    isFeatured: false,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setFormData({
            title: p.title || '',
            slug: p.slug || '',
            brand: p.brand || '',
            description: p.description || '',
            price: p.price?.toString() || '',
            discountPrice: p.discountPrice?.toString() || '',
            stock: p.stock?.toString() || '',
            category: p.category?.name || p.category || '',
            imageUrl: p.images?.[0] || '',
            isFeatured: p.isFeatured || false,
          });
        } else {
          toast.error('Product not found');
          router.push('/admin/products');
        }
      } catch {
        toast.error('Failed to load product');
      } finally {
        setFetchLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: val,
      ...(name === 'title' ? { slug: (value as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
          stock: Number(formData.stock),
          images: [formData.imageUrl || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80'],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update product');

      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-sm">{formData.title}</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-primary-dark transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save Changes
        </button>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-3 gap-6" onSubmit={handleSubmit}>
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Title *</label>
                <input required name="title" value={formData.title} onChange={handleChange} type="text" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} className="input-field h-32 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
                  <input required name="brand" value={formData.brand} onChange={handleChange} type="text" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select required name="category" value={formData.category} onChange={handleChange} className="input-field">
                    <option value="">Select category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 rounded text-primary" />
                  <span className="text-sm font-medium text-slate-700">Featured Product (shown in homepage spotlights)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price ($) *</label>
                <input required name="price" value={formData.price} onChange={handleChange} type="number" step="0.01" min="0" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Original Price ($) <span className="text-gray-400 font-normal">(for sale badge)</span></label>
                <input name="discountPrice" value={formData.discountPrice} onChange={handleChange} type="number" step="0.01" min="0" className="input-field" placeholder="Leave blank if no sale" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
                <input required name="stock" value={formData.stock} onChange={handleChange} type="number" min="0" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug (auto-generated)</label>
                <input name="slug" value={formData.slug} onChange={handleChange} type="text" className="input-field bg-slate-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Product Image</h2>
            {formData.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-50">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} type="url" className="input-field" placeholder="https://..." />
            <p className="text-xs text-gray-400 mt-2">Paste a direct image URL or upload to an image host first</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium mb-1">💡 Pro Tip</p>
            <p className="text-xs text-amber-700">Set Original Price higher than the sale Price to show a discount badge on the product card.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
