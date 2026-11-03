import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp, getDoc, increment, where } from 'firebase/firestore';
import { db } from './config';

// ── Audit Log Engine ─────────────────────────────────────────────────────────

export const createAuditLog = async (data) => {
  /*
    data: {
      actionType: 'DELETE_SALE' | 'EDIT_STOCK' | 'DELETE_EXPENSE',
      collection: 'shop_sales' | 'shop_inventory' | 'expense_entries' | 'godown_sales' | 'godown_stock',
      documentId: string,
      oldData: object,
      newData: object,
      reason: string,
      performedBy: uid,
      performedByName: string,
    }
  */
  try {
    await addDoc(collection(db, 'audit_logs'), {
      ...data,
      status: 'pending_review',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    throw error;
  }
};

export const getAuditLogs = async () => {
  const snap = await getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const resolveAuditLog = async (auditId, resolution, resolvedBy, resolvedByName) => {
  await updateDoc(doc(db, 'audit_logs', auditId), {
    status: resolution, // 'approved', 'rejected', 'restored'
    resolvedAt: serverTimestamp(),
    resolvedBy,
    resolvedByName
  });
};

// ── Shared Revisions / Restorations ───────────────────────────────────────────

export const requestSoftDeleteDocument = async (collectionName, documentId, reason, performedBy, performedByName) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) throw new Error("Document not found");
  
  const oldData = docSnap.data();
  
  // Set to delete_requested, do NOT revert inventory yet
  await updateDoc(docRef, {
    status: 'delete_requested',
    _originalStatus: oldData.status || null,
    deleteRequestAt: serverTimestamp(),
    deleteRequestBy: performedBy,
    deleteReason: reason
  });

  // Create audit trail for the request
  await createAuditLog({
    actionType: 'DELETE_REQUEST',
    collection: collectionName,
    documentId: documentId,
    oldData: oldData,
    newData: { status: 'delete_requested' },
    reason: reason,
    performedBy,
    performedByName,
  });
};

export const executeSoftDeleteDocument = async (collectionName, documentId, logId, resolvedBy, resolvedByName) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Document not found");
  const oldData = docSnap.data();

  // Actually update document to soft deleted
  await updateDoc(docRef, {
    status: 'deleted',
    deletedAt: serverTimestamp(),
    deletedBy: resolvedBy, // Admin who approved
  });

  // Revert related inventory if it's a sale
  if (collectionName === 'shop_sales' || collectionName === 'godown_sales') {
    const invCol = collectionName === 'shop_sales' ? 'shop_inventory' : 'godown_stock';
    const fieldName = collectionName === 'shop_sales' ? 'qty' : 'qtyInStock';
    const items = oldData.items || [];
    for (const item of items) {
      const invQuery = query(collection(db, invCol));
      const invSnap = await getDocs(invQuery);
      const targetDoc = invSnap.docs.find(d => d.data().entityId === item.entityId);
      if (targetDoc) {
        await updateDoc(doc(db, invCol, targetDoc.id), {
          [fieldName]: increment(Number(item.qty))
        });
      }
    }
  }

  // Restore godown stock if it's a dispatch
  if (collectionName === 'dispatch_logs') {
    const items = oldData.items || [];
    for (const item of items) {
      const stockQuery = query(collection(db, 'godown_stock'), where('entityId', '==', item.entityId));
      const stockSnap = await getDocs(stockQuery);
      if (!stockSnap.empty) {
        await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
          qtyInStock: increment(Number(item.qty))
        });
      }
    }
  }

  // Reverse restock if it's a return
  if ((collectionName === 'shop_returns' || collectionName === 'godown_returns') && oldData.restock) {
    const invCol = collectionName === 'shop_returns' ? 'shop_inventory' : 'godown_stock';
    const fieldName = collectionName === 'shop_returns' ? 'qty' : 'qtyInStock';
    const items = oldData.items || [];
    for (const item of items) {
      const invQuery = query(collection(db, invCol), where('entityId', '==', item.entityId));
      const invSnap = await getDocs(invQuery);
      if (!invSnap.empty) {
        await updateDoc(doc(db, invCol, invSnap.docs[0].id), {
          [fieldName]: increment(-Number(item.qty))
        });
      }
    }
  }

  if (logId) {
    await resolveAuditLog(logId, 'approved', resolvedBy, resolvedByName);
  }
};

export const rejectSoftDeleteRequest = async (collectionName, documentId, logId, resolvedBy, resolvedByName) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Document not found");
  
  const currentData = docSnap.data();

  // Revert back to original status
  await updateDoc(docRef, {
    status: currentData._originalStatus || 'completed', // fallback to completed
    _originalStatus: null,
    deleteRequestAt: null,
    deleteRequestBy: null,
    deleteReason: null
  });

  if (logId) {
    await resolveAuditLog(logId, 'rejected', resolvedBy, resolvedByName);
  }
};

export const softDeleteDocument = async (collectionName, documentId, reason, performedBy, performedByName) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) throw new Error("Document not found");
  
  const oldData = docSnap.data();
  
  // Actually update document to soft deleted
  await updateDoc(docRef, {
    status: 'deleted',
    deletedAt: serverTimestamp(),
    deletedBy: performedBy,
    deleteReason: reason
  });

  // Revert related inventory if it's a sale
  if (collectionName === 'shop_sales' || collectionName === 'godown_sales') {
    const invCol = collectionName === 'shop_sales' ? 'shop_inventory' : 'godown_stock';
    const fieldName = collectionName === 'shop_sales' ? 'qty' : 'qtyInStock';
    const items = oldData.items || [];
    for (const item of items) {
      // We must find the inventory document
      const invQuery = query(collection(db, invCol));
      const invSnap = await getDocs(invQuery);
      const targetDoc = invSnap.docs.find(d => d.data().entityId === item.entityId);
      if (targetDoc) {
        await updateDoc(doc(db, invCol, targetDoc.id), {
          [fieldName]: increment(Number(item.qty))
        });
      }
    }
  }


  // Restore godown stock if it's a dispatch
  if (collectionName === 'dispatch_logs') {
    const items = oldData.items || [];
    for (const item of items) {
      const stockQuery = query(collection(db, 'godown_stock'), where('entityId', '==', item.entityId));
      const stockSnap = await getDocs(stockQuery);
      if (!stockSnap.empty) {
        await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
          qtyInStock: increment(Number(item.qty))
        });
      }
    }
  }

  // Reverse restock if it's a return
  if ((collectionName === 'shop_returns' || collectionName === 'godown_returns') && oldData.restock) {
    const invCol = collectionName === 'shop_returns' ? 'shop_inventory' : 'godown_stock';
    const fieldName = collectionName === 'shop_returns' ? 'qty' : 'qtyInStock';
    const items = oldData.items || [];
    for (const item of items) {
      const invQuery = query(collection(db, invCol), where('entityId', '==', item.entityId));
      const invSnap = await getDocs(invQuery);
      if (!invSnap.empty) {
        await updateDoc(doc(db, invCol, invSnap.docs[0].id), {
          [fieldName]: increment(-Number(item.qty))
        });
      }
    }
  }

  // Create audit trail
  await createAuditLog({
    actionType: 'DELETE',
    collection: collectionName,
    documentId: documentId,
    oldData: oldData,
    newData: { status: 'deleted' },
    reason: reason,
    performedBy,
    performedByName,
  });
};

export const quickRestoreDocument = async (collectionName, documentId, resolvedBy, resolvedByName) => {
  const logsQuery = query(collection(db, 'audit_logs'), where('documentId', '==', documentId), where('status', '==', 'pending_review'));
  const snap = await getDocs(logsQuery);
  for (const d of snap.docs) {
    if (d.data().actionType?.includes('DELETE')) {
      await resolveAuditLog(d.id, 'restored', resolvedBy, resolvedByName);
    }
  }
  await restoreSoftDeletedDocument(collectionName, documentId, null, resolvedBy, resolvedByName);
};

export const restoreSoftDeletedDocument = async (collectionName, documentId, auditId, resolvedBy, resolvedByName) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Document not found");
  const data = docSnap.data();
  
  await updateDoc(docRef, {
    status: 'active', // Assuming active is default, or just remove deleted
    deletedAt: null,
    deletedBy: null,
    deleteReason: null
  });

  // Re-deduct inventory if it's a sale
  if (collectionName === 'shop_sales' || collectionName === 'godown_sales') {
    const invCol = collectionName === 'shop_sales' ? 'shop_inventory' : 'godown_stock';
    const items = data.items || [];
    for (const item of items) {
      const invQuery = query(collection(db, invCol));
      const invSnap = await getDocs(invQuery);
      const targetDoc = invSnap.docs.find(d => d.data().entityId === item.entityId);
      if (targetDoc) {
        await updateDoc(doc(db, invCol, targetDoc.id), {
          qty: increment(-Number(item.qty))
        });
      }
    }
  }


  // Re-deduct godown stock if it's a dispatch
  if (collectionName === 'dispatch_logs') {
    const items = data.items || [];
    for (const item of items) {
      const stockQuery = query(collection(db, 'godown_stock'), where('entityId', '==', item.entityId));
      const stockSnap = await getDocs(stockQuery);
      if (!stockSnap.empty) {
        await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
          qtyInStock: increment(-Number(item.qty))
        });
      }
    }
  }

  // Re-apply restock if it's a restored return
  if ((collectionName === 'shop_returns' || collectionName === 'godown_returns') && data.restock) {
    const invCol = collectionName === 'shop_returns' ? 'shop_inventory' : 'godown_stock';
    const fieldName = collectionName === 'shop_returns' ? 'qty' : 'qtyInStock';
    const items = data.items || [];
    for (const item of items) {
      const invQuery = query(collection(db, invCol), where('entityId', '==', item.entityId));
      const invSnap = await getDocs(invQuery);
      if (!invSnap.empty) {
        await updateDoc(doc(db, invCol, invSnap.docs[0].id), {
          [fieldName]: increment(Number(item.qty))
        });
      }
    }
  }

  if (auditId) {
    await resolveAuditLog(auditId, 'restored', resolvedBy, resolvedByName);
  }
};

export const editStockQuantity = async (collectionName, documentId, newQty, reason, performedBy, performedByName) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Document not found");
  
  const oldData = docSnap.data();
  const isGodown = collectionName === 'godown_stock';
  const fieldName = isGodown ? 'qtyInStock' : 'qty';
  const oldQty = oldData[fieldName] || 0;

  await updateDoc(docRef, {
    [fieldName]: Number(newQty)
  });
  await createAuditLog({
    actionType: 'EDIT_STOCK',
    collection: collectionName,
    documentId: documentId,
    oldData: { [fieldName]: oldQty },
    newData: { [fieldName]: Number(newQty) },
    reason: reason,
    performedBy,
    performedByName,
  });
};

export const editSaleMoney = async (collectionName, documentId, newNetAmount, newPaymentMethod, reason, performedBy, performedByName) => {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Sale not found");
  
  const oldData = docSnap.data();
  const updateData = { netAmount: Number(newNetAmount) };
  if (newPaymentMethod) updateData.paymentMethod = newPaymentMethod;
  
  await updateDoc(docRef, updateData);

  await createAuditLog({
    actionType: 'EDIT_SALE',
    collection: collectionName,
    documentId: documentId,
    oldData: { netAmount: oldData.netAmount, paymentMethod: oldData.paymentMethod },
    newData: updateData,
    reason: reason,
    performedBy,
    performedByName,
  });
};

export const editGodownIntake = async (documentId, newQty, newUnitPrice, reason, performedBy, performedByName) => {
  const docRef = doc(db, 'godown_entries', documentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Intake log not found");
  
  const oldData = docSnap.data();
  const updateData = { 
    qty: Number(newQty), 
    unitPurchasePrice: Number(newUnitPrice),
    totalCost: Number(newQty) * Number(newUnitPrice) 
  };
  
  await updateDoc(docRef, updateData);

  // We must also adjust the Godown Stock to reflect the new quantity.
  // We find the stock doc using entityId
  const stockQuery = query(collection(db, 'godown_stock'), where('entityId', '==', oldData.entityId));
  const stockSnap = await getDocs(stockQuery);
  if (!stockSnap.empty) {
    const stockDoc = stockSnap.docs[0];
    const diffQty = Number(newQty) - oldData.qty;
    await updateDoc(doc(db, 'godown_stock', stockDoc.id), {
      qtyInStock: increment(diffQty),
      lastUnitPurchasePrice: Number(newUnitPrice)
    });
  }

  await createAuditLog({
    actionType: 'EDIT_INTAKE',
    collection: 'godown_entries',
    documentId: documentId,
    oldData: { qty: oldData.qty, unitPurchasePrice: oldData.unitPurchasePrice, totalCost: oldData.totalCost },
    newData: updateData,
    reason: reason,
    performedBy,
    performedByName,
  });
};

export const revertAuditLog = async (log, resolvedBy, resolvedByName) => {
  // Guard: only revert if still pending or if it's an admin-level action
  const alreadyResolved = ['reverted', 'rejected', 'approved'].includes(log.status);
  if (alreadyResolved) {
    throw new Error(`Log is already "${log.status}" and cannot be reverted again.`);
  }

  const docRef = doc(db, log.collection, log.documentId);

  // EDIT_STOCK or EDIT_SALE — write oldData directly
  if (log.actionType === 'EDIT_STOCK' || log.actionType === 'EDIT_SALE') {
    if (log.oldData) await updateDoc(docRef, log.oldData);
  }

  // EDIT_INTAKE — revert intake record + adjust godown stock delta
  else if (log.actionType === 'EDIT_INTAKE') {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && log.oldData) {
      const currentData = docSnap.data();
      await updateDoc(docRef, log.oldData);
      const stockQuery = query(collection(db, 'godown_stock'), where('entityId', '==', currentData.entityId));
      const stockSnap = await getDocs(stockQuery);
      if (!stockSnap.empty) {
        const diffQty = (log.oldData.qty || 0) - (currentData.qty || 0);
        await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
          qtyInStock: increment(diffQty),
          ...(log.oldData.unitPurchasePrice !== undefined ? { lastUnitPurchasePrice: log.oldData.unitPurchasePrice } : {}),
        });
      }
    }
  }

  // ADMIN_EDIT — restore full oldData snapshot (strip meta fields)
  else if (log.actionType === 'ADMIN_EDIT') {
    if (log.oldData) {
      const safe = { ...log.oldData };
      delete safe.id;
      delete safe._lastEditedAt;
      delete safe._lastEditedBy;
      await updateDoc(docRef, { ...safe, _revertedBy: resolvedByName, _revertedAt: serverTimestamp() });
    }
  }

  // DELETE_REQUEST — simply cancel the pending request
  else if (log.actionType === 'DELETE_REQUEST') {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const d = snap.data();
      await updateDoc(docRef, {
        status: d._originalStatus || 'completed',
        _originalStatus: null,
        deleteRequestAt: null,
        deleteRequestBy: null,
        deleteReason: null,
      });
    }
  }

  // Generic fallback for any other edit type
  else if (log.oldData) {
    const safe = { ...log.oldData };
    delete safe.id;
    delete safe._lastEditedAt;
    await updateDoc(docRef, safe);
  }

  await resolveAuditLog(log.id, 'reverted', resolvedBy, resolvedByName);
};
