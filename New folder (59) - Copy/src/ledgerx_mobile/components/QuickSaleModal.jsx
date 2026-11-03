import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, Plus, Minus, ShoppingBag, User, DollarSign, Sparkles } from 'lucide-react';
import HoldToConfirm from './HoldToConfirm';

export default function QuickSaleModal() {
  const {
    language,
    products,
    customers,
    recordSale,
    setActiveModal,
  } = useMobileApp();

  const isBn = language === 'bn';

  const [cart, setCart] = useState({}); // { prodId: qty }
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ');
  const [note, setNote] = useState('');

  // Cart helpers
  const addItem = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeItem = (id) => {
    setCart(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  // Calculations
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const prod = products.find(p => p.id === id);
    return prod ? { ...prod, qty } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = Math.max(0, subtotal - Number(discount || 0));
  const paid = paidAmount === '' ? total : Number(paidAmount);
  const due = Math.max(0, total - paid);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleFinalize = () => {
    if (total <= 0) return;

    recordSale({
      customerId: selectedCustomerId || null,
      customerName: selectedCustomer ? (isBn ? selectedCustomer.nameBn : selectedCustomer.nameEn) : (isBn ? 'সাধারণ খুচরা ক্রেতা' : 'General Walk-in Customer'),
      items: cartItems,
      totalAmount: total,
      paidAmount: paid,
      dueAmount: due,
      paymentMethod,
      note,
    });

    setActiveModal('receipt');
  };

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#FFF0F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--bk-pink)',
              }}
            >
              <ShoppingBag size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
                {isBn ? 'দ্রুত বিক্রয় ও পিওএস ক্যাশআউট' : 'Quick POS Sale'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {isBn ? 'পণ্য নির্বাচন ও বিক্রয় রশিদ নিশ্চিতকরণ' : 'Select items and confirm invoice'}
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

        {/* Customer Picker */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            {isBn ? 'ক্রেতা / কাস্টমার নির্বাচন করুন' : 'Select Customer (Optional)'}
          </label>
          <select
            value={selectedCustomerId}
            onChange={e => setSelectedCustomerId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #D1D5DB',
              background: '#FFFFFF',
              color: '#111827',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
            }}
          >
            <option value="">{isBn ? 'সাধারণ নগদ ক্রেতা (Walk-in)' : 'Walk-in Cash Customer'}</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {isBn ? c.nameBn : c.nameEn} ({c.phone}) - {isBn ? 'বাকি' : 'Due'}: ৳{c.dueAmount}
              </option>
            ))}
          </select>
        </div>

        {/* Product Catalog Grid */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
              {isBn ? 'জনপ্রিয় পণ্য নির্বাচন করুন' : 'Select Fast-Selling Items'}
            </span>
            <span style={{ fontSize: 11, color: 'var(--bk-pink)', fontWeight: 600 }}>
              {cartItems.length} {isBn ? 'আইটেম যোগ হয়েছে' : 'items selected'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {products.map(p => {
              const qty = cart[p.id] || 0;
              return (
                <div
                  key={p.id}
                  style={{
                    background: qty > 0 ? '#FFF0F6' : '#F9FAFB',
                    border: qty > 0 ? '1.5px solid var(--bk-pink)' : '1px solid #E5E7EB',
                    borderRadius: 14,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isBn ? p.nameBn : p.nameEn}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--bk-pink)', marginTop: 2 }}>
                      ৳ {p.price} <span style={{ fontSize: 9.5, color: '#6B7280', fontWeight: 500 }}>/{p.unit}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {qty > 0 && (
                      <button
                        onClick={() => removeItem(p.id)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          background: '#FFFFFF',
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#E11D48',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                    )}
                    {qty > 0 && (
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--bk-pink)', minWidth: 16, textAlign: 'center' }}>
                        {qty}
                      </span>
                    )}
                    <button
                      onClick={() => addItem(p.id)}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: 'var(--bk-pink)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={13} strokeWidth={2.8} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div
          style={{
            background: '#F9FAFB',
            borderRadius: 16,
            padding: '14px 16px',
            border: '1px solid #E5E7EB',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#4B5563' }}>
            <span>{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>৳ {subtotal.toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#4B5563' }}>{isBn ? 'বিশেষ ডিসকাউন্ট (ছাড়)' : 'Discount'}</span>
            <input
              type="number"
              placeholder="0"
              value={discount || ''}
              onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
              style={{
                width: 75,
                padding: '4px 8px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                fontSize: 12,
                textAlign: 'right',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed #D1D5DB', fontSize: 15, fontWeight: 800 }}>
            <span style={{ color: '#111827' }}>{isBn ? 'মোট বিল' : 'Net Total'}</span>
            <span style={{ color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif' }}>
              ৳ {total.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
              {isBn ? 'পরিশোধের মাধ্যম' : 'Payment Channel'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['নগদ ক্যাশ', 'বিকাশ কিউআর', 'ব্যাংক কার্ড'].map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    flex: 1,
                    padding: '7px 4px',
                    borderRadius: 10,
                    border: paymentMethod === m ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                    background: paymentMethod === m ? '#FFF0F6' : '#FFFFFF',
                    color: paymentMethod === m ? 'var(--bk-pink)' : '#4B5563',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hold to Confirm Button */}
        <HoldToConfirm
          disabled={total <= 0}
          onConfirm={handleFinalize}
          labelBn="বিক্রয় নিশ্চিত করতে ধরে রাখুন"
          labelEn="Hold to Confirm Sale"
        />
      </div>
    </div>
  );
}
