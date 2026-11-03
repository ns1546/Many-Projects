/**
 * ESC/POS Thermal Printer Protocol Generator
 * Conforms to: ARCH-POS-005 §2.1 & PHASE-004 Task 1.1.2
 * Supports Epson TM-T88V, Star Micronics, and standard 80mm/58mm thermal receipt printers.
 */

class EscPosBufferBuilder {
  constructor() {
    this.buffer = [];
  }

  // Raw byte appender
  raw(bytes) {
    if (Array.isArray(bytes)) {
      this.buffer.push(...bytes);
    } else if (Buffer.isBuffer(bytes)) {
      this.buffer.push(...bytes);
    } else if (typeof bytes === 'number') {
      this.buffer.push(bytes);
    }
    return this;
  }

  // Initialize printer (ESC @)
  init() {
    return this.raw([0x1B, 0x40]);
  }

  // Text alignment: 'left' (0), 'center' (1), 'right' (2)
  align(alignment = 'left') {
    const alignMap = { left: 0x00, center: 0x01, right: 0x02 };
    const n = alignMap[alignment] || 0x00;
    return this.raw([0x1B, 0x61, n]);
  }

  // Bold mode: true (1), false (0)
  bold(enable = true) {
    return this.raw([0x1B, 0x45, enable ? 0x01 : 0x00]);
  }

  // Double height & double width text sizing
  size(widthMultiplier = 1, heightMultiplier = 1) {
    const w = Math.min(Math.max(widthMultiplier - 1, 0), 7);
    const h = Math.min(Math.max(heightMultiplier - 1, 0), 7);
    const n = (w << 4) | h;
    return this.raw([0x1D, 0x21, n]);
  }

  // Text content with ASCII/UTF-8 conversion
  text(str) {
    const bytes = Buffer.from(str, 'utf8');
    return this.raw(bytes);
  }

  // Line feed (LF)
  newline(lines = 1) {
    for (let i = 0; i < lines; i++) {
      this.raw(0x0A);
    }
    return this;
  }

  // Horizontal divider line
  divider(char = '-', length = 42) {
    return this.text(char.repeat(length)).newline();
  }

  // Two column row with space padding (e.g. "Item Name ............ $12.00")
  row(left, right, totalWidth = 42) {
    const leftStr = String(left);
    const rightStr = String(right);
    const spacesNeeded = totalWidth - (leftStr.length + rightStr.length);
    if (spacesNeeded <= 0) {
      this.text(`${leftStr} ${rightStr}`).newline();
    } else {
      this.text(`${leftStr}${' '.repeat(spacesNeeded)}${rightStr}`).newline();
    }
    return this;
  }

  // Paper cut command: GS V 66 0 (partial cut with feed)
  cut() {
    return this.raw([0x1D, 0x56, 0x42, 0x00]);
  }

  // Cash drawer kick pulse: ESC p 0 25 250
  openCashDrawer() {
    return this.raw([0x1B, 0x70, 0x00, 0x19, 0xFA]);
  }

  // Export as Buffer
  toBuffer() {
    return Buffer.from(this.buffer);
  }

  // Export as Hex string for debugging or raw network spooling
  toHex() {
    return this.toBuffer().toString('hex');
  }
}

/**
 * Generate Complete Order Receipt for Thermal Kitchen/Customer Printing
 * @param {Object} order - Full order object
 * @param {Object} restaurant - Restaurant branding info
 * @returns {Buffer} Raw ESC/POS byte buffer
 */
function generateOrderReceiptEscPos(order, restaurant = {}) {
  const restName = restaurant.name || 'EVORISE RESTAURANT';
  const restAddress = restaurant.address || 'Dhaka, Bangladesh';
  const restPhone = restaurant.phone || '+880 1700-000000';
  const currency = restaurant.currency || 'BDT';

  const builder = new EscPosBufferBuilder();

  builder
    .init()
    .openCashDrawer()
    .align('center')
    .size(2, 2)
    .bold(true)
    .text(restName)
    .newline()
    .size(1, 1)
    .bold(false)
    .text(restAddress)
    .newline()
    .text(`Tel: ${restPhone}`)
    .newline()
    .divider('=')
    .align('center')
    .bold(true)
    .text(`*** TABLE: ${order.tableNo || 'Table 1'} ***`)
    .newline()
    .bold(false)
    .text(`Order ID: #${order.id}`)
    .newline()
    .text(`Date: ${new Date(order.date || Date.now()).toLocaleString()}`)
    .newline()
    .divider('-');

  // Item List
  builder.align('left');
  const items = order.items || [];
  let subtotal = 0;

  items.forEach(item => {
    const qty = parseInt(item.quantity) || 1;
    const price = parseFloat(item.price) || 0;
    const itemTotal = qty * price;
    subtotal += itemTotal;

    const titleWithQty = `${qty}x ${item.title}`;
    const priceFormatted = `${price.toFixed(2)}`;
    builder.row(titleWithQty, priceFormatted);

    // Modifiers & Addons
    if (item.variant) {
      builder.text(`   Var: ${item.variant}`).newline();
    }
    if (item.addons && Array.isArray(item.addons) && item.addons.length > 0) {
      builder.text(`   Add: ${item.addons.join(', ')}`).newline();
    }
    if (item.modifiers && typeof item.modifiers === 'object') {
      Object.entries(item.modifiers).forEach(([k, v]) => {
        builder.text(`   ${k}: ${v}`).newline();
      });
    }
  });

  const tax = order.tax !== undefined ? parseFloat(order.tax) : 0;
  const grandTotal = order.total !== undefined ? parseFloat(order.total) : subtotal + tax;

  builder
    .divider('-')
    .row('SUBTOTAL:', `${currency} ${subtotal.toFixed(2)}`)
    .row('TAX / VAT:', `${currency} ${tax.toFixed(2)}`)
    .bold(true)
    .size(1, 2)
    .row('TOTAL:', `${currency} ${grandTotal.toFixed(2)}`)
    .size(1, 1)
    .bold(false)
    .divider('=')
    .align('center')
    .text(`Payment: ${order.paymentStatus || 'Cash at Counter'}`)
    .newline()
    .text('Thank you for dining with us!')
    .newline()
    .text('Powered by Evorise Enterprise POS')
    .newline(3)
    .cut();

  return builder.toBuffer();
}

module.exports = {
  EscPosBufferBuilder,
  generateOrderReceiptEscPos
};
