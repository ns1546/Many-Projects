import React, { useState } from 'react';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import { formatCurrency, poishaToTaka, takaToPoisha, parseToPoisha } from '../utils/currency';
import { 
  Wallet, 
  Smartphone, 
  Landmark, 
  ArrowLeft, 
  ArrowRightLeft, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  PlusCircle,
  MinusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  TrendingUp,
  TrendingDown,
  Sparkles,
  X,
  CreditCard,
  Building,
  Trash2,
  Plus,
  Edit2,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cashbox() {
  const { 
    registers, 
    cashboxTotalPoisha, 
    recordCashIn, 
    recordCashOut, 
    transferCash,
    recordCashAdjustment,
    addBankAccount,
    addMfsWallet,
    editRegister,
    deleteRegister,
    ledgerEntries 
  } = useKhata();
  const { t, isBengali, locale, formatNumber } = useLocale();
  const { isEasyMode } = useOperatingMode();
  const navigate = useNavigate();

  // Modals state
  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isBlindCloseOpen, setIsBlindCloseOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [isAddMfsOpen, setIsAddMfsOpen] = useState(false);

  // New Bank Form State
  const [newBankName, setNewBankName] = useState('ইসলামী ব্যাংক বাংলাদেশ পিএলসি (IBBL)');
  const [newBankCustomName, setNewBankCustomName] = useState('');
  const [newBankAccNo, setNewBankAccNo] = useState('');
  const [newBankBranch, setNewBankBranch] = useState('');
  const [newBankType, setNewBankType] = useState('চলতি হিসাব (Current)');
  const [newBankBalanceTaka, setNewBankBalanceTaka] = useState('');

  // New MFS Form State
  const [newMfsProvider, setNewMfsProvider] = useState('BKASH');
  const [newMfsNumber, setNewMfsNumber] = useState('');
  const [newMfsType, setNewMfsType] = useState('মার্চেন্ট (Merchant)');
  const [newMfsBalanceTaka, setNewMfsBalanceTaka] = useState('');

  // Cash In Form State
  const [cashInWallet, setCashInWallet] = useState('cash_drawer');
  const [cashInAmount, setCashInAmount] = useState('');
  const [cashInCat, setCashInCat] = useState('মালিকের জমা');
  const [cashInNote, setCashInNote] = useState('');

  // Cash Out Form State
  const [cashOutWallet, setCashOutWallet] = useState('cash_drawer');
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [cashOutCat, setCashOutCat] = useState('দোকান খরচ');
  const [cashOutNote, setCashOutNote] = useState('');

  // Transfer Form State
  const [xferFrom, setXferFrom] = useState('cash_drawer');
  const [xferTo, setXferTo] = useState('bkash_merchant');
  const [xferAmount, setXferAmount] = useState('');
  const [xferNote, setXferNote] = useState('');

  // Day Close Blind Count State
  const [countedCashTaka, setCountedCashTaka] = useState('');
  const [blindCloseReport, setBlindCloseReport] = useState(null);

  // Categorize Registers into Physical Cash, MFS Wallets, and Commercial Banks
  const cashRegisters = (registers || []).filter((r) => r.category === 'CASH' || r.id === 'cash_drawer');
  const mfsRegisters = (registers || []).filter((r) =>
    r.category === 'MFS' ||
    r.category === 'BKASH' ||
    r.category === 'NAGAD' ||
    r.category === 'ROCKET' ||
    r.id.startsWith('bkash_') ||
    r.id.startsWith('nagad_') ||
    r.id.startsWith('rocket_') ||
    r.id.startsWith('mfs_') ||
    r.id.startsWith('cellfin_')
  );
  const bankRegisters = (registers || []).filter((r) =>
    (r.category === 'BANK' || r.id.startsWith('bank_')) &&
    !mfsRegisters.some((m) => m.id === r.id) &&
    !cashRegisters.some((c) => c.id === r.id)
  );

  const cashDrawer = cashRegisters[0] || (registers || []).find((r) => r.id === 'cash_drawer');
  const totalCashPoisha = cashRegisters.reduce((sum, r) => sum + (r.balancePoisha || 0), 0);
  const totalMfsPoisha = mfsRegisters.reduce((sum, r) => sum + (r.balancePoisha || 0), 0);
  const totalBankPoisha = bankRegisters.reduce((sum, r) => sum + (r.balancePoisha || 0), 0);

  // MFS Branding and Styling Helper
  const getMfsMeta = (reg) => {
    const id = (reg.id || '').toLowerCase();
    const prov = (reg.provider || '').toUpperCase();
    if (id.includes('bkash') || prov === 'BKASH') {
      return {
        brandName: 'বিকাশ (bKash)',
        shortName: 'bKash',
        badgeBg: 'bg-pink-100 text-[#E2136E] border-pink-200',
        cardBorder: 'hover:border-pink-300',
        iconBg: 'bg-pink-100 text-[#E2136E]',
        accentColor: '#E2136E',
        gradient: 'from-[#E2136E] to-[#B00F55]',
        avatar: '🌸',
      };
    }
    if (id.includes('nagad') || prov === 'NAGAD') {
      return {
        brandName: 'নগদ (Nagad)',
        shortName: 'Nagad',
        badgeBg: 'bg-orange-100 text-[#F7941D] border-orange-200',
        cardBorder: 'hover:border-orange-300',
        iconBg: 'bg-orange-100 text-[#F7941D]',
        accentColor: '#F7941D',
        gradient: 'from-[#F7941D] to-[#D66F00]',
        avatar: '🟠',
      };
    }
    if (id.includes('rocket') || prov === 'ROCKET') {
      return {
        brandName: 'রকেট (Rocket)',
        shortName: 'Rocket',
        badgeBg: 'bg-purple-100 text-[#8C3494] border-purple-200',
        cardBorder: 'hover:border-purple-300',
        iconBg: 'bg-purple-100 text-[#8C3494]',
        accentColor: '#8C3494',
        gradient: 'from-[#8C3494] to-[#63186B]',
        avatar: '🟣',
      };
    }
    if (id.includes('cellfin') || prov === 'CELLFIN') {
      return {
        brandName: 'সেলফিন (CellFin)',
        shortName: 'CellFin',
        badgeBg: 'bg-emerald-100 text-[#008037] border-emerald-200',
        cardBorder: 'hover:border-emerald-300',
        iconBg: 'bg-emerald-100 text-[#008037]',
        accentColor: '#008037',
        gradient: 'from-[#008037] to-[#005725]',
        avatar: '🟢',
      };
    }
    if (id.includes('upay') || prov === 'UPAY') {
      return {
        brandName: 'উপায় (Upay)',
        shortName: 'Upay',
        badgeBg: 'bg-blue-100 text-[#004899] border-blue-200',
        cardBorder: 'hover:border-blue-300',
        iconBg: 'bg-blue-100 text-[#004899]',
        accentColor: '#004899',
        gradient: 'from-[#004899] to-[#002D62]',
        avatar: '🔵',
      };
    }
    return {
      brandName: reg.name || 'এমএফএস ওয়ালেট',
      shortName: 'MFS',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      cardBorder: 'hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      accentColor: '#64748B',
      gradient: 'from-slate-700 to-slate-900',
      avatar: '📱',
    };
  };

  // Bank Branding and Styling Helper
  const getBankMeta = (reg) => {
    const name = (reg.name || '').toLowerCase();
    const bankName = (reg.bankName || '').toLowerCase();
    const id = (reg.id || '').toLowerCase();
    if (name.includes('ইসলামী') || bankName.includes('islami') || id.includes('ibbl')) {
      return {
        brandName: 'ইসলামী ব্যাংক বাংলাদেশ (IBBL)',
        shortName: 'IBBL',
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700',
        logoText: 'IBBL',
      };
    }
    if (name.includes('ডাচ') || bankName.includes('dutch') || id.includes('dbbl')) {
      return {
        brandName: 'ডাচ-বাংলা ব্যাংক (DBBL)',
        shortName: 'DBBL',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        iconBg: 'bg-amber-100 text-amber-700',
        logoText: 'DBBL',
      };
    }
    if (name.includes('ব্র্যাক') || bankName.includes('brac')) {
      return {
        brandName: 'ব্র্যাক ব্যাংক (BRAC Bank)',
        shortName: 'BRAC',
        badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
        iconBg: 'bg-blue-100 text-blue-700',
        logoText: 'BRAC',
      };
    }
    if (name.includes('সিটি') || bankName.includes('city')) {
      return {
        brandName: 'সিটি ব্যাংক (City Bank)',
        shortName: 'CITY',
        badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        iconBg: 'bg-indigo-100 text-indigo-700',
        logoText: 'CITY',
      };
    }
    return {
      brandName: reg.bankName || reg.name || 'বাণিজ্যিক ব্যাংক',
      shortName: 'BANK',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      logoText: 'BANK',
    };
  };

  // Quick Amount Presets
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const handleQuickAdd = (amount, setter, currentVal) => {
    const current = parseFloat(currentVal) || 0;
    setter(String(current + amount));
  };

  // Submit Handlers
  const handleCashInSubmit = (e) => {
    e.preventDefault();
    const poisha = parseToPoisha(cashInAmount);
    if (poisha <= 0) {
      toast.error(isBengali ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Enter valid amount');
      return;
    }
    recordCashIn({
      walletId: cashInWallet,
      amountPoisha: poisha,
      category: cashInCat,
      note: cashInNote,
    });
    setCashInAmount('');
    setCashInNote('');
    setIsCashInOpen(false);
    toast.success(isBengali ? 'ক্যাশ সফলভাবে জমা হয়েছে!' : 'Cash deposited successfully!');
  };

  const handleCashOutSubmit = (e) => {
    e.preventDefault();
    const poisha = parseToPoisha(cashOutAmount);
    if (poisha <= 0) {
      toast.error(isBengali ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Enter valid amount');
      return;
    }
    const targetReg = (registers || []).find(r => r.id === cashOutWallet);
    if (targetReg && targetReg.balancePoisha < poisha) {
      toast.error(isBengali ? 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient wallet balance!');
      return;
    }
    recordCashOut({
      walletId: cashOutWallet,
      amountPoisha: poisha,
      category: cashOutCat,
      note: cashOutNote,
    });
    setCashOutAmount('');
    setCashOutNote('');
    setIsCashOutOpen(false);
    toast.success(isBengali ? 'খরচ সফলভাবে কর্তন করা হয়েছে!' : 'Expense deducted successfully!');
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (xferFrom === xferTo) {
      toast.error(isBengali ? 'উৎস ও গন্তব্য একই ওয়ালেট হতে পারবে না!' : 'Source and destination cannot be identical!');
      return;
    }
    const poisha = parseToPoisha(xferAmount);
    if (poisha <= 0) {
      toast.error(isBengali ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Enter valid amount');
      return;
    }
    const sourceReg = (registers || []).find(r => r.id === xferFrom);
    if (sourceReg && sourceReg.balancePoisha < poisha) {
      toast.error(isBengali ? 'উৎস ওয়ালেটে পর্যাপ্ত ফান্ড নেই!' : 'Insufficient source funds!');
      return;
    }
    transferCash({
      fromWalletId: xferFrom,
      toWalletId: xferTo,
      amountPoisha: poisha,
      note: xferNote,
    });
    setXferAmount('');
    setXferNote('');
    setIsTransferOpen(false);
    toast.success(isBengali ? 'ফান্ড সফলভাবে স্থানান্তর হয়েছে!' : 'Funds transferred successfully!');
  };

  const handleBlindCloseSubmit = () => {
    const countedPoisha = takaToPoisha(countedCashTaka || '0');
    const expectedPoisha = cashDrawer ? cashDrawer.balancePoisha : 0;
    const variancePoisha = countedPoisha - expectedPoisha;

    const report = {
      countedPoisha,
      expectedPoisha,
      variancePoisha,
      isExactMatch: variancePoisha === 0,
      timestamp: Date.now(),
    };

    setBlindCloseReport(report);
    if (variancePoisha === 0) {
      toast.success(isBengali ? 'ক্যাশ ড্রয়ার শতভাগ মিলেছে!' : 'Cash drawer balanced perfectly!', { icon: '🎯' });
    } else if (variancePoisha > 0) {
      toast(isBengali ? `উদ্বৃত্ত ক্যাশ: ৳ ${poishaToTaka(variancePoisha)}` : `Surplus: ৳ ${poishaToTaka(variancePoisha)}`, { icon: '⚠️' });
    } else {
      toast.error(isBengali ? `ক্যাশ ঘাটতি: ৳ ${Math.abs(poishaToTaka(variancePoisha))}` : `Shortage: ৳ ${Math.abs(poishaToTaka(variancePoisha))}`, { icon: '🚨' });
    }
  };

  const handleApplyAdjustment = () => {
    if (!blindCloseReport || blindCloseReport.variancePoisha === 0) return;
    recordCashAdjustment({
      variancePoisha: blindCloseReport.variancePoisha,
      note: isBengali ? 'ক্যাশ কাউন্টার দিনের ক্লোজিং অমিল সমন্বয়' : 'Till count discrepancy adjustment'
    });
    toast.success(isBengali ? 'ক্যাশ সমন্বয় ও ব্যালেন্স সফলভাবে আপডেট হয়েছে!' : 'Cash adjustment posted and balance reconciled!');
    setIsBlindCloseOpen(false);
    setBlindCloseReport(null);
    setCountedCashTaka('');
  };

  const handleAddBankSubmit = (e) => {
    e.preventDefault();
    const finalBankName = newBankName === 'OTHER' ? newBankCustomName.trim() : newBankName;
    if (!finalBankName) {
      toast.error(isBengali ? 'ব্যাংকের নাম লিখুন' : 'Enter bank name');
      return;
    }
    if (!newBankAccNo.trim()) {
      toast.error(isBengali ? 'হিসাব নম্বর লিখুন' : 'Enter account number');
      return;
    }
    const initialPoisha = parseToPoisha(newBankBalanceTaka || '0');
    addBankAccount({
      bankName: finalBankName,
      accountNumber: newBankAccNo.trim(),
      branch: newBankBranch.trim(),
      accountType: newBankType,
      initialBalancePoisha: initialPoisha,
    });
    setNewBankAccNo('');
    setNewBankBranch('');
    setNewBankBalanceTaka('');
    setIsAddBankOpen(false);
  };

  const handleAddMfsSubmit = (e) => {
    e.preventDefault();
    if (!newMfsNumber.trim()) {
      toast.error(isBengali ? 'মোবাইল / ওয়ালেট নম্বর লিখুন' : 'Enter wallet number');
      return;
    }
    const initialPoisha = parseToPoisha(newMfsBalanceTaka || '0');
    addMfsWallet({
      provider: newMfsProvider,
      walletNumber: newMfsNumber.trim(),
      walletType: newMfsType,
      initialBalancePoisha: initialPoisha,
    });
    setNewMfsNumber('');
    setNewMfsBalanceTaka('');
    setIsAddMfsOpen(false);
  };

  // Filter ledger to cash movements
  const cashMovements = (ledgerEntries || []).filter(e => 
    e.type === 'CASH_IN' || 
    e.type === 'CASH_OUT' || 
    e.type === 'WALLET_TRANSFER' || 
    e.type === 'PAYMENT_TO_SUPPLIER' ||
    e.type === 'HALKHATA_SETTLEMENT' ||
    e.cashRegisterId
  ).slice(0, 30);

  // Compute Today's Cash In and Out
  const todayInPoisha = cashMovements
    .filter(e => e.type === 'CASH_IN' || e.type === 'HALKHATA_SETTLEMENT')
    .reduce((sum, e) => sum + (e.amountPoisha || e.cashCollectedPoisha || 0), 0);

  const todayOutPoisha = cashMovements
    .filter(e => e.type === 'CASH_OUT' || e.type === 'PAYMENT_TO_SUPPLIER')
    .reduce((sum, e) => sum + (e.amountPoisha || 0), 0);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Top Header Strip ── */}
      <div className="flex items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 shadow-xs border border-slate-200 transition cursor-pointer active:scale-95"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3.5">
            <span className={`w-12 h-12 rounded-2xl ${
              isEasyMode ? 'bg-emerald-100 text-emerald-700' : 'bg-[#E2136E]/10 text-[#E2136E]'
            } flex items-center justify-center`}>
              <Wallet size={24} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {isEasyMode ? (isBengali ? 'ক্যাশবাক্স ও দোকান খরচ' : 'Cashbox & Expenses') : (isBengali ? 'ক্যাশবাক্স ও তারল্য খাতা' : 'Cashbox & Liquidity')}
                </h1>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  isEasyMode 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                    : 'bg-pink-100 text-[#E2136E] border-pink-200'
                }`}>
                  {isEasyMode ? (isBengali ? 'সহজ হিসাব' : 'Simple') : (isBengali ? 'তারল্য খাতা' : 'Pro')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {isBengali ? 'নগদ ক্যাশবাক্স, বিকাশ ব্যালেন্স ও আজকের যাবতীয় খরচের সহজ হিসাব' : 'Daily cash drawer, bKash balances and store expense book'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Signature Master Liquidity Hero ── */}
      <div className={`relative overflow-hidden rounded-3xl ${
        isEasyMode 
          ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 shadow-emerald-700/20' 
          : 'bg-gradient-to-br from-[#E2136E] via-[#D00C60] to-[#9E0B49] shadow-pink-600/15'
      } p-6 sm:p-8 text-white shadow-xl`}>
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-pink-100 uppercase tracking-wider">
                {isBengali ? 'মোট নগদ ক্যাশ ও ডিজিটাল ব্যালেন্স' : 'Total Cashbox & Wallets Balance'}
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white tabular-nums">
                {formatCurrency(cashboxTotalPoisha, { locale })}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/80 font-medium mt-1">
              {isBengali ? 'কাউন্টার ক্যাশ, বিকাশ মার্চেন্ট ও ব্যাংক একাউন্টের লাইভ ব্যালেন্স' : 'Real-time aggregated liquidity across cash drawer, bKash & banks'}
            </p>
          </div>

          {/* Today's Cash Flow Snapshot */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial px-4 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white">
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-semibold mb-0.5">
                <TrendingUp size={14} className="text-emerald-300" />
                <span>{isBengali ? 'আজকে জমা' : 'Today In'}</span>
              </div>
              <p className="text-base sm:text-lg font-black tabular-nums text-emerald-200">
                + {formatCurrency(todayInPoisha, { locale })}
              </p>
            </div>

            <div className="flex-1 md:flex-initial px-4 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white">
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-semibold mb-0.5">
                <TrendingDown size={14} className="text-rose-300" />
                <span>{isBengali ? 'আজকে খরচ' : 'Today Out'}</span>
              </div>
              <p className="text-base sm:text-lg font-black tabular-nums text-rose-200">
                - {formatCurrency(todayOutPoisha, { locale })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons: 2 Giant in Easy Mode vs 4 in Ultra Mode ── */}
      {isEasyMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setIsCashInOpen(true)}
            className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-3 text-base sm:text-lg"
          >
            <PlusCircle size={24} />
            <span>{isBengali ? '+ ক্যাশে টাকা জমা (Cash In)' : '+ Add Cash to Till'}</span>
          </button>

          <button
            onClick={() => setIsCashOutOpen(true)}
            className="p-5 rounded-3xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-3 text-base sm:text-lg"
          >
            <MinusCircle size={24} />
            <span>{isBengali ? '- দোকান খরচ / টাকা তোলা (Cash Out)' : '- Store Expense / Cash Out'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => setIsCashInOpen(true)}
            className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <PlusCircle size={22} />
            <span className="text-sm md:text-base">{isBengali ? '+ ক্যাশ ইন' : '+ Cash In'}</span>
          </button>

          <button
            onClick={() => setIsCashOutOpen(true)}
            className="p-4 rounded-3xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <MinusCircle size={22} />
            <span className="text-sm md:text-base">{isBengali ? '- ক্যাশ আউট' : '- Cash Out'}</span>
          </button>

          <button
            onClick={() => setIsTransferOpen(true)}
            className="p-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <ArrowRightLeft size={20} />
            <span className="text-sm md:text-base">{isBengali ? 'স্থানান্তর' : 'Transfer'}</span>
          </button>

          <button
            onClick={() => {
              setIsBlindCloseOpen(true);
              setBlindCloseReport(null);
              setCountedCashTaka('');
            }}
            className="p-4 rounded-3xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg shadow-slate-900/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
          >
            <ShieldCheck size={22} className="text-emerald-400" />
            <span className="text-sm md:text-base">{isBengali ? 'দিনের হিসাব ক্লোজ' : 'Day Close'}</span>
          </button>
        </div>
      )}

      {/* ── Section 1: Physical Cash Drawer Card ── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
              <Wallet size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  {isBengali ? 'কাউন্টার ক্যাশ ড্রয়ার' : 'Physical Cash Drawer'}
                </span>
                <span className="text-xs text-slate-400 font-medium font-mono">{cashDrawer?.id || 'cash_drawer'}</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 tabular-nums">
                {formatCurrency(cashDrawer ? cashDrawer.balancePoisha : 0, { locale })}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isBengali ? 'দোকানের ক্যাশ ড্রয়ারে বর্তমান ফিজিক্যাল নগদ টাকা' : 'Current physical banknotes & coins in till'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                setCashInWallet('cash_drawer');
                setIsCashInOpen(true);
              }}
              className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <PlusCircle size={17} />
              <span>{isBengali ? '+ ক্যাশে জমা' : '+ Deposit'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCashOutWallet('cash_drawer');
                setIsCashOutOpen(true);
              }}
              className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-black transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <MinusCircle size={17} />
              <span>{isBengali ? '- দোকান খরচ' : '- Expense'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setXferFrom('cash_drawer');
                setIsTransferOpen(true);
              }}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-black transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
              title={isBengali ? 'ব্যাংকে বা এমএফএসে পাঠান' : 'Transfer'}
            >
              <ArrowRightLeft size={16} />
              <span className="hidden sm:inline">{isBengali ? 'স্থানান্তর' : 'Transfer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 2: Mobile Financial Services (MFS) Wallets Grid ── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-pink-100 text-[#E2136E] flex items-center justify-center shadow-2xs">
              <Smartphone size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {isBengali ? 'মোবাইল ব্যাংকিং ওয়ালেট সমূহ (MFS)' : 'Mobile Financial Services (MFS)'}
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-pink-50 text-[#E2136E] border border-pink-200 font-mono">
                  {mfsRegisters.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isBengali ? `বিকাশ, নগদ, রকেট, সেলফিন ও উপায় মোট ব্যালেন্স: ${formatCurrency(totalMfsPoisha, { locale })}` : `Total MFS Balance: ${formatCurrency(totalMfsPoisha, { locale })}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddMfsOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] text-white text-xs font-black shadow-sm shadow-pink-600/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span>{isBengali ? '+ নতুন মোবাইল ওয়ালেট' : '+ Add MFS Wallet'}</span>
          </button>
        </div>

        {/* MFS Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mfsRegisters.map((reg) => {
            const meta = getMfsMeta(reg);
            return (
              <div
                key={reg.id}
                className={`bg-white rounded-3xl p-5 border border-slate-200/90 hover:shadow-md transition-all flex flex-col justify-between ${meta.cardBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-2xs ${meta.iconBg}`}>
                        {meta.avatar}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate">{meta.brandName}</h4>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">
                          {reg.walletNumber || (reg.id.includes('bkash') ? 'মার্চেন্ট QR' : '০১৭XXXXXXXX')}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${meta.badgeBg}`}>
                      {reg.walletType || (isBengali ? 'মার্চেন্ট' : 'Merchant')}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isBengali ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
                      {formatCurrency(reg.balancePoisha || 0, { locale })}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCashInWallet(reg.id);
                      setIsCashInOpen(true);
                    }}
                    className={`flex-1 py-2 rounded-xl text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 bg-gradient-to-r ${meta.gradient}`}
                  >
                    <PlusCircle size={14} />
                    <span>{isBengali ? '+ জমা' : '+ Deposit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setXferFrom(reg.id);
                      setIsTransferOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <ArrowRightLeft size={13} />
                    <span>{isBengali ? '⇄ স্থানান্তর' : '⇄ Transfer'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Commercial Bank Accounts Grid ── */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Landmark size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {isBengali ? 'বাণিজ্যিক ব্যাংক হিসাবসমূহ (Bank Accounts)' : 'Commercial Bank Accounts'}
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  {bankRegisters.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isBengali ? `ইসলামী ব্যাংক, ডাচ-বাংলা, ব্র্যাক, সিটি ব্যাংক মোট তারল্য: ${formatCurrency(totalBankPoisha, { locale })}` : `Total Bank Liquidity: ${formatCurrency(totalBankPoisha, { locale })}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddBankOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm shadow-indigo-600/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span>{isBengali ? '+ নতুন ব্যাংক একাউন্ট' : '+ Add Bank Account'}</span>
          </button>
        </div>

        {/* Bank Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankRegisters.map((reg) => {
            const meta = getBankMeta(reg);
            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black shadow-2xs ${meta.iconBg}`}>
                        {meta.logoText}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate">{reg.bankName || meta.brandName}</h4>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">
                          {reg.branch ? `${reg.branch} শাখা • ` : ''}
                          {reg.accountNumber ? `হি/নং: ••••${reg.accountNumber.slice(-4)}` : (isBengali ? 'প্রাতিষ্ঠানিক হিসাব' : 'Corporate Account')}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 ${meta.badgeBg}`}>
                      {reg.accountType || (isBengali ? 'চলতি হিসাব' : 'Current')}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isBengali ? 'ব্যাংক ব্যালেন্স' : 'Available Balance'}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">
                      {formatCurrency(reg.balancePoisha || 0, { locale })}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCashInWallet(reg.id);
                      setIsCashInOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <PlusCircle size={14} />
                    <span>{isBengali ? '+ জমা' : '+ Deposit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setXferFrom(reg.id);
                      setIsTransferOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <ArrowRightLeft size={13} />
                    <span>{isBengali ? '⇄ উত্তোলন / পে' : '⇄ Transfer'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Live Cash & Wallet Transaction Feed ── */}
      <div className="bkash-card p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#E2136E]/10 text-[#E2136E] flex items-center justify-center">
              <History size={18} />
            </span>
            <span>{isBengali ? 'ক্যাশ ও ওয়ালেটের সাম্প্রতিক লেনদেন' : 'Recent Cash & Wallet Transactions'}</span>
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {isBengali ? `সর্বশেষ ${formatNumber(cashMovements.length)} টি এন্ট্রি` : `Last ${cashMovements.length} entries`}
          </span>
        </div>

        {cashMovements.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Wallet size={36} className="mx-auto mb-2 opacity-30 text-[#E2136E]" />
            <p className="text-sm font-semibold">
              {isBengali ? 'এখনো কোনো ক্যাশ বা ওয়ালেট লেনদেন রেকর্ড করা হয়নি।' : 'No cash or wallet movements recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cashMovements.map((entry) => {
              const isCredit = entry.type === 'CASH_IN' || entry.type === 'HALKHATA_SETTLEMENT';
              const isTransfer = entry.type === 'WALLET_TRANSFER';
              return (
                <div key={entry.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-2xl transition">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      isTransfer ? 'bg-indigo-100 text-indigo-700' :
                      isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isTransfer ? <ArrowRightLeft size={18} /> :
                       isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-slate-800 truncate">
                        {entry.description || entry.type}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-500">
                          {entry.category || (isTransfer ? 'স্থানান্তর' : isCredit ? 'জমা' : 'খরচ')}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        {entry.note && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-500 truncate max-w-[150px]">{entry.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-base font-black tabular-nums block ${
                      isTransfer ? 'text-indigo-600' :
                      isCredit ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isCredit ? '+' : isTransfer ? '↔' : '-'} {formatCurrency(entry.amountPoisha || entry.cashCollectedPoisha || 0, { locale })}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                      {entry.cashRegisterId ? (isBengali ? 'নগদ ড্রয়ার' : 'Cash Drawer') : 'ওয়ালেট'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Spacious Widescreen bKash Cash In Modal ── */}
      {isCashInOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PlusCircle size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isBengali ? 'ক্যাশ ইন / ফান্ড জমা' : 'Cash In / Deposit'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'ক্যাশ ড্রয়ার, বিকাশ অথবা ব্যাংকে নতুন মূলধন বা আয় জমা করুন' : 'Deposit capital or earnings into selected wallet'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCashInOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCashInSubmit} className="space-y-4">
              {/* Target Wallet Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isBengali ? 'কোন ওয়ালেট বা অ্যাকাউন্টে জমা করবেন?' : 'Target Wallet / Account'}
                </label>
                <select
                  value={cashInWallet}
                  onChange={(e) => setCashInWallet(e.target.value)}
                  className="w-full text-xs font-bold p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                >
                  <optgroup label={isBengali ? '💵 নগদ ক্যাশ' : 'Physical Cash'}>
                    {cashRegisters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (ব্যালেন্স: ৳{poishaToTaka(r.balancePoisha || 0)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={isBengali ? '📱 মোবাইল ব্যাংকিং (MFS)' : 'Mobile Banking (MFS)'}>
                    {mfsRegisters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (ব্যালেন্স: ৳{poishaToTaka(r.balancePoisha || 0)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={isBengali ? '🏦 বাণিজ্যিক ব্যাংক হিসাবসমূহ' : 'Commercial Banks'}>
                    {bankRegisters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (ব্যালেন্স: ৳{poishaToTaka(r.balancePoisha || 0)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Amount Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isBengali ? 'টাকার পরিমাণ (টাকা)' : 'Amount (BDT)'} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition">
                  <span className="text-2xl font-black text-emerald-600 select-none shrink-0">৳</span>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={cashInAmount}
                    onChange={(e) => setCashInAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-2xl font-black text-emerald-700 bg-transparent focus:outline-none tabular-nums"
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAdd(amt, setCashInAmount, cashInAmount)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-bold transition cursor-pointer border border-slate-200/80 active:scale-95"
                    >
                      +{formatNumber(amt)}
                    </button>
                  ))}
                  {cashInAmount && (
                    <button
                      type="button"
                      onClick={() => setCashInAmount('')}
                      className="px-2 py-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                    >
                      {isBengali ? 'ক্লিয়ার' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isBengali ? 'জমার কারণ / খাত' : 'Category'}
                  </label>
                  <select
                    value={cashInCat}
                    onChange={(e) => setCashInCat(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  >
                    <option value="মালিকের জমা">{isBengali ? 'মালিকের ব্যক্তিগত জমা' : 'Owner Capital'}</option>
                    <option value="অন্যান্য আয়">{isBengali ? 'অন্যান্য নগদ আয়' : 'Other Income'}</option>
                    <option value="ধার বা লোন গ্রহণ">{isBengali ? 'ধার বা লোন গ্রহণ' : 'Loan Received'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isBengali ? 'নোট / বিবরণ' : 'Note'}
                  </label>
                  <input
                    type="text"
                    value={cashInNote}
                    onChange={(e) => setCashInNote(e.target.value)}
                    placeholder={isBengali ? 'যেমন: সকালের ক্যাশ ফান্ড' : 'e.g. Morning float'}
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCashInOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check size={18} />
                  <span>{isBengali ? 'জমা নিশ্চিত করুন' : 'Confirm Deposit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Spacious Widescreen bKash Cash Out Modal ── */}
      {isCashOutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <MinusCircle size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isBengali ? 'ক্যাশ আউট / খরচ কর্তন' : 'Cash Out / Expense'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'দোকান খরচ, ভাড়া বা ব্যক্তিগত খরচের হিসাব লিপিবদ্ধ করুন' : 'Deduct expense from cash drawer or wallet'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCashOutOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCashOutSubmit} className="space-y-4">
              {/* Source Wallet Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isBengali ? 'কোন ওয়ালেট থেকে খরচ করবেন?' : 'Source Wallet / Account'}
                </label>
                <select
                  value={cashOutWallet}
                  onChange={(e) => setCashOutWallet(e.target.value)}
                  className="w-full text-xs font-bold p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                >
                  <optgroup label={isBengali ? '💵 নগদ ক্যাশ' : 'Physical Cash'}>
                    {cashRegisters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (ব্যালেন্স: ৳{poishaToTaka(r.balancePoisha || 0)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={isBengali ? '📱 মোবাইল ব্যাংকিং (MFS)' : 'Mobile Banking (MFS)'}>
                    {mfsRegisters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (ব্যালেন্স: ৳{poishaToTaka(r.balancePoisha || 0)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={isBengali ? '🏦 বাণিজ্যিক ব্যাংক হিসাবসমূহ' : 'Commercial Banks'}>
                    {bankRegisters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (ব্যালেন্স: ৳{poishaToTaka(r.balancePoisha || 0)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Amount Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isBengali ? 'টাকার পরিমাণ (টাকা)' : 'Amount (BDT)'} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 border-rose-200 bg-rose-50/30 focus-within:border-rose-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-100 transition">
                  <span className="text-2xl font-black text-rose-600 select-none shrink-0">৳</span>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-2xl font-black text-rose-700 bg-transparent focus:outline-none tabular-nums"
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAdd(amt, setCashOutAmount, cashOutAmount)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 text-xs font-bold transition cursor-pointer border border-slate-200/80 active:scale-95"
                    >
                      +{formatNumber(amt)}
                    </button>
                  ))}
                  {cashOutAmount && (
                    <button
                      type="button"
                      onClick={() => setCashOutAmount('')}
                      className="px-2 py-1 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      {isBengali ? 'ক্লিয়ার' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isBengali ? 'খরচের খাত' : 'Expense Category'}
                  </label>
                  <select
                    value={cashOutCat}
                    onChange={(e) => setCashOutCat(e.target.value)}
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                  >
                    <option value="দোকান খরচ">{isBengali ? 'সাধারণ দোকান খরচ' : 'General Expense'}</option>
                    <option value="দোকান ভাড়া">{isBengali ? 'দোকান ভাড়া' : 'Shop Rent'}</option>
                    <option value="বিদ্যুৎ বিল">{isBengali ? 'বিদ্যুৎ / ইউটিলিটি বিল' : 'Electricity/Utility'}</option>
                    <option value="নাস্তা ও আপ্যায়ন">{isBengali ? 'নাস্তা ও আপ্যায়ন' : 'Tea & Entertainment'}</option>
                    <option value="কর্মচারী বেতন">{isBengali ? 'কর্মচারী বেতন / হাজিরা' : 'Staff Salary'}</option>
                    <option value="পরিবহন">{isBengali ? 'ভ্যান / পরিবহন ভাড়া' : 'Transport'}</option>
                    <option value="মালিকের উত্তোলন">{isBengali ? 'মালিকের ব্যক্তিগত উত্তোলন' : 'Owner Drawing'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isBengali ? 'বিবরণ / নোট' : 'Note'}
                  </label>
                  <input
                    type="text"
                    value={cashOutNote}
                    onChange={(e) => setCashOutNote(e.target.value)}
                    placeholder={isBengali ? 'যেমন: চা ও বিস্কুট বিল' : 'e.g. Tea & snacks'}
                    className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-rose-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCashOutOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-md shadow-rose-600/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check size={18} />
                  <span>{isBengali ? 'খরচ নিশ্চিত করুন' : 'Confirm Expense'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Spacious Widescreen bKash Fund Transfer Modal ── */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <ArrowRightLeft size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isBengali ? 'ওয়ালেট ফান্ড স্থানান্তর' : 'Wallet Funds Transfer'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'ক্যাশ থেকে ব্যাংক, ব্যাংক থেকে ক্যাশ বা বিকাশে টাকা সরানো' : 'Move money between Cash Drawer, bKash & Bank'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsTransferOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'উৎস ওয়ালেট (টাকা যাবে কোথা থেকে?)' : 'From Wallet'}
                  </label>
                  <select
                    value={xferFrom}
                    onChange={(e) => setXferFrom(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  >
                    <optgroup label={isBengali ? '💵 নগদ ক্যাশ' : 'Physical Cash'}>
                      {cashRegisters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (৳{poishaToTaka(r.balancePoisha || 0)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={isBengali ? '📱 মোবাইল ব্যাংকিং (MFS)' : 'Mobile Banking (MFS)'}>
                      {mfsRegisters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (৳{poishaToTaka(r.balancePoisha || 0)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={isBengali ? '🏦 বাণিজ্যিক ব্যাংক হিসাবসমূহ' : 'Commercial Banks'}>
                      {bankRegisters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (৳{poishaToTaka(r.balancePoisha || 0)})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'গন্তব্য ওয়ালেট (টাকা জমা হবে কোথায়?)' : 'To Wallet'}
                  </label>
                  <select
                    value={xferTo}
                    onChange={(e) => setXferTo(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  >
                    <optgroup label={isBengali ? '🏦 বাণিজ্যিক ব্যাংক হিসাবসমূহ' : 'Commercial Banks'}>
                      {bankRegisters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (৳{poishaToTaka(r.balancePoisha || 0)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={isBengali ? '📱 মোবাইল ব্যাংকিং (MFS)' : 'Mobile Banking (MFS)'}>
                      {mfsRegisters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (৳{poishaToTaka(r.balancePoisha || 0)})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={isBengali ? '💵 নগদ ক্যাশ' : 'Physical Cash'}>
                      {cashRegisters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (৳{poishaToTaka(r.balancePoisha || 0)})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Amount Box */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isBengali ? 'স্থানান্তরের পরিমাণ (টাকা)' : 'Transfer Amount (BDT)'} <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition">
                  <span className="text-2xl font-black text-indigo-600 select-none shrink-0">৳</span>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    value={xferAmount}
                    onChange={(e) => setXferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-2xl font-black text-indigo-700 bg-transparent focus:outline-none tabular-nums"
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAdd(amt, setXferAmount, xferAmount)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 text-xs font-bold transition cursor-pointer border border-slate-200/80 active:scale-95"
                    >
                      +{formatNumber(amt)}
                    </button>
                  ))}
                  {xferAmount && (
                    <button
                      type="button"
                      onClick={() => setXferAmount('')}
                      className="px-2 py-1 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      {isBengali ? 'ক্লিয়ার' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBengali ? 'নোট / বিবরণ' : 'Note'}
                </label>
                <input
                  type="text"
                  value={xferNote}
                  onChange={(e) => setXferNote(e.target.value)}
                  placeholder={isBengali ? 'যেমন: সোনালী ব্যাংকে নগদ জমা' : 'e.g. Bank deposit slip #882'}
                  className="w-full text-xs font-semibold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check size={18} />
                  <span>{isBengali ? 'স্থানান্তর সম্পন্ন করুন' : 'Complete Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add New MFS Wallet Modal ── */}
      {isAddMfsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-pink-100 text-[#E2136E] flex items-center justify-center">
                  <Smartphone size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isBengali ? 'নতুন মোবাইল ব্যাংকিং ওয়ালেট যুক্ত করুন' : 'Add New MFS Wallet'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'বিকাশ, নগদ, রকেট, সেলফিন বা উপায় ওয়ালেট যুক্ত করুন' : 'Add bKash, Nagad, Rocket, CellFin, or Upay wallet'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddMfsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMfsSubmit} className="space-y-4">
              {/* Provider Selection Cards */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  {isBengali ? 'এমএফএস প্রোভাইডার নির্বাচন করুন' : 'Select MFS Provider'} <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'BKASH', label: 'বিকাশ', sub: 'bKash', color: 'border-pink-500 bg-pink-50 text-[#E2136E]', icon: '🌸' },
                    { id: 'NAGAD', label: 'নগদ', sub: 'Nagad', color: 'border-orange-500 bg-orange-50 text-[#F7941D]', icon: '🟠' },
                    { id: 'ROCKET', label: 'রকেট', sub: 'Rocket', color: 'border-purple-500 bg-purple-50 text-[#8C3494]', icon: '🟣' },
                    { id: 'CELLFIN', label: 'সেলফিন', sub: 'CellFin', color: 'border-emerald-500 bg-emerald-50 text-[#008037]', icon: '🟢' },
                    { id: 'UPAY', label: 'উপায়', sub: 'Upay', color: 'border-blue-500 bg-blue-50 text-[#004899]', icon: '🔵' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNewMfsProvider(p.id)}
                      className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center transition cursor-pointer ${
                        newMfsProvider === p.id 
                          ? `${p.color} shadow-xs font-black` 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-lg mb-0.5">{p.icon}</span>
                      <span className="text-xs font-black leading-tight">{p.label}</span>
                      <span className="text-[10px] opacity-70">{p.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isBengali ? 'মোবাইল / ওয়ালেট নম্বর' : 'Wallet / Mobile Number'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={newMfsNumber}
                  onChange={(e) => setNewMfsNumber(e.target.value)}
                  className="w-full text-base font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-pink-500 focus:bg-white transition tracking-wider font-mono"
                />
              </div>

              {/* Wallet Type & Initial Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'হিসাবের ধরণ' : 'Account Type'}
                  </label>
                  <select
                    value={newMfsType}
                    onChange={(e) => setNewMfsType(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-pink-500 focus:bg-white transition"
                  >
                    <option value="মার্চেন্ট (Merchant)">মার্চেন্ট একাউন্ট (Merchant)</option>
                    <option value="পার্সোনাল রিটেইল (PR / Agent)">পার্সোনাল রিটেইল (PR / Agent)</option>
                    <option value="পার্সোনাল (Personal)">পার্সোনাল (Personal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'বর্তমান প্রারম্ভিক ব্যালেন্স (ঐচ্ছিক)' : 'Opening Balance (BDT)'}
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-pink-500 focus-within:bg-white transition">
                    <span className="font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={newMfsBalanceTaka}
                      onChange={(e) => setNewMfsBalanceTaka(e.target.value)}
                      className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddMfsOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] shadow-md shadow-pink-600/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check size={18} />
                  <span>{isBengali ? 'ওয়ালেট যুক্ত করুন' : 'Save Wallet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add New Bank Account Modal ── */}
      {isAddBankOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Landmark size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isBengali ? 'নতুন ব্যাংক একাউন্ট যুক্ত করুন' : 'Add New Bank Account'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'দোকানের বাণিজ্যিক বা চলতি ব্যাংক হিসাব সংরক্ষণ করুন' : 'Add commercial or business current account'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddBankOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBankSubmit} className="space-y-4">
              {/* Bank Name Dropdown */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {isBengali ? 'ব্যাংকের নাম' : 'Bank Name'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full text-xs font-bold p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                >
                  <option value="ইসলামী ব্যাংক বাংলাদেশ পিএলসি (IBBL)">ইসলামী ব্যাংক বাংলাদেশ পিএলসি (IBBL)</option>
                  <option value="ডাচ-বাংলা ব্যাংক লিমিটেড (DBBL)">ডাচ-বাংলা ব্যাংক লিমিটেড (DBBL)</option>
                  <option value="ব্র্যাক ব্যাংক পিএলসি (BRAC Bank)">ব্র্যাক ব্যাংক পিএলসি (BRAC Bank)</option>
                  <option value="দ্য সিটি ব্যাংক পিএলসি (City Bank)">দ্য সিটি ব্যাংক পিএলসি (City Bank)</option>
                  <option value="ইস্টার্ন ব্যাংক পিএলসি (EBL)">ইস্টার্ন ব্যাংক পিএলসি (EBL)</option>
                  <option value="সোনালী ব্যাংক পিএলসি (Sonali Bank)">সোনালী ব্যাংক পিএলসি (Sonali Bank)</option>
                  <option value="পূবালী ব্যাংক পিএলসি (Pubali Bank)">পূবালী ব্যাংক পিএলসি (Pubali Bank)</option>
                  <option value="মিউচুয়াল ট্রাস্ট ব্যাংক (MTB)">মিউচুয়াল ট্রাস্ট ব্যাংক (MTB)</option>
                  <option value="ইউনাইটেড কমার্শিয়াল ব্যাংক (UCB)">ইউনাইটেড কমার্শিয়াল ব্যাংক (UCB)</option>
                  <option value="OTHER">অন্যান্য ব্যাংক (Other Custom Bank)...</option>
                </select>
              </div>

              {/* Custom Bank Name if OTHER */}
              {newBankName === 'OTHER' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'অন্যান্য ব্যাংকের নাম লিখুন' : 'Custom Bank Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isBengali ? 'যেমন: প্রাইম ব্যাংক লিমিটেড' : 'e.g. Prime Bank Ltd'}
                    value={newBankCustomName}
                    onChange={(e) => setNewBankCustomName(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              )}

              {/* Account Number & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'হিসাব নম্বর (Account No)' : 'Account Number'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="২০৫০ ১২৩৪ ৫৬৭৮..."
                    value={newBankAccNo}
                    onChange={(e) => setNewBankAccNo(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'শাখার নাম (Branch)' : 'Branch Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={isBengali ? 'দিলকুশা / লোকাল শাখা' : 'Local Branch'}
                    value={newBankBranch}
                    onChange={(e) => setNewBankBranch(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Account Type & Initial Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'হিসাবের ধরণ' : 'Account Type'}
                  </label>
                  <select
                    value={newBankType}
                    onChange={(e) => setNewBankType(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  >
                    <option value="চলতি হিসাব (Current)">চলতি হিসাব (Current)</option>
                    <option value="সঞ্চয়ী হিসাব (Savings)">সঞ্চয়ী হিসাব (Savings)</option>
                    <option value="এসএমই / ঋণ হিসাব (SME / CC)">এসএমই / সিসি ঋণ হিসাব (SME/CC)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'বর্তমান প্রারম্ভিক ব্যালেন্স (টাকা)' : 'Opening Balance (BDT)'}
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition">
                    <span className="font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={newBankBalanceTaka}
                      onChange={(e) => setNewBankBalanceTaka(e.target.value)}
                      className="w-full text-sm font-bold text-slate-800 bg-transparent focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBankOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check size={18} />
                  <span>{isBengali ? 'হিসাব যুক্ত করুন' : 'Save Bank Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Blind Day-Close Modal (Spacious bKash Verification Dialog) ── */}
      {isBlindCloseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-6 sm:p-7 text-slate-800 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <ShieldCheck size={22} className="text-emerald-400" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {isBengali ? 'দিনের হিসাব ক্লোজ (ব্লাইন্ড কাউন্ট)' : 'Blind Cash Drawer Count'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isBengali ? 'ক্যাশ ড্রয়ারের নোট গুনে লিখুন, সিস্টেম সত্যতা যাচাই করবে' : 'Count drawer cash physically, system audits match'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsBlindCloseOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {!blindCloseReport ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    {isBengali ? 'গণনাকৃত ক্যাশের মোট পরিমাণ (টাকা):' : 'Counted Physical Cash (BDT):'}
                  </label>
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/50 focus-within:border-[#E2136E] focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-100 transition">
                  <span className="text-2xl font-black text-[#E2136E] select-none shrink-0">৳</span>
                  <input
                    type="number"
                    step="any"
                    autoFocus
                    value={countedCashTaka}
                    onChange={(e) => setCountedCashTaka(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-2xl font-black text-slate-900 bg-transparent focus:outline-none tabular-nums"
                  />
                </div>

                  {/* Quick Add Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {[500, 1000, 5000, 10000, 50000, 100000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAdd(amt, setCountedCashTaka, countedCashTaka)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-[#E2136E] text-xs font-bold transition cursor-pointer border border-slate-200/80 active:scale-95"
                      >
                        +{formatNumber(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBlindCloseOpen(false)}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
                  >
                    {t('btn_cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleBlindCloseSubmit}
                    disabled={!countedCashTaka}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-900/20 transition cursor-pointer active:scale-95 disabled:opacity-40"
                  >
                    {isBengali ? 'যাচাই ও ক্লোজ করুন' : 'Verify & Close'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center animate-in zoom-in-95">
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-sm ${
                    blindCloseReport.isExactMatch ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}
                >
                  {blindCloseReport.isExactMatch ? <Check size={32} /> : <AlertCircle size={32} />}
                </div>

                <h4 className="font-black text-lg text-slate-900">
                  {blindCloseReport.isExactMatch
                    ? (isBengali ? 'হিসাব শতভাগ সম্পূর্ণ মিলেছে!' : 'Balanced Perfectly!')
                    : (isBengali ? 'ক্যাশ অমিল পাওয়া গেছে!' : 'Discrepancy Detected!')}
                </h4>

                <div className="p-4 rounded-2xl bg-slate-50 text-xs sm:text-sm space-y-2 my-4 text-left border border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{isBengali ? 'আপনার গণনা:' : 'Counted:'}</span>
                    <span className="font-extrabold tabular-nums text-slate-800">৳ {poishaToTaka(blindCloseReport.countedPoisha)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{isBengali ? 'সিস্টেম হিসাব:' : 'Expected:'}</span>
                    <span className="font-extrabold tabular-nums text-slate-800">৳ {poishaToTaka(blindCloseReport.expectedPoisha)}</span>
                  </div>
                  <div className="flex justify-between font-black pt-2 border-t border-slate-200 text-sm">
                    <span>{isBengali ? 'পার্থক্য / অমিল:' : 'Variance:'}</span>
                    <span className={blindCloseReport.variancePoisha >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      ৳ {poishaToTaka(blindCloseReport.variancePoisha)}
                    </span>
                  </div>
                </div>

                {!blindCloseReport.isExactMatch ? (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleApplyAdjustment}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-black shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      <span>{isBengali ? 'হিসাব সমন্বয় ও ক্লোজ করুন' : 'Post Adjustment & Reconcile'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBlindCloseOpen(false)}
                      className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
                    >
                      {isBengali ? 'সমন্বয় ছাড়া বন্ধ করুন' : 'Close Without Adjustment'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsBlindCloseOpen(false)}
                    className="w-full py-3.5 rounded-2xl bg-[#E2136E] hover:bg-[#c0105d] text-white text-xs sm:text-sm font-bold shadow-md shadow-pink-600/20 transition cursor-pointer"
                  >
                    {isBengali ? 'ঠিক আছে' : 'Done'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
