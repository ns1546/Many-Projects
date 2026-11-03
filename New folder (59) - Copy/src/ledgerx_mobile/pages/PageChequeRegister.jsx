import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { haptics } from '../utils/haptics';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Building,
  Calendar,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';

export default function PageChequeRegister() {
  const { language, balances, setBalances, clearCheque } = useMobileApp();
  const isBn = language === 'bn';

  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, cleared, bounced
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [clearingCheque, setClearingCheque] = useState(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const initialDefaultCheques = [
    {
      id: 1,
      bank: 'ইসলামী ব্যাংক বাংলাদেশ লিঃ',
      chequeNo: 'IBBL-982341',
      party: 'হাজী কাশেম আলী (পাইকারি)',
      amount: 45000,
      issueDate: '১৫ অক্টোবর ২০২৬',
      maturityDate: '২৮ অক্টোবর ২০২৬',
      status: 'pending', // pending, cleared, bounced
      direction: 'received', // received from customer
    },
    {
      id: 2,
      bank: 'ব্র্যাক ব্যাংক পিএলসি',
      chequeNo: 'BRAC-441290',
      party: 'মেসার্স সিটি অটো রাইস মিল',
      amount: 120000,
      issueDate: '১৮ অক্টোবর ২০২৬',
      maturityDate: '৩০ অক্টোবর ২০২৬',
      status: 'pending',
      direction: 'issued', // issued to supplier
    },
    {
      id: 3,
      bank: 'ডাচ-বাংলা ব্যাংক লিমিটেড',
      chequeNo: 'DBBL-118239',
      party: 'আলমগীর স্টোর',
      amount: 25000,
      issueDate: '১০ অক্টোবর ২০২৬',
      maturityDate: '২০ অক্টোবর ২০২৬',
      status: 'cleared',
      direction: 'received',
    },
  ];

  const [cheques, setCheques] = useState(() => {
    try {
      const saved = localStorage.getItem('ledgerx_cheques');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialDefaultCheques;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('ledgerx_cheques', JSON.stringify(cheques));
    } catch (e) {}
  }, [cheques]);

  const defaultMaturity = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const [newBank, setNewBank] = useState('ইসলামী ব্যাংক বাংলাদেশ লিঃ');
  const [newNo, setNewNo] = useState('');
  const [newParty, setNewParty] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(defaultMaturity);
  const [newDirection, setNewDirection] = useState('received');

  const handleClearChequeConfirm = () => {
    if (!clearingCheque) return;
    const c = clearingCheque;

    setCheques(prev =>
      prev.map(item => (item.id === c.id ? { ...item, status: 'cleared' } : item))
    );

    if (c.direction === 'received') {
      if (clearCheque) {
        clearCheque({ chequeId: c.id, bankName: c.bank, amount: c.amount });
      } else {
        setBalances(prev => ({
          ...prev,
          bankBalance: prev.bankBalance + c.amount,
        }));
      }

      soundbox.announce({
        type: 'credit_collection',
        amount: c.amount,
        partyName: c.party,
        language,
      });

      haptics.success();
      showToastMsg(
        isBn
          ? `চেক #${c.chequeNo} ক্লিয়ার হয়ে ব্যাংকে ৳${c.amount.toLocaleString('bn-BD')} জমা হয়েছে!`
          : `Cheque #${c.chequeNo} cleared into bank account!`
      );
    } else {
      setBalances(prev => ({
        ...prev,
        bankBalance: Math.max(0, prev.bankBalance - c.amount),
      }));

      haptics.success();
      showToastMsg(
        isBn
          ? `চেক #${c.chequeNo} বাবদ ব্যাংক থেকে ৳${c.amount.toLocaleString('bn-BD')} পরিশোধিত হয়েছে!`
          : `Cheque cleared from bank balance!`
      );
    }

    setClearingCheque(null);
  };

  const handleBounceCheque = (id, e) => {
    e.stopPropagation();
    haptics.warning();
    setCheques(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'bounced' } : item))
    );
    showToastMsg(isBn ? 'চেকটি বাউন্স / ডিসঅনার হিসেবে চিহ্নিত হয়েছে!' : 'Cheque marked as Bounced');
  };

  const handleAddCheque = (e) => {
    e.preventDefault();
    if (!newNo || !newAmount || !newParty) return;

    haptics.tap();
    const newEntry = {
      id: Date.now(),
      bank: newBank,
      chequeNo: newNo,
      party: newParty,
      amount: Number(newAmount),
      issueDate: 'আজ',
      maturityDate: newDate,
      status: 'pending',
      direction: newDirection,
    };

    setCheques(prev => [newEntry, ...prev]);
    setShowAddForm(false);
    setNewNo('');
    setNewParty('');
    setNewAmount('');
    haptics.success();
    showToastMsg(isBn ? 'নতুন চেক রেজিস্ট্রারে যুক্ত হয়েছে!' : 'Cheque registered successfully!');
  };

  const filteredCheques = cheques.filter(c => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  const totalPendingReceived = cheques
    .filter(c => c.status === 'pending' && c.direction === 'received')
    .reduce((s, c) => s + c.amount, 0);

  const totalPendingIssued = cheques
    .filter(c => c.status === 'pending' && c.direction === 'issued')
    .reduce((s, c) => s + c.amount, 0);

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          className="lx-toast-banner"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#111827',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: 24,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              maxWidth: '90%',
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <SubpageHeader
        titleBn="ব্যাংক চেক খাতা ও ক্লিয়ারিং"
        titleEn="Cheque Register & Clearance"
        subtitleBn="পোস্ট-ডেটেড চেক ও ক্লিয়ারিং হিসাব"
        subtitleEn="Post-dated cheques & bank clearing"
        rightAction={
          <button
            onClick={() => {
              haptics.tap();
              setShowAddForm(!showAddForm);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={14} />
            <span>{showAddForm ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'নতুন চেক' : 'Add Cheque')}</span>
          </button>
        }
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Pending Cheques Stats Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'ক্লিয়ারিং বাকি (পাওনা)' : 'Pending Inflow'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#059669', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳ {totalPendingReceived.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'ইস্যুকৃত চেক দেনা' : 'Pending Outflow'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#E11D48', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳ {totalPendingIssued.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>
        </div>

        {/* Add Cheque Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddCheque}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--bk-pink)',
              borderRadius: 18,
              padding: '16px',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--bk-pink)', marginBottom: 8 }}>
              {isBn ? 'নতুন ব্যাংক চেক এন্ট্রি করুন' : 'Register New Cheque'}
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setNewDirection('received')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: 8,
                  border: 'none',
                  background: newDirection === 'received' ? '#059669' : '#F3F4F6',
                  color: newDirection === 'received' ? '#FFFFFF' : '#4B5563',
                  fontWeight: 800,
                  fontSize: 11.5,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'গ্রাহক থেকে প্রাপ্ত (জমা)' : 'Received'}
              </button>
              <button
                type="button"
                onClick={() => setNewDirection('issued')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: 8,
                  border: 'none',
                  background: newDirection === 'issued' ? '#E11D48' : '#F3F4F6',
                  color: newDirection === 'issued' ? '#FFFFFF' : '#4B5563',
                  fontWeight: 800,
                  fontSize: 11.5,
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'মহাজনকে প্রদত্ত (দেনা)' : 'Issued'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder={isBn ? 'ব্যাংকের নাম *' : 'Bank Name'}
                value={newBank}
                onChange={e => setNewBank(e.target.value)}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="text"
                placeholder={isBn ? 'চেক নম্বর *' : 'Cheque No'}
                value={newNo}
                onChange={e => setNewNo(e.target.value)}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder={isBn ? 'পার্টি নাম' : 'Party'}
                value={newParty}
                onChange={e => setNewParty(e.target.value)}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="number"
                placeholder={isBn ? 'টাকার পরিমাণ' : 'Amount'}
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'চেক সংরক্ষণ করুন' : 'Save Cheque'}
            </button>
          </form>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, background: '#FFFFFF', padding: 4, borderRadius: 12, border: '1px solid #E5E7EB' }}>
          {[
            { id: 'all', labelBn: 'সকল চেক', labelEn: 'All' },
            { id: 'pending', labelBn: 'ক্লিয়ারিং অপেক্ষমান', labelEn: 'Pending' },
            { id: 'cleared', labelBn: 'ক্লিয়ার্ড', labelEn: 'Cleared' },
            { id: 'bounced', labelBn: 'বাউন্স', labelEn: 'Bounced' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                haptics.tap();
                setActiveFilter(t.id);
              }}
              style={{
                flex: 1,
                padding: '7px 4px',
                borderRadius: 8,
                border: 'none',
                background: activeFilter === t.id ? 'var(--bk-pink)' : 'transparent',
                color: activeFilter === t.id ? '#FFFFFF' : '#4B5563',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isBn ? t.labelBn : t.labelEn}
            </button>
          ))}
        </div>

        {/* Cheques List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredCheques.map(c => {
            const isPending = c.status === 'pending';
            const isCleared = c.status === 'cleared';
            const isReceived = c.direction === 'received';

            return (
              <div
                key={c.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 18,
                  padding: '14px',
                  border: isPending ? '1.5px solid #BFDBFE' : '1px solid #E5E7EB',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: '#111827' }}>
                        {c.bank}
                      </span>
                      <span
                        style={{
                          background: isCleared ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                          color: isCleared ? '#16A34A' : isPending ? '#D97706' : '#DC2626',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 6,
                        }}
                      >
                        {isCleared ? (isBn ? 'ক্লিয়ার্ড' : 'Cleared') : isPending ? (isBn ? 'অপেক্ষমান' : 'Pending') : (isBn ? 'বাউন্স' : 'Bounced')}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                      চেক #{c.chequeNo} • {c.party}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 600 }}>
                      {isReceived ? (isBn ? 'প্রাপ্ত চেক' : 'RECEIVED') : (isBn ? 'প্রদত্ত চেক' : 'ISSUED')}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: isReceived ? '#059669' : '#E11D48', fontFamily: 'Outfit, sans-serif' }}>
                      ৳ {c.amount.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                    </div>
                  </div>
                </div>

                {/* Maturity Date & Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid #F3F4F6',
                    fontSize: 11,
                  }}
                >
                  <div style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} />
                    <span>{isBn ? 'পরিপক্ক তারিখ' : 'Maturity'}: {c.maturityDate}</span>
                  </div>

                  {isPending && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={(e) => handleBounceCheque(c.id, e)}
                        style={{
                          background: '#FFF1F2',
                          color: '#E11D48',
                          border: '1px solid #FECDD3',
                          borderRadius: 8,
                          padding: '4px 8px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        বাউন্স
                      </button>

                      <button
                        onClick={() => {
                          haptics.tap();
                          setClearingCheque(c);
                        }}
                        style={{
                          background: '#ECFDF5',
                          color: '#059669',
                          border: '1px solid #A7F3D0',
                          borderRadius: 8,
                          padding: '4px 10px',
                          fontSize: 10.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>{isBn ? 'ক্লিয়ার করুন' : 'Clear Cheque'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cheque Clearing Confirmation Modal */}
      {clearingCheque && (
        <div
          className="bk-slide-drawer-backdrop"
          onClick={() => {
            haptics.tap();
            setClearingCheque(null);
          }}
        >
          <div
            className="bk-slide-drawer"
            onClick={e => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                {isBn ? 'চেক ক্লিয়ারিং নিশ্চিতকরণ' : 'Confirm Cheque Clearance'}
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  setClearingCheque(null);
                }}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: '#6B7280' }}>ব্যাংক:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{clearingCheque.bank}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: '#6B7280' }}>চেক নম্বর:</span>
                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{clearingCheque.chequeNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: '#6B7280' }}>পার্টি:</span>
                <span style={{ fontWeight: 700 }}>{clearingCheque.party}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #E5E7EB', fontSize: 14 }}>
                <span style={{ fontWeight: 700 }}>টাকার পরিমাণ:</span>
                <span style={{ fontWeight: 900, color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                  ৳ {clearingCheque.amount.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </span>
              </div>
            </div>

            <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 16, lineHeight: 1.4 }}>
              {isBn
                ? 'চেকটি ক্লিয়ার করলে স্বয়ংক্রিয়ভাবে আপনার ব্যাংক ব্যালেন্সে অর্থ জমা হবে এবং খতিয়ান হিস্টোরিতে রেকর্ড যুক্ত হবে।'
                : 'Clearing this cheque will credit your registered bank balance and record it in ledger passbook.'}
            </div>

            <button
              onClick={handleClearChequeConfirm}
              style={{
                width: '100%',
                background: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '12px',
                fontWeight: 900,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              }}
            >
              {isBn ? 'হ্যাঁ, ক্লিয়ার ও ব্যাংকে জমা করুন' : 'Confirm & Deposit to Bank'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
