import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './config';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

export const BACKUP_COLLECTIONS = [
  'shop_sales', 'shop_inventory', 'shop_returns', 
  'expense_entries', 'daily_closing', 
  'godown_sales', 'godown_stock', 'godown_entries', 'dispatch_logs', 
  'product_entities', 'product_requests', 
  'attendance', 'users', 'audit_logs'
];

/**
 * Deep clone an object, preserving Firebase Timestamps by converting them to a special format
 */
const serializeData = (data) => {
  if (data === null || data === undefined) return data;
  if (typeof data?.toDate === 'function') {
    // Convert Firestore Timestamp to custom format
    return { __type: 'timestamp', seconds: data.seconds, nanoseconds: data.nanoseconds };
  }
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  if (typeof data === 'object') {
    const serialized = {};
    for (const key in data) {
      serialized[key] = serializeData(data[key]);
    }
    return serialized;
  }
  return data;
};

/**
 * Restore special formats back to valid structures (doesn't convert to Firestore Timestamp class directly since Admin SDK / Client SDK differs, 
 * but Firestore accepts standard JS Date objects which gets converted to Timestamp on save).
 */
export const deserializeData = (data) => {
  if (data === null || data === undefined) return data;
  if (data.__type === 'timestamp' && data.seconds !== undefined) {
    return new Date(data.seconds * 1000);
  }
  if (Array.isArray(data)) {
    return data.map(item => deserializeData(item));
  }
  if (typeof data === 'object') {
    const deserialized = {};
    for (const key in data) {
      deserialized[key] = deserializeData(data[key]);
    }
    return deserialized;
  }
  return data;
};

const flattenForCsv = (doc) => {
  const flat = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v && typeof v === 'object' && typeof v.toDate === 'function') flat[k] = v.toDate().toLocaleString();
    else if (Array.isArray(v)) flat[k] = JSON.stringify(v);
    else if (typeof v === 'object' && v !== null) flat[k] = JSON.stringify(v);
    else flat[k] = v;
  }
  return flat;
};

export const createSystemBackup = async () => {
  const zip = new JSZip();
  const dbData = {};

  try {
    toast.loading('Fetching data from cloud...', { id: 'backup' });

    for (const col of BACKUP_COLLECTIONS) {
      const colRef = collection(db, col);
      const snapshot = await getDocs(colRef);
      
      const docs = [];
      const csvDocs = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        docs.push({ id: docSnap.id, ...serializeData(data) });
        csvDocs.push({ id: docSnap.id, ...flattenForCsv(data) });
      });

      dbData[col] = docs;

      // Add CSV for human reading
      if (csvDocs.length > 0) {
        const csvString = Papa.unparse(csvDocs);
        zip.file(`csv_export/${col}.csv`, csvString);
      }
    }

    // Add JSON for system restore
    zip.file('database_backup.json', JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: dbData
    }, null, 2));

    toast.loading('Compressing files...', { id: 'backup' });
    const content = await zip.generateAsync({ type: 'blob' });
    
    const fileName = `PetLoverERP_Backup_${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(content, fileName);

    toast.success('Backup downloaded successfully!', { id: 'backup' });
    return content; // Return blob if we want to upload it to drive later

  } catch (error) {
    console.error('Backup error:', error);
    toast.error('Failed to create backup: ' + error.message, { id: 'backup' });
    throw error;
  }
};

export const restoreSystemBackup = async (file) => {
  return new Promise((resolve, reject) => {
    toast.loading('Reading backup file...', { id: 'restore' });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const zip = await JSZip.loadAsync(e.target.result);
        const jsonFile = zip.file('database_backup.json');
        
        if (!jsonFile) {
          throw new Error("Invalid backup file. 'database_backup.json' not found.");
        }

        const jsonString = await jsonFile.async('string');
        const backup = JSON.parse(jsonString);

        if (!backup.data) {
          throw new Error("Invalid backup structure.");
        }

        toast.loading('Restoring data to cloud (this may take a while)...', { id: 'restore' });

        for (const [colName, docs] of Object.entries(backup.data)) {
          // Firestore batched writes (max 500 ops per batch)
          let batch = writeBatch(db);
          let count = 0;

          for (const docData of docs) {
            const id = docData.id;
            const dataToSave = deserializeData(docData);
            delete dataToSave.id;

            const docRef = doc(db, colName, id);
            batch.set(docRef, dataToSave);
            count++;

            if (count === 500) {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
            }
          }

          if (count > 0) {
            await batch.commit();
          }
        }

        toast.success('System restored successfully!', { id: 'restore' });
        resolve(true);

      } catch (error) {
        console.error('Restore error:', error);
        toast.error('Restore failed: ' + error.message, { id: 'restore' });
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};
