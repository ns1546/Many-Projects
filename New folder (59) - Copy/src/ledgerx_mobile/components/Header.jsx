import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { Bell, Globe, ShieldCheck, Sparkles, QrCode, Store, ChevronDown } from 'lucide-react';

export default function Header() {
  const {
    language,
    setLanguage,
    shopInfo,
    balances,
    balanceVisible,
    toggleBalancePeek,
    activeTenantId,
    availableTenants = [],
    setShowStoreModal,
    setActiveTab,
    navigateTo,
  } = useMobileApp();

  const isBn = language === 'bn';
  const activeStore = availableTenants.find(t => t.id === activeTenantId);

  return (
    <header className="bk-header-container" style={{ position: 'relative' }}>
      {/* Top Profile & Utility Row */}
      <div className="bk-user-row">
        {/* Merchant Avatar & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="bk-avatar-box"
            onClick={() => setActiveTab('settings')}
            title={isBn ? 'মার্চেন্ট প্রোফাইল' : 'Merchant Profile'}
          >
            {isBn ? 'হি' : 'HP'}
            <div className="bk-verified-badge">
              <ShieldCheck size={9} color="#FFFFFF" strokeWidth={3} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px', maxWidth: 175, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isBn ? shopInfo.shopNameBn : shopInfo.shopNameEn}
            </div>
            
            {/* Clickable Branch Switcher Pill */}
            <button
              onClick={() => setShowStoreModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.32)',
                borderRadius: 10,
                padding: '2px 8px',
                marginTop: 3,
                fontSize: 10,
                fontWeight: 700,
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
              title={isBn ? 'দোকান বা ব্রাঞ্চ পরিবর্তন করুন' : 'Switch Store Branch'}
            >
              <Store size={10} color="#FFD700" />
              <span>
                {activeStore ? (isBn ? activeStore.branchBn : activeStore.branchEn) : (isBn ? 'প্রধান শাখা' : 'Main Branch')}
              </span>
              <ChevronDown size={10} />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language Toggle */}
          <button
            className="bk-lang-pill"
            onClick={() => setLanguage(isBn ? 'en' : 'bn')}
            title="Switch Language"
          >
            <Globe size={12} />
            <span>{isBn ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* Quick QR Icon */}
          <button
            className="bk-icon-btn"
            onClick={() => navigateTo('qr-hub')}
            title={isBn ? 'আমার কিউআর কোড' : 'My QR Code'}
          >
            <QrCode size={16} />
          </button>

          {/* Notifications Bell */}
          <button
            className="bk-icon-btn"
            onClick={() => setActiveTab('inbox')}
            title={isBn ? 'ইনবক্স নোটিফিকেশন' : 'Inbox Notifications'}
            style={{ position: 'relative' }}
          >
            <Bell size={16} />
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#FFD700',
                boxShadow: '0 0 6px #FFD700',
              }}
            />
          </button>
        </div>
      </div>

      {/* Signature bKash Tap for Balance (ব্যালেন্স দেখুন) Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <div
          className={`bk-balance-pill-btn lx-touch-btn ${balanceVisible ? 'revealed' : ''}`}
          onClick={toggleBalancePeek}
          title={isBn ? 'ব্যালেন্স দেখতে ট্যাপ করুন' : 'Tap to reveal balance'}
        >
          {/* Pink Coin Icon with ৳ */}
          <div className={`bk-coin-badge ${balanceVisible ? 'flip' : ''}`}>
            ৳
          </div>

          {/* State Text */}
          {!balanceVisible ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="bk-balance-text-hidden">
                {isBn ? 'ব্যালেন্স জানতে ট্যাপ করুন' : 'Tap for Balance'}
              </span>
              <Sparkles size={13} color="var(--bk-pink)" />
            </div>
          ) : (
            <div className="bk-balance-revealed-box">
              <span className="bk-balance-amount">
                ৳ {balances.cashInHand.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="bk-balance-sublabel">
                {isBn ? 'ব্যবহারযোগ্য ক্যাশ ব্যালেন্স' : 'Available Cash Balance'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Translucent Drawer (Quick Stats) */}
      {balanceVisible && (
        <div className="bk-balance-drawer">
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
              {isBn ? 'ব্যাংক একাউন্ট' : 'Bank Balance'}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>
              ৳ {balances.bankBalance.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.25)', borderRight: '1px solid rgba(255, 255, 255, 0.25)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
              {isBn ? 'আজকের মোট বিক্রি' : "Today's Sales"}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#A7F3D0' }}>
              ৳ {balances.todaySales.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
              {isBn ? 'বাকি পাওনা' : 'Due Receivable'}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FECDD3' }}>
              ৳ {balances.totalDueReceivable.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
