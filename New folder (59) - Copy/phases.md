# 🗺️ Implementation Roadmap & Phased Execution Plan — Master Sprints
## Project: LedgerX Desktop — Native Desktop Multi-Tenant ERP & Khata
**Document Version:** 6.0.0-PROD-MASTER-ENTERPRISE  
**Author:** Lead Architect, Product Manager & QA Reliability Engineer  
**Sprint Cadence:** 5 Agile Sprints with Strict Verification & QA Gates  

---

## 1. Master Implementation Roadmap Overview

The execution roadmap includes the **Enterprise-Grade Capabilities**: 100% Numpad Rush-Hour Mode, Bengali Audio Voicebox, 95% Read-Cost Optimization, and NBR Mushak 6.3 Compliance.

```mermaid
gantt
    title LedgerX Desktop Master Sprint Schedule
    dateFormat  YYYY-MM-DD
    section Sprint 1: Shell, Audio & Cost Guard
    Desktop Shell & Preload IPC Bridge   :done, s1_1, 2026-10-15, 3d
    bKash Design Tokens & CSS Variables  :done, s1_2, after s1_1, 2d
    Bilingual Engine (বাংলা ⇄ English)   :done, s1_3, after s1_2, 2d
    95% Read-Cost Aggregate Doc Engine   :done, s1_4, after s1_3, 2d
    Bengali Audio Voicebox Chime Engine  :done, s1_5, after s1_4, 2d
    section Sprint 2: Khata, Containers & Cheques
    bKash 8-Tile Navigation Grid         :active, s2_1, after s1_5, 2d
    Customer Khata & Credit Risk Radar   :s2_2, after s2_1, 3d
    Returnable Container & Crate Khata   :s2_3, after s2_2, 3d
    Supplier Khata & Cheque Register     :s2_4, after s2_3, 3d
    Cashbox & Blind Day-Close Balancing  :s2_5, after s2_4, 2d
    section Sprint 3: POS, Numpad & Hardware
    100% Numpad-Only Rush-Hour Checkout  :s3_1, after s2_5, 3d
    9-Item Hotkey Speed Dial Grid        :s3_2, after s3_1, 2d
    Direct Win32 Spooler & 24V Drawer Kick:s3_3, after s3_2, 3d
    Dynamic bKash QR Thermal Print Engine:s3_4, after s3_3, 2d
    Blind Cashier Mode & Owner PIN Gate  :s3_5, after s3_4, 2d
    section Sprint 4: Multi-Store, NBR & BI
    NBR Mushak 6.3 Tax Invoice Generator :s4_1, after s3_5, 3d
    Inter-Store Godown Transit Challan   :s4_2, after s4_1, 3d
    Customer Advance / Token Booking     :s4_3, after s4_2, 2d
    60-Sec Morning Price Re-Pricer Table :s4_4, after s4_3, 2d
    Zero-Cost WhatsApp Desktop Protocol  :s4_5, after s4_4, 2d
    Smart Halkhata Campaign & True Net P&L:s4_6, after s4_5, 3d
    section Sprint 5: Offline CRDT & Packaging
    Commutative Delta CRDT Sync Engine   :s5_1, after s4_6, 4d
    Local SQLite / IndexedDB Disk WAL    :s5_2, after s5_1, 3d
    Windows .exe Installer & Load Tests  :s5_3, after s5_2, 3d
    Production Release v1.0.0            :milestone, m1, after s5_3, 0d
```

---

## 2. Institutional Quality Gates & Test Suites

| Test Suite | Scenario Tested | Pass Criteria |
| :--- | :--- | :--- |
| **TS-1: Rush-Hour Speed** | Complete POS sale using physical Numpad only without touching mouse | Sale finalized, receipt printed, and cash drawer kicked in < 3.0s total. |
| **TS-2: Audio Voicebox** | Record ৳ 1,250 Pabo from customer Rahim | Voicebox vocalizes: *"রহিম মিয়ার এক হাজার দুইশত পঞ্চাশ টাকা জমা হয়েছে"* in < 50ms. |
| **TS-3: Cloud Cost Audit** | 500 sales recorded on active terminal | Total cloud database reads <= 5 (verified via read-shield cache). |
| **TS-4: CRDT Concurrency** | 2 offline terminals sell 6kg and 5kg of an item with 10kg initial stock | On reconnect, both sales commit; final stock is -1kg; audit alert generated. |
| **TS-5: NBR Mushak 6.3** | Generate tax invoice with 15% VAT | BIN/TIN printed; VAT calculation matches exact integer poisha arithmetic. |
| **TS-6: Zero-Cost WhatsApp**| Click "Send Reminder" on Customer Khata | WhatsApp Desktop launches with pre-filled message; zero API fees charged. |
