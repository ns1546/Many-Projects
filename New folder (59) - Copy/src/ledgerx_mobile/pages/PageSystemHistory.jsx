import React, { useState, useMemo } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { haptics } from '../utils/haptics';
import {
  Clock,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  X,
  FileText,
  Building,
  Users,
  Wallet,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function PageSystemHistory() {
  const {
    language,
    transactions,
    activeTenantId,
    setSelectedTransaction,
    navigateTo,
    showToast,
  } = useMobileApp();

  const isBn = language === 'bn';

  // Workspaces / Channels
  const [activeWorkspace, setActiveWorkspace] = useState('ALL'); // 'ALL' | 'POS' | 'CUSTOMER' | 'SUPPLIER' | 'EXPENSE'
  const [timeRange, setTimeRange] = useState('ALL'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const workspaces = [
    { id: 'ALL', labelBn: 'সকল খতিয়ান', labelEn: 'All History', icon: Clock },
    { id: 'POS', labelBn: 'পিওএস বিক্রয়', labelEn: 'POS Sales', icon: ShoppingBag },
    { id: 'CUSTOMER', labelBn: 'কাস্টমার', labelEn: 'Customers', icon: Users },
    { id: 'SUPPLIER', labelBn: 'মহাজন চালান', labelEn: 'Suppliers', icon: Building },
    { id: 'EXPENSE', labelBn: 'দোকান ব্যয়', labelEn: 'Expenses', icon: Wallet },
  ];

  const timeRanges = [
    { id: 'TODAY', labelBn: 'আজ', labelEn: 'Today' },
    { id: 'WEEK', labelBn: '৭ দিন', labelEn: '7 Days' },
    { id: 'MONTH', labelBn: 'চলতি মাস', labelEn: 'Month' },
    { id: 'ALL', labelBn: 'সর্বকালীন', labelEn: 'All Time' },
  ];

  // Filtering Logic
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      // Workspace Filter
      if (activeWorkspace === 'POS') {
        const isPos = t.type === 'sale' || t.category === 'কাউন্টার বিক্রয়' || t.category === 'নগদ বিক্রয়';
        if (!isPos) return false;
      }
      if (activeWorkspace === 'CUSTOMER') {
        const isCustomerTxn = ['credit_collection', 'due_collection', 'due_entry'].includes(t.type) || t.category?.includes('বকেয়া') || t.category?.includes('বাকি');
        if (!isCustomerTxn) return false;
      }
      if (activeWorkspace === 'SUPPLIER') {
        const isSupplierTxn = ['supplier_pay', 'supplier_payment', 'purchase'].includes(t.type) || t.category?.includes('মহাজন');
        if (!isSupplierTxn) return false;
      }
      if (activeWorkspace === 'EXPENSE') {
        const isExpense = t.type === 'expense' || t.flow === 'out' || t.category?.includes('খরচ');
        if (!isExpense) return false;
      }

      // Time Range Filter
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const tDate = t.date || (t.timestamp && t.timestamp.includes('আজ') ? todayStr : '');

      if (timeRange === 'TODAY') {
        const isToday = (t.timestamp || '').includes('আজ') || tDate === todayStr;
        if (!isToday) return false;
      } else if (timeRange === 'WEEK') {
        if (tDate && tDate < sevenDaysAgo) return false;
      } else if (timeRange === 'MONTH') {
        if (tDate && tDate < thirtyDaysAgo) return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const mTitle = (t.titleBn || t.titleEn || '').toLowerCase().includes(q);
        const mParty = (t.partyName || '').toLowerCase().includes(q);
        const mId = (t.id || '').toLowerCase().includes(q);
        const mRef = (t.refNo || '').toLowerCase().includes(q);
        const mNote = (t.note || '').toLowerCase().includes(q);
        return mTitle || mParty || mId || mRef || mNote;
      }

      return true;
    });
  }, [transactions, activeWorkspace, timeRange, search]);

  // Financial Metrics Ribbon
  const totalInflow = filtered.filter(t => t.flow === 'in').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalOutflow = filtered.filter(t => t.flow === 'out').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netCashFlow = totalInflow - totalOutflow;

  // High-Capacity Chunked Pagination
  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedLogs = filtered.slice(startIndex, endIndex);

  const handleExportCSV = () => {
    try {
      const headers = ['Txn ID', 'Title', 'Party Name', 'Amount (BDT)', 'Flow', 'Payment Method', 'Timestamp', 'Status'];
      const rows = filtered.map(t => [
        t.id,
        `"${(t.titleBn || t.titleEn || '').replace(/"/g, '""')}"`,
        `"${(t.partyName || '').replace(/"/g, '""')}"`,
        t.amount,
        t.flow,
        t.paymentMethod || 'Cash',
        `"${t.timestamp}"`,
        t.status || 'Success',
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `LedgerX_AuditLog_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      haptics.success();
      showToast(isBn ? 'অডিট হিস্ট্রি সিএসভি ফাইল ডাউনলোড হয়েছে!' : 'Audit logs downloaded!', 'success');
    } catch (e) {
      showToast(isBn ? 'ডাউনলোড ব্যর্থ হয়েছে' : 'Export failed', 'error');
    }
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      {/* Header */}
      <SubpageHeader
        titleBn="অডিট ও সিস্টেম হিস্ট্রি"
        titleEn="Audit Trail & Ledger History"
        subtitleBn={`মোট ${transactions.length} টি স্থায়ী লেনদেন রেকর্ড`}
        subtitleEn={`${transactions.length} immutable ledger logs`}
        rightAction={
          <button
            onClick={handleExportCSV}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Download size={13} />
            <span>{isBn ? 'এক্সপোর্ট' : 'CSV'}</span>
          </button>
        }
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Metric Summary Ribbon */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '14px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            textAlign: 'center',
          }}
        >
          <div style={{ borderRight: '1px solid #F3F4F6', paddingRight: 6 }}>
            <div style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>
              {isBn ? '🟢 মোট জমা' : 'Inflow (+)'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#059669', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳{totalInflow.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div style={{ borderRight: '1px solid #F3F4F6', paddingRight: 6 }}>
            <div style={{ fontSize: 10, color: '#E11D48', fontWeight: 700 }}>
              {isBn ? '🔴 মোট খরচ' : 'Outflow (-)'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#E11D48', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳{totalOutflow.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: '#1E40AF', fontWeight: 700 }}>
              {isBn ? 'ব্যালেন্স প্রবাহ' : 'Net Flow'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: netCashFlow >= 0 ? '#1E40AF' : '#E11D48', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳{netCashFlow.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>
        </div>

        {/* Workspace Category Pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
          {workspaces.map(ws => {
            const Icon = ws.icon;
            const active = activeWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => {
                  haptics.tap();
                  setActiveWorkspace(ws.id);
                  setCurrentPage(1);
                }}
                className="lx-touch-btn"
                style={{
                  padding: '6px 12px',
                  borderRadius: 12,
                  border: active ? '1.5px solid var(--bk-pink)' : '1px solid #E5E7EB',
                  background: active ? '#FFF0F6' : '#FFFFFF',
                  color: active ? 'var(--bk-pink)' : '#4B5563',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={13} />
                <span>{isBn ? ws.labelBn : ws.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Time Range Pills & Search Bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 12px',
            }}
          >
            <Search size={15} color="#9CA3AF" style={{ marginRight: 6, flexShrink: 0 }} />
            <input
              type="text"
              placeholder={isBn ? 'আইডি, নাম বা ভাউচার নম্বর...' : 'Search logs by ID, party or note...'}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', border: 'none', background: 'transparent', padding: '9px 0', fontSize: 12, outline: 'none' }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 4, background: '#FFFFFF', padding: 3, borderRadius: 12, border: '1px solid #E5E7EB' }}>
            {timeRanges.map(tr => (
              <button
                key={tr.id}
                onClick={() => {
                  haptics.tap();
                  setTimeRange(tr.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '5px 8px',
                  borderRadius: 8,
                  border: 'none',
                  background: timeRange === tr.id ? 'var(--bk-pink)' : 'transparent',
                  color: timeRange === tr.id ? '#FFFFFF' : '#6B7280',
                  fontSize: 10.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isBn ? tr.labelBn : tr.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* High-Capacity Record Count & Pagination Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#6B7280',
            fontWeight: 700,
            marginBottom: 10,
            padding: '4px 6px',
            background: '#EEF2F6',
            borderRadius: 10,
          }}
        >
          <span>
            {isBn
              ? `মোট ${filtered.length.toLocaleString('bn-BD')} টি রেকর্ড • প্রদর্শিত ${paginatedLogs.length > 0 ? (startIndex + 1).toLocaleString('bn-BD') : 0}-${Math.min(endIndex, filtered.length).toLocaleString('bn-BD')} টি`
              : `Total ${filtered.length} records • Showing ${paginatedLogs.length > 0 ? startIndex + 1 : 0}-${Math.min(endIndex, filtered.length)}`}
          </span>
          <span style={{ color: 'var(--bk-pink)', fontWeight: 800 }}>
            {isBn ? `পৃষ্ঠা ${safePage.toLocaleString('bn-BD')} / ${totalPages.toLocaleString('bn-BD')}` : `Page ${safePage} of ${totalPages}`}
          </span>
        </div>

        {/* Log Entries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {paginatedLogs.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '32px 16px',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: 13,
                border: '1px dashed #D1D5DB',
              }}
            >
              <Clock size={32} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
              <div>{isBn ? 'কোনো অডিট রেকর্ড পাওয়া যায়নি' : 'No history records found'}</div>
            </div>
          ) : (
            paginatedLogs.map(t => {
              const isIn = t.flow === 'in';
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    haptics.tap();
                    setSelectedVoucher(t);
                  }}
                  className="lx-touch-btn"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: isIn ? '#ECFDF5' : '#FFF1F2',
                        color: isIn ? '#059669' : '#E11D48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isIn ? <ArrowDownLeft size={18} strokeWidth={2.6} /> : <ArrowUpRight size={18} strokeWidth={2.6} />}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isBn ? t.titleBn : t.titleEn}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>#{t.id}</span>
                        <span>•</span>
                        <span>{t.partyName || 'কাউন্টার'}</span>
                        <span>•</span>
                        <span>{t.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 900,
                        color: isIn ? '#059669' : 'var(--bk-pink)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {isIn ? '+' : '-'} ৳{Number(t.amount || 0).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>
                      {t.paymentMethod || 'ক্যাশ'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* High-Capacity Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 14,
              padding: '10px 12px',
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E5E7EB',
            }}
          >
            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              disabled={safePage <= 1}
              className="lx-touch-btn"
              style={{
                background: safePage <= 1 ? '#F3F4F6' : 'var(--bk-pink)',
                color: safePage <= 1 ? '#9CA3AF' : '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {isBn ? '← পূর্ববর্তী' : '← Previous'}
            </button>

            <span style={{ fontSize: 12, fontWeight: 800, color: '#374151' }}>
              {isBn
                ? `পৃষ্ঠা ${safePage.toLocaleString('bn-BD')} / ${totalPages.toLocaleString('bn-BD')}`
                : `Page ${safePage} of ${totalPages}`}
            </span>

            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              disabled={safePage >= totalPages}
              className="lx-touch-btn"
              style={{
                background: safePage >= totalPages ? '#F3F4F6' : 'var(--bk-pink)',
                color: safePage >= totalPages ? '#9CA3AF' : '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              {isBn ? 'পরবর্তী →' : 'Next →'}
            </button>
          </div>
        )}
      </div>

      {/* ── Slide Drawer: Voucher Slip Inspector ── */}
      {selectedVoucher && (
        <div
          className="bk-slide-drawer-backdrop"
          onClick={() => setSelectedVoucher(null)}
        >
          <div
            className="bk-slide-drawer"
            onClick={e => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            <div className="bk-drawer-handle" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} color="#059669" />
                <span style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                  {isBn ? 'ভাউচার রসিদ বিস্তারিত' : 'Voucher Slip Details'}
                </span>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 16,
                padding: '14px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{isBn ? 'ট্রানজ্যাকশন আইডি' : 'Txn ID'}</span>
                <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>#{selectedVoucher.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{isBn ? 'খাত / ধরন' : 'Category'}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{selectedVoucher.category || selectedVoucher.titleBn}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{isBn ? 'গ্রাহক / মহাজন' : 'Party'}</span>
                <span style={{ fontSize: 11, fontWeight: 800 }}>{selectedVoucher.partyName || 'সরাসরি ক্যাশ'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{isBn ? 'পেমেন্ট মাধ্যম' : 'Method'}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{selectedVoucher.paymentMethod || 'ক্যাশ'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{isBn ? 'মোট টাকা' : 'Total Amount'}</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: selectedVoucher.flow === 'in' ? '#059669' : 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                  ৳{Number(selectedVoucher.amount || 0).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedTransaction(selectedVoucher);
                navigateTo('receipt');
              }}
              className="lx-touch-btn"
              style={{
                width: '100%',
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '12px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Receipt size={16} />
              <span>{isBn ? 'রশিদ স্লিপ প্রিন্ট ও শেয়ার' : 'Open Full Receipt Voucher'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
