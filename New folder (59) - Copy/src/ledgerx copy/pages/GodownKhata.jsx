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
import UnifiedPageHeader from '../components/common/UnifiedPageHeader';
import MetricRibbon from '../components/common/MetricRibbon';
import UnifiedToolbar from '../components/common/UnifiedToolbar';
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
  ChevronDown,
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
  const totalBagsInGodown = (godownStock || []).reduce((s, g) => s + (Number(g.bagsCount) || 0), 0);
  const totalWeightKgInGodown = (godownStock || []).reduce((s, g) => s + (Number(g.quantityInBaseUnit) || 0), 0);
  const totalWeightTons = (totalWeightKgInGodown / 1000).toFixed(1);

  const totalGodownValuationPoisha = (godownStock || []).reduce((s, g) => {
    const cost = Number(g.costPriceBasePoisha) || 0;
    const qty = Number(g.quantityInBaseUnit) || 0;
    return s + Math.round(cost * qty);
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

  const godownMetrics = [
    {
      id: 'godownStock',
      label: isBengali ? 'গুদাম স্টক' : 'Godown Stock',
      value: totalBagsInGodown.toLocaleString(),
      valueColor: 'text-amber-600',
      subtitle: isBengali ? 'প্যাকেজ / একক' : 'units in stock',
      icon: Boxes,
      iconColor: 'text-amber-500',
      onClick: () => setActiveTab('stock'),
    },
    {
      id: 'assetValue',
      label: isBengali ? 'সম্পদ মূল্য' : 'Asset Value',
      value: isOwner ? formatCurrency(totalGodownValuationPoisha, isBengali) : '৳ ••••••',
      valueColor: 'text-emerald-600',
      subtitle: `${godownStock.length} ${isBengali ? 'প্রকার পণ্য' : 'product types'}`,
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      onClick: !isOwner ? () => setIsRoleModalOpen(true) : null,
    },
    {
      id: 'totalChalanis',
      label: isBengali ? 'মোট চালান' : 'Total Chalanis',
      value: `${chalans.length}`,
      valueColor: 'text-blue-600',
      subtitle: `${totalChalanDelivered} ${isBengali ? 'খালাস সম্পন্ন' : 'delivered'}`,
      icon: FileText,
      iconColor: 'text-blue-500',
      onClick: () => setActiveTab('chalans'),
    },
    {
      id: 'inTransit',
      label: isBengali ? 'ট্রানজিটে' : 'In Transit',
      value: `${totalChalanInTransit}`,
      valueColor: totalChalanInTransit > 0 ? 'text-amber-600' : 'text-slate-900',
      subtitle: isBengali ? 'চালান পথে' : 'active dispatches',
      icon: Truck,
      iconColor: 'text-indigo-500',
      onClick: () => setActiveTab('chalans'),
    },
  ];

  const godownTabs = [
    { id: 'stock', label: isBengali ? 'গুদাম স্টক ও র্যাক তালিকা' : 'Warehouse Stock & Racks', count: godownStock.length, icon: <Warehouse size={14} /> },
    { id: 'chalans', label: isBengali ? 'ডেলিভারি চালান ও গেটপাস' : 'Delivery Chalanis & Gate Pass', count: chalans.length, icon: <FileText size={14} /> },
    { id: 'transfers', label: isBengali ? 'কাউন্টার স্থানান্তর' : 'Transfers to Shop', count: godownTransfers.length, icon: <ArrowRightLeft size={14} /> },
  ];

  return (
    <RoleAccessGate titleBn="গুদাম ও চালানি লজিস্টিকস" requiredRole="দোকান মালিক ও ম্যানেজার">
      <div className="w-full space-y-3 pb-16 antialiased">
      
      {/* ── Official Executive Printable Report Header (Print Only) ── */}
      <div className="hidden print:block pb-3 mb-4 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
              গুদাম মজুদ ও পরিবহন সরবরাহ অডিট স্টেটমেন্ট
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
              {activeTenant?.name || 'LEDGERX ENTERPRISE'}
            </h1>
            <p className="text-xs text-slate-700 font-medium">
              {activeTenant?.address || 'কেন্দ্রীয় গুদাম ও ওয়্যারহাউস, ঢাকা'} • ফোন: {activeTenant?.phone || '০১৭০০-০০০০০০'}
            </p>
            {(activeTenant?.vatBinNumber || activeTenant?.bin) && (
              <p className="text-xs font-mono font-bold text-slate-800">
                মূসক নিবন্ধন / BIN: {activeTenant.vatBinNumber || activeTenant.bin}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded mb-1">
              WAREHOUSE AUDIT STATEMENT
            </span>
            <p className="text-xs font-mono font-bold text-slate-800">
              তারিখ: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
            <p className="text-[11px] text-slate-600 font-medium">
              রিপোর্ট টাইপ: {activeTab === 'stock' ? 'মজুদ পণ্য তালিকা' : activeTab === 'chalans' ? 'ডেলিভারি চালান খতিয়ান' : 'দোকান স্থানান্তর হিস্ট্রি'}
            </p>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-900 uppercase">
            {activeTab === 'stock' 
              ? 'গুদাম মজুদ ও স্টক মূল্যায়ন বিবরণী (GODOWN INVENTORY LEDGER)' 
              : activeTab === 'chalans' 
              ? 'গেটপাস ও ডেলিভারি চালান খতিয়ান (DELIVERY CHALAN REGISTER)' 
              : 'কাউন্টার মাল স্থানান্তর হিস্ট্রি (TRANSFER LOG)'}
          </span>
          <span className="font-mono text-slate-700">
            মোট বাল্ক প্যাকেজ: <strong>{totalBagsInGodown.toLocaleString()}</strong> | খুচরা একক: <strong>{totalWeightKgInGodown.toLocaleString()}</strong> | চালান সংখ্যা: <strong>{chalans.length}</strong>
          </span>
        </div>
      </div>

      {/* ── 1. Compact Unified Page Header ── */}
      <UnifiedPageHeader
        icon={Warehouse}
        title={isBengali ? 'গুদাম ও চালানি লজিস্টিকস খাতা' : 'Godown Warehouse & Chalani Logistics'}
        subtitle={isBengali ? 'গুদামের স্টক ট্র্যাকিং, ট্রাক চালানে মাল গ্রহণ ও ডেলিভারি গেটপাস নিয়ন্ত্রণ' : 'Warehouse inventory control, truck dispatches, and 3-copy delivery chalanis'}
        badge={isBengali ? '৩-কপি চালান' : '3-Copy Chalani'}
        badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
        showBack={true}
        backTo="/"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-950 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <ArrowRightLeft size={14} className="text-indigo-700" />
              <span>{isBengali ? 'দোকানে পাঠান' : 'To Counter'}</span>
            </button>
            <button
              onClick={() => setIsIntakeOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Truck size={14} className="text-slate-700" />
              <span>{isBengali ? '+ ট্রাক ইনটেক' : '+ Intake'}</span>
            </button>
            <button
              onClick={() => setIsChalaniOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <FileText size={15} />
              <span>{isBengali ? '+ ৩-কপি চালান' : '+ Issue Chalani'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer active:scale-95 hidden sm:flex items-center justify-center"
              title={isBengali ? 'প্রিন্ট খতিয়ান (Ctrl+P)' : 'Print Ledger'}
            >
              <Printer size={15} />
            </button>
          </div>
        }
      />

      {/* ── 2. Slim Executive Metric Ribbon ── */}
      <MetricRibbon metrics={godownMetrics} />

      {/* ── 3. Single-Row Unified Filter & Search Toolbar ── */}
      <UnifiedToolbar
        tabs={godownTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === 'stock'
            ? (isBengali ? 'পণ্য বা র্যাক দিয়ে খুঁজুন...' : 'Search product or rack...')
            : (isBengali ? 'চালান নং বা ক্রেতা দিয়ে খুঁজুন...' : 'Search chalan or party...')
        }
      />

      {/* ── Main Tabbed Content Card ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">

        {/* ── Tab 1: Godown Stock & Racks ── */}
        {activeTab === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{isBengali ? 'পণ্যের নাম ও ক্যাটাগরি' : 'Product & Category'}</th>
                  <th className="py-3.5 px-4">{isBengali ? 'গুদাম ও র্যাক অবস্থান' : 'Godown Room & Rack'}</th>
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'প্যাকেজ / ব্যাচ সংখ্যা' : 'Package / Bulk Qty'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'মোট খুচরা স্টক' : 'Total Base Stock'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'ক্রয় দর (৳)' : 'Cost Price (৳)'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'মোট মজুদ মূল্য' : 'Total Asset Value'}</th>
                  <th className="py-3.5 px-4 text-center print:hidden">{isBengali ? 'অ্যাকশন' : 'Action'}</th>
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
                    const valuationPoisha = (item.costPriceBasePoisha || 0) * (item.quantityInBaseUnit || item.bagsCount || 0);

                    return (
                      <tr key={item.id} className="hover:bg-pink-50/20 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-900 text-sm">{item.name}</p>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.category || 'সাধারণ'} 
                            {Number(item.bulkConversionFactor) > 1 && ` • ${item.bulkConversionFactor} ${item.baseUnit || 'একক'}/${item.bulkUnitName || 'প্যাক'}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800">{item.godownName}</p>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200 mt-0.5">
                            {item.rackLocation || 'ফ্লোর স্টক'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-sm text-slate-900">
                          {item.bagsCount} <span className="text-xs text-slate-500 font-normal">{item.bulkUnitName || item.unit || 'একক'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                          {(item.quantityInBaseUnit ?? item.bagsCount ?? 0).toLocaleString()} {item.baseUnit || item.bulkUnitName || item.unit || 'একক'}
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
                        <td className="py-3.5 px-4 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setIsChalaniOpen(true)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-xs transition cursor-pointer border border-slate-200"
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
                  <th className="py-3.5 px-4 text-center print:hidden">{isBengali ? 'প্রিন্ট ও অ্যাকশন' : 'Print & Action'}</th>
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
                    <tr key={chalan.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-black text-sm text-slate-900 font-mono block">
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

                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-slate-900">
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

                      <td className="py-3.5 px-4 text-center print:hidden">
                        <button
                          onClick={() => setActivePrintChalan(chalan)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs active:scale-95"
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
                  <th className="py-3.5 px-4 text-center">{isBengali ? 'স্থানান্তরিত পরিমাণ' : 'Transferred Units'}</th>
                  <th className="py-3.5 px-4 text-right">{isBengali ? 'দোকানে যোগকৃত স্টক' : 'Store Stock Added'}</th>
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
                        {xfer.bagsTransferred || 0} {xfer.bulkUnitName || 'একক'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700">
                        +{xfer.quantityTransferred} {xfer.baseUnit || 'একক'}
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

        {/* ── Official Executive Printable Report Sign-off (Print Only) ── */}
        <div className="hidden print:grid grid-cols-4 gap-6 pt-10 mt-8 text-center text-xs text-slate-900 border-t-2 border-slate-900 page-break-inside-avoid">
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">গুদাম ইনচার্জ / লোডিং অ্যাসিস্ট্যান্ট</p>
            <p className="text-[10px] text-slate-600">Warehouse In-charge</p>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">লজিস্টিকস ও পরিবহন অফিসার</p>
            <p className="text-[10px] text-slate-600">Logistics Officer</p>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">অভ্যন্তরীণ নিরীক্ষক</p>
            <p className="text-[10px] text-slate-600">Internal Auditor</p>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <p className="font-bold">স্বত্বাধিকারী / অনুমোদিত সীল ও স্বাক্ষর</p>
            <p className="text-[10px] text-slate-600">Managing Director / Seal</p>
          </div>
        </div>

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

// ── Edit Godown Stock Modal Helper (Universal) ─────────────────────────────
function EditGodownStockModal({ stockItem, isOpen, onClose, onSave, isBengali }) {
  const [name, setName] = useState(stockItem.name || '');
  const [godownName, setGodownName] = useState(stockItem.godownName || 'প্রধান গুদাম');
  const [rackLocation, setRackLocation] = useState(stockItem.rackLocation || '');
  const [bulkUnitName, setBulkUnitName] = useState(stockItem.bulkUnitName || stockItem.unit || 'পিস');
  const [quantity, setQuantity] = useState((stockItem.bagsCount ?? stockItem.quantity ?? 0).toString());
  const [costTaka, setCostTaka] = useState(poishaToTaka(stockItem.costPriceBasePoisha || 0).toString());

  // Optional sub-unit packaging ratio
  const [showPackaging, setShowPackaging] = useState(
    Boolean(stockItem.bulkConversionFactor && Number(stockItem.bulkConversionFactor) > 1)
  );
  const [baseUnit, setBaseUnit] = useState(stockItem.baseUnit || 'পিস');
  const [conversionFactor, setConversionFactor] = useState(
    (stockItem.bulkConversionFactor || 1).toString()
  );

  const quickUnits = ['পিস', 'কার্টন', 'বক্স', 'বস্তা', 'কেজি', 'লিটার', 'বান্ডিল', 'রোল', 'সেট'];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 0;
    const factor = showPackaging ? (parseFloat(conversionFactor) || 1) : 1;
    const totalBaseQty = qty * factor;

    onSave({
      name: name.trim(),
      godownName: godownName.trim() || 'প্রধান গুদাম',
      rackLocation: rackLocation.trim(),
      bulkUnitName: bulkUnitName.trim() || 'একক',
      baseUnit: showPackaging ? (baseUnit.trim() || 'একক') : (bulkUnitName.trim() || 'একক'),
      bagsCount: qty,
      bulkConversionFactor: factor,
      quantityInBaseUnit: totalBaseQty,
      costPriceBasePoisha: takaToPoisha(costTaka || '0'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white shadow-slate-900/20 flex items-center justify-center">
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
              {isBengali ? 'পণ্যের নাম' : 'Product Name'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm font-bold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all"
            />
          </div>

          {/* Quick Unit Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                {isBengali ? 'একক / পরিমাপের ধরণ' : 'Stock Unit'}
              </label>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                নির্বাচিত: {bulkUnitName}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setBulkUnitName(u)}
                  className={`px-2.5 py-1 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                    bulkUnitName === u
                      ? 'bg-slate-900 text-white shadow-xs scale-105'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="বা কাস্টম একক লিখুন..."
              value={bulkUnitName}
              onChange={e => setBulkUnitName(e.target.value)}
              className="w-full text-xs font-bold h-9 px-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? `মজুদ পরিমাণ (${bulkUnitName})` : `Stock Quantity (${bulkUnitName})`} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full text-sm font-black h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all tabular-nums"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? `প্রতি ${bulkUnitName} ক্রয় দর (৳)` : `Cost Price per ${bulkUnitName} (BDT)`}
              </label>
              <input
                type="number"
                step="any"
                value={costTaka}
                onChange={e => setCostTaka(e.target.value)}
                className="w-full text-sm font-black h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'গুদামের নাম / শাখা' : 'Warehouse Room'}
              </label>
              <input
                type="text"
                value={godownName}
                onChange={e => setGodownName(e.target.value)}
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'র্যাক / সেলফ / অবস্থান' : 'Rack / Shelf Location'}
              </label>
              <input
                type="text"
                value={rackLocation}
                onChange={e => setRackLocation(e.target.value)}
                placeholder="A-1, B-2..."
                className="w-full text-sm font-semibold h-11 px-3.5 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:border-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Optional Sub-unit Packaging Ratio Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPackaging(!showPackaging)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition py-1 cursor-pointer"
            >
              <ChevronDown size={14} className={`transform transition-transform ${showPackaging ? 'rotate-180' : ''}`} />
              <span>{isBengali ? '📦 সাব-ইউনিট / প্যাকেজিং অনুপাত (ঐচ্ছিক)' : '📦 Sub-unit / Packaging Ratio (Optional)'}</span>
            </button>

            {showPackaging && (
              <div className="mt-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isBengali ? 'খুচরা একক নাম' : 'Base Sub-Unit Name'}
                  </label>
                  <input
                    type="text"
                    value={baseUnit}
                    onChange={e => setBaseUnit(e.target.value)}
                    placeholder="পিস / কেজি"
                    className="w-full text-xs font-bold h-9 px-3 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    {isBengali ? `প্রতি ${bulkUnitName} এ পরিমাণ` : `Sub-Units per ${bulkUnitName}`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={conversionFactor}
                    onChange={e => setConversionFactor(e.target.value)}
                    placeholder="যেমন: ২৪ বা ৫০"
                    className="w-full text-xs font-bold h-9 px-3 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>
            )}
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
              className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-slate-900 hover:bg-slate-800 shadow-md transition cursor-pointer active:scale-95"
            >
              {isBengali ? 'আপডেট সংরক্ষণ ✓' : 'Save Changes ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
