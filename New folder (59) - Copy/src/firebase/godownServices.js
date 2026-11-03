import { syncGodownSale, syncStockIntake, syncDispatch } from '../utils/sheetsSync';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, query,
  where, orderBy, serverTimestamp, increment, setDoc, limit
} from 'firebase/firestore';
import { db } from './config';

// ── Product Entities ──────────────────────────────────────────────────────────
export const addProductEntity = async (data) => {
  const ref = await addDoc(collection(db, 'product_entities'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getProductEntities = async () => {
  const snap = await getDocs(query(collection(db, 'product_entities'), orderBy('brand')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateProductEntity = async (id, data) =>
  updateDoc(doc(db, 'product_entities', id), data);

// ── Godown Stock ──────────────────────────────────────────────────────────────
export const getGodownStock = async () => {
  const snap = await getDocs(collection(db, 'godown_stock'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getGodownStockByEntity = async (entityId) => {
  const snap = await getDocs(query(collection(db, 'godown_stock'), where('entityId', '==', entityId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Stock Intake (Quick Entry) ────────────────────────────────────────────────
export const addStockIntake = async (entryData, enteredBy) => {
  const { entityId, qty, unitPurchasePrice } = entryData;
  const totalCost = qty * unitPurchasePrice;

  // Save intake log
  const intakeData = { entityId, qty: Number(qty), unitPurchasePrice: Number(unitPurchasePrice), totalCost, enteredBy, entryDate: new Date().toISOString() };
  
  const d = new Date();
  const dateStr = d.toISOString().slice(0,10).replace(/-/g, '');
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  intakeData.receiptNo = 'INT-' + dateStr + '-' + shortId;

  await addDoc(collection(db, 'godown_entries'), {
    ...intakeData,
    entryDate: serverTimestamp(),
  });
  // Mirror to Sheets
  syncStockIntake(intakeData, entityId);

  // Upsert godown_stock
  const stockSnap = await getDocs(query(collection(db, 'godown_stock'), where('entityId', '==', entityId)));
  if (stockSnap.empty) {
    await addDoc(collection(db, 'godown_stock'), {
      entityId,
      qtyInStock: Number(qty),
      lastUnitPurchasePrice: Number(unitPurchasePrice),
      lastUpdated: serverTimestamp(),
    });
  } else {
    const stockDoc = stockSnap.docs[0];
    await updateDoc(doc(db, 'godown_stock', stockDoc.id), {
      qtyInStock: increment(Number(qty)),
      lastUnitPurchasePrice: Number(unitPurchasePrice),
      lastUpdated: serverTimestamp(),
    });
  }
};

export const getStockIntakeLogs = async (limitCount = 100) => {
  const snap = await getDocs(query(collection(db, 'godown_entries'), orderBy('entryDate', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Godown Sales ──────────────────────────────────────────────────────────────
export const createGodownSale = async (saleData, soldBy) => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0,10).replace(/-/g, '');
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const dest = saleData.buyerName ? saleData.buyerName.replace(/\s+/g, '').substring(0,4).toUpperCase() : 'CUST';
  const receiptNo = 'GDN-' + dest + '-' + dateStr + '-' + shortId;
  
  const fullSale = { ...saleData, receiptNo, soldBy, soldByName: saleData.soldByName };
  const ref = await addDoc(collection(db, 'godown_sales'), {
    ...fullSale,
    saleDate: serverTimestamp(),
  });
  // Mirror to Sheets
  syncGodownSale(fullSale);

  // Decrement stock for each item
  for (const item of saleData.items) {
    const stockSnap = await getDocs(query(collection(db, 'godown_stock'), where('entityId', '==', item.entityId)));
    if (!stockSnap.empty) {
      await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
        qtyInStock: increment(-Number(item.qty)),
        lastUpdated: serverTimestamp(),
      });
    }
  }

  return { id: ref.id, receiptNo };
};

export const getGodownSales = async (limitCount = 200) => {
  const snap = await getDocs(query(collection(db, 'godown_sales'), orderBy('saleDate', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Dispatch to Shop ──────────────────────────────────────────────────────────
export const dispatchToShop = async (dispatchData, managerId) => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0,10).replace(/-/g, '');
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const dispatchId = 'DSP-SHP-' + dateStr + '-' + shortId;

  const ref = await addDoc(collection(db, 'dispatch_logs'), {
    ...dispatchData,
    receiptNo: dispatchId,
    managerId,
    status: 'pending',
    dispatchDate: serverTimestamp(),
  });

  // Decrement godown stock
  for (const item of dispatchData.items) {
    const stockSnap = await getDocs(query(collection(db, 'godown_stock'), where('entityId', '==', item.entityId)));
    if (!stockSnap.empty) {
      await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
        qtyInStock: increment(-Number(item.qty)),
        lastUpdated: serverTimestamp(),
      });
    }
  }

  return ref.id;
};

export const getDispatchLogs = async (limitCount = 100) => {
  const snap = await getDocs(query(collection(db, 'dispatch_logs'), orderBy('dispatchDate', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Product Returns ─────────────────────────────────────────────────────────────
export const processGodownReturn = async (returnData, processedBy, processedByName) => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0,10).replace(/-/g, '');
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const dest = returnData.buyerName ? returnData.buyerName.replace(/\s+/g, '').substring(0,4).toUpperCase() : 'CUST';
  const returnReceiptNo = 'RET-GDN-' + dest + '-' + dateStr + '-' + shortId;

  const fullReturn = { ...returnData, returnReceiptNo, processedBy, processedByName };
  
  const ref = await addDoc(collection(db, 'godown_returns'), {
    ...fullReturn,
    returnDate: serverTimestamp(),
  });

  if (returnData.restock) {
    for (const item of returnData.items) {
      const stockSnap = await getDocs(
        query(collection(db, 'godown_stock'), where('entityId', '==', item.entityId))
      );
      if (!stockSnap.empty) {
        await updateDoc(doc(db, 'godown_stock', stockSnap.docs[0].id), {
          qtyInStock: increment(Number(item.qty)),
        });
      }
    }
  }

  return { id: ref.id, returnReceiptNo };
};

export const getGodownReturns = async (limitCount = 100) => {
  const snap = await getDocs(query(collection(db, 'godown_returns'), orderBy('returnDate', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
