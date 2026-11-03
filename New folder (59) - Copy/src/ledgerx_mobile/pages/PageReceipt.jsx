import React, { useEffect } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  CheckCircle2,
  Share2,
  Printer,
  Volume2,
  Home,
  Copy,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  FileText,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';
import { haptics } from '../utils/haptics';

export default function PageReceipt() {
  const {
    language,
    selectedTransaction,
    transactions,
    shopInfo,
    balances,
    setCurrentScreen,
    setScreenHistory,
    navigateTo,
    showToast,
  } = useMobileApp();

  const isBn = language === 'bn';

  // Use the latest transaction if selectedTransaction is not set
  const txn = selectedTransaction || transactions[0] || {
    id: 'TXN-88492',
    type: 'sale',
    category: 'নগদ বিক্রয়',
    titleBn: 'কাউন্টার বিক্রয়',
    titleEn: 'Counter Sale',
    partyName: 'সাধারণ ক্রেতা',
    amount: 1450,
    paidAmount: 1450,
    dueAmount: 0,
    timestamp: 'আজ ১২:৩০',
    date: '2026-10-25',
    flow: 'in',
    status: 'সফল',
    paymentMethod: 'নগদ ক্যাশ',
    refNo: 'POS-7721',
    note: 'মুদি সামগ্রী বিক্রয়',
    items: [],
  };

  const handleReturnHome = () => {
    setCurrentScreen('home');
    setScreenHistory(['home']);
  };

  const handleReplayVoice = () => {
    soundbox.announce({
      type: txn.type || 'sale',
      amount: txn.amount,
      partyName: txn.partyName,
      language,
    });
  };

  const copyTxnId = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(txn.id);
    }
    haptics.tap();
    showToast(isBn ? `ট্রানজেকশন আইডি #${txn.id} সফলভাবে কপি হয়েছে!` : `Transaction ID #${txn.id} copied!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = isBn
      ? `পেমেন্ট রসিদ - ${shopInfo.shopNameBn}\nভাউচার আইডি: ${txn.id}\nগ্রাহক: ${txn.partyName}\nটাকার পরিমাণ: ৳ ${Number(txn.amount).toLocaleString('bn-BD')}\nমাধ্যম: ${txn.paymentMethod}\nসময়: ${txn.timestamp}\nধন্যবাদ!`
      : `Payment Receipt - ${shopInfo.shopNameEn}\nTxn ID: ${txn.id}\nCustomer: ${txn.partyName}\nAmount: BDT ${Number(txn.amount).toLocaleString('en-US')}\nMethod: ${txn.paymentMethod}\nTime: ${txn.timestamp}\nThank you!`;
    if (navigator.share) {
      navigator.share({ title: 'Payment Receipt', text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24 }}>
      {/* Top bKash Crimson Header Banner */}
      <div
        style={{
          background: 'var(--bk-pink-gradient)',
          padding: '24px 16px 40px 16px',
          color: '#FFFFFF',
          textAlign: 'center',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: '0 4px 18px rgba(226, 19, 110, 0.3)',
          position: 'relative',
        }}
      >
        {/* Animated Checkmark Circle */}
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: '#FFFFFF',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <CheckCircle2 size={44} color="#00D09C" strokeWidth={2.5} />
        </div>

        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.3px' }}>
          {isBn ? 'আপনার লেনদেনটি সফল হয়েছে' : 'Transaction Successful'}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.88)', marginTop: 4, fontWeight: 500 }}>
          {txn.timestamp} • {txn.date}
        </div>
      </div>

      {/* Main Receipt Voucher Card (bKash Style) */}
      <div
        style={{
          margin: '-24px 16px 16px 16px',
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Amount Section */}
        <div style={{ padding: '20px 18px', textAlign: 'center', borderBottom: '1px dashed #E5E7EB' }}>
          <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 600 }}>
            {isBn ? 'মোট লেনদেনের পরিমাণ' : 'Total Amount'}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: 'var(--bk-pink)',
              fontFamily: 'Outfit, sans-serif',
              margin: '4px 0',
            }}
          >
            ৳ {Number(txn.amount).toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#ECFDF5',
              color: '#059669',
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={13} />
            <span>{isBn ? txn.category || 'সফল লেনদেন' : txn.titleEn || 'Successful'}</span>
          </div>
        </div>

        {/* Voucher Metadata Table */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>{isBn ? 'গ্রাহক / পক্ষ' : 'Customer / Party'}</span>
            <span style={{ fontWeight: 800, color: '#111827' }}>{txn.partyName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>{isBn ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}</span>
            <div
              onClick={copyTxnId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: 'var(--bk-pink)',
                fontWeight: 800,
                cursor: 'pointer',
                background: '#FFF0F6',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              <span>{txn.id}</span>
              <Copy size={12} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>{isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}</span>
            <span style={{ fontWeight: 700, color: '#374151' }}>{txn.paymentMethod || 'নগদ ক্যাশ'}</span>
          </div>

          {txn.paidAmount !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6B7280', fontWeight: 500 }}>{isBn ? 'পরিশোধিত' : 'Paid Amount'}</span>
              <span style={{ fontWeight: 800, color: '#059669' }}>
                ৳ {Number(txn.paidAmount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </span>
            </div>
          )}

          {Number(txn.dueAmount) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6B7280', fontWeight: 500 }}>{isBn ? 'নতুন বকেয়া পাওনা' : 'New Due Balance'}</span>
              <span style={{ fontWeight: 800, color: '#DC2626' }}>
                ৳ {Number(txn.dueAmount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6B7280', fontWeight: 500 }}>{isBn ? 'নতুন ক্যাশ ব্যালেন্স' : 'New Cash Balance'}</span>
            <span style={{ fontWeight: 800, color: '#111827', fontFamily: 'Outfit, sans-serif' }}>
              ৳ {balances.cashInHand.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {txn.note && (
            <div style={{ paddingTop: 8, borderTop: '1px solid #F3F4F6' }}>
              <span style={{ color: '#6B7280', fontSize: 11, fontWeight: 500 }}>{isBn ? 'বিবরণ:' : 'Note:'}</span>
              <div style={{ color: '#374151', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{txn.note}</div>
            </div>
          )}
        </div>

        {/* Itemized List if available */}
        {txn.items && txn.items.length > 0 && (
          <div style={{ padding: '12px 18px', background: '#F9FAFB', borderTop: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>
              {isBn ? 'বিক্রিত পণ্যের বিবরণ' : 'Sold Items'}
            </div>
            {txn.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ color: '#374151' }}>
                  {item.nameBn || item.nameEn} × {item.qty} {item.unitBn || item.unit}
                </span>
                <span style={{ fontWeight: 700, color: '#111827' }}>
                  ৳ {(item.price * item.qty).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        <button
          onClick={handleReplayVoice}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 14,
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'var(--bk-pink)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <Volume2 size={20} />
          <span>{isBn ? 'সাউন্ডবক্স' : 'Soundbox'}</span>
        </button>

        <button
          onClick={handlePrint}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 14,
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: '#1E60D5',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <Printer size={20} />
          <span>{isBn ? 'প্রিন্ট রশিদ' : 'Print Slip'}</span>
        </button>

        <button
          onClick={handleShare}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 14,
            padding: '12px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: '#059669',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <Share2 size={20} />
          <span>{isBn ? 'শেয়ার' : 'Share'}</span>
        </button>
      </div>

      {/* Action Buttons: New Sale, Customer Khata, Return Home */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => {
            haptics.tap();
            navigateTo('quick-sale');
          }}
          style={{
            width: '100%',
            background: 'var(--bk-pink)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '13px',
            fontSize: 14,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(226, 19, 110, 0.3)',
          }}
        >
          <ShoppingCart size={18} />
          <span>{isBn ? '+ পরবর্তী নতুন বিক্রয় করুন' : '+ Start Next Sale'}</span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <button
            onClick={() => {
              haptics.tap();
              navigateTo('customer-khata');
            }}
            style={{
              background: '#FFFFFF',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: 12,
              padding: '11px',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <User size={15} />
            <span>{isBn ? 'কাস্টমার খাতা' : 'Customer Khata'}</span>
          </button>

          <button
            onClick={handleReturnHome}
            style={{
              background: '#FFFFFF',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: 12,
              padding: '11px',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <Home size={15} />
            <span>{isBn ? 'হোম ড্যাশবোর্ড' : 'Home'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
