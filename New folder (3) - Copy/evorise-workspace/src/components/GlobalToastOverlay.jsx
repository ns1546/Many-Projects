import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { CheckCircle, AlertTriangle, Info, XCircle, Clock, X } from 'lucide-react';

const TYPE_CFG = {
  info:     { color: '#0b57d0', bg: '#e8f0fe', border: '#aecbfa', icon: <Info size={16}/> },
  success:  { color: '#137333', bg: '#e6f4ea', border: '#a8d5b5', icon: <CheckCircle size={16}/> },
  warning:  { color: '#e37400', bg: '#fef7e0', border: '#fad07a', icon: <AlertTriangle size={16}/> },
  error:    { color: '#c5221f', bg: '#fce8e6', border: '#f4b8b5', icon: <XCircle size={16}/> },
  reminder: { color: '#7b1fa2', bg: '#f3e5f5', border: '#ce93d8', icon: <Clock size={16}/> },
};

const GlobalToastOverlay = () => {
  const { toasts, dismissToast, markAsRead } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999999, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
      {toasts.map(toast => {
        const cfg = TYPE_CFG[toast.type] || TYPE_CFG.info;
        return (
          <div
            key={toast.id}
            onClick={() => {
              markAsRead(toast.id);
              if (toast.module) {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { menu: toast.module } }));
              }
              if (toast.actionUrl) {
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('open-task', { detail: { taskId: toast.actionUrl } }));
                }, 100);
              }
              dismissToast(toast.id);
            }}
            style={{
              pointerEvents: 'all',
              cursor: 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: '14px', padding: '14px 16px',
              minWidth: '300px', maxWidth: '380px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              animation: 'slideInToast 0.3s ease-out forwards',
            }}
          >
            <div style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }}>{cfg.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: cfg.color, marginBottom: '3px' }}>{toast.title}</div>
              <div style={{ fontSize: '12px', color: '#5f6368', lineHeight: '1.5' }}>{toast.body}</div>
              {toast.module && (
                <div style={{ fontSize: '11px', fontWeight: 600, color: cfg.color, marginTop: '5px', opacity: 0.8 }}>{toast.module}</div>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '2px', flexShrink: 0 }}>
              <X size={14}/>
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideInToast {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GlobalToastOverlay;
