import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X, User, Phone, Check, UserCheck } from 'lucide-react';
import { formatCurrency, poishaToTaka } from '../../utils/currency';

/**
 * SearchableCustomerSelect
 * A smart, accessible combobox dropdown for selecting customers with instant search,
 * clear due indicators, and progressive loading so large customer lists never lag or overwhelm.
 */
export default function SearchableCustomerSelect({
  customers = [],
  value = '',
  onChange,
  placeholder = '',
  allowWalkIn = false,
  isBengali = true,
  className = '',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [dropUp, setDropUp] = useState(false);
  
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Determine smart drop-up positioning and focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        // If less than 280px below and enough space above, pop upwards
        if (spaceBelow < 280 && spaceAbove > 200) {
          setDropUp(true);
        } else {
          setDropUp(false);
        }
      }
      setDisplayLimit(10);
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    if (!value) return null;
    return customers.find((c) => String(c.id) === String(value)) || null;
  }, [customers, value]);

  // Filtered customers based on search
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const due = String(poishaToTaka(c.currentDuePoisha || 0));
      return name.includes(q) || phone.includes(q) || due.includes(q);
    });
  }, [customers, searchQuery]);

  // Visible subset for fast rendering
  const visibleCustomers = useMemo(() => {
    return filteredCustomers.slice(0, displayLimit);
  }, [filteredCustomers, displayLimit]);

  const handleSelect = (customerId) => {
    onChange(customerId);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const defaultPlaceholder = isBengali ? '-- কাস্টমার বাছাই করুন --' : '-- Choose Customer --';

  return (
    <div ref={containerRef} className={`relative w-full ${className} select-none`}>
      {/* ── Trigger Selector Box ── */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
          isOpen
            ? 'border-[#E2136E] ring-2 ring-pink-500/10 bg-white'
            : 'border-slate-200/90 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300'
        }`}
        title="কাস্টমার খুঁজুন বা বাছাই করুন"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
            selectedCustomer 
              ? (selectedCustomer.currentDuePoisha > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')
              : 'bg-slate-200 text-slate-500'
          }`}>
            <User size={15} />
          </div>

          <div className="min-w-0 flex-1 text-left">
            {selectedCustomer ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {selectedCustomer.name}
                </span>
                {selectedCustomer.phone && (
                  <span className="text-[11px] font-mono text-slate-500">
                    ({selectedCustomer.phone})
                  </span>
                )}
                {selectedCustomer.currentDuePoisha > 0 ? (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    {isBengali ? 'বাকি' : 'Due'}: ৳{poishaToTaka(selectedCustomer.currentDuePoisha).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {isBengali ? 'পরিশোধিত' : 'Clear'}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-semibold text-slate-400">
                {placeholder || defaultPlaceholder}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedCustomer && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="মুছে ফেলুন"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#E2136E]' : ''}`}
          />
        </div>
      </div>

      {/* ── Dropdown Panel with Search Input & Filtered Customers ── */}
      {isOpen && (
        <div className={`absolute left-0 right-0 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'} bg-white rounded-2xl shadow-2xl border border-slate-200 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-100`}>
          {/* Integrated Search Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/90">
            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBengali ? 'নাম বা মোবাইল নম্বর দিয়ে খুঁজুন...' : 'Search by name or mobile...'}
                className="w-full h-9 pl-9 pr-8 text-xs font-bold bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E2136E] focus:ring-2 focus:ring-pink-500/20 transition shadow-2xs"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List Options */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 divide-y divide-slate-100/60 custom-scrollbar">
            {/* Walk-in Customer Option (if enabled) */}
            {allowWalkIn && !searchQuery && (
              <div
                onClick={() => handleSelect('')}
                className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between text-xs font-bold ${
                  !value
                    ? 'bg-pink-50 text-[#E2136E] border border-pink-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck size={15} className={!value ? 'text-[#E2136E]' : 'text-slate-400'} />
                  <span>{isBengali ? '👤 সাধারণ নগদ ক্রেতা (Walk-in Customer)' : '👤 Walk-in Customer'}</span>
                </div>
                {!value && <Check size={14} className="text-[#E2136E]" />}
              </div>
            )}

            {filteredCustomers.length === 0 ? (
              <div className="py-6 text-center text-slate-400">
                <Search size={22} className="mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-bold text-slate-500">
                  {isBengali ? 'কোনো কাস্টমার পাওয়া যায়নি' : 'No customers found'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isBengali ? 'সঠিক নাম বা ফোন নম্বর লিখুন' : 'Check spelling or phone number'}
                </p>
              </div>
            ) : (
              visibleCustomers.map((c) => {
                const isSelected = String(c.id) === String(value);
                const dueTaka = poishaToTaka(c.currentDuePoisha || 0);

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    className={`p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-pink-50 text-[#E2136E] border border-pink-200 font-black'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                        dueTaka > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.name ? c.name.charAt(0) : 'ক'}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-bold truncate text-slate-900 leading-tight">
                          {c.name}
                        </p>
                        {c.phone && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {c.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {dueTaka > 0 ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 tabular-nums">
                          {isBengali ? 'বাকি' : 'Due'}: ৳{dueTaka.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                          {isBengali ? '০ বাকি' : '৳0'}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-[#E2136E]" />}
                    </div>
                  </div>
                );
              })
            )}

            {/* Progressive Loading: "আরও দেখুন" (Load More) Button */}
            {filteredCustomers.length > displayLimit && (
              <div className="pt-1 pb-0.5 px-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDisplayLimit((prev) => prev + 15);
                  }}
                  className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
                >
                  {isBengali 
                    ? `⬇️ আরও কাস্টমার দেখুন (${visibleCustomers.length} / ${filteredCustomers.length}টি প্রদর্শিত)` 
                    : `⬇️ Load More (${visibleCustomers.length} / ${filteredCustomers.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
