import * as admin from 'firebase-admin';

let db: any = null;
let auth: any = null;

// Only initialize Firebase in production (Netlify) to prevent local gRPC hanging
const isProd = process.env.NODE_ENV === 'production';

if (isProd && !admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      db = admin.firestore();
      auth = admin.auth();
    }
  } catch (error: any) {
    console.warn('Firebase Admin Initialization Error:', error.message);
  }
} else if (isProd) {
  try {
    db = admin.firestore();
    auth = admin.auth();
  } catch (e) {}
}

// A robust recursive proxy to mock Firestore chains safely
const mockHandler: ProxyHandler<any> = {
  get(target, prop) {
    if (prop === 'get') return async () => ({ empty: true, docs: [], size: 0 });
    if (prop === 'data') return () => ({ count: 0 });
    if (prop === 'add') return async () => ({ id: 'mock' });
    if (prop === 'set' || prop === 'update' || prop === 'delete' || prop === 'commit') return async () => {};
    // Return proxy for chaining any other methods (collection, where, orderBy, doc, count, limit, batch, etc.)
    return () => new Proxy({}, mockHandler);
  }
};

// Explicitly type adminDb to prevent 'any' type leakage in TS
export const adminAuth = (auth || {}) as admin.auth.Auth;
export const adminDb: admin.firestore.Firestore = (db || new Proxy({}, mockHandler)) as admin.firestore.Firestore;

export default admin;
