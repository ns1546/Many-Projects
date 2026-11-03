import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export default function PagePnLReport() {
  const { language, balances, transactions = [], showToast } = useMobileApp();
  const isBn = language === 'bn';

  const [period, setPeriod] = useState('today'); // today, week, month

  const periodTxns = React.useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return transactions.filter(t => {
      const tDate = t.date || (t.timestamp && t.timestamp.includes('আজ') ? todayStr : '');
      if (period === 'today') {
        return tDate === todayStr || (t.timestamp && t.timestamp.includes('আজ'));
      }
      if (period === 'week') {
        return !tDate || tDate >= sevenDaysAgo;
      }
      if (period === 'month') {
        return !tDate || tDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [transactions, period]);

  const totalSales = React.useMemo(() => {
    if (period === 'today' && balances.todaySales) {
      return balances.todaySales;
    }
    return periodTxns
      .filter(t => t.type === 'sale' || t.flow === 'in' || t.category === 'নগদ বিক্রয়' || t.category === 'কাউন্টার বিক্রয়')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [balances.todaySales, periodTxns, period]);

  const expenses = React.useMemo(() => {
    if (period === 'today' && balances.todayExpense) {
      return balances.todayExpense;
    }
    return periodTxns
      .filter(t => t.type === 'expense' || t.flow === 'out' || t.category === 'দোকান খরচ')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [balances.todayExpense, periodTxns, period]);

  const estimatedCOGS = Math.round(totalSales * 0.80); // 80% cost of goods
  const grossProfit = Math.max(0, totalSales - estimatedCOGS);
  const netProfit = Math.max(0, grossProfit - expenses);
  const netMarginPct = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0';

  const cogsPct = totalSales > 0 ? Math.min(100, ((estimatedCOGS / totalSales) * 100).toFixed(0)) : '0';
  const expPct = totalSales > 0 ? Math.min(100, ((expenses / totalSales) * 100).toFixed(0)) : '0';
  const profitPct = totalSales > 0 ? Math.min(100, ((netProfit / totalSales) * 100).toFixed(0)) : '0';

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24 }}>
      {/* bKash Crimson Header */}
      <SubpageHeader
        titleBn="দৈনিক লাভ-ক্ষতি রিপোর্ট ও এনালিটিক্স"
        titleEn="Profit & Loss Financial Analytics"
        subtitleBn="বিক্রয়, পাইকারি ক্রয়মূল্য ও নিট লাভের খতিয়ান"
        subtitleEn="Real-time Revenue, COGS & Net Margin"
        rightAction={
          <button
            onClick={() => {
              window.print();
              showToast(isBn ? 'লাভ-ক্ষতি আর্থিক বিবরণী প্রিন্ট ফরম্যাটে প্রস্তুত!' : 'P&L report ready for print/PDF!', 'success');
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={13} />
            <span>{isBn ? 'রিপোর্ট' : 'PDF'}</span>
          </button>
        }
      />

      <div style={{ padding: '16px' }}>
        {/* Period Selector Tabs */}
        <div style={{ display: 'flex', background: '#E5E7EB', padding: 4, borderRadius: 12, marginBottom: 16 }}>
          {[
            { id: 'today', labelBn: 'আজকের হিসাব', labelEn: 'Today' },
            { id: 'week', labelBn: 'চলতি সপ্তাহ', labelEn: 'This Week' },
            { id: 'month', labelBn: 'চলতি মাস', labelEn: 'This Month' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 9,
                border: 'none',
                background: period === t.id ? '#FFFFFF' : 'transparent',
                color: period === t.id ? 'var(--bk-pink)' : '#4B5563',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: period === t.id ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {isBn ? t.labelBn : t.labelEn}
            </button>
          ))}
        </div>

        {/* Net Profit Spotlight Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
            borderRadius: 22,
            padding: '20px',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.25)',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11.5, color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase' }}>
            {isBn ? 'খাঁটি নিট লাভ (সব খরচ বাদে)' : 'Net Profit (All Deductions Cleared)'}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: '#FFFFFF',
              fontFamily: 'Outfit, sans-serif',
              margin: '6px 0',
            }}
          >
            ৳ {netProfit.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '3px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            <TrendingUp size={14} color="#6EE7B7" />
            <span>নিট মার্জিন: {netMarginPct}% {totalSales > 0 ? (isBn ? '(সক্রিয় ব্যবসা)' : '(Active)') : (isBn ? '(বিক্রয় প্রত্যাশিত)' : '(Pending Sales)')}</span>
          </div>
        </div>

        {/* Financial Flow Breakdown */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', marginBottom: 14 }}>
            {isBn ? 'আয় ও ব্যয়ের বিশদ বিবরণ' : 'Income & Expense Breakdown'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
            {/* 1. Gross Revenue */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }} />
                <span style={{ color: '#374151', fontWeight: 600 }}>{isBn ? 'মোট পণ্য বিক্রয়' : 'Total Sales Revenue'}</span>
              </div>
              <span style={{ fontWeight: 800, color: '#111827', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {totalSales.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </span>
            </div>

            {/* 2. COGS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ color: '#374151', fontWeight: 600 }}>{isBn ? 'পাইকারি কেনা দাম (ক্রয় খরচ)' : 'Cost of Goods (Wholesale)'}</span>
              </div>
              <span style={{ fontWeight: 800, color: '#DC2626', fontFamily: 'Outfit, sans-serif' }}>
                - ৳ {estimatedCOGS.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </span>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px dashed #E5E7EB', margin: '4px 0' }} />

            {/* 3. Gross Margin */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#4B5563', fontWeight: 700 }}>{isBn ? 'মোট বিক্রয় লাভ (খরচ পূর্ব)' : 'Gross Profit'}</span>
              <span style={{ fontWeight: 800, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {grossProfit.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </span>
            </div>

            {/* 4. Operational Expenses */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--bk-pink)' }} />
                <span style={{ color: '#374151', fontWeight: 600 }}>{isBn ? 'দোকানের অন্যান্য খরচ (ভাড়া, বিল, বেতন)' : 'Operational Expenses'}</span>
              </div>
              <span style={{ fontWeight: 800, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                - ৳ {expenses.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </span>
            </div>

            {/* Grand Net Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
                borderTop: '2px solid #111827',
                fontSize: 14,
                fontWeight: 900,
                color: '#111827',
              }}
            >
              <span>{isBn ? 'খাঁটি নিট প্রফিট' : 'Net Clean Profit'}</span>
              <span style={{ color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {netProfit.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Ratio Bar */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid #E5E7EB',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>
            {isBn ? 'আয়ের শতকরা অনুপাত' : 'Revenue Distribution Ratio'}
          </div>

          <div style={{ height: 14, borderRadius: 7, overflow: 'hidden', display: 'flex', background: '#F3F4F6', marginBottom: 10 }}>
            <div style={{ width: `${cogsPct}%`, background: '#F59E0B' }} title={`COGS ${cogsPct}%`} />
            <div style={{ width: `${expPct}%`, background: 'var(--bk-pink)' }} title={`Expenses ${expPct}%`} />
            <div style={{ width: `${profitPct}%`, background: '#059669' }} title={`Net Profit ${profitPct}%`} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7280' }}>
            <span>{isBn ? 'পণ্য ক্রয়:' : 'COGS:'} <strong>{cogsPct}%</strong></span>
            <span>{isBn ? 'দোকান খরচ:' : 'Expenses:'} <strong>{expPct}%</strong></span>
            <span style={{ color: '#059669' }}>{isBn ? 'নিট লাভ:' : 'Net Profit:'} <strong>{profitPct}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
