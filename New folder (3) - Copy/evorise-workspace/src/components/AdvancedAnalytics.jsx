import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, BarChart2, PieChart, TrendingUp, TrendingDown, Users, Briefcase, AlertTriangle, Target, Activity, Zap } from 'lucide-react';
import '../index.css';

const AdvancedAnalytics = () => {
  const { userData } = useAuth();
  const isAdmin = ['Admin', 'Administrator', 'Partner'].includes(userData?.role);
  
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const unsubTasks = onSnapshot(collection(db, 'tasks'), s => setTasks(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubUsers = onSnapshot(collection(db, 'users'), s => setUsers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubClients = onSnapshot(collection(db, 'clients'), s => setClients(s.docs.map(d => ({id: d.id, ...d.data()}))));

    return () => { unsubTasks(); unsubUsers(); unsubClients(); };
  }, [isAdmin]);

  // --- ORTHONITI (ECONOMICS) DATA CRUNCHING ---
  const analytics = useMemo(() => {
    if (!tasks.length) {
      return {
        total: 0, done: 0, missed: 0, late: 0, pending: 0,
        completionRate: 0, failureRate: 0,
        clientDensity: [],
        bottleneck: null, topPerformer: null,
        last7Days: Array.from({length: 7}, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          return { date: d.toISOString().split('T')[0], created: 0, completed: 0 };
        }), maxChartVal: 1,
        userStats: []
      };
    }

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const recentTasks = tasks.filter(t => t.createdAt > thirtyDaysAgo);

    // 1. System Efficiency & Velocity
    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const missed = tasks.filter(t => t.status === 'Missed').length;
    const late = tasks.filter(t => t.status === 'Late Submit').length;
    const pending = tasks.filter(t => ['To Do', 'Pending', 'In Progress'].includes(t.status)).length;
    
    const completionRate = total > 0 ? ((done / total) * 100).toFixed(1) : 0;
    const failureRate = total > 0 ? (((missed + late) / total) * 100).toFixed(1) : 0;

    // 2. Resource Allocation (Client Density)
    const clientMap = {};
    tasks.forEach(t => {
      if (t.clientId) {
        if (!clientMap[t.clientId]) clientMap[t.clientId] = { id: t.clientId, name: t.clientName || 'Unknown', count: 0, done: 0 };
        clientMap[t.clientId].count++;
        if (t.status === 'Done') clientMap[t.clientId].done++;
      }
    });
    const clientDensity = Object.values(clientMap).sort((a,b) => b.count - a.count);

    // 3. Human Capital (User Workload & Bottlenecks)
    const userMap = {};
    users.forEach(u => userMap[u.id] = { id: u.id, name: u.name, done: 0, pending: 0, lateOrMissed: 0, total: 0 });
    
    tasks.forEach(t => {
      if (t.assigneeId && userMap[t.assigneeId]) {
        userMap[t.assigneeId].total++;
        if (t.status === 'Done') userMap[t.assigneeId].done++;
        else if (t.status === 'Missed' || t.status === 'Late Submit') userMap[t.assigneeId].lateOrMissed++;
        else userMap[t.assigneeId].pending++;
      }
    });
    
    const userStats = Object.values(userMap).filter(u => u.total > 0);
    // Find bottleneck (Highest late/missed ratio with minimum 5 tasks)
    const bottleneck = [...userStats].filter(u => u.total > 5).sort((a,b) => (b.lateOrMissed/b.total) - (a.lateOrMissed/a.total))[0];
    const topPerformer = [...userStats].sort((a,b) => b.done - a.done)[0];

    // 4. Time Series (Last 7 Days Output)
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { date: d.toISOString().split('T')[0], created: 0, completed: 0 };
    });

    recentTasks.forEach(t => {
      // Created
      if (t.createdAt) {
        const createdDate = new Date(t.createdAt).toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.date === createdDate);
        if (dayMatch) dayMatch.created++;
      }
      // Completed
      if (t.submittedAt && (t.status === 'Done' || t.status === 'Late Submit')) {
        const submittedDate = new Date(t.submittedAt).toISOString().split('T')[0];
        const dayMatch = last7Days.find(d => d.date === submittedDate);
        if (dayMatch) dayMatch.completed++;
      }
    });

    const maxChartVal = Math.max(...last7Days.map(d => Math.max(d.created, d.completed, 1)));

    return {
      total, done, missed, late, pending,
      completionRate, failureRate,
      clientDensity,
      bottleneck, topPerformer,
      last7Days, maxChartVal,
      userStats: userStats.sort((a,b) => b.pending - a.pending)
    };
  }, [tasks, users, clients]);

  if (!isAdmin) return <div style={{ padding: '40px', textAlign: 'center' }}>Access Restricted.</div>;
  if (!analytics) return <div style={{ padding: '40px', textAlign: 'center' }}>Aggregating statistical data...</div>;

  const MetricCard = ({ title, value, subtitle, icon, color, trend, trendText }) => (
    <div className="matte-3d" style={{ background: 'white', padding: '24px', borderRadius: '24px', flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', background: color, opacity: 0.05, borderRadius: '50%' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <div style={{ background: color, padding: '8px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${color}40` }}>
          {icon}
        </div>
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{value}</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{subtitle}</p>
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: trend === 'up' ? '#10b981' : '#ef4444', marginTop: 'auto', paddingTop: '8px' }}>
          {trend === 'up' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
          {trendText}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}>
          <LineChart size={24} color="white"/>
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Deep Analytics & Economics</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>System-wide macro and micro performance metrics.</p>
        </div>
      </div>

      {/* Top Row: Macro KPI Scorecards */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <MetricCard 
          title="System Completion Rate" 
          value={`${analytics.completionRate}%`} 
          subtitle={`${analytics.done} out of ${analytics.total} tasks completed.`} 
          icon={<Target size={20}/>} 
          color="#0ea5e9"
          trend="up"
          trendText="Macro Velocity Metric"
        />
        <MetricCard 
          title="Failure & Loss Index" 
          value={`${analytics.failureRate}%`} 
          subtitle={`${analytics.missed + analytics.late} tasks missed or late.`} 
          icon={<AlertTriangle size={20}/>} 
          color="#ef4444"
          trend="down"
          trendText="Operational Bottleneck Indicator"
        />
        <MetricCard 
          title="Active Liability" 
          value={analytics.pending} 
          subtitle="Tasks currently pending or in progress." 
          icon={<Zap size={20}/>} 
          color="#f59e0b"
        />
        <MetricCard 
          title="Top Performer (Human Capital)" 
          value={analytics.topPerformer?.name || 'N/A'} 
          subtitle={`${analytics.topPerformer?.done || 0} tasks successfully closed.`} 
          icon={<Users size={20}/>} 
          color="#10b981"
        />
      </div>

      {/* Middle Row: Charts & Complex Distributions */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Productivity Trend Chart */}
        <div className="matte-3d-inset" style={{ flex: '2 1 500px', background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>7-Day Output Economics (Supply vs Demand)</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Comparing Task Creation (Demand) against Task Completion (Supply).</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#94a3b8' }}></span> Created</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--color-ocean-blue)' }}></span> Completed</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2%', height: '250px', paddingBottom: '30px', position: 'relative' }}>
            {/* Y Axis Guides */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, pointerEvents: 'none' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ borderTop: '1px dashed var(--glass-border)', width: '100%', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '-20px', top: '-8px', fontSize: '10px', color: 'var(--text-secondary)' }}>{Math.round(analytics.maxChartVal * (3 - i) / 3)}</span>
                </div>
              ))}
            </div>
            
            {/* Bars */}
            {analytics.last7Days.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '4px', height: '100%', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '30%', height: `${Math.max((day.created / analytics.maxChartVal) * 100, 2)}%`, background: '#94a3b8', borderRadius: '6px 6px 0 0', transition: 'height 1s ease', position: 'relative' }} title={`Created: ${day.created}`}></div>
                <div style={{ width: '30%', height: `${Math.max((day.completed / analytics.maxChartVal) * 100, 2)}%`, background: 'var(--color-ocean-blue)', borderRadius: '6px 6px 0 0', transition: 'height 1s ease', position: 'relative' }} title={`Completed: ${day.completed}`}></div>
                <div style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{new Date(day.date).toLocaleDateString('en-US', {weekday:'short'})}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Human Capital Distribution */}
        <div className="matte-3d-inset" style={{ flex: '1 1 350px', background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Workload Liability Distribution</h3>
          <p style={{ margin: '4px 0 20px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Team members ranked by pending liabilities.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
            {analytics.userStats.slice(0, 10).map(user => (
              <div 
                key={user.id} 
                onClick={() => {
                  const userTasks = tasks.filter(t => t.assigneeId === user.id && ['To Do', 'Pending', 'In Progress'].includes(t.status));
                  window.dispatchEvent(new CustomEvent('open-data-inspector', {
                    detail: { title: `${user.name}'s Pending Tasks`, type: 'tasks', data: userTasks }
                  }));
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'background 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(0,0,0,0.02)'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,102,204,0.1)', color: 'var(--color-ocean-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {user.name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>{user.pending} Pend</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-matte)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((user.pending / Math.max(...analytics.userStats.map(u=>u.pending))) * 100, 100)}%`, height: '100%', background: '#f59e0b', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {analytics.userStats.length > 10 && (
             <button 
               onClick={() => window.dispatchEvent(new CustomEvent('open-data-inspector', { detail: { title: 'All Team Members', type: 'users', data: users } }))}
               style={{ marginTop: '16px', padding: '10px', width: '100%', background: 'var(--bg-matte)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'var(--color-ocean-blue)', fontWeight: 700, cursor: 'pointer' }}
             >
               View All {analytics.userStats.length} Members
             </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Deeper Analysis */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Client Resource Density */}
        <div className="matte-3d-inset" style={{ flex: '1 1 350px', background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Resource Allocation by Client</h3>
          <p style={{ margin: '4px 0 20px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Clients consuming system bandwidth.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
            {analytics.clientDensity.slice(0, 10).map((c, i) => (
              <div 
                key={i} 
                onClick={() => {
                  const clientTasks = tasks.filter(t => t.clientId === c.id);
                  window.dispatchEvent(new CustomEvent('open-data-inspector', {
                    detail: { title: `Tasks for ${c.name}`, type: 'tasks', data: clientTasks }
                  }));
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-matte)', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--color-ocean-blue)'}
                onMouseOut={e=>e.currentTarget.style.borderColor='var(--glass-border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-ocean-blue)' }}>#{i+1}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{c.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{c.count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tasks</div>
                </div>
              </div>
            ))}
            {analytics.clientDensity.length === 0 && <span style={{fontSize:'13px', color:'gray'}}>No client data available.</span>}
          </div>
          {analytics.clientDensity.length > 10 && (
             <button 
               onClick={() => window.dispatchEvent(new CustomEvent('open-data-inspector', { detail: { title: 'All Clients', type: 'clients', data: clients } }))}
               style={{ marginTop: '16px', padding: '10px', width: '100%', background: 'var(--bg-matte)', border: '1px solid var(--border-light)', borderRadius: '10px', color: 'var(--color-ocean-blue)', fontWeight: 700, cursor: 'pointer' }}
             >
               View All {analytics.clientDensity.length} Clients
             </button>
          )}
        </div>

        {/* Bottleneck & Punctuality Warning Card */}
        <div className="matte-3d-inset" style={{ flex: '1 1 350px', background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', padding: '24px', borderRadius: '24px', border: '1px solid #fecdd3', position: 'relative', overflow: 'hidden' }}>
          <AlertTriangle size={120} color="#fecdd3" style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.5 }}/>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#be123c', position: 'relative' }}>System Bottleneck Analysis</h3>
          <p style={{ margin: '4px 0 20px 0', fontSize: '12px', color: '#9f1239', position: 'relative' }}>AI-driven identification of operational failure points.</p>
          
          {analytics.bottleneck ? (
            <div style={{ position: 'relative', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(225,29,72,0.1)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Highest Risk Node</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{analytics.bottleneck.name}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e11d48' }}>
                Failure Rate: {((analytics.bottleneck.lateOrMissed / analytics.bottleneck.total) * 100).toFixed(1)}%
              </div>
              <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                This user has the highest ratio of missed or late submissions relative to their total assigned workload ({analytics.bottleneck.lateOrMissed} failed out of {analytics.bottleneck.total} total). Consider redistributing their liability or providing intervention.
              </p>
            </div>
          ) : (
            <div style={{ position: 'relative', background: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
              No critical bottlenecks detected in the system pipeline.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdvancedAnalytics;
