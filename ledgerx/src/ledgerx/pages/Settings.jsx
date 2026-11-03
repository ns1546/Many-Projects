import React, { useState, useRef, useEffect } from 'react';
import {
  useTenant,
  ROLES,
  ROLE_CONFIGS,
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_PRINTER_CONFIG,
  SHOP_PRINT_PRESETS,
} from '../context/TenantContext';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { voicebox } from '../utils/bengaliVoicebox';
import { BUSINESS_PROFILES } from '../core/BusinessProfiles';
import { poishaToTaka, takaToPoisha, formatCurrency } from '../utils/currency';
import RoleAccessGate from '../components/common/RoleAccessGate';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
import ThermalReceiptPreview from '../components/print/ThermalReceiptPreview';
import toast from 'react-hot-toast';
import {
  Store,
  Shield,
  Printer,
  Volume2,
  Database,
  Stethoscope,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  Save,
  Lock,
  Smartphone,
  Building,
  FileText,
  Sliders,
  Play,
  Check,
  Eye,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  XCircle,
  QrCode,
  FileCheck,
  Info,
} from 'lucide-react';

export default function Settings() {
  const {
    activeTenant,
    updateActiveTenant,
    userRole,
    isOwner,
    isManager,
    isCashier,
    customPermissions,
    updateCustomPermissions,
    resetPermissionsToDefault,
    printerConfig,
    updatePrinterConfig,
    applyShopPrintPreset,
    verifyOwnerPin,
    switchRoleWithPin,
  } = useTenant();

  const {
    customers,
    suppliers,
    products,
    registers,
    ledgerEntries,
    invoices,
    cheques,
    godownStock,
    chalans,
    getJournalVouchers,
    runSystemDoctor,
    autoHealLedger,
    isProductionMode,
    startProductionMode,
    resetToDemoMode,
  } = useKhata();
  const { isBengali } = useLocale();

  const fileInputRef = useRef(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('profile'); // profile | security | printer | voice | backup | doctor | mode
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Tab 1: Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: activeTenant?.name || '',
    nameEn: activeTenant?.nameEn || '',
    branch: activeTenant?.branch || '',
    phone: activeTenant?.phone || '',
    address: activeTenant?.address || '',
    bKashMerchantNumber: activeTenant?.bKashMerchantNumber || '',
    vatBinNumber: activeTenant?.vatBinNumber || '',
    businessType: activeTenant?.businessType || 'GENERAL_RETAIL',
  });

  // Tab 2: Security & PIN State
  const [pinForm, setPinForm] = useState({
    oldPin: '',
    newPin: '',
    confirmPin: '',
  });

  // Tab 2: Customizable RBAC Matrix State
  const [rbacState, setRbacState] = useState(() => {
    return activeTenant?.customPermissions || customPermissions || DEFAULT_ROLE_PERMISSIONS;
  });

  // Tab 3: Shop Printer & Thermal Memo Configuration State
  const [printerForm, setPrinterForm] = useState(() => ({
    paperWidth: printerConfig?.paperWidth || activeTenant?.paperWidth || '58mm',
    showBismillah: printerConfig?.showBismillah ?? true,
    headerCustomText: printerConfig?.headerCustomText || 'বিসমিল্লাহির রাহমানির রাহিম',
    shopTitle: printerConfig?.shopTitle || activeTenant?.name || '',
    shopSubtitle: printerConfig?.shopSubtitle || 'সেরা মানের নিত্যপ্রয়োজনীয় পণ্যের নির্ভরযোগ্য প্রতিষ্ঠান',
    shopAddress: printerConfig?.shopAddress || activeTenant?.address || '',
    shopPhone: printerConfig?.shopPhone || activeTenant?.phone || '',
    showVatBin: printerConfig?.showVatBin ?? true,
    vatBinNumber: printerConfig?.vatBinNumber || activeTenant?.vatBinNumber || '',
    tradeLicenseNo: printerConfig?.tradeLicenseNo || '',
    drugLicenseNo: printerConfig?.drugLicenseNo || '',
    showCustomerDue: printerConfig?.showCustomerDue ?? true,
    showCashierName: printerConfig?.showCashierName ?? true,
    showReturnableContainers: printerConfig?.showReturnableContainers ?? true,
    showBkashQr: printerConfig?.showBkashQr ?? true,
    bkashMerchantNumber: printerConfig?.bkashMerchantNumber || activeTenant?.bKashMerchantNumber || activeTenant?.phone || '',
    returnPolicy: printerConfig?.returnPolicy || 'বিক্রীত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ অক্ষত অবস্থায় পরিবর্তনযোগ্য। পণ্য ফেরত নেওয়া হয় না।',
    footerGreeting: printerConfig?.footerGreeting || 'ধন্যবাদ, আবার আসবেন!',
    receiptTitle: printerConfig?.receiptTitle || 'ক্যাশ মেমো',
    mushakMode: !!activeTenant?.mushakMode,
    vatEnabled: (() => {
      try {
        const s = localStorage.getItem(`ledgerx_${activeTenant?.id}_pos_vat_config`);
        return s ? JSON.parse(s).enabled : false;
      } catch (e) { return false; }
    })(),
    vatRate: (() => {
      try {
        const s = localStorage.getItem(`ledgerx_${activeTenant?.id}_pos_vat_config`);
        return s ? JSON.parse(s).rate : 5;
      } catch (e) { return 5; }
    })(),
  }));

  const [showLiveReceiptModal, setShowLiveReceiptModal] = useState(false);

  // Sync state if activeTenant changes
  useEffect(() => {
    if (activeTenant) {
      if (activeTenant.customPermissions) {
        setRbacState(activeTenant.customPermissions);
      }
      const cfg = activeTenant.printerConfig || printerConfig || {};
      setPrinterForm((prev) => ({
        ...prev,
        paperWidth: cfg.paperWidth || activeTenant.paperWidth || '58mm',
        shopTitle: cfg.shopTitle || activeTenant.name || '',
        shopAddress: cfg.shopAddress || activeTenant.address || '',
        shopPhone: cfg.shopPhone || activeTenant.phone || '',
        vatBinNumber: cfg.vatBinNumber || activeTenant.vatBinNumber || '',
        bkashMerchantNumber: cfg.bkashMerchantNumber || activeTenant.bKashMerchantNumber || activeTenant.phone || '',
      }));
    }
  }, [activeTenant?.id]);

  // Tab 4: Voicebox State
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    announceSales: true,
    announceDues: true,
    playChimes: true,
  });

  // Tab 6: System Doctor State
  const [doctorReport, setDoctorReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Tab 7: Production Mode State
  const [openingCashTaka, setOpeningCashTaka] = useState('');
  const [openingBkashTaka, setOpeningBkashTaka] = useState('');

  // Save Store Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('দোকানের নাম খালি রাখা যাবে না!');
      return;
    }
    updateActiveTenant({
      ...profileForm,
      type: profileForm.businessType === 'COMMODITY_GRAIN' ? 'wholesale' : 'retail',
    });
    voicebox.playSuccessChime();
    toast.success('দোকান ও ব্যবসা প্রোফাইল সফলভাবে আপডেট হয়েছে!', { icon: '🏢' });
  };

  // Change Owner PIN Handler
  const handleChangePin = (e) => {
    e.preventDefault();
    if (!verifyOwnerPin(pinForm.oldPin)) {
      toast.error('বর্তমান পিন নম্বরটি সঠিক নয়!');
      return;
    }
    if (pinForm.newPin.length < 4) {
      toast.error('নতুন পিন কমপক্ষে ৪ সংখ্যার হতে হবে!');
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      toast.error('নতুন পিন ও কনফার্ম পিন মেলেনি!');
      return;
    }

    updateActiveTenant({ ownerPin: pinForm.newPin });
    setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
    voicebox.playSuccessChime();
    toast.success('দোকান মালিকের সিকিউরিটি পিন সফলভাবে পরিবর্তন হয়েছে!', { icon: '🔐' });
  };

  // Dokan Malik Custom RBAC Matrix Handler
  const handleSaveRbac = () => {
    if (!isOwner) {
      const enteredPin = prompt(isBengali ? 'অনুমতি চার্ট পরিবর্তন করার জন্য দোকান মালিকের ৪-সংখ্যার পিন দিন:' : 'Enter Owner PIN:');
      if (!verifyOwnerPin(enteredPin)) {
        toast.error(isBengali ? 'ভুল পিন নম্বর! অনুমতি চার্ট পরিবর্তন বাতিল।' : 'Invalid PIN!');
        return;
      }
    }
    updateCustomPermissions(rbacState);
    voicebox.playSuccessChime();
    toast.success(isBengali ? 'রোল ভিত্তিক এক্সেস ও অনুমতি চার্ট সফলভাবে সংরক্ষিত হয়েছে!' : 'RBAC permissions saved successfully!', { icon: '🛡️' });
  };

  // Reset RBAC Matrix to Defaults
  const handleResetRbac = () => {
    if (!isOwner) {
      const enteredPin = prompt(isBengali ? 'ফ্যাক্টরি ডিফল্টে রিসেট করতে দোকান মালিকের পিন দিন:' : 'Enter Owner PIN:');
      if (!verifyOwnerPin(enteredPin)) {
        toast.error(isBengali ? 'ভুল পিন নম্বর!' : 'Invalid PIN!');
        return;
      }
    }
    resetPermissionsToDefault();
    setRbacState(DEFAULT_ROLE_PERMISSIONS);
    toast.success(isBengali ? 'অনুমতি চার্ট ফ্যাক্টরি ডিফল্টে রিসেট করা হয়েছে!' : 'Reset to default permissions!');
  };

  // 1-Click Shop-Specific Preset Loader
  const handleSelectShopPreset = (presetKey) => {
    const preset = SHOP_PRINT_PRESETS[presetKey];
    if (!preset) return;
    const { nameBn, nameEn, id, ...configFields } = preset;
    setPrinterForm((prev) => ({
      ...prev,
      ...configFields,
      shopTitle: prev.shopTitle || activeTenant?.name || '',
      shopAddress: prev.shopAddress || activeTenant?.address || '',
      shopPhone: prev.shopPhone || activeTenant?.phone || '',
    }));
    updatePrinterConfig(configFields);
    voicebox.playSuccessChime();
    toast.success(isBengali ? `${preset.nameBn} প্রিন্ট সেটিংস সফলভাবে লোড হয়েছে!` : `${preset.nameEn} preset loaded!`, { icon: '✨' });
  };

  // Save Printer Configuration & POS VAT
  const handleSavePrinter = (e) => {
    if (e) e.preventDefault();
    updatePrinterConfig(printerForm);
    try {
      localStorage.setItem(`ledgerx_${activeTenant?.id}_pos_vat_config`, JSON.stringify({
        enabled: !!printerForm.vatEnabled,
        rate: Number(printerForm.vatRate) || 0,
      }));
    } catch (err) {}
    voicebox.playSuccessChime();
    toast.success(isBengali ? 'প্রিন্টার ও ভ্যাট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Printer & VAT settings saved!', { icon: '🖨️' });
  };

  // Sample Sale Object for Live Receipt Preview
  const sampleReceiptSale = {
    id: 'DEMO-SALE-786',
    memoNumber: 'MEMO-10042',
    timestamp: new Date().toISOString(),
    customerId: 'cust_sample',
    customerName: 'মো: আব্দুল মালেক',
    customerPhone: '০১৭০০-১২২৩৩৪',
    previousDuePoisha: 120000, // ৳১,২০০ পূর্বের বাকি
    containersDueCount: 3, // ৩টি ক্যারেট/বস্তা
    cashierName: 'শামীম (কাউন্টার ০১)',
    items: [
      { name: 'মিনিকেট চাল ৫০ কেজি (১ বস্তা)', quantity: 1, unit: 'বস্তা', unitPricePoisha: 360000, lineTotalPoisha: 360000 },
      { name: 'তীর সয়াবিন তেল ৫ লিটার', quantity: 2, unit: 'বোতল', unitPricePoisha: 85000, lineTotalPoisha: 170000 },
      { name: 'ফ্রেশ পরিশোধিত চিনি ১ কেজি', quantity: 5, unit: 'কেজি', unitPricePoisha: 14000, lineTotalPoisha: 70000 },
    ],
    subtotalPoisha: 600000,
    discountPoisha: 20000,
    vatPoisha: 0,
    grandTotalPoisha: 580000,
    cashPoisha: 380000,
    bkashPoisha: 100000,
    dueAmountPoisha: 100000,
  };

  // Test Print Trigger
  const handleTestPrint = () => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) {
      toast.error('পপ-আপ ব্লকার অন করা আছে, অনুগ্রহ করে অনুমতি দিন!');
      return;
    }
    const widthStyle = printerForm.paperWidth === '80mm' ? '76mm' : printerForm.paperWidth === 'A4' ? '190mm' : '54mm';
    printWindow.document.write(`
      <html>
        <head>
          <title>Test Print - LedgerX</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 11px; margin: 0; padding: 8px; width: ${widthStyle}; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 6px 0; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center">
            ${printerForm.showBismillah ? `<p class="bold" style="margin:2px 0;">${printerForm.headerCustomText || 'বিসমিল্লাহির রাহমানির রাহিম'}</p>` : ''}
            <h3 style="margin:2px 0;">${printerForm.shopTitle || activeTenant.name}</h3>
            ${printerForm.shopSubtitle ? `<p style="margin:2px 0; font-size:10px;">${printerForm.shopSubtitle}</p>` : ''}
            <p style="margin:2px 0; font-size:10px;">${printerForm.shopAddress || activeTenant.address || 'ঢাকা, বাংলাদেশ'}</p>
            <p style="margin:2px 0; font-size:10px;">মোবাইল: ${printerForm.shopPhone || activeTenant.phone || ''} ${printerForm.showVatBin && printerForm.vatBinNumber ? `| BIN: ${printerForm.vatBinNumber}` : ''}</p>
            <div class="bold" style="margin-top:4px;">*** ${printerForm.receiptTitle || 'ক্যাশ মেমো'} (টেস্ট প্রিন্ট) ***</div>
          </div>
          <div class="line"></div>
          <div class="flex"><span>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</span><span>কাউন্টার: ০১</span></div>
          <div class="flex"><span>মেমো নং: #TEST-9081</span><span>সময়: ${new Date().toLocaleTimeString()}</span></div>
          ${printerForm.showCashierName ? `<div class="flex"><span>ক্যাশিয়ার: শামীম</span></div>` : ''}
          <div class="line"></div>
          <div class="flex bold"><span>আইটেম বিবরণ</span><span>পরিমাণ</span><span>মূল্য</span></div>
          <div class="line"></div>
          <div class="flex"><span>মিনিকেট চাল ৫০কেজি</span><span>১ বস্তা</span><span>৩৬০০.০০</span></div>
          <div class="flex"><span>তীর সয়াবিন তেল ৫লিটার</span><span>২ বোতল</span><span>১৭০০.০০</span></div>
          <div class="line"></div>
          <div class="flex bold"><span>সর্বমোট বিল:</span><span>৫৩০০.০০ ৳</span></div>
          <div class="flex"><span>নগদ গ্রহণ:</span><span>৫০০০.০০ ৳</span></div>
          <div class="flex bold" style="color:red;"><span>বর্তমান বাকি:</span><span>৩০০.০০ ৳</span></div>
          ${printerForm.showCustomerDue ? `
          <div class="line"></div>
          <div class="bold">গ্রাহকের সর্বমোট বকেয়া খাতা:</div>
          <div class="flex"><span>পূর্বের বকেয়া:</span><span>৫০০.০০ ৳</span></div>
          <div class="flex"><span>বর্তমান বিক্রয় বাকি:</span><span>৩০০.০০ ৳</span></div>
          <div class="flex bold"><span>সর্বমোট বকেয়া জের:</span><span>৮০০.০০ ৳</span></div>
          ` : ''}
          ${printerForm.showReturnableContainers ? `
          <div class="line"></div>
          <div class="flex"><span>বকেয়া খালি ক্যারেট/বস্তা:</span><span class="bold">২ টি</span></div>
          ` : ''}
          ${printerForm.showBkashQr ? `
          <div class="line"></div>
          <div class="center">
            <p class="bold" style="font-size:9px; margin:2px 0;">বিকাশ মার্চেন্ট পেমেন্ট: ${printerForm.bkashMerchantNumber || activeTenant.phone}</p>
            <p style="font-size:8px; margin:0;">[ কিউআর কোড স্ক্যান করে পেমেন্ট করুন ]</p>
          </div>
          ` : ''}
          ${printerForm.returnPolicy ? `
          <div class="line"></div>
          <div style="font-size:8px; line-height:1.2;"><b>শর্তাবলী:</b> ${printerForm.returnPolicy}</div>
          ` : ''}
          <div class="line"></div>
          <div class="center" style="font-size:9px;">
            <b>${printerForm.footerGreeting || 'ধন্যবাদ, আবার আসবেন!'}</b>
            <p style="font-size:8px; margin-top:2px;">Powered by LedgerX Desktop</p>
          </div>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 1-Click Backup Download
  const handleDownloadBackup = () => {
    const backupData = {
      version: '6.0.0',
      exportedAt: new Date().toISOString(),
      tenant: activeTenant,
      customers,
      suppliers,
      products,
      registers,
      ledgerEntries,
      invoices,
      cheques,
      godownStock,
      chalans,
      journalVouchers: getJournalVouchers ? getJournalVouchers(activeTenant.id) : [],
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LedgerX_Backup_${activeTenant.id}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('সম্পূর্ণ ডাটাবেজ ব্যাকআপ ডাউনলোড সম্পন্ন হয়েছে!', { icon: '💾' });
  };

  // Restore from File
  const handleRestoreFromFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const enteredPin = prompt('ডাটাবেজ রিস্টোর করার জন্য দোকান মালিকের পিন কোড দিন:');
    if (!verifyOwnerPin(enteredPin)) {
      toast.error('ভুল পিন নম্বর! রিস্টোর বাতিল করা হয়েছে।');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.customers && parsed.products) {
          localStorage.setItem(`ledgerx_${activeTenant.id}_customers`, JSON.stringify(parsed.customers));
          localStorage.setItem(`ledgerx_${activeTenant.id}_products`, JSON.stringify(parsed.products));
          if (parsed.suppliers) localStorage.setItem(`ledgerx_${activeTenant.id}_suppliers`, JSON.stringify(parsed.suppliers));
          if (parsed.registers) localStorage.setItem(`ledgerx_${activeTenant.id}_registers`, JSON.stringify(parsed.registers));
          if (parsed.ledgerEntries) localStorage.setItem(`ledgerx_${activeTenant.id}_ledger_entries`, JSON.stringify(parsed.ledgerEntries));
          if (parsed.invoices) localStorage.setItem(`ledgerx_${activeTenant.id}_invoices`, JSON.stringify(parsed.invoices));
          if (parsed.cheques) localStorage.setItem(`ledgerx_${activeTenant.id}_cheques`, JSON.stringify(parsed.cheques));
          if (parsed.godownStock) localStorage.setItem(`ledgerx_${activeTenant.id}_godown_stock`, JSON.stringify(parsed.godownStock));
          if (parsed.chalans) localStorage.setItem(`ledgerx_${activeTenant.id}_chalans`, JSON.stringify(parsed.chalans));
          if (parsed.journalVouchers) localStorage.setItem(`ledgerx_${activeTenant.id}_journal_vouchers`, JSON.stringify(parsed.journalVouchers));

          toast.success('ডাটাবেজ সফলভাবে রিস্টোর হয়েছে! সিস্টেম রিলোড হচ্ছে...', { icon: '🔄' });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error('অকার্যকর ব্যাকআপ ফাইল ফরম্যাট!');
        }
      } catch (err) {
        toast.error('ফাইল পড়তে ত্রুটি হয়েছে!');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run System Doctor Scan
  const handleRunDoctor = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = runSystemDoctor();
      setDoctorReport(res);
      setIsScanning(false);
      if (res.isHealthy) {
        toast.success('ডাটাবেজ ১০০% নির্ভুল ও ব্যালেন্স সঠিক আছে!', { icon: '✅' });
      } else {
        toast('কিছু অসঙ্গতি পাওয়া গেছে। মেরামত বাটনে চাপুন।', { icon: '⚠️' });
      }
    }, 600);
  };

  // Start Clean Production Mode
  const handleLaunchProduction = () => {
    const enteredPin = prompt('আসল খাতা শুরু করতে মালিকের পিন কোড দিন:');
    if (!verifyOwnerPin(enteredPin)) {
      toast.error('ভুল পিন নম্বর! প্রোডাকশন মোড বাতিল।');
      return;
    }

    startProductionMode({
      openingCashPoisha: takaToPoisha(openingCashTaka || 0),
      openingBkashPoisha: takaToPoisha(openingBkashTaka || 0),
    });
  };

  return (
    <RoleAccessGate titleBn="সিস্টেম সেটিংস ও ডাটাবেজ কন্ট্রোল" requiredRole="দোকান মালিক ও ম্যানেজার">
      <div className="w-full space-y-6 pb-12">
        
        {/* ── Top Header Banner ── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md border border-slate-700/60 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">⚙️</span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-pink-400 bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-700/50">
                  সিস্টেম কনফিগারেশন ও অ্যাডমিন
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {isBengali ? 'দোকান সেটিংস ও নিরাপত্তা কেন্দ্র' : 'Store Settings & Security Hub'}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl font-medium">
                {isBengali
                  ? 'আপনার দোকানের প্রোফাইল, প্রিন্টার, বাংলা ভয়েসবক্স, সিকিউরিটি পিন ও ডাটা ব্যাকআপ পরিচালনা করুন।'
                  : 'Manage store identity, thermal printer, audio alerts, and enterprise backups.'}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition cursor-pointer hover:shadow-xs active:scale-95 ${ROLE_CONFIGS[userRole]?.badgeClass || 'bg-slate-100 text-slate-800'}`}
                title={isBengali ? 'রোল ভিত্তিক নিরাপত্তা কেন্দ্র ও পিন দিয়ে রোল পরিবর্তন' : 'Switch role with PIN'}
              >
                {isOwner ? '👑 মালিক মোড' : isManager ? '👔 ম্যানেজার মোড' : '💼 ক্যাশিয়ার'} ({isBengali ? 'পরিবর্তন' : 'Switch'})
              </button>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs Dock (7 Deep Native Tabs) ── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'profile', label: isBengali ? 'দোকান প্রোফাইল' : 'Store Profile', icon: Store },
            { id: 'security', label: isBengali ? 'পিন ও সিকিউরিটি' : 'PIN & Security', icon: Shield },
            { id: 'printer', label: isBengali ? 'প্রিন্টার ও রসিদ' : 'Printer & POS', icon: Printer },
            { id: 'voice', label: isBengali ? 'বাংলা ভয়েসবক্স' : 'Bengali Voice', icon: Volume2 },
            { id: 'backup', label: isBengali ? 'ব্যাকআপ ও রিস্টোর' : 'Backup & Data', icon: Database },
            { id: 'doctor', label: isBengali ? 'সিস্টেম ডক্টর' : 'System Doctor', icon: Stethoscope },
            { id: 'mode', label: isBengali ? 'প্রোডাকশন বনাম ডেমো' : 'Live vs Demo', icon: Rocket },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#E2136E] to-[#B00F55] text-white shadow-md shadow-pink-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Tab 1: Store & Tenant Profile ── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {isBengali ? 'দোকান ও ব্যবসা প্রোফাইল তথ্য' : 'Store & Business Identity'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBengali ? 'এই তথ্যগুলো রসিদ, চালান ও গ্রাহকের এসএমএস/হোয়াটসঅ্যাপে প্রদর্শিত হবে' : 'Displayed on bills and invoices'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'দোকানের নাম (বাংলা)' : 'Store Name (Bangla)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-bold text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'দোকানের নাম (English)' : 'Store Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.nameEn}
                    onChange={(e) => setProfileForm({ ...profileForm, nameEn: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-medium text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'শাখা ও ব্রাঞ্চ নাম' : 'Branch / Outlet'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.branch}
                    onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                    placeholder="যেমন: নিউ মার্কেট শাখা"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-medium text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'ব্যবসার ধরন ও ক্যাটাগরি' : 'Industry Profile'}
                  </label>
                  <select
                    value={profileForm.businessType}
                    onChange={(e) => setProfileForm({ ...profileForm, businessType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-bold text-sm bg-slate-50 focus:bg-white cursor-pointer"
                  >
                    {Object.entries(BUSINESS_PROFILES).map(([key, prof]) => (
                      <option key={key} value={key}>
                        {prof.nameBn} ({prof.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'দোকানের মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="017XX-XXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-mono text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'বিকাশ মার্চেন্ট ওয়ালেট নম্বর' : 'bKash Merchant Wallet'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.bKashMerchantNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, bKashMerchantNumber: e.target.value })}
                    placeholder="017XX-XXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-mono text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'ভ্যাট / বিন / ট্রেড লাইসেন্স' : 'VAT / BIN / Trade License'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.vatBinNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, vatBinNumber: e.target.value })}
                    placeholder="000123456-0101"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-mono text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isBengali ? 'দোকানের ঠিকানা' : 'Store Address'}
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="দোকান নং, মার্কেট, থানা, জেলা"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-sm bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#E2136E] hover:bg-[#B00F55] text-white font-black text-sm shadow-md shadow-pink-600/30 active:scale-95 transition cursor-pointer flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>{isBengali ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Tab 2: Security & PIN ── */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    {isBengali ? 'দোকান মালিকের সিকিউরিটি পিন পরিবর্তন' : 'Change Owner Security PIN'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBengali ? 'এই পিন দিয়ে ডিলিট, লাভ-লোকসান দর্শন ও ব্যাকআপ সুরক্ষিত থাকে (ডিফল্ট: 1234)' : 'Protects deletions and profit'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePin} className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBengali ? 'বর্তমান পিন নম্বর' : 'Current PIN'} *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinForm.oldPin}
                    onChange={(e) => setPinForm({ ...pinForm, oldPin: e.target.value })}
                    placeholder="বর্তমান ৪-সংখ্যার পিন"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBengali ? 'নতুন পিন নম্বর' : 'New PIN'} *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinForm.newPin}
                    onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                    placeholder="নতুন ৪-সংখ্যার পিন"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBengali ? 'নতুন পিন পুনরায় নিশ্চিত করুন' : 'Confirm New PIN'} *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinForm.confirmPin}
                    onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                    placeholder="পুনরায় নতুন পিন"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none font-mono text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-sm shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound size={16} />
                  <span>{isBengali ? 'পিন নম্বর আপডেট করুন' : 'Update Security PIN'}</span>
                </button>
              </form>
            </div>

            {/* Role Permissions Matrix Card (Dokan Malik Customizable RBAC) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </span>
                    <h3 className="text-base font-black text-slate-800">
                      {isBengali ? 'রোল ভিত্তিক এক্সেস ও অনুমতি চার্ট (RBAC)' : 'Role Permissions Breakdown'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isBengali
                      ? 'দোকান মালিক প্রয়োজন অনুযায়ী দোকান ম্যানেজার ও ক্যাশিয়ারের কাজের অনুমতি নির্ধারণ বা পরিবর্তন করতে পারবেন।'
                      : 'Customize granular operational permissions for Manager and Cashier roles.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black">
                      <span>👑</span>
                      <span>{isBengali ? 'দোকান মালিক মোড সক্রিয়' : 'Owner Admin Active'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRoleModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Lock size={13} />
                      <span>{isBengali ? 'মালিক পিন দিয়ে আনলক' : 'Unlock with PIN'}</span>
                    </button>
                  )}
                </div>
              </div>

              {!isOwner && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                  <span>
                    {isBengali
                      ? 'সতর্কতা: আপনি বর্তমানে ' + (isManager ? 'ম্যানেজার' : 'ক্যাশিয়ার') + ' রোলে আছেন। এই চার্ট পরিবর্তন করতে উপরে "মালিক পিন দিয়ে আনলক" করুন।'
                      : 'You are currently logged in as ' + userRole + '. Unlock as Owner to modify permissions.'}
                  </span>
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">ফাংশন / ক্ষমতা</th>
                      <th className="p-3.5 text-center text-amber-900 bg-amber-50/70 border-x border-slate-200/60 w-36 sm:w-44">
                        👑 দোকান মালিক
                      </th>
                      <th className="p-3.5 text-center text-blue-900 bg-blue-50/70 border-r border-slate-200/60 w-44 sm:w-52">
                        👔 দোকান ম্যানেজার
                      </th>
                      <th className="p-3.5 text-center text-emerald-900 bg-emerald-50/70 w-44 sm:w-52">
                        💼 ক্যাশিয়ার
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {Object.entries(rbacState).map(([permKey, perm]) => (
                      <tr key={permKey} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {isBengali ? perm.nameBn : perm.nameEn}
                          </p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            {perm.categoryBn || 'সিস্টেম'}
                          </span>
                        </td>

                        {/* Owner Column - Always Allowed & Locked */}
                        <td className="p-3 text-center border-x border-slate-200/60 bg-amber-50/20">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check size={12} className="stroke-[3]" />
                            <span>{isBengali ? 'হ্যাঁ (সরাসরি)' : 'Allowed'}</span>
                          </span>
                        </td>

                        {/* Manager Column - Customizable */}
                        <td className="p-3 text-center border-r border-slate-200/60 bg-blue-50/20">
                          {isOwner ? (
                            <select
                              value={perm.MANAGER || 'ALLOWED'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRbacState((prev) => ({
                                  ...prev,
                                  [permKey]: {
                                    ...prev[permKey],
                                    MANAGER: val,
                                  },
                                }));
                              }}
                              className={`w-full max-w-[170px] mx-auto px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none transition cursor-pointer shadow-xs ${
                                (perm.MANAGER === 'ALLOWED')
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : (perm.MANAGER === 'PIN_REQUIRED')
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <option value="ALLOWED">✓ হ্যাঁ (অনুমোদিত)</option>
                              <option value="PIN_REQUIRED">🔒 পিন লাগবে</option>
                              <option value="RESTRICTED">✕ নিষিদ্ধ (বন্ধ)</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              perm.MANAGER === 'ALLOWED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : perm.MANAGER === 'PIN_REQUIRED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {perm.MANAGER === 'ALLOWED' && '✓ হ্যাঁ'}
                              {perm.MANAGER === 'PIN_REQUIRED' && '🔒 পিন লাগবে'}
                              {perm.MANAGER === 'RESTRICTED' && '✕ বন্ধ'}
                            </span>
                          )}
                        </td>

                        {/* Cashier Column - Customizable */}
                        <td className="p-3 text-center bg-emerald-50/20">
                          {isOwner ? (
                            <select
                              value={perm.CASHIER || 'RESTRICTED'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRbacState((prev) => ({
                                  ...prev,
                                  [permKey]: {
                                    ...prev[permKey],
                                    CASHIER: val,
                                  },
                                }));
                              }}
                              className={`w-full max-w-[170px] mx-auto px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:outline-none transition cursor-pointer shadow-xs ${
                                (perm.CASHIER === 'ALLOWED')
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : (perm.CASHIER === 'COLLECT_ONLY')
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : (perm.CASHIER === 'PIN_REQUIRED')
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <option value="ALLOWED">✓ হ্যাঁ (অনুমোদিত)</option>
                              {permKey === 'CUSTOMER_KHATA' && (
                                <option value="COLLECT_ONLY">✓ শুধু আদায়</option>
                              )}
                              <option value="PIN_REQUIRED">🔒 পিন লাগবে</option>
                              <option value="RESTRICTED">✕ বন্ধ (নিষিদ্ধ)</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              perm.CASHIER === 'ALLOWED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : perm.CASHIER === 'COLLECT_ONLY'
                                ? 'bg-sky-100 text-sky-800'
                                : perm.CASHIER === 'PIN_REQUIRED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {perm.CASHIER === 'ALLOWED' && '✓ হ্যাঁ'}
                              {perm.CASHIER === 'COLLECT_ONLY' && '✓ শুধু আদায়'}
                              {perm.CASHIER === 'PIN_REQUIRED' && '🔒 পিন লাগবে'}
                              {perm.CASHIER === 'RESTRICTED' && '✕ বন্ধ'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RBAC Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetRbac}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
                >
                  <RotateCcw size={14} />
                  <span>{isBengali ? 'ফ্যাক্টরি ডিফল্ট চার্টে রিসেট' : 'Reset to Default Matrix'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveRbac}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs shadow-md shadow-slate-900/20 active:scale-95 transition cursor-pointer flex items-center gap-2"
                >
                  <Save size={15} />
                  <span>{isBengali ? 'অনুমতি সেটিংস সংরক্ষণ করুন' : 'Save Custom Permissions'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Printer & Receipt Configuration (Shop-Specific Customization) ── */}
        {activeTab === 'printer' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Printer size={20} className="text-[#E2136E]" />
                  <span>{isBengali ? 'থার্মাল প্রিন্টার ও রসিদ ফরম্যাট (দোকান ভিত্তিক)' : 'Thermal Printer & Shop-Specific Memo'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBengali
                    ? 'দোকানের ধরন অনুযায়ী রসিদের হেডার, বকেয়া স্টেটমেন্ট, বিকাশ কিউআর ও ফেরত নীতি কাস্টমাইজ করুন'
                    : 'Configure paper width, customer due breakdown, return policy and bKash QR for your shop type'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLiveReceiptModal(true)}
                className="px-4 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#E2136E] font-bold text-xs transition border border-pink-200 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <Eye size={15} />
                <span>{isBengali ? 'লাইভ মেমো প্রিভিউ দেখুন' : 'Live Receipt Preview'}</span>
              </button>
            </div>

            {/* 1-Click Shop Vertical Presets */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                {isBengali ? '⚡ ১-ক্লিকে দোকানের ধরন অনুযায়ী রসিদ সেটআপ করুন:' : '⚡ 1-Click Shop Vertical Presets:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {Object.entries(SHOP_PRINT_PRESETS).map(([pKey, p]) => (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => handleSelectShopPreset(pKey)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-[#E2136E] hover:bg-pink-50/40 text-left transition-all cursor-pointer group active:scale-95"
                  >
                    <p className="font-black text-xs text-slate-800 group-hover:text-[#E2136E] truncate">
                      {p.nameBn}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {p.paperWidth} | {p.showCustomerDue ? 'বাকি সহ' : 'নগদ'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSavePrinter} className="space-y-6 pt-2">
              {/* Paper Width Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {isBengali ? 'প্রিন্ট কাগজের সাইজ ও ফরম্যাট' : 'Receipt Paper Width'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: '58mm', name: '৫৮ মিমি (ছোট থার্মাল)', desc: 'খুচরা দোকান ও সাধারণ রসিদ' },
                    { id: '80mm', name: '৮০ মিমি (স্ট্যান্ডার্ড থার্মাল)', desc: 'বড় দোকান, সুপারশপ ও আড়ত' },
                    { id: 'A4', name: 'A4 ফুল পেইজ (মুসক ৬.৩)', desc: 'কর্পোরেট ট্যাক্স চালান ও মিল' },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setPrinterForm({ ...printerForm, paperWidth: p.id })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        printerForm.paperWidth === p.id
                          ? 'border-[#E2136E] bg-pink-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className={`font-black text-sm ${printerForm.paperWidth === p.id ? 'text-[#E2136E]' : 'text-slate-800'}`}>
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shop Title, Slogan & Header Text */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {isBengali ? '১. দোকানের নাম, স্লোগান ও রসিদ ব্যানার' : '1. Store Identity & Header Banner'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBengali ? 'রসিদে মুদ্রিত দোকানের নাম' : 'Receipt Shop Title'}
                    </label>
                    <input
                      type="text"
                      value={printerForm.shopTitle}
                      onChange={(e) => setPrinterForm({ ...printerForm, shopTitle: e.target.value })}
                      placeholder={activeTenant?.name || 'দোকানের নাম'}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-sm font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBengali ? 'দোকানের স্লোগান বা বিশেষত্ব' : 'Shop Slogan / Specialty'}
                    </label>
                    <input
                      type="text"
                      value={printerForm.shopSubtitle}
                      onChange={(e) => setPrinterForm({ ...printerForm, shopSubtitle: e.target.value })}
                      placeholder="যেমন: পাইকারি ও খুচরা বিক্রেতা"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-sm font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBengali ? 'দোকানের ঠিকানা' : 'Store Address'}
                    </label>
                    <input
                      type="text"
                      value={printerForm.shopAddress}
                      onChange={(e) => setPrinterForm({ ...printerForm, shopAddress: e.target.value })}
                      placeholder="মার্কেট, থানা, জেলা"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-sm font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isBengali ? 'যোগাযোগের মোবাইল নম্বর' : 'Store Phone'}
                    </label>
                    <input
                      type="text"
                      value={printerForm.shopPhone}
                      onChange={(e) => setPrinterForm({ ...printerForm, shopPhone: e.target.value })}
                      placeholder="০১৭১১-০০০০০০"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-sm font-medium bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Bismillah / Top Greeting */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printerForm.showBismillah}
                      onChange={(e) => setPrinterForm({ ...printerForm, showBismillah: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E2136E] focus:ring-[#E2136E] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {isBengali ? 'রসিদের শুরুতে শীর্ষ বাণী প্রিন্ট করুন' : 'Show Top Greeting Banner'}
                    </span>
                  </label>

                  {printerForm.showBismillah && (
                    <input
                      type="text"
                      value={printerForm.headerCustomText}
                      onChange={(e) => setPrinterForm({ ...printerForm, headerCustomText: e.target.value })}
                      placeholder="বিসমিল্লাহির রাহমানির রাহিম"
                      className="flex-1 sm:max-w-xs px-3.5 py-1.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-xs font-bold bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Shop Operational Printing Details Toggles */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  {isBengali ? '২. দোকান ভেদে গুরুত্বপূর্ণ প্রিন্টিং অপশন ও টগল' : '2. Shop-Specific Operational Receipt Toggles'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Customer Due Statement Toggle */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={printerForm.showCustomerDue}
                      onChange={(e) => setPrinterForm({ ...printerForm, showCustomerDue: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-[#E2136E] focus:ring-[#E2136E] cursor-pointer shrink-0"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {isBengali ? 'গ্রাহকের বকেয়া ও জের প্রিন্ট করুন' : 'Print Customer Due Breakdown'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isBengali ? 'রসিদে পূর্বের বকেয়া, বর্তমান বিল ও মোট বাকি স্পষ্টভাবে আসবে' : 'Show previous due + current due'}
                      </p>
                    </div>
                  </label>

                  {/* Cashier / Counter Line */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={printerForm.showCashierName}
                      onChange={(e) => setPrinterForm({ ...printerForm, showCashierName: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-[#E2136E] focus:ring-[#E2136E] cursor-pointer shrink-0"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {isBengali ? 'ক্যাশিয়ার ও কাউন্টার লাইন প্রিন্ট' : 'Print Cashier & Counter #'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isBengali ? 'কোন ক্যাশিয়ার মেমো কেটেছেন তা রসিদে প্রদর্শিত হবে' : 'Show who served the invoice'}
                      </p>
                    </div>
                  </label>

                  {/* Returnable Containers Khata */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={printerForm.showReturnableContainers}
                      onChange={(e) => setPrinterForm({ ...printerForm, showReturnableContainers: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-[#E2136E] focus:ring-[#E2136E] cursor-pointer shrink-0"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {isBengali ? 'খালি বস্তা ও ক্যারেট দেনা প্রিন্ট' : 'Print Returnable Containers Balance'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isBengali ? 'আড়ত, সিমেন্ট ও মুদির খালি বস্তা বা গ্যাস সিলিন্ডারের সংখ্যা' : 'Sacks/crates due balance'}
                      </p>
                    </div>
                  </label>

                  {/* bKash QR Code */}
                  <label className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={printerForm.showBkashQr}
                      onChange={(e) => setPrinterForm({ ...printerForm, showBkashQr: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded text-[#E2136E] focus:ring-[#E2136E] cursor-pointer shrink-0"
                    />
                    <div>
                      <p className="font-bold text-xs text-slate-900">
                        {isBengali ? 'ইনস্ট্যান্ট বিকাশ মার্চেন্ট কিউআর কোড' : 'Dynamic bKash Merchant QR'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isBengali ? 'কাস্টমার রসিদ স্ক্যান করে সরাসরি বিকাশ পেমেন্ট করতে পারবেন' : 'Scan & pay QR code on receipt'}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Additional Inputs: VAT BIN & Merchant Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isBengali ? 'ভ্যাট / BIN নম্বর (মূসক)' : 'VAT / BIN Number'}
                    </label>
                    <input
                      type="text"
                      value={printerForm.vatBinNumber}
                      onChange={(e) => setPrinterForm({ ...printerForm, vatBinNumber: e.target.value })}
                      placeholder="000123456-0101"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-xs font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isBengali ? 'ড্রাগ লাইসেন্স (ফার্মেসির জন্য)' : 'Drug License No'}
                    </label>
                    <input
                      type="text"
                      value={printerForm.drugLicenseNo}
                      onChange={(e) => setPrinterForm({ ...printerForm, drugLicenseNo: e.target.value })}
                      placeholder="DL-10842/DHK"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-xs font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isBengali ? 'কিউআর কোডের বিকাশ মার্চেন্ট নম্বর' : 'bKash Merchant Number'}
                    </label>
                    <input
                      type="text"
                      value={printerForm.bkashMerchantNumber}
                      onChange={(e) => setPrinterForm({ ...printerForm, bkashMerchantNumber: e.target.value })}
                      placeholder="০১৭১১-০০০০০০"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Return Policy & Terms Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'দোকানের বিশেষ ফেরত নীতি ও গ্রাহক নির্দেশিকা (Return Policy)' : 'Receipt Return Policy & Terms'}
                </label>
                <textarea
                  rows={2}
                  value={printerForm.returnPolicy}
                  onChange={(e) => setPrinterForm({ ...printerForm, returnPolicy: e.target.value })}
                  placeholder="যেমন: বিক্রীত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ অক্ষত অবস্থায় পরিবর্তনযোগ্য। টাকা ফেরত দেওয়া হয় না।"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-xs font-medium leading-relaxed"
                />
              </div>

              {/* Footer Greeting */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'রসিদের সমাপ্তি বাণী (Footer Greeting)' : 'Receipt Footer Greeting'}
                </label>
                <input
                  type="text"
                  value={printerForm.footerGreeting}
                  onChange={(e) => setPrinterForm({ ...printerForm, footerGreeting: e.target.value })}
                  placeholder="ধন্যবাদ, আবার আসবেন!"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#E2136E] focus:outline-none text-sm font-medium"
                />
              </div>

              {/* ── POS VAT & Tax Configuration ── */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      {isBengali ? 'পিওএস ভ্যাট ও মূসক নির্ধারণ (POS VAT Settings)' : 'POS VAT & Tax Configuration'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isBengali ? 'পিওএস কাউন্টারে স্বয়ংক্রিয়ভাবে কোন ভ্যাট হার প্রযোজ্য হবে নির্বাচন করুন' : 'Select standard VAT rate applied in Express POS'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!printerForm.vatEnabled}
                      onChange={(e) => setPrinterForm({ ...printerForm, vatEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { label: isBengali ? '০% (ভ্যাট নেই)' : '0% (No VAT)', val: 0 },
                    { label: isBengali ? '৫% (রিটেল)' : '5% (Retail)', val: 5 },
                    { label: isBengali ? '৭.৫% (বিশেষ)' : '7.5% (Special)', val: 7.5 },
                    { label: isBengali ? '১৫% (স্ট্যান্ডার্ড মূসক)' : '15% (Mushak)', val: 15 },
                  ].map((v) => {
                    const isSelected = printerForm.vatEnabled && Number(printerForm.vatRate) === v.val;
                    return (
                      <button
                        key={v.val}
                        type="button"
                        onClick={() => setPrinterForm({ ...printerForm, vatRate: v.val, vatEnabled: v.val > 0 })}
                        className={`py-2 px-3 rounded-xl text-xs font-black border transition cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-emerald-400" />}
                        <span>{v.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestPrint}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <Printer size={16} />
                    <span>{isBengali ? 'টেস্ট প্রিন্ট দিন' : 'Test Print'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLiveReceiptModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#E2136E] font-bold text-xs transition border border-pink-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Eye size={15} />
                    <span>{isBengali ? 'লাইভ প্রিভিউ' : 'Live Preview'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#E2136E] hover:bg-[#B00F55] text-white font-black text-xs shadow-md shadow-pink-600/30 active:scale-95 transition cursor-pointer flex items-center gap-2"
                >
                  <Save size={16} />
                  <span>{isBengali ? 'প্রিন্টার সেটিংস সেভ করুন' : 'Save Printer Settings'}</span>
                </button>
              </div>
            </form>

            {/* Live Receipt Preview Modal */}
            {showLiveReceiptModal && (
              <ThermalReceiptPreview
                sale={sampleReceiptSale}
                isOpen={true}
                onClose={() => setShowLiveReceiptModal(false)}
              />
            )}
          </div>
        )}

        {/* ── Tab 4: Bengali Voicebox ── */}
        {activeTab === 'voice' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {isBengali ? 'স্মার্ট বাংলা ভয়েসবক্স ও সাউন্ড নোটিফিকেশন' : 'Bengali Voicebox & Chimes'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBengali ? 'বিকাশ স্টাইলের স্পিকার যা বিক্রয় ও টাকা জমার সাথে সাথে খাঁটি বাংলায় ঘোষণা দেয়' : 'Speaks amounts in native Bangla'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  voicebox.announceSale('৫২০');
                  toast.success('ভয়েসবক্স টেস্ট সম্পন্ন!');
                }}
                className="px-4 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-[#E2136E] font-bold text-xs transition border border-pink-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Play size={14} />
                <span>{isBengali ? 'ভয়েস টেস্ট শুনুন' : 'Test Voice'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'announceSales', title: 'বিক্রয় সম্পন্ন হলে টাকার অংক মুখে বলা', desc: 'যেমন: "৫২০ টাকা বিক্রয় সম্পন্ন হয়েছে"' },
                { key: 'announceDues', title: 'গ্রাহকের বকেয়া টাকা জমা হলে ঘোষণা', desc: 'যেমন: "রহিম মিয়া ১,২০০ টাকা পরিশোধ করেছেন"' },
                { key: 'playChimes', title: 'লেনদেন নিশ্চিতকরণ চাইম টিউন বাজানো', desc: 'সফল এন্ট্রি বা প্রিন্টের সাথে ক্রিস্প চেইম বাজবে' },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200/80 hover:bg-slate-50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={voiceSettings[item.key]}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, [item.key]: e.target.checked })}
                    className="w-5 h-5 accent-[#E2136E] mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 5: Backup & Restore ── */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {isBengali ? 'ডাটাবেজ ব্যাকআপ, এক্সপোর্ট ও রিস্টোর' : 'Backup & Offline Archival'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBengali ? 'আপনার সকল খাতা, গ্রাহক, মহাজন ও বিক্রয় ডাটা ১০০% অফলাইনে নিরাপদে সংরক্ষণ করুন' : 'Export and restore JSON datasets'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                  <Download size={22} />
                </div>
                <h3 className="text-base font-black text-slate-800">১-ক্লিক ফুল ব্যাকআপ ডাউনলোড</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  বর্তমান দোকানের সকল খাতা, পণ্য, চালানি ও ক্যাশবাক্স ডাটা একটি JSON ফাইলে সেভ করুন।
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>ব্যাকআপ ফাইল ডাউনলোড করুন (.json)</span>
                </button>
              </div>

              <div className="p-5 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                  <Upload size={22} />
                </div>
                <h3 className="text-base font-black text-slate-800">ব্যাকআপ ফাইল থেকে রিস্টোর</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  পূর্বে সেভ করা JSON ব্যাকআপ আপলোড করে খাতার সকল হিসাব পুনরায় ফিরে পান (মালিকের পিন লাগবে)।
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleRestoreFromFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  <span>ব্যাকআপ ফাইল আপলোড ও রিস্টোর</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 6: System Doctor ── */}
        {activeTab === 'doctor' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {isBengali ? 'সিস্টেম ডক্টর ও ডাটাবেজ ইন্টিগ্রিটি সেলফ-হিলিং' : 'System Doctor & Balance Audit'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBengali ? 'খাতার প্রতিটি লেনদেনের যোগফল মিলিয়ে কোনো গরমিল থাকলে এক ক্লিকে স্বয়ংক্রিয় মেরামত' : 'Audit and balance reconciliation'}
                </p>
              </div>

              <button
                type="button"
                disabled={isScanning}
                onClick={handleRunDoctor}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer flex items-center gap-2"
              >
                <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                <span>{isScanning ? 'স্ক্যান হচ্ছে...' : 'ইন্টিগ্রিটি স্ক্যান চালান'}</span>
              </button>
            </div>

            {doctorReport ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${doctorReport.isHealthy ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{doctorReport.isHealthy ? '🛡️' : '⚠️'}</span>
                    <div>
                      <p className="font-black text-sm">
                        {doctorReport.isHealthy ? 'ডাটাবেজ ১০০% সুরক্ষিত ও ব্যালেন্স নিখুঁত!' : `সতর্কবার্তা: ${doctorReport.totalAnomalies} টি ব্যালেন্স গরমিল পাওয়া গেছে!`}
                      </p>
                      <p className="text-xs mt-0.5 opacity-90">
                        কাস্টমার অসঙ্গতি: {doctorReport.customerIssues} টি | মহাজন অসঙ্গতি: {doctorReport.supplierIssues} টি
                      </p>
                    </div>
                  </div>
                </div>

                {!doctorReport.isHealthy && (
                  <button
                    type="button"
                    onClick={() => {
                      autoHealLedger();
                      handleRunDoctor();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Stethoscope size={18} />
                    <span>১-ক্লিকে স্বয়ংক্রিয় মেরামত ও ব্যালেন্স পুনর্নির্ধারণ (Auto-Heal)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                ইন্টিগ্রিটি স্ক্যান চালাতে উপরের বাটনে ক্লিক করুন।
              </div>
            )}
          </div>
        )}

        {/* ── Tab 7: Production vs Demo Mode ── */}
        {activeTab === 'mode' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  {isBengali ? 'আসল খাতা (Production) বনাম নমুনা ডেমো মোড' : 'Live Production vs Sample Demo'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBengali ? 'দোকানে খাঁটি লাইভ হিসাব শুরু করতে ডেমো ডাটা মুছে ফ্রেশ খাতা সক্রিয় করুন' : 'Reset to zero clutter for live launch'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200 bg-slate-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    বর্তমান অবস্থা: {isProductionMode ? '🚀 লাইভ আসল খাতা মোড (Live Store)' : '🧪 নমুনা ডেমো মোড (Training Mode)'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isProductionMode
                      ? 'আপনার আসল খাতা সক্রিয় আছে। এখানে শুধু আপনার বাস্তব কাস্টমার ও পণ্য থাকবে।'
                      : 'নমুনা কাস্টমার ও পণ্যের ডাটা দিয়ে টেস্ট ড্রাইভ চলছে।'}
                  </p>
                </div>
              </div>

              {!isProductionMode ? (
                <div className="pt-2 border-t border-slate-200/80 space-y-4">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    প্রারম্ভিক ক্যাশবাক্স ব্যালেন্স সেট করুন (ঐচ্ছিক):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">প্রারম্ভিক নগদ ক্যাশ (টাকা)</label>
                      <input
                        type="number"
                        placeholder="যেমন: 5000"
                        value={openingCashTaka}
                        onChange={(e) => setOpeningCashTaka(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">প্রারম্ভিক বিকাশ মার্চেন্ট ব্যালেন্স (টাকা)</label>
                      <input
                        type="number"
                        placeholder="যেমন: 2000"
                        value={openingBkashTaka}
                        onChange={(e) => setOpeningBkashTaka(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLaunchProduction}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white font-black text-sm shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Rocket size={18} />
                    <span>ডেমো মুছে ফ্রেশ লাইভ খাতা চালু করুন</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('আপনি কি নমুনা ডেমো ডাটাবেজে ফেরত যেতে চান?')) {
                        resetToDemoMode();
                      }
                    }}
                    className="py-2.5 px-4 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    <span>ডেমো মোডে ফেরত যান (টেস্টিং ডাটা রিলোড)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <RoleSwitcherModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          initialRole={ROLES.OWNER}
        />

      </div>
    </RoleAccessGate>
  );
}
