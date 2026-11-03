/**
 * Google Sheets Sync Utility
 * Mirrors every write to a configured Google Apps Script Web App endpoint.
 * Setup: Deploy an Apps Script as Web App (execute as: me, access: anyone)
 * that accepts POST with JSON { sheet, rows[] } and appends to the named sheet.
 */

const SHEETS_ENDPOINT = import.meta.env.VITE_SHEETS_ENDPOINT || '';

/**
 * Sync data to Google Sheets.
 * @param {string} sheetName - Name of the target sheet tab
 * @param {object[]} rows    - Array of flat objects (key = column header)
 */
export const syncToSheets = async (sheetName, rows) => {
  if (!SHEETS_ENDPOINT) {
    console.warn('[SheetsSync] VITE_SHEETS_ENDPOINT not set. Skipping sync.');
    return;
  }
  try {
    const payload = { sheet: sheetName, rows };
    await fetch(SHEETS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[SheetsSync] Sync failed (non-blocking):', err.message);
  }
};

/** Sync a shop sale to Google Sheets */
export const syncShopSale = (sale) => syncToSheets('Shop Sales', [{
  'Receipt No': sale.receiptNo,
  'Customer': sale.customerName || '—',
  'Items': (sale.items || []).map(i => `${i.productName || i.brand} x${i.qty}`).join(', '),
  'Total (৳)': sale.totalAmount,
  'Discount (৳)': sale.discount || 0,
  'Net (৳)': sale.netAmount || sale.totalAmount,
  'Sold By': sale.soldByName || sale.soldBy,
  'Date': new Date().toLocaleString(),
}]);

/** Sync a godown sale to Google Sheets */
export const syncGodownSale = (sale, entities = []) => syncToSheets('Godown Sales', [{
  'Receipt No': sale.receiptNo,
  'Buyer': sale.buyerName || '—',
  'Items': (sale.items || []).map(i => {
    const e = entities.find(x => x.id === i.entityId);
    return `${e ? e.brand + ' ' + e.productType : i.entityId} x${i.qty}`;
  }).join(', '),
  'Total (৳)': sale.totalAmount,
  'Discount (৳)': sale.discount || 0,
  'Net (৳)': sale.netAmount || sale.totalAmount,
  'Sold By': sale.soldByName || sale.soldBy,
  'Date': new Date().toLocaleString(),
}]);

/** Sync a stock intake entry to Google Sheets */
export const syncStockIntake = (entry, entityName) => syncToSheets('Stock Intake', [{
  'Product': entityName,
  'Qty': entry.qty,
  'Unit Price (৳)': entry.unitPurchasePrice,
  'Total Cost (৳)': entry.totalCost,
  'Entered By': entry.enteredBy,
  'Date': new Date().toLocaleString(),
}]);

/** Sync a dispatch to Google Sheets */
export const syncDispatch = (dispatch) => syncToSheets('Dispatches', [{
  'Items': (dispatch.items || []).map(i => `${i.brand} ${i.productType} x${i.qty} @৳${i.sellingPrice}`).join(', '),
  'Dispatched By': dispatch.dispatchedByName,
  'Status': dispatch.status,
  'Date': new Date().toLocaleString(),
}]);

/** Sync attendance to Google Sheets */
export const syncAttendance = (record) => syncToSheets('Attendance', [{
  'Employee': record.employeeName,
  'Role': record.role,
  'GPS Address': record.gpsAddress,
  'Lat': record.gpsLat,
  'Lng': record.gpsLng,
  'Login Time': new Date().toLocaleString(),
}]);
