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

  const dueCustomersCount = (customers || []).filter(c => (c.currentDuePoisha || 0) > 0).length;
  const dueSuppliersCount = (suppliers || []).filter(s => (s.balancePoisha || s.currentDuePoisha || 0) > 0).length;
  const lowStockCount = (products || []).filter(p => (p.currentStockInBaseUnit || p.stock || 0) <= (p.lowStockAlertThreshold || 10)).length;

  const toggleSound = () => {
    const active = voicebox.toggle();
    setIsVoiceActive(active);
  };

  // Streamlined, beginner-friendly navigation structure
  const navGroups = isEasyMode
    ? [
        {
          groupTitle: isBengali ? 'সহজ টালিখাতা মেনু' : 'Easy Khata Menu',
          items: [
            {
              id: 'dashboard',
              title: isBengali ? 'সহজ ড্যাশবোর্ড' : 'Easy Dashboard',
              path: '/',
              icon: LayoutDashboard,
              iconGradient: 'from-emerald-600 to-teal-600',
              shadowColor: 'shadow-emerald-500/25',
              hotkey: null,
              badge: { text: isBengali ? 'সহজ' : 'Easy', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
            },
            {
              id: 'customers',
              title: isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Khata',
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
              id: 'cashbox',
              title: isBengali ? 'ক্যাশবাক্স ও খরচ' : 'Cashbox & Expenses',
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
              iconGradient: 'from-[#E2136E] to-[#B00F55]',
              shadowColor: 'shadow-pink-500/25',
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
              iconGradient: 'from-[#E2136E] to-[#B00F55]',
              shadowColor: 'shadow-pink-500/25',
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
              id: 'customers',
              title: isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Khata',
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
      className={`bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200/80 transition-all duration-300 select-none z-40 relative shadow-sm ${
        isCollapsed ? 'w-20' : 'w-72 xl:w-76'
      }`}
    >
      {/* ── Brand Header & Store Identity ── */}
      <div className={`p-4 border-b border-slate-100 ${isEasyMode ? 'bg-gradient-to-b from-emerald-50/50 to-white' : 'bg-gradient-to-b from-pink-50/40 to-white'}`}>
        <div className="flex items-center justify-between gap-2">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className={`w-11 h-11 rounded-2xl ${
              isEasyMode 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-600/30' 
                : 'bg-gradient-to-br from-[#E2136E] to-[#B00F55] shadow-pink-600/30'
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
                      : 'bg-pink-100 text-[#E2136E] border-pink-200'
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
        </div>

        {/* Active Store Capsule (Only shown in Ultra Control mode for multi-store management) */}
        {!isCollapsed && !isEasyMode && (
          <div className="relative mt-3">
            <button
              onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-pink-50/60 text-left border border-slate-200/80 hover:border-pink-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#E2136E] flex items-center justify-center shrink-0">
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
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-pink-50/70 transition-colors ${
                      store.id === activeTenant?.id ? 'bg-pink-50 text-[#E2136E] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">{store.name}</p>
                      <p className="text-[10px] text-slate-400">{store.branch}</p>
                    </div>
                    {store.id === activeTenant?.id && (
                      <span className="w-2 h-2 rounded-full bg-[#E2136E] shrink-0" />
                    )}
                  </button>
                ))}

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsStoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#E2136E] hover:bg-pink-50 flex items-center gap-2 transition-colors cursor-pointer"
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
      <div className="p-3">
        <button
          onClick={() => navigate(isEasyMode ? '/' : '/pos')}
          className={`w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-3.5 rounded-2xl ${
            isEasyMode
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25 border-emerald-400/40'
              : 'bg-gradient-to-r from-[#E2136E] via-[#D81B60] to-[#B00F55] hover:from-[#d81b60] hover:to-[#880e4f] text-white shadow-pink-500/25 border-pink-400/40'
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

      {/* ── Navigation Items with Large 44px bKash Icons ── */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 custom-scrollbar">
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
                  onClick={() => navigate(item.path)}
                  className={`w-full min-h-[48px] flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all group relative cursor-pointer text-left overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-50 to-white text-[#E2136E] border border-pink-200/90 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-transparent'
                  }`}
                  title={isCollapsed ? item.title : undefined}
                >
                  {/* FinTech Squircle Icon Badge */}
                  <div 
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-md ${
                      item.shadowColor
                    } bg-gradient-to-br ${item.iconGradient}`}
                  >
                    <Icon size={20} className="text-white drop-shadow-sm" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <span className={`text-xs md:text-sm truncate leading-snug ${isActive ? 'font-black text-[#E2136E]' : 'font-bold text-slate-800'}`}>
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap leading-tight ${item.badge.color}`}>
                            {item.badge.text}
                          </span>
                        ) : item.hotkey ? (
                          <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded border leading-tight shrink-0 hidden group-hover:inline-block ${
                            isActive 
                              ? 'bg-pink-100 border-pink-300 text-[#E2136E] font-bold' 
                              : 'bg-slate-100 border-slate-200 text-slate-400 font-semibold'
                          }`}>
                            {item.hotkey}
                          </kbd>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-[#E2136E] rounded-r-full shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

      </div>

      {/* ── System Status & Footer Dock ── */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="space-y-2">
            {/* Role Switcher Pill (Only in Ultra Mode for access security) */}
            {isUltraMode && (
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full p-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-pink-300 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2 text-left cursor-pointer group"
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
                <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-pink-50 text-slate-600 group-hover:text-[#E2136E] px-2 py-0.5 rounded-lg border border-slate-200 shrink-0 transition">
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
