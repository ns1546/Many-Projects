import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  FileSpreadsheet,
  Receipt,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export default function StatementTab() {
  const {
    language,
    transactions,
    setSelectedTransaction,
    navigateTo,
    showToast,
  } = useMobileApp();

  const isBn = language === 'bn';
  const [filter, setFilter] = useState('all'); // all, in, out, due
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  const filtered = transactions.filter(t => {
    if (filter === 'in' && t.flow !== 'in') return false;
    if (filter === 'out' && t.flow !== 'out') return false;
    if (filter === 'due' && t.type !== 'due_entry') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (t.partyName || '').toLowerCase().includes(q);
      const matchTitle = (t.titleBn || t.titleEn || '').toLowerCase().includes(q);
      const matchId = (t.id || '').toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      return matchName || matchTitle || matchId || matchNote;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedTransactions = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalIn = transactions.filter(t => t.flow === 'in').reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = transactions.filter(t => t.flow === 'out').reduce((s, t) => s + Number(t.amount), 0);

  const handleExportCSV = () => {
    try {
      const headers = ['Txn ID', 'Title', 'Party', 'Amount (BDT)', 'Flow', 'Payment Method', 'Timestamp'];
      const rows = filtered.map(t => [
        t.id,
        `"${(t.titleBn || t.titleEn || '').replace(/"/g, '""')}"`,
        `"${(t.partyName || '').replace(/"/g, '""')}"`,
        t.amount,
        t.flow,
        t.paymentMethod || 'Cash',
        `"${t.timestamp}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `LedgerX_Statement_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(isBn ? 'স্টেটমেন্ট সিএসভি ফাইল ডাউনলোড হয়েছে!' : 'Statement CSV downloaded successfully!', 'success');
    } catch (e) {
      showToast(isBn ? 'সিএসভি তৈরি করা সম্ভব হয়নি' : 'Failed to export CSV', 'error');
    }
  };

  return (
    <div style={{ padding: '16px 14px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
            {isBn ? 'লেনদেন খতিয়ান ও স্টেটমেন্ট' : 'Passbook & Statements'}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            {isBn ? 'দৈনিক জমা ও খরচের পূর্ণাঙ্গ অডিট হিসাব' : 'All incoming and outgoing cash records'}
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            background: '#F3F4F6',
            border: '1px solid #D1D5DB',
            borderRadius: 10,
            padding: '6px 12px',
            color: 'var(--bk-pink)',
            fontSize: 11.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <FileSpreadsheet size={13} />
          <span>{isBn ? 'এক্সেল' : 'Export'}</span>
        </button>
      </div>

      {/* Aggregate Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B7280' }}>
            <ArrowDownLeft size={14} color="#059669" />
            <span>{isBn ? 'মোট জমা / বিক্রি' : 'Total Inflow'}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>
            ৳ {totalIn.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B7280' }}>
            <ArrowUpRight size={14} color="var(--bk-pink)" />
            <span>{isBn ? 'মোট খরচ / পরিশোধ' : 'Total Outflow'}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>
            ৳ {totalOut.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
          </div>
        </div>
      </div>

      {/* Filter Tabs (bKash Style) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: '#F3F4F6', padding: 4, borderRadius: 12 }}>
        {[
          { id: 'all', labelBn: 'সকল লেনদেন', labelEn: 'All' },
          { id: 'in', labelBn: 'জমা (In)', labelEn: 'Inflow' },
          { id: 'out', labelBn: 'খরচ (Out)', labelEn: 'Outflow' },
          { id: 'due', labelBn: 'বাকি খাতা', labelEn: 'Dues' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 8,
              border: 'none',
              background: filter === tab.id ? 'var(--bk-pink)' : 'transparent',
              color: filter === tab.id ? '#FFFFFF' : '#4B5563',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isBn ? tab.labelBn : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid #D1D5DB',
          borderRadius: 12,
          padding: '0 12px',
          marginBottom: 12,
        }}
      >
        <Search size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
        <input
          type="text"
          placeholder={isBn ? 'কাস্টমার, বিবরণ বা ভাউচার আইডি খুঁজুন...' : 'Search transaction...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            padding: '9px 0',
            fontSize: 12,
            outline: 'none',
          }}
        />
      </div>

      {/* Capacity & Count Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 2px' }}>
        <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>
          {isBn
            ? `মোট ${filtered.length} টির মধ্যে ${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, filtered.length)} টি প্রদর্শিত`
            : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
        </div>
        <div style={{ fontSize: 10, color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
          {isBn ? 'হাই-স্পিড অডিট' : 'High Capacity'}
        </div>
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {paginatedTransactions.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '28px 16px',
              textAlign: 'center',
              color: '#6B7280',
              border: '1px dashed #D1D5DB',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {isBn ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions found'}
          </div>
        ) : (
          paginatedTransactions.map(t => {
            const isIn = t.flow === 'in';
            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTransaction(t);
                  navigateTo('receipt');
                }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: isIn ? '#ECFDF5' : '#FFF0F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isIn ? '#059669' : 'var(--bk-pink)',
                      flexShrink: 0,
                    }}
                  >
                    {isIn ? <ArrowDownLeft size={18} strokeWidth={2.4} /> : <ArrowUpRight size={18} strokeWidth={2.4} />}
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      {isBn ? t.titleBn : t.titleEn}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 1 }}>
                      {t.partyName} • {t.timestamp}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: isIn ? '#059669' : 'var(--bk-pink)',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {isIn ? '+' : '-'} ৳ {Number(t.amount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
                    {t.paymentMethod}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '8px 12px',
            border: '1px solid #E5E7EB',
          }}
        >
          <button
            onClick={() => {
              haptics.tap();
              setCurrentPage(p => Math.max(1, p - 1));
            }}
            disabled={currentPage === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              background: currentPage === 1 ? '#F9FAFB' : '#FFFFFF',
              color: currentPage === 1 ? '#9CA3AF' : '#111827',
              fontSize: 11,
              fontWeight: 700,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={13} />
            <span>{isBn ? 'পূর্ববর্তী' : 'Prev'}</span>
          </button>

          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#374151' }}>
            {isBn ? `পৃষ্ঠা ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>

          <button
            onClick={() => {
              haptics.tap();
              setCurrentPage(p => Math.min(totalPages, p + 1));
            }}
            disabled={currentPage === totalPages}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 8,
              border: '1px solid #D1D5DB',
              background: currentPage === totalPages ? '#F9FAFB' : '#FFFFFF',
              color: currentPage === totalPages ? '#9CA3AF' : '#111827',
              fontSize: 11,
              fontWeight: 700,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            <span>{isBn ? 'পরবর্তী' : 'Next'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
