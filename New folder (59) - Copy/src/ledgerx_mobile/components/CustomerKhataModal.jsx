import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  X,
  Users,
  Search,
  UserPlus,
  MessageCircle,
  ArrowDownLeft,
  Phone,
  ChevronRight,
} from 'lucide-react';

export default function CustomerKhataModal() {
  const {
    language,
    customers,
    setCustomers,
    setSelectedCustomer,
    setActiveModal,
    sendWhatsAppReminder,
  } = useMobileApp();

  const isBn = language === 'bn';
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    nameBn: '',
    phone: '',
    address: '',
    openingDue: '',
  });

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.nameBn || '').toLowerCase().includes(q) ||
      (c.nameEn || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  });

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.nameBn.trim() || !newCustomer.phone.trim()) return;

    const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created = {
      id: `cust-${Date.now()}`,
      nameBn: newCustomer.nameBn,
      nameEn: newCustomer.nameBn,
      phone: newCustomer.phone,
      avatarColor: randomColor,
      dueAmount: Number(newCustomer.openingDue || 0),
      address: newCustomer.address || 'ঢাকা',
      lastActive: 'এখনই যুক্ত',
    };

    setCustomers(prev => [created, ...prev]);
    setNewCustomer({ nameBn: '', phone: '', address: '', openingDue: '' });
    setShowAddForm(false);
  };

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" style={{ maxHeight: '92%' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1E60D5',
              }}
            >
              <Users size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
                {isBn ? 'কাস্টমার খাতা ও বাকি ডিরেক্টরি' : 'Customer Ledger'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {customers.length} {isBn ? 'জন নিবন্ধিত গ্রাহক' : 'registered customers'}
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

        {/* Search & Add Row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: '#F9FAFB',
              border: '1px solid #D1D5DB',
              borderRadius: 12,
              padding: '0 12px',
            }}
          >
            <Search size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
            <input
              type="text"
              placeholder={isBn ? 'নাম বা মোবাইল নম্বর খুঁজুন...' : 'Search customer by name or phone...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: 12.5,
                color: '#111827',
                padding: '9px 0',
                outline: 'none',
              }}
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: showAddForm ? '#F3F4F6' : 'var(--bk-pink)',
              color: showAddForm ? '#374151' : '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '0 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <UserPlus size={15} />
            <span>{showAddForm ? (isBn ? 'বন্ধ' : 'Close') : (isBn ? 'নতুন' : 'Add')}</span>
          </button>
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateCustomer}
            style={{
              background: '#FFF0F6',
              border: '1.5px solid #FCE7F3',
              borderRadius: 14,
              padding: '14px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--bk-pink)', marginBottom: 10 }}>
              {isBn ? 'নতুন কাস্টমার নিবন্ধন করুন' : 'Register New Customer'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder={isBn ? 'গ্রাহকের পুরো নাম' : 'Full Name'}
                value={newCustomer.nameBn}
                onChange={e => setNewCustomer({ ...newCustomer, nameBn: e.target.value })}
                required
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <input
                type="text"
                placeholder={isBn ? 'মোবাইল নম্বর (০১৭...)' : 'Phone Number'}
                value={newCustomer.phone}
                onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                required
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder={isBn ? 'ঠিকানা (যেমন: চকবাজার)' : 'Address'}
                value={newCustomer.address}
                onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <input
                type="number"
                placeholder={isBn ? 'পূর্বের বাকি (৳)' : 'Opening Due'}
                value={newCustomer.openingDue}
                onChange={e => setNewCustomer({ ...newCustomer, openingDue: e.target.value })}
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1px solid #D1D5DB',
                  background: '#FFFFFF',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '9px',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'কাস্টমার সংরক্ষণ করুন' : 'Save Customer'}
            </button>
          </form>
        )}

        {/* Customers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(c => {
            const hasDue = c.dueAmount > 0;
            return (
              <div
                key={c.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 14,
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Avatar & Info */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}
                  onClick={() => {
                    setSelectedCustomer(c);
                    setActiveModal('customerAction');
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: c.avatarColor || '#3B82F6',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    {(c.nameBn || c.nameEn).charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                      {isBn ? c.nameBn : c.nameEn}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Phone size={10} />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Due & Quick Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 600 }}>
                      {isBn ? 'বাকি' : 'DUE'}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: hasDue ? '#E11D48' : '#059669',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      ৳ {c.dueAmount.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                  </div>

                  {hasDue && (
                    <button
                      onClick={() => sendWhatsAppReminder(c)}
                      title="Send WhatsApp Reminder"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#DCFCE7',
                        border: 'none',
                        color: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <MessageCircle size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedCustomer(c);
                      setActiveModal('customerAction');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
