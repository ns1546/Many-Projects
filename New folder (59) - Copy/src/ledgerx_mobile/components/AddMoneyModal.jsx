import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, ArrowDownLeft, User, DollarSign, Wallet } from 'lucide-react';
import HoldToConfirm from './HoldToConfirm';

export default function AddMoneyModal() {
  const {
    language,
    customers,
    selectedCustomer,
    recordDueCollection,
    setActiveModal,
  } = useMobileApp();

  const isBn = language === 'bn';

  const [customerId, setCustomerId] = useState(selectedCustomer?.id || (customers[0]?.id || ''));
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ');
  const [note, setNote] = useState('');

  const targetCustomer = customers.find(c => c.id === customerId);
  const currentDue = targetCustomer ? targetCustomer.dueAmount : 0;
  const numAmount = Number(amount || 0);
  const remainingDue = Math.max(0, currentDue - numAmount);

  const quickChips = [
    { label: '+৳১০০', val: 100 },
    { label: '+৳৫০০', val: 500 },
    { label: '+৳১,০০০', val: 1000 },
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

    setActiveModal('receipt');
  };

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <ArrowDownLeft size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
                {isBn ? 'টাকা গ্রহণ ও বকেয়া আদায়' : 'Collect Due / Add Money'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {isBn ? 'কাস্টমার জমা ও ক্যাশ ইন রেকর্ড' : 'Record customer cash-in'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4B5563',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Customer Select */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            {isBn ? 'গ্রাহক / কাস্টমার নির্বাচন করুন' : 'Select Customer'}
          </label>
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#111827',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
            }}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {isBn ? c.nameBn : c.nameEn} ({c.phone}) - {isBn ? 'মোট বকেয়া' : 'Due'}: ৳{c.dueAmount}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Balance Banner */}
        {targetCustomer && (
          <div
            style={{
              background: '#FFF0F6',
              borderRadius: 14,
              padding: '12px 14px',
              border: '1px solid #FCE7F3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>
                {isBn ? 'বর্তমান বকেয়া (বাকি)' : 'Current Customer Debt'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#E11D48', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {currentDue.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>
                {isBn ? 'জমার পর অবশিষ্ট বাকি' : 'Remaining Due'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: remainingDue === 0 ? '#059669' : '#D97706', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {remainingDue.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </div>
            </div>
          </div>
        )}

        {/* Big Amount Input Field (bKash Style) */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            {isBn ? 'জমা গ্রহণের পরিমাণ' : 'Amount to Receive'}
          </label>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#F9FAFB',
              border: '1.5px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 16px',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--bk-pink)', marginRight: 8 }}>
              ৳
            </span>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: 24,
                fontWeight: 800,
                color: '#111827',
                padding: '12px 0',
                outline: 'none',
                fontFamily: 'Outfit, sans-serif',
              }}
            />
          </div>
        </div>

        {/* Quick Amount Suggestion Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
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

        {/* Payment Channel */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            {isBn ? 'পরিশোধের মাধ্যম' : 'Payment Method'}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['নগদ ক্যাশ', 'বিকাশ পেমেন্ট', 'ব্যাংক ট্রান্সফার'].map(m => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                style={{
                  flex: 1,
                  padding: '9px 6px',
                  borderRadius: 12,
                  border: paymentMethod === m ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                  background: paymentMethod === m ? '#FFF0F6' : '#FFFFFF',
                  color: paymentMethod === m ? 'var(--bk-pink)' : '#4B5563',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Hold to Confirm */}
        <HoldToConfirm
          disabled={numAmount <= 0}
          onConfirm={handleFinalize}
          labelBn="জমা গ্রহণ নিশ্চিত করতে ধরে রাখুন"
          labelEn="Hold to Confirm Receipt"
        />
      </div>
    </div>
  );
}
