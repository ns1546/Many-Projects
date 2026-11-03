import React, { useState, useRef, useEffect, useCallback } from 'react';
import { loginWithEmail, loginWithGoogle, saveAttendance, getUserProfile } from '../firebase/services';
import { auth, db } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, query, where, limit, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { syncAttendance } from '../utils/sheetsSync';
import FirstSetup from './FirstSetup';
import { Crown } from 'lucide-react';

// Roles that require GPS capture
const CAPTURE_ROLES = ['salesman', 'godown_manager'];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c); // distance in meters
};

export default function Login({ onLogin }) {
  const [step, setStep] = useState('credentials'); // credentials | capture
  const [mode, setMode] = useState('email'); // email | google
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captureData, setCaptureData] = useState({ gps: null });
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | done | error
  const [pendingUser, setPendingUser] = useState(null);
  const [setupMode, setSetupMode] = useState('login'); // 'checking' | 'setup' | 'login'
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    if (step === 'capture') {
      captureGPS();
    }
  }, [step]);



  const captureGPS = () => {
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        let distance = null;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          address = data.display_name || address;
          
          if (pendingUser?.profile) {
            const locSnap = await getDoc(doc(db, 'settings', 'locations'));
            if (locSnap.exists()) {
              const locData = locSnap.data();
              if (pendingUser.profile.role === 'salesman' && locData.shop) {
                distance = calculateDistance(latitude, longitude, locData.shop.lat, locData.shop.lng);
              } else if (pendingUser.profile.role === 'godown_manager' && locData.godown) {
                distance = calculateDistance(latitude, longitude, locData.godown.lat, locData.godown.lng);
              }
            }
          }
        } catch {}
        setCaptureData(p => ({ ...p, gps: { latitude, longitude, address, distance } }));
        setGpsStatus('done');
      },
      () => { setGpsStatus('error'); toast.error('GPS access required.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email first to reset password.');
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email), limit(1)));
      if (snap.empty) {
        toast.error('Account not found in the system.');
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const triggerErrorVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    const card = document.querySelector('.login-card');
    if (card) {
      card.classList.remove('shake-error');
      void card.offsetWidth;
      card.classList.add('shake-error');
    }
  };

  const handleError = (err, defaultMsg) => {
    triggerErrorVibration();
    let msg = defaultMsg || 'Authentication failed.';
    const code = err?.code || '';
    const message = err?.message || '';

    const friendlyMessages = {
      'auth/invalid-credential': 'Incorrect email or password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-not-found': 'Incorrect email or password. Please try again.',
      'auth/wrong-password': 'Incorrect email or password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network connection failed. Please check your internet.',
      'auth/user-disabled': 'Your account has been disabled. Please contact the administrator.',
      'auth/email-already-in-use': 'This email is already in use by another account.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
      'auth/internal-error': 'Internal system error. Please try again.',
    };

    if (friendlyMessages[code]) {
      msg = friendlyMessages[code];
    } else if (message.toLowerCase().includes('network') || message.toLowerCase().includes('offline')) {
      msg = 'Network connection failed. Please check your internet.';
    } else {
      // Fallback for all other unknown errors to prevent raw firebase leaks
      msg = defaultMsg || 'A system error occurred. Please try again or contact support.';
    }
    
    toast.error(msg);
  };

  const handleCredentials = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let cred;
      if (mode === 'email') {
        cred = await loginWithEmail(email, password);
      } else {
        cred = await loginWithGoogle();
      }
      const profile = await getUserProfile(cred.user.uid);
      if (!profile) { handleError(new Error('Account not found in system. Contact admin.'), 'Login failed'); setLoading(false); return; }
      if (!profile.isActive) { handleError(new Error('Account is disabled. Contact admin.'), 'Login failed'); setLoading(false); return; }

      if (CAPTURE_ROLES.includes(profile.role)) {
        setPendingUser({ cred, profile });
        setLoading(false);
        setStep('capture');
      } else {
        await finalizeLogin(cred, profile, null);
      }
    } catch (err) {
      handleError(err, 'Authentication failed.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const cred = await loginWithGoogle();
      const profile = await getUserProfile(cred.user.uid);
      if (!profile) { handleError(new Error('Account not found in system. Contact admin.'), 'Login failed'); setLoading(false); return; }
      if (!profile.isActive) { handleError(new Error('Account is disabled.'), 'Login failed'); setLoading(false); return; }
      if (CAPTURE_ROLES.includes(profile.role)) {
        setPendingUser({ cred, profile });
        setLoading(false);
        setStep('capture');
      } else {
        await finalizeLogin(cred, profile, null);
      }
    } catch (err) {
      handleError(err, 'Google login failed.');
      setLoading(false);
    }
  };

  const handleCaptureSubmit = async () => {
    if (gpsStatus !== 'done') { toast.error('Waiting for GPS location…'); return; }
    setLoading(true);
    await finalizeLogin(pendingUser.cred, pendingUser.profile, captureData);
  };

  const finalizeLogin = async (cred, profile, capture) => {
    try {
      if (capture && capture.gps) {
        await saveAttendance(cred.user.uid, {
          gpsLat: capture.gps.latitude,
          gpsLng: capture.gps.longitude,
          gpsAddress: capture.gps.address,
          distanceMeters: capture.gps.distance,
          employeeName: profile.name,
        });
        syncAttendance({
          gpsLat: capture.gps.latitude,
          gpsLng: capture.gps.longitude,
          gpsAddress: capture.gps.address,
          distanceMeters: capture.gps.distance,
          role: profile.role,
          employeeName: profile.name,
        });
      }
      toast.success(`Welcome back, ${profile.name}!`);
      onLogin && onLogin(profile);
    } catch {
      toast.error('Login finalization failed.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      {setupMode !== 'login' && (
        <FirstSetup onComplete={() => setSetupMode('login')} force={setupMode === 'setup'} />
      )}
      
      {setupMode === 'login' && (
        <div className="login-page">
      <div className="login-bg">
      </div>

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="login-logo-icon">
            <Crown size={28} strokeWidth={2.5} />
          </div>
          <div>
            <div className="login-logo-name">Pet Lover BD</div>
            <div className="login-logo-sub">Enterprise Management System</div>
          </div>
        </div>

        {step === 'credentials' && (
          <div className="login-card animate-slide-up">
            <h2 className="login-title">Sign In</h2>
            <p className="login-desc">Access your workspace securely</p>

            <form onSubmit={handleCredentials} className="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  id="login-password"
                  className="form-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button id="btn-login-email" className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
                {loading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}} /> : ' Sign In'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px', marginBottom: '8px' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleForgotPassword} style={{ fontSize: 12, padding: '4px 8px' }}>
                Forgot Password?
              </button>
            </div>

            <div className="login-divider"><span>or</span></div>

            <button id="btn-login-google" className="btn btn-google btn-lg w-full" onClick={handleGoogleLogin} disabled={loading} style={{ justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {window.location.search.includes('setup=true') && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setSetupMode('setup')}>
                   First Time System Setup?
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'capture' && (
          <div className="login-card capture-card animate-slide-up">
            <h2 className="login-title">Identity Verification</h2>
            <p className="login-desc">Required for all field staff logins</p>

            {/* GPS */}
            <div className={`capture-block ${gpsStatus === 'done' ? 'done' : gpsStatus === 'error' ? 'error' : ''}`}>
              <div className="capture-block-header">
                <span className="capture-block-icon"></span>
                <div>
                  <div className="capture-block-title">GPS Location</div>
                  <div className="capture-block-sub">
                    {gpsStatus === 'idle' && 'Initializing…'}
                    {gpsStatus === 'loading' && 'Acquiring location…'}
                    {gpsStatus === 'done' && (
                      <>
                        {captureData.gps?.address}
                        {captureData.gps?.distance !== null && captureData.gps?.distance !== undefined && (
                          <div style={{ marginTop: 4, fontWeight: 'bold', color: captureData.gps.distance <= 150 ? 'var(--green)' : 'var(--amber)' }}>
                            {captureData.gps.distance <= 150 ? ' Within Target Radius' : ` ${captureData.gps.distance}m away from target location`}
                          </div>
                        )}
                      </>
                    )}
                    {gpsStatus === 'error' && 'Failed to get location'}
                  </div>
                </div>
                <div className="capture-status-icon">
                  {gpsStatus === 'loading' && <span className="spinner" style={{width:20,height:20,borderWidth:2}} />}
                  {gpsStatus === 'done' && ''}
                  {gpsStatus === 'error' && ''}
                </div>
              </div>
            </div>



            <button
              id="btn-complete-login"
              className="btn btn-primary btn-lg w-full"
              onClick={handleCaptureSubmit}
              disabled={loading || gpsStatus !== 'done'}
              style={{marginTop: 8}}
            >
              {loading ? <span className="spinner" style={{width:18,height:18,borderWidth:2}} /> : ' Complete Login'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: 24px; background: var(--bg-primary); }
        .login-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .login-container { position: relative; z-index: 1; width: 100%; max-width: 420px; }
        .login-logo { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; justify-content: center; }
        .login-logo-icon { 
          position: relative; overflow: hidden;
          width: 56px; height: 56px; 
          background: var(--bg-card); 
          border-radius: 16px; 
          display: flex; align-items: center; justify-content: center; color: var(--gold);
          border: 1px solid var(--gold);
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.15);
        }
        .login-logo-name { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .login-logo-sub { font-size: 12px; color: var(--text-secondary); font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 2px; }
        .login-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .login-title { font-family: var(--font-display); font-size: 22px; font-weight: 800; margin-bottom: 6px; }
        .login-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
        .login-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
        .login-divider { display: flex; align-items: center; gap: 12px; color: var(--text-muted); font-size: 12px; margin: 16px 0; }
        .login-divider::before, .login-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .login-note { margin-top: 18px; padding: 12px; background: var(--amber-dim); border: 1px solid rgba(245,158,11,0.3); border-radius: var(--radius); font-size: 11px; color: var(--amber); line-height: 1.5; }
        .capture-card { }
        .capture-block { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 14px; transition: var(--transition); }
        .capture-block.done { border-color: rgba(34,197,94,0.4); background: var(--green-dim); }
        .capture-block.error { border-color: rgba(239,68,68,0.4); }
        .capture-block-header { display: flex; align-items: flex-start; gap: 12px; }
        .capture-block-icon { font-size: 20px; margin-top: 2px; }
        .capture-block-title { font-weight: 600; font-size: 13px; margin-bottom: 3px; }
        .capture-block-sub { font-size: 11px; color: var(--text-muted); line-height: 1.4; }
        .capture-status-icon { margin-left: auto; font-size: 18px; }
        .camera-view { margin-top: 12px; border-radius: var(--radius); overflow: hidden; background: #000; aspect-ratio: 4/3; }
        .camera-video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .camera-actions { display: flex; justify-content: center; margin-top: 10px; gap: 8px; }
        @keyframes shake-error {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .shake-error { animation: shake-error 0.4s ease-in-out; border-color: rgba(239,68,68,0.5) !important; }
      `}</style>
        </div>
      )}
    </>
  );
}
