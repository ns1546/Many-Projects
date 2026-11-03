import React from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, MessageCircle, ArrowDownLeft, ShoppingBag, Phone, MapPin } from 'lucide-react';

export default function CustomerActionModal() {
  const {
    language,
    selectedCustomer,
    setActiveModal,
    sendWhatsAppReminder,
  } = useMobileApp();

  const isBn = language === 'bn';
  const c = selectedCustomer;

  if (!c) return null;

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: c.avatarColor || '#2563EB',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {(c.nameBn || c.nameEn).charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                {isBn ? c.nameBn : c.nameEn}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {c.phone} • {c.address}
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

        {/* Balance Card */}
        <div
          style={{
            background: '#FFF0F6',
            border: '1.5px solid #FCE7F3',
            borderRadius: 16,
            padding: '16px',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
            {isBn ? 'গ্রাহকের নিকট বর্তমান মোট বকেয়া পাওনা' : 'Current Outstanding Due Balance'}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: c.dueAmount > 0 ? '#E11D48' : '#059669',
              fontFamily: 'Outfit, sans-serif',
              marginTop: 4,
            }}
          >
            ৳ {Number(c.dueAmount).toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Collect Due Payment */}
          <button
            onClick={() => setActiveModal('addMoney')}
            style={{
              background: 'var(--bk-pink)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--bk-radius-full)',
              padding: '13px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(226, 19, 110, 0.25)',
            }}
          >
            <ArrowDownLeft size={18} />
            <span>{isBn ? 'বকেয়া টাকা জমা গ্রহণ করুন' : 'Collect Due Payment'}</span>
          </button>

          {/* New POS Sale */}
          <button
            onClick={() => setActiveModal('quickSale')}
            style={{
              background: '#FFFFFF',
              color: '#111827',
              border: '1px solid #D1D5DB',
              borderRadius: 'var(--bk-radius-full)',
              padding: '13px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <ShoppingBag size={18} color="var(--bk-pink)" />
            <span>{isBn ? 'নতুন পণ্য বিক্রি (POS)' : 'New POS Sale to Customer'}</span>
          </button>

          {/* WhatsApp Reminder */}
          {c.dueAmount > 0 && (
            <button
              onClick={() => sendWhatsAppReminder(c)}
              style={{
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--bk-radius-full)',
                padding: '13px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <MessageCircle size={18} />
              <span>{isBn ? 'হোয়াটসঅ্যাপে বকেয়ার তাগাদা পাঠান' : 'Send WhatsApp Reminder'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
