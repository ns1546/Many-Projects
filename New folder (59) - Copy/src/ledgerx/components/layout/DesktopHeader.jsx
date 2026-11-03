import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { useKhata } from '../../context/KhataContext';
import { formatCurrency, poishaToTaka } from '../../utils/currency';
import { 
  Globe, 
  Minus, 
  Square, 
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Wallet,
  Settings,
  ShieldCheck,
  Sparkles,
  Printer,
  Cloud,
  ChevronDown,
  Building2,
  Network,
  LayoutDashboard,
  Users,
  Rocket,
  Menu,
  ArrowLeft
} from 'lucide-react';
import BackupRestoreModal from '../common/BackupRestoreModal';
import SystemDoctorModal from '../common/SystemDoctorModal';
import ProductionModeModal from '../common/ProductionModeModal';
import BusinessProfileModal from '../common/BusinessProfileModal';
import RoleSwitcherModal from '../common/RoleSwitcherModal';
import ModeSwitcherPill from '../easy/ModeSwitcherPill';
import { useOperatingMode } from '../../context/OperatingModeContext';
import { BUSINESS_PROFILES } from '../../core/BusinessProfiles';
import { ROLES, ROLE_CONFIGS } from '../../context/TenantContext';

export default function DesktopHeader({ isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTenant, userRole, isOwner, isManager, isCashier } = useTenant();
  const { toggleLocale, isBengali, locale } = useLocale();
  const { isProductionMode, registers } = useKhata();
  const { isEasyMode } = useOperatingMode();

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const searchInputRef = useRef(null);
  const toolsMenuRef = useRef(null);

  // Close tools menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target)) {
        setIsToolsMenuOpen(false);
      }
    };
    if (isToolsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToolsMenuOpen]);

  // Global Ctrl+K / Cmd+K shortcut listener for instant search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalFloatPoisha = (registers || []).reduce((sum, r) => sum + (r.balancePoisha || 0), 0);

  // In POS Cash Counter, hide header completely for distraction-free sales terminal
  if (location.pathname.startsWith('/pos')) {
    return null;
  }

  // Determine current page breadcrumb
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/') return isBengali ? 'ড্যাশবোর্ড' : 'Dashboard';
    if (p.startsWith('/pos')) return isBengali ? 'ক্যাশ কাউন্টার (পিওএস)' : 'Express POS';
    if (p.startsWith('/customers')) return isBengali ? 'কাস্টমার বাকি খাতা' : 'Customer Khata';
    if (p.startsWith('/suppliers')) return isBengali ? 'মহাজন খাতা' : 'Supplier Khata';
    if (p.startsWith('/cashbox')) return isBengali ? 'ক্যাশবাক্স ও ড্রয়ার' : 'Cashbox';
    if (p.startsWith('/halkhata')) return isBengali ? 'হালখাতা উৎসব' : 'Halkhata';
    if (p.startsWith('/inventory')) return isBengali ? 'পণ্য ও স্টক' : 'Inventory';
    if (p.startsWith('/cheques')) return isBengali ? 'ব্যাংক চেক' : 'Cheques';
    if (p.startsWith('/reports')) return isBengali ? 'হিসাব ও রিপোর্ট' : 'Reports';
    if (p.startsWith('/history')) return isBengali ? 'সিস্টেম হিস্ট্রি ও অডিট' : 'System History';
    if (p.startsWith('/settings')) return isBengali ? 'সিস্টেম সেটিংস' : 'Settings';
    if (p.startsWith('/godown')) return isBengali ? 'গুদাম ও চালানি' : 'Godown';
    if (p.startsWith('/shop')) return isBengali ? 'রিটেল শপ' : 'Shop';
    return isBengali ? 'লেজারএক্স' : 'LedgerX';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const term = searchTerm.toLowerCase();
    if (term.includes('cust') || term.includes('কাস্টমার') || term.includes('বাকি')) {
      navigate('/customers');
    } else if (term.includes('pos') || term.includes('বিল') || term.includes('বিক্রয়')) {
      navigate('/pos');
    } else if (term.includes('sup') || term.includes('মহাজন')) {
      navigate('/suppliers');
    } else if (term.includes('cash') || term.includes('ক্যাশ')) {
      navigate('/cashbox');
    } else if (term.includes('stock') || term.includes('মাল')) {
      navigate('/inventory');
    } else {
      navigate('/customers');
    }
  };

  // ── Simplified Easy Mode Header (Clean bKash Style — Zero Developer Clutter) ──
  if (isEasyMode) {
    const isHomePage = location.pathname === '/';

    return (
      <header className="bg-white border-b border-slate-200/90 px-4 md:px-6 py-3 flex items-center justify-between shadow-2xs sticky top-0 z-40 select-none">
        {/* Left: Menu Drawer Trigger + Store Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleCollapse}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs transition cursor-pointer border border-slate-200/80 active:scale-95 shadow-2xs"
            title="সকল সেবা ও মেনু খুলুন"
          >
            <Menu size={18} className="text-emerald-600" />
            <span className="hidden sm:inline">{isBengali ? 'মেনু' : 'Menu'}</span>
          </button>

          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              খাতা
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                  {activeTenant?.name || (isBengali ? 'আমার দোকান' : 'My Store')}
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isBengali ? 'ডিজিটাল' : 'Khata'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">
                {isBengali ? 'সহজ হিসাব খাতা' : 'Simple Digital Ledger'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Fast-Action Navigation Tabs for Busy Days (F1 to F6) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => navigate('/pos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              location.pathname.startsWith('/pos')
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
            title="কাউন্টার বিক্রয় ও মেমো (হটকি: F1)"
          >
            <span>{isBengali ? 'কাউন্টার' : 'POS'}</span>
            <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${location.pathname.startsWith('/pos') ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>F1</kbd>
          </button>

          <button
            type="button"
            onClick={() => navigate('/customers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              location.pathname.startsWith('/customers')
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
            title="কাস্টমার বাকি খাতা (হটকি: F2)"
          >
            <span>{isBengali ? 'কাস্টমার' : 'Customers'}</span>
            <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${location.pathname.startsWith('/customers') ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>F2</kbd>
          </button>

          <button
            type="button"
            onClick={() => navigate('/suppliers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              location.pathname.startsWith('/suppliers')
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
            title="মহাজন দেনা খাতা (হটকি: F3)"
          >
            <span>{isBengali ? 'মহাজন' : 'Suppliers'}</span>
            <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${location.pathname.startsWith('/suppliers') ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>F3</kbd>
          </button>

          <button
            type="button"
            onClick={() => navigate('/cashbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              location.pathname.startsWith('/cashbox')
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
            title="ক্যাশবাক্স ও ড্রয়ার (হটকি: F4)"
          >
            <span>{isBengali ? 'ক্যাশবাক্স' : 'Cashbox'}</span>
            <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${location.pathname.startsWith('/cashbox') ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>F4</kbd>
          </button>

          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              location.pathname.startsWith('/inventory')
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
            title="পণ্য ও স্টক হিসাব (হটকি: F5)"
          >
            <span>{isBengali ? 'স্টক' : 'Stock'}</span>
            <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${location.pathname.startsWith('/inventory') ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>F5</kbd>
          </button>

          <button
            type="button"
            onClick={() => navigate('/reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              location.pathname.startsWith('/reports')
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-white'
            }`}
            title="লাভ-ক্ষতি ও রিপোর্ট (হটকি: F6)"
          >
            <span>{isBengali ? 'রিপোর্ট' : 'Reports'}</span>
            <kbd className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${location.pathname.startsWith('/reports') ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>F6</kbd>
          </button>
        </nav>

        {/* Right: Mode Switcher + Liquidity Float + Locale */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Operating Mode Switcher Pill */}
          <ModeSwitcherPill />

          {/* Quick Cash Balance Pill */}
          <div 
            onClick={() => navigate('/cashbox')}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 cursor-pointer transition shadow-2xs active:scale-95"
            title="ক্যাশবাক্স ও নগদ হিসাব"
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">
              ৳
            </div>
            <span className="text-xs font-bold text-emerald-800 hidden md:inline">{isBengali ? 'ক্যাশ:' : 'Cash:'}</span>
            <span className="font-black text-xs sm:text-sm text-emerald-900 tabular-nums">
              ৳{poishaToTaka(totalFloatPoisha).toLocaleString()}
            </span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition cursor-pointer border border-slate-200/70"
            title="ভাষা পরিবর্তন (বাংলা / English)"
          >
            {isBengali ? 'বাং' : 'EN'}
          </button>
        </div>

        {/* Easy Mode Modals */}
        <BusinessProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      </header>
    );
  }

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-2xs sticky top-0 z-40 select-none">
      {/* ── Left: Sidebar Toggle & Smart Store / Page Capsule ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          title={isCollapsed ? 'মেনু বড় করুন' : 'মেনু ছোট করুন'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Smart Store & Breadcrumb Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="text-sm font-black text-slate-900 tracking-tight">
            {getPageTitle()}
          </span>
          <span className="text-slate-300 font-light">/</span>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition flex items-center gap-1 group cursor-pointer"
            title="দোকানের ধরণ ও প্রোফাইল পরিবর্তন"
          >
            <span className="truncate max-w-[110px] md:max-w-[160px] lg:max-w-[200px]">
              {activeTenant?.name || 'মডার্ন ফার্মা ও ড্রাগ হাউস'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold hidden sm:inline group-hover:bg-slate-200">
              {BUSINESS_PROFILES[activeTenant?.businessType]?.title_bn?.split(' ')[0] || BUSINESS_PROFILES[activeTenant?.businessType]?.nameBn?.split(' ')[0] || 'দোকান'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Center: Spacious Universal Search with Ctrl+K ── */}
      <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2 lg:mx-4 min-w-[130px]">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isBengali ? 'খুঁজুন (Ctrl+K)...' : 'Search (Ctrl+K)...'}
            className="w-full h-8.5 text-xs font-semibold bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 pl-8.5 pr-13 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <kbd className="text-[9px] font-mono font-bold bg-white text-slate-400 px-1 py-0.5 rounded border border-slate-200/90 shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </form>
      </div>

      {/* ── Right: Mode Switcher + Live Float + Smart Actions Capsule ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Operating Mode Switcher Pill */}
        <ModeSwitcherPill />

        {/* Live Liquidity Float Capsule */}
        <button 
          onClick={() => navigate('/cashbox')}
          className="flex items-center gap-2 h-8.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/90 text-emerald-950 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer shadow-2xs active:scale-95"
          title="ক্যাশবাক্স ও তারল্য হিসাব"
        >
          <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[11px] shadow-2xs">
            ৳
          </div>
          <span className="font-black text-xs text-emerald-900 tabular-nums">
            {formatCurrency(totalFloatPoisha, { locale })}
          </span>
        </button>

        {/* Unified Smart Control Dock (Role + Tools + Language) */}
        <div ref={toolsMenuRef} className="flex items-center h-8.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/90 shadow-2xs divide-x divide-slate-200/80">
          {/* Role Indicator / Switcher */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className={`flex items-center gap-1.5 h-full px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isOwner
                ? 'hover:bg-amber-100/70 text-amber-900'
                : isManager
                ? 'hover:bg-blue-100/70 text-blue-900'
                : 'hover:bg-emerald-100/70 text-emerald-900'
            }`}
            title="ব্যবহারকারী নিরাপত্তা ভূমিকা পরিবর্তন (Owner / Manager / Cashier)"
          >
            <span className="text-xs">{isOwner ? '👑' : isManager ? '👔' : '💼'}</span>
            <span className="font-black hidden sm:inline">
              {isOwner ? (isBengali ? 'মালিক' : 'Owner') : isManager ? (isBengali ? 'ম্যানেজার' : 'Manager') : (isBengali ? 'ক্যাশিয়ার' : 'Cashier')}
            </span>
          </button>

          {/* Tools Menu Trigger */}
          <div className="relative h-full flex items-center">
            <button
              onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
              className="flex items-center gap-1 h-full px-2.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white/80 transition cursor-pointer"
              title="টুলস ও সিস্টেম ডায়াগনস্টিক"
            >
              <Settings size={14} className="text-slate-500" />
              <span className="hidden lg:inline">{isBengali ? 'টুলস' : 'Tools'}</span>
              <ChevronDown size={11} className={`text-slate-400 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Smart Tools Dropdown */}
            {isToolsMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900">{isBengali ? 'দোকানের সেটিংস ও টুলস' : 'Shop Settings & Utilities'}</p>
                  <p className="text-[10px] text-slate-400">{isBengali ? 'প্রয়োজনীয় কনফিগারেশন' : 'Quick System Tools'}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Building2 size={15} className="text-slate-600" />
                    <span>{isBengali ? 'ব্যবসার ধরণ ও প্রোফাইল' : 'Business Profile & Type'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsBackupModalOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <span>{isBengali ? 'হিসাব ব্যাকআপ ও রিস্টোর' : 'Backup & Restore Data'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsRoleModalOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <ShieldCheck size={15} className="text-amber-600" />
                    <span>{isBengali ? 'মালিক ও ক্যাশিয়ার পিন কোড' : 'Owner / Cashier PIN'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDoctorModalOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Activity size={15} className="text-purple-600" />
                    <span>{isBengali ? 'সিস্টেম ডক্টর ও ডায়াগনস্টিক' : 'System Doctor & Diagnostics'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProductionModalOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <Rocket size={15} className="text-rose-600" />
                    <span>{isBengali ? 'লাইভ প্রোডাকশন কনফিগারেশন' : 'Live Production Mode'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 h-full px-2.5 rounded-lg text-xs font-black text-slate-600 hover:text-emerald-700 hover:bg-white/80 transition cursor-pointer"
            title="ভাষা পরিবর্তন (বাংলা / English)"
          >
            <Globe size={13} className="text-slate-500" />
            <span>{isBengali ? 'বাং' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <RoleSwitcherModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
      <BackupRestoreModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} />
      <SystemDoctorModal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} />
      <ProductionModeModal isOpen={isProductionModalOpen} onClose={() => setIsProductionModalOpen(false)} />
      <BusinessProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </header>
  );
}
