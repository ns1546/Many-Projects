import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, CheckSquare, Users, CheckCircle, Activity, BarChart2, PieChart, TrendingUp, Search, X, ArrowRight, Clock, Zap, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import useIsMobile from '../hooks/useIsMobile';
import '../index.css';

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);

  const userRole = userData?.role || 'Employee';
  const isAdmin = userRole === 'Admin' || userRole === 'Administrator' || userRole === 'Partner';

  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, 'tasks'), snap => {
      const data = []; snap.forEach(d => data.push({ id: d.id, ...d.data() })); setTasks(data);
    });
    const unsubClients = onSnapshot(collection(db, 'clients'), snap => {
      const data = []; snap.forEach(d => data.push({ id: d.id, ...d.data() })); setClients(data);
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      const data = []; snap.forEach(d => data.push({ id: d.id, ...d.data() })); setTeam(data);
    });
    return () => { unsubTasks(); unsubClients(); unsubUsers(); };
  }, []);

  const handleInspect = (data) => window.dispatchEvent(new CustomEvent('open-data-inspector', { detail: data }));

  // ── MOBILE RENDER ──────────────────────────────────────────
  if (isMobile) {
    const myTasks = isAdmin ? tasks : tasks.filter(t => t.assigneeId === currentUser?.uid);
    const pending = myTasks.filter(t => t.status !== 'Done');
    const done = myTasks.filter(t => t.status === 'Done');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDone = done.filter(t => t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === todayStr).length;
    const recentTasks = [...myTasks].sort((a,b) => (b.createdAt||0)-(a.createdAt||0)).slice(0,8);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = (userData?.name || '').split(' ')[0] || 'there';

    const statCards = [
      { label: 'Pending', value: pending.length, bg: '#FF9500', icon: <Clock size={16} color="white"/>, onClick: () => handleInspect({ title:'Pending Tasks', type:'tasks', data: pending }) },
      { label: 'Completed', value: done.length, bg: '#34C759', icon: <CheckCircle size={16} color="white"/>, onClick: () => handleInspect({ title:'Completed Tasks', type:'tasks', data: done }) },
      { label: isAdmin ? 'Clients' : 'Tasks', value: isAdmin ? clients.length : myTasks.length, bg: '#007AFF', icon: <Briefcase size={16} color="white"/>, onClick: () => handleInspect({ title: isAdmin?'Clients':'My Tasks', type: isAdmin?'clients':'tasks', data: isAdmin?clients:myTasks }) },
      { label: 'Team', value: team.length, bg: '#AF52DE', icon: <Users size={16} color="white"/>, onClick: () => window.dispatchEvent(new CustomEvent('navigate',{detail:{menu:'team'}})) },
    ];

    const quickActions = [
      { label: 'My Tasks', icon: <Target size={22} color="#007AFF"/>, color: 'rgba(0,122,255,0.1)', nav: 'myday' },
      { label: 'EvoBoard', icon: <CheckSquare size={22} color="#34C759"/>, color: 'rgba(52,199,89,0.1)', nav: 'evoboard' },
      { label: 'Instant', icon: <Zap size={22} color="#FF9500"/>, color: 'rgba(255,149,0,0.1)', nav: 'instant' },
      { label: 'Team', icon: <Users size={22} color="#AF52DE"/>, color: 'rgba(175,82,222,0.1)', nav: 'team' },
    ];

    const priorityColor = p => p==='High'?'#FF3B30':p==='Medium'?'#FF9500':'#34C759';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 16px 32px', gap: '24px' }}>
        
        {/* ── Native Large Title ─────────────── */}
        <div>
          <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#8E8E93', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{greeting}</p>
          <h1 style={{ margin: '0', fontSize: '34px', fontWeight: 800, color: '#000000', letterSpacing: '-0.04em' }}>{firstName}</h1>
        </div>

        {/* ── Native Grid Stat Cards ──────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {statCards.map((s, i) => (
            <div key={i} onClick={s.onClick} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#8E8E93', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#000000', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Native Quick Actions ─────────────── */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000000', marginBottom: '12px', letterSpacing: '-0.02em' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => window.dispatchEvent(new CustomEvent('navigate',{detail:{menu:a.nav}}))}
                style={{ border: 'none', background: '#FFFFFF', borderRadius: '14px', width: '76px', height: '76px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(a.icon, { size: 20 })}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#000000' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Native Inset Grouped List (Recent Tasks) ─────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000000', margin: 0, letterSpacing: '-0.02em' }}>Recent Tasks</h2>
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate',{detail:{menu:'evoboard'}}))}
              style={{ background: 'none', border: 'none', fontSize: '17px', color: '#007AFF', padding: 0, fontWeight: 400 }}>
              See All
            </button>
          </div>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden' }}>
            {recentTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8E8E93', fontSize: '15px' }}>No tasks yet</div>
            )}
            {recentTasks.map((t, index) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: index < recentTasks.length - 1 ? '0.5px solid #C6C6C8' : 'none', cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '10px', border: `1.5px solid ${t.status==='Done'?'#34C759':'#C7C7CC'}`, background: t.status==='Done'?'#34C759':'transparent', flexShrink: 0, marginRight: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.status==='Done' && <CheckSquare size={12} color="white" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '17px', fontWeight: 400, color: t.status==='Done'?'#8E8E93':'#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: t.status==='Done'?'line-through':'none' }}>
                    {t.customName || t.taskName || t.title || 'Untitled'}
                  </div>
                  {t.priority && t.status !== 'Done' && <div style={{ fontSize: '13px', color: priorityColor(t.priority), marginTop: '2px' }}>{t.priority}</div>}
                </div>
                <div style={{ color: '#C7C7CC', flexShrink: 0 }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Native Team List ─────────────── */}
        {isAdmin && team.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#000000', margin: 0, letterSpacing: '-0.02em' }}>Team Overview</h2>
              <button onClick={() => window.dispatchEvent(new CustomEvent('navigate',{detail:{menu:'team'}}))}
                style={{ background: 'none', border: 'none', fontSize: '17px', color: '#007AFF', padding: 0, fontWeight: 400 }}>
                Manage
              </button>
            </div>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden' }}>
              {team.slice(0, 5).map((u, index) => {
                const ut = tasks.filter(t=>t.assigneeId===u.id);
                const ud = ut.filter(t=>t.status==='Done').length;
                const pct = ut.length>0?Math.round(ud/ut.length*100):0;
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: index < Math.min(team.length, 5) - 1 ? '0.5px solid #C6C6C8' : 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: '#AF52DE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '16px', flexShrink: 0, marginRight: '12px' }}>
                      {(u.name||'?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '17px', fontWeight: 400, color: '#000000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name || 'Unnamed'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '2px' }}>
                        {ut.length} tasks · {pct}% done
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── DESKTOP RENDER (unchanged) ─────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', position: 'relative' }}>
       <div className="glass-panel" style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '20px', background: 'white' }}>
          <button onClick={() => setActiveTab('overview')} style={{ padding: '12px 24px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'overview' ? 'linear-gradient(135deg, #0b57d0, #1a73e8)' : 'transparent', color: activeTab === 'overview' ? 'white' : 'var(--text-secondary)', boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(11,87,208,0.3)' : 'none' }}>
            <Activity size={18}/> System Overview
          </button>
          {isAdmin && (<button onClick={() => setActiveTab('team')} style={{ padding: '12px 24px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'team' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent', color: activeTab === 'team' ? 'white' : 'var(--text-secondary)', boxShadow: activeTab === 'team' ? '0 4px 12px rgba(139,92,246,0.3)' : 'none' }}><Users size={18}/> Team Analytics</button>)}
          {isAdmin && (<button onClick={() => setActiveTab('clients')} style={{ padding: '12px 24px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'clients' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent', color: activeTab === 'clients' ? 'white' : 'var(--text-secondary)', boxShadow: activeTab === 'clients' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none' }}><Briefcase size={18}/> Client Insights</button>)}
       </div>
       <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
         {activeTab === 'overview' && <OverviewTab tasks={tasks} clients={clients} team={team} isAdmin={isAdmin} currentUser={currentUser} onInspect={handleInspect} />}
         {activeTab === 'team' && isAdmin && <TeamAnalyticsTab tasks={tasks} team={team} onInspect={handleInspect} />}
         {activeTab === 'clients' && isAdmin && <ClientInsightsTab tasks={tasks} clients={clients} onInspect={handleInspect} />}
       </div>
    </div>
  );
};

/* ========================================================
   1. OVERVIEW TAB
   ======================================================== */
const OverviewTab = ({ tasks, clients, team, isAdmin, currentUser, onInspect }) => {
  const relevantTasks = isAdmin ? tasks : tasks.filter(t => t.assigneeId === currentUser?.uid);
  
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(dateStr => {
    const completed = relevantTasks.filter(t => {
       if (t.status !== 'Done' || !t.completedAt) return false;
       return new Date(t.completedAt).toISOString().split('T')[0] === dateStr;
    }).length;
    
    const added = relevantTasks.filter(t => {
       if (!t.createdAt) return false;
       return new Date(t.createdAt).toISOString().split('T')[0] === dateStr;
    }).length;

    return { name: dateStr.split('-').slice(1).join('/'), Completed: completed, Assigned: added };
  });

  return (
    <>
      <div className="dashboard-grid">
        <div 
          className="stat-card glass-panel clickable-card" 
          onClick={() => onInspect({ title: isAdmin ? 'Total Active Clients' : 'My Total Tasks', type: isAdmin ? 'clients' : 'tasks', data: isAdmin ? clients : relevantTasks })}
          style={{ background: 'white', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title" style={{ fontSize: '15px' }}>{isAdmin ? 'Total Active Clients' : 'My Total Tasks'}</span>
            <div style={{ padding: '12px', background: 'rgba(11,87,208,0.1)', borderRadius: '14px', color: 'var(--color-ocean-blue)' }}>
              <Briefcase size={24} />
            </div>
          </div>
          <span className="stat-value" style={{ fontSize: '36px' }}>{isAdmin ? clients.length : relevantTasks.length}</span>
          <div style={{ fontSize: '14px', color: 'var(--color-ocean-blue)', fontWeight: 600 }}>Click to inspect details</div>
        </div>

        <div 
          className="stat-card glass-panel clickable-card" 
          onClick={() => onInspect({ title: 'Pending Workload', type: 'tasks', data: relevantTasks.filter(t => t.status !== 'Done') })}
          style={{ background: 'white', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title" style={{ fontSize: '15px' }}>Pending Tasks</span>
            <div style={{ padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: '14px', color: '#f59e0b' }}>
              <CheckSquare size={24} />
            </div>
          </div>
          <span className="stat-value" style={{ fontSize: '36px' }}>{relevantTasks.filter(t => t.status !== 'Done').length}</span>
          <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 600 }}>Click to view pending items</div>
        </div>

        <div 
          className="stat-card glass-panel clickable-card" 
          onClick={() => onInspect({ title: 'Completed Work', type: 'tasks', data: relevantTasks.filter(t => t.status === 'Done') })}
          style={{ background: 'white', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-title" style={{ fontSize: '15px' }}>Completed Work</span>
            <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '14px', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
          </div>
          <span className="stat-value" style={{ fontSize: '36px' }}>{relevantTasks.filter(t => t.status === 'Done').length}</span>
          <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 600 }}>Click to review history</div>
        </div>
      </div>

      <div className="glass-panel" style={{ background: 'white', padding: '30px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <TrendingUp size={20} color="var(--color-ocean-blue)" />
          <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: 700 }}>Work Volume (Last 7 Days)</h3>
        </div>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-ocean-blue)" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="var(--color-ocean-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-secondary)', fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-secondary)', fontWeight: 500 }} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', fontWeight: 600 }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 600, paddingBottom: '20px' }} />
              <Area type="monotone" dataKey="Assigned" stroke="var(--color-ocean-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorAssigned)" />
              <Area type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

/* ========================================================
   2. TEAM ANALYTICS TAB
   ======================================================== */
const TeamAnalyticsTab = ({ tasks, team, onInspect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const userStats = team.map(u => {
     const userTasks = tasks.filter(t => t.assigneeId === u.id);
     const done = userTasks.filter(t => t.status === 'Done').length;
     const pending = userTasks.filter(t => t.status !== 'Done').length;
     const total = userTasks.length;
     const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
     return { ...u, done, pending, total, completionRate, userTasks };
  }).filter(u => (u.total > 0 || u.role === 'Employee') && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Sort by highest completion rate first
  userStats.sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Team Performance Breakdown</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Analyze individual workload and completion rates.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.03)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search team member..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', paddingLeft: '12px', fontSize: '14px', width: '200px' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {userStats.map(user => (
          <div 
            key={user.id} 
            className="glass-panel clickable-card" 
            onClick={() => onInspect({ title: `Tasks for ${user.name}`, type: 'tasks', data: user.userTasks })}
            style={{ background: 'white', padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{user.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>{user.role || 'Member'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{user.done}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{user.pending}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completion Rate</span>
                <span style={{ color: user.completionRate > 75 ? '#10b981' : user.completionRate > 40 ? '#f59e0b' : '#ef4444' }}>{user.completionRate}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${user.completionRate}%`, height: '100%', background: user.completionRate > 75 ? '#10b981' : user.completionRate > 40 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s' }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================================================
   3. CLIENT INSIGHTS TAB
   ======================================================== */
const ClientInsightsTab = ({ tasks, clients, onInspect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const clientStats = clients.map(c => {
     const clientTasks = tasks.filter(t => t.clientId === c.id || t.clientName === c.name);
     const done = clientTasks.filter(t => t.status === 'Done').length;
     const pending = clientTasks.filter(t => t.status !== 'Done').length;
     const total = clientTasks.length;
     return { ...c, done, pending, total, clientTasks };
  }).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Sort by highest pending workload
  clientStats.sort((a, b) => b.pending - a.pending);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Client Insights</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Track pending and completed services per client.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.03)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search client..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', paddingLeft: '12px', fontSize: '14px', width: '200px' }}
          />
        </div>
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 4px' }}>
          {clientStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No clients found.</div>
          ) : (
            clientStats.map(c => {
              const health = c.pending > 10 ? 'High Volume' : c.pending > 0 ? 'Active' : 'Idle';
              const healthColor = health === 'High Volume' ? '#ef4444' : health === 'Active' ? '#10b981' : 'var(--text-secondary)';
              const healthBg = health === 'High Volume' ? 'rgba(239,68,68,0.1)' : health === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.05)';
              
              return (
                <div 
                  key={c.id} 
                  onClick={() => onInspect({ title: `Tasks for ${c.name}`, type: 'tasks', data: c.clientTasks })}
                  style={{ cursor: 'pointer', background: 'white', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{c.phone || c.email || 'N/A'}</div>
                      </div>
                    </div>
                    <span style={{ background: healthBg, color: healthColor, padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {health}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--bg-matte)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>{c.total}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>DONE</span>
                      <span style={{ fontWeight: 800, color: '#10b981', fontSize: '15px' }}>{c.done}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING</span>
                      <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '15px' }}>{c.pending}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="table-wrapper glass-panel" style={{ background: 'white', borderRadius: '24px', overflow: 'hidden' }}>
          <table className="evo-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Contact Info</th>
                <th>Total Tasks</th>
                <th>Completed</th>
                <th>Pending (Active)</th>
                <th>Health Status</th>
              </tr>
            </thead>
            <tbody>
              {clientStats.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No clients found.</td></tr>
              ) : (
                clientStats.map(c => {
                  const health = c.pending > 10 ? 'High Volume' : c.pending > 0 ? 'Active' : 'Idle';
                  const healthColor = health === 'High Volume' ? '#ef4444' : health === 'Active' ? '#10b981' : 'var(--text-secondary)';
                  const healthBg = health === 'High Volume' ? 'rgba(239,68,68,0.1)' : health === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.05)';
                  
                  return (
                    <tr 
                      key={c.id} 
                      onClick={() => onInspect({ title: `Tasks for ${c.name}`, type: 'tasks', data: c.clientTasks })}
                      style={{ cursor: 'pointer' }}
                      className="clickable-row"
                    >
                      <td data-label="Client Name" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          {c.name}
                        </div>
                      </td>
                      <td data-label="Contact Info" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{c.phone || c.email || 'N/A'}</td>
                      <td data-label="Total Tasks" style={{ fontWeight: 600 }}>{c.total}</td>
                      <td data-label="Completed" style={{ color: '#10b981', fontWeight: 600 }}>{c.done}</td>
                      <td data-label="Pending" style={{ color: '#f59e0b', fontWeight: 600 }}>{c.pending}</td>
                      <td data-label="Health Status">
                        <span style={{ background: healthBg, color: healthColor, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                          {health}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
