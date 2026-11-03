# 🎨 UI/UX Design System & Ergonomic Specification — Master Blueprints
## Project: LedgerX Desktop — Native Desktop Multi-Tenant ERP & Khata
**Document Version:** 6.0.0-PROD-MASTER-ENTERPRISE  
**Design Lead:** Senior UI/UX Architect & Design Systems Engineer  
**Aesthetic Style:** bKash Iconic Magenta Pink (`#E2136E`), Tactile Desktop Grid, Clean White Cards  
**Target Medium:** Native Desktop Application (1366×768 POS Displays & 1080p Workstations)  
**Accessibility:** High-Contrast WCAG 2.1 AA Compliant  

---

## 1. Ergonomic Master Blueprint: 100% Numpad-Only Rush-Hour POS

During peak market rush hours (৭টা - ৯টা বাজার বা দোকানের ভিড়), cashiers keep one hand on goods/cash and operate the POS with the other hand using the **standard 17-key physical numeric keypad**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [← হোম]   ⚡ দ্রুত POS — রাশ আওয়ার মোড (100% Numpad Mode)      🔊 সাউন্ডবক্স: চালু [F9] │
├─────────────────────────────────────────────┬──────────────────────────────────────────┤
│  ⚡ দ্রুত ৯টি হট-কি পণ্য (Digits 1-9 Hotkeys) │ 🛒 কার্ট ও রসিদ প্রিভিউ                  │
│  ┌──────────────┐ ┌──────────────┐          │ 1. মিনিকেট চাল ২৫কেজি   1x  ৳ ১,৭৫০       │
│  │ [1] চিনি ১কেজি│ │ [2] তেল ১লিটার│          │ 2. সয়াবিন তেল ৫লিটার    1x    ৳ ৮২০       │
│  │ ৳ ১৩০        │ │ ৳ ১৭০        │          │ 3. চিনি ১কেজি          2x    ৳ ২৬০       │
│  └──────────────┘ └──────────────┘          ├──────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐          │ প্রদেয় মোট বিল:              ৳ ২,৮০০.০০  │
│  │ [3] মসুর ডাল  │ │ [4] ডিম (হালি)│          ├──────────────────────────────────────────┤
│  │ ৳ ১৪০        │ │ ৳ ৪৮         │          │ [ / ] পেমেন্ট সুইচ: (•) নগদ   ( ) বাকি   │
│  └──────────────┘ └──────────────┘          │                                          │
│  ┌──────────────┐ ┌──────────────┐          │ ┌──────────────────────────────────────┐ │
│  │ [5] লবণ ১কেজি │ │ [6] আটা ২কেজি │          │ │ 🌸 সম্পন্ন ও ক্যাশ ড্রয়ার ওপেন [Enter]│ │
│  │ ৳ ৪০         │ │ ৳ ১১০        │          │ └──────────────────────────────────────┘ │
│  └──────────────┘ └──────────────┘          │ Numpad টিপস: [*] গ্রাহক  [/] বাকি  [+] যোগ │
└─────────────────────────────────────────────┴──────────────────────────────────────────┘
```

### 1.1 Physical 17-Key Numpad Keymapping
```
┌─────────┬─────────┬─────────┬─────────┐
│ NumLock │    /    │    *    │    -    │
│  (Lock) │(PayMode)│(CustSrch│ (Qty -) │
├─────────┼─────────┼─────────┼─────────┤
│    7    │    8    │    9    │    +    │
│ (Item 7)│ (Item 8)│ (Item 9)│         │
├─────────┼─────────┼─────────┤ (Qty +) │
│    4    │    5    │    6    │         │
│ (Item 4)│ (Item 5)│ (Item 6)│         │
├─────────┼─────────┼─────────┼─────────┤
│    1    │    2    │    3    │  ENTER  │
│ (Item 1)│ (Item 2)│ (Item 3)│ (Finish │
├─────────┴─────────┼─────────┤  Print  │
│         0         │    .    │  & Kick │
│    (Item 0 / Barcode)│ (Decimal)│  Drawer)│
└───────────────────┴─────────┴─────────┘
```

---

## 2. NBR Mushak 6.3 Government Tax Invoice Blueprint (80mm Thermal)

When Mushak 6.3 Mode is active, receipts are formatted to National Board of Revenue legal standards:

```
======================================================
               গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                  জাতীয় রাজস্ব বোর্ড
           কর চালানপত্র (বিধি ৪০ এর উপবিধি (১))
                    মূসক - ৬.৩
======================================================
নিবন্ধিত ব্যক্তির নাম: বিসমিল্লাহ ট্রেডার্স
বিআইএন (BIN): ০০০১২৩৪৫৬-০১০১
চালানপত্র নম্বর: M-2026-0042      ইস্যুর তারিখ: ১৫-১০-২০২৬
ক্রেতার নাম: মো: রহিম মিয়া          ক্রেতার টিআইএন: ১২৩৪৫৬৭৮৯
ক্রেতার ঠিকানা: নিউ মার্কেট, ঢাকা    যানবাহনের প্রকৃতি: ভ্যান
------------------------------------------------------
পণ্য বিবরণ     একক  পরিমাণ   মূল্য (৳)   সম্পূরক শুল্ক  মূসক (১৫%)
------------------------------------------------------
মিনিকেট চাল   কেজি   ৫০     ৪,০০০.০০       ০.০০      ৬০০.০০
সয়াবিন তেল    লিটার  ১০     ১,৬০০.০০       ০.০০      ২৪০.০০
------------------------------------------------------
সর্বমোট মূসক (Total VAT):                        ৳ ৮৪০.০০
সর্বমোট মূল্য (করসহ মোট মূল্য):                 ৳ ৬,৪৪০.০০
------------------------------------------------------
       বিকাশে কর চালান পরিশোধ করতে
         নিচের QR কোড স্ক্যান করুন:

            ┌───────────────┐
            │ █▀▀▀█ ▄ █▀▀▀█ │
            │ █   █ █ █   █ │
            │ ▀▀▀▀▀ ▀ ▀▀▀▀▀ │
            │ ▀█▄▀ █▀█ ▀▄▀█ │
            │ █▀▀▀█ ▀▄  █ █ │
            │ █   █ █▀█▀▄ █ │
            │ ▀▀▀▀▀ ▀  ▀  ▀ │
            └───────────────┘
     বিকাশ মার্চেন্ট: ০১৭০০-০০০০০০
     টাকার পরিমাণ (৳ ৬,৪৪০) অটো সেট হবে
------------------------------------------------------
দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর: ____________________
======================================================
```

---

## 3. Master Desktop Keyboard Shortcut Map (Updated with Rush-Hour Hotkeys)

| Shortcut Key | Function Executed | Context |
| :--- | :--- | :--- |
| `F1` or `Ctrl + B` | **Open Express POS Billing Counter** | Global |
| `F2` or `Ctrl + K` | **Open Customer Khata (দেনা/পাওনা)** | Global |
| `F3` or `Ctrl + G` | **Open Cashbox / Gollah (ক্যাশবাক্স)** | Global |
| `F4` | **Open Inventory & Stock Management** | Global |
| `F5` | **Open Daily P&L & Cash Flow Reports** | Global |
| `F8` | **Open NBR Mushak 6.3 Tax Invoices** | Global |
| `F9` | **Toggle Bengali Audio Voicebox (On / Off)** | Global |
| `F10` | **Test Hardware Thermal Printer & Drawer Kick** | Global |
| `Ctrl + L` | **Toggle Language (বাংলা ⇄ English)** | Global |
| `Ctrl + S` | **Open Multi-Shop Branch Switcher** | Global Header |
| `Space` | **Toggle bKash Balance Reveal (Show/Hide)** | Home Screen |
| `*` (Numpad) | **Focus Customer Search / Attach Party** | POS Screen |
| `/` (Numpad) | **Toggle Payment Mode (Cash ⇄ Due ⇄ bKash)** | POS Screen |
| `+` / `-` (Numpad) | **Increment / Decrement Selected Item Qty** | POS Screen |
| `Enter` (Numpad) | **Finalize Sale, Kick Cash Drawer, and Print**| POS Screen |
| `Esc` | **Close Current Drawer, Modal or Cancel Cart** | All Modals |
