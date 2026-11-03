import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { useKhata } from '../../context/KhataContext';
import { voicebox } from '../../utils/bengaliVoicebox';
import {
  LayoutDashboard,
  Zap,
  Users,
  Wallet,
  Package,
  Building2,
  PartyPopper,
  Landmark,
  BarChart3,
  Warehouse,
  Volume2,
  VolumeX,
  ChevronDown,
  Building,
  CheckCircle2,
  Sparkles,
  Settings as SettingsIcon,
  Sliders,
  History,
  X,
  Contact,
  Smartphone,
} from 'lucide-react';
import BusinessProfileModal from '../common/BusinessProfileModal';
import RoleSwitcherModal from '../common/RoleSwitcherModal';
import { useOperatingMode, OPERATING_MODES } from '../../context/OperatingModeContext';

export default function EnterpriseSidebar({ isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenants, activeTenant, switchTenant, userRole, isOwner, isManager, isCashier } = useTenant();
  const { isBengali } = useLocale();
  const { customers, suppliers, products, cheques } = useKhata();
  const { operatingMode, setOperatingMode, isEasyMode, isUltraMode } = useOperatingMode();

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);

  const totalCustomersCount = (customers || []).length;
  const dueCustomersCount = (customers || []).filter(c => (c.currentDuePoisha || 0) > 0).length;
  const dueSuppliersCount = (suppliers || []).filter(s => (s.balancePoisha || s.currentDuePoisha || 0) > 0).length;
  const lowStockCount = (products || []).filter(p => (p.currentStockInBaseUnit || p.stock || 0) <= (p.lowStockAlertThreshold || 10)).length;

  const toggleSound = () => {
    const active = voicebox.toggle();
    setIsVoiceActive(active);
  };

  // Streamlined, beginner-friendly navigation structure with all features available
  const navGroups = isEasyMode
    ? [
        {
          groupTitle: isBengali ? 'দোকানের মূল খাতা' : 'Daily Khata',
          items: [
            {
              id: 'dashboard',
              title: isBengali ? 'সহজ ড্যাশবোর্ড' : 'Easy Dashboard',
              path: '/',
              icon: LayoutDashboard,
              iconGradient: 'from-emerald-600 to-teal-600',
              shadowColor: 'shadow-emerald-500/25',
              hotkey: null,
              badge: { text: isBengali ? 'হোম' : 'Home', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
            },
            {
              id: 'pos',
              title: isBengali ? 'ক্যাশ কাউন্টার (পিওএস)' : 'Express POS',
              path: '/pos',
              icon: Zap,
              iconGradient: 'from-amber-500 to-orange-500',
              shadowColor: 'shadow-amber-500/25',
              hotkey: 'F1',
              badge: { text: 'দ্রুত', color: 'bg-amber-100 text-amber-800 border-amber-300' }
            },
            {
              id: 'mobile-app',
              title: isBengali ? 'মোবাইল অ্যাপ (ডিজিটাল খাতা)' : 'Mobile App (Digital Khata)',
              path: '/mobile',
              icon: Smartphone,
              iconGradient: 'from-pink-500 to-rose-600',
              shadowColor: 'shadow-pink-500/25',
              hotkey: 'F10',
              badge: { text: isBengali ? 'লাইভ সিঙ্ক' : 'Live Sync', color: 'bg-pink-100 text-pink-800 border-pink-300' }
            },
            {
              id: 'customer-directory',
              title: isBengali ? 'গ্রাহক ডিরেক্টরি' : 'Customer Directory',
              path: '/customer-directory',
              icon: Contact,
              iconGradient: 'from-blue-600 to-indigo-600',
              shadowColor: 'shadow-blue-500/25',
              hotkey: null,
              badge: { text: isBengali ? `${totalCustomersCount} জন` : `${totalCustomersCount}`, color: 'bg-blue-100 text-blue-800 border-blue-300' }
            },
            {
              id: 'customers',
              title: isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Due Khata',
              path: '/customers',
              icon: Users,
              iconGradient: 'from-rose-500 to-pink-600',
              shadowColor: 'shadow-rose-500/25',
              hotkey: 'F2',
              badge: dueCustomersCount > 0 ? { text: `${dueCustomersCount} বাকি`, color: 'bg-rose-100 text-rose-800 border-rose-300' } : null
            },
            {
              id: 'suppliers',
              title: isBengali ? 'মহাজন দেনা খাতা' : 'Supplier Khata',
              path: '/suppliers',
              icon: Building2,
              iconGradient: 'from-purple-600 to-indigo-600',
              shadowColor: 'shadow-purple-600/25',
              hotkey: 'F3',
              badge: dueSuppliersCount > 0 ? { text: `${dueSuppliersCount} দেনা`, color: 'bg-purple-100 text-purple-800 border-purple-300' } : null
            },
            {
              id: 'inventory',
              title: isBengali ? 'পণ্য ও স্টক' : 'Products & Stock',
              path: '/inventory',
              icon: Package,
              iconGradient: 'from-blue-600 to-cyan-600',
              shadowColor: 'shadow-blue-500/25',
              hotkey: 'F5',
              badge: lowStockCount > 0 ? { text: `${lowStockCount} কম`, color: 'bg-amber-100 text-amber-800 border-amber-300' } : null
            },
            {
              id: 'cashbox',
              title: isBengali ? 'ক্যাশবাক্স ও ড্রয়ার' : 'Cashbox & Expenses',
              path: '/cashbox',
              icon: Wallet,
              iconGradient: 'from-emerald-500 to-teal-600',
              shadowColor: 'shadow-emerald-500/25',
              hotkey: 'F4',
              badge: null
            },
            {
              id: 'reports',
              title: isBengali ? 'লাভ-ক্ষতি ও রিপোর্ট' : 'Reports & P&L',
              path: '/reports',
              icon: BarChart3,
              iconGradient: 'from-amber-500 to-orange-600',
              shadowColor: 'shadow-amber-500/25',
              hotkey: 'F6',
              badge: null
            }
          ]
        },
        {
          groupTitle: isBengali ? 'অন্যান্য সেবা ও হিসাব' : 'More Features',
          items: [
            {
              id: 'cheques',
              title: isBengali ? 'ব্যাংক চেক খাতা' : 'Cheques',
              path: '/cheques',
              icon: Landmark,
              iconGradient: 'from-teal-600 to-emerald-700',
              shadowColor: 'shadow-teal-500/25',
              hotkey: 'F7',
              badge: null
            },
            {
              id: 'halkhata',
              title: isBengali ? 'হালখাতা উৎসব' : 'Halkhata',
              path: '/halkhata',
              icon: PartyPopper,
              iconGradient: 'from-fuchsia-600 to-pink-600',
              shadowColor: 'shadow-fuchsia-500/25',
              hotkey: 'F8',
              badge: null
            },
            {
              id: 'godown',
              title: isBengali ? 'গুদাম ও চালানি' : 'Godown Khata',
              path: '/godown',
              icon: Warehouse,
              iconGradient: 'from-slate-600 to-slate-800',
              shadowColor: 'shadow-slate-500/25',
              hotkey: null,
              badge: null
            },
            {
              id: 'settings',
              title: isBengali ? 'দোকান সেটিংস' : 'Settings',
              path: '/settings',
              icon: SettingsIcon,
              iconGradient: 'from-slate-600 to-slate-700',
              shadowColor: 'shadow-slate-500/25',
              hotkey: 'F9',
              badge: null
            }
          ]
        }
      ]
    : isCashier
    ? [
        {
          groupTitle: isBengali ? 'কাউন্টার পিওএস ও ক্যাশ' : 'Counter Operations',
          items: [
            {
              id: 'dashboard',
              title: isBengali ? 'ড্যাশবোর্ড' : 'Dashboard',
              path: '/',
              icon: LayoutDashboard,
              iconGradient: 'from-indigo-600 to-slate-900',
              shadowColor: 'shadow-indigo-500/25',
              hotkey: null,
              badge: { text: 'ক্যাশিয়ার', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
            },
            {
              id: 'pos',
              title: isBengali ? 'ক্যাশ কাউন্টার (পিওএস)' : 'Express POS',
              path: '/pos',
              icon: Zap,
              iconGradient: 'from-amber-500 to-orange-500',
              shadowColor: 'shadow-orange-500/25',
              hotkey: 'F1',
              badge: null
            },
            {
              id: 'customers',
              title: isBengali ? 'বাকি খাতা (আদায়)' : 'Customer Khata',
              path: '/customers',
              icon: Users,
              iconGradient: 'from-rose-500 to-pink-600',
              shadowColor: 'shadow-rose-500/25',
              hotkey: 'F2',
              badge: dueCustomersCount > 0 ? { text: `${dueCustomersCount} বাকি`, color: 'bg-rose-100 text-rose-800 border-rose-300' } : null
            },
            {
              id: 'cashbox',
              title: isBengali ? 'ক্যাশবাক্স ও ড্রয়ার' : 'Cashbox & Till',
              path: '/cashbox',
              icon: Wallet,
              iconGradient: 'from-emerald-500 to-teal-600',
              shadowColor: 'shadow-emerald-500/25',
              hotkey: 'F4',
              badge: null
            }
          ]
        }
      ]
    : [
        {
          groupTitle: isBengali ? 'দোকানের মূল খাতা' : 'Daily Operations',
          items: [
            {
              id: 'dashboard',
              title: isBengali ? 'ড্যাশবোর্ড' : 'Dashboard',
              path: '/',
              icon: LayoutDashboard,
              iconGradient: 'from-indigo-600 to-slate-900',
              shadowColor: 'shadow-indigo-500/25',
              hotkey: null,
              badge: null
            },
            {
              id: 'pos',
              title: isBengali ? 'ক্যাশ কাউন্টার (পিওএস)' : 'Express POS',
              path: '/pos',
              icon: Zap,
              iconGradient: 'from-amber-500 to-orange-500',
              shadowColor: 'shadow-orange-500/25',
              hotkey: 'F1',
              badge: null
            },
            {
              id: 'customer-directory',
              title: isBengali ? 'গ্রাহক ডিরেক্টরি' : 'Customer Directory',
              path: '/customer-directory',
              icon: Contact,
              iconGradient: 'from-blue-600 to-indigo-600',
              shadowColor: 'shadow-blue-500/25',
              hotkey: null,
              badge: { text: isBengali ? `${totalCustomersCount} জন` : `${totalCustomersCount}`, color: 'bg-blue-100 text-blue-800 border-blue-300' }
            },
            {
              id: 'customers',
              title: isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Due Khata',
              path: '/customers',
              icon: Users,
              iconGradient: 'from-rose-500 to-pink-600',
              shadowColor: 'shadow-rose-500/25',
              hotkey: 'F2',
              badge: dueCustomersCount > 0 ? { text: `${dueCustomersCount} বাকি`, color: 'bg-rose-100 text-rose-800 border-rose-300' } : null
            },
            {
              id: 'suppliers',
              title: isBengali ? 'মহাজন খাতা' : 'Supplier Khata',
              path: '/suppliers',
              icon: Building2,
              iconGradient: 'from-purple-600 to-indigo-600',
              shadowColor: 'shadow-purple-600/25',
              hotkey: 'F3',
              badge: dueSuppliersCount > 0 ? { text: `${dueSuppliersCount} দেনা`, color: 'bg-purple-100 text-purple-800 border-purple-300' } : null
            },
            {
              id: 'inventory',
              title: isBengali ? 'পণ্য ও স্টক' : 'Products & Stock',
              path: '/inventory',
              icon: Package,
              iconGradient: 'from-blue-600 to-cyan-600',
              shadowColor: 'shadow-blue-500/25',
              hotkey: 'F6',
              badge: lowStockCount > 0 ? { text: `${lowStockCount} কম`, color: 'bg-amber-100 text-amber-800 border-amber-300' } : null
            },
            {
              id: 'cashbox',
              title: isBengali ? 'ক্যাশবাক্স ও ড্রয়ার' : 'Cashbox & Till',
              path: '/cashbox',
              icon: Wallet,
              iconGradient: 'from-emerald-500 to-teal-600',
              shadowColor: 'shadow-emerald-500/25',
              hotkey: 'F4',
              badge: null
            }
          ]
        },
        {
          groupTitle: isBengali ? 'হিসাব ও সেটিংস' : 'Reports & Settings',
          items: [
            {
              id: 'reports',
              title: isBengali ? 'লাভ-ক্ষতি ও রিপোর্ট' : 'Reports & P&L',
              path: '/reports',
              icon: BarChart3,
              iconGradient: 'from-indigo-600 to-violet-700',
              shadowColor: 'shadow-indigo-500/25',
              hotkey: 'F7',
              badge: null
            },
            {
              id: 'history',
              title: isBengali ? 'সিস্টেম হিস্ট্রি ও অডিট' : 'System History',
              path: '/history',
              icon: History,
              iconGradient: 'from-amber-600 to-orange-700',
              shadowColor: 'shadow-amber-500/25',
              hotkey: null,
              badge: { text: isBengali ? 'অডিট' : 'Audit', color: 'bg-amber-100 text-amber-800 border-amber-300' }
            },
            {
              id: 'settings',
              title: isBengali ? 'সিস্টেম সেটিংস' : 'Settings',
              path: '/settings',
              icon: SettingsIcon,
              iconGradient: 'from-slate-600 to-slate-800',
              shadowColor: 'shadow-slate-600/25',
              hotkey: 'F9',
              badge: null
            }
          ]
        },
        {
          groupTitle: isBengali ? 'বিশেষ খাতা' : 'Special Tools',
          items: [
            {
              id: 'halkhata',
              title: isBengali ? 'হালখাতা উৎসব' : 'Halkhata',
              path: '/halkhata',
              icon: PartyPopper,
              iconGradient: 'from-pink-500 to-rose-600',
              shadowColor: 'shadow-pink-500/25',
              hotkey: 'F5',
              badge: null
            },
            {
              id: 'cheques',
              title: isBengali ? 'ব্যাংক চেক' : 'Cheques',
              path: '/cheques',
              icon: Landmark,
              iconGradient: 'from-cyan-600 to-blue-700',
              shadowColor: 'shadow-cyan-500/25',
              hotkey: 'F8',
              badge: null
            },
            {
              id: 'godown',
              title: isBengali ? 'গুদাম ও চালানি' : 'Godown',
              path: '/godown',
              icon: Warehouse,
              iconGradient: 'from-slate-700 to-slate-900',
              shadowColor: 'shadow-slate-700/25',
              hotkey: null,
              badge: null
            }
          ]
        }
      ];

  return (
    <aside 
      className={`bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200/80 transition-all duration-300 select-none z-40 relative shadow-sm h-full max-h-screen overflow-hidden min-h-0 ${
        isCollapsed ? 'w-20' : 'w-72 xl:w-80'
      }`}
    >
      {/* ── Brand Header & Store Identity ── */}
      <div className={`p-4 border-b border-slate-100 shrink-0 ${isEasyMode ? 'bg-gradient-to-b from-emerald-50/50 to-white' : 'bg-gradient-to-b from-pink-50/40 to-white'}`}>
        <div className="flex items-center justify-between gap-2">
          <div 
            onClick={() => {
              navigate('/');
              if (isEasyMode && onToggleCollapse) onToggleCollapse();
            }}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className={`w-11 h-11 rounded-2xl ${
              isEasyMode 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-600/30' 
                : 'bg-gradient-to-br from-slate-900 to-indigo-950 shadow-slate-900/30'
            } text-white font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-all shrink-0`}>
              {isEasyMode ? 'খাতা' : '৳'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 text-lg tracking-tight leading-none">
                    {isEasyMode ? (isBengali ? 'সহজ খাতা' : 'Easy Khata') : 'LedgerX'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                    isEasyMode 
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {isEasyMode ? (isBengali ? 'ডিজিটাল' : 'Simple') : (isBengali ? 'মার্চেন্ট' : 'Pro')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 truncate font-medium">
                  {activeTenant?.name || (isBengali ? 'আমার দোকান' : 'My Store')}
                </p>
              </div>
            )}
          </div>

          {/* Close button for Easy Mode mobile/drawer overlay */}
          {isEasyMode && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="মেনু বন্ধ করুন"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Active Store Capsule (Only shown in Ultra Control mode for multi-store management) */}
        {!isCollapsed && !isEasyMode && (
          <div className="relative mt-3">
            <button
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Building size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate leading-tight">
                    {activeTenant?.name || 'বিসমিল্লাহ জেনারেল স্টোর'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {activeTenant?.branch || 'প্রধান শাখা'} • <span className="text-emerald-600 font-bold">ভেরিফাইড</span>
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isStoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Store Switcher Dropdown */}
            {isStoreMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {isBengali ? 'দোকান পরিবর্তন করুন' : 'Switch Store'}
                </div>
                {(tenants || []).map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      switchTenant(store.id);
                      setIsStoreMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      store.id === activeTenant?.id ? 'bg-slate-100 text-slate-900 font-black' : 'text-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">{store.name}</p>
                      <p className="text-[10px] text-slate-400">{store.branch}</p>
                    </div>
                    {store.id === activeTenant?.id && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsStoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Building2 size={14} />
                    <span>{isBengali ? 'ব্যবসার ধরণ পরিবর্তন (৭টি ইন্ডাস্ট্রি)' : 'Change Business Type'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Express Hero Action Button: Fast Entry / POS ── */}
      <div className="p-3 shrink-0">
        <button
          onClick={() => {
            navigate(isEasyMode ? '/' : '/pos');
            if (isEasyMode && onToggleCollapse) onToggleCollapse();
          }}
          className={`w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl ${
            isEasyMode
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 border-emerald-400/40'
              : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white shadow-slate-900/25 border-slate-700/50'
          } font-extrabold text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border ${
            isCollapsed ? 'p-2.5' : ''
          }`}
          title={isEasyMode ? 'সহজ খাতা এন্ট্রি' : 'F1: এক্সপ্রেস পিওএস'}
        >
          {isEasyMode ? (
            <Zap size={18} className="text-amber-300 fill-amber-300 animate-pulse shrink-0" />
          ) : (
            <Zap size={18} className="text-amber-300 fill-amber-300 animate-pulse shrink-0" />
          )}
          {!isCollapsed && (
            <span className="truncate tracking-wide flex items-center justify-between flex-1">
              <span className="text-sm font-black">
                {isEasyMode
                  ? (isBengali ? '+ দ্রুত হিসাব এন্ট্রি' : '+ Quick Entry')
                  : (isBengali ? '+ নতুন বিক্রয় মেমো' : '+ New POS Bill')}
              </span>
              <kbd className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-lg font-mono font-bold border border-white/30 ml-2">
                {isEasyMode ? '⚡' : 'F1'}
              </kbd>
            </span>
          )}
        </button>
      </div>

      {/* ── Navigation Items with Smooth Scrolling & Visible Hotkeys (Guaranteed min-h-0 for wheel/touch scroll) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-2.5 custom-scrollbar overscroll-contain touch-pan-y">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                {group.groupTitle}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    if (isEasyMode && onToggleCollapse) onToggleCollapse();
                  }}
                  className={`w-full min-h-[46px] flex items-center gap-3 px-3 py-2 rounded-2xl transition-all group relative cursor-pointer text-left overflow-hidden ${
                    isActive
                      ? isEasyMode 
                        ? 'bg-emerald-50/90 text-emerald-900 border border-emerald-200 shadow-2xs font-black' 
                        : 'bg-slate-900 text-white border border-slate-900 shadow-md shadow-slate-900/20 font-black'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 border border-transparent'
                  }`}
                  title={isCollapsed ? item.title : undefined}
                >
                  {/* Clean FinTech Icon Badge */}
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs ${
                      isActive 
                        ? isEasyMode ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <span className={`text-xs md:text-sm truncate leading-snug ${isActive ? (isEasyMode ? 'font-black text-emerald-950' : 'font-black text-white') : 'font-bold text-slate-800'}`}>
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap leading-tight ${item.badge.color}`}>
                            {item.badge.text}
                          </span>
                        )}
                        {item.hotkey && (
                          <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border font-bold leading-tight shrink-0 ${
                            isActive 
                              ? isEasyMode ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white/20 border-white/30 text-white'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {item.hotkey}
                          </kbd>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full shadow-xs ${
                      isEasyMode ? 'bg-emerald-600' : 'bg-indigo-400'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        ))}

      </div>

      {/* ── System Status & Footer Dock ── */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* Role Switcher Pill (Only in Ultra Mode for access security) */}
            {isUltraMode && (
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2 text-left cursor-pointer group"
                title="ব্যবহারকারী রোল পরিবর্তন ও সিকিউরিটি পিন"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{isOwner ? '👑' : isManager ? '👔' : '💼'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-800 truncate">
                      {isOwner ? (isBengali ? 'দোকান মালিক' : 'Shop Owner') : isManager ? (isBengali ? 'দোকান ম্যানেজার' : 'Shop Manager') : (isBengali ? 'ক্যাশিয়ার' : 'Cashier')}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {isOwner ? (isBengali ? 'সম্পূর্ণ এক্সেস' : 'Full Admin') : isManager ? (isBengali ? 'সীমিত এক্সেস' : 'Protected') : (isBengali ? 'পিওএস এক্সেস' : 'POS Access')}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0 transition">
                  {isBengali ? 'রোল' : 'Role'}
                </span>
              </button>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <button
                onClick={toggleSound}
                className="flex items-center gap-1.5 hover:text-slate-800 font-bold transition cursor-pointer"
              >
                {isVoiceActive ? <Volume2 size={14} className="text-emerald-600" /> : <VolumeX size={14} className="text-slate-400" />}
                <span>{isBengali ? 'ভয়েসবক্স' : 'Sound'}</span>
              </button>
            </div>
          </div>
        ) : (
          isUltraMode && (
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="w-full h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm cursor-pointer hover:border-pink-300 shadow-2xs"
              title={isOwner ? 'মালিক মোড' : isManager ? 'ম্যানেজার মোড' : 'ক্যাশিয়ার'}
            >
              {isOwner ? '👑' : isManager ? '👔' : '💼'}
            </button>
          )
        )}
      </div>

      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
      <BusinessProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </aside>
  );
}
