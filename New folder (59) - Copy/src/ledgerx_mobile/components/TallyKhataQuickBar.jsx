import React, { useState, useEffect, useMemo } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  User,
  X,
  CheckCircle2,
  Phone,
  Search,
  Sparkles,
  Wallet,
  Coffee,
  Zap,
  Home,
  Users,
  Wrench,
  Check,
  UserPlus,
  Share2,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';
import { haptics } from '../utils/haptics';

export default function TallyKhataQuickBar() {
  const {
    language,
    customers,
    addCustomer,
    recordDueEntry,
    recordDueCollection,
    recordExpense,
    showToast,
    navigateTo,
    registerBackHandler,
  } = useMobileApp();

  const isBn = language === 'bn';

  // Active drawer type: 'due' (বাকি দিলাম) | 'collect' (টাকা পেলাম) | 'expense' (খরচ দিলাম) | null
  const [activeDrawer, setActiveDrawer] = useState(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [searchCust, setSearchCust] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ');
  const [expenseCat, setExpenseCat] = useState('নাস্তা ও আপ্যায়ন');

  // Animated Success Delight Modal state
  const [successTxnModal, setSuccessTxnModal] = useState(null);

  // Register Android Hardware Back Handler for QuickBar Drawer & Modal
  useEffect(() => {
    if (activeDrawer || successTxnModal) {
      return registerBackHandler('quickbar-drawer', () => {
        if (successTxnModal) {
          setSuccessTxnModal(null);
          return true;
        }
        if (activeDrawer) {
          closeDrawer();
          return true;
        }
        return false;
      });
    }
  }, [activeDrawer, successTxnModal, registerBackHandler]);

  const selectedCust = useMemo(() => {
    return (customers || []).find(c => c.id === selectedCustomerId) || (customers || [])[0];
  }, [customers, selectedCustomerId]);

  const numAmount = Number(amount || 0);

  // Fast-indexed memoized search over potentially thousands of customers with early slice
  const filteredCustomers = useMemo(() => {
    const list = customers || [];
    if (!searchCust.trim()) return list.slice(0, 25);
    const q = searchCust.toLowerCase().trim();
    const matches = [];
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      if (
        (c.nameBn || '').toLowerCase().includes(q) ||
        (c.nameEn || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.customerCode || '').toLowerCase().includes(q)
      ) {
        matches.push(c);
        if (matches.length >= 30) break; // High performance cut-off for thousands of records
      }
    }
    return matches;
  }, [customers, searchCust]);

  const openDrawer = (type) => {
    haptics.tap();
    setActiveDrawer(type);
    setAmount('');
    setNote('');
    setSearchCust('');
    setIsSearchingCustomer(false);
    setSuccessTxnModal(null);
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    setIsSearchingCustomer(false);
  };

  // Submit Due Entry (বাকি দিলাম)
  const handleSubmitDue = (e) => {
    e.preventDefault();
    if (!selectedCust || numAmount <= 0) return;

    haptics.success();
    const prevDue = Number(selectedCust.dueAmount || 0);
    const newDue = prevDue + numAmount;

    recordDueEntry({
      customerId: selectedCust.id,
      customerName: isBn ? selectedCust.nameBn : selectedCust.nameEn,
      amount: numAmount,
      note: note || (isBn ? 'বাকিতে মালামাল বিক্রয়' : 'Credit sale'),
    });

    soundbox.speak(
      isBn
        ? `মেসার্স আল-মদিনা স্টোরে ${selectedCust.nameBn} কে ${numAmount} টাকা বাকি বিক্রয় সফল হয়েছে!`
        : `${numAmount} credit recorded for ${selectedCust.nameEn}!`,
      'bn'
    );

    setSuccessTxnModal({
      type: 'due',
      title: isBn ? 'বাকি বিক্রয় সফল হয়েছে!' : 'Credit Sale Recorded!',
      customerName: isBn ? selectedCust.nameBn : selectedCust.nameEn,
      customerPhone: selectedCust.phone,
      amount: numAmount,
      previousDue: prevDue,
      newDue: newDue,
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      id: `TXN-${Date.now().toString().slice(-6)}`,
    });

    closeDrawer();
  };

  // Submit Due Collection (টাকা পেলাম)
  const handleSubmitCollect = (e) => {
    e.preventDefault();
    if (!selectedCust || numAmount <= 0) return;

    haptics.success();
    const prevDue = Number(selectedCust.dueAmount || 0);
    const newDue = Math.max(0, prevDue - numAmount);

    recordDueCollection({
      customerId: selectedCust.id,
      customerName: isBn ? selectedCust.nameBn : selectedCust.nameEn,
      amount: numAmount,
      paymentMethod,
      note: note || (isBn ? 'বকেয়া বাকি আদায়' : 'Due payment collected'),
    });

    soundbox.speak(
      isBn
        ? `মেসার্স আল-মদিনা স্টোরে ${selectedCust.nameBn} হতে ${numAmount} টাকা বকেয়া নগদ জমা হয়েছে!`
        : `${numAmount} due collected from ${selectedCust.nameEn}!`,
      'bn'
    );

    setSuccessTxnModal({
      type: 'collect',
      title: isBn ? 'বকেয়া টাকা আদায় সফল!' : 'Due Payment Collected!',
      customerName: isBn ? selectedCust.nameBn : selectedCust.nameEn,
      customerPhone: selectedCust.phone,
      amount: numAmount,
      previousDue: prevDue,
      newDue: newDue,
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      id: `COL-${Date.now().toString().slice(-6)}`,
    });

    closeDrawer();
  };

  // Submit Expense (খরচ দিলাম)
  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    haptics.success();
    recordExpense({
      category: expenseCat,
      amount: numAmount,
      payee: note || expenseCat,
      paymentMethod,
      note,
    });

    soundbox.speak(
      isBn
        ? `দোকানের খরচ বাবদ ${numAmount} টাকা পরিশোধ সম্পন্ন!`
        : `${numAmount} expense paid!`,
      'bn'
    );

    setSuccessTxnModal({
      type: 'expense',
      title: isBn ? 'দোকানের খরচ পরিশোধ সম্পন্ন!' : 'Shop Expense Recorded!',
      customerName: expenseCat,
      customerPhone: note || 'দোকান ব্যয়',
      amount: numAmount,
      previousDue: null,
      newDue: null,
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      id: `EXP-${Date.now().toString().slice(-6)}`,
    });

    closeDrawer();
  };

  // Inline Quick Add for New Customer when searching
  const handleQuickAddNewCustomer = () => {
    if (!searchCust.trim()) return;
    haptics.success();
    const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newCust = {
      id: `cust-${Date.now().toString().slice(-5)}`,
      nameBn: searchCust.trim(),
      nameEn: searchCust.trim(),
      phone: '01700-000000',
      address: 'ঢাকা',
      avatarColor: randomColor,
      dueAmount: 0,
      creditLimit: 15000,
      lastActive: 'আজকে যুক্ত',
    };
    addCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setIsSearchingCustomer(false);
    setSearchCust('');
    showToast(isBn ? `"${newCust.nameBn}" কাস্টমার হিসেবে যুক্ত হয়েছে!` : `"${newCust.nameEn}" added as customer!`, 'success');
  };

  return (
    <div style={{ padding: '0 12px', marginTop: '-4px', marginBottom: '12px' }}>
      {/* Sleek Compact TallyKhata Action Capsule Dock (Horizontal 3-Pill Layout) */}
      <div className="lx-action-capsule-dock lx-preserve-grid">
        {/* Button 1: বাকি দিলাম (Deep Vivid Ruby-Rose) */}
        <button
          onClick={() => openDrawer('due')}
          className="lx-action-capsule-btn lx-capsule-due"
          title={isBn ? 'বাকি দিলাম' : 'Give Due'}
        >
          <div className="lx-capsule-icon-wrap">
            <ArrowUpRight size={17} strokeWidth={2.8} />
          </div>
          <div className="lx-capsule-text-col">
            <span className="lx-capsule-title">
              {isBn ? '+ বাকি দিলাম' : '+ Give Due'}
            </span>
            <span className="lx-capsule-sub" style={{ color: '#FFE4E6' }}>
              {isBn ? 'ক্রেতাকে বাকি' : 'Record Due'}
            </span>
          </div>
        </button>

        {/* Button 2: টাকা পেলাম (Deep Vibrant Emerald) */}
        <button
          onClick={() => openDrawer('collect')}
          className="lx-action-capsule-btn lx-capsule-collect"
          title={isBn ? 'টাকা পেলাম' : 'Collect Due'}
        >
          <div className="lx-capsule-icon-wrap">
            <ArrowDownLeft size={17} strokeWidth={2.8} />
          </div>
          <div className="lx-capsule-text-col">
            <span className="lx-capsule-title">
              {isBn ? '+ টাকা পেলাম' : '+ Got Due'}
            </span>
            <span className="lx-capsule-sub" style={{ color: '#D1FAE5' }}>
              {isBn ? 'বকেয়া আদায়' : 'Collection'}
            </span>
          </div>
        </button>

        {/* Button 3: খরচ দিলাম (Deep Rich Warm Amber) */}
        <button
          onClick={() => openDrawer('expense')}
          className="lx-action-capsule-btn lx-capsule-expense"
          title={isBn ? 'খরচ দিলাম' : 'Pay Expense'}
        >
          <div className="lx-capsule-icon-wrap">
            <Receipt size={16} strokeWidth={2.8} />
          </div>
          <div className="lx-capsule-text-col">
            <span className="lx-capsule-title">
              {isBn ? '- খরচ দিলাম' : '- Expense'}
            </span>
            <span className="lx-capsule-sub" style={{ color: '#FEF3C7' }}>
              {isBn ? 'দোকানের ব্যয়' : 'Shop Cost'}
            </span>
          </div>
        </button>
      </div>

      {/* Slide-up Instant Drawer Modal */}
      {activeDrawer && (
        <div
          onClick={closeDrawer}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            borderRadius: 'inherit',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              borderBottomLeftRadius: '36px',
              borderBottomRightRadius: '36px',
              padding: '18px 16px 24px 16px',
              maxHeight: '88%',
              width: '100%',
              boxSizing: 'border-box',
              overflowY: 'auto',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background:
                      activeDrawer === 'due'
                        ? '#FFE4E6'
                        : activeDrawer === 'collect'
                        ? '#D1FAE5'
                        : '#FEF3C7',
                    color:
                      activeDrawer === 'due'
                        ? '#E11D48'
                        : activeDrawer === 'collect'
                        ? '#059669'
                        : '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeDrawer === 'due' ? (
                    <ArrowUpRight size={20} strokeWidth={2.8} />
                  ) : activeDrawer === 'collect' ? (
                    <ArrowDownLeft size={20} strokeWidth={2.8} />
                  ) : (
                    <Receipt size={18} strokeWidth={2.6} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#111827' }}>
                    {activeDrawer === 'due'
                      ? isBn ? 'বাকি বিক্রি / বাকিতে মালামাল প্রদান' : 'Record Credit Sale (বাকি দিলাম)'
                      : activeDrawer === 'collect'
                      ? isBn ? 'বকেয়া টাকা গ্রহণ / আদায়' : 'Collect Due Payment (টাকা পেলাম)'
                      : isBn ? 'দোকানের খরচ প্রদান' : 'Record Shop Expense (খরচ দিলাম)'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                    {isBn ? 'সরাসরি ডিজিটাল খাতা ও ক্যাশবাক্সে হিসাব যুক্ত হবে' : 'Instantly updates your digital khata ledger'}
                  </div>
                </div>
              </div>

              <button
                onClick={closeDrawer}
                className="lx-touch-btn"
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4B5563',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={activeDrawer === 'due' ? handleSubmitDue : activeDrawer === 'collect' ? handleSubmitCollect : handleSubmitExpense}>
              
              {/* ── HIGH-CAPACITY ENTERPRISE CUSTOMER SELECTOR (Handles Millions of Customers) ── */}
              {activeDrawer !== 'expense' && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={13} color="var(--bk-pink)" />
                      <span>{isBn ? 'গ্রাহক / কাস্টমার নির্বাচন' : 'Customer Selection'}</span>
                    </label>

                    <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                      {isBn ? `মোট ${customers.length} জন গ্রাহক` : `${customers.length} customers`}
                    </span>
                  </div>

                  {/* Mode 1: Selected Customer Hero Card (Clean, non-truncated display) */}
                  {!isSearchingCustomer && selectedCust ? (
                    <div
                      style={{
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: 14,
                        padding: '10px 12px',
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
                            borderRadius: '50%',
                            background: selectedCust.avatarColor || '#2563EB',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13.5,
                            fontWeight: 900,
                          }}
                        >
                          {(selectedCust.nameBn || selectedCust.nameEn || 'গ').charAt(0)}
                        </div>

                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                            {isBn ? selectedCust.nameBn : selectedCust.nameEn}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                            <span>{selectedCust.phone}</span>
                            <span>•</span>
                            <span
                              style={{
                                fontWeight: 800,
                                color: Number(selectedCust.dueAmount || 0) > 0 ? '#DC2626' : '#059669',
                              }}
                            >
                              {Number(selectedCust.dueAmount || 0) > 0
                                ? `বর্তমান বাকি: ৳${Number(selectedCust.dueAmount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}`
                                : (isBn ? 'কোনো বাকি নেই' : 'No Due')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setIsSearchingCustomer(true);
                        }}
                        className="lx-touch-btn"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: 10,
                          padding: '6px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#2563EB',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        <Search size={12} />
                        <span>{isBn ? 'বদলান' : 'Change'}</span>
                      </button>
                    </div>
                  ) : (
                    /* Mode 2: High-Performance Search & Autocomplete Dropdown */
                    <div style={{ background: '#F8FAFC', border: '1.5px solid #3B82F6', borderRadius: 14, padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 10, padding: '6px 10px', marginBottom: 8 }}>
                        <Search size={14} color="#64748B" style={{ marginRight: 6 }} />
                        <input
                          type="text"
                          placeholder={isBn ? 'নাম, মোবাইল বা কোড দিয়ে খুঁজুন...' : 'Search by name, phone...'}
                          value={searchCust}
                          onChange={e => setSearchCust(e.target.value)}
                          autoFocus
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, width: '100%' }}
                        />
                        {searchCust && (
                          <button
                            type="button"
                            onClick={() => setSearchCust('')}
                            style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Filtered Match List (Scrollable, max 160px height) */}
                      <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {filteredCustomers.length > 0 ? (
                          filteredCustomers.slice(0, 15).map(c => {
                            const isSel = c.id === selectedCustomerId;
                            return (
                              <div
                                key={c.id}
                                onClick={() => {
                                  haptics.tap();
                                  setSelectedCustomerId(c.id);
                                  setIsSearchingCustomer(false);
                                  setSearchCust('');
                                }}
                                style={{
                                  background: isSel ? '#EFF6FF' : '#FFFFFF',
                                  border: `1px solid ${isSel ? '#BFDBFE' : '#F1F5F9'}`,
                                  borderRadius: 10,
                                  padding: '7px 10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      background: c.avatarColor || '#2563EB',
                                      color: '#FFFFFF',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: 11,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {(c.nameBn || 'গ').charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                                      {isBn ? c.nameBn : c.nameEn}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#64748B' }}>
                                      {c.phone}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      color: Number(c.dueAmount || 0) > 0 ? '#DC2626' : '#059669',
                                    }}
                                  >
                                    {Number(c.dueAmount || 0) > 0
                                      ? `৳${Number(c.dueAmount).toLocaleString('bn-BD')}`
                                      : 'বাকি নেই'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          /* Not found? 1-Tap Quick Add New Customer! */
                          <div style={{ textAlign: 'center', padding: '10px 6px' }}>
                            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>
                              "{searchCust}" নামে কোনো কাস্টমার নেই
                            </div>
                            <button
                              type="button"
                              onClick={handleQuickAddNewCustomer}
                              className="lx-touch-btn"
                              style={{
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                color: '#065F46',
                                borderRadius: 10,
                                padding: '6px 12px',
                                fontSize: 11.5,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                              }}
                            >
                              <UserPlus size={13} />
                              <span>+ নতুন কাস্টমার হিসেবে যুক্ত করুন</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expense Category Selection for Expense */}
              {activeDrawer === 'expense' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', marginBottom: 6, display: 'block' }}>
                    {isBn ? 'খরচের খাত নির্বাচন করুন' : 'Select Expense Category'}
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[
                      'নাস্তা ও আপ্যায়ন',
                      'বিদ্যুৎ বিল',
                      'দোকান ভাড়া',
                      'কর্মচারী বেতন',
                      'পরিবহন / গাড়িভাড়া',
                      'মেরামত ও অন্যান্য',
                    ].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setExpenseCat(cat)}
                        className="lx-touch-btn"
                        style={{
                          background: expenseCat === cat ? '#D97706' : '#F3F4F6',
                          color: expenseCat === cat ? '#FFFFFF' : '#374151',
                          border: 'none',
                          borderRadius: 20,
                          padding: '6px 12px',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Input with Currency Symbol */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', marginBottom: 6, display: 'block' }}>
                  {isBn ? 'টাকার পরিমাণ (BDT)' : 'Amount (৳)'}
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#F9FAFB',
                    border: '2px solid #E5E7EB',
                    borderRadius: 14,
                    padding: '8px 14px',
                  }}
                >
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--bk-pink)', marginRight: 8, fontFamily: 'Outfit, sans-serif' }}>
                    ৳
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      fontSize: 22,
                      fontWeight: 900,
                      outline: 'none',
                      color: '#111827',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  />
                </div>

                {/* Quick Amount Suggestion Chips */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {[50, 100, 200, 500, 1000, 2000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="lx-touch-btn"
                      style={{
                        background: '#F3F4F6',
                        border: '1px solid #E5E7EB',
                        borderRadius: 10,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#4B5563',
                        cursor: 'pointer',
                      }}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Financial Calculation Preview Box */}
              {activeDrawer !== 'expense' && selectedCust && numAmount > 0 && (
                <div
                  className="lx-live-calc-pulse"
                  style={{
                    background: activeDrawer === 'due' ? '#FFF1F2' : '#ECFDF5',
                    border: `1.5px solid ${activeDrawer === 'due' ? '#FECDD3' : '#A7F3D0'}`,
                    borderRadius: 14,
                    padding: '10px 12px',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: '#475569' }}>{isBn ? 'পূর্বের বাকি:' : 'Previous Due:'}</span>
                    <strong style={{ color: '#0F172A' }}>৳{Number(selectedCust.dueAmount || 0).toLocaleString('bn-BD')}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, marginTop: 2 }}>
                    <span style={{ color: '#475569' }}>
                      {activeDrawer === 'due' ? (isBn ? '+ নতুন বাকি:' : '+ New Due:') : (isBn ? '- বকেয়া আদায়:' : '- Payment:')}
                    </span>
                    <strong style={{ color: activeDrawer === 'due' ? '#E11D48' : '#059669' }}>
                      ৳{numAmount.toLocaleString('bn-BD')}
                    </strong>
                  </div>
                  <div
                    style={{
                      borderTop: '1px dashed #CBD5E1',
                      marginTop: 6,
                      paddingTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                      fontWeight: 900,
                    }}
                  >
                    <span style={{ color: '#0F172A' }}>{isBn ? 'লেনদেন শেষে নতুন বাকি:' : 'New Due Balance:'}</span>
                    <span style={{ color: activeDrawer === 'due' ? '#E11D48' : '#059669' }}>
                      ৳{Math.max(
                        0,
                        activeDrawer === 'due'
                          ? Number(selectedCust.dueAmount || 0) + numAmount
                          : Number(selectedCust.dueAmount || 0) - numAmount
                      ).toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method for Collect & Expense */}
              {activeDrawer !== 'due' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#374151', marginBottom: 6, display: 'block' }}>
                    {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['নগদ ক্যাশ', 'বিকাশ', 'নগদ', 'ব্যাংক'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className="lx-touch-btn"
                        style={{
                          flex: 1,
                          background: paymentMethod === m ? '#111827' : '#F3F4F6',
                          color: paymentMethod === m ? '#FFFFFF' : '#374151',
                          border: 'none',
                          borderRadius: 10,
                          padding: '6px 4px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Note */}
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder={
                    activeDrawer === 'due'
                      ? isBn ? 'মালের বিবরণ (যেমন: ২ কেজি চিনি, ডিম)' : 'Item notes...'
                      : isBn ? 'মন্তব্য বা ভাউচার নম্বর (ঐচ্ছিক)' : 'Memo note (optional)...'
                  }
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 12,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* 1-Tap Fast Submit Button */}
              <button
                type="submit"
                disabled={numAmount <= 0}
                className="lx-touch-btn"
                style={{
                  width: '100%',
                  background:
                    numAmount <= 0
                      ? '#E5E7EB'
                      : activeDrawer === 'due'
                      ? '#E11D48'
                      : activeDrawer === 'collect'
                      ? '#059669'
                      : '#D97706',
                  color: numAmount <= 0 ? '#9CA3AF' : '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '13px',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: numAmount <= 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: numAmount > 0 ? '0 4px 14px rgba(0, 0, 0, 0.2)' : 'none',
                }}
              >
                <CheckCircle2 size={18} />
                <span>
                  {activeDrawer === 'due'
                    ? isBn ? `৳${numAmount || 0} বাকি নিশ্চিত করুন` : `Confirm BDT ${numAmount || 0} Due`
                    : activeDrawer === 'collect'
                    ? isBn ? `৳${numAmount || 0} জমা গ্রহণ নিশ্চিত করুন` : `Confirm BDT ${numAmount || 0} Collection`
                    : isBn ? `৳${numAmount || 0} খরচ নিশ্চিত করুন` : `Confirm BDT ${numAmount || 0} Expense`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ANIMATED SUCCESS DELIGHT MODAL (See with their own eyes) ── */}
      {successTxnModal && (
        <div
          onClick={() => setSuccessTxnModal(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            borderRadius: 'inherit',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="lx-success-card-animate"
            style={{
              background: '#FFFFFF',
              borderRadius: 26,
              width: '100%',
              maxWidth: 360,
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Glowing Animated Success Badge with Shockwave */}
            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 14px auto' }}>
              <div
                className="lx-success-badge-pulse"
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  background:
                    successTxnModal.type === 'due'
                      ? '#FFE4E6'
                      : successTxnModal.type === 'collect'
                      ? '#D1FAE5'
                      : '#FEF3C7',
                  color:
                    successTxnModal.type === 'due'
                      ? '#E11D48'
                      : successTxnModal.type === 'collect'
                      ? '#059669'
                      : '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'lxPopBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                }}
              >
                <CheckCircle2 size={40} strokeWidth={2.8} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: '50%',
                  border: `2px solid ${
                    successTxnModal.type === 'due'
                      ? 'rgba(225, 29, 72, 0.5)'
                      : successTxnModal.type === 'collect'
                      ? 'rgba(5, 150, 105, 0.5)'
                      : 'rgba(217, 119, 6, 0.5)'
                  }`,
                  animation: 'lxShockwave 1.8s infinite ease-out',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', marginBottom: 2 }}>
              {successTxnModal.title}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 14 }}>
              {isBn ? 'সরাসরি হিসাবভুক্ত ও সংরক্ষিত হয়েছে' : 'Saved and ledger synchronized'}
            </div>

            {/* Big Animated Amount */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 16,
                padding: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>
                {isBn ? 'লেনদেনের পরিমাণ' : 'Transaction Amount'}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color:
                    successTxnModal.type === 'due'
                      ? '#E11D48'
                      : successTxnModal.type === 'collect'
                      ? '#059669'
                      : '#D97706',
                  fontFamily: 'Outfit, sans-serif',
                  margin: '4px 0',
                }}
              >
                ৳ {successTxnModal.amount.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#1E293B' }}>
                {successTxnModal.customerName}
              </div>
            </div>

            {/* Financial Ledger Balance Transformation */}
            {successTxnModal.previousDue !== null && (
              <div
                style={{
                  background: '#F1F5F9',
                  borderRadius: 12,
                  padding: '8px 12px',
                  marginBottom: 16,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#64748B' }}>{isBn ? 'পূর্বের বাকি' : 'Previous Due'}</div>
                  <strong style={{ color: '#0F172A' }}>৳{successTxnModal.previousDue.toLocaleString('bn-BD')}</strong>
                </div>
                <div style={{ fontSize: 14, color: '#94A3B8' }}>➔</div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#64748B' }}>{isBn ? 'নতুন মোট বাকি' : 'New Due'}</div>
                  <strong
                    style={{
                      color: successTxnModal.type === 'due' ? '#DC2626' : '#059669',
                      fontSize: 12,
                    }}
                  >
                    ৳{successTxnModal.newDue.toLocaleString('bn-BD')}
                  </strong>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    const shareText = `*${isBn ? 'লেনদেন রশিদ' : 'Transaction Receipt'}*\nদোকান: মেসার্স আল-মদিনা স্টোর\nগ্রাহক: ${successTxnModal.customerName}\nপরিমাণ: ৳${successTxnModal.amount}\nতারিখ: ${successTxnModal.date}\nনতুন বাকি: ৳${successTxnModal.newDue || 0}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                  }}
                  className="lx-touch-btn"
                  style={{
                    flex: 1,
                    background: '#25D366',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 8px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <Share2 size={14} />
                  <span>{isBn ? 'WhatsApp' : 'WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setSuccessTxnModal(null);
                    navigateTo('receipt');
                  }}
                  className="lx-touch-btn"
                  style={{
                    flex: 1,
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    borderRadius: 12,
                    padding: '10px 8px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <Receipt size={14} />
                  <span>{isBn ? 'রশিদ স্লিপ' : 'View Slip'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setSuccessTxnModal(null);
                }}
                className="lx-touch-btn"
                style={{
                  width: '100%',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'ঠিক আছে (সম্পন্ন)' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
