import React, { useState, useEffect, useMemo } from 'react';
import { getProductEntities, getGodownStock } from '../firebase/godownServices';
import { getShopInventory } from '../firebase/shopServices';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { FileEdit } from 'lucide-react';
import EcommerceGrid from '../components/EcommerceGrid';
import UniversalEditModal from '../components/UniversalEditModal';
import { useEditMode } from '../context/EditModeContext';

export default function Catalog() {
  const navigate = useNavigate();
  const [entities, setEntities] = useState([]);
  const [godownStock, setGodownStock] = useState({});
  const [shopStock, setShopStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { editModeEnabled } = useEditMode();
  const [editingDoc, setEditingDoc] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [ents, gStock, sStock] = await Promise.all([
      getProductEntities(),
      getGodownStock(),
      getShopInventory(),
    ]);
    
    setEntities(ents);
    
    const gm = {};
    gStock.forEach(s => { gm[s.entityId] = s.qtyInStock; });
    setGodownStock(gm);
    
    const sm = {};
    sStock.forEach(s => { sm[s.entityId] = s.qty; });
    setShopStock(sm);
    
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const fuse = useMemo(() => new Fuse(entities, {
    keys: ['brand', 'productType', 'flavor', 'weight'],
    threshold: 0.35,
  }), [entities]);

  const filteredEntities = useMemo(() => {
    if (!search.trim()) return entities;
    return fuse.search(search).map(r => r.item);
  }, [search, entities, fuse]);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Browse products, view stock, and quick-navigate to actions</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/godown/stock')}> New Product Entity</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
        ) : (
          <EcommerceGrid
            items={filteredEntities}
            search={search}
            onSearchChange={setSearch}
            getStockInfo={(item) => {
              const gStock = godownStock[item.id] || 0;
              const sStock = shopStock[item.id] || 0;
              return { qty: `G:${gStock} | S:${sStock}`, label: 'Godown | Shop' };
            }}
            renderActions={(item) => (
              <>
                {editModeEnabled && (
                  <button className="btn btn-secondary w-full" style={{ padding: '8px', marginBottom: '8px', border: '1px solid var(--gold)', color: 'var(--gold)' }} onClick={() => setEditingDoc(item)}>
                    <FileEdit size={14} /> Edit Product
                  </button>
                )}
                <button className="btn btn-secondary w-full" style={{ padding: '8px', marginBottom: '8px' }} onClick={() => navigate('/godown/dispatch')}> Dispatch</button>
                <button className="btn btn-primary w-full" style={{ padding: '8px' }} onClick={() => navigate('/shop/sales')}> Sell</button>
              </>
            )}
            emptyMessage="No products found in catalog."
          />
        )}
      </div>

      {editingDoc && (
        <UniversalEditModal
          document={editingDoc}
          collectionName="product_entities"
          onClose={() => setEditingDoc(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
