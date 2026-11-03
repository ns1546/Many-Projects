/**
 * ESC/POS Thermal Command Generator & Binary Spooler
 * Formats raw binary streams for 58mm and 80mm thermal printers
 * Direct support for Cash Drawer Kick and Dynamic bKash Payment QR Code
 */

const ESC = 0x1B;
const GS  = 0x1D;

/**
 * Builds binary buffer for ESC/POS Thermal Receipt
 * @param {object} invoice
 * @param {object} config
 * @returns {Uint8Array}
 */
export function buildThermalReceiptBuffer(invoice, config = {}) {
  const buffer = [];
  const append = (...bytes) => buffer.push(...bytes);
  const appendText = (str) => {
    const encoded = new TextEncoder().encode(str);
    buffer.push(...encoded);
  };

  const width = config.paperWidth || '58mm';
  const lineWidth = width === '80mm' ? 48 : 32;
  const divider = '-'.repeat(lineWidth) + '\n';
  const doubleDivider = '='.repeat(lineWidth) + '\n';

  // 1. Initialize Printer (ESC @)
  append(ESC, 0x40);

  // 2. Cash Drawer Kick Solenoid (ESC p 0 25 250) - Pops open drawer
  if (config.kickDrawer) {
    append(ESC, 0x70, 0x00, 0x19, 0xFA);
  }

  // 3. Header Title (Centered, Bold)
  append(ESC, 0x61, 0x01); // Center Align
  append(ESC, 0x45, 0x01); // Bold ON
  appendText(`${config.businessName || 'LedgerX Store'}\n`);
  append(ESC, 0x45, 0x00); // Bold OFF
  if (config.address) appendText(`${config.address}\n`);
  if (config.phone) appendText(`মোবাইল: ${config.phone}\n`);
  appendText(divider);

  // 4. Invoice Metadata
  append(ESC, 0x61, 0x00); // Left Align
  appendText(`রসিদ নং: ${invoice.id}\n`);
  appendText(`তারিখ: ${invoice.date || new Date().toLocaleDateString('bn-BD')}\n`);
  if (invoice.customerName) {
    appendText(`গ্রাহক: ${invoice.customerName}\n`);
  }
  appendText(divider);

  // 5. Line Items Table
  append(ESC, 0x45, 0x01); // Bold Table Header
  if (width === '80mm') {
    appendText('আইটেম                      পরিমাণ    দর      মোট (৳)\n');
  } else {
    appendText('আইটেম          পরিমাণ   দর   মোট (৳)\n');
  }
  append(ESC, 0x45, 0x00); // Bold OFF
  appendText(divider);

  for (const item of invoice.items || []) {
    const name = (item.name || '').slice(0, 14).padEnd(14);
    const qty = String(item.quantity || 1).padStart(3);
    const rate = String(item.unitPriceTaka || 0).padStart(5);
    const total = String(item.totalTaka || 0).padStart(7);
    appendText(`${name} ${qty} ${rate} ${total}\n`);
  }
  appendText(divider);

  // 6. Summary Totals (Right Aligned)
  append(ESC, 0x61, 0x02); // Right Align
  appendText(`সর্বমোট: ৳ ${invoice.grandTotalTaka || 0}\n`);
  if (invoice.discountTaka) {
    appendText(`ছাড়: - ৳ ${invoice.discountTaka}\n`);
  }
  append(ESC, 0x45, 0x01); // Bold Total Paid
  appendText(`পরিশোধ: ৳ ${invoice.paidAmountTaka || 0}\n`);
  append(ESC, 0x45, 0x00);
  if (invoice.dueAmountTaka > 0) {
    append(ESC, 0x45, 0x01);
    appendText(`বর্তমান বকেয়া: ৳ ${invoice.dueAmountTaka}\n`);
    append(ESC, 0x45, 0x00);
  }
  appendText(doubleDivider);

  // 7. Dynamic bKash QR Code (if due or payment requested)
  if (config.bKashMerchantNumber && invoice.dueAmountTaka > 0) {
    append(ESC, 0x61, 0x01); // Center Align
    appendText('বিকাশে বকেয়া পরিশোধ করতে QR স্ক্যান করুন:\n');
    
    const qrPayload = `bkash://merchant/pay?merchant=${config.bKashMerchantNumber}&amount=${invoice.dueAmountTaka}&ref=${invoice.id}`;
    appendQRCode(buffer, qrPayload);
    appendText(`বিকাশ মার্চেন্ট: ${config.bKashMerchantNumber}\n`);
    appendText(divider);
  }

  // 8. Footer Greetings & Paper Feed
  append(ESC, 0x61, 0x01); // Center Align
  appendText('ধন্যবাদ! আবার আসবেন।\nপাওয়ারড বাই LedgerX Desktop\n\n\n');

  // 9. Full Paper Cut (GS V 0)
  append(GS, 0x56, 0x00);

  return new Uint8Array(buffer);
}

/**
 * Encodes native ESC/POS Model 2 QR Code into byte stream
 */
function appendQRCode(buffer, text) {
  const textBytes = new TextEncoder().encode(text);
  const length = textBytes.length + 3;
  const pL = length % 256;
  const pH = Math.floor(length / 256);

  // Model 2 Setup
  buffer.push(GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
  // Module Size 6 (Optimal for 58mm/80mm)
  buffer.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x06);
  // Error Correction Level M (15%)
  buffer.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31);
  // Store Data
  buffer.push(GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30, ...textBytes);
  // Print QR Symbol
  buffer.push(GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);
}
