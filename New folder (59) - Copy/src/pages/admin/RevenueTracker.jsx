import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { downloadCSV } from '../../utils/csvExport';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download, 
  Search, 
  Store, 
  Warehouse, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  Banknote,
  FileText,
  Calculator,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';

export default function RevenueTracker() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [shopSales, setShopSales] = useState([]);
  const [godownSales, setGodownSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [returns, setReturns] = useState([]);
  const [closings, setClosings] = useState([]);

  const [timeRange, setTimeRange] = useState('last_30_days');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11, or 'all'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Clean Day Inspection Modal Drawer state
  const [selectedDayModal, setSelectedDayModal] = useState(null); // stores the day object
  const [drawerTab, setDrawerTab] = useState('hisab'); // 'hisab' | 'shop' | 'godown' | 'expenses'

  useEffect(() => {
    let mounted = true;
    async function fetchAllRecords() {
      setLoading(true);
      try {
        const [shopSnap, godownSnap, expSnap, retSnap, closeSnap] = await Promise.all([
          getDocs(query(collection(db, 'shop_sales'), orderBy('saleDate', 'desc'))),
          getDocs(query(collection(db, 'godown_sales'), orderBy('saleDate', 'desc'))),
          getDocs(query(collection(db, 'expense_entries'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'shop_returns'), orderBy('returnDate', 'desc'))),
          getDocs(query(collection(db, 'daily_closing'), orderBy('date', 'desc')))
        ]);
        if (!mounted) return;

        const ss = shopSnap.docs
          .map(d => ({ id: d.id, ...d.data(), source: 'Shop' }))
          .filter(s => s.status !== 'deleted' && s.status !== 'delete_requested');

        const gs = godownSnap.docs
          .map(d => ({ id: d.id, ...d.data(), source: 'Godown' }))
          .filter(s => s.status !== 'deleted' && s.status !== 'delete_requested');

        const ex = expSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const rt = retSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const cl = closeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        setShopSales(ss);
        setGodownSales(gs);
        setExpenses(ex);
        setReturns(rt);
        setClosings(cl);
      } catch (err) {
        console.error('Failed loading revenue tracker records:', err);
        toast.error('Could not load revenue & reconciliation records.');
      }
      if (mounted) setLoading(false);
    }
    fetchAllRecords();
    return () => { mounted = false; };
  }, []);

  // Timeframe boundaries helper
  const dateRangeBounds = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    let start = new Date(0);
    let end = new Date(2100, 0, 1);

    if (timeRange === 'today') {
      start = new Date(y, m, now.getDate(), 0, 0, 0, 0);
      end = new Date(y, m, now.getDate(), 23, 59, 59, 999);
    } else if (timeRange === 'last_7_days') {
      start = new Date();
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (timeRange === 'last_30_days') {
      start = new Date();
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    } else if (timeRange === 'this_month') {
      start = new Date(y, m, 1, 0, 0, 0, 0);
      end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    } else if (timeRange === 'last_month') {
      start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      end = new Date(y, m, 0, 23, 59, 59, 999);
    } else if (timeRange === 'monthly_year') {
      const yr = Number(selectedYear);
      if (selectedMonth === 'all') {
        start = new Date(yr, 0, 1, 0, 0, 0, 0);
        end = new Date(yr, 11, 31, 23, 59, 59, 999);
      } else {
        const mn = Number(selectedMonth);
        start = new Date(yr, mn, 1, 0, 0, 0, 0);
        end = new Date(yr, mn + 1, 0, 23, 59, 59, 999);
      }
    } else if (timeRange === 'custom') {
      if (customStart) start = new Date(customStart + 'T00:00:00');
      if (customEnd) end = new Date(customEnd + 'T23:59:59');
    }
    return { start, end };
  }, [timeRange, selectedYear, selectedMonth, customStart, customEnd]);

  // Estimate item cost & profit
  const calculateTxProfit = (sale) => {
    const gross = Number(sale.netAmount || sale.totalAmount || 0);
    let estimatedCost = 0;
    if (Array.isArray(sale.items) && sale.items.length > 0) {
      sale.items.forEach(it => {
        const qty = Number(it.qty) || 0;
        const cost = Number(it.costPrice || (Number(it.unitPrice || 0) * 0.78));
        estimatedCost += qty * cost;
      });
    } else {
      estimatedCost = gross * 0.78;
    }
    const profit = gross - estimatedCost;
    return { gross, estimatedCost, profit };
  };

  const getDocDateKey = (val) => {
    const d = val?.toDate?.() || (val ? new Date(val) : null);
    if (!d || isNaN(d)) return null;
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  // Group everything by Day (YYYY-MM-DD)
  const dayWiseData = useMemo(() => {
    const map = {};

    const ensureDay = (dateKey, dateObj) => {
      if (!map[dateKey]) {
        map[dateKey] = {
          dateKey,
          displayDate: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          dayOfWeek: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          shopTxCount: 0,
          shopRevenue: 0,
          godownTxCount: 0,
          godownRevenue: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalCost: 0,
          shopCashSales: 0,
          shopOtherSales: 0,
          paymentMethodsBreakdown: {},
          shopSalesList: [],
          godownSalesList: [],
          expensesList: [],
          returnsList: [],
          closingsList: []
        };
      }
      return map[dateKey];
    };

    shopSales.forEach(sale => {
      const d = sale.saleDate?.toDate?.();
      if (!d || d < dateRangeBounds.start || d > dateRangeBounds.end) return;
      const key = getDocDateKey(d);
      if (!key) return;
      if (searchQuery.trim() && !key.includes(searchQuery.trim())) return;

      const entry = ensureDay(key, d);
      const { gross, estimatedCost, profit } = calculateTxProfit(sale);

      entry.shopTxCount += 1;
      entry.shopRevenue += gross;
      entry.totalRevenue += gross;
      entry.totalCost += estimatedCost;
      entry.totalProfit += profit;
      entry.shopSalesList.push(sale);

      const method = (sale.paymentMethod || 'Cash').trim();
      entry.paymentMethodsBreakdown[method] = (entry.paymentMethodsBreakdown[method] || 0) + gross;

      if (method.toLowerCase() === 'cash') {
        entry.shopCashSales += gross;
      } else {
        entry.shopOtherSales += gross;
      }
    });

    godownSales.forEach(sale => {
      const d = sale.saleDate?.toDate?.();
      if (!d || d < dateRangeBounds.start || d > dateRangeBounds.end) return;
      const key = getDocDateKey(d);
      if (!key) return;
      if (searchQuery.trim() && !key.includes(searchQuery.trim())) return;

      const entry = ensureDay(key, d);
      const { gross, estimatedCost, profit } = calculateTxProfit(sale);

      entry.godownTxCount += 1;
      entry.godownRevenue += gross;
      entry.totalRevenue += gross;
      entry.totalCost += estimatedCost;
      entry.totalProfit += profit;
      entry.godownSalesList.push(sale);
    });

    expenses.forEach(exp => {
      const d = exp.date?.toDate?.() || (exp.date ? new Date(exp.date) : null);
      if (!d || d < dateRangeBounds.start || d > dateRangeBounds.end) return;
      const key = getDocDateKey(d);
      if (!key || !map[key]) return;
      map[key].expensesList.push(exp);
    });

    returns.forEach(ret => {
      const d = ret.returnDate?.toDate?.() || (ret.returnDate ? new Date(ret.returnDate) : null);
      if (!d || d < dateRangeBounds.start || d > dateRangeBounds.end) return;
      const key = getDocDateKey(d);
      if (!key || !map[key]) return;
      map[key].returnsList.push(ret);
    });

    closings.forEach(cl => {
      const d = cl.date?.toDate?.() || (cl.date ? new Date(cl.date) : null);
      if (!d || d < dateRangeBounds.start || d > dateRangeBounds.end) return;
      const key = getDocDateKey(d);
      if (!key || !map[key]) return;
      map[key].closingsList.push(cl);
    });

    Object.values(map).forEach(day => {
      const totalExpense = day.expensesList.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
      const cashReturns = day.returnsList.reduce((acc, r) => acc + ((r.refundMethod || 'Cash') === 'Cash' ? (Number(r.totalRefund) || 0) : 0), 0);
      const expectedShopCash = Math.max(0, day.shopCashSales - totalExpense - cashReturns);
      const latestClosing = day.closingsList[0] || null;

      day.hisabSummary = {
        shopCashSales: day.shopCashSales,
        shopOtherSales: day.shopOtherSales,
        totalExpense,
        cashReturns,
        expectedShopCash,
        declaredCash: latestClosing ? Number(latestClosing.actualCash || 0) : null,
        discrepancy: latestClosing ? Number(latestClosing.discrepancy || 0) : null,
        closingStatus: latestClosing ? latestClosing.status : null,
        closingNotes: latestClosing ? latestClosing.notes : null,
        enteredByName: latestClosing ? latestClosing.enteredByName : null
      };
    });

    return Object.values(map).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [shopSales, godownSales, expenses, returns, closings, dateRangeBounds, searchQuery]);

  // Aggregate summary KPIs
  const summaryKPIs = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    let shopRevenue = 0;
    let godownRevenue = 0;
    let totalTransactions = 0;
    let totalExpenses = 0;
    let balancedDays = 0;

    dayWiseData.forEach(d => {
      totalRevenue += d.totalRevenue;
      totalProfit += d.totalProfit;
      shopRevenue += d.shopRevenue;
      godownRevenue += d.godownRevenue;
      totalTransactions += (d.shopTxCount + d.godownTxCount);
      totalExpenses += d.hisabSummary.totalExpense;
      if (d.hisabSummary.closingStatus === 'balanced') balancedDays += 1;
    });

    const activeDays = dayWiseData.length || 1;
    const avgDailyRevenue = totalRevenue / activeDays;
    const profitMarginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalProfit,
      shopRevenue,
      godownRevenue,
      totalTransactions,
      totalExpenses,
      activeDays: dayWiseData.length,
      avgDailyRevenue,
      profitMarginPct,
      balancedDays
    };
  }, [dayWiseData]);

  const pgDays = usePagination(dayWiseData, isMobile ? 10 : 15);

  const openDayInspectionModal = (dayObj, initialTab = 'hisab') => {
    setSelectedDayModal(dayObj);
    setDrawerTab(initialTab);
  };

  const exportDayWiseCSV = () => {
    const rows = dayWiseData.map(d => ({
      'Date': d.dateKey,
      'Day': d.dayOfWeek,
      'Shop Sales Count': d.shopTxCount,
      'Shop Revenue (BDT)': d.shopRevenue.toFixed(2),
      'Shop Cash Sales (BDT)': d.shopCashSales.toFixed(2),
      'Shop Other Payments (BDT)': d.shopOtherSales.toFixed(2),
      'Godown Sales Count': d.godownTxCount,
      'Godown Revenue (BDT)': d.godownRevenue.toFixed(2),
      'Shopkeeper Expenses (BDT)': d.hisabSummary.totalExpense.toFixed(2),
      'Expected Shop Cash Drawer (BDT)': d.hisabSummary.expectedShopCash.toFixed(2),
      'Shop EOD Declared Cash (BDT)': d.hisabSummary.declaredCash !== null ? d.hisabSummary.declaredCash.toFixed(2) : 'Not Closed Yet',
      'Hisab Status': d.hisabSummary.closingStatus || 'Pending EOD',
      'Total Gross Revenue (BDT)': d.totalRevenue.toFixed(2),
      'Estimated Net Profit (BDT)': d.totalProfit.toFixed(2)
    }));
    downloadCSV(rows, `revenue-reconciliation-report-${timeRange}.csv`);
    toast.success('Complete Day-wise Revenue & Hisab Report exported.');
  };

  return (
    <div className="page-container animate-fade-in" style={{ padding: isMobile ? 12 : '24px 28px' }}>
      {/* =========================================================
          DAY HISAB INSPECTION MODAL DRAWER
          Opens cleanly without cluttering or scribbling the main table
          ========================================================= */}
      {selectedDayModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedDayModal(null); }}
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
            maxWidth: isMobile ? '100%' : 840,
            maxHeight: isMobile ? '90vh' : '90vh',
            background: '#FFFFFF',
            borderRadius: isMobile ? '24px 24px 0 0' : 16,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
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
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-gold" style={{ fontSize: 10 }}>DAY HISAB AUDIT</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{selectedDayModal.dateKey}</span>
                </div>
                <div style={{ fontSize: isMobile ? 16 : 19, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {selectedDayModal.displayDate} ({selectedDayModal.dayOfWeek})
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setSelectedDayModal(null)}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#FFFFFF', color: '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Drawer Tabs */}
            <div style={{
              padding: isMobile ? '10px 14px' : '12px 24px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              background: '#F8FAFC',
              display: 'flex',
              gap: 8,
              overflowX: 'auto'
            }}>
              <button
                type="button"
                onClick={() => setDrawerTab('hisab')}
                className={`btn btn-sm ${drawerTab === 'hisab' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                ★ Cash &amp; EOD Hisab Sheet
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('shop')}
                className={`btn btn-sm ${drawerTab === 'shop' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Shop Sales ({selectedDayModal.shopSalesList.length})
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('godown')}
                className={`btn btn-sm ${drawerTab === 'godown' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Godown Wholesale ({selectedDayModal.godownSalesList.length})
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('expenses')}
                className={`btn btn-sm ${drawerTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Expenses ({selectedDayModal.expensesList.length})
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: isMobile ? '16px' : '22px 24px', overflowY: 'auto', flex: 1 }}>
              {/* TAB 1: HISAB SHEET */}
              {drawerTab === 'hisab' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                  {/* System Cash Equation */}
                  <div style={{
                    background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 12, padding: 18, boxShadow: '0 4px 14px -4px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', letterSpacing: 0.6 }}>SYSTEM CASH EQUATION</span>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>Calculated</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                      <span style={{ color: '#475569' }}>Shop Retail Gross:</span>
                      <b style={{ color: '#0f172a' }}>৳{selectedDayModal.shopRevenue.toLocaleString()}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: '#16a34a' }}>
                      <span>(+) Cash Collected:</span>
                      <b>৳{selectedDayModal.shopCashSales.toLocaleString()}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: '#64748b' }}>
                      <span>Other Payments (Card/Mobile):</span>
                      <span>৳{selectedDayModal.shopOtherSales.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, color: '#dc2626' }}>
                      <span>(−) Petty Cash Expenses:</span>
                      <b>− ৳{selectedDayModal.hisabSummary.totalExpense.toLocaleString()}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 13, color: '#dc2626' }}>
                      <span>(−) Customer Cash Refunds:</span>
                      <b>− ৳{selectedDayModal.hisabSummary.cashReturns.toLocaleString()}</b>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', background: '#FEF3C7',
                      padding: '12px 14px', borderRadius: 8, fontSize: 14, fontWeight: 800, color: '#B45309',
                      border: '1px solid rgba(217, 119, 6, 0.3)'
                    }}>
                      <span>Expected Drawer Cash:</span>
                      <span>৳{selectedDayModal.hisabSummary.expectedShopCash.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Register EOD Declared Match */}
                  <div style={{
                    background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 12, padding: 18, boxShadow: '0 4px 14px -4px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#0d9488', letterSpacing: 0.6 }}>POS REGISTER EOD RECONCILIATION</span>
                      <span className="badge badge-teal" style={{ fontSize: 10 }}>POS Audit</span>
                    </div>

                    {selectedDayModal.hisabSummary.declaredCash !== null ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                          <span style={{ color: '#475569' }}>Cashier Physical Declared Count:</span>
                          <b style={{ color: '#0d9488', fontSize: 15 }}>৳{selectedDayModal.hisabSummary.declaredCash.toLocaleString()}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                          <span style={{ color: '#475569' }}>System Expected Cash Drawer:</span>
                          <b>৳{selectedDayModal.hisabSummary.expectedShopCash.toLocaleString()}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 13 }}>
                          <span style={{ color: '#475569' }}>Variance / Discrepancy:</span>
                          <b style={{ color: selectedDayModal.hisabSummary.discrepancy === 0 ? '#16a34a' : '#dc2626' }}>
                            {selectedDayModal.hisabSummary.discrepancy === 0 ? '৳0 (Balanced)' : `${selectedDayModal.hisabSummary.discrepancy > 0 ? '+' : ''}৳${selectedDayModal.hisabSummary.discrepancy}`}
                          </b>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <span className={`badge ${selectedDayModal.hisabSummary.closingStatus === 'balanced' ? 'badge-teal' : 'badge-red'}`} style={{ fontSize: 11 }}>
                            AUDIT STATUS: {selectedDayModal.hisabSummary.closingStatus.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            Closed by {selectedDayModal.hisabSummary.enteredByName || 'Shopkeeper'}
                          </span>
                        </div>
                        {selectedDayModal.hisabSummary.closingNotes && (
                          <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 8, fontSize: 12, color: '#334155', borderLeft: '3px solid #0d9488' }}>
                            <b>Cashier Note:</b> "{selectedDayModal.hisabSummary.closingNotes}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '24px 12px', textAlign: 'center' }}>
                        <AlertTriangle size={32} color="#d97706" style={{ margin: '0 auto 10px' }} />
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Shift Register Open</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                          Register closing report has not yet been submitted for this date.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SHOP SALES */}
              {drawerTab === 'shop' && (
                <div>
                  {selectedDayModal.shopSalesList.length === 0 ? (
                    <div className="empty-state" style={{ padding: 40 }}><div className="empty-title">No shop sales on this date</div></div>
                  ) : isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedDayModal.shopSalesList.map(tx => (
                        <div key={tx.id} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 13 }}>
                            <span>Receipt #{tx.receiptNo || tx.id}</span>
                            <span style={{ color: '#0d9488' }}>৳{(tx.netAmount || tx.totalAmount || 0).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            Customer: {tx.customerName || 'Walk-in'} &bull; Method: {tx.paymentMethod || 'Cash'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Receipt #</th>
                            <th>Customer</th>
                            <th>Payment Method</th>
                            <th>Gross Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDayModal.shopSalesList.map(tx => (
                            <tr key={tx.id}>
                              <td style={{ fontWeight: 700 }}>{tx.receiptNo || tx.id}</td>
                              <td>{tx.customerName || 'Walk-in Customer'}</td>
                              <td><span className="badge badge-gray">{tx.paymentMethod || 'Cash'}</span></td>
                              <td style={{ fontWeight: 800, color: '#0d9488' }}>৳{(tx.netAmount || tx.totalAmount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GODOWN SALES */}
              {drawerTab === 'godown' && (
                <div>
                  {selectedDayModal.godownSalesList.length === 0 ? (
                    <div className="empty-state" style={{ padding: 40 }}><div className="empty-title">No godown orders on this date</div></div>
                  ) : isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedDayModal.godownSalesList.map(tx => (
                        <div key={tx.id} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 13 }}>
                            <span>Order #{tx.receiptNo || tx.id}</span>
                            <span style={{ color: '#7c3aed' }}>৳{(tx.netAmount || tx.totalAmount || 0).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            Buyer: {tx.buyerName || tx.customerName || 'Wholesale Client'} &bull; Method: {tx.paymentMethod || 'Cash'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Order #</th>
                            <th>Wholesale Buyer</th>
                            <th>Payment Method</th>
                            <th>Gross Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDayModal.godownSalesList.map(tx => (
                            <tr key={tx.id}>
                              <td style={{ fontWeight: 700 }}>{tx.receiptNo || tx.id}</td>
                              <td>{tx.buyerName || tx.customerName || 'Wholesale Client'}</td>
                              <td><span className="badge badge-gray">{tx.paymentMethod || 'Cash'}</span></td>
                              <td style={{ fontWeight: 800, color: '#7c3aed' }}>৳{(tx.netAmount || tx.totalAmount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EXPENSES */}
              {drawerTab === 'expenses' && (
                <div>
                  {selectedDayModal.expensesList.length === 0 ? (
                    <div className="empty-state" style={{ padding: 40 }}><div className="empty-title">No shopkeeper expenses logged on this date</div></div>
                  ) : isMobile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedDayModal.expensesList.map(ex => (
                        <div key={ex.id} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 13 }}>
                            <span>{ex.category || 'General Expense'}</span>
                            <span style={{ color: '#dc2626' }}>৳{Number(ex.amount || 0).toLocaleString()}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                            Reason: {ex.description || 'Shop petty cash'} &bull; By: {ex.addedByName || 'Staff'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Logged By</th>
                            <th>Amount (BDT)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDayModal.expensesList.map(ex => (
                            <tr key={ex.id}>
                              <td><span className="badge badge-amber">{ex.category || 'General'}</span></td>
                              <td style={{ fontWeight: 600 }}>{ex.description || 'Petty cash'}</td>
                              <td>{ex.addedByName || 'Shopkeeper'}</td>
                              <td style={{ fontWeight: 800, color: '#dc2626' }}>৳{Number(ex.amount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              background: '#F8FAFC',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="btn btn-secondary"
              >
                Close Audit Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary btn-sm mb-2"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={24} color="var(--gold)" />
            Day-Wise Revenue &amp; Complete Hisab Register
          </h1>
          <p className="page-subtitle">
            Clean daily financial ledger: monitor turnover, cash vs digital receipts, shopkeeper petty cash, and daily register reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={exportDayWiseCSV} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> Export Report CSV
          </button>
        </div>
      </div>

      {/* Clean Filter & Timeframe Toolbar */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 14,
        padding: isMobile ? '14px' : '16px 20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.35)'
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={14} /> Period:
          </span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'last_7_days', label: 'Last 7 Days' },
            { id: 'last_30_days', label: 'Last 30 Days' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'monthly_year', label: 'Month/Year' },
            { id: 'all_time', label: 'All History' },
            { id: 'custom', label: 'Custom' }
          ].map(opt => {
            const active = timeRange === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeRange(opt.id)}
                style={{
                  padding: '6px 13px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 600,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  background: active ? '#0f172a' : 'transparent',
                  border: active ? '1px solid #0f172a' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {timeRange === 'monthly_year' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 8 }}>
            <select
              className="form-input"
              style={{ fontSize: 12, padding: '4px 8px', height: 32, width: 85, fontWeight: 700 }}
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {[2027, 2026, 2025, 2024].map(yr => <option key={yr} value={yr}>{yr}</option>)}
            </select>
            <select
              className="form-input"
              style={{ fontSize: 12, padding: '4px 8px', height: 32, width: 130, fontWeight: 700 }}
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">Full Year</option>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {timeRange === 'custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="date" className="form-input" style={{ fontSize: 12, height: 32 }} value={customStart} onChange={e => setCustomStart(e.target.value)} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>to</span>
            <input type="date" className="form-input" style={{ fontSize: 12, height: 32 }} value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', width: isMobile ? '100%' : 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 30, height: 34, fontSize: 12 }}
            placeholder="Search date (YYYY-MM-DD)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Period Executive Summary KPIs (Clean 4-Card Deck) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 20
      }}>
        <div style={{
          background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12, padding: '14px 18px', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Period Total Revenue</div>
          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: '#0f172a', marginTop: 4 }}>
            ৳{summaryKPIs.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Avg: ৳{Math.round(summaryKPIs.avgDailyRevenue).toLocaleString()} / day
          </div>
        </div>

        <div style={{
          background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12, padding: '14px 18px', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Estimated Net Profit</div>
          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: '#16a34a', marginTop: 4 }}>
            ৳{summaryKPIs.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11, color: '#15803d', fontWeight: 700, marginTop: 4 }}>
            Margin: {summaryKPIs.profitMarginPct.toFixed(1)}% net
          </div>
        </div>

        <div style={{
          background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12, padding: '14px 18px', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Channel Split</div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: '#0d9488' }}>Shop Retail: ৳{summaryKPIs.shopRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span style={{ color: '#7c3aed' }}>Godown: ৳{summaryKPIs.godownRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12, padding: '14px 18px', boxShadow: '0 4px 14px -3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Period Expenses</div>
          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: '#dc2626', marginTop: 4 }}>
            ৳{summaryKPIs.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            {summaryKPIs.balancedDays} of {summaryKPIs.activeDays} days EOD verified
          </div>
        </div>
      </div>

      {/* =========================================================
          CLEAN DAY-WISE REVENUE & HISAB REGISTER (ZERO SCRIBBLE)
          ========================================================= */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.13)',
        borderRadius: 14,
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
              Day-Wise Complete Financial &amp; Hisab Register
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {isMobile ? 'Tap any day card to inspect full cash drawer Hisab sheet' : 'Click Inspect Day Hisab on any row to open the complete cash reconciliation & itemized register.'}
            </div>
          </div>
          <span className="badge badge-gray" style={{ fontSize: 11 }}>
            {dayWiseData.length} active days
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 30 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: 64, marginBottom: 10 }} />)}
          </div>
        ) : dayWiseData.length === 0 ? (
          <div className="empty-state" style={{ padding: 50 }}>
            <div className="empty-title">No revenue records found</div>
            <div className="empty-desc">No sales match the selected timeframe or search query.</div>
          </div>
        ) : isMobile ? (
          /* MOBILE ELEGANT DAY CARDS (Prevents horizontal table overflow / scribble) */
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pgDays.paged.map(day => (
              <div
                key={day.dateKey}
                onClick={() => openDayInspectionModal(day, 'hisab')}
                style={{
                  background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{day.displayDate}</span>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{day.dayOfWeek}</span>
                  </div>
                  {day.hisabSummary.declaredCash !== null ? (
                    <span className={`badge ${day.hisabSummary.closingStatus === 'balanced' ? 'badge-teal' : 'badge-red'}`}>
                      {day.hisabSummary.closingStatus === 'balanced' ? '✓ Balanced' : `⚠ ${day.hisabSummary.discrepancy}`}
                    </span>
                  ) : (
                    <span className="badge badge-gray">Active Shift</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, background: '#F8FAFC', padding: 10, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>SHOP RETAIL ({day.shopTxCount})</div>
                    <div style={{ fontWeight: 800, color: '#0d9488' }}>৳{day.shopRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>GODOWN ({day.godownTxCount})</div>
                    <div style={{ fontWeight: 800, color: '#7c3aed' }}>৳{day.godownRevenue.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                  <span style={{ fontSize: 11, color: '#0284c7', fontWeight: 700 }}>Inspect Complete Hisab &rarr;</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#0f172a' }}>৳{day.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* PC DESKTOP SPACIOUS 7-COLUMN TABLE (Zero multi-line scribble) */
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shop Retail</th>
                  <th>Godown Wholesale</th>
                  <th>Cash Collections</th>
                  <th>Petty Cash Exp.</th>
                  <th>EOD Hisab Verification</th>
                  <th>Total Turnover</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pgDays.paged.map(day => (
                  <tr
                    key={day.dateKey}
                    onClick={() => openDayInspectionModal(day, 'hisab')}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  >
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 14 }}>
                        {day.displayDate}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{day.dayOfWeek}</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0d9488', fontSize: 14 }}>
                        ৳{day.shopRevenue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{day.shopTxCount} orders</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: 14 }}>
                        ৳{day.godownRevenue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{day.godownTxCount} orders</div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                        ৳{day.shopCashSales.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Digital: ৳{day.shopOtherSales.toLocaleString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: day.hisabSummary.totalExpense > 0 ? '#dc2626' : 'var(--text-muted)', fontSize: 13 }}>
                        {day.hisabSummary.totalExpense > 0 ? `৳${day.hisabSummary.totalExpense.toLocaleString()}` : '—'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {day.expensesList.length} entries
                      </div>
                    </td>

                    <td>
                      {day.hisabSummary.declaredCash !== null ? (
                        <span className={`badge ${day.hisabSummary.closingStatus === 'balanced' ? 'badge-teal' : 'badge-red'}`} style={{ fontSize: 11 }}>
                          {day.hisabSummary.closingStatus === 'balanced' ? '✓ Balanced' : `⚠ ${day.hisabSummary.discrepancy}`}
                        </span>
                      ) : (
                        <span className="badge badge-gray" style={{ fontSize: 11 }}>Active Shift</span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 15 }}>
                        ৳{day.totalRevenue.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: day.totalProfit >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                        Est. Profit: ৳{day.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDayInspectionModal(day, 'hisab');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontWeight: 700 }}
                      >
                        Inspect Day Hisab
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {dayWiseData.length > 0 && (
          <div style={{ padding: '12px 20px', background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Pagination
              page={pgDays.page} totalPages={pgDays.totalPages} total={pgDays.total}
              startRecord={pgDays.startRecord} endRecord={pgDays.endRecord} perPage={pgDays.perPage}
              onPageChange={pgDays.goTo} onPerPageChange={pgDays.setPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
