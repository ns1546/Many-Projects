import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { Bell, CheckCheck, ShieldAlert, Sparkles, Volume2, Info } from 'lucide-react';

export default function InboxTab() {
  const { language, showToast } = useMobileApp();
  const isBn = language === 'bn';

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      titleBn: 'দৈনিক হিসাব ব্যাকআপ সংরক্ষিত',
      titleEn: 'Daily Ledger Backup Synced',
      descBn: 'আজকের সকল বিক্রয় ও ক্যাশবাক্স ডেটা সফলভাবে লোকাল ড্রাইভে এনক্রিপ্ট করে ব্যাকআপ হয়েছে।',
      descEn: 'All daily sales and cash records successfully encrypted and backed up.',
      time: 'আজ দুপুর ১২:০০',
      type: 'system',
      read: false,
    },
    {
      id: 'notif-2',
      titleBn: 'বকেয়া তাগাদা রিমাইন্ডার',
      titleEn: 'Due Payment Alert',
      descBn: 'মেসার্স ভাই ভাই স্টোরের বকেয়া ৳ ২৮,৪০০ টাকা ১৫ দিনের অধিক অনাদায়ী রয়েছে।',
      descEn: 'Bhai Bhai Store due BDT 28,400 pending over 15 days.',
      time: 'আজ সকাল ০৯:১৫',
      type: 'warning',
      read: false,
    },
    {
      id: 'notif-3',
      titleBn: 'অফলাইন সাউন্ডবক্স সক্রিয়',
      titleEn: 'Offline Soundbox Active',
      descBn: 'লেজারএক্স ডিজিটাল সাউন্ডবক্স ৪.০ সফলভাবে সংযুক্ত রয়েছে।',
      descEn: 'LedgerX Digital Soundbox 4.0 is online and ready.',
      time: 'গতকাল সন্ধ্যা ০৭:০০',
      type: 'info',
      read: true,
    },
    {
      id: 'notif-4',
      titleBn: 'স্টক অ্যালার্ট: মিনিকেট চাল',
      titleEn: 'Low Stock Alert: Miniket Rice',
      descBn: 'মিনিকেট চাল ৫০ কেজি মাত্র ১৮ বস্তা অবশিষ্ট রয়েছে। দ্রুত অর্ডার করুন।',
      descEn: 'Miniket Rice 50Kg stock below threshold (18 bags remaining).',
      time: '২২ অক্টোবর',
      type: 'warning',
      read: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast(isBn ? 'সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে' : 'All notifications marked as read', 'success');
  };

  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
            {isBn ? 'ইনবক্স ও নোটিফিকেশন' : 'Inbox & Alerts'}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            {isBn ? 'হিসাবের আপডেট ও গুরুত্বপূর্ণ সতর্কবার্তা' : 'Ledger alerts & audio logs'}
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--bk-pink)',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <CheckCheck size={15} />
          <span>{isBn ? 'সব পড়ুন' : 'Mark all read'}</span>
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {notifications.map(item => (
          <div
            key={item.id}
            style={{
              background: item.read ? '#FFFFFF' : '#FFF0F6',
              border: item.read ? '1px solid #E5E7EB' : '1.5px solid #FCE7F3',
              borderRadius: 16,
              padding: '14px',
              display: 'flex',
              gap: 12,
              position: 'relative',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: item.type === 'warning' ? '#FEF2F2' : '#EFF6FF',
                color: item.type === 'warning' ? '#EF4444' : '#1E60D5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.type === 'warning' ? <ShieldAlert size={20} /> : <Bell size={20} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                  {isBn ? item.titleBn : item.titleEn}
                </span>
                <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>
                  {item.time}
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                {isBn ? item.descBn : item.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
