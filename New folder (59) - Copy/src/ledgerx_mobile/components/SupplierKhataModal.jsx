import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, Truck, Plus, Phone, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function SupplierKhataModal() {
  const { language, suppliers, setSuppliers, balances, setBalances, setActiveModal, showToast } = useMobileApp();
  const isBn = language === 'bn';

  const [payingSupplier, setPayingSupplier] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ nameBn: '', phone: '', category: '', payable: '' });

  const handlePay = (e) => {
    e.preventDefault();
    const num = Number(payAmount || 0);
    if (!payingSupplier || num <= 0) return;

    setSuppliers(prev =>
      prev.map(s => s.id === payingSupplier.id ? { ...s, payable: Math.max(0, s.payable - num) } : s)
    );

    setBalances(prev => ({
      ...prev,
      cashInHand: Math.max(0, prev.cashInHand - num),
      totalPayable: Math.max(0, prev.totalPayable - num),
    }));

    setPayingSupplier(null);
    setPayAmount('');
    showToast?.(isBn ? `মহাজন ${payingSupplier.nameBn}-কে ৳ ${num} পরিশোধ সম্পন্ন হয়েছে!` : `Paid BDT ${num} to supplier!`, 'success');
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.nameBn.trim()) return;

    setSuppliers(prev => [
      {
        id: `sup-${Date.now()}`,
        nameBn: newSupplier.nameBn,
        nameEn: newSupplier.nameBn,
        phone: newSupplier.phone || '01700000000',
        payable: Number(newSupplier.payable || 0),
        category: newSupplier.category || 'জেনারেল সাপ্লাই',
      },
      ...prev,
    ]);

    setNewSupplier({ nameBn: '', phone: '', category: '', payable: '' });
    setShowAddForm(false);
  };

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" style={{ maxHeight: '92%' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A78BFA',
              }}
            >
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--lx-text-primary)' }}>
                {isBn ? 'মহাজন ও সাপ্লায়ার খাতা' : 'Supplier Ledger'}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--lx-text-muted)' }}>
                {isBn ? 'কোম্পানি চালান ও পাওনাদারের হিসাব' : 'Wholesaler payables & supply bills'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--lx-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Total Payable Summary Card */}
        <div
          style={{
            background: 'var(--lx-card)',
            border: '1px solid var(--lx-border)',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--lx-text-muted)' }}>{isBn ? 'মোট মহাজন দেনা' : 'Total Supplier Due'}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#A78BFA', fontFamily: 'Outfit, sans-serif' }}>
              ৳ {balances.totalPayable.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid #A78BFA',
              color: '#A78BFA',
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + {isBn ? 'নতুন মহাজন' : 'Add Supplier'}
          </button>
        </div>

        {/* Add Supplier Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSupplier}
            style={{
              background: 'var(--lx-card)',
              border: '1px solid var(--lx-border)',
              borderRadius: 14,
              padding: '12px',
              marginBottom: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder={isBn ? 'মহাজন / কোম্পানির নাম *' : 'Supplier Name *'}
              value={newSupplier.nameBn}
              onChange={e => setNewSupplier({ ...newSupplier, nameBn: e.target.value })}
              required
              style={{ padding: '8px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 12 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <input
                type="text"
                placeholder={isBn ? 'মোবাইল নম্বর' : 'Phone'}
                value={newSupplier.phone}
                onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                style={{ padding: '8px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 12 }}
              />
              <input
                type="number"
                placeholder={isBn ? 'বকেয়া দেনা (৳)' : 'Payable (BDT)'}
                value={newSupplier.payable}
                onChange={e => setNewSupplier({ ...newSupplier, payable: e.target.value })}
                style={{ padding: '8px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 12 }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '8px',
                borderRadius: 8,
                background: '#A78BFA',
                border: 'none',
                color: '#050811',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'মহাজন সেভ করুন' : 'Save Supplier'}
            </button>
          </form>
        )}

        {/* Pay Supplier Prompt Modal */}
        {payingSupplier && (
          <div
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #A78BFA',
              borderRadius: 14,
              padding: '14px',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {isBn ? 'পরিশোধ করুন:' : 'Pay Supplier:'} {payingSupplier.nameBn}
            </div>
            <div style={{ fontSize: 11, color: 'var(--lx-text-muted)', marginBottom: 8 }}>
              {isBn ? 'বর্তমান দেনা:' : 'Due:'} ৳ {payingSupplier.payable}
            </div>
            <form onSubmit={handlePay} style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                placeholder="0.00"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                autoFocus
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: 'var(--lx-bg)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 14, fontWeight: 700 }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: '#A78BFA',
                  border: 'none',
                  color: '#050811',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'পরিশোধ' : 'Pay'}
              </button>
              <button
                type="button"
                onClick={() => setPayingSupplier(null)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'var(--lx-card)',
                  border: '1px solid var(--lx-border)',
                  color: 'var(--lx-text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
            </form>
          </div>
        )}

        {/* Suppliers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {suppliers.map(sup => (
            <div
              key={sup.id}
              style={{
                background: 'var(--lx-card)',
                border: '1px solid var(--lx-border)',
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--lx-text-primary)' }}>
                  {isBn ? sup.nameBn : sup.nameEn}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--lx-text-muted)' }}>
                  {sup.phone} • {sup.category}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#A78BFA', fontFamily: 'Outfit, sans-serif' }}>
                  ৳ {sup.payable.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </div>
                <button
                  onClick={() => {
                    setPayingSupplier(sup);
                    setPayAmount(sup.payable);
                  }}
                  style={{
                    marginTop: 4,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid #A78BFA',
                    color: '#A78BFA',
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'টাকা দিন' : 'Pay'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
