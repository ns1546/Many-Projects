'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      
      if (json.success) {
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted successfully');
      } else {
        toast.error(json.message || 'Failed to delete product');
      }
    } catch (error) {
      toast.error('Network error. Failed to delete product.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Products Management</h1>
        <Link href="/admin/products/new" className="bg-primary text-white font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-dark transition-all flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search products..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="text-sm text-slate-500">
            Total: {products.length} Products
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading products from database...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Package className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No Products Found</h3>
              <p className="text-slate-500 mb-4">You haven't added any products to the database yet.</p>
              <Link href="/admin/products/new" className="btn-primary">Create Your First Product</Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-100 text-slate-600 font-medium">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded shrink-0 overflow-hidden">
                        {product.images?.[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 line-clamp-1">{product.title}</div>
                        <div className="text-xs text-slate-500">{product.brand}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{product.category?.name || 'Uncategorized'}</td>
                    <td className="p-4 font-medium text-slate-900">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product._id}/edit`} className="p-2 text-slate-400 hover:text-primary transition-colors bg-white border border-slate-200 rounded shadow-sm block">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => deleteProduct(product._id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded shadow-sm">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
