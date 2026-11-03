/**
 * Enterprise Chart of Accounts (COA) & Account Master Registry
 * Standardized 5-Class GAAP / IFRS Compliant Accounting Tree
 * Scaled Integer Poisha Representation (100 Poisha = 1 BDT)
 */

export const ACCOUNT_CLASSES = {
  ASSET: 'ASSET',         // Normal Balance: DEBIT (+)
  LIABILITY: 'LIABILITY', // Normal Balance: CREDIT (+)
  EQUITY: 'EQUITY',       // Normal Balance: CREDIT (+)
  REVENUE: 'REVENUE',     // Normal Balance: CREDIT (+)
  EXPENSE: 'EXPENSE',     // Normal Balance: DEBIT (+)
};

export const CHART_OF_ACCOUNTS = {
  // ─── 1000: ASSETS (সম্পদ) ──────────────────────────────────────────────────
  '1010': {
    code: '1010',
    class: ACCOUNT_CLASSES.ASSET,
    nameBn: 'কাউন্টার নগদ ক্যাশবাক্স',
    nameEn: 'Cash in Hand (Counter Drawer)',
    normalBalance: 'DEBIT',
    description: 'Physical cash available in cashier register',
  },
  '1020': {
    code: '1020',
    class: ACCOUNT_CLASSES.ASSET,
    nameBn: 'বিকাশ মার্চেন্ট ওয়ালেট',
    nameEn: 'bKash Merchant Wallet',
    normalBalance: 'DEBIT',
    description: 'Digital MFS merchant float',
  },
  '1030': {
    code: '1030',
    class: ACCOUNT_CLASSES.ASSET,
    nameBn: 'ব্যাংক হিসাব স্থিতি',
    nameEn: 'Bank Accounts Deposit',
    normalBalance: 'DEBIT',
    description: 'Commercial bank checking & current accounts',
  },
  '1100': {
    code: '1100',
    class: ACCOUNT_CLASSES.ASSET,
    nameBn: 'গ্রাহক বাকি খাতা (পাবো)',
    nameEn: 'Accounts Receivable (Customer Dues)',
    normalBalance: 'DEBIT',
    description: 'Customer credit debt owed to the business',
  },
  '1200': {
    code: '1200',
    class: ACCOUNT_CLASSES.ASSET,
    nameBn: 'পণ্যের মজুদ সম্পদ (ইনভেন্টরি)',
    nameEn: 'Merchandise Inventory Asset',
    normalBalance: 'DEBIT',
    description: 'Valuation of all physical goods in Godown and Shop',
  },

  // ─── 2000: LIABILITIES (দায়) ────────────────────────────────────────────────
  '2010': {
    code: '2010',
    class: ACCOUNT_CLASSES.LIABILITY,
    nameBn: 'মহাজন পাওনা খাতা (দিবো)',
    nameEn: 'Accounts Payable (Supplier Debt)',
    normalBalance: 'CREDIT',
    description: 'Outstanding invoices owed to millers, dealers, and suppliers',
  },
  '2020': {
    code: '2020',
    class: ACCOUNT_CLASSES.LIABILITY,
    nameBn: 'গ্রাহক অগ্রিম জমা',
    nameEn: 'Customer Advance Deposits',
    normalBalance: 'CREDIT',
    description: 'Advance cash received before delivery',
  },
  '2030': {
    code: '2030',
    class: ACCOUNT_CLASSES.LIABILITY,
    nameBn: 'ভ্যাট ও সরকারি কর (মূসক ৬.৩)',
    nameEn: 'VAT & Tax Payable (NBR Mushak 6.3)',
    normalBalance: 'CREDIT',
    description: 'Statutory tax liability collected for NBR remittance',
  },

  // ─── 3000: EQUITY (মালিকানা স্বত্ব) ─────────────────────────────────────────
  '3010': {
    code: '3010',
    class: ACCOUNT_CLASSES.EQUITY,
    nameBn: 'মালিকের প্রারম্ভিক মূলধন',
    nameEn: "Owner's Opening Capital",
    normalBalance: 'CREDIT',
    description: 'Initial and ongoing invested equity float',
  },
  '3020': {
    code: '3020',
    class: ACCOUNT_CLASSES.EQUITY,
    nameBn: 'পুঞ্জীভূত অর্জিত মুনাফা',
    nameEn: 'Retained Earnings',
    normalBalance: 'CREDIT',
    description: 'Cumulative net profit retained in business operation',
  },

  // ─── 4000: REVENUE (আয়) ─────────────────────────────────────────────────────
  '4010': {
    code: '4010',
    class: ACCOUNT_CLASSES.REVENUE,
    nameBn: 'কাউন্টার ও পিওএস বিক্রয় আয়',
    nameEn: 'POS Sales Revenue',
    normalBalance: 'CREDIT',
    description: 'Gross income from cash and credit store sales',
  },
  '4020': {
    code: '4020',
    class: ACCOUNT_CLASSES.REVENUE,
    nameBn: 'পাইকারি চালানি বিক্রয় আয়',
    nameEn: 'Wholesale B2B Sales Revenue',
    normalBalance: 'CREDIT',
    description: 'Bulk wholesale dispatches and orders',
  },
  '4030': {
    code: '4030',
    class: ACCOUNT_CLASSES.REVENUE,
    nameBn: 'অন্যান্য আয় ও ক্যাশ উদ্বৃত্ত',
    nameEn: 'Other Income & Cash Surplus',
    normalBalance: 'CREDIT',
    description: 'Incidental receipts and till count surplus',
  },

  // ─── 5000: EXPENSES (ব্যয়) ──────────────────────────────────────────────────
  '5010': {
    code: '5010',
    class: ACCOUNT_CLASSES.EXPENSE,
    nameBn: 'বিক্রিত পণ্যের ক্রয়মূল্য (COGS)',
    nameEn: 'Cost of Goods Sold (COGS)',
    normalBalance: 'DEBIT',
    description: 'Direct procurement cost of items sold',
  },
  '5020': {
    code: '5020',
    class: ACCOUNT_CLASSES.EXPENSE,
    nameBn: 'দোকান ও পরিচালনা খরচ',
    nameEn: 'Operating Expenses',
    normalBalance: 'DEBIT',
    description: 'Shop rent, electricity, snacks, salary, and maintenance',
  },
  '5030': {
    code: '5030',
    class: ACCOUNT_CLASSES.EXPENSE,
    nameBn: 'হালখাতা বকেয়া ছাড় ও ডিসকাউন্ট',
    nameEn: 'Halkhata Debt Waiver & Discounts',
    normalBalance: 'DEBIT',
    description: 'Honorable waivers and customer settlements',
  },
  '5040': {
    code: '5040',
    class: ACCOUNT_CLASSES.EXPENSE,
    nameBn: 'পণ্য বিনষ্ট ও অপচয় ঘাটতি',
    nameEn: 'Inventory Shrinkage & Spoilage',
    normalBalance: 'DEBIT',
    description: 'Write-off for damaged, expired, or spoiled merchandise',
  },
};

/**
 * Validates a double-entry journal voucher
 * Invariant: Sum(Debits) === Sum(Credits)
 */
export function validateJournalVoucher(voucher) {
  if (!voucher || !Array.isArray(voucher.legs) || voucher.legs.length < 2) {
    return { isValid: false, error: 'A journal voucher must have at least 2 legs.' };
  }

  let totalDebitPoisha = 0;
  let totalCreditPoisha = 0;

  for (const leg of voucher.legs) {
    if (!CHART_OF_ACCOUNTS[leg.accountCode]) {
      return { isValid: false, error: `Invalid account code: ${leg.accountCode}` };
    }
    const debit = Number(leg.debitPoisha) || 0;
    const credit = Number(leg.creditPoisha) || 0;

    if (debit < 0 || credit < 0) {
      return { isValid: false, error: 'Negative debit or credit leg is not allowed in strict GAAP accounting.' };
    }
    if (debit > 0 && credit > 0) {
      return { isValid: false, error: 'A single journal leg cannot contain both debit and credit.' };
    }

    totalDebitPoisha += debit;
    totalCreditPoisha += credit;
  }

  const discrepancyPoisha = totalDebitPoisha - totalCreditPoisha;
  const isBalanced = discrepancyPoisha === 0;

  return {
    isValid: isBalanced,
    totalDebitPoisha,
    totalCreditPoisha,
    discrepancyPoisha,
    error: isBalanced ? null : `Double-entry invariant violated! Debit (৳${totalDebitPoisha / 100}) does not equal Credit (৳${totalCreditPoisha / 100}). Difference: ৳${discrepancyPoisha / 100}`,
  };
}
