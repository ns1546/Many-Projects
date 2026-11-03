import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEditMode } from '../context/EditModeContext';
import { universalEditDocument, universalRequestEdit, universalSoftDelete, universalHardDelete } from '../firebase/universalEditService';
import { requestSoftDeleteDocument } from '../firebase/auditServices';
import { getGodownStock, getProductEntities } from '../firebase/godownServices';
import { getShopInventory } from '../firebase/shopServices';
import toast from 'react-hot-toast';
import { ShieldAlert, Info, Trash2, Save, FileEdit, X, Maximize2, Minimize2, AlertTriangle, Package, Search, PlusCircle, RefreshCw } from 'lucide-react';

// ── Section config: which collections get which renderer ─────────────────────
const SECTION = {
  SALE:      ['shop_sales','godown_sales'],
  RETURN:    ['shop_returns','godown_returns'],
  INVENTORY: ['shop_inventory','godown_stock'],
  USER:      ['users'],
  ATTENDANCE:['attendance'],
  EXPENSE:   ['expense_entries'],
  DISPATCH:  ['dispatch_logs'],
  CATALOG:   ['products','brands','categories'],
};

const STATUS_OPTIONS = {
  shop_sales:['completed','voided'],godown_sales:['completed','voided'],
  shop_returns:['completed','voided'],godown_returns:['completed','voided'],
  expense_entries:['active','voided'],dispatch_logs:['pending','confirmed','voided'],
  attendance:['present','absent','late'],users:['active','disabled'],
  intake_logs:['active','deleted'],daily_closing:['open','closed','reconciled'],
  product_requests:['pending','approved','rejected'],
  _default:['active','pending','completed','voided','deleted'],
};

const PAYMENT_METHODS = ['Cash','Card','bKash','Nagad','Rocket','Bank Transfer','Due'];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (v) => {
  if (!v) return '—';
  if (v?.seconds) return new Date(v.seconds*1000).toLocaleString();
  return String(v);
};

const recalcSale = (items, disc) => {
  const sub = items.reduce((s,it)=>s+(Number(it.qty)||0)*(Number(it.unitPrice)||0),0);
  return { subtotal: sub, netAmount: Math.max(0, sub - (Number(disc)||0)) };
};

// ── Sub-renderers ────────────────────────────────────────────────────────────

function InventoryEditor({ fields, setFields, coll }) {
  const isGodown = coll === 'godown_stock';
  const qtyField = isGodown ? 'qtyInStock' : 'qty';
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <SectionHeader icon={<Package size={16}/>} title="Stock Details" />
      <FieldRow label={isGodown ? 'Qty In Stock' : 'Qty In Shop'}>
        <input type="number" className="form-input" value={fields[qtyField]??''} style={{fontSize:20,fontWeight:700,height:48}}
          onChange={e=>setFields(f=>({...f,[qtyField]:e.target.value}))} />
      </FieldRow>
      <FieldRow label="Selling Price (৳)">
        <input type="number" className="form-input" value={fields.sellingPrice??''} step="1"
          onChange={e=>setFields(f=>({...f,sellingPrice:e.target.value}))} />
      </FieldRow>
      {!isGodown && <FieldRow label="Status">
        <StatusSelect coll={coll} val={fields.status??''} onChange={v=>setFields(f=>({...f,status:v}))} />
      </FieldRow>}
      {fields.brand && <InfoRow label="Product" value={`${fields.brand} ${fields.productType||''} ${fields.flavor||''} ${fields.weight||''}`} />}
    </div>
  );
}

function SaleEditor({ fields, setFields, coll }) {
  const [items, setItems] = useState(() => {
    const raw = fields.items;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    }
    return [];
  });

  // Catalog item picker state
  const [catalogItems, setCatalogItems] = useState([]);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [replacingIdx, setReplacingIdx] = useState(null); // null = add new, number = replace row

  useEffect(() => {
    let mounted = true;
    async function loadCatalog() {
      try {
        const [entities, godownStk, shopStk] = await Promise.all([
          getProductEntities(),
          getGodownStock().catch(() => []),
          getShopInventory().catch(() => [])
        ]);
        if (!mounted) return;
        const list = entities.map(ent => {
          const gStock = godownStk.find(g => g.entityId === ent.id) || {};
          const sStock = shopStk.find(s => s.entityId === ent.id) || {};
          return {
            ...ent,
            entityId: ent.id,
            godownQty: gStock.qtyInStock || 0,
            shopQty: sStock.qty || 0,
            sellingPrice: sStock.sellingPrice || ent.sellingPrice || gStock.lastUnitPurchasePrice || 0,
          };
        });
        setCatalogItems(list);
      } catch (e) {
        console.error('Error loading catalog for item editor:', e);
      }
    }
    loadCatalog();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const raw = fields.items;
    if (Array.isArray(raw)) {
      setItems(raw);
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    }
  }, [fields.items]);

  const updateItemsAndTotals = (newItems) => {
    const disc = Number(fields.discountAmount ?? fields.discount ?? 0);
    const { subtotal, netAmount } = recalcSale(newItems, disc);
    setItems(newItems);
    setFields(f => ({
      ...f,
      items: newItems,
      subtotal,
      totalAmount: subtotal,
      netAmount
    }));
  };

  const handleRemoveItem = (idxToRemove) => {
    const updated = items.filter((_, idx) => idx !== idxToRemove);
    updateItemsAndTotals(updated);
  };

  const openPickerForAdd = () => {
    setReplacingIdx(null);
    setPickerSearch('');
    setShowItemPicker(true);
  };

  const openPickerForReplace = (idx) => {
    setReplacingIdx(idx);
    setPickerSearch('');
    setShowItemPicker(true);
  };

  const handleSelectCatalogItem = (catItem) => {
    const structuredItem = {
      entityId: catItem.id || catItem.entityId,
      brand: catItem.brand || '',
      productType: catItem.productType || '',
      flavor: catItem.flavor || '',
      weight: catItem.weight || '',
      unit: catItem.unit || 'pcs',
      qty: replacingIdx !== null ? (items[replacingIdx]?.qty || 1) : 1,
      unitPrice: Number(catItem.sellingPrice || 0)
    };

    if (replacingIdx !== null) {
      const updated = [...items];
      updated[replacingIdx] = structuredItem;
      updateItemsAndTotals(updated);
      toast.success(`Replaced with ${catItem.brand} ${catItem.productType}`);
    } else {
      updateItemsAndTotals([...items, structuredItem]);
      toast.success(`Added ${catItem.brand} ${catItem.productType}`);
    }
    setShowItemPicker(false);
  };

  const updateDiscount = (val) => {
    const numVal = Number(val) || 0;
    const { netAmount } = recalcSale(items, numVal);
    setFields(f => ({ ...f, discount: numVal, discountAmount: numVal, netAmount }));
  };

  const getItemLabel = (it, idx) => {
    return it.name || it.productName || it.product ||
      [it.brand, it.productType, it.flavor, it.weight].filter(Boolean).join(' ') ||
      `Item #${idx + 1}`;
  };

  const filteredCatalog = catalogItems.filter(ci => {
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase();
    return `${ci.brand} ${ci.productType} ${ci.flavor} ${ci.weight}`.toLowerCase().includes(q);
  });

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14,position:'relative'}}>
      <SectionHeader icon={<FileEdit size={16}/>} title="Transaction & Items Editor" />

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <FieldRow label="Customer / Party">
          <input className="form-input" value={fields.customerName ?? fields.buyerName ?? ''}
            onChange={e=>setFields(f=>({...f, customerName: e.target.value, buyerName: e.target.value}))} />
        </FieldRow>
        <FieldRow label="Payment Method">
          <select className="form-select" value={fields.paymentMethod ?? 'Cash'}
            onChange={e=>setFields(f=>({...f, paymentMethod: e.target.value}))}>
            {PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}
          </select>
        </FieldRow>
      </div>

      <div style={{background:'var(--bg-tertiary)',borderRadius:'var(--radius-lg)',padding:14,border:'1px solid var(--border)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--gold)',textTransform:'uppercase',letterSpacing:.5,display:'flex',alignItems:'center',gap:6}}>
            <Package size={14}/> Line Items ({items.length})
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={openPickerForAdd}
            style={{display:'flex',alignItems:'center',gap:6,fontSize:12,padding:'6px 12px',fontWeight:700}}
          >
            <PlusCircle size={14}/> + Add Item from Catalog
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{padding:'20px',textAlign:'center',color:'var(--text-muted)',fontSize:13,background:'var(--bg-primary)',borderRadius:'var(--radius)',border:'1px dashed var(--border)'}}>
            No items in this transaction. Click <b>+ Add Item from Catalog</b> above to select a tracked item.
          </div>
        ) : (
          items.map((it, idx) => (
            <div key={idx} style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,padding:'10px 12px',background:'var(--bg-primary)',borderRadius:'var(--radius)',border:'1px solid var(--border)',flexWrap:'wrap'}}>
              <div style={{flex:'1 1 180px',display:'flex',flexDirection:'column',gap:2}}>
                <span style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Product Description</span>
                <input
                  type="text"
                  className="form-input"
                  style={{padding:'4px 8px',fontSize:12,height:30}}
                  value={getItemLabel(it, idx)}
                  onChange={e => {
                    const a = [...items];
                    a[idx] = { ...a[idx], brand: e.target.value };
                    setItems(a);
                    setFields(f => ({ ...f, items: a }));
                  }}
                />
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:2,width:70}}>
                <span style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Qty</span>
                <input
                  type="number"
                  className="form-input"
                  style={{padding:'4px 6px',fontSize:13,height:30,fontWeight:600}}
                  value={it.qty ?? 1}
                  onChange={e => {
                    const a = [...items];
                    a[idx] = { ...a[idx], qty: Number(e.target.value) };
                    updateItemsAndTotals(a);
                  }}
                />
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:2,width:90}}>
                <span style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Price (৳)</span>
                <input
                  type="number"
                  className="form-input"
                  style={{padding:'4px 6px',fontSize:13,height:30}}
                  value={it.unitPrice ?? it.price ?? 0}
                  onChange={e => {
                    const a = [...items];
                    a[idx] = { ...a[idx], unitPrice: Number(e.target.value) };
                    updateItemsAndTotals(a);
                  }}
                />
              </div>
              <div style={{width:85,textAlign:'right',display:'flex',flexDirection:'column',gap:2}}>
                <span style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Subtotal</span>
                <span style={{fontWeight:700,fontSize:13,color:'var(--gold)',lineHeight:'30px'}}>
                  ৳{((Number(it.qty)||0) * (Number(it.unitPrice ?? it.price)||0)).toLocaleString()}
                </span>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  title="Switch to another product from catalog"
                  style={{padding:'0 8px',height:30,display:'flex',alignItems:'center',gap:4,fontSize:11}}
                  onClick={() => openPickerForReplace(idx)}
                >
                  <RefreshCw size={12}/> Change
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  title="Delete item from transaction"
                  style={{padding:'0 8px',height:30,display:'flex',alignItems:'center',gap:4,fontSize:11}}
                  onClick={() => handleRemoveItem(idx)}
                >
                  <Trash2 size={13}/> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <FieldRow label="Discount (৳)">
          <input type="number" className="form-input" value={fields.discount ?? fields.discountAmount ?? 0}
            onChange={e=>updateDiscount(e.target.value)} />
        </FieldRow>
        <FieldRow label="Subtotal (৳)">
          <input className="form-input" readOnly style={{background:'var(--bg-tertiary)',cursor:'not-allowed'}} value={fields.subtotal ?? fields.totalAmount ?? 0} />
        </FieldRow>
        <FieldRow label="Net Amount (৳)">
          <input className="form-input" readOnly style={{background:'var(--bg-tertiary)',fontWeight:700,color:'var(--gold)',cursor:'not-allowed'}} value={fields.netAmount ?? 0} />
        </FieldRow>
      </div>
      <FieldRow label="Status">
        <StatusSelect coll={coll} val={fields.status??''} onChange={v=>setFields(f=>({...f,status:v}))} />
      </FieldRow>

      {/* Catalog Product Search & Selector Overlay */}
      {showItemPicker && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 640,
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8}}>
                <Package size={16} color="var(--gold)"/>
                {replacingIdx !== null ? `Replace Line Item #${replacingIdx + 1}` : 'Select Item from Catalog'}
              </div>
              <button
                type="button"
                onClick={() => setShowItemPicker(false)}
                style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}
              >
                <X size={18}/>
              </button>
            </div>

            <div style={{padding: '12px 16px', borderBottom: '1px solid var(--border)'}}>
              <div style={{position: 'relative'}}>
                <Search size={15} style={{position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)'}}/>
                <input
                  type="text"
                  className="form-input"
                  style={{paddingLeft: 34, width: '100%', fontSize: 13}}
                  placeholder="Search by Brand, Product Type, Flavor, or Weight..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div style={{overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 6}}>
              {filteredCatalog.length === 0 ? (
                <div style={{padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13}}>
                  No matching products found in catalog.
                </div>
              ) : (
                filteredCatalog.slice(0, 50).map((ci, i) => (
                  <div
                    key={ci.id || i}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'var(--bg-primary)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSelectCatalogItem(ci)}
                  >
                    <div>
                      <div style={{fontWeight: 600, fontSize: 13, color: 'var(--text-primary)'}}>
                        {ci.brand} {ci.productType}
                      </div>
                      <div style={{fontSize: 11, color: 'var(--text-muted)', marginTop: 2}}>
                        {[ci.flavor && `Flavor: ${ci.flavor}`, ci.weight && `Weight: ${ci.weight}`, `Shop Qty: ${ci.shopQty}`, `Godown Qty: ${ci.godownQty}`].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                      <span style={{fontWeight: 700, color: 'var(--gold)', fontSize: 13}}>
                        ৳{Number(ci.sellingPrice || 0).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{padding: '4px 10px', fontSize: 11}}
                        onClick={(e) => { e.stopPropagation(); handleSelectCatalogItem(ci); }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserEditor({ fields, setFields }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <SectionHeader icon={<FileEdit size={16}/>} title="User Account" />
      <FieldRow label="Full Name">
        <input className="form-input" value={fields.name??''} onChange={e=>setFields(f=>({...f,name:e.target.value}))} />
      </FieldRow>
      <FieldRow label="Role">
        <select className="form-select" value={fields.role??'salesman'} onChange={e=>setFields(f=>({...f,role:e.target.value}))}>
          {['admin','chairman','salesman','godown_manager'].map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Active">
        <select className="form-select" value={String(fields.isActive??true)} onChange={e=>setFields(f=>({...f,isActive:e.target.value==='true'}))}>
          <option value="true">✅ Active</option><option value="false">❌ Disabled</option>
        </select>
      </FieldRow>
      {fields.email && <InfoRow label="Email" value={fields.email} />}
    </div>
  );
}

function AttendanceEditor({ fields, setFields }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <SectionHeader icon={<FileEdit size={16}/>} title="Attendance Record" />
      <FieldRow label="Status">
        <div style={{display:'flex',gap:8}}>
          {['present','absent','late'].map(s=>(
            <button key={s} onClick={()=>setFields(f=>({...f,status:s}))}
              style={{flex:1,padding:'10px 0',borderRadius:'var(--radius)',border:'2px solid',cursor:'pointer',fontWeight:700,fontSize:13,
                borderColor:fields.status===s?'var(--gold)':'var(--border)',
                background:fields.status===s?'var(--gold)':'var(--bg-secondary)',
                color:fields.status===s?'#000':'var(--text-muted)'}}>
              {s==='present'?'✅':s==='absent'?'❌':'⏰'} {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </FieldRow>
      {fields.employeeName && <InfoRow label="Employee" value={fields.employeeName} />}
    </div>
  );
}

function ExpenseEditor({ fields, setFields }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <SectionHeader icon={<FileEdit size={16}/>} title="Expense Entry" />
      <FieldRow label="Purpose">
        <input className="form-input" value={fields.purpose??''} onChange={e=>setFields(f=>({...f,purpose:e.target.value}))} />
      </FieldRow>
      <FieldRow label="Amount (৳)">
        <input type="number" className="form-input" value={fields.amount??''} style={{fontSize:20,fontWeight:700,height:48}}
          onChange={e=>setFields(f=>({...f,amount:e.target.value}))} />
      </FieldRow>
      <FieldRow label="Category">
        <select className="form-select" value={fields.category??'General'} onChange={e=>setFields(f=>({...f,category:e.target.value}))}>
          {['General','Transport','Utilities','Supplies','Maintenance','Other'].map(c=><option key={c}>{c}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Status">
        <StatusSelect coll="expense_entries" val={fields.status??'active'} onChange={v=>setFields(f=>({...f,status:v}))} />
      </FieldRow>
    </div>
  );
}

function GenericEditor({ fields, setFields, collectionName }) {
  const opts = STATUS_OPTIONS[collectionName]||STATUS_OPTIONS._default;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {Object.entries(fields).map(([key,val])=>{
        if(key==='status') return (
          <FieldRow key={key} label="Status">
            <StatusSelect coll={collectionName} val={val} onChange={v=>setFields(f=>({...f,status:v}))} />
          </FieldRow>
        );
        if(typeof val==='boolean') return (
          <FieldRow key={key} label={key}>
            <select className="form-select" value={String(val)} onChange={e=>setFields(f=>({...f,[key]:e.target.value==='true'}))}>
              <option value="true">Yes / True</option><option value="false">No / False</option>
            </select>
          </FieldRow>
        );
        const isLong = String(val).length>80||String(val).includes('\n');
        const isNum = !isNaN(Number(val))&&val!=='';
        return (
          <FieldRow key={key} label={key}>
            {isLong
              ? <textarea className="form-textarea" style={{minHeight:70,fontFamily:'monospace',fontSize:12}} value={val} onChange={e=>setFields(f=>({...f,[key]:e.target.value}))} />
              : <input type={isNum?'number':'text'} className="form-input" value={val??''} onChange={e=>setFields(f=>({...f,[key]:e.target.value}))} />
            }
          </FieldRow>
        );
      })}
    </div>
  );
}

// ── Shared UI atoms ──────────────────────────────────────────────────────────
function SectionHeader({icon,title}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'2px solid var(--gold)',marginBottom:4}}>
      <span style={{color:'var(--gold)'}}>{icon}</span>
      <span style={{fontWeight:700,fontSize:13,letterSpacing:.5,textTransform:'uppercase'}}>{title}</span>
    </div>
  );
}
function FieldRow({label,children}) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:8,alignItems:'center'}}>
      <label style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.4}}>{label}</label>
      {children}
    </div>
  );
}
function InfoRow({label,value}) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'140px 1fr',gap:8,padding:'6px 10px',background:'var(--bg-tertiary)',borderRadius:'var(--radius)',fontSize:13}}>
      <span style={{color:'var(--text-muted)',fontWeight:600,fontSize:11,textTransform:'uppercase'}}>{label}</span>
      <span style={{fontWeight:600}}>{value}</span>
    </div>
  );
}
function StatusSelect({coll,val,onChange}) {
  const opts = STATUS_OPTIONS[coll]||STATUS_OPTIONS._default;
  return (
    <select className="form-select" value={val} onChange={e=>onChange(e.target.value)} style={{fontWeight:700}}>
      {!opts.includes(String(val))&&val&&<option value={val} disabled>{val} (current)</option>}
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────
export default function UniversalEditModal({ document: doc, collectionName, onClose, onSaved, readonlyFields=['id','uid','createdAt','timestamp','_lastEditedAt','deletedAt','_revertedAt','_revertedBy'] }) {
  const { profile } = useAuth();
  const { editModeEnabled } = useEditMode();
  const isAdmin = ['admin','chairman'].includes(profile?.role);
  const [fields, setFields] = useState({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(()=>{
    if(!doc) return;
    const f={};
    Object.entries(doc).forEach(([k,v])=>{
      if(k==='id'||readonlyFields.includes(k)) return;
      if(v&&typeof v==='object'&&v.seconds!==undefined) return;
      if(Array.isArray(v)) f[k]=v;
      else if(v&&typeof v==='object') f[k]=JSON.stringify(v,null,2);
      else f[k]=v??'';
    });
    setFields(f);
  },[doc]);

  if(!doc||!editModeEnabled) return null;

  const getSection = () => {
    for(const [sec,colls] of Object.entries(SECTION)) if(colls.includes(collectionName)) return sec;
    return 'GENERIC';
  };
  const section = getSection();

  const buildUpdates = () => {
    const updates={};
    for(const [k,v] of Object.entries(fields)){
      if(typeof v==='boolean'){ updates[k]=v; continue; }
      if(typeof v==='string'){
        const t=v.trim();
        try{
          if(t.startsWith('{')||t.startsWith('[')){ updates[k]=JSON.parse(t); continue; }
        }catch{}
        if(t==='true'){ updates[k]=true; }
        else if(t==='false'){ updates[k]=false; }
        else if(t!==''&&!isNaN(Number(t))&&!['receiptNo','returnReceiptNo','email','name','purpose','customerName','brand','productType','flavor','weight','unit','paymentMethod','refundMethod','status','role','category','reason','notes','deleteReason'].includes(k)){ updates[k]=Number(t); }
        else { updates[k]=v; }
      } else { updates[k]=v; }
    }
    return updates;
  };

  const handleSave = async () => {
    if(!reason.trim()||reason.length<5){ toast.error('Please provide a reason (min 5 chars)'); return; }
    setLoading(true);
    try{
      const updates = buildUpdates();
      if(isAdmin){
        await universalEditDocument({collectionName,documentId:doc.id,updates,reason,performedBy:profile.uid,performedByName:profile.name||profile.email});
        toast.success('✅ Document updated & audit log created');
      } else {
        await universalRequestEdit({collectionName,documentId:doc.id,updates,reason,performedBy:profile.uid,performedByName:profile.name||profile.email});
        toast.success('📋 Edit request submitted for admin approval');
      }
      onSaved?.(); onClose();
    } catch(e){ toast.error('Save failed: '+e.message); }
    setLoading(false);
  };

  const handleDelete = async (type) => {
    if(!reason.trim()||reason.length<5){ toast.error('Provide a reason first'); return; }
    setLoading(true);
    try{
      if(isAdmin){
        const fn = type==='hard'?universalHardDelete:universalSoftDelete;
        await fn({collectionName,documentId:doc.id,reason,performedBy:profile.uid,performedByName:profile.name||profile.email});
        toast.success(type==='hard'?'🗑️ Permanently deleted':'🗂️ Record soft-deleted');
      } else {
        await requestSoftDeleteDocument(collectionName,doc.id,reason,profile.uid,profile.name||profile.email);
        toast.success('📋 Delete request submitted');
      }
      onSaved?.(); onClose();
    } catch(e){ toast.error('Delete failed: '+e.message); }
    setLoading(false);
    setConfirmDelete(null);
  };

  const modalStyle = fullscreen
    ? {position:'fixed',inset:0,zIndex:9999,display:'flex',flexDirection:'column'}
    : {maxWidth:'min(96vw,900px)',width:'100%',display:'flex',flexDirection:'column',maxHeight:'95vh'};

  return (
    <div className="modal-overlay">
      <div className="modal" style={modalStyle}>

        {/* Header */}
        <div className="modal-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div>
            <h3 style={{margin:0,display:'flex',alignItems:'center',gap:8,fontSize:15}}>
              <FileEdit size={18} style={{color:'var(--gold)'}} />
              {isAdmin?'Admin Edit':'Edit Request'}
            </h3>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:3,display:'flex',gap:8,alignItems:'center'}}>
              <span className="badge badge-amber" style={{fontSize:10}}>{collectionName}</span>
              <span style={{fontFamily:'monospace',opacity:.6,fontSize:10}}>{doc.id}</span>
              {!isAdmin&&<span className="badge badge-teal" style={{fontSize:10}}>Will need admin approval</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:6}}>
            <button className="modal-close" onClick={()=>setFullscreen(f=>!f)} title={fullscreen?'Minimize':'Maximize'}>
              {fullscreen?<Minimize2 size={15}/>:<Maximize2 size={15}/>}
            </button>
            <button className="modal-close" onClick={onClose}><X size={15}/></button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{overflowY:'auto',flex:1,padding:'1.25rem 1.5rem'}}>
          {section==='INVENTORY' && !fields.items && <InventoryEditor fields={fields} setFields={setFields} coll={collectionName} />}
          {(section==='SALE' || fields.items !== undefined) && <SaleEditor fields={fields} setFields={setFields} coll={collectionName} />}
          {section==='USER'      && <UserEditor fields={fields} setFields={setFields} />}
          {section==='ATTENDANCE'&& <AttendanceEditor fields={fields} setFields={setFields} />}
          {section==='EXPENSE'   && <ExpenseEditor fields={fields} setFields={setFields} />}
          {section==='GENERIC'   && fields.items === undefined && <GenericEditor fields={fields} setFields={setFields} collectionName={collectionName} />}
          {(section==='RETURN'||section==='DISPATCH'||section==='CATALOG') && fields.items === undefined &&
            <GenericEditor fields={fields} setFields={setFields} collectionName={collectionName} />}
        </div>

        {/* Reason */}
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',background:'var(--bg-secondary)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
            <Info size={13} style={{color:'var(--gold)'}}/>
            <label style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.4,color:'var(--text-muted)'}}>
              Reason for change (required)
            </label>
            <span style={{marginLeft:'auto',fontSize:10,color:reason.length<5?'var(--danger)':'var(--green)'}}>{reason.length} chars</span>
          </div>
          <input className="form-input" placeholder="Why is this change needed? (min 5 characters)" value={reason} onChange={e=>setReason(e.target.value)} />
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,flexShrink:0}}>
          <div style={{display:'flex',gap:6}}>
            {confirmDelete ? (
              <>
                <span style={{fontSize:13,color:'var(--danger)',alignSelf:'center',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
                  <AlertTriangle size={14}/> Confirm {confirmDelete==='hard'?'PERMANENT DELETE':isAdmin?'Soft Delete':'Delete Request'}?
                </span>
                <button className="btn btn-danger btn-sm" disabled={loading} onClick={()=>handleDelete(confirmDelete)}>
                  {loading?'…':<><Trash2 size={13}/> Yes</>}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setConfirmDelete(null)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" style={{color:'var(--danger)'}} onClick={()=>setConfirmDelete('soft')}>
                  <Trash2 size={13}/> {isAdmin?'Soft Delete':'Request Delete'}
                </button>
                {isAdmin && (
                  <button className="btn btn-danger btn-sm" onClick={()=>setConfirmDelete('hard')}>
                    <ShieldAlert size={13}/> Hard Delete
                  </button>
                )}
              </>
            )}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading||reason.length<5} style={{display:'flex',alignItems:'center',gap:6}}>
              {loading?'Saving…':<><Save size={15}/>{isAdmin?'Save & Log':'Submit Request'}</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
