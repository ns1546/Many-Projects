import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, Package, Search, Plus, AlertTriangle, Barcode } from 'lucide-react';

export default function InventoryModal() {
  const { language, products, setProducts, setActiveModal } = useMobileApp();
  const isBn = language === 'bn';

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState({ nameBn: '', price: '', cost: '', stock: '', unit: 'পিস', barcode: '' });

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.nameBn || '').toLowerCase().includes(q) ||
      (p.nameEn || '').toLowerCase().includes(q) ||
      (p.barcode || '').includes(q)
    );
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProd.nameBn.trim() || !newProd.price) return;

    setProducts(prev => [
      {
        id: `prod-${Date.now()}`,
        nameBn: newProd.nameBn,
        nameEn: newProd.nameBn,
        price: Number(newProd.price),
        cost: Number(newProd.cost || newProd.price * 0.9),
        stock: Number(newProd.stock || 10),
        unit: newProd.unit || 'পিস',
        barcode: newProd.barcode || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        quickKey: `${prev.length + 1}`,
      },
      ...prev,
    ]);

    setNewProd({ nameBn: '', price: '', cost: '', stock: '', unit: 'পিস', barcode: '' });
    setShowAddForm(false);
  };

  const updateStock = (id, delta) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
    );
  };

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" style={{ maxHeight: '92%' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22D3EE',
              }}
            >
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--lx-text-primary)' }}>
                {isBn ? 'পণ্য ও স্টক খতিয়ান' : 'Inventory & Stock'}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--lx-text-muted)' }}>
                {isBn ? 'দোকানের মালামাল ও মূল্য তালিকা' : 'Product catalog and live stock tracker'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--lx-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Add Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--lx-text-muted)' }} />
            <input
              type="text"
              placeholder={isBn ? 'পণ্য বা বারকোড খুঁজুন...' : 'Search product or barcode...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: 12,
                background: 'var(--lx-card)',
                border: '1px solid var(--lx-border)',
                color: '#fff',
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: showAddForm ? 'var(--lx-card)' : 'var(--lx-emerald)',
              color: showAddForm ? 'var(--lx-text-primary)' : '#050811',
              border: showAddForm ? '1px solid var(--lx-border)' : 'none',
              borderRadius: 12,
              padding: '0 12px',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={14} />
            <span>{showAddForm ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'নতুন পণ্য' : 'Add')}</span>
          </button>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <form
            onSubmit={handleAdd}
            style={{
              background: 'var(--lx-card)',
              border: '1px solid var(--lx-border)',
              borderRadius: 14,
              padding: '12px',
              marginBottom: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder={isBn ? 'পণ্যের নাম *' : 'Product Name *'}
              value={newProd.nameBn}
              onChange={e => setNewProd({ ...newProd, nameBn: e.target.value })}
              required
              style={{ padding: '8px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 12 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <input
                type="number"
                placeholder={isBn ? 'বিক্রয়দর (৳) *' : 'Price *'}
                value={newProd.price}
                onChange={e => setNewProd({ ...newProd, price: e.target.value })}
                required
                style={{ padding: '8px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 12 }}
              />
              <input
                type="number"
                placeholder={isBn ? 'ক্রয়দর (৳)' : 'Cost'}
                value={newProd.cost}
                onChange={e => setNewProd({ ...newProd, cost: e.target.value })}
                style={{ padding: '8px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 12 }}
              />
              <input
                type="number"
                placeholder={isBn ? 'স্টক পরিমাণ' : 'Stock'}
                value={newProd.stock}
                onChange={e => setNewProd({ ...newProd, stock: e.target.value })}
                style={{ padding: '8px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 12 }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '8px',
                borderRadius: 8,
                background: 'var(--lx-emerald)',
                border: 'none',
                color: '#050811',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'পণ্য যোগ করুন' : 'Save Product'}
            </button>
          </form>
        )}

        {/* Product List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
          {filtered.map(p => (
            <div
              key={p.id}
              style={{
                background: 'var(--lx-card)',
                border: '1px solid var(--lx-border)',
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--lx-text-primary)' }}>
                  {isBn ? p.nameBn : p.nameEn}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--lx-text-muted)' }}>
                  {p.barcode} • {isBn ? 'ক্রয়' : 'Cost'}: ৳{p.cost}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--lx-emerald)', marginTop: 2 }}>
                  ৳ {p.price} <span style={{ fontSize: 9.5, color: 'var(--lx-text-muted)', fontWeight: 500 }}>/{p.unit}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: p.stock < 20 ? '#F87171' : 'var(--lx-text-primary)' }}>
                  {p.stock} {p.unit}
                </div>
                {p.stock < 20 && (
                  <span style={{ fontSize: 9, color: '#FB7185', fontWeight: 700 }}>
                    ⚠️ {isBn ? 'কম স্টক' : 'Low'}
                  </span>
                )}
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <button
                    onClick={() => updateStock(p.id, -1)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateStock(p.id, 1)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'var(--lx-emerald)',
                      border: 'none',
                      color: '#050811',
                      cursor: 'pointer',
                      fontWeight: 800,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
