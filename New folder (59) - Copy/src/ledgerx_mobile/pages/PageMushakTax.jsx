import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Building,
  Calendar,
  Plus,
  Trash2,
} from 'lucide-react';

export default function PageMushakTax() {
  const { language, shopInfo, products = [] } = useMobileApp();
  const isBn = language === 'bn';

  const [challanNo, setChallanNo] = useState(`M6.3-${Math.floor(10000 + Math.random() * 90000)}`);
  const [buyerName, setBuyerName] = useState('মেসার্স গ্রীন ডিস্ট্রিবিউশন');
  const [buyerBin, setBuyerBin] = useState('001928374-0204');
  const [buyerAddress, setBuyerAddress] = useState('যাত্রাবাড়ী আড়ৎ, ঢাকা');
  const [vehicleNo, setVehicleNo] = useState('ঢাকা মেট্রো-ট ১১-৯৮৭২');
  const [vatRate, setVatRate] = useState(5); // 5%, 7.5%, 15%

  const [items, setItems] = useState([
    { id: 1, desc: 'মিনিকেট চাল ৫০ কেজি বস্তা', qty: 10, unitPrice: 3800 },
    { id: 2, desc: 'তীর সয়াবিন তেল ৫ লিটার কার্টন', qty: 5, unitPrice: 4200 },
  ]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemDesc.trim() || Number(newItemPrice) <= 0) return;
    const added = {
      id: Date.now(),
      desc: newItemDesc.trim(),
      qty: Number(newItemQty) || 1,
      unitPrice: Number(newItemPrice) || 0,
    };
    setItems(prev => [...prev, added]);
    setNewItemDesc('');
    setNewItemQty('1');
    setNewItemPrice('');
  };

  const handleRemoveItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSelectProduct = (e) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const matched = products.find(p => p.id === prodId);
    if (matched) {
      setNewItemDesc(matched.nameBn || matched.nameEn || matched.name);
      setNewItemPrice(String(matched.price || 0));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vatAmount = Math.round((subtotal * vatRate) / 100);
  const grandTotal = subtotal + vatAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 80 }}>
      {/* bKash Crimson Header */}
      <SubpageHeader
        titleBn="এনবিআর মূসক ৬.৩ কর চালান"
        titleEn="NBR Form Mushak 6.3 Tax Invoice"
        subtitleBn="সরকারি বিধি মোতাবেক ভ্যাট ট্যাক্স ইনভয়েস"
        subtitleEn="Official VAT Compliant Tax Slip"
        rightAction={
          <button
            onClick={handlePrint}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <Printer size={13} />
            <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
          </button>
        }
      />

      <div style={{ padding: '16px' }}>
        {/* NBR Header Sheet */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #D1D5DB',
            padding: '20px 16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            marginBottom: 16,
          }}
        >
          {/* Government Bangladesh Seal */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563' }}>
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জাতীয় রাজস্ব বোর্ড (NBR)
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#111827', margin: '3px 0' }}>
              কর চালানপত্র (মূসক-৬.৩)
            </div>
            <div style={{ fontSize: 10, color: '#6B7280' }}>
              [বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও দফা (চ) দ্রষ্টব্য]
            </div>
          </div>

          {/* Supplier Info */}
          <div style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: 12, marginBottom: 12, fontSize: 11.5 }}>
            <div style={{ fontWeight: 800, color: '#111827' }}>{shopInfo.shopNameBn}</div>
            <div style={{ color: '#4B5563' }}>ঠিকানা: {shopInfo.address}</div>
            <div style={{ color: 'var(--bk-pink)', fontWeight: 700 }}>করদাতা সনাক্তকরণ সংখ্যা (BIN): {shopInfo.binNumber}</div>
          </div>

          {/* Challan Details Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 12, fontSize: 11.5 }}>
            <div>
              <span style={{ color: '#6B7280', fontSize: 10.5, fontWeight: 600 }}>চালান নম্বর</span>
              <input
                type="text"
                value={challanNo}
                onChange={e => setChallanNo(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 11 }}
              />
            </div>
            <div>
              <span style={{ color: '#6B7280', fontSize: 10.5, fontWeight: 600 }}>ইস্যুর তারিখ ও সময়</span>
              <div style={{ padding: '6px 8px', background: '#F3F4F6', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                {new Date().toLocaleDateString('bn-BD')}
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#111827', marginBottom: 6 }}>ক্রেতার বিবরণ:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                type="text"
                placeholder="ক্রেতার নাম / প্রতিষ্ঠানের নাম"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 11.5 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                <input
                  type="text"
                  placeholder="ক্রেতার BIN / TIN"
                  value={buyerBin}
                  onChange={e => setBuyerBin(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 11 }}
                />
                <input
                  type="text"
                  placeholder="যানবাহনের নম্বর"
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 11 }}
                />
              </div>
            </div>
          </div>

          {/* VAT Slabs Selection */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>ভ্যাট রেট নির্বাচন:</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              {[
                { rate: 5, label: '৫% (মুদি ও ট্রেডিং)' },
                { rate: 7.5, label: '৭.৫% (প্যাকেটজাত খাদ্য)' },
                { rate: 15, label: '১৫% (আদর্শ হার)' },
              ].map(v => (
                <button
                  key={v.rate}
                  onClick={() => setVatRate(v.rate)}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    borderRadius: 8,
                    border: vatRate === v.rate ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                    background: vatRate === v.rate ? '#FFF0F6' : '#FFFFFF',
                    color: vatRate === v.rate ? 'var(--bk-pink)' : '#374151',
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add Item to Mushak Invoice Form */}
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>
                {isBn ? '+ চালানে নতুন পণ্য অন্তর্ভুক্ত করুন' : '+ Add Item to Invoice'}
              </span>
              {products.length > 0 && (
                <select
                  onChange={handleSelectProduct}
                  defaultValue=""
                  style={{ fontSize: 10.5, padding: '2px 6px', borderRadius: 6, border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#4B5563', outline: 'none' }}
                >
                  <option value="">{isBn ? 'স্টক থেকে নির্বাচন...' : 'Select from Stock...'}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nameBn || p.name} (৳{p.price})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={isBn ? 'পণ্যের নাম ও বিবরণ...' : 'Item description...'}
                value={newItemDesc}
                onChange={e => setNewItemDesc(e.target.value)}
                style={{ flex: 2, minWidth: 120, padding: '6px 8px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 11 }}
              />
              <input
                type="number"
                placeholder={isBn ? 'পরিমাণ' : 'Qty'}
                value={newItemQty}
                onChange={e => setNewItemQty(e.target.value)}
                style={{ width: 55, padding: '6px 8px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 11, textAlign: 'center' }}
              />
              <input
                type="number"
                placeholder={isBn ? 'দর (৳)' : 'Rate'}
                value={newItemPrice}
                onChange={e => setNewItemPrice(e.target.value)}
                style={{ width: 75, padding: '6px 8px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 11, textAlign: 'right' }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Plus size={12} />
                <span>{isBn ? 'যোগ' : 'Add'}</span>
              </button>
            </form>
          </div>

          {/* Line Items Table */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#F3F4F6', textAlign: 'left', color: '#4B5563' }}>
                  <th style={{ padding: '8px' }}>{isBn ? 'পণ্য বিবরণ' : 'Description'}</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>{isBn ? 'পরিমাণ' : 'Qty'}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{isBn ? 'দর (৳)' : 'Rate'}</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>{isBn ? 'মূল্য (৳)' : 'Total'}</th>
                  <th style={{ padding: '8px 4px', width: 28 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{item.desc}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{item.unitPrice.toLocaleString('bn-BD')}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
                      {(item.qty * item.unitPrice).toLocaleString('bn-BD')}
                    </td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 2 }}
                        title={isBn ? 'মুছে ফেলুন' : 'Remove'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, padding: '8px 4px', borderTop: '1px dashed #D1D5DB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>মোট পণ্যমূল্য:</span>
              <span style={{ fontWeight: 700 }}>৳ {subtotal.toLocaleString('bn-BD')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>মূল্য সংযোজন কর ({vatRate}% ভ্যাট):</span>
              <span style={{ fontWeight: 700, color: 'var(--bk-pink)' }}>+ ৳ {vatAmount.toLocaleString('bn-BD')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 900, color: '#111827', paddingTop: 6, borderTop: '1px solid #E5E7EB' }}>
              <span>সর্বমোট চালান মূল্য:</span>
              <span style={{ color: 'var(--bk-pink)' }}>৳ {grandTotal.toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handlePrint}
          style={{
            width: '100%',
            background: 'var(--bk-pink)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '13px',
            fontSize: 13.5,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(226, 19, 110, 0.3)',
          }}
        >
          <Printer size={16} />
          <span>{isBn ? 'চালান প্রিন্ট ও সংরক্ষণ করুন' : 'Print & Save Tax Challan'}</span>
        </button>
      </div>
    </div>
  );
}
