import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { poishaToTaka, takaToPoisha, formatCurrency } from '../../utils/currency';
import { 
  Truck, 
  PackagePlus, 
  X, 
  Building2, 
  Boxes, 
  Scale, 
  ArrowRight, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StockIntakeModal({ isOpen, onClose }) {
  const { suppliers, products, recordGodownIntake } = useKhata();
  const { activeTenant } = useTenant();
  const { isBengali } = useLocale();

  const [supplierId, setSupplierId] = useState('');
  const [truckNumber, setTruckNumber] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [godownName, setGodownName] = useState('প্রধান কেন্দ্রীয় গুদাম (রুম ১)');
  const [rackLocation, setRackLocation] = useState('র্যাক এ-১');
  
  // Intake Item Form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [bagsCount, setBagsCount] = useState('');
  const [kgPerBag, setKgPerBag] = useState('50');
  const [tareWeightKg, setTareWeightKg] = useState('0'); // খালি বস্তার ওজন কর্তন
  const [ratePerKg, setRatePerKg] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  // Selected product metadata
  const selectedProd = products.find((p) => p.id === selectedProductId);

  // Computed values
  const grossWeightKg = (Number(bagsCount) || 0) * (Number(kgPerBag) || 0);
  const netWeightKg = Math.max(0, grossWeightKg - (Number(tareWeightKg) || 0));
  const totalBillTaka = netWeightKg * (Number(ratePerKg) || 0);
  const totalAmountPoisha = takaToPoisha(totalBillTaka);

  const handleSubmit = (e) => {
    e.preventDefault();

    const itemName = selectedProd ? selectedProd.name : customProductName.trim();
    if (!itemName) {
      toast.error('অনুগ্রহ করে পণ্যের নাম নির্বাচন বা ইনপুট করুন');
      return;
    }

    if (!bagsCount || Number(bagsCount) <= 0) {
      toast.error('বস্তা বা এককের সংখ্যা দিন');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);

    const intakePayload = {
      supplierId: supplierId || null,
      supplierName: selectedSupplier ? selectedSupplier.name : 'সাপ্লায়ার / মিল চালান',
      truckNumber: truckNumber.trim() || 'লোকাল ডেলিভারি',
      driverPhone: driverPhone.trim(),
      godownName,
      rackLocation,
      items: [
        {
          productId: selectedProductId || null,
          name: itemName,
          category: selectedProd ? selectedProd.category : 'খাদ্যশস্য ও পণ্য',
          baseUnit: 'কেজি',
          hasBulkUnit: true,
          bulkUnitName: 'বস্তা',
          bulkConversionFactor: Number(kgPerBag) || 50,
          costPriceBasePoisha: takaToPoisha(Number(ratePerKg) || 0),
          quantityInBaseUnit: netWeightKg,
          bagsCount: Number(bagsCount) || 0,
          godownName,
          rackLocation,
        }
      ],
      totalAmountPoisha,
      note,
    };

    recordGodownIntake(intakePayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2136E]/20 text-[#E2136E] flex items-center justify-center border border-[#E2136E]/40">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {isBengali ? 'ট্রাক চালানে নতুন মাল গুদামে প্রবেশ (Stock Intake)' : 'New Truck Stock Intake to Godown'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBengali ? 'মিল বা মহাজন থেকে আসা মাল গুদামে রিসিভ ও মজুদে অন্তর্ভুক্তি' : 'Receive shipments and update warehouse stock atomically'}
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          
          {/* Supplier & Transport Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={15} className="text-[#E2136E]" />
              <span>{isBengali ? 'মহাজন / মিল ও পরিবহন বিবরণ' : 'Supplier & Transport'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Supplier Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'মহাজন / মিলের নাম' : 'Supplier / Mill'}
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                >
                  <option value="">-- মহাজন নির্বাচন করুন --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.company || 'মহাজন'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Truck No */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'ট্রাক / গাড়ির নম্বর' : 'Truck / Vehicle No'}
                </label>
                <input
                  type="text"
                  placeholder="ঢাকা মেট্রো-ট ১১-২২৩৩"
                  value={truckNumber}
                  onChange={(e) => setTruckNumber(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                />
              </div>

              {/* Driver Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'চালকের মোবাইল নং' : 'Driver Mobile'}
                </label>
                <input
                  type="text"
                  placeholder="01711-xxxxxx"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Warehouse Allocation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'গুদাম কক্ষ / শেড' : 'Godown Room / Shed'}
                </label>
                <select
                  value={godownName}
                  onChange={(e) => setGodownName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                >
                  <option value="প্রধান কেন্দ্রীয় গুদাম (রুম ১)">প্রধান কেন্দ্রীয় গুদাম (রুম ১)</option>
                  <option value="প্রধান কেন্দ্রীয় গুদাম (রুম ২)">প্রধান কেন্দ্রীয় গুদাম (রুম ২)</option>
                  <option value="নদী ঘাট আড়ত শেড">নদী ঘাট আড়ত শেড</option>
                  <option value="কাউন্টার ব্যাকরুম মজুদ">কাউন্টার ব্যাকরুম মজুদ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'র্যাক / ফ্লোর অবস্থান' : 'Rack / Location'}
                </label>
                <input
                  type="text"
                  placeholder="র্যাক এ-১ / ফ্লোর জোন"
                  value={rackLocation}
                  onChange={(e) => setRackLocation(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Product & Weight Computation */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Boxes size={15} className="text-[#E2136E]" />
              <span>{isBengali ? 'পণ্যের তথ্য, বস্তা ও ওজন পরিমাপ' : 'Product & Weight Scale'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'বর্তমান ক্যাটালগ থেকে পণ্য' : 'Select Product from Catalog'}
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) {
                      setRatePerKg(poishaToTaka(prod.costPriceBasePoisha || 0));
                      setKgPerBag(String(prod.bulkConversionFactor || 50));
                    }
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                >
                  <option value="">-- তালিকা থেকে নির্বাচন --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'অথবা নতুন পণ্যের নাম' : 'Or Enter Custom Item Name'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মিনিকেট চাল ৫০কেজি"
                  value={customProductName}
                  onChange={(e) => setCustomProductName(e.target.value)}
                  disabled={!!selectedProductId}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Scale Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'বস্তা/প্যাক সংখ্যা' : 'Bags Count'}
                </label>
                <input
                  type="number"
                  placeholder="১০০"
                  value={bagsCount}
                  onChange={(e) => setBagsCount(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'কেজি / বস্তা' : 'Kg per Bag'}
                </label>
                <input
                  type="number"
                  value={kgPerBag}
                  onChange={(e) => setKgPerBag(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" title="খালি বস্তা বাবদ মোট কর্তন">
                  {isBengali ? 'বস্তা কর্তন (Tare Kg)' : 'Tare Deduction (Kg)'}
                </label>
                <input
                  type="number"
                  value={tareWeightKg}
                  onChange={(e) => setTareWeightKg(e.target.value)}
                  placeholder="০"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'ক্রয় দর (৳/কেজি)' : 'Rate (৳/Kg)'}
                </label>
                <input
                  type="number"
                  placeholder="৭৫"
                  value={ratePerKg}
                  onChange={(e) => setRatePerKg(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Live Calculation Pill */}
            <div className="p-3 rounded-xl bg-pink-50 border border-pink-200/80 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-slate-700">
                <Scale size={16} className="text-[#E2136E]" />
                <span>নেট ওজন: <strong className="font-mono text-slate-900">{netWeightKg} কেজি</strong> ({grossWeightKg} কেজি মোট - {tareWeightKg || 0} কেজি কর্তন)</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px]">মোট চালান মূল্য: </span>
                <span className="text-[#E2136E] font-black text-sm font-mono">
                  {formatCurrency(totalAmountPoisha, isBengali)}
                </span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBengali ? 'চালান মন্তব্য / চালান রেফারেন্স নং' : 'Notes & Chalani Ref'}
              </label>
              <input
                type="text"
                placeholder="যেমন: মিল গেট রসিদ নং-৪৪০১, ভেজা নেই, ফ্রেশ বস্তা"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
              />
            </div>
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
              className="flex-2 h-12 rounded-2xl bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] text-white font-black text-sm shadow-md shadow-pink-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={18} />
              <span>{isBengali ? 'গুদামে মাল জমা সম্পন্ন করুন' : 'Confirm Stock Intake'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
