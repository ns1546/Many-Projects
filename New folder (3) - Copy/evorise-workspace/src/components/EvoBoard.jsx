import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, writeBatch, addDoc, query } from 'firebase/firestore';
import { CheckSquare, Clock, AlertCircle, CheckCircle, Users as UsersIcon, Filter, Search, Edit, ListTodo, Plus, X, Calendar, LayoutGrid, List, Briefcase, ArrowUp, ArrowDown, Send, Bell, Link2, Trash2, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useActivity } from '../contexts/ActivityContext';
import { useIsMobile } from '../hooks/useIsMobile';
import Pagination from './Pagination';
import SideDrawer from './SideDrawer';
import '../index.css';

const EvoBoard = () => {
  const { currentUser, userData } = useAuth();
  const isAdmin = userData?.role === 'Admin' || userData?.role === 'Partner' || userData?.role === 'Administrator';
  const isMobile = useIsMobile();
  const { sendNotification } = useNotifications();
  const { logActivity } = useActivity();
  const [tasks, setTasks] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  
  const [activeEngineTab, setActiveEngineTab] = useState('Tasks'); // Tasks, Team Status, Client Services
  const [activeStatusTab, setActiveStatusTab] = useState('Unassigned'); // Total, Unassigned, Assigned, Done, Missed
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeEngineTab, activeStatusTab]);
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  // Multi-Select
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  
  // Inline Editing
  const [editingField, setEditingField] = useState({ id: null, field: null, value: '' });

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [taskChecklistForm, setTaskChecklistForm] = useState('');
  
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ taskName: '', assigneeId: '', priority: '', dueDate: '', clientId: '' });

  // Bulk Assign State
  const [bulkAssignUser, setBulkAssignUser] = useState('');
  const [bulkAssignPriority, setBulkAssignPriority] = useState('');
  const [bulkAssignDueDate, setBulkAssignDueDate] = useState('');
  const [bulkAssignStatus, setBulkAssignStatus] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Mobile-specific state (must be at top level — React Rules of Hooks)
  const [mobileDetail, setMobileDetail] = useState(null);
  const [mobileNotes, setMobileNotes] = useState('');
  const [mobileLink, setMobileLink] = useState('');
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false);

  // FAB listener for mobile create task
  useEffect(() => {
    const handler = () => setMobileCreateOpen(true);
    window.addEventListener('mobile-fab-evoboard', handler);
    return () => window.removeEventListener('mobile-fab-evoboard', handler);
  }, []);

  // Fetch Data
  useEffect(() => {
    let unsubscribers = [];
    const taskMap = new Map();
    const serviceMap = new Map();

    const updateTasks = () => setTasks(Array.from(taskMap.values()));
    const updateServices = () => setAllServices(Array.from(serviceMap.values()));

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
      const data = [];
      const batch = writeBatch(db);
      let needsBatchCommit = false;
      const today = new Date().toISOString().split('T')[0];

      snap.forEach(docSnap => {
        const t = { id: docSnap.id, ...docSnap.data() };
        
        // Auto-Missed Logic
        if (t.dueDate && t.status !== 'Done' && t.status !== 'Late Submit' && t.status !== 'Missed') {
          if (today > t.dueDate) {
            t.status = 'Missed';
            const taskRef = doc(db, 'tasks', docSnap.id);
            batch.update(taskRef, { status: 'Missed' });
            needsBatchCommit = true;
          }
        }
        data.push(t);
      });
      
      if (needsBatchCommit) {
        batch.commit().catch(e => console.error("Error auto-updating missed tasks", e));
      }
      setTasks(data);
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });

    const unsubClients = onSnapshot(query(collection(db, 'clients')), (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setClients(data);

      unsubscribers.forEach(unsub => unsub());
      unsubscribers = [];
      serviceMap.clear();

      data.forEach(client => {
        const unsubService = onSnapshot(collection(db, `clients/${client.id}/services`), (snap) => {
          snap.docChanges().forEach(change => {
            if (change.type === 'removed') serviceMap.delete(change.doc.id);
            else serviceMap.set(change.doc.id, { id: change.doc.id, clientId: client.id, ...change.doc.data() });
          });
          updateServices();
        });
        unsubscribers.push(unsubService);
      });
    });

    return () => {
      unsubTasks();
      unsubUsers();
      unsubClients();
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Listen for open-task events (e.g. from notifications)
  useEffect(() => {
    const handleOpenTask = (e) => {
      const taskId = e.detail?.taskId;
      if (taskId) {
        // We need to wait slightly if tasks are still loading, but tasks state might be fresh enough.
        // The event could fire right after navigate('evoboard'). 
        // Best approach: If tasks is empty, this might miss. But usually tasks are loaded.
        setTimeout(() => {
          setTasks(currentTasks => {
            const task = currentTasks.find(t => t.id === taskId);
            if (task) {
              setActiveTask(task);
              setIsTaskModalOpen(true);
            }
            return currentTasks;
          });
        }, 100);
      }
    };
    window.addEventListener('open-task', handleOpenTask);
    return () => window.removeEventListener('open-task', handleOpenTask);
  }, []);

  // Filter & Sort Logic
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter(task => {
      // Status Tab Match
      let statusMatch = true;
      if (activeStatusTab !== 'Total') {
        if (activeStatusTab === 'Done' && task.status !== 'Done') statusMatch = false;
        if (activeStatusTab === 'Unassigned' && (task.assigneeId || task.status === 'Done')) statusMatch = false;
        if (activeStatusTab === 'Assigned' && (!task.assigneeId || task.status === 'Done' || task.status === 'Missed' || task.status === 'Late Submit')) statusMatch = false;
        if (activeStatusTab === 'Missed' && task.status !== 'Missed' && task.status !== 'Late Submit') statusMatch = false;
      }
      
      // Dropdown Filters
      const clientMatch = filterClient ? task.clientId === filterClient : true;
      const userMatch = filterUser ? task.assigneeId === filterUser : true;
      const priorityMatch = filterPriority ? task.priority === filterPriority : true;
      
      // Search
      const searchMatch = searchQuery 
        ? (task.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           task.customName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      
      return statusMatch && clientMatch && userMatch && priorityMatch && searchMatch;
    });

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'priority') {
        const pMap = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0, undefined: 0 };
        aVal = pMap[aVal]; bVal = pMap[bVal];
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, activeStatusTab, filterClient, filterUser, filterPriority, searchQuery, sortConfig]);

  const tabCounts = useMemo(() => {
    let baseTasks = tasks.filter(task => {
      const clientMatch = filterClient ? task.clientId === filterClient : true;
      const userMatch = filterUser ? task.assigneeId === filterUser : true;
      const priorityMatch = filterPriority ? task.priority === filterPriority : true;
      const searchMatch = searchQuery 
        ? (task.taskName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           task.customName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           task.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return clientMatch && userMatch && priorityMatch && searchMatch;
    });

    const counts = { Total: baseTasks.length, Unassigned: 0, Assigned: 0, Done: 0, Missed: 0 };

    baseTasks.forEach(task => {
      if (task.status === 'Done') counts.Done++;
      if (task.status === 'Missed' || task.status === 'Late Submit') counts.Missed++;
      if (!task.assigneeId && task.status !== 'Done') counts.Unassigned++;
      if (task.assigneeId && task.status !== 'Done' && task.status !== 'Missed' && task.status !== 'Late Submit') counts.Assigned++;
    });

    return counts;
  }, [tasks, filterClient, filterUser, filterPriority, searchQuery]);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTasks.slice(start, start + itemsPerPage);
  }, [filteredAndSortedTasks, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    setLastSelectedIndex(null);
  }, [activeStatusTab, filterClient, filterUser, filterPriority, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getClientName = (task) => {
    const c = clients.find(cl => cl.id === task.clientId);
    return c ? c.name : 'Internal / No Client';
  };

  const getTaskDisplayTitle = (task) => {
    if (task.customName) return task.customName;
    if (task.type === 'service_task') return `${task.serviceName} #${task.sequence}`;
    if (task.type === 'workflow_task') return `Workflow: ${task.taskName}`;
    return task.taskName || 'Untitled Task';
  };

  const getStatusColor = (status) => {
    if (status === 'To Do') return '#94a3b8';
    if (status === 'Pending') return '#f59e0b';
    if (status === 'In Progress') return '#3b82f6';
    if (status === 'Done') return '#10b981';
    if (status === 'Missed' || status === 'Late Submit') return '#ef4444';
    return '#94a3b8';
  };

  const getAssignee = (task) => {
    return users.find(u => u.id === task.assigneeId);
  };

  // Create Standalone Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        type: 'standalone',
        clientId: newTaskForm.clientId || null,
        taskName: newTaskForm.taskName,
        assigneeId: newTaskForm.assigneeId || null,
        priority: newTaskForm.priority,
        dueDate: newTaskForm.dueDate,
        status: newTaskForm.assigneeId ? 'Pending' : 'To Do',
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'tasks'), payload);
      
      if (newTaskForm.assigneeId) {
        sendNotification({
          title: 'New Task Assigned',
          body: `You have been assigned to: ${newTaskForm.taskName}`,
          module: 'evoboard',
          targetUid: newTaskForm.assigneeId,
          type: 'info'
        });
      }
      
      logActivity({
        action: 'CREATE_TASK',
        module: 'evoboard',
        detail: `Created new task: ${newTaskForm.taskName}`,
      });
      
      setIsCreateTaskModalOpen(false);
      setNewTaskForm({ taskName: '', assigneeId: '', priority: '', dueDate: '', clientId: '' });
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedTaskIds.length === filteredAndSortedTasks.length) setSelectedTaskIds([]);
    else setSelectedTaskIds(filteredAndSortedTasks.map(t => t.id));
  };

  const toggleSelect = (id, idx, event) => {
    if (event && event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, idx);
      const end = Math.max(lastSelectedIndex, idx);
      const rangeIds = paginatedTasks.slice(start, end + 1).map(t => t.id);
      
      // Determine if we are selecting or deselecting based on the target item's new state
      const isSelecting = !selectedTaskIds.includes(id);
      
      let newSelections = [...selectedTaskIds];
      if (isSelecting) {
        // Add all in range
        newSelections = Array.from(new Set([...newSelections, ...rangeIds]));
      } else {
        // Remove all in range
        newSelections = newSelections.filter(taskId => !rangeIds.includes(taskId));
      }
      setSelectedTaskIds(newSelections);
    } else {
      if (selectedTaskIds.includes(id)) setSelectedTaskIds(selectedTaskIds.filter(taskId => taskId !== id));
      else setSelectedTaskIds([...selectedTaskIds, id]);
    }
    setLastSelectedIndex(idx);
  };

  const handleBulkAssign = async () => {
    if (selectedTaskIds.length === 0) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      selectedTaskIds.forEach(id => {
        const task = tasks.find(t => t.id === id);
        if (task) {
          const taskRef = doc(db, 'tasks', task.id);
          const updates = {};
          if (bulkAssignUser) {
             updates.assigneeId = bulkAssignUser === 'UNASSIGN' ? null : bulkAssignUser;
          }
          if (bulkAssignPriority) updates.priority = bulkAssignPriority;
          if (bulkAssignDueDate) updates.dueDate = bulkAssignDueDate;
          if (bulkAssignStatus) updates.status = bulkAssignStatus;
          
          if (updates.assigneeId && updates.assigneeId !== null && task.status === 'To Do' && !bulkAssignStatus) {
             updates.status = 'Pending';
          } else if (bulkAssignUser === 'UNASSIGN' && !bulkAssignStatus) {
             updates.status = 'To Do';
          }
          batch.update(taskRef, updates);
        }
      });
      await batch.commit();
      
      if (bulkAssignUser) {
        sendNotification({
          title: 'Bulk Tasks Assigned',
          body: `You have been assigned ${selectedTaskIds.length} tasks.`,
          module: 'evoboard',
          targetUid: bulkAssignUser,
          type: 'info'
        });
      }
      
      logActivity({
        action: 'BULK_UPDATE_TASKS',
        module: 'evoboard',
        detail: `Bulk updated ${selectedTaskIds.length} tasks (Assignee: ${bulkAssignUser || 'unchanged'}, Priority: ${bulkAssignPriority || 'unchanged'})`,
      });
      
      setSelectedTaskIds([]); 
      setBulkAssignUser(''); setBulkAssignPriority(''); setBulkAssignDueDate('');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedTaskIds.length} tasks?`)) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      selectedTaskIds.forEach(id => {
        batch.delete(doc(db, 'tasks', id));
      });
      await batch.commit();
      
      logActivity({
        action: 'BULK_DELETE_TASKS',
        module: 'evoboard',
        detail: `Bulk deleted ${selectedTaskIds.length} tasks`,
      });
      
      setSelectedTaskIds([]); 
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Single Task Updates
  const updateTaskStatus = async (task, newStatus) => {
    let finalStatus = newStatus;
    if (newStatus === 'Done' && task.dueDate) {
      const today = new Date().toISOString().split('T')[0];
      if (today > task.dueDate) {
        finalStatus = 'Late Submit';
      }
    }
    await updateDoc(doc(db, 'tasks', task.id), { status: finalStatus });
    
    logActivity({
      action: 'UPDATE_TASK_STATUS',
      module: 'evoboard',
      detail: `Changed status of task "${getTaskDisplayTitle(task)}" to ${finalStatus}`,
      targetId: task.id
    });
    
    if (activeTask && activeTask.id === task.id) setActiveTask({...activeTask, status: finalStatus});
  };

  const handleInlineReassign = async (task, newAssigneeId) => {
    if (task.assigneeId && task.assigneeId !== newAssigneeId && newAssigneeId) {
      const currentAssignee = users.find(u => u.id === task.assigneeId);
      const newAssignee = users.find(u => u.id === newAssigneeId);
      const confirmReassign = window.confirm(`This task is already assigned to ${currentAssignee?.name || 'someone'}.\nDo you want to re-assign it to ${newAssignee?.name}?`);
      if (!confirmReassign) return;
    }

    const updates = { assigneeId: newAssigneeId };
    if (newAssigneeId && task.status === 'To Do') updates.status = 'Pending';
    if (!newAssigneeId && task.status === 'Pending') updates.status = 'To Do';
    
    await updateDoc(doc(db, 'tasks', task.id), updates);
    if (newAssigneeId) {
      sendNotification({
        title: 'Task Re-assigned',
        body: `You are now assigned to: ${getTaskDisplayTitle(task)}`,
        module: 'evoboard',
        targetUid: newAssigneeId,
        type: 'info'
      });
    }
    
    logActivity({
      action: 'REASSIGN_TASK',
      module: 'evoboard',
      detail: `Re-assigned task "${getTaskDisplayTitle(task)}"`,
      targetId: task.id
    });
    
    if (activeTask && activeTask.id === task.id) setActiveTask({...activeTask, ...updates});
  };

  const handleInlineSave = async () => {
    if (!editingField.id || !editingField.field) return;
    
    const task = tasks.find(t => t.id === editingField.id);
    if (task && task[editingField.field] !== editingField.value) {
      let updateObj = {};
      if (editingField.field === 'title') {
         if (task.type === 'standalone') updateObj = { taskName: editingField.value };
         else updateObj = { customName: editingField.value };
      } else {
         updateObj = { [editingField.field]: editingField.value };
      }
      
      try {
        await updateDoc(doc(db, 'tasks', editingField.id), updateObj);
        logActivity({
          action: 'INLINE_EDIT_TASK',
          module: 'evoboard',
          detail: `Inline edited ${editingField.field} for task ${task.taskName || task.id}`
        });
      } catch (err) {
        console.error("Failed inline edit", err);
      }
    }
    setEditingField({ id: null, field: null, value: '' });
  };

  const handleInlineKeyDown = (e) => {
    if (e.key === 'Enter') handleInlineSave();
    if (e.key === 'Escape') setEditingField({ id: null, field: null, value: '' });
  };

  const handleSubmitWork = async () => {
    if (!activeTask) return;
    let newStatus = 'Done';
    if (activeTask.dueDate) {
      const today = new Date().toISOString().split('T')[0];
      if (today > activeTask.dueDate) {
        newStatus = 'Late Submit';
      }
    }
    
    await updateDoc(doc(db, 'tasks', activeTask.id), { 
      status: newStatus,
      assigneeNotes: activeTask.assigneeNotes || '',
      assigneeLink: activeTask.assigneeLink || '',
      submittedAt: Date.now()
    });
    
    sendNotification({
      title: 'Task Submitted',
      body: `${userData?.name || 'A user'} completed: ${getTaskDisplayTitle(activeTask)}`,
      module: 'evoboard',
      targetUid: 'all', 
      type: newStatus === 'Late Submit' ? 'warning' : 'success'
    });
    
    logActivity({
      action: 'SUBMIT_TASK',
      module: 'evoboard',
      detail: `Submitted final work for task "${getTaskDisplayTitle(activeTask)}" (${newStatus})`,
      targetId: activeTask.id
    });
    
    setActiveTask({...activeTask, status: newStatus});
  };

  const sendReminder = (task) => {
    if (!task || !task.assigneeId) return;
    sendNotification({
      title: 'Task Reminder',
      body: `Please update task: ${getTaskDisplayTitle(task)}.`,
      module: 'evoboard',
      targetUid: task.assigneeId,
      type: 'reminder',
      actionUrl: task.id,
      reminderFor: task.id
    });
    // Visual feedback handled by global toast, but can keep alert or remove it
  };

  // ── MOBILE RENDER ───────────────────────────────────────────
  if (isMobile) {
    const openDetail = (task) => {
      setMobileDetail(task);
      setMobileNotes(task.assigneeNotes || '');
      setMobileLink(task.assigneeLink || '');
    };

    const handleMobileSubmit = async () => {
      if (!mobileDetail) return;
      let newStatus = 'Done';
      if (mobileDetail.dueDate) {
        const today = new Date().toISOString().split('T')[0];
        if (today > mobileDetail.dueDate) newStatus = 'Late Submit';
      }
      await updateDoc(doc(db, 'tasks', mobileDetail.id), {
        status: newStatus, assigneeNotes: mobileNotes, assigneeLink: mobileLink, submittedAt: Date.now()
      });
      logActivity({ action: 'SUBMIT_TASK', module: 'evoboard', detail: `Submitted: ${getTaskDisplayTitle(mobileDetail)}` });
      setMobileDetail(null);
    };

    const tabs = [
      { key:'Unassigned', label:'Unassigned', color:'#94a3b8', count: tabCounts.Unassigned },
      { key:'Assigned', label:'In Progress', color:'#3b82f6', count: tabCounts.Assigned },
      { key:'Done', label:'Done', color:'#10b981', count: tabCounts.Done },
      { key:'Missed', label:'Missed', color:'#ef4444', count: tabCounts.Missed },
      { key:'Total', label:'All', color:'#0b57d0', count: tabCounts.Total },
    ];
    const pColor = s => s==='Done'?'#10b981':s==='Missed'||s==='Late Submit'?'#ef4444':s==='In Progress'?'#3b82f6':'#f59e0b';
    const pBadgeBg = p => p==='High'?'rgba(239,68,68,0.1)':p==='Medium'?'rgba(245,158,11,0.1)':'rgba(16,185,129,0.1)';
    const pBadgeColor = p => p==='High'?'#ef4444':p==='Medium'?'#f59e0b':'#10b981';

    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', padding: '16px' }}>

        {/* ── Native iOS Search Bar ──────── */}
        <div style={{ display:'flex', marginBottom:'16px' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', background:'#E3E3E8', borderRadius:'10px', padding:'7px 12px', gap:'8px' }}>
            <Search size={16} color="#8E8E93"/>
            <input type="text" placeholder="Search tasks" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{ border:'none', background:'transparent', outline:'none', fontSize:'17px', flex:1, color: '#000000', padding: 0 }}/>
          </div>
        </div>

        {/* ── Status Native Segmented Control ─────────── */}
        <div style={{ display:'flex', overflowX:'auto', gap:'8px', paddingBottom:'16px', scrollbarWidth:'none', msOverflowStyle:'none' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={()=>{ setActiveStatusTab(t.key); setCurrentPage(1); }}
              style={{ flexShrink:0, padding:'8px 16px', borderRadius:'16px', border:'none', cursor:'pointer', fontWeight:600, fontSize:'14px', transition:'all 0.15s',
                background: activeStatusTab===t.key ? t.color : '#FFFFFF',
                color: activeStatusTab===t.key ? 'white' : '#000000',
                boxShadow: activeStatusTab===t.key ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
              }}>
              {t.label} {t.count > 0 && <span style={{ opacity:0.8 }}>({t.count})</span>}
            </button>
          ))}
        </div>

        {/* ── Native Inset Grouped Task List ───────────────── */}
        <div style={{ flex:1, overflowY:'auto', paddingBottom: '16px' }}>
          <div style={{ background:'#FFFFFF', borderRadius:'12px', overflow:'hidden' }}>
            {paginatedTasks.length === 0 ? (
              <div style={{ padding:'32px 16px', textAlign:'center' }}>
                <p style={{ margin:0, fontSize:'17px', fontWeight:400, color:'#8E8E93' }}>No tasks found</p>
              </div>
            ) : paginatedTasks.map((task, index) => {
              const assignee = getAssignee(task);
              const title = getTaskDisplayTitle(task);
              const isDone = task.status==='Done';
              const isMissed = task.status==='Missed' || task.status==='Late Submit';
              
              return (
                <div key={task.id} onClick={()=>openDetail(task)}
                  style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', borderBottom: index < paginatedTasks.length - 1 ? '0.5px solid #C6C6C8' : 'none' }}>
                  
                  {/* Status Indicator (iOS checkmark style) */}
                  <div style={{ width: '22px', height: '22px', borderRadius: '11px', border: `1.5px solid ${isDone ? '#34C759' : isMissed ? '#FF3B30' : '#C7C7CC'}`, background: isDone ? '#34C759' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isDone && <CheckSquare size={14} color="white" />}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'17px', fontWeight:400, color: isDone ? '#8E8E93' : '#000000', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: isDone?'line-through':'none' }}>
                      {title}
                    </div>
                    {(task.priority || assignee || task.dueDate) && (
                      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center', marginTop:'4px' }}>
                        {task.priority && task.status !== 'Done' && <span style={{ fontSize:'13px', color: pBadgeColor(task.priority) }}>{task.priority}</span>}
                        {assignee && <span style={{ fontSize:'13px', color: '#8E8E93' }}>· {assignee.name.split(' ')[0]}</span>}
                        {task.dueDate && task.status !== 'Done' && <span style={{ fontSize:'13px', color: '#8E8E93' }}>· {task.dueDate}</span>}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} color="#C7C7CC" style={{ flexShrink:0 }}/>
                </div>
              );
            })}
          </div>
          
          {/* Pagination dots */}
          {filteredAndSortedTasks.length > itemsPerPage && (
            <div style={{ display:'flex', justifyContent:'center', gap:'8px', padding:'16px 0' }}>
              {Array.from({length: Math.ceil(filteredAndSortedTasks.length/itemsPerPage)}, (_,i) => (
                <button key={i} onClick={()=>setCurrentPage(i+1)}
                  style={{ width: currentPage===i+1?24:8, height:'8px', borderRadius:'4px', border:'none', cursor:'pointer', background: currentPage===i+1?'#007AFF':'rgba(0,0,0,0.12)', transition:'all 0.2s' }}/>
              )).slice(0,10)}
            </div>
          )}
        </div>

        {/* ── Task Detail Bottom Sheet ─ */}
        {mobileDetail && (
          <div className="mobile-bottom-sheet-overlay" onClick={()=>setMobileDetail(null)} style={{ zIndex:800 }}>
            <div className="mobile-bottom-sheet" onClick={e=>e.stopPropagation()}>
              <div style={{ width:'36px', height:'4px', background:'rgba(0,0,0,0.12)', borderRadius:'2px', margin:'12px auto 0' }}/>
              {/* Header */}
              <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1, minWidth:0, paddingRight:'12px' }}>
                  <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'7px' }}>
                    {mobileDetail.priority && <span style={{ fontSize:'11px', fontWeight:700, color:pBadgeColor(mobileDetail.priority), background:pBadgeBg(mobileDetail.priority), padding:'3px 8px', borderRadius:'8px' }}>{mobileDetail.priority}</span>}
                    <span style={{ fontSize:'11px', fontWeight:700, color:getStatusColor(mobileDetail.status), background:`${getStatusColor(mobileDetail.status)}15`, padding:'3px 8px', borderRadius:'8px' }}>{mobileDetail.status||'To Do'}</span>
                  </div>
                  <h3 style={{ margin:0, fontSize:'16px', fontWeight:800, color:'var(--text-primary)', lineHeight:1.3 }}>{getTaskDisplayTitle(mobileDetail)}</h3>
                  {mobileDetail.dueDate && <p style={{ margin:'5px 0 0', fontSize:'12px', color:'var(--text-secondary)', fontWeight:600 }}>Due: {mobileDetail.dueDate}</p>}
                </div>
                <button onClick={()=>setMobileDetail(null)} style={{ background:'rgba(0,0,0,0.06)', border:'none', width:'32px', height:'32px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <X size={16}/>
                </button>
              </div>
              {/* Body */}
              <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:'14px' }}>
                {/* Description */}
                {mobileDetail.description && (
                  <div>
                    <p style={{ margin:'0 0 6px', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Instructions</p>
                    <div style={{ background:'rgba(0,0,0,0.02)', borderRadius:'14px', padding:'14px', fontSize:'14px', lineHeight:1.6, color:'var(--text-primary)' }}>
                      {mobileDetail.description}
                    </div>
                  </div>
                )}
                {/* Notes input */}
                {mobileDetail.status !== 'Done' && mobileDetail.status !== 'Missed' && (
                  <>
                    <div>
                      <p style={{ margin:'0 0 6px', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Completion Notes</p>
                      <textarea value={mobileNotes} onChange={e=>setMobileNotes(e.target.value)} placeholder="Add notes about your work..."
                        style={{ width:'100%', minHeight:'90px', padding:'12px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', resize:'none', background:'white', boxSizing:'border-box', outline:'none', fontFamily:'inherit', lineHeight:1.5 }}/>
                    </div>
                    <div>
                      <p style={{ margin:'0 0 6px', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Work Link (optional)</p>
                      <input value={mobileLink} onChange={e=>setMobileLink(e.target.value)} placeholder="https://..." type="url"
                        style={{ width:'100%', padding:'12px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', boxSizing:'border-box', outline:'none' }}/>
                    </div>
                  </>
                )}
                {/* Admin assign */}
                {isAdmin && mobileDetail.status !== 'Done' && (
                  <div>
                    <p style={{ margin:'0 0 6px', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Assign To</p>
                    <select onChange={async e => {
                      if (!e.target.value) return;
                      await updateDoc(doc(db, 'tasks', mobileDetail.id), { assigneeId: e.target.value, status:'Pending' });
                      setMobileDetail(null);
                    }} defaultValue="" style={{ width:'100%', padding:'12px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', background:'white', outline:'none' }}>
                      <option value="">Select team member...</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {/* Action button */}
              <div style={{ padding:'12px 20px', borderTop:'1px solid rgba(0,0,0,0.06)', paddingBottom:'calc(12px + env(safe-area-inset-bottom))' }}>
                {mobileDetail.status !== 'Done' && mobileDetail.status !== 'Missed' && mobileDetail.assigneeId === currentUser?.uid ? (
                  <button onClick={handleMobileSubmit}
                    style={{ width:'100%', padding:'15px', background:'linear-gradient(135deg,#10b981,#059669)', color:'white', border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                    <CheckCircle size={18}/> Submit Task
                  </button>
                ) : (
                  <button onClick={()=>setMobileDetail(null)}
                    style={{ width:'100%', padding:'15px', background:'rgba(0,0,0,0.06)', color:'var(--text-primary)', border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:700, cursor:'pointer' }}>
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Create Task Bottom Sheet (admin) ─ */}
        {isAdmin && mobileCreateOpen && (
          <div onClick={()=>setMobileCreateOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:800, display:'flex', alignItems:'flex-end' }}>
            <div onClick={e=>e.stopPropagation()} style={{ width:'100%', background:'white', borderRadius:'24px 24px 0 0', overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ width:'36px', height:'4px', background:'rgba(0,0,0,0.12)', borderRadius:'2px', margin:'12px auto 0' }}/>
              <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid rgba(0,0,0,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ margin:0, fontSize:'17px', fontWeight:800, color:'var(--text-primary)' }}>New Task</h3>
                <button onClick={()=>setMobileCreateOpen(false)} style={{ background:'rgba(0,0,0,0.06)', border:'none', width:'32px', height:'32px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={16}/></button>
              </div>
              <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:'12px', paddingBottom:'calc(16px + env(safe-area-inset-bottom))' }}>
                <input placeholder="Task name *" value={newTaskForm.taskName} onChange={e=>setNewTaskForm({...newTaskForm, taskName:e.target.value})}
                  style={{ width:'100%', padding:'13px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'15px', boxSizing:'border-box', outline:'none', fontFamily:'inherit' }}/>
                <select value={newTaskForm.assigneeId} onChange={e=>setNewTaskForm({...newTaskForm, assigneeId:e.target.value})}
                  style={{ width:'100%', padding:'13px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', background:'white', outline:'none' }}>
                  <option value="">Assign to...</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  <select value={newTaskForm.priority} onChange={e=>setNewTaskForm({...newTaskForm, priority:e.target.value})}
                    style={{ padding:'13px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', background:'white', outline:'none' }}>
                    <option value="">Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <input type="date" value={newTaskForm.dueDate} onChange={e=>setNewTaskForm({...newTaskForm, dueDate:e.target.value})}
                    style={{ padding:'13px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', background:'white', outline:'none' }}/>
                </div>
                <select value={newTaskForm.clientId} onChange={e=>setNewTaskForm({...newTaskForm, clientId:e.target.value})}
                  style={{ width:'100%', padding:'13px', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.1)', fontSize:'14px', background:'white', outline:'none' }}>
                  <option value="">Client (optional)</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button onClick={async e=>{await handleCreateTask(e);setMobileCreateOpen(false);}} disabled={!newTaskForm.taskName}
                  style={{ width:'100%', padding:'15px', background:newTaskForm.taskName?'linear-gradient(135deg,#0b57d0,#1a73e8)':'rgba(0,0,0,0.08)', color:newTaskForm.taskName?'white':'var(--text-secondary)', border:'none', borderRadius:'16px', fontSize:'15px', fontWeight:700, cursor:newTaskForm.taskName?'pointer':'default' }}>
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER & VIEW TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: 'var(--color-ocean-blue)', letterSpacing: '-0.5px' }}>EvoBoard Engine</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '14px' }}>Advanced Task & Team Operations Center.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ display: 'flex', background: 'var(--bg-matte)', borderRadius: '12px', padding: '4px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setActiveEngineTab('Tasks')} style={{ background: activeEngineTab === 'Tasks' ? 'white' : 'transparent', color: activeEngineTab === 'Tasks' ? 'var(--color-ocean-blue)' : 'var(--text-secondary)', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: activeEngineTab === 'Tasks' ? '0 2px 8px rgba(0,102,204,0.15)' : 'none', transition: 'all 0.2s' }}><ListTodo size={16}/> Tasks</button>
              <button onClick={() => setActiveEngineTab('Team Status')} style={{ background: activeEngineTab === 'Team Status' ? 'white' : 'transparent', color: activeEngineTab === 'Team Status' ? 'var(--color-ocean-blue)' : 'var(--text-secondary)', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: activeEngineTab === 'Team Status' ? '0 2px 8px rgba(0,102,204,0.15)' : 'none', transition: 'all 0.2s' }}><UsersIcon size={16}/> Team Status</button>
              <button onClick={() => setActiveEngineTab('Client Services')} style={{ background: activeEngineTab === 'Client Services' ? 'white' : 'transparent', color: activeEngineTab === 'Client Services' ? 'var(--color-ocean-blue)' : 'var(--text-secondary)', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: activeEngineTab === 'Client Services' ? '0 2px 8px rgba(0,102,204,0.15)' : 'none', transition: 'all 0.2s' }}><Briefcase size={16}/> Services</button>
           </div>
           <button onClick={() => setIsCreateTaskModalOpen(true)} style={{ background: 'var(--color-ocean-blue)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,102,204,0.3)', transition: 'transform 0.1s' }} onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'} onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}><Plus size={18}/> Create Task</button>
        </div>
      </div>

      {activeEngineTab === 'Tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* SEARCH & FILTERS */}
          <div className="matte-3d" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', background: 'white', flexWrap: 'wrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-matte)', padding: '10px 16px', borderRadius: '12px', flex: 1, minWidth: '250px' }}>
              <Search size={18} color="var(--text-secondary)" style={{ marginRight: '10px' }} />
              <input type="text" placeholder="Search thousands of tasks by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', fontWeight: 500 }} />
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}><Filter size={16}/></div>
            <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="matte-3d-inset" style={{ padding: '10px 16px', border: 'none', borderRadius: '10px', fontSize: '13px', outline: 'none', fontWeight: 500, color: 'var(--text-primary)' }}>
              <option value="">All Clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="matte-3d-inset" style={{ padding: '10px 16px', border: 'none', borderRadius: '10px', fontSize: '13px', outline: 'none', fontWeight: 500, color: 'var(--text-primary)' }}>
              <option value="">All Assignees</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="matte-3d-inset" style={{ padding: '10px 16px', border: 'none', borderRadius: '10px', fontSize: '13px', outline: 'none', fontWeight: 500, color: 'var(--text-primary)' }}>
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* STATUS TABS */}
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', flexShrink: 0 }}>
            {['Total', 'Unassigned', 'Assigned', 'Done', 'Missed'].map(tab => (
              <button key={tab} onClick={() => setActiveStatusTab(tab)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: activeStatusTab === tab ? 'var(--color-ocean-blue)' : 'white', color: activeStatusTab === tab ? 'white' : 'var(--text-secondary)', border: `1px solid ${activeStatusTab === tab ? 'transparent' : 'var(--glass-border)'}`, padding: '10px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: activeStatusTab === tab ? '0 4px 12px rgba(0,102,204,0.2)' : 'none', transition: 'all 0.2s' }}>
                {tab}
                <span style={{ background: activeStatusTab === tab ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', color: activeStatusTab === tab ? 'white' : 'var(--text-primary)', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* MULTI-SELECT ACTION BAR */}
          {selectedTaskIds.length > 0 && (
            <div style={{ padding: '12px 20px', background: 'var(--color-ocean-blue)', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', animation: 'slideDown 0.3s ease', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{selectedTaskIds.length} Tasks Selected</span>
                <button onClick={() => setSelectedTaskIds([])} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.3)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'} title="Clear Selection"><X size={16}/></button>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)' }}></div>
              <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
                <select value={bulkAssignUser} onChange={e => setBulkAssignUser(e.target.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none', fontSize: '13px', fontWeight: 500 }}>
                  <option value="" style={{color: 'black'}}>Assign to...</option>
                  <option value="UNASSIGN" style={{color: 'black', fontStyle: 'italic'}}>-- Unassign --</option>
                  {users.map(u => <option key={u.id} value={u.id} style={{color: 'black'}}>{u.name}</option>)}
                </select>
                <select value={bulkAssignPriority} onChange={e => setBulkAssignPriority(e.target.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none', fontSize: '13px', fontWeight: 500 }}>
                  <option value="" style={{color: 'black'}}>Set Priority...</option>
                  <option value="High" style={{color: 'black'}}>High</option>
                  <option value="Medium" style={{color: 'black'}}>Medium</option>
                  <option value="Low" style={{color: 'black'}}>Low</option>
                </select>
                <select value={bulkAssignStatus} onChange={e => setBulkAssignStatus(e.target.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none', fontSize: '13px', fontWeight: 500 }}>
                  <option value="" style={{color: 'black'}}>Set Status...</option>
                  <option value="To Do" style={{color: 'black'}}>To Do</option>
                  <option value="Pending" style={{color: 'black'}}>Pending</option>
                  <option value="In Progress" style={{color: 'black'}}>In Progress</option>
                  <option value="Done" style={{color: 'black'}}>Done</option>
                </select>
                <input type="date" value={bulkAssignDueDate} onChange={e => setBulkAssignDueDate(e.target.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', outline: 'none', fontSize: '13px', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleBulkAssign} disabled={loading} style={{ background: 'white', color: 'var(--color-ocean-blue)', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Apply Actions</button>
                <button onClick={handleBulkDelete} disabled={loading} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={16}/> Delete</button>
              </div>
            </div>
          )}

          {/* ADVANCED DATA TABLE */}
          <div className="matte-3d-inset" style={{ borderRadius: '24px', background: 'white', border: '1px solid var(--glass-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', width: '40px' }}>
                    <input type="checkbox" checked={selectedTaskIds.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0} onChange={toggleSelectAll} style={{ width: '16px', height: '16px', cursor: 'pointer' }}/>
                  </th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', width: '50px' }}>#</th>
                  {[
                    { key: 'taskName', label: 'TASK DETAILS' },
                    { key: 'clientId', label: 'CLIENT' },
                    { key: 'assigneeId', label: 'ASSIGNEE & STATUS' },
                    { key: 'priority', label: 'PRIORITY' },
                    { key: 'dueDate', label: 'DUE DATE' },
                  ].map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {col.label}
                        {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}
                      </div>
                    </th>
                  ))}
                  <th style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTasks.map((task, idx) => {
                  const assignee = getAssignee(task);
                  return (
                    <tr key={task.id} style={{ borderBottom: '1px solid var(--glass-border)', background: selectedTaskIds.includes(task.id) ? 'rgba(0,102,204,0.03)' : (task.status === 'Done' ? '#fafafa' : 'transparent'), transition: 'background 0.2s' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <input type="checkbox" checked={selectedTaskIds.includes(task.id)} onClick={(e) => toggleSelect(task.id, idx, e)} onChange={() => {}} style={{ width: '16px', height: '16px', cursor: 'pointer' }}/>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: getStatusColor(task.status), fontSize: '16px', textShadow: `0 0 8px ${getStatusColor(task.status)}60` }}>●</span>
                          {editingField.id === task.id && editingField.field === 'title' ? (
                            <input 
                              type="text" 
                              autoFocus 
                              value={editingField.value} 
                              onChange={e => setEditingField({ ...editingField, value: e.target.value })}
                              onBlur={handleInlineSave}
                              onKeyDown={handleInlineKeyDown}
                              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-ocean-blue)', outline: 'none', width: '250px', fontSize: '14px', fontWeight: 600, background: 'white' }}
                            />
                          ) : (
                            <span onClick={() => setEditingField({ id: task.id, field: 'title', value: getTaskDisplayTitle(task) })} style={{ fontWeight: 700, fontSize: '14px', textDecoration: task.status === 'Done' ? 'line-through' : 'none', color: task.status === 'Done' ? 'var(--text-secondary)' : 'var(--text-primary)', cursor: 'text', transition: 'color 0.2s', borderBottom: '1px dashed transparent' }} onMouseOver={e=>e.currentTarget.style.borderBottom='1px dashed var(--glass-border)'} onMouseOut={e=>e.currentTarget.style.borderBottom='1px dashed transparent'} title="Click to edit name">
                              {getTaskDisplayTitle(task)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        <span style={{ background: 'rgba(0,0,0,0.04)', padding: '4px 10px', borderRadius: '8px' }}>{getClientName(task)}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {/* Inline Re-assign */}
                          <select value={task.assigneeId || ''} onChange={(e) => handleInlineReassign(task, e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '12px', background: 'transparent', fontWeight: 600, outline: 'none', width: '140px', color: 'var(--text-primary)' }}>
                            <option value="">Unassigned</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                          <select value={task.status} onChange={(e) => updateTaskStatus(task, e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--glass-border)', fontSize: '12px', background: 'transparent', color: getStatusColor(task.status), fontWeight: 700, outline: 'none', width: '140px' }}>
                             <option value="To Do">To Do</option>
                             <option value="Pending">Pending</option>
                             <option value="In Progress">In Progress</option>
                             <option value="Done">Done</option>
                             <option value="Late Submit">Late Submit</option>
                             <option value="Missed">Missed</option>
                          </select>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                        {editingField.id === task.id && editingField.field === 'priority' ? (
                          <select 
                            autoFocus 
                            value={editingField.value} 
                            onChange={e => setEditingField({ ...editingField, value: e.target.value })}
                            onBlur={handleInlineSave}
                            onKeyDown={handleInlineKeyDown}
                            style={{ padding: '4px', borderRadius: '6px', border: '1px solid var(--color-ocean-blue)', outline: 'none', fontSize: '12px' }}
                          >
                            <option value="">None</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        ) : (
                          <span onClick={() => setEditingField({ id: task.id, field: 'priority', value: task.priority || '' })} style={{ padding: '4px 10px', borderRadius: '8px', background: task.priority === 'High' ? 'rgba(239,68,68,0.1)' : task.priority === 'Medium' ? 'rgba(245,158,11,0.1)' : task.priority ? 'rgba(16,185,129,0.1)' : 'transparent', color: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : task.priority ? '#10b981' : 'var(--text-secondary)', fontWeight: 700, display: 'inline-block', cursor: 'pointer', border: '1px dashed transparent', minWidth: '40px', textAlign: 'center' }} onMouseOver={e=>e.currentTarget.style.border='1px dashed var(--glass-border)'} onMouseOut={e=>e.currentTarget.style.border='1px dashed transparent'} title="Click to edit priority">
                            {task.priority || '-'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {editingField.id === task.id && editingField.field === 'dueDate' ? (
                          <input 
                            type="date"
                            autoFocus 
                            value={editingField.value} 
                            onChange={e => setEditingField({ ...editingField, value: e.target.value })}
                            onBlur={handleInlineSave}
                            onKeyDown={handleInlineKeyDown}
                            style={{ padding: '4px', borderRadius: '6px', border: '1px solid var(--color-ocean-blue)', outline: 'none', fontSize: '12px' }}
                          />
                        ) : (
                          <div onClick={() => setEditingField({ id: task.id, field: 'dueDate', value: task.dueDate || '' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', border: '1px dashed transparent', borderRadius: '6px', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.border='1px dashed var(--glass-border)'} onMouseOut={e=>e.currentTarget.style.border='1px dashed transparent'} title="Click to edit due date">
                            {task.dueDate ? <><Calendar size={12} color="var(--text-secondary)"/>{task.dueDate}</> : <span style={{color:'var(--color-ocean-blue)', fontWeight: 600, background: 'rgba(11,87,208,0.05)', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px'}}><Calendar size={12}/> Set Date</span>}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <button onClick={() => { setActiveTask(task); setIsTaskModalOpen(true); }} style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--bg-matte)', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-ocean-blue)', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(0,102,204,0.1)'} onMouseOut={e=>e.currentTarget.style.background='var(--bg-matte)'}>Open</button>
                      </td>
                    </tr>
                  );
                })}
                {filteredAndSortedTasks.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={48} color="var(--glass-border)" style={{ marginBottom: '16px' }} />
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>No tasks found matching your filters.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {filteredAndSortedTasks.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredAndSortedTasks.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      )}

      {/* TEAM STATUS VIEW */}
      {activeEngineTab === 'Team Status' && (() => {
        const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px' }}>
                {paginatedUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No team members found.</div>
                ) : (
                  paginatedUsers.map(user => {
                    const userTasks = tasks.filter(t => t.assigneeId === user.id);
                    const pending = userTasks.filter(t => ['To Do', 'Pending', 'In Progress'].includes(t.status)).length;
                    const done = userTasks.filter(t => t.status === 'Done').length;
                    const missed = userTasks.filter(t => ['Missed', 'Late Submit'].includes(t.status)).length;
                    return (
                      <div key={user.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-deep-orange)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, overflow: 'hidden' }}>
                              {user.avatar ? <img src={user.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> : user.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '15px' }}>{user.name}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{user.role || 'Team Member'}</div>
                            </div>
                          </div>
                          <button onClick={() => sendReminder(user.id)} style={{ padding: '6px 12px', background: 'rgba(11,87,208,0.1)', border: 'none', color: 'var(--color-ocean-blue)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                            <Bell size={14}/> Reminder
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--bg-matte)', padding: '12px', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING</span>
                            <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '15px' }}>{pending}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>DONE</span>
                            <span style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>{done}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>MISSED</span>
                            <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '15px' }}>{missed}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="evo-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Pending</th>
                      <th>Done</th>
                      <th>Missed</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No team members found.</td></tr>
                    ) : (
                      paginatedUsers.map(user => {
                        const userTasks = tasks.filter(t => t.assigneeId === user.id);
                        const pending = userTasks.filter(t => ['To Do', 'Pending', 'In Progress'].includes(t.status)).length;
                        const done = userTasks.filter(t => t.status === 'Done').length;
                        const missed = userTasks.filter(t => ['Missed', 'Late Submit'].includes(t.status)).length;
                        return (
                          <tr key={user.id}>
                            <td data-label="Member">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--color-deep-orange)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, overflow: 'hidden' }}>
                                  {user.avatar ? <img src={user.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt=""/> : user.name.charAt(0)}
                                </div>
                                <span style={{ fontWeight: 700 }}>{user.name}</span>
                              </div>
                            </td>
                            <td data-label="Role" style={{ color: 'var(--text-secondary)' }}>{user.role || 'Team Member'}</td>
                            <td data-label="Pending"><span style={{ fontWeight: 800, color: '#f59e0b' }}>{pending}</span></td>
                            <td data-label="Done"><span style={{ fontWeight: 800, color: '#10b981' }}>{done}</span></td>
                            <td data-label="Missed"><span style={{ fontWeight: 800, color: '#ef4444' }}>{missed}</span></td>
                            <td data-label="Action">
                              <button onClick={() => sendReminder(user.id)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--color-ocean-blue)', color: 'var(--color-ocean-blue)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='var(--color-ocean-blue)';e.currentTarget.style.color='white';}} onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--color-ocean-blue)';}}>
                                <Bell size={14}/> Reminder
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {users.length > 0 && (
              <Pagination currentPage={currentPage} totalItems={users.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
            )}
          </div>
        );
      })()}

      {/* SERVICES BOARD VIEW */}
      {activeEngineTab === 'Client Services' && (() => {
        const activeClients = clients.filter(c => c.status === 'Active');
        const paginatedClients = activeClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px' }}>
                {paginatedClients.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No active clients found.</div>
                ) : (
                  paginatedClients.map(client => {
                    const clientSvcs = allServices.filter(s => s.clientId === client.id).sort((a,b) => a.prioritySeq - b.prioritySeq);
                    return (
                      <div key={client.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-ocean-blue)' }}>{client.name}</div>
                        <div>
                          {clientSvcs.length === 0 ? (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No services assigned</span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {clientSvcs.map(svc => (
                                <div key={svc.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-matte)', padding: '8px 12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-ocean-blue)', background: 'rgba(0,102,204,0.1)', padding: '2px 6px', borderRadius: '4px' }}>#{svc.prioritySeq}</span>
                                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{svc.name}</span>
                                  <span style={{ fontSize: '12px', color: 'var(--color-deep-orange)', fontWeight: 700 }}>x{svc.quantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="evo-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Services / Packages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.length === 0 ? (
                      <tr><td colSpan="2" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No active clients found.</td></tr>
                    ) : (
                      paginatedClients.map(client => {
                        const clientSvcs = allServices.filter(s => s.clientId === client.id).sort((a,b) => a.prioritySeq - b.prioritySeq);
                        return (
                          <tr key={client.id}>
                            <td data-label="Client Name" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-ocean-blue)', verticalAlign: 'top', width: '250px' }}>
                              {client.name}
                            </td>
                            <td data-label="Services / Packages">
                              {clientSvcs.length === 0 ? (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>No services assigned</span>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {clientSvcs.map(svc => (
                                    <div key={svc.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-matte)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-ocean-blue)', background: 'rgba(0,102,204,0.1)', padding: '2px 6px', borderRadius: '4px' }}>#{svc.prioritySeq}</span>
                                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{svc.name}</span>
                                      <span style={{ fontSize: '12px', color: 'var(--color-deep-orange)', fontWeight: 700 }}>x{svc.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeClients.length > 0 && (
              <Pagination currentPage={currentPage} totalItems={activeClients.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
            )}
          </div>
        );
      })()}

      {/* EXPANDED TASK DETAIL SIDE DRAWER */}
      <SideDrawer 
        isOpen={isTaskModalOpen && activeTask}
        onClose={() => { setIsTaskModalOpen(false); setActiveTask(null); }}
        title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ color: getStatusColor(activeTask?.status), fontSize: '20px' }}>●</span> {activeTask ? getTaskDisplayTitle(activeTask) : ''}</div>}
        width="800px"
      >
        {activeTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span style={{ background: 'var(--bg-matte)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>Client: {getClientName(activeTask)}</span>
              {activeTask.priority && <span style={{ background: 'var(--bg-matte)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>Priority: {activeTask.priority}</span>}
              {activeTask.dueDate && <span style={{ background: 'rgba(239,68,68,0.1)', padding: '6px 12px', borderRadius: '8px', color: '#ef4444' }}>Due: {activeTask.dueDate}</span>}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              {/* Left Column: Details & Checklist */}
              <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Description</h3>
                  <textarea 
                    value={activeTask.description || ''} 
                    onChange={(e) => { setActiveTask({...activeTask, description: e.target.value}); updateDoc(doc(db, 'tasks', activeTask.id), { description: e.target.value })}} 
                    placeholder="Add detailed task instructions, brief, or notes here..." 
                    style={{ width: '100%', minHeight: '150px', padding: '16px', border: '1px solid var(--glass-border)', borderRadius: '16px', outline: 'none', resize: 'vertical', fontSize: '14px', lineHeight: '1.6', background: 'var(--bg-matte)', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sub-tasks & Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {(activeTask.checklist || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: item.isDone ? 'rgba(16,185,129,0.05)' : 'white', border: '1px solid var(--glass-border)', padding: '10px 16px', borderRadius: '12px' }}>
                        <input type="checkbox" checked={item.isDone} onChange={async () => {
                          const newChecklist = [...(activeTask.checklist || [])];
                          newChecklist[idx].isDone = !newChecklist[idx].isDone;
                          await updateDoc(doc(db, 'tasks', activeTask.id), { checklist: newChecklist });
                          setActiveTask({...activeTask, checklist: newChecklist});
                        }} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                        <span style={{ flex: 1, fontSize: '14px', textDecoration: item.isDone ? 'line-through' : 'none', color: item.isDone ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: 500 }}>{item.text}</span>
                        <button onClick={async () => {
                          const newChecklist = activeTask.checklist.filter((_, i) => i !== idx);
                          await updateDoc(doc(db, 'tasks', activeTask.id), { checklist: newChecklist });
                          setActiveTask({...activeTask, checklist: newChecklist});
                        }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={16}/></button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!taskChecklistForm.trim()) return;
                    const newChecklist = [...(activeTask.checklist || []), { text: taskChecklistForm, isDone: false }];
                    await updateDoc(doc(db, 'tasks', activeTask.id), { checklist: newChecklist });
                    setActiveTask({...activeTask, checklist: newChecklist});
                    setTaskChecklistForm('');
                  }} style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={taskChecklistForm} onChange={e => setTaskChecklistForm(e.target.value)} placeholder="Add a checklist item..." style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', outline: 'none', background: 'var(--bg-matte)', fontSize: '14px' }} />
                    <button type="submit" style={{ padding: '0 20px', background: 'var(--color-ocean-blue)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                  </form>
                </div>
              </div>

              {/* Right Column: Work Submission & Controls */}
              <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Controls</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'gray', display: 'block', marginBottom: '8px' }}>Assignee</label>
                      <select value={activeTask.assigneeId || ''} onChange={(e) => handleInlineReassign(activeTask, e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-matte)', fontSize: '14px', fontWeight: 600, outline: 'none' }}>
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'gray', display: 'block', marginBottom: '8px' }}>Status</label>
                      <select value={activeTask.status} onChange={(e) => updateTaskStatus(activeTask, e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-matte)', fontSize: '14px', fontWeight: 700, color: getStatusColor(activeTask.status), outline: 'none' }}>
                        <option value="To Do">To Do</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Late Submit">Late Submit</option>
                        <option value="Missed">Missed</option>
                      </select>
                    </div>
                    {isAdmin && activeTask.assigneeId && activeTask.status !== 'Done' && (
                      <div style={{ padding: '16px', background: 'rgba(123,31,162,0.05)', borderRadius: '12px', border: '1px solid rgba(123,31,162,0.1)' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#7b1fa2', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Bell size={14} /> Scheduled Reminder
                        </label>
                        <input 
                          type="datetime-local" 
                          value={activeTask.reminderDateTime || ''}
                          onChange={async (e) => {
                            const val = e.target.value;
                            await updateDoc(doc(db, 'tasks', activeTask.id), { reminderDateTime: val, reminderSent: false });
                            setActiveTask({...activeTask, reminderDateTime: val, reminderSent: false});
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(123,31,162,0.2)', background: 'white', fontSize: '13px', outline: 'none', marginBottom: '12px', color: 'var(--text-primary)' }}
                        />
                        <button 
                          onClick={() => sendReminder(activeTask)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#7b1fa2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(123,31,162,0.2)' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'none'}
                        >
                          <Bell size={14} /> Send Instant Ping
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Submission</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea 
                      placeholder="Final remarks or notes on completed work..." 
                      value={activeTask.assigneeNotes || ''} 
                      onChange={e => setActiveTask({...activeTask, assigneeNotes: e.target.value})}
                      style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--bg-matte)', outline: 'none', resize: 'vertical', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-matte)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                      <Link2 size={16} color="gray" style={{ marginRight: '8px' }} />
                      <input 
                        type="url" 
                        placeholder="Link to delivery (Drive, Figma, etc)" 
                        value={activeTask.assigneeLink || ''} 
                        onChange={e => setActiveTask({...activeTask, assigneeLink: e.target.value})}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
                      />
                    </div>
                    {['Done', 'Late Submit'].includes(activeTask.status) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '10px', fontWeight: 700, justifyContent: 'center' }}>
                        <CheckCircle size={20}/> Work Submitted
                      </div>
                    ) : (
                      <button onClick={handleSubmitWork} style={{ padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                        <Send size={18}/> Submit Final Work
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SideDrawer>

      {/* CREATE STANDALONE TASK MODAL */}
      {isCreateTaskModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="matte-3d" style={{ width: '500px', background: 'white', padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>Create New Task</h3>
              <button onClick={() => setIsCreateTaskModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{fontSize:'13px', fontWeight: 600, color:'var(--text-secondary)', marginBottom: '8px', display: 'block'}}>Task Title *</label>
                <input type="text" required value={newTaskForm.taskName} onChange={e => setNewTaskForm({...newTaskForm, taskName: e.target.value})} className="matte-3d-inset" style={{ width:'100%', padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none', fontSize: '15px' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{fontSize:'13px', fontWeight: 600, color:'var(--text-secondary)', marginBottom: '8px', display: 'block'}}>Client (Optional)</label>
                  <select value={newTaskForm.clientId} onChange={e => setNewTaskForm({...newTaskForm, clientId: e.target.value})} className="matte-3d-inset" style={{ width:'100%', padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none', fontSize: '14px' }}>
                    <option value="">-- Internal Task --</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'13px', fontWeight: 600, color:'var(--text-secondary)', marginBottom: '8px', display: 'block'}}>Assignee</label>
                  <select value={newTaskForm.assigneeId} onChange={e => setNewTaskForm({...newTaskForm, assigneeId: e.target.value})} className="matte-3d-inset" style={{ width:'100%', padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none', fontSize: '14px' }}>
                    <option value="">-- Unassigned --</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'13px', fontWeight: 600, color:'var(--text-secondary)', marginBottom: '8px', display: 'block'}}>Priority</label>
                  <select value={newTaskForm.priority} onChange={e => setNewTaskForm({...newTaskForm, priority: e.target.value})} className="matte-3d-inset" style={{ width:'100%', padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none', fontSize: '14px' }}>
                    <option value="">-- Select --</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:'13px', fontWeight: 600, color:'var(--text-secondary)', marginBottom: '8px', display: 'block'}}>Due Date</label>
                  <input type="date" value={newTaskForm.dueDate} onChange={e => setNewTaskForm({...newTaskForm, dueDate: e.target.value})} className="matte-3d-inset" style={{ width:'100%', padding: '14px', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ padding: '16px', background: 'var(--color-ocean-blue)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', marginTop: '10px', boxShadow: '0 4px 15px rgba(0,102,204,0.3)' }}>
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvoBoard;
