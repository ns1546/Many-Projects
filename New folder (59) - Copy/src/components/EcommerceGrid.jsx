import React, { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';
import { downloadCSV } from '../utils/csvExport';
import { useIsMobile } from '../hooks/useIsMobile';

// --- Sub-function: Predictive Stock Analysis ---
const analyzeStockVelocity = (qty) => {
  // Advanced logic: In a real system, this pulls from past 30 days of sales.
  // We mock a baseline velocity to demonstrate the advanced UI.
  const estimatedDailySales = 2.5; 
  const daysRemaining = Math.floor(qty / estimatedDailySales);
  
  if (qty <= 0) return { status: 'out', text: 'Out of Stock', badgeClass: 'badge-red' };
  if (daysRemaining <= 3) return { status: 'critical', text: `Critical: ~${daysRemaining} days left`, badgeClass: 'badge-red' };
  if (daysRemaining <= 7) return { status: 'low', text: `Low: ~${daysRemaining} days left`, badgeClass: 'badge-amber' };
  return { status: 'healthy', text: `Healthy (${qty} in stock)`, badgeClass: 'badge-teal' };
};

// ─── List-row for fast table view ─────────────────────────────────────────────
const ProductRow = ({ item, renderActions, getStockInfo, isSelected, onToggleSelect, showBatch, onContextMenu }) => {
  const stock = getStockInfo ? getStockInfo(item) : { qty: item.qty || item.qtyInStock || 0, label: '' };
  const qty = stock.qty;
  const price = item.sellingPrice || item.lastUnitPurchasePrice || 0;
  
  // Try to parse number if it's a string like "G:10 | S:5" for velocity calculation (simplification for display)
  const numericQty = typeof qty === 'number' ? qty : parseInt(String(qty).replace(/[^0-9]/g, '')) || 0;
  const velocity = analyzeStockVelocity(numericQty);

  return (
    <tr 
      onContextMenu={(e) => onContextMenu && onContextMenu(e, item)}
      style={{ borderBottom: '1px solid var(--border)', background: isSelected ? 'var(--blue-dim)' : 'transparent', transition: 'background 0.2s' }}
    >
      {showBatch && (
        <td style={{ padding: '9px 14px', width: 40 }}>
          <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(item)} style={{ cursor: 'pointer', transform: 'scale(1.2)' }} />
        </td>
      )}
      <td style={{ padding: '9px 14px' }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{item.brand}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.productType}</div>
        {item.lifeStage && item.lifeStage !== 'Not Applicable' && item.lifeStage !== 'All Life Stages' && (
          <div style={{ fontSize: 9, padding: '2px 6px', background: 'var(--purple-dim)', color: 'var(--purple)', borderRadius: 4, display: 'inline-block', marginTop: 4, fontWeight: 600 }}>{item.lifeStage}</div>
        )}
      </td>
      <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{item.flavor || '—'}</td>
      <td style={{ padding: '9px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{item.weight || '—'}</td>
      <td style={{ padding: '9px 14px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{qty}</div>
        <div className={`badge ${velocity.badgeClass}`} style={{ marginTop: 4, fontSize: 10, padding: '3px 8px' }}>
          {velocity.text}
        </div>
      </td>
      <td style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--gold)', fontSize: 13 }}>{price > 0 ? `৳${price.toLocaleString()}` : '—'}</td>
      <td style={{ padding: '9px 14px' }}>
        <div style={{ display: 'flex', gap: 6 }}>{renderActions && renderActions(item)}</div>
      </td>
    </tr>
  );
};

// ─── Card with flavor/weight selectors ────────────────────────────────────────
const ProductCard = ({ product, renderActions, getStockInfo, onContextMenu }) => {
  const { brand, productType, items, flavors } = product;
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0] || null);

  const availableItems = useMemo(() =>
    items.filter(i => selectedFlavor ? i.flavor === selectedFlavor : true),
    [items, selectedFlavor]);

  const availableWeights = useMemo(() => {
    const ws = new Set();
    availableItems.forEach(i => { if (i.weight) ws.add(i.weight); });
    return Array.from(ws).sort();
  }, [availableItems]);

  const [selectedWeight, setSelectedWeight] = useState(availableWeights[0] || null);

  useEffect(() => {
    if (availableWeights.length > 0 && !availableWeights.includes(selectedWeight)) {
      setSelectedWeight(availableWeights[0]);
    }
  }, [availableWeights, selectedWeight]);

  const activeItem = useMemo(() =>
    availableItems.find(i => selectedWeight ? i.weight === selectedWeight : true) || availableItems[0] || items[0],
    [availableItems, selectedWeight, items]);

  const stock = getStockInfo ? getStockInfo(activeItem) : { qty: activeItem.qty || activeItem.qtyInStock || 0, label: 'in stock' };
  const qty = stock.qty;
  const price = activeItem.sellingPrice || activeItem.lastUnitPurchasePrice || 0;

  return (
    <div className="godown-product-card" onContextMenu={(e) => onContextMenu && onContextMenu(e, activeItem)}>
      <div className="gpc-header">
        <div className="gpc-brand-icon">{(brand || '?').charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="gpc-brand">{brand}</div>
          <div className="gpc-type">{productType}</div>
          {activeItem?.lifeStage && activeItem.lifeStage !== 'Not Applicable' && activeItem.lifeStage !== 'All Life Stages' && (
            <div style={{ fontSize: 9, marginTop: 4, padding: '2px 6px', background: 'var(--purple-dim)', color: 'var(--purple)', borderRadius: 4, display: 'inline-block', fontWeight: 600 }}>{activeItem.lifeStage}</div>
          )}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
          background: qty <= 0 ? 'var(--red-dim)' : qty <= 10 ? 'var(--amber-dim)' : 'var(--teal-dim)',
          color: qty <= 0 ? 'var(--red)' : qty <= 10 ? 'var(--amber)' : 'var(--teal)' }}>
          {qty <= 0 ? 'Out' : qty <= 10 ? 'Low' : 'OK'}
        </span>
      </div>

      {flavors.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, letterSpacing: 0.5 }}>FLAVOR</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {flavors.map(f => (
              <div key={f} onClick={() => setSelectedFlavor(f)}
                style={{ padding: '4px 10px', fontSize: 11, borderRadius: 999, cursor: 'pointer', border: '1px solid',
                  borderColor: selectedFlavor === f ? 'rgba(109, 40, 217, 0.3)' : 'var(--border)',
                  background: selectedFlavor === f ? 'rgba(109, 40, 217, 0.15)' : 'transparent',
                  color: selectedFlavor === f ? '#6d28d9' : 'var(--text-secondary)',
                  boxShadow: selectedFlavor === f ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  fontWeight: 700, transition: 'var(--transition)' }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableWeights.length > 0 && (
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, letterSpacing: 0.5 }}>SIZE / WEIGHT</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {availableWeights.map(w => (
              <div key={w} onClick={() => setSelectedWeight(w)}
                style={{ padding: '4px 10px', fontSize: 11, borderRadius: 999, cursor: 'pointer', border: '1px solid',
                  borderColor: selectedWeight === w ? 'rgba(29, 78, 216, 0.3)' : 'var(--border)',
                  background: selectedWeight === w ? 'rgba(29, 78, 216, 0.15)' : 'transparent',
                  color: selectedWeight === w ? '#2563eb' : 'var(--text-secondary)',
                  boxShadow: selectedWeight === w ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  fontWeight: 700, transition: 'var(--transition)' }}>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: qty <= 0 ? 'var(--red)' : 'var(--text-primary)', lineHeight: 1 }}>
            {qty} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{activeItem.unit}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{stock.label}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>{price > 0 ? `৳${price.toLocaleString()}` : '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>per unit</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 7 }}>
        {renderActions && renderActions(activeItem)}
      </div>
    </div>
  );
};

// ─── Main EcommerceGrid ────────────────────────────────────────────────────────
export default function EcommerceGrid({ items, search, onSearchChange, renderActions, getStockInfo, emptyMessage = 'No products found.', searchInputRef }) {
  const isMobile = useIsMobile();
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState(window.innerWidth <= 768 ? 'card' : 'list');
  const [sortBy, setSortBy] = useState('brand');
  const searchRef = useRef(null);

  // Batch Selection State
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBatch, setShowBatch] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const toggleSelect = (item) => {
    const next = new Set(selectedItems);
    const id = item.id || item.entityId;
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const selectAll = (filteredList) => {
    if (selectedItems.size === filteredList.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredList.map(i => i.id || i.entityId)));
    }
  };

  const brands = useMemo(() => [...new Set(items.map(i => i.brand).filter(Boolean))].sort(), [items]);

  const fuse = useMemo(() => new Fuse(items, {
    keys: ['brand', 'productType', 'flavor', 'weight', 'unit'],
    threshold: 0.35, includeScore: true,
  }), [items]);

  const searched = useMemo(() => {
    if (!search?.trim()) return items;
    return fuse.search(search).map(r => r.item);
  }, [search, fuse, items]);

  const filtered = useMemo(() => {
    let r = searched;
    if (filterBrand) r = r.filter(i => i.brand === filterBrand);
    if (filterType) r = r.filter(i => i.productType === filterType);
    return r;
  }, [searched, filterBrand, filterType]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'qty') arr.sort((a, b) => (b.qty || b.qtyInStock || 0) - (a.qty || a.qtyInStock || 0));
    else if (sortBy === 'price') arr.sort((a, b) => (b.sellingPrice || b.lastUnitPurchasePrice || 0) - (a.sellingPrice || a.lastUnitPurchasePrice || 0));
    else arr.sort((a, b) => (a.brand || '').localeCompare(b.brand || '') || (a.productType || '').localeCompare(b.productType || ''));
    return arr;
  }, [filtered, sortBy]);

  const groupedProducts = useMemo(() => {
    const map = {};
    sorted.forEach(item => {
      const key = `${item.brand}:::${item.productType}`;
      if (!map[key]) map[key] = { id: key, brand: item.brand, productType: item.productType, items: [], flavors: new Set() };
      map[key].items.push(item);
      if (item.flavor) map[key].flavors.add(item.flavor);
    });
    return Object.values(map).map(p => ({ ...p, flavors: Array.from(p.flavors).sort() }));
  }, [sorted]);

  useEffect(() => {
    const handler = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Pagination — slices the sorted flat list (for list view) or groupedProducts (for card view)
  const pg = usePagination(viewMode === 'card' ? groupedProducts : sorted, 25);

  const handleExportCSV = () => {
    const rows = sorted.map(item => ({
      Brand: item.brand,
      'Product Type': item.productType,
      Flavor: item.flavor || '',
      Weight: item.weight || '',
      Qty: item.qty ?? item.qtyInStock ?? '',
      Price: item.sellingPrice || item.lastUnitPurchasePrice || '',
      Unit: item.unit || '',
    }));
    downloadCSV(rows, `inventory-${new Date().toLocaleDateString('en-CA')}.csv`);
  };

  return (
    <div className="ecommerce-container">

      {/* ─── MOBILE: horizontal brand pill strip instead of sidebar ─── */}
      {isMobile ? (
        <div style={{
          width: '100%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 14px 6px',
            fontSize: 10, fontWeight: 700, letterSpacing: 1,
            color: 'var(--text-muted)', textTransform: 'uppercase',
          }}>Filter by Brand</div>
          <div style={{
            display: 'flex', gap: 8, padding: '0 14px 12px',
            overflowX: 'auto', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}>
            <button
              onClick={() => { setFilterBrand(''); setFilterType(''); }}
              style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 999,
                border: '1px solid',
                borderColor: !filterBrand ? 'rgba(217,119,6,0.4)' : 'var(--border)',
                background: !filterBrand ? 'rgba(217,119,6,0.1)' : 'transparent',
                color: !filterBrand ? 'var(--gold)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>All</button>
            {brands.map(brand => (
              <button key={brand}
                onClick={() => { setFilterBrand(brand); setFilterType(''); }}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 999,
                  border: '1px solid',
                  borderColor: filterBrand === brand ? 'rgba(217,119,6,0.4)' : 'var(--border)',
                  background: filterBrand === brand ? 'rgba(217,119,6,0.1)' : 'transparent',
                  color: filterBrand === brand ? 'var(--gold)' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}>{brand}</button>
            ))}
          </div>
        </div>
      ) : (
        /* ─── DESKTOP: sticky sidebar ─── */
        <div className="ecommerce-sidebar card hide-scrollbar">
          <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Filter by Brand
          </div>
          <div style={{ padding: '4px 0' }}>
            <div
              style={{ padding: '9px 14px', cursor: 'pointer', fontWeight: !filterBrand ? 700 : 500, background: !filterBrand ? 'var(--bg-hover)' : 'transparent', color: !filterBrand ? 'var(--gold)' : 'var(--text-secondary)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}
              onClick={() => { setFilterBrand(''); setFilterType(''); }}
            >
              <span>All Products</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{items.length}</span>
            </div>
            {brands.map(brand => {
              const isActive = filterBrand === brand;
              const brandCount = items.filter(i => i.brand === brand).length;
              const brandTypeList = [...new Set(items.filter(i => i.brand === brand).map(i => i.productType).filter(Boolean))].sort();
              return (
                <div key={brand}>
                  <div
                    style={{ padding: '9px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isActive ? 'rgba(217, 119, 6, 0.12)' : 'transparent', borderTop: '1px solid var(--border)', boxShadow: isActive ? 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 2px 5px rgba(217, 119, 6, 0.1)' : 'none', backdropFilter: isActive ? 'blur(8px)' : 'none', fontWeight: isActive ? 800 : 500, color: isActive ? 'var(--gold)' : 'var(--text-primary)', fontSize: 13 }}
                    onClick={() => { setFilterBrand(brand); setFilterType(''); }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{brand}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{brandCount}</span>
                      <span style={{ fontSize: 9 }}>{isActive ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  {isActive && brandTypeList.map(type => (
                    <div key={type}
                      style={{ padding: '7px 12px 7px 26px', cursor: 'pointer', fontSize: 12, background: filterType === type ? 'rgba(20, 184, 166, 0.12)' : 'var(--bg-elevated)', color: filterType === type ? 'var(--teal)' : 'var(--text-secondary)', fontWeight: filterType === type ? 700 : 400, borderLeft: filterType === type ? '3px solid var(--teal)' : '3px solid transparent', display: 'flex', justifyContent: 'space-between' }}
                      onClick={e => { e.stopPropagation(); setFilterType(filterType === type ? '' : type); }}
                    >
                      <span>{type}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{items.filter(i => i.brand === brand && i.productType === type).length}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* ─── Main Panel ─── */}
      <div style={{ flex: 1, minWidth: 0, width: '100%' }}>

        {/* Toolbar */}
        <div className="card mb-3" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Row 1: Search + Sort */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 0 }}>
              <span className="search-icon"></span>
              <input ref={searchInputRef || searchRef} placeholder="Search catalog..." value={search || ''} onChange={e => onSearchChange(e.target.value)} autoComplete="off" style={{ fontSize: 14 }} />
              {search && <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 15, flexShrink: 0 }} onClick={() => onSearchChange('')}>✕</button>}
            </div>
            <select className="form-select" style={{ width: isMobile ? 120 : 140, fontSize: 13, fontWeight: 600, flexShrink: 0 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="brand">Brand A–Z</option>
              <option value="qty">Qty ↓</option>
              <option value="price">Price ↓</option>
            </select>
          </div>

          {/* Row 2: Batch Select + View Mode */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
            <button className={`btn btn-sm ${showBatch ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowBatch(!showBatch)}>
              {showBatch ? '✓ Done' : '☑ Batch Select'}
            </button>
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
              <button style={{ padding: isMobile ? '7px 12px' : '8px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: viewMode === 'list' ? 'var(--text-primary)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--text-muted)', transition: 'var(--transition)' }} onClick={() => setViewMode('list')}>☰ List</button>
              <button style={{ padding: isMobile ? '7px 12px' : '8px 14px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: viewMode === 'card' ? 'var(--text-primary)' : 'transparent', color: viewMode === 'card' ? '#fff' : 'var(--text-muted)', transition: 'var(--transition)' }} onClick={() => setViewMode('card')}>⊞ Cards</button>
            </div>
          </div>
          
          {/* Batch Actions Bar */}
          {showBatch && (
            <div style={{ padding: '10px 14px', background: 'var(--blue-dim)', border: '1px solid var(--blue)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={selectedItems.size === sorted.length && sorted.length > 0} onChange={() => selectAll(sorted)} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{selectedItems.size} items selected</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" disabled={selectedItems.size === 0} onClick={() => { import('react-hot-toast').then(m => m.default.error('Bulk operations require Firebase Cloud Functions (Pending Deployment)')) }}> Bulk Transfer</button>
                <button className="btn btn-primary btn-sm" disabled={selectedItems.size === 0} onClick={() => { import('react-hot-toast').then(m => m.default.error('Bulk operations require Firebase Cloud Functions (Pending Deployment)')) }}> Bulk Price Update</button>
              </div>
            </div>
          )}
          {(filterBrand || filterType) && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {filterBrand && <span style={{ padding: '4px 12px', background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 2px 5px rgba(217, 119, 6, 0.15)', backdropFilter: 'blur(8px)', color: 'var(--gold)', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>🏷 {filterBrand} <span style={{ cursor: 'pointer', marginLeft: 4, opacity: 0.7 }} onClick={() => { setFilterBrand(''); setFilterType(''); }}>×</span></span>}
              {filterType && <span style={{ padding: '4px 12px', background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.35)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 2px 5px rgba(20, 184, 166, 0.15)', backdropFilter: 'blur(8px)', color: 'var(--teal)', borderRadius: 999, fontSize: 12, fontWeight: 800 }}> {filterType} <span style={{ cursor: 'pointer', marginLeft: 4, opacity: 0.7 }} onClick={() => setFilterType('')}>×</span></span>}
            </div>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon"></div><div className="empty-title">{emptyMessage}</div></div></div>
        ) : viewMode === 'list' ? (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {showBatch && <th style={{ width: 40 }}></th>}
                    <th style={{ minWidth: 170 }}>Brand / Type</th>
                    <th>Flavor</th>
                    <th>Weight</th>
                    <th>Qty & Velocity</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pg.paged.map((item, idx) => {
                    const id = item.id || item.entityId;
                    return (
                      <ProductRow 
                        key={id || idx} 
                        item={item} 
                        renderActions={renderActions} 
                        getStockInfo={getStockInfo} 
                        isSelected={selectedItems.has(id)}
                        onToggleSelect={toggleSelect}
                        showBatch={showBatch}
                        onContextMenu={handleContextMenu}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pg.page} totalPages={pg.totalPages} total={pg.total}
              startRecord={pg.startRecord} endRecord={pg.endRecord}
              perPage={pg.perPage}
              onPageChange={pg.goTo}
              onPerPageChange={pg.setPerPage}
              onExportCSV={handleExportCSV}
            />
          </div>
        ) : (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))', gap: 16 }}>
            {pg.paged.map(gp => (
              <ProductCard key={gp.id} product={gp} renderActions={renderActions} getStockInfo={getStockInfo} onContextMenu={handleContextMenu} />
            ))}
          </div>
          <div className="card" style={{ padding: 0, marginTop: 12 }}>
            <Pagination
              page={pg.page} totalPages={pg.totalPages} total={pg.total}
              startRecord={pg.startRecord} endRecord={pg.endRecord}
              perPage={pg.perPage}
              onPageChange={pg.goTo}
              onPerPageChange={pg.setPerPage}
              onExportCSV={handleExportCSV}
            />
          </div>
          </>
        )}
      </div>

      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
            {contextMenu.item.brand} - {contextMenu.item.productType}
          </div>
          <button className="context-menu-item" onClick={() => {
            navigator.clipboard.writeText(contextMenu.item.id || contextMenu.item.entityId || contextMenu.item._id);
            import('react-hot-toast').then(m => m.default.success('ID copied to clipboard'));
            setContextMenu(null);
          }}> Copy Product ID</button>
          <button className="context-menu-item" onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(contextMenu.item, null, 2));
            import('react-hot-toast').then(m => m.default.success('JSON copied to clipboard'));
            setContextMenu(null);
          }}> Copy Raw JSON</button>
          {showBatch && (
            <button className="context-menu-item" onClick={() => {
              toggleSelect(contextMenu.item);
              setContextMenu(null);
            }}>☑ Toggle Selection</button>
          )}
        </div>
      )}
    </div>
  );
}
