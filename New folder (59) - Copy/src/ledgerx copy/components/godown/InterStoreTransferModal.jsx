import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useLocale } from '../../context/LocaleContext';
import { 
  ArrowRightLeft, 
  Warehouse, 
  Store, 
  X, 
  CheckCircle2, 
  Boxes,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterStoreTransferModal({ isOpen, onClose }) {
  const { godownStock, products, transferGodownToShop } = useKhata();
  const { isBengali } = useLocale();

  const [selectedStockId, setSelectedStockId] = useState('');
  const [selectedTargetProductId, setSelectedTargetProductId] = useState('');
  const [transferBags, setTransferBags] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const selectedStockItem = godownStock.find((g) => g.id === selectedStockId);
  const selectedTargetProd = products.find((p) => p.id === selectedTargetProductId);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedStockItem) {
      toast.error('উৎস গুদাম পণ্য নির্বাচন করুন');
      return;
    }

    if (!selectedTargetProd) {
      toast.error('দোকানের কাউন্টার পণ্য নির্বাচন করুন');
      return;
    }

    const bags = Number(transferBags);
    const itemUnit = selectedStockItem.bulkUnitName || selectedStockItem.unit || 'একক';
    if (!bags || bags <= 0) {
      toast.error(`স্থানান্তর ${itemUnit} সংখ্যা দিন`);
      return;
    }

    if (bags > (selectedStockItem.bagsCount || 0)) {
      toast.error(`গুদামে পর্যাপ্ত মাল নেই! বর্তমান মজুদ: ${selectedStockItem.bagsCount || 0} ${itemUnit}`);
      return;
    }

    const conversionFactor = Number(selectedStockItem.bulkConversionFactor) || 1;
    const unitsToTransfer = bags * conversionFactor;

    transferGodownToShop({
      godownStockId: selectedStockItem.id,
      targetProductId: selectedTargetProd.id,
      quantityToTransfer: unitsToTransfer,
      bagsToTransfer: bags,
      note: note || `গুদাম থেকে কাউন্টারে স্থানান্তর (${selectedStockItem.name})`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
              <ArrowRightLeft size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {isBengali ? 'গুদাম থেকে দোকানে মাল স্থানান্তর' : 'Warehouse to Shop Counter Transfer'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBengali ? 'গুদাম থেকে কাউন্টারের খুচরা বিক্রয় শেলফে স্টক স্থানান্তর' : 'Move inventory from bulk storage to POS retail shelf'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          
          {/* Transfer Flow Visualizer */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Warehouse size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">গুদাম মজুদ</p>
                <p className="text-[10px] text-slate-500">স্টক কমবে (-)</p>
              </div>
            </div>

            <ArrowRight size={20} className="text-indigo-600 animate-pulse" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Store size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">কাউন্টার শেলফ</p>
                <p className="text-[10px] text-slate-500">পিওএস স্টক বাড়বে (+)</p>
              </div>
            </div>
          </div>

          {/* Source Godown Item */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isBengali ? 'উৎস: গুদাম থেকে কোন মালটি আনবেন?' : 'Source Warehouse Stock'}
            </label>
            <select
              value={selectedStockId}
              onChange={(e) => {
                setSelectedStockId(e.target.value);
                const gItem = godownStock.find((g) => g.id === e.target.value);
                if (gItem) {
                  // Try to find matching shop product
                  const match = products.find((p) => p.name === gItem.name || p.id === gItem.productId);
                  if (match) setSelectedTargetProductId(match.id);
                }
              }}
              required
              className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:outline-hidden"
            >
              <option value="">-- গুদাম স্টক থেকে নির্বাচন করুন --</option>
              {godownStock.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (মজুদ: {g.bagsCount || 0} {g.bulkUnitName || g.unit || 'একক'}) - {g.godownName}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Shop Product */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isBengali ? 'গন্তব্য: কাউন্টারের কোন পণ্যের সাথে যুক্ত হবে?' : 'Destination Shop Product'}
            </label>
            <select
              value={selectedTargetProductId}
              onChange={(e) => setSelectedTargetProductId(e.target.value)}
              required
              className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:outline-hidden"
            >
              <option value="">-- দোকানের পণ্য নির্বাচন করুন --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (বর্তমান কাউন্টার মজুদ: {p.currentStockInBaseUnit || p.stock || 0} {p.baseUnit || 'একক'})
                </option>
              ))}
            </select>
          </div>

          {/* Bags count to transfer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBengali 
                  ? `স্থানান্তর পরিমাণ (${selectedStockItem?.bulkUnitName || 'একক'})` 
                  : `Units to Transfer (${selectedStockItem?.bulkUnitName || 'Units'})`}
              </label>
              <input
                type="number"
                placeholder="১০"
                value={transferBags}
                onChange={(e) => setTransferBags(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBengali 
                  ? `কাউন্টারে যোগ হবে (${selectedTargetProd?.baseUnit || selectedStockItem?.baseUnit || 'একক'})` 
                  : 'Store Stock Added'}
              </label>
              <div className="h-11 px-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center font-mono font-black text-slate-800 text-xs">
                {(Number(transferBags) || 0) * (Number(selectedStockItem?.bulkConversionFactor) || 1)} {selectedTargetProd?.baseUnit || selectedStockItem?.baseUnit || 'একক'}
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isBengali ? 'স্থানান্তর নোট / রেফারেন্স' : 'Transfer Note'}
            </label>
            <input
              type="text"
              placeholder="যেমন: সকালের কাউন্টার স্টক ফিলাপ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="submit"
              className="flex-2 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black text-sm shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={18} />
              <span>{isBengali ? 'মাল স্থানান্তর সম্পন্ন করুন' : 'Confirm Stock Transfer'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
