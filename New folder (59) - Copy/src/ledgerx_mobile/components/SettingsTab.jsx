import React, { useState, useRef } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  Store,
  User,
  Phone,
  MapPin,
  FileText,
  Shield,
  Volume2,
  Moon,
  Sun,
  Globe,
  Download,
  UploadCloud,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function SettingsTab() {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    shopInfo,
    setShopInfo,
    balances,
    setBalances,
    customers,
    setCustomers,
    suppliers,
    setSuppliers,
    products,
    setProducts,
    transactions,
    setTransactions,
    activeTenantId,
    availableTenants = [],
    switchTenant,
    soundboxEnabled,
    setSoundboxEnabled,
    showToast,
    resetToFactoryDefaults,
  } = useMobileApp();

  const isBn = language === 'bn';
  const isDark = theme === 'dark';
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...shopInfo });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setShopInfo(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const exportBackup = () => {
    const data = {
      shopInfo,
      balances,
      customers,
      suppliers,
      products,
      transactions,
      exportedAt: new Date().toISOString(),
      app: 'Hisab Pati (হিসাব পাতি)',
      version: '3.0.0-PROD',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerx_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast(isBn ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে' : 'Backup downloaded successfully', 'success');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.shopInfo && setShopInfo) setShopInfo(imported.shopInfo);
        if (imported.balances && setBalances) setBalances(imported.balances);
        if (imported.customers && setCustomers) setCustomers(imported.customers);
        if (imported.suppliers && setSuppliers) setSuppliers(imported.suppliers);
        if (imported.products && setProducts) setProducts(imported.products);
        if (imported.transactions && setTransactions) setTransactions(imported.transactions);

        const tid = activeTenantId || 'tenant_main';
        if (imported.shopInfo) localStorage.setItem(`ledgerx_${tid}_shopInfo`, JSON.stringify(imported.shopInfo));
        if (imported.balances) localStorage.setItem(`ledgerx_${tid}_balances`, JSON.stringify(imported.balances));
        if (imported.customers) localStorage.setItem(`ledgerx_${tid}_customers`, JSON.stringify(imported.customers));
        if (imported.suppliers) localStorage.setItem(`ledgerx_${tid}_suppliers`, JSON.stringify(imported.suppliers));
        if (imported.products) localStorage.setItem(`ledgerx_${tid}_products`, JSON.stringify(imported.products));
        if (imported.transactions) localStorage.setItem(`ledgerx_${tid}_transactions`, JSON.stringify(imported.transactions));

        if (showToast) showToast(isBn ? 'ব্যাকআপ ডাটা সফলভাবে রিস্টোর হয়েছে!' : 'Backup restored successfully!', 'success');
      } catch (err) {
        console.error(err);
        if (showToast) showToast(isBn ? 'ভুল বা নষ্ট ব্যাকআপ ফাইল' : 'Corrupted or invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ padding: '16px 14px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>
          {isBn ? 'আমার একাউন্ট ও সেটিংস' : 'My Account & Settings'}
        </div>
        <div style={{ fontSize: 11, color: '#6B7280' }}>
          {isBn ? 'মার্চেন্ট প্রোফাইল, সাউন্ডবক্স ও ভাষা সেটিংস' : 'Manage profile, soundbox and preferences'}
        </div>
      </div>

      {/* Shop Profile Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 18,
          border: '1px solid #E5E7EB',
          padding: '16px',
          marginBottom: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--bk-pink-h-gradient)',
                color: '#fff',
                fontWeight: 900,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(226, 19, 110, 0.3)',
                position: 'relative',
              }}
            >
              {isBn ? 'আ' : 'LX'}
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: '#00D09C',
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  border: '2px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={10} color="#FFFFFF" strokeWidth={3} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                {isBn ? shopInfo.shopNameBn : shopInfo.shopNameEn}
              </div>
              <div style={{ fontSize: 11, color: 'var(--bk-pink)', fontWeight: 600 }}>
                {isBn ? 'ভেরিফাইড মার্চেন্ট আইডি:' : 'Merchant ID:'} {shopInfo.outletId}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: '#F3F4F6',
              border: '1px solid #D1D5DB',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--bk-pink)',
              cursor: 'pointer',
            }}
          >
            {isEditing ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'এডিট' : 'Edit')}
          </button>
        </div>

        {/* Profile Info or Edit Form */}
        {!isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#4B5563', paddingTop: 8, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} color="#9CA3AF" />
              <span>{isBn ? 'মালিক:' : 'Proprietor:'} {isBn ? shopInfo.ownerNameBn : shopInfo.ownerNameEn}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={14} color="#9CA3AF" />
              <span>{shopInfo.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color="#9CA3AF" />
              <span>{shopInfo.address}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} color="#9CA3AF" />
              <span>{isBn ? 'মূসক/BIN:' : 'VAT BIN:'} {shopInfo.binNumber}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280' }}>প্রতিষ্ঠানের নাম (বাংলা)</label>
              <input
                type="text"
                value={formData.shopNameBn}
                onChange={e => setFormData({ ...formData, shopNameBn: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280' }}>মোবাইল নম্বর</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12 }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '9px',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              {isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>

      {/* Store / Branch Selector Card */}
      <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid #E5E7EB', padding: '14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Store size={18} color="var(--bk-pink)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                {isBn ? 'দোকান / শাখা পরিবর্তন' : 'Change Store Branch'}
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                {isBn ? 'মাল্টি-স্টোর ইআরপি সিঙ্ক' : 'Multi-Store Tenant Sync'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 8 }}>
            {activeTenantId}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {availableTenants.map(store => {
            const isSelected = store.id === activeTenantId;
            return (
              <div
                key={store.id}
                onClick={() => switchTenant(store.id)}
                style={{
                  background: isSelected ? '#FFF0F6' : '#F9FAFB',
                  border: '1.5px solid',
                  borderColor: isSelected ? 'var(--bk-pink)' : '#E5E7EB',
                  borderRadius: 12,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: isSelected ? 'var(--bk-pink)' : '#111827' }}>
                    {isBn ? store.nameBn : store.nameEn}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 1 }}>
                    {isBn ? store.branchBn : store.branchEn}
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--bk-pink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Preferences */}
      <div style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid #E5E7EB', padding: '6px 14px', marginBottom: 14 }}>
        {/* Language Switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} color="var(--bk-pink)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                {isBn ? 'অ্যাপের ভাষা' : 'App Language'}
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                {isBn ? 'বাংলা অথবা ইংরেজি' : 'Bangla or English UI'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setLanguage(isBn ? 'en' : 'bn')}
            style={{
              background: '#F3F4F6',
              border: '1px solid #D1D5DB',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--bk-pink)',
              cursor: 'pointer',
            }}
          >
            {isBn ? 'বাংলা (Active)' : 'English (Active)'}
          </button>
        </div>

        {/* Theme Switch */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDark ? <Moon size={18} color="var(--bk-pink)" /> : <Sun size={18} color="var(--bk-pink)" />}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                {isBn ? 'থিম মোড' : 'Theme Mode'}
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                {isDark ? (isBn ? 'ডার্ক মোড' : 'Dark Mode') : (isBn ? 'লাইট মোড (bKash Style)' : 'Light Mode (bKash Style)')}
              </div>
            </div>
          </div>
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{
              background: '#F3F4F6',
              border: '1px solid #D1D5DB',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            {isDark ? (isBn ? 'লাইট করুন' : 'Light') : (isBn ? 'ডার্ক করুন' : 'Dark')}
          </button>
        </div>

        {/* Soundbox Voice */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={18} color="var(--bk-pink)" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                {isBn ? 'অডিও সাউন্ডবক্স' : 'Soundbox Voice'}
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                {soundboxEnabled ? (isBn ? 'ভয়েস ঘোষণা চালু' : 'Voice enabled') : (isBn ? 'বন্ধ' : 'Muted')}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSoundboxEnabled(!soundboxEnabled)}
            style={{
              background: soundboxEnabled ? '#ECFDF5' : '#F3F4F6',
              border: soundboxEnabled ? '1px solid #A7F3D0' : '1px solid #D1D5DB',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: soundboxEnabled ? '#059669' : '#6B7280',
              cursor: 'pointer',
            }}
          >
            {soundboxEnabled ? (isBn ? 'চালু' : 'ON') : (isBn ? 'বন্ধ' : 'OFF')}
          </button>
        </div>
      </div>

      {/* Backup & Factory Reset */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportBackup}
        accept=".json"
        style={{ display: 'none' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 16 }}>
        <button
          onClick={exportBackup}
          style={{
            background: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: 12,
            padding: '11px 8px',
            fontSize: 11.5,
            fontWeight: 700,
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            cursor: 'pointer',
          }}
        >
          <Download size={14} color="var(--bk-pink)" />
          <span>{isBn ? 'ব্যাকআপ নিন' : 'Backup JSON'}</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: 12,
            padding: '11px 8px',
            fontSize: 11.5,
            fontWeight: 700,
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            cursor: 'pointer',
          }}
        >
          <UploadCloud size={14} color="#059669" />
          <span>{isBn ? 'রিস্টোর করুন' : 'Restore JSON'}</span>
        </button>

        <button
          onClick={resetToFactoryDefaults}
          style={{
            background: '#FFF1F2',
            border: '1px solid #FECDD3',
            borderRadius: 12,
            padding: '11px 12px',
            fontSize: 11.5,
            fontWeight: 700,
            color: '#E11D48',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} />
          <span>{isBn ? 'রিসেট' : 'Reset'}</span>
        </button>
      </div>

      {/* Security Footer */}
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#9CA3AF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
          <Shield size={12} color="var(--bk-pink)" />
          <span style={{ fontWeight: 700, color: '#4B5563' }}>Hisab Pati (হিসাব পাতি) v3.0 Pro</span>
        </div>
        <div>256-Bit SSL Encrypted • Zero Trademark Overlap</div>
      </div>
    </div>
  );
}
