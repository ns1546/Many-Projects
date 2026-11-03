import jsPDF from 'jspdf';

const formatTk = (n) => 'Tk ' + Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Generates an authentic Bangladesh Super-Shop (Shwapno/Agora style) 80mm thermal receipt PDF.
 */
export const generateGodownReceipt = (sale, entities = [], type = 'customer') => {
  const items = sale.items || [];
  // Calculate dynamic roll height based on items length
  const baseHeight = 155;
  const itemHeight = items.length * 12;
  const totalHeight = Math.max(160, baseHeight + itemHeight);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, totalHeight] });
  const W = 80;
  let y = 8;

  const text = (str, size = 8.5, bold = false, align = 'left', color = '#0f172a') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(color);
    if (align === 'center') {
      doc.text(String(str), W / 2, y, { align: 'center' });
    } else if (align === 'right') {
      doc.text(String(str), W - 5, y, { align: 'right' });
    } else {
      doc.text(String(str), 5, y);
    }
    y += size * 0.42 + 1.2;
  };

  const lineSep = (dashed = false) => {
    y += 1;
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.25);
    if (dashed) {
      doc.setLineDashPattern([1, 1], 0);
    } else {
      doc.setLineDashPattern([], 0);
    }
    doc.line(5, y, W - 5, y);
    doc.setLineDashPattern([], 0);
    y += 3.5;
  };

  // 1. Official Super Shop Header Block
  text(sale.tenantName || 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা', 11, true, 'center', '#0f172a');
  text(sale.tagline || 'WHOLESALE & GODOWN DIVISION', 7, true, 'center', '#475569');
  text(sale.address || 'Wholesale & Godown Division — Dhaka', 7.5, false, 'center', '#334155');
  text(`Hotline: ${sale.phone || '+880 1700-000000'} | VAT BIN: ${sale.vatBin || '00129384-0101'}`, 6.5, false, 'center', '#64748b');
  lineSep(false);

  // Copy Badge Box
  const copyLabel = type === 'customer' ? 'CUSTOMER INVOICE COPY' : 'COMPANY AUDIT COPY';
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, y - 1, W - 24, 6, 1.5, 1.5, 'FD');
  y += 3.5;
  text(copyLabel, 7.5, true, 'center', '#0f172a');
  y += 2.5;

  // 2. Transaction Metadata Block
  const receiptNo = sale.receiptNo || sale.id || 'INV-0001';
  const dtStr = sale.saleDate?.toDate?.()?.toLocaleString('en-GB') || new Date().toLocaleString('en-GB');
  text(`Invoice No : ${receiptNo}`, 8, true);
  text(`Date & Time: ${dtStr}`, 7.5);
  text(`Issued By  : ${sale.soldByName || sale.soldBy || 'Wholesale Officer'}`, 7.5);
  text(`Payment    : ${sale.paymentMethod || 'Cash'}`, 7.5);
  if (sale.buyerName || sale.customerName) {
    text(`Client     : ${sale.buyerName || sale.customerName}`, 7.5, true);
  }
  if (sale.buyerPhone || sale.phone) {
    text(`Phone      : ${sale.buyerPhone || sale.phone}`, 7.5);
  }
  lineSep(true);

  // 3. Itemized Table Header
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#0f172a');
  doc.text('ITEM DESCRIPTION', 5, y);
  doc.text('QTY x RATE', 44, y);
  doc.text('TOTAL', W - 5, y, { align: 'right' });
  y += 3.5;
  lineSep(false);

  // 4. Items List
  items.forEach((item, index) => {
    const entity = entities.find(e => e.id === item.entityId);
    const rawName = entity 
      ? `${entity.brand} ${entity.productType} ${entity.flavor || ''}`.trim() 
      : (item.productName || item.entityId || 'Item');
    
    // Wrap item name neatly to max width 37mm
    const lines = doc.splitTextToSize(`${index + 1}. ${rawName}`, 37);

    const qty = Number(item.qty || 1);
    const price = Number(item.unitPrice || item.price || 0);
    const lineTotal = qty * price;

    // Print first line + QtyxRate + Total on the same startY
    const startY = y;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#0f172a');
    doc.text(String(lines[0] || ''), 5, startY);

    doc.setFont('helvetica', 'normal');
    doc.text(`${qty} ${item.unit || 'pcs'} x ${price.toLocaleString()}`, 44, startY);

    doc.setFont('helvetica', 'bold');
    doc.text(formatTk(lineTotal), W - 5, startY, { align: 'right' });

    // Print subsequent wrapped lines cleanly below startY
    if (lines.length > 1) {
      for (let idx = 1; idx < lines.length; idx++) {
        y += 3.4;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#334155');
        doc.text(String(lines[idx]), 8, y);
      }
    }

    y += 4.8;
  });

  lineSep(true);

  // 5. Totals & Discount Summary Block
  const subtotal = Number(sale.totalAmount || 0);
  const discount = Number(sale.discount || 0);
  const netAmount = Number(sale.netAmount || (subtotal - discount));

  text(`SUB TOTAL :`, 8, false);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text(formatTk(subtotal), W - 5, y - 3.8, { align: 'right' });

  if (discount > 0) {
    text(`DISCOUNT / SAVINGS :`, 8, false, 'left', '#16a34a');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor('#16a34a');
    doc.text(`- ${formatTk(discount)}`, W - 5, y - 3.8, { align: 'right' });
  }

  lineSep(false);

  // Highlighted Net Total Box
  doc.setFillColor(15, 23, 42);
  doc.rect(5, y - 1, W - 10, 8, 'F');
  y += 4.5;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#ffffff');
  doc.text('NET PAYABLE TOTAL', 8, y);
  doc.text(formatTk(netAmount), W - 8, y, { align: 'right' });
  y += 6.5;

  // Paid Status
  text(`Paid via ${sale.paymentMethod || 'Cash'} : ${formatTk(netAmount)}`, 7.5, false, 'center', '#475569');
  y += 2;
  lineSep(true);

  // 6. Return Policy & POS Barcode Block
  text('RETURN & EXCHANGE POLICY', 7, true, 'center', '#0f172a');
  const policy = doc.splitTextToSize(
    'Goods sold can be exchanged within 3 days with original undamaged invoice. No cash refund permitted.',
    W - 14
  );
  policy.forEach(l => {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    doc.text(l, W / 2, y, { align: 'center' });
    y += 3;
  });

  y += 3;
  // Visual Barcode representation
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  for (let b = 15; b < W - 15; b += 2) {
    const h = (b % 4 === 0) ? 6 : 4;
    doc.line(b, y, b, y + h);
  }
  y += 8;
  text(`* ${receiptNo} *`, 7, true, 'center', '#0f172a');
  y += 2;
  text(`Thank you for choosing ${sale.tenantName || 'মেসার্স ডিজিটাল বিজনেস'}!`, 7.5, true, 'center', '#0d9488');

  doc.save(`${receiptNo}-Godown-${type}.pdf`);
};

/**
 * Generates an authentic Bangladesh Super-Shop (Shwapno/Agora style) 80mm Shop Retail receipt PDF.
 */
export const generateShopReceipt = (sale, products = [], type = 'customer') => {
  const items = sale.items || [];
  const baseHeight = 155;
  const itemHeight = items.length * 12;
  const totalHeight = Math.max(160, baseHeight + itemHeight);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, totalHeight] });
  const W = 80;
  let y = 8;

  const text = (str, size = 8.5, bold = false, align = 'left', color = '#0f172a') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(color);
    if (align === 'center') {
      doc.text(String(str), W / 2, y, { align: 'center' });
    } else if (align === 'right') {
      doc.text(String(str), W - 5, y, { align: 'right' });
    } else {
      doc.text(String(str), 5, y);
    }
    y += size * 0.42 + 1.2;
  };

  const lineSep = (dashed = false) => {
    y += 1;
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.25);
    if (dashed) {
      doc.setLineDashPattern([1, 1], 0);
    } else {
      doc.setLineDashPattern([], 0);
    }
    doc.line(5, y, W - 5, y);
    doc.setLineDashPattern([], 0);
    y += 3.5;
  };

  // 1. Official Super Shop Header Block
  text(sale.tenantName || 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা', 11, true, 'center', '#0f172a');
  text(sale.tagline || 'RETAIL SUPER SHOP DIVISION', 7, true, 'center', '#475569');
  text(sale.address || 'Retail Outlet — Dhaka, Bangladesh', 7.5, false, 'center', '#334155');
  text(`Hotline: ${sale.phone || '+880 1700-000000'} | VAT BIN: ${sale.vatBin || '00129384-0101'}`, 6.5, false, 'center', '#64748b');
  lineSep(false);

  // Copy Badge Box
  const copyLabel = type === 'customer' ? 'CUSTOMER RETAIL INVOICE' : 'STORE POS COPY';
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, y - 1, W - 24, 6, 1.5, 1.5, 'FD');
  y += 3.5;
  text(copyLabel, 7.5, true, 'center', '#0f172a');
  y += 2.5;

  // 2. Transaction Metadata Block
  const receiptNo = sale.receiptNo || sale.id || 'INV-0001';
  const dtStr = sale.saleDate?.toDate?.()?.toLocaleString('en-GB') || new Date().toLocaleString('en-GB');
  text(`Invoice No : ${receiptNo}`, 8, true);
  text(`Date & Time: ${dtStr}`, 7.5);
  text(`Cashier    : ${sale.soldByName || sale.soldBy || 'Counter-01'}`, 7.5);
  text(`Payment    : ${sale.paymentMethod || 'Cash'}`, 7.5);
  if (sale.customerName) {
    text(`Customer   : ${sale.customerName}`, 7.5, true);
  }
  lineSep(true);

  // 3. Itemized Table Header
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#0f172a');
  doc.text('ITEM DESCRIPTION', 5, y);
  doc.text('QTY x RATE', 44, y);
  doc.text('TOTAL', W - 5, y, { align: 'right' });
  y += 3.5;
  lineSep(false);

  // 4. Items List
  items.forEach((item, index) => {
    const rawName = item.productName || item.entityId || 'Item';
    const lines = doc.splitTextToSize(`${index + 1}. ${rawName}`, 37);

    const qty = Number(item.qty || 1);
    const price = Number(item.unitPrice || item.price || 0);
    const lineTotal = qty * price;

    const startY = y;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#0f172a');
    doc.text(String(lines[0] || ''), 5, startY);

    doc.setFont('helvetica', 'normal');
    doc.text(`${qty} ${item.unit || 'pcs'} x ${price.toLocaleString()}`, 44, startY);

    doc.setFont('helvetica', 'bold');
    doc.text(formatTk(lineTotal), W - 5, startY, { align: 'right' });

    if (lines.length > 1) {
      for (let idx = 1; idx < lines.length; idx++) {
        y += 3.4;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#334155');
        doc.text(String(lines[idx]), 8, y);
      }
    }

    y += 4.8;
  });

  lineSep(true);

  // 5. Totals & Discount Summary Block
  const subtotal = Number(sale.totalAmount || 0);
  const discount = Number(sale.discount || 0);
  const netAmount = Number(sale.netAmount || (subtotal - discount));

  text(`SUB TOTAL :`, 8, false);
  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text(formatTk(subtotal), W - 5, y - 3.8, { align: 'right' });

  if (discount > 0) {
    text(`DISCOUNT / SAVINGS :`, 8, false, 'left', '#16a34a');
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor('#16a34a');
    doc.text(`- ${formatTk(discount)}`, W - 5, y - 3.8, { align: 'right' });
  }

  lineSep(false);

  // Highlighted Net Total Box
  doc.setFillColor(15, 23, 42);
  doc.rect(5, y - 1, W - 10, 8, 'F');
  y += 4.5;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#ffffff');
  doc.text('NET PAYABLE TOTAL', 8, y);
  doc.text(formatTk(netAmount), W - 8, y, { align: 'right' });
  y += 6.5;

  // Paid Status
  text(`Paid via ${sale.paymentMethod || 'Cash'} : ${formatTk(netAmount)}`, 7.5, false, 'center', '#475569');
  y += 2;
  lineSep(true);

  // 6. Return Policy & POS Barcode Block
  text('RETURN & EXCHANGE POLICY', 7, true, 'center', '#0f172a');
  const policy = doc.splitTextToSize(
    'Goods sold can be exchanged within 3 days with original undamaged invoice. No cash refund permitted.',
    W - 14
  );
  policy.forEach(l => {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    doc.text(l, W / 2, y, { align: 'center' });
    y += 3;
  });

  y += 3;
  // Visual Barcode representation
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  for (let b = 15; b < W - 15; b += 2) {
    const h = (b % 4 === 0) ? 6 : 4;
    doc.line(b, y, b, y + h);
  }
  y += 8;
  text(`* ${receiptNo} *`, 7, true, 'center', '#0f172a');
  y += 2;
  text('Thank you for shopping with us!', 7.5, true, 'center', '#0d9488');

  doc.save(`${receiptNo}-Shop-${type}.pdf`);
};

/**
 * Instantly opens a formatted thermal 80mm HTML print window for direct printing on ESC/POS thermal printers.
 */
export const printThermalHTMLReceipt = (sale, division = 'Shop Division') => {
  const items = sale.items || [];
  const receiptNo = sale.receiptNo || sale.id || 'INV-0001';
  const dtStr = sale.saleDate?.toDate?.()?.toLocaleString('en-GB') || new Date().toLocaleString('en-GB');
  const subtotal = Number(sale.totalAmount || 0);
  const discount = Number(sale.discount || 0);
  const netAmount = Number(sale.netAmount || (subtotal - discount));

  const printWindow = window.open('', '_blank', 'width=400,height=650');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt ${receiptNo}</title>
      <style>
        @page { size: 80mm auto; margin: 3mm; }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 74mm;
          margin: 0 auto;
          color: #000;
          font-size: 11px;
          line-height: 1.35;
        }
        .header { text-align: center; margin-bottom: 8px; }
        .store-name { font-size: 16px; font-weight: bold; letter-spacing: 0.5px; }
        .tagline { font-size: 10px; font-weight: bold; }
        .meta { font-size: 10px; color: #333; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .solid-divider { border-top: 1px solid #000; margin: 6px 0; }
        .badge {
          border: 1px solid #000;
          padding: 2px 6px;
          font-weight: bold;
          font-size: 10px;
          display: inline-block;
          margin: 4px 0;
        }
        table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin: 6px 0; }
        th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 4px; }
        td { padding: 4px 0; vertical-align: top; }
        .text-right { text-align: right; }
        .total-box {
          border: 2px solid #000;
          padding: 6px 8px;
          margin: 8px 0;
          font-size: 13px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
        }
        .barcode {
          font-family: 'Libre Barcode 39', monospace;
          font-size: 28px;
          text-align: center;
          letter-spacing: 2px;
          margin: 10px 0 4px;
        }
        .footer { text-align: center; font-size: 9.5px; color: #444; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">${sale.tenantName || 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা'}</div>
        <div class="tagline">${sale.tagline || 'রিটেইল সুপার শপ ও ডিজিটাল খাতা'}</div>
        <div class="meta">${division} — Dhaka, Bangladesh</div>
        <div class="meta">Hotline: ${sale.phone || '+880 1700-000000'} | VAT BIN: ${sale.vatBin || '00129384-0101'}</div>
        <div class="badge">CUSTOMER RETAIL INVOICE</div>
      </div>
      <div class="divider"></div>
      <div>
        <strong>Invoice No:</strong> ${receiptNo}<br/>
        <strong>Date &amp; Time:</strong> ${dtStr}<br/>
        <strong>Cashier:</strong> ${sale.soldByName || sale.soldBy || 'Counter-01'}<br/>
        <strong>Payment Mode:</strong> ${sale.paymentMethod || 'Cash'}<br/>
        ${sale.customerName || sale.buyerName ? `<strong>Customer:</strong> ${sale.customerName || sale.buyerName}` : ''}
      </div>
      <div class="divider"></div>
      <table>
        <thead>
          <tr>
            <th style="width: 48%;">Item</th>
            <th style="width: 26%;">Qty x Rate</th>
            <th style="width: 26%;" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((it, idx) => `
            <tr>
              <td>${idx + 1}. ${it.productName || it.entityId || 'Item'}</td>
              <td>${it.qty || 1} x ${(Number(it.unitPrice || it.price || 0)).toLocaleString()}</td>
              <td class="text-right">Tk ${((it.qty || 1) * (Number(it.unitPrice || it.price || 0))).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="solid-divider"></div>
      <div style="display: flex; justify-content: space-between;">
        <span>Sub Total:</span>
        <strong>Tk ${subtotal.toLocaleString()}</strong>
      </div>
      ${discount > 0 ? `
      <div style="display: flex; justify-content: space-between; color: #16a34a;">
        <span>Discount / Savings:</span>
        <strong>- Tk ${discount.toLocaleString()}</strong>
      </div>
      ` : ''}
      <div class="total-box">
        <span>NET PAYABLE TOTAL:</span>
        <span>Tk ${netAmount.toLocaleString()}</span>
      </div>
      <div class="divider"></div>
      <div class="footer">
        <strong>RETURN &amp; EXCHANGE POLICY</strong><br/>
        Goods sold can be exchanged within 3 days with original undamaged invoice.<br/><br/>
        * ${receiptNo} *<br/>
        <strong>Thank you for shopping with us!</strong>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};
