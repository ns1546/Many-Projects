import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, Wallet, Landmark, ArrowDownLeft, ArrowUpRight, Lock, Key } from 'lucide-react';
import { soundbox } from '../utils/soundbox';

export default function CashboxModal() {
  const { language, balances, setBalances, setActiveModal, showToast } = useMobileApp();
  const isBn = language === 'bn';

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferType, setTransferType] = useState('bankToCash'); // bankToCash, cashToBank

  const kickDrawer = () => {
    soundbox.playChime();
    setDrawerOpen(true);
    setTimeout(() => setDrawerOpen(false), 2500);
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    const num = Number(transferAmount || 0);
    if (num <= 0) return;

    if (transferType === 'cashToBank') {
      if (num > balances.cashInHand) {
        showToast?.(isBn ? 'ক্যাশবাক্সে পর্যাপ্ত টাকা নেই!' : 'Insufficient cash in hand!', 'error');
        return;
      }
      setBalances(prev => ({
        ...prev,
        cashInHand: prev.cashInHand - num,
        bankBalance: prev.bankBalance + num,
      }));
    } else {
      if (num > balances.bankBalance) {
        showToast?.(isBn ? 'ব্যাংকে পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient bank balance!', 'error');
        return;
      }
      setBalances(prev => ({
        ...prev,
        cashInHand: prev.cashInHand + num,
        bankBalance: prev.bankBalance - num,
      }));
    }

    setTransferAmount('');
    showToast?.(isBn ? 'ক্যাশ ট্রান্সফার সফল হয়েছে!' : 'Cash transfer complete!', 'success');
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
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FBBF24',
              }}
            >
              <Wallet size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--lx-text-primary)' }}>
                {isBn ? 'ক্যাশবাক্স ও ব্যাংক তহবিল' : 'Cashbox & Bank Reserves'}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--lx-text-muted)' }}>
                {isBn ? 'দোকানের ক্যাশ ড্রয়ার ও নগদ জমা ব্যবস্থাপনা' : 'Manage physical cash drawer & liquidity'}
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

        {/* Dual Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'var(--lx-card)', borderRadius: 14, padding: '14px', border: '1px solid var(--lx-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--lx-text-muted)' }}>
              <Wallet size={14} color="#00D09C" />
              <span>{isBn ? 'ক্যাশ ইন হ্যান্ড (ড্রয়ার)' : 'Cash in Hand'}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--lx-emerald)', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>
              ৳ {balances.cashInHand.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: 'var(--lx-card)', borderRadius: 14, padding: '14px', border: '1px solid var(--lx-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--lx-text-muted)' }}>
              <Landmark size={14} color="#3B82F6" />
              <span>{isBn ? 'ব্যাংক ব্যালেন্স' : 'Bank Balance'}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#60A5FA', fontFamily: 'Outfit, sans-serif', marginTop: 4 }}>
              ৳ {balances.bankBalance.toLocaleString(isBn ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Hardware Solenoid Kick Button */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={kickDrawer}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 14,
              background: drawerOpen ? '#F59E0B' : 'rgba(245, 158, 11, 0.12)',
              border: '1px solid #F59E0B',
              color: drawerOpen ? '#050811' : '#FBBF24',
              fontSize: 12.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Key size={16} />
            <span>{drawerOpen ? (isBn ? 'ক্যাশ ড্রয়ার খোলা হয়েছে! (24V Pulse)' : 'Drawer Solenoid Popped!') : (isBn ? 'ক্যাশ ড্রয়ার খুলুন (ESC/POS Solenoid)' : 'Kick Cash Drawer (ESC/POS)')}</span>
          </button>
        </div>

        {/* Transfer Funds between Cash & Bank */}
        <div style={{ background: 'var(--lx-card)', borderRadius: 14, padding: '14px', border: '1px solid var(--lx-border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--lx-text-primary)', marginBottom: 8 }}>
            {isBn ? 'ক্যাশ ⇄ ব্যাংক অভ্যন্তরীণ ট্রান্সফার:' : 'Transfer Cash ⇄ Bank:'}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => setTransferType('cashToBank')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 8,
                background: transferType === 'cashToBank' ? 'var(--lx-emerald)' : 'var(--lx-bg)',
                color: transferType === 'cashToBank' ? '#050811' : 'var(--lx-text-secondary)',
                border: '1px solid var(--lx-border)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'ক্যাশ → ব্যাংক জমা' : 'Cash to Bank'}
            </button>
            <button
              onClick={() => setTransferType('bankToCash')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 8,
                background: transferType === 'bankToCash' ? 'var(--lx-emerald)' : 'var(--lx-bg)',
                color: transferType === 'bankToCash' ? '#050811' : 'var(--lx-text-secondary)',
                border: '1px solid var(--lx-border)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'ব্যাংক → ক্যাশ উত্তোলন' : 'Bank to Cash'}
            </button>
          </div>

          <form onSubmit={handleTransfer} style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              placeholder="0.00"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--lx-bg)',
                border: '1px solid var(--lx-border)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'var(--lx-emerald)',
                border: 'none',
                color: '#050811',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'স্থানান্তর' : 'Transfer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
