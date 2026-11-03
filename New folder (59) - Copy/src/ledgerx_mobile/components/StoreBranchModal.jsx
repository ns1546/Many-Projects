import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { Store, X, Check, Plus, MapPin, Phone, Search } from 'lucide-react';

export default function StoreBranchModal({ onClose }) {
  const {
    language,
    activeTenantId,
    availableTenants = [],
    switchTenant,
    addNewTenant,
  } = useMobileApp();

  const isBn = language === 'bn';

  const [search, setSearch] = useState('');
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddr, setNewBranchAddr] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');

  const filteredStores = availableTenants.filter(store => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const nameBn = (store.nameBn || '').toLowerCase();
    const nameEn = (store.nameEn || '').toLowerCase();
    const branchBn = (store.branchBn || '').toLowerCase();
    const branchEn = (store.branchEn || '').toLowerCase();
    const phone = store.phone || '';
    return nameBn.includes(q) || nameEn.includes(q) || branchBn.includes(q) || branchEn.includes(q) || phone.includes(q);
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    if (addNewTenant) {
      addNewTenant({
        nameBn: newBranchName.trim(),
        nameEn: newBranchName.trim(),
        branchBn: newBranchName.trim(),
        branchEn: newBranchName.trim(),
        address: newBranchAddr.trim() || 'ঢাকা, বাংলাদেশ',
        phone: newBranchPhone.trim() || '01700000000',
        badge: isBn ? 'নতুন শাখা' : 'New Branch',
      });
    }

    setNewBranchName('');
    setNewBranchAddr('');
    setNewBranchPhone('');
    setShowAddBranch(false);
    if (onClose) onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        borderRadius: 'inherit',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '20px 18px 28px',
          maxHeight: '82%',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Drag Pill */}
        <div style={{ width: 44, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 16px' }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#111827', letterSpacing: '-0.2px' }}>
              {isBn ? 'দোকান / শাখা পরিবর্তন করুন' : 'Select Branch / Store'}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              {isBn ? 'পিসি ইআরপি ও মোবাইল ক্লাউড সিঙ্কড' : 'Synced with PC Enterprise ERP'}
            </div>
          </div>
          <button
            onClick={onClose}
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
            <X size={16} />
          </button>
        </div>

        {/* Search Bar for Stores */}
        {availableTenants.length > 2 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              padding: '0 10px',
              marginBottom: 12,
            }}
          >
            <Search size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
            <input
              type="text"
              placeholder={isBn ? 'দোকান বা ব্রাঞ্চের নাম দিয়ে খুঁজুন...' : 'Search store or branch...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '8px 0',
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* Available Stores List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredStores.map(store => {
            const isSelected = store.id === activeTenantId;
            return (
              <div
                key={store.id}
                onClick={() => {
                  switchTenant(store.id);
                  if (onClose) onClose();
                }}
                style={{
                  background: isSelected ? '#FFF0F6' : '#F9FAFB',
                  border: '1.5px solid',
                  borderColor: isSelected ? 'var(--bk-pink)' : '#E5E7EB',
                  borderRadius: 16,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(226, 19, 110, 0.12)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: isSelected ? 'var(--bk-pink)' : '#111827' }}>
                      {isBn ? store.nameBn : store.nameEn}
                    </span>
                    <span
                      style={{
                        fontSize: 9.5,
                        background: isSelected ? 'var(--bk-pink)' : '#E5E7EB',
                        color: isSelected ? '#FFFFFF' : '#4B5563',
                        padding: '1px 6px',
                        borderRadius: 6,
                        fontWeight: 700,
                      }}
                    >
                      {store.badge || (isBn ? 'শাখা' : 'Branch')}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Store size={10} color="#9CA3AF" />
                    <span>{isBn ? store.branchBn : store.branchEn}</span>
                    {store.phone && (
                      <>
                        <span>•</span>
                        <Phone size={10} color="#9CA3AF" />
                        <span>{store.phone}</span>
                      </>
                    )}
                  </div>
                  {store.address && (
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={9} color="#9CA3AF" />
                      <span>{store.address}</span>
                    </div>
                  )}
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--bk-pink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Branch Creation Toggle */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
          {!showAddBranch ? (
            <button
              type="button"
              onClick={() => setShowAddBranch(true)}
              className="lx-touch-btn"
              style={{
                width: '100%',
                background: '#F9FAFB',
                border: '1.5px dashed #D1D5DB',
                borderRadius: 14,
                padding: '11px',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--bk-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              <span>{isBn ? 'নতুন শাখা বা দোকান যুক্ত করুন' : 'Add Custom Store / Branch'}</span>
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#111827' }}>
                {isBn ? 'নতুন দোকান বা ব্রাঞ্চের তথ্য' : 'New Branch Details'}
              </div>
              <input
                type="text"
                placeholder={isBn ? 'দোকান বা ব্রাঞ্চের নাম (যেমন: মিরপুর শাখা) *' : 'Branch name *'}
                value={newBranchName}
                onChange={e => setNewBranchName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="text"
                placeholder={isBn ? 'শাখার মোবাইল নম্বর' : 'Branch phone'}
                value={newBranchPhone}
                onChange={e => setNewBranchPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <input
                type="text"
                placeholder={isBn ? 'শাখার ঠিকানা (ঐচ্ছিক)' : 'Address (optional)'}
                value={newBranchAddr}
                onChange={e => setNewBranchAddr(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowAddBranch(false)}
                  style={{
                    flex: 1,
                    background: '#F3F4F6',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#4B5563',
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="lx-touch-btn"
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #E2136E, #C20E5D)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'শাখা তৈরি ও নির্বাচন' : 'Create & Switch'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
