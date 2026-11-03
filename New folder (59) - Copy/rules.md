# ⚖️ Engineering, Financial & Desktop Security Rules — Master Invariants
## Project: LedgerX Desktop — Native Desktop Multi-Tenant ERP & Khata
**Document Version:** 6.0.0-PROD-MASTER-ENTERPRISE  
**Author:** Lead System Architect, Senior Implementation Engineer & Security Auditor  
**Binding Level:** Mandatory across all code syntheses, migrations, and pull requests  

---

## 1. Cloud Cost Optimization & Database Read Invariants

### Invariant 1.1: Local-First Disk Read Priority ($0 Cloud Cost)
- **The Rule:** The client application MUST serve all catalog searches, customer lists, party ledger queries, and inventory lookups directly from local disk storage (SQLite/IndexedDB).
- Direct un-indexed cloud queries or global `collection(db, "invoices")` scans are strictly forbidden.
- The home dashboard master metrics (Total Pabo, Total Dibo, Cashbox) MUST be retrieved from the single pre-aggregated document:
  `/tenants/{tenantId}/aggregates/daily_summary`
- Violation of this rule creates excessive cloud bills and is classified as a **P0 architectural defect**.

### Invariant 1.2: Commutative Delta Concurrency Rule
- When offline or online, inventory stock deductions MUST be recorded and transmitted as **relative delta integers** (`deltaQty = -2`), NEVER as absolute stock overrides (`currentStock = 8`).
- Central cloud ingestion MUST commit stock updates using `FieldValue.increment(deltaQty)`.
- If concurrent offline sales result in `currentStock < 0`, the transaction commits successfully, and the system sets `hasPhysicalShortage = true` with an audit flag on the Owner's dashboard.

---

## 2. Desktop POS Rush-Hour Ergonomic Invariants

### Invariant 2.1: 100% Pure Numpad Operability
- A cashier MUST be able to complete a full POS sale (barcode entry, quantity adjustment, customer selection, payment split, receipt print, and drawer kick) using ONLY the physical 17-key numeric keypad.
- Any workflow, modal, or input that forces the cashier to reach for a mouse during standard checkout is strictly prohibited.

### Invariant 2.2: Sub-250ms Hardware Print Latency
- The direct Win32 spooler driver must transmit raw ESC/POS binary to the thermal printer and trigger the cash drawer kick solenoid within **250 milliseconds** of hitting the final `Enter` keystroke.

---

## 3. Regulatory & Government Tax Invariants

### Invariant 3.1: NBR Mushak 6.3 Sequence Integrity
- When Mushak 6.3 Mode is active:
  - Tax invoice numbers MUST be sequential with zero gaps (`M-2026-0001`, `M-2026-0002`).
  - Voided tax invoices cannot be deleted; they must be marked `CANCELED_NBR_RECORD` with an explanatory reason to preserve tax audit compliance.
  - VAT breakdown (5%, 7.5%, or 15%) must be calculated using integer Poisha without fractional rounding discrepancies.

---

## 4. Zero-Cost WhatsApp Communication Rules

### Invariant 4.1: Desktop Native Protocol Mandate
- Customer payment reminders and receipts sent via WhatsApp must execute through the native OS desktop protocol (`whatsapp://send?phone=...&text=...`), eliminating all external third-party paid SMS or API gateways.
- Customer telephone numbers must be sanitized into the international E.164 format (`8801[3-9]XXXXXXXX`) prior to firing the URI handler.

---

## 5. Offline Bengali Audio Voicebox Invariants

### Invariant 5.1: Offline Phonetic Voice Synthesis
- The audio synthesizer must operate 100% offline using pre-bundled local audio sprites.
- Numerical vocalization must adhere to authentic Bengali verbal syntax (e.g. vocalizing `৳ ১,২৫০` as *"এক হাজার দুইশত পঞ্চাশ টাকা"*, not digit-by-digit *"এক দুই পাঁচ শূন্য"*).
