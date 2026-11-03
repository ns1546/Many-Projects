import {
  doc, getDoc, updateDoc, deleteDoc, collection, addDoc,
  serverTimestamp, getDocs, query, where, increment
} from 'firebase/firestore';
import { db } from './config';

// ── All editable collections in the system ───────────────────────────────────
export const EDITABLE_COLLECTIONS = {
  // Godown
  godown_stock:    { label: 'Godown Stock',      group: 'Godown' },
  godown_entries:  { label: 'Godown Intake Logs', group: 'Godown' },
  godown_sales:    { label: 'Godown Sales',       group: 'Godown' },
  dispatch_logs:   { label: 'Dispatch Logs',      group: 'Godown' },
  // Shop
  shop_inventory:  { label: 'Shop Inventory',     group: 'Shop' },
  shop_sales:      { label: 'Shop Sales',         group: 'Shop' },
  shop_returns:    { label: 'Shop Returns',       group: 'Shop' },
  godown_returns:  { label: 'Godown Returns',     group: 'Godown' },
  // Admin / HR
  users:           { label: 'Users',              group: 'Admin' },
  attendance:      { label: 'Attendance',         group: 'Admin' },
  product_requests:{ label: 'Product Requests',   group: 'Admin' },
  expense_entries: { label: 'Expense Entries',    group: 'Finance' },
  cash_handovers:  { label: 'Cash Handovers',     group: 'Finance' },
  daily_closing:   { label: 'Daily Closings',     group: 'Finance' },
  // Catalog
  products:        { label: 'Products',           group: 'Catalog' },
  brands:          { label: 'Brands',             group: 'Catalog' },
  categories:      { label: 'Categories',         group: 'Catalog' },
};

// ── Write an audit entry ──────────────────────────────────────────────────────
export const writeAuditEntry = async ({
  actionType, collectionName, documentId,
  oldData, newData, reason,
  performedBy, performedByName,
}) => {
  await addDoc(collection(db, 'audit_logs'), {
    actionType,
    collection: collectionName,
    documentId,
    oldData: oldData || null,
    newData:  newData  || null,
    reason:   reason   || 'Admin edit',
    performedBy,
    performedByName,
    status: 'pending_review',
    timestamp: serverTimestamp(),
  });
};

// ── Universal field-level edit ────────────────────────────────────────────────
export const universalEditDocument = async ({
  collectionName, documentId,
  updates,           // plain object of fields to update
  reason,
  performedBy, performedByName,
}) => {
  const ref   = doc(db, collectionName, documentId);
  const snap  = await getDoc(ref);
  if (!snap.exists()) throw new Error('Document not found');

  const oldData = snap.data();

  // Handle inventory synchronization for status transitions and item edits
  const wasVoided = oldData.status === 'voided';
  const willBeVoided = updates.status === 'voided';
  const itemsChanged = updates.items && JSON.stringify(updates.items) !== JSON.stringify(oldData.items);

  if (!wasVoided && willBeVoided) {
    // Transitioning from completed -> voided: reverse stock effect (restock items)
    await _reverseInventoryEffect(collectionName, oldData);
  } else if (wasVoided && !willBeVoided && updates.status === 'completed') {
    // Transitioning from voided -> completed: apply stock effect (deduct items)
    await _reapplyInventoryEffect(collectionName, { ...oldData, ...updates });
  } else if (!wasVoided && !willBeVoided && itemsChanged) {
    // Modifying items on an active/completed transaction: reverse old items and apply new items
    await _reverseInventoryEffect(collectionName, oldData);
    await _reapplyInventoryEffect(collectionName, { ...oldData, items: updates.items });
  }

  await updateDoc(ref, { ...updates, _lastEditedAt: serverTimestamp(), _lastEditedBy: performedByName });

  await writeAuditEntry({
    actionType: 'ADMIN_EDIT',
    collectionName,
    documentId,
    oldData,
    newData: { ...oldData, ...updates },
    reason,
    performedBy,
    performedByName,
  });
};

// ── Universal edit request (for non-admins) ──────────────────────────────────
export const universalRequestEdit = async ({
  collectionName, documentId,
  updates,           
  reason,
  performedBy, performedByName,
}) => {
  const ref   = doc(db, collectionName, documentId);
  const snap  = await getDoc(ref);
  if (!snap.exists()) throw new Error('Document not found');

  const oldData = snap.data();

  // ONLY write the audit entry. DO NOT update the actual document.
  await writeAuditEntry({
    actionType: 'EDIT_REQUEST',
    collectionName,
    documentId,
    oldData,
    newData: { ...oldData, ...updates },
    reason,
    performedBy,
    performedByName,
  });
};

// ── Execute a pending EDIT_REQUEST ───────────────────────────────────────────
export const executeEditRequest = async ({
  auditLog,
  performedBy, performedByName,
}) => {
  if (!auditLog.newData) throw new Error('No updated data to apply');

  const { collection: col, documentId, newData, oldData } = auditLog;
  const ref = doc(db, col, documentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Document no longer exists');

  // Handle inventory synchronization for status transitions and item edits
  const wasVoided = oldData?.status === 'voided';
  const willBeVoided = newData.status === 'voided';
  const itemsChanged = newData.items && JSON.stringify(newData.items) !== JSON.stringify(oldData?.items || []);

  if (!wasVoided && willBeVoided) {
    await _reverseInventoryEffect(col, oldData || {});
  } else if (wasVoided && !willBeVoided && newData.status === 'completed') {
    await _reapplyInventoryEffect(col, newData);
  } else if (!wasVoided && !willBeVoided && itemsChanged) {
    await _reverseInventoryEffect(col, oldData || {});
    await _reapplyInventoryEffect(col, newData);
  }

  await updateDoc(ref, { 
    ...newData, 
    _lastEditedAt: serverTimestamp(), 
    _lastEditedBy: auditLog.performedByName 
  });

  await updateDoc(doc(db, 'audit_logs', auditLog.id), {
    status: 'approved',
    resolvedAt: serverTimestamp(),
    resolvedBy: performedBy,
    resolvedByName: performedByName,
  });
};

// ── Universal hard delete (with full snapshot backup) ────────────────────────
export const universalHardDelete = async ({
  collectionName, documentId,
  reason,
  performedBy, performedByName,
}) => {
  const ref  = doc(db, collectionName, documentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Document not found');

  const oldData = snap.data();

  // Reverse inventory side-effects before deleting
  await _reverseInventoryEffect(collectionName, oldData);

  await deleteDoc(ref);

  await writeAuditEntry({
    actionType: 'ADMIN_DELETE',
    collectionName,
    documentId,
    oldData,
    newData: null,
    reason,
    performedBy,
    performedByName,
  });
};

// ── Universal soft delete ─────────────────────────────────────────────────────
export const universalSoftDelete = async ({
  collectionName, documentId,
  reason,
  performedBy, performedByName,
}) => {
  const ref  = doc(db, collectionName, documentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Document not found');

  const oldData = snap.data();

  // Reverse inventory side-effects
  await _reverseInventoryEffect(collectionName, oldData);

  await updateDoc(ref, {
    status: 'deleted',
    deletedAt: serverTimestamp(),
    deletedBy: performedBy,
    deletedByName: performedByName,
    deleteReason: reason,
  });

  await writeAuditEntry({
    actionType: 'ADMIN_SOFT_DELETE',
    collectionName,
    documentId,
    oldData,
    newData: { ...oldData, status: 'deleted' },
    reason,
    performedBy,
    performedByName,
  });
};

// ── Restore a hard-deleted document (from audit log snapshot) ────────────────
export const universalRestoreFromLog = async ({
  auditLog,
  performedBy, performedByName,
}) => {
  if (!auditLog.oldData) throw new Error('No snapshot available to restore');

  const { collection: col, documentId, oldData } = auditLog;
  const ref = doc(db, col, documentId);

  // Re-create the document with original data
  const { setDoc } = await import('firebase/firestore');
  await setDoc(ref, {
    ...oldData,
    _restoredAt: serverTimestamp(),
    _restoredBy: performedByName,
  });

  // Re-apply inventory effects
  await _reapplyInventoryEffect(col, oldData);

  // Mark audit log resolved
  await updateDoc(doc(db, 'audit_logs', auditLog.id), {
    status: 'restored',
    resolvedAt: serverTimestamp(),
    resolvedBy: performedBy,
    resolvedByName: performedByName,
  });
};

// ── Revert an edit back to oldData (handles ALL edit action types) ────────────
export const universalRevertEdit = async ({
  auditLog,
  performedBy, performedByName,
}) => {
  if (!auditLog.oldData) throw new Error('No previous snapshot to restore from');

  // Guard: don't double-revert already resolved logs (unless admin force)
  const alreadyResolved = ['reverted', 'rejected', 'approved'].includes(auditLog.status);
  if (alreadyResolved) {
    throw new Error(`This log is already "${auditLog.status}" and cannot be reverted again`);
  }

  const { collection: col, documentId, oldData } = auditLog;
  const ref = doc(db, col, documentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Target document no longer exists in ' + col);

  // For EDIT_INTAKE: also revert the stock quantity delta
  if (auditLog.actionType === 'EDIT_INTAKE' && col === 'godown_entries') {
    const currentData = snap.data();
    const { getDocs: _gd, collection: _c, query: _q, where: _w } = await import('firebase/firestore');
    const stockQ = _q(_c(db, 'godown_stock'), _w('entityId', '==', currentData.entityId));
    const stockSnap = await _gd(stockQ);
    if (!stockSnap.empty) {
      const diffQty = (oldData.qty || 0) - (currentData.qty || 0);
      await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
        qtyInStock: increment(diffQty),
        ...(oldData.unitPurchasePrice !== undefined ? { lastUnitPurchasePrice: oldData.unitPurchasePrice } : {}),
      });
    }
  }

  // For EDIT_STOCK: the oldData already contains the field values to restore
  // For ADMIN_EDIT / EDIT_SALE / EDIT_INTAKE / any other type:
  // Simply write back oldData fields (excluding system meta fields)
  const safeOldData = { ...oldData };
  delete safeOldData.id;
  delete safeOldData._lastEditedAt;
  delete safeOldData._lastEditedBy;

  await updateDoc(ref, {
    ...safeOldData,
    _lastEditedAt: serverTimestamp(),
    _lastEditedBy: `Reverted by ${performedByName}`,
    _revertedAt: serverTimestamp(),
    _revertedBy: performedBy,
  });

  await updateDoc(doc(db, 'audit_logs', auditLog.id), {
    status: 'reverted',
    resolvedAt: serverTimestamp(),
    resolvedBy: performedBy,
    resolvedByName: performedByName,
  });
};

// ── Helper: find inventory document reference reliably by entityId or attributes
const _findInventoryDocRef = async (invCol, item) => {
  if (!item) return null;
  // 1. Try matching by entityId
  if (item.entityId) {
    const snap = await getDocs(query(collection(db, invCol), where('entityId', '==', item.entityId)));
    if (!snap.empty) return snap.docs[0].id;
  }
  // 2. Try matching by id if entityId wasn't found
  if (item.id) {
    const snap = await getDocs(query(collection(db, invCol), where('entityId', '==', item.id)));
    if (!snap.empty) return snap.docs[0].id;
  }
  // 3. Fallback matching by exact attributes
  if (item.brand && item.productType) {
    const allSnap = await getDocs(collection(db, invCol));
    const matched = allSnap.docs.find(d => {
      const data = d.data();
      return (data.brand || '') === (item.brand || '') &&
             (data.productType || '') === (item.productType || '') &&
             (data.flavor || '') === (item.flavor || '') &&
             (data.weight || '') === (item.weight || '');
    });
    if (matched) return matched.id;
  }
  return null;
};

// ── Internal: reverse inventory effects when deleting or replacing a transactional doc
const _reverseInventoryEffect = async (collectionName, oldData) => {
  if (!oldData) return;
  // Sales → restore qty
  if (collectionName === 'shop_sales' || collectionName === 'godown_sales') {
    const invCol   = collectionName === 'shop_sales' ? 'shop_inventory' : 'godown_stock';
    const fieldKey = invCol === 'shop_inventory' ? 'qty' : 'qtyInStock';
    for (const item of (oldData.items || [])) {
      const docId = await _findInventoryDocRef(invCol, item);
      if (docId) {
        await updateDoc(doc(db, invCol, docId), { [fieldKey]: increment(Number(item.qty || 1)) });
      }
    }
  }

  // Dispatch → restore godown stock
  if (collectionName === 'dispatch_logs') {
    for (const item of (oldData.items || [])) {
      const docId = await _findInventoryDocRef('godown_stock', item);
      if (docId) {
        await updateDoc(doc(db, 'godown_stock', docId), { qtyInStock: increment(Number(item.qty || 1)) });
      }
    }
  }

  // Returns → reverse restock
  if ((collectionName === 'shop_returns' || collectionName === 'godown_returns') && oldData.restock) {
    const invCol   = collectionName === 'shop_returns' ? 'shop_inventory' : 'godown_stock';
    const fieldKey = invCol === 'shop_inventory' ? 'qty' : 'qtyInStock';
    for (const item of (oldData.items || [])) {
      const docId = await _findInventoryDocRef(invCol, item);
      if (docId) {
        await updateDoc(doc(db, invCol, docId), { [fieldKey]: increment(-Number(item.qty || 1)) });
      }
    }
  }
};

// ── Internal: re-apply inventory effects when creating or replacing a transactional doc
const _reapplyInventoryEffect = async (collectionName, newData) => {
  if (!newData) return;
  if (collectionName === 'shop_sales' || collectionName === 'godown_sales') {
    const invCol   = collectionName === 'shop_sales' ? 'shop_inventory' : 'godown_stock';
    const fieldKey = invCol === 'shop_inventory' ? 'qty' : 'qtyInStock';
    for (const item of (newData.items || [])) {
      const docId = await _findInventoryDocRef(invCol, item);
      if (docId) {
        await updateDoc(doc(db, invCol, docId), { [fieldKey]: increment(-Number(item.qty || 1)) });
      }
    }
  }

  if (collectionName === 'dispatch_logs') {
    for (const item of (newData.items || [])) {
      const docId = await _findInventoryDocRef('godown_stock', item);
      if (docId) {
        await updateDoc(doc(db, 'godown_stock', docId), { qtyInStock: increment(-Number(item.qty || 1)) });
      }
    }
  }

  if ((collectionName === 'shop_returns' || collectionName === 'godown_returns') && newData.restock) {
    const invCol   = collectionName === 'shop_returns' ? 'shop_inventory' : 'godown_stock';
    const fieldKey = invCol === 'shop_inventory' ? 'qty' : 'qtyInStock';
    for (const item of (newData.items || [])) {
      const docId = await _findInventoryDocRef(invCol, item);
      if (docId) {
        await updateDoc(doc(db, invCol, docId), { [fieldKey]: increment(Number(item.qty || 1)) });
      }
    }
  }
};
