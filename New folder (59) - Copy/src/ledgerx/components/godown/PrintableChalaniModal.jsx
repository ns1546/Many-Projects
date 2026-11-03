import React, { useRef } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency, poishaToTaka } from '../../utils/currency';
import { Printer, X, CheckCircle2, Truck, FileText } from 'lucide-react';

export default function PrintableChalaniModal({ isOpen, onClose, chalan }) {
  const { activeTenant } = useTenant();
  const { isBengali } = useLocale();
  const printRef = useRef(null);

  if (!isOpen || !chalan) return null;

  const handlePrint = () => {
    window.print();
  };

  const renderSingleChalanCopy = (copyTitleBn, copyTitleEn, showCutLine = true) => {
    return (
      <div className="chalan-copy-sheet pb-4 mb-4 page-break-inside-avoid">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
              বাণিজ্যিক চালান ও পরিবহন সরবরাহপত্র
            </span>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {activeTenant.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {activeTenant.address} • ফোন: {activeTenant.phone}
            </p>
            {activeTenant.vatBinNumber && (
              <p className="text-[11px] font-mono text-slate-700 font-bold">
                মূসক নিবন্ধন / BIN: {activeTenant.vatBinNumber}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-wider mb-1">
              {isBengali ? copyTitleBn : copyTitleEn}
            </span>
            <div className="text-xs font-mono font-bold text-slate-900">
              চালান নং: <span className="text-slate-900 font-black">{chalan.chalanNumber}</span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              ইস্যুর তারিখ: {chalan.date || new Date().toISOString().slice(0, 10)}
            </div>
          </div>
        </div>

        {/* Consignee & Transport Grid */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-3">
          <div>
            <span className="font-bold text-slate-500 block text-[10px] uppercase">
              {isBengali ? 'প্রাপক / ক্রেতার নাম ও গন্তব্য' : 'Consignee / Receiver & Destination'}
            </span>
            <p className="font-extrabold text-slate-900 text-sm mt-0.5">
              {chalan.receiverName || 'নগদ ক্রেতা'}
            </p>
            {chalan.receiverPhone && (
              <p className="text-slate-600 font-mono">{chalan.receiverPhone}</p>
            )}
            <p className="text-slate-600 font-medium mt-0.5">
              গন্তব্য: {chalan.destination || 'কাউন্টার ডেলিভারি / লোকাল'}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-500 block text-[10px] uppercase">
              {isBengali ? 'পরিবহন ও নিরাপত্তা গেটপাস বিবরণ' : 'Transport & Security Gate Pass'}
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 mt-1">
              <div><span className="text-slate-500">যানবাহন:</span> <strong>{chalan.vehicleType || 'পিকআপ'}</strong></div>
              <div><span className="text-slate-500">গাড়ি নং:</span> <strong className="font-mono">{chalan.vehicleNumber || '—'}</strong></div>
              <div><span className="text-slate-500">চালক:</span> <strong>{chalan.driverName || '—'}</strong></div>
              <div><span className="text-slate-500">গেটপাস:</span> <strong className="font-mono text-slate-900">{chalan.gatePassNumber || 'GP-101'}</strong></div>
            </div>
          </div>
        </div>

        {/* Product Details Table */}
        <table className="w-full text-xs text-left border-collapse mb-4">
          <thead>
            <tr className="bg-slate-200/90 text-slate-900 font-bold border-y-2 border-slate-800">
              <th className="py-2 px-2 text-center w-10">নং</th>
              <th className="py-2 px-3">পণ্যের বিবরণ ও মার্কা</th>
              <th className="py-2 px-3 text-center">প্যাকেট / বস্তা</th>
              <th className="py-2 px-3 text-right">নেট পরিমাণ / ওজন</th>
              <th className="py-2 px-3 text-right">দর (৳)</th>
              <th className="py-2 px-3 text-right">মোট মূল্য (৳)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {(chalan.items || []).map((item, idx) => (
              <tr key={idx} className="text-slate-800">
                <td className="py-2 px-2 text-center font-mono">{idx + 1}</td>
                <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                <td className="py-2 px-3 text-center font-bold">
                  {item.bagsCount || item.quantity || '—'} {item.unit || 'বস্তা'}
                </td>
                <td className="py-2 px-3 text-right font-mono font-bold">
                  {item.weightKg ? `${item.weightKg} কেজি` : `${item.quantity || 0} ${item.unit || 'একক'}`}
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  {item.ratePoisha ? poishaToTaka(item.ratePoisha).toFixed(2) : '—'}
                </td>
                <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                  {item.totalPoisha ? poishaToTaka(item.totalPoisha).toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-800 font-bold bg-slate-100">
              <td colSpan="2" className="py-2 px-3 text-right font-extrabold uppercase">
                {isBengali ? 'সর্বমোট চালান যোগফল:' : 'Grand Total:'}
              </td>
              <td className="py-2 px-3 text-center font-black">
                {chalan.totalBags || 0} বস্তা/প্যাক
              </td>
              <td className="py-2 px-3 text-right font-mono font-black">
                {chalan.totalWeightKg ? `${chalan.totalWeightKg} কেজি` : '—'}
              </td>
              <td></td>
              <td className="py-2 px-3 text-right font-mono text-sm font-black text-slate-900">
                {formatCurrency(chalan.totalAmountPoisha || 0, isBengali)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* 4-Party Signatures Section */}
        <div className="grid grid-cols-4 gap-4 pt-6 text-center text-[10.5px]">
          <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-800">
            {isBengali ? 'প্রস্তুতকারী / গুদাম ইনচার্জ' : 'Godown In-Charge'}
          </div>
          <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-800">
            {isBengali ? 'পরিবহন চালকের স্বাক্ষর' : "Driver's Signature"}
          </div>
          <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-800">
            {isBengali ? 'নিরাপত্তা গেটপাস অফিসার' : 'Gate Pass Security'}
          </div>
          <div className="border-t border-slate-500 pt-1.5 font-bold text-slate-800">
            {isBengali ? 'গ্রহীতার স্বাক্ষর ও সিল' : "Receiver's Signature & Seal"}
          </div>
        </div>

        {showCutLine && (
          <div className="my-6 border-b-2 border-dashed border-slate-300 relative text-center">
            <span className="bg-white px-3 text-slate-400 font-mono text-[10px] relative -top-2">
              ✂ — — — — — — — — — — — — — — কাটার দাগ (CUT HERE) — — — — — — — — — — — — — — ✂
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Controls Header (Non-printable) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">
                {isBengali ? '৩-কপি ডেলিভারি চালান প্রিন্ট ভিউ' : '3-Copy Delivery Chalani Print Preview'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {chalan.chalanNumber} • {chalan.receiverName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md shadow-slate-900/30 border border-slate-700 active:scale-95"
            >
              <Printer size={16} />
              <span>{isBengali ? 'চালান প্রিন্ট করুন (Ctrl+P)' : 'Print Chalani'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100 custom-scrollbar">
          <div 
            ref={printRef}
            className="bg-white p-8 max-w-3xl mx-auto shadow-md rounded-2xl border border-slate-300 text-slate-900 printable-chalani-canvas"
          >
            {/* 1st Copy: Customer Copy */}
            {renderSingleChalanCopy('১ম কপি: ক্রেতা / গ্রহীতার কপি', '1st Copy: Consignee / Customer Copy')}

            {/* 2nd Copy: Godown & Gate Pass Copy */}
            {renderSingleChalanCopy('২য় কপি: গুদাম ও গেটপাস কপি', '2nd Copy: Godown & Gate Pass Copy')}

            {/* 3rd Copy: Office / Accounts Copy */}
            {renderSingleChalanCopy('৩য় কপি: হিসাব ও অফিস রেকর্ড কপি', '3rd Copy: Office / Accounts Copy', '')}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium print:hidden">
          <p>
            ✅ প্রতিটি চালানে ক্রেতা কপি, গুদাম গেটপাস ও অফিস কপি সমন্বিত রয়েছে।
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
