import React, { useState, useEffect } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import {
  Boxes,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

import { haptics } from '../utils/haptics';

export default function PageCrates() {
  const { language, customers, showToast } = useMobileApp();
  const isBn = language === 'bn';

  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLpg, setNewLpg] = useState(0);
  const [newCrates, setNewCrates] = useState(0);
  const [newDeposit, setNewDeposit] = useState('');

  const [assetLedger, setAssetLedger] = useState(() => {
    try {
      const saved = localStorage.getItem('ledgerx_crates_ledger');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 1,
        customerName: 'আলমগীর স্টোর',
        phone: '01711223344',
        lpg12kg: 4,
        beverageCrates: 6,
        depositAmount: 3200,
        lastUpdated: 'আজ সকাল ১০:২০',
      },
      {
        id: 2,
        customerName: 'রহিম হোটেল অ্যান্ড রেস্তোরাঁ',
        phone: '01812345678',
        lpg12kg: 8,
        beverageCrates: 2,
        depositAmount: 6400,
        lastUpdated: 'গতকাল সন্ধ্যা ০৭:০০',
      },
      {
        id: 3,
        customerName: 'সবুজ টি স্টল',
        phone: '01911998877',
        lpg12kg: 2,
        beverageCrates: 4,
        depositAmount: 1800,
        lastUpdated: '২৩ অক্টোবর',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('ledgerx_crates_ledger', JSON.stringify(assetLedger));
    } catch (e) {
      console.error(e);
    }
  }, [assetLedger]);

  const handleReturnAsset = (id, type) => {
    haptics.tap();
    setAssetLedger(prev =>
      prev.map(item => {
        if (item.id === id) {
          if (type === 'lpg' && item.lpg12kg > 0) {
            return { ...item, lpg12kg: item.lpg12kg - 1 };
          }
          if (type === 'crate' && item.beverageCrates > 0) {
            return { ...item, beverageCrates: item.beverageCrates - 1 };
          }
        }
        return item;
      })
    );
    showToast(isBn ? 'ফেরত গ্রহণ সম্পন্ন হয়েছে' : 'Asset return recorded', 'success');
  };

  const handleAddAsset = (id, type) => {
    haptics.add();
    setAssetLedger(prev =>
      prev.map(item => {
        if (item.id === id) {
          if (type === 'lpg') return { ...item, lpg12kg: item.lpg12kg + 1 };
          if (type === 'crate') return { ...item, beverageCrates: item.beverageCrates + 1 };
        }
        return item;
      })
    );
    showToast(isBn ? 'নতুন ক্যারেট/সিলিন্ডার ইস্যু যুক্ত হয়েছে' : 'Asset issued to customer', 'success');
  };

  const handleSaveNewEntry = (e) => {
    if (e) e.preventDefault();
    if (!newCustomerName.trim()) {
      showToast(isBn ? 'দোকান বা গ্রাহকের নাম আবশ্যক' : 'Store/Customer name is required', 'error');
      return;
    }
    const newEntry = {
      id: Date.now(),
      customerName: newCustomerName.trim(),
      phone: newPhone.trim() || 'প্রযোজ্য নয়',
      lpg12kg: parseInt(newLpg, 10) || 0,
      beverageCrates: parseInt(newCrates, 10) || 0,
      depositAmount: parseFloat(newDeposit) || 0,
      lastUpdated: isBn ? 'এইমাত্র' : 'Just now',
    };
    setAssetLedger(prev => [newEntry, ...prev]);
    setShowAddModal(false);
    setNewCustomerName('');
    setNewPhone('');
    setNewLpg(0);
    setNewCrates(0);
    setNewDeposit('');
    haptics.success();
    showToast(isBn ? 'নতুন খাতা সফলভাবে তৈরি হয়েছে' : 'New ledger record created', 'success');
  };

  const filteredLedger = assetLedger.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.customerName && item.customerName.toLowerCase().includes(q)) ||
      (item.phone && item.phone.includes(q))
    );
  });

  const totalLpgOwed = assetLedger.reduce((sum, i) => sum + i.lpg12kg, 0);
  const totalCratesOwed = assetLedger.reduce((sum, i) => sum + i.beverageCrates, 0);

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24 }}>
      {/* bKash Crimson Header */}
      <SubpageHeader
        titleBn="ক্যারেট ও গ্যাস সিলিন্ডার খাতা"
        titleEn="Crates & LPG Cylinder Ledger"
        subtitleBn="ফেরতযোগ্য খালি বোতল ও সিলিন্ডার ট্র্যাকার"
        subtitleEn="Returnable Physical Asset Dues"
      />

      <div style={{ padding: '16px' }}>
        {/* Aggregate Asset Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '14px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>মোট গ্যাস সিলিন্ডার বাকি</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#059669', margin: '4px 0', fontFamily: 'Outfit, sans-serif' }}>
              {totalLpgOwed} টি
            </div>
            <div style={{ fontSize: 10.5, color: '#9CA3AF' }}>১২ কেজি বসুন্ধরা/ওমেরা</div>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: '14px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>মোট বেভারেজ ক্যারেট বাকি</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#1E60D5', margin: '4px 0', fontFamily: 'Outfit, sans-serif' }}>
              {totalCratesOwed} টি
            </div>
            <div style={{ fontSize: 10.5, color: '#9CA3AF' }}>২৪ বোতল প্লাস্টিক ক্যারেট</div>
          </div>
        </div>

        {/* Action Button: Add New Ledger */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #E2136E, #C20E5D)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(226,19,110,0.25)',
            marginBottom: 14,
          }}
        >
          <Plus size={16} />
          {isBn ? '+ নতুন কাস্টমার খাতা যোগ করুন' : '+ Add New Customer Ledger'}
        </button>

        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            border: '1px solid #D1D5DB',
            borderRadius: 14,
            padding: '0 12px',
            marginBottom: 14,
          }}
        >
          <Search size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder={isBn ? 'দোকানের নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search store or phone...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              padding: '10px 0',
              fontSize: 12,
              outline: 'none',
            }}
          />
        </div>

        {/* Asset Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredLedger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6B7280', fontSize: 13 }}>
              {isBn ? 'কোনো ক্যারেট বা সিলিন্ডার খাতা পাওয়া যায়নি' : 'No asset records found'}
            </div>
          ) : (
            filteredLedger.map(item => (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 18,
                border: '1px solid #E5E7EB',
                padding: '14px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827' }}>{item.customerName}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{item.phone} • {item.lastUpdated}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#6B7280' }}>জামানত জমা</div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#111827' }}>৳ {item.depositAmount}</div>
                </div>
              </div>

              {/* Steppers for Gas & Crates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
                {/* Gas Cylinder Stepper */}
                <div style={{ background: '#F0FDF4', padding: '8px 10px', borderRadius: 12, border: '1px solid #DCFCE7' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                    গ্যাস সিলিন্ডার: <span style={{ fontSize: 13, fontWeight: 900 }}>{item.lpg12kg} টি</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => handleReturnAsset(item.id, 'lpg')}
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        border: '1px solid #BBF7D0',
                        borderRadius: 6,
                        padding: '4px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#15803D',
                        cursor: 'pointer',
                      }}
                      title="ফেরত জমা"
                    >
                      - ফেরত
                    </button>
                    <button
                      onClick={() => handleAddAsset(item.id, 'lpg')}
                      style={{
                        flex: 1,
                        background: '#15803D',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                      title="নতুন বকেয়া"
                    >
                      + দেওয়া
                    </button>
                  </div>
                </div>

                {/* Crates Stepper */}
                <div style={{ background: '#EFF6FF', padding: '8px 10px', borderRadius: 12, border: '1px solid #DBEAFE' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1E40AF', marginBottom: 4 }}>
                    বেভারেজ ক্যারেট: <span style={{ fontSize: 13, fontWeight: 900 }}>{item.beverageCrates} টি</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => handleReturnAsset(item.id, 'crate')}
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 6,
                        padding: '4px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#1D4ED8',
                        cursor: 'pointer',
                      }}
                      title="ফেরত জমা"
                    >
                      - ফেরত
                    </button>
                    <button
                      onClick={() => handleAddAsset(item.id, 'crate')}
                      style={{
                        flex: 1,
                        background: '#1D4ED8',
                        border: 'none',
                        borderRadius: 6,
                        padding: '4px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                      title="নতুন বকেয়া"
                    >
                      + দেওয়া
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

        {/* Modal for adding new crate/cylinder ledger */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              backdropFilter: 'blur(3px)',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                width: '100%',
                maxWidth: 380,
                padding: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#111827' }}>
                  {isBn ? 'নতুন ক্যারেট/সিলিন্ডার খাতা' : 'New Asset Ledger Entry'}
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6B7280' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Quick Select Customer */}
              {customers && customers.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                    {isBn ? 'বিদ্যমান কাস্টমার সিলেক্ট করুন (ঐচ্ছিক)' : 'Select Customer (Optional)'}
                  </label>
                  <select
                    onChange={e => {
                      const c = customers.find(x => String(x.id) === e.target.value);
                      if (c) {
                        setNewCustomerName(c.nameBn || c.name || c.nameEn || '');
                        setNewPhone(c.phone || '');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #D1D5DB',
                      fontSize: 12,
                      background: '#F9FAFB',
                      outline: 'none',
                    }}
                  >
                    <option value="">-- {isBn ? 'বাছাই করুন' : 'Select'} --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn || c.name || c.nameEn} ({c.phone || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Store / Customer Name */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                  {isBn ? 'দোকান বা গ্রাহকের নাম *' : 'Store / Customer Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBn ? 'যেমন: করিম স্টোর' : 'e.g. Karim Store'}
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 12.5,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                  {isBn ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 12.5,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* LPG & Crates Initial counts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4 }}>
                    {isBn ? 'সিলিন্ডার বাকি (টি)' : 'LPG Cylinders (Qty)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newLpg}
                    onChange={e => setNewLpg(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #BBF7D0',
                      background: '#F0FDF4',
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#166534',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#1E40AF', marginBottom: 4 }}>
                    {isBn ? 'ক্যারেট বাকি (টি)' : 'Crates (Qty)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCrates}
                    onChange={e => setNewCrates(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: '1px solid #BFDBFE',
                      background: '#EFF6FF',
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#1E40AF',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Deposit Amount */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4B5563', marginBottom: 4 }}>
                  {isBn ? 'জামানত পরিমাণ (৳)' : 'Deposit Amount (৳)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newDeposit}
                  onChange={e => setNewDeposit(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 12,
                    border: '1px solid #D1D5DB',
                    background: '#F3F4F6',
                    color: '#374151',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewEntry}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #E2136E, #C20E5D)',
                    color: '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Record'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
