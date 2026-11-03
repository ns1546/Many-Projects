import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKhata } from '../context/KhataContext';
import { useTenant } from '../context/TenantContext';
import { useLocale } from '../context/LocaleContext';
import { formatCurrency, poishaToTaka, takaToPoisha } from '../utils/currency';
import StockIntakeModal from '../components/godown/StockIntakeModal';
import ChalaniGeneratorModal from '../components/godown/ChalaniGeneratorModal';
import PrintableChalaniModal from '../components/godown/PrintableChalaniModal';
import InterStoreTransferModal from '../components/godown/InterStoreTransferModal';
// Enterprise topology inspection removed
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
import RoleAccessGate from '../components/common/RoleAccessGate';
import { 
  Warehouse, 
  Truck, 
  FileText, 
  ArrowRightLeft, 
  Boxes, 
  Search, 
  Plus, 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Scale,
  Calendar,
  Building,
  ShieldCheck,
  Edit3,
  Trash2,
  KeyRound,
  Lock,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GodownKhata() {
  const navigate = useNavigate();
  const { 
    godownStock = [], 
    chalans = [], 
    godownTransfers = [], 
    updateChalanStatus, 
    editGodownStock, 
    deleteGodownStock 
  } = useKhata();
  const { activeTenant, isOwner, verifyOwnerPin } = useTenant();
  const { isBengali } = useLocale();

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'chalans' | 'transfers'
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  // Modals state
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isChalaniOpen, setIsChalaniOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTopologyOpen, setIsTopologyOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [activePrintChalan, setActivePrintChalan] = useState(null);

  // Edit Godown Stock State
  const [editingStock, setEditingStock] = useState(null);

  // Delete Godown Stock State & Security
  const [deletingStock, setDeletingStock] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Computed summary metrics
  const totalBagsInGodown = godownStock.reduce((s, g) => s + (g.bagsCount || 0), 0);
  const totalWeightKgInGodown = godownStock.reduce((s, g) => s + (g.quantityInBaseUnit || 0), 0);
  const totalWeightTons = (totalWeightKgInGodown / 1000).toFixed(1);

  const totalGodownValuationPoisha = godownStock.reduce((s, g) => {
    const cost = g.costPriceBasePoisha || 0;
    const qty = g.quantityInBaseUnit || 0;
    return s + (cost * qty);
  }, 0);

  const totalChalanDelivered = chalans.filter((c) => c.status === 'DELIVERED').length;
  const totalChalanInTransit = chalans.filter((c) => c.status === 'IN_TRANSIT').length;

  // Filtered Stock
  const filteredStock = godownStock.filter((g) => {
    const matchesSearch = 
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.category && g.category.toLowerCase().includes(search.toLowerCase())) ||
      (g.rackLocation && g.rackLocation.toLowerCase().includes(search.toLowerCase()));
    
    if (selectedLocation === 'ALL') return matchesSearch;
    return matchesSearch && g.godownName === selectedLocation;
  });

  // Filtered Chalans
  const filteredChalans = chalans.filter((c) => {
    return (
      (c.chalanNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.receiverName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.vehicleNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.destination || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleConfirmDeleteStock = (e) => {
    e.preventDefault();
    if (!deletingStock) return;

    if (!isOwner) {
      if (!verifyOwnerPin(deletePin)) {
        setDeleteError(isBengali ? 'ভুল পিন কোড! মালিকের অনুমতি প্রয়োজন।' : 'Incorrect PIN! Owner authorization required.');
        return;
      }
    }

    deleteGodownStock(deletingStock.id);
    setDeletingStock(null);
    setDeletePin('');
    setDeleteError('');
    toast.success(isBengali ? 'গুদাম স্টক তালিকা থেকে মুছে ফেলা হয়েছে!' : 'Godown item deleted!');
  };

  return (
    <RoleAccessGate titleBn="গুদাম ও চালানি লজিস্টিকস" requiredRole="দোকান মালিক ও ম্যানেজার">
      <div className="w-full space-y-6 pb-16 antialiased overflow-x-hidden">
      
      {/* ── Top Header Navigation ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 shadow-xs border border-slate-200 transition cursor-pointer active:scale-95 shrink-0"
            title="ড্যাশবোর্ডে ফিরে যান"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-[#E2136E]/10 text-[#E2136E] flex items-center justify-center shrink-0">
                <Warehouse size={20} />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isBengali ? 'গুদাম ও চালানি লজিস্টিকস খাতা' : 'Godown Warehouse & Chalani Logistics'}
              </h1>
              <span className="text-[10px] bg-pink-100 text-[#E2136E] font-extrabold px-2 py-0.5 rounded-full border border-pink-200 shrink-0">
                ৩-কপি চালান
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {isBengali 
                ? 'গুদামের স্টক ট্র্যাকিং, ট্রাক চালানে মাল গ্রহণ ও ডেলিভারি গেটপাস নিয়ন্ত্রণ' 
                : 'Warehouse inventory control, truck dispatches, and 3-copy delivery chalanis'}
            </p>
          </div>
        </div>

        {/* Action Controls (48px Height bKash Standard) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex-1 sm:flex-none h-12 px-4 rounded-2xl text-xs font-black text-indigo-950 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowRightLeft size={16} className="text-indigo-700" />
            <span>{isBengali ? 'দোকানে পাঠান' : 'To Counter'}</span>
          </button>

          <button
            onClick={() => setIsIntakeOpen(true)}
            className="flex-1 sm:flex-none h-12 px-4 rounded-2xl text-xs font-black text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Truck size={16} className="text-[#E2136E]" />
            <span>{isBengali ? '+ ট্রাক ইনটেক' : '+ Stock Intake'}</span>
          </button>

          <button
            onClick={() => setIsChalaniOpen(true)}
            className="flex-1 sm:flex-none h-12 px-5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c2105c] hover:to-[#900c46] shadow-md shadow-pink-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FileText size={17} />
            <span>{isBengali ? '+ ৩-কপি চালান তৈরি' : '+ Issue Chalani'}</span>
          </button>
        </div>
      </div>

      {/* ── Top 4 KPI Metrics Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Total Warehouse Bags */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {isBengali ? 'মোট গুদাম বস্তা / একক' : 'Total Warehouse Bags'}
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {totalBagsInGodown} <span className="text-xs font-bold text-slate-500">বস্তা</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              ওজন: <strong className="font-mono text-slate-800">{totalWeightTons} টন</strong> ({totalWeightKgInGodown} কেজি)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
            <Boxes size={22} />
          </div>
        </div>

        {/* Metric 2: Warehouse Asset Valuation */}
        <div 
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {isBengali ? 'গুদাম মজুদ সম্পত্তি মূল্য' : 'Warehouse Inventory Asset'}
            </span>
            {isOwner ? (
              <p className="text-2xl font-black text-emerald-600 mt-1 tabular-nums origin-left">
                {formatCurrency(totalGodownValuationPoisha, isBengali)}
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-black text-slate-400 font-mono tracking-widest">৳ ••••••••</span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">লকড</span>
              </div>
            )}
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <span>মোট পণ্যের ধরণ:</span>
              <strong className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{godownStock.length} প্রকার মজুদ</strong>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Metric 3: Total Delivery Chalanis Issued */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {isBengali ? 'মোট চালান সরবরাহ' : 'Total Chalan Dispatches'}
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {chalans.length} <span className="text-xs font-bold text-slate-500">চালান</span>
            </p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} />
              {totalChalanDelivered} টি খালাস সম্পন্ন
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E2136E] flex items-center justify-center border border-pink-200/60 shadow-xs">
            <FileText size={22} />
          </div>
        </div>

        {/* Metric 4: In-Transit Chalanis */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {isBengali ? 'ট্রাকে / খালাসের অপেক্ষায়' : 'In-Transit / Unloading'}
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
              {totalChalanInTransit} <span className="text-xs font-bold text-slate-500">চালান</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium">
              গেটপাস সক্রিয়
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-xs">
            <Truck size={22} />
          </div>
        </div>

      </div>

      {/* ── Main Tabbed Content Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl flex-wrap">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'stock'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Warehouse size={16} className={activeTab === 'stock' ? 'text-[#E2136E]' : ''} />
              <span>{isBengali ? 'গুদাম স্টক ও র্যাক তালিকা' : 'Warehouse Stock & Racks'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
                {godownStock.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chalans')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'chalans'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={16} className={activeTab === 'chalans' ? 'text-[#E2136E]' : ''} />
              <span>{isBengali ? 'ডেলিভারি চালান ও গেটপাস' : 'Delivery Chalanis & Gate Pass'}</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-pink-100 text-[#E2136E] font-mono font-bold">
                {chalans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'transfers'
                  ? 'bg-white text-slate-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft size={16} className={activeTab === 'transfers' ? 'text-indigo-600' : ''} />
              <span>{isBengali ? 'কাউন্টার স্থানান্তর হিস্ট্রি' : 'Transfers to Shop'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'stock'
                  ? 'পণ্য বা র্যাক দিয়ে খুঁজুন...'
                  : 'চালান নং বা ক্রেতা দিয়ে খুঁজুন...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:border-[#E2136E] focus:outline-hidden"
            />
          </div>
        </div>

        {/* ── Tab 1: Godown Stock & Racks ── */}
        {activeTab === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{isBengali ? 'পণ্যের নাম ও ক্যাটাগরি' : 'Product & Category'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'গুদাম ও র্যাক অবস্থান' : 'Godown Room & Rack'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'মজুদ বস্তা' : 'Bags Available'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'নেট ওজন (কেজি)' : 'Total Weight (Kg)'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'ক্রয় দর (৳)' : 'Cost Price (৳)'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'মোট মজুদ মূল্য' : 'Total Asset Value'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStock.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                      কোনো গুদাম পণ্য পাওয়া যায়নি। উপরে "+ ট্রাক ইনটেক" বাটনে ক্লিক করে নতুন মাল যোগ করুন।
                    </td>
                  </tr>
                ) : (
                  filteredStock.map((item) => {
                    const valuationPoisha = (item.costPriceBasePoisha || 0) * (item.quantityInBaseUnit || 0);

                    return (
                      <tr key={item.id} className="hover:bg-pink-50/20 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-900 text-sm">{item.name}</p>
                          <span className="text-[10px] text-slate-500 font-medium">{item.category} • {item.bulkConversionFactor} কেজি/বস্তা</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{item.godownName}</p>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200 mt-0.5">
                            {item.rackLocation || 'ফ্লোর স্টক'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-sm text-slate-900">
                          {item.bagsCount} <span className="text-xs text-slate-500 font-normal">{item.bulkUnitName || 'বস্তা'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          {item.quantityInBaseUnit?.toLocaleString() || 0} কেজি
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          {isOwner ? (
                            <span>{poishaToTaka(item.costPriceBasePoisha || 0)} ৳</span>
                          ) : (
                            <span className="text-slate-400 font-mono">•••• ৳</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-emerald-600">
                          {isOwner ? (
                            formatCurrency(valuationPoisha, isBengali)
                          ) : (
                            <span className="text-slate-400 font-mono">••••••••</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setIsChalaniOpen(true)}
                              className="px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-[#E2136E] hover:text-white text-[#E2136E] font-bold text-xs transition cursor-pointer"
                              title="চালান ইস্যু"
                            >
                              চালান
                            </button>
                            <button
                              onClick={() => setEditingStock(item)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="এডিট স্টক"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingStock(item);
                                setDeletePin('');
                                setDeleteError('');
                              }}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-700 transition cursor-pointer"
                              title="মুছুন"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tab 2: Delivery Chalanis & Gate Passes ── */}
        {activeTab === 'chalans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{isBengali ? 'চালান নম্বর ও তারিখ' : 'Chalan No & Date'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'গ্রহীতা / ক্রেতার নাম' : 'Consignee / Customer'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'গাড়ি ও গেটপাস' : 'Vehicle & Gate Pass'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'বস্তা সংখ্যা' : 'Bags'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'চালান মূল্য' : 'Chalan Value'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'প্রিন্ট ও অ্যাকশন' : 'Print & Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChalans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                      কোনো ডেলিভারি চালান পাওয়া যায়নি। উপরে "+ ৩-কপি চালান তৈরি" বাটনে ক্লিক করে নতুন চালান ইস্যু করুন।
                    </td>
                  </tr>
                ) : (
                  filteredChalans.map((chalan) => (
                    <tr key={chalan.id} className="hover:bg-pink-50/20 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-black text-sm text-[#E2136E] font-mono block">
                          {chalan.chalanNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {chalan.date}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-extrabold text-slate-900 text-sm">{chalan.receiverName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{chalan.destination || 'কাউন্টার ডেলিভারি'}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{chalan.vehicleType}</p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {chalan.vehicleNumber} • {chalan.gatePassNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-slate-900">
                        {chalan.totalBags || 0} বস্তা
                        <span className="block text-[10px] text-slate-500 font-normal font-mono">
                          {chalan.totalWeightKg ? `${chalan.totalWeightKg} কেজি` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#E2136E]">
                        {formatCurrency(chalan.totalAmountPoisha || 0, isBengali)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {chalan.status === 'DELIVERED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={12} />
                            খালাস সম্পন্ন
                          </span>
                        ) : (
                          <button
                            onClick={() => updateChalanStatus(chalan.id, 'DELIVERED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-emerald-100 hover:text-emerald-800 transition cursor-pointer"
                            title="খালাস সম্পন্ন মার্ক করুন"
                          >
                            <Clock size={12} />
                            ট্রাকে আছে (খালাস করুন)
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setActivePrintChalan(chalan)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#E2136E] text-white font-bold text-xs transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs active:scale-95"
                        >
                          <Printer size={14} />
                          <span>৩-কপি প্রিন্ট</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tab 3: Counter Transfers Log ── */}
        {activeTab === 'transfers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{isBengali ? 'তারিখ ও সময়' : 'Timestamp'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'উৎস গুদাম পণ্য' : 'Source Warehouse Item'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'স্থানান্তরিত বস্তা' : 'Transferred Bags'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'দোকানে যোগকৃত ওজন (কেজি)' : 'Base Units Added'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'রেফারেন্স ও মন্তব্য' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {godownTransfers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                      এখনো কোনো গুদাম থেকে দোকানে মাল স্থানান্তর করা হয়নি।
                    </td>
                  </tr>
                ) : (
                  godownTransfers.map((xfer) => (
                    <tr key={xfer.id} className="hover:bg-indigo-50/20 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {new Date(xfer.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {xfer.note || 'গুদাম থেকে স্থানান্তর'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-900">
                        {xfer.bagsTransferred || 0} বস্তা
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700">
                        +{xfer.quantityTransferred} কেজি
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {xfer.note || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ── Edit Godown Stock Modal ── */}
      {editingStock && (
        <EditGodownStockModal
          stockItem={editingStock}
          isOpen={true}
          onClose={() => setEditingStock(null)}
          onSave={(updated) => {
            editGodownStock(editingStock.id, updated);
            setEditingStock(null);
          }}
          isBengali={isBengali}
        />
      )}

      {/* ── Delete Godown Stock Confirmation Modal ── */}
      {deletingStock && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
              <Trash2 size={32} />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {isBengali ? 'গুদাম স্টক অপসারণ করতে চান?' : 'Delete Godown Stock Item?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              <span className="font-bold text-slate-800">"{deletingStock.name}"</span> ({deletingStock.godownName}) {isBengali ? 'গুদাম তালিকা থেকে মুছে ফেলা হবে।' : 'will be removed.'}
              {((deletingStock.bagsCount || 0) > 0) && (
                <span className="block font-bold text-rose-600 mt-1">
                  ⚠️ {isBengali ? 'সতর্কতা: এখনো গুদামে মজুদ রয়েছে:' : 'Warning: Current Stock:'} {deletingStock.bagsCount} বস্তা ({deletingStock.quantityInBaseUnit} কেজি)
                </span>
              )}
            </p>

            {/* PIN required if not OWNER */}
            {!isOwner && (
              <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-2">
                <label className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-amber-600" />
                  <span>{isBengali ? 'মালিকের অনুমতি পিন দিন (ম্যানেজার মোড)' : 'Enter Owner PIN (Protected)'}</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={deletePin}
                  onChange={e => {
                    setDeletePin(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="৪ ডিজিট পিন"
                  className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white font-mono text-center font-black tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {deleteError && (
                  <p className="text-[11px] font-bold text-rose-600">{deleteError}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeletingStock(null);
                  setDeletePin('');
                  setDeleteError('');
                }}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStock}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition cursor-pointer active:scale-95"
              >
                {isBengali ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Modals ── */}
      <StockIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
      />

      <ChalaniGeneratorModal
        isOpen={isChalaniOpen}
        onClose={() => setIsChalaniOpen(false)}
        onChalanCreated={(createdChalan) => {
          setActivePrintChalan(createdChalan);
        }}
      />

      <PrintableChalaniModal
        isOpen={!!activePrintChalan}
        onClose={() => setActivePrintChalan(null)}
        chalan={activePrintChalan}
      />

      <InterStoreTransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
      />

      {isRoleModalOpen && (
        <RoleSwitcherModal
          isOpen={true}
          onClose={() => setIsRoleModalOpen(false)}
        />
      )}

      </div>
    </RoleAccessGate>
  );
}

// ── Edit Godown Stock Modal Helper ─────────────────────────────────────────
function EditGodownStockModal({ stockItem, isOpen, onClose, onSave, isBengali }) {
  const [name, setName] = useState(stockItem.name || '');
  const [godownName, setGodownName] = useState(stockItem.godownName || 'প্রধান গুদাম (গাবতলী)');
  const [rackLocation, setRackLocation] = useState(stockItem.rackLocation || '');
  const [bagsCount, setBagsCount] = useState((stockItem.bagsCount || 0).toString());
  const [conversionFactor, setConversionFactor] = useState((stockItem.bulkConversionFactor || 50).toString());
  const [costTaka, setCostTaka] = useState(poishaToTaka(stockItem.costPriceBasePoisha || 0).toString());

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const bags = parseFloat(bagsCount) || 0;
    const factor = parseFloat(conversionFactor) || 50;
    const totalKg = bags * factor;

    onSave({
      name: name.trim(),
      godownName: godownName.trim(),
      rackLocation: rackLocation.trim(),
      bagsCount: bags,
      bulkConversionFactor: factor,
      quantityInBaseUnit: totalKg,
      costPriceBasePoisha: takaToPoisha(costTaka || '0'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#E2136E]/10 text-[#E2136E] flex items-center justify-center">
              <Warehouse size={20} />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {isBengali ? 'গুদাম স্টক তথ্য পরিবর্তন' : 'Edit Godown Stock'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{stockItem.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              {isBengali ? 'পণ্যের নাম' : 'Product Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm font-bold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'গুদামের নাম' : 'Godown Room'}
              </label>
              <input
                type="text"
                value={godownName}
                onChange={e => setGodownName(e.target.value)}
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'র্যাক / অবস্থান' : 'Rack Location'}
              </label>
              <input
                type="text"
                value={rackLocation}
                onChange={e => setRackLocation(e.target.value)}
                placeholder="A-1, B-2..."
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'মজুদ বস্তা সংখ্যা' : 'Bags Count'}
              </label>
              <input
                type="number"
                step="any"
                value={bagsCount}
                onChange={e => setBagsCount(e.target.value)}
                className="w-full text-sm font-black h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'বস্তার সাইজ (কেজি)' : 'Kg Per Bag'}
              </label>
              <input
                type="number"
                step="any"
                value={conversionFactor}
                onChange={e => setConversionFactor(e.target.value)}
                className="w-full text-sm font-black h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
              {isBengali ? 'ক্রয় দর প্রতি কেজি (টাকা)' : 'Cost Price per Kg (BDT)'}
            </label>
            <input
              type="number"
              step="any"
              value={costTaka}
              onChange={e => setCostTaka(e.target.value)}
              className="w-full text-sm font-black h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-[#E2136E] transition-all tabular-nums"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] shadow-md transition cursor-pointer active:scale-95"
            >
              {isBengali ? 'আপডেট সংরক্ষণ ✓' : 'Save Changes ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
