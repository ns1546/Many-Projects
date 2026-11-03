import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  X,
  Sparkles,
  FileText,
  Boxes,
  Scale,
  CreditCard,
  TrendingUp,
  Share2,
  Printer,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export default function BentoServiceModal() {
  const {
    language,
    shopInfo,
    selectedBentoService,
    balances,
    setActiveModal,
    showToast,
  } = useMobileApp();

  const isBn = language === 'bn';
  const srv = selectedBentoService;

  // ── 1. Halkhata State ──
  const [halkhataDiscount, setHalkhataDiscount] = useState('10');

  // ── 2. Mushak 6.3 State ──
  const [mushakAmount, setMushakAmount] = useState('5000');
  const [vatRate, setVatRate] = useState('5');

  // ── 3. Bag to Kg Calculator State ──
  const [bagWeight, setBagWeight] = useState('50');
  const [bagPrice, setBagPrice] = useState('3650');
  const [desiredMargin, setDesiredMargin] = useState('15');

  if (!srv) return null;

  // Calculations for Bag Calc
  const perKgCost = Number(bagPrice) / Number(bagWeight || 1);
  const retailPerKg = perKgCost * (1 + Number(desiredMargin) / 100);

  // Calculations for Mushak 6.3
  const taxable = Number(mushakAmount || 0);
  const vatAmount = (taxable * Number(vatRate)) / 100;
  const grandTotal = taxable + vatAmount;

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" style={{ maxHeight: '92%' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: srv.accentBg,
                color: srv.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <srv.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--lx-text-primary)' }}>
                {isBn ? srv.titleBn : srv.titleEn}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--lx-text-muted)' }}>
                {isBn ? srv.descBn : srv.descEn}
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

        {/* ── SERVICE 1: Halkhata Festival ── */}
        {srv.id === 'halkhata' && (
          <div>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
                borderRadius: 16,
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '16px',
                marginBottom: 14,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FBBF24', marginBottom: 4 }}>
                {isBn ? 'শুভ হালখাতা বৈশাখী উৎসব' : 'Halkhata Cultural Festival'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--lx-text-secondary)' }}>
                {isBn ? 'পুরাতন খতিয়ান নবায়ন ও সম্মানিত ক্রেতাদের মিষ্টি বিতরণ' : 'Annual ledger closing & customer reconciliation event'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
              <div style={{ background: 'var(--lx-card)', padding: '12px', borderRadius: 12, border: '1px solid var(--lx-border)' }}>
                <div style={{ fontWeight: 700, color: 'var(--lx-text-primary)', marginBottom: 4 }}>
                  {isBn ? 'হালখাতা বিশেষ বকেয়া ছাড় (Early-Payment Discount):' : 'Special Settlement Discount:'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['5%', '10%', '15%', '20%'].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setHalkhataDiscount(pct.replace('%', ''))}
                      style={{
                        flex: 1,
                        padding: '6px',
                        borderRadius: 8,
                        background: halkhataDiscount === pct.replace('%', '') ? '#F59E0B' : 'rgba(255, 255, 255, 0.05)',
                        color: halkhataDiscount === pct.replace('%', '') ? '#050811' : '#fff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {pct}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => showToast?.(isBn ? 'সকল বকেয়া ক্রেতাকে হালখাতার ডিজিটাল দাওয়াতপত্র পাঠানো হয়েছে!' : 'Halkhata invitation dispatched to customers!', 'success')}
                style={{
                  padding: '12px',
                  borderRadius: 12,
                  background: '#F59E0B',
                  border: 'none',
                  color: '#050811',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={16} />
                <span>{isBn ? 'ডিজিটাল দাওয়াতপত্র পাঠান' : 'Send Halkhata Cards'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── SERVICE 2: NBR Mushak 6.3 ── */}
        {srv.id === 'mushak' && (
          <div>
            <div style={{ background: 'var(--lx-card)', borderRadius: 16, border: '1px solid var(--lx-border)', padding: '14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--lx-text-muted)' }}>{isBn ? 'ব্যবসায়ী বিআইএন (BIN):' : 'Merchant BIN:'}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--lx-emerald)' }}>{shopInfo.binNumber}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--lx-text-muted)', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'পণ্যের মোট বিক্রয়মূল্য (৳):' : 'Taxable Goods Amount (BDT):'}
                </label>
                <input
                  type="number"
                  value={mushakAmount}
                  onChange={e => setMushakAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--lx-card)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 14, fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--lx-text-muted)', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'সরকারি ভ্যাট হার (VAT Rate):' : 'Applicable VAT Rate:'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {['5', '7.5', '15'].map(r => (
                    <button
                      key={r}
                      onClick={() => setVatRate(r)}
                      style={{
                        padding: '8px',
                        borderRadius: 8,
                        background: vatRate === r ? '#3B82F6' : 'var(--lx-card)',
                        border: '1px solid var(--lx-border)',
                        color: vatRate === r ? '#fff' : 'var(--lx-text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated Breakdown Card */}
              <div style={{ background: 'rgba(59, 130, 246, 0.08)', borderRadius: 12, padding: '12px', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--lx-text-muted)' }}>{isBn ? 'মূল্য (ভ্যাট ব্যতীত)' : 'Base Price'}:</span>
                  <span style={{ fontWeight: 700 }}>৳ {taxable.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#60A5FA' }}>
                  <span>{isBn ? `ভ্যাট (${vatRate}%)` : `VAT (${vatRate}%)`}:</span>
                  <span style={{ fontWeight: 700 }}>+ ৳ {vatAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: 6, fontSize: 13, fontWeight: 800 }}>
                  <span style={{ color: 'var(--lx-text-primary)' }}>{isBn ? 'মুসক ৬.৩ মোট চালান' : 'Grand Total'}:</span>
                  <span style={{ color: 'var(--lx-emerald)' }}>৳ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  window.print();
                  showToast?.(isBn ? 'এনবিআর ফরম মুসক ৬.৩ চালান প্রিন্টারে পাঠানো হয়েছে!' : 'NBR Form 6.3 Tax Invoice dispatched to printer!', 'success');
                }}
                style={{
                  padding: '12px',
                  borderRadius: 12,
                  background: '#3B82F6',
                  border: 'none',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Printer size={16} />
                <span>{isBn ? 'মুসক ৬.৩ চালান প্রিন্ট করুন' : 'Print Form 6.3 Invoice'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── SERVICE 3: Returnable Crates & Packaging ── */}
        {srv.id === 'crates' && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--lx-text-muted)', marginBottom: 12 }}>
              {isBn ? 'খালি বস্তা, প্লাস্টিক ক্যারেট ও এলপি গ্যাস সিলিন্ডার নন-ক্যাশ ঋণ ট্র্যাকার' : 'Non-cash packaging container loan manager'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { nameBn: 'খালি চটের বস্তা (৫০ কেজি)', nameEn: 'Jute Sacks (50Kg)', owed: 45, deposit: 1800 },
                { nameBn: 'ডিমের প্লাস্টিক ক্যারেট', nameEn: 'Egg Plastic Crates', owed: 28, deposit: 1400 },
                { nameBn: 'বসুন্ধরা এলপি গ্যাস সিলিন্ডার', nameEn: 'LP Gas Cylinders 12Kg', owed: 12, deposit: 12000 },
              ].map((crate, idx) => (
                <div
                  key={idx}
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
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--lx-text-primary)' }}>
                      {isBn ? crate.nameBn : crate.nameEn}
                    </div>
                    <div style={{ fontSize: 10.5, color: '#10B981', fontWeight: 600 }}>
                      {isBn ? 'মার্কেট জামানত মূল্য' : 'Deposit Value'}: ৳ {crate.deposit}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#FBBF24', fontFamily: 'Outfit, sans-serif' }}>
                      {crate.owed} {isBn ? 'টি বাকি' : 'Owed'}
                    </div>
                    <button
                      onClick={() => showToast?.(isBn ? 'রিটার্ন এন্ট্রি সফল হয়েছে!' : 'Return recorded!', 'success')}
                      style={{
                        marginTop: 4,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: 'rgba(0, 208, 156, 0.15)',
                        border: '1px solid var(--lx-emerald)',
                        color: 'var(--lx-emerald)',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isBn ? 'ফেরত গ্রহণ' : 'Return'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICE 4: Bag to Kg Converter ── */}
        {srv.id === 'bagCalc' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--lx-text-muted)', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'বস্তার ওজন (কেজি):' : 'Bag Weight (Kg):'}
                  </label>
                  <input
                    type="number"
                    value={bagWeight}
                    onChange={e => setBagWeight(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, background: 'var(--lx-card)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--lx-text-muted)', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'বস্তার ক্রয়মূল্য (৳):' : 'Bag Cost (BDT):'}
                  </label>
                  <input
                    type="number"
                    value={bagPrice}
                    onChange={e => setBagPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 10, background: 'var(--lx-card)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, color: 'var(--lx-text-muted)', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'কাঙ্ক্ষিত লাভ / মার্জিন (%):' : 'Desired Profit Margin (%):'}
                </label>
                <input
                  type="number"
                  value={desiredMargin}
                  onChange={e => setDesiredMargin(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 10, background: 'var(--lx-card)', border: '1px solid var(--lx-border)', color: '#fff', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              {/* Result Card */}
              <div style={{ background: 'rgba(236, 72, 153, 0.08)', borderRadius: 14, padding: '14px', border: '1px solid rgba(236, 72, 153, 0.3)', marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--lx-text-muted)' }}>{isBn ? 'কেজি প্রতি পাইকারি ক্রয়মূল্য' : 'Cost per Kg'}:</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>৳ {perKgCost.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: 8 }}>
                  <span style={{ color: '#F472B6' }}>{isBn ? 'প্রস্তাবিত খুচরা বিক্রয়দর' : 'Suggested Retail Price'}:</span>
                  <span style={{ color: 'var(--lx-emerald)', fontFamily: 'Outfit, sans-serif' }}>৳ {retailPerKg.toFixed(2)} /কেজি</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SERVICE 5: Daily Profit & Loss ── */}
        {srv.id === 'pnl' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'var(--lx-card)', borderRadius: 14, padding: '14px', border: '1px solid var(--lx-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--lx-text-muted)' }}>{isBn ? 'আজকের মোট বিক্রয়' : "Today's Gross Sales"}:</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>৳ {balances.todaySales.toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--lx-text-muted)' }}>{isBn ? 'বিক্রীত পণ্যের আনুমানিক খরচ' : 'Cost of Goods Sold'}:</span>
                  <span style={{ fontWeight: 700, color: 'var(--lx-text-secondary)' }}>৳ {(balances.todaySales * 0.85).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--lx-text-muted)' }}>{isBn ? 'দোকানের মোট খরচ' : 'Daily Expenses'}:</span>
                  <span style={{ fontWeight: 700, color: '#FB7185' }}>- ৳ {balances.todayExpense.toLocaleString(isBn ? 'bn-BD' : 'en-US')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--lx-border)', paddingTop: 8, fontSize: 14, fontWeight: 900 }}>
                  <span style={{ color: 'var(--lx-text-primary)' }}>{isBn ? 'আজকের আনুমানিক নিট লাভ' : 'Estimated Net Profit'}:</span>
                  <span style={{ color: 'var(--lx-emerald)', fontFamily: 'Outfit, sans-serif' }}>
                    ৳ {(balances.todaySales * 0.15 - balances.todayExpense).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SERVICE 6: Cheques ── */}
        {srv.id === 'cheques' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { bank: 'Islami Bank Bangladesh', chqNo: 'IBBL-981244', amount: 45000, date: '২৮ অক্টোবর', party: 'মেসার্স ভাই ভাই স্টোর', status: 'Clearing' },
                { bank: 'BRAC Bank Limited', chqNo: 'BBL-330192', amount: 20000, date: '৩০ অক্টোবর', party: 'হাজী মোশাররফ হোসেন', status: 'Pending' },
              ].map((chq, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--lx-card)',
                    borderRadius: 14,
                    border: '1px solid var(--lx-border)',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--lx-text-primary)' }}>
                      {chq.bank}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--lx-text-muted)' }}>
                      {chq.chqNo} • {chq.party}
                    </div>
                    <div style={{ fontSize: 10, color: '#A78BFA', fontWeight: 600, marginTop: 2 }}>
                      {isBn ? 'ক্লিয়ারিং তারিখ:' : 'Due Date:'} {chq.date}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {chq.amount.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                    <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 4, background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA', fontWeight: 700 }}>
                      {chq.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
