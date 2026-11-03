import React, { useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { AlertTriangle, Calendar, Plus, X, CheckCircle, Clock } from 'lucide-react';

export default function BatchExpiryModal({ product, isOpen, onClose, onAddBatch }) {
  const { isBengali, formatNumber } = useLocale();

  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!batchNo || !expiryDate || !quantity) return;

    onAddBatch(product.id, {
      batchNo,
      expiryDate,
      quantity: parseFloat(quantity) || 0,
    });

    setBatchNo('');
    setExpiryDate('');
    setQuantity('');
  };

  const batches = product.batches || [
    { batchNo: 'B-902', expiryDate: '2026-11-20', quantity: 24 },
    { batchNo: 'B-841', expiryDate: '2026-10-30', quantity: 8 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col max-h-[88vh] overflow-hidden border border-slate-100 animate-in zoom-in-95">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-pink-50 via-purple-50/50 to-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#E2136E]/15 text-[#E2136E] flex items-center justify-center font-black shadow-sm">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {isBengali ? `${product.name} - ব্যাচ ও মেয়াদোত্তীর্ণ ট্র্যাকিং (FEFO)` : `Batch & Expiry: ${product.name}`}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isBengali ? 'ফার্মেসি ও পচনশীল পণ্যের ডেট-ফেল রোধ ব্যবস্থা' : 'First-Expired, First-Out (FEFO) Lot Management'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Existing Batches List */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-5">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              {isBengali ? 'বিদ্যমান ব্যাচ তালিকা:' : 'Active Batches in Stock:'}
            </h4>

            <div className="space-y-2.5">
              {batches.map((b, idx) => {
                const daysLeft = Math.ceil((new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isExpired = daysLeft <= 0;
                const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isExpired
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : isExpiringSoon
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200/90 text-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-black text-sm block">ব্যাচ: {b.batchNo}</span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-1">
                        <Calendar size={14} className="text-slate-400" />
                        {isBengali ? 'মেয়াদ:' : 'Exp:'} {b.expiryDate}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-base block tabular-nums">
                        {formatNumber(b.quantity)} {product.unit || 'পিস'}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-black mt-1 ${
                          isExpired
                            ? 'bg-rose-200/90 text-rose-900'
                            : isExpiringSoon
                            ? 'bg-amber-200/90 text-amber-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isExpired
                          ? isBengali
                            ? 'মেয়াদ শেষ!'
                            : 'EXPIRED'
                          : isExpiringSoon
                          ? isBengali
                            ? `আর ${formatNumber(daysLeft)} দিন বাকি`
                            : `${daysLeft} days left`
                          : isBengali
                          ? 'নিরাপদ'
                          : 'Safe'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Batch Form */}
          <form onSubmit={handleSubmit} className="pt-5 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              {isBengali ? 'নতুন ব্যাচ ইনটেক যোগ করুন:' : 'Intake New Batch:'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ব্যাচ নম্বর</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B-990"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#E2136E] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">মেয়াদোত্তীর্ণ তারিখ</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#E2136E] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">পরিমাণ ({product.unit || 'পিস'})</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#E2136E] focus:bg-white transition tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c0105d] hover:to-[#900c45] transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>{isBengali ? 'ব্যাচ ইনপুট সংরক্ষণ করুন' : 'Record Batch'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
