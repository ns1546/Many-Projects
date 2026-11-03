import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * SlideOverDrawer — World-Class Enterprise Inspector Drawer for Progressive Disclosure.
 * Allows users to inspect deep details, transaction history, audit trails, and secondary
 * actions without cluttering the primary table/card view.
 * Modeled after Shopify Admin, Stripe Dashboard, and Linear detail panels.
 * 
 * @param {boolean} isOpen - Whether drawer is open
 * @param {function} onClose - Callback to close the drawer
 * @param {string|React.ReactNode} title - Drawer title
 * @param {string|React.ReactNode} [subtitle] - Secondary description or ID
 * @param {React.ReactNode} [badge] - Status badge
 * @param {React.ReactNode} children - Drawer body content
 * @param {React.ReactNode} [footer] - Optional sticky footer actions
 * @param {string} [width='max-w-md md:max-w-lg'] - Drawer width class
 */
export default function SlideOverDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  width = 'max-w-md md:max-w-lg',
}) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Surface */}
      <div
        className={`relative z-10 w-full ${width} bg-white h-full shadow-2xl flex flex-col min-h-0 animate-in slide-in-from-right duration-200 border-l border-slate-200`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/60">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {title}
              </h2>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer shrink-0"
            title="বন্ধ করুন (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
