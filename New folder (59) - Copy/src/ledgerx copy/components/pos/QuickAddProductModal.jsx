import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { takaToPoisha, formatCurrency } from '../../utils/currency';
import { 
  PackagePlus, 
  Barcode, 
  X, 
  Check, 
  ShoppingCart, 
  Tag, 
  Sparkles,
  Layers,
  ArrowRight,
  Plus,
  Minus,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuickAddProductModal({
  isOpen,
  onClose,
  initialBarcode = '',
  onSaveAndAddToCart,
  onSaveOnly,
}) {
  const { isBengali } = useLocale();
  const nameInputRef = useRef(null);
  const priceInputRef = useRef(null);

  const [barcode, setBarcode] = useState(initialBarcode);
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [isManualCost, setIsManualCost] = useState(false);
  const [stock, setStock] = useState('10');
  const [unit, setUnit] = useState('পিস');
  const [category, setCategory] = useState('মুদি ও জেনারেল');

  const unitOptions = [
    { label: isBengali ? 'পিস' : 'Pcs', value: 'পিস' },
    { label: isBengali ? 'কেজি' : 'Kg', value: 'কেজি' },
    { label: isBengali ? 'প্যাকেট' : 'Pkt', value: 'প্যাকেট' },
    { label: isBengali ? 'বক্স' : 'Box', value: 'বক্স' },
    { label: isBengali ? 'লিটার' : 'Ltr', value: 'লিটার' },
    { label: isBengali ? 'ডজন' : 'Dzn', value: 'ডজন' },
  ];

  const categoryOptions = [
    'মুদি ও জেনারেল',
    'স্ন্যাক্স ও বেকারি',
    'পানীয় ও জুস',
    'দুগ্ধজাত পণ্য',
    'কসমেটিকস',
    'অন্যান্য'
  ];

  useEffect(() => {
    if (isOpen) {
      setBarcode(initialBarcode || '');
      setName('');
      setSellingPrice('');
      setCostPrice('');
      setIsManualCost(false);
      setStock('10');
      setUnit('পিস');
      setCategory('মুদি ও জেনারেল');
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialBarcode]);

  // Auto-calculate cost price as 85% of selling price if not manually edited
  const handlePriceChange = (val) => {
    setSellingPrice(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && !isManualCost) {
      setCostPrice(String(Math.round(num * 0.82))); // default ~18% margin
    } else if (!val) {
      if (!isManualCost) setCostPrice('');
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      priceInputRef.current?.focus();
    }
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(true);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (addToCart = true) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error(isBengali ? 'দয়া করে পণ্যের নাম লিখুন' : 'Please enter product name');
      nameInputRef.current?.focus();
      return;
    }
    const salePriceNum = Number(sellingPrice) || 0;
    if (salePriceNum <= 0) {
      toast.error(isBengali ? 'সঠিক বিক্রয় মূল্য লিখুন' : 'Please enter a valid selling price');
      priceInputRef.current?.focus();
      return;
    }

    const costPriceNum = Number(costPrice) || Math.round(salePriceNum * 0.82);
    const stockNum = Number(stock) || 10;
    const finalSku = barcode.trim() || `SKU${Date.now().toString().slice(-6)}`;

    const newProductData = {
      id: `prod_${Date.now()}`,
      sku: finalSku,
      barcode: finalSku,
      name: trimmedName,
      category,
      unit,
      baseUnit: unit,
      sellingPriceBasePoisha: takaToPoisha(salePriceNum),
      salePricePoisha: takaToPoisha(salePriceNum),
      sellingPrice: salePriceNum,
      costPriceBasePoisha: takaToPoisha(costPriceNum),
      costPricePoisha: takaToPoisha(costPriceNum),
      costPrice: costPriceNum,
      currentStockInBaseUnit: stockNum,
      stock: stockNum,
      minStock: 3,
      createdAt: new Date().toISOString(),
    };

    if (addToCart && onSaveAndAddToCart) {
      onSaveAndAddToCart(newProductData);
    } else if (onSaveOnly) {
      onSaveOnly(newProductData);
    }

    toast.success(
      isBengali
        ? `"${trimmedName}" ইনভেন্টরিতে যুক্ত হয়েছে!`
        : `"${trimmedName}" added to inventory!`,
      { icon: '✨' }
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-scaleUp">
        {/* Top Header Strip with Barcode Chip */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
              <PackagePlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-sm tracking-tight">
                  {isBengali ? 'অজ্ঞাত বারকোড — দ্রুত পণ্য যুক্ত করুন' : 'Unknown Barcode — Quick Add'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Instant POS
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isBengali
                  ? 'বারকোডটি সিস্টেমে নতুন। তথ্য পূরণ করে সাথে সাথে বিলে যোগ করুন।'
                  : 'New barcode scanned. Fill details to sell right away.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Barcode Identity Banner */}
          <div className="p-3 bg-slate-900 rounded-2xl text-white flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  {isBengali ? 'স্ক্যানকৃত বারকোড' : 'Scanned Barcode'}
                </span>
                <span className="font-mono font-black text-base tracking-wider text-emerald-300">
                  {barcode || 'N/A'}
                </span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {isBengali ? 'অটো-ডিটেক্টেড' : 'Auto-detected'}
            </span>
          </div>

          {/* Primary Input 1: Product Name */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              {isBengali ? 'পণ্যের নাম *' : 'Product Name *'}
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder={isBengali ? 'যেমন: ডোভ শ্যাম্পু ১৮০ মিলি' : 'e.g. Dove Shampoo 180ml'}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
            />
          </div>

          {/* Primary Input 2 & 3: Selling Price & Cost Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1">
                <span>{isBengali ? 'বিক্রয় মূল্য *' : 'Selling Price *'}</span>
                <span className="text-[10px] text-emerald-600 font-bold">টাকা (৳)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                <input
                  ref={priceInputRef}
                  type="number"
                  step="any"
                  value={sellingPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  onKeyDown={handlePriceKeyDown}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 text-base font-black bg-emerald-50/50 border border-emerald-300 rounded-2xl text-emerald-950 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1">
                <span>{isBengali ? 'কেনা মূল্য (পাইকারি)' : 'Cost Price'}</span>
                <span className="text-[10px] text-slate-400 font-bold">{isBengali ? 'ঐচ্ছিক' : 'Optional'}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                <input
                  type="number"
                  step="any"
                  value={costPrice}
                  onChange={(e) => {
                    setCostPrice(e.target.value);
                    setIsManualCost(true);
                  }}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* 1-Tap Quick Unit Pills Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {isBengali ? 'একক (Unit) — এক ক্লিকে নির্বাচন করুন' : 'Unit (Quick Select)'}
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {unitOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setUnit(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    unit === opt.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stock & Category Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Initial Stock Stepper */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBengali ? 'প্রাথমিক স্টক সংখ্যা' : 'Initial Stock'}
              </label>
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setStock(String(Math.max(1, (Number(stock) || 0) - 1)))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold shadow-xs active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full text-center text-xs font-mono font-black bg-transparent text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setStock(String((Number(stock) || 0) + 1))}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBengali ? 'পণ্যের ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-2xl text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors shadow-xs"
          >
            {isBengali ? 'বাতিল' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors shadow-xs"
            >
              {isBengali ? 'শুধু সেভ করুন' : 'Save Only'}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-2xl transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isBengali ? 'সেভ ও কার্টে যোগ (Enter ↵)' : 'Save & Add to Cart (Enter)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
