const fs = require('fs');

let rowData = [
  '2026-11-03T18:24:52.840Z',
  'DRV-DAC-8921',
  'Kamal Uddin Majumdar',
  '+880 1911 223344',
  '1988269458000192', // Currently in Col E (should be Col F)
  'Dhaka - Gulshan & Airport', // Col F (should be Col G)
  'Rehana Begum (+880 1911 223344)',
  'DL-DH-77889'
];

console.log('Row has Col E as NID:', /^[0-9]{10,17}$/.test(rowData[4]));

if (/^[0-9]{10,17}$/.test(rowData[4])) {
  const digits = rowData[3].replace(/[^0-9]/g, '');
  const cleanPhone = digits.startsWith('0') ? '880' + digits.substring(1) : (digits.startsWith('880') ? digits : '880' + digits);
  const waFormula = '=HYPERLINK("https://wa.me/' + cleanPhone + '", "🟢 Chat on WhatsApp")';
  rowData.splice(4, 0, waFormula);
  console.log('Realigned row successfully!');
  console.log('  Col D (Phone):', rowData[3]);
  console.log('  Col E (WhatsApp Action):', rowData[4]);
  console.log('  Col F (NID Number):', rowData[5]);
  console.log('  Col G (District):', rowData[6]);
}

