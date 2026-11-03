import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useActivity } from '../contexts/ActivityContext';
import { AlertCircle, CheckCircle, Target, ArrowRight, ArrowLeft, Briefcase, Clock, CheckSquare, MessageCircle, History, ChevronRight, X } from 'lucide-react';
import Pagination from './Pagination';
import Linkify from './Linkify';
import { useIsMobile } from '../hooks/useIsMobile';
import '../index.css';

const MyDay = () => {
  const { currentUser } = useAuth();
  const { logActivity } = useActivity();
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyMode, setHistoryMode] = useState(false);
  const [sortBy, setSortBy] = useState('priority');
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  // Mobile-specific state
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileDetailTask, setMobileDetailTask] = useState(null);

  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, 'tasks'), snap => {
      const data = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() }));
      setTasks(data);
    });
    return () => unsubTasks();
  }, []);

  const getTaskDisplayTitle = (task) => {
    if (task.customName) return task.customName;
    if (task.type === 'service_task') return `${task.serviceName} #${task.sequence}`;
    if (task.type === 'workflow_task') return `Workflow: ${task.taskName}`;
    return task.taskName || 'Untitled Task';
  };

  const myTasks = tasks.filter(t => t.assigneeId === currentUser?.uid);

  const previousPendingTasks = useMemo(() => {
    return myTasks.filter(t => {
       if (t.status === 'Done') return false;
       let tDate = '';
       if (t.createdAt) { try { tDate = new Date(t.createdAt).toISOString().split('T')[0]; } catch(e) {} }
       return tDate && tDate < selectedDate;
    });
  }, [myTasks, selectedDate]);

  const todaysTasks = useMemo(() => {
    return myTasks.filter(t => {
       let tDate = '';
       if (t.createdAt) { try { tDate = new Date(t.createdAt).toISOString().split('T')[0]; } catch(e) {} }
       return tDate === selectedDate;
    });
  }, [myTasks, selectedDate]);

  const wizardTasks = useMemo(() => {
    let combined = [];
    if (historyMode) {
      combined = myTasks.filter(t => t.status === 'Done' || t.status === 'pending_edit');
    } else {
      combined = [...previousPendingTasks, ...todaysTasks].filter(t => t.status !== 'Done' && t.status !== 'pending_edit');
    }
    if (searchQuery) {
      combined = combined.filter(t => getTaskDisplayTitle(t).toLowerCase().includes(searchQuery.toLowerCase()));
    }
    combined.sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0, undefined: 0 };
        if (pMap[a.priority] !== pMap[b.priority]) return pMap[b.priority] - pMap[a.priority];
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return combined;
  }, [previousPendingTasks, todaysTasks, sortBy, searchQuery, historyMode]);

  const paginatedQueue = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return wizardTasks.slice(start, start + itemsPerPage);
  }, [wizardTasks, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!activeTaskId && paginatedQueue.length > 0) setActiveTaskId(paginatedQueue[0].id);
  }, [paginatedQueue, activeTaskId]);

  const activeTask = wizardTasks.find(t => t.id === activeTaskId) || null;
  const activeTaskGlobalIndex = wizardTasks.findIndex(t => t.id === activeTaskId);

  useEffect(() => {
    if (activeTask?.submissionNotes) setResponseNotes(activeTask.submissionNotes);
    else setResponseNotes('');
  }, [activeTask?.id]);

  const handleSkip = () => {
    if (activeTaskGlobalIndex < wizardTasks.length - 1) {
      const nextTask = wizardTasks[activeTaskGlobalIndex + 1];
      setActiveTaskId(nextTask.id);
      const nextTaskPage = Math.ceil((activeTaskGlobalIndex + 2) / itemsPerPage);
      if (nextTaskPage !== currentPage) setCurrentPage(nextTaskPage);
    }
  };

  const handlePrevious = () => {
    if (activeTaskGlobalIndex > 0) {
      const prevTask = wizardTasks[activeTaskGlobalIndex - 1];
      setActiveTaskId(prevTask.id);
      const prevTaskPage = Math.ceil(activeTaskGlobalIndex / itemsPerPage);
      if (prevTaskPage !== currentPage) setCurrentPage(prevTaskPage);
    }
  };

  const handleSubmitResponse = async (overrideTask = null) => {
    const isEvent = overrideTask && typeof overrideTask.preventDefault === 'function';
    const targetTask = (!overrideTask || isEvent) ? activeTask : overrideTask;
    if (!targetTask) return;
    await updateDoc(doc(db, 'tasks', targetTask.id), {
      status: 'Done', completedAt: Date.now(),
      submissionNotes: targetTask.id === activeTask?.id ? responseNotes : (targetTask.submissionNotes || '')
    });
    logActivity({ action: 'COMPLETE_DASHBOARD_TASK', module: 'myday', detail: `Completed: ${getTaskDisplayTitle(targetTask)}` });
    if (targetTask.id === activeTask?.id) handleSkip();
    if (isMobile) { setMobileDetailOpen(false); setMobileDetailTask(null); }
  };

  const handleUndo = async () => {
    if (!activeTask) return;
    if (window.confirm('Undo this task?')) {
      await updateDoc(doc(db, 'tasks', activeTask.id), { status: 'pending', completedAt: null, editRequested: false });
      logActivity({ action: 'UNDO_TASK', module: 'myday', detail: `Undid: ${getTaskDisplayTitle(activeTask)}` });
    }
  };

  const completedToday = todaysTasks.filter(t => t.status === 'Done').length;
  const totalToday = todaysTasks.length;
  const progressPercent = totalToday === 0 ? 100 : Math.round((completedToday / totalToday) * 100);

  // ── MOBILE RENDER ───────────────────────────────────────────
  if (isMobile) {
    const pColor = p => p==='High'?'#ef4444':p==='Medium'?'#f59e0b':p==='Low'?'#10b981':'var(--text-secondary)';
    const pBg = p => p==='High'?'rgba(239,68,68,0.1)':p==='Medium'?'rgba(245,158,11,0.1)':'rgba(16,185,129,0.1)';

    const openDetail = (task) => {
      setMobileDetailTask(task);
      setResponseNotes(task.submissionNotes || '');
      setMobileDetailOpen(true);
    };

    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'transparent' }}>

        {/* ── Top Bar ─────────────────── */}
        <div style={{ padding:'0 0 12px 0', display:'flex', flexDirection:'column', gap:'10px' }}>
          {/* Progress banner */}
          <div style={{ background: historyMode ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#0b57d0,#1a73e8)', borderRadius:'18px', padding:'14px 16px', color:'white' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <span style={{ fontSize:'14px', fontWeight:700 }}>{historyMode ? '📋 Work History' : '🎯 Focus Queue'}</span>
              <span style={{ fontSize:'13px', opacity:0.85, fontWeight:600 }}>{wizardTasks.length} tasks</span>
            </div>
            <div style={{ height:'5px', background:'rgba(255,255,255,0.25)', borderRadius:'3px', overflow:'hidden' }}>
              <div style={{ width:`${progressPercent}%`, height:'100%', background:'white', borderRadius:'3px', transition:'width 0.5s' }}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px', fontSize:'11px', opacity:0.8 }}>
              <span>{completedToday} done today</span>
              <span>{progressPercent}% complete</span>
            </div>
          </div>

          {/* Controls row */}
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', scrollbarWidth:'none' }}>
            <input type="text" placeholder="🔍 Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{ flex:1, minWidth:'120px', padding:'9px 12px', borderRadius:'12px', border:'1px solid rgba(0,0,0,0.08)', fontSize:'13px', background:'white', outline:'none' }}/>
            <input type="date" value={selectedDate} onChange={e=>{setSelectedDate(e.target.value);setCurrentPage(1);setActiveTaskId(null);}} disabled={historyMode}
              style={{ padding:'9px 10px', borderRadius:'12px', border:'1px solid rgba(0,0,0,0.08)', fontSize:'13px', background:'white', outline:'none', flexShrink:0 }}/>
            <button onClick={()=>{setHistoryMode(!historyMode);setCurrentPage(1);setActiveTaskId(null);}}
              style={{ padding:'9px 12px', borderRadius:'12px', border:'none', background: historyMode?'#f59e0b':'rgba(0,0,0,0.06)', color: historyMode?'white':'var(--text-primary)', fontWeight:700, fontSize:'12px', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', gap:'4px' }}>
              <History size={14}/> {historyMode?'Queue':'History'}
            </button>
          </div>
        </div>

        {/* ── Task List ───────────────── */}
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:'0', background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
          {wizardTasks.length === 0 ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px', padding:'48px 24px', textAlign:'center' }}>
              <div style={{ width:'64px', height:'64px', borderRadius:'20px', background:'rgba(11,87,208,0.07)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Target size={28} color="#0b57d0"/>
              </div>
              <p style={{ margin:0, fontSize:'16px', fontWeight:700, color:'var(--text-primary)' }}>{historyMode?'No history':'All done! 🎉'}</p>
              <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>{historyMode?'No completed tasks found.':'No pending tasks for this date.'}</p>
            </div>
          ) : wizardTasks.map((task, index) => {
            const isDone = task.status === 'Done';
            const isPendingEdit = task.status === 'pending_edit';
            return (
              <div key={task.id} onClick={()=>openDetail(task)}
                style={{ background:'white', padding:'16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', WebkitTapHighlightColor:'transparent', borderBottom: index < wizardTasks.length - 1 ? '1px solid var(--border-light)' : 'none', opacity: isDone?0.7:1 }}>
                {/* Status dot */}
                <div style={{ width:'12px', height:'12px', borderRadius:'50%', flexShrink:0, background: isDone?'#10b981':isPendingEdit?'#f59e0b':'rgba(11,87,208,0.3)', border: isDone?'none':'2px solid', borderColor: isDone?'transparent':isPendingEdit?'#f59e0b':'#0b57d0' }}/>
                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: isDone?'line-through':'none' }}>
                    {getTaskDisplayTitle(task)}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'4px', flexWrap:'wrap' }}>
                    {task.priority && <span style={{ fontSize:'10px', fontWeight:700, color:pColor(task.priority), background:pBg(task.priority), padding:'2px 7px', borderRadius:'6px' }}>{task.priority}</span>}
                    {isDone && <span style={{ fontSize:'10px', fontWeight:700, color:'#10b981', background:'rgba(16,185,129,0.1)', padding:'2px 7px', borderRadius:'6px' }}>✓ Done</span>}
                    {isPendingEdit && <span style={{ fontSize:'10px', fontWeight:700, color:'#f59e0b', background:'rgba(245,158,11,0.1)', padding:'2px 7px', borderRadius:'6px' }}>Edit Requested</span>}
                  </div>
                </div>
                {/* Quick complete */}
                {!isDone && !isPendingEdit && (
                  <button onClick={e=>{e.stopPropagation();handleSubmitResponse(task);}}
                    style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#10b981', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(16,185,129,0.35)' }}>
                    <CheckCircle size={18} color="white"/>
                  </button>
                )}
                <ChevronRight size={16} color="rgba(0,0,0,0.2)" style={{ flexShrink:0 }}/>
              </div>
            );
          })}
        </div>

        {/* ── Task Detail Bottom Sheet ─ */}
        {mobileDetailOpen && mobileDetailTask && (
          <div onClick={()=>setMobileDetailOpen(false)}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:800, display:'flex', alignItems:'flex-end' }}>
            <div onClick={e=>e.stopPropagation()}
              style={{ width:'100%', maxHeight:'88vh', background:'white', borderRadius:'24px 24px 0 0', overflow:'hidden', display:'flex', flexDirection:'column' }}>
              {/* Sheet handle */}
              <div style={{ width:'36px', height:'4px', background:'rgba(0,0,0,0.12)', borderRadius:'2px', margin:'12px auto 0' }}/>
              {/* Sheet header */}
              <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1, minWidth:0, paddingRight:'12px' }}>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'6px' }}>
                    {mobileDetailTask.priority && <span style={{ fontSize:'11px', fontWeight:700, color:pColor(mobileDetailTask.priority), background:pBg(mobileDetailTask.priority), padding:'3px 8px', borderRadius:'8px' }}>{mobileDetailTask.priority} Priority</span>}
                    <span style={{ fontSize:'11px', fontWeight:700, color: mobileDetailTask.status==='Done'?'#10b981':'#0b57d0', background: mobileDetailTask.status==='Done'?'rgba(16,185,129,0.1)':'rgba(11,87,208,0.08)', padding:'3px 8px', borderRadius:'8px' }}>
                      {mobileDetailTask.status==='Done'?'✓ Completed':'Pending'}
                    </span>
                  </div>
                  <h3 style={{ margin:0, fontSize:'17px', fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.02em', lineHeight:1.3 }}>
                    {getTaskDisplayTitle(mobileDetailTask)}
                  </h3>
                </div>
                <button onClick={()=>setMobileDetailOpen(false)} style={{ background:'rgba(0,0,0,0.06)', border:'none', width:'32px', height:'32px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <X size={16}/>
                </button>
              </div>
              {/* Sheet body */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:'14px' }}>
                {/* Instructions */}
                <div>
                  <p style={{ margin:'0 0 8px 0', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Instructions</p>
                  <div style={{ background:'rgba(0,0,0,0.02)', borderRadius:'14px', padding:'14px', fontSize:'14px', lineHeight:1.6, color:'var(--text-primary)' }}>
                    <Linkify text={mobileDetailTask.description || mobileDetailTask.notes || 'No details provided.'} />
                  </div>
                </div>
                {/* Response notes */}
                {mobileDetailTask.status !== 'Done' && (
                  <div>
                    <p style={{ margin:'0 0 8px 0', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Your Response</p>
                    <textarea value={responseNotes} onChange={e=>setResponseNotes(e.target.value)}
                      placeholder="Type your completion notes here..."
                      style={{ width:'100%', minHeight:'100px', padding:'12px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', resize:'none', background:'white', boxSizing:'border-box', outline:'none', fontFamily:'inherit', lineHeight:1.5 }}/>
                  </div>
                )}
                {mobileDetailTask.submissionNotes && mobileDetailTask.status === 'Done' && (
                  <div>
                    <p style={{ margin:'0 0 8px 0', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Submitted Notes</p>
                    <div style={{ background:'rgba(16,185,129,0.05)', borderRadius:'14px', padding:'14px', fontSize:'14px', lineHeight:1.6, color:'var(--text-primary)', border:'1px solid rgba(16,185,129,0.15)' }}>
                      {mobileDetailTask.submissionNotes}
                    </div>
                  </div>
                )}
              </div>
              {/* Sheet action button */}
              <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(0,0,0,0.06)', paddingBottom:`calc(12px + env(safe-area-inset-bottom))` }}>
                {mobileDetailTask.status !== 'Done' && mobileDetailTask.status !== 'pending_edit' ? (
                  <button onClick={()=>handleSubmitResponse(mobileDetailTask)}
                    style={{ width:'100%', padding:'15px', background:'linear-gradient(135deg,#10b981,#059669)', color:'white', border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:'0 4px 16px rgba(16,185,129,0.35)' }}>
                    <CheckCircle size={18}/> Submit & Mark Done
                  </button>
                ) : (
                  <button onClick={()=>setMobileDetailOpen(false)}
                    style={{ width:'100%', padding:'15px', background:'linear-gradient(135deg,#0b57d0,#1a73e8)', color:'white', border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:700, cursor:'pointer' }}>
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── DESKTOP RENDER (unchanged) ─────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '12px 20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0b57d0, #1a73e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(11,87,208,0.2)' }}>
            <Target size={20} color="white"/>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Focus Mode</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Master-Detail task execution</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
             <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Daily Progress</span>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <div style={{ width: '120px', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                 <div style={{ width: `${progressPercent}%`, height: '100%', background: '#10b981', transition: 'width 0.5s ease' }} />
               </div>
               <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{progressPercent}%</span>
             </div>
          </div>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); setActiveTaskId(null); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none', fontWeight: 600, background: 'rgba(0,0,0,0.02)', fontSize: '13px' }}>
             <option value="priority">Sort: Priority (High to Low)</option>
             <option value="time">Sort: Newest First</option>
          </select>
          <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setCurrentPage(1); setActiveTaskId(null); }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none', fontWeight: 600, background: 'rgba(0,0,0,0.02)', fontSize: '13px' }} disabled={historyMode} />
          
          <button 
            onClick={() => { setHistoryMode(!historyMode); setCurrentPage(1); setActiveTaskId(null); }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none', fontWeight: 600, background: historyMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(0,0,0,0.02)', color: historyMode ? 'white' : 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <History size={14} /> {historyMode ? 'Back to Queue' : 'Work History'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
        
        {/* Left Sidebar: Paginated Queue */}
        <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', borderRadius: '16px', background: 'white', flexShrink: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--glass-border)' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <CheckSquare size={16} /> Fast Task Queue ({wizardTasks.length})
            </h3>
            <input 
              type="text" 
              placeholder="🔍 Search tasks..." 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none', background: 'rgba(0,0,0,0.03)', fontSize: '13px', fontWeight: 600 }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' }}>
            {paginatedQueue.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No tasks for this date.</div>
            ) : (
              paginatedQueue.map((task, index) => {
                const isActive = task.id === activeTaskId;
                const isDone = task.status === 'Done';
                const isPendingEdit = task.status === 'pending_edit';
                const hasDetails = !!(task.description || task.notes);
                
                let priorityColor = 'var(--text-secondary)';
                if(task.priority === 'High') priorityColor = '#ef4444';
                if(task.priority === 'Medium') priorityColor = '#f59e0b';
                if(task.priority === 'Low') priorityColor = '#10b981';
                
                const seqNumber = index + 1 + (currentPage - 1) * itemsPerPage;

                return (
                  <div 
                    key={task.id} 
                    onClick={() => setActiveTaskId(task.id)}
                    style={{ 
                      padding: '6px 8px', 
                      borderRadius: '6px', 
                      background: isActive ? 'linear-gradient(135deg, #0b57d0, #1a73e8)' : isDone ? 'rgba(16,185,129,0.05)' : 'white',
                      border: `1px solid ${isActive ? 'transparent' : isDone ? 'rgba(16,185,129,0.2)' : 'var(--glass-border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.1s',
                      boxShadow: isActive ? '0 2px 4px rgba(11,87,208,0.2)' : 'none',
                      color: isActive ? 'white' : 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, opacity: isActive ? 0.9 : 0.5, minWidth: '16px' }}>#{seqNumber}</span>
                      {isDone ? (
                        <CheckCircle size={14} color={isActive ? 'white' : '#10b981'} style={{ flexShrink: 0 }} />
                      ) : isPendingEdit ? (
                        <AlertCircle size={14} color={isActive ? 'white' : '#f59e0b'} style={{ flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: `2px solid ${isActive ? 'white' : 'var(--color-ocean-blue)'}`, flexShrink: 0 }} />
                      )}
                      <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone && !isActive ? 0.6 : 1 }}>
                        {getTaskDisplayTitle(task)}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, paddingLeft: '8px' }}>
                      {hasDetails && (
                        <Briefcase size={12} color={isActive ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'} title="Has Instructions" />
                      )}
                      {task.priority && (
                         <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: isActive ? 'rgba(255,255,255,0.2)' : `${priorityColor}15`, color: isActive ? 'white' : priorityColor }}>
                           {task.priority.charAt(0)}
                         </span>
                      )}
                      {!isDone && !isPendingEdit && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSubmitResponse(task); }}
                          title="Quick Complete"
                          style={{ background: isActive ? 'white' : '#10b981', color: isActive ? 'var(--color-ocean-blue)' : 'white', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <CheckCircle size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {wizardTasks.length > itemsPerPage && (
            <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={wizardTasks.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={() => {}}
              />
            </div>
          )}
        </div>

        {/* Right Area: Active Task Details */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '16px', background: 'white', overflow: 'hidden' }}>
          {!activeTask ? (
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
               <Target size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
               <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>No Task Selected</h2>
               <p style={{ margin: '6px 0 0 0', fontSize: '13px' }}>Select a task from the queue to begin.</p>
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Task Header info */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(0,0,0,0.01)', flexShrink: 0 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ padding: '4px 8px', background: activeTask.status === 'Done' ? 'rgba(16,185,129,0.1)' : activeTask.status === 'pending_edit' ? 'rgba(245,158,11,0.1)' : 'rgba(11,87,208,0.1)', color: activeTask.status === 'Done' ? '#10b981' : activeTask.status === 'pending_edit' ? '#f59e0b' : 'var(--color-ocean-blue)', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {activeTask.status === 'Done' ? <CheckCircle size={12}/> : activeTask.status === 'pending_edit' ? <AlertCircle size={12}/> : <Clock size={12}/>}
                      {activeTask.status === 'Done' ? 'Completed' : activeTask.status === 'pending_edit' ? 'Edit Pending' : 'Pending Action'}
                    </span>
                    <span style={{ fontSize: '11px', color: activeTask.priority === 'High' ? '#ef4444' : activeTask.priority === 'Medium' ? '#f59e0b' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, background: activeTask.priority === 'High' ? 'rgba(239,68,68,0.1)' : activeTask.priority === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                      <AlertCircle size={12}/> Priority: {activeTask.priority || 'Medium'}
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                    {getTaskDisplayTitle(activeTask)}
                  </h2>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  Task {activeTaskGlobalIndex + 1} of {wizardTasks.length}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={16}/> Instructions & Details
                  </h4>
                  <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    <Linkify text={activeTask.description || activeTask.notes || 'No detailed instructions provided for this task.'} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageCircle size={16} /> Your Response / Work Submission
                  </h4>
                  <textarea 
                    value={responseNotes}
                    onChange={e => setResponseNotes(e.target.value)}
                    placeholder="Type your notes, paste links, or provide a completion summary here..."
                    style={{ flex: 1, minHeight: '120px', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', outline: 'none', fontSize: '14px', resize: 'vertical', background: 'white', fontFamily: 'inherit', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                    disabled={activeTask.status === 'Done'}
                  />
                </div>

              </div>

              {/* Fixed Footer Controls */}
              <div style={{ padding: '12px 20px', background: 'white', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                
                <button 
                  onClick={handlePrevious} 
                  disabled={activeTaskGlobalIndex === 0}
                  style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--glass-border)', borderRadius: '10px', cursor: activeTaskGlobalIndex === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: activeTaskGlobalIndex === 0 ? 0.5 : 1, transition: 'all 0.2s', color: 'var(--text-primary)' }}
                >
                  <ArrowLeft size={14}/> Previous
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {activeTask.status !== 'Done' && (
                    <button 
                      onClick={handleSkip}
                      style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      Skip
                    </button>
                  )}

                  {activeTask.status === 'Done' && (
                    <button 
                      onClick={handleUndo}
                      style={{ padding: '8px 16px', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <History size={16}/> Undo Completion
                    </button>
                  )}

                  {activeTask.status !== 'Done' && activeTask.status !== 'pending_edit' ? (
                    <button 
                      onClick={() => handleSubmitResponse()}
                      style={{ padding: '8px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'none'}
                    >
                      <CheckCircle size={16}/> Submit & Mark Done
                    </button>
                  ) : (
                    <button 
                      onClick={handleSkip}
                      style={{ padding: '8px 24px', background: 'linear-gradient(135deg, #0b57d0, #1a73e8)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(11,87,208,0.3)' }}
                    >
                      Next Task <ArrowRight size={16}/>
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDay;
