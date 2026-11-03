import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, addDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './config';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export const registerUser = async (email, password, userData) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    ...userData,
    createdAt: serverTimestamp(),
    isActive: true,
  });
  return cred;
};

// ── User profile ──────────────────────────────────────────────────────────────
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = async (uid, data) =>
  updateDoc(doc(db, 'users', uid), data);

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data());
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const saveAttendance = async (uid, sessionData) => {
  await addDoc(collection(db, 'attendance'), {
    uid,
    ...sessionData,
    loginTime: serverTimestamp(),
  });
};

// ── Product Requests ──────────────────────────────────────────────────────────
export const createProductRequest = async (data) =>
  addDoc(collection(db, 'product_requests'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

export const getProductRequests = async (status = null) => {
  let q = collection(db, 'product_requests');
  if (status) q = query(q, where('status', '==', status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateProductRequest = async (id, status, reviewedBy) =>
  updateDoc(doc(db, 'product_requests', id), { status, reviewedBy, reviewedAt: serverTimestamp() });
