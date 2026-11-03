import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { google } from 'googleapis';
import JSZip from 'jszip';
import Papa from 'papaparse';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// REQUIRED SETUP INSTRUCTIONS:
// 1. Firebase Access: You need the Service Account Key from your FIREBASE project ('pet-lover-bd').
//    - Go to Firebase Console -> pet-lover-bd -> Project Settings -> Service Accounts
//    - Click "Generate new private key"
//    - Save the downloaded file as "firebase-key.json" in the root of your project folder.
//
// 2. Google Drive Access: You already have this ('pet-lover-bd-501620-4cbb1d23db16.json').
//    - Share your personal Google Drive folder with: 
//      pet-lover-bd@pet-lover-bd-501620.iam.gserviceaccount.com
//    - Copy the folder ID from the URL and paste it below.
// -----------------------------------------------------------------------------

const FOLDER_ID = '19_LghzQEU_e6l6PEEdHAzI9gKLEl1W74';

const FIREBASE_KEY_PATH = path.resolve(__dirname, '../firebase-key.json');
const OAUTH_CREDENTIALS_PATH = path.resolve(__dirname, '../client_secret_336113528136-o9fb9qlobtc0ql8dvhn6hq19mka8dfqe.apps.googleusercontent.com.json');
const TOKEN_PATH = path.resolve(__dirname, '../drive-token.json');

if (!fs.existsSync(FIREBASE_KEY_PATH)) {
  console.error("ERROR: Missing firebase-key.json. Please download it from Firebase Console.");
  process.exit(1);
}
if (!fs.existsSync(OAUTH_CREDENTIALS_PATH)) {
  console.error("ERROR: Missing OAuth credentials file.");
  process.exit(1);
}

const firebaseAccount = JSON.parse(fs.readFileSync(FIREBASE_KEY_PATH, 'utf8'));

// Initialize Firebase Admin
initializeApp({
  credential: cert(firebaseAccount)
});
const db = getFirestore();

// Initialize Google Drive API with OAuth2 (personal Google account)
const oauthCreds = JSON.parse(fs.readFileSync(OAUTH_CREDENTIALS_PATH, 'utf8')).installed;
const oAuth2Client = new google.auth.OAuth2(
  oauthCreds.client_id,
  oauthCreds.client_secret,
  oauthCreds.redirect_uris[0]
);

if (fs.existsSync(TOKEN_PATH)) {
  oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
}

// Auto-save refreshed tokens
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

/**
 * Deep clone an object, preserving Firebase Timestamps by converting them to a special format
 */
const serializeData = (data) => {
  if (data === null || data === undefined) return data;
  if (typeof data.toDate === 'function') {
    return { __type: 'timestamp', seconds: data._seconds, nanoseconds: data._nanoseconds };
  }
  // Handle Admin SDK timestamps which might have _seconds instead of seconds
  if (data._seconds !== undefined && data._nanoseconds !== undefined) {
    return { __type: 'timestamp', seconds: data._seconds, nanoseconds: data._nanoseconds };
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

const flattenForCsv = (doc) => {
  const flat = {};
  for (const [k, v] of Object.entries(doc)) {
    if (v && v._seconds !== undefined) {
      flat[k] = new Date(v._seconds * 1000).toLocaleString();
    } else if (Array.isArray(v)) flat[k] = JSON.stringify(v);
    else if (typeof v === 'object' && v !== null) flat[k] = JSON.stringify(v);
    else flat[k] = v;
  }
  return flat;
};

async function performBackup() {
  console.log(`[${new Date().toISOString()}] Starting Backup Process...`);
  try {
    const zip = new JSZip();
    const dbData = {};

    for (const col of COLLECTIONS) {
      console.log(`Fetching collection: ${col}`);
      const snapshot = await db.collection(col).get();
      const docs = [];
      const csvDocs = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        docs.push({ id: docSnap.id, ...serializeData(data) });
        csvDocs.push({ id: docSnap.id, ...flattenForCsv(data) });
      });

      dbData[col] = docs;

      if (csvDocs.length > 0) {
        const csvString = Papa.unparse(csvDocs);
        zip.file(`csv_export/${col}.csv`, csvString);
      }
    }

    zip.file('database_backup.json', JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: dbData
    }, null, 2));

    console.log('Compressing files to ZIP...');
    const content = await zip.generateAsync({ type: 'nodebuffer' });
    
    // 1. ALWAYS Save locally first as a fallback
    const backupsDir = path.resolve(__dirname, '../backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
    }
    const fileName = `PetLoverERP_Backup_${new Date().toISOString().replace(/:/g, '-')}.zip`;
    const localFilePath = path.join(backupsDir, fileName);
    fs.writeFileSync(localFilePath, content);
    console.log(`✅ Saved backup locally to: backups/${fileName}`);

    // 2. Attempt Google Drive Upload
    if (FOLDER_ID) {
      if (!fs.existsSync(TOKEN_PATH)) {
        console.log('⚠️  No Google Drive token found. Run this FIRST: node scripts/drive-auth.js');
      } else {
        console.log(`Uploading ${fileName} to Google Drive...`);
        try {
          const fileMetadata = { name: fileName, parents: [FOLDER_ID] };
          const media = { mimeType: 'application/zip', body: fs.createReadStream(localFilePath) };
          const driveResponse = await drive.files.create({ resource: fileMetadata, media, fields: 'id' });
          console.log(`✅ Backup Uploaded to Google Drive! File ID: ${driveResponse.data.id}`);
        } catch (driveErr) {
          console.error('⚠️ Google Drive Upload Failed:', driveErr.message);
        }
      }
    } else {
      console.log('No FOLDER_ID set. Skipping Google Drive upload.');
    }

  } catch (error) {
    console.error('❌ Backup Process Failed:', error);
  }
}

// ---------------------------------------------------------
// HOW TO RUN THIS SCRIPT:
// To run manually once: 
//    node scripts/auto-backup.js run
//
// To run automatically every 6 hours: 
//    node scripts/auto-backup.js
// ---------------------------------------------------------

if (process.argv.includes('run')) {
  performBackup().then(() => process.exit(0));
} else {
  console.log("Starting Auto-Backup Service. A backup will be taken every 6 hours.");
  // Run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    performBackup();
  });
  // Trigger an initial backup on start
  performBackup();
}
