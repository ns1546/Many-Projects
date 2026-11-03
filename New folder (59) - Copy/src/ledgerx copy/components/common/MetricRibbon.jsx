import React from 'react';

/**
 * MetricRibbon — Professional, unified horizontal KPI ribbon.
 * Replaces bulky multi-card grids with an executive, space-efficient aggregate strip.
 * Modeled after Stripe Dashboard & Shopify Admin executive summaries.
 * 
 * @param {Array<{
 *   id: string|number,
 *   label: string,
 *   value: string|number|React.ReactNode,
 *   subtitle?: string|React.ReactNode,
 *   icon?: React.ReactNode|React.ElementType,
 *   iconColor?: string,
 *   valueColor?: string,
 *   onClick?: () => void
 * }>} metrics - Array of KPI metrics to display
 * @param {string} [className] - Optional extra class names
 */
export default function MetricRibbon({ metrics = [], className = '' }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-3 print:hidden ${className}`}>
      <div className="flex flex-wrap divide-x divide-slate-100">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          const isClickable = typeof m.onClick === 'function';

          return (
            <div
              key={m.id || idx}
              onClick={m.onClick}
              className={`flex-1 min-w-[140px] px-4 py-3 flex flex-col justify-center gap-0.5 transition-colors ${
                isClickable ? 'cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/70' : ''
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                {Icon && (
                  <span className={`shrink-0 ${m.iconColor || 'text-slate-400'}`}>
                    {React.isValidElement(Icon) ? Icon : <Icon size={13} />}
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {m.label}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className={`text-base sm:text-lg font-black tracking-tight tabular-nums leading-none ${m.valueColor || 'text-slate-900'}`}>
                  {m.value}
                </span>
              </div>

              {m.subtitle && (
                <span className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                  {m.subtitle}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
