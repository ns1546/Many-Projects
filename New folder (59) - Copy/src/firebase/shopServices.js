import { syncShopSale } from '../utils/sheetsSync';
import {
  collection, doc, addDoc, getDocs, updateDoc, query,
  where, orderBy, serverTimestamp, increment, getDoc, limit
} from 'firebase/firestore';
import { db } from './config';

// ── Shop Inventory ─────────────────────────────────────────────────────────────
export const getShopInventory = async () => {
  const snap = await getDocs(query(collection(db, 'shop_inventory'), orderBy('addedDate', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const confirmDispatch = async (dispatchId, items) => {
  // Add items to shop_inventory
  for (const item of items) {
    const existing = await getDocs(
      query(collection(db, 'shop_inventory'), where('entityId', '==', item.entityId))
    );
    if (existing.empty) {
      await addDoc(collection(db, 'shop_inventory'), {
        entityId: item.entityId,
        brand: item.brand,
        productType: item.productType,
        flavor: item.flavor || '',
        weight: item.weight || '',
        unit: item.unit || 'pcs',
        qty: Number(item.qty),
        sellingPrice: Number(item.sellingPrice),
        priceHistory: [{ price: Number(item.sellingPrice), date: new Date().toISOString() }],
        addedDate: serverTimestamp(),
      });
    } else {
      const docRef = existing.docs[0];
      const oldPrice = docRef.data().sellingPrice;
      const newPriceHistory = docRef.data().priceHistory || [];
      if (oldPrice !== Number(item.sellingPrice)) {
        newPriceHistory.push({ price: Number(item.sellingPrice), date: new Date().toISOString() });
      }
      await updateDoc(doc(db, 'shop_inventory', docRef.id), {
        qty: increment(Number(item.qty)),
        sellingPrice: Number(item.sellingPrice),
        priceHistory: newPriceHistory,
        addedDate: serverTimestamp(),
      });
    }
  }
  // Mark dispatch as confirmed
  await updateDoc(doc(db, 'dispatch_logs', dispatchId), {
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
  });
};

export const addProductDirectlyToShop = async (data, addedBy) => {
  const existing = await getDocs(
    query(collection(db, 'shop_inventory'), where('entityId', '==', data.entityId))
  );
  if (existing.empty) {
    await addDoc(collection(db, 'shop_inventory'), {
      ...data,
      qty: Number(data.qty),
      sellingPrice: Number(data.sellingPrice),
      priceHistory: [{ price: Number(data.sellingPrice), date: new Date().toISOString() }],
      addedDate: serverTimestamp(),
      addedBy,
    });
  } else {
    const docRef = existing.docs[0];
    await updateDoc(doc(db, 'shop_inventory', docRef.id), {
      qty: increment(Number(data.qty)),
      sellingPrice: Number(data.sellingPrice),
      addedDate: serverTimestamp(),
    });
  }
};

// ── Pending Dispatches (from godown) ──────────────────────────────────────────
export const getPendingDispatches = async () => {
  const snap = await getDocs(
    query(collection(db, 'dispatch_logs'), where('status', '==', 'pending'))
  );
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (b.dispatchDate?.toMillis?.() || 0) - (a.dispatchDate?.toMillis?.() || 0));
};

// ── Shop Sales ────────────────────────────────────────────────────────────────
export const createShopSale = async (saleData, soldBy, soldByName) => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0,10).replace(/-/g, '');
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const receiptNo = 'SHP-' + dateStr + '-' + shortId;
  const fullSale = { ...saleData, receiptNo, soldBy, soldByName };
  const ref = await addDoc(collection(db, 'shop_sales'), {
    ...fullSale,
    saleDate: serverTimestamp(),
  });
  // Mirror to Google Sheets (non-blocking)
  syncShopSale(fullSale);

  // Decrement shop inventory for each item
  for (const item of saleData.items) {
    const invSnap = await getDocs(
      query(collection(db, 'shop_inventory'), where('entityId', '==', item.entityId))
    );
    if (!invSnap.empty) {
      await updateDoc(doc(db, 'shop_inventory', invSnap.docs[0].id), {
        qty: increment(-Number(item.qty)),
      });
    }
  }

  return { id: ref.id, receiptNo };
};

export const getShopSales = async (limitCount = 200) => {
  const snap = await getDocs(query(collection(db, 'shop_sales'), orderBy('saleDate', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Daily Closing ─────────────────────────────────────────────────────────────
export const saveDailyClosing = async (amount, enteredBy, enteredByName) => {
  await addDoc(collection(db, 'daily_closing'), {
    cashAmount: Number(amount),
    enteredBy,
    enteredByName,
    date: serverTimestamp(),
  });
};

export const getDailyClosings = async (limitCount = 100) => {
  const snap = await getDocs(query(collection(db, 'daily_closing'), orderBy('date', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Product Requests (salesman → admin) ──────────────────────────────────────
export const createProductRequest = async (data, requestedBy, requestedByName) => {
  await addDoc(collection(db, 'product_requests'), {
    ...data,
    requestedBy,
    requestedByName,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};
// ── Product Returns ─────────────────────────────────────────────────────────────
export const processShopReturn = async (returnData, processedBy, processedByName) => {
  const d = new Date();
  const dateStr = d.toISOString().slice(0,10).replace(/-/g, '');
  const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const returnReceiptNo = 'RET-SHP-' + dateStr + '-' + shortId;

  const fullReturn = { ...returnData, returnReceiptNo, processedBy, processedByName };
  
  const ref = await addDoc(collection(db, 'shop_returns'), {
    ...fullReturn,
    returnDate: serverTimestamp(),
  });

  if (returnData.restock) {
    for (const item of returnData.items) {
      const invSnap = await getDocs(
        query(collection(db, 'shop_inventory'), where('entityId', '==', item.entityId))
      );
      if (!invSnap.empty) {
        await updateDoc(doc(db, 'shop_inventory', invSnap.docs[0].id), {
          qty: increment(Number(item.qty)),
        });
      }
    }
  }

  return { id: ref.id, returnReceiptNo };
};

export const getShopReturns = async (limitCount = 100) => {
  const snap = await getDocs(query(collection(db, 'shop_returns'), orderBy('returnDate', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Expense / Petty Cash ──────────────────────────────────────────────────────
export const addExpenseEntry = async (data, addedBy, addedByName) => {
  const ref = await addDoc(collection(db, 'expense_entries'), {
    ...data,
    amount: Number(data.amount),
    addedBy,
    addedByName,
    date: serverTimestamp(),
  });
  return ref.id;
};

export const getExpenseEntries = async (limitCount = 100) => {
  const snap = await getDocs(query(collection(db, 'expense_entries'), orderBy('date', 'desc'), limit(limitCount)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Enhanced Daily Closing with Reconciliation ────────────────────────────────
export const saveDailyClosingFull = async (data, enteredBy, enteredByName) => {
  const ref = await addDoc(collection(db, 'daily_closing'), {
    ...data,
    enteredBy,
    enteredByName,
    date: serverTimestamp(),
  });
  return ref.id;
};

export const getTodaySalesData = async (dateStr = null) => {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate);
  nextDate.setDate(targetDate.getDate() + 1);

  const snap = await getDocs(
    query(
      collection(db, 'shop_sales'),
      where('saleDate', '>=', targetDate),
      where('saleDate', '<', nextDate),
      orderBy('saleDate', 'desc')
    )
  );
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(s => s.status !== 'deleted' && s.status !== 'delete_requested');
};

export const getTodayExpenses = async (dateStr = null) => {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate);
  nextDate.setDate(targetDate.getDate() + 1);

  const snap = await getDocs(
    query(
      collection(db, 'expense_entries'),
      where('date', '>=', targetDate),
      where('date', '<', nextDate),
      orderBy('date', 'desc')
    )
  );
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(e => e.status !== 'deleted' && e.status !== 'delete_requested');
};

export const getTodayReturns = async (dateStr = null) => {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate);
  nextDate.setDate(targetDate.getDate() + 1);

  const snap = await getDocs(
    query(
      collection(db, 'shop_returns'),
      where('returnDate', '>=', targetDate),
      where('returnDate', '<', nextDate),
      orderBy('returnDate', 'desc')
    )
  );
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.status !== 'deleted' && r.status !== 'delete_requested');
};
