import React, { useState, useEffect, useMemo } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { haptics } from '../utils/haptics';
import {
  Users,
  Search,
  UserPlus,
  MessageCircle,
  Phone,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  X,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';

export default function PageCustomerKhata({ initialFilter = 'all' }) {
  const {
    language,
    customers,
    setCustomers,
    addCustomer,
    setSelectedCustomer,
    navigateTo,
    recordDueCollection,
    recordDueEntry,
    sendWhatsAppReminder,
    registerBackHandler,
    triggerCelebration,
  } = useMobileApp();

  const isBn = language === 'bn';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter); // 'all' | 'due' | 'paid'
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('due-desc'); // 'due-desc' | 'name-asc' | 'recent'
  const PAGE_SIZE = 15;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    nameBn: '',
    phone: '',
    address: '',
    openingDue: '',
    creditLimit: '15000',
  });

  // Quick Inline Transaction Drawer State
  const [quickTxnCustomer, setQuickTxnCustomer] = useState(null);
  const [quickTxnType, setQuickTxnType] = useState('collect'); // 'collect' | 'giveCredit'
  const [quickTxnAmount, setQuickTxnAmount] = useState('');
  const [quickTxnMethod, setQuickTxnMethod] = useState('নগদ ক্যাশ');
  const [quickTxnNote, setQuickTxnNote] = useState('');
  const [toast, setToast] = useState(null);

  // ── Hardware Back Button Interceptor for Modals/Drawers ──────────────
  useEffect(() => {
    if (showAddForm || quickTxnCustomer) {
      return registerBackHandler('customer-khata-modals', () => {
        if (showAddForm) {
          setShowAddForm(false);
          return true;
        }
        if (quickTxnCustomer) {
          setQuickTxnCustomer(null);
          return true;
        }
        return false;
      });
    }
  }, [showAddForm, quickTxnCustomer, registerBackHandler]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const totalDueReceivable = useMemo(() => {
    return (customers || []).reduce((sum, c) => sum + Number(c.dueAmount || 0), 0);
  }, [customers]);

  const customersWithDue = useMemo(() => {
    return (customers || []).filter(c => Number(c.dueAmount || 0) > 0);
  }, [customers]);

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = (customers || []).filter(c => {
      if (filter === 'due' && Number(c.dueAmount || 0) <= 0) return false;
      if (filter === 'paid' && Number(c.dueAmount || 0) > 0) return false;

      if (q) {
        return (
          (c.nameBn || '').toLowerCase().includes(q) ||
          (c.nameEn || '').toLowerCase().includes(q) ||
          (c.phone || '').includes(q) ||
          (c.address || '').toLowerCase().includes(q) ||
          (c.customerCode || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'due-desc') {
        return Number(b.dueAmount || 0) - Number(a.dueAmount || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.nameBn || a.nameEn || '').localeCompare(b.nameBn || b.nameEn || '');
      }
      return 0;
    });
  }, [customers, filter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginatedCustomers = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.nameBn.trim() || !newCustomer.phone.trim()) return;

    haptics.tap();
    const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created = {
      id: `cust-${Date.now().toString().slice(-5)}`,
      nameBn: newCustomer.nameBn,
      nameEn: newCustomer.nameBn,
      phone: newCustomer.phone,
      avatarColor: randomColor,
      dueAmount: Number(newCustomer.openingDue || 0),
      creditLimit: Number(newCustomer.creditLimit || 15000),
      address: newCustomer.address || 'ঢাকা',
      lastActive: 'আজকে যুক্ত',
    };

    if (addCustomer) {
      addCustomer(created);
    } else {
      setCustomers(prev => [created, ...prev]);
    }
    setNewCustomer({ nameBn: '', phone: '', address: '', openingDue: '', creditLimit: '15000' });
    setShowAddForm(false);
    haptics.success();
    showToastMsg(isBn ? 'নতুন কাস্টমার সফলভাবে নিবন্ধিত হয়েছে!' : 'New customer registered successfully!');
  };

  const openQuickTxn = (customer, type, e) => {
    e.stopPropagation();
    haptics.tap();
    setQuickTxnCustomer(customer);
    setQuickTxnType(type);
    setQuickTxnAmount(type === 'collect' && customer.dueAmount > 0 ? customer.dueAmount.toString() : '');
    setQuickTxnMethod('নগদ ক্যাশ');
    setQuickTxnNote('');
  };

  const handleExecuteQuickTxn = (e) => {
    e.preventDefault();
    const num = Number(quickTxnAmount || 0);
    if (!quickTxnCustomer || num <= 0) return;

    if (quickTxnType === 'collect') {
      recordDueCollection({
        customerId: quickTxnCustomer.id,
        customerName: isBn ? quickTxnCustomer.nameBn : quickTxnCustomer.nameEn,
        amount: num,
        paymentMethod: quickTxnMethod,
        note: quickTxnNote || 'কাস্টমার বকেয়া খাতা আদায়',
      });
      haptics.success();
      if (triggerCelebration) {
        triggerCelebration({
          type: 'collect',
          amount: num,
          partyName: isBn ? quickTxnCustomer.nameBn : quickTxnCustomer.nameEn,
          partyPhone: quickTxnCustomer.phone || '',
          titleBn: 'বকেয়া আদায় সফল হয়েছে!',
          titleEn: 'Due Collected Successfully!',
          subtitleBn: 'কাস্টমার খাতা সমন্বিত ও ক্যাশবুকে যুক্ত',
          subtitleEn: 'Customer ledger updated & cash received',
        });
      } else {
        showToastMsg(
          isBn
            ? `৳${num.toLocaleString('bn-BD')} জমা গৃহীত হয়েছে (${quickTxnCustomer.nameBn})!`
            : `Collected ৳${num.toLocaleString('en-US')} from ${quickTxnCustomer.nameEn}!`
        );
      }
    } else {
      recordDueEntry({
        customerId: quickTxnCustomer.id,
        customerName: isBn ? quickTxnCustomer.nameBn : quickTxnCustomer.nameEn,
        amount: num,
        note: quickTxnNote || 'বাকিতে মালামাল সরবরাহ',
      });
      haptics.success();
      if (triggerCelebration) {
        triggerCelebration({
          type: 'due',
          amount: num,
          partyName: isBn ? quickTxnCustomer.nameBn : quickTxnCustomer.nameEn,
          partyPhone: quickTxnCustomer.phone || '',
          titleBn: 'বাকি বিক্রয় সম্পন্ন!',
          titleEn: 'Credit Given Recorded!',
          subtitleBn: 'কাস্টমারের দেনার খাতায় সংরক্ষিত',
          subtitleEn: 'Recorded in customer due ledger',
        });
      } else {
        showToastMsg(
          isBn
            ? `৳${num.toLocaleString('bn-BD')} বাকি প্রদান করা হয়েছে (${quickTxnCustomer.nameBn})!`
            : `Given ৳${num.toLocaleString('en-US')} credit to ${quickTxnCustomer.nameEn}!`
        );
      }
    }

    setQuickTxnCustomer(null);
    setQuickTxnAmount('');
    setQuickTxnNote('');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          className="lx-toast-banner"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#111827',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: 24,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              maxWidth: '90%',
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* bKash Crimson Header */}
      <SubpageHeader
        titleBn="কাস্টমার খাতা ও বাকি হিসাব"
        titleEn="Customer Credit Ledger"
        subtitleBn={`${customers.length} জন নিবন্ধিত গ্রাহক`}
        subtitleEn={`${customers.length} registered accounts`}
        rightAction={
          <button
            onClick={() => {
              haptics.tap();
              setShowAddForm(!showAddForm);
            }}
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
            <UserPlus size={14} />
            <span>{showAddForm ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'নতুন কাস্টমার' : 'Add')}</span>
          </button>
        }
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Aggregate Debt Stats Header Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'মোট বকেয়া পাওনা (Debt)' : 'Total Due Receivable'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#E11D48', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳ {totalDueReceivable.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 12 }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'বাকিদার কাস্টমার সংখ্যা' : 'Customers with Due'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              {customersWithDue.length} <span style={{ fontSize: 12, color: '#6B7280' }}>/ {customers.length}</span>
            </div>
          </div>
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCustomer}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--bk-pink)',
              borderRadius: 18,
              padding: '16px',
              marginBottom: 14,
              boxShadow: '0 4px 14px rgba(226, 19, 110, 0.1)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--bk-pink)', marginBottom: 10 }}>
              {isBn ? 'নতুন কাস্টমার নিবন্ধন করুন' : 'Register New Customer Account'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder={isBn ? 'গ্রাহকের নাম *' : 'Full Name *'}
                value={newCustomer.nameBn}
                onChange={e => setNewCustomer({ ...newCustomer, nameBn: e.target.value })}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="text"
                placeholder={isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                value={newCustomer.phone}
                onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder={isBn ? 'ঠিকানা' : 'Address'}
                value={newCustomer.address}
                onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="number"
                placeholder={isBn ? 'পূর্বের বাকি (৳)' : 'Opening Due'}
                value={newCustomer.openingDue}
                onChange={e => setNewCustomer({ ...newCustomer, openingDue: e.target.value })}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="number"
                placeholder={isBn ? 'ক্রেডিট লিমিট (৳)' : 'Credit Limit'}
                value={newCustomer.creditLimit}
                onChange={e => setNewCustomer({ ...newCustomer, creditLimit: e.target.value })}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'খাতায় সংরক্ষণ করুন' : 'Save to Ledger'}
            </button>
          </form>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, background: '#FFFFFF', padding: 4, borderRadius: 12, border: '1px solid #E5E7EB' }}>
          {[
            { id: 'all', labelBn: 'সকল কাস্টমার', labelEn: 'All' },
            { id: 'due', labelBn: 'বকেয়া বাকিদার', labelEn: 'Has Due' },
            { id: 'paid', labelBn: 'পরিশোধিত', labelEn: 'Cleared' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                haptics.tap();
                setFilter(t.id);
                setCurrentPage(1);
              }}
              style={{
                flex: 1,
                padding: '7px 4px',
                borderRadius: 8,
                border: 'none',
                background: filter === t.id ? 'var(--bk-pink)' : 'transparent',
                color: filter === t.id ? '#FFFFFF' : '#4B5563',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isBn ? t.labelBn : t.labelEn}
            </button>
          ))}
        </div>

        {/* Search Bar & Instant Sort Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 10px',
            }}
          >
            <Search size={15} color="#9CA3AF" style={{ marginRight: 6, flexShrink: 0 }} />
            <input
              type="text"
              placeholder={isBn ? 'নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন...' : 'Search by name, phone or address...'}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '9px 0',
                fontSize: 12,
                outline: 'none',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 8px',
              fontSize: 11,
              fontWeight: 700,
              color: '#374151',
              outline: 'none',
            }}
          >
            <option value="due-desc">{isBn ? 'বাকি: বেশি ➔ কম' : 'Due: High ➔ Low'}</option>
            <option value="name-asc">{isBn ? 'নাম: অ ➔ হ' : 'Name: A ➔ Z'}</option>
          </select>
        </div>

        {/* High-Capacity Results Counter Banner */}
        <div
          style={{
            fontSize: 10.5,
            color: '#64748B',
            fontWeight: 700,
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
          }}
        >
          <span>
            {isBn
              ? `মোট ${sorted.length.toLocaleString('bn-BD')} জন গ্রাহক • প্রদর্শিত ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, sorted.length)} জন`
              : `Total ${sorted.length} customers • Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, sorted.length)}`}
          </span>
          <span style={{ color: '#2563EB' }}>
            {isBn ? `পৃষ্ঠা ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
        </div>

        {/* Customer Cards List (Paginated & High Capacity) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {paginatedCustomers.map(c => {
            const dueVal = Number(c.dueAmount || 0);
            const hasDue = dueVal > 0;
            const limit = Number(c.creditLimit || 15000);
            const usedPct = Math.min(100, Math.round((dueVal / limit) * 100));
            const isNearLimit = usedPct >= 75;

            return (
              <div
                key={c.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  padding: '13px 14px',
                  border: isNearLimit ? '1.5px solid #FECDD3' : '1px solid #E5E7EB',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  haptics.tap();
                  setSelectedCustomer(c);
                  navigateTo('customer-details', { customerId: c.id });
                }}
              >
                {/* Top Row: Avatar + Name + Due Amount */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: c.avatarColor || '#3B82F6',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {(c.nameBn || c.nameEn).charAt(0)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isBn ? c.nameBn : c.nameEn}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span>{c.phone}</span> • <span>{c.address}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 600 }}>
                      {isBn ? 'বকেয়া' : 'DUE'}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: hasDue ? '#E11D48' : '#059669',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      ৳ {dueVal.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                  </div>
                </div>

                {/* Credit Limit Meter */}
                <div style={{ marginTop: 8, background: '#F9FAFB', padding: '6px 10px', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7280', marginBottom: 4, fontWeight: 600 }}>
                    <span>{isBn ? 'ক্রেডিট লিমিট' : 'Credit Limit'}: ৳{limit.toLocaleString()}</span>
                    <span style={{ color: isNearLimit ? '#E11D48' : '#10B981', fontWeight: 700 }}>
                      {usedPct}% {isBn ? 'ব্যবহৃত' : 'Used'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${usedPct}%`,
                        height: '100%',
                        background: isNearLimit ? '#E11D48' : usedPct > 40 ? '#F59E0B' : '#10B981',
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Row: 1-Tap Quick Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid #F3F4F6',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Quick Collect Button (জমা) */}
                  <button
                    onClick={(e) => openQuickTxn(c, 'collect', e)}
                    style={{
                      flex: 1,
                      background: '#ECFDF5',
                      color: '#059669',
                      border: '1px solid #A7F3D0',
                      borderRadius: 10,
                      padding: '7px 8px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <ArrowDownLeft size={13} strokeWidth={2.6} />
                    <span>{isBn ? 'জমা গ্রহণ' : 'Collect'}</span>
                  </button>

                  {/* Quick Give Due Button (বাকি) */}
                  <button
                    onClick={(e) => openQuickTxn(c, 'giveCredit', e)}
                    style={{
                      flex: 1,
                      background: '#FFF1F2',
                      color: '#E11D48',
                      border: '1px solid #FECDD3',
                      borderRadius: 10,
                      padding: '7px 8px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <ArrowUpRight size={13} strokeWidth={2.6} />
                    <span>{isBn ? 'বাকি প্রদান' : 'Give Due'}</span>
                  </button>

                  {/* Direct Phone Call Button */}
                  <a
                    href={`tel:${c.phone}`}
                    onClick={() => haptics.tap()}
                    title="Call Customer"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={14} />
                  </a>

                  {/* WhatsApp Reminder Button */}
                  {hasDue && (
                    <button
                      onClick={() => {
                        haptics.tap();
                        sendWhatsAppReminder(c);
                      }}
                      title="Send WhatsApp Reminder"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: '#DCFCE7',
                        border: '1px solid #86EFAC',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <MessageCircle size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* High-Capacity Pagination Controls (Smooth Chunking for Thousands/Millions of Customers) */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 14,
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '8px 12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              className="lx-touch-btn"
              style={{
                background: currentPage === 1 ? '#F1F5F9' : '#EFF6FF',
                color: currentPage === 1 ? '#94A3B8' : '#2563EB',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ← {isBn ? 'পূর্ববর্তী' : 'Prev'}
            </button>

            <span style={{ fontSize: 11.5, fontWeight: 800, color: '#1E293B' }}>
              {isBn ? `পৃষ্ঠা ${currentPage.toLocaleString('bn-BD')} / ${totalPages.toLocaleString('bn-BD')}` : `Page ${currentPage} of ${totalPages}`}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              className="lx-touch-btn"
              style={{
                background: currentPage >= totalPages ? '#F1F5F9' : '#EFF6FF',
                color: currentPage >= totalPages ? '#94A3B8' : '#2563EB',
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              {isBn ? 'পরবর্তী' : 'Next'} →
            </button>
          </div>
        )}
      </div>

      {/* Quick Transaction Drawer */}
      {quickTxnCustomer && (
        <div
          className="bk-slide-drawer-backdrop"
          onClick={() => {
            haptics.tap();
            setQuickTxnCustomer(null);
          }}
        >
          <div
            className="bk-slide-drawer"
            onClick={e => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                  {quickTxnType === 'collect' ? (isBn ? 'টাকা জমা গ্রহণ' : 'Collect Due Payment') : (isBn ? 'বাকিতে মালামাল প্রদান' : 'Give Credit')}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {isBn ? quickTxnCustomer.nameBn : quickTxnCustomer.nameEn} • {isBn ? 'বর্তমান বাকি' : 'Current Due'}: ৳{Number(quickTxnCustomer.dueAmount || 0).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  setQuickTxnCustomer(null);
                }}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            {/* Segment Toggle */}
            <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', padding: 4, borderRadius: 12, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setQuickTxnType('collect');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 9,
                  border: 'none',
                  background: quickTxnType === 'collect' ? '#059669' : 'transparent',
                  color: quickTxnType === 'collect' ? '#FFFFFF' : '#4B5563',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'টাকা পেলেন (জমা)' : 'Received (Deposit)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.tap();
                  setQuickTxnType('giveCredit');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: 9,
                  border: 'none',
                  background: quickTxnType === 'giveCredit' ? '#E11D48' : 'transparent',
                  color: quickTxnType === 'giveCredit' ? '#FFFFFF' : '#4B5563',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'বাকি দিলেন (ধার)' : 'Gave Credit (Due)'}
              </button>
            </div>

            <form onSubmit={handleExecuteQuickTxn}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={quickTxnAmount}
                  onChange={e => setQuickTxnAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: '1.5px solid #D1D5DB',
                    fontSize: 20,
                    fontWeight: 900,
                    fontFamily: 'Outfit, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Quick Amount Suggestion Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {[100, 500, 1000, 2000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      haptics.add();
                      setQuickTxnAmount(val.toString());
                    }}
                    style={{
                      padding: '5px 10px',
                      background: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    +৳{val}
                  </button>
                ))}
                {quickTxnType === 'collect' && quickTxnCustomer.dueAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.add();
                      setQuickTxnAmount(quickTxnCustomer.dueAmount.toString());
                    }}
                    style={{
                      padding: '5px 10px',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#059669',
                      cursor: 'pointer',
                    }}
                  >
                    {isBn ? 'সম্পূর্ণ বাকি' : 'Full Due'} (৳{quickTxnCustomer.dueAmount})
                  </button>
                )}
              </div>

              {/* Live Balance Preview Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: 12,
                  padding: '10px 12px',
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  খতিয়ান সমন্বয় প্রিভিউ:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748B' }}>
                  <span>পূর্বের বকেয়া বাকি:</span>
                  <span style={{ fontWeight: 800 }}>৳ {Number(quickTxnCustomer.dueAmount || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: quickTxnType === 'collect' ? '#059669' : '#E11D48', marginTop: 2 }}>
                  <span>{quickTxnType === 'collect' ? 'জমা নেওয়া হচ্ছে:' : 'নতুন বাকি যুক্ত:'}</span>
                  <span style={{ fontWeight: 800 }}>
                    {quickTxnType === 'collect' ? '-' : '+'} ৳ {Number(quickTxnAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 900 }}>
                  <span style={{ color: '#0F172A' }}>অবশিষ্ট বকেয়া বাকি থাকবে:</span>
                  <span style={{ color: (quickTxnType === 'collect' ? Math.max(0, (quickTxnCustomer.dueAmount || 0) - Number(quickTxnAmount || 0)) : (quickTxnCustomer.dueAmount || 0) + Number(quickTxnAmount || 0)) > 0 ? '#E11D48' : '#059669', fontFamily: 'Outfit, sans-serif' }}>
                    ৳ {(quickTxnType === 'collect' ? Math.max(0, (quickTxnCustomer.dueAmount || 0) - Number(quickTxnAmount || 0)) : (quickTxnCustomer.dueAmount || 0) + Number(quickTxnAmount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Pills */}
              {quickTxnType === 'collect' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['নগদ ক্যাশ', 'বিকাশ', 'ব্যাংক'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          haptics.tap();
                          setQuickTxnMethod(m);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: 10,
                          border: quickTxnMethod === m ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                          background: quickTxnMethod === m ? '#FDF2F8' : '#FFFFFF',
                          color: quickTxnMethod === m ? 'var(--bk-pink)' : '#4B5563',
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
              )}

              {/* Note Input */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'বিবরণ বা নোট (ঐচ্ছিক)' : 'Note (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'যেমন: চাল ও তেল বাবদ' : 'E.g. Groceries bill'}
                  value={quickTxnNote}
                  onChange={e => setQuickTxnNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: quickTxnType === 'collect' ? '#059669' : 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: quickTxnType === 'collect' ? '0 4px 14px rgba(5, 150, 105, 0.3)' : '0 4px 14px rgba(226, 19, 110, 0.3)',
                }}
              >
                {isBn ? 'লেনদেন নিশ্চিত করুন' : 'Confirm Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
