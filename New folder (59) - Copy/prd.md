# 📋 Product Requirements Document (PRD) — Master Universal Specification
## Project Codename: LedgerX Desktop (Institutional-Grade Multi-Tenant ERP & Khata OS)
**Document Version:** 6.0.0-PROD-MASTER-ENTERPRISE  
**Author:** Antigravity Full Expert Development Team (PM, Architecture, Implementation, QA, Security, Cognitive Guilds)  
**Target Form Factor:** Native Desktop Executable (Windows 10/11 x64 `.exe`, POSReady, macOS)  
**Theme:** bKash Iconic Magenta Pink Ecosystem (`#E2136E`) — Instant Trust, High Legibility  
**Core Standard:** Local-First Offline Resilience, Commutative Event-Sourcing, NBR Mushak 6.3 Ready  
**Language Standard:** Universal Bilingual Engine (বাংলা ⇄ English) with Bengali Audio Voicebox  

---

## 1. Expert Adversarial Audit: Deficiencies in Existing Solutions & The LedgerX Remedy

Through adversarial field analysis of retail and Paikari operations across South Asia, the development team identified **8 deep systemic flaws** in existing software (TallyKhata, Khatabook, Vyapar, and generic desktop ERPs) that cause merchants to abandon them. LedgerX Desktop systematically solves every single one:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          EXPERT ADVERSARIAL GAP ANALYSIS & LEDGERX REMEDIES                            │
├───────────────────────────────────┬──────────────────────────────────┬─────────────────────────────────┤
│ SYSTEMIC REAL-WORLD FLAW          │ TALLYKHATA / COMPETITOR FAILURE  │ LEDGERX INSTITUTIONAL REMEDY    │
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 1. Cloud Database Bill Explosion  │ ❌ Naive onSnapshot() listeners  │ ✅ Local Disk Read Cache +      │
│    (ক্লাউড বিল ও অতিরিক্ত খরচ)    │ cause millions of reads & high   │ Atomic Aggregate Summary Docs;  │
│                                   │ monthly fees for merchants.      │ cuts cloud reads by 95%!        │
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 2. Concurrent Offline Race        │ ❌ Last-write-wins overwrites    │ ✅ Commutative Delta CRDT Engine│
│    (২ জন ক্যাশিয়ারের একসাথে অফলাইন)│ sales and corrupts inventory.    │ (A + B = B + A); zero stock lost│
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 3. Rush-Hour Mouse Friction       │ ❌ Requires clicking and typing; │ ✅ 100% Numpad-Only Mode; whole │
│    (ভিড়ের সময় মাউস ধরার ঝামেলা)   │ impossible during 7 PM market rush│ transaction done with 1 hand!   │
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 4. Illiterate / Blind Assurance   │ ❌ Silent text only; shopkeeper  │ ✅ Built-in Bengali Audio Voice │
│    (সাউন্ডবক্স ও কথা বলা হিসাব)   │ must read tiny screen digits.    │ Announcer ("৫০০ টাকা জমা হয়েছে") │
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 5. Paid WhatsApp API Overhead     │ ❌ Forces paid SMS gateways or   │ ✅ Zero-Cost WhatsApp Desktop   │
│    (হোয়াটসঅ্যাপে মেসেজ পাঠানোর খরচ)│ expensive meta cloud API credits.│ Deep-Link Protocol (৳০ খরচ)!    │
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 6. Regulatory & VAT Inability     │ ❌ Unregulated receipts rejected │ ✅ NBR Mushak 6.3 Configurable  │
│    (ভ্যাট চালান ও মুসক ৬.৩)       │ by government VAT authorities.   │ Tax Invoice Engine with BIN/TIN.│
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 7. Hardware Drawer Solenoid Jam   │ ❌ Browser print crashes or      │ ✅ Direct Win32 Spooler & 24V   │
│    (ক্যাশ ড্রয়ার অটো ওপেন ও জ্যাম)│ cannot trigger USB drawer kick.  │ ESC/POS Kick-Pulse (ESC p 0).   │
├───────────────────────────────────┼──────────────────────────────────┼─────────────────────────────────┤
│ 8. Returnable Container Debt      │ ❌ Only tracks money; loses lakhs│ ✅ Dual Asset Khata: Currency + │
│    (খালি বস্তা, সিলিন্ডার ও ক্যারেট)│ in missing crates and cylinders. │ Returnable Packaging Balance.   │
└───────────────────────────────────┴──────────────────────────────────┴─────────────────────────────────┘
```

---

## 2. Universal Frontline Capabilities (Institutional Blueprint)

### 2.1 100% Numpad-Only Rush-Hour Mode (এক হাতে পুরো বিক্রয় ও হিসাব)
- **The Context:** During evening rush hour (৭টা - ৯টা কাঁচাবাজার বা মুদি দোকানের ভিড়), customers scream items, and lines are deep. Reaching for a mouse or typing with two hands stalls the counter.
- **The Solution:** The cashier never touches the mouse. The entire POS checkout, item selection, customer assignment, and printing is operated with the **standard 17-key physical numeric keypad**:
  - `[0-9]` + `Enter`: Type Barcode / Quick SKU number.
  - `+`: Increment quantity.
  - `-`: Decrement quantity.
  - `*`: Search customer phone number.
  - `/`: Toggle Cash ⇄ Due ⇄ bKash.
  - `Enter` (double tap): Finalize sale, fire cash drawer solenoid, and direct print receipt in 0.2s!
  - **9 Hotkey Quick-Items:** Digits `1` through `9` can be bound to the shop's top 9 fastest-selling items (e.g. `1` = ১কেজি চিনি, `2` = ১লিটার তেল, `3` = ডিমের হালি).

---

### 2.2 Built-In Bengali Audio Voice Announcer (ডিজিটাল সাউন্ডবক্স)
- **The Context:** Over 60% of shop assistants and many traditional shopkeepers prefer hearing audio validation like a bKash soundbox. Visual digits on a screen are easy to misread or overlook.
- **The Solution:** Built-in offline speech synthesizer vocalizing every action through desktop PC speakers:
  - *"মো: রহিম মিয়ার ৫০০ টাকা জমা হয়েছে। বর্তমান বকেয়া ৭০০ টাকা।"*
  - *"নগদ বিক্রয় সম্পন্ন: ১,২০০ টাকা। ক্যাশবাক্স আপডেট হয়েছে।"*
  - *"সতর্কবার্তা: নাপা এক্সট্রা ওষুধের মেয়াদ শেষ! বিক্রয় বন্ধ।"*
- Configurable toggle: `[ সাউন্ড অন / অফ ]` with volume control.

---

### 2.3 Zero-Cost WhatsApp Desktop Direct Integration (৳০ খরচে হোয়াটসঅ্যাপ তাগাদা)
- **The Context:** Competitors charge ৳0.50 to ৳1.50 per SMS or require monthly Meta Cloud API subscriptions ($50+/month) which small businesses refuse to pay.
- **The Solution:** Utilizes the desktop native protocol:
  `whatsapp://send?phone=8801700000000&text=...`
- When clicking **"তাগাদা পাঠান (Send Reminder)"**, LedgerX triggers the merchant's installed **WhatsApp Desktop** or WhatsApp Web application with a pre-filled, personalized Bengali invoice and payment link. Cost = **৳ 0.00 forever**!

---

### 2.4 NBR Mushak 6.3 VAT & Tax Compliance (জাতীয় রাজস্ব বোর্ড মুসক ৬.৩ চালান)
- **The Context:** Medium and growing paikar/retail stores face National Board of Revenue (NBR) inspections and are legally required to provide Mushak 6.3 formatted tax invoices.
- **The Solution:**
  - One-click toggle in Settings: **"ভ্যাট চালান মোড (Mushak 6.3 Mode)"**.
  - Adds Merchant BIN (Business Identification Number), Customer TIN, 5%/7.5%/15% VAT split, and prints official Form 6.3 on A4, A5, or 80mm thermal paper.

---

### 2.5 Dual-Unit Wholesale/Retail Breakdown (বস্তা ⇄ কেজি, কার্টুন ⇄ পিস)
- Stores stock in base atomic units (Grams, Kg, Pieces).
- Cashier can sell `1 Bag (50kg)` or `1.5 Kg loose`. System automatically deducts `1.5` from master stock and computes profit margin using pro-rata cost basis.

---

### 2.6 Returnable Container & Crate Khata (খালি বস্তা, ক্যারেট ও গ্যাস সিলিন্ডার)
- Tracks crates, cylinders, and jute bags as physical loan assets independent of cash balances.
- Prevents customer account closure until empty containers are returned or forfeited into cash charges.

---

### 2.7 Blind Cashier Shield & Owner 4-Digit Cryptographic PIN
- Wholesale buying costs, gross profit margins, and net profits are completely stripped from Cashier accounts.
- Day-end cash counting is blind (cashier counts physical cash without knowing system expected balance).
- Invoice cancellations, stock adjustments, and high discounts require the Owner's 4-digit PIN.

---

### 2.8 Smart Halkhata Festival & Debt-Waiver Engine
- 1-click campaign creation with automated WhatsApp festive invitation cards.
- Allows debt settlements with partial waivers (e.g., ৳ 8,500 cash + ৳ 1,500 waiver) balancing customer debt to zero while logging promotional expense.

---

### 2.9 Pharmacy FEFO Expiry Radar & Mobile IMEI Warranty Engine
- Automated First-Expiry-First-Out (FEFO) selection; hard POS locks on expired batches.
- Single-item IMEI/Serial number lookup for 1-second warranty validation.

---

## 3. End-to-End Function Connectivity Map (All Interconnected Side-Effects)

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LEDGERX FUNCTION CONNECTIVITY MAP                                     │
├───────────────────────────────┬───────────────────────────────────────────────────────────────────────┤
│ USER ACTION TRIGGER           │ CASCADE OF CONNECTED SYSTEM SIDE-EFFECTS                              │
├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 1. Numpad Rush-Hour Cash Sale │ 1. Decrements stock in [Products] via atomic delta decrement.         │
│    (Keys: 1, +, Enter, Enter) │ 2. Adds cash to [Cashbox - Cash Drawer].                              │
│                               │ 3. Fires USB cash drawer kick solenoid (ESC p 0 25 250).              │
│                               │ 4. Direct prints raw ESC/POS binary to [Thermal Printer] in 0.2s.     │
│                               │ 5. Plays Bengali Audio Chime: "বারোশত টাকা বিক্রয় সম্পন্ন"।          │
│                               │ 6. Updates daily summary aggregate doc (Zero read cost explosion).    │
├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 2. Returnable Container Loan  │ 1. Increments customer container due count in [Containers].           │
│    (10 Gas Cylinders Issued)  │ 2. Updates customer container balance tag on [Parties].               │
│                               │ 3. Generates delivery gate-pass challan with serial numbers.          │
│                               │ 4. Leaves financial currency ledger unaffected until cash settled.    │
├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 3. Halkhata Settlement with   │ 1. Adds cash collected to [Cashbox - Cash Drawer].                    │
│    Waiver (৳8,500 + ৳1,500)   │ 2. Logs ৳1,500 promotional expense in [Expenses / Halkhata Waivers].  │
│                               │ 3. Zeros out customer due balance in [Parties].                       │
│                               │ 4. Appends Halkhata settlement event in [Ledger Entries].             │
│                               │ 5. Prints ceremonial Halkhata clearance certificate on [Thermal].     │
├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 4. Expired Medicine Scan      │ 1. Detects batch expiry date < current system time.                   │
│    (Pharmacy POS checkout)    │ 2. Triggers audio vocal alert: "মেয়াদোত্তীর্ণ ওষুধ! বিক্রয় নিষিদ্ধ"। │
│                               │ 3. Hard-locks checkout; prevents item from being billed.              │
│                               │ 4. Auto-prompts addition to [Supplier Return Challan].                │
├───────────────────────────────┼───────────────────────────────────────────────────────────────────────┤
│ 5. Blind Cashier Day Close    │ 1. Prompts cashier for blind physical cash count (e.g. ৳ 14,250).     │
│    (Cashier submits drawer)   │ 2. Evaluates variance vs expected balance in memory.                  │
│                               │ 3. Locks daily cashier shift in [Day Closes].                         │
│                               │ 4. Emits confidential audit report to Owner's mobile & desktop.       │
└───────────────────────────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Master Function Directory (All 75 Functions Indexed)

```
MODULE 1: AUTHENTICATION, MULTI-TENANCY & BILINGUAL ENGINE
  [FN-1.1] Multi-Tenant Business Provisioning
  [FN-1.2] Instant Multi-Business Workspace Switching
  [FN-1.3] Staff Onboarding & Role-Based Access Control (RBAC)
  [FN-1.4] Device Session & Persistent Token Storage (DPAPI)
  [FN-1.5] Instant Bilingual Toggle (বাংলা ⇄ English)
  [FN-1.6] Numeral Presentation Switcher (12345 ⇄ ১২৩৪৫)
  [FN-1.7] Bengali Offline Audio Voice Synthesizer / Announcer

MODULE 2: bKASH-THEMED COMMAND CENTER
  [FN-2.1] Master Financial Glance (bKash Balance Reveal Card)
  [FN-2.2] Iconic 8-Action Menu Grid Navigation
  [FN-2.3] Recent Activity & Transaction Ticker
  [FN-2.4] Hardware Connectivity Status Monitor (Printer/Sync)
  [FN-2.5] Tomorrow's Cheque Maturity Radar Alert
  [FN-2.6] Near-Expiry Drug & Perishable Alert Widget
  [FN-2.7] Cloud Read/Write Optimization & Local Cache Sync Status

MODULE 3: CUSTOMER KHATA & CREDIT RADAR
  [FN-3.1] Customer Directory & Fuzzy Search (Fuse.js)
  [FN-3.2] Rapid 3-Second "+ টাকা পেলাম (PABO)" Entry
  [FN-3.3] Rapid 3-Second "+ টাকা দিলাম (DIBO)" Entry
  [FN-3.4] Zero-Cost WhatsApp Desktop Direct Reminder Link
  [FN-3.5] Full Customer Ledger Statement Export (PDF/Thermal/CSV)
  [FN-3.6] Customer Credit Limit Guard & Auto-Lock Alert
  [FN-3.7] Customer Trust Score Calculator (1 to 5 Stars)
  [FN-3.8] Multi-Tier Customer Pricing Assignment (Retail/Wholesale/VIP)

MODULE 4: SUPPLIER KHATA & CHEQUES (মহাজন ও চেক)
  [FN-4.1] Supplier Directory & Purchase Ledger
  [FN-4.2] Supplier Credit Purchase Inward (Stock Addition)
  [FN-4.3] Supplier Payment Settlement (Cash/bKash/Bank)
  [FN-4.4] Bank Cheque Deposit & Maturity Tracker
  [FN-4.5] Cheque Clearance & Dishonor / Bounced Penalty Handler
  [FN-4.6] Near-Expiry Supplier Return Challan Generator

MODULE 5: CASHBOX & FINANCIAL GOLLAH (ক্যাশবাক্স)
  [FN-5.1] Multi-Account Sub-Wallets (Cash, bKash, Nagad, Bank)
  [FN-5.2] Inter-Account Transfer (e.g. Bank to Cash, Cash to bKash)
  [FN-5.3] Morning Opening Float Entry
  [FN-5.4] Blind Day-Close Cash Balancing (Cashier Blind Count)
  [FN-5.5] Cash Flow Inflow/Outflow Statement
  [FN-5.6] Cash Drawer Kick-Sensor & "No-Sale" Opening Audit

MODULE 6: EXPRESS POS & HARDWARE PRINTING
  [FN-6.1] Global USB Barcode Wedge Interceptor
  [FN-6.2] Dual-Unit POS Selector (বস্তা ⇄ কেজি, কার্টুন ⇄ পিস)
  [FN-6.3] Atomic Split Payment Engine (Cash + bKash + Due)
  [FN-6.4] Direct USB/Serial ESC/POS Thermal Printing (58/80mm)
  [FN-6.5] Dynamic Pre-filled bKash QR Code Print Generator
  [FN-6.6] Invoice Reversal & Return Engine (Owner PIN Locked)
  [FN-6.7] IMEI / Serial Number Single-Item Warranty Lookup
  [FN-6.8] Matrix Variation Selector (Size, Color, Brand)
  [FN-6.9] 100% Numpad-Only Rush-Hour Checkout Mode
  [FN-6.10] 9-Item Quick Hotkey Speed Dial
  [FN-6.11] NBR Mushak 6.3 Configurable VAT Tax Invoice Mode

MODULE 7: SPECIALIZED OMNI-VERTICAL MODULES
  [FN-7.1] Returnable Container & Crate Khata (বস্তা, ক্যারেট, সিলিন্ডার)
  [FN-7.2] Pharmacy Batch & FEFO Expiry Management
  [FN-7.3] Multi-Branch Godown Inter-Store Challan Transfer
  [FN-7.4] Customer Advance Booking & Token Khata (বায়না হিসাব)
  [FN-7.5] 60-Second Morning Quick Re-Pricer Table
  [FN-7.6] Mini Bill of Materials (BOM) Raw Material Auto-Deduction
  [FN-7.7] Servicing & Workshop Repair Job-Card Tracker
  [FN-7.8] Container Deposit & Loss Forfeiture Settlement

MODULE 8: SMART HALKHATA, EXPENSES & BI
  [FN-8.1] 1-Click Halkhata Festival Campaign Creator
  [FN-8.2] WhatsApp Festive Halkhata Digital Invitation Cards
  [FN-8.3] Halkhata Debt-Waiver Settlement Engine
  [FN-8.4] Spoilage, Damage & Expired Goods Write-Off
  [FN-8.5] Daily Operating Shop Expenses Logging
  [FN-8.6] True Net Profit Engine (Sales - COGS - Expenses - Spoilage)
  [FN-8.7] Customer Due Ageing Radar (0-15, 16-30, 30+ Days)
  [FN-8.8] Owner 4-Digit Cryptographic PIN Management
  [FN-8.9] Atomic Aggregate Summary Documents Engine (Cost Optimization)
```
