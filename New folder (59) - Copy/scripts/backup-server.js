/**
 * BACKUP SERVER
 * Run this once in a terminal: node scripts/backup-server.js
 * Keep it running in the background while you use the app.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';
import JSZip from 'jszip';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FOLDER_ID = '19_LghzQEU_e6l6PEEdHAzI9gKLEl1W74';
const FIREBASE_KEY_PATH = path.resolve(__dirname, '../firebase-key.json');
const OAUTH_CREDENTIALS_PATH = path.resolve(__dirname, '../client_secret_336113528136-o9fb9qlobtc0ql8dvhn6hq19mka8dfqe.apps.googleusercontent.com.json');
const TOKEN_PATH = path.resolve(__dirname, '../drive-token.json');

// --- Firebase Admin Init ---
const firebaseAccount = JSON.parse(fs.readFileSync(FIREBASE_KEY_PATH, 'utf8'));
initializeApp({ credential: cert(firebaseAccount) });
const db = getFirestore();

// --- Google Drive OAuth2 Init ---
const oauthCreds = JSON.parse(fs.readFileSync(OAUTH_CREDENTIALS_PATH, 'utf8')).installed;
const oAuth2Client = new google.auth.OAuth2(oauthCreds.client_id, oauthCreds.client_secret, oauthCreds.redirect_uris[0]);
if (fs.existsSync(TOKEN_PATH)) {
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
}
oAuth2Client.on('tokens', (tokens) => {
  const existing = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')) : {};
  fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...existing, ...tokens }, null, 2));
});
const drive = google.drive({ version: 'v3', auth: oAuth2Client });

const COLLECTIONS = [
  'shop_sales', 'shop_inventory', 'shop_returns',
  'expense_entries', 'daily_closing',
  'godown_sales', 'godown_stock', 'godown_entries', 'dispatch_logs',
  'product_entities', 'product_requests',
  'attendance', 'users', 'audit_logs'
];

const serializeData = (data) => {
  if (data === null || data === undefined) return data;
  if (typeof data.toDate === 'function' || (data._seconds !== undefined && data._nanoseconds !== undefined)) {
    return { __type: 'timestamp', seconds: data._seconds, nanoseconds: data._nanoseconds };
  }
  if (Array.isArray(data)) return data.map(serializeData);
  if (typeof data === 'object') {
    const out = {};
    for (const key in data) out[key] = serializeData(data[key]);
    return out;
  }
  return data;
};

const flattenForCsv = (doc) => {
  const flat = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v && v._seconds !== undefined) flat[k] = new Date(v._seconds * 1000).toLocaleString();
    else if (Array.isArray(v) || (typeof v === 'object' && v !== null)) flat[k] = JSON.stringify(v);
    else flat[k] = v;
  }
  return flat;
};

async function performBackupToDrive() {
  console.log(`[${new Date().toISOString()}] Starting backup...`);
  const zip = new JSZip();
  const dbData = {};

  for (const col of COLLECTIONS) {
    const snapshot = await db.collection(col).get();
    const docs = [], csvDocs = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      docs.push({ id: docSnap.id, ...serializeData(data) });
      csvDocs.push({ id: docSnap.id, ...flattenForCsv(data) });
    });
    dbData[col] = docs;
    if (csvDocs.length > 0) zip.file(`csv_export/${col}.csv`, Papa.unparse(csvDocs));
  }

  zip.file('database_backup.json', JSON.stringify({ version: '1.0', timestamp: new Date().toISOString(), data: dbData }, null, 2));
  const content = await zip.generateAsync({ type: 'nodebuffer' });

  const backupsDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
  const fileName = `PetLoverERP_Backup_${new Date().toISOString().replace(/:/g, '-')}.zip`;
  const localFilePath = path.join(backupsDir, fileName);
  fs.writeFileSync(localFilePath, content);
  console.log(`Saved locally: backups/${fileName}`);

  const driveRes = await drive.files.create({
    resource: { name: fileName, parents: [FOLDER_ID] },
    media: { mimeType: 'application/zip', body: fs.createReadStream(localFilePath) },
    fields: 'id,webViewLink'
  });
  console.log(`Uploaded to Drive! ID: ${driveRes.data.id}`);
  return { fileName, driveFileId: driveRes.data.id, driveLink: driveRes.data.webViewLink };
}

// --- Express Server ---
const app = express();
app.use(cors());
app.use(express.json());

// Backup to Drive
app.post('/api/backup-to-drive', async (req, res) => {
  try {
    const result = await performBackupToDrive();
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Backup failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Status check
app.get('/api/backup-status', (req, res) => {
  res.json({ running: true, message: 'Backup server is online' });
});

// List all backup ZIPs from Google Drive
app.get('/api/list-drive-backups', async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and name contains 'PetLoverERP_Backup' and trashed=false`,
      fields: 'files(id, name, createdTime, size)',
      orderBy: 'createdTime desc',
      pageSize: 30
    });
    res.json({ success: true, files: response.data.files });
  } catch (err) {
    console.error('List failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restore directly from a chosen Google Drive backup
app.post('/api/restore-from-drive', async (req, res) => {
  const { fileId, fileName } = req.body;
  if (!fileId) return res.status(400).json({ success: false, error: 'fileId is required' });

  try {
    console.log(`[RESTORE] Downloading ${fileName} from Drive...`);
    const driveRes = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const zipBuffer = Buffer.from(driveRes.data);
    const zip = await JSZip.loadAsync(zipBuffer);
    const jsonFile = zip.file('database_backup.json');
    if (!jsonFile) return res.status(400).json({ success: false, error: 'Invalid backup file' });

    const jsonStr = await jsonFile.async('string');
    const backupData = JSON.parse(jsonStr);
    const dbData = backupData.data;
    if (!dbData) return res.status(400).json({ success: false, error: 'Invalid backup format' });

    const { Timestamp } = await import('firebase-admin/firestore');
    let totalRestored = 0;

    for (const [colName, docs] of Object.entries(dbData)) {
      if (!Array.isArray(docs) || docs.length === 0) continue;
      const BATCH_SIZE = 499;
      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = db.batch();
        for (const doc of docs.slice(i, i + BATCH_SIZE)) {
          const { id, ...fields } = doc;
          const rehydrated = {};
          for (const [k, v] of Object.entries(fields)) {
            rehydrated[k] = (v && v.__type === 'timestamp') ? new Timestamp(v.seconds, v.nanoseconds) : v;
          }
          batch.set(db.collection(colName).doc(id), rehydrated, { merge: true });
        }
        await batch.commit();
        totalRestored += Math.min(BATCH_SIZE, docs.length - i);
      }
      console.log(`[RESTORE] ${colName}: ${docs.length} docs`);
    }

    res.json({ success: true, message: `Restore complete! ${totalRestored} documents restored.` });
  } catch (err) {
    console.error('Restore failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3001, () => {
  console.log('Backup Server running on http://localhost:3001');
  console.log('Endpoints: /api/backup-to-drive | /api/list-drive-backups | /api/restore-from-drive');
});
