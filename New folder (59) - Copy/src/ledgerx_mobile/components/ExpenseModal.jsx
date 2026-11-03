import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, Receipt, Zap, Coffee, Home, Users, Wrench } from 'lucide-react';
import HoldToConfirm from './HoldToConfirm';

export default function ExpenseModal() {
  const { language, recordExpense, setActiveModal } = useMobileApp();
  const isBn = language === 'bn';

  const categories = [
    { id: 'rent', nameBn: 'দোকান ভাড়া', nameEn: 'Shop Rent', icon: Home, bg: '#EFF6FF', color: '#1E60D5' },
    { id: 'electricity', nameBn: 'বিদ্যুৎ বিল', nameEn: 'Electricity Bill', icon: Zap, bg: '#FFFBEB', color: '#D97706' },
    { id: 'tea', nameBn: 'নাস্তা ও আপ্যায়ন', nameEn: 'Snacks & Tea', icon: Coffee, bg: '#FFF0F6', color: '#E2136E' },
    { id: 'salary', nameBn: 'কর্মচারী বেতন', nameEn: 'Staff Salary', icon: Users, bg: '#F5F3FF', color: '#7C3AED' },
    { id: 'other', nameBn: 'মেরামত ও অন্যান্য', nameEn: 'Maintenance & Misc', icon: Wrench, bg: '#ECFDF5', color: '#059669' },
  ];

  const [category, setCategory] = useState(categories[2].nameBn);
  const [amount, setAmount] = useState('');
  const [payee, setPayee] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ক্যাশবাক্স (Cash)');
  const [note, setNote] = useState('');

  const numAmount = Number(amount || 0);

  const quickAmounts = [
    { label: '৳৫০', val: 50 },
    { label: '৳১০০', val: 100 },
    { label: '৳৫০০', val: 500 },
    { label: '৳১,০০০', val: 1000 },
    { label: '৳৫,০০০', val: 5000 },
  ];

  const handleFinalize = () => {
    if (numAmount <= 0) return;

    recordExpense({
      category,
      amount: numAmount,
      payee: payee || (isBn ? 'দোকান ব্যয়' : 'Shop Expense'),
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
                background: '#FFF1F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E11D48',
              }}
            >
              <Receipt size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
                {isBn ? 'দোকানের খরচের খাতা' : 'Record Shop Expense'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {isBn ? 'দৈনিক খরচ ও বিল পরিশোধ হিসাবভুক্ত করুন' : 'Record operational costs & bills'}
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

        {/* Category Picker */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            {isBn ? 'খরচের খাত নির্বাচন করুন' : 'Expense Category'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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
                    padding: '8px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={18} color={isSelected ? 'var(--bk-pink)' : cat.color} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: isSelected ? 'var(--bk-pink)' : '#374151' }}>
                    {isBn ? cat.nameBn : cat.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input Field */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            {isBn ? 'খরচের পরিমাণ' : 'Expense Amount'}
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
            {isBn ? 'কার নিকট প্রদান করা হলো (ঐচ্ছিক)' : 'Paid To (Optional)'}
          </label>
          <input
            type="text"
            placeholder={isBn ? 'যেমন: বিদ্যুৎ অফিস / বাড়িওয়ালা / চা দোকান' : 'e.g., Electric bill, Landlord'}
            value={payee}
            onChange={e => setPayee(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #D1D5DB',
              fontSize: 13,
              fontWeight: 500,
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
    </div>
  );
}
