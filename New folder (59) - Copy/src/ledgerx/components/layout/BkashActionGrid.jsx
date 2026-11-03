import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext';
import { useKhata } from '../../context/KhataContext';
import { useTenant } from '../../context/TenantContext';
import { 
  Users, 
  Building2, 
  Wallet, 
  Zap, 
  Package, 
  PartyPopper, 
  Landmark, 
  BarChart3,
  Warehouse,
  Settings as SettingsIcon,
  ArrowUpRight,
  Contact
} from 'lucide-react';

export default function BkashActionGrid() {
  const navigate = useNavigate();
  const { t, isBengali } = useLocale();
  const { customers, suppliers, products, registers, cheques } = useKhata();
  const { isCashier } = useTenant();

  const dueCustomersCount = (customers || []).filter(c => (c.currentDuePoisha || 0) > 0).length;
  const dueSuppliersCount = (suppliers || []).filter(s => (s.currentDuePoisha || s.balancePoisha || 0) > 0).length;

  const allActions = [
    {
      id: 'pos',
      title: isBengali ? 'ক্যাশ কাউন্টার (পিওএস)' : 'Express POS',
      sub: isBengali ? 'দ্রুত বিক্রয় ও প্রিন্ট' : 'Fast Billing & Receipt',
      path: '/pos',
      hotkey: 'F1',
      icon: Zap,
      accentBg: 'bg-amber-50',
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-100/90 text-amber-900',
      badge: isBengali ? 'দ্রুত বিক্রি' : 'POS',
      borderHover: 'hover:border-amber-300'
    },
    {
      id: 'customer_directory',
      title: isBengali ? 'গ্রাহক ডিরেক্টরি' : 'Customer Directory',
      sub: isBengali ? 'সকল গ্রাহকের মাস্টার ডেটা' : 'Full Customer CRM',
      path: '/customer-directory',
      hotkey: null,
      icon: Contact,
      accentBg: 'bg-blue-50',
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-100/90 text-blue-900',
      badge: isBengali ? `${(customers || []).length} জন` : `${(customers || []).length}`,
      borderHover: 'hover:border-blue-300'
    },
    {
      id: 'customer_khata',
      title: isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Due Khata',
      sub: isBengali ? 'কাস্টমার দেনা-পাওনা' : 'Customer Dues & Ledger',
      path: '/customers',
      hotkey: 'F2',
      icon: Users,
      accentBg: 'bg-pink-50',
      accentColor: 'text-[#E2136E]',
      badgeBg: 'bg-pink-100/90 text-[#E2136E]',
      badge: dueCustomersCount > 0 ? `${dueCustomersCount} বাকি` : (isBengali ? 'খাতা' : 'Khata'),
      borderHover: 'hover:border-pink-300'
    },
    {
      id: 'cashbox',
      title: isBengali ? 'ক্যাশবাক্স ও ড্রয়ার' : 'Cashbox',
      sub: isBengali ? 'নগদ ক্যাশ ও বিকাশ জমা' : 'Drawer Cash & bKash',
      path: '/cashbox',
      hotkey: 'F3',
      icon: Wallet,
      accentBg: 'bg-emerald-50',
      accentColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-100/90 text-emerald-900',
      badge: isBengali ? 'ক্যাশ' : 'Cash',
      borderHover: 'hover:border-emerald-300'
    },
    {
      id: 'inventory',
      title: isBengali ? 'পণ্য ও স্টক' : 'Products & Stock',
      sub: isBengali ? 'পণ্যের মজুদ ও দরদাম' : 'Products & Stock Level',
      path: '/inventory',
      hotkey: 'F4',
      icon: Package,
      accentBg: 'bg-blue-50',
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-100/90 text-blue-900',
      badge: isBengali ? 'স্টক' : 'Stock',
      borderHover: 'hover:border-blue-300'
    },
    {
      id: 'supplier_khata',
      title: isBengali ? 'মহাজন খাতা' : 'Supplier Khata',
      sub: isBengali ? 'মহাজন দেনা ও কেনাকাটা' : 'Vendor Payables',
      path: '/suppliers',
      hotkey: 'F5',
      icon: Building2,
      accentBg: 'bg-purple-50',
      accentColor: 'text-purple-600',
      badgeBg: 'bg-purple-100/90 text-purple-900',
      badge: dueSuppliersCount > 0 ? `${dueSuppliersCount} দেনা` : (isBengali ? 'চালান' : 'Chalan'),
      borderHover: 'hover:border-purple-300'
    },
    {
      id: 'halkhata',
      title: isBengali ? 'হালখাতা' : 'Halkhata Festival',
      sub: isBengali ? 'বৈশাখী বকেয়া আদায়' : 'Festival Settlement',
      path: '/halkhata',
      hotkey: 'F6',
      icon: PartyPopper,
      accentBg: 'bg-rose-50',
      accentColor: 'text-rose-600',
      badgeBg: 'bg-rose-100/90 text-rose-900',
      badge: isBengali ? '১৪৩৩' : '1433',
      borderHover: 'hover:border-rose-300'
    },
    {
      id: 'cheques',
      title: isBengali ? 'ব্যাংক চেক' : 'Cheques',
      sub: isBengali ? 'চেক জমা ও ক্লিয়ারিং' : 'Cheque Tracker',
      path: '/cheques',
      hotkey: 'F7',
      icon: Landmark,
      accentBg: 'bg-slate-100',
      accentColor: 'text-slate-700',
      badgeBg: 'bg-slate-200/90 text-slate-800',
      badge: isBengali ? 'ব্যাংক' : 'Bank',
      borderHover: 'hover:border-slate-400'
    },
    {
      id: 'reports',
      title: isBengali ? 'হিসাব বিবরণী' : 'Reports & P&L',
      sub: isBengali ? 'দৈনিক বিক্রি ও লাভ-ক্ষতি' : 'Daily Sales & Profit',
      path: '/reports',
      hotkey: 'F8',
      icon: BarChart3,
      accentBg: 'bg-indigo-50',
      accentColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-100/90 text-indigo-900',
      badge: isBengali ? 'রিপোর্ট' : 'Reports',
      borderHover: 'hover:border-indigo-300'
    },
    {
      id: 'godown',
      title: isBengali ? 'গুদাম ও চালান' : 'Godown & Chalans',
      sub: isBengali ? 'গুদাম স্টক ও মাল পাঠানো' : 'Warehouse & Transfers',
      path: '/godown',
      hotkey: 'F9',
      icon: Warehouse,
      accentBg: 'bg-cyan-50',
      accentColor: 'text-cyan-700',
      badgeBg: 'bg-cyan-100/90 text-cyan-900',
      badge: isBengali ? 'গুদাম' : 'Godown',
      borderHover: 'hover:border-cyan-300'
    },
    {
      id: 'settings',
      title: isBengali ? 'দোকান সেটিংস' : 'Store Settings',
      sub: isBengali ? 'প্রিন্টার ও সিকিউরিটি' : 'Printer, Profile & PIN',
      path: '/settings',
      hotkey: 'F10',
      icon: SettingsIcon,
      accentBg: 'bg-slate-100',
      accentColor: 'text-slate-700',
      badgeBg: 'bg-slate-200/90 text-slate-800',
      badge: isBengali ? 'সেটিংস' : 'Settings',
      borderHover: 'hover:border-slate-400'
    },
  ];

  const actions = isCashier
    ? allActions.filter(a => ['pos', 'customer_khata', 'cashbox', 'inventory', 'cheques'].includes(a.id))
    : allActions;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E2136E]" />
          <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
            {isBengali ? 'প্রধান ব্যবসায়ের অ্যাকশন মেনু' : 'Core Business Action Menu'}
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
          {isBengali ? '১-ক্লিকে প্রয়োজনীয় মডিউলে যান' : 'Click any module to open'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => navigate(act.path)}
              className={`enterprise-action-card group text-left ${act.borderHover}`}
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`w-11 h-11 rounded-xl ${act.accentBg} ${act.accentColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className="stroke-[2.2]" />
                </div>
                
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${act.badgeBg}`}>
                  {act.badge}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-[#E2136E] transition-colors leading-tight flex items-center justify-between">
                  <span>{act.title}</span>
                  <ArrowUpRight size={13} className="text-slate-300 group-hover:text-[#E2136E] opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                  {act.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
