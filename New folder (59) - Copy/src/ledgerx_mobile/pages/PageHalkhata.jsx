import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import HoldToConfirm from '../components/HoldToConfirm';
import {
  Sparkles,
  Gift,
  Share2,
  CheckCircle2,
  Send,
  Users,
  Award,
  Calendar,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';

export default function PageHalkhata() {
  const { language, customers, shopInfo, recordDueCollection, navigateTo } = useMobileApp();
  const isBn = language === 'bn';

  const [selectedCust, setSelectedCust] = useState(customers[0] || null);
  const [discountPercent, setDiscountPercent] = useState(5);
  const [sweetBoxSent, setSweetBoxSent] = useState({});

  const due = selectedCust ? Number(selectedCust.dueAmount || 0) : 0;
  const waiver = Math.round((due * discountPercent) / 100);
  const finalCollect = Math.max(0, due - waiver);

  const handleSendInvite = (cust) => {
    setSweetBoxSent(prev => ({ ...prev, [cust.id]: true }));
    const phone = (cust.phone || '').replace(/[^0-9]/g, '');
    const sName = isBn ? (shopInfo.shopNameBn || shopInfo.shopName || 'আমাদের দোকান') : (shopInfo.shopNameEn || shopInfo.shopName || 'Our Shop');
    const oName = shopInfo.ownerName || 'স্বত্বাধিকারী';
    const custDue = cust.dueAmount || 0;
    const msg = isBn
      ? `শুভ নববর্ষ ১৪৩৩! ${sName}-এর শুভ হালখাতা উৎসবে আপনার সাদর আমন্ত্রণ। আপনার বকেয়া ৳${custDue} টাকা পরিশোধে বিশেষ ${discountPercent}% উৎসব ছাড় ও ঐতিহ্যবাহী মিষ্টির প্যাকেট উপহার রয়েছে। শুভেচ্ছান্তে, ${oName}`
      : `Happy New Year! Cordial invitation to ${sName}'s Halkhata festival. Pay your outstanding due of ৳${custDue} to get a special ${discountPercent}% festive waiver and a sweet box gift. Regards, ${oName}`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleSettle = () => {
    if (!selectedCust || due <= 0) return;

    recordDueCollection({
      customerId: selectedCust.id,
      customerName: isBn ? selectedCust.nameBn : selectedCust.nameEn,
      amount: finalCollect,
      paymentMethod: 'হালখাতা উৎসব নগদ',
      note: `হালখাতা ১৪৩৩ উৎসব স্পেশাল বকেয়া সমন্বয় (উৎসব ছাড় ৳${waiver})`,
    });

    soundbox.playChime();
    navigateTo('receipt');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 80 }}>
      {/* bKash Crimson Header */}
      <SubpageHeader
        titleBn="শুভ হালখাতা উৎসব ১৪৩৩"
        titleEn="Halkhata Festival 2026"
        subtitleBn="ঐতিহ্যবাহী বকেয়া আদায় ও মিষ্টি বিতরণ"
        subtitleEn="Traditional Bengali Ledger Settlement"
      />

      <div style={{ padding: '16px' }}>
        {/* Festive Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
            borderRadius: 22,
            padding: '20px',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(255, 65, 108, 0.3)',
            marginBottom: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gift size={24} color="#FFFFFF" />
            </div>
            <div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 9.5,
                  fontWeight: 800,
                }}
              >
                বৈশাখী মহোৎসব
              </span>
              <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>
                শুভ হালখাতা মিষ্টি কার্ড ও বকেয়া নিষ্পত্তি
              </div>
            </div>
          </div>

          <p style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.9)', margin: '8px 0 0 0', lineHeight: 1.4 }}>
            পুরনো খাতার সকল হিসাব সমন্বয় করে নতুন বৈশাখে ব্যবসা শুরু করুন। কাস্টমারদের ডিজিটাল আমন্ত্রণ কার্ড পাঠান ও মিষ্টির প্যাকেট উপহার দিন।
          </p>
        </div>

        {/* Customer Settlement Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
            {isBn ? 'হালখাতায় গ্রাহক নির্বাচন ও নিষ্পত্তি' : 'Select Customer for Halkhata Settlement'}
          </div>

          {/* Customer Dropdown */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>বাকি খাতার গ্রাহক</label>
            <select
              value={selectedCust ? selectedCust.id : ''}
              onChange={e => {
                const c = customers.find(x => x.id === e.target.value);
                setSelectedCust(c || null);
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #D1D5DB',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#111827',
                marginTop: 4,
                outline: 'none',
              }}
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameBn || c.nameEn} ({c.phone}) — বাকি ৳{c.dueAmount}
                </option>
              ))}
            </select>
          </div>

          {/* Festival Discount Slabs */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>হালখাতা বিশেষ ছাড় (উৎসব স্পেশাল):</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {[0, 3, 5, 10].map(pct => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 10,
                    border: discountPercent === pct ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                    background: discountPercent === pct ? '#FFF0F6' : '#FFFFFF',
                    color: discountPercent === pct ? 'var(--bk-pink)' : '#374151',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {pct === 0 ? 'ছাড় নেই' : `${pct}% ছাড়`}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Box */}
          <div
            style={{
              background: '#F9FAFB',
              borderRadius: 14,
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>মোট খাতা বকেয়া:</span>
              <span style={{ fontWeight: 700, color: '#DC2626' }}>৳ {due.toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
            </div>
            {waiver > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>উৎসব ছাড় ({discountPercent}%):</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>- ৳ {waiver.toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: '#111827', paddingTop: 6, borderTop: '1px solid #E5E7EB' }}>
              <span>আদায়যোগ্য নগদ টাকা:</span>
              <span style={{ color: 'var(--bk-pink)' }}>৳ {finalCollect.toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
            </div>
          </div>

          {/* Hold to Confirm Settle */}
          <HoldToConfirm
            labelBn="হালখাতা বকেয়া আদায় করতে চেপে ধরে রাখুন"
            labelEn="Hold to Settle Halkhata Due"
            onConfirm={handleSettle}
            disabled={finalCollect <= 0}
          />
        </div>

        {/* Customer Invitation Row */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid #E5E7EB',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
            {isBn ? 'গ্রাহকদের মিষ্টি ও কার্ড পাঠান:' : 'Send Sweet Box & Invitation Card:'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customers.slice(0, 4).map(cust => (
              <div
                key={cust.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#F9FAFB',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827' }}>
                    {cust.nameBn || cust.nameEn}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                    বকেয়া: ৳ {Number(cust.dueAmount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                  </div>
                </div>

                <button
                  onClick={() => handleSendInvite(cust)}
                  style={{
                    background: sweetBoxSent[cust.id] ? '#ECFDF5' : '#FFF0F6',
                    border: sweetBoxSent[cust.id] ? '1px solid #A7F3D0' : '1px solid #FCE7F3',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: sweetBoxSent[cust.id] ? '#059669' : 'var(--bk-pink)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Send size={12} />
                  <span>{sweetBoxSent[cust.id] ? (isBn ? 'পাঠানো হয়েছে' : 'Sent') : (isBn ? 'কার্ড পাঠান' : 'Send Invite')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
