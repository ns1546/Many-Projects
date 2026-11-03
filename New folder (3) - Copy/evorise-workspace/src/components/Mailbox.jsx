import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useActivity } from '../contexts/ActivityContext';
import { Mail, Send as SendIcon, Inbox, Star, FileText, Search, ChevronLeft, Reply, X } from 'lucide-react';
import Pagination from './Pagination';
import { useIsMobile } from '../hooks/useIsMobile';
import '../index.css';

const Mailbox = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const { sendNotification } = useNotifications();
  const { logActivity } = useActivity();
  const [team, setTeam] = useState([]);
  
  const [emails, setEmails] = useState([]);
  const [mailFilter, setMailFilter] = useState('inbox');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [selectedMail, setSelectedMail] = useState(null);
  const [searchMailQuery, setSearchMailQuery] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  // Handlers for selection
  const toggleSelection = (e, id) => {
    e.stopPropagation();
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter(i => i !== id));
    } else {
      setSelectedEmails([...selectedEmails, id]);
    }
  };

  const selectAll = () => {
    if (selectedEmails.length === filteredEmails.length && filteredEmails.length > 0) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(m => m.id));
    }
  };

  useEffect(() => {
    const unsubTeam = onSnapshot(collection(db, 'users'), snap => {
      const data = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setTeam(data);
    });

    if (currentUser?.uid) {
      const unsubMail = onSnapshot(collection(db, 'mailbox'), snap => {
        const data = [];
        snap.forEach(d => data.push({ id: d.id, ...d.data() }));
        const myMails = data.filter(m => m.to === currentUser.uid || m.from === currentUser.uid);
        myMails.sort((a, b) => b.timestamp - a.timestamp);
        setEmails(myMails);
      });
      return () => { unsubTeam(); unsubMail(); };
    }
    return () => { unsubTeam(); };
  }, [currentUser]);

  useEffect(() => {
    const handler = () => {
      setIsComposeOpen(true);
      setSelectedMail(null);
    };
    window.addEventListener('mobile-fab-mailbox', handler);
    return () => window.removeEventListener('mobile-fab-mailbox', handler);
  }, []);

  const handleSendMail = async (e) => {
    e.preventDefault();
    if (!mailTo || !mailSubject || !mailBody) return;
    try {
      await addDoc(collection(db, 'mailbox'), {
        from: currentUser.uid,
        to: mailTo,
        subject: mailSubject,
        body: mailBody,
        timestamp: Date.now(),
        read: false
      });
      
      sendNotification({
        title: 'New Mail',
        body: `Subject: ${mailSubject}`,
        module: 'mailbox',
        targetUid: mailTo,
        type: 'info'
      });
      
      logActivity({ action: 'SEND_MAIL', module: 'mailbox', detail: `Sent mail with subject: ${mailSubject}` });

      setIsComposeOpen(false);
      setMailTo('');
      setMailSubject('');
      setMailBody('');
    } catch(err) {
      console.error(err);
    }
  };

  const markMailAsRead = async (mail) => {
    setSelectedMail(mail);
    setIsComposeOpen(false);
    if (mail.to === currentUser?.uid && !mail.read) {
      await updateDoc(doc(db, 'mailbox', mail.id), { read: true });
    }
  };

  const closeMail = () => {
    setSelectedMail(null);
  };

  const handleStar = async (e, mail) => {
    e.stopPropagation();
    const isStarred = (mail.starredBy || []).includes(currentUser?.uid);
    const newStarredBy = isStarred 
      ? (mail.starredBy || []).filter(u => u !== currentUser?.uid)
      : [...(mail.starredBy || []), currentUser?.uid];
    await updateDoc(doc(db, 'mailbox', mail.id), { starredBy: newStarredBy });
  };

  const handleDelete = async (e, mail) => {
    e.stopPropagation();
    const isDeleted = (mail.deletedFor || []).includes(currentUser?.uid);
    if (!isDeleted) {
      await updateDoc(doc(db, 'mailbox', mail.id), { deletedFor: [...(mail.deletedFor || []), currentUser?.uid] });
      setSelectedEmails(selectedEmails.filter(id => id !== mail.id));
      if (selectedMail?.id === mail.id) setSelectedMail(null);
      logActivity({ action: 'DELETE_MAIL', module: 'mailbox', detail: `Deleted mail with subject: ${mail.subject}` });
    }
  };

  const handleBulkDelete = async () => {
    const promises = selectedEmails.map(id => {
      const mail = emails.find(m => m.id === id);
      if (mail && !(mail.deletedFor || []).includes(currentUser?.uid)) {
        return updateDoc(doc(db, 'mailbox', id), { deletedFor: [...(mail.deletedFor || []), currentUser?.uid] });
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
    logActivity({ action: 'BULK_DELETE_MAIL', module: 'mailbox', detail: `Deleted ${selectedEmails.length} emails` });
    setSelectedEmails([]);
  };

  const filteredEmails = emails.filter(m => {
    const isDeleted = (m.deletedFor || []).includes(currentUser?.uid);
    if (mailFilter === 'trash') return isDeleted;
    if (isDeleted) return false;

    if (mailFilter === 'inbox') return m.to === currentUser?.uid;
    if (mailFilter === 'sent') return m.from === currentUser?.uid;
    if (mailFilter === 'starred') return (m.starredBy || []).includes(currentUser?.uid);
    return true;
  }).filter(m => 
    (m.subject?.toLowerCase() || '').includes(searchMailQuery.toLowerCase()) || 
    (m.body?.toLowerCase() || '').includes(searchMailQuery.toLowerCase())
  );

  const paginatedEmails = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmails.slice(start, start + itemsPerPage);
  }, [filteredEmails, currentPage, itemsPerPage]);

  return (
    <div style={{ display: 'flex', height: '100%', background: 'white', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
      
      {/* Sidebar / Mobile Tabs */}
      <div style={{ width: isMobile ? '100%' : '256px', display: 'flex', flexDirection: isMobile ? 'column' : 'column', padding: isMobile ? '0' : '16px 0', background: '#f6f8fc' }}>
        
        {!isMobile && (
          <div style={{ padding: '0 16px', marginBottom: '16px' }}>
            <button 
              onClick={() => { setIsComposeOpen(true); setSelectedMail(null); }}
              style={{ padding: '16px 24px', borderRadius: '16px', background: '#c2e7ff', color: '#001d35', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s', width: '100%', boxShadow: '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)' }}
              onMouseOver={e => e.currentTarget.style.background = '#b3e0ff'}
              onMouseOut={e => e.currentTarget.style.background = '#c2e7ff'}
            >
              <FileText size={18} /> Compose
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', overflowX: isMobile ? 'auto' : 'visible', borderBottom: isMobile ? '1px solid #e0e0e0' : 'none' }}>
          <div onClick={() => {setMailFilter('inbox'); setSelectedMail(null); setIsComposeOpen(false); setSelectedEmails([]);}} style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: mailFilter === 'inbox' ? (isMobile ? 'transparent' : '#d3e3fd') : 'transparent', color: mailFilter === 'inbox' ? '#0b57d0' : '#202124', fontWeight: mailFilter === 'inbox' ? 600 : 500, borderRadius: isMobile ? '0' : '0 24px 24px 0', marginRight: isMobile ? '0' : '16px', fontSize: '14px', borderBottom: (isMobile && mailFilter === 'inbox') ? '3px solid #0b57d0' : '3px solid transparent', whiteSpace: 'nowrap' }}>
            <Inbox size={18} color={mailFilter === 'inbox' ? '#0b57d0' : '#5f6368'} /> Inbox
            {emails.filter(m => m.to === currentUser?.uid && !m.read && !(m.deletedFor || []).includes(currentUser?.uid)).length > 0 && (
              <span style={{ marginLeft: isMobile ? '4px' : 'auto', fontSize: '12px', fontWeight: 700 }}>{emails.filter(m => m.to === currentUser?.uid && !m.read && !(m.deletedFor || []).includes(currentUser?.uid)).length}</span>
            )}
          </div>
          <div onClick={() => {setMailFilter('starred'); setSelectedMail(null); setIsComposeOpen(false); setSelectedEmails([]);}} style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: mailFilter === 'starred' ? (isMobile ? 'transparent' : '#d3e3fd') : 'transparent', color: mailFilter === 'starred' ? '#0b57d0' : '#202124', fontWeight: mailFilter === 'starred' ? 600 : 500, borderRadius: isMobile ? '0' : '0 24px 24px 0', marginRight: isMobile ? '0' : '16px', fontSize: '14px', borderBottom: (isMobile && mailFilter === 'starred') ? '3px solid #0b57d0' : '3px solid transparent', whiteSpace: 'nowrap' }}>
            <Star size={18} color={mailFilter === 'starred' ? '#0b57d0' : '#5f6368'} /> Starred
          </div>
          <div onClick={() => {setMailFilter('sent'); setSelectedMail(null); setIsComposeOpen(false); setSelectedEmails([]);}} style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: mailFilter === 'sent' ? (isMobile ? 'transparent' : '#d3e3fd') : 'transparent', color: mailFilter === 'sent' ? '#0b57d0' : '#202124', fontWeight: mailFilter === 'sent' ? 600 : 500, borderRadius: isMobile ? '0' : '0 24px 24px 0', marginRight: isMobile ? '0' : '16px', fontSize: '14px', borderBottom: (isMobile && mailFilter === 'sent') ? '3px solid #0b57d0' : '3px solid transparent', whiteSpace: 'nowrap' }}>
            <SendIcon size={18} color={mailFilter === 'sent' ? '#0b57d0' : '#5f6368'} /> Sent
          </div>
          <div onClick={() => {setMailFilter('trash'); setSelectedMail(null); setIsComposeOpen(false); setSelectedEmails([]);}} style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', background: mailFilter === 'trash' ? (isMobile ? 'transparent' : '#d3e3fd') : 'transparent', color: mailFilter === 'trash' ? '#0b57d0' : '#202124', fontWeight: mailFilter === 'trash' ? 600 : 500, borderRadius: isMobile ? '0' : '0 24px 24px 0', marginRight: isMobile ? '0' : '16px', fontSize: '14px', borderBottom: (isMobile && mailFilter === 'trash') ? '3px solid #0b57d0' : '3px solid transparent', whiteSpace: 'nowrap' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={mailFilter === 'trash' ? '#0b57d0' : '#5f6368'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Trash
          </div>
        </div>
      </div>

      {/* Gmail Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', borderRadius: isMobile ? '0' : '16px 0 0 0', overflow: 'hidden' }}>
        
        {/* Gmail Top Search */}
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', background: 'white', borderBottom: '1px solid #f1f3f4' }}>
          <div style={{ background: '#f1f3f4', borderRadius: '24px', display: 'flex', alignItems: 'center', padding: '10px 20px', gap: '16px', flex: 1, maxWidth: '720px' }}>
            <Search size={20} color="#5f6368" />
            <input 
              type="text" 
              placeholder="Search mail" 
              value={searchMailQuery}
              onChange={e => setSearchMailQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '16px', color: '#202124' }} 
            />
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
          
          {isComposeOpen ? (
            // COMPOSE UI
            <div style={{ padding: isMobile ? '16px' : '32px', width: '100%', maxWidth: '800px', margin: '0 auto', height: '100%' }}>
              <form onSubmit={handleSendMail} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRadius: '16px', border: '1px solid #dadce0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '14px 20px', background: '#f2f6fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: '#1f1f1f', borderBottom: '1px solid #e0e0e0' }}>
                  New Message
                  <button type="button" onClick={() => setIsComposeOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368' }}><X size={20}/></button>
                </div>
                <div style={{ padding: '0 20px' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #f1f3f4', padding: '12px 0', alignItems: 'center' }}>
                    <span style={{ color: '#5f6368', width: '50px', fontSize: '15px' }}>To</span>
                    <select value={mailTo} onChange={e => setMailTo(e.target.value)} required style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', background: 'white', color: '#202124', width: '100%' }}>
                      <option value="">Select Recipient...</option>
                      {team.filter(t => t.id !== currentUser?.uid).map(t => <option key={t.id} value={t.id}>{t.name} ({t.role || 'Employee'})</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', borderBottom: '1px solid #f1f3f4', padding: '12px 0' }}>
                    <input type="text" value={mailSubject} onChange={e => setMailSubject(e.target.value)} placeholder="Subject" required style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#202124', width: '100%' }} />
                  </div>
                </div>
                <textarea 
                  value={mailBody} 
                  onChange={e => setMailBody(e.target.value)} 
                  required 
                  style={{ flex: 1, minHeight: '150px', border: 'none', outline: 'none', padding: '20px', resize: 'none', fontSize: '15px', lineHeight: 1.6, color: '#202124' }}
                ></textarea>
                <div style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid #f1f3f4', display: 'flex' }}>
                  <button type="submit" style={{ padding: '10px 24px', background: '#0b57d0', color: 'white', border: 'none', borderRadius: '24px', fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SendIcon size={16}/> Send
                  </button>
                </div>
              </form>
            </div>

          ) : selectedMail ? (
            // EMAIL DETAIL UI
            (() => {
              const currentSelectedMail = emails.find(m => m.id === selectedMail.id) || selectedMail;
              return (
            <div style={{ padding: '24px 32px' }}>
               <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #f1f3f4', paddingBottom: '12px' }}>
                  <button onClick={closeMail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '8px', borderRadius: '50%' }} onMouseOver={e=>e.currentTarget.style.background='#f1f3f4'} onMouseOut={e=>e.currentTarget.style.background='transparent'}><ChevronLeft size={20}/></button>
                  <h2 style={{ margin: 0, fontSize: '22px', color: '#1f1f1f', fontWeight: 400, paddingTop: '4px' }}>{currentSelectedMail.subject}</h2>
               </div>
               
               <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', marginBottom: '24px', gap: '16px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff5722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: 'white', flexShrink: 0 }}>
                     {(team.find(t => t.id === currentSelectedMail.from)?.name || 'U').charAt(0)}
                   </div>
                   <div style={{ minWidth: 0 }}>
                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                       <span style={{ fontWeight: 600, fontSize: '14px', color: '#202124' }}>{team.find(t => t.id === currentSelectedMail.from)?.name || 'Unknown User'}</span>
                       <span style={{ fontSize: '12px', color: '#5f6368' }}>&lt;evorise-agency&gt;</span>
                     </div>
                     <div style={{ fontSize: '12px', color: '#5f6368' }}>to {currentSelectedMail.to === currentUser?.uid ? 'me' : (team.find(t=>t.id===currentSelectedMail.to)?.name || 'user')}</div>
                   </div>
                 </div>
                 <div style={{ fontSize: '12px', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '16px', justifyContent: isMobile ? 'space-between' : 'flex-end', paddingLeft: isMobile ? '56px' : '0' }}>
                   {new Date(currentSelectedMail.timestamp).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                   <div style={{ display: 'flex', gap: '16px' }}>
                     <Star size={18} fill={(currentSelectedMail.starredBy || []).includes(currentUser?.uid) ? '#f4b400' : 'none'} color={(currentSelectedMail.starredBy || []).includes(currentUser?.uid) ? '#f4b400' : '#5f6368'} style={{ cursor: 'pointer' }} onClick={(e) => handleStar(e, currentSelectedMail)}/>
                     <Reply size={18} color="#5f6368" style={{ cursor: 'pointer' }} onClick={() => { setIsComposeOpen(true); setMailTo(currentSelectedMail.from); setMailSubject(`Re: ${currentSelectedMail.subject}`); }}/>
                     <button onClick={(e) => { handleDelete(e, currentSelectedMail); closeMail(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center' }} title="Delete">
                       <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                     </button>
                   </div>
                 </div>
               </div>
               
               <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#202124', whiteSpace: 'pre-wrap', paddingLeft: isMobile ? '0' : '56px' }}>
                 {currentSelectedMail.body}
               </div>

               <div style={{ paddingLeft: isMobile ? '0' : '56px', marginTop: '32px' }}>
                 <button onClick={() => { setIsComposeOpen(true); setMailTo(currentSelectedMail.from); setMailSubject(`Re: ${currentSelectedMail.subject}`); }} style={{ background: 'transparent', border: '1px solid #747775', padding: '8px 24px', borderRadius: '24px', color: '#444746', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Reply size={18}/> Reply
                 </button>
               </div>
            </div>
            );
            })()
          ) : (
            // EMAIL LIST UI
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Toolbar */}
              {!isComposeOpen && !selectedMail && (
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f3f4', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0} 
                    onChange={selectAll} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  {selectedEmails.length > 0 && (
                    <button onClick={handleBulkDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', display: 'flex', alignItems: 'center', padding: '4px' }} title="Delete selected">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                  )}
                </div>
              )}

              {paginatedEmails.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#5f6368' }}>No emails found.</div>}
              {paginatedEmails.map(mail => {
                 const sender = team.find(t => t.id === (mailFilter === 'inbox' ? mail.from : mail.to)) || { name: 'Unknown' };
                 const isRead = mail.read || mailFilter === 'sent';
                 const isStarred = (mail.starredBy || []).includes(currentUser?.uid);
                 const isSelected = selectedEmails.includes(mail.id);

                 return isMobile ? (
                   <div 
                     key={mail.id} 
                     onClick={() => markMailAsRead(mail)}
                     style={{ 
                       display: 'flex', alignItems: 'center', padding: '16px', cursor: 'pointer', 
                       borderBottom: '1px solid #f1f3f4', background: isSelected ? '#c2e7ff' : (isRead ? 'white' : '#f2f6fc'),
                       position: 'relative', gap: '16px'
                     }}
                   >
                     <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #0b57d0, #1a73e8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, flexShrink: 0 }}>
                       {sender.name.charAt(0).toUpperCase()}
                     </div>
                     <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                         <span style={{ fontWeight: isRead ? 500 : 700, color: isRead ? '#202124' : '#1f1f1f', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {mailFilter === 'sent' ? `To: ${sender.name}` : sender.name}
                         </span>
                         <span style={{ fontSize: '12px', fontWeight: isRead ? 400 : 700, color: isRead ? '#5f6368' : '#1f1f1f', flexShrink: 0, marginLeft: '8px' }}>
                           {new Date(mail.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                         </span>
                       </div>
                       <span style={{ fontWeight: isRead ? 400 : 600, color: isRead ? '#202124' : '#1f1f1f', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mail.subject}</span>
                       <span style={{ color: '#5f6368', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mail.body}</span>
                     </div>
                   </div>
                 ) : (
                   <div 
                     key={mail.id} 
                     onClick={() => markMailAsRead(mail)}
                     style={{ 
                       display: 'flex', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', 
                       borderBottom: '1px solid #f1f3f4', background: isSelected ? '#c2e7ff' : (isRead ? 'white' : '#f2f6fc'),
                       transition: 'box-shadow 0.2s',
                       height: '40px',
                       position: 'relative'
                     }}
                     onMouseOver={e => {
                       e.currentTarget.style.boxShadow = 'inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)';
                       e.currentTarget.style.zIndex = 2;
                       const actions = e.currentTarget.querySelector('.mail-actions');
                       if(actions) actions.style.opacity = 1;
                     }}
                     onMouseOut={e => {
                       e.currentTarget.style.boxShadow = 'none';
                       e.currentTarget.style.zIndex = 1;
                       const actions = e.currentTarget.querySelector('.mail-actions');
                       if(actions) actions.style.opacity = 0;
                     }}
                   >
                     <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                       <input type="checkbox" checked={isSelected} onChange={(e) => toggleSelection(e, mail.id)} onClick={e => e.stopPropagation()} style={{ cursor: 'pointer', width: '16px', height: '16px' }}/>
                     </div>
                     <div style={{ width: '40px', display: 'flex', justifyContent: 'center', color: isStarred ? '#f4b400' : '#5f6368' }}>
                       <Star size={20} fill={isStarred ? '#f4b400' : 'none'} onClick={(e) => handleStar(e, mail)} style={{ cursor: 'pointer' }} />
                     </div>
                     <div style={{ width: '200px', fontWeight: isRead ? 400 : 700, color: isRead ? '#202124' : '#1f1f1f', fontSize: '15px', paddingRight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                       {mailFilter === 'sent' ? `To: ${sender.name}` : sender.name}
                     </div>
                     <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px', position: 'relative' }}>
                       <span style={{ fontWeight: isRead ? 500 : 700, color: isRead ? '#202124' : '#1f1f1f' }}>{mail.subject}</span>
                       <span style={{ color: '#5f6368', margin: '0 8px' }}>-</span>
                       <span style={{ color: '#5f6368' }}>{mail.body}</span>
                       
                       {/* Hover Actions */}
                       <div className="mail-actions" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: isSelected ? '#c2e7ff' : (isRead ? 'white' : '#f2f6fc'), padding: '0 8px', display: 'flex', gap: '8px', opacity: 0, transition: 'opacity 0.2s', boxShadow: '-10px 0 10px -5px ' + (isSelected ? '#c2e7ff' : (isRead ? 'white' : '#f2f6fc')) }}>
                         <button onClick={(e) => handleDelete(e, mail)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px', borderRadius: '50%' }} title="Delete">
                           <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                         </button>
                       </div>
                     </div>
                     <div style={{ width: '100px', textAlign: 'right', fontSize: '12px', fontWeight: isRead ? 400 : 700, color: isRead ? '#5f6368' : '#1f1f1f' }}>
                       {new Date(mail.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                     </div>
                   </div>
                 );
              })}
              
              {filteredEmails.length > 0 && (
                <div style={{ padding: '16px', borderTop: '1px solid #f1f3f4' }}>
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredEmails.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mailbox;
