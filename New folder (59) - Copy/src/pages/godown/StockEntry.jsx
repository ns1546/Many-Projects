import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileEdit, X, PackagePlus } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import useMobileBottomSheet from '../../hooks/useMobileBottomSheet';
import { getProductEntities, addProductEntity, addStockIntake, getStockIntakeLogs, getGodownStock } from '../../firebase/godownServices';
import { useAuth } from '../../context/AuthContext';
import { useEditMode } from '../../context/EditModeContext';
import { downloadCSV } from '../../utils/csvExport';
import toast from 'react-hot-toast';
import EcommerceGrid from '../../components/EcommerceGrid';
import UniversalEditModal from '../../components/UniversalEditModal';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import AutocompleteInput from '../../components/AutocompleteInput';
import { normalizeProductEntity } from '../../utils/textUtils';

const PRODUCT_TYPES = ['Dry Food', 'Wet Food', 'Pouch', 'Can Food', 'Treat', 'Supplement', 'Accessory', 'Medicine', 'Other'];
const UNITS = ['pcs', 'kg', 'g', 'pack', 'box', 'bag', 'bottle', 'can', 'pouch'];
const LIFESTAGES = ['Kitten', 'Puppy', 'Adult', 'Senior', 'All Life Stages', 'Not Applicable'];

export default function StockEntry() {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const isMobile = useIsMobile();
  const { isOpen: mobileBatchOpen, openSheet: openBatchSheet, closeSheet: closeBatchSheet } = useMobileBottomSheet('batch');
  const [tab, setTab] = useState('quick'); // quick | entity | log
  const [editingDoc, setEditingDoc] = useState(null);
  const [logSearch, setLogSearch] = useState('');
  const [entities, setEntities] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  // Batch entry form
  const [batchItems, setBatchItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // New entity form
  // New entity form
  const [entityForm, setEntityForm] = useState({ brand: '', productType: '', flavor: '', weight: '', lifeStage: 'All Life Stages', unit: 'pcs', sellingPrice: '', notes: '' });
  const [entitySubmitting, setEntitySubmitting] = useState(false);
  
  const [prefillSearch, setPrefillSearch] = useState('');
  const [showPrefillDropdown, setShowPrefillDropdown] = useState(false);
  const prefillRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (prefillRef.current && !prefillRef.current.contains(event.target)) {
        setShowPrefillDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPrefillEntities = useMemo(() => {
    if (!prefillSearch) return entities.slice(0, 50);
    const lower = prefillSearch.toLowerCase();
    return entities.filter(e => 
      `${e.brand || ''} ${e.productType || ''} ${e.flavor || ''} ${e.weight || ''}`.toLowerCase().includes(lower)
    ).slice(0, 50);
  }, [entities, prefillSearch]);

  const brandOptions = useMemo(() => [...new Set(entities.map(e => e.brand).filter(Boolean))], [entities]);
  const flavorOptions = useMemo(() => [...new Set(entities.map(e => e.flavor).filter(Boolean))], [entities]);
  const weightOptions = useMemo(() => [...new Set(entities.map(e => e.weight).filter(Boolean))], [entities]);

  // Product Request form (for Godown Manager)

  // Brand quick-fill: when brand typed, show existing variants
  const brandVariants = entityForm.brand
    ? entities.filter(e => e.brand?.toLowerCase() === entityForm.brand.toLowerCase())
    : [];

  const fetchData = async () => {
    setLoading(true);
    const [ents, stocks] = await Promise.all([getProductEntities(), getGodownStock()]);
    setEntities(ents);
    const sm = {};
    stocks.forEach(s => { sm[s.entityId] = s.qtyInStock || 0; });
    setStockMap(sm);
    setLoading(false);
  };

  const fetchLogs = async () => {
    setLogLoading(true);
    const l = await getStockIntakeLogs();
    setLogs(l);
    setLogLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (tab === 'log') fetchLogs(); }, [tab]);

  const handleBatchEntry = async () => {
    if (batchItems.length === 0) { toast.error('Add at least one product.'); return; }
    for (const it of batchItems) {
      if (!it.qty || it.qty <= 0) { toast.error('Quantity must be > 0.'); return; }
      if (!it.unitPurchasePrice || it.unitPurchasePrice <= 0) { toast.error('Set a valid purchase price.'); return; }
    }
    setSubmitting(true);
    try {
      for (const it of batchItems) {
        await addStockIntake({ entityId: it.entityId, qty: it.qty, unitPurchasePrice: it.unitPurchasePrice }, profile.name || profile.email);
      }
      toast.success('Batch stock added successfully!');
      setBatchItems([]);
      fetchData();
    } catch (err) { toast.error('Failed: ' + err.message); }
    setSubmitting(false);
  };

  const addBatchItem = (entity) => {
    if (batchItems.find(i => i.entityId === entity.id)) { toast.error('Already in list.'); return; }
    setBatchItems(p => [...p, { entityId: entity.id, brand: entity.brand, productType: entity.productType, flavor: entity.flavor, weight: entity.weight, unit: entity.unit, qty: '', unitPurchasePrice: '' }]);
  };
  const updateBatchItem = (idx, field, val) => setBatchItems(p => p.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  const removeBatchItem = (idx) => setBatchItems(p => p.filter((_, i) => i !== idx));

  const handleAddEntity = async (e) => {
    e.preventDefault();
    if (!entityForm.brand || !entityForm.productType) { toast.error('Brand and Product Type are required.'); return; }
    
    // Normalize data before checking duplicates and saving
    const normalizedForm = normalizeProductEntity(entityForm);

    // Check for duplicate
    const isDuplicate = entities.some(en =>
      en.brand?.toLowerCase() === normalizedForm.brand.toLowerCase() &&
      en.productType === normalizedForm.productType &&
      (en.flavor || '') === (normalizedForm.flavor || '') &&
      (en.weight || '') === (normalizedForm.weight || '') &&
      (en.lifeStage || '') === (normalizedForm.lifeStage || '')
    );
    if (isDuplicate) { toast.error('This exact product variant already exists!'); return; }
    setEntitySubmitting(true);
    try {
      await addProductEntity(normalizedForm);
      toast.success('Product entity created!');
      setEntityForm({ brand: normalizedForm.brand, productType: '', flavor: '', weight: '', lifeStage: 'All Life Stages', unit: 'pcs', sellingPrice: '', notes: '' }); // keep brand for rapid entry
      fetchData();
    } catch (err) { toast.error('Failed: ' + err.message); }
    setEntitySubmitting(false);
  };

  const totalBatchCost = batchItems.reduce((a, it) => a + ((Number(it.qty) || 0) * (Number(it.unitPurchasePrice) || 0)), 0);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Stock Entry</h1>
          <p className="page-subtitle">Add incoming stock and manage product entities</p>
        </div>
      </div>

      <div className="tabs mb-4" style={{ maxWidth: 640, flexWrap: 'wrap' }}>
        <button id="tab-quick" className={`tab ${tab === 'quick' ? 'active' : ''}`} onClick={() => setTab('quick')}> Batch Entry</button>
        <button id="tab-entity" className={`tab ${tab === 'entity' ? 'active' : ''}`} onClick={() => setTab('entity')}> New Product Entity</button>
        <button id="tab-log" className={`tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}> Intake Log</button>
      </div>

      {/* ── BATCH ENTRY ── */}
      {tab === 'quick' && (
        <div className="ecommerce-layout" style={{ gridTemplateColumns: 'minmax(0, 1fr) 380px' }}>
          {/* Left: Product Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <EcommerceGrid
              items={entities.map(e => ({ ...e, qty: stockMap[e.id] || 0 }))}
              getStockInfo={(item) => ({ qty: item.qty || 0, label: 'current stock' })}
              renderActions={(item) => (
                <button 
                  className="btn btn-primary w-full" 
                  style={{ padding: '8px' }} 
                  onClick={() => addBatchItem(item)}
                >
                   Add to Batch
                </button>
              )}
              emptyMessage="No product entities found. Go to 'New Product Entity' to create one."
            />
          </div>

          {/* Right: Selected Items */}
          <div className={isMobile ? `m-bottom-sheet ${mobileBatchOpen ? 'open' : ''}` : ''} style={!isMobile ? { display: 'flex', flexDirection: 'column', gap: 16 } : {}}>
            {isMobile && (
              <div className="m-bottom-sheet-overlay" onClick={closeBatchSheet} />
            )}
            <div className={isMobile ? 'm-bottom-sheet-content' : ''} style={isMobile ? { display: 'flex', flexDirection: 'column', gap: 16 } : {}}>
              {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', borderRadius: '20px 20px 0 0' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><PackagePlus size={18} /> Batch ({batchItems.length})</div>
                  <button onClick={closeBatchSheet} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                </div>
              )}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div className="card-title"> Batch Entry List</div>
                <span className="badge badge-teal">{batchItems.length} products</span>
              </div>
              {batchItems.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <div className="empty-title">No items selected</div>
                  <div className="empty-desc">Click products from the catalog to add them to your batch.</div>
                </div>
              ) : (
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {batchItems.map((it, idx) => (
                    <div key={idx} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{it.brand} {it.productType} {it.flavor ? `· ${it.flavor}` : ''} {it.weight ? `· ${it.weight}` : ''}</div>
                        <button className="btn btn-danger btn-sm" onClick={() => removeBatchItem(idx)}>✕</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div className="form-group">
                          <label className="form-label">Qty Received</label>
                          <input type="number" className="form-input" min="1" value={it.qty} onChange={e => updateBatchItem(idx, 'qty', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Unit Cost (৳)</label>
                          <input type="number" className="form-input" min="0" step="1" value={it.unitPurchasePrice} onChange={e => updateBatchItem(idx, 'unitPurchasePrice', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '14px 18px', background: 'var(--gold-dim)', borderRadius: 'var(--radius)', border: '1px solid rgba(240,165,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Total Cost</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>৳{totalBatchCost.toLocaleString()}</span>
                  </div>
                  <button className="btn btn-primary btn-lg w-full" onClick={handleBatchEntry} disabled={submitting}>
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Batch Floating Action */}
      {isMobile && tab === 'quick' && !mobileBatchOpen && batchItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          left: 16,
          right: 16,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-glass)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          cursor: 'pointer'
        }} onClick={openBatchSheet}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <PackagePlus size={24} color="var(--gold)" />
              <span className="badge badge-red" style={{ position: 'absolute', top: -10, right: -10, padding: '2px 6px', fontSize: 10, borderRadius: 10 }}>{batchItems.length}</span>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cost Estimate</div>
              <div style={{ fontWeight: 800, color: 'var(--gold)', fontSize: 16 }}>৳{totalBatchCost.toLocaleString()}</div>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>Review Batch</button>
        </div>
      )}

      {/* ── NEW ENTITY ── */}
      {tab === 'entity' && (
        <div style={{ maxWidth: 600 }}>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title"> Create Product Entity</div>
                <div className="card-subtitle">Define a new product — only needs to be done once per variant</div>
              </div>
            </div>
            <form onSubmit={handleAddEntity} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group" style={{ padding: '12px', background: 'var(--bg-light)', borderRadius: 'var(--radius)', border: '1px dashed var(--border-color)', position: 'relative' }} ref={prefillRef}>
                <label className="form-label" style={{ color: 'var(--gold)' }}> Prefill from Existing Product (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Type to search existing products (e.g. Smart Heart Chicken)" 
                    value={prefillSearch}
                    onChange={e => {
                      setPrefillSearch(e.target.value);
                      setShowPrefillDropdown(true);
                    }}
                    onFocus={() => setShowPrefillDropdown(true)}
                    style={{ width: '100%', paddingRight: '30px' }}
                  />
                  {prefillSearch && (
                    <button type="button" onClick={() => { setPrefillSearch(''); setShowPrefillDropdown(false); }} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                  )}
                </div>
                {showPrefillDropdown && (
                  <div style={{ position: 'absolute', top: 75, left: 12, right: 12, maxHeight: 250, overflowY: 'auto', background: 'var(--bg-card)', zIndex: 100, border: '1px solid var(--border-glass)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)' }}>
                    {filteredPrefillEntities.length === 0 ? (
                       <div style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: 13 }}>No products found matching "{prefillSearch}"</div>
                    ) : (
                       filteredPrefillEntities.map(en => (
                        <div 
                          key={en.id} 
                          onClick={() => {
                            setEntityForm({ brand: en.brand || '', productType: en.productType || '', flavor: en.flavor || '', weight: en.weight || '', lifeStage: en.lifeStage || 'All Life Stages', unit: en.unit || 'pcs', notes: en.notes || '', sellingPrice: '' });
                            setShowPrefillDropdown(false);
                            setPrefillSearch(`${en.brand} ${en.productType} ${en.flavor ? '- ' + en.flavor : ''} ${en.weight ? '(' + en.weight + ')' : ''}`.trim());
                          }} 
                          style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', fontSize: 13, transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 600 }}>{en.brand} {en.productType}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{en.flavor ? `Flavor: ${en.flavor}` : ''} {en.weight ? `(${en.weight})` : ''}</div>
                        </div>
                       ))
                    )}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Search and click a product above to auto-fill the fields below. This prevents typos and speeds up entry.</div>
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Brand Name *</label>
                  <AutocompleteInput id="entity-brand" placeholder="e.g. Smart Heart, Whiskas" value={entityForm.brand} onChange={v => setEntityForm(p => ({ ...p, brand: v }))} options={brandOptions} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Type *</label>
                  <select id="entity-type" className="form-select" value={entityForm.productType} onChange={e => setEntityForm(p => ({ ...p, productType: e.target.value }))} required>
                    <option value="">— Select type —</option>
                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Flavor / Variant</label>
                  <AutocompleteInput id="entity-flavor" placeholder="e.g. Chicken, Tuna, Beef" value={entityForm.flavor} onChange={v => setEntityForm(p => ({ ...p, flavor: v }))} options={flavorOptions} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight / Size</label>
                  <AutocompleteInput id="entity-weight" placeholder="e.g. 400, 1, 2.5 (Tap unit below)" value={entityForm.weight} onChange={v => setEntityForm(p => ({ ...p, weight: v }))} options={weightOptions} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {['g', 'kg', 'ml', 'L', 'lbs', 'oz'].map(u => (
                      <button 
                        type="button" 
                        key={u} 
                        style={{ 
                          padding: '2px 8px', fontSize: '11px', fontWeight: 600, 
                          borderRadius: '4px', background: 'var(--bg-elevated)', 
                          color: 'var(--text-secondary)', border: '1px solid var(--border-glass)',
                          cursor: 'pointer', transition: 'var(--transition)'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        onClick={() => {
                          setEntityForm(p => {
                            const w = (p.weight || '').replace(/[a-zA-Z]+$/, '').trim();
                            return { ...p, weight: w + u };
                          });
                        }}
                      >
                        +{u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Life Stage</label>
                  <select id="entity-lifestage" className="form-select" value={entityForm.lifeStage} onChange={e => setEntityForm(p => ({ ...p, lifeStage: e.target.value }))}>
                    {LIFESTAGES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select id="entity-unit" className="form-select" value={entityForm.unit} onChange={e => setEntityForm(p => ({ ...p, unit: e.target.value }))}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea id="entity-notes" className="form-textarea" rows={2} placeholder="Any additional details about this product" value={entityForm.notes} onChange={e => setEntityForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              {/* Preview */}
              {(entityForm.brand || entityForm.productType) && (
                <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>ENTITY PREVIEW</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {entityForm.brand && <span className="badge badge-gold">{entityForm.brand}</span>}
                    {entityForm.productType && <span className="badge badge-teal">{entityForm.productType}</span>}
                    {entityForm.flavor && <span className="badge badge-purple">{entityForm.flavor}</span>}
                    {entityForm.weight && <span className="badge badge-blue">{entityForm.weight}</span>}
                    {entityForm.lifeStage && entityForm.lifeStage !== 'Not Applicable' && <span className="badge badge-amber">{entityForm.lifeStage}</span>}
                    {entityForm.unit && <span className="badge badge-gray">{entityForm.unit}</span>}
                  </div>
                </div>
              )}

          {/* Brand Quick-Fill Panel */}
          {brandVariants.length > 0 && (
            <div style={{ padding: '12px 14px', background: 'var(--teal-dim)', borderRadius: 'var(--radius)', border: '1px solid var(--teal)', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                 Quick-fill from existing "{entityForm.brand}" variants ({brandVariants.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {brandVariants.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setEntityForm(prev => ({
                      ...prev,
                      productType: v.productType || prev.productType,
                      flavor: v.flavor || '',
                      weight: v.weight || '',
                      lifeStage: v.lifeStage || 'All Life Stages',
                      unit: v.unit || 'pcs',
                    }))}
                    style={{ padding: '5px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--teal)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                  >
                    {v.productType}{v.flavor ? ` · ${v.flavor}` : ''}{v.weight ? ` · ${v.weight}` : ''}{v.lifeStage && v.lifeStage !== 'All Life Stages' && v.lifeStage !== 'Not Applicable' ? ` [${v.lifeStage}]` : ''}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Click to copy variant details, then change what's different for the new variant.</div>
            </div>
          )}

              <button id="btn-create-entity" type="submit" className="btn btn-primary btn-lg" disabled={entitySubmitting}>
                {entitySubmitting ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : ' Create Entity'}
              </button>
            </form>
          </div>
        </div>
      )}


      {/* ── INTAKE LOG ── */}
      {tab === 'log' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title"> Stock Intake Log</div>
              <div className="card-subtitle">Every stock addition recorded with timestamp</div>
            </div>
            <button
              id="btn-export-log"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const rows = logs.map(l => {
                  const en = entities.find(e => e.id === l.entityId);
                  return {
                    Product: en ? `${en.brand} ${en.productType} ${en.flavor || ''} ${en.weight || ''}`.trim() : l.entityId,
                    'Qty Added': l.qty,
                    'Unit Price (৳)': l.unitPurchasePrice,
                    'Total Cost (৳)': l.totalCost,
                    'Entered By': l.enteredBy,
                    Date: l.entryDate?.toDate?.()?.toLocaleString() || '—',
                  };
                });
                downloadCSV(rows, `stock-intake-log-${new Date().toLocaleDateString('en-CA')}.csv`);
                toast.success('Log exported.');
              }}
            >⬇ Export CSV</button>
          </div>
          <div className="table-wrapper">
            {logLoading ? <div className="loading-center"><div className="spinner" /></div>
              : logs.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No entries yet</div></div>
              : (
                <table>
                  <thead>
                    <tr><th>Intake ID</th><th>Product</th><th>Qty Added</th><th>Unit Price</th><th>Total Cost</th><th>Entered By</th><th>Date & Time</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {logs.map(l => {
                      const en = entities.find(e => e.id === l.entityId);
                      const name = en ? `${en.brand} ${en.productType}${en.flavor ? ' — ' + en.flavor : ''}${en.weight ? ' ' + en.weight : ''}` : l.entityId;
                      return (
                        <tr key={l.id}>
                          <td className="text-sm" style={{ fontFamily: 'monospace' }}>{l.receiptNo || l.id.slice(0, 8)}</td>
                          <td className="td-bold">{name}</td>
                          <td>{l.qty} {en?.unit || 'pcs'}</td>
                          <td>৳{(l.unitPurchasePrice || 0).toLocaleString()}</td>
                          <td style={{ color: 'var(--gold)', fontWeight: 700 }}>৳{(l.totalCost || 0).toLocaleString()}</td>
                          <td>{l.enteredBy}</td>
                          <td className="text-sm text-muted">{l.entryDate?.toDate?.()?.toLocaleString() || '—'}</td>
                          <td>
                            {editModeEnabled ? (
                              <button className="btn btn-primary btn-sm" onClick={() => setEditingDoc(l)}> <FileEdit size={14} /></button>
                            ) : (
                              <span className="text-sm text-muted">Enable Edit Mode</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
          </div>
        </div>
      )}

      {editingDoc && (
        <UniversalEditModal
          document={editingDoc}
          collectionName="godown_entries"
          onClose={() => setEditingDoc(null)}
          onSaved={fetchLogs}
        />
      )}
    </div>
  );
}
