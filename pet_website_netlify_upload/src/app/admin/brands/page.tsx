'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Add Brand Form
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', imageUrl: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      const json = await res.json();
      if (json.success) {
        setBrands(json.data);
      }
    } catch (error) {
      toast.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');
    
    setSaving(true);
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      
      if (json.success) {
        toast.success('Brand added successfully');
        setBrands([json.data, ...brands]);
        setIsAdding(false);
        setFormData({ name: '', description: '', imageUrl: '' });
      } else {
        toast.error(json.message || 'Failed to add brand');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brands Management</h1>
          <p className="text-slate-500 text-sm">Manage official product brands across the store</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Brand
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddBrand} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Add New Brand</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name *</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. Royal Canin" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition-colors h-24 resize-none" placeholder="Short description of the brand..." />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Logo/Image URL</label>
                <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} type="url" className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white transition-colors" placeholder="https://..." />
                <p className="text-xs text-slate-500 mt-1">Provide a URL for the brand logo. Square or circular images work best.</p>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Brand
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search brands..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No brands found. {search ? 'Try a different search.' : 'Add your first brand above!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="p-4 font-semibold">Logo</th>
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Slug</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBrands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                        {brand.imageUrl ? (
                          <img src={brand.imageUrl} alt={brand.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{brand.name}</td>
                    <td className="p-4 text-sm text-slate-500 font-mono bg-slate-100/50 rounded">{brand.slug}</td>
                    <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate">{brand.description || '-'}</td>
                    <td className="p-4 text-right">
                      {/* Read only for now, future can add delete/edit */}
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-bold border border-green-200">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
