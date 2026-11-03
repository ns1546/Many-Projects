import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOperatingMode } from '../../context/OperatingModeContext';

/**
 * UnifiedPageHeader — Professional, compact page header for LedgerX.
 * Replaces bulky 180px-200px dark hero boxes with an elegant 52px-60px header.
 * 
 * @param {React.ReactNode} icon - Lucide or custom icon
 * @param {string} title - Primary page title
 * @param {string} [subtitle] - Contextual subtitle or count summary
 * @param {string} [badge] - Context badge (e.g., 'সহজ খাতা', 'B2B', 'ERP')
 * @param {string} [badgeColor] - Badge style class
 * @param {boolean} [showBack=true] - Show back arrow button
 * @param {string} [backTo] - Custom back route, defaults to -1
 * @param {React.ReactNode} [actions] - Right-aligned action buttons/CTAs
 * @param {React.ReactNode} [children] - Optional secondary row content
 */
export default function UnifiedPageHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  showBack = true,
  backTo,
  actions,
  children,
}) {
  const navigate = useNavigate();
  const { isEasyMode } = useOperatingMode();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-4 py-3 sm:px-5 sm:py-3.5 mb-3 print:hidden transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Back + Icon + Titles + Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Go Back"
              className="p-2 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="পূর্ববর্তী পাতায় ফিরুন"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              {React.isValidElement(Icon) ? Icon : <Icon size={20} />}
            </div>
          )}

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate leading-tight">
                {title}
              </h1>
              {badge && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${badgeColor} shrink-0`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions / CTAs */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional sub-row */}
      {children && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
}
