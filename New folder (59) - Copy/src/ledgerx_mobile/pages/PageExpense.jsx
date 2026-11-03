import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import HoldToConfirm from '../components/HoldToConfirm';
import {
  Receipt,
  Home,
  Zap,
  Coffee,
  Users,
  Wrench,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function PageExpense() {
  const {
    language,
    balances,
    recordExpense,
    transactions,
    navigateTo,
  } = useMobileApp();

  const isBn = language === 'bn';

  const categories = [
    { id: 'tea', nameBn: 'নাস্তা ও আপ্যায়ন', nameEn: 'Snacks & Tea', icon: Coffee, bg: '#FFF0F6', color: '#E2136E' },
    { id: 'electricity', nameBn: 'বিদ্যুৎ বিল', nameEn: 'Electricity Bill', icon: Zap, bg: '#FFFBEB', color: '#D97706' },
    { id: 'rent', nameBn: 'দোকান ভাড়া', nameEn: 'Shop Rent', icon: Home, bg: '#EFF6FF', color: '#1E60D5' },
    { id: 'salary', nameBn: 'কর্মচারী বেতন', nameEn: 'Staff Salary', icon: Users, bg: '#F5F3FF', color: '#7C3AED' },
    { id: 'other', nameBn: 'মেরামত ও অন্যান্য', nameEn: 'Maintenance & Misc', icon: Wrench, bg: '#ECFDF5', color: '#059669' },
  ];

  const [category, setCategory] = useState(categories[0].nameBn);
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ক্যাশবাক্স');
  const [note, setNote] = useState('');

  const numAmount = Number(amount || 0);

  const quickAmounts = [
    { label: '৳৫০', val: 50 },
    { label: '৳১০০', val: 100 },
    { label: '৳৫০০', val: 500 },
    { label: '৳১,০০০', val: 1000 },
    { label: '৳৫,০০০', val: 5000 },
  ];

  const expenseTxns = transactions.filter(t => t.flow === 'out');

  const handleFinalize = () => {
    if (numAmount <= 0) return;

    recordExpense({
      category,
      amount: numAmount,
      payee: payee || (isBn ? 'দোকান ব্যয়' : 'Shop Expense'),
      paymentMethod,
      note,
    });

    navigateTo('receipt');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      <SubpageHeader
        titleBn="দোকানের খরচের খাতা"
        titleEn="Shop Expense Manager"
        subtitleBn="প্রতিদিনের ব্যয় ও ভাউচার"
        subtitleEn="Daily operational costs & bills"
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Today's Expense Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'আজকের মোট দোকান খরচ' : "Today's Total Expenses"}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳ {(balances.todayExpense || 0).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt size={22} strokeWidth={2.4} />
          </div>
        </div>

        {/* Record New Expense Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', marginBottom: 14 }}>
          {/* Category Picker */}
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
            {isBn ? 'খরচের খাত নির্বাচন করুন' : 'Expense Category'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = category === (isBn ? cat.nameBn : cat.nameEn);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(isBn ? cat.nameBn : cat.nameEn)}
                  style={{
                    background: isSelected ? '#FFF0F6' : '#F9FAFB',
                    border: isSelected ? '1.5px solid var(--bk-pink)' : '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: '10px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={19} color={isSelected ? 'var(--bk-pink)' : cat.color} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: isSelected ? 'var(--bk-pink)' : '#374151' }}>
                    {isBn ? cat.nameBn : cat.nameEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Amount Field */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
              {isBn ? 'খরচের পরিমাণ (Taka)' : 'Expense Amount'}
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F9FAFB',
                border: '2px solid var(--bk-pink)',
                borderRadius: 14,
                padding: '0 16px',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--bk-pink)', marginRight: 6 }}>৳</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#111827',
                  padding: '11px 0',
                  outline: 'none',
                  fontFamily: 'Outfit, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {quickAmounts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setAmount(chip.val.toString())}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: 20,
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Payee / Receiver */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
              {isBn ? 'কার নিকট প্রদান করা হলো' : 'Paid To (Payee)'}
            </label>
            <input
              type="text"
              placeholder={isBn ? 'যেমন: বিদ্যুৎ অফিস / বাড়িওয়ালা / দোকান সহকারী' : 'e.g. Electric utility, Landlord'}
              value={payee}
              onChange={e => setPayee(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #D1D5DB',
                fontSize: 12.5,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Hold to Confirm */}
          <HoldToConfirm
            disabled={numAmount <= 0}
            onConfirm={handleFinalize}
            labelBn="খরচ অনুমোদন করতে ধরে রাখুন"
            labelEn="Hold to Confirm Expense"
          />
        </div>

        {/* Recent Expense History */}
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
            {isBn ? 'সাম্প্রতিক খরচের হিস্ট্রি' : 'Recent Expenses'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {expenseTxns.map(t => (
              <div
                key={t.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#FFF1F2',
                      color: '#E11D48',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowUpRight size={18} strokeWidth={2.4} />
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
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                    - ৳ {Number(t.amount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                  </div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{t.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
