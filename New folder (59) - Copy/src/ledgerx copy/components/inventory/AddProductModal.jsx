import React, { useState, useEffect, useRef } from 'react';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { poishaToTaka, takaToPoisha, formatCurrency } from '../../utils/currency';
import { 
  Package, 
  Warehouse, 
  Building2, 
  Truck, 
  ArrowLeftRight, 
  CheckCircle2, 
  X, 
  Tag, 
  ChevronDown, 
  Plus, 
  Coins, 
  ShieldCheck,
  Split,
  Layers,
  Store,
  FileText,
  DollarSign,
  Barcode,
  Sparkles,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mobilePOSBridge } from '../../utils/MobilePOSBridge';

export default function AddProductModal({ isOpen, onClose, onAdd, isBengali, profile, existingCategories = [], initialBarcode = '' }) {
  const { suppliers = [], addSupplier, godownStock = [] } = useKhata();
  const { activeTenant } = useTenant();

  // Basic Product State
  const [name, setName] = useState('');
  const [saleTaka, setSaleTaka] = useState('');
  const [costTaka, setCostTaka] = useState('');
  const [unit, setUnit] = useState('পিস');
  
  // Total Intake Quantity (মোট আমদানি পরিমাণ)
  const [totalQuantity, setTotalQuantity] = useState('10');

  // Godown & Shop Split Mode
  const [hasGodownSplit, setHasGodownSplit] = useState(false);
  const [shopQuantity, setShopQuantity] = useState('10');
  const [godownQuantity, setGodownQuantity] = useState('0');
  const [godownName, setGodownName] = useState('প্রধান কেন্দ্রীয় গুদাম (রুম ১)');
  const [rackLocation, setRackLocation] = useState('র্যাক এ-১');

  // Mohajon / Supplier Trigger State
  const [hasSupplierLink, setHasSupplierLink] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [paymentMode, setPaymentMode] = useState('CREDIT'); // 'CREDIT' | 'CASH'
  const [truckNumber, setTruckNumber] = useState('');
  const [chalanNumber, setChalanNumber] = useState('');
  
  // Inline Quick Add Supplier
  const [showQuickAddSupplier, setShowQuickAddSupplier] = useState(false);
  const [newSuppName, setNewSuppName] = useState('');
  const [newSuppPhone, setNewSuppPhone] = useState('');

  // Optional / Advanced Details
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState(initialBarcode || '');
  const [minStock, setMinStock] = useState('5');
  const [brand, setBrand] = useState('');
  const [isDualUnit, setIsDualUnit] = useState(false);
  const [bulkUnitName, setBulkUnitName] = useState('কার্টন');
  const [packSize, setPackSize] = useState('24');

  // Input refs for smooth step-by-step Enter progression
  const nameRef = useRef(null);
  const saleRef = useRef(null);
  const costRef = useRef(null);
  const totalQtyRef = useRef(null);

  // Sync initial barcode when provided
  useEffect(() => {
    if (initialBarcode) {
      setSku(initialBarcode);
    }
  }, [initialBarcode]);

  // Live Barcode Scanner from Mobile Phone
  useEffect(() => {
    const unsub = mobilePOSBridge.on('barcode_scanned', (scanData) => {
      if (scanData?.barcode) {
        setSku(scanData.barcode);
        toast.success(
          isBengali
            ? `📱 মোবাইল থেকে বারকোড স্ক্যান হয়েছে: ${scanData.barcode}`
            : `📱 Barcode scanned from phone: ${scanData.barcode}`,
          { icon: '🎯' }
        );
        nameRef.current?.focus();
      }
    });
    return unsub;
  }, [isBengali]);

  // Initialize and sync quantities
  useEffect(() => {
    if (chalanNumber === '') {
      setChalanNumber(`CH-${Date.now().toString().slice(-6)}`);
    }
  }, []);

  if (!isOpen) return null;

  const UNIVERSAL_UNITS = [
    { key: 'পিস', labelBn: 'পিস (Pcs)', labelEn: 'Piece' },
    { key: 'কেজি', labelBn: 'কেজি (Kg)', labelEn: 'Kg' },
    { key: 'প্যাকেট', labelBn: 'প্যাকেট (Pkt)', labelEn: 'Packet' },
    { key: 'কার্টন', labelBn: 'কার্টন (Ctn)', labelEn: 'Carton' },
    { key: 'বক্স', labelBn: 'বক্স (Box)', labelEn: 'Box' },
    { key: 'বস্তা', labelBn: 'বস্তা (Bag)', labelEn: 'Bag' },
    { key: 'লিটার', labelBn: 'লিটার (Ltr)', labelEn: 'Liter' },
    { key: 'ডজন', labelBn: 'ডজন (Doz)', labelEn: 'Dozen' },
    { key: 'গজ', labelBn: 'গজ (Yrd)', labelEn: 'Yard' },
    { key: 'সেট', labelBn: 'সেট (Set)', labelEn: 'Set' },
  ];

  const GODOWN_LOCATIONS = [
    'প্রধান কেন্দ্রীয় গুদাম (রুম ১)',
    'উত্তর গুদাম (রুম ২)',
    'দক্ষিণ গুদাম (রুম ৩)',
    'গ্রাউন্ড ফ্লোর বাফার গুদাম',
  ];

  // ── Smart Quantity Synchronization ──
  const handleTotalQtyChange = (val) => {
    setTotalQuantity(val);
    const num = parseFloat(val) || 0;
    if (!hasGodownSplit) {
      setShopQuantity(String(num));
      setGodownQuantity('0');
    } else {
      // Keep ratio or allocate remainder
      const gNum = parseFloat(godownQuantity) || 0;
      if (gNum <= num) {
        setShopQuantity(String(Math.max(0, num - gNum)));
      } else {
        setGodownQuantity(String(num));
        setShopQuantity('0');
      }
    }
  };

  const handleShopQtyChange = (val) => {
    setShopQuantity(val);
    const sNum = parseFloat(val) || 0;
    const totNum = parseFloat(totalQuantity) || 0;
    if (sNum > totNum) {
      setTotalQuantity(String(sNum));
      setGodownQuantity('0');
    } else {
      setGodownQuantity(String(Math.max(0, totNum - sNum)));
    }
  };

  const handleGodownQtyChange = (val) => {
    setGodownQuantity(val);
    const gNum = parseFloat(val) || 0;
    const totNum = parseFloat(totalQuantity) || 0;
    if (gNum > totNum) {
      setTotalQuantity(String(gNum));
      setShopQuantity('0');
    } else {
      setShopQuantity(String(Math.max(0, totNum - gNum)));
    }
  };

  // ── Quick Presets ──
  const applyPreset = (mode) => {
    const tot = parseFloat(totalQuantity) || 0;
    setHasGodownSplit(true);
    if (mode === 'ALL_SHOP') {
      setShopQuantity(String(tot));
      setGodownQuantity('0');
    } else if (mode === 'ALL_GODOWN') {
      setShopQuantity('0');
      setGodownQuantity(String(tot));
    } else if (mode === 'HALF_HALF') {
      const half = Math.floor(tot / 2);
      setShopQuantity(String(half));
      setGodownQuantity(String(tot - half));
    } else if (mode === 'EIGHTY_TWENTY') {
      const godown = Math.round(tot * 0.8);
      setGodownQuantity(String(godown));
      setShopQuantity(String(tot - godown));
    }
  };

  // ── Quick Add Supplier Inline ──
  const handleQuickAddSupplier = () => {
    if (!newSuppName.trim()) {
      toast.error(isBengali ? 'মহাজনের নাম লিখুন' : 'Enter supplier name');
      return;
    }
    const newSupp = addSupplier({
      name: newSuppName.trim(),
      phone: newSuppPhone.trim() || '০১৭০০০০০০০০',
      company: newSuppName.trim(),
      currentDuePoisha: 0,
      balancePoisha: 0,
    });
    if (newSupp?.id) {
      setSupplierId(newSupp.id);
      setNewSuppName('');
      setNewSuppPhone('');
      setShowQuickAddSupplier(false);
      toast.success(isBengali ? 'নতুন মহাজন তৈরি ও নির্বাচিত হয়েছে!' : 'New supplier added and selected!');
    }
  };

  // ── Form Submission ──
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error(isBengali ? 'পণ্যের নাম লিখুন' : 'Enter product name');
      nameRef.current?.focus();
      return;
    }
    if (!saleTaka || Number(saleTaka) < 0) {
      toast.error(isBengali ? 'সঠিক বিক্রয়মূল্য লিখুন' : 'Enter valid sale price');
      saleRef.current?.focus();
      return;
    }

    const parsedTotalQty = parseFloat(totalQuantity) || 0;
    const parsedShopQty = hasGodownSplit ? (parseFloat(shopQuantity) || 0) : parsedTotalQty;
    const parsedGodownQty = hasGodownSplit ? (parseFloat(godownQuantity) || 0) : 0;

    const parsedCostPoisha = takaToPoisha(parseFloat(costTaka) || 0);
    const parsedSalePoisha = takaToPoisha(parseFloat(saleTaka) || 0);
    const parsedPack = parseFloat(packSize) || 24;

    const selectedSupp = suppliers.find((s) => s.id === supplierId);
    const totalPurchasePoisha = Math.round(parsedTotalQty * parsedCostPoisha);

    const payload = {
      id: `prod_${Date.now()}`,
      name: name.trim(),
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      category: category.trim() || (isBengali ? 'সাধারণ পণ্য' : 'General Item'),
      department: 'UNIVERSAL',
      costPricePoisha: parsedCostPoisha,
      costPriceBasePoisha: parsedCostPoisha,
      salePricePoisha: parsedSalePoisha,
      sellingPriceBasePoisha: parsedSalePoisha,
      bulkSellingPricePoisha: isDualUnit ? Math.round(parsedSalePoisha * parsedPack * 0.95) : 0,
      unit,
      baseUnit: unit,
      
      // Stock Distribution
      stock: parsedShopQty,
      currentStockInBaseUnit: parsedShopQty,
      shopQuantity: parsedShopQty,
      godownQuantity: parsedGodownQty,
      godownBagsCount: isDualUnit ? Math.round(parsedGodownQty / parsedPack) : parsedGodownQty,
      godownName: hasGodownSplit && parsedGodownQty > 0 ? godownName : undefined,
      rackLocation: hasGodownSplit && parsedGodownQty > 0 ? rackLocation : undefined,
      hasGodownSplit,

      // Supplier / Mohajon Trigger Details
      supplierId: hasSupplierLink && supplierId ? supplierId : undefined,
      supplierName: selectedSupp ? selectedSupp.name : undefined,
      paymentMode: hasSupplierLink && supplierId ? paymentMode : undefined,
      truckNumber: hasSupplierLink && truckNumber ? truckNumber.trim() : undefined,
      chalanNumber: hasSupplierLink && chalanNumber ? chalanNumber.trim() : undefined,
      totalPurchaseAmountPoisha: hasSupplierLink && supplierId ? totalPurchasePoisha : undefined,

      minStock: parseFloat(minStock) || 5,
      isDualUnit,
      hasBulkUnit: isDualUnit,
      bulkUnitName: isDualUnit ? bulkUnitName : '',
      packSize: isDualUnit ? parsedPack : 1,
      bulkConversionFactor: isDualUnit ? parsedPack : 1,
      brand: brand.trim(),
    };

    onAdd(payload);
  };

  const totNum = parseFloat(totalQuantity) || 0;
  const sNum = hasGodownSplit ? (parseFloat(shopQuantity) || 0) : totNum;
  const gNum = hasGodownSplit ? (parseFloat(godownQuantity) || 0) : 0;
  const shopPercent = totNum > 0 ? Math.round((sNum / totNum) * 100) : 100;
  const godownPercent = totNum > 0 ? Math.round((gNum / totNum) * 100) : 0;
  const totalCostPoisha = Math.round(totNum * takaToPoisha(parseFloat(costTaka) || 0));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-slate-100 animate-in zoom-in-95 max-h-[94vh] overflow-y-auto custom-scrollbar">
        
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Package size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {isBengali ? 'নতুন পণ্য ও স্টক আমদানি খাতা' : 'Add New Product & Stock Intake'}
                </h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  {isBengali ? 'গুদাম ও মহাজন মার্জড' : 'Godown & Supplier Merged'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isBengali 
                  ? 'এক স্ক্রিনেই পণ্য তৈরি, দোকান ও গুদামে স্টক ভাগ এবং মহাজন চালান সমন্বয় করুন' 
                  : 'Create product, split stock between shop & godown, and link supplier bill in one unified flow'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── 1. Barcode & Product Name Section ── */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            {/* Barcode / SKU (5 cols on desktop/tablet) */}
            <div className="sm:col-span-5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Barcode size={14} className="text-emerald-600" />
                  <span>{isBengali ? 'বারকোড / SKU' : 'Barcode / SKU'}</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <Smartphone size={11} className="animate-pulse" />
                  {isBengali ? 'ফোন স্ক্যানার লাইভ' : 'Phone Scanner Live'}
                </span>
              </label>
              <div className="flex items-center h-12 rounded-2xl border-2 border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all overflow-hidden px-3">
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      nameRef.current?.focus();
                    }
                  }}
                  placeholder={isBengali ? 'ফোন দিয়ে স্ক্যান বা লিখুন' : 'Scan via phone or type'}
                  className="w-full text-xs sm:text-sm font-mono font-bold bg-transparent focus:outline-none text-slate-900"
                />
                {sku && (
                  <button
                    type="button"
                    onClick={() => setSku('')}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                    title={isBengali ? 'মুছুন' : 'Clear'}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Product Name (7 cols) */}
            <div className="sm:col-span-7">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 block mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag size={14} className="text-indigo-600" />
                  <span>{isBengali ? 'পণ্যের নাম ও বিবরণ' : 'Product Name'}</span>
                  <span className="text-rose-500 font-bold">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium lowercase">
                  [Enter = পরবর্তী ঘর]
                </span>
              </label>
              <input
                ref={nameRef}
                type="text"
                required
                autoFocus={!initialBarcode}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    saleRef.current?.focus();
                  }
                }}
                placeholder={isBengali ? 'যেমন: চিনিগুঁড়া চাল / নাপা এক্সট্রা / রড ১২ মিমি' : 'e.g. Miniket Rice / Napa Extra / Steel Rod'}
                className="w-full text-sm sm:text-base font-bold h-12 px-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 focus:bg-white focus:border-slate-800 focus:ring-4 focus:ring-slate-900/10 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* ── 2. Pricing & Main Intake Quantity (3 Columns) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sale Price */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-emerald-800 block mb-1.5">
                {isBengali ? 'বিক্রয়মূল্য (টাকা)' : 'Sale Price (BDT)'} <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center h-12 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all overflow-hidden">
                <span className="w-9 h-full flex items-center justify-center font-black text-emerald-700 bg-emerald-100 select-none text-sm">৳</span>
                <input
                  ref={saleRef}
                  type="number"
                  step="any"
                  required
                  value={saleTaka}
                  onChange={(e) => setSaleTaka(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      costRef.current?.focus();
                    }
                  }}
                  placeholder="0.00"
                  className="w-full h-full px-3 text-base font-black bg-transparent focus:outline-none tabular-nums text-emerald-950"
                />
              </div>
            </div>

            {/* Cost Price */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                {isBengali ? 'ক্রয় খরচ / কেনা দাম' : 'Cost Price (BDT)'}
              </label>
              <div className="flex items-center h-12 rounded-2xl border-2 border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-slate-800 transition-all overflow-hidden">
                <span className="w-9 h-full flex items-center justify-center font-black text-slate-400 bg-slate-100 select-none text-sm">৳</span>
                <input
                  ref={costRef}
                  type="number"
                  step="any"
                  value={costTaka}
                  onChange={(e) => setCostTaka(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      totalQtyRef.current?.focus();
                    }
                  }}
                  placeholder="0.00"
                  className="w-full h-full px-3 text-sm font-bold bg-transparent focus:outline-none tabular-nums text-slate-900"
                />
              </div>
            </div>

            {/* Total Inward Quantity */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-indigo-900 block mb-1.5 flex items-center justify-between">
                <span>{isBengali ? 'মোট আমদানি পরিমাণ' : 'Total Intake Qty'}</span>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                  {unit}
                </span>
              </label>
              <div className="flex items-center h-12 rounded-2xl border-2 border-indigo-300 bg-indigo-50/30 focus-within:bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-200 transition-all overflow-hidden">
                <span className="w-9 h-full flex items-center justify-center font-black text-indigo-700 bg-indigo-100 select-none text-xs">
                  <Split size={15} />
                </span>
                <input
                  ref={totalQtyRef}
                  type="number"
                  step="any"
                  value={totalQuantity}
                  onChange={(e) => handleTotalQtyChange(e.target.value)}
                  placeholder="0"
                  className="w-full h-full px-3 text-base font-black bg-transparent focus:outline-none tabular-nums text-indigo-950"
                />
              </div>
            </div>
          </div>

          {/* ── 3. Universal Unit Chips ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                {isBengali ? 'একক নির্বাচন করুন (Unit):' : 'Select Product Unit:'}
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {isBengali ? `বর্তমান একক: ${unit}` : `Unit: ${unit}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {UNIVERSAL_UNITS.map((u) => {
                const isSelected = unit === u.key;
                return (
                  <button
                    key={u.key}
                    type="button"
                    onClick={() => setUnit(u.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-slate-400'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isBengali ? u.labelBn : u.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 4. MERGED FEATURE: Godown & Shop Stock Allocation Panel ── */}
          <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Warehouse size={17} />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-indigo-950 leading-tight">
                    {isBengali ? 'গুদাম ও দোকান স্টক বন্টন (Warehouse & Shop Split)' : 'Godown & Shop Stock Allocation'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {isBengali ? 'মোট পরিমাণ থেকে কতটুকু গুদামে যাবে এবং কতটুকু দোকানে কাউন্টারে থাকবে' : 'Split main quantity between central godown and shop counter'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !hasGodownSplit;
                  setHasGodownSplit(nextState);
                  if (!nextState) {
                    setShopQuantity(totalQuantity);
                    setGodownQuantity('0');
                  } else {
                    applyPreset('HALF_HALF');
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                  hasGodownSplit
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                }`}
              >
                <span>{hasGodownSplit ? (isBengali ? 'বন্টন সক্রিয় ✓' : 'Split Active ✓') : (isBengali ? '+ বন্টন করুন' : '+ Split Stock')}</span>
              </button>
            </div>

            {/* Split Visualizer Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <Store size={13} />
                  <span>{isBengali ? `দোকান কাউন্টার: ${sNum} ${unit} (${shopPercent}%)` : `Shop: ${sNum} (${shopPercent}%)`}</span>
                </span>
                <span className="text-indigo-700 flex items-center gap-1">
                  <Warehouse size={13} />
                  <span>{isBengali ? `গুদামে মজুদ: ${gNum} ${unit} (${godownPercent}%)` : `Godown: ${gNum} (${godownPercent}%)`}</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex shadow-inner">
                <div 
                  style={{ width: `${shopPercent}%` }} 
                  className="h-full bg-emerald-500 transition-all duration-300 relative group"
                  title={`Shop: ${sNum} ${unit}`}
                />
                <div 
                  style={{ width: `${godownPercent}%` }} 
                  className="h-full bg-indigo-600 transition-all duration-300 relative group"
                  title={`Godown: ${gNum} ${unit}`}
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 mr-1">
                {isBengali ? 'কুইক বন্টন:' : 'Presets:'}
              </span>
              <button
                type="button"
                onClick={() => applyPreset('ALL_SHOP')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                  sNum === totNum && gNum === 0 
                    ? 'bg-emerald-600 text-white border-emerald-700' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                🏬 {isBengali ? 'সব দোকানে (100%)' : '100% Shop'}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ALL_GODOWN')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                  gNum === totNum && sNum === 0 
                    ? 'bg-indigo-600 text-white border-indigo-700' 
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50'
                }`}
              >
                🏭 {isBengali ? 'সব গুদামে (100%)' : '100% Godown'}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('HALF_HALF')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                ⚖️ {isBengali ? '৫০/৫০ ভাগ' : '50/50 Split'}
              </button>
              <button
                type="button"
                onClick={() => applyPreset('EIGHTY_TWENTY')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                🎯 {isBengali ? '৮০% গুদাম / ২০% দোকান' : '80% Godown / 20% Shop'}
              </button>
            </div>

            {/* Split Quantity Input Fields */}
            {hasGodownSplit && (
              <div className="pt-2 border-t border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                {/* Shop Counter Stock */}
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <label className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Store size={12} className="text-emerald-700" />
                      <span>{isBengali ? 'দোকান কাউন্টার স্টক' : 'Shop Counter Stock'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">{unit}</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={shopQuantity}
                    onChange={(e) => handleShopQtyChange(e.target.value)}
                    placeholder="0"
                    className="w-full text-sm font-black h-9 px-3 rounded-lg border border-emerald-300 bg-white focus:ring-2 focus:ring-emerald-400 text-emerald-950 tabular-nums"
                  />
                  <p className="text-[9.5px] text-emerald-700 mt-1 font-medium">
                    {isBengali ? 'সরাসরি POS ও কাউন্টারে বিক্রির জন্য প্রস্তুত' : 'Ready for immediate POS checkout'}
                  </p>
                </div>

                {/* Godown Stock */}
                <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200">
                  <label className="text-[11px] font-black uppercase tracking-wider text-indigo-900 block mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Warehouse size={12} className="text-indigo-700" />
                      <span>{isBengali ? 'গুদামে মজুদ স্টক' : 'Godown Storage Stock'}</span>
                    </span>
                    <span className="text-[10px] text-indigo-700 font-bold">{unit}</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={godownQuantity}
                    onChange={(e) => handleGodownQtyChange(e.target.value)}
                    placeholder="0"
                    className="w-full text-sm font-black h-9 px-3 rounded-lg border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-400 text-indigo-950 tabular-nums"
                  />
                  <p className="text-[9.5px] text-indigo-700 mt-1 font-medium">
                    {isBengali ? 'গুদাম ও চালানি খাতায় ইনভেন্টরি যুক্ত হবে' : 'Logged into godown inventory ledger'}
                  </p>
                </div>

                {/* Godown Room & Rack Selection */}
                {parseFloat(godownQuantity) > 0 && (
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">
                        {isBengali ? 'গুদাম রুম নির্বাচন:' : 'Godown Room:'}
                      </label>
                      <select
                        value={godownName}
                        onChange={(e) => setGodownName(e.target.value)}
                        className="w-full text-xs font-bold h-9 px-2.5 rounded-lg border border-slate-300 bg-white"
                      >
                        {GODOWN_LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">
                        {isBengali ? 'র্যাক / তাক অবস্থান:' : 'Rack / Shelf Location:'}
                      </label>
                      <input
                        type="text"
                        value={rackLocation}
                        onChange={(e) => setRackLocation(e.target.value)}
                        placeholder="যেমন: র্যাক এ-১, চেম্বার ৪"
                        className="w-full text-xs font-bold h-9 px-2.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 5. MERGED FEATURE: Mohajon / Supplier Trigger Panel ── */}
          <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
                  <Building2 size={17} />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {isBengali ? 'মহাজন / সাপ্লায়ার চালান সংযুক্ত করুন (ঐচ্ছিক)' : 'Link Supplier / Mohajon Bill (Optional)'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {isBengali ? 'যে মহাজন বা মিল থেকে মাল এসেছে তার দেনা ও চালানি রেকর্ড স্বয়ংক্রিয় তৈরি হবে' : 'Automatically create purchase bill & update supplier ledger'}
                  </p>
                </div>
              </div>

              {/* Toggle Supplier Linking */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !hasSupplierLink;
                  setHasSupplierLink(nextState);
                  if (nextState && !supplierId && suppliers.length > 0) {
                    setSupplierId(suppliers[0].id);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border ${
                  hasSupplierLink
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
              >
                <span>{hasSupplierLink ? (isBengali ? 'মহাজন লিংক সক্রিয় ✓' : 'Supplier Linked ✓') : (isBengali ? '+ মহাজন লিংক' : '+ Link Supplier')}</span>
              </button>
            </div>

            {hasSupplierLink && (
              <div className="pt-2 border-t border-slate-200 space-y-3 animate-in fade-in">
                {/* Supplier Dropdown + Inline Add */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 block mb-1">
                      {isBengali ? 'মহাজন / ডিস্ট্রিবিউটর নির্বাচন:' : 'Select Mohajon / Supplier:'}
                    </label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full text-xs font-bold h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-slate-800"
                    >
                      <option value="">-- {isBengali ? 'কোনো মহাজন ছাড়া (নিজস্ব প্রারম্ভিক স্টক)' : 'No Supplier / Opening Stock'} --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.company || 'মহাজন'}) • দেনা: ৳{poishaToTaka(s.balancePoisha || s.currentDuePoisha || 0).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setShowQuickAddSupplier(!showQuickAddSupplier)}
                      className="w-full h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus size={14} className="text-indigo-600" />
                      <span>{isBengali ? 'নতুন মহাজন' : 'New Supplier'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Quick Add Supplier Form */}
                {showQuickAddSupplier && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5 animate-in fade-in">
                    <p className="text-[11px] font-black text-slate-800">
                      {isBengali ? 'দ্রুত নতুন মহাজন সংরক্ষণ করুন:' : 'Quick Add New Supplier:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newSuppName}
                        onChange={(e) => setNewSuppName(e.target.value)}
                        placeholder={isBengali ? 'মহাজন / কোম্পানির নাম (বাধ্যতামূলক)' : 'Supplier Name (Required)'}
                        className="text-xs font-bold h-9 px-3 rounded-lg border border-slate-300 bg-slate-50"
                      />
                      <input
                        type="text"
                        value={newSuppPhone}
                        onChange={(e) => setNewSuppPhone(e.target.value)}
                        placeholder={isBengali ? 'মোবাইল নম্বর' : 'Phone Number'}
                        className="text-xs font-bold h-9 px-3 rounded-lg border border-slate-300 bg-slate-50"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickAddSupplier(false)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        {isBengali ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickAddSupplier}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-black cursor-pointer shadow-xs"
                      >
                        {isBengali ? 'সংরক্ষণ ও নির্বাচন' : 'Save & Select'}
                      </button>
                    </div>
                  </div>
                )}

                {/* If Supplier Selected: Financial & Invoice Details */}
                {supplierId && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">{isBengali ? 'মোট চালান ক্রয়মূল্য:' : 'Total Purchase Value:'}</span>
                      <span className="text-base font-black text-indigo-900 tabular-nums">
                        ৳{poishaToTaka(totalCostPoisha).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {/* Payment Mode */}
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block mb-1">
                          {isBengali ? 'পরিশোধ পদ্ধতি:' : 'Payment Mode:'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setPaymentMode('CREDIT')}
                            className={`flex-1 py-1 px-1.5 rounded-lg text-[10.5px] font-black transition border cursor-pointer ${
                              paymentMode === 'CREDIT'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            🔴 {isBengali ? 'বাকি চালান' : 'On Credit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMode('CASH')}
                            className={`flex-1 py-1 px-1.5 rounded-lg text-[10.5px] font-black transition border cursor-pointer ${
                              paymentMode === 'CASH'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            🟢 {isBengali ? 'নগদ ক্যাশ' : 'Cash Paid'}
                          </button>
                        </div>
                      </div>

                      {/* Chalan Number */}
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block mb-1">
                          {isBengali ? 'চালান নম্বর:' : 'Chalan No:'}
                        </span>
                        <input
                          type="text"
                          value={chalanNumber}
                          onChange={(e) => setChalanNumber(e.target.value)}
                          placeholder="CH-2026-XXXX"
                          className="w-full text-xs font-mono font-bold h-8 px-2.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      {/* Truck / Transport */}
                      <div>
                        <span className="text-[10px] text-slate-600 font-bold block mb-1">
                          {isBengali ? 'ট্রাক / গাড়ি নম্বর:' : 'Truck / Vehicle:'}
                        </span>
                        <input
                          type="text"
                          value={truckNumber}
                          onChange={(e) => setTruckNumber(e.target.value)}
                          placeholder={isBengali ? 'যেমন: ঢাকা মেট্রো-ট ১১-২২৩৩' : 'e.g. Local Van / Truck'}
                          className="w-full text-xs font-bold h-8 px-2.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 6. Collapsible Advanced Details (Barcode, Dual Unit, Category) ── */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-black text-slate-600 hover:text-slate-900 py-1 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronDown size={15} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
              <span>{isBengali ? '⚙️ অন্যান্য তথ্য (বারকোড, ক্যাটাগরি, কোম্পানি, পাইকারি প্যাক) — ঐচ্ছিক' : '⚙️ Other Details (Barcode, Category, Brand, Bulk Pack) — Optional'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 block mb-1">
                      {isBengali ? 'ক্যাটাগরি' : 'Category'}
                    </label>
                    <input
                      type="text"
                      list="universalAddCategories"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder={isBengali ? 'যেমন: খাদ্যশস্য, ইলেকট্রনিক্স, গার্মেন্টস' : 'e.g. Grocery, Electronics'}
                      className="w-full text-xs font-bold h-10 px-3 rounded-xl border border-slate-300 bg-white focus:border-slate-800 focus:outline-hidden"
                    />
                    <datalist id="universalAddCategories">
                      {(existingCategories || []).map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  {/* Barcode / SKU */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 block mb-1">
                      {isBengali ? 'বারকোড / SKU কোড' : 'Barcode / SKU'}
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="অটো বা স্ক্যান করুন"
                      className="w-full text-xs font-mono font-bold h-10 px-3 rounded-xl border border-slate-300 bg-white focus:border-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Min stock */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 block mb-1">
                      {isBengali ? 'কম স্টক হলে সতর্কবার্তা (Alert Limit)' : 'Low Stock Alert Threshold'}
                    </label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      className="w-full text-xs font-bold h-10 px-3 rounded-xl border border-slate-300 bg-white focus:border-slate-800 focus:outline-hidden"
                    />
                  </div>

                  {/* Brand / Company */}
                  <div>
                    <label className="text-[11px] font-black text-slate-600 block mb-1">
                      {isBengali ? 'ব্র্যান্ড / কোম্পানি / মিল' : 'Brand / Company'}
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="যেমন: প্রাণ, স্কয়ার, স্যামসাং, মেঘনা"
                      className="w-full text-xs font-bold h-10 px-3 rounded-xl border border-slate-300 bg-white focus:border-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Bulk / Dual Unit Box */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isDualUnit}
                      onChange={(e) => setIsDualUnit(e.target.checked)}
                      className="w-4 h-4 rounded accent-slate-900 cursor-pointer"
                    />
                    <span>{isBengali ? 'পাইকারি বড় প্যাক বা কার্টনেও বিক্রি হয়? (Dual Packaging)' : 'Sell in bulk cartons/packs too?'}</span>
                  </label>

                  {isDualUnit && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">
                          {isBengali ? 'বড় এককের নাম:' : 'Bulk Unit Name:'}
                        </span>
                        <input
                          type="text"
                          value={bulkUnitName}
                          onChange={(e) => setBulkUnitName(e.target.value)}
                          placeholder="কার্টন / বক্স / বস্তা"
                          className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block mb-1">
                          {isBengali ? `১ ${bulkUnitName}-এ কত ${unit}?:` : `Units per ${bulkUnitName}:`}
                        </span>
                        <input
                          type="number"
                          value={packSize}
                          onChange={(e) => setPackSize(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs font-black bg-white tabular-nums"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── 7. System Nodes Audit Health Indicator ── */}
          <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="font-mono text-slate-300">
                {isBengali ? 'সিস্টেম নোড সিঙ্ক:' : 'System Node Topology:'}
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                [NODE_INVENTORY (1200)] ↔ [NODE_PAYABLES (2010)] ↔ [NODE_AUDIT_TRAIL]
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              100% HEALTHY
            </span>
          </div>

          {/* ── 8. Action Buttons ── */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-2 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>{isBengali ? 'পণ্য ও স্টক নিশ্চিত করুন (Enter)' : 'Save & Distribute Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
