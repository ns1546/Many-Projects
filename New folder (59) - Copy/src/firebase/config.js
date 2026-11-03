import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyApQphkWbPg9x2QBB-e_bmxAWX_J1JHh34",
  authDomain: "pet-lover-bd.firebaseapp.com",
  projectId: "pet-lover-bd",
  storageBucket: "pet-lover-bd.firebasestorage.app",
  messagingSenderId: "717515051231",
  appId: "1:717515051231:web:64be1d579bb36d513cd96a",
  measurementId: "G-63WVEQ7P3X"
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
