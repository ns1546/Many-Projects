import React, { useState } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { poishaToTaka, takaToPoisha, formatCurrency } from '../../utils/currency';
import { 
  FileText, 
  Users, 
  Truck, 
  PackageCheck, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChalaniGeneratorModal({ isOpen, onClose, onChalanCreated }) {
  const { customers, godownStock, createDeliveryChalan } = useKhata();
  const { activeTenant } = useTenant();
  const { isBengali } = useLocale();

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [destination, setDestination] = useState('');

  // Transport details
  const [vehicleType, setVehicleType] = useState('পিকআপ ভ্যান');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [godownSource, setGodownSource] = useState('প্রধান কেন্দ্রীয় গুদাম (রুম ১)');
  const [isCredit, setIsCredit] = useState(true);
  const [note, setNote] = useState('');

  // Items to dispatch
  const [selectedStockId, setSelectedStockId] = useState('');
  const [dispatchBags, setDispatchBags] = useState('');
  const [rateTaka, setRateTaka] = useState('');
  const [itemsList, setItemsList] = useState([]);

  if (!isOpen) return null;

  const handleSelectCustomer = (id) => {
    setCustomerId(id);
    const cust = customers.find((c) => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone || '');
      setDestination(cust.address || '');
    }
  };

  const handleAddStockItem = () => {
    const stockItem = godownStock.find((g) => g.id === selectedStockId);
    if (!stockItem) {
      toast.error('গুদাম থেকে পণ্য নির্বাচন করুন');
      return;
    }

    const bags = Number(dispatchBags);
    const itemUnit = stockItem.bulkUnitName || stockItem.unit || 'একক';
    if (!bags || bags <= 0) {
      toast.error(`পণ্য প্রেরণের সংখ্যা বা ${itemUnit} দিন`);
      return;
    }

    if (bags > (stockItem.bagsCount || 0)) {
      toast.error(`গুদামে পর্যাপ্ত মাল নেই! বর্তমান মজুদ: ${stockItem.bagsCount || 0} ${itemUnit}`);
      return;
    }

    const conversion = Number(stockItem.bulkConversionFactor) || 1;
    const subUnits = bags * conversion;
    const isWeightItem = stockItem.baseUnit === 'কেজি' || stockItem.bulkUnitName === 'বস্তা';
    const weightKg = isWeightItem ? subUnits : 0;
    const rate = Number(rateTaka) || poishaToTaka(stockItem.bulkSellingPricePoisha || 0);
    const totalPoisha = takaToPoisha(bags * rate);

    setItemsList((prev) => [
      ...prev,
      {
        godownStockId: stockItem.id,
        productId: stockItem.productId,
        name: stockItem.name,
        unit: itemUnit,
        baseUnit: stockItem.baseUnit || 'একক',
        bagsCount: bags,
        quantity: bags,
        subUnits,
        weightKg,
        ratePoisha: takaToPoisha(rate),
        totalPoisha,
      }
    ]);

    setSelectedStockId('');
    setDispatchBags('');
    setRateTaka('');
  };

  const handleRemoveItem = (index) => {
    setItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotalAmountPoisha = itemsList.reduce((sum, item) => sum + (item.totalPoisha || 0), 0);
  const totalBagsCount = itemsList.reduce((sum, item) => sum + (item.bagsCount || 0), 0);
  const totalWeightKg = itemsList.reduce((sum, item) => sum + (item.weightKg || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('প্রাপক / ক্রেতার নাম দিন');
      return;
    }

    if (itemsList.length === 0) {
      toast.error('চালানে অন্তত একটি পণ্য যোগ করুন');
      return;
    }

    const res = createDeliveryChalan({
      customerId: customerId || null,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      destination: destination.trim(),
      vehicleType,
      vehicleNumber: vehicleNumber.trim() || '—',
      driverName: driverName.trim() || '—',
      driverPhone: driverPhone.trim() || '—',
      godownSource,
      items: itemsList,
      totalAmountPoisha: grandTotalAmountPoisha,
      isCredit,
      note,
    });

    if (res.success && res.chalan) {
      onClose();
      if (onChalanCreated) {
        onChalanCreated(res.chalan);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/40">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {isBengali ? '৩-কপি ডেলিভারি ও সরবরাহ চালান তৈরি' : 'Generate 3-Copy Delivery Chalani'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBengali ? 'ক্রেতার জন্য গেটপাস ও মাল খালাস চালান ইস্যু (গুদাম থেকে স্টক মাইনাস হবে)' : 'Issue official commercial challan and decrement warehouse inventory'}
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
          
          {/* Customer & Destination Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} className="text-indigo-600" />
              <span>{isBengali ? 'প্রাপক / ক্রেতার তথ্য ও গন্তব্য' : 'Consignee & Destination'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Customer Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'খাতার গ্রাহক নির্বাচন' : 'Select Customer'}
                </label>
                <select
                  value={customerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                >
                  <option value="">-- নগদ / নতুন ক্রেতা --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({poishaToTaka(c.currentDuePoisha)} ৳ বাকি)
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'ক্রেতা / প্রতিষ্ঠানের নাম' : 'Consignee Name'}
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ভাই ভাই স্টোর"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'মোবাইল নম্বর' : 'Phone'}
                </label>
                <input
                  type="text"
                  placeholder="01811-xxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Destination Address & Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'ডেলিভারি ঠিকানা / আনলোড পয়েন্ট' : 'Delivery Address'}
                </label>
                <input
                  type="text"
                  placeholder="দোকান নং ৫, কাঁচাবাজার, ঢাকা"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'হিসাব প্রকার' : 'Payment Mode'}
                </label>
                <select
                  value={isCredit ? 'CREDIT' : 'CASH'}
                  onChange={(e) => setIsCredit(e.target.value === 'CREDIT')}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:border-slate-800 focus:outline-hidden"
                >
                  <option value="CREDIT">বাকিতে চালান (পাবো খাতায় জমা)</option>
                  <option value="CASH">নগদে চালান (ক্যাশ আদায়)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transport & Vehicle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Truck size={15} className="text-slate-700" />
              <span>{isBengali ? 'পরিবহন ও গাড়ির তথ্য (গেটপাস ও চালানের জন্য)' : 'Transport & Vehicle'}</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'যানবাহন প্রকার' : 'Vehicle Type'}
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                >
                  <option value="পিকআপ ভ্যান">পিকআপ ভ্যান</option>
                  <option value="কাভার্ড ভ্যান">কাভার্ড ভ্যান</option>
                  <option value="১০-টনি ট্রাক">১০-টনি ট্রাক</option>
                  <option value="ভ্যানগাড়ি / ঠেলাগাড়ি">ভ্যানগাড়ি / ঠেলাগাড়ি</option>
                  <option value="ট্রলি">ট্রলি</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'গাড়ি নম্বর' : 'Vehicle Number'}
                </label>
                <input
                  type="text"
                  placeholder="ঢাকা মেট্রো-ন ১২-৩৪৫৬"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'চালকের নাম' : "Driver Name"}
                </label>
                <input
                  type="text"
                  placeholder="মো: কালাম"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'চালকের মোবাইল' : "Driver Mobile"}
                </label>
                <input
                  type="text"
                  placeholder="01712-xxxxxx"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Items Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PackageCheck size={15} className="text-slate-700" />
              <span>{isBengali ? 'গুদাম থেকে পণ্য নির্বাচন ও পরিমাণ' : 'Add Items from Warehouse Stock'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'গুদামের মাল সিলেক্ট করুন' : 'Warehouse Item'}
                </label>
                <select
                  value={selectedStockId}
                  onChange={(e) => {
                    setSelectedStockId(e.target.value);
                    const it = godownStock.find((g) => g.id === e.target.value);
                    if (it) {
                      setRateTaka(poishaToTaka(it.bulkSellingPricePoisha || 0));
                    }
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-slate-800 focus:outline-hidden"
                >
                  <option value="">-- গুদাম স্টক থেকে নির্বাচন --</option>
                  {godownStock.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} (মজুদ: {g.bagsCount || 0} {g.bulkUnitName || g.unit || 'একক'}) - {g.godownName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'পরিমাণ / একক সংখ্যা' : 'Dispatch Quantity'}
                </label>
                <input
                  type="number"
                  placeholder="১০"
                  value={dispatchBags}
                  onChange={(e) => setDispatchBags(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:border-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddStockItem}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus size={16} />
                  <span>{isBengali ? 'চালানে যোগ' : 'Add Item'}</span>
                </button>
              </div>
            </div>

            {/* Added Items Table */}
            {itemsList.length > 0 && (
              <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">পণ্য</th>
                      <th className="py-2 px-3 text-center">চালান পরিমাণ</th>
                      <th className="py-2 px-3 text-right">খুচরা / ওজন</th>
                      <th className="py-2 px-3 text-right">দর (৳)</th>
                      <th className="py-2 px-3 text-right">মোট (৳)</th>
                      <th className="py-2 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemsList.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                        <td className="py-2 px-3 text-center font-bold">{item.bagsCount} {item.unit}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {item.weightKg > 0 
                            ? `${item.weightKg} কেজি` 
                            : `${item.subUnits || item.quantity} ${item.baseUnit || 'একক'}`}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">{poishaToTaka(item.ratePoisha)} ৳</td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{poishaToTaka(item.totalPoisha)} ৳</td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td className="py-2 px-3 font-extrabold">মোট:</td>
                      <td className="py-2 px-3 text-center font-black">{totalBagsCount} একক</td>
                      <td className="py-2 px-3 text-right font-mono font-black">
                        {totalWeightKg > 0 ? `${totalWeightKg} কেজি` : '—'}
                      </td>
                      <td></td>
                      <td className="py-2 px-3 text-right font-mono font-black text-sm text-slate-900">
                        {formatCurrency(grandTotalAmountPoisha, isBengali)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Action Submit */}
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
              disabled={itemsList.length === 0}
              className="flex-2 h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-slate-900/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={18} />
              <span>{isBengali ? '৩-কপি চালান ইস্যু ও প্রিন্ট করুন' : 'Issue & Print 3-Copy Chalani'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
