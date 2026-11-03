# Architecture Deep Dive: POS System & Hardware Integration
**Document ID:** ARCH-POS-005 | **Status:** DRAFT | **Author:** Hardware Integration Team

## 1. Unified POS Architecture
The Point of Sale (POS) system is a critical component used by cashiers for walk-in customers, but it must perfectly sync with the QR Code Ordering system to maintain a single source of truth for inventory and revenue.

### 1.1 Local Web Interface (PWA)
The POS runs as an installable Progressive Web App (PWA) on iPad/Android tablets or Windows terminals at the restaurant counter.
- **Offline Mode:** Uses Service Workers and IndexedDB. If the restaurant loses internet connection, the POS can still take orders. When the internet is restored, it syncs the offline queue to the Cloud backend (Kafka).

---

## 2. Receipt & KDS Hardware Integration

### 2.1 Thermal Printer Integration (ESC/POS)
Modern web browsers cannot natively talk to local thermal printers (like Epson or Star Micronics) via raw TCP/IP for security reasons.

**Solution Architecture:**
1. **Local Print Spooler (Agent):** A lightweight Node.js or Golang agent runs on a local PC (or Raspberry Pi) inside the restaurant's local network (LAN).
2. **WebSockets Local Tunnel:** The POS PWA connects to this local agent via a `ws://localhost:8080` or `ws://192.168.1.x` connection.
3. **ESC/POS Command Generation:** The cloud backend generates raw byte commands (ESC/POS protocol) rather than relying on browser `window.print()` dialogues (which are slow and require manual clicks).

**Raw ESC/POS Byte Example (Node.js Buffer):**
```javascript
// Example of generating raw printer bytes for instant receipt printing
const escpos = require('escpos');
escpos.Network = require('escpos-network');

const device  = new escpos.Network('192.168.1.87', 9100);
const printer = new escpos.Printer(device);

device.open(function(error){
  printer
  .font('a')
  .align('ct')
  .style('b')
  .size(1, 1)
  .text('EVORISE RESTAURANT')
  .text('------------------------')
  .align('lt')
  .text('1x Burger       $12.00')
  .text('2x Cola         $4.00')
  .text('------------------------')
  .align('rt')
  .text('TOTAL: $16.00')
  .cut()
  .close();
});
```

### 2.2 Hardware Fault Tolerance
- **Printer Out of Paper / Jammed:** The thermal printer sends an SNMP status code back to the local agent. The agent relays this via WebSockets to the POS tablet. A red UI alert flashes: *"Printer 1 Jammed. Queuing 3 receipts."*
- **KDS (Kitchen Display System) Fallback:** If the kitchen printer fails entirely, the system auto-routes the ticket to the digital KDS screens mounted in the kitchen.

---

## 3. Inventory Sync Engine
If an item (e.g., "Truffle Fries") sells out on the physical POS, the QR Code Menu must reflect this instantly to prevent customers from ordering unavailable items.

1. POS Cashier marks "Truffle Fries" as Out of Stock.
2. POS sends `PATCH /api/v1/inventory/truffle-fries { status: out_of_stock }`
3. Backend updates Postgres and instantly publishes `InventoryUpdatedEvent` to Redis Pub/Sub.
4. WebSocket pushes the event to all active customer QR sessions.
5. The customer's mobile UI grays out the item in real-time, displaying "Sold Out" without requiring a page refresh.

*End of Document.*
