import React, { useState, useEffect } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { haptics } from '../utils/haptics';
import {
  Package,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Boxes,
  Barcode,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';

export default function PageInventory() {
  const {
    language,
    products,
    setProducts,
    updateProductStock,
    registerBackHandler,
  } = useMobileApp();

  const isBn = language === 'bn';
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'lowStock' | category names
  const [sortBy, setSortBy] = useState('stock-asc'); // 'stock-asc' | 'stock-desc' | 'name-asc' | 'price-desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);

  // Stock Adjustment Drawer State
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('in'); // 'in' (stock in) | 'out' (waste/damage)
  const [adjustQty, setAdjustQty] = useState('10');
  const [adjustReason, setAdjustReason] = useState('');

  // Register Android Hardware Back Handler for Inventory drawers/modals
  useEffect(() => {
    if (showAddForm || adjustingProduct) {
      return registerBackHandler?.('inventory-modal', () => {
        if (adjustingProduct) {
          setAdjustingProduct(null);
          return true;
        }
        if (showAddForm) {
          setShowAddForm(false);
          return true;
        }
        return false;
      });
    }
  }, [showAddForm, adjustingProduct, registerBackHandler]);

  // Floating particle animation tracker
  const [animatingId, setAnimatingId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    nameBn: '',
    category: 'মুদি সামগ্রী',
    price: '',
    cost: '',
    stock: '',
    unit: 'কেজি',
    minAlert: '10',
  });

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const totalInventoryValue = React.useMemo(() => {
    return (products || []).reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    );
  }, [products]);

  const totalCostValue = React.useMemo(() => {
    return (products || []).reduce(
      (sum, p) => sum + Number(p.costPrice || p.price * 0.85) * Number(p.stock || 0),
      0
    );
  }, [products]);

  const potentialProfit = Math.max(0, totalInventoryValue - totalCostValue);

  const lowStockItems = React.useMemo(() => {
    return (products || []).filter(p => Number(p.stock || 0) <= Number(p.minAlert || 10));
  }, [products]);

  const categories = React.useMemo(() => {
    const defaultCats = ['মুদি সামগ্রী', 'পানীয় ও স্ন্যাক্স', 'টয়লেট্রিজ', 'স্টেশনারি', 'চাল ও ডাল', 'তেল ও মসলা'];
    const prodCats = (products || []).map(p => p.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...prodCats]));
  }, [products]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products || []).filter(p => {
      if (filterCategory === 'lowStock') {
        if (Number(p.stock || 0) > Number(p.minAlert || 10)) return false;
      } else if (filterCategory !== 'all') {
        if (p.category !== filterCategory) return false;
      }

      if (q) {
        return (
          (p.nameBn || '').toLowerCase().includes(q) ||
          (p.nameEn || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.barcode || '').includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          String(p.price || '').includes(q)
        );
      }
      return true;
    });
  }, [products, filterCategory, search]);

  const sortedProducts = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'stock-asc') return Number(a.stock || 0) - Number(b.stock || 0);
      if (sortBy === 'stock-desc') return Number(b.stock || 0) - Number(a.stock || 0);
      if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === 'name-asc') return (a.nameBn || '').localeCompare(b.nameBn || '');
      return 0;
    });
  }, [filtered, sortBy]);

  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  const handleQuickDelta = (p, delta) => {
    if (delta > 0) {
      haptics.add();
    } else {
      haptics.remove();
    }

    setAnimatingId({ id: p.id, delta, key: Date.now() });
    setTimeout(() => setAnimatingId(null), 600);

    updateProductStock(p.id, delta, 'দ্রুত সমন্বয়');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.nameBn.trim()) return;

    haptics.tap();
    const created = {
      id: `prod-${Date.now().toString().slice(-5)}`,
      nameBn: newProduct.nameBn,
      nameEn: newProduct.nameBn,
      category: newProduct.category,
      price: Number(newProduct.price || 0),
      costPrice: Number(newProduct.cost || newProduct.price * 0.85),
      stock: Number(newProduct.stock || 0),
      unit: newProduct.unit,
      minAlert: Number(newProduct.minAlert || 10),
      barcode: `894${Math.floor(100000000 + Math.random() * 900000000)}`,
    };

    setProducts(prev => [created, ...prev]);
    setNewProduct({ nameBn: '', category: 'মুদি সামগ্রী', price: '', cost: '', stock: '', unit: 'কেজি', minAlert: '10' });
    setShowAddForm(false);
    haptics.success();
    showToastMsg(isBn ? 'নতুন পণ্য সফলভাবে ক্যাটালগে যুক্ত হয়েছে!' : 'New product SKU added!');
  };

  const handleExecuteStockAdjust = (e) => {
    e.preventDefault();
    const q = Number(adjustQty || 0);
    if (!adjustingProduct || q <= 0) return;

    const delta = adjustType === 'in' ? q : -q;
    updateProductStock(adjustingProduct.id, delta, adjustReason || (adjustType === 'in' ? 'স্টক ইন' : 'অপচয়'));

    haptics.success();
    showToastMsg(
      isBn
        ? `${adjustingProduct.nameBn} এর স্টক ${adjustType === 'in' ? '+' : '-'}${q} ${adjustingProduct.unit} আপডেট হয়েছে!`
        : `Adjusted stock for ${adjustingProduct.nameEn}`
    );

    setAdjustingProduct(null);
    setAdjustQty('10');
    setAdjustReason('');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          className="lx-toast-banner"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#111827',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: 24,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              maxWidth: '90%',
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <SubpageHeader
        titleBn="মজুদ ও স্টক খাতা"
        titleEn="Inventory & Stock Ledger"
        subtitleBn={`${products.length} টি পণ্য সক্রিয়`}
        subtitleEn={`${products.length} registered SKUs`}
        rightAction={
          <button
            onClick={() => {
              haptics.tap();
              setShowAddForm(!showAddForm);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={14} />
            <span>{showAddForm ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'নতুন পণ্য' : 'Add SKU')}</span>
          </button>
        }
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Inventory Valuation Triple Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '12px 10px', border: '1px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'মোট স্টক মূল্য' : 'Stock Value'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳ {totalInventoryValue.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '12px 10px', border: '1px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'সম্ভাব্য নিট লাভ' : 'Est. Profit'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#059669', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳ {potentialProfit.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '12px 10px', border: '1px solid #E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'কম স্টক আইটেম' : 'Low Stock'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: lowStockItems.length > 0 ? '#E11D48' : '#059669', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              {lowStockItems.length} {isBn ? 'টি' : 'SKUs'}
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddProduct}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--bk-pink)',
              borderRadius: 18,
              padding: '16px',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--bk-pink)', marginBottom: 8 }}>
              {isBn ? 'নতুন পণ্য ক্যাটালগে যুক্ত করুন' : 'Add New Inventory SKU'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder={isBn ? 'পণ্যের নাম *' : 'Product Name *'}
                value={newProduct.nameBn}
                onChange={e => setNewProduct({ ...newProduct, nameBn: e.target.value })}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="text"
                placeholder={isBn ? 'ক্যাটাগরি (চাল, তেল)' : 'Category'}
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
              <input
                type="number"
                placeholder={isBn ? 'বিক্রয় দর' : 'Sell'}
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                required
                style={{ padding: '9px 6px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="number"
                placeholder={isBn ? 'ক্রয় দর' : 'Cost'}
                value={newProduct.cost}
                onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })}
                style={{ padding: '9px 6px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="number"
                placeholder={isBn ? 'স্টক' : 'Qty'}
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                required
                style={{ padding: '9px 6px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="text"
                placeholder={isBn ? 'একক' : 'Unit'}
                value={newProduct.unit}
                onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                style={{ padding: '9px 6px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'ক্যাটালগে সংরক্ষণ করুন' : 'Save Product'}
            </button>
          </form>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }}>
          <button
            onClick={() => {
              haptics.tap();
              setFilterCategory('all');
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              border: 'none',
              background: filterCategory === 'all' ? 'var(--bk-pink)' : '#FFFFFF',
              color: filterCategory === 'all' ? '#FFFFFF' : '#4B5563',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            {isBn ? 'সকল পণ্য' : 'All'}
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setFilterCategory('lowStock');
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              border: 'none',
              background: filterCategory === 'lowStock' ? '#E11D48' : '#FFF1F2',
              color: filterCategory === 'lowStock' ? '#FFFFFF' : '#E11D48',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            ⚠️ {isBn ? 'কম স্টক (<১০)' : 'Low Stock'}
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                haptics.tap();
                setFilterCategory(cat);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                border: 'none',
                background: filterCategory === cat ? 'var(--bk-pink)' : '#FFFFFF',
                color: filterCategory === cat ? '#FFFFFF' : '#4B5563',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 12px',
            }}
          >
            <Search size={16} color="#9CA3AF" style={{ marginRight: 8, flexShrink: 0 }} />
            <input
              type="text"
              placeholder={isBn ? 'পণ্যের নাম, বারকোড বা ক্যাটাগরি...' : 'Search product or SKU...'}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 0', fontSize: 12.5, outline: 'none' }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 10px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#374151',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="stock-asc">{isBn ? 'কম স্টক আগে' : 'Lowest Stock'}</option>
            <option value="stock-desc">{isBn ? 'বেশি স্টক আগে' : 'Highest Stock'}</option>
            <option value="price-desc">{isBn ? 'বেশি দাম আগে' : 'Highest Price'}</option>
            <option value="name-asc">{isBn ? 'নাম (অ-ক্ষর)' : 'Name (A-Z)'}</option>
          </select>
        </div>

        {/* High-Capacity Record Count & Pagination Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#6B7280',
            fontWeight: 700,
            marginBottom: 10,
            padding: '4px 6px',
            background: '#EEF2F6',
            borderRadius: 10,
          }}
        >
          <span>
            {isBn
              ? `মোট ${filtered.length.toLocaleString('bn-BD')} টি পণ্য • প্রদর্শিত ${paginatedProducts.length > 0 ? (startIndex + 1).toLocaleString('bn-BD') : 0}-${Math.min(endIndex, filtered.length).toLocaleString('bn-BD')} টি`
              : `Total ${filtered.length} products • Showing ${paginatedProducts.length > 0 ? startIndex + 1 : 0}-${Math.min(endIndex, filtered.length)}`}
          </span>
          <span style={{ color: 'var(--bk-pink)', fontWeight: 800 }}>
            {isBn ? `পৃষ্ঠা ${safePage.toLocaleString('bn-BD')} / ${totalPages.toLocaleString('bn-BD')}` : `Page ${safePage} of ${totalPages}`}
          </span>
        </div>

        {/* Products List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {paginatedProducts.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '32px 16px',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: 13,
                border: '1px dashed #D1D5DB',
              }}
            >
              <Package size={32} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
              <div>{isBn ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি' : 'No products found'}</div>
            </div>
          ) : (
            paginatedProducts.map(p => {
            const isLow = Number(p.stock || 0) <= Number(p.minAlert || 10);
            const isAnim = animatingId && animatingId.id === p.id;
            const cost = Number(p.costPrice || p.price * 0.85);
            const marginPct = Math.round(((p.price - cost) / p.price) * 100);

            return (
              <div
                key={p.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  padding: '12px 14px',
                  border: isLow ? '1.5px solid #FECDD3' : '1px solid #E5E7EB',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  position: 'relative',
                }}
              >
                {/* Floating particle animation badge */}
                {isAnim && (
                  <div
                    className={animatingId.delta > 0 ? 'lx-flying-chip-plus' : 'lx-flying-chip-minus'}
                    style={{ position: 'absolute', right: 80, top: 2, zIndex: 10 }}
                  >
                    {animatingId.delta > 0 ? `+${animatingId.delta}` : animatingId.delta}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, paddingRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                        {isBn ? p.nameBn : p.nameEn}
                      </span>
                      {isLow && (
                        <span style={{ background: '#FFF1F2', color: '#E11D48', fontSize: 9.5, fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                          {isBn ? 'কম স্টক' : 'Low'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                      {p.category} • {isBn ? 'বিক্রয়' : 'Sell'}: <strong style={{ color: '#111827' }}>৳{p.price}</strong>/{p.unit}
                      {marginPct > 0 && (
                        <span style={{ marginLeft: 6, color: '#059669', fontWeight: 700 }}>
                          (লাভ {marginPct}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 600 }}>STOCK</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: isLow ? '#E11D48' : '#111827', fontFamily: 'Outfit, sans-serif' }}>
                        {p.stock} <span style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 500 }}>{p.unit}</span>
                      </div>
                    </div>

                    {/* Quick Steppers (- / +) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button
                        onClick={() => handleQuickDelta(p, -1)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: '#F3F4F6',
                          border: '1px solid #D1D5DB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4B5563',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <button
                        onClick={() => handleQuickDelta(p, 1)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: 'var(--bk-pink)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={13} strokeWidth={2.8} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Adjustment Drawer Trigger Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid #F3F4F6',
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
                    #{p.barcode || p.id}
                  </span>
                  <button
                    onClick={() => {
                      haptics.tap();
                      setAdjustingProduct(p);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--bk-pink)',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Boxes size={12} />
                    <span>{isBn ? 'স্টক সমন্বয় / ইন' : 'Adjust Stock'}</span>
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* High-Capacity Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 14,
              padding: '10px 12px',
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E5E7EB',
            }}
          >
            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              disabled={safePage <= 1}
              className="lx-touch-btn"
              style={{
                background: safePage <= 1 ? '#F3F4F6' : 'var(--bk-pink)',
                color: safePage <= 1 ? '#9CA3AF' : '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {isBn ? '← পূর্ববর্তী' : '← Previous'}
            </button>

            <span style={{ fontSize: 12, fontWeight: 800, color: '#374151' }}>
              {isBn
                ? `পৃষ্ঠা ${safePage.toLocaleString('bn-BD')} / ${totalPages.toLocaleString('bn-BD')}`
                : `Page ${safePage} of ${totalPages}`}
            </span>

            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              disabled={safePage >= totalPages}
              className="lx-touch-btn"
              style={{
                background: safePage >= totalPages ? '#F3F4F6' : 'var(--bk-pink)',
                color: safePage >= totalPages ? '#9CA3AF' : '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              {isBn ? 'পরবর্তী →' : 'Next →'}
            </button>
          </div>
        )}
      </div>

      {/* Stock Adjustment Drawer */}
      {adjustingProduct && (
        <div
          className="bk-slide-drawer-backdrop"
          onClick={() => {
            haptics.tap();
            setAdjustingProduct(null);
          }}
        >
          <div
            className="bk-slide-drawer"
            onClick={e => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                  {isBn ? 'স্টক সমন্বয় ও ইন' : 'Stock Adjustment & Waste'}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {isBn ? adjustingProduct.nameBn : adjustingProduct.nameEn} • {isBn ? 'বর্তমান স্টক' : 'Current Stock'}: {adjustingProduct.stock} {adjustingProduct.unit}
                </div>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  setAdjustingProduct(null);
                }}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            {/* Segment Toggle */}
            <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', padding: 4, borderRadius: 12, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setAdjustType('in');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 9,
                  border: 'none',
                  background: adjustType === 'in' ? '#059669' : 'transparent',
                  color: adjustType === 'in' ? '#FFFFFF' : '#4B5563',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {isBn ? '+ স্টক ইন (নতুন মাল)' : '+ Stock In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setAdjustType('out');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 9,
                  border: 'none',
                  background: adjustType === 'out' ? '#DC2626' : 'transparent',
                  color: adjustType === 'out' ? '#FFFFFF' : '#4B5563',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {isBn ? '- অপচয় / নষ্ট মাল' : '- Waste / Loss'}
              </button>
            </div>

            <form onSubmit={handleExecuteStockAdjust}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? `সমন্বয়ের পরিমাণ (${adjustingProduct.unit})` : 'Adjustment Quantity'}
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: '1.5px solid #D1D5DB',
                    fontSize: 20,
                    fontWeight: 900,
                    fontFamily: 'Outfit, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Quick Qty Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {[5, 10, 25, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      haptics.add();
                      setAdjustQty(val.toString());
                    }}
                    style={{
                      padding: '5px 10px',
                      background: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    +{val} {adjustingProduct.unit}
                  </button>
                ))}
              </div>

              {/* Reason */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'কারণ বা রেফারেন্স' : 'Reason / Reference'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'যেমন: নতুন বস্তা খোলা হলো বা নষ্ট' : 'E.g. Expired or new wholesale lot'}
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: adjustType === 'in' ? '#059669' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'স্টক সমন্বয় সম্পন্ন করুন' : 'Confirm Stock Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
