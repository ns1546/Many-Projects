import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { getGodownStock, getProductEntities } from '../../firebase/godownServices';
import { downloadCSV } from '../../utils/csvExport';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Maximize2, Minimize2, X } from 'lucide-react';
import EcommerceGrid from '../../components/EcommerceGrid';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import UniversalEditModal from '../../components/UniversalEditModal';

const UNIT_COLORS = { brand: 'gold', productType: 'teal', flavor: 'purple', weight: 'blue' };

export default function GodownDashboard() {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [isProductFullscreen, setIsProductFullscreen] = useState(false);

  // Grouped products derived from useMemo, no more expanded state needed

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([getGodownStock(), getProductEntities()]);
      setStock(s);
      setEntities(e);
    } catch { toast.error('Failed to load godown data.'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Merge stock + entity details
  const merged = useMemo(() => {
    return stock.map(s => {
      const entity = entities.find(e => e.id === s.entityId) || {};
      return { ...s, ...entity, entityId: s.entityId, stockId: s.id };
    });
  }, [stock, entities]);

  // Unique filter options
  const brands = useMemo(() => [...new Set(merged.map(m => m.brand).filter(Boolean))].sort(), [merged]);
  const types = useMemo(() => [...new Set(merged.map(m => m.productType).filter(Boolean))].sort(), [merged]);

  // Fuse.js fuzzy search
  const fuse = useMemo(() => new Fuse(merged, {
    keys: ['brand', 'productType', 'flavor', 'weight', 'unit'],
    threshold: 0.35,
    includeScore: true,
  }), [merged]);

  const filtered = useMemo(() => {
    let results = search ? fuse.search(search).map(r => r.item) : merged;
    if (filterBrand) results = results.filter(r => r.brand === filterBrand);
    if (filterType) results = results.filter(r => r.productType === filterType);
    if (stockFilter === 'out_of_stock') results = results.filter(r => (r.qtyInStock || 0) <= 0);
    if (stockFilter === 'low_stock') results = results.filter(r => (r.qtyInStock || 0) > 0 && (r.qtyInStock || 0) <= 10);
    return results;
  }, [search, merged, fuse, filterBrand, filterType, stockFilter]);

  // ProductCard removed, now handled by EcommerceGrid

  // Summary stats
  const totalProducts = merged.length;
  const totalUnits = merged.reduce((a, m) => a + (m.qtyInStock || 0), 0);
  const lowStock = merged.filter(m => (m.qtyInStock || 0) <= 10 && (m.qtyInStock || 0) > 0).length;
  const outOfStock = merged.filter(m => (m.qtyInStock || 0) <= 0).length;

  const getStockBadge = (qty) => {
    if (qty <= 0) return <span className="badge badge-red">Out of Stock</span>;
    if (qty <= 10) return <span className="badge badge-amber">Low Stock</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  const handleExport = () => {
    const rows = filtered.map(m => ({
      Brand: m.brand,
      'Product Type': m.productType,
      Flavor: m.flavor || '—',
      Weight: m.weight || '—',
      Unit: m.unit || '—',
      'Qty In Stock': m.qtyInStock,
      'Last Purchase Price (৳)': m.lastUnitPurchasePrice,
      'Last Updated': m.lastUpdated?.toDate?.()?.toLocaleString() || '—',
    }));
    downloadCSV(rows, `godown-stock-${new Date().toLocaleDateString('en-CA')}.csv`);
    toast.success('CSV exported successfully.');
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-header-left">
          <p className="page-subtitle" style={{ marginTop: 0 }}>Real-time warehouse inventory — {totalProducts} products tracked</p>
        </div>
        <div className="page-header-actions">
          <button id="btn-godown-refresh" className="btn btn-ghost" onClick={fetchAll} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button id="btn-godown-export" className="btn btn-secondary" onClick={handleExport}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-4">
        <div 
          className="stat-card gold" 
          style={{ cursor: 'pointer', outline: stockFilter === 'all' ? '2px solid var(--gold)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => setStockFilter('all')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to view all warehouse products"
        >
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{totalProducts}</div>
          <div className="stat-meta">Product variants tracked</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>Inspect All Products →</div>
        </div>
        <div 
          className="stat-card teal" 
          style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => setStockFilter('all')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to view all warehouse units"
        >
          <div className="stat-label">Total Units</div>
          <div className="stat-value">{totalUnits.toLocaleString()}</div>
          <div className="stat-meta">Units in warehouse</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--teal)' }}>Inspect Units →</div>
        </div>
        <div 
          className="stat-card red" 
          style={{ cursor: 'pointer', outline: stockFilter === 'out_of_stock' ? '2px solid var(--red)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => setStockFilter('out_of_stock')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to filter out-of-stock warehouse items"
        >
          <div className="stat-label">Out of Stock</div>
          <div className="stat-value">{outOfStock}</div>
          <div className="stat-meta">Need restock</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--red)' }}>Filter Out of Stock →</div>
        </div>
        <div 
          className="stat-card purple" 
          style={{ cursor: 'pointer', outline: stockFilter === 'low_stock' ? '2px solid var(--purple)' : 'none', transition: 'transform 0.15s, box-shadow 0.15s' }} 
          onClick={() => setStockFilter('low_stock')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          title="Click to filter low stock items (≤10)"
        >
          <div className="stat-label">Low Stock</div>
          <div className="stat-value">{lowStock}</div>
          <div className="stat-meta">≤ 10 units remaining</div>
          <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--purple)' }}>Filter Low Stock →</div>
        </div>
      </div>

      <EcommerceGrid
        items={filtered}
        search={search}
        onSearchChange={setSearch}
        getStockInfo={(item) => ({ qty: item.qtyInStock || 0, label: 'in godown' })}
        renderActions={(item) => (
            <>
              <button className="btn btn-secondary w-full" style={{ padding: '8px' }} onClick={() => setSelectedItem(item)}> Details</button>
              <button className="btn btn-primary w-full" style={{ padding: '8px' }} onClick={() => navigate('/godown/dispatch')}> Dispatch</button>
              {editModeEnabled && (
                <button className="btn w-full" style={{ padding: '8px', background: 'var(--amber)', color: 'white' }} onClick={() => setEditingDoc({ ...item, id: item.stockId || item.id })}> Edit Stock</button>
              )}
            </>
        )}
        emptyMessage="No products found in warehouse."
      />

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedItem(null)}>
          <div className={`modal ${isProductFullscreen ? 'modal-fullscreen' : ''}`}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between'}}>
              <h3 className="modal-title">Product Details</h3>
              <div style={{display: 'flex', gap: 6}}>
                <button type="button" className="modal-close" onClick={() => setIsProductFullscreen(!isProductFullscreen)}>
                  {isProductFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" className="modal-close" onClick={() => setSelectedItem(null)}><X size={16} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Brand', selectedItem.brand],
                ['Product Type', selectedItem.productType],
                ['Flavor / Variant', selectedItem.flavor || '—'],
                ['Weight / Size', selectedItem.weight || '—'],
                ['Unit', selectedItem.unit || '—'],
                ['Quantity in Stock', `${(selectedItem.qtyInStock || 0).toLocaleString()} units`],
                ['Last Purchase Price', `৳${(selectedItem.lastUnitPurchasePrice || 0).toLocaleString()}`],
                ['Last Updated', selectedItem.lastUpdated?.toDate?.()?.toLocaleString() || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelectedItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editingDoc && (
        <UniversalEditModal
          document={editingDoc}
          collectionName="godown_stock"
          onClose={() => setEditingDoc(null)}
          onSaved={fetchAll}
        />
      )}
    </div>
  );
}
