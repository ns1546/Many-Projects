import React, { useState, useEffect } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  Sparkles,
  FileText,
  Boxes,
  Scale,
  CreditCard,
  QrCode,
  Receipt,
  ChevronRight,
  Gift,
  Volume2,
  Award,
  Clock,
  Users,
  ChevronDown,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export default function BentoServices() {
  const { language, navigateTo } = useMobileApp();
  const isBn = language === 'bn';

  // Promotional Banner Carousel Index
  const [activeBanner, setActiveBanner] = useState(0);
  // Expandable services toggle
  const [showAllServices, setShowAllServices] = useState(false);

  const banners = [
    {
      id: 'banner1',
      titleBn: 'হালখাতা উৎসব ২০২৬!',
      titleEn: 'Halkhata Festival 2026',
      subBn: 'বকেয়া আদায়ে ডিজিটাল মিষ্টি কার্ড ও এসএমএস পাঠান',
      subEn: 'Send digital sweets & custom SMS for credit collection',
      bg: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
      icon: Gift,
      badgeBn: 'উৎসব অফার',
      badgeEn: 'Special Festival',
      screen: 'halkhata',
    },
    {
      id: 'banner2',
      titleBn: 'স্মার্ট সাউন্ডবক্স যুক্ত করুন',
      titleEn: 'Connect Smart Soundbox',
      subBn: 'প্রতিটি লেনদেনে স্পষ্ট বাংলা অডিও ভয়েস নিশ্চিতকরণ',
      subEn: 'Instant Bengali voice announcement on every payment',
      bg: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)',
      icon: Volume2,
      badgeBn: 'ভয়েস বক্স',
      badgeEn: 'Soundbox Pro',
      screen: 'soundbox',
    },
    {
      id: 'banner3',
      titleBn: 'এনবিআর মূসক ৬.৩ চালান',
      titleEn: 'NBR Tax Invoice 6.3',
      subBn: 'সরকারি বিধিসম্মত ট্যাক্স চালান তৈরি ও প্রিন্ট করুন',
      subEn: 'Generate & print compliant VAT invoices instantly',
      bg: 'linear-gradient(135deg, #1E3C72 0%, #2A5298 100%)',
      icon: Award,
      badgeBn: 'সরকারি ফরম্যাট',
      badgeEn: 'NBR Ready',
      screen: 'mushak-tax',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const services = [
    {
      id: 'halkhata',
      screen: 'halkhata',
      titleBn: 'হালখাতা উৎসব',
      titleEn: 'Halkhata Festival',
      descBn: 'আমন্ত্রণ ও মিষ্টি বিতরণ খতিয়ান',
      descEn: 'Invites & Dues Settlement',
      icon: Sparkles,
      color: '#E2136E',
      accentBg: '#FFF0F6',
      tagBn: 'উৎসব অফার',
      tagEn: 'Special Event',
    },
    {
      id: 'mushak',
      screen: 'mushak-tax',
      titleBn: 'মুসক ৬.৩ চালান',
      titleEn: 'Mushak 6.3 Tax',
      descBn: 'NBR সরকারি ভ্যাট চালান জেনারেটর',
      descEn: 'Official NBR Tax Engine',
      icon: FileText,
      color: '#1E60D5',
      accentBg: '#EFF6FF',
      tagBn: 'NBR সরকারি',
      tagEn: 'NBR Approved',
    },
    {
      id: 'cheques',
      screen: 'cheque-register',
      titleBn: 'ব্যাংক চেক খাতা',
      titleEn: 'Cheque Register',
      descBn: 'পোস্ট-ডেটেড চেক ও ক্লিয়ারিং',
      descEn: 'Post-Dated Cheques',
      icon: CreditCard,
      color: '#7C3AED',
      accentBg: '#F5F3FF',
      tagBn: 'ব্যাংক ডিউ',
      tagEn: 'Bank Clearance',
    },
    {
      id: 'soundbox',
      screen: 'soundbox',
      titleBn: 'স্মার্ট সাউন্ডবক্স',
      titleEn: 'Voice Soundbox',
      descBn: 'বাংলায় লাইভ পেমেন্ট অডিও ঘোষণা',
      descEn: 'Bangla Audio Alerts',
      icon: Volume2,
      color: '#DB2777',
      accentBg: '#FDF2F8',
      tagBn: 'ভয়েস হাব',
      tagEn: 'Voice Hub',
    },
    {
      id: 'qr',
      screen: 'qr-hub',
      titleBn: 'মার্চেন্ট কিউআর হাব',
      titleEn: 'Dynamic QR Hub',
      descBn: 'কাস্টমার পেমেন্ট কিউআর কোড',
      descEn: 'Instant QR Payment',
      icon: QrCode,
      color: '#0D9488',
      accentBg: '#F0FDFA',
      tagBn: 'পেমেন্ট কিউআর',
      tagEn: 'QR Pay',
    },
    {
      id: 'receipt',
      screen: 'receipt',
      titleBn: 'লেনদেন রশিদ',
      titleEn: 'Receipt Voucher',
      descBn: 'থার্মাল প্রিন্ট ও ডিজিটাল ভাউচার',
      descEn: 'Print & WhatsApp Slip',
      icon: Receipt,
      color: '#059669',
      accentBg: '#ECFDF5',
      tagBn: 'ভাউচার স্লিপ',
      tagEn: 'Slip Print',
    },
    {
      id: 'crates',
      screen: 'crates',
      titleBn: 'ক্যারেট ও সিলিন্ডার',
      titleEn: 'Crates & Bottles',
      descBn: 'খালি ক্যারেট ও সিলিন্ডার ট্র্যাকার',
      descEn: 'Returnable Asset Debt',
      icon: Boxes,
      color: '#D97706',
      accentBg: '#FFFBEB',
      tagBn: 'নন-ক্যাশ এসেট',
      tagEn: 'Physical Asset',
    },
    {
      id: 'bagCalc',
      screen: 'bag-calc',
      titleBn: 'বস্তা ⇄ কেজি রূপান্তর',
      titleEn: 'Bag to Kg Math',
      descBn: 'পাইকারি বস্তা ও খুচরা কেজি হিসাব',
      descEn: 'Wholesale vs Loose Retail',
      icon: Scale,
      color: '#4F46E5',
      accentBg: '#EEF2FF',
      tagBn: 'পাইকারি ক্যাল্ক',
      tagEn: 'Paikari Tool',
    },
    {
      id: 'directory',
      screen: 'customer-directory',
      titleBn: 'গ্রাহক ডিরেক্টরি ও CRM',
      titleEn: 'Customer CRM',
      descBn: 'খরিদ্দার কন্টাক্ট, কল ও প্রোফাইল খাতা',
      descEn: 'Profiles, Calling & Contacts',
      icon: Users,
      color: '#059669',
      accentBg: '#ECFDF5',
      tagBn: 'সিআরএম হাব',
      tagEn: 'CRM Hub',
    },
    {
      id: 'history',
      screen: 'system-history',
      titleBn: 'অডিট ও হিস্ট্রি',
      titleEn: 'Audit & History',
      descBn: 'সার্বজনীন লেজার ও লেনদেন ইতিহাস',
      descEn: 'General Ledger Audit Logs',
      icon: Clock,
      color: '#0891B2',
      accentBg: '#ECFEFF',
      tagBn: 'অডিট লগ',
      tagEn: 'Audit Trail',
    },
  ];

  const currentB = banners[activeBanner];
  const BannerIcon = currentB.icon;

  const handleBannerClick = () => {
    if (currentB.screen) {
      navigateTo(currentB.screen);
    }
  };

  return (
    <section style={{ marginBottom: 16 }}>
      {/* Promotional Banner Carousel (bKash Style) */}
      <div className="bk-banner-slider">
        <div
          className="bk-banner-card"
          style={{ background: currentB.bg }}
          onClick={handleBannerClick}
        >
          <div style={{ flex: 1, zIndex: 2 }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.22)',
                color: '#FFFFFF',
                fontSize: 9.5,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 10,
                display: 'inline-block',
                marginBottom: 4,
              }}
            >
              {isBn ? currentB.badgeBn : currentB.badgeEn}
            </span>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
              {isBn ? currentB.titleBn : currentB.titleEn}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.88)', marginTop: 2, fontWeight: 500 }}>
              {isBn ? currentB.subBn : currentB.subEn}
            </div>
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <BannerIcon size={24} color="#FFFFFF" />
          </div>
        </div>

        {/* Carousel Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
          {banners.map((b, i) => (
            <div
              key={b.id}
              onClick={() => setActiveBanner(i)}
              style={{
                width: activeBanner === i ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: activeBanner === i ? 'var(--bk-pink)' : '#D1D5DB',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bento Grid Header */}
      <div style={{ padding: '4px 18px 10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--bk-text-primary)' }}>
          {isBn ? 'অন্যান্য সেবা ও বিজনেস টুলস' : 'Other Services & Business Tools'}
        </span>
      </div>

      {/* 2-Column Bento Grid (Concise 2x2 by default, expandable under button) */}
      <div className="bk-bento-grid">
        {(showAllServices ? services : services.slice(0, 4)).map(svc => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              className="bk-bento-card"
              onClick={() => {
                haptics.tap();
                navigateTo(svc.screen);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: svc.accentBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: svc.color,
                  }}
                >
                  <Icon size={19} strokeWidth={2.2} />
                </div>
                <span
                  style={{
                    fontSize: 8.5,
                    fontWeight: 700,
                    color: svc.color,
                    background: svc.accentBg,
                    padding: '2px 6px',
                    borderRadius: 6,
                  }}
                >
                  {isBn ? svc.tagBn : svc.tagEn}
                </span>
              </div>

              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--bk-text-primary)' }}>
                  {isBn ? svc.titleBn : svc.titleEn}
                </div>
                <div style={{ fontSize: 10, color: 'var(--bk-text-muted)', marginTop: 2, lineHeight: 1.2 }}>
                  {isBn ? svc.descBn : svc.descEn}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse Services Button */}
      <div style={{ padding: '0 18px', marginTop: 10 }}>
        <button
          onClick={() => {
            haptics.tap();
            setShowAllServices(!showAllServices);
          }}
          className="lx-touch-btn"
          style={{
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 14,
            padding: '10px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--bk-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <span>
            {showAllServices
              ? (isBn ? 'সংক্ষিপ্ত করুন' : 'Show Less')
              : (isBn ? `আরও ${services.length - 4}টি বিজনেস টুলস ও সেবা দেখুন` : `View ${services.length - 4} More Business Tools`)}
          </span>
          <ChevronDown
            size={14}
            style={{
              transform: showAllServices ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </div>
    </section>
  );
}
