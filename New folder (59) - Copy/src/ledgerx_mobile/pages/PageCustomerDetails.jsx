import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import HoldToConfirm from '../components/HoldToConfirm';
import {
  Phone,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  MessageCircle,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  CreditCard,
  Calendar,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  X,
  Share2,
  FileText,
  Clock,
  User,
  Edit3,
  Send,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';
import { haptics } from '../utils/haptics';

export default function PageCustomerDetails() {
  const {
    language,
    selectedCustomer,
    customers,
    setCustomers,
    getCustomerTransactions,
    recordDueCollection,
    recordDueEntry,
    sendWhatsAppReminder,
    shopInfo,
    showToast,
    navigateTo,
  } = useMobileApp();

  const isBn = language === 'bn';
  const c = selectedCustomer || customers[0] || {
    id: 'cust-1',
    nameBn: 'মো: রফিকুল ইসলাম',
    nameEn: 'Md. Rafiqul Islam',
    phone: '01812345678',
    avatarColor: '#2563EB',
    dueAmount: 4500.00,
    creditLimit: 15000,
    address: 'মিরপুর-১০, ঢাকা',
    lastActive: 'আজ',
  };

  const [activeAction, setActiveAction] = useState(null); // 'collect' | 'giveCredit' | null
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ');

  // Selected voucher transaction for detailed slip modal
  const [selectedVoucherTxn, setSelectedVoucherTxn] = useState(null);

  // Edit Customer Profile State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nameBn: c.nameBn || '',
    phone: c.phone || '',
    address: c.address || '',
    creditLimit: String(c.creditLimit || 15000),
  });

  // WhatsApp / SMS Reminder Modal State
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTone, setReminderTone] = useState('polite'); // 'polite' | 'formal' | 'urgent'

  // Fetch real customer transactions
  const customerTxns = getCustomerTransactions(c.id, c.nameBn);

  const due = Number(c.dueAmount || 0);
  const limit = Number(c.creditLimit || 15000);
  const numInput = Number(amountInput || 0);

  // Live calculation of next due balance
  const nextDue =
    activeAction === 'collect'
      ? Math.max(0, due - numInput)
      : due + numInput;

  // Calculate Running Balances for each transaction in chronological order
  const txnsWithRunningBalance = [...customerTxns]
    .reverse()
    .reduce((acc, t, idx) => {
      const prevBal = idx === 0 ? 0 : acc[idx - 1].runningBalance;
      const isCollection = t.type === 'credit_collection' || t.flow === 'in';
      const change = Number(t.amount || 0);
      const runningBalance = isCollection
        ? Math.max(0, prevBal - change)
        : prevBal + change;

      acc.push({
        ...t,
        prevBalance: prevBal,
        runningBalance: runningBalance,
        isCollection,
      });
      return acc;
    }, [])
    .reverse();

  // Total summary metrics for this customer
  const totalGivenCredit = customerTxns
    .filter(t => t.type === 'due_entry' || t.type === 'sale')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalCollected = customerTxns
    .filter(t => t.type === 'credit_collection' || t.flow === 'in')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Quick Action: Collect Due (টাকা পেলেন)
  const handleCollectDue = () => {
    if (numInput <= 0) return;

    const newTxn = recordDueCollection({
      customerId: c.id,
      customerName: isBn ? c.nameBn : c.nameEn,
      amount: numInput,
      paymentMethod,
      note: noteInput || 'কাস্টমার বকেয়া খাতা আদায়',
    });

    setActiveAction(null);
    setAmountInput('');
    setNoteInput('');
    setSelectedVoucherTxn(newTxn);
  };

  // Quick Action: Give Due / Credit Sale (বাকি দিলেন)
  const handleGiveDue = () => {
    if (numInput <= 0) return;

    const newTxn = recordDueEntry({
      customerId: c.id,
      customerName: isBn ? c.nameBn : c.nameEn,
      amount: numInput,
      note: noteInput || 'বাকিতে মালামাল সরবরাহ',
    });

    setActiveAction(null);
    setAmountInput('');
    setNoteInput('');
    setSelectedVoucherTxn(newTxn);
  };

  // Save edited customer profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    haptics.success();
    const updated = {
      ...c,
      nameBn: editForm.nameBn,
      nameEn: editForm.nameBn,
      phone: editForm.phone,
      address: editForm.address,
      creditLimit: Number(editForm.creditLimit || 15000),
    };
    setCustomers(prev => prev.map(cust => (cust.id === c.id ? updated : cust)));
    setShowEditModal(false);
    showToast(isBn ? 'গ্রাহকের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Customer profile updated!', 'success');
  };

  // Send Customized WhatsApp / SMS Reminder
  const handleSendCustomReminder = () => {
    const phone = (c.phone || '').replace(/[^0-9]/g, '');
    const formatted = phone.startsWith('88') ? phone : `88${phone}`;

    let msg = '';
    if (reminderTone === 'polite') {
      msg = `আসসালামু আলাইকুম ${c.nameBn}, ${shopInfo.shopNameBn} হতে শুভেচ্ছা। আপনার বর্তমান বকেয়া বাকি ৳${due.toLocaleString('bn-BD')}। সুবিধাজনক সময়ে পরিশোধের অনুরোধ রইল। ধন্যবাদ!`;
    } else if (reminderTone === 'urgent') {
      msg = `জরুরি নোটিশ: জনাব ${c.nameBn}, ${shopInfo.shopNameBn} এ আপনার পূর্বের বকেয়া ৳${due.toLocaleString('bn-BD')} দীর্ঘ দিন ধরে অপরিশোধিত রয়েছে। অনুগ্রহ করে আজকের মধ্যেই হিসাব সমন্বয় করুন।`;
    } else {
      msg = `হিসাব বিবরণী: ${c.nameBn}, ${shopInfo.shopNameBn} এ আপনার মোট বাকি ৳${due.toLocaleString('bn-BD')}। দোকান অথবা বিকাশ/নগদে পরিশোধ করতে পারেন।`;
    }

    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
    setShowReminderModal(false);
    haptics.tap();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 32 }}>
      {/* bKash Crimson Header with Direct Actions */}
      <SubpageHeader
        titleBn={c.nameBn || c.nameEn}
        titleEn={c.nameEn || c.nameBn}
        subtitleBn={`খতিয়ান আইডি: #${c.id.toUpperCase()}`}
        subtitleEn={`Ledger ID: #${c.id.toUpperCase()}`}
        rightAction={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <a
              href={`tel:${c.phone}`}
              onClick={() => haptics.tap()}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: 20,
                padding: '5px 10px',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Call Customer"
            >
              <Phone size={13} />
              <span>{isBn ? 'কল' : 'Call'}</span>
            </a>

            <button
              onClick={() => {
                haptics.tap();
                setShowReminderModal(true);
              }}
              style={{
                background: '#25D366',
                border: 'none',
                borderRadius: 20,
                padding: '5px 10px',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Send Reminder"
            >
              <MessageCircle size={13} />
              <span>{isBn ? 'তাগাদা' : 'Remind'}</span>
            </button>

            <button
              onClick={() => {
                haptics.tap();
                setShowEditModal(true);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: 8,
                padding: '5px 8px',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
              title="Edit Customer"
            >
              <Edit3 size={13} />
            </button>

            <button
              onClick={() => {
                haptics.tap();
                handlePrint();
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: 8,
                padding: '5px 8px',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
              title="Print Customer Statement"
            >
              <Printer size={13} />
            </button>
          </div>
        }
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Customer Profile & Due Balance Spotlight Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 22,
            padding: '18px 16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            marginBottom: 14,
            textAlign: 'center',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: c.avatarColor || '#2563EB',
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            {(c.nameBn || c.nameEn).charAt(0)}
          </div>

          <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
            {isBn ? c.nameBn : c.nameEn}
          </div>
          <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span>{c.phone}</span>
            <span>•</span>
            <span>{c.address}</span>
          </div>

          {/* Due Debt Spotlight */}
          <div
            style={{
              margin: '12px 0',
              padding: '12px 14px',
              background: due > 0 ? '#FFF1F2' : '#ECFDF5',
              borderRadius: 16,
              border: due > 0 ? '1.5px solid #FECDD3' : '1.5px solid #A7F3D0',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: due > 0 ? '#E11D48' : '#059669', textTransform: 'uppercase' }}>
              {due > 0 ? (isBn ? 'বর্তমান মোট বকেয়া পাওনা' : 'Net Pending Due') : (isBn ? 'সম্পূর্ণ পরিশোধিত (বাকি নেই)' : 'All Dues Cleared')}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: due > 0 ? '#E11D48' : '#059669',
                fontFamily: 'Outfit, sans-serif',
                marginTop: 2,
              }}
            >
              ৳ {due.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Credit Limit Usage Progress Bar */}
          <div style={{ background: '#F9FAFB', padding: '8px 12px', borderRadius: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4B5563', fontWeight: 700, marginBottom: 4 }}>
              <span>ক্রেডিট লিমিট: ৳{limit.toLocaleString()}</span>
              <span style={{ color: due >= limit ? '#DC2626' : '#2563EB' }}>
                {Math.min(100, Math.round((due / (limit || 1)) * 100))}% ব্যবহৃত
              </span>
            </div>
            <div style={{ width: '100%', height: 6, background: '#E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (due / (limit || 1)) * 100)}%`,
                  height: '100%',
                  background: due >= limit ? '#DC2626' : due >= limit * 0.7 ? '#F59E0B' : '#10B981',
                  borderRadius: 6,
                }}
              />
            </div>
          </div>

          {/* 3 Metrics Strip: Total Purchases | Total Paid | Transactions Count */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
            <div style={{ background: '#F8FAFC', padding: '8px 4px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>মোট মাল নিয়েছে</div>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: '#1E293B', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>
                ৳ {totalGivenCredit.toLocaleString()}
              </div>
            </div>
            <div style={{ background: '#F0FDF4', padding: '8px 4px', borderRadius: 12, border: '1px solid #DCFCE7' }}>
              <div style={{ fontSize: 10, color: '#166534', fontWeight: 600 }}>মোট জমা দিয়েছে</div>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: '#15803D', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>
                ৳ {totalCollected.toLocaleString()}
              </div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '8px 4px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>মোট লেনদেন</div>
              <div style={{ fontSize: 12.5, fontWeight: 900, color: '#1E293B', marginTop: 2 }}>
                {customerTxns.length} টি
              </div>
            </div>
          </div>

          {/* Dual Primary Action Buttons: 'টাকা পেলেন' vs 'বাকি দিলেন' */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {/* Green: Got Payment (টাকা পেলেন) */}
            <button
              onClick={() => {
                setActiveAction('collect');
                setAmountInput(due > 0 ? String(due) : '');
              }}
              style={{
                background: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '12px',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              <ArrowDownLeft size={18} strokeWidth={2.8} />
              <span>{isBn ? 'টাকা পেলেন (জমা)' : 'Got Money'}</span>
            </button>

            {/* Red: Gave Credit (বাকি দিলেন) */}
            <button
              onClick={() => {
                setActiveAction('giveCredit');
                setAmountInput('');
              }}
              style={{
                background: '#E11D48',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '12px',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)',
              }}
            >
              <ArrowUpRight size={18} strokeWidth={2.8} />
              <span>{isBn ? 'বাকি দিলেন (পণ্য)' : 'Give Due'}</span>
            </button>
          </div>
        </div>

        {/* Action Input Form with LIVE Balance Calculation Preview */}
        {activeAction && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '18px 16px',
              border: activeAction === 'collect' ? '2px solid #059669' : '2px solid #E11D48',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: activeAction === 'collect' ? '#059669' : '#E11D48', display: 'flex', alignItems: 'center', gap: 6 }}>
                {activeAction === 'collect' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                <span>
                  {activeAction === 'collect'
                    ? (isBn ? 'বকেয়া টাকা জমা আদায়' : 'Collect Due Payment')
                    : (isBn ? 'নতুন বাকি হিসাব এন্ট্রি' : 'Add New Credit Entry')}
                </span>
              </div>
              <button
                onClick={() => setActiveAction(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '4px 8px', color: '#6B7280', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
              >
                {isBn ? 'বন্ধ' : 'Close'}
              </button>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>টাকার পরিমাণ (৳)</label>
              <div style={{ position: 'relative', marginTop: 4 }}>
                <span style={{ position: 'absolute', left: 12, top: 10, fontSize: 18, fontWeight: 900, color: '#9CA3AF' }}>৳</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 32px',
                    borderRadius: 12,
                    border: '1.5px solid #D1D5DB',
                    fontSize: 20,
                    fontWeight: 900,
                    outline: 'none',
                    color: '#111827',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {[100, 200, 500, 1000, 2000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountInput(String(amt))}
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    padding: '5px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  +৳{amt}
                </button>
              ))}
              {activeAction === 'collect' && due > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountInput(String(due))}
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECDD3',
                    borderRadius: 10,
                    padding: '5px 10px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#E11D48',
                    cursor: 'pointer',
                  }}
                >
                  পুরো বাকি (৳{due.toLocaleString()})
                </button>
              )}
            </div>

            {/* CRITICAL: LIVE BALANCE PREVIEW BOX */}
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
                লেনদেন পরবর্তী খতিয়ান হিসাব প্রিভিউ:
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748B' }}>
                <span>পূর্বের বকেয়া বাকি:</span>
                <span style={{ fontWeight: 800 }}>৳ {due.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: activeAction === 'collect' ? '#059669' : '#E11D48', marginTop: 2 }}>
                <span>{activeAction === 'collect' ? 'আদায় হচ্ছে (জমা -):' : 'নতুন বাকি যোগ (+):'}</span>
                <span style={{ fontWeight: 800 }}>
                  {activeAction === 'collect' ? '-' : '+'} ৳ {numInput.toLocaleString()}
                </span>
              </div>
              <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 900 }}>
                <span style={{ color: '#0F172A' }}>অবশিষ্ট বকেয়া পাওনা থাকবে:</span>
                <span style={{ color: nextDue > 0 ? '#E11D48' : '#059669', fontFamily: 'Outfit, sans-serif' }}>
                  ৳ {nextDue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Note & Payment Method */}
            <div style={{ marginBottom: 14 }}>
              <input
                type="text"
                placeholder={
                  activeAction === 'collect'
                    ? isBn ? 'মন্তব্য বা ভাউচার নম্বর (ঐচ্ছিক)...' : 'Voucher/Memo note...'
                    : isBn ? 'কী কী মাল নিল (যেমন: চাল ২ কেজি, ডাল ১ কেজি)...' : 'Item description...'
                }
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 12,
                  outline: 'none',
                  marginBottom: 8,
                  boxSizing: 'border-box',
                }}
              />

              {activeAction === 'collect' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {['নগদ ক্যাশ', 'bKash/MFS', 'ব্যাংক চেক'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 8,
                        border: paymentMethod === m ? '1.5px solid #059669' : '1px solid #D1D5DB',
                        background: paymentMethod === m ? '#ECFDF5' : '#FFFFFF',
                        color: paymentMethod === m ? '#059669' : '#4B5563',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fast 1-Tap / Hold to Confirm Button */}
            <HoldToConfirm
              labelBn={
                activeAction === 'collect'
                  ? `৳${numInput || 0} জমা গ্রহণ নিশ্চিত করুন`
                  : `৳${numInput || 0} বাকি প্রদান নিশ্চিত করুন`
              }
              labelEn={activeAction === 'collect' ? 'Confirm Collection' : 'Confirm Credit'}
              onConfirm={activeAction === 'collect' ? handleCollectDue : handleGiveDue}
              disabled={numInput <= 0}
            />
          </div>
        )}

        {/* Customer Passbook Timeline Ledger */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 22,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#111827' }}>
                {isBn ? 'খতিয়ান খাতা বিবরণী (Passbook)' : 'Timeline Passbook'}
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                {isBn ? 'প্রতিটি লেনদেনের পূর্বের ও অবশিষ্ট রানিং বাকি' : 'Every entry shows running balance breakdown'}
              </div>
            </div>

            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--bk-pink)', background: '#FFF0F6', padding: '3px 8px', borderRadius: 8 }}>
              {customerTxns.length} টি ভাউচার
            </span>
          </div>

          {/* Timeline Entries with RUNNING BALANCE */}
          {txnsWithRunningBalance.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>
              {isBn ? 'এই কাস্টমারের এখনও কোন লেনদেন নেই।' : 'No transactions recorded yet.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {txnsWithRunningBalance.map((t, idx) => {
                const isPaid = t.isCollection;

                return (
                  <div
                    key={t.id || idx}
                    onClick={() => {
                      haptics.tap();
                      setSelectedVoucherTxn(t);
                    }}
                    style={{
                      padding: '12px',
                      background: isPaid ? '#F0FDF4' : '#FFF1F2',
                      borderRadius: 14,
                      border: isPaid ? '1px solid #DCFCE7' : '1px solid #FEE2E2',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                    }}
                  >
                    {/* Top Row: Type + Amount */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: isPaid ? '#DCFCE7' : '#FEE2E2',
                            color: isPaid ? '#166534' : '#991B1B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isPaid ? <ArrowDownLeft size={16} strokeWidth={2.6} /> : <ArrowUpRight size={16} strokeWidth={2.6} />}
                        </div>

                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
                            {isPaid ? (isBn ? 'টাকা জমা দিল (আদায়)' : 'Payment Received') : (isBn ? 'বাকি নিল (পণ্য)' : 'Credit Given')}
                          </div>
                          <div style={{ fontSize: 10, color: '#6B7280' }}>
                            {t.timestamp} • {t.date} • {t.paymentMethod || 'বাকি'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: isPaid ? '#166534' : '#991B1B',
                            fontFamily: 'Outfit, sans-serif',
                          }}
                        >
                          {isPaid ? 'জমা -' : 'বাকি +'} ৳ {Number(t.amount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                        </div>
                        <div style={{ fontSize: 9.5, color: '#2563EB', fontWeight: 700, textDecoration: 'underline' }}>
                          রসিদ দেখুন ➔
                        </div>
                      </div>
                    </div>

                    {/* Note / Goods Info */}
                    {t.note && (
                      <div style={{ fontSize: 11, color: '#4B5563', marginTop: 6, background: 'rgba(255,255,255,0.7)', padding: '4px 8px', borderRadius: 6 }}>
                        বিবরণ: <strong>{t.note}</strong>
                      </div>
                    )}

                    {/* Mathematical Running Balance Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 8,
                        paddingTop: 6,
                        borderTop: '1px dashed rgba(0,0,0,0.08)',
                        fontSize: 10.5,
                        color: '#4B5563',
                        fontWeight: 600,
                      }}
                    >
                      <span>পূর্বের বাকি: ৳{t.prevBalance?.toLocaleString() || 0}</span>
                      <span style={{ color: '#6B7280' }}>➔</span>
                      <span style={{ fontWeight: 800, color: '#111827' }}>
                        অবশিষ্ট বাকি: <span style={{ color: t.runningBalance > 0 ? '#DC2626' : '#059669', fontWeight: 900 }}>৳{t.runningBalance?.toLocaleString() || 0}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL 1: FULL TRANSACTION VOUCHER SLIP MODAL ── */}
      {selectedVoucherTxn && (
        <div
          onClick={() => setSelectedVoucherTxn(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 380,
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Voucher Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #E5E7EB', paddingBottom: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                {shopInfo.shopNameBn}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                {shopInfo.addressBn} • ফোন: {shopInfo.phone}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: selectedVoucherTxn.isCollection ? '#ECFDF5' : '#FFF1F2',
                  color: selectedVoucherTxn.isCollection ? '#059669' : '#E11D48',
                  padding: '3px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  marginTop: 8,
                }}
              >
                {selectedVoucherTxn.isCollection ? 'বকেয়া জমার রসিদ (Cash Memo)' : 'বাকি বিক্রয়ের ভাউচার (Credit Slip)'}
              </div>
            </div>

            {/* Voucher Details Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>ভাউচার নম্বর:</span>
                <span style={{ fontWeight: 800, color: '#111827' }}>#{selectedVoucherTxn.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>তারিখ ও সময়:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{selectedVoucherTxn.timestamp} ({selectedVoucherTxn.date})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>গ্রাহকের নাম:</span>
                <span style={{ fontWeight: 800, color: '#111827' }}>{c.nameBn}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>মোবাইল নম্বর:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{c.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>পরিশোধ মাধ্যম:</span>
                <span style={{ fontWeight: 700, color: '#374151' }}>{selectedVoucherTxn.paymentMethod || 'নগদ ক্যাশ'}</span>
              </div>
              {selectedVoucherTxn.note && (
                <div style={{ background: '#F9FAFB', padding: '6px 10px', borderRadius: 8 }}>
                  <span style={{ color: '#6B7280', fontSize: 11 }}>মালের বিবরণ / মন্তব্য:</span>
                  <div style={{ fontWeight: 700, color: '#111827', marginTop: 2 }}>{selectedVoucherTxn.note}</div>
                </div>
              )}
            </div>

            {/* Amount Spotlight Box */}
            <div style={{ background: selectedVoucherTxn.isCollection ? '#F0FDF4' : '#FFF1F2', borderRadius: 14, padding: '12px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: selectedVoucherTxn.isCollection ? '#059669' : '#E11D48' }}>
                {selectedVoucherTxn.isCollection ? 'মোট আদায়কৃত টাকা' : 'মোট বাকির পরিমাণ'}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: selectedVoucherTxn.isCollection ? '#059669' : '#E11D48', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {Number(selectedVoucherTxn.amount).toLocaleString('bn-BD')}
              </div>
              <div style={{ fontSize: 11, color: '#4B5563', marginTop: 4 }}>
                বর্তমান অবশিষ্ট বাকি: <strong>৳ {selectedVoucherTxn.runningBalance?.toLocaleString('bn-BD') || due.toLocaleString('bn-BD')}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
              <button
                onClick={() => {
                  window.print();
                  haptics.tap();
                }}
                style={{
                  background: '#F3F4F6',
                  color: '#111827',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Printer size={15} />
                <span>প্রিন্ট রসিদ</span>
              </button>

              <button
                onClick={() => {
                  const phone = (c.phone || '').replace(/[^0-9]/g, '');
                  const formatted = phone.startsWith('88') ? phone : `88${phone}`;
                  const msg = `ভাউচার রসিদ - ${shopInfo.shopNameBn}\nআইডি: #${selectedVoucherTxn.id}\nগ্রাহক: ${c.nameBn}\nপরিমাণ: ৳${selectedVoucherTxn.amount}\nতারিখ: ${selectedVoucherTxn.timestamp}\nঅবশিষ্ট বাকি: ৳${selectedVoucherTxn.runningBalance || due}\nধন্যবাদ!`;
                  window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
                  haptics.tap();
                }}
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Share2 size={15} />
                <span>রসিদ পাঠান</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedVoucherTxn(null)}
              style={{
                width: '100%',
                background: '#111827',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT CUSTOMER PROFILE MODAL ── */}
      {showEditModal && (
        <div
          onClick={() => setShowEditModal(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 380,
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#111827' }}>
                গ্রাহকের তথ্য ও লিমিট সম্পাদনা
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>গ্রাহকের নাম</label>
                <input
                  type="text"
                  value={editForm.nameBn}
                  onChange={e => setEditForm({ ...editForm, nameBn: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12.5, outline: 'none', marginTop: 4, boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12.5, outline: 'none', marginTop: 4, boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>ঠিকানা</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12.5, outline: 'none', marginTop: 4, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>ক্রেডিট লিমিট (সর্বোচ্চ বাকি সীমা ৳)</label>
                <input
                  type="number"
                  value={editForm.creditLimit}
                  onChange={e => setEditForm({ ...editForm, creditLimit: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12.5, outline: 'none', marginTop: 4, boxSizing: 'border-box' }}
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
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: 'pointer',
                  marginTop: 6,
                }}
              >
                সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: WHATSAPP / SMS REMINDER MESSAGE BUILDER ── */}
      {showReminderModal && (
        <div
          onClick={() => setShowReminderModal(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 380,
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={18} color="#25D366" />
                <span>বকেয়া বাকি তাগাদা বার্তা</span>
              </div>
              <button
                onClick={() => setShowReminderModal(false)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 10 }}>
              বার্তার ধরন নির্বাচন করুন:
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { id: 'polite', label: 'নম্র তাগাদা' },
                { id: 'formal', label: 'হিসাব বিবরণী' },
                { id: 'urgent', label: 'জরুরি নোটিশ' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setReminderTone(t.id)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 10,
                    border: reminderTone === t.id ? '2px solid #25D366' : '1px solid #E5E7EB',
                    background: reminderTone === t.id ? '#ECFDF5' : '#FFFFFF',
                    color: reminderTone === t.id ? '#059669' : '#4B5563',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Live Message Preview */}
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px', fontSize: 12, color: '#374151', lineHeight: '1.5', marginBottom: 14 }}>
              {reminderTone === 'polite'
                ? `আসসালামু আলাইকুম ${c.nameBn}, ${shopInfo.shopNameBn} হতে শুভেচ্ছা। আপনার বর্তমান বকেয়া বাকি ৳${due.toLocaleString('bn-BD')}। সুবিধাজনক সময়ে পরিশোধের অনুরোধ রইল। ধন্যবাদ!`
                : reminderTone === 'urgent'
                ? `জরুরি নোটিশ: জনাব ${c.nameBn}, ${shopInfo.shopNameBn} এ আপনার পূর্বের বকেয়া ৳${due.toLocaleString('bn-BD')} দীর্ঘ দিন ধরে অপরিশোধিত রয়েছে। অনুগ্রহ করে আজকের মধ্যেই হিসাব সমন্বয় করুন।`
                : `হিসাব বিবরণী: ${c.nameBn}, ${shopInfo.shopNameBn} এ আপনার মোট বাকি ৳${due.toLocaleString('bn-BD')}। দোকান অথবা বিকাশ/নগদে পরিশোধ করতে পারেন।`}
            </div>

            <button
              onClick={handleSendCustomReminder}
              style={{
                width: '100%',
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '12px',
                fontWeight: 900,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Send size={16} />
              <span>হোয়াটসঅ্যাপে পাঠান ({c.phone})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
