import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * UnifiedToolbar — Professional single-row toolbar for search, filter tabs, and view controls.
 * Replaces multi-row stacked filter panels with a compact, cohesive command bar.
 * 
 * @param {string} searchValue - Current search query
 * @param {function} onSearchChange - Callback when search changes
 * @param {string} [searchPlaceholder='খুঁজুন...'] - Search placeholder
 * @param {Array<{ id: string, label: string, count?: number|string, icon?: React.ReactNode }>} [tabs=[]] - Segment tabs
 * @param {string} [activeTab] - Currently active tab id
 * @param {function} [onTabChange] - Callback when tab changes
 * @param {React.ReactNode} [filterSlot] - Extra filter controls (dropdowns, date filters)
 * @param {React.ReactNode} [actionsSlot] - Right-aligned controls (view switchers, export buttons)
 * @param {string} [className] - Optional extra class names
 */
export default function UnifiedToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'খুঁজুন...',
  tabs = [],
  activeTab,
  onTabChange,
  filterSlot,
  actionsSlot,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 sm:p-2.5 mb-3 print:hidden flex flex-wrap items-center justify-between gap-2.5 ${className}`}>
      {/* Left / Center: Search Input + Tabs */}
      <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
        {/* Search Field */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs md:max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all font-medium text-slate-900 placeholder:text-slate-400"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Segment Filter Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange && onTabChange(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Optional Filter Slot (e.g. Category select, date picker) */}
        {filterSlot && (
          <div className="flex items-center gap-2">
            {filterSlot}
          </div>
        )}
      </div>

      {/* Right: Actions / View Switcher Slot */}
      {actionsSlot && (
        <div className="flex items-center gap-2 shrink-0">
          {actionsSlot}
        </div>
      )}
    </div>
  );
}
