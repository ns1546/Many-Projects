import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { downloadCSV } from '../utils/csvExport';
import toast from 'react-hot-toast';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- Sub-functions for Data Processing ---

const getDateFilterRanges = (filter) => {
  const now = new Date();
  let currStart, currEnd, prevStart, prevEnd, interval;
  const y = now.getFullYear();
  const m = now.getMonth();

  switch(filter) {
    case 'this_month':
      currStart = new Date(y, m, 1);
      currEnd = new Date(y, m + 1, 0);
      prevStart = new Date(y, m - 1, 1);
      prevEnd = new Date(y, m, 0);
      interval = 'day';
      break;
    case 'last_month':
      currStart = new Date(y, m - 1, 1);
      currEnd = new Date(y, m, 0);
      prevStart = new Date(y, m - 2, 1);
      prevEnd = new Date(y, m - 1, 0);
      interval = 'day';
      break;
    case 'this_year':
      currStart = new Date(y, 0, 1);
      currEnd = new Date(y, 11, 31);
      prevStart = new Date(y - 1, 0, 1);
      prevEnd = new Date(y - 1, 11, 31);
      interval = 'month';
      break;
    case 'last_year':
      currStart = new Date(y - 1, 0, 1);
      currEnd = new Date(y - 1, 11, 31);
      prevStart = new Date(y - 2, 0, 1);
      prevEnd = new Date(y - 2, 11, 31);
      interval = 'month';
      break;
    case 'last_30_days':
    default:
      currEnd = new Date();
      currStart = new Date();
      currStart.setDate(currStart.getDate() - 29);
      prevEnd = new Date(currStart);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 29);
      interval = 'day';
      break;
  }
  
  [currStart, currEnd, prevStart, prevEnd].forEach(d => d.setHours(0, 0, 0, 0));
  currEnd.setHours(23, 59, 59, 999);
  prevEnd.setHours(23, 59, 59, 999);

  return { currStart, currEnd, prevStart, prevEnd, interval };
};

const processSalesData = (sales, { currStart, currEnd, prevStart, prevEnd }) => {
  const currentPeriod = [];
  const previousPeriod = [];

  sales.forEach(s => {
    const d = s.saleDate?.toDate?.() || new Date(0);
    if (d >= currStart && d <= currEnd) currentPeriod.push(s);
    else if (d >= prevStart && d <= prevEnd) previousPeriod.push(s);
  });

  return { currentPeriod, previousPeriod };
};

const calculateMetrics = (sales) => {
  const revenue = sales.reduce((sum, s) => sum + (s.netAmount || s.totalAmount || 0), 0);
  const tx = sales.length;
  const aov = tx > 0 ? revenue / tx : 0;
  return { revenue, tx, aov };
};

const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const groupByDate = (sales, interval) => {
  const map = {};
  sales.forEach(s => {
    let d = s.saleDate?.toDate?.() || new Date(0);
    let key = d.toLocaleDateString('en-CA');
    if (interval === 'month') key = key.substring(0, 7);
    if (!map[key]) map[key] = 0;
    map[key] += s.netAmount || s.totalAmount || 0;
  });
  return map;
};

const generateDateRange = (start, end, interval) => {
  const dates = [];
  for (let d = new Date(start); d <= end; ) {
    let key = d.toLocaleDateString('en-CA');
    if (interval === 'month') {
      key = key.substring(0, 7);
      if (!dates.includes(key)) dates.push(key);
      d.setMonth(d.getMonth() + 1);
    } else {
      if (!dates.includes(key)) dates.push(key);
      d.setDate(d.getDate() + 1);
    }
  }
  return dates;
};

const getTopProducts = (sales) => {
  const map = {};
  sales.forEach(s => {
    (s.items || []).forEach(it => {
      const key = `${it.brand || ''} ${it.productType || ''}`.trim() || it.productName || 'Unknown';
      if (!map[key]) map[key] = { qty: 0, revenue: 0, brand: it.brand || 'Other' };
      map[key].qty += it.qty || 0;
      map[key].revenue += (it.qty || 0) * (it.unitPrice || 0);
    });
  });
  return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
};

const getBrandBreakdown = (sales) => {
  const map = {};
  sales.forEach(s => {
    (s.items || []).forEach(it => {
      const brand = it.brand || 'Other';
      map[brand] = (map[brand] || 0) + ((it.qty || 0) * (it.unitPrice || 0));
    });
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
};

const getPaymentBreakdown = (sales) => {
  const map = {};
  sales.forEach(s => {
    const method = s.paymentMethod || 'Cash';
    map[method] = (map[method] || 0) + (s.netAmount || s.totalAmount || 0);
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
};

// --- Chart Configurations ---
const premiumPalette = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#0ea5e9', '#38bdf8', '#0f766e', '#14b8a6'];

const shadowPlugin = {
  id: 'shadowPlugin',
  beforeDatasetsDraw(chart, args, options) {
    chart.ctx.save();
    chart.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    chart.ctx.shadowBlur = 15;
    chart.ctx.shadowOffsetX = 0;
    chart.ctx.shadowOffsetY = 8;
  },
  afterDatasetsDraw(chart, args, options) {
    chart.ctx.restore();
  }
};

const commonChartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { padding: 24, color: '#94a3b8', font: { family: 'Inter', size: 12, weight: '600' }, usePointStyle: true, pointStyle: 'circle', boxWidth: 10 } },
    tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.95)', titleFont: { family: 'Inter', size: 14, weight: '700' }, bodyFont: { family: 'Inter', size: 13 }, padding: 16, cornerRadius: 8, boxPadding: 8, usePointStyle: true, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
  },
  scales: {
    x: { ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }, grid: { display: false } },
    y: { 
      beginAtZero: true, 
      grace: '10%',
      ticks: { 
        color: '#94a3b8', 
        font: { family: 'Inter', size: 11 },
        callback: function(value) { return '৳' + (value >= 1000 ? (value/1000).toFixed(1) + 'k' : value); }
      }, 
      grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false }, 
      border: { dash: [4, 4] } 
    },
  },
};

const doughnutOpts = {
  ...commonChartOpts,
  scales: { x: { display: false }, y: { display: false } },
  cutout: '75%',
  plugins: {
    ...commonChartOpts.plugins,
    legend: { position: 'right', labels: { padding: 20, color: '#e2e8f0', font: { family: 'Inter', size: 13, weight: '500' }, usePointStyle: true, pointStyle: 'circle' } }
  }
};

export default function Analytics() {
  const navigate = useNavigate();
  const [shopSales, setShopSales] = useState([]);
  const [godownSales, setGodownSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('this_month');
  const [chartTab, setChartTab] = useState('revenue');

  const { currStart, currEnd, prevStart, prevEnd, interval } = useMemo(() => getDateFilterRanges(dateFilter), [dateFilter]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const fetchLimitDate = prevStart;

        const [ss, gs] = await Promise.all([
          getDocs(query(collection(db, 'shop_sales'), where('saleDate', '>=', fetchLimitDate), orderBy('saleDate', 'desc'))),
          getDocs(query(collection(db, 'godown_sales'), where('saleDate', '>=', fetchLimitDate), orderBy('saleDate', 'desc'))),
        ]);
        setShopSales(ss.docs.map(d => ({ id: d.id, ...d.data() })));
        setGodownSales(gs.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { 
        toast.error('Failed to load analytics data.'); 
      }
      setLoading(false);
    };
    fetchAll();
  }, [prevStart]);

  // Process data using sub-functions
  const processedData = useMemo(() => {
    const bounds = { currStart, currEnd, prevStart, prevEnd };
    const shopData = processSalesData(shopSales, bounds);
    const godownData = processSalesData(godownSales, bounds);

    const currAll = [...shopData.currentPeriod, ...godownData.currentPeriod];
    const prevAll = [...shopData.previousPeriod, ...godownData.previousPeriod];

    const currMetrics = calculateMetrics(currAll);
    const prevMetrics = calculateMetrics(prevAll);
    const shopCurrMetrics = calculateMetrics(shopData.currentPeriod);
    const godownCurrMetrics = calculateMetrics(godownData.currentPeriod);

    return {
      current: currAll,
      shopCurrent: shopData.currentPeriod,
      godownCurrent: godownData.currentPeriod,
      shopPrevious: shopData.previousPeriod,
      godownPrevious: godownData.previousPeriod,
      metrics: currMetrics,
      growth: {
        revenue: calculateGrowth(currMetrics.revenue, prevMetrics.revenue),
        tx: calculateGrowth(currMetrics.tx, prevMetrics.tx),
        aov: calculateGrowth(currMetrics.aov, prevMetrics.aov)
      },
      shopRevenue: shopCurrMetrics.revenue,
      godownRevenue: godownCurrMetrics.revenue
    };
  }, [shopSales, godownSales, currStart, currEnd, prevStart, prevEnd]);

  const chartData = useMemo(() => {
    const shopDates = groupByDate(processedData.shopCurrent, interval);
    const godownDates = groupByDate(processedData.godownCurrent, interval);
    const allDates = generateDateRange(currStart, currEnd, interval);

    const prevShopDates = groupByDate(processedData.shopPrevious, interval);
    const prevGodownDates = groupByDate(processedData.godownPrevious, interval);
    const prevAllDates = generateDateRange(prevStart, prevEnd, interval);

    const topProds = getTopProducts(processedData.current);
    const brands = getBrandBreakdown(processedData.current);
    const payments = getPaymentBreakdown(processedData.current);

    return {
      dates: allDates,
      revenueLine: {
        labels: allDates,
        datasets: [
          { 
             label: 'Shop (Current)', 
             data: allDates.map(d => shopDates[d] || 0), 
             borderColor: '#0ea5e9', 
             backgroundColor: (context) => {
               const chart = context.chart;
               const {ctx, chartArea} = chart;
               if (!chartArea) return null;
               const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
               gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
               gradient.addColorStop(1, 'rgba(14, 165, 233, 0.01)');
               return gradient;
             },
             fill: true, tension: 0.4, borderWidth: 3, pointRadius: 0, pointHoverRadius: 8, 
             pointBackgroundColor: '#0ea5e9', pointBorderColor: '#fff', pointBorderWidth: 2
          },
          { 
             label: 'Godown (Current)', 
             data: allDates.map(d => godownDates[d] || 0), 
             borderColor: '#14b8a6', 
             backgroundColor: (context) => {
               const chart = context.chart;
               const {ctx, chartArea} = chart;
               if (!chartArea) return null;
               const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
               gradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)');
               gradient.addColorStop(1, 'rgba(20, 184, 166, 0.01)');
               return gradient;
             },
             fill: true, tension: 0.4, borderWidth: 3, pointRadius: 0, pointHoverRadius: 8, 
             pointBackgroundColor: '#14b8a6', pointBorderColor: '#fff', pointBorderWidth: 2
          },
          { 
             label: 'Shop (Prior Period)', 
             data: prevAllDates.map(d => prevShopDates[d] || 0), 
             borderColor: 'rgba(14, 165, 233, 0.25)', 
             backgroundColor: 'transparent', fill: false, borderDash: [5, 5], tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 
          },
          { 
             label: 'Godown (Prior Period)', 
             data: prevAllDates.map(d => prevGodownDates[d] || 0), 
             borderColor: 'rgba(20, 184, 166, 0.25)', 
             backgroundColor: 'transparent', fill: false, borderDash: [5, 5], tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 
          },
        ]
      },
      topProductsBar: {
        labels: topProds.map(([name]) => name.length > 25 ? name.slice(0, 23) + '…' : name),
        datasets: [{ label: 'Revenue (৳)', data: topProds.map(([, v]) => v.revenue), backgroundColor: '#1e293b', borderRadius: 4, hoverBackgroundColor: '#334155', maxBarThickness: 32 }]
      },
      topProductsData: topProds,
      splitDoughnut: {
        labels: ['Shop Sales', 'Godown Sales'],
        datasets: [{ data: [processedData.shopRevenue, processedData.godownRevenue], backgroundColor: ['#1e293b', '#94a3b8'], borderWidth: 0, hoverOffset: 4 }]
      },
      brandDoughnut: {
        labels: brands.map(([b]) => b),
        datasets: [{ data: brands.map(([, v]) => v), backgroundColor: premiumPalette, borderWidth: 0, hoverOffset: 6 }]
      },
      paymentDoughnut: {
        labels: payments.map(([p]) => p),
        datasets: [{ data: payments.map(([, v]) => v), backgroundColor: premiumPalette.slice().reverse(), borderWidth: 0, hoverOffset: 6 }]
      }
    };
  }, [processedData, interval, currStart, currEnd, prevStart, prevEnd]);

  // UI Helpers
  const renderTrend = (value) => {
    if (value === 0) return <span className="stat-meta"><span style={{color:'var(--text-muted)'}}>— 0%</span> vs prior</span>;
    const isUp = value > 0;
    return (
      <span className="stat-meta">
        <span className={isUp ? 'trend-up' : 'trend-down'}>{isUp ? '↗' : '↘'} {Math.abs(value).toFixed(1)}%</span> vs prior period
      </span>
    );
  };

  const pgTopProducts = usePagination(chartData.topProductsData, 10);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Enterprise Analytics</h1>
          <p className="page-subtitle">Advanced performance tracking and multi-channel sales insights</p>
        </div>
        <div className="page-header-actions">
          <select className="form-select" style={{ width: 180, fontWeight: 600 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="last_30_days">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="last_year">Last Year</option>
          </select>
          <button className="btn btn-secondary" onClick={() => {
            const rows = processedData.current.map(s => ({ 'Receipt': s.receiptNo, 'Source': s.isGodown ? 'Godown' : 'Shop', 'Net Amount': s.netAmount || s.totalAmount, 'Date': s.saleDate?.toDate?.()?.toLocaleString() || '—' }));
            downloadCSV(rows, `enterprise-analytics-${dateFilter}.csv`);
            toast.success('Report Exported Successfully.');
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid-4 mb-4">
          {[1,2,3,4].map(i => <div key={i} className="card" style={{ height: 110, animation: 'pulse 1.5s infinite', background: 'var(--bg-elevated)' }} />)}
        </div>
      ) : (
        <>
          {/* Executive KPI Ribbon */}
          <div className="stat-grid mb-4">
            <div 
              className="stat-card blue" 
              style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => { setChartTab('revenue'); navigate('/admin/revenue-tracker'); }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              title="Click to inspect detailed Day-Wise Complete Financial Register"
            >
              <div className="stat-label">Total Gross Revenue</div>
              <div className="stat-value"><span className="currency-symbol">৳</span>{processedData.metrics.revenue.toLocaleString()}</div>
              {renderTrend(processedData.growth.revenue)}
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>Inspect Financial Ledger →</div>
            </div>
            <div 
              className="stat-card teal" 
              style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => { setChartTab('revenue'); navigate('/admin/revenue-tracker'); }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              title="Click to inspect all daily sales transactions"
            >
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">{processedData.metrics.tx.toLocaleString()}</div>
              {renderTrend(processedData.growth.tx)}
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--teal)' }}>Inspect Sales Register →</div>
            </div>
            <div 
              className="stat-card purple" 
              style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => setChartTab('products')}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              title="Click to view Product Intelligence & top velocity products"
            >
              <div className="stat-label">Average Order Value</div>
              <div className="stat-value"><span className="currency-symbol">৳</span>{processedData.metrics.aov.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
              {renderTrend(processedData.growth.aov)}
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--purple)' }}>Inspect Product Intelligence →</div>
            </div>
            <div 
              className="stat-card gold" 
              style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onClick={() => setChartTab('marketing')}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              title="Click to view Channel & Brand breakdown"
            >
              <div className="stat-label">Channel Performance (Shop)</div>
              <div className="stat-value"><span className="currency-symbol">৳</span>{processedData.shopRevenue.toLocaleString()}</div>
              <div className="stat-meta">Godown: ৳{processedData.godownRevenue.toLocaleString()}</div>
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: 'var(--gold)' }}>Inspect Channel Breakdown →</div>
            </div>
          </div>

          {/* Advanced Analytics Modules */}
          <div className="tabs mb-4" style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
            {[
              { id: 'revenue', icon: '', label: 'Revenue & Velocity' },
              { id: 'products', icon: '', label: 'Product Intelligence' },
              { id: 'marketing', icon: '', label: 'Brands & Channels' },
              { id: 'finance', icon: '', label: 'Payment Systems' }
            ].map(t => (
              <button key={t.id} className={`tab ${chartTab === t.id ? 'active' : ''}`} onClick={() => setChartTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {chartTab === 'revenue' && (
            <div className="card mb-4">
              <div className="card-header">
                <div>
                  <div className="card-title">Omnichannel Revenue Velocity</div>
                  <div className="card-subtitle">Daily sales trajectory across Shop and Godown operations</div>
                </div>
              </div>
              <div style={{ height: 360 }}>
                {chartData.dates.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">Insufficient Data</div></div>
                  : <Line data={chartData.revenueLine} options={{ ...commonChartOpts, plugins: { ...commonChartOpts.plugins, tooltip: { ...commonChartOpts.plugins.tooltip, mode: 'index' } } }} plugins={[shadowPlugin]} />}
              </div>
            </div>
          )}

          {chartTab === 'products' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Top Moving Products</div>
                    <div className="card-subtitle">Highest grossing SKUs by volume</div>
                  </div>
                </div>
                <div style={{ height: 380 }}>
                  {chartData.topProductsData.length === 0 ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No Product Data</div></div>
                    : <Bar data={chartData.topProductsBar} options={{ ...commonChartOpts, indexAxis: 'y' }} />}
                </div>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-header" style={{ padding: '24px 24px 0' }}>
                  <div className="card-title">SKU Performance Matrix</div>
                </div>
                <div className="table-wrapper" style={{ border: 'none', boxShadow: 'none', borderRadius: 0, marginTop: 16 }}>
                  <table>
                    <thead><tr><th>Rank</th><th>Product / Brand</th><th>Qty</th><th>Gross (৳)</th></tr></thead>
                    <tbody>
                      {pgTopProducts.paged.map(([name, v], i) => (
                        <tr key={name}>
                          <td><span className="badge badge-gray">#{pgTopProducts.startRecord + i}</span></td>
                          <td>
                            <div className="td-bold">{name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.brand}</div>
                          </td>
                          <td>{v.qty}</td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{v.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                      {chartData.topProductsData.length === 0 && <tr><td colSpan="4" className="text-center" style={{padding:40, color:'var(--text-muted)'}}>No sales recorded in this period</td></tr>}
                    </tbody>
                  </table>
                </div>
                {chartData.topProductsData.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                    <Pagination 
                      page={pgTopProducts.page} totalPages={pgTopProducts.totalPages} total={pgTopProducts.total}
                      startRecord={pgTopProducts.startRecord} endRecord={pgTopProducts.endRecord} perPage={pgTopProducts.perPage}
                      onPageChange={pgTopProducts.goTo} onPerPageChange={pgTopProducts.setPerPage}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {chartTab === 'marketing' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Brand Affinity Breakdown</div>
                    <div className="card-subtitle">Revenue distribution across product brands</div>
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  {chartData.brandDoughnut.labels.length === 0 ? <div className="empty-state"><div className="empty-title">No Data</div></div>
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {chartData.brandDoughnut.labels.map((label, i) => {
                          const val = chartData.brandDoughnut.datasets[0].data[i];
                          const total = chartData.brandDoughnut.datasets[0].data.reduce((a, b) => a + b, 0);
                          const pctRaw = total > 0 ? (val / total) * 100 : 0;
                          const pct = pctRaw > 0 && pctRaw < 0.1 ? '<0.1' : pctRaw.toFixed(1);
                          const color = premiumPalette[i % premiumPalette.length];
                          return (
                            <div key={label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)' }}>৳{val.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, marginLeft: 4 }}>({pct}%)</span></span>
                              </div>
                              <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.max(val > 0 ? 1 : 0, pctRaw)}%`, background: color, borderRadius: 4 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Channel Distribution</div>
                    <div className="card-subtitle">Retail Shop vs B2B Godown comparison</div>
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  {processedData.metrics.revenue === 0 ? <div className="empty-state"><div className="empty-title">No Data</div></div>
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['Shop Sales', 'Godown Sales'].map((label, i) => {
                          const val = chartData.splitDoughnut.datasets[0].data[i];
                          const total = processedData.metrics.revenue;
                          const pctRaw = total > 0 ? (val / total) * 100 : 0;
                          const pct = pctRaw > 0 && pctRaw < 0.1 ? '<0.1' : pctRaw.toFixed(1);
                          const color = chartData.splitDoughnut.datasets[0].backgroundColor[i];
                          return (
                            <div key={label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gold)' }}>৳{val.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, marginLeft: 4 }}>({pct}%)</span></span>
                              </div>
                              <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.max(val > 0 ? 1 : 0, pctRaw)}%`, background: color, borderRadius: 4 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {chartTab === 'finance' && (
            <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Payment Methods Breakdown</div>
                  <div className="card-subtitle">Revenue distribution across payment channels</div>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                {chartData.paymentDoughnut.labels.length === 0 ? <div className="empty-state"><div className="empty-title">No Data</div></div>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {chartData.paymentDoughnut.labels.map((label, i) => {
                        const val = chartData.paymentDoughnut.datasets[0].data[i];
                        const total = chartData.paymentDoughnut.datasets[0].data.reduce((a, b) => a + b, 0);
                        const pctRaw = total > 0 ? (val / total) * 100 : 0;
                        const pct = pctRaw > 0 && pctRaw < 0.1 ? '<0.1' : pctRaw.toFixed(1);
                        const paletteReversed = [...premiumPalette].reverse();
                        const color = paletteReversed[i % paletteReversed.length];
                        return (
                          <div key={label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
                                <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                              </div>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--gold)' }}>৳{val.toLocaleString()} <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, marginLeft: 4 }}>({pct}%)</span></span>
                            </div>
                            <div style={{ height: 10, background: 'var(--bg-elevated)', borderRadius: 5, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.max(val > 0 ? 1 : 0, pctRaw)}%`, background: color, borderRadius: 5 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

