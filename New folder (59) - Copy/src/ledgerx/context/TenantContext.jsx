import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext(null);

export const ROLES = {
  OWNER: 'OWNER',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
};

export const ROLE_CONFIGS = {
  OWNER: {
    key: 'OWNER',
    nameBn: 'দোকান মালিক (অ্যাডমিন)',
    nameEn: 'Shop Owner / Admin',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    descriptionBn: 'সম্পূর্ণ সিস্টেমের ১০০% নিয়ন্ত্রণ, নিট লাভ-লস হিসাব, ডাটাবেজ ব্যাকআপ ও ডিলিট অধিকার',
  },
  MANAGER: {
    key: 'MANAGER',
    nameBn: 'দোকান ম্যানেজার (ব্যবস্থাপক)',
    nameEn: 'Shop Manager',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    descriptionBn: 'দৈনন্দিন কেনা-বেচা, স্টক ও খাতা পরিচালনা। মালিকের গোপন লাভ দেখা বা ডিলিট নিষেধ',
  },
  CASHIER: {
    key: 'CASHIER',
    nameBn: 'ক্যাশিয়ার (বিক্রয়কর্মী)',
    nameEn: 'Cashier / Salesperson',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    descriptionBn: 'শুধু পিওএস ক্যাশ মেমো, ড্রয়ার লেনদেন ও পণ্যের মূল্য দেখা। মহাজন খাতা বন্ধ',
  },
};

export const PERMISSIONS = {
  VIEW_PROFIT: 'VIEW_PROFIT', // মালিকের লাভ-লোকসান দেখা
  DELETE_RECORD: 'DELETE_RECORD', // কাস্টমার, মহাজন বা পণ্য মুছে ফেলা
  EDIT_RECORD: 'EDIT_RECORD', // কাস্টমার, মহাজন বা পণ্য তথ্য পরিবর্তন
  EDIT_COST_PRICE: 'EDIT_COST_PRICE', // কেনা দর দেখা ও এডিট
  VIEW_SUPPLIERS: 'VIEW_SUPPLIERS', // মহাজন খাতা ও দেনা দেখা
  MANAGE_GODOWN: 'MANAGE_GODOWN', // গুদাম ও চালানি পরিচালনা
  SYSTEM_SETTINGS: 'SYSTEM_SETTINGS', // ডাটাবেজ ব্যাকআপ, রিসেট ও নোড
  POS_SALE: 'POS_SALE', // পিওএস বিক্রয় ও মেমো প্রিন্ট
  CUSTOMER_KHATA: 'CUSTOMER_KHATA', // গ্রাহকের বকেয়া খাতা ও আদায়
  GIVE_DISCOUNT: 'GIVE_DISCOUNT', // বিক্রয়ে বিশেষ ছাড় প্রদান
  APPROVE_CREDIT: 'APPROVE_CREDIT', // বাকিতে বিক্রয় অনুমোদন
  VOID_SALE: 'VOID_SALE', // মেমো বাতিল ও সেলস রিটার্ন
  EXPENSE_ENTRY: 'EXPENSE_ENTRY', // দোকান খরচ এন্ট্রি
};

// ── Master Customizable Role Permissions Matrix (Default Factory Baseline) ─────
export const DEFAULT_ROLE_PERMISSIONS = {
  POS_SALE: {
    id: 'POS_SALE',
    nameBn: 'পিওএস বিক্রয় ও মেমো প্রিন্ট',
    nameEn: 'POS Sale & Print Memo',
    categoryBn: 'বিক্রয়',
    OWNER: 'ALLOWED',
    MANAGER: 'ALLOWED',
    CASHIER: 'ALLOWED',
  },
  CUSTOMER_KHATA: {
    id: 'CUSTOMER_KHATA',
    nameBn: 'গ্রাহকের বকেয়া খাতা ও আদায়',
    nameEn: 'Customer Ledger & Due Collection',
    categoryBn: 'খাতা',
    OWNER: 'ALLOWED',
    MANAGER: 'ALLOWED',
    CASHIER: 'COLLECT_ONLY', // 'ALLOWED' | 'COLLECT_ONLY' | 'RESTRICTED'
  },
  DELETE_RECORD: {
    id: 'DELETE_RECORD',
    nameBn: 'কাস্টমার / মহাজন মুছে ফেলা (Delete)',
    nameEn: 'Delete Customer / Supplier / Product',
    categoryBn: 'নিরাপত্তা',
    OWNER: 'ALLOWED',
    MANAGER: 'PIN_REQUIRED',
    CASHIER: 'RESTRICTED',
  },
  VIEW_SUPPLIERS: {
    id: 'VIEW_SUPPLIERS',
    nameBn: 'মহাজন খাতা ও ক্রয়ের দেনা দর্শন',
    nameEn: 'Supplier Ledger & Purchase Dues',
    categoryBn: 'খাতা',
    OWNER: 'ALLOWED',
    MANAGER: 'ALLOWED',
    CASHIER: 'RESTRICTED',
  },
  VIEW_PROFIT: {
    id: 'VIEW_PROFIT',
    nameBn: 'পণ্যের কেনা দর ও নিট লাভ দর্শন',
    nameEn: 'Cost Price & Net Profit Visibility',
    categoryBn: 'রিপোর্ট',
    OWNER: 'ALLOWED',
    MANAGER: 'PIN_REQUIRED',
    CASHIER: 'RESTRICTED',
  },
  SYSTEM_SETTINGS: {
    id: 'SYSTEM_SETTINGS',
    nameBn: 'ডাটাবেজ ব্যাকআপ, রিস্টোর ও রিসেট',
    nameEn: 'Database Backup, Restore & Reset',
    categoryBn: 'সিস্টেম',
    OWNER: 'ALLOWED',
    MANAGER: 'PIN_REQUIRED',
    CASHIER: 'RESTRICTED',
  },
  GIVE_DISCOUNT: {
    id: 'GIVE_DISCOUNT',
    nameBn: 'বিক্রয়ে বিশেষ ছাড় বা ডিসকাউন্ট প্রদান',
    nameEn: 'Sales Discount Authority',
    categoryBn: 'বিক্রয়',
    OWNER: 'ALLOWED',
    MANAGER: 'ALLOWED',
    CASHIER: 'PIN_REQUIRED',
  },
  APPROVE_CREDIT: {
    id: 'APPROVE_CREDIT',
    nameBn: 'বাকিতে বিক্রয় ও ঋণ অনুমোদন',
    nameEn: 'Credit Sale & Loan Authorization',
    categoryBn: 'বিক্রয়',
    OWNER: 'ALLOWED',
    MANAGER: 'ALLOWED',
    CASHIER: 'PIN_REQUIRED',
  },
  VOID_SALE: {
    id: 'VOID_SALE',
    nameBn: 'মেমো বাতিল ও বিক্রয় ফেরত (Return)',
    nameEn: 'Void Memo & Return Invoices',
    categoryBn: 'বিক্রয়',
    OWNER: 'ALLOWED',
    MANAGER: 'PIN_REQUIRED',
    CASHIER: 'RESTRICTED',
  },
  EXPENSE_ENTRY: {
    id: 'EXPENSE_ENTRY',
    nameBn: 'দোকান খরচ এন্ট্রি ও ভাউচার তৈরি',
    nameEn: 'Daily Operating Expense Logging',
    categoryBn: 'হিসাব',
    OWNER: 'ALLOWED',
    MANAGER: 'ALLOWED',
    CASHIER: 'RESTRICTED',
  },
};

// ── Default Shop Thermal Printer & Receipt Configuration ──────────────────────
export const DEFAULT_PRINTER_CONFIG = {
  paperWidth: '58mm', // '58mm' | '80mm' | 'A4'
  showBismillah: true,
  headerCustomText: 'বিসমিল্লাহির রাহমানির রাহিম',
  shopTitle: '',
  shopSubtitle: 'সেরা মানের নিত্যপ্রয়োজনীয় পণ্যের নির্ভরযোগ্য প্রতিষ্ঠান',
  shopAddress: '',
  shopPhone: '',
  showVatBin: true,
  vatBinNumber: '',
  tradeLicenseNo: '',
  drugLicenseNo: '',
  showCustomerDue: true, // রসিদে পূর্বের বকেয়া ও মোট বাকি দেখানো হবে
  showCashierName: true, // কাউন্টার ও ক্যাশিয়ার লাইন প্রিন্ট হবে
  showReturnableContainers: true, // খালি বস্তা / ক্যারেট দেনা প্রিন্ট হবে
  showBkashQr: true, // রসিদে ইনস্ট্যান্ট বিকাশ কিউআর কোড থাকবে
  bkashMerchantNumber: '',
  returnPolicy: 'বিক্রীত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ অক্ষত অবস্থায় পরিবর্তনযোগ্য। পণ্য ফেরত নেওয়া হয় না।',
  footerGreeting: 'ধন্যবাদ, আবার আসবেন!',
  receiptTitle: 'ক্যাশ মেমো',
};

// ── 1-Click Shop-Specific Presets ─────────────────────────────────────────────
export const SHOP_PRINT_PRESETS = {
  GENERAL_RETAIL: {
    id: 'GENERAL_RETAIL',
    nameBn: '🛒 মুদি ও সুপারশপ',
    nameEn: 'Grocery & Super shop',
    paperWidth: '58mm',
    showBismillah: true,
    headerCustomText: 'বিসমিল্লাহির রাহমানির রাহিম',
    shopSubtitle: 'সেরা মানের নিত্যপ্রয়োজনীয় পণ্যের নির্ভরযোগ্য প্রতিষ্ঠান',
    showCustomerDue: true,
    showCashierName: true,
    showReturnableContainers: false,
    showBkashQr: true,
    returnPolicy: 'বিক্রীত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ অক্ষত অবস্থায় পরিবর্তনযোগ্য। টাকা ফেরত দেওয়া হয় না।',
    footerGreeting: 'ধন্যবাদ, আবার আসবেন!',
    receiptTitle: 'ক্যাশ মেমো',
  },
  PHARMACY: {
    id: 'PHARMACY',
    nameBn: '💊 ফার্মেসি ও ড্রাগ হাউস',
    nameEn: 'Pharmacy & Drug Store',
    paperWidth: '80mm',
    showBismillah: true,
    headerCustomText: 'রোগ মুক্তির মালিক একমাত্র আল্লাহ',
    shopSubtitle: 'কম্পিউটারাইজড প্রেসক্রিপশনে সঠিক ওষুধ ও পরামর্শ',
    drugLicenseNo: 'DL-10842/DHK',
    showCustomerDue: true,
    showCashierName: true,
    showReturnableContainers: false,
    showBkashQr: true,
    returnPolicy: 'কাটা পাতা ওষুধ, ইনসুলিন ও রেফ্রিজারেটেড পণ্য কোনো অবস্থাতেই ফেরত বা পরিবর্তনযোগ্য নয়।',
    footerGreeting: 'আপনার দ্রুত আরোগ্য কামনা করি!',
    receiptTitle: 'ক্যাশ মেমো ও ড্রাগ ইনভয়েস',
  },
  HARDWARE: {
    id: 'HARDWARE',
    nameBn: '🏗️ রড, সিমেন্ট ও হার্ডওয়্যার',
    nameEn: 'Hardware, Rod & Cement',
    paperWidth: '80mm',
    showBismillah: true,
    headerCustomText: 'বিসমিল্লাহির রাহমানির রাহিম',
    shopSubtitle: 'গুণগত মানের নির্মাণ সামগ্রী, রড, সিমেন্ট ও পাইকারি বিক্রেতা',
    showCustomerDue: true,
    showCashierName: true,
    showReturnableContainers: true,
    showBkashQr: true,
    returnPolicy: 'ডেলিভারি গাড়ির মাল বুঝে নিয়ে স্বাক্ষর করুন। পরবর্তীতে বস্তা ঘাটতি বা ড্যামেজ গ্রহণযোগ্য নয়।',
    footerGreeting: 'নির্মাণে আপনার নির্ভরযোগ্য অংশীদার!',
    receiptTitle: 'বিক্রয় চালান ও ক্যাশ মেমো',
  },
  WHOLESALE: {
    id: 'WHOLESALE',
    nameBn: '📦 পাইকারি আড়ত ও মোকাম',
    nameEn: 'Wholesale Arat & Commodity',
    paperWidth: '80mm',
    showBismillah: true,
    headerCustomText: 'বিসমিল্লাহির রাহমানির রাহিম',
    shopSubtitle: 'মোকাম হতে সরাসরি আমদানিকৃত চাল, ডাল ও তেল আড়তদার',
    showCustomerDue: true,
    showCashierName: true,
    showReturnableContainers: true,
    showBkashQr: true,
    returnPolicy: 'মোকামের মাল ডেলিভারির সময় ওজন ও খাঁটি অবস্থা যাচাই করে নিন।',
    footerGreeting: 'নিয়মিত লেনদেনের জন্য ধন্যবাদ!',
    receiptTitle: 'পাইকারি চালান ও ডেলিভারি মেমো',
  },
  FASHION: {
    id: 'FASHION',
    nameBn: '👗 পোশাক ও ফ্যাশন হাউস',
    nameEn: 'Garments & Boutique',
    paperWidth: '58mm',
    showBismillah: false,
    headerCustomText: '',
    shopSubtitle: 'আধুনিক ও ট্রেন্ডি লাইফস্টাইল কালেকশন',
    showCustomerDue: false,
    showCashierName: true,
    showReturnableContainers: false,
    showBkashQr: true,
    returnPolicy: 'ট্যাগ ও মেমো সহ ৩ দিনের মধ্যে সাইজ এক্সচেঞ্জ সুবিধা। অন্তর্বাস ও অফার পণ্য ফেরত প্রযোজ্য নয়।',
    footerGreeting: 'আপনার সন্তুষ্টিই আমাদের সার্থকতা!',
    receiptTitle: 'ক্যাশ মেমো',
  },
  OPTICS: {
    id: 'OPTICS',
    nameBn: '👓 চশমা ও অপটিক্যালস আই কেয়ার',
    nameEn: 'Optics & Vision Care',
    paperWidth: '80mm',
    showBismillah: true,
    headerCustomText: 'চোখ মহান আল্লাহর এক অমূল্য নিয়ামত',
    shopSubtitle: 'কম্পিউটারাইজড চক্ষু পরীক্ষা, আধুনিক ফ্রেম ও লেন্স বিশেষজ্ঞ',
    tradeLicenseNo: 'TR-OPT-88219/DHK',
    showCustomerDue: true,
    showCashierName: true,
    showReturnableContainers: false,
    showBkashQr: true,
    returnPolicy: 'পাওয়ার লেন্স তৈরির পর পরিবর্তনযোগ্য নয়। ফ্রেম ও ফিটিংসের ১ বছরের ফ্রি সার্ভিস গ্যারান্টি। প্রতি ৬ মাস পর পর লেন্স চেকআপ করান।',
    footerGreeting: 'আপনার দৃষ্টিশক্তি সুস্থ ও সুরক্ষিত থাকুক!',
    receiptTitle: 'চশমা বিক্রয় রসিদ ও পাওয়ার মেমো',
  },
};

const DEFAULT_TENANTS = [
  {
    id: 'store_001',
    name: 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা',
    nameEn: 'Universal Digital Business & Enterprise Khata',
    branch: 'প্রধান কার্যালয় / কেন্দ্রীয় শোরুম (শাখা ১)',
    branchEn: 'Central Head Office & Showroom (Branch 1)',
    type: 'universal',
    businessType: 'GENERAL_RETAIL',
    phone: '01711-000000',
    address: 'মেইন রোড, বাণিজ্যিক এলাকা, ঢাকা',
    bKashMerchantNumber: '01711-000000',
    currencySymbol: '৳',
    ownerPin: '1234',
    role: 'OWNER',
    paperWidth: '58mm',
    vatBinNumber: '000123456-0101',
    mushakMode: true,
    customPermissions: DEFAULT_ROLE_PERMISSIONS,
    printerConfig: {
      ...DEFAULT_PRINTER_CONFIG,
      shopTitle: 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা',
      shopSubtitle: 'সার্বজনীন ডিজিটাল খাতা, আধুনিক ইনভেন্টরি ও স্বয়ংক্রিয় বিলিং',
      shopAddress: 'মেইন রোড, বাণিজ্যিক এলাকা, ঢাকা',
      shopPhone: '01711-000000',
      vatBinNumber: '000123456-0101',
      bkashMerchantNumber: '01711-000000',
      paperWidth: '58mm',
      returnPolicy: 'বিক্রীত পণ্য ৭ দিনের মধ্যে ক্যাশ মেমো সহ অক্ষত অবস্থায় পরিবর্তনযোগ্য। টাকা ফেরত দেওয়া হয় না।',
    },
  },
  {
    id: 'store_002',
    name: 'মদিনা চালের পাইকারি আড়ত',
    nameEn: 'Madina Grain Wholesale Arat',
    branch: 'বাবুবাজার আড়ত (শাখা ২)',
    branchEn: 'Babubazar Arat (Branch 2)',
    type: 'wholesale',
    businessType: 'COMMODITY_GRAIN',
    phone: '01811-000000',
    address: 'আড়ত নং ১২, বাদামতলী, বাবুবাজার, ঢাকা',
    bKashMerchantNumber: '01811-000000',
    currencySymbol: '৳',
    ownerPin: '1234',
    role: 'OWNER',
    paperWidth: '80mm',
    vatBinNumber: '000987654-0202',
    mushakMode: false,
    customPermissions: DEFAULT_ROLE_PERMISSIONS,
    printerConfig: {
      ...DEFAULT_PRINTER_CONFIG,
      paperWidth: '80mm',
      shopTitle: 'মদিনা চালের পাইকারি আড়ত',
      shopSubtitle: 'মোকাম হতে সরাসরি আমদানিকৃত চাল ও ডাল আড়তদার',
      shopAddress: 'আড়ত নং ১২, বাদামতলী, বাবুবাজার, ঢাকা',
      shopPhone: '01811-000000',
      vatBinNumber: '000987654-0202',
      bkashMerchantNumber: '01811-000000',
      showReturnableContainers: true,
      returnPolicy: 'মোকামের মাল ডেলিভারির সময় ওজন ও বস্তা গণনা করে বুঝে নিন।',
    },
  },
  {
    id: 'store_003',
    name: 'মডার্ন ফার্মা ও ড্রাগ হাউস',
    nameEn: 'Modern Pharma & Healthcare',
    branch: 'ধানমন্ডি মডেল শাখা (শাখা ৩)',
    branchEn: 'Dhanmondi Model Branch (Branch 3)',
    type: 'retail',
    businessType: 'PHARMACY',
    phone: '01911-000000',
    address: 'বাড়ি ৫, রোড ৭, ধানমন্ডি, ঢাকা',
    bKashMerchantNumber: '01911-000000',
    currencySymbol: '৳',
    ownerPin: '1234',
    role: 'OWNER',
    paperWidth: '80mm',
    vatBinNumber: '000456789-0303',
    mushakMode: true,
    customPermissions: DEFAULT_ROLE_PERMISSIONS,
    printerConfig: {
      ...DEFAULT_PRINTER_CONFIG,
      paperWidth: '80mm',
      shopTitle: 'মডার্ন ফার্মা ও ড্রাগ হাউস',
      shopSubtitle: 'কম্পিউটারাইজড প্রেসক্রিপশনে সঠিক ওষুধ ও পরামর্শ',
      shopAddress: 'বাড়ি ৫, রোড ৭, ধানমন্ডি, ঢাকা',
      shopPhone: '01911-000000',
      vatBinNumber: '000456789-0303',
      drugLicenseNo: 'DL-10842/DHK',
      bkashMerchantNumber: '01911-000000',
      returnPolicy: 'কাটা পাতা ওষুধ, ইনসুলিন ও রেফ্রিজারেটেড পণ্য কোনো অবস্থাতেই ফেরত বা পরিবর্তনযোগ্য নয়।',
    },
  },
  {
    id: 'store_004',
    name: 'নূর অপটিক্যালস ও আই কেয়ার',
    nameEn: 'Noor Optics & Vision Care Center',
    branch: 'গ্রিন রোড ভিশন সেন্টার (শাখা ৪)',
    branchEn: 'Green Road Vision Center (Branch 4)',
    type: 'retail',
    businessType: 'OPTICS',
    phone: '01712-445566',
    address: 'বাড়ি নং ১২/এ, গ্রিন রোড, পান্থপথ মোড়, ঢাকা',
    bKashMerchantNumber: '01712-445566',
    currencySymbol: '৳',
    ownerPin: '1234',
    role: 'OWNER',
    paperWidth: '80mm',
    vatBinNumber: '000789123-0404',
    mushakMode: true,
    customPermissions: DEFAULT_ROLE_PERMISSIONS,
    printerConfig: {
      ...DEFAULT_PRINTER_CONFIG,
      paperWidth: '80mm',
      shopTitle: 'নূর অপটিক্যালস ও আই কেয়ার',
      shopSubtitle: 'কম্পিউটারাইজড চক্ষু পরীক্ষা, আধুনিক ফ্রেম ও লেন্স বিশেষজ্ঞ',
      shopAddress: 'বাড়ি নং ১২/এ, গ্রিন রোড, পান্থপথ মোড়, ঢাকা',
      shopPhone: '01712-445566',
      vatBinNumber: '000789123-0404',
      tradeLicenseNo: 'TR-OPT-88219/DHK',
      bkashMerchantNumber: '01712-445566',
      receiptTitle: 'চশমা বিক্রয় রসিদ ও পাওয়ার মেমো',
      headerCustomText: 'চোখ মহান আল্লাহর এক অমূল্য নিয়ামত',
      returnPolicy: 'পাওয়ার লেন্স তৈরির পর পরিবর্তনযোগ্য নয়। ফ্রেম ও ফিটিংসের ১ বছরের ফ্রি সার্ভিস গ্যারান্টি। প্রতি ৬ মাস পর পর লেন্স চেকআপ করান।',
      footerGreeting: 'আপনার দৃষ্টিশক্তি সুস্থ ও সুরক্ষিত থাকুক!',
    },
  },
];

export const TenantProvider = ({ children }) => {
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('ledgerx_tenants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default stores exist and store_001 gets updated to Shwapno Super Shop
        const tenantMap = new Map(parsed.map(t => [t.id, t]));
        DEFAULT_TENANTS.forEach(defT => {
          if (!tenantMap.has(defT.id)) {
            tenantMap.set(defT.id, defT);
          } else if (defT.id === 'store_001' && (tenantMap.get('store_001').name.includes('বিসমিল্লাহ') || tenantMap.get('store_001').name.includes('স্বপ্ন'))) {
            // Upgrade legacy default name to Universal Digital Business
            tenantMap.set('store_001', { 
              ...tenantMap.get('store_001'), 
              name: defT.name, 
              nameEn: defT.nameEn, 
              branch: defT.branch,
              printerConfig: { ...defT.printerConfig } 
            });
          }
        });
        return Array.from(tenantMap.values()).map((t) => ({
          ...t,
          businessType: t.businessType || (t.type === 'wholesale' ? 'COMMODITY_GRAIN' : 'GENERAL_RETAIL'),
          ownerPin: t.ownerPin || '1234',
          customPermissions: t.customPermissions || DEFAULT_ROLE_PERMISSIONS,
          printerConfig: {
            ...DEFAULT_PRINTER_CONFIG,
            shopTitle: t.name || '',
            shopAddress: t.address || '',
            shopPhone: t.phone || '',
            vatBinNumber: t.vatBinNumber || '',
            bkashMerchantNumber: t.bKashMerchantNumber || t.phone || '',
            paperWidth: t.paperWidth || DEFAULT_PRINTER_CONFIG.paperWidth,
            ...(t.printerConfig || {}),
          },
        }));
      } catch {
        return DEFAULT_TENANTS;
      }
    }
    return DEFAULT_TENANTS;
  });

  const [activeTenantId, setActiveTenantId] = useState(() => {
    return localStorage.getItem('ledgerx_active_tenant_id') || DEFAULT_TENANTS[0].id;
  });

  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('ledgerx_user_role') || ROLES.OWNER;
  });

  useEffect(() => {
    localStorage.setItem('ledgerx_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('ledgerx_active_tenant_id', activeTenantId);
  }, [activeTenantId]);

  useEffect(() => {
    localStorage.setItem('ledgerx_user_role', userRole);
  }, [userRole]);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const customPermissions = activeTenant.customPermissions || DEFAULT_ROLE_PERMISSIONS;

  const printerConfig = {
    ...DEFAULT_PRINTER_CONFIG,
    shopTitle: activeTenant.name || '',
    shopAddress: activeTenant.address || '',
    shopPhone: activeTenant.phone || '',
    vatBinNumber: activeTenant.vatBinNumber || '',
    bkashMerchantNumber: activeTenant.bKashMerchantNumber || activeTenant.phone || '',
    paperWidth: activeTenant.paperWidth || DEFAULT_PRINTER_CONFIG.paperWidth,
    ...(activeTenant.printerConfig || {}),
  };

  const switchTenant = (tenantId) => {
    const exists = tenants.find((t) => t.id === tenantId);
    if (exists) {
      setActiveTenantId(tenantId);
    }
  };

  const addTenant = (newTenant) => {
    const id = `store_${Date.now()}`;
    const created = {
      id,
      name: newTenant.name || 'নতুন দোকান',
      branch: newTenant.branch || 'প্রধান শাখা',
      type: newTenant.type || 'retail',
      businessType: newTenant.businessType || 'GENERAL_RETAIL',
      phone: newTenant.phone || '',
      address: newTenant.address || '',
      bKashMerchantNumber: newTenant.bKashMerchantNumber || newTenant.phone || '',
      currencySymbol: '৳',
      ownerPin: newTenant.ownerPin || '1234',
      role: 'OWNER',
      paperWidth: '58mm',
      mushakMode: false,
      customPermissions: DEFAULT_ROLE_PERMISSIONS,
      printerConfig: {
        ...DEFAULT_PRINTER_CONFIG,
        shopTitle: newTenant.name || 'নতুন দোকান',
        shopAddress: newTenant.address || '',
        shopPhone: newTenant.phone || '',
        bkashMerchantNumber: newTenant.bKashMerchantNumber || newTenant.phone || '',
      },
    };
    setTenants((prev) => [...prev, created]);
    setActiveTenantId(id);
    return created;
  };

  const updateActiveTenant = (updates) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === activeTenantId ? { ...t, ...updates } : t))
    );
  };

  const changeBusinessType = (newBusinessType) => {
    updateActiveTenant({ businessType: newBusinessType });
  };

  const verifyOwnerPin = (enteredPin) => {
    return String(enteredPin).trim() === String(activeTenant.ownerPin || '1234');
  };

  // Dokan Malik Custom RBAC Matrix Updaters
  const updateCustomPermissions = (updatedMatrix) => {
    updateActiveTenant({ customPermissions: updatedMatrix });
  };

  const resetPermissionsToDefault = () => {
    updateActiveTenant({ customPermissions: DEFAULT_ROLE_PERMISSIONS });
  };

  // Shop-specific Printer Configuration Updaters
  const updatePrinterConfig = (updates) => {
    const merged = {
      ...printerConfig,
      ...updates,
    };
    updateActiveTenant({
      printerConfig: merged,
      paperWidth: merged.paperWidth || activeTenant.paperWidth,
      vatBinNumber: merged.vatBinNumber || activeTenant.vatBinNumber,
    });
  };

  const applyShopPrintPreset = (presetKey) => {
    const preset = SHOP_PRINT_PRESETS[presetKey];
    if (!preset) return;
    const { nameBn, nameEn, id, ...configFields } = preset;
    updatePrinterConfig(configFields);
  };

  // Role Switcher with PIN Validation
  const switchRoleWithPin = (targetRole, enteredPin = '') => {
    if (targetRole === ROLES.OWNER) {
      if (verifyOwnerPin(enteredPin)) {
        setUserRole(ROLES.OWNER);
        return { success: true, message: 'মালিক মোড সক্রিয় করা হয়েছে' };
      }
      return { success: false, message: 'ভুল পিন নম্বর! মালিকের সঠিক পিন দিন।' };
    }
    setUserRole(targetRole);
    return { success: true, message: `${ROLE_CONFIGS[targetRole]?.nameBn} সক্রিয় করা হয়েছে` };
  };

  // Granular Dynamic Permission Checker evaluating Dokan Malik custom settings
  const hasPermission = (permissionCode, targetRole = userRole) => {
    if (targetRole === ROLES.OWNER) return true;

    // Check custom permissions matrix
    const rule = customPermissions[permissionCode];
    if (rule && rule[targetRole] !== undefined) {
      const val = rule[targetRole];
      if (val === 'ALLOWED') return true;
      if (val === 'COLLECT_ONLY') return 'COLLECT_ONLY';
      if (val === 'PIN_REQUIRED') return 'PIN_REQUIRED';
      if (val === 'RESTRICTED') return false;
      return val;
    }

    // Fallback checks
    if (targetRole === ROLES.MANAGER) {
      return [
        PERMISSIONS.EDIT_RECORD,
        PERMISSIONS.EDIT_COST_PRICE,
        PERMISSIONS.VIEW_SUPPLIERS,
        PERMISSIONS.MANAGE_GODOWN,
      ].includes(permissionCode);
    }
    if (targetRole === ROLES.CASHIER) {
      return false;
    }
    return false;
  };

  const isOwner = userRole === ROLES.OWNER;
  const isManager = userRole === ROLES.MANAGER;
  const isCashier = userRole === ROLES.CASHIER;

  return (
    <TenantContext.Provider
      value={{
        tenants,
        activeTenant,
        activeTenantId,
        switchTenant,
        addTenant,
        updateActiveTenant,
        changeBusinessType,
        userRole,
        setUserRole,
        isOwner,
        isManager,
        isCashier,
        customPermissions,
        updateCustomPermissions,
        resetPermissionsToDefault,
        printerConfig,
        updatePrinterConfig,
        applyShopPrintPreset,
        hasPermission,
        switchRoleWithPin,
        verifyOwnerPin,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

