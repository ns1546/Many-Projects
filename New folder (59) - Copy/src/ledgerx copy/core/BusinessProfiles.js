/**
 * LedgerX Multi-Industry Business Profiles for Bangladesh
 * Covers all major SME and wholesale sectors across Bangladesh:
 * 1. COMMODITY_GRAIN: চালের আড়ত, ডাল, গম ও পাইকারি খাদ্যশস্য (Bags/Kg, Tare weight deduction, Truck Challan, Arat commission)
 * 2. PHARMACY: ফার্মেসি ও ড্রাগ স্টোর (Batch/Lot, FEFO expiry alert, Generic names, Strip/Box conversion)
 * 3. ELECTRONICS_MOBILE: মোবাইল, কম্পিউটার ও ইলেকট্রনিক্স (IMEI/Serial tracking, Warranty cards, EMI installment khata)
 * 4. ROD_CEMENT_HARDWARE: রড, সিমেন্ট ও কনস্ট্রাকশন সামগ্রী (Ton, Bundle, CFT, Weighbridge scale slips, Site delivery)
 * 5. FASHION_APPAREL: গার্মেন্টস, বুটিক ও জুতো (Size & Color matrix, Barcode tags, Seasonal collections)
 * 6. GENERAL_RETAIL: মুদি দোকান ও সুপারশপ (Fast barcode POS, Loose weight by Kg/Gram, Quick cash change)
 * 7. RESTAURANT_CAFE: রেস্তোরাঁ ও হোটেল (Table Dine-in/Parcel, Kitchen Order Ticket KOT, VAT & Service Charge)
 */

export const BUSINESS_TYPES = {
  HYBRID_DEPARTMENTAL: 'HYBRID_DEPARTMENTAL',
  COMMODITY_GRAIN: 'COMMODITY_GRAIN',
  PHARMACY: 'PHARMACY',
  ELECTRONICS_MOBILE: 'ELECTRONICS_MOBILE',
  ROD_CEMENT_HARDWARE: 'ROD_CEMENT_HARDWARE',
  FASHION_APPAREL: 'FASHION_APPAREL',
  GENERAL_RETAIL: 'GENERAL_RETAIL',
  RESTAURANT_CAFE: 'RESTAURANT_CAFE',
  OPTICS: 'OPTICS',
};

export const BUSINESS_PROFILES = {
  HYBRID_DEPARTMENTAL: {
    id: 'HYBRID_DEPARTMENTAL',
    nameBn: 'হাইব্রিড সুপারশপ ও ডিপার্টমেন্টাল স্টোর',
    nameEn: 'Hybrid Super Shop & Multi-Department',
    icon: 'Store',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    descriptionBn: 'ওষুধ, চাল-মুদি, কাঁচাবাজার, পোশাক, প্রসাধন ও গ্যাজেট—সকল বিভাগের পণ্য একসাথে বিক্রয় ও সমন্বিত ক্যাশ কাউন্টার',
    primaryUnits: ['পিস', 'কেজি', 'পাতা (Strip)', 'বক্স (Box)', 'বস্তা', 'লিটার', 'সেট'],
    features: {
      isHybrid: true,
      hasDualUnit: true,
      defaultBaseUnit: 'পিস',
      hasTareWeightDeduction: true,
      hasTruckChalani: true,
      hasAratCommission: true,
      hasBatchExpiry: true,
      hasGenericSearch: true,
      hasIMEITracking: true,
      hasSizeColorMatrix: true,
      hasWeighableScale: true,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'hyb_01',
        sku: 'MED-NAPA-EX',
        name: 'নাপা এক্সট্রা ৫০০+৬৫ মি.গ্রা. (Napa Extra)',
        genericName: 'Paracetamol + Caffeine',
        category: 'ওষুধ ও ফার্মেসী',
        department: 'PHARMACY',
        baseUnit: 'পাতা',
        hasBulkUnit: true,
        bulkUnitName: 'বক্স',
        bulkConversionFactor: 20,
        costPriceBasePoisha: 2200,
        sellingPriceBasePoisha: 2500,
        bulkSellingPricePoisha: 48000,
        currentStockInBaseUnit: 180,
        stock: 180,
        batchNumber: 'BEX-2026A',
        expiryDate: '12/2027',
        hotkey: '1',
      },
      {
        id: 'hyb_02',
        sku: 'RICE-MINIKET-KG',
        name: 'কুষ্টিয়া প্রিমিয়াম মিনিকেট চাল (খোলা)',
        category: 'চাল ও খাদ্যশস্য',
        department: 'COMMODITY_GRAIN',
        baseUnit: 'কেজি',
        isWeighable: true,
        hasBulkUnit: true,
        bulkUnitName: 'বস্তা',
        bulkConversionFactor: 50,
        costPriceBasePoisha: 7200,
        sellingPriceBasePoisha: 7800,
        bulkSellingPricePoisha: 385000,
        currentStockInBaseUnit: 500,
        stock: 500,
        hotkey: '2',
      },
      {
        id: 'hyb_03',
        sku: 'FMCG-DOVE-100',
        name: 'ডোভ বিউটি ময়েশ্চারাইজিং বার সাবান ১০০ গ্রাম',
        category: 'কসমেটিক্স ও প্রসাধন',
        department: 'GENERAL_RETAIL',
        baseUnit: 'পিস',
        costPriceBasePoisha: 11000,
        sellingPriceBasePoisha: 13500,
        currentStockInBaseUnit: 80,
        stock: 80,
        hotkey: '3',
      },
      {
        id: 'hyb_04',
        sku: 'ELEC-SAMS-25W',
        name: 'স্যামসাং অরিজিনাল টাইপ-সি ফাস্ট চার্জার ২৫ ওয়াট',
        category: 'ইলেকট্রনিক্স ও গ্যাজেট',
        department: 'ELECTRONICS_MOBILE',
        baseUnit: 'পিস',
        warrantyPeriodMonths: 6,
        costPriceBasePoisha: 120000,
        sellingPriceBasePoisha: 165000,
        currentStockInBaseUnit: 25,
        stock: 25,
        hotkey: '4',
      },
    ],
  },
  COMMODITY_GRAIN: {
    id: 'COMMODITY_GRAIN',
    nameBn: 'চালের আড়ত ও পাইকারি খাদ্যশস্য মোকাম',
    nameEn: 'Grain & Commodity Wholesale Arat',
    icon: 'Wheat',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    descriptionBn: 'বস্তা ও কেজি দ্বৈত একক, খালি বস্তার ওজন কর্তন (Tare Deduction), ট্রাক ডেলিভারি চালান ও আড়ত কমিশন খাতা',
    primaryUnits: ['বস্তা', 'কেজি', 'মণ', 'কুইন্টাল', 'টন'],
    features: {
      hasDualUnit: true,
      defaultBulkUnit: 'বস্তা',
      defaultBaseUnit: 'কেজি',
      hasTareWeightDeduction: true,
      hasTruckChalani: true,
      hasAratCommission: true,
      hasBatchExpiry: false,
      hasIMEITracking: false,
      hasSizeColorMatrix: false,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'grain_01',
        sku: 'RICE-MINIKET-50',
        name: 'কুষ্টিয়া স্পেশাল মিনিকেট চাল ৫০কেজি বস্তা',
        category: 'চাল ও আড়ত',
        baseUnit: 'কেজি',
        hasBulkUnit: true,
        bulkUnitName: 'বস্তা',
        bulkConversionFactor: 50,
        costPriceBasePoisha: 7200,
        sellingPriceBasePoisha: 7900,
        bulkSellingPricePoisha: 390000,
        currentStockInBaseUnit: 5000, // 100 bags
        stock: 5000,
        lowStockAlertThreshold: 1000,
        hotkey: '1',
      },
      {
        id: 'grain_02',
        sku: 'RICE-NAZIR-50',
        name: 'দিনাজপুর প্রিমিয়াম নাজিরশাইল চাল ৫০কেজি বস্তা',
        category: 'চাল ও আড়ত',
        baseUnit: 'কেজি',
        hasBulkUnit: true,
        bulkUnitName: 'বস্তা',
        bulkConversionFactor: 50,
        costPriceBasePoisha: 8100,
        sellingPriceBasePoisha: 8800,
        bulkSellingPricePoisha: 435000,
        currentStockInBaseUnit: 3500, // 70 bags
        stock: 3500,
        lowStockAlertThreshold: 800,
        hotkey: '2',
      },
      {
        id: 'grain_03',
        sku: 'PULSE-MOSUR-50',
        name: 'অস্ট্রেলিয়ান মসুর ডাল (বড় দানা) ৫০কেজি বস্তা',
        category: 'ডাল ও খাদ্যশস্য',
        baseUnit: 'কেজি',
        hasBulkUnit: true,
        bulkUnitName: 'বস্তা',
        bulkConversionFactor: 50,
        costPriceBasePoisha: 12500,
        sellingPriceBasePoisha: 13500,
        bulkSellingPricePoisha: 670000,
        currentStockInBaseUnit: 2000,
        stock: 2000,
        lowStockAlertThreshold: 500,
        hotkey: '3',
      },
    ],
  },

  PHARMACY: {
    id: 'PHARMACY',
    nameBn: 'ফার্মেসি ও ড্রাগ স্টোর',
    nameEn: 'Pharmacy & Healthcare',
    icon: 'Pill',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    descriptionBn: 'ওষুধের ব্যাচ ট্র্যাকিং, এফইএফও (FEFO) মেয়াদোত্তীর্ণ এলার্ট, জেনেরিক নাম অনুসন্ধান, পাতা ও বক্স হিসাব এবং প্রেসক্রিপশন নোট',
    primaryUnits: ['পাতা (Strip)', 'বক্স (Box)', 'ফাইল/শিশি (Bottle)', 'পিস (Pcs)'],
    features: {
      hasDualUnit: true,
      defaultBulkUnit: 'বক্স',
      defaultBaseUnit: 'পাতা',
      hasTareWeightDeduction: false,
      hasTruckChalani: false,
      hasAratCommission: false,
      hasBatchExpiry: true,
      hasGenericSearch: true,
      hasIMEITracking: false,
      hasSizeColorMatrix: false,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'med_01',
        sku: 'MED-NAPA-EX',
        name: 'নাপা এক্সট্রা ৫০০+৬৫ মি.গ্রা. (Napa Extra)',
        genericName: 'Paracetamol + Caffeine',
        manufacturer: 'বেক্সিমকো ফার্মা',
        category: 'পেইনকিলার ও জ্বর',
        baseUnit: 'পাতা',
        hasBulkUnit: true,
        bulkUnitName: 'বক্স',
        bulkConversionFactor: 20, // 20 strips per box
        costPriceBasePoisha: 2200, // ৳ 22/strip
        sellingPriceBasePoisha: 2500, // ৳ 25/strip
        bulkSellingPricePoisha: 48000, // ৳ 480/box
        currentStockInBaseUnit: 180,
        stock: 180,
        batchNumber: 'BEX-2026A',
        expiryDate: '12/2027',
        isNearExpiry: false,
        hotkey: '1',
      },
      {
        id: 'med_02',
        sku: 'MED-MAXPRO-20',
        name: 'ম্যাক্সপ্রো ২০ মি.গ্রা. (Maxpro 20mg)',
        genericName: 'Esomeprazole Magnesium',
        manufacturer: 'রেনেক্সা / স্কয়ার ফার্মা',
        category: 'গ্যাস্ট্রিক ও আলসার',
        baseUnit: 'পাতা',
        hasBulkUnit: true,
        bulkUnitName: 'বক্স',
        bulkConversionFactor: 10,
        costPriceBasePoisha: 6300, // ৳ 63/strip
        sellingPriceBasePoisha: 7000, // ৳ 70/strip
        bulkSellingPricePoisha: 68000,
        currentStockInBaseUnit: 120,
        stock: 120,
        batchNumber: 'SQ-9910',
        expiryDate: '06/2028',
        isNearExpiry: false,
        hotkey: '2',
      },
      {
        id: 'med_03',
        sku: 'MED-CEF-3',
        name: 'সেফ-৩ ২০০ মি.গ্রা. ক্যাপসুল (Cef-3)',
        genericName: 'Cefixime Trihydrate',
        manufacturer: 'স্কয়ার ফার্মাসিউটিক্যালস',
        category: 'অ্যান্টিবায়োটিক',
        baseUnit: 'পাতা',
        hasBulkUnit: true,
        bulkUnitName: 'বক্স',
        bulkConversionFactor: 2,
        costPriceBasePoisha: 28000, // ৳ 280/strip
        sellingPriceBasePoisha: 31000, // ৳ 310/strip
        bulkSellingPricePoisha: 60000,
        currentStockInBaseUnit: 45,
        stock: 45,
        batchNumber: 'SQ-4411',
        expiryDate: '10/2026', // Near expiry warning
        isNearExpiry: true,
        hotkey: '3',
      },
    ],
  },

  ELECTRONICS_MOBILE: {
    id: 'ELECTRONICS_MOBILE',
    nameBn: 'মোবাইল, কম্পিউটার ও ইলেকট্রনিক্স শো-রুম',
    nameEn: 'Electronics, Mobile & Appliances',
    icon: 'Smartphone',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    descriptionBn: 'প্রতিটি সেটের জন্য আইএমইআই (IMEI) ও সিরিয়াল ট্র্যাকিং, ওয়ারেন্টি কার্ড প্রিন্টিং ও মাসিক কিস্তি (EMI) খাতা',
    primaryUnits: ['পিস (Piece)', 'সেট (Set)'],
    features: {
      hasDualUnit: false,
      defaultBaseUnit: 'পিস',
      hasTareWeightDeduction: false,
      hasTruckChalani: false,
      hasAratCommission: false,
      hasBatchExpiry: false,
      hasIMEITracking: true,
      hasWarrantyTracking: true,
      hasInstallmentKhata: true,
      hasSizeColorMatrix: false,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'elec_01',
        sku: 'MOB-SAMS-A15',
        name: 'স্যামসাং গ্যালাক্সি A15 (8/128GB)',
        category: 'স্মার্টফোন',
        brand: 'Samsung',
        baseUnit: 'পিস',
        costPriceBasePoisha: 1950000, // ৳ 19,500
        sellingPriceBasePoisha: 2200000, // ৳ 22,000
        currentStockInBaseUnit: 12,
        stock: 12,
        warrantyPeriodMonths: 12,
        imeiList: ['864910051283910', '864910051283911', '864910051283912'],
        hotkey: '1',
      },
      {
        id: 'elec_02',
        sku: 'MOB-XIAOMI-13C',
        name: 'রেডমি ১৩সি (Redmi 13C 6/128GB)',
        category: 'স্মার্টফোন',
        brand: 'Xiaomi',
        baseUnit: 'পিস',
        costPriceBasePoisha: 1350000, // ৳ 13,500
        sellingPriceBasePoisha: 1550000, // ৳ 15,500
        currentStockInBaseUnit: 18,
        stock: 18,
        warrantyPeriodMonths: 12,
        imeiList: ['863102048991201', '863102048991202'],
        hotkey: '2',
      },
      {
        id: 'elec_03',
        sku: 'ACC-FAST-CHARGER',
        name: 'অরিজিনাল টাইপ-সি ৩৩ ওয়াট ফাস্ট চার্জার',
        category: 'মোবাইল এক্সেসরিজ',
        brand: 'Baseus',
        baseUnit: 'পিস',
        costPriceBasePoisha: 85000, // ৳ 850
        sellingPriceBasePoisha: 125000, // ৳ 1,250
        currentStockInBaseUnit: 35,
        stock: 35,
        warrantyPeriodMonths: 6,
        hotkey: '3',
      },
    ],
  },

  ROD_CEMENT_HARDWARE: {
    id: 'ROD_CEMENT_HARDWARE',
    nameBn: 'রড, সিমেন্ট ও কনস্ট্রাকশন সামগ্রী',
    nameEn: 'Rod, Cement & Building Hardware',
    icon: 'Hammer',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
    descriptionBn: 'টন, বান্ডিল ও ঘনফুট (CFT) একক, স্কেল ওজন স্লিপ (Weighbridge Slip), মিল টেস্ট সার্টিফিকেট ও সাইট ডেলিভারি চালান',
    primaryUnits: ['টন (Ton)', 'বান্ডিল (Bundle)', 'ব্যাগ (Bag)', 'সিএফটি (CFT)', 'পিস (Pcs)'],
    features: {
      hasDualUnit: true,
      defaultBulkUnit: 'টন',
      defaultBaseUnit: 'কেজি',
      hasTareWeightDeduction: true,
      hasTruckChalani: true,
      hasSiteDelivery: true,
      hasWeighbridgeSlip: true,
      hasBatchExpiry: false,
      hasIMEITracking: false,
      hasSizeColorMatrix: false,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'rod_01',
        sku: 'ROD-BSRM-60G-12',
        name: 'বিএসআরএম ৫০০ ডব্লিউ ১২ মিমি রড (BSRM 12mm)',
        category: 'এম এস রড',
        baseUnit: 'কেজি',
        hasBulkUnit: true,
        bulkUnitName: 'টন',
        bulkConversionFactor: 1000,
        costPriceBasePoisha: 9100, // ৳ 91/kg -> ৳ 91,000/ton
        sellingPriceBasePoisha: 9700, // ৳ 97/kg -> ৳ 97,000/ton
        bulkSellingPricePoisha: 9650000,
        currentStockInBaseUnit: 18000, // 18 tons
        stock: 18000,
        lowStockAlertThreshold: 3000,
        hotkey: '1',
      },
      {
        id: 'cem_01',
        sku: 'CEM-SHAH-SPEC',
        name: 'শাহ স্পেশাল সিমেন্ট ৫০কেজি ব্যাগ (Shah Cement)',
        category: 'সিমেন্ট',
        baseUnit: 'ব্যাগ',
        costPriceBasePoisha: 51000, // ৳ 510/bag
        sellingPriceBasePoisha: 56000, // ৳ 560/bag
        currentStockInBaseUnit: 450, // 450 bags
        stock: 450,
        lowStockAlertThreshold: 100,
        hotkey: '2',
      },
      {
        id: 'sand_01',
        sku: 'SAND-SYLHET-CFT',
        name: 'সিলেট লাল বালু (Sylhet Sand 2.5 FM)',
        category: 'বালু ও পাথর',
        baseUnit: 'সিএফটি',
        costPriceBasePoisha: 5500, // ৳ 55/cft
        sellingPriceBasePoisha: 6800, // ৳ 68/cft
        currentStockInBaseUnit: 3500, // 3,500 cft
        stock: 3500,
        hotkey: '3',
      },
    ],
  },

  FASHION_APPAREL: {
    id: 'FASHION_APPAREL',
    nameBn: 'গার্মেন্টস, ফ্যাশন ও জুতার দোকান',
    nameEn: 'Fashion, Garments & Footwear',
    icon: 'Shirt',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-300',
    descriptionBn: 'সাইজ ও কালার ভ্যারিয়েন্ট মেট্রিক্স, বারকোড ট্যাগ প্রিন্টিং, সিজনাল ফ্যাশন কালেকশন ও এক্সচেঞ্জ ট্র্যাকিং',
    primaryUnits: ['পিস (Piece)', 'জোড়া (Pair)', 'সেট (Set)'],
    features: {
      hasDualUnit: false,
      defaultBaseUnit: 'পিস',
      hasTareWeightDeduction: false,
      hasTruckChalani: false,
      hasAratCommission: false,
      hasBatchExpiry: false,
      hasIMEITracking: false,
      hasSizeColorMatrix: true,
      hasBarcodeTagPrinting: true,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'fash_01',
        sku: 'FSH-PANJABI-COT',
        name: 'এক্সক্লুসিভ সুতি ডিজিটাল প্রিন্ট পাঞ্জাবি',
        category: 'পুরুষের পোশাক',
        baseUnit: 'পিস',
        costPriceBasePoisha: 120000, // ৳ 1,200
        sellingPriceBasePoisha: 185000, // ৳ 1,850
        currentStockInBaseUnit: 48,
        stock: 48,
        availableSizes: ['M', 'L', 'XL', 'XXL'],
        availableColors: ['সাদা', 'মেরুন', 'নেভি ব্লু', 'অলিভ'],
        hotkey: '1',
      },
      {
        id: 'fash_02',
        sku: 'FSH-POLO-PK',
        name: 'প্রিমিয়াম পিকে কটন পোলো শার্ট',
        category: 'টি-শার্ট ও পোলো',
        baseUnit: 'পিস',
        costPriceBasePoisha: 45000, // ৳ 450
        sellingPriceBasePoisha: 75000, // ৳ 750
        currentStockInBaseUnit: 75,
        stock: 75,
        availableSizes: ['S', 'M', 'L', 'XL'],
        availableColors: ['কালো', 'রয়্যাল ব্লু', 'ছাই'],
        hotkey: '2',
      },
      {
        id: 'fash_03',
        sku: 'FSH-SHOE-OXFORD',
        name: 'অরিজিনাল লেদার অক্সফোর্ড ফরমাল সু',
        category: 'জুতো ও স্যান্ডেল',
        baseUnit: 'জোড়া',
        costPriceBasePoisha: 180000, // ৳ 1,800
        sellingPriceBasePoisha: 275000, // ৳ 2,750
        currentStockInBaseUnit: 22,
        stock: 22,
        availableSizes: ['40', '41', '42', '43'],
        availableColors: ['কালো', 'চকলেট ব্রাউন'],
        hotkey: '3',
      },
    ],
  },

  GENERAL_RETAIL: {
    id: 'GENERAL_RETAIL',
    nameBn: 'মুদি দোকান, ডিপার্টমেন্টাল ও সুপারশপ',
    nameEn: 'Grocery, Superstore & General Retail',
    icon: 'ShoppingCart',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    descriptionBn: 'দ্রুত বারকোড স্ক্যানার পিওএস, খোলা ও প্যাকেটজাত পণ্য, ক্যাশ ড্রয়ার চেঞ্জ হিসাব এবং বাকির কাস্টমার খাতা',
    primaryUnits: ['কেজি', 'গ্রাম', 'প্যাকেট', 'লিটার', 'পিস', 'ডজন'],
    features: {
      hasDualUnit: true,
      defaultBulkUnit: 'কার্টন',
      defaultBaseUnit: 'প্যাকেট',
      hasTareWeightDeduction: false,
      hasTruckChalani: false,
      hasAratCommission: false,
      hasBatchExpiry: false,
      hasIMEITracking: false,
      hasSizeColorMatrix: false,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'groc_01',
        sku: 'GROC-OIL-TEER-5L',
        name: 'তীর ফর্টিফাইড সয়াবিন তেল ৫ লিটার',
        category: 'তেল ও ঘি',
        baseUnit: 'বোতল',
        costPriceBasePoisha: 79000, // ৳ 790
        sellingPriceBasePoisha: 84000, // ৳ 840
        currentStockInBaseUnit: 30,
        stock: 30,
        lowStockAlertThreshold: 8,
        hotkey: '1',
      },
      {
        id: 'groc_02',
        sku: 'GROC-SUGAR-1KG',
        name: 'ফ্রেশ সাদা চিনি ১ কেজি প্যাকেট',
        category: 'নিত্যপ্রয়োজনীয়',
        baseUnit: 'প্যাকেট',
        costPriceBasePoisha: 13200, // ৳ 132
        sellingPriceBasePoisha: 14500, // ৳ 145
        currentStockInBaseUnit: 120,
        stock: 120,
        lowStockAlertThreshold: 20,
        hotkey: '2',
      },
      {
        id: 'groc_03',
        sku: 'GROC-SOAP-LUX',
        name: 'লাক্স বিউটি সাবান ১০০ গ্রাম',
        category: 'টয়লেট্রিজ',
        baseUnit: 'পিস',
        costPriceBasePoisha: 6500, // ৳ 65
        sellingPriceBasePoisha: 7500, // ৳ 75
        currentStockInBaseUnit: 90,
        stock: 90,
        lowStockAlertThreshold: 15,
        hotkey: '3',
      },
    ],
  },

  RESTAURANT_CAFE: {
    id: 'RESTAURANT_CAFE',
    nameBn: 'রেস্তোরাঁ, ক্যাফে ও ফাস্টফুড',
    nameEn: 'Restaurant, Café & Food Service',
    icon: 'Utensils',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    descriptionBn: 'ডাইন-ইন টেবিল ট্র্যাকিং, পার্সেল ও টেকঅ্যাওয়ে, কিচেন অর্ডার টিকিট (KOT), এনবিআর ভ্যাট ও সার্ভিস চার্জ হিসাব',
    primaryUnits: ['প্লেট', 'বোল', 'কাপ', 'পিস'],
    features: {
      hasDualUnit: false,
      defaultBaseUnit: 'প্লেট',
      hasTareWeightDeduction: false,
      hasTruckChalani: false,
      hasAratCommission: false,
      hasBatchExpiry: false,
      hasIMEITracking: false,
      hasSizeColorMatrix: false,
      hasKOT: true,
      hasTableTracking: true,
      hasServiceCharge: true,
    },
    demoProducts: [
      {
        id: 'rest_01',
        sku: 'FOOD-KACHI-FULL',
        name: 'স্পেশাল মাটন কাচ্চি বিরিয়ানি (বাসমতী)',
        category: 'বিরিয়ানি ও পোলাও',
        baseUnit: 'প্লেট',
        costPriceBasePoisha: 28000, // ৳ 280
        sellingPriceBasePoisha: 42000, // ৳ 420
        currentStockInBaseUnit: 50,
        stock: 50,
        hotkey: '1',
      },
      {
        id: 'rest_02',
        sku: 'FOOD-CHICKEN-CHAAP',
        name: 'স্পেশাল চিকেন চাপ + লুচি (২ পিস)',
        category: 'চাপ ও কাবার',
        baseUnit: 'প্লেট',
        costPriceBasePoisha: 12000, // ৳ 120
        sellingPriceBasePoisha: 19000, // ৳ 190
        currentStockInBaseUnit: 40,
        stock: 40,
        hotkey: '2',
      },
      {
        id: 'rest_03',
        sku: 'FOOD-BORHANI-250',
        name: 'ঐতিহ্যবাহী পুরান ঢাকার স্পেশাল বোরহানি',
        category: 'পানীয় ও ডেজার্ট',
        baseUnit: 'গ্লাস',
        costPriceBasePoisha: 4000, // ৳ 40
        sellingPriceBasePoisha: 7000, // ৳ 70
        currentStockInBaseUnit: 80,
        stock: 80,
        hotkey: '3',
      },
    ],
  },

  OPTICS: {
    id: 'OPTICS',
    nameBn: 'চশমা ও অপটিক্যালস আই কেয়ার',
    nameEn: 'Optics, Eyewear & Vision Care',
    title_bn: 'চশমা ও অপটিক্যালস',
    icon: 'Glasses',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    descriptionBn: 'চশমার ফ্রেম ও লেন্স ইনভেন্টরি, পাওয়ার প্রেসক্রিপশন খাতা (OD/OS: SPH, CYL, AXIS, ADD, PD) এবং স্বয়ংক্রিয় ৬ মাসের লেন্স চেকআপ তাগাদা',
    primaryUnits: ['পিস (Piece)', 'জোড়া (Pair)', 'সেট (Set)'],
    features: {
      hasDualUnit: false,
      defaultBaseUnit: 'পিস',
      hasTareWeightDeduction: false,
      hasTruckChalani: false,
      hasAratCommission: false,
      hasBatchExpiry: false,
      hasIMEITracking: false,
      hasSizeColorMatrix: false,
      hasPrescriptionKhata: true,
      hasSixMonthReminder: true,
      hasKOT: false,
    },
    demoProducts: [
      {
        id: 'opt_01',
        sku: 'OPT-FRM-TITAN-01',
        name: 'টাইটানিয়াম রিমলেস লাইটওয়েট ফ্রেম (Gunmetal Grey)',
        category: 'চশমার ফ্রেম',
        brand: 'Titan Eyewear',
        baseUnit: 'পিস',
        costPriceBasePoisha: 120000, // ৳ 1,200
        sellingPriceBasePoisha: 240000, // ৳ 2,400
        currentStockInBaseUnit: 18,
        stock: 18,
        frameType: 'Rimless',
        material: 'Pure Titanium',
        warrantyPeriodMonths: 12,
        hotkey: '1',
      },
      {
        id: 'opt_02',
        sku: 'OPT-LNS-BLU-156',
        name: 'ব্লু কাট ইউভি৪২০ কম্পিউটার লেন্স ১.৫৬ (Blue Cut HMC)',
        category: 'চশমার লেন্স',
        brand: 'Essilor / Crizal',
        baseUnit: 'জোড়া',
        costPriceBasePoisha: 65000, // ৳ 650
        sellingPriceBasePoisha: 150000, // ৳ 1,500
        currentStockInBaseUnit: 40,
        stock: 40,
        lensIndex: '1.56',
        coating: 'Anti-Glare Blue Cut UV420',
        hotkey: '2',
      },
      {
        id: 'opt_03',
        sku: 'OPT-FRM-TR90-MAT',
        name: 'টিআর৯০ আনব্রেকেবল ম্যাট ব্ল্যাক ফ্রেম (TR90 Matte)',
        category: 'চশমার ফ্রেম',
        brand: 'Ray-Ban Optics',
        baseUnit: 'পিস',
        costPriceBasePoisha: 75000, // ৳ 750
        sellingPriceBasePoisha: 165000, // ৳ 1,650
        currentStockInBaseUnit: 25,
        stock: 25,
        frameType: 'Full Rim',
        material: 'TR90 Swiss Material',
        hotkey: '3',
      },
      {
        id: 'opt_04',
        sku: 'OPT-LNS-PROG-161',
        name: 'ডিজিটাল প্রগ্রেসিভ মাল্টিফোকাল লেন্স ১.৬১ (Progressive Lens)',
        category: 'চশমার লেন্স',
        brand: 'Kodak Lens',
        baseUnit: 'জোড়া',
        costPriceBasePoisha: 180000, // ৳ 1,800
        sellingPriceBasePoisha: 380000, // ৳ 3,800
        currentStockInBaseUnit: 15,
        stock: 15,
        lensIndex: '1.61 Hi-Index',
        coating: 'Super Hydrophobic AR',
        hotkey: '4',
      },
      {
        id: 'opt_05',
        sku: 'OPT-LNS-PHOTO-BRN',
        name: 'ফটোক্রোমিক সান-সেন্সর লেন্স (Fast Transition Grey/Brown)',
        category: 'চশমার লেন্স',
        brand: 'Transitions Signature',
        baseUnit: 'জোড়া',
        costPriceBasePoisha: 110000, // ৳ 1,100
        sellingPriceBasePoisha: 220000, // ৳ 2,200
        currentStockInBaseUnit: 22,
        stock: 22,
        lensIndex: '1.56',
        coating: 'Photochromic UV400',
      },
      {
        id: 'opt_06',
        sku: 'OPT-SUN-POLAR-01',
        name: 'অরিজিনাল পোলারাইজড ইউভি সানগ্লাস (Aviator Classic)',
        category: 'রোদচশমা ও সানগ্লাস',
        brand: 'Polaroid Eyewear',
        baseUnit: 'পিস',
        costPriceBasePoisha: 95000, // ৳ 950
        sellingPriceBasePoisha: 195000, // ৳ 1,950
        currentStockInBaseUnit: 14,
        stock: 14,
        lensType: 'Polarized TAC UV400',
      },
      {
        id: 'opt_07',
        sku: 'OPT-KIT-CLEAN-60',
        name: 'অ্যান্টি-ফগ লেন্স ক্লিনার স্প্রে ৬০মিলি + মাইক্রোফাইবার ক্লথ',
        category: 'আই কেয়ার এক্সেসরিজ',
        brand: 'OptiCare',
        baseUnit: 'সেট',
        costPriceBasePoisha: 8500, // ৳ 85
        sellingPriceBasePoisha: 18000, // ৳ 180
        currentStockInBaseUnit: 50,
        stock: 50,
      },
    ],
  },
};

/**
 * Returns helper profile data with fallback
 */
export function getBusinessProfile(typeKey = 'GENERAL_RETAIL') {
  return BUSINESS_PROFILES[typeKey] || BUSINESS_PROFILES.GENERAL_RETAIL;
}
