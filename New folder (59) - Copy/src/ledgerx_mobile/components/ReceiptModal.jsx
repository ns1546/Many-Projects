import React from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { Check, Share2, Printer, X, Copy, Home, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ReceiptModal() {
  const {
    language,
    shopInfo,
    selectedTransaction,
    balances,
    setActiveModal,
    setActiveTab,
  } = useMobileApp();

  const isBn = language === 'bn';
  const txn = selectedTransaction;

  if (!txn) return null;

  const handleWhatsAppShare = () => {
    const formattedAmount = Number(txn.amount).toLocaleString(isBn ? 'bn-BD' : 'en-US');
    const msg = isBn
      ? `*${shopInfo.shopNameBn}*\nরসিদ নং: ${txn.id}\nতারিখ: ${txn.timestamp}\nবিবরণ: ${txn.titleBn}\nপ্রাপক/ক্রেতা: ${txn.partyName}\n*সর্বমোট: ৳ ${formattedAmount}*\nপরিশোধ মাধ্যম: ${txn.paymentMethod}\nধন্যবাদ সাথে থাকার জন্য!`
      : `*${shopInfo.shopNameEn}*\nReceipt #${txn.id}\nDate: ${txn.timestamp}\nItem: ${txn.titleEn}\nParty: ${txn.partyName}\n*Total: BDT ${formattedAmount}*\nPayment: ${txn.paymentMethod}\nThank you for your business!`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const copyTxnId = () => {
    navigator.clipboard?.writeText(txn.id);
  };

  return (
    <div className="bk-success-screen">
      {/* Top bKash Pink Header Banner */}
      <div className="bk-success-header">
        {/* Close Button */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button
            onClick={() => setActiveModal(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Animated Green Checkmark Circle */}
        <div className="bk-success-check-circle">
          <Check size={42} strokeWidth={3.5} color="#00A86B" />
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
          {isBn ? 'আপনার লেনদেন সফল হয়েছে' : 'Transaction Successful'}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.88)', marginTop: 4, fontWeight: 500 }}>
          {txn.timestamp}
        </div>
      </div>

      {/* Main Voucher Card */}
      <div className="bk-voucher-card">
        {/* Amount Display */}
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px dashed #E5E7EB' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>
            {isBn ? 'সর্বমোট লেনদেনকৃত পরিমাণ' : 'Total Transacted Amount'}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--bk-pink)',
              fontFamily: 'Outfit, sans-serif',
              marginTop: 4,
            }}
          >
            ৳ {Number(txn.amount).toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Details List */}
        <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Party / Customer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
              {isBn ? 'প্রাপক / কাস্টমার' : 'Customer / Party'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>
              {txn.partyName || (isBn ? 'সাধারণ ক্রেতা' : 'General Customer')}
            </span>
          </div>

          {/* Transaction Type */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
              {isBn ? 'লেনদেনের ধরন' : 'Transaction Type'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2937' }}>
              {isBn ? txn.titleBn : txn.titleEn}
            </span>
          </div>

          {/* Payment Method */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
              {isBn ? 'পরিশোধের মাধ্যম' : 'Payment Method'}
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: '#059669',
                background: '#ECFDF5',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              {txn.paymentMethod || 'Cash'}
            </span>
          </div>

          {/* Service Charge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
              {isBn ? 'সার্ভিস চার্জ' : 'Service Fee'}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#10B981' }}>
              {isBn ? '৳ ০.০০ (ফ্রি)' : 'BDT 0.00 (Free)'}
            </span>
          </div>

          {/* New Balance */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
              {isBn ? 'নতুন ক্যাশ ব্যালেন্স' : 'New Balance'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--bk-pink)' }}>
              ৳ {balances.cashInHand.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Transaction ID */}
          <div
            style={{
              marginTop: 6,
              padding: '10px 12px',
              background: '#F9FAFB',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>TRANSACTION ID</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#374151', letterSpacing: '0.5px' }}>
                {txn.id}
              </div>
            </div>
            <button
              onClick={copyTxnId}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--bk-pink)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Copy size={12} />
              <span>{isBn ? 'কপি' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            style={{
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--bk-radius-full)',
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
            }}
          >
            <Share2 size={16} />
            <span>{isBn ? 'হোয়াটসঅ্যাপে চালান পাঠান' : 'Share on WhatsApp'}</span>
          </button>

          {/* Print Voucher */}
          <button
            onClick={() => window.print()}
            style={{
              background: '#F3F4F6',
              color: '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: 'var(--bk-radius-full)',
              padding: '12px 16px',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Printer size={16} />
            <span>{isBn ? 'ডিজিটাল রসিদ প্রিন্ট করুন' : 'Print Digital Voucher'}</span>
          </button>

          {/* Back to Home */}
          <button
            onClick={() => {
              setActiveModal(null);
              setActiveTab('home');
            }}
            style={{
              background: 'transparent',
              color: 'var(--bk-pink)',
              border: 'none',
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 4,
            }}
          >
            <Home size={15} />
            <span>{isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
