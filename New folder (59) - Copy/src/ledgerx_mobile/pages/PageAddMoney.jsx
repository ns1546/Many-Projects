import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import HoldToConfirm from '../components/HoldToConfirm';
import {
  ArrowDownLeft,
  User,
  Search,
  CheckCircle2,
  DollarSign,
  Phone,
} from 'lucide-react';

export default function PageAddMoney() {
  const {
    language,
    customers,
    selectedCustomer,
    recordDueCollection,
    navigateTo,
    screenParams,
  } = useMobileApp();

  const isBn = language === 'bn';

  const defaultCustId = screenParams.customerId || selectedCustomer?.id || (customers[0]?.id || '');
  const [customerId, setCustomerId] = useState(defaultCustId);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ');
  const [note, setNote] = useState('');

  const targetCustomer = customers.find(c => c.id === customerId);
  const currentDue = targetCustomer ? Number(targetCustomer.dueAmount || 0) : 0;
  const numAmount = Number(amount || 0);
  const remainingDue = Math.max(0, currentDue - numAmount);

  const quickChips = [
    { label: '+৳১০০', val: 100 },
    { label: '+৳৫০০', val: 500 },
    { label: '+৳১,০০০', val: 1000 },
    { label: '+৳২,০০০', val: 2000 },
    { label: '+৳৫,০০০', val: 5000 },
    { label: 'ফুল ডিউ', val: currentDue },
  ];

  const handleFinalize = () => {
    if (!customerId || numAmount <= 0) return;

    recordDueCollection({
      customerId,
      customerName: targetCustomer ? (isBn ? targetCustomer.nameBn : targetCustomer.nameEn) : 'গ্রাহক',
      amount: numAmount,
      paymentMethod,
      note,
    });

    navigateTo('receipt');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      <SubpageHeader
        titleBn="টাকা জমা ও বকেয়া আদায়"
        titleEn="Add Money / Collect Dues"
        subtitleBn="গ্রাহকের খাতার বাকি টাকা গ্রহণ"
        subtitleEn="Receive and record customer dues"
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Step 1: Customer Picker */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <User size={15} color="var(--bk-pink)" />
            <span>{isBn ? 'গ্রাহক / কাস্টমার নির্বাচন করুন' : 'Select Customer Account'}</span>
          </label>
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 12px',
              borderRadius: 12,
              border: '1px solid #D1D5DB',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              background: '#F9FAFB',
              color: '#111827',
            }}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {isBn ? c.nameBn : c.nameEn} ({c.phone}) - {isBn ? 'মোট বকেয়া' : 'Due'}: ৳{c.dueAmount}
              </option>
            ))}
          </select>

          {/* Current Debt Card */}
          {targetCustomer && (
            <div
              style={{
                marginTop: 12,
                background: '#FFF0F6',
                borderRadius: 14,
                padding: '12px 14px',
                border: '1px solid #FCE7F3',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>
                  {isBn ? 'বর্তমান বকেয়া (বাকি)' : 'Current Debt'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#E11D48', fontFamily: 'Outfit, sans-serif' }}>
                  ৳ {currentDue.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>
                  {isBn ? 'জমার পর অবশিষ্ট বাকি' : 'Remaining Due'}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: remainingDue === 0 ? '#059669' : '#D97706',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  ৳ {remainingDue.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Big Amount Input Screen (bKash Style) */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
            {isBn ? 'জমা গ্রহণের পরিমাণ (Taka Amount)' : 'Amount to Receive'}
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F9FAFB',
              border: '2px solid var(--bk-pink)',
              borderRadius: 16,
              padding: '0 16px',
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--bk-pink)', marginRight: 8 }}>৳</span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: 26,
                fontWeight: 900,
                color: '#111827',
                padding: '14px 0',
                outline: 'none',
                fontFamily: 'Outfit, sans-serif',
              }}
            />
          </div>

          {/* Quick Amount Suggestion Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {quickChips.map((chip, idx) => (
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
        </div>

        {/* Step 3: Payment Method & Hold to Confirm */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
            {isBn ? 'পরিশোধের মাধ্যম (Payment Channel)' : 'Payment Channel'}
          </label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {['নগদ ক্যাশ', 'বিকাশ পেমেন্ট', 'ব্যাংক ট্রান্সফার'].map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  borderRadius: 12,
                  border: paymentMethod === m ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                  background: paymentMethod === m ? '#FFF0F6' : '#FFFFFF',
                  color: paymentMethod === m ? 'var(--bk-pink)' : '#4B5563',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <HoldToConfirm
            disabled={numAmount <= 0}
            onConfirm={handleFinalize}
            labelBn="জমা গ্রহণ নিশ্চিত করতে ধরে রাখুন"
            labelEn="Hold to Confirm Receipt"
          />
        </div>
      </div>
    </div>
  );
}
