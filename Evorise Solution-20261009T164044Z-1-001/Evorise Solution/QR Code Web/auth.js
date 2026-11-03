// auth.js - Firebase & Local Authentication System
// Supports both Firebase mode (USE_FIREBASE=true) and local mode (USE_FIREBASE=false)

// --- LOCAL AUTH HELPERS (used when USE_FIREBASE=false) ---
const LOCAL_ADMIN_KEY = 'qr_local_admin_session';
const LOCAL_ADMIN_USERS_KEY = 'qr_local_admin_users';

function getLocalAdmins() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ADMIN_USERS_KEY) || '[]');
  } catch(e) { return []; }
}

function saveLocalAdmins(users) {
  localStorage.setItem(LOCAL_ADMIN_USERS_KEY, JSON.stringify(users));
}

function getLocalSession() {
  try {
    return JSON.parse(sessionStorage.getItem(LOCAL_ADMIN_KEY) || localStorage.getItem(LOCAL_ADMIN_KEY) || 'null');
  } catch(e) { return null; }
}

function setLocalSession(user) {
  if (user) {
    sessionStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(LOCAL_ADMIN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
  }
}

// Seed default admin accounts if none exist
function ensureDefaultAdmin() {
  const admins = getLocalAdmins();
  if (admins.length === 0) {
    admins.push(
      {
        uid: 'local-admin-001',
        email: 'admin@evorise.com',
        password: 'admin123',
        displayName: 'Administrator',
        role: 'admin'
      },
      {
        uid: 'local-admin-002',
        email: 'b@gmail.com',
        password: 'password123',
        displayName: 'Admin B',
        role: 'admin'
      }
    );
    saveLocalAdmins(admins);
  }
}

// Convert technical Firebase error codes into friendly user messages
function formatAuthError(error) {
  if (!error) return "An unexpected error occurred. Please try again.";
  const code = (error.code || '').toLowerCase();
  const msg = (error.message || '').toLowerCase();

  if (code.includes('invalid-credential') || msg.includes('invalid-credential')) {
    return "Incorrect password or credentials. If you haven't registered yet, switch to 'Create Account' or use 1-Click Demo Login.";
  }
  if (code.includes('user-not-found') || msg.includes('user-not-found')) {
    return "No account exists with this email. Switch to 'Create Account' above to sign up.";
  }
  if (code.includes('wrong-password') || msg.includes('wrong-password')) {
    return "Incorrect password. Please check your password or click 'Forgot Password?'.";
  }
  if (code.includes('email-already-in-use') || msg.includes('email-already-in-use')) {
    return "This email is already registered. Please sign in or use 'Forgot Password?'.";
  }
  if (code.includes('weak-password') || msg.includes('weak-password')) {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (code.includes('invalid-email') || msg.includes('invalid-email')) {
    return "Please enter a valid email address.";
  }
  if (code.includes('unauthorized-domain') || msg.includes('unauthorized-domain')) {
    const domain = window.location.hostname || 'your domain';
    return `Google Sign-In needs domain authorization: "${domain}" is not yet added in Firebase Console (Authentication > Settings > Authorized Domains). Please use 1-Click Admin Login or Email/Password in the meantime!`;
  }
  if (code.includes('popup-blocked') || msg.includes('popup-blocked')) {
    return "Sign-in popup was blocked by your browser. Please allow popups or use Email login.";
  }
  if (code.includes('popup-closed-by-user') || msg.includes('popup-closed-by-user')) {
    return "Google sign-in popup was closed before finishing.";
  }
  if (code.includes('network-request-failed') || msg.includes('network-request-failed')) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (code.includes('too-many-requests') || msg.includes('too-many-requests')) {
    return "Too many attempts. Access is temporarily disabled. Please wait a few moments or reset password.";
  }
  return error.message || "Authentication failed. Please try again.";
}

// User Registration
async function registerUser(email, password, displayName, role = 'admin') {
  email = (email || '').trim().toLowerCase();

  // --- LOCAL MODE ---
  if (typeof USE_FIREBASE !== 'undefined' && !USE_FIREBASE) {
    const admins = getLocalAdmins();
    if (admins.find(u => u.email.toLowerCase() === email)) {
      throw new Error('An account with this email already exists. Please sign in.');
    }
    const newUser = { uid: 'local-' + Date.now(), email, password, displayName, role };
    admins.push(newUser);
    saveLocalAdmins(admins);
    setLocalSession(newUser);
    return newUser;
  }

  // --- FIREBASE MODE ---
  if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update profile display name
    if (displayName) {
      try {
        await user.updateProfile({ displayName: displayName });
      } catch(e) {}
    }
    
    // Store user role in Firestore
    if (firestoreDB) {
      try {
        await firestoreDB.collection('users').doc(user.uid).set({
          email: email,
          displayName: displayName || email.split('@')[0],
          role: role,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch(e) {
        console.warn("Firestore profile creation warning:", e);
      }
    }

    setLocalSession({
      uid: user.uid,
      email: email,
      displayName: displayName || email.split('@')[0],
      role: role
    });

    return user;
  } catch (error) {
    throw error;
  }
}

// Admin Creation (used from inside Admin Dashboard settings)
async function createAdminAccount(email, password, displayName) {
  if (typeof firebase === 'undefined' || !firebaseConfig) throw new Error("Firebase is not initialized properly.");
  
  // Use a secondary app instance to avoid logging out the current admin
  const secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryApp_" + Date.now());
  try {
    const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    if (displayName) {
      await user.updateProfile({ displayName: displayName });
    }
    
    if (firestoreDB) {
      await firestoreDB.collection('users').doc(user.uid).set({
        email: email,
        displayName: displayName || email.split('@')[0],
        role: 'admin',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    
    await secondaryApp.auth().signOut();
    secondaryApp.delete();
    return true;
  } catch (error) {
    secondaryApp.delete();
    throw error;
  }
}

// User Login (with smart auto-register fallback for smooth onboarding)
async function loginUser(email, password) {
  email = (email || '').trim().toLowerCase();

  // --- LOCAL MODE ---
  if (typeof USE_FIREBASE !== 'undefined' && !USE_FIREBASE) {
    ensureDefaultAdmin();
    const admins = getLocalAdmins();
    const user = admins.find(u => u.email.toLowerCase() === email && u.password === password);
    if (!user) {
      // Auto-register in local mode if password >= 6
      if (password && password.length >= 6) {
        const newUser = {
          uid: 'local-' + Date.now(),
          email: email,
          password: password,
          displayName: email.split('@')[0],
          role: 'admin'
        };
        admins.push(newUser);
        saveLocalAdmins(admins);
        setLocalSession(newUser);
        if (window._localAuthListeners) window._localAuthListeners.forEach(cb => cb(newUser));
        return newUser;
      }
      throw new Error('Incorrect email or password.');
    }
    setLocalSession(user);
    if (window._localAuthListeners) window._localAuthListeners.forEach(cb => cb(user));
    return user;
  }

  // --- FIREBASE MODE ---
  if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
  
  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Ensure Firestore profile exists and has role
    if (firestoreDB && user) {
      try {
        await firestoreDB.collection('users').doc(user.uid).set({
          email: user.email || email,
          displayName: user.displayName || email.split('@')[0],
          role: 'admin',
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch(e) {
        console.warn("User profile sync warning:", e);
      }
    }

    setLocalSession({
      uid: user.uid,
      email: user.email || email,
      displayName: user.displayName || email.split('@')[0],
      role: 'admin'
    });

    return user;
  } catch (error) {
    const code = error.code || '';
    
    // SMART FALLBACK: If credential is invalid, check if account doesn't exist yet and auto-create
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
      try {
        const newCred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
        const newUser = newCred.user;
        
        if (firestoreDB && newUser) {
          try {
            await firestoreDB.collection('users').doc(newUser.uid).set({
              email: email,
              displayName: email.split('@')[0],
              role: 'admin',
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } catch(e) {
            console.warn("New user firestore save warning:", e);
          }
        }

        setLocalSession({
          uid: newUser.uid,
          email: newUser.email || email,
          displayName: email.split('@')[0],
          role: 'admin'
        });

        return newUser;
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Account already exists, meaning the password was wrong!
          throw new Error(`Incorrect password for ${email}. Please check your password or use "Forgot Password?".`);
        }
        if (createErr.code === 'auth/weak-password') {
          throw new Error('Password must be at least 6 characters.');
        }
        if (createErr.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        }
        throw new Error(`Incorrect password for ${email}.`);
      }
    }

    throw error;
  }
}

// Google OAuth Login
async function loginWithGoogle() {
  if (typeof USE_FIREBASE !== 'undefined' && !USE_FIREBASE) {
    throw new Error('Google sign-in requires Firebase to be enabled. Please use Email login.');
  }
  if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    let result;
    try {
      result = await firebaseAuth.signInWithPopup(provider);
    } catch (popupErr) {
      // If popup blocked or cancelled popup, try redirect fallback
      if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') {
        console.warn("Popup blocked by browser, attempting redirect login:", popupErr);
        await firebaseAuth.signInWithRedirect(provider);
        return null;
      }
      throw popupErr;
    }

    if (!result || !result.user) return null;
    const user = result.user;
    
    // Ensure user role exists in Firestore
    if (firestoreDB && user) {
      try {
        const userRef = firestoreDB.collection('users').doc(user.uid);
        await userRef.set({
          email: user.email || '',
          displayName: user.displayName || 'Google User',
          role: 'admin',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore sync during Google login:", e);
      }
    }

    setLocalSession({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Google User',
      role: 'admin'
    });

    return user;
  } catch (error) {
    throw error;
  }
}

// Password Reset
async function resetPassword(email) {
  email = (email || '').trim().toLowerCase();
  if (typeof USE_FIREBASE !== 'undefined' && !USE_FIREBASE) {
    const admins = getLocalAdmins();
    const user = admins.find(u => u.email.toLowerCase() === email);
    if (!user) throw new Error('No account found with this email.');
    alert(`Local Demo: Your password is "${user.password}".`);
    return;
  }
  if (!firebaseAuth) throw new Error("Firebase Auth is not initialized.");
  try {
    await firebaseAuth.sendPasswordResetEmail(email);
  } catch (error) {
    throw error;
  }
}

// Logout
async function logoutUser() {
  setLocalSession(null);
  if (typeof USE_FIREBASE !== 'undefined' && !USE_FIREBASE) {
    if (window._localAuthListeners) window._localAuthListeners.forEach(cb => cb(null));
    return;
  }
  if (firebaseAuth) {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.warn("Sign out error:", error);
    }
  }
}

// User Role Lookup
async function getUserRole(user) {
  if (!user) return 'customer';
  if (!firestoreDB) return 'admin';
  try {
    const docRef = firestoreDB.collection('users').doc(user.uid);
    const doc = await docRef.get();
    if (doc.exists && doc.data() && doc.data().role) {
      return doc.data().role;
    } else {
      // Ensure missing doc is initialized as admin
      try {
        await docRef.set({
          email: user.email || '',
          displayName: user.displayName || user.email || 'Admin',
          role: 'admin',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.warn("Could not save user document:", e);
      }
      return 'admin';
    }
  } catch (error) {
    console.warn("Role check error, defaulting to admin for admin panel access:", error);
    return 'admin';
  }
}

// Enforce Admin Access for Protected Pages
function enforceAdminAccess() {
  // LOCAL MODE
  if (typeof USE_FIREBASE !== 'undefined' && !USE_FIREBASE) {
    ensureDefaultAdmin();
    const session = getLocalSession();
    if (session && session.role && ['admin','manager','owner'].includes(session.role)) {
      window.isAdminVerified = true;
      window.dispatchEvent(new Event('adminRoleVerified'));
    } else {
      window.location.href = '/admin/login.html';
    }
    return;
  }

  // FIREBASE MODE
  if (!firebaseAuth) return;
  firebaseAuth.onAuthStateChanged(async (user) => {
    if (user) {
      const role = await getUserRole(user);
      // Restaurant panel grants access to admin, manager, owner, or any authenticated dashboard user
      window.isAdminVerified = true;
      window.dispatchEvent(new Event('adminRoleVerified'));
    } else {
      // Check if local session backup exists
      const localSession = getLocalSession();
      if (localSession && localSession.role && ['admin','manager','owner'].includes(localSession.role)) {
        window.isAdminVerified = true;
        window.dispatchEvent(new Event('adminRoleVerified'));
      } else {
        window.location.href = '/admin/login.html';
      }
    }
  });
}

// Observe Auth State Globally
function onAuthChange(callback) {
  // LOCAL MODE
  if (typeof USE_FIREBASE !== 'undefined' && !USE_FIREBASE) {
    ensureDefaultAdmin();
    if (!window._localAuthListeners) window._localAuthListeners = [];
    window._localAuthListeners.push(callback);
    const session = getLocalSession();
    setTimeout(() => callback(session), 0);
    return;
  }
  // FIREBASE MODE
  if (firebaseAuth) {
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        callback(user);
      } else {
        const localSession = getLocalSession();
        callback(localSession || null);
      }
    });
  }
}
