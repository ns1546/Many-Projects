import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Bell, CheckCheck, Trash2, Clock, AlertTriangle, CheckCircle, Info, XCircle, Send, RefreshCw, Filter, BellOff, X } from 'lucide-react';
import Pagination from './Pagination';
import { useIsMobile } from '../hooks/useIsMobile';

const TYPE_CONFIG = {
  info:     { color: '#0b57d0', bg: 'rgba(11,87,208,0.08)',   icon: <Info size={16}/>,          label: 'Info'    },
  success:  { color: '#137333', bg: 'rgba(19,115,51,0.08)',   icon: <CheckCircle size={16}/>,   label: 'Success' },
  warning:  { color: '#e37400', bg: 'rgba(227,116,0,0.08)',   icon: <AlertTriangle size={16}/>, label: 'Warning' },
  error:    { color: '#c5221f', bg: 'rgba(197,34,31,0.08)',   icon: <XCircle size={16}/>,       label: 'Error'   },
  reminder: { color: '#7b1fa2', bg: 'rgba(123,31,162,0.08)', icon: <Clock size={16}/>,          label: 'Reminder'},
};

const NotificationCenter = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const {
    notifications, unreadCount, badges,
    markAsRead, markAllAsRead,
    deleteNotification, deleteAllNotifications,
    sendNotification, sendReminder
  } = useNotifications();

  const [filter, setFilter] = useState('all');   // 'all' | 'unread' | 'info' | 'warning' | 'reminder'
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'info', module: 'evoboard', targetUid: 'all' });
  const [sending, setSending] = useState(false);

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.readBy?.includes(currentUser?.uid);
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const paginatedNotifications = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    await sendNotification(form);
    setForm({ title: '', body: '', type: 'info', module: 'evoboard', targetUid: 'all' });
    setComposeOpen(false);
    setSending(false);
  };

  const moduleLabels = {
    evoboard: 'Evo Board', mailbox: 'Mail', whatsapp: 'Chat',
    calendar: 'Calendar', clients: 'Clients', instant: 'Instant Work',
    team: 'Team', dashboard: 'Dashboard'
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0', background: 'transparent' }}>
      
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #0b57d0, #1a73e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(11,87,208,0.3)' }}>
            <Bell size={24} color="white"/>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Notification Center</h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {notifications.length > 0 && (
            <button onClick={deleteAllNotifications} style={{ flex: isMobile ? 1 : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(197,34,31,0.1)', color: '#c5221f', border: '1px solid rgba(197,34,31,0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <Trash2 size={16}/> {isMobile ? '' : 'Clear'}
            </button>
          )}
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{ flex: isMobile ? 1 : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(19,115,51,0.1)', color: '#137333', border: '1px solid rgba(19,115,51,0.2)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              <CheckCheck size={16}/> {isMobile ? '' : 'Read All'}
            </button>
          )}
          <button onClick={() => setComposeOpen(true)} style={{ flex: isMobile ? 1 : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 18px', background: 'linear-gradient(135deg, #0b57d0, #1a73e8)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 12px rgba(11,87,208,0.3)' }}>
            <Send size={16}/> {isMobile ? 'Send' : 'Send Notification'}
          </button>
        </div>
      </div>

      {/* ── Module Badge Summary ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {Object.entries(badges).filter(([, count]) => count > 0).map(([mod, count]) => (
          <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(11,87,208,0.08)', borderRadius: '20px', border: '1px solid rgba(11,87,208,0.2)', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0b57d0' }}>{moduleLabels[mod] || mod}</span>
            <span style={{ background: '#0b57d0', color: 'white', fontSize: '11px', fontWeight: 700, borderRadius: '10px', padding: '1px 8px', minWidth: '20px', textAlign: 'center' }}>{count}</span>
          </div>
        ))}
        {Object.keys(badges).filter(k => badges[k] > 0).length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(19,115,51,0.06)', borderRadius: '20px', border: '1px solid rgba(19,115,51,0.15)', flexShrink: 0 }}>
            <CheckCircle size={14} color="#137333"/>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#137333' }}>No pending badges</span>
          </div>
        )}
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: '14px', width: 'fit-content', overflowX: 'auto', maxWidth: '100%' }}>
        {['all', 'unread', 'info', 'success', 'warning', 'error', 'reminder'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: filter === f ? 700 : 500, fontSize: '13px', background: filter === f ? 'white' : 'transparent', color: filter === f ? '#0b57d0' : 'var(--text-secondary)', boxShadow: filter === f ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', textTransform: 'capitalize', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Notification List ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '0' : '8px', background: isMobile ? 'white' : 'transparent', borderRadius: isMobile ? '16px' : '0', boxShadow: isMobile ? '0 1px 4px rgba(0,0,0,0.04)' : 'none', overflow: isMobile ? 'hidden' : 'auto' }}>
        {paginatedNotifications.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '16px' }}>
            <BellOff size={48} color="var(--text-secondary)" strokeWidth={1.5}/>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px' }}>No notifications here</p>
          </div>
        )}
        {paginatedNotifications.map((notif, index) => {
          const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
          const isRead = notif.readBy?.includes(currentUser?.uid);
          const time = notif.createdAt?.toDate?.();
          return (
            <div
              key={notif.id}
              onClick={() => {
                if (!isRead) markAsRead(notif.id);
                if (notif.module) {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: { menu: notif.module } }));
                }
                if (notif.actionUrl) {
                  // Wait slightly for the module to mount, then dispatch open-task
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('open-task', { detail: { taskId: notif.actionUrl } }));
                  }, 100);
                }
              }}
              style={{
                display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '14px', padding: '14px 16px',
                background: isMobile ? (isRead ? 'white' : `${cfg.bg}`) : (isRead ? 'rgba(0,0,0,0.02)' : cfg.bg),
                border: isMobile ? 'none' : `1px solid ${isRead ? 'rgba(0,0,0,0.06)' : cfg.color + '30'}`,
                borderBottom: isMobile ? (index < paginatedNotifications.length - 1 ? '1px solid var(--border-light)' : 'none') : `1px solid ${isRead ? 'rgba(0,0,0,0.06)' : cfg.color + '30'}`,
                borderRadius: isMobile ? '0' : '14px', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}
            >
              {/* Unread dot */}
              {!isRead && <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: cfg.color }}/>}

              <div style={{ display: 'flex', gap: '14px', width: '100%' }}>
                {/* Type Icon */}
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg, border: `1px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: isRead ? 500 : 700, fontSize: '14px', color: 'var(--text-primary)' }}>{notif.title}</span>
                    {notif.module && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.color, background: cfg.bg, padding: '2px 8px', borderRadius: '8px' }}>
                        {moduleLabels[notif.module] || notif.module}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{notif.body}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {time ? time.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                    {notif.reminderFor && (
                      <span style={{ fontSize: '12px', color: '#7b1fa2', fontWeight: 600 }}>
                        🔔 Reminders sent: {notif.reminderSentCount || 1}
                      </span>
                    )}
                    {notif.reminderFor && (
                      <button
                        onClick={e => { e.stopPropagation(); sendReminder(notif.id); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#7b1fa2', background: 'rgba(123,31,162,0.08)', border: '1px solid rgba(123,31,162,0.2)', borderRadius: '8px', padding: '3px 10px', cursor: 'pointer' }}
                      >
                        <RefreshCw size={11}/> Resend
                      </button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(197,34,31,0.1)'; e.currentTarget.style.color = '#c5221f'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        title="Delete Notification"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length > 0 && (
          <div style={{ padding: '16px', background: 'white', borderRadius: '16px', marginTop: 'auto' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* ── Compose Modal ────────────────────────────────────────────────────── */}
      {composeOpen && (
        <div onClick={() => setComposeOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-matte, white)', borderRadius: isMobile ? '24px 24px 0 0' : '20px', width: isMobile ? '100%' : '500px', padding: '24px 24px 32px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Send Notification</h2>
              {isMobile && <button onClick={() => setComposeOpen(false)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18}/></button>}
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Notification title..." style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--glass-border, #e0e0e0)', borderRadius: '12px', fontSize: '15px', outline: 'none', background: 'rgba(0,0,0,0.02)', boxSizing: 'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Message *</label>
                <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} required placeholder="Message body..." rows={3} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--glass-border, #e0e0e0)', borderRadius: '12px', fontSize: '15px', outline: 'none', background: 'rgba(0,0,0,0.02)', resize: 'vertical', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--glass-border, #e0e0e0)', borderRadius: '12px', fontSize: '15px', outline: 'none', background: 'var(--bg-matte, white)' }}>
                    {Object.entries(TYPE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Module</label>
                  <select value={form.module} onChange={e => setForm({...form, module: e.target.value})} style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--glass-border, #e0e0e0)', borderRadius: '12px', fontSize: '15px', outline: 'none', background: 'var(--bg-matte, white)' }}>
                    {Object.entries(moduleLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                {!isMobile && <button type="button" onClick={() => setComposeOpen(false)} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--glass-border, #e0e0e0)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px' }}>Cancel</button>}
                <button type="submit" disabled={sending} style={{ flex: isMobile ? 1 : 'none', padding: '12px 24px', background: 'linear-gradient(135deg, #0b57d0, #1a73e8)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 12px rgba(11,87,208,0.3)' }}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
