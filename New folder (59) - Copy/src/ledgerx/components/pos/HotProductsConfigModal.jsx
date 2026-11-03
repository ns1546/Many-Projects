import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, 
  X, 
  Search, 
  Check, 
  Trash2, 
  Plus, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { useKhata } from '../../context/KhataContext';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function HotProductsConfigModal({ isOpen, onClose }) {
  const { products, editProduct } = useKhata();
  const { isBengali, locale } = useLocale();

  // Active slot being assigned/edited (1 to 9)
  const [activeSlot, setActiveSlot] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for slot mappings: { '1': productId, '2': productId, ... }
  const [slotAssignments, setSlotAssignments] = useState(() => {
    const map = {};
    for (let i = 1; i <= 9; i++) {
      const match = products.find((p) => String(p.hotkey) === String(i));
      if (match) map[String(i)] = match.id;
    }
    return map;
  });

  // Re-sync slotAssignments when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const map = {};
      for (let i = 1; i <= 9; i++) {
        const match = products.find((p) => String(p.hotkey) === String(i));
        if (match) map[String(i)] = match.id;
      }
      setSlotAssignments(map);
      setActiveSlot(1);
      setSelectedCategory('ALL');
      setSearchQuery('');
    }
  }, [isOpen, products]);

  // Extract unique categories dynamically from active products
  const categories = useMemo(() => {
    const seen = new Set();
    const list = [{ id: 'ALL', name: isBengali ? 'সব ক্যাটাগরি' : 'All Categories' }];
    products.forEach((p) => {
      const cat = p.category?.trim();
      if (cat && !seen.has(cat)) {
        seen.add(cat);
        list.push({ id: cat, name: cat });
      }
    });
    return list;
  }, [products, isBengali]);

  // Filter products for the picker based on category & search
  const selectableProducts = useMemo(() => {
    return products.filter((p) => {
      const catMatch = selectedCategory === 'ALL' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const queryMatch = !q || (
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
      return catMatch && queryMatch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Assign product to the active slot
  const handleAssignProduct = (productId) => {
    setSlotAssignments((prev) => {
      const next = { ...prev };
      // If product was assigned to another slot, free that slot
      Object.keys(next).forEach((slot) => {
        if (next[slot] === productId) delete next[slot];
      });
      next[String(activeSlot)] = productId;
      return next;
    });
    toast.success(isBengali ? `স্লট ${activeSlot}-এ পণ্য যুক্ত হয়েছে!` : `Assigned to Slot ${activeSlot}!`, {
      icon: '⚡',
      duration: 1500
    });
    // Auto advance to next slot if possible
    if (activeSlot < 9) {
      setActiveSlot(activeSlot + 1);
    }
  };

  // Remove assignment from a slot
  const handleRemoveSlot = (slotKey, e) => {
    if (e) e.stopPropagation();
    setSlotAssignments((prev) => {
      const next = { ...prev };
      delete next[String(slotKey)];
      return next;
    });
  };

  // Save all slot assignments to database/context
  const handleSaveAndApply = () => {
    // 1. Remove hotkeys from products that no longer have a slot
    products.forEach((p) => {
      const currentAssignedSlot = Object.keys(slotAssignments).find((slot) => slotAssignments[slot] === p.id);
      if (currentAssignedSlot) {
        if (String(p.hotkey) !== String(currentAssignedSlot)) {
          editProduct(p.id, { hotkey: String(currentAssignedSlot) });
        }
      } else if (p.hotkey) {
        // Was removed
        editProduct(p.id, { hotkey: '' });
      }
    });

    toast.success(isBengali ? 'হট-প্রোডাক্টস ও স্পিড-কী সফলভাবে সংরক্ষিত হয়েছে!' : 'Hot Products & Speed Keys Saved!', {
      icon: '🎉',
    });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-xs border border-white/10">
              <Zap size={22} className="text-yellow-300 fill-current animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{isBengali ? 'হট-প্রোডাক্টস ও স্পিড-কী কাস্টমাইজেশন' : 'Hot Products & Speed Keys Manager'}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  ৯টি হট-স্লট
                </span>
              </h2>
              <p className="text-purple-100 text-xs font-medium">
                {isBengali 
                  ? 'যেকোনো ক্যাটাগরি থেকে আপনার সর্বাধিক বিক্রিত পণ্য বাছাই করে হট-কীতে যুক্ত করুন' 
                  : 'Assign top-selling products from any category for instant 1-tap POS selling'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-full transition text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body: Split into Slots (Left) and Category/Product Picker (Right) */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* ── Left Column: 9 Hot-Key Slots (5 cols) ── */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" />
                <span>{isBengali ? 'হট-কী স্লট তালিকা (১-৯)' : 'Hot-Key Slots (1-9)'}</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-bold">
                {Object.keys(slotAssignments).length} / ৯ সেট করা
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((slotNum) => {
                const assignedProdId = slotAssignments[String(slotNum)];
                const assignedProduct = assignedProdId ? products.find((p) => p.id === assignedProdId) : null;
                const isActive = activeSlot === slotNum;

                return (
                  <div
                    key={slotNum}
                    onClick={() => setActiveSlot(slotNum)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                        : 'bg-slate-50 hover:bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                        isActive 
                          ? 'bg-white text-slate-900' 
                          : assignedProduct 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {slotNum}
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        {assignedProduct ? (
                          <div>
                            <p className={`text-xs font-bold truncate leading-snug ${isActive ? 'text-white' : 'text-slate-900'}`}>
                              {assignedProduct.name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-medium mt-0.5">
                              <span className={`font-black tabular-nums ${isActive ? 'text-indigo-200' : 'text-slate-900'}`}>
                                {formatCurrency(assignedProduct.sellingPriceBasePoisha, { locale })}
                              </span>
                              <span className={isActive ? 'text-slate-400' : 'text-slate-500'}>•</span>
                              <span className={`truncate max-w-[90px] ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{assignedProduct.category}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className={`text-xs font-bold ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                              {isBengali ? `খালি স্লট ${slotNum}` : `Empty Slot ${slotNum}`}
                            </p>
                            <p className={`text-[10px] font-medium ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {isActive 
                                ? (isBengali ? '👉 ডানে পণ্য নির্বাচন করুন' : '👉 Select item from right')
                                : (isBengali ? 'ক্লিক করে পণ্য সেট করুন' : 'Click to assign')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {assignedProduct && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSlot(slotNum, e)}
                          className={`p-1 rounded-lg transition cursor-pointer ${isActive ? 'text-slate-300 hover:text-rose-400 hover:bg-white/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                          title="স্লট খালি করুন"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                      <kbd className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border shadow-2xs ${
                        isActive ? 'bg-white/20 text-white border-white/20' : 'bg-white text-slate-500 border-slate-200'
                      }`}>
                        কিবোর্ড {slotNum}
                      </kbd>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right Column: Any-Category Product Picker (7 cols) ── */}
          <div className="md:col-span-7 flex flex-col space-y-3 bg-slate-50/70 p-4 rounded-3xl border border-slate-200/90">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {isBengali ? `স্লট ${activeSlot}-এর জন্য পণ্য নির্বাচন করুন` : `Select Item for Slot ${activeSlot}`}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isBengali ? 'যেকোনো ক্যাটাগরি থেকে যেকোনো পণ্য বেছে নিন' : 'Choose any product from any category'}
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {selectableProducts.length} {isBengali ? 'টি পণ্য' : 'Items'}
              </span>
            </div>

            {/* Live Search Box */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBengali ? 'পণ্যের নাম বা বারকোড লিখে খুঁজুন...' : 'Search by product name or barcode...'}
                className="w-full h-9 pl-9 pr-8 text-xs font-bold bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                    selectedCategory === c.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Selectable Products Grid */}
            <div className="flex-1 max-h-[310px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {selectableProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Search size={24} className="mx-auto mb-1 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    {isBengali ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                  </p>
                </div>
              ) : (
                selectableProducts.map((p) => {
                  const currentAssignedSlot = Object.keys(slotAssignments).find((s) => slotAssignments[s] === p.id);
                  const isAssignedToActiveSlot = slotAssignments[String(activeSlot)] === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleAssignProduct(p.id)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isAssignedToActiveSlot
                          ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/10 font-bold'
                          : currentAssignedSlot
                          ? 'bg-indigo-50/60 border-indigo-200 hover:bg-indigo-100/60'
                          : 'bg-white hover:bg-slate-50 hover:border-slate-300 border-slate-200/80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold truncate ${isAssignedToActiveSlot ? 'text-white' : 'text-slate-900'}`}>
                            {p.name}
                          </p>
                          {currentAssignedSlot && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-600 text-white font-bold shrink-0">
                              স্লট {currentAssignedSlot}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] mt-0.5">
                          <span className={`font-bold px-1.5 py-0.2 rounded ${isAssignedToActiveSlot ? 'bg-white/20 text-white' : 'text-slate-700 bg-slate-100'}`}>
                            {p.category}
                          </span>
                          <span className={isAssignedToActiveSlot ? 'text-slate-300' : 'text-slate-500'}>•</span>
                          <span className={isAssignedToActiveSlot ? 'text-slate-300' : 'text-slate-500'}>স্টক: {p.currentStockInBaseUnit ?? p.stock ?? 0} {p.baseUnit || 'পিস'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-black tabular-nums ${isAssignedToActiveSlot ? 'text-white' : 'text-slate-900'}`}>
                          {formatCurrency(p.sellingPriceBasePoisha, { locale })}
                        </span>
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                          isAssignedToActiveSlot
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}>
                          {isAssignedToActiveSlot ? <Check size={14} /> : <Plus size={14} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            {isBengali 
              ? '💡 টিপস: পিওএস ক্যাশ কাউন্টারে কিবোর্ডের ১ থেকে ৯ চাপলেই এই হট পণ্যগুলো সরাসরি কার্টে যোগ হবে।' 
              : '💡 Tip: Press 1-9 on your keyboard in POS to instantly add these hot products.'}
          </p>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 transition shadow-md shadow-slate-900/20 cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={16} />
              <span>{isBengali ? 'হট-কী সংরক্ষণ ও প্রয়োগ করুন' : 'Save & Apply Hotkeys'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
