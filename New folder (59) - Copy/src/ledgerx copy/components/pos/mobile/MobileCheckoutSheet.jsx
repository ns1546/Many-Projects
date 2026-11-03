import React, { useState } from 'react';
import { formatCurrency, takaToPoisha, poishaToTaka } from '../../../utils/currency';
import { openWhatsAppDirect } from '../../../utils/whatsapp';
import { 
  X, 
  Check, 
  Smartphone, 
  Wallet, 
  CreditCard, 
  Clock, 
  Send, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  QrCode,
  User,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MobileCheckoutSheet({
  isOpen,
  onClose,
  cart = [],
  totals = {},
  customers = [],
  onCompleteSale,
  isBengali = true,
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' | 'BKASH' | 'DUE'
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  if (!isOpen) return null;

  const totalPoisha = totals.totalPoisha || 0;
  const totalTaka = poishaToTaka(totalPoisha);
  const tenderedNum = Number(tenderedAmount) || 0;
  const changeDueTaka = Math.max(0, tenderedNum - totalTaka);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const addQuickTender = (amt) => {
    setTenderedAmount((prev) => String((Number(prev) || 0) + amt));
  };

  const handleFinalizeSale = () => {
    if (paymentMethod === 'DUE' && !selectedCustomerId) {
      toast.error(isBengali ? 'দয়া করে বাকির জন্য খরিদ্দার নির্বাচন করুন' : 'Please select a customer for due sale');
      return;
    }

    const saleRecord = {
      id: `INV-MOB-${Date.now()}`,
      invoiceNo: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      cart,
      totals,
      paymentMethod,
      customer: selectedCustomer || { name: isBengali ? 'সাধারণ নগদ ক্রেতা' : 'Walk-in Cash Customer' },
      tenderedPoisha: takaToPoisha(tenderedNum || totalTaka),
      changePoisha: takaToPoisha(changeDueTaka),
    };

    setCompletedSale(saleRecord);
    setIsSuccessModal(true);

    if (onCompleteSale) {
      onCompleteSale(saleRecord);
    }
  };

  const handleWhatsAppShare = () => {
    if (!completedSale) return;
    const phone = completedSale.customer?.phone || '';
    const text = `*মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা*\nইনভয়েস: ${completedSale.invoiceNo}\nতারিখ: ${new Date().toLocaleDateString()}\n--------------------------\nমোট আইটেম: ${completedSale.cart.length} টি\n*সর্বমোট পরিশোধ: ৳${poishaToTaka(completedSale.totals.totalPoisha || 0)}*\nপেমেন্ট মোড: ${completedSale.paymentMethod}\nধন্যবাদ, আবার আসবেন!`;

    if (phone) {
      openWhatsAppDirect(phone, text);
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  const resetAndClose = () => {
    setIsSuccessModal(false);
    setCompletedSale(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Sheet Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isBengali ? 'মোবাইল ক্যাশ ও পেমেন্ট সেটেলমেন্ট' : 'Mobile POS Checkout'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {cart.length} {isBengali ? 'টি পণ্য কার্টে আছে' : 'items in cart'}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!isSuccessModal ? (
          <div className="p-4 overflow-y-auto space-y-4">
            {/* Total Payable Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white shadow-md">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block">
                {isBengali ? 'সর্বমোট প্রদেয় টাকা' : 'Total Payable Amount'}
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {formatCurrency(totalPoisha)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {isBengali ? 'পেমেন্ট মাধ্যম বেছে নিন' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Wallet className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">{isBengali ? 'নগদ ক্যাশ' : 'Cash'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BKASH')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'BKASH'
                      ? 'bg-pink-50 border-pink-500 text-pink-800 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <QrCode className="w-4 h-4 mx-auto mb-1 text-pink-600" />
                  <span className="text-xs block">{isBengali ? 'বিকাশ / MFS' : 'bKash/MFS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('DUE')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'DUE'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span className="text-xs block">{isBengali ? 'বাকির খাতা' : 'Due Khata'}</span>
                </button>
              </div>
            </div>

            {/* CASH Flow: Quick Tender Bills */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{isBengali ? 'নগদ গ্রহণ' : 'Tendered Cash'}</span>
                  <button
                    type="button"
                    onClick={() => setTenderedAmount(String(totalTaka))}
                    className="text-[11px] text-emerald-600 font-bold hover:underline"
                  >
                    {isBengali ? 'বরাবর পেয়েছি' : 'Exact Amount'}
                  </button>
                </div>
                <input
                  type="number"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  placeholder={`৳ ${totalTaka}`}
                  className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2">
                  {[100, 500, 1000].map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => addQuickTender(bill)}
                      className="flex-1 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700"
                    >
                      +৳{bill}
                    </button>
                  ))}
                </div>
                {changeDueTaka > 0 && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span>{isBengali ? 'খরিদ্দারকে ফেরত দিতে হবে:' : 'Change Return:'}</span>
                    <span className="text-sm">৳ {changeDueTaka.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* DUE Flow: Customer Picker */}
            {paymentMethod === 'DUE' && (
              <div className="space-y-2 p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                <label className="text-xs font-semibold text-amber-900 block">
                  {isBengali ? 'বাকি খরিদ্দার নির্বাচন করুন' : 'Select Customer for Credit'}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-amber-300 rounded-xl text-slate-800 focus:outline-none"
                >
                  <option value="">{isBengali ? '-- খরিদ্দার সিলেক্ট করুন --' : '-- Choose Customer --'}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || c.customerCode}) - পূর্বের বাকি: ৳{poishaToTaka(c.currentDuePoisha || 0)}
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <div className="text-[11px] text-amber-800 bg-amber-100/60 p-2 rounded-lg">
                    <span>{isBengali ? 'নতুন বাকি যোগ হবে:' : 'New Due Added:'} </span>
                    <strong className="text-amber-950 font-bold">৳ {totalTaka}</strong>
                  </div>
                )}
              </div>
            )}

            {/* BKASH Flow */}
            {paymentMethod === 'BKASH' && (
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-pink-600 text-white mx-auto flex items-center justify-center font-bold text-lg shadow-md">
                  bK
                </div>
                <p className="text-xs font-bold text-pink-900">
                  {isBengali ? 'বিকাশ মার্চেন্ট কিউআর' : 'bKash Merchant Pay'}
                </p>
                <p className="text-[11px] text-pink-700">
                  {isBengali ? `খরিদ্দারকে ৳${totalTaka} পেমেন্ট করতে বলুন` : `Ask customer to pay ৳${totalTaka}`}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Post-Sale Success Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {isBengali ? 'বিক্রয় সফলভাবে সম্পন্ন হয়েছে!' : 'Sale Recorded Successfully!'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ইনভয়েস: <span className="font-mono font-bold text-slate-800">{completedSale?.invoiceNo}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{isBengali ? 'পরিশোধিত টাকা' : 'Paid Amount'}</span>
                <span className="font-bold text-slate-900">{formatCurrency(totalPoisha)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{isBengali ? 'পেমেন্ট মাধ্যম' : 'Method'}</span>
                <span className="font-bold text-emerald-600">{completedSale?.paymentMethod}</span>
              </div>
            </div>

            {/* WhatsApp Share Button */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                {isBengali ? 'হোয়াটসঅ্যাপে ডিজিটাল মেমো পাঠান' : 'Share Receipt via WhatsApp'}
              </button>

              <button
                onClick={resetAndClose}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
              >
                {isBengali ? 'নতুন সেল শুরু করুন' : 'Start Next Sale'}
              </button>
            </div>
          </div>
        )}

        {/* Footer for Finalizing */}
        {!isSuccessModal && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={resetAndClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              onClick={handleFinalizeSale}
              className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isBengali ? 'বিল কনফার্ম করুন' : 'Confirm Sale'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
