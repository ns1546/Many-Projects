'use client';

import { useState, useEffect } from 'react';
import { Upload, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isUrlHelpOpen, setIsUrlHelpOpen] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    brand: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '', // Will store a string, we need a real Category ID ideally, but we'll adapt backend to handle it
    imageUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title
      ...(name === 'title' ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
    }));
  };

  useEffect(() => {
    fetch('/api/admin/brands')
      .then(res => res.json())
      .then(json => {
        if(json.success) setBrands(json.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
          stock: Number(formData.stock),
          images: [formData.imageUrl || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80']
        })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(res.status === 413 ? 'Image is too large (max 1MB for Firestore)' : `Server Error: ${res.statusText}`);
      }
      
      if (!res.ok) throw new Error(data?.message || 'Failed to add product');
      
      toast.success('Product added successfully!');
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-primary-dark transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save Product
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
                <input required name="title" value={formData.title} onChange={handleChange} type="text" className="input-field" placeholder="Premium Dog Food" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} className="input-field h-32 resize-none" placeholder="Product description..."></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-700">Brand *</label>
                    <Link href="/admin/brands" className="text-xs text-primary hover:underline font-semibold">Manage Brands</Link>
                  </div>
                  <select required name="brand" value={formData.brand} onChange={handleChange} className="input-field">
                    <option value="">Select official brand...</option>
                    {brands.map(b => (
                      <option key={b._id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select required name="category" value={formData.category} onChange={handleChange} className="input-field">
                    <option value="">Select category...</option>
                    {['Dogs', 'Cats', 'Small Pets', 'Birds', 'Fish', 'Reptiles'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price ($) *</label>
                <input required name="price" value={formData.price} onChange={handleChange} type="number" step="0.01" className="input-field" placeholder="45.99" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount Price ($)</label>
                <input name="discountPrice" value={formData.discountPrice} onChange={handleChange} type="number" step="0.01" className="input-field" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
                <input required name="stock" value={formData.stock} onChange={handleChange} type="number" className="input-field" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Slug *</label>
                <input required name="slug" value={formData.slug} onChange={handleChange} type="text" className="input-field bg-slate-50" readOnly />
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Media</h2>
            <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-slate-50 mb-4 cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden group">
              {formData.imageUrl && formData.imageUrl.startsWith('data:image') ? (
                <>
                  <img src={formData.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold flex items-center gap-2"><Upload className="w-5 h-5"/> Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-slate-400 mb-2 group-hover:text-primary transition-colors" />
                  <p className="text-sm text-slate-600 font-medium">Click to Upload Image</p>
                  <p className="text-xs text-red-500 font-bold mt-2">Warning: Image should be 1 MB or less.</p>
                  <p className="text-xs text-slate-500 mt-1">Compress image first: <a href="https://tinypng.com/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">tinypng.com</a></p>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 1024 * 1024) {
                      toast.error("Image must be less than 1MB!");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <label className="block text-sm font-medium text-slate-700">Or Image URL</label>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600">Make image url:</span>
                  <button type="button" onClick={() => setIsUrlHelpOpen(true)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 py-0.5 rounded font-semibold transition-colors">Click</button>
                  <a href="https://postimages.org/" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Free Host</a>
                </div>
              </div>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} type="url" className="input-field" placeholder="https://..." />
            </div>

            {isUrlHelpOpen && (
              <div className="absolute inset-0 bg-white z-20 rounded-xl p-6 shadow-2xl border border-blue-100 flex flex-col animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-900">How to create Image URL</h3>
                  <button type="button" onClick={() => setIsUrlHelpOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto text-sm text-slate-600 space-y-3">
                  <p><strong>Step 1:</strong> Click the "Free Host" button to open Postimages.org in a new tab.</p>
                  <p><strong>Step 2:</strong> Upload your product image there.</p>
                  <p><strong>Step 3:</strong> Once uploaded, copy the <strong>"Direct link"</strong> provided.</p>
                  <p><strong>Step 4:</strong> Come back here and paste the copied link into the "Or Image URL" box.</p>
                  <p className="mt-4 text-xs italic text-slate-500">This ensures your image doesn't take up limited database space!</p>
                </div>
                <button type="button" onClick={() => setIsUrlHelpOpen(false)} className="mt-4 w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors">Got it, close</button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
