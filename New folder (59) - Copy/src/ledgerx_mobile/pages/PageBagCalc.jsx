import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import {
  Scale,
  Plus,
  CheckCircle2,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function PageBagCalc() {
  const { language, setProducts, addProduct, showToast, navigateTo } = useMobileApp();
  const isBn = language === 'bn';

  const [bagType, setBagType] = useState('50'); // 50kg or 25kg
  const [bagCount, setBagCount] = useState('10');
  const [bagCost, setBagCost] = useState('3600'); // price per bag
  const [tareWeight, setTareWeight] = useState('0.8'); // kg per gunny bag
  const [dustLossPct, setDustLossPct] = useState('1.5'); // moisture / dust loss %
  const [retailMarginPct, setRetailMarginPct] = useState('12'); // target retail profit %
  const [productName, setProductName] = useState('মিনিকেট চাল বিশেষ');

  // Math
  const numBags = Number(bagCount) || 1;
  const numBagWeight = Number(bagType) || 50;
  const numBagCost = Number(bagCost) || 0;
  const numTare = Number(tareWeight) || 0;
  const numLoss = Number(dustLossPct) || 0;
  const numMargin = Number(retailMarginPct) || 0;

  const grossKg = numBags * numBagWeight;
  const totalTareKg = numBags * numTare;
  const netAfterTareKg = grossKg - totalTareKg;
  const lossKg = (netAfterTareKg * numLoss) / 100;
  const finalSaleableKg = Math.max(1, netAfterTareKg - lossKg);

  const totalInvestment = numBags * numBagCost;
  const trueCostPerKg = totalInvestment / finalSaleableKg;
  const retailSellPricePerKg = trueCostPerKg * (1 + numMargin / 100);
  const projectedProfit = finalSaleableKg * retailSellPricePerKg - totalInvestment;

  const handleSyncToInventory = () => {
    const newProd = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      nameBn: `${productName} (কেজি)`,
      nameEn: `${productName} (Kg)`,
      category: 'চাল ও ডাল',
      stock: Math.round(finalSaleableKg),
      unitBn: 'কেজি',
      unit: 'Kg',
      buyPrice: Math.round(trueCostPerKg),
      price: Math.round(retailSellPricePerKg),
      barcode: `894${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    };

    if (addProduct) {
      addProduct(newProd);
    } else {
      setProducts(prev => [newProd, ...prev]);
    }
    showToast(isBn ? `${newProd.nameBn} সফলভাবে স্টকে যুক্ত হয়েছে!` : `${newProd.nameEn} added to inventory!`, 'success');
    navigateTo('inventory');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24 }}>
      {/* bKash Crimson Header */}
      <SubpageHeader
        titleBn="পাইকারি বস্তা ⇄ কেজি ক্যালকুলেটর"
        titleEn="Wholesale Bag to Kg Converter"
        subtitleBn="চটের বস্তা বাদ ও ঘাটতি সমন্বয় করে সঠিক লাভ"
        subtitleEn="Tare & Moisture Adjusted Retail Pricing"
      />

      <div style={{ padding: '16px' }}>
        {/* Input Parameters Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
            {isBn ? 'পাইকারি ক্রয়ের তথ্য লিখুন:' : 'Enter Wholesale Purchase Data:'}
          </div>

          {/* Product Name */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>পণ্যের নাম</label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12.5, marginTop: 4 }}
            />
          </div>

          {/* Bag Size (50kg vs 25kg) */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>বস্তার স্ট্যান্ডার্ড ওজন</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {[
                { size: '50', label: '৫০ কেজি চটের বস্তা' },
                { size: '25', label: '২৫ কেজি প্লাস্টিক বস্তা' },
              ].map(b => (
                <button
                  key={b.size}
                  onClick={() => setBagType(b.size)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 10,
                    border: bagType === b.size ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                    background: bagType === b.size ? '#FFF0F6' : '#FFFFFF',
                    color: bagType === b.size ? 'var(--bk-pink)' : '#374151',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bag Count & Bag Price */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>বস্তা সংখ্যা</label>
              <input
                type="number"
                value={bagCount}
                onChange={e => setBagCount(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, fontWeight: 700, marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>প্রতি বস্তার দর (৳)</label>
              <input
                type="number"
                value={bagCost}
                onChange={e => setBagCost(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, fontWeight: 700, marginTop: 4 }}
              />
            </div>
          </div>

          {/* Tare and Dust Wastage */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>খালি বস্তার ওজন (কেজি)</label>
              <input
                type="number"
                step="0.1"
                value={tareWeight}
                onChange={e => setTareWeight(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>ধুলো/শুকিয়ে ঘাটতি (%)</label>
              <input
                type="number"
                step="0.5"
                value={dustLossPct}
                onChange={e => setDustLossPct(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, marginTop: 4 }}
              />
            </div>
          </div>

          {/* Target Retail Margin */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
              <span style={{ fontWeight: 700 }}>প্রত্যাশিত খুচরা প্রফিট মার্জিন</span>
              <span style={{ fontWeight: 800, color: 'var(--bk-pink)' }}>{retailMarginPct}%</span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              value={retailMarginPct}
              onChange={e => setRetailMarginPct(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--bk-pink)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Calculation Result Sheet */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
            borderRadius: 20,
            padding: '20px 16px',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, color: '#93C5FD', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            খাঁটি খুচরা বিক্রয় ও লাভ বিশ্লেষণ
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px', borderRadius: 12 }}>
              <div style={{ fontSize: 10.5, color: '#BFDBFE' }}>প্রকৃত বিক্রয়যোগ্য কেজি</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>
                {finalSaleableKg.toFixed(1)} Kg
              </div>
              <div style={{ fontSize: 9.5, color: '#93C5FD' }}>ঘাটতি বাদ {lossKg.toFixed(1)} Kg</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px', borderRadius: 12 }}>
              <div style={{ fontSize: 10.5, color: '#BFDBFE' }}>প্রকৃত ক্রয় দর (কেজি)</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#FCD34D', marginTop: 2, fontFamily: 'Outfit, sans-serif' }}>
                ৳ {trueCostPerKg.toFixed(2)}
              </div>
              <div style={{ fontSize: 9.5, color: '#93C5FD' }}>মোট ইনভেস্ট ৳{totalInvestment}</div>
            </div>
          </div>

          {/* Recommended Retail Price Spotlight */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '14px',
              textAlign: 'center',
              color: '#111827',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700 }}>
              প্রস্তাবিত খুচরা বিক্রয় মূল্য (প্রতি কেজি)
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: 'var(--bk-pink)',
                fontFamily: 'Outfit, sans-serif',
                margin: '2px 0',
              }}
            >
              ৳ {Math.round(retailSellPricePerKg)} <span style={{ fontSize: 14, color: '#4B5563' }}>/কেজি</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>
              মোট সম্ভাব্য খাঁটি লাভ: ৳ {Math.round(projectedProfit).toLocaleString('bn-BD')}
            </div>
          </div>
        </div>

        {/* Sync directly to Inventory Stock */}
        <button
          onClick={handleSyncToInventory}
          style={{
            width: '100%',
            background: 'var(--bk-pink)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '14px',
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
          <Package size={17} />
          <span>{isBn ? 'এই কেজি রেটে স্টকে সরাসরি যুক্ত করুন' : 'Sync Converted Stock to Inventory'}</span>
        </button>
      </div>
    </div>
  );
}
