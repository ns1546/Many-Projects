import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { updateProductRequest } from '../../firebase/services';
import { addProductEntity } from '../../firebase/godownServices';
import { addProductDirectlyToShop } from '../../firebase/shopServices';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

export default function ProductRequests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const isSuperAdmin = ['admin', 'chairman'].includes(profile?.role);
  
  const [editingRequest, setEditingRequest] = useState(null);
  const [editForm, setEditForm] = useState({ qty: '', sellingPrice: '', adminNotes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'product_requests'), orderBy('createdAt', 'desc')));
    setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const openApproveModal = (req) => {
    setEditingRequest(req);
    setEditForm({
      qty: req.qty || '',
      sellingPrice: req.sellingPrice || '',
      adminNotes: ''
    });
  };

  const handleApproveWithEdits = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalQty = Number(editForm.qty) || 0;
      const finalPrice = Number(editForm.sellingPrice) || 0;
      
      // 1. Update status
      await updateProductRequest(editingRequest.id, 'approved', profile.uid);
      
      // 2. Add to central entity catalog
      const entityId = await addProductEntity({
        brand: editingRequest.brand,
        productType: editingRequest.productType,
        flavor: editingRequest.flavor || '',
        weight: editingRequest.weight || '',
        lifeStage: editingRequest.lifeStage || 'All Life Stages',
        unit: 'pcs',
        notes: `Requested by ${editingRequest.requestedByName || editingRequest.requestedBy}. Admin Notes: ${editForm.adminNotes}`
      });

      // 3. Add directly to shop inventory with final values
      await addProductDirectlyToShop({
        entityId,
        brand: editingRequest.brand,
        productType: editingRequest.productType,
        flavor: editingRequest.flavor || '',
        weight: editingRequest.weight || '',
        lifeStage: editingRequest.lifeStage || 'All Life Stages',
        unit: 'pcs',
        qty: finalQty,
        sellingPrice: finalPrice
      }, profile.uid);
      
      toast.success(`Request approved and added to Shop.`);
      
      setEditingRequest(null);
      fetchRequests();
    } catch (err) {
      toast.error('Error handling request: ' + err.message);
    }
    setSubmitting(false);
  };

  const handleReject = async (request) => {
    try {
      await updateProductRequest(request.id, 'rejected', profile.uid);
      toast.success(`Request rejected.`);
      fetchRequests();
    } catch (err) {
      toast.error('Error rejecting request: ' + err.message);
    }
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pg = usePagination(filtered, 25);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Approval Bridge</h1>
          <p className="page-subtitle">Review, edit, and approve shop inventory requests</p>
        </div>
      </div>

      <div className="tabs mb-4" style={{maxWidth:650}}>
        {['pending', 'approved', 'rejected', 'all'].map(s => {
          return (
            <button key={s} className={`tab ${filter===s?'active':''}`} onClick={() => setFilter(s)} style={{textTransform:'capitalize'}}>
              {s}
            </button>
          )
        })}
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrapper">
          {loading ? <div className="loading-center"><div className="spinner"/></div>
          : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No requests found</div></div>
          : (
            <table>
              <thead><tr><th>Requested By</th><th>Product Details</th><th>Timeline</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {pg.paged.map(r => (
                  <tr key={r.id}>
                    <td className="td-bold">{r.requestedByName || r.requestedBy}</td>
                    <td style={{fontSize:13}}>
                      <div style={{fontWeight:600}}>{r.brand} - {r.productType}</div>
                      <div style={{color:'var(--text-muted)',fontSize:12, marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                        {r.flavor && <span className="badge badge-teal" style={{background: 'rgba(0,0,0,0.03)'}}>{r.flavor}</span>}
                        {r.weight && <span className="badge badge-gold" style={{background: 'rgba(0,0,0,0.03)'}}>{r.weight}</span>}
                        {r.lifeStage && r.lifeStage !== 'Not Applicable' && r.lifeStage !== 'All Life Stages' && <span className="badge badge-purple" style={{background: 'rgba(0,0,0,0.03)'}}>{r.lifeStage}</span>}
                        {r.qty > 0 && <span style={{color:'var(--teal)', fontWeight: 600}}>Req Qty: {r.qty}</span>}
                        {r.sellingPrice > 0 && <span style={{color:'var(--gold)', fontWeight: 600}}>Sug. Price: ৳{r.sellingPrice}</span>}
                      </div>
                      {r.reason && <div style={{fontSize:11, color:'var(--text-secondary)', marginTop:8, paddingLeft: 8, borderLeft: '2px solid var(--border)'}}><i>"{r.reason}"</i></div>}
                    </td>
                    <td className="text-sm text-muted">
                      <div><span style={{fontWeight: 600}}>Submitted:</span> {r.createdAt?.toDate?.()?.toLocaleDateString() || '—'}</div>
                      {r.updatedAt && r.status !== 'pending' && (
                        <div style={{marginTop: 4, color: r.status === 'approved' ? 'var(--green)' : 'var(--red)'}}>
                          <span style={{fontWeight: 600}}>Resolved:</span> {r.updatedAt?.toDate?.()?.toLocaleDateString() || '—'}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${r.status==='pending'?'amber':r.status==='approved'?'green':r.status==='manager_approved'?'blue':r.status==='manager_rejected'?'red':'red'}`}>
                        {r.status === 'pending' ? ' Pending' : r.status === 'approved' ? ' Approved' : r.status === 'manager_approved' ? ' Mgr Approved' : r.status === 'manager_rejected' ? ' Mgr Rejected' : '✕ Rejected'}
                      </span>
                    </td>
                    <td>
                      {(r.status === 'pending' || (r.status.startsWith('manager_') && isSuperAdmin)) && (
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-primary btn-sm" onClick={() => openApproveModal(r)}>
                            {r.status.startsWith('manager_') ? 'Review & Finalize' : 'Review & Approve'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(r)}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <Pagination
            page={pg.page} totalPages={pg.totalPages} total={pg.total}
            startRecord={pg.startRecord} endRecord={pg.endRecord}
            perPage={pg.perPage}
            onPageChange={pg.goTo}
            onPerPageChange={pg.setPerPage}
          />
        )}
      </div>

      {/* Partial Approval Modal */}
      {editingRequest && (
        <div className="modal-overlay">
          <div className={`modal ${isFullscreen ? 'modal-fullscreen' : ''}`} style={isFullscreen ? {} : {maxWidth: 500}}>
            <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3 className="modal-title">Approve & Modify</h3>
                <p className="modal-subtitle">Review the request from {editingRequest.requestedByName}. You can override quantities or prices before confirming.</p>
              </div>
              <div style={{display: 'flex', gap: 6}}>
                <button type="button" className="modal-close" onClick={() => setIsFullscreen(!isFullscreen)}>
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button type="button" className="modal-close" onClick={() => setEditingRequest(null)}><X size={16} /></button>
              </div>
            </div>
            
            <div style={{padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 20}}>
              <div style={{fontWeight: 600, marginBottom: 8}}>{editingRequest.brand} - {editingRequest.productType}</div>
              <div style={{fontSize: 12, color: 'var(--text-muted)'}}>Flavor: {editingRequest.flavor || 'N/A'} | Weight: {editingRequest.weight || 'N/A'} | Life Stage: {editingRequest.lifeStage || 'N/A'}</div>
              {editingRequest.reason && <div style={{fontSize: 12, marginTop: 8, fontStyle: 'italic'}}>"{editingRequest.reason}"</div>}
            </div>

            <form onSubmit={handleApproveWithEdits} style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Final Approved Qty</label>
                  <input type="number" min="0" className="form-input" value={editForm.qty} onChange={e => setEditForm(p => ({...p, qty: e.target.value}))} />
                  <div style={{fontSize: 11, color: 'var(--text-secondary)', marginTop: 4}}>Requested: {editingRequest.qty || 0}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Final Selling Price (৳)</label>
                  <input type="number" min="0" className="form-input" value={editForm.sellingPrice} onChange={e => setEditForm(p => ({...p, sellingPrice: e.target.value}))} />
                  <div style={{fontSize: 11, color: 'var(--text-secondary)', marginTop: 4}}>Suggested: {editingRequest.sellingPrice || 0}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Notes (Optional)</label>
                <textarea className="form-textarea" rows={2} placeholder="Internal notes..." value={editForm.adminNotes} onChange={e => setEditForm(p => ({...p, adminNotes: e.target.value}))} />
              </div>
              
              <div style={{display: 'flex', gap: 10, marginTop: 10}}>
                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? <span className="spinner" style={{width:16,height:16,borderWidth:2}}/> : ' Confirm Approval & Add to Shop'}
                </button>
                <button type="button" className="btn btn-ghost w-full" onClick={() => setEditingRequest(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
