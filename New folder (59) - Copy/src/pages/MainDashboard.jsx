import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import { usePagination } from '../hooks/usePagination';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, ShoppingBag, Truck, FileText, ArrowUpRight, DollarSign, Wallet, Package, Clock, ShieldCheck, Activity, X, Eye, CreditCard, Layers, Calendar, User, Search, Store, Warehouse, Banknote, Receipt } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#64748b',
        font: { family: 'Inter, sans-serif', size: 12, weight: '600' },
        usePointStyle: true
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleFont: { size: 13, weight: '700' },
      bodyFont: { size: 12 },
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: { color: '#64748b', font: { size: 11 } }
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.08)' },
      ticks: { color: '#64748b', font: { size: 11 } }
    }
  }
};

export default function MainDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [stats, setStats] = useState({
    shopSales: 0,
    godownSales: 0,
    shopRevenue: 0,
    godownRevenue: 0,
    shopProducts: 0,
    godownProducts: 0,
    pendingDispatches: 0,
    todayShopSales: 0,
    todayGodownSales: 0,
    todayShopRevenue: 0,
    todayGodownRevenue: 0,
    todayRevenue: 0,
    paymentMethodsBreakdown: {},
    todaySalesList: [],
    todayShopSalesList: [],
    todayGodownSalesList: [],
    allShopSalesList: [],
    allGodownSalesList: []
  });

  const [recentSales, setRecentSales] = useState([]);
  const [recentClosings, setRecentClosings] = useState([]);
  const [pendingDispatchesList, setPendingDispatchesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Layout control tabs for clean organization
  const [kpiSectionTab, setKpiSectionTab] = useState('financial'); // 'financial' | 'inventory'
  const [activityTab, setActivityTab] = useState('transactions'); // 'transactions' | 'closings' | 'dispatches'
  const [activitySearch, setActivitySearch] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [shopSalesSnap, godownSalesSnap, shopInvSnap, godownStockSnap, pendingSnap, closingsSnap] = await Promise.all([
          getDocs(query(collection(db, 'shop_sales'), orderBy('saleDate', 'desc'), limit(60))),
          getDocs(query(collection(db, 'godown_sales'), orderBy('saleDate', 'desc'), limit(60))),
          getDocs(collection(db, 'shop_inventory')),
          getDocs(collection(db, 'godown_stock')),
          getDocs(query(collection(db, 'dispatch_logs'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'daily_closing'), orderBy('date', 'desc'), limit(15))),
        ]);

        const shopSales = shopSalesSnap.docs
          .map(d => ({ ...d.data(), id: d.id, source: 'Shop' }))
          .filter(s => s.status !== 'deleted' && s.status !== 'delete_requested');
        const godownSales = godownSalesSnap.docs
          .map(d => ({ ...d.data(), id: d.id, source: 'Godown' }))
          .filter(s => s.status !== 'deleted' && s.status !== 'delete_requested');

        const today = new Date().toDateString();
        const todayShopSales = shopSales.filter(s => s.saleDate?.toDate?.()?.toDateString() === today);
        const todayGodownSales = godownSales.filter(s => s.saleDate?.toDate?.()?.toDateString() === today);
        const todaySales = [...todayShopSales, ...todayGodownSales];

        const paymentMethodsBreakdown = {};
        todaySales.forEach(s => {
          const method = (s.paymentMethod || 'Cash').trim();
          paymentMethodsBreakdown[method] = (paymentMethodsBreakdown[method] || 0) + (s.netAmount || s.totalAmount || 0);
        });

        const pendingList = pendingSnap.docs.map(d => ({ ...d.data(), id: d.id }));

        setStats({
          shopSales: shopSales.length,
          godownSales: godownSales.length,
          shopRevenue: shopSales.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0),
          godownRevenue: godownSales.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0),
          shopProducts: shopInvSnap.docs.filter(d => (d.data().qty || 0) > 0).length,
          godownProducts: godownStockSnap.docs.filter(d => (d.data().qtyInStock || 0) > 0).length,
          pendingDispatches: pendingSnap.size,
          todayShopSales: todayShopSales.length,
          todayGodownSales: todayGodownSales.length,
          todayShopRevenue: todayShopSales.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0),
          todayGodownRevenue: todayGodownSales.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0),
          todayRevenue: todaySales.reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0),
          paymentMethodsBreakdown,
          todaySalesList: todaySales,
          todayShopSalesList: todayShopSales,
          todayGodownSalesList: todayGodownSales,
          allShopSalesList: shopSales,
          allGodownSalesList: godownSales
        });

        setPendingDispatchesList(pendingList);

        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toDateString();
        }).reverse();

        const shopTrend = last7Days.map(date =>
          shopSales.filter(s => s.saleDate?.toDate?.()?.toDateString() === date).reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0)
        );
        const godownTrend = last7Days.map(date =>
          godownSales.filter(s => s.saleDate?.toDate?.()?.toDateString() === date).reduce((a, s) => a + (s.netAmount || s.totalAmount || 0), 0)
        );

        setChartData({
          labels: last7Days.map(d => {
            const dt = new Date(d);
            return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          }),
          datasets: [
            {
              label: 'Shop Retail Revenue',
              data: shopTrend,
              borderColor: '#0d9488',
              backgroundColor: 'rgba(13, 148, 136, 0.14)',
              fill: true,
              tension: 0.38,
              pointBackgroundColor: '#0d9488',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Godown Wholesale Revenue',
              data: godownTrend,
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.12)',
              fill: true,
              tension: 0.38,
              pointBackgroundColor: '#7c3aed',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        });

        setRecentSales([...shopSales, ...godownSales].sort((a, b) => (b.saleDate?.toDate?.() || 0) - (a.saleDate?.toDate?.() || 0)));
        setRecentClosings(closingsSnap.docs.map(d => ({ ...d.data(), id: d.id })));
      } catch {
        toast.error('Failed to load dashboard.');
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // Filtered Activity List for clean search & organization
  const filteredSales = recentSales.filter(s => {
    if (!activitySearch.trim()) return true;
    const q = activitySearch.toLowerCase();
    return (
      (s.receiptNo && String(s.receiptNo).toLowerCase().includes(q)) ||
      (s.source && s.source.toLowerCase().includes(q)) ||
      (s.soldByName && s.soldByName.toLowerCase().includes(q)) ||
      (s.paymentMethod && s.paymentMethod.toLowerCase().includes(q))
    );
  });

  const pgSales = usePagination(filteredSales, isMobile ? 6 : 8);

  if (loading) {
    return (
      <div className="page-container animate-fade-in" style={{ padding: isMobile ? 12 : 24 }}>
        <div className="skeleton skeleton-card" style={{ height: 84, marginBottom: 20 }}></div>
        <div className="stat-grid mb-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 120 }}></div>)}
        </div>
        <div className="skeleton skeleton-card" style={{ height: 320, marginBottom: 20 }}></div>
      </div>
    );
  }

  const totalRevenue = stats.shopRevenue + stats.godownRevenue;

  return (
    <div
      className="page-container animate-fade-in"
      style={{
        padding: isMobile ? '12px' : '24px 28px',
        overflowX: 'hidden',
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}
    >
      {/* =========================================================
          CLICK-TO-INSPECT DETAIL MODAL DRAWER
          ========================================================= */}
      {selectedDetail && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDetail(null); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? 0 : 20
          }}
        >
          <div style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : 780,
            maxHeight: isMobile ? '88vh' : '90vh',
            background: '#FFFFFF',
            borderRadius: isMobile ? '22px 22px 0 0' : 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: isMobile ? 'slideUp 0.25s ease-out' : 'scaleIn 0.2s ease-out'
          }}>
            {isMobile && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
                <div style={{ width: 44, height: 4, borderRadius: 99, background: '#cbd5e1' }} />
              </div>
            )}

            {/* Modal Header */}
            <div style={{
              padding: isMobile ? '14px 18px' : '18px 24px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-gray" style={{ fontSize: 10 }}>
                    DASHBOARD INSPECTOR
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Live Enterprise Data</span>
                </div>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {selectedDetail.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  background: '#FFFFFF', color: '#475569',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: isMobile ? '16px' : '22px 24px', overflowY: 'auto', flex: 1 }}>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid rgba(0, 0, 0, 0.07)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13, color: '#334155'
              }}>
                {selectedDetail.subtitle}
              </div>

              {/* TRANSACTIONS LIST VIEW */}
              {['today_revenue', 'today_shop_sales', 'today_godown_sales', 'alltime_revenue', 'payment_methods'].includes(selectedDetail.type) && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 10, marginBottom: 18
                  }}>
                    {selectedDetail.total !== undefined && (
                      <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>TOTAL AMOUNT</div>
                        <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                          ৳{Number(selectedDetail.total || 0).toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedDetail.shopRevenue !== undefined && (
                      <div style={{ background: '#F0FDF4', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                        <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700 }}>SHOP RETAIL</div>
                        <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: '#166534', marginTop: 4 }}>
                          ৳{selectedDetail.shopRevenue.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedDetail.godownRevenue !== undefined && (
                      <div style={{ background: '#FFFBEB', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                        <div style={{ fontSize: 10, color: '#b45309', fontWeight: 700 }}>GODOWN WHOLESALE</div>
                        <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: '#92400e', marginTop: 4 }}>
                          ৳{selectedDetail.godownRevenue.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {selectedDetail.breakdown && Object.entries(selectedDetail.breakdown).map(([method, amt]) => (
                      <div key={method} style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{method.toUpperCase()}</div>
                        <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                          ৳{Number(amt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
                    Transaction Records ({selectedDetail.transactions?.length || 0})
                  </div>

                  {(!selectedDetail.transactions || selectedDetail.transactions.length === 0) ? (
                    <div className="empty-state" style={{ padding: '30px 0' }}>
                      <div className="empty-title">No transactions found</div>
                    </div>
                  ) : isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedDetail.transactions.map((tx, idx) => (
                        <div key={tx.id || idx} style={{
                          background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{tx.receiptNo || '—'}</span>
                            <span className={`badge ${tx.source === 'Shop' ? 'badge-teal' : 'badge-amber'}`}>
                              {tx.source || 'Shop'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                            <span>By: {tx.soldByName || tx.soldBy || 'Staff'}</span>
                            <span>{tx.paymentMethod || 'Cash'}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6 }}>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{tx.saleDate?.toDate?.()?.toLocaleTimeString() || 'Today'}</span>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                              ৳{(tx.netAmount || tx.totalAmount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>RECEIPT</th>
                            <th>CHANNEL</th>
                            <th>ISSUED BY</th>
                            <th>METHOD</th>
                            <th>TIMESTAMP</th>
                            <th style={{ textAlign: 'right' }}>AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDetail.transactions.map((tx, idx) => (
                            <tr key={tx.id || idx}>
                              <td style={{ fontWeight: 700 }}>{tx.receiptNo || '—'}</td>
                              <td><span className={`badge ${tx.source === 'Shop' ? 'badge-teal' : 'badge-amber'}`}>{tx.source || 'Shop'}</span></td>
                              <td>{tx.soldByName || tx.soldBy || 'Staff'}</td>
                              <td><span className="badge badge-gray">{tx.paymentMethod || 'Cash'}</span></td>
                              <td style={{ color: '#64748b', fontSize: 12 }}>{tx.saleDate?.toDate?.()?.toLocaleString() || '—'}</td>
                              <td style={{ textAlign: 'right', fontWeight: 800 }}>৳{(tx.netAmount || tx.totalAmount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SINGLE TRANSACTION DETAILS */}
              {selectedDetail.type === 'single_transaction' && selectedDetail.transaction && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 10, marginBottom: 18
                  }}>
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>RECEIPT #</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{selectedDetail.transaction.receiptNo}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>CHANNEL</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{selectedDetail.transaction.source}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>PAYMENT</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{selectedDetail.transaction.paymentMethod || 'Cash'}</div>
                    </div>
                    <div style={{ background: '#F0FDF4', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                      <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700 }}>NET AMOUNT</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginTop: 4 }}>
                        ৳{(selectedDetail.transaction.netAmount || selectedDetail.transaction.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Itemized Products</div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>PRODUCT</th>
                          <th>UNIT PRICE</th>
                          <th>QTY</th>
                          <th style={{ textAlign: 'right' }}>SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedDetail.transaction.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700 }}>{item.productName || item.name || 'Product'}</td>
                            <td>৳{Number(item.unitPrice || item.price || 0).toLocaleString()}</td>
                            <td><b>{item.qty || item.quantity || 1}</b></td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>
                              ৳{Number((item.qty || 1) * (item.unitPrice || item.price || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SINGLE CLOSING DETAILS */}
              {selectedDetail.type === 'single_closing' && selectedDetail.closing && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>CLOSING DATE</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                        {selectedDetail.closing.date?.toDate?.()?.toLocaleDateString() || '—'}
                      </div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>ENTERED BY</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                        {selectedDetail.closing.enteredByName || 'Admin'}
                      </div>
                    </div>
                    <div style={{ background: '#F0FDF4', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                      <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700 }}>RECONCILED CASH</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#166534', marginTop: 4 }}>
                        ৳{(selectedDetail.closing.cashAmount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {selectedDetail.closing.notes && (
                    <div style={{ background: '#FFFBEB', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                      <div style={{ fontSize: 10, color: '#b45309', fontWeight: 700 }}>REMARKS</div>
                      <div style={{ fontSize: 13, color: '#92400e', marginTop: 4 }}>{selectedDetail.closing.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* INVENTORY / DISPATCH COUNTS */}
              {['shop_products', 'godown_products', 'pending_dispatches'].includes(selectedDetail.type) && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#0f172a' }}>{selectedDetail.count}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginTop: 6 }}>{selectedDetail.subtitle}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}>
              <button
                onClick={() => setSelectedDetail(null)}
                style={{
                  background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#334155'
                }}
              >
                Close
              </button>
              {selectedDetail.targetRoute && (
                <button
                  onClick={() => {
                    const r = selectedDetail.targetRoute;
                    setSelectedDetail(null);
                    navigate(r);
                  }}
                  style={{
                    background: '#0f172a', border: 'none', borderRadius: 8,
                    padding: '8px 16px', fontSize: 13, fontWeight: 700,
                    color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  Open Dedicated Page <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EXECUTIVE HERO BAR (Clean & Uncluttered)
          ========================================================= */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: 14,
        padding: isMobile ? '14px 16px' : '18px 24px',
        marginBottom: 20,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: 14,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: isMobile ? 40 : 44, height: isMobile ? 40 : 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--gold) 0%, #b45309 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: isMobile ? 16 : 19, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Enterprise Operations Command Center
              </h1>
              <span className="badge badge-gold" style={{ fontSize: 10 }}>LIVE</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Executive oversight of retail Shop, wholesale Godown, inventory levels, and EOD Hisab.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/revenue-tracker')}
            className="btn btn-primary"
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
          >
            <TrendingUp size={15} /> Day-Wise Revenue &amp; Hisab Register &rarr;
          </button>
        </div>
      </div>

      {/* =========================================================
          SECTION 1: ORGANIZED EXECUTIVE KPI CONTROL DECK
          Clean Tab Switcher between "Today's Financial Pulse" & "Stock & All-Time Overview"
          ========================================================= */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.015) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 14,
        padding: isMobile ? '16px' : '20px 24px',
        marginBottom: 20,
        boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
      }}>
        {/* Header with clean view toggle pills */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
              {kpiSectionTab === 'financial' ? "Today's Live Financial Pulse" : "Departmental Stock & All-Time Ledger"}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Click any card to inspect full itemized details
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'rgba(255, 255, 255, 0.05)', padding: 4, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              type="button"
              onClick={() => setKpiSectionTab('financial')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: kpiSectionTab === 'financial' ? '#0f172a' : 'transparent',
                color: kpiSectionTab === 'financial' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.18s ease'
              }}
            >
              Today's Financials
            </button>
            <button
              type="button"
              onClick={() => setKpiSectionTab('inventory')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: kpiSectionTab === 'inventory' ? '#0f172a' : 'transparent',
                color: kpiSectionTab === 'inventory' ? '#FFFFFF' : 'var(--text-secondary)',
                transition: 'all 0.18s ease'
              }}
            >
              Stock &amp; All-Time Overview
            </button>
          </div>
        </div>

        {/* Tab 1: Today's Financial Pulse */}
        {kpiSectionTab === 'financial' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14
          }}>
            {/* Today's Revenue */}
            <div
              onClick={() => setSelectedDetail({
                type: 'today_revenue',
                title: "Today's Total Enterprise Revenue",
                subtitle: "Combined collections from Shop retail counter and Godown wholesale deliveries today.",
                total: stats.todayRevenue,
                shopRevenue: stats.todayShopRevenue,
                godownRevenue: stats.todayGodownRevenue,
                transactions: stats.todaySalesList,
                targetRoute: '/revenue-tracker'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 12, padding: isMobile ? 14 : 18, cursor: 'pointer',
                boxShadow: '0 4px 14px -3px rgba(0, 0, 0, 0.14)', transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Today's Total Turnover</span>
                <span className="badge badge-gold">INSPECT</span>
              </div>
              <div style={{ fontSize: isMobile ? 26 : 30, fontWeight: 900, color: '#0f172a' }}>
                ৳{stats.todayRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 10, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                <span>Shop: <b style={{ color: '#0d9488' }}>৳{stats.todayShopRevenue.toLocaleString()}</b></span>
                <span>Godown: <b style={{ color: '#7c3aed' }}>৳{stats.todayGodownRevenue.toLocaleString()}</b></span>
              </div>
            </div>

            {/* Shop Retail Today */}
            <div
              onClick={() => setSelectedDetail({
                type: 'today_shop_sales',
                title: "Today's Retail Shop Counter Sales",
                subtitle: "All retail invoices generated at the counter today.",
                total: stats.todayShopRevenue,
                transactions: stats.todayShopSalesList,
                targetRoute: '/shop/sales'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 12, padding: isMobile ? 14 : 18, cursor: 'pointer',
                boxShadow: '0 4px 14px -3px rgba(0, 0, 0, 0.14)', transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>Shop Retail Sales</span>
                <span className="badge badge-teal">RETAIL</span>
              </div>
              <div style={{ fontSize: isMobile ? 26 : 30, fontWeight: 900, color: '#0f172a' }}>
                {stats.todayShopSales} <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>orders</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                Collected: <b style={{ color: '#0f172a' }}>৳{stats.todayShopRevenue.toLocaleString()}</b> today
              </div>
            </div>

            {/* Godown Wholesale Today */}
            <div
              onClick={() => setSelectedDetail({
                type: 'today_godown_sales',
                title: "Today's Godown Wholesale Orders",
                subtitle: "All wholesale orders fulfilled from warehouse stock today.",
                total: stats.todayGodownRevenue,
                transactions: stats.todayGodownSalesList,
                targetRoute: '/godown/sales'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 12, padding: isMobile ? 14 : 18, cursor: 'pointer',
                boxShadow: '0 4px 14px -3px rgba(0, 0, 0, 0.14)', transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>Godown Wholesale</span>
                <span className="badge badge-purple">WHOLESALE</span>
              </div>
              <div style={{ fontSize: isMobile ? 26 : 30, fontWeight: 900, color: '#0f172a' }}>
                {stats.todayGodownSales} <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>orders</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                Collected: <b style={{ color: '#0f172a' }}>৳{stats.todayGodownRevenue.toLocaleString()}</b> today
              </div>
            </div>

            {/* Payment Methods Split */}
            <div
              onClick={() => setSelectedDetail({
                type: 'payment_methods',
                title: "Today's Payment Channels Split",
                subtitle: "Breakdown of Cash vs Mobile vs Bank collections today.",
                breakdown: stats.paymentMethodsBreakdown,
                transactions: stats.todaySalesList,
                targetRoute: '/revenue-tracker'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 12, padding: isMobile ? 14 : 18, cursor: 'pointer',
                boxShadow: '0 4px 14px -3px rgba(0, 0, 0, 0.14)', transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>Payment Split</span>
                <span className="badge badge-blue">METHODS</span>
              </div>
              <div style={{ fontSize: isMobile ? 24 : 26, fontWeight: 900, color: '#0f172a' }}>
                Cash: ৳{(stats.paymentMethodsBreakdown['Cash'] || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                Click to inspect Cash, bKash, Card &amp; Bank split
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Stock & All-Time Overview */}
        {kpiSectionTab === 'inventory' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14
          }}>
            <div
              onClick={() => setSelectedDetail({
                type: 'shop_products',
                title: "Shop Active SKUs Overview",
                subtitle: "Active retail SKUs currently available in the shop.",
                count: stats.shopProducts,
                targetRoute: '/shop'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12, padding: 16, cursor: 'pointer', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.14)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Shop Inventory</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginTop: 6 }}>
                {stats.shopProducts} <span style={{ fontSize: 13, color: '#64748b' }}>SKUs</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedDetail({
                type: 'godown_products',
                title: "Godown Warehouse SKUs Overview",
                subtitle: "Active wholesale SKUs currently stored in the warehouse.",
                count: stats.godownProducts,
                targetRoute: '/godown'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12, padding: 16, cursor: 'pointer', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.14)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Godown Inventory</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginTop: 6 }}>
                {stats.godownProducts} <span style={{ fontSize: 13, color: '#64748b' }}>SKUs</span>
              </div>
            </div>

            <div
              onClick={() => setSelectedDetail({
                type: 'alltime_revenue',
                title: "All-Time Cumulative Enterprise Revenue",
                subtitle: "Complete total of all historical transactions across Shop & Godown.",
                total: totalRevenue,
                shopRevenue: stats.shopRevenue,
                godownRevenue: stats.godownRevenue,
                transactions: recentSales,
                targetRoute: '/revenue-tracker'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12, padding: 16, cursor: 'pointer', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.14)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>All-Time Revenue</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginTop: 6 }}>
                ৳{totalRevenue.toLocaleString()}
              </div>
            </div>

            <div
              onClick={() => setSelectedDetail({
                type: 'pending_dispatches',
                title: "Pending Warehouse Dispatches",
                subtitle: "Orders currently awaiting warehouse dispatch fulfillment.",
                count: stats.pendingDispatches,
                targetRoute: '/godown/requests'
              })}
              style={{
                background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12, padding: 16, cursor: 'pointer', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.14)'
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>Pending Dispatches</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginTop: 6 }}>
                {stats.pendingDispatches} <span style={{ fontSize: 13, color: '#64748b' }}>orders</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          SECTION 2: ENTERPRISE SALES VELOCITY CHART
          ========================================================= */}
      {chartData && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: isMobile ? '16px' : '20px',
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
              7-Day Channel Performance Trend
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Daily collections comparison</span>
          </div>
          <div style={{ height: isMobile ? 200 : 250 }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 3: ORGANIZED ACTIVITY COMMAND CENTER
          Clean Tabbed Interface replacing two messy side-by-side tables
          ========================================================= */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.055) 0%, rgba(255, 255, 255, 0.015) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 14,
        boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden'
      }}>
        {/* Activity Center Header & Tabs */}
        <div style={{
          padding: isMobile ? '14px 16px' : '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActivityTab('transactions')}
              className={`btn btn-sm ${activityTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: 700 }}
            >
              Recent Transactions ({recentSales.length})
            </button>
            <button
              type="button"
              onClick={() => setActivityTab('closings')}
              className={`btn btn-sm ${activityTab === 'closings' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: 700 }}
            >
              Daily Hisab Closings ({recentClosings.length})
            </button>
            <button
              type="button"
              onClick={() => setActivityTab('dispatches')}
              className={`btn btn-sm ${activityTab === 'dispatches' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: 700 }}
            >
              Pending Dispatches ({pendingDispatchesList.length})
            </button>
          </div>

          {activityTab === 'transactions' && (
            <div style={{ position: 'relative', width: isMobile ? '100%' : 240 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search receipt, cashier, channel..."
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
              />
            </div>
          )}
        </div>

        {/* TAB 1: TRANSACTIONS FEED */}
        {activityTab === 'transactions' && (
          <div>
            {filteredSales.length === 0 ? (
              <div className="empty-state" style={{ padding: 48 }}>
                <div className="empty-title">No transactions match search</div>
              </div>
            ) : isMobile ? (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pgSales.paged.map(s => (
                  <div
                    key={s.id + s.source}
                    onClick={() => setSelectedDetail({
                      type: 'single_transaction',
                      title: `Receipt #${s.receiptNo} (${s.source})`,
                      subtitle: `Issued by ${s.soldByName || s.soldBy || 'Staff'} on ${s.saleDate?.toDate?.()?.toLocaleString() || '—'}`,
                      transaction: s
                    })}
                    style={{
                      background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{s.receiptNo}</span>
                      <span className={`badge ${s.source === 'Shop' ? 'badge-teal' : 'badge-amber'}`}>
                        {s.source}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569' }}>
                      <span>By: {s.soldByName || s.soldBy || 'Staff'}</span>
                      <span>{s.saleDate?.toDate?.()?.toLocaleDateString() || 'Today'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6 }}>
                      <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 700 }}>Inspect Receipt &rarr;</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                        ৳{(s.netAmount || s.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Receipt</th>
                      <th>Channel</th>
                      <th>Amount (BDT)</th>
                      <th>Issued By</th>
                      <th>Payment Method</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pgSales.paged.map(s => (
                      <tr
                        key={s.id + s.source}
                        onClick={() => setSelectedDetail({
                          type: 'single_transaction',
                          title: `Receipt #${s.receiptNo} (${s.source})`,
                          subtitle: `Issued by ${s.soldByName || s.soldBy || 'Staff'} on ${s.saleDate?.toDate?.()?.toLocaleString() || '—'}`,
                          transaction: s
                        })}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ fontWeight: 700 }}>{s.receiptNo}</td>
                        <td><span className={`badge ${s.source === 'Shop' ? 'badge-teal' : 'badge-amber'}`}>{s.source}</span></td>
                        <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>৳{(s.netAmount || s.totalAmount || 0).toLocaleString()}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{s.soldByName || s.soldBy || 'Staff'}</td>
                        <td><span className="badge badge-gray">{s.paymentMethod || 'Cash'}</span></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.saleDate?.toDate?.()?.toLocaleString() || '—'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 700 }}>Inspect &rarr;</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredSales.length > 0 && (
              <div style={{ padding: '10px 16px', background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <Pagination
                  page={pgSales.page} totalPages={pgSales.totalPages} total={pgSales.total}
                  startRecord={pgSales.startRecord} endRecord={pgSales.endRecord} perPage={pgSales.perPage}
                  onPageChange={pgSales.goTo} onPerPageChange={pgSales.setPerPage}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DAILY CLOSINGS FEED */}
        {activityTab === 'closings' && (
          <div style={{ padding: 16 }}>
            {recentClosings.length === 0 ? (
              <div className="empty-state" style={{ padding: 36 }}>
                <div className="empty-title">No daily closings logged</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentClosings.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedDetail({
                      type: 'single_closing',
                      title: `Daily Hisab Closing (${c.date?.toDate?.()?.toLocaleDateString() || '—'})`,
                      subtitle: `Entered by ${c.enteredByName || 'Admin'}`,
                      closing: c,
                      targetRoute: '/revenue-tracker'
                    })}
                    style={{
                      background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 10, padding: '14px 18px', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                        {c.date?.toDate?.()?.toLocaleDateString() || '—'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Entered by {c.enteredByName || 'Admin'} &bull; Status: <b style={{ color: c.status === 'balanced' ? '#10b981' : '#ef4444' }}>{c.status?.toUpperCase() || 'BALANCED'}</b>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        ৳{(c.cashAmount || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 700 }}>Inspect Hisab &rarr;</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENDING DISPATCHES */}
        {activityTab === 'dispatches' && (
          <div style={{ padding: 16 }}>
            {pendingDispatchesList.length === 0 ? (
              <div className="empty-state" style={{ padding: 36 }}>
                <div className="empty-title">Zero Pending Dispatches</div>
                <div className="empty-desc">All warehouse delivery requests are fulfilled.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingDispatchesList.map(d => (
                  <div
                    key={d.id}
                    onClick={() => navigate('/godown/requests')}
                    style={{
                      background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 10, padding: '14px 18px', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                        Order #{d.receiptNo || d.orderId || d.id}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        Customer: {d.customerName || 'Wholesale Client'} &bull; Items: {d.items?.length || 1} SKUs
                      </div>
                    </div>
                    <span className="badge badge-amber">PENDING DISPATCH</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
