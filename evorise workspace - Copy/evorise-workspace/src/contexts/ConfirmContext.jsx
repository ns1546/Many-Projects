import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: 'Confirm Action',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    onConfirm: null,
    onCancel: null
  });

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        title: options.title || 'Confirm Action',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        isDanger: options.isDanger !== undefined ? options.isDanger : true,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  }, []);

  // Prevent background scrolling when open
  useEffect(() => {
    if (confirmState.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [confirmState.isOpen]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.isOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
            onClick={confirmState.onCancel}
          />
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1, boxShadow: '0 24px 48px rgba(0,0,0,0.2)', animation: 'confirm-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <style>
              {`
                @keyframes confirm-pop {
                  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
              `}
            </style>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: confirmState.isDanger ? 'rgba(255,59,48,0.1)' : 'rgba(0,122,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: confirmState.isDanger ? '#FF3B30' : '#007AFF', flexShrink: 0 }}>
                {confirmState.isDanger ? <Trash2 size={24} /> : <Info size={24} />}
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}>{confirmState.title}</h3>
            </div>
            <p style={{ margin: '0 0 28px 0', fontSize: '15px', color: '#8E8E93', lineHeight: '1.5', paddingLeft: '4px' }}>{confirmState.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={confirmState.onCancel} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#F2F2F7', color: '#1C1C1E', fontWeight: 600, fontSize: '15px', cursor: 'pointer', flex: window.innerWidth <= 768 ? 1 : 'unset', transition: 'background 0.2s' }}>{confirmState.cancelText}</button>
              <button onClick={confirmState.onConfirm} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: confirmState.isDanger ? '#FF3B30' : '#007AFF', color: '#FFF', fontWeight: 600, fontSize: '15px', cursor: 'pointer', flex: window.innerWidth <= 768 ? 1 : 'unset', transition: 'filter 0.2s' }} onMouseOver={e=>e.currentTarget.style.filter='brightness(0.9)'} onMouseOut={e=>e.currentTarget.style.filter='none'}>{confirmState.confirmText}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};
