import React, { useState, useEffect } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { haptics } from '../utils/haptics';
import {
  Wallet,
  Building,
  ArrowRightLeft,
  Calculator,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  RotateCcw,
  X,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';

export default function PageCashbox() {
  const {
    language,
    balances,
    setBalances,
    reconcileCashTill,
    transferCashToBank,
    transferBankToCash,
    recordExpense,
    registerBackHandler,
    triggerCelebration,
  } = useMobileApp();

  const isBn = language === 'bn';

  // Owner Personal Draw Modal State
  const [showOwnerDrawModal, setShowOwnerDrawModal] = useState(false);
  const [drawAmount, setDrawAmount] = useState('');
  const [drawReason, setDrawReason] = useState('ব্যক্তিগত পকেট খরচ');

  // Cash Transfer State
  const [transferType, setTransferType] = useState('cashToBank'); // 'cashToBank' | 'bankToCash'
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('ইসলামী ব্যাংক বাংলাদেশ');
  const [customBankName, setCustomBankName] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // ── Hardware Back Button Interceptor for Draw Modal ──────────────
  useEffect(() => {
    if (showOwnerDrawModal) {
      return registerBackHandler('cashbox-draw-modal', () => {
        setShowOwnerDrawModal(false);
        return true;
      });
    }
  }, [showOwnerDrawModal, registerBackHandler]);

  const popularBanks = [
    'ইসলামী ব্যাংক বাংলাদেশ',
    'ডাচ-বাংলা ব্যাংক',
    'ব্র্যাক ব্যাংক পিএলসি',
    'সোনালী ব্যাংক',
    'দি সিটি ব্যাংক',
    'বিকাশ মার্চেন্ট অ্যাকাউন্ট',
    'নগদ মার্চেন্ট অ্যাকাউন্ট',
    'অন্যান্য ব্যাংক / ওয়ালেট',
  ];

  // Bangladeshi Taka Denomination Counter State (Saved in LocalStorage or Clean 0 Start)
  const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  const [counts, setCounts] = useState(() => {
    try {
      const saved = localStorage.getItem('ledgerx_till_counts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      }
    } catch (e) {}
    const emptyCounts = {};
    denominations.forEach(d => {
      emptyCounts[d] = 0;
    });
    return emptyCounts;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('ledgerx_till_counts', JSON.stringify(counts));
    } catch (e) {}
  }, [counts]);

  const [activeChipAnimation, setActiveChipAnimation] = useState(null);

  const totalCalculatedCash = denominations.reduce(
    (sum, d) => sum + d * Number(counts[d] || 0),
    0
  );

  const variance = totalCalculatedCash - balances.cashInHand;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdjustDenomination = (d, delta) => {
    if (delta > 0) {
      haptics.add();
    } else {
      haptics.remove();
    }

    setCounts(prev => {
      const current = Number(prev[d] || 0);
      const next = Math.max(0, current + delta);
      return { ...prev, [d]: next };
    });

    setActiveChipAnimation({ d, delta, id: Date.now() });
    setTimeout(() => setActiveChipAnimation(null), 600);
  };

  const handleResetAllDenominations = () => {
    haptics.warning();
    const cleared = {};
    denominations.forEach(d => {
      cleared[d] = 0;
    });
    setCounts(cleared);
    showToast(isBn ? 'সব নোট কাউন্টার শূন্য করা হয়েছে' : 'All note counts reset to 0');
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    const num = Number(transferAmount || 0);
    if (num <= 0) return;

    const activeBankName = selectedBank === 'অন্যান্য ব্যাংক / ওয়ালেট'
      ? (customBankName.trim() || 'ব্যবসায়িক ব্যাংক')
      : selectedBank;

    haptics.tap();

    if (transferType === 'cashToBank') {
      if (num > balances.cashInHand) {
        haptics.warning();
        showToast(isBn ? '⚠️ ক্যাশবাক্সে পর্যাপ্ত ব্যালেন্স নেই!' : '⚠️ Insufficient cash in hand!');
        return;
      }
      if (transferCashToBank) {
        transferCashToBank(num, activeBankName, 'দৈনিক ক্যাশ ডিপোজিট');
      } else {
        setBalances(prev => ({
          ...prev,
          cashInHand: prev.cashInHand - num,
          bankBalance: prev.bankBalance + num,
        }));
      }
      haptics.success();
      if (triggerCelebration) {
        triggerCelebration({
          type: 'sale',
          amount: num,
          titleBn: 'ব্যাংক ডিপোজিট সম্পন্ন!',
          titleEn: 'Bank Deposit Completed!',
          subtitleBn: `৳${num} সফলভাবে ${activeBankName}-এ জমা হয়েছে`,
          subtitleEn: `BDT ${num} deposited to ${activeBankName}`,
        });
      } else {
        showToast(isBn ? `৳${num} সফলভাবে ${activeBankName}-এ জমা হয়েছে!` : `BDT ${num} deposited to ${activeBankName}!`);
        soundbox.playSuccess ? soundbox.playSuccess() : soundbox.playChime();
      }
    } else {
      if (num > balances.bankBalance) {
        haptics.warning();
        showToast(isBn ? '⚠️ ব্যাংক অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!' : '⚠️ Insufficient bank balance!');
        return;
      }
      if (transferBankToCash) {
        transferBankToCash(num, activeBankName, 'ব্যাংক থেকে নগদ ক্যাশ উত্তোলন');
      } else {
        setBalances(prev => ({
          ...prev,
          cashInHand: prev.cashInHand + num,
          bankBalance: prev.bankBalance - num,
        }));
      }
      haptics.success();
      if (triggerCelebration) {
        triggerCelebration({
          type: 'collect',
          amount: num,
          titleBn: 'ক্যাশ উত্তোলন সম্পন্ন!',
          titleEn: 'Cash Withdrawal Completed!',
          subtitleBn: `৳${num} ${activeBankName} থেকে ক্যাশে যুক্ত হয়েছে`,
          subtitleEn: `BDT ${num} added to cash in hand`,
        });
      } else {
        showToast(isBn ? `৳${num} ${activeBankName} থেকে ক্যাশে উত্তোলন করা হয়েছে!` : `BDT ${num} withdrawn from ${activeBankName}!`);
        soundbox.playSuccess ? soundbox.playSuccess() : soundbox.playChime();
      }
    }

    setTransferAmount('');
  };

  const handleSyncTill = () => {
    haptics.tap();
    if (reconcileCashTill) {
      reconcileCashTill(totalCalculatedCash, 'নোট গণনা সমন্বয়');
    } else {
      setBalances(prev => ({
        ...prev,
        cashInHand: totalCalculatedCash,
      }));
    }

    haptics.success();
    soundbox.playSuccess();
    showToast(
      isBn
        ? `ক্যাশবাক্স ব্যালেন্স ৳${totalCalculatedCash.toLocaleString('bn-BD')} এ আপডেট হয়েছে!`
        : `Till adjusted to BDT ${totalCalculatedCash.toLocaleString('en-US')}!`
    );
  };

  const handleOwnerDraw = (e) => {
    e.preventDefault();
    const val = Number(drawAmount || 0);
    if (val <= 0) return;

    if (val > balances.cashInHand) {
      haptics.warning();
      showToast(isBn ? '⚠️ ক্যাশবাক্সে পর্যাপ্ত টাকা নেই!' : '⚠️ Insufficient cash!');
      return;
    }

    recordExpense({
      category: 'মালিকের ব্যক্তিগত উত্তোলন',
      amount: val,
      payee: 'দোকান মালিক',
      paymentMethod: 'নগদ ক্যাশবাক্স',
      note: drawReason || 'মালিকের ব্যক্তিগত উত্তোলন',
    });

    haptics.success();
    setShowOwnerDrawModal(false);
    setDrawAmount('');

    if (triggerCelebration) {
      triggerCelebration({
        type: 'expense',
        amount: val,
        titleBn: 'মালিকের ব্যক্তিগত উত্তোলন সম্পন্ন!',
        titleEn: 'Owner Withdrawal Recorded!',
        subtitleBn: drawReason || 'ব্যক্তিগত পকেট খরচ (ক্যাশবাক্স সমন্বিত)',
        subtitleEn: 'Personal owner drawing recorded',
      });
    } else {
      soundbox.playSuccess();
      showToast(isBn ? `৳${val} মালিকের ব্যক্তিগত উত্তোলন সংরক্ষিত!` : `BDT ${val} owner drawing recorded!`);
    }
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      {/* Header */}
      <SubpageHeader
        titleBn="ক্যাশবাক্স ও ব্যাংক তহবিল"
        titleEn="Cashbox & Bank Till"
        subtitleBn="নোট গণনা ও তহবিল স্থানান্তর"
        subtitleEn="Cash count & fund management"
      />

      {/* Floating In-App Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            background: '#1F2937',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: 24,
            fontSize: 12.5,
            fontWeight: 700,
            zIndex: 9999,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ padding: '14px 14px' }}>
        {/* Balances Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
          {/* Cash in Hand */}
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                <Wallet size={16} />
              </div>
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{isBn ? 'ক্যাশ ইন হ্যান্ড' : 'Cash in Hand'}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif', marginTop: 8 }}>
              ৳ {balances.cashInHand.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Bank Reserves */}
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E60D5' }}>
                <Building size={16} />
              </div>
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{isBn ? 'ব্যাংক তহবিল' : 'Bank Balance'}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1E60D5', fontFamily: 'Outfit, sans-serif', marginTop: 8 }}>
              ৳ {balances.bankBalance.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Today's Cash Flow Breakdown Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '16px',
            border: '1px solid #E5E7EB',
            marginBottom: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 900, color: '#111827' }}>
                আজকের ক্যাশবাক্স হিসাব সমন্বয়
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                নগদ বিক্রয়, আদায় ও খরচের খতিয়ান
              </div>
            </div>
            <button
              onClick={() => {
                haptics.tap();
                setShowOwnerDrawModal(true);
              }}
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                borderRadius: 10,
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              - মালিকের উত্তোলন
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>সকালের প্রারম্ভিক ক্যাশ:</span>
              <span style={{ fontWeight: 700 }}>৳ {Math.max(0, balances.cashInHand - (balances.todaySales || 0) + (balances.todayExpense || 0)).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
              <span>+ আজকের নগদ বিক্রয়:</span>
              <span style={{ fontWeight: 800 }}>+ ৳ {(balances.todaySales || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
              <span>- আজকের দোকান খরচ ও পরিশোধ:</span>
              <span style={{ fontWeight: 800 }}>- ৳ {(balances.todayExpense || 0).toLocaleString()}</span>
            </div>
            <div style={{ borderTop: '1px dashed #E5E7EB', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 900, color: '#111827' }}>
              <span>= ক্যাশবাক্সে বর্তমান নগদ থাকা উচিত:</span>
              <span style={{ color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                ৳ {balances.cashInHand.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Transfer Funds Panel */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowRightLeft size={16} color="var(--bk-pink)" />
            <span>{isBn ? 'তহবিল স্থানান্তর (ক্যাশ ⇄ ব্যাংক)' : 'Fund Transfer (Cash ⇄ Bank)'}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => {
                haptics.tap();
                setTransferType('cashToBank');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 10,
                border: transferType === 'cashToBank' ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                background: transferType === 'cashToBank' ? '#FFF0F6' : '#FFFFFF',
                color: transferType === 'cashToBank' ? 'var(--bk-pink)' : '#4B5563',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'ক্যাশ ➔ ব্যাংকে জমা' : 'Cash to Bank'}
            </button>
            <button
              onClick={() => {
                haptics.tap();
                setTransferType('bankToCash');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 10,
                border: transferType === 'bankToCash' ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                background: transferType === 'bankToCash' ? '#FFF0F6' : '#FFFFFF',
                color: transferType === 'bankToCash' ? 'var(--bk-pink)' : '#4B5563',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'ব্যাংক ➔ ক্যাশে উত্তোলন' : 'Bank to Cash'}
            </button>
          </div>

          {/* Transfer Quick Amount Chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {[2000, 5000, 10000, 20000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  haptics.add();
                  setTransferAmount(val.toString());
                }}
                style={{
                  padding: '4px 8px',
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#4B5563',
                  cursor: 'pointer',
                }}
              >
                +৳{val.toLocaleString()}
              </button>
            ))}
            {transferType === 'cashToBank' && balances.cashInHand > 0 && (
              <button
                type="button"
                onClick={() => {
                  haptics.add();
                  setTransferAmount(Math.floor(balances.cashInHand).toString());
                }}
                style={{
                  padding: '4px 8px',
                  background: '#FFF0F6',
                  border: '1px solid #FBCFE8',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'var(--bk-pink)',
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'সব ক্যাশ' : 'All Cash'}
              </button>
            )}
          </div>

          <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#F9FAFB',
                  color: '#111827',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                title={isBn ? 'ব্যাংক বা ওয়ালেট নির্বাচন করুন' : 'Select Bank / Wallet'}
              >
                {popularBanks.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {selectedBank === 'অন্যান্য ব্যাংক / ওয়ালেট' && (
                <input
                  type="text"
                  placeholder={isBn ? 'ব্যাংকের নাম লিখুন...' : 'Bank / Wallet name...'}
                  value={customBankName}
                  onChange={e => setCustomBankName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                placeholder={isBn ? 'স্থানান্তরকৃত টাকার পরিমাণ' : 'Transfer amount'}
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12.5, outline: 'none' }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0 16px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: 40,
                }}
              >
                {isBn ? 'স্থানান্তর করুন' : 'Transfer'}
              </button>
            </div>
          </form>
        </div>

        {/* Bangladeshi Taka Denomination Counter */}
        <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calculator size={16} color="#059669" />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#111827' }}>
                {isBn ? 'নোট গণনার খাতা (Taka Calculator)' : 'Taka Denomination Counter'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleResetAllDenominations}
                title="Reset Note Counts"
                style={{
                  background: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: 8,
                  padding: '4px 8px',
                  color: '#6B7280',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <RotateCcw size={11} />
                <span>{isBn ? 'রিসেট' : 'Reset'}</span>
              </button>

              <button
                onClick={handleSyncTill}
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 8,
                  padding: '4px 10px',
                  color: '#059669',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <RefreshCw size={11} />
                <span>{isBn ? 'ক্যাশ সমন্বয়' : 'Sync Till'}</span>
              </button>
            </div>
          </div>

          {/* Variance Status Pill */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 12,
              marginBottom: 12,
              fontSize: 11.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: variance === 0 ? '#ECFDF5' : variance > 0 ? '#EFF6FF' : '#FFF1F2',
              color: variance === 0 ? '#059669' : variance > 0 ? '#1E60D5' : '#E11D48',
              border: variance === 0 ? '1px solid #A7F3D0' : variance > 0 ? '1px solid #BFDBFE' : '1px solid #FECDD3',
            }}
          >
            <span>
              {variance === 0
                ? (isBn ? '✅ ক্যাশ ও রেজিস্টার হুবহু মিলেছে' : '✅ Cash matched books')
                : variance > 0
                ? (isBn ? `🟢 উদ্বৃত্ত ক্যাশ: +৳${variance.toLocaleString('bn-BD')}` : `Surplus: +BDT ${variance}`)
                : (isBn ? `🔴 ঘাটতি ক্যাশ: -৳${Math.abs(variance).toLocaleString('bn-BD')}` : `Shortage: -BDT ${Math.abs(variance)}`)}
            </span>
            <span style={{ fontSize: 10.5, opacity: 0.85 }}>
              বই ক্যাশ: ৳{Math.round(balances.cashInHand).toLocaleString()}
            </span>
          </div>

          {/* Denominations List with Steppers and Bundle Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {denominations.map(d => {
              const count = counts[d] || 0;
              const sub = d * count;
              const isAnimating = activeChipAnimation && activeChipAnimation.d === d;

              return (
                <div
                  key={d}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 14,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  {/* Floating chip animation */}
                  {isAnimating && (
                    <div
                      className={activeChipAnimation.delta > 0 ? 'lx-flying-chip-plus' : 'lx-flying-chip-minus'}
                      style={{ position: 'absolute', right: 50, top: -4, zIndex: 10 }}
                    >
                      {activeChipAnimation.delta > 0 ? `+${activeChipAnimation.delta}` : activeChipAnimation.delta}
                    </div>
                  )}

                  {/* Note Label & Subtotal */}
                  <div style={{ width: 100 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
                        ৳{d}
                      </span>
                      <span style={{ fontSize: 10.5, color: '#6B7280' }}>নোট</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginTop: 1 }}>
                      = ৳{sub.toLocaleString()}
                    </div>
                  </div>

                  {/* Quick Bundle Add Chips */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleAdjustDenomination(d, 1)}
                      style={{
                        padding: '4px 6px',
                        background: '#FFFFFF',
                        border: '1px solid #D1D5DB',
                        borderRadius: 6,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#059669',
                        cursor: 'pointer',
                      }}
                    >
                      +১
                    </button>
                    <button
                      onClick={() => handleAdjustDenomination(d, 5)}
                      style={{
                        padding: '4px 6px',
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: 6,
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: '#059669',
                        cursor: 'pointer',
                      }}
                    >
                      +৫
                    </button>
                    <button
                      onClick={() => handleAdjustDenomination(d, 10)}
                      style={{
                        padding: '4px 6px',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 6,
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: '#1E60D5',
                        cursor: 'pointer',
                      }}
                    >
                      +১০
                    </button>
                    <button
                      onClick={() => handleAdjustDenomination(d, 100)}
                      title="Add 100 note bundle (Gaddi)"
                      style={{
                        padding: '4px 6px',
                        background: '#FDF2F8',
                        border: '1px solid #FBCFE8',
                        borderRadius: 6,
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: 'var(--bk-pink)',
                        cursor: 'pointer',
                      }}
                    >
                      +১০০
                    </button>
                  </div>

                  {/* Stepper + Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => handleAdjustDenomination(d, -1)}
                      disabled={count <= 0}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: count > 0 ? '#FEE2E2' : '#F3F4F6',
                        border: 'none',
                        color: count > 0 ? '#DC2626' : '#9CA3AF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: count > 0 ? 'pointer' : 'default',
                      }}
                    >
                      <Minus size={12} />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={counts[d] === 0 ? '' : counts[d]}
                      placeholder="0"
                      onChange={e => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        haptics.tap();
                        setCounts(prev => ({ ...prev, [d]: val }));
                      }}
                      style={{
                        width: 44,
                        padding: '4px 2px',
                        borderRadius: 6,
                        border: '1px solid #D1D5DB',
                        fontSize: 12,
                        textAlign: 'center',
                        fontWeight: 800,
                        outline: 'none',
                        background: '#FFFFFF',
                      }}
                    />

                    <button
                      onClick={() => handleAdjustDenomination(d, 1)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: '#DCFCE7',
                        border: 'none',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calculated Total Bar */}
          <div
            style={{
              padding: '12px 14px',
              background: '#FFF0F6',
              borderRadius: 14,
              border: '1px solid #FCE7F3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
              {isBn ? 'গণনাকৃত ক্যাশের মোট যোগফল' : 'Total Calculated Cash'}
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
              ৳ {totalCalculatedCash.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Owner Draw Modal */}
      {showOwnerDrawModal && (
        <div
          onClick={() => setShowOwnerDrawModal(false)}
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
              maxWidth: 360,
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#92400E' }}>
                মালিকের ব্যক্তিগত ক্যাশ উত্তোলন
              </div>
              <button
                onClick={() => setShowOwnerDrawModal(false)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 14 }}>
              ক্যাশবাক্স থেকে ব্যক্তিগত বা পরিবারের প্রয়োজনে টাকা তোলার খতিয়ান। এটি দোকানের ব্যবসায়িক ক্ষতি হিসেবে গণ্য হবে না।
            </div>

            <form onSubmit={handleOwnerDraw}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                  উত্তোলনের পরিমাণ (৳) [হাতে আছে ৳{balances.cashInHand}]
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={drawAmount}
                  onChange={e => setDrawAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #F59E0B', fontSize: 18, fontWeight: 800, outline: 'none', boxSizing: 'border-box' }}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {[500, 1000, 2000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDrawAmount(String(val))}
                    style={{ padding: '4px 10px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#92400E', cursor: 'pointer' }}
                  >
                    +৳{val}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: 4 }}>
                  বিবরণ / কারণ
                </label>
                <input
                  type="text"
                  value={drawReason}
                  onChange={e => setDrawReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                উত্তোলন নিশ্চিত করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
