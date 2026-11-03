import React, { useState, useEffect, useRef } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency, poishaToTaka, takaToPoisha } from '../../utils/currency';
import { buildDueReminderMessage, openWhatsAppDirect } from '../../utils/whatsapp';
import { voicebox, parseBengaliSpokenAmount } from '../../utils/bengaliVoicebox';
import toast from 'react-hot-toast';
import SearchableCustomerSelect from '../common/SearchableCustomerSelect';
import {
  X,
  Check,
  User,
  DollarSign,
  FileText,
  Phone,
  Plus,
  Mic,
  MicOff,
  MessageCircle,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  ShoppingBag,
  Wallet
} from 'lucide-react';

export default function QuickTransactionModal({ isOpen, onClose, initialType = 'PABO', defaultCustomerId = null }) {
  const { customers, addCustomer, recordPabo, recordDibo, recordCashOut, recordCashIn, registers } = useKhata();
  const { activeTenant } = useTenant();
  const { isBengali } = useLocale();

  const [type, setType] = useState(initialType); // 'PABO' | 'DIBO' | 'EXPENSE' | 'SALE'
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustomerId || '');
  const [amountTaka, setAmountTaka] = useState('');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState('cash_drawer');
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  // Quick Customer Creation
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setSelectedCustomerId(defaultCustomerId || (customers[0]?.id || ''));
      setAmountTaka('');
      setDescription('');
      setIsAddingNewCustomer(false);
    }
  }, [isOpen, initialType, defaultCustomerId, customers]);

  if (!isOpen) return null;

  const quickAmounts = [50, 100, 200, 500, 1000, 2000, 5000];
  const expenseCategories = ['চা-নাস্তা', 'দোকান ভাড়া', 'বিদ্যুৎ বিল', 'কর্মচারীর বেতন', 'যাতায়াত', 'কাঁচামাল ক্রয়', 'মেরামত ও অন্যান্য'];

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // 1-Tap Quick Amount Addition
  const handleQuickAmount = (val) => {
    const current = parseFloat(amountTaka) || 0;
    setAmountTaka(String(current + val));
  };

  // Voice speech-to-text
  const toggleVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(isBengali ? 'আপনার ব্রাউজারে ভয়েস সাপোর্ট নেই।' : 'Voice recognition not supported');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'bn-BD';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        // Extract numbers from Bengali/English speech transcript
        const parsedAmt = parseBengaliSpokenAmount(transcript);
        if (parsedAmt) {
          setAmountTaka(String(parsedAmt));
        }
        setDescription(transcript);
        toast.success(`ভয়েস রিকগনিশন: "${transcript}"`, { icon: '🎙️' });
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } catch (e) {
      setIsListening(false);
      console.warn('Voice recognition error:', e);
    }
  };

  const handleSave = () => {
    const amt = parseFloat(amountTaka);
    if (!amt || amt <= 0) {
      toast.error(isBengali ? 'সঠিক টাকার পরিমাণ লিখুন!' : 'Please enter a valid amount!');
      return;
    }

    const amountPoisha = takaToPoisha(amt);

    // 1. Handle New Customer Creation inline if active
    let targetCustomerId = selectedCustomerId;
    if (isAddingNewCustomer && newCustomerName.trim()) {
      const created = addCustomer({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
        initialDuePoisha: 0,
        address: 'দোকান গ্রাহক',
      });
      targetCustomerId = created.id;
    }

    if (type === 'PABO') {
      if (!targetCustomerId) {
        toast.error(isBengali ? 'কাস্টমার নির্বাচন করুন!' : 'Select a customer!');
        return;
      }
      recordPabo({
        customerId: targetCustomerId,
        amountPoisha,
        walletId,
        description: description || 'নগদ পাওনা আদায়',
      });
      onClose();
    } else if (type === 'DIBO') {
      if (!targetCustomerId) {
        toast.error(isBengali ? 'কাস্টমার নির্বাচন করুন!' : 'Select a customer!');
        return;
      }
      recordDibo({
        customerId: targetCustomerId,
        amountPoisha,
        description: description || 'বাকিতে পণ্য প্রদান',
      });

      // Optional WhatsApp Reminder
      if (sendWhatsApp && selectedCustomer?.phone) {
        const newDue = (selectedCustomer.currentDuePoisha || 0) + amountPoisha;
        const msg = buildDueReminderMessage({
          customerName: selectedCustomer.name,
          shopName: activeTenant?.name,
          dueAmountTaka: poishaToTaka(newDue),
          bKashNumber: activeTenant?.bKashMerchantNumber,
        });
        openWhatsAppDirect(selectedCustomer.phone, msg);
      }
      onClose();
    } else if (type === 'EXPENSE') {
      recordCashOut({
        walletId,
        amountPoisha,
        category: description || 'দোকান খরচ',
        note: description || 'দৈনন্দিন খরচ',
      });
      voicebox.speak(`${poishaToTaka(amountPoisha)} টাকা খরচ লেখা হয়েছে।`);
      onClose();
    } else if (type === 'SALE') {
      // Direct Cash Sale
      recordCashIn({
        walletId,
        amountPoisha,
        category: 'নগদ বিক্রি',
        note: description || 'সহজ নগদ বিক্রয় মেমো',
      });
      voicebox.announceSale(amt);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Type Selector */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-black text-slate-800">
              {isBengali ? 'দ্রুত হিসাব এন্ট্রি (সহজ খাতা)' : 'Quick Khata Entry'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 4 Action Pills */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-100/50 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setType('PABO')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              type === 'PABO'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowDownLeft size={16} />
            <span>{isBengali ? 'টাকা পেলাম' : 'Cash In'}</span>
          </button>

          <button
            type="button"
            onClick={() => setType('DIBO')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              type === 'DIBO'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowUpRight size={16} />
            <span>{isBengali ? 'বাকি দিলাম' : 'Give Credit'}</span>
          </button>

          <button
            type="button"
            onClick={() => setType('SALE')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              type === 'SALE'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag size={16} />
            <span>{isBengali ? 'নগদ বিক্রি' : 'Quick Sale'}</span>
          </button>

          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
              type === 'EXPENSE'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingDown size={16} />
            <span>{isBengali ? 'দোকান খরচ' : 'Expense'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* 1. Customer Selector (For PABO & DIBO) */}
          {(type === 'PABO' || type === 'DIBO') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-slate-500" />
                  <span>{isBengali ? 'কাস্টমার নির্বাচন করুন' : 'Select Customer'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                  className="text-xs font-bold text-[#E2136E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{isAddingNewCustomer ? (isBengali ? 'তালিকা থেকে বেছে নিন' : 'Choose existing') : (isBengali ? '+ নতুন কাস্টমার' : '+ New Customer')}</span>
                </button>
              </div>

              {isAddingNewCustomer ? (
                <div className="grid grid-cols-2 gap-2 p-3 bg-pink-50/50 rounded-2xl border border-pink-100">
                  <input
                    type="text"
                    placeholder={isBengali ? 'কাস্টমারের নাম' : 'Customer Name'}
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#E2136E] focus:outline-hidden font-bold"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder={isBengali ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Mobile (optional)'}
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#E2136E] focus:outline-hidden"
                  />
                </div>
              ) : (
                <SearchableCustomerSelect
                  customers={customers}
                  value={selectedCustomerId}
                  onChange={(id) => setSelectedCustomerId(id)}
                  placeholder={isBengali ? '-- কাস্টমার বাছাই বা সার্চ করুন --' : '-- Search or Choose Customer --'}
                  isBengali={isBengali}
                />
              )}

              {/* Selected Customer Current Status Pill */}
              {selectedCustomer && !isAddingNewCustomer && (
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-slate-500 font-medium">{isBengali ? 'বর্তমান বকেয়া পাওনা:' : 'Current Due:'}</span>
                  <span className={`font-black ${selectedCustomer.currentDuePoisha > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ৳ {poishaToTaka(selectedCustomer.currentDuePoisha || 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 2. Amount Input (Large Tactile Numpad Feel) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-slate-500" />
                <span>{isBengali ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'}</span>
              </span>
              <button
                type="button"
                onClick={toggleVoiceRecognition}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold cursor-pointer transition ${
                  isListening ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                <span>{isListening ? (isBengali ? 'শুনছি...' : 'Listening...') : (isBengali ? 'মুখে বলুন' : 'Voice')}</span>
              </button>
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">
                ৳
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={amountTaka}
                onChange={(e) => setAmountTaka(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-3xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-3xl focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-inner"
                autoFocus={type === 'SALE' || type === 'EXPENSE'}
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickAmount(q)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition cursor-pointer active:scale-95 border border-slate-200/80"
                >
                  +{q}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountTaka('')}
                className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition cursor-pointer"
              >
                {isBengali ? 'ক্লিয়ার' : 'Clear'}
              </button>
            </div>
          </div>

          {/* 3. Description / Reason / Category Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-slate-500" />
              <span>{isBengali ? 'বিবরণ বা নোট' : 'Note / Reason'}</span>
            </label>

            {type === 'EXPENSE' ? (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {expenseCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDescription(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      description === cat
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            ) : null}

            <input
              type="text"
              placeholder={
                type === 'PABO'
                  ? (isBengali ? 'যেমন: নগদ বাকি আদায়' : 'e.g. Cash Due Recovery')
                  : type === 'DIBO'
                  ? (isBengali ? 'যেমন: চাল, ডাল ও চিনি বাকি' : 'e.g. Rice & Sugar on credit')
                  : type === 'SALE'
                  ? (isBengali ? 'যেমন: সাধারণ নগদ বিক্রি' : 'e.g. Counter sale')
                  : (isBengali ? 'যেমন: দোকানের চা-নাস্তা' : 'e.g. Tea & snacks')
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition"
            />
          </div>

          {/* 4. Wallet Selection (For Cash In / Sale / Expense) */}
          {type !== 'DIBO' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet size={14} className="text-slate-500" />
                <span>{isBengali ? 'ক্যাশ বা ব্যাংক হিসাব' : 'Wallet Account'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalletId('cash_drawer')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                    walletId === 'cash_drawer'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{isBengali ? 'নগদ ক্যাশবাক্স' : 'Cash Drawer'}</span>
                  {walletId === 'cash_drawer' && <Check size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => setWalletId('bkash_merchant')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                    walletId === 'bkash_merchant'
                      ? 'border-[#E2136E] bg-pink-50 text-[#E2136E]'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{isBengali ? 'বিকাশ মার্চেন্ট' : 'bKash Merchant'}</span>
                  {walletId === 'bkash_merchant' && <Check size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* 5. WhatsApp Auto-Reminder Checkbox for Credit */}
          {type === 'DIBO' && selectedCustomer?.phone && (
            <label className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <MessageCircle size={16} className="text-emerald-600" />
                <span>{isBengali ? 'সেভ করার সাথে সাথে হোয়াটসঅ্যাপে বকেয়া তাগাদা পাঠান' : 'Send instant WhatsApp due reminder after save'}</span>
              </div>
            </label>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-200 transition cursor-pointer"
          >
            {isBengali ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`px-8 py-3 rounded-2xl text-white font-black text-sm shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95 ${
              type === 'PABO'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30 hover:shadow-emerald-500/50'
                : type === 'DIBO'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-500/30 hover:shadow-rose-500/50'
                : type === 'SALE'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/50'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/30 hover:shadow-purple-500/50'
            }`}
          >
            <Check size={18} />
            <span>{isBengali ? 'হিসাব সংরক্ষণ করুন (সেভ)' : 'Save Transaction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
