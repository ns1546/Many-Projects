import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useTenant } from './TenantContext';
import { voicebox } from '../utils/bengaliVoicebox';
import { poishaToTaka } from '../utils/currency';
import toast from 'react-hot-toast';
import { EnterpriseNodeBus, recordJournalVoucher, getJournalVouchers } from '../core/EnterpriseNodeBus';
import { BUSINESS_PROFILES } from '../core/BusinessProfiles';

const KhataContext = createContext(null);

// Initial seed data per store
// Initial seed data for Store 1: Bismillah General Store (Retail)
const INITIAL_CUSTOMERS = [
  {
    id: 'cust_01',
    name: 'মো: রহিম মিয়া',
    phone: '01711-223344',
    address: 'বাড়ি নং ১২, রোড ৩, ধানমন্ডি, ঢাকা',
    currentDuePoisha: 450000, // ৳ 4,500.00
    creditLimitPoisha: 1000000,
    trustScore: 5,
    containersDueCount: 4,
    totalTransactionsCount: 18,
  },
  {
    id: 'cust_02',
    name: 'করিম সওদাগর',
    phone: '01811-334455',
    address: 'দোকান নং ৫, কাঁচাবাজার',
    currentDuePoisha: 120000, // ৳ 1,200.00
    creditLimitPoisha: 500000,
    trustScore: 4,
    containersDueCount: 0,
    totalTransactionsCount: 7,
  },
  {
    id: 'cust_03',
    name: 'তানভীর আহমেদ',
    phone: '01911-445566',
    address: 'মিরপুর ১০, ঢাকা',
    currentDuePoisha: 1850000, // ৳ 18,500.00
    creditLimitPoisha: 2000000,
    trustScore: 3,
    containersDueCount: 2,
    totalTransactionsCount: 24,
  },
  {
    id: 'cust_04',
    name: 'হাজী মো: রফিকুল ইসলাম',
    phone: '01722-556677',
    address: 'সেকশন ৬, ব্লক ডি, মিরপুর',
    currentDuePoisha: 2600000, // ৳ 26,000.00
    creditLimitPoisha: 3000000,
    trustScore: 5,
    containersDueCount: 6,
    totalTransactionsCount: 35,
  },
  {
    id: 'cust_05',
    name: 'মিসেস সুরাইয়া বেগম',
    phone: '01833-667788',
    address: 'বাড়ি নং ৮, লালমাটিয়া, ঢাকা',
    currentDuePoisha: 340000, // ৳ 3,400.00
    creditLimitPoisha: 800000,
    trustScore: 4,
    containersDueCount: 0,
    totalTransactionsCount: 12,
  },
  {
    id: 'cust_06',
    name: 'শাহ আলম খন্দকার',
    phone: '01944-778899',
    address: 'দোকান নং ১২, নিউ মার্কেট',
    currentDuePoisha: 1280000, // ৳ 12,800.00
    creditLimitPoisha: 1500000,
    trustScore: 4,
    containersDueCount: 3,
    totalTransactionsCount: 21,
  }
];

// Initial seed data for Store 2: Madina Grain Wholesale Arat (Wholesale)
const INITIAL_CUSTOMERS_STORE_2 = [
  {
    id: 'cust_w01',
    name: 'মেসার্স সততা রাইস এজেন্সি',
    phone: '01712-998877',
    address: 'আড়ত নং ৪, শ্যামবাজার, ঢাকা',
    currentDuePoisha: 14500000, // ৳ 1,45,000.00
    creditLimitPoisha: 25000000,
    trustScore: 5,
    containersDueCount: 45, // 45 sacks
    totalTransactionsCount: 42,
  },
  {
    id: 'cust_w02',
    name: 'ভাই ভাই ভ্যারাইটিজ স্টোর',
    phone: '01813-887766',
    address: 'চকবাজার মোড়, পুরান ঢাকা',
    currentDuePoisha: 8200000, // ৳ 82,000.00
    creditLimitPoisha: 15000000,
    trustScore: 4,
    containersDueCount: 20,
    totalTransactionsCount: 28,
  },
  {
    id: 'cust_w03',
    name: 'বরিশাল রাইস ট্রেডার্স',
    phone: '01914-776655',
    address: 'নদী বন্দর ঘাট, বাবুবাজার',
    currentDuePoisha: 21000000, // ৳ 2,10,000.00
    creditLimitPoisha: 30000000,
    trustScore: 5,
    containersDueCount: 60,
    totalTransactionsCount: 56,
  },
  {
    id: 'cust_w04',
    name: 'ঢাকা গ্রেইন কোম্পানি',
    phone: '01715-665544',
    address: 'মৌলভীবাজার চাল পট্টি, ঢাকা',
    currentDuePoisha: 9500000, // ৳ 95,000.00
    creditLimitPoisha: 15000000,
    trustScore: 4,
    containersDueCount: 30,
    totalTransactionsCount: 19,
  },
  {
    id: 'cust_w05',
    name: 'মোস্তফা খাদ্য ভাণ্ডার',
    phone: '01816-554433',
    address: 'কাওরান বাজার আড়ত লেন',
    currentDuePoisha: 6400000, // ৳ 64,000.00
    creditLimitPoisha: 10000000,
    trustScore: 3,
    containersDueCount: 15,
    totalTransactionsCount: 14,
  },
  {
    id: 'cust_w06',
    name: 'কাসেম স্টোর',
    phone: '01917-443322',
    address: 'সদরঘাট টার্মিনাল রোড',
    currentDuePoisha: 3850000, // ৳ 38,500.00
    creditLimitPoisha: 8000000,
    trustScore: 4,
    containersDueCount: 12,
    totalTransactionsCount: 16,
  }
];

const INITIAL_SUPPLIERS = [
  {
    id: 'supp_01',
    name: 'আকিজ এসেনশিয়ালস লি:',
    phone: '01700-112233',
    company: 'আকিজ গ্রুপ',
    currentDuePoisha: 4520000, // ৳ 45,200.00 payable
    balancePoisha: 4520000,
    totalPurchasesPoisha: 25000000,
  },
  {
    id: 'supp_02',
    name: 'সিটি অয়েল মিলস (তীর)',
    phone: '01700-223344',
    company: 'সিটি গ্রুপ',
    currentDuePoisha: 1200000, // ৳ 12,000.00 payable
    balancePoisha: 1200000,
    totalPurchasesPoisha: 18000000,
  },
  {
    id: 'supp_03',
    name: 'এসিআই পিওর ফুডস লি:',
    phone: '01700-334455',
    company: 'এসিআই লিমিটেড',
    currentDuePoisha: 3450000, // ৳ 34,500.00 payable
    balancePoisha: 3450000,
    totalPurchasesPoisha: 14500000,
  },
  {
    id: 'supp_04',
    name: 'প্রাণ-আরএফএল কনজিউমার',
    phone: '01700-445566',
    company: 'প্রাণ গ্রুপ',
    currentDuePoisha: 2800000, // ৳ 28,000.00 payable
    balancePoisha: 2800000,
    totalPurchasesPoisha: 12200000,
  },
  {
    id: 'supp_05',
    name: 'মেঘনা গ্রুপ (ফ্রেশ ব্র্যান্ড)',
    phone: '01700-556677',
    company: 'মেঘনা গ্রুপ অব ইন্ডাস্ট্রিজ',
    currentDuePoisha: 5200000, // ৳ 52,000.00 payable
    balancePoisha: 5200000,
    totalPurchasesPoisha: 21000000,
  }
];

const INITIAL_SUPPLIERS_STORE_2 = [
  {
    id: 'supp_w01',
    name: 'দিনাজপুর অটো রাইস মিল',
    phone: '01711-881122',
    company: 'দিনাজপুর অটো রাইস মিলস',
    currentDuePoisha: 48000000, // ৳ 4,80,000.00 payable
    balancePoisha: 48000000,
    totalPurchasesPoisha: 150000000,
  },
  {
    id: 'supp_w02',
    name: 'কুষ্টিয়া সুগন্ধি চাউল কল',
    phone: '01811-772233',
    company: 'কুষ্টিয়া স্পেশাল রাইস',
    currentDuePoisha: 25000000, // ৳ 2,50,000.00 payable
    balancePoisha: 25000000,
    totalPurchasesPoisha: 95000000,
  },
  {
    id: 'supp_w03',
    name: 'চাঁপাইনবাবগঞ্জ রাইস ব্রোকার্স',
    phone: '01911-663344',
    company: 'নবাবগঞ্জ চাল মোকাম',
    currentDuePoisha: 19000000, // ৳ 1,90,000.00 payable
    balancePoisha: 19000000,
    totalPurchasesPoisha: 82000000,
  },
  {
    id: 'supp_w04',
    name: 'নওগাঁ চাল আড়ত সমিতি',
    phone: '01711-554455',
    company: 'নওগাঁ মহাদেবপুর মিল',
    currentDuePoisha: 32000000, // ৳ 3,20,000.00 payable
    balancePoisha: 32000000,
    totalPurchasesPoisha: 110000000,
  },
  {
    id: 'supp_w05',
    name: 'বগুড়া গ্রেইন সাপ্লাই',
    phone: '01811-445566',
    company: 'বগুড়া রাইস মার্চেন্ট',
    currentDuePoisha: 14000000, // ৳ 1,40,000.00 payable
    balancePoisha: 14000000,
    totalPurchasesPoisha: 64000000,
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_01',
    sku: '89411001',
    name: 'মিনিকেট চাল ২৫কেজি বস্তা',
    category: 'খাদ্য সামগ্রী',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 25,
    costPriceBasePoisha: 7000, // ৳ 70/kg
    sellingPriceBasePoisha: 7800, // ৳ 78/kg
    bulkSellingPricePoisha: 185000, // ৳ 1,850/bag
    currentStockInBaseUnit: 600,
    lowStockAlertThreshold: 100,
    isNearExpiry: false,
    hotkey: '1',
  },
  {
    id: 'prod_02',
    sku: '89411002',
    name: 'তীর সয়াবিন তেল ৫লিটার বোতল',
    category: 'তেল ও ঘি',
    baseUnit: 'লিটার',
    hasBulkUnit: true,
    bulkUnitName: 'বোতল',
    bulkConversionFactor: 5,
    costPriceBasePoisha: 15500, // ৳ 155/L
    sellingPriceBasePoisha: 17000, // ৳ 170/L
    bulkSellingPricePoisha: 82000, // ৳ 820/5L
    currentStockInBaseUnit: 60,
    lowStockAlertThreshold: 20,
    isNearExpiry: false,
    hotkey: '2',
  },
  {
    id: 'prod_03',
    sku: '89411003',
    name: 'ফ্রেশ প্রিমিয়াম আটা ২কেজি প্যাকেট',
    category: 'নিত্যপ্রয়োজনীয়',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: true,
    bulkUnitName: 'কার্টন',
    bulkConversionFactor: 10,
    costPriceBasePoisha: 11000,
    sellingPriceBasePoisha: 12500,
    bulkSellingPricePoisha: 120000,
    currentStockInBaseUnit: 85,
    lowStockAlertThreshold: 15,
    isNearExpiry: false,
    hotkey: '3',
  },
  {
    id: 'prod_04',
    sku: '89411004',
    name: 'নাপা এক্সট্রা ৫০০মিগ্রা (Napa Extra)',
    category: 'ওষুধ',
    baseUnit: 'পাতা',
    hasBulkUnit: false,
    costPriceBasePoisha: 2200,
    sellingPriceBasePoisha: 2500,
    currentStockInBaseUnit: 450,
    lowStockAlertThreshold: 50,
    batchNumber: 'B-88102',
    expiryDate: '12/2026',
    isNearExpiry: false,
    hotkey: '4',
  },
  {
    id: 'prod_05',
    sku: '89411005',
    name: 'দেশি মসুর ডাল ১কেজি প্যাকেট',
    category: 'ডাল ও শস্য',
    baseUnit: 'কেজি',
    hasBulkUnit: false,
    costPriceBasePoisha: 12500,
    sellingPriceBasePoisha: 14000,
    currentStockInBaseUnit: 120,
    lowStockAlertThreshold: 25,
    isNearExpiry: false,
    hotkey: '5',
  },
  {
    id: 'prod_06',
    sku: '89411006',
    name: 'ফ্রেশ সাদা চিনি ১কেজি প্যাকেট',
    category: 'নিত্যপ্রয়োজনীয়',
    baseUnit: 'কেজি',
    hasBulkUnit: false,
    costPriceBasePoisha: 11800,
    sellingPriceBasePoisha: 13000,
    currentStockInBaseUnit: 90,
    lowStockAlertThreshold: 20,
    isNearExpiry: false,
    hotkey: '6',
  },
  {
    id: 'prod_07',
    sku: '89411007',
    name: 'প্রাণ লাচ্ছা সেমাই ২০০গ্রাম',
    category: 'বেকারি ও স্ন্যাকস',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: false,
    costPriceBasePoisha: 4200,
    sellingPriceBasePoisha: 5000,
    currentStockInBaseUnit: 140,
    lowStockAlertThreshold: 30,
    isNearExpiry: false,
    hotkey: '7',
  },
  {
    id: 'prod_08',
    sku: '89411008',
    name: 'ট্যাং অরেঞ্জ ৫০০গ্রাম জার',
    category: 'পানীয়',
    baseUnit: 'জার',
    hasBulkUnit: false,
    costPriceBasePoisha: 42000,
    sellingPriceBasePoisha: 46000,
    currentStockInBaseUnit: 35,
    lowStockAlertThreshold: 10,
    isNearExpiry: false,
    hotkey: '8',
  },
  {
    id: 'prod_09',
    sku: '89411009',
    name: 'ডানো ফুলক্রিম গুঁড়ো দুধ ১কেজি',
    category: 'দুগ্ধজাত পণ্য',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: false,
    costPriceBasePoisha: 78000,
    sellingPriceBasePoisha: 85000,
    currentStockInBaseUnit: 40,
    lowStockAlertThreshold: 12,
    isNearExpiry: false,
    hotkey: '9',
  },
  {
    id: 'prod_10',
    sku: '89411010',
    name: 'কোকা-কোলা ২ লিটার পেট বোতল',
    category: 'পানীয় ও বেভারেজ',
    baseUnit: 'বোতল',
    hasBulkUnit: true,
    bulkUnitName: 'কেস (৬টি)',
    bulkConversionFactor: 6,
    costPriceBasePoisha: 10500,
    sellingPriceBasePoisha: 12000,
    bulkSellingPricePoisha: 70000,
    currentStockInBaseUnit: 48,
    lowStockAlertThreshold: 12,
    isNearExpiry: false,
    brand: 'Coca-Cola',
  },
  {
    id: 'prod_11',
    sku: '89411011',
    name: 'সেভেন আপ ১.২৫ লিটার বোতল',
    category: 'পানীয় ও বেভারেজ',
    baseUnit: 'বোতল',
    hasBulkUnit: false,
    costPriceBasePoisha: 7000,
    sellingPriceBasePoisha: 8000,
    currentStockInBaseUnit: 36,
    lowStockAlertThreshold: 8,
    isNearExpiry: false,
    brand: '7Up',
  },
  {
    id: 'prod_12',
    sku: '89411012',
    name: 'রূপচাঁদা সরিষার তেল ৫০০মিলি',
    category: 'তেল ও ঘি',
    baseUnit: 'বোতল',
    hasBulkUnit: false,
    costPriceBasePoisha: 16000,
    sellingPriceBasePoisha: 18000,
    currentStockInBaseUnit: 25,
    lowStockAlertThreshold: 5,
    isNearExpiry: false,
    brand: 'Rupchanda',
  },
  {
    id: 'prod_13',
    sku: '89411013',
    name: 'এসিআই পিওর ভ্যাকিউম লবণ ১কেজি',
    category: 'নিত্যপ্রয়োজনীয়',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: true,
    bulkUnitName: 'কার্টন (২০টি)',
    bulkConversionFactor: 20,
    costPriceBasePoisha: 3400,
    sellingPriceBasePoisha: 4000,
    bulkSellingPricePoisha: 76000,
    currentStockInBaseUnit: 60,
    lowStockAlertThreshold: 15,
    isNearExpiry: false,
    brand: 'ACI Pure',
  },
  {
    id: 'prod_14',
    sku: '89411014',
    name: 'ম্যাগি ২-মিনিট মাসালা নুডলস (৮-প্যাক)',
    category: 'বেকারি ও স্ন্যাকস',
    baseUnit: 'প্যাক',
    hasBulkUnit: false,
    costPriceBasePoisha: 13000,
    sellingPriceBasePoisha: 15000,
    currentStockInBaseUnit: 50,
    lowStockAlertThreshold: 10,
    isNearExpiry: false,
    brand: 'Nestle Maggi',
  },
  {
    id: 'prod_15',
    sku: '89411015',
    name: 'ইস্পাহানি মির্জাপুর প্রিমিয়াম চা ৫০০গ্রাম',
    category: 'পানীয় ও বেভারেজ',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: false,
    costPriceBasePoisha: 20500,
    sellingPriceBasePoisha: 23000,
    currentStockInBaseUnit: 30,
    lowStockAlertThreshold: 6,
    isNearExpiry: false,
    brand: 'Ispahani',
  },
  {
    id: 'prod_16',
    sku: '89411016',
    name: 'নেসক্যাফে ক্লাসিক কফি ৫০গ্রাম জার',
    category: 'পানীয় ও বেভারেজ',
    baseUnit: 'জার',
    hasBulkUnit: false,
    costPriceBasePoisha: 28500,
    sellingPriceBasePoisha: 32000,
    currentStockInBaseUnit: 20,
    lowStockAlertThreshold: 5,
    isNearExpiry: false,
    brand: 'Nescafe',
  },
  {
    id: 'prod_17',
    sku: '89411017',
    name: 'মিল্ক ভিটা পাস্তুরিত তরল দুধ ১ লিটার',
    category: 'দুগ্ধজাত পণ্য',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: false,
    costPriceBasePoisha: 8000,
    sellingPriceBasePoisha: 9000,
    currentStockInBaseUnit: 40,
    lowStockAlertThreshold: 10,
    isNearExpiry: false,
    brand: 'Milk Vita',
  },
  {
    id: 'prod_18',
    sku: '89411018',
    name: 'আড়ং ডেইরি মিষ্টি দই ৫০০গ্রাম',
    category: 'দুগ্ধজাত পণ্য',
    baseUnit: 'কাপ',
    hasBulkUnit: false,
    costPriceBasePoisha: 11000,
    sellingPriceBasePoisha: 13000,
    currentStockInBaseUnit: 18,
    lowStockAlertThreshold: 4,
    isNearExpiry: false,
    brand: 'Aarong Dairy',
  },
  {
    id: 'prod_19',
    sku: '89411019',
    name: 'প্রাণ প্রিমিয়াম ফার্ম ডিম (১২টি কেস)',
    category: 'দুগ্ধজাত পণ্য',
    baseUnit: 'ডজন',
    hasBulkUnit: false,
    costPriceBasePoisha: 14000,
    sellingPriceBasePoisha: 16000,
    currentStockInBaseUnit: 35,
    lowStockAlertThreshold: 8,
    isNearExpiry: false,
    brand: 'Pran Dairy',
  },
  {
    id: 'prod_20',
    sku: '89411020',
    name: 'হুইল টু-ইন-ওয়ান ডিটারজেন্ট ১কেজি',
    category: 'ক্লিনিং ও টয়লেট্রিস',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: false,
    costPriceBasePoisha: 12200,
    sellingPriceBasePoisha: 14000,
    currentStockInBaseUnit: 45,
    lowStockAlertThreshold: 10,
    isNearExpiry: false,
    brand: 'Unilever Wheel',
  },
  {
    id: 'prod_21',
    sku: '89411021',
    name: 'হার্পিক অল-ইন-ওয়ান বাথরুম ক্লিনার ৭৫০মিলি',
    category: 'ক্লিনিং ও টয়লেট্রিস',
    baseUnit: 'বোতল',
    hasBulkUnit: false,
    costPriceBasePoisha: 15200,
    sellingPriceBasePoisha: 17500,
    currentStockInBaseUnit: 30,
    lowStockAlertThreshold: 6,
    isNearExpiry: false,
    brand: 'Harpic',
  },
  {
    id: 'prod_22',
    sku: '89411022',
    name: 'ভিম ডিশওয়াশ বার ৩০০গ্রাম',
    category: 'ক্লিনিং ও টয়লেট্রিস',
    baseUnit: 'পিস',
    hasBulkUnit: false,
    costPriceBasePoisha: 3800,
    sellingPriceBasePoisha: 4500,
    currentStockInBaseUnit: 60,
    lowStockAlertThreshold: 15,
    isNearExpiry: false,
    brand: 'Vim',
  },
  {
    id: 'prod_23',
    sku: '89411023',
    name: 'স্যাভলন অ্যান্টিসেপটিক ডিসইনফেক্টেন্ট ১০০মিলি',
    category: 'ক্লিনিং ও টয়লেট্রিস',
    baseUnit: 'বোতল',
    hasBulkUnit: false,
    costPriceBasePoisha: 4800,
    sellingPriceBasePoisha: 5500,
    currentStockInBaseUnit: 35,
    lowStockAlertThreshold: 8,
    isNearExpiry: false,
    brand: 'ACI Savlon',
  },
  {
    id: 'prod_24',
    sku: '89411024',
    name: 'লাক্স বিউটি সোপ ১০০গ্রাম (৩-প্যাক)',
    category: 'ব্যক্তিগত যত্ন',
    baseUnit: 'প্যাক',
    hasBulkUnit: false,
    costPriceBasePoisha: 15800,
    sellingPriceBasePoisha: 18000,
    currentStockInBaseUnit: 40,
    lowStockAlertThreshold: 8,
    isNearExpiry: false,
    brand: 'Unilever Lux',
  },
  {
    id: 'prod_25',
    sku: '89411025',
    name: 'ক্লোজআপ এভারফ্রেশ টুথপেস্ট ১৫০গ্রাম',
    category: 'ব্যক্তিগত যত্ন',
    baseUnit: 'পিস',
    hasBulkUnit: false,
    costPriceBasePoisha: 11200,
    sellingPriceBasePoisha: 13000,
    currentStockInBaseUnit: 35,
    lowStockAlertThreshold: 7,
    isNearExpiry: false,
    brand: 'CloseUp',
  },
  {
    id: 'prod_26',
    sku: '89411026',
    name: 'হেড অ্যান্ড শোল্ডারস শ্যাম্পু ৩৫০মিলি',
    category: 'ব্যক্তিগত যত্ন',
    baseUnit: 'বোতল',
    hasBulkUnit: false,
    costPriceBasePoisha: 39500,
    sellingPriceBasePoisha: 45000,
    currentStockInBaseUnit: 22,
    lowStockAlertThreshold: 5,
    isNearExpiry: false,
    brand: 'P&G Head & Shoulders',
  },
  {
    id: 'prod_27',
    sku: '89411027',
    name: 'ওরিও ভ্যানিলা ক্রিম বিস্কুট ১২০গ্রাম',
    category: 'বেকারি ও স্ন্যাকস',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: false,
    costPriceBasePoisha: 5000,
    sellingPriceBasePoisha: 6000,
    currentStockInBaseUnit: 70,
    lowStockAlertThreshold: 15,
    isNearExpiry: false,
    brand: 'Cadbury Oreo',
  },
  {
    id: 'prod_28',
    sku: '89411028',
    name: 'লেইস ক্লাসিক আমেরিকান চিপস ৫০গ্রাম',
    category: 'বেকারি ও স্ন্যাকস',
    baseUnit: 'প্যাকেট',
    hasBulkUnit: false,
    costPriceBasePoisha: 3400,
    sellingPriceBasePoisha: 4000,
    currentStockInBaseUnit: 55,
    lowStockAlertThreshold: 10,
    isNearExpiry: false,
    brand: 'Lays',
  },
  {
    id: 'prod_29',
    sku: '89411029',
    name: 'দেশি লাল গোল আলু (কেজি)',
    category: 'শাকসবজি ও ফলমূল',
    baseUnit: 'কেজি',
    hasBulkUnit: false,
    costPriceBasePoisha: 4600,
    sellingPriceBasePoisha: 5500,
    currentStockInBaseUnit: 180,
    lowStockAlertThreshold: 30,
    isNearExpiry: false,
    isWeighable: true,
  },
  {
    id: 'prod_30',
    sku: '89411030',
    name: 'দেশি পেঁয়াজ (কেজি)',
    category: 'শাকসবজি ও ফলমূল',
    baseUnit: 'কেজি',
    hasBulkUnit: false,
    costPriceBasePoisha: 9500,
    sellingPriceBasePoisha: 11000,
    currentStockInBaseUnit: 120,
    lowStockAlertThreshold: 25,
    isNearExpiry: false,
    isWeighable: true,
  },
  {
    id: 'prod_31',
    sku: '89411031',
    name: 'রসুন আমদানি প্রিমিয়াম (কেজি)',
    category: 'শাকসবজি ও ফলমূল',
    baseUnit: 'কেজি',
    hasBulkUnit: false,
    costPriceBasePoisha: 18500,
    sellingPriceBasePoisha: 21000,
    currentStockInBaseUnit: 60,
    lowStockAlertThreshold: 15,
    isNearExpiry: false,
    isWeighable: true,
  },
  {
    id: 'prod_32',
    sku: '89411032',
    name: 'ফুজি মিষ্টি আপেল আমদানি (কেজি)',
    category: 'শাকসবজি ও ফলমূল',
    baseUnit: 'কেজি',
    hasBulkUnit: false,
    costPriceBasePoisha: 24500,
    sellingPriceBasePoisha: 28000,
    currentStockInBaseUnit: 40,
    lowStockAlertThreshold: 10,
    isNearExpiry: false,
    isWeighable: true,
  }
];

const INITIAL_PRODUCTS_STORE_2 = [
  {
    id: 'prod_w01',
    sku: '89422001',
    name: 'নাজিরশাইল প্রিমিয়াম ৫০কেজি বস্তা',
    category: 'চাউল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 7600,
    sellingPriceBasePoisha: 8400,
    bulkSellingPricePoisha: 410000, // ৳ 4,100/bag
    currentStockInBaseUnit: 2500, // 50 bags
    lowStockAlertThreshold: 500,
    isNearExpiry: false,
    hotkey: '1',
  },
  {
    id: 'prod_w02',
    sku: '89422002',
    name: 'মিনিকেট স্পেশাল ৫০কেজি বস্তা',
    category: 'চাউল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 6800,
    sellingPriceBasePoisha: 7400,
    bulkSellingPricePoisha: 365000, // ৳ 3,650/bag
    currentStockInBaseUnit: 3200,
    lowStockAlertThreshold: 600,
    isNearExpiry: false,
    hotkey: '2',
  },
  {
    id: 'prod_w03',
    sku: '89422003',
    name: 'বিআর-২৮ চাল ৫০কেজি বস্তা',
    category: 'চাউল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 5400,
    sellingPriceBasePoisha: 6000,
    bulkSellingPricePoisha: 295000, // ৳ 2,950/bag
    currentStockInBaseUnit: 4000,
    lowStockAlertThreshold: 800,
    isNearExpiry: false,
    hotkey: '3',
  },
  {
    id: 'prod_w04',
    sku: '89422004',
    name: 'কাটারিভোগ পোলাও চাল ২৫কেজি বস্তা',
    category: 'সুগন্ধি চাল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 25,
    costPriceBasePoisha: 12000,
    sellingPriceBasePoisha: 13500,
    bulkSellingPricePoisha: 330000,
    currentStockInBaseUnit: 1250,
    lowStockAlertThreshold: 250,
    isNearExpiry: false,
    hotkey: '4',
  },
  {
    id: 'prod_w05',
    sku: '89422005',
    name: 'বাসমতী প্রিমিয়াম চাল ২৫কেজি বস্তা',
    category: 'সুগন্ধি চাল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 25,
    costPriceBasePoisha: 24000,
    sellingPriceBasePoisha: 27000,
    bulkSellingPricePoisha: 660000,
    currentStockInBaseUnit: 750,
    lowStockAlertThreshold: 150,
    isNearExpiry: false,
    hotkey: '5',
  },
  {
    id: 'prod_w06',
    sku: '89422006',
    name: 'চিনিগুঁড়া সুগন্ধি চাল ২৫কেজি বস্তা',
    category: 'সুগন্ধি চাল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 25,
    costPriceBasePoisha: 13000,
    sellingPriceBasePoisha: 14500,
    bulkSellingPricePoisha: 355000,
    currentStockInBaseUnit: 1500,
    lowStockAlertThreshold: 300,
    isNearExpiry: false,
    hotkey: '6',
  },
  {
    id: 'prod_w07',
    sku: '89422007',
    name: 'স্বর্ণা মোটা চাল ৫০কেজি বস্তা',
    category: 'চাউল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 4600,
    sellingPriceBasePoisha: 5100,
    bulkSellingPricePoisha: 250000,
    currentStockInBaseUnit: 5000,
    lowStockAlertThreshold: 1000,
    isNearExpiry: false,
    hotkey: '7',
  },
  {
    id: 'prod_w08',
    sku: '89422008',
    name: 'আটাশ চাল ৫০কেজি বস্তা',
    category: 'চাউল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 5300,
    sellingPriceBasePoisha: 5900,
    bulkSellingPricePoisha: 290000,
    currentStockInBaseUnit: 3500,
    lowStockAlertThreshold: 700,
    isNearExpiry: false,
    hotkey: '8',
  },
  {
    id: 'prod_w09',
    sku: '89422009',
    name: 'পাইজাম চাল ৫০কেজি বস্তা',
    category: 'চাউল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 5100,
    sellingPriceBasePoisha: 5700,
    bulkSellingPricePoisha: 280000,
    currentStockInBaseUnit: 3000,
    lowStockAlertThreshold: 600,
    isNearExpiry: false,
    hotkey: '9',
  },
  {
    id: 'prod_w10',
    sku: '89422010',
    name: 'তীর সয়াবিন তেল ১৬লিটার ড্রাম/টিন',
    category: 'তেল ও ঘি',
    baseUnit: 'লিটার',
    hasBulkUnit: true,
    bulkUnitName: 'টিন (১৬ লিটার)',
    bulkConversionFactor: 16,
    costPriceBasePoisha: 15200,
    sellingPriceBasePoisha: 16500,
    bulkSellingPricePoisha: 260000,
    currentStockInBaseUnit: 480,
    lowStockAlertThreshold: 80,
    isNearExpiry: false,
  },
  {
    id: 'prod_w11',
    sku: '89422011',
    name: 'ফ্রেশ সাদা চিনি ৫০কেজি বস্তা',
    category: 'খাদ্য সামগ্রী',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 11500,
    sellingPriceBasePoisha: 12500,
    bulkSellingPricePoisha: 620000,
    currentStockInBaseUnit: 2500,
    lowStockAlertThreshold: 400,
    isNearExpiry: false,
  },
  {
    id: 'prod_w12',
    sku: '89422012',
    name: 'অস্ট্রেলিয়ান মসুর ডাল ৫০কেজি বস্তা',
    category: 'ডাল ও শস্য',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 12500,
    sellingPriceBasePoisha: 13800,
    bulkSellingPricePoisha: 680000,
    currentStockInBaseUnit: 1500,
    lowStockAlertThreshold: 300,
    isNearExpiry: false,
  },
  {
    id: 'prod_w13',
    sku: '89422013',
    name: 'ম্যাগি ২-মিনিট নুডুলস কার্টন (৭২ পিস)',
    category: 'বেকারি ও স্ন্যাকস',
    baseUnit: 'পিস',
    hasBulkUnit: true,
    bulkUnitName: 'কার্টন',
    bulkConversionFactor: 72,
    costPriceBasePoisha: 1800,
    sellingPriceBasePoisha: 2200,
    bulkSellingPricePoisha: 140000,
    currentStockInBaseUnit: 720,
    lowStockAlertThreshold: 144,
    isNearExpiry: false,
  },
  {
    id: 'prod_w14',
    sku: '89422014',
    name: 'লাক্স বিউটি সাবান ১০০গ্রাম কার্টন (৪৮ পিস)',
    category: 'ক্লিনিং ও টয়লেট্রিস',
    baseUnit: 'পিস',
    hasBulkUnit: true,
    bulkUnitName: 'কার্টন',
    bulkConversionFactor: 48,
    costPriceBasePoisha: 5800,
    sellingPriceBasePoisha: 7000,
    bulkSellingPricePoisha: 310000,
    currentStockInBaseUnit: 480,
    lowStockAlertThreshold: 96,
    isNearExpiry: false,
  },
  {
    id: 'prod_w15',
    sku: '89422015',
    name: 'কোকা-কোলা ৫০০মিলি কেস (২৪ বোতল)',
    category: 'পানীয় ও বেভারেজ',
    baseUnit: 'বোতল',
    hasBulkUnit: true,
    bulkUnitName: 'কেস',
    bulkConversionFactor: 24,
    costPriceBasePoisha: 3400,
    sellingPriceBasePoisha: 4000,
    bulkSellingPricePoisha: 90000,
    currentStockInBaseUnit: 240,
    lowStockAlertThreshold: 48,
    isNearExpiry: false,
  }
];

const INITIAL_REGISTERS = [
  { id: 'cash_drawer', name: 'নগদ ক্যাশবাক্স (Gollah)', category: 'CASH', balancePoisha: 2864000 },
  // Bangladesh Mobile Financial Services (MFS)
  { id: 'bkash_merchant', name: 'বিকাশ মার্চেন্ট ওয়ালেট', provider: 'BKASH', category: 'MFS', walletNumber: '01711-223344', balancePoisha: 1450000 },
  { id: 'nagad_merchant', name: 'নগদ মার্চেন্ট ওয়ালেট', provider: 'NAGAD', category: 'MFS', walletNumber: '01811-334455', balancePoisha: 850000 },
  { id: 'rocket_merchant', name: 'রকেট মার্চেন্ট ওয়ালেট', provider: 'ROCKET', category: 'MFS', walletNumber: '01911-445566-7', balancePoisha: 350000 },
  { id: 'cellfin_merchant', name: 'সেলফিন (IBBL)', provider: 'CELLFIN', category: 'MFS', walletNumber: '01711-223344', balancePoisha: 500000 },
  // Multiple Bank Accounts in Bangladesh
  { id: 'bank_ibbl', name: 'ইসলামী ব্যাংক বাংলাদেশ লি:', bankName: 'Islami Bank', accountNumber: '205039481230', branch: 'দিলকুশা শাখা', category: 'BANK', balancePoisha: 8500000 },
  { id: 'bank_dbbl', name: 'ডাচ-বাংলা ব্যাংক (কারেন্ট)', bankName: 'Dutch-Bangla Bank', accountNumber: '11015629481', branch: 'বনানী শাখা', category: 'BANK', balancePoisha: 12500000 },
  { id: 'bank_brac', name: 'ব্র্যাক ব্যাংক হিসাব', bankName: 'BRAC Bank', accountNumber: '15012049182', branch: 'গুলশান শাখা', category: 'BANK', balancePoisha: 4200000 },
  { id: 'bank_account', name: 'সাধারণ ব্যাংক হিসাব', bankName: 'Bank Account', category: 'BANK', balancePoisha: 0 }
];

const INITIAL_REGISTERS_STORE_2 = [
  { id: 'cash_drawer', name: 'আড়ত ক্যাশ সিন্দুক (Gollah)', category: 'CASH', balancePoisha: 48500000 },
  { id: 'bkash_merchant', name: 'বিকাশ মার্চেন্ট ওয়ালেট', provider: 'BKASH', category: 'MFS', walletNumber: '01712-334455', balancePoisha: 9850000 },
  { id: 'nagad_merchant', name: 'নগদ মার্চেন্ট ওয়ালেট', provider: 'NAGAD', category: 'MFS', walletNumber: '01812-445566', balancePoisha: 4500000 },
  { id: 'rocket_merchant', name: 'রকেট মার্চেন্ট ওয়ালেট', provider: 'ROCKET', category: 'MFS', walletNumber: '01912-556677-1', balancePoisha: 2000000 },
  { id: 'bank_dbbl', name: 'ডাচ-বাংলা ব্যাংক (কারেন্ট)', bankName: 'Dutch-Bangla Bank', accountNumber: '11015629481', branch: 'শ্যামবাজার শাখা', category: 'BANK', balancePoisha: 185000000 },
  { id: 'bank_brac', name: 'ব্র্যাক ব্যাংক হিসাব', bankName: 'BRAC Bank', accountNumber: '15012049182', branch: 'বাদামতলী শাখা', category: 'BANK', balancePoisha: 65000000 },
  { id: 'bank_account', name: 'সাধারণ ব্যাংক হিসাব', bankName: 'Bank Account', category: 'BANK', balancePoisha: 0 }
];

const INITIAL_LEDGER_ENTRIES = [
  {
    id: 'tx_01',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    type: 'SALE_INVOICE',
    title: 'নগদ বিক্রয় (POS কাউন্টার)',
    voucherNumber: 'INV-2026-0811',
    partyName: 'মো: রহিম মিয়া',
    amountPoisha: 485000,
    walletName: 'নগদ ক্যাশবাক্স',
    isCredit: false,
    status: 'COMPLETED'
  },
  {
    id: 'tx_02',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    type: 'BKASH_PAYMENT',
    title: 'বিকাশ কিউআর পেমেন্ট',
    voucherNumber: 'BKS-991204',
    partyName: 'তানভীর আহমেদ',
    amountPoisha: 182000,
    walletName: 'বিকাশ মার্চেন্ট ওয়ালেট',
    isCredit: false,
    status: 'COMPLETED'
  },
  {
    id: 'tx_03',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    type: 'CUSTOMER_PABO',
    title: 'বাকি খাতা জমা (আদায়)',
    voucherNumber: 'KHT-1082',
    partyName: 'করিম সওদাগর',
    amountPoisha: 120000,
    walletName: 'নগদ ক্যাশবাক্স',
    isCredit: false,
    status: 'COMPLETED'
  },
  {
    id: 'tx_04',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    type: 'SUPPLIER_PAYMENT',
    title: 'মহাজন চালান পরিশোধ',
    voucherNumber: 'SUP-4029',
    partyName: 'আকিজ এসেনশিয়ালস লি:',
    amountPoisha: 2500000,
    walletName: 'ইসলামী ব্যাংক হিসাব',
    isCredit: true,
    status: 'COMPLETED'
  },
  {
    id: 'tx_05',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    type: 'SALE_INVOICE',
    title: 'হোলসেল চালানি বিক্রয়',
    voucherNumber: 'INV-2026-0810',
    partyName: 'মেসার্স হক ব্রাদার্স',
    amountPoisha: 1450000,
    walletName: 'নগদ ক্যাশবাক্স',
    isCredit: false,
    status: 'COMPLETED'
  }
];

const INITIAL_LEDGER_ENTRIES_STORE_2 = [
  {
    id: 'tx_w01',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    type: 'SALE_INVOICE',
    title: 'নাজিরশাইল ২০ বস্তা চালান',
    voucherNumber: 'INV-W-9901',
    partyName: 'মেসার্স সততা রাইস এজেন্সি',
    amountPoisha: 8200000,
    walletName: 'আড়ত ক্যাশ সিন্দুক',
    isCredit: false,
    status: 'COMPLETED'
  },
  {
    id: 'tx_w02',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    type: 'BKASH_PAYMENT',
    title: 'বিকাশ কিউআর পেমেন্ট আদায়',
    voucherNumber: 'BKS-W-4412',
    partyName: 'ভাই ভাই ভ্যারাইটিজ',
    amountPoisha: 2500000,
    walletName: 'বিকাশ মার্চেন্ট ওয়ালেট',
    isCredit: false,
    status: 'COMPLETED'
  },
  {
    id: 'tx_w03',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    type: 'SUPPLIER_PAYMENT',
    title: 'দিনাজপুর মিল চালান পরিশোধ',
    voucherNumber: 'SUP-W-1044',
    partyName: 'দিনাজপুর অটো রাইস মিল',
    amountPoisha: 15000000,
    walletName: 'ডাচ-বাংলা ব্যাংক (কারেন্ট)',
    isCredit: true,
    status: 'COMPLETED'
  }
];

const INITIAL_CHEQUES = [
  {
    id: 'chq_01',
    type: 'RECEIVED',
    partyName: 'মো: রহিম মিয়া',
    bankName: 'সোনালী ব্যাংক লি:',
    chequeNumber: 'SB-8829104',
    amountPoisha: 450000,
    issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
    clearingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
    status: 'PENDING',
    createdAt: Date.now(),
  },
  {
    id: 'chq_02',
    type: 'ISSUED',
    partyName: 'আকিজ এসেনশিয়ালস লি:',
    bankName: 'ইসলামী ব্যাংক বাংলাদেশ',
    chequeNumber: 'IBBL-771920',
    amountPoisha: 2000000,
    issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
    clearingDate: new Date().toISOString().slice(0, 10),
    status: 'CLEARED',
    createdAt: Date.now(),
  }
];

const INITIAL_CHEQUES_STORE_2 = [
  {
    id: 'chq_w01',
    type: 'RECEIVED',
    partyName: 'বরিশাল রাইস ট্রেডার্স',
    bankName: 'ডাচ-বাংলা ব্যাংক লি:',
    chequeNumber: 'DBBL-992384',
    amountPoisha: 15000000,
    issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().slice(0, 10),
    clearingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 10),
    status: 'PENDING',
    createdAt: Date.now(),
  }
];

const INITIAL_GODOWN_STOCK = [
  {
    id: 'gstock_01',
    productId: 'prod_01',
    name: 'মিনিকেট চাল ২৫কেজি বস্তা',
    category: 'খাদ্য সামগ্রী',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 25,
    costPriceBasePoisha: 7000,
    sellingPriceBasePoisha: 7800,
    bulkSellingPricePoisha: 185000,
    quantityInBaseUnit: 5000,
    bagsCount: 200,
    godownName: 'প্রধান কেন্দ্রীয় গুদাম (রুম ১)',
    rackLocation: 'র্যাক এ-৪',
    lastIntakeDate: '2026-10-12',
    lowStockThreshold: 500,
  },
  {
    id: 'gstock_02',
    productId: 'prod_02',
    name: 'তীর সয়াবিন তেল ৫লিটার বোতল',
    category: 'তেল ও ঘি',
    baseUnit: 'লিটার',
    hasBulkUnit: true,
    bulkUnitName: 'বোতল',
    bulkConversionFactor: 5,
    costPriceBasePoisha: 15500,
    sellingPriceBasePoisha: 17000,
    bulkSellingPricePoisha: 82000,
    quantityInBaseUnit: 1500,
    bagsCount: 300,
    godownName: 'প্রধান কেন্দ্রীয় গুদাম (রুম ২)',
    rackLocation: 'ড্রাম জোন বি',
    lastIntakeDate: '2026-10-14',
    lowStockThreshold: 200,
  },
  {
    id: 'gstock_03',
    productId: 'prod_04',
    name: 'দেশি মসুর ডাল ৫০কেজি বস্তা',
    category: 'ডাল ও শস্য',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 13000,
    sellingPriceBasePoisha: 14200,
    bulkSellingPricePoisha: 700000,
    quantityInBaseUnit: 4000,
    bagsCount: 80,
    godownName: 'প্রধান কেন্দ্রীয় গুদাম (রুম ১)',
    rackLocation: 'র্যাক সি-২',
    lastIntakeDate: '2026-10-15',
    lowStockThreshold: 500,
  }
];

const INITIAL_GODOWN_STOCK_STORE_2 = [
  {
    id: 'gstock_w01',
    productId: 'prod_w01',
    name: 'কুষ্টিয়া মিনিকেট চাল ৫০কেজি বস্তা',
    category: 'চাউল মোকাম',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 6800,
    sellingPriceBasePoisha: 7400,
    bulkSellingPricePoisha: 365000,
    quantityInBaseUnit: 50000,
    bagsCount: 1000,
    godownName: 'বাদামতলী নদী ঘাট গুদাম ১',
    rackLocation: 'ফ্লোর ব্লক ১',
    lastIntakeDate: '2026-10-15',
    lowStockThreshold: 5000,
  },
  {
    id: 'gstock_w02',
    productId: 'prod_w02',
    name: 'দিনাজপুর নাজিরশাইল চাল ৫০কেজি বস্তা',
    category: 'চাউল মোকাম',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 7800,
    sellingPriceBasePoisha: 8500,
    bulkSellingPricePoisha: 420000,
    quantityInBaseUnit: 35000,
    bagsCount: 700,
    godownName: 'বাদামতলী নদী ঘাট গুদাম ১',
    rackLocation: 'ফ্লোর ব্লক ২',
    lastIntakeDate: '2026-10-14',
    lowStockThreshold: 4000,
  },
  {
    id: 'gstock_w03',
    productId: 'prod_w07',
    name: 'স্বর্ণা মোটা চাল ৫০কেজি বস্তা',
    category: 'চাউল',
    baseUnit: 'কেজি',
    hasBulkUnit: true,
    bulkUnitName: 'বস্তা',
    bulkConversionFactor: 50,
    costPriceBasePoisha: 4600,
    sellingPriceBasePoisha: 5100,
    bulkSellingPricePoisha: 250000,
    quantityInBaseUnit: 40000,
    bagsCount: 800,
    godownName: 'বাবুবাজার সেন্ট্রাল গুদাম',
    rackLocation: 'শেড ৩',
    lastIntakeDate: '2026-10-11',
    lowStockThreshold: 5000,
  }
];

const INITIAL_CHALANS = [
  {
    id: 'chalan_01',
    chalanNumber: 'CH-2026-0881',
    date: '2026-10-15',
    receiverName: 'করিম সওদাগর',
    receiverPhone: '01811-334455',
    destination: 'দোকান নং ৫, কাঁচাবাজার',
    vehicleType: 'পিকআপ ভ্যান',
    vehicleNumber: 'ঢাকা মেট্রো-ন ১১-২২৩৩',
    driverName: 'মো: কালাম',
    driverPhone: '01712-345678',
    godownSource: 'প্রধান কেন্দ্রীয় গুদাম (রুম ১)',
    items: [
      { name: 'মিনিকেট চাল ২৫কেজি বস্তা', quantity: 20, unit: 'বস্তা', weightKg: 500, ratePoisha: 185000, totalPoisha: 3700000 }
    ],
    totalBags: 20,
    totalWeightKg: 500,
    totalAmountPoisha: 3700000,
    status: 'DELIVERED',
    gatePassNumber: 'GP-9912',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'chalan_02',
    chalanNumber: 'CH-2026-0882',
    date: '2026-10-16',
    receiverName: 'তানভীর আহমেদ',
    receiverPhone: '01911-445566',
    destination: 'মিরপুর ১০, ঢাকা',
    vehicleType: 'কাভার্ড ভ্যান',
    vehicleNumber: 'ঢাকা মেট্রো-ম ৪৪-৫৫৬৬',
    driverName: 'সাইফুল ইসলাম',
    driverPhone: '01812-987654',
    godownSource: 'প্রধান কেন্দ্রীয় গুদাম (রুম ২)',
    items: [
      { name: 'তীর সয়াবিন তেল ৫লিটার বোতল', quantity: 40, unit: 'বোতল', weightKg: 200, ratePoisha: 82000, totalPoisha: 3280000 }
    ],
    totalBags: 40,
    totalWeightKg: 200,
    totalAmountPoisha: 3280000,
    status: 'IN_TRANSIT',
    gatePassNumber: 'GP-9915',
    createdAt: Date.now() - 1000 * 60 * 180,
  }
];

const INITIAL_CHALANS_STORE_2 = [
  {
    id: 'chalan_w01',
    chalanNumber: 'CH-WH-1042',
    date: '2026-10-15',
    receiverName: 'মেসার্স সততা রাইস এজেন্সি',
    receiverPhone: '01712-998877',
    destination: 'আড়ত নং ৪, শ্যামবাজার, ঢাকা',
    vehicleType: '১০-টনি ট্রাক',
    vehicleNumber: 'ঢাকা মেট্রো-ট ১৮-৪৫১২',
    driverName: 'মো: হারুনুর রশীদ',
    driverPhone: '01715-112233',
    godownSource: 'বাদামতলী নদী ঘাট গুদাম ১',
    items: [
      { name: 'কুষ্টিয়া মিনিকেট চাল ৫০কেজি বস্তা', quantity: 150, unit: 'বস্তা', weightKg: 7500, ratePoisha: 365000, totalPoisha: 54750000 }
    ],
    totalBags: 150,
    totalWeightKg: 7500,
    totalAmountPoisha: 54750000,
    status: 'DELIVERED',
    gatePassNumber: 'GP-W-701',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  }
];

// Helper to get seed data by tenant and key
const getTenantSeed = (tenantId, key) => {
  const isStore2 = tenantId === 'store_002';
  const isStore3 = tenantId === 'store_003';
  if (isStore3) {
    if (key === 'products') return BUSINESS_PROFILES.PHARMACY?.demoProducts || INITIAL_PRODUCTS;
    if (key === 'customers') return INITIAL_CUSTOMERS;
    if (key === 'suppliers') return INITIAL_SUPPLIERS;
    if (key === 'registers') return INITIAL_REGISTERS;
    if (key === 'ledger') return INITIAL_LEDGER_ENTRIES;
  }
  switch (key) {
    case 'customers': return isStore2 ? INITIAL_CUSTOMERS_STORE_2 : INITIAL_CUSTOMERS;
    case 'suppliers': return isStore2 ? INITIAL_SUPPLIERS_STORE_2 : INITIAL_SUPPLIERS;
    case 'products': return isStore2 ? INITIAL_PRODUCTS_STORE_2 : INITIAL_PRODUCTS;
    case 'registers': return isStore2 ? INITIAL_REGISTERS_STORE_2 : INITIAL_REGISTERS;
    case 'ledger': return isStore2 ? INITIAL_LEDGER_ENTRIES_STORE_2 : INITIAL_LEDGER_ENTRIES;
    case 'cheques': return isStore2 ? INITIAL_CHEQUES_STORE_2 : INITIAL_CHEQUES;
    case 'godownStock': return isStore2 ? INITIAL_GODOWN_STOCK_STORE_2 : INITIAL_GODOWN_STOCK;
    case 'chalans': return isStore2 ? INITIAL_CHALANS_STORE_2 : INITIAL_CHALANS;
    case 'transfers': return [];
    default: return [];
  }
};

// Storage safety helper protecting against quota limits and browser errors
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[LedgerX Storage Warning] Could not persist key "${key}":`, err);
  }
};

// Safe loader that respects Production Mode and prevents demo data leakage
const loadTenantData = (tenantId, key) => {
  const isProduction = localStorage.getItem(`ledgerx_${tenantId}_is_production`) === 'true';

  try {
    const raw = localStorage.getItem(`ledgerx_${tenantId}_${key}`);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (isProduction) {
          // In production mode, user data (even empty array []) is genuine live data!
          // Strictly forbid injecting demo seeds or mock products!
          return parsed;
        }

        if (parsed.length > 0) {
          // Demo Mode Only: check registers and product auto-expansion
          if (key === 'registers') {
            const totalBal = parsed.reduce((sum, r) => sum + (r.balancePoisha || 0), 0);
            if (totalBal <= 0) {
              const seed = getTenantSeed(tenantId, 'registers');
              try {
                localStorage.setItem(`ledgerx_${tenantId}_registers`, JSON.stringify(seed));
              } catch (e) {}
              return seed;
            }
            // Merge missing MFS or Bank accounts so users always have bKash, Nagad, Rocket, IBBL, DBBL available
            const seed = getTenantSeed(tenantId, 'registers');
            const existingIds = new Set(parsed.map((r) => r.id));
            let hasNew = false;
            const merged = [...parsed];
            seed.forEach((s) => {
              if (!existingIds.has(s.id)) {
                merged.push(s);
                existingIds.add(s.id);
                hasNew = true;
              }
            });
            if (hasNew) {
              try {
                localStorage.setItem(`ledgerx_${tenantId}_registers`, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            }
            return parsed;
          }

          // Demo Mode Only: For products, automatically merge rich Super Shop catalog if catalog was small
          if (key === 'products' && parsed.length < 25) {
            const seed = getTenantSeed(tenantId, 'products');
            const merged = [...parsed];
            const existingIds = new Set(parsed.map((p) => p.id));
            seed.forEach((item) => {
              if (!existingIds.has(item.id)) {
                merged.push(item);
                existingIds.add(item.id);
              }
            });
            if (merged.length < 25) {
              INITIAL_PRODUCTS.forEach((item) => {
                if (!existingIds.has(item.id)) {
                  merged.push(item);
                  existingIds.add(item.id);
                }
              });
            }
            try {
              localStorage.setItem(`ledgerx_${tenantId}_products`, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          }

          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn(`[LedgerX Storage Error] key: ${key}`, err);
  }

  // If in production mode and no key existed, start with completely clean state!
  if (isProduction) {
    if (key === 'registers') {
      return [
        { id: 'cash_drawer', name: 'নগদ ক্যাশবাক্স (Gollah)', category: 'CASH', balancePoisha: 0 },
        { id: 'bkash_merchant', name: 'বিকাশ মার্চেন্ট ওয়ালেট', category: 'BKASH', balancePoisha: 0 },
        { id: 'bank_account', name: 'ব্যাংক হিসাব', category: 'BANK', balancePoisha: 0 },
      ];
    }
    return [];
  }

  const seed = getTenantSeed(tenantId, key);
  try {
    localStorage.setItem(`ledgerx_${tenantId}_${key}`, JSON.stringify(seed));
  } catch (e) {}
  return seed;
};

export const KhataProvider = ({ children }) => {
  const { activeTenantId, activeTenant } = useTenant();

  // Storage key scoped by tenantId for strict multi-tenant separation
  const storageKey = (sub) => `ledgerx_${activeTenantId}_${sub}`;

  const [customers, setCustomers] = useState(() => loadTenantData(activeTenantId, 'customers'));
  const [suppliers, setSuppliers] = useState(() => loadTenantData(activeTenantId, 'suppliers'));
  const [products, setProducts] = useState(() => loadTenantData(activeTenantId, 'products'));
  const [registers, setRegisters] = useState(() => loadTenantData(activeTenantId, 'registers'));
  const [ledgerEntries, setLedgerEntries] = useState(() => loadTenantData(activeTenantId, 'ledger'));
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem(storageKey('invoices'));
    return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : [];
  });
  const [cheques, setCheques] = useState(() => loadTenantData(activeTenantId, 'cheques'));
  const [godownStock, setGodownStock] = useState(() => loadTenantData(activeTenantId, 'godownStock'));
  const [chalans, setChalans] = useState(() => loadTenantData(activeTenantId, 'chalans'));
  const [godownTransfers, setGodownTransfers] = useState(() => loadTenantData(activeTenantId, 'transfers'));

  // Reload tenant data when active tenant switches
  useEffect(() => {
    setCustomers(loadTenantData(activeTenantId, 'customers'));
    setSuppliers(loadTenantData(activeTenantId, 'suppliers'));
    setProducts(loadTenantData(activeTenantId, 'products'));
    setRegisters(loadTenantData(activeTenantId, 'registers'));
    setLedgerEntries(loadTenantData(activeTenantId, 'ledger'));
    setCheques(loadTenantData(activeTenantId, 'cheques'));
    setGodownStock(loadTenantData(activeTenantId, 'godownStock'));
    setChalans(loadTenantData(activeTenantId, 'chalans'));
    setGodownTransfers(loadTenantData(activeTenantId, 'transfers'));
  }, [activeTenantId]);

  // Sync to local storage whenever active tenant's state changes with quota safety
  useEffect(() => {
    safeSetItem(storageKey('customers'), JSON.stringify(customers));
  }, [customers, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('suppliers'), JSON.stringify(suppliers));
  }, [suppliers, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('products'), JSON.stringify(products));
  }, [products, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('registers'), JSON.stringify(registers));
  }, [registers, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('ledger'), JSON.stringify(ledgerEntries));
  }, [ledgerEntries, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('invoices'), JSON.stringify(invoices));
  }, [invoices, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('cheques'), JSON.stringify(cheques));
  }, [cheques, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('godownStock'), JSON.stringify(godownStock));
  }, [godownStock, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('chalans'), JSON.stringify(chalans));
  }, [chalans, activeTenantId]);

  useEffect(() => {
    safeSetItem(storageKey('transfers'), JSON.stringify(godownTransfers));
  }, [godownTransfers, activeTenantId]);

  // Halkhata Campaign State (Persisted per tenant)
  const [halkhataCampaign, setHalkhataCampaign] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey('halkhata_campaign'));
      return saved ? JSON.parse(saved) : {
        title: 'পহেলা বৈশাখ ১৪৩৩ হালখাতা উৎসব',
        year: '১৪৩৩',
        defaultDiscountPct: 15,
        minDueTaka: 500,
        giftDescription: 'মিষ্টির প্যাকেট ও বৈশাখী উপহার ক্যালেন্ডার',
        eventDate: '২০২৬-০৪-১৪',
      };
    } catch (e) {
      return {
        title: 'পহেলা বৈশাখ ১৪৩৩ হালখাতা উৎসব',
        year: '১৪৩৩',
        defaultDiscountPct: 15,
        minDueTaka: 500,
        giftDescription: 'মিষ্টির প্যাকেট ও বৈশাখী উপহার ক্যালেন্ডার',
        eventDate: '২০২৬-০৪-১৪',
      };
    }
  });

  const updateHalkhataCampaign = (newConfig) => {
    setHalkhataCampaign((prev) => {
      const updated = { ...prev, ...newConfig };
      safeSetItem(storageKey('halkhata_campaign'), JSON.stringify(updated));
      return updated;
    });
  };

  // Enterprise Data Optimizer: Archive and consolidate old raw history to prevent Supabase & browser memory exhaustion
  const archiveLedgerRollups = ({ daysToKeep = 90 }) => {
    const cutoffMs = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const hotEntries = [];
    const coldEntries = [];

    ledgerEntries.forEach((entry) => {
      const entryTime = entry.timestamp ? new Date(entry.timestamp).getTime() : (entry.createdAt ? new Date(entry.createdAt).getTime() : Date.now());
      if (entryTime >= cutoffMs) {
        hotEntries.push(entry);
      } else {
        coldEntries.push(entry);
      }
    });

    if (coldEntries.length === 0) {
      return { archivedCount: 0, rollupsCreated: 0, remainingCount: hotEntries.length };
    }

    // Group cold entries by date string (YYYY-MM-DD) into compact daily summary rollups
    const dailyMap = {};
    coldEntries.forEach((e) => {
      const dateKey = (e.createdAt || new Date(e.timestamp || Date.now()).toISOString()).slice(0, 10);
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          id: `rollup_${dateKey}`,
          type: 'DAILY_SUMMARY_ROLLUP',
          date: dateKey,
          description: `দৈনিক আর্থিক সারসংক্ষেপ রোল-আপ (${dateKey})`,
          totalInflowPoisha: 0,
          totalOutflowPoisha: 0,
          totalSalesPoisha: 0,
          totalWaiversPoisha: 0,
          transactionCount: 0,
          timestamp: new Date(dateKey).getTime(),
          createdAt: `${dateKey}T23:59:59.000Z`,
        };
      }
      dailyMap[dateKey].transactionCount++;
      const isPositive = e.type === 'CASH_IN' || e.type === 'POS_SALE' || e.type === 'HALKHATA_SETTLEMENT';
      const amount = e.amountPoisha || e.paidPoisha || e.cashCollectedPoisha || 0;
      if (isPositive) {
        dailyMap[dateKey].totalInflowPoisha += amount;
      } else {
        dailyMap[dateKey].totalOutflowPoisha += amount;
      }
      if (e.type === 'POS_SALE' || e.type === 'SALE') {
        dailyMap[dateKey].totalSalesPoisha += (e.grandTotalPoisha || amount);
      }
      if (e.type === 'HALKHATA_SETTLEMENT') {
        dailyMap[dateKey].totalWaiversPoisha += (e.waiverPoisha || 0);
      }
    });

    const rollups = Object.values(dailyMap);
    const consolidatedList = [...hotEntries, ...rollups];

    // Save consolidated entries
    setLedgerEntries(consolidatedList);
    safeSetItem(storageKey('ledger'), JSON.stringify(consolidatedList));

    return {
      archivedCount: coldEntries.length,
      rollupsCreated: rollups.length,
      remainingCount: consolidatedList.length,
      coldEntriesBackup: coldEntries,
    };
  };

  // Master Aggregates
  const totalPaboPoisha = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.currentDuePoisha > 0 ? c.currentDuePoisha : 0), 0);
  }, [customers]);

  const totalDiboPoisha = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.currentDuePoisha > 0 ? s.currentDuePoisha : 0), 0);
  }, [suppliers]);

  const cashboxTotalPoisha = useMemo(() => {
    return registers.reduce((sum, r) => sum + (r.balancePoisha || 0), 0);
  }, [registers]);

  // ── ATOMIC DOMAIN ACTIONS ──────────────────────────────────────────────────

  /**
   * Records "+ টাকা পেলাম (PABO)" - Money received from customer
   */
  const recordPabo = ({ customerId, amountPoisha, walletId = 'cash_drawer', description = '' }) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, error: 'Customer not found' };

    // Normalize wallet ID to ensure bKash merchant register is always credited accurately
    const normalizedWalletId = (walletId === 'bkash_mfs' || walletId === 'bkash') ? 'bkash_merchant' : walletId;

    const newCustomerDue = customer.currentDuePoisha - amountPoisha;

    // 1. Update customer balance
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              currentDuePoisha: newCustomerDue,
              totalTransactionsCount: c.totalTransactionsCount + 1,
            }
          : c
      )
    );

    // 2. Increment destination wallet
    setRegisters((prev) =>
      prev.map((r) =>
        r.id === normalizedWalletId ? { ...r, balancePoisha: r.balancePoisha + amountPoisha } : r
      )
    );

    // 3. Append ledger entry
    const entry = {
      id: `entry_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: customerId,
      partyName: customer.name,
      partyType: 'CUSTOMER',
      type: 'PABO',
      amountPoisha,
      runningBalancePoisha: newCustomerDue,
      paymentMode: normalizedWalletId === 'bkash_merchant' ? 'BKASH' : 'CASH',
      cashRegisterId: normalizedWalletId,
      description: description || 'নগদ/বিকাশ প্রাপ্তি',
      isReversed: false,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // 3b. Dispatch multi-node journal voucher
    try {
      const voucher = EnterpriseNodeBus.createCustomerPaymentVoucher({
        customerId,
        walletId,
        amountPoisha,
        note: description || `গ্রাহক জমা (${customer.name})`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Pabo:', e);
    }

    // 4. Vocalize feedback
    voicebox.announcePayment(customer.name, poishaToTaka(amountPoisha), poishaToTaka(newCustomerDue));
    toast.success('হিসাব সফলভাবে সংরক্ষণ করা হয়েছে!', { icon: '✅' });

    return { success: true, entry };
  };

  /**
   * Records "+ টাকা দিলাম (DIBO)" - Credit given to customer
   */
  const recordDibo = ({ customerId, amountPoisha, description = '' }) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { success: false, error: 'Customer not found' };

    const newCustomerDue = customer.currentDuePoisha + amountPoisha;

    // Credit limit check
    if (newCustomerDue > customer.creditLimitPoisha) {
      toast('সতর্কবার্তা: গ্রাহকের বকেয়া সীমা (Credit Limit) অতিক্রম করেছে!', { icon: '⚠️' });
    }

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              currentDuePoisha: newCustomerDue,
              totalTransactionsCount: c.totalTransactionsCount + 1,
            }
          : c
      )
    );

    const entry = {
      id: `entry_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: customerId,
      partyName: customer.name,
      partyType: 'CUSTOMER',
      type: 'DIBO',
      amountPoisha,
      runningBalancePoisha: newCustomerDue,
      paymentMode: 'CREDIT',
      description: description || 'বাকিতে পণ্য প্রদান',
      isReversed: false,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // Multi-node voucher for credit given
    try {
      const voucher = EnterpriseNodeBus.createCustomerCreditVoucher({
        customerId,
        amountPoisha,
        note: description || `গ্রাহক বাকি প্রদান (${customer.name})`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Dibo:', e);
    }

    voicebox.playSuccessChime();
    toast.success('বাকি হিসাব যুক্ত করা হয়েছে!', { icon: '📝' });

    return { success: true, entry };
  };

  /**
   * Executes POS Sale atomically across stock, invoices, cashbox, customer due, and double-entry ledger bus
   */
  const recordPOSSale = (salePayload) => {
    const payload = salePayload || {};
    const {
      customerId,
      customerName = 'নগদ ক্রেতা (Walk-in)',
      items = [],
      grandTotalPoisha = 0,
      paidAmountPoisha = 0,
      dueAmountPoisha = 0,
      cashPoisha = 0,
      bkashPoisha = 0,
      bankPoisha = 0,
      paymentMode = 'CASH',
      walletId = null,
      walletName = null,
      isMushak = false,
    } = payload;

    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const isMfs = ['BKASH', 'NAGAD', 'ROCKET', 'CELLFIN', 'UPAY', 'MFS'].includes(paymentMode);
    const isBank = paymentMode === 'BANK' || paymentMode === 'CARD';

    let effectiveCashPoisha = cashPoisha;
    let effectiveBkashPoisha = bkashPoisha;
    let effectiveBankPoisha = bankPoisha;

    if (paymentMode === 'CASH') {
      effectiveCashPoisha = paidAmountPoisha > 0 ? paidAmountPoisha : grandTotalPoisha;
    } else if (isMfs) {
      effectiveBkashPoisha = paidAmountPoisha > 0 ? paidAmountPoisha : grandTotalPoisha;
    } else if (isBank) {
      effectiveBankPoisha = paidAmountPoisha > 0 ? paidAmountPoisha : grandTotalPoisha;
    } else if (paymentMode === 'PARTIAL_CASH') {
      effectiveCashPoisha = paidAmountPoisha;
    }

    const effectivePaidAmountPoisha = paidAmountPoisha > 0 
      ? paidAmountPoisha 
      : (effectiveCashPoisha + effectiveBkashPoisha + effectiveBankPoisha);
    const effectiveDueAmountPoisha = dueAmountPoisha > 0 
      ? dueAmountPoisha 
      : (paymentMode === 'DUE' ? grandTotalPoisha : Math.max(0, grandTotalPoisha - effectivePaidAmountPoisha));

    // 1. Deduct stock for all items (synchronizing currentStockInBaseUnit and stock)
    setProducts((prev) =>
      prev.map((prod) => {
        const item = items.find((i) => i.productId === prod.id);
        if (item) {
          const deductBaseUnits = item.isBulk
            ? item.quantity * (prod.bulkConversionFactor || 1)
            : item.quantity;
          const current = prod.currentStockInBaseUnit ?? prod.stock ?? 0;
          const newStock = Math.max(0, current - deductBaseUnits);
          return {
            ...prod,
            currentStockInBaseUnit: newStock,
            stock: newStock,
          };
        }
        return prod;
      })
    );

    // 2. Deposit payment into target registers (Cash, MFS like bKash/Nagad/Rocket, or Bank accounts)
    const nonCashPaidPoisha = (effectiveBkashPoisha > 0 ? effectiveBkashPoisha : 0) + (effectiveBankPoisha > 0 ? effectiveBankPoisha : 0);
    const targetWalletId = walletId || (
      isBank 
        ? 'bank_account' 
        : (paymentMode === 'BKASH' ? 'bkash_merchant' : (paymentMode === 'NAGAD' ? 'nagad_merchant' : (paymentMode === 'ROCKET' ? 'rocket_merchant' : 'bkash_merchant')))
    );

    if (effectiveCashPoisha > 0 || nonCashPaidPoisha > 0) {
      setRegisters((prev) => {
        let hasMatchedWallet = false;
        const updated = prev.map((reg) => {
          let updatedBal = reg.balancePoisha;
          if (reg.id === 'cash_drawer' && effectiveCashPoisha > 0) {
            updatedBal += effectiveCashPoisha;
          }
          if (reg.id === targetWalletId && nonCashPaidPoisha > 0) {
            updatedBal += nonCashPaidPoisha;
            hasMatchedWallet = true;
          }
          return { ...reg, balancePoisha: updatedBal };
        });

        // If targetWalletId wasn't found in existing registers, deposit to first matching MFS/Bank or cash
        if (nonCashPaidPoisha > 0 && !hasMatchedWallet) {
          const fallback = updated.find(r => isBank ? (r.category === 'BANK' || r.id.includes('bank')) : (r.category === 'BKASH' || r.category === 'MFS' || r.id.includes('bkash')));
          if (fallback) {
            fallback.balancePoisha += nonCashPaidPoisha;
          } else if (updated[0]) {
            updated[0].balancePoisha += nonCashPaidPoisha;
          }
        }
        return updated;
      });
    }

    // 3. Update customer due if effectiveDueAmountPoisha > 0
    if (customerId && effectiveDueAmountPoisha > 0) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                currentDuePoisha: (c.currentDuePoisha || 0) + effectiveDueAmountPoisha,
                totalTransactionsCount: (c.totalTransactionsCount || 0) + 1,
              }
            : c
        )
      );

      // Append ledger entry for due
      const dueEntry = {
        id: `entry_${Date.now()}`,
        tenantId: activeTenantId,
        partyId: customerId,
        partyName: customerName,
        partyType: 'CUSTOMER',
        type: 'DIBO',
        amountPoisha: effectiveDueAmountPoisha,
        paymentMode: 'CREDIT',
        invoiceId,
        description: `POS বিক্রয় রসিদ: ${invoiceId}`,
        isReversed: false,
        timestamp: Date.now(),
      };
      setLedgerEntries((prev) => [dueEntry, ...prev]);
    }

    // 3b. Append ledger entries for cash and/or digital payment received
    if (effectiveCashPoisha > 0) {
      const cashPayEntry = {
        id: `entry_sale_cash_${Date.now()}`,
        tenantId: activeTenantId,
        partyId: customerId || 'walkin',
        partyName: customerName,
        partyType: 'CUSTOMER',
        type: 'POS_SALE',
        amountPoisha: effectiveCashPoisha,
        cashRegisterId: 'cash_drawer',
        paymentMode: 'CASH',
        invoiceId,
        description: `POS বিক্রয় নগদ আদায় (রসিদ: ${invoiceId})`,
        isReversed: false,
        timestamp: Date.now(),
      };
      setLedgerEntries((prev) => [cashPayEntry, ...prev]);
    }

    if (nonCashPaidPoisha > 0) {
      const modeLabel = payload.paymentModeLabel || (isBank ? 'ব্যাংক ট্রান্সফার' : (paymentMode === 'NAGAD' ? 'নগদ' : (paymentMode === 'ROCKET' ? 'রকেট' : 'বিকাশ')));
      const nonCashPayEntry = {
        id: `entry_sale_dig_${Date.now() + 1}`,
        tenantId: activeTenantId,
        partyId: customerId || 'walkin',
        partyName: customerName,
        partyType: 'CUSTOMER',
        type: 'POS_SALE',
        amountPoisha: nonCashPaidPoisha,
        cashRegisterId: targetWalletId,
        paymentMode: paymentMode || 'MFS',
        invoiceId,
        description: `POS বিক্রয় ${modeLabel} আদায় (রসিদ: ${invoiceId})`,
        isReversed: false,
        timestamp: Date.now() + 1,
      };
      setLedgerEntries((prev) => [nonCashPayEntry, ...prev]);
    }

    // 4. Multi-Node Enterprise Bus Dispatch
    const cogsPoisha = items.reduce((sum, item) => sum + (item.costPricePoisha || item.costPriceBasePoisha || 0) * (item.quantity || 1), 0);
    const vatPoisha = isMushak ? Math.round(grandTotalPoisha * 0.05) : 0;
    try {
      const voucher = EnterpriseNodeBus.createSaleVoucher({
        saleId: invoiceId,
        cashPoisha: effectiveCashPoisha,
        bkashPoisha: effectiveBkashPoisha,
        duePoisha: effectiveDueAmountPoisha,
        cogsPoisha,
        vatPoisha,
        note: `POS বিক্রয় রসিদ: ${invoiceId} (${customerName})`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on POS sale:', e);
    }

    // 5. Save Invoice with complete item and breakdown tracking
    const invoice = {
      id: invoiceId,
      tenantId: activeTenantId,
      customerId,
      customerName,
      customerPhone: payload.customerPhone || '',
      items,
      subtotalPoisha: payload.subtotalPoisha || grandTotalPoisha,
      discountPoisha: payload.discountPoisha || 0,
      vatPoisha: payload.vatPoisha || vatPoisha,
      roundingPoisha: payload.roundingPoisha || 0,
      grandTotalPoisha,
      paidAmountPoisha: effectivePaidAmountPoisha,
      dueAmountPoisha: effectiveDueAmountPoisha,
      paymentMode: paymentMode || 'CASH',
      walletId: targetWalletId,
      walletName: walletName || null,
      paymentBreakdown: { 
        cashPoisha: effectiveCashPoisha, 
        bkashPoisha: effectiveBkashPoisha, 
        bankPoisha: effectiveBankPoisha, 
        duePoisha: effectiveDueAmountPoisha 
      },
      isMushak,
      createdAt: Date.now(),
    };
    setInvoices((prev) => [invoice, ...prev]);

    // 6. Audio & feedback
    voicebox.announceSale(poishaToTaka(grandTotalPoisha));
    toast.success(`বিক্রয় সম্পন্ন! রসিদ নং: ${invoiceId}`, { icon: '🛒' });

    return { success: true, invoice };
  };

  /**
   * Settle Halkhata Account with partial waiver and dynamic register deposit
   */
  const settleHalkhata = ({ customerId, cashCollectedPoisha, waiverPoisha, registerId = 'cash_drawer' }) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return { success: false };

    // Update customer due to 0
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              currentDuePoisha: 0,
              totalTransactionsCount: (c.totalTransactionsCount || 0) + 1,
            }
          : c
      )
    );

    // Deposit cash into selected register (cash drawer, MFS, or bank)
    const targetRegId = registerId || 'cash_drawer';
    setRegisters((prev) =>
      prev.map((r) =>
        r.id === targetRegId ? { ...r, balancePoisha: (r.balancePoisha || 0) + cashCollectedPoisha } : r
      )
    );

    const settlementEntry = {
      id: `halkhata_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: customerId,
      partyName: customer.name,
      partyType: 'CUSTOMER',
      type: 'HALKHATA_SETTLEMENT',
      cashCollectedPoisha,
      waiverPoisha,
      amountPoisha: cashCollectedPoisha,
      cashRegisterId: targetRegId,
      description: `শুভ হালখাতা বকেয়া নিষ্পত্তি (${customer.name} - নগদ আদায়: ৳${poishaToTaka(cashCollectedPoisha)}, সম্মানজনক ছাড়: ৳${poishaToTaka(waiverPoisha)})`,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setLedgerEntries((prev) => [settlementEntry, ...prev]);

    // Multi-Node Enterprise Bus Dispatch
    try {
      const voucher = EnterpriseNodeBus.createHalkhataVoucher({
        customerId,
        cashCollectedPoisha,
        waiverPoisha,
        note: `শুভ হালখাতা নিষ্পত্তি (${customer.name})`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Halkhata:', e);
    }

    voicebox.speak(`${customer.name} এর হালখাতা হিসাব সফলভাবে সম্পন্ন হয়েছে।`);
    toast.success('হালখাতা বকেয়া নিষ্পত্তি সম্পন্ন!', { icon: '🎉' });
    return { success: true };
  };

  /**
   * Record Returnable Container movement
   */
  const recordContainerMovement = ({ customerId, containerType, qty, isIssue }) => {
    const delta = isIssue ? qty : -qty;
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              containersDueCount: Math.max(0, (c.containersDueCount || 0) + delta),
            }
          : c
      )
    );
    toast.success(isIssue ? 'ক্যারেট প্রদান রেকর্ড করা হয়েছে' : 'ক্যারেট ফেরত জমা হয়েছে', { icon: '📦' });
  };

  // ── ENTERPRISE PRODUCTION MUTATION ENGINES ──────────────────────────────────

  /**
   * 1. Add New Real Customer to Khata
   */
  const addCustomer = ({ name, phone, address, creditLimitPoisha = 1000000, initialDuePoisha = 0 }) => {
    const id = `cust_${Date.now()}`;
    const newCust = {
      id,
      name: name || 'নতুন কাস্টমার',
      phone: phone || '',
      address: address || '',
      currentDuePoisha: initialDuePoisha,
      creditLimitPoisha,
      trustScore: 5,
      containersDueCount: 0,
      totalTransactionsCount: initialDuePoisha > 0 ? 1 : 0,
      createdAt: Date.now(),
    };

    setCustomers((prev) => [newCust, ...prev]);

    if (initialDuePoisha > 0) {
      const entry = {
        id: `entry_${Date.now()}`,
        tenantId: activeTenantId,
        partyId: id,
        partyName: newCust.name,
        partyType: 'CUSTOMER',
        type: 'DIBO',
        amountPoisha: initialDuePoisha,
        paymentMode: 'OPENING_BALANCE',
        description: 'প্রারম্ভিক বকেয়া (Opening Due)',
        timestamp: Date.now(),
      };
      setLedgerEntries((prev) => [entry, ...prev]);
    }

    toast.success('নতুন কাস্টমার সফলভাবে যুক্ত হয়েছে!', { icon: '👤' });
    return newCust;
  };

  /**
   * Edit Existing Customer Details
   */
  const editCustomer = (customerId, updates) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, ...updates, updatedAt: Date.now() } : c))
    );
    toast.success('কাস্টমার তথ্য সফলভাবে আপডেট হয়েছে!', { icon: '✏️' });
  };

  /**
   * Delete / Archive Customer from Khata
   */
  const deleteCustomer = (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    toast.success('কাস্টমার খাতা তালিকা থেকে সরানো হয়েছে!', { icon: '🗑️' });
  };

  /**
   * 2. Add New Real Wholesaler / Supplier
   */
  const addSupplier = ({ name, company, phone, address, initialDuePoisha = 0 }) => {
    const id = `supp_${Date.now()}`;
    const newSupp = {
      id,
      name: name || 'নতুন মহাজন',
      company: company || '',
      phone: phone || '',
      address: address || '',
      balancePoisha: initialDuePoisha,
      currentDuePoisha: initialDuePoisha,
      totalPurchasesPoisha: initialDuePoisha,
      containerBalance: 0,
      createdAt: Date.now(),
    };

    setSuppliers((prev) => [newSupp, ...prev]);

    if (initialDuePoisha > 0) {
      const openingEntry = {
        id: `supp_open_${Date.now()}`,
        tenantId: activeTenantId,
        partyId: id,
        partyName: name || 'নতুন মহাজন',
        partyType: 'SUPPLIER',
        type: 'SUPPLIER_OPENING_BALANCE',
        title: 'প্রারম্ভিক বকেয়া দেনা',
        voucherNumber: `OPEN-${Date.now().toString().slice(-4)}`,
        amountPoisha: initialDuePoisha,
        walletName: 'প্রারম্ভিক ব্যালেন্স',
        description: 'খাতা খোলার সময় প্রারম্ভিক দেনা রেকর্ড',
        timestamp: Date.now() - 1000,
      };
      setLedgerEntries((prev) => [openingEntry, ...prev]);
    }

    toast.success('নতুন মহাজন সফলভাবে যুক্ত হয়েছে!', { icon: '🏢' });
    return newSupp;
  };

  /**
   * Edit Existing Wholesaler / Supplier
   */
  const editSupplier = (supplierId, updates) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, ...updates, updatedAt: Date.now() } : s))
    );
    toast.success('মহাজন তথ্য সফলভাবে আপডেট হয়েছে!', { icon: '✏️' });
  };

  /**
   * Delete Supplier from Khata
   */
  const deleteSupplier = (supplierId) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    toast.success('মহাজন খাতা তালিকা থেকে সরানো হয়েছে!', { icon: '🗑️' });
  };

  /**
   * 3. Pay Supplier from Cashbox / Wallet
   */
  const recordSupplierPayment = (supplierId, amountPoisha, note = '', walletId = 'cash_drawer', refChalanNumber = '') => {
    const supp = suppliers.find((s) => s.id === supplierId);
    const reg = registers.find((r) => r.id === walletId);
    const walletName = reg ? reg.name : (walletId === 'cash_drawer' ? 'নগদ ক্যাশবাক্স' : 'ক্যাশ/ব্যাংক');
    const voucherNumber = `PAY-${Date.now().toString().slice(-6)}`;
    const cleanRef = (refChalanNumber || '').trim();
    const entryTitle = cleanRef ? `চালান #${cleanRef} পরিশোধ` : 'মহাজনকে পাওনা পরিশোধ';
    const entryDesc = note || (cleanRef ? `চালান বিল নং #${cleanRef} এর পাওনা পরিশোধ` : 'মহাজনকে পাওনা পরিশোধ');

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const current = s.balancePoisha || s.currentDuePoisha || 0;
          const newBal = Math.max(0, current - amountPoisha);
          return { ...s, balancePoisha: newBal, currentDuePoisha: newBal };
        }
        return s;
      })
    );

    // Deduct from wallet
    setRegisters((prev) =>
      prev.map((r) =>
        r.id === walletId ? { ...r, balancePoisha: Math.max(0, r.balancePoisha - amountPoisha) } : r
      )
    );

    const entry = {
      id: `supp_pay_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: supplierId,
      partyName: supp?.name || '',
      partyType: 'SUPPLIER',
      type: 'PAYMENT_TO_SUPPLIER',
      title: entryTitle,
      voucherNumber,
      amountPoisha,
      cashRegisterId: walletId,
      walletName,
      refChalanNumber: cleanRef,
      description: entryDesc,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // Multi-Node Enterprise Bus Dispatch
    try {
      const voucher = EnterpriseNodeBus.createSupplierPaymentVoucher({
        supplierId,
        walletId,
        amountPoisha,
        note: note || 'মহাজনকে পাওনা পরিশোধ',
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Supplier Payment:', e);
    }

    voicebox.playSuccessChime();
    toast.success('মহাজনকে পরিশোধ সফলভাবে সম্পন্ন!', { icon: '💸' });
  };

  /**
   * 4. Record Wholesaler Purchase Bill (Increases supplier debt)
   */
  const recordPurchaseBill = (supplierId, amountPoisha, billNumber = '', note = '') => {
    const supp = suppliers.find((s) => s.id === supplierId);
    const vNum = billNumber || `BILL-${Date.now().toString().slice(-6)}`;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const current = s.balancePoisha || s.currentDuePoisha || 0;
          const newBal = current + amountPoisha;
          return {
            ...s,
            balancePoisha: newBal,
            currentDuePoisha: newBal,
            totalPurchasesPoisha: (s.totalPurchasesPoisha || 0) + amountPoisha,
          };
        }
        return s;
      })
    );

    const entry = {
      id: `supp_bill_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: supplierId,
      partyName: supp?.name || '',
      partyType: 'SUPPLIER',
      type: 'PURCHASE_BILL',
      title: 'ক্রয় চালান বিল',
      voucherNumber: vNum,
      billNumber: vNum,
      paymentMode: 'CREDIT',
      walletName: 'বাকি ক্রয় চালান',
      amountPoisha,
      description: note || `চালান বিল নং: ${vNum}`,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // Multi-Node Enterprise Bus Dispatch
    try {
      const voucher = EnterpriseNodeBus.createPurchaseVoucher({
        supplierId,
        billNumber: vNum,
        amountPoisha,
        note: note || `চালান বিল নং: ${vNum}`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Purchase Bill:', e);
    }

    toast.success('মহাজন চালান সফলভাবে যুক্ত হয়েছে!', { icon: '📄' });
  };

  /**
   * 4.5 Record Goods Return to Wholesaler (Debit Note - reduces supplier debt)
   */
  const recordSupplierReturn = (supplierId, amountPoisha, returnChallanNo = '', reason = '', note = '', refChalanNumber = '') => {
    const supp = suppliers.find((s) => s.id === supplierId);
    const rNum = returnChallanNo || `RET-${Date.now().toString().slice(-6)}`;
    const cleanRef = (refChalanNumber || '').trim();

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const current = s.balancePoisha || s.currentDuePoisha || 0;
          const newBal = Math.max(0, current - amountPoisha);
          return {
            ...s,
            balancePoisha: newBal,
            currentDuePoisha: newBal,
          };
        }
        return s;
      })
    );

    const entryTitle = cleanRef ? `চালান #${cleanRef} মাল ফেরত` : 'মাল ফেরত (ডেবিট নোট)';
    const entryDesc = note || (cleanRef
      ? `মাল ফেরত চালান: ${rNum} [মূল চালান: #${cleanRef}] (${reason || 'নষ্ট/মেয়াদোত্তীর্ণ'})`
      : `মাল ফেরত চালান (ডেবিট নোট): ${rNum} (${reason || 'নষ্ট/মেয়াদোত্তীর্ণ'})`);

    const entry = {
      id: `supp_ret_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: supplierId,
      partyName: supp?.name || '',
      partyType: 'SUPPLIER',
      type: 'SUPPLIER_RETURN',
      title: entryTitle,
      voucherNumber: rNum,
      returnChallanNo: rNum,
      billNumber: rNum,
      refChalanNumber: cleanRef,
      walletName: 'ডেবিট নোট সমন্বয়',
      amountPoisha,
      reason: reason || 'নষ্ট/মেয়াদোত্তীর্ণ পণ্য ফেরত',
      description: entryDesc,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // Multi-Node Enterprise Bus Dispatch
    try {
      const voucher = EnterpriseNodeBus.createSupplierReturnVoucher({
        supplierId,
        returnChallanNo: rNum,
        amountPoisha,
        reason,
        note: entry.description,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Supplier Return:', e);
    }

    voicebox.playSuccessChime();
    toast.success('মহাজনকে মাল ফেরত ও ডেবিট নোট সমন্বয় সম্পন্ন!', { icon: '🔄' });
  };

  /**
   * 5. Add New Real Product to Inventory
   */
  const addProduct = (productData) => {
    const id = `prod_${Date.now()}`;
    const newProd = {
      id,
      sku: productData.sku || String(Date.now()).slice(-8),
      name: productData.name,
      category: productData.category || 'সাধারণ পণ্য',
      baseUnit: productData.baseUnit || productData.unit || 'কেজি',
      hasBulkUnit: !!productData.isDualUnit,
      bulkUnitName: productData.bulkUnitName || 'বস্তা',
      bulkConversionFactor: Number(productData.packSize) || 50,
      costPriceBasePoisha: productData.costPriceBasePoisha || 0,
      sellingPriceBasePoisha: productData.sellingPriceBasePoisha || 0,
      bulkSellingPricePoisha: productData.bulkSellingPricePoisha || 0,
      currentStockInBaseUnit: Number(productData.stock) || Number(productData.currentStockInBaseUnit) || 0,
      stock: Number(productData.stock) || Number(productData.currentStockInBaseUnit) || 0,
      lowStockAlertThreshold: productData.lowStockAlertThreshold || 10,
      minStock: productData.minStock || 5,
      batchNumber: productData.batchNumber || `B-${Date.now().toString().slice(-4)}`,
      expiryDate: productData.expiryDate || '12/2028',
      hotkey: productData.hotkey || '',
      createdAt: Date.now(),
    };

    setProducts((prev) => [newProd, ...prev]);
    toast.success('পণ্য ক্যাটালগে সফলভাবে যুক্ত হয়েছে!', { icon: '📦' });
    return newProd;
  };

  /**
   * Edit Existing Product Details
   */
  const editProduct = (productId, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates, updatedAt: Date.now() } : p))
    );
    toast.success('পণ্য তথ্য সফলভাবে আপডেট হয়েছে!', { icon: '✏️' });
  };

  /**
   * Delete Product from Inventory
   */
  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    toast.success('পণ্য ক্যাটালগ থেকে মুছে ফেলা হয়েছে!', { icon: '🗑️' });
  };

  /**
   * Update Product Selling Price (Morning Repricer)
   */
  const updateProductPrice = (productId, newSalePricePoisha) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            salePricePoisha: newSalePricePoisha,
            sellingPriceBasePoisha: newSalePricePoisha,
            bulkSellingPricePoisha: p.bulkConversionFactor ? Math.round(newSalePricePoisha * p.bulkConversionFactor * 0.95) : newSalePricePoisha,
          };
        }
        return p;
      })
    );
  };

  /**
   * Add Product Batch (FEFO / Expiry Tracking)
   */
  const addProductBatch = (productId, batchData) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const currentBatches = p.batches || [];
          const currentStock = p.currentStockInBaseUnit ?? p.stock ?? 0;
          const newStock = currentStock + (batchData.quantity || 0);
          return {
            ...p,
            batches: [batchData, ...currentBatches],
            stock: newStock,
            currentStockInBaseUnit: newStock,
          };
        }
        return p;
      })
    );
    toast.success('পণ্যের নতুন ব্যাচ সফলভাবে যুক্ত হয়েছে!', { icon: '🏷️' });
  };

  /**
   * Load Industry Specific Catalog for Active Tenant
   */
  const loadIndustryCatalog = (businessType) => {
    const profile = BUSINESS_PROFILES[businessType];
    if (profile && profile.demoProducts) {
      const prods = profile.demoProducts.map((dp) => ({
        id: dp.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: dp.name,
        sku: dp.sku || `SKU-${Date.now().toString().slice(-4)}`,
        category: dp.category || 'সাধারণ',
        costPricePoisha: dp.costPriceBasePoisha || 0,
        salePricePoisha: dp.sellingPriceBasePoisha || 0,
        costPriceBasePoisha: dp.costPriceBasePoisha || 0,
        sellingPriceBasePoisha: dp.sellingPriceBasePoisha || 0,
        bulkSellingPricePoisha: dp.bulkSellingPricePoisha || 0,
        unit: dp.baseUnit || 'পিস',
        baseUnit: dp.baseUnit || 'পিস',
        stock: dp.stock || dp.currentStockInBaseUnit || 0,
        currentStockInBaseUnit: dp.stock || dp.currentStockInBaseUnit || 0,
        isDualUnit: dp.hasBulkUnit || false,
        packSize: dp.bulkConversionFactor || 1,
        bulkUnitName: dp.bulkUnitName || '',
        bulkConversionFactor: dp.bulkConversionFactor || 1,
        hotkey: dp.hotkey || '',
        genericName: dp.genericName || '',
        manufacturer: dp.manufacturer || '',
        brand: dp.brand || '',
        warrantyPeriodMonths: dp.warrantyPeriodMonths || 0,
        imeiList: dp.imeiList || [],
        availableSizes: dp.availableSizes || [],
        availableColors: dp.availableColors || [],
        batchNumber: dp.batchNumber || '',
        expiryDate: dp.expiryDate || '',
        isNearExpiry: dp.isNearExpiry || false,
        createdAt: Date.now(),
      }));
      setProducts(prods);
      toast.success(`${profile.nameBn} এর ডেমো ক্যাটালগ সফলভাবে লোড হয়েছে!`, { icon: '📦' });
    }
  };

  /**
   * Safely Merge / Append Industry Specific Catalog without wiping existing items
   */
  const mergeIndustryCatalog = (businessType) => {
    const profile = BUSINESS_PROFILES[businessType];
    if (profile && profile.demoProducts) {
      const prods = profile.demoProducts.map((dp) => ({
        id: dp.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: dp.name,
        sku: dp.sku || `SKU-${Date.now().toString().slice(-4)}`,
        category: dp.category || 'সাধারণ',
        department: dp.department || 'GENERAL_RETAIL',
        costPricePoisha: dp.costPriceBasePoisha || 0,
        salePricePoisha: dp.sellingPriceBasePoisha || 0,
        costPriceBasePoisha: dp.costPriceBasePoisha || 0,
        sellingPriceBasePoisha: dp.sellingPriceBasePoisha || 0,
        bulkSellingPricePoisha: dp.bulkSellingPricePoisha || 0,
        unit: dp.baseUnit || 'পিস',
        baseUnit: dp.baseUnit || 'পিস',
        stock: dp.stock || dp.currentStockInBaseUnit || 0,
        currentStockInBaseUnit: dp.stock || dp.currentStockInBaseUnit || 0,
        isDualUnit: dp.hasBulkUnit || false,
        packSize: dp.bulkConversionFactor || 1,
        bulkUnitName: dp.bulkUnitName || '',
        bulkConversionFactor: dp.bulkConversionFactor || 1,
        hotkey: dp.hotkey || '',
        genericName: dp.genericName || '',
        manufacturer: dp.manufacturer || '',
        brand: dp.brand || '',
        isWeighable: !!dp.isWeighable,
        warrantyPeriodMonths: dp.warrantyPeriodMonths || 0,
        imeiList: dp.imeiList || [],
        availableSizes: dp.availableSizes || [],
        availableColors: dp.availableColors || [],
        batchNumber: dp.batchNumber || '',
        expiryDate: dp.expiryDate || '',
        isNearExpiry: dp.isNearExpiry || false,
        createdAt: Date.now(),
      }));
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const toAdd = prods.filter((p) => !existingIds.has(p.id));
        return [...prev, ...toAdd];
      });
      toast.success(`${profile.nameBn} এর নমুনা পণ্য বর্তমান পণ্যের সাথে যুক্ত হয়েছে!`, { icon: '➕' });
    }
  };

  /**
   * 6. Cash In / Cash Out / Transfer Operations
   */
  const recordCashIn = ({ walletId = 'cash_drawer', amountPoisha, category = 'মালিকের জমা', note = '' }) => {
    setRegisters((prev) =>
      prev.map((r) => (r.id === walletId ? { ...r, balancePoisha: r.balancePoisha + amountPoisha } : r))
    );
    const entry = {
      id: `cashin_${Date.now()}`,
      tenantId: activeTenantId,
      type: 'CASH_IN',
      amountPoisha,
      cashRegisterId: walletId,
      description: `${category}: ${note}`,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // Multi-Node Enterprise Bus Dispatch
    try {
      const voucher = EnterpriseNodeBus.createCashMovementVoucher({
        type: 'CASH_IN',
        walletId,
        amountPoisha,
        category,
        note: `${category}: ${note}`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Cash In:', e);
    }

    voicebox.playSuccessChime();
    toast.success('ক্যাশ ইন সফলভাবে সম্পন্ন!', { icon: '💰' });
  };

  const recordCashOut = ({ walletId = 'cash_drawer', amountPoisha, category = 'দোকান খরচ', note = '' }) => {
    setRegisters((prev) =>
      prev.map((r) =>
        r.id === walletId ? { ...r, balancePoisha: Math.max(0, r.balancePoisha - amountPoisha) } : r
      )
    );
    const entry = {
      id: `cashout_${Date.now()}`,
      tenantId: activeTenantId,
      type: 'CASH_OUT',
      amountPoisha,
      cashRegisterId: walletId,
      description: `${category}: ${note}`,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // Multi-Node Enterprise Bus Dispatch
    try {
      const voucher = EnterpriseNodeBus.createCashMovementVoucher({
        type: 'CASH_OUT',
        walletId,
        amountPoisha,
        category,
        note: `${category}: ${note}`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Cash Out:', e);
    }

    toast.success('ক্যাশ আউট / খরচ সফলভাবে সম্পন্ন!', { icon: '📤' });
  };

  const transferCash = ({ fromWalletId, toWalletId, amountPoisha, note = '' }) => {
    setRegisters((prev) =>
      prev.map((r) => {
        if (r.id === fromWalletId) return { ...r, balancePoisha: Math.max(0, r.balancePoisha - amountPoisha) };
        if (r.id === toWalletId) return { ...r, balancePoisha: r.balancePoisha + amountPoisha };
        return r;
      })
    );
    const entry = {
      id: `xfer_${Date.now()}`,
      tenantId: activeTenantId,
      type: 'WALLET_TRANSFER',
      amountPoisha,
      fromWalletId,
      toWalletId,
      description: note || 'ওয়ালেট ফান্ড স্থানান্তর',
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // Multi-Node Enterprise Bus Dispatch
    try {
      const voucher = EnterpriseNodeBus.createWalletTransferVoucher({
        fromWalletId,
        toWalletId,
        amountPoisha,
        note: note || 'ওয়ালেট ফান্ড স্থানান্তর',
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on Wallet Transfer:', e);
    }

    toast.success('ওয়ালেট স্থানান্তর সফল!', { icon: '↔️' });
  };

  /**
   * Cash Over / Short Adjustment from Till Reconciliation
   */
  const recordCashAdjustment = ({ variancePoisha, note = '' }) => {
    if (!variancePoisha) return;
    const isShortage = variancePoisha < 0;
    const absPoisha = Math.abs(variancePoisha);

    // 1. Adjust cash_drawer register to match physical reality
    setRegisters((prev) =>
      prev.map((r) => {
        if (r.id === 'cash_drawer') {
          const newBal = isShortage
            ? Math.max(0, r.balancePoisha - absPoisha)
            : r.balancePoisha + absPoisha;
          return { ...r, balancePoisha: newBal };
        }
        return r;
      })
    );

    // 2. Append general ledger audit entry
    const entry = {
      id: `cadj_${Date.now()}`,
      tenantId: activeTenantId,
      type: 'CASH_OVER_SHORT',
      amountPoisha: absPoisha,
      variancePoisha,
      cashRegisterId: 'cash_drawer',
      description: note || `ক্যাশ ড্রয়ার দিনের ক্লোজিং সমন্বয় (${isShortage ? 'ঘাটতি সমন্বয়' : 'উদ্বৃত্ত সমন্বয়'})`,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    // 3. Dispatch to EnterpriseNodeBus
    try {
      const voucher = EnterpriseNodeBus.createCashAdjustmentVoucher({
        variancePoisha,
        note: note || `ক্যাশ ড্রয়ার ক্লোজিং সমন্বয়`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on cash adjustment:', e);
    }

    toast.success(isShortage ? 'ক্যাশ ঘাটতি সমন্বয় ভাউচার সংরক্ষিত!' : 'উদ্বৃত্ত ক্যাশ সমন্বয় ভাউচার সংরক্ষিত!', { icon: '⚖️' });
  };

  /**
   * 6.5 Bank Account and MFS Wallet Multi-Registry Management
   */
  const addBankAccount = ({ bankName, accountNumber, branch = '', accountType = 'চলতি (Current)', initialBalancePoisha = 0 }) => {
    const id = `bank_${Date.now()}`;
    const newBank = {
      id,
      name: `${bankName} (${branch ? branch + ', ' : ''}হি/নং: ${accountNumber.slice(-4)})`,
      bankName,
      accountNumber,
      branch,
      accountType,
      category: 'BANK',
      balancePoisha: Number(initialBalancePoisha) || 0,
      createdAt: Date.now(),
    };
    setRegisters((prev) => [...prev, newBank]);

    if (initialBalancePoisha > 0) {
      const entry = {
        id: `cashin_bank_${Date.now()}`,
        tenantId: activeTenantId,
        type: 'CASH_IN',
        amountPoisha: Number(initialBalancePoisha) || 0,
        cashRegisterId: id,
        description: `ব্যাংক প্রারম্ভিক জমা: ${bankName} (${accountNumber})`,
        timestamp: Date.now(),
      };
      setLedgerEntries((prev) => [entry, ...prev]);
    }

    toast.success(`নতুন ব্যাংক হিসাব (${bankName}) যুক্ত হয়েছে!`, { icon: '🏦' });
    return newBank;
  };

  const addMfsWallet = ({ provider = 'BKASH', walletNumber, walletType = 'মার্চেন্ট (Merchant)', initialBalancePoisha = 0 }) => {
    const providerLabels = {
      BKASH: 'বিকাশ',
      NAGAD: 'নগদ',
      ROCKET: 'রকেট',
      UPAY: 'উপায়',
      CELLFIN: 'সেলফিন',
    };
    const provName = providerLabels[provider] || provider;
    const id = `mfs_${provider.toLowerCase()}_${Date.now()}`;
    const newWallet = {
      id,
      name: `${provName} (${walletType === 'মার্চেন্ট (Merchant)' ? 'মার্চেন্ট' : 'পার্সোনাল'} - ${walletNumber})`,
      provider,
      walletNumber,
      walletType,
      category: 'MFS',
      balancePoisha: Number(initialBalancePoisha) || 0,
      createdAt: Date.now(),
    };
    setRegisters((prev) => [...prev, newWallet]);

    if (initialBalancePoisha > 0) {
      const entry = {
        id: `cashin_mfs_${Date.now()}`,
        tenantId: activeTenantId,
        type: 'CASH_IN',
        amountPoisha: Number(initialBalancePoisha) || 0,
        cashRegisterId: id,
        description: `এমএফএস প্রারম্ভিক জমা: ${provName} (${walletNumber})`,
        timestamp: Date.now(),
      };
      setLedgerEntries((prev) => [entry, ...prev]);
    }

    toast.success(`নতুন এমএফএস ওয়ালেট (${provName}) যুক্ত হয়েছে!`, { icon: '📱' });
    return newWallet;
  };

  const editRegister = (registerId, updates) => {
    setRegisters((prev) =>
      prev.map((r) => (r.id === registerId ? { ...r, ...updates, updatedAt: Date.now() } : r))
    );
    toast.success('হিসাবের বিবরণ আপডেট হয়েছে!', { icon: '✏️' });
  };

  const deleteRegister = (registerId) => {
    if (registerId === 'cash_drawer') {
      toast.error('প্রধান নগদ ক্যাশবাক্স মোছা যাবে না!');
      return false;
    }
    setRegisters((prev) => prev.filter((r) => r.id !== registerId));
    toast.success('হিসাব/ওয়ালেট সফলভাবে মুছে ফেলা হয়েছে!', { icon: '🗑️' });
    return true;
  };

  /**
   * 7. Cheque Register Operations
   */
  const addCheque = (chequeData) => {
    const id = `chq_${Date.now()}`;
    const newChq = {
      id,
      type: chequeData.type || 'RECEIVED',
      partyName: chequeData.partyName,
      bankName: chequeData.bankName,
      chequeNumber: chequeData.chequeNumber,
      amountPoisha: chequeData.amountPoisha,
      issueDate: chequeData.issueDate || new Date().toISOString().slice(0, 10),
      clearingDate: chequeData.clearingDate || new Date().toISOString().slice(0, 10),
      status: 'PENDING',
      createdAt: Date.now(),
    };
    setCheques((prev) => [newChq, ...prev]);
    toast.success('চেক সফলভাবে যুক্ত হয়েছে!', { icon: '🏦' });
    return newChq;
  };

  const updateChequeStatus = (id, newStatus) => {
    const chq = cheques.find((c) => c.id === id);
    if (!chq) return;

    // Financial accounting loop on status change to CLEARED
    if (newStatus === 'CLEARED' && chq.status !== 'CLEARED') {
      const amount = chq.amountPoisha || 0;
      if (chq.type === 'RECEIVED') {
        // Customer cheque cleared: Bank deposit
        setRegisters((prev) =>
          prev.map((r) => (r.id === 'bank_account' ? { ...r, balancePoisha: (r.balancePoisha || 0) + amount } : r))
        );
        const entry = {
          id: `entry_chq_${Date.now()}`,
          tenantId: activeTenantId,
          partyName: chq.partyName,
          type: 'BANK_DEPOSIT',
          amountPoisha: amount,
          description: `গ্রাহকের চেক ক্লিয়ারিং জমা (চেক: ${chq.chequeNumber}, ${chq.bankName})`,
          timestamp: Date.now(),
        };
        setLedgerEntries((prev) => [entry, ...prev]);

        try {
          const voucher = EnterpriseNodeBus.createChequeClearanceVoucher({
            chequeId: chq.id,
            chequeType: 'RECEIVED',
            amountPoisha: amount,
            partyName: chq.partyName,
            note: `গ্রাহক চেক ক্লিয়ারিং (${chq.chequeNumber})`,
          });
          recordJournalVoucher(voucher, activeTenantId);
        } catch (e) {
          console.warn('Node bus error on cheque clearance:', e);
        }

        voicebox.playSuccessChime();
        toast.success(`চেক ক্লিয়ার হয়েছে এবং ৳${poishaToTaka(amount)} ব্যাংকে জমা হয়েছে!`, { icon: '🏦' });
      } else if (chq.type === 'ISSUED') {
        // Supplier cheque cleared: Bank deduction
        setRegisters((prev) =>
          prev.map((r) => (r.id === 'bank_account' ? { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - amount) } : r))
        );
        const entry = {
          id: `entry_chq_${Date.now()}`,
          tenantId: activeTenantId,
          partyName: chq.partyName,
          type: 'PAYMENT_TO_SUPPLIER',
          amountPoisha: amount,
          description: `মহাজনের চেক ক্লিয়ারিং পেমেন্ট (চেক: ${chq.chequeNumber}, ${chq.bankName})`,
          timestamp: Date.now(),
        };
        setLedgerEntries((prev) => [entry, ...prev]);

        try {
          const voucher = EnterpriseNodeBus.createChequeClearanceVoucher({
            chequeId: chq.id,
            chequeType: 'ISSUED',
            amountPoisha: amount,
            partyName: chq.partyName,
            note: `মহাজন চেক অনার পেমেন্ট (${chq.chequeNumber})`,
          });
          recordJournalVoucher(voucher, activeTenantId);
        } catch (e) {
          console.warn('Node bus error on cheque clearance:', e);
        }

        voicebox.playSuccessChime();
        toast.success(`ইস্যুকৃত চেক ক্লিয়ার হয়েছে এবং ৳${poishaToTaka(amount)} ব্যাংক থেকে ডেবিট হয়েছে!`, { icon: '🏦' });
      }
    } else if (newStatus === 'BOUNCED') {
      toast.error(`সতর্কবার্তা: চেক বাউন্স / ডিসঅনার হয়েছে! (চেক নং: ${chq.chequeNumber})`, { icon: '⚠️' });
    }

    setCheques((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              clearedAt: newStatus === 'CLEARED' ? Date.now() : c.clearedAt,
            }
          : c
      )
    );
  };

  /**
   * 8. Godown & Chalani Management Suite
   */
  const recordGodownIntake = ({
    supplierId,
    supplierName = '',
    truckNumber = '',
    driverPhone = '',
    godownName = 'প্রধান কেন্দ্রীয় গুদাম (রুম ১)',
    rackLocation = 'র্যাক এ-১',
    items = [],
    totalAmountPoisha = 0,
    note = '',
  }) => {
    const intakeId = `intake_${Date.now()}`;

    try {
      const voucher = EnterpriseNodeBus.createGodownIntakeVoucher({
        intakeId,
        supplierId,
        totalAmountPoisha,
        truckNo: truckNumber,
        note: note || `গুদামে নতুন মাল ইনটেক (ট্রাক: ${truckNumber})`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on intake:', e);
    }

    setGodownStock((prev) => {
      let updated = [...prev];
      items.forEach((item) => {
        const existingIdx = updated.findIndex((g) => g.productId === item.productId || g.name === item.name);
        if (existingIdx >= 0) {
          const ex = updated[existingIdx];
          updated[existingIdx] = {
            ...ex,
            quantityInBaseUnit: (ex.quantityInBaseUnit || 0) + (Number(item.quantityInBaseUnit) || 0),
            bagsCount: (ex.bagsCount || 0) + (Number(item.bagsCount) || 0),
            costPriceBasePoisha: item.costPriceBasePoisha || ex.costPriceBasePoisha,
            lastIntakeDate: new Date().toISOString().slice(0, 10),
          };
        } else {
          updated.push({
            id: `gstock_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            productId: item.productId || `prod_${Date.now()}`,
            name: item.name,
            category: item.category || 'সাধারণ খাদ্যশস্য',
            baseUnit: item.baseUnit || 'কেজি',
            hasBulkUnit: !!item.hasBulkUnit,
            bulkUnitName: item.bulkUnitName || 'বস্তা',
            bulkConversionFactor: item.bulkConversionFactor || 50,
            costPriceBasePoisha: item.costPriceBasePoisha || 0,
            sellingPriceBasePoisha: item.sellingPriceBasePoisha || 0,
            bulkSellingPricePoisha: item.bulkSellingPricePoisha || 0,
            quantityInBaseUnit: Number(item.quantityInBaseUnit) || 0,
            bagsCount: Number(item.bagsCount) || 0,
            godownName: item.godownName || godownName,
            rackLocation: item.rackLocation || rackLocation,
            lastIntakeDate: new Date().toISOString().slice(0, 10),
            lowStockThreshold: 200,
          });
        }
      });
      return updated;
    });

    if (supplierId && totalAmountPoisha > 0) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === supplierId) {
            const current = s.balancePoisha || s.currentDuePoisha || 0;
            const newBal = current + totalAmountPoisha;
            return {
              ...s,
              balancePoisha: newBal,
              currentDuePoisha: newBal,
              totalPurchasesPoisha: (s.totalPurchasesPoisha || 0) + totalAmountPoisha,
            };
          }
          return s;
        })
      );
    }

    const entry = {
      id: `entry_intake_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: supplierId,
      partyName: supplierName || 'সাপ্লায়ার / মিল',
      partyType: 'SUPPLIER',
      type: 'GODOWN_INTAKE',
      amountPoisha: totalAmountPoisha,
      truckNumber,
      driverPhone,
      description: `গুদামে ট্রাক চালানে মাল জমা (${truckNumber})`,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    voicebox.playSuccessChime();
    toast.success(`গুদামে নতুন মাল সফলভাবে জমা হয়েছে! ট্রাক: ${truckNumber}`, { icon: '🚛' });
    return { success: true, intakeId };
  };

  const createDeliveryChalan = ({
    customerId,
    customerName = 'নগদ ক্রেতা',
    customerPhone = '',
    destination = '',
    vehicleType = 'পিকআপ ভ্যান',
    vehicleNumber = '',
    driverName = '',
    driverPhone = '',
    godownSource = 'প্রধান কেন্দ্রীয় গুদাম (রুম ১)',
    items = [],
    totalAmountPoisha = 0,
    isCredit = true,
    note = '',
  }) => {
    const chalanNumber = `CH-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const gatePassNumber = `GP-${Date.now().toString().slice(-4)}`;

    try {
      const voucher = EnterpriseNodeBus.createDeliveryChalanVoucher({
        chalaniNumber: chalanNumber,
        customerId,
        amountPoisha: totalAmountPoisha,
        cogsPoisha: Math.round(totalAmountPoisha * 0.85),
        isCredit,
        vehicleNumber,
        note: note || `ডেলিভারি চালান নং: ${chalanNumber}`,
      });
      recordJournalVoucher(voucher, activeTenantId);
    } catch (e) {
      console.warn('Node bus error on chalan:', e);
    }

    setGodownStock((prev) => {
      return prev.map((g) => {
        const matchingItem = items.find((i) => i.godownStockId === g.id || i.name === g.name);
        if (matchingItem) {
          const deductBase = Number(matchingItem.quantityInBaseUnit) || (Number(matchingItem.quantity) * (g.bulkConversionFactor || 1));
          const deductBags = Number(matchingItem.bagsCount) || Number(matchingItem.quantity) || 0;
          return {
            ...g,
            quantityInBaseUnit: Math.max(0, (g.quantityInBaseUnit || 0) - deductBase),
            bagsCount: Math.max(0, (g.bagsCount || 0) - deductBags),
          };
        }
        return g;
      });
    });

    if (customerId && isCredit && totalAmountPoisha > 0) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                currentDuePoisha: (c.currentDuePoisha || 0) + totalAmountPoisha,
                totalTransactionsCount: (c.totalTransactionsCount || 0) + 1,
              }
            : c
        )
      );
    }

    const newChalan = {
      id: `chalan_${Date.now()}`,
      chalanNumber,
      date: new Date().toISOString().slice(0, 10),
      receiverName: customerName,
      receiverPhone: customerPhone,
      destination,
      vehicleType,
      vehicleNumber,
      driverName,
      driverPhone,
      godownSource,
      items,
      totalBags: items.reduce((s, i) => s + (Number(i.bagsCount) || Number(i.quantity) || 0), 0),
      totalWeightKg: items.reduce((s, i) => s + (Number(i.weightKg) || Number(i.quantityInBaseUnit) || 0), 0),
      totalAmountPoisha,
      isCredit,
      status: 'IN_TRANSIT',
      gatePassNumber,
      note,
      createdAt: Date.now(),
    };
    setChalans((prev) => [newChalan, ...prev]);

    const entry = {
      id: `entry_chalan_${Date.now()}`,
      tenantId: activeTenantId,
      partyId: customerId,
      partyName: customerName,
      partyType: 'CUSTOMER',
      type: 'DELIVERY_CHALAN',
      amountPoisha: totalAmountPoisha,
      chalanNumber,
      vehicleNumber,
      description: `ডেলিভারি চালান নং: ${chalanNumber} (${customerName})`,
      timestamp: Date.now(),
    };
    setLedgerEntries((prev) => [entry, ...prev]);

    voicebox.playSuccessChime();
    toast.success(`৩-কপি ডেলিভারি চালান নং: ${chalanNumber} প্রস্তুত!`, { icon: '📄' });
    return { success: true, chalan: newChalan };
  };

  const transferGodownToShop = ({ godownStockId, targetProductId, quantityToTransfer, bagsToTransfer = 0, note = '' }) => {
    setGodownStock((prev) =>
      prev.map((g) => {
        if (g.id === godownStockId) {
          return {
            ...g,
            quantityInBaseUnit: Math.max(0, (g.quantityInBaseUnit || 0) - quantityToTransfer),
            bagsCount: Math.max(0, (g.bagsCount || 0) - bagsToTransfer),
          };
        }
        return g;
      })
    );

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === targetProductId) {
          return {
            ...p,
            currentStockInBaseUnit: (p.currentStockInBaseUnit || 0) + quantityToTransfer,
            stock: (p.stock || 0) + quantityToTransfer,
          };
        }
        return p;
      })
    );

    const transferLog = {
      id: `xfer_${Date.now()}`,
      godownStockId,
      targetProductId,
      quantityTransferred: quantityToTransfer,
      bagsTransferred: bagsToTransfer,
      note: note || 'গুদাম থেকে কাউন্টারে স্থানান্তর',
      timestamp: Date.now(),
    };
    setGodownTransfers((prev) => [transferLog, ...prev]);

    toast.success('গুদাম থেকে দোকানে মাল সফলভাবে স্থানান্তর হয়েছে!', { icon: '📦' });
    return { success: true, transferLog };
  };

  const updateChalanStatus = (chalanId, newStatus) => {
    setChalans((prev) => prev.map((c) => (c.id === chalanId ? { ...c, status: newStatus } : c)));
    toast.success(`চালান স্ট্যাটাস: ${newStatus}`, { icon: '✓' });
  };

  /**
   * Edit Godown Stock Row
   */
  const editGodownStock = (stockId, updates) => {
    setGodownStock((prev) =>
      prev.map((g) => (g.id === stockId ? { ...g, ...updates, updatedAt: Date.now() } : g))
    );
    toast.success('গুদামের স্টক তথ্য সফলভাবে আপডেট হয়েছে!', { icon: '✏️' });
  };

  /**
   * Delete Godown Stock Row
   */
  const deleteGodownStock = (stockId) => {
    setGodownStock((prev) => prev.filter((g) => g.id !== stockId));
    toast.success('গুদামের স্টক আইটেম সরানো হয়েছে!', { icon: '🗑️' });
  };

  /**
   * Void / Revert a Ledger Entry with Automatic Balance Restoration
   */
  const voidLedgerEntry = (entryId, reason = 'ভুল এন্ট্রি বাতিল') => {
    const entry = ledgerEntries.find((e) => e.id === entryId);
    if (!entry) return { success: false, message: 'এন্ট্রি পাওয়া যায়নি' };
    if (entry.isVoided) {
      toast.error('এই লেনদেনটি ইতোমধ্যে বাতিল করা হয়েছে!');
      return { success: false, message: 'ইতোমধ্যে বাতিল' };
    }

    const amount = entry.amountPoisha || 0;

    // 1. Revert customer due
    if (entry.partyType === 'CUSTOMER' || entry.partyId?.startsWith('cust_')) {
      const custId = entry.partyId;
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === custId) {
            let newDue = c.currentDuePoisha || 0;
            if (entry.type === 'CUSTOMER_PABO' || entry.type === 'PABO') {
              // Collected payment is cancelled => due increases back
              newDue += amount;
            } else if (entry.type === 'CUSTOMER_DIBO' || entry.type === 'DIBO' || entry.type === 'DELIVERY_CHALAN') {
              // Credit given is cancelled => due decreases back
              newDue = Math.max(0, newDue - amount);
            }
            return { ...c, currentDuePoisha: newDue };
          }
          return c;
        })
      );
    }

    // 2. Revert supplier balance
    if (entry.partyType === 'SUPPLIER' || entry.partyId?.startsWith('supp_')) {
      const suppId = entry.partyId;
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === suppId) {
            let bal = s.balancePoisha || s.currentDuePoisha || 0;
            if (entry.type === 'PAYMENT_TO_SUPPLIER' || entry.type === 'SUPPLIER_PAYMENT') {
              // Payment cancelled => supplier debt increases back
              bal += amount;
            } else if (entry.type === 'SUPPLIER_RETURN') {
              // Goods return cancelled => supplier debt increases back
              bal += amount;
            } else if (entry.type === 'PURCHASE_BILL' || entry.type === 'GODOWN_INTAKE') {
              // Purchase bill cancelled => supplier debt decreases
              bal = Math.max(0, bal - amount);
            }
            return { ...s, balancePoisha: bal, currentDuePoisha: bal };
          }
          return s;
        })
      );
    }

    // 3. Revert cash/bank registers
    const regId = entry.cashRegisterId || (entry.paymentMode === 'BKASH' ? 'bkash_merchant' : 'cash_drawer');
    if (['CUSTOMER_PABO', 'PABO', 'POS_SALE', 'CASH_IN'].includes(entry.type)) {
      // Inflow was received => voiding deducts it back
      setRegisters((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - amount) } : r))
      );
    } else if (['PAYMENT_TO_SUPPLIER', 'SUPPLIER_PAYMENT', 'CASH_OUT'].includes(entry.type)) {
      // Outflow was paid => voiding restores cash back to drawer/wallet
      setRegisters((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, balancePoisha: (r.balancePoisha || 0) + amount } : r))
      );
    } else if (entry.type === 'BANK_DEPOSIT') {
      // Bank deposit cancelled => deduct from bank
      setRegisters((prev) =>
        prev.map((r) => (r.id === 'bank_account' ? { ...r, balancePoisha: Math.max(0, (r.balancePoisha || 0) - amount) } : r))
      );
    }

    // 4. Mark entry as voided with timestamp & audit reason
    setLedgerEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              isVoided: true,
              voidReason: reason,
              voidedAt: Date.now(),
            }
          : e
      )
    );

    toast.success('লেনদেন সফলভাবে বাতিল ও ব্যালেন্স রিভার্স করা হয়েছে!', { icon: '↩️' });
    return { success: true };
  };

  /**
   * System Doctor & Data Health Inspector
   * Analyzes all ledger entries, customer dues, supplier payables, and registers
   */
  const runSystemDoctor = () => {
    let customerIssues = 0;
    let supplierIssues = 0;

    const customerDiscrepancies = customers.map((c) => {
      const activeEntries = ledgerEntries.filter(
        (e) => (e.partyId === c.id || (e.partyType === 'CUSTOMER' && e.partyName === c.name)) && !e.isVoided
      );
      let calculatedDue = 0;
      activeEntries.forEach((e) => {
        if (['DIBO', 'CUSTOMER_DIBO', 'SALE_DUE', 'DELIVERY_CHALAN'].includes(e.type)) {
          calculatedDue += e.amountPoisha || 0;
        } else if (['PABO', 'CUSTOMER_PABO', 'COLLECTION', 'HALKHATA_SETTLE'].includes(e.type)) {
          calculatedDue -= e.amountPoisha || 0;
        }
      });
      const delta = (c.currentDuePoisha || 0) - calculatedDue;
      const hasError = Math.abs(delta) > 0 && activeEntries.length > 0;
      if (hasError) customerIssues++;
      return { customerId: c.id, name: c.name, currentDue: c.currentDuePoisha, calculatedDue, delta, hasError };
    });

    const supplierDiscrepancies = suppliers.map((s) => {
      const activeEntries = ledgerEntries.filter(
        (e) => (e.partyId === s.id || (e.partyType === 'SUPPLIER' && e.partyName === s.name)) && !e.isVoided
      );
      let calculatedBal = 0;
      activeEntries.forEach((e) => {
        if (['PURCHASE_BILL', 'GODOWN_INTAKE', 'SUPPLIER_OPENING_BALANCE'].includes(e.type)) {
          calculatedBal += e.amountPoisha || 0;
        } else if (['PAYMENT_TO_SUPPLIER', 'SUPPLIER_PAYMENT', 'SUPPLIER_RETURN'].includes(e.type)) {
          calculatedBal -= e.amountPoisha || 0;
        }
      });
      const current = s.balancePoisha || s.currentDuePoisha || 0;
      const delta = current - calculatedBal;
      const hasError = Math.abs(delta) > 0 && activeEntries.length > 0;
      if (hasError) supplierIssues++;
      return { supplierId: s.id, name: s.name, currentBalance: current, calculatedBal, delta, hasError };
    });

    const totalAnomalies = customerIssues + supplierIssues;

    return {
      isHealthy: totalAnomalies === 0,
      totalAnomalies,
      customerIssues,
      supplierIssues,
      customerDiscrepancies: customerDiscrepancies.filter((c) => c.hasError),
      supplierDiscrepancies: supplierDiscrepancies.filter((s) => s.hasError),
      timestamp: Date.now(),
    };
  };

  /**
   * One-Click Self-Healing for Khata (Auto-Repairs and Reconciles Balances)
   */
  const autoHealLedger = () => {
    // 1. Recalculate customer balances from active ledger entries
    setCustomers((prev) =>
      prev.map((c) => {
        const activeEntries = ledgerEntries.filter(
          (e) => (e.partyId === c.id || (e.partyType === 'CUSTOMER' && e.partyName === c.name)) && !e.isVoided
        );
        if (activeEntries.length === 0) return c;
        let calculatedDue = 0;
        activeEntries.forEach((e) => {
          if (['DIBO', 'CUSTOMER_DIBO', 'SALE_DUE', 'DELIVERY_CHALAN'].includes(e.type)) {
            calculatedDue += e.amountPoisha || 0;
          } else if (['PABO', 'CUSTOMER_PABO', 'COLLECTION', 'HALKHATA_SETTLE'].includes(e.type)) {
            calculatedDue -= e.amountPoisha || 0;
          }
        });
        const finalDue = Math.max(0, calculatedDue);
        return { ...c, currentDuePoisha: finalDue };
      })
    );

    // 2. Recalculate supplier balances from active bills & payments
    setSuppliers((prev) =>
      prev.map((s) => {
        const activeEntries = ledgerEntries.filter(
          (e) => (e.partyId === s.id || (e.partyType === 'SUPPLIER' && e.partyName === s.name)) && !e.isVoided
        );
        if (activeEntries.length === 0) return s;
        let calculatedBal = 0;
        activeEntries.forEach((e) => {
          if (['PURCHASE_BILL', 'GODOWN_INTAKE', 'SUPPLIER_OPENING_BALANCE'].includes(e.type)) {
            calculatedBal += e.amountPoisha || 0;
          } else if (['PAYMENT_TO_SUPPLIER', 'SUPPLIER_PAYMENT', 'SUPPLIER_RETURN'].includes(e.type)) {
            calculatedBal -= e.amountPoisha || 0;
          }
        });
        const finalBal = Math.max(0, calculatedBal);
        return { ...s, balancePoisha: finalBal, currentDuePoisha: finalBal };
      })
    );

    voicebox.playSuccessChime();
    toast.success('সিস্টেম ডক্টর: খাতার সকল ডাটাবেজ স্বয়ংক্রিয়ভাবে অডিট ও মেরামত সম্পন্ন!', { icon: '🩺' });
    return { success: true };
  };

  /**
   * 9. Production Mode Initializer (Wipes Mock Demo Clutter for Clean Live Store)
   */
  const [isProductionMode, setIsProductionMode] = useState(() => {
    return localStorage.getItem(`ledgerx_${activeTenantId}_is_production`) === 'true';
  });

  useEffect(() => {
    setIsProductionMode(localStorage.getItem(`ledgerx_${activeTenantId}_is_production`) === 'true');
  }, [activeTenantId]);

  const startProductionMode = (openingConfig = {}) => {
    localStorage.setItem(`ledgerx_${activeTenantId}_is_production`, 'true');
    setIsProductionMode(true);

    const initialCleanRegisters = [
      { id: 'cash_drawer', name: 'নগদ ক্যাশবাক্স (Gollah)', category: 'CASH', balancePoisha: openingConfig.openingCashPoisha || 0 },
      { id: 'bkash_merchant', name: 'বিকাশ মার্চেন্ট ওয়ালেট', category: 'BKASH', balancePoisha: openingConfig.openingBkashPoisha || 0 },
      { id: 'bank_account', name: 'ব্যাংক হিসাব', category: 'BANK', balancePoisha: 0 },
    ];

    // Explicitly write clean empty state to localStorage to prevent demo seeds
    safeSetItem(`ledgerx_${activeTenantId}_customers`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_suppliers`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_products`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_invoices`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_ledger`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_cheques`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_godownStock`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_chalans`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_transfers`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_registers`, JSON.stringify(initialCleanRegisters));

    setCustomers([]);
    setSuppliers([]);
    setProducts([]);
    setInvoices([]);
    setLedgerEntries([]);
    setCheques([]);
    setGodownStock([]);
    setChalans([]);
    setGodownTransfers([]);
    setRegisters(initialCleanRegisters);

    voicebox.playSuccessChime();
    toast.success('লাইভ প্রোডাকশন মোড সক্রিয় হয়েছে! ডেমো ডাটা সম্পূর্ণ মুক্ত ক্লিন খাতা প্রস্তুত।', { icon: '🚀' });
  };

  const purgeDemoData = () => {
    startProductionMode({ openingCashPoisha: 0, openingBkashPoisha: 0 });
  };

  const resetToDemoMode = () => {
    const isStore2 = activeTenantId === 'store_002';
    const c = isStore2 ? INITIAL_CUSTOMERS_STORE_2 : INITIAL_CUSTOMERS;
    const s = isStore2 ? INITIAL_SUPPLIERS_STORE_2 : INITIAL_SUPPLIERS;
    const p = isStore2 ? INITIAL_PRODUCTS_STORE_2 : INITIAL_PRODUCTS;
    const r = isStore2 ? INITIAL_REGISTERS_STORE_2 : INITIAL_REGISTERS;
    const l = isStore2 ? INITIAL_LEDGER_ENTRIES_STORE_2 : INITIAL_LEDGER_ENTRIES;
    const ch = isStore2 ? INITIAL_CHEQUES_STORE_2 : INITIAL_CHEQUES;
    const gs = isStore2 ? INITIAL_GODOWN_STOCK_STORE_2 : INITIAL_GODOWN_STOCK;
    const cl = isStore2 ? INITIAL_CHALANS_STORE_2 : INITIAL_CHALANS;

    safeSetItem(`ledgerx_${activeTenantId}_customers`, JSON.stringify(c));
    safeSetItem(`ledgerx_${activeTenantId}_suppliers`, JSON.stringify(s));
    safeSetItem(`ledgerx_${activeTenantId}_products`, JSON.stringify(p));
    safeSetItem(`ledgerx_${activeTenantId}_registers`, JSON.stringify(r));
    safeSetItem(`ledgerx_${activeTenantId}_ledger`, JSON.stringify(l));
    safeSetItem(`ledgerx_${activeTenantId}_invoices`, JSON.stringify([]));
    safeSetItem(`ledgerx_${activeTenantId}_cheques`, JSON.stringify(ch));
    safeSetItem(`ledgerx_${activeTenantId}_godownStock`, JSON.stringify(gs));
    safeSetItem(`ledgerx_${activeTenantId}_chalans`, JSON.stringify(cl));
    safeSetItem(`ledgerx_${activeTenantId}_transfers`, JSON.stringify([]));

    setCustomers(c);
    setSuppliers(s);
    setProducts(p);
    setRegisters(r);
    setLedgerEntries(l);
    setInvoices([]);
    setCheques(ch);
    setGodownStock(gs);
    setChalans(cl);
    setGodownTransfers([]);
    localStorage.removeItem(`ledgerx_${activeTenantId}_is_production`);
    setIsProductionMode(false);
    toast('নমুনা ডেমো মোডে ফেরত যাওয়া হয়েছে।', { icon: '🔄' });
  };

  return (
    <KhataContext.Provider
      value={{
        customers,
        suppliers,
        products,
        registers,
        ledgerEntries,
        invoices,
        cheques,
        godownStock,
        chalans,
        godownTransfers,
        totalPaboPoisha,
        totalDiboPoisha,
        cashboxTotalPoisha,
        recordPabo,
        recordDibo,
        recordPOSSale,
        settleHalkhata,
        recordContainerMovement,
        // Enterprise Production APIs & Full CRUD
        addCustomer,
        editCustomer,
        deleteCustomer,
        addSupplier,
        editSupplier,
        deleteSupplier,
        recordSupplierPayment,
        recordPurchaseBill,
        recordSupplierReturn,
        addProduct,
        editProduct,
        deleteProduct,
        addProductBatch,
        updateProductPrice,
        loadIndustryCatalog,
        mergeIndustryCatalog,
        cashboxPoisha: cashboxTotalPoisha,
        recordCashIn,
        recordCashOut,
        transferCash,
        addBankAccount,
        addMfsWallet,
        editRegister,
        deleteRegister,
        addCheque,
        updateChequeStatus,
        voidLedgerEntry,
        // Godown & Chalani Suite
        recordGodownIntake,
        createDeliveryChalan,
        transferGodownToShop,
        updateChalanStatus,
        editGodownStock,
        deleteGodownStock,
        isProductionMode,
        startProductionMode,
        purgeDemoData,
        resetToDemoMode,
        runSystemDoctor,
        autoHealLedger,
        recordCashAdjustment,
        getJournalVouchers: () => getJournalVouchers(activeTenantId),
        halkhataCampaign,
        updateHalkhataCampaign,
        archiveLedgerRollups,
      }}
    >
      {children}
    </KhataContext.Provider>
  );
};

export const useKhata = () => {
  const context = useContext(KhataContext);
  if (!context) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
};
