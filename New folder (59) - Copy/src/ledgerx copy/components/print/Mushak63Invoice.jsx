import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { poishaToTaka, formatCurrency } from '../../utils/currency';
import { Printer, X, Receipt, ArrowLeft, ShieldCheck, Building2 } from 'lucide-react';

/**
 * Converts numeric Taka into Bengali words for NBR statutory compliance
 */
function takaToWordsBengali(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));
  if (num === 0) return 'শূন্য টাকা মাত্র';

  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
    'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
    'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
    'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
    'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
    'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
    'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
    'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
    'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই', 'নব্বই',
    'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'];

  function convertTwoDigits(n) {
    return units[n] || '';
  }

  let words = '';

  const crore = Math.floor(num / 10000000);
  let rem = num % 10000000;

  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;

  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;

  const hundred = Math.floor(rem / 100);
  rem = rem % 100;

  if (crore > 0) {
    words += `${takaToWordsBengali(crore).replace(' টাকা মাত্র', '')} কোটি `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} লাখ `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} হাজার `;
  }
  if (hundred > 0) {
    words += `${units[hundred]} শত `;
  }
  if (rem > 0) {
    words += `${convertTwoDigits(rem)} `;
  }

  return `${words.trim()} টাকা মাত্র`;
}

export default function Mushak63Invoice({ sale, isOpen, onClose, onSwitchToThermal }) {
  const { isBengali } = useLocale();
  const { activeTenant } = useTenant();

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const vatRate = 0.05; // 5% retail standard VAT
  const grandTotalPoisha = sale.grandTotalPoisha ?? sale.totalPoisha ?? 0;
  const totalTaka = poishaToTaka(grandTotalPoisha);

  const invoiceNumber = sale.memoNumber 
    || sale.invoiceNumber 
    || (sale.id ? (String(sale.id).startsWith('INV-') ? sale.id : `INV-${String(sale.id).slice(-8)}`) : `INV-${new Date(sale.timestamp || Date.now()).getTime().toString().slice(-6)}`);

  // Correct calculation for each item
  const processedItems = (sale.items || []).map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const unitPrice = poishaToTaka(item.unitPricePoisha || 0);
    const lineDiscountTaka = poishaToTaka(item.lineDiscountPoisha || 0);
    const lineTotalTaka = item.lineTotalPoisha !== undefined
      ? poishaToTaka(item.lineTotalPoisha)
      : Math.max(0, (qty * unitPrice) - lineDiscountTaka);

    const itemVatPercent = item.vatPercent !== undefined ? item.vatPercent : 5;
    const itemVatRate = itemVatPercent / 100;
    const baseVal = Number((lineTotalTaka / (1 + itemVatRate)).toFixed(2));
    const vatVal = Number((lineTotalTaka - baseVal).toFixed(2));

    return {
      ...item,
      idx: idx + 1,
      name: item.name,
      unit: item.unitName || item.unit || 'পিস',
      quantity: qty,
      unitPrice: unitPrice.toFixed(2),
      baseVal: baseVal.toFixed(2),
      vatPercentText: `${itemVatPercent}%`,
      vatVal: vatVal.toFixed(2),
      sdVal: '০.০০',
      lineTotal: lineTotalTaka.toFixed(2),
      numericBaseVal: baseVal,
      numericVatVal: vatVal,
    };
  });

  const totalTaxableValue = processedItems.length > 0 
    ? processedItems.reduce((acc, it) => acc + it.numericBaseVal, 0).toFixed(2)
    : (totalTaka / (1 + vatRate)).toFixed(2);
    
  const totalVatAmount = processedItems.length > 0
    ? processedItems.reduce((acc, it) => acc + it.numericVatVal, 0).toFixed(2)
    : (totalTaka - Number(totalTaxableValue)).toFixed(2);

  const totalInWords = takaToWordsBengali(totalTaka);

  const sellerName = activeTenant?.name || 'মেসার্স ডিজিটাল বিজনেস ও সার্বজনীন খাতা';
  const sellerBin = activeTenant?.vatBinNumber || activeTenant?.bin || '00129384-0101';
  const sellerAddress = activeTenant?.address || 'আউটলেট ০১, ঢাকা, বাংলাদেশ';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl sm:max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden border border-gray-300">
        
        {/* Top Control Bar (Non-printable) */}
        <div className="p-3 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Receipt size={16} />
            </span>
            <div>
              <span className="text-xs font-bold text-white block leading-tight">
                {isBengali ? 'জাতীয় রাজস্ব বোর্ড (NBR) মূসক-৬.৩ কর চালানপত্র' : 'NBR Form Mushak-6.3 Statutory Tax Invoice'}
              </span>
              <span className="text-[10px] text-slate-400">
                {sellerName} • {invoiceNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToThermal && (
              <button
                type="button"
                onClick={onSwitchToThermal}
                className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                {isBengali ? '← থার্মাল মোড' : '← Thermal Mode'}
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 border border-slate-700 shadow-md cursor-pointer active:scale-95"
            >
              <Printer size={14} />
              <span>{isBengali ? 'প্রিন্ট কর চালান (A4)' : 'Print Mushak-6.3'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Mushak Form */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center custom-scrollbar">
          <div
            id="mushak-63-form"
            className="bg-white shadow-md p-6 sm:p-8 max-w-4xl w-full text-slate-900 font-sans text-xs border border-slate-300 rounded-sm"
          >
            {/* Government Heading */}
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <h3 className="text-xs font-bold text-slate-700">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
              <h2 className="text-sm font-extrabold text-slate-900">জাতীয় রাজস্ব বোর্ড, ঢাকা</h2>
              <h1 className="text-base font-black tracking-wide text-slate-900 mt-0.5">
                কর চালানপত্র (TAX INVOICE)
              </h1>
              <p className="text-[10.5px] text-slate-600 font-semibold mt-0.5">
                [মূসক ও সম্পূরক শুল্ক বিধিমালা, ২০১৬ এর বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও (চ) দ্রষ্টব্য]
              </p>
              <div className="inline-block mt-1.5 px-3 py-0.5 border border-slate-800 rounded bg-slate-50 text-[11px] font-black uppercase tracking-wider">
                মূসক-৬.৩ / FORM MUSHAK-6.3
              </div>
            </div>

            {/* Vendor & Buyer Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-slate-300 text-[11px] leading-relaxed">
              <div className="space-y-0.5">
                <p>
                  <strong>নিবন্ধিত সরবরাহকারীর নাম:</strong> <span className="font-semibold text-slate-900">{sellerName}</span>
                </p>
                <p>
                  <strong>ব্যবসায় সনাক্তকরণ সংখ্যা (BIN):</strong> <span className="font-mono font-bold text-slate-900">{sellerBin}</span>
                </p>
                <p>
                  <strong>চালান ইস্যুর ঠিকানা:</strong> <span className="text-slate-700">{sellerAddress}</span>
                </p>
                <p>
                  <strong>সরবরাহের প্রকৃতি:</strong> <span className="text-slate-700">খুচরা ও পাইকারি বিক্রয়</span>
                </p>
              </div>

              <div className="sm:text-right space-y-0.5">
                <p>
                  <strong>চালানপত্র নম্বর:</strong> <span className="font-mono font-black text-slate-900">{invoiceNumber}</span>
                </p>
                <p>
                  <strong>ইস্যুর তারিখ ও সময়:</strong> <span className="font-mono">{new Date(sale.timestamp || Date.now()).toLocaleString()}</span>
                </p>
                <p>
                  <strong>ক্রেতার নাম:</strong> <span className="font-semibold text-slate-900">{sale.customerName || 'সাধারণ খুচরা ক্রেতা (Retail Counter)'}</span>
                </p>
                <p>
                  <strong>ক্রেতার বিআইএন/এনআইডি/মোবাইল:</strong> <span className="font-mono">{sale.customerBin || sale.customerPhone || 'প্রযোজ্য নয়'}</span>
                </p>
                <p>
                  <strong>গন্তব্যস্থল ও পরিবহনের বিবরণ:</strong> <span className="text-slate-700">{sale.destination || 'কাউন্টার ডেলিভারি / লোকাল ভ্যান'}</span>
                </p>
              </div>
            </div>

            {/* 9-Column Statutory Tax Invoice Table */}
            <div className="w-full overflow-x-auto my-3 border border-slate-800 rounded-xs">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-800 text-center font-bold text-slate-900">
                    <th className="p-1.5 border-r border-slate-300 w-8">ক্রমিক</th>
                    <th className="p-1.5 border-r border-slate-300 text-left min-w-[130px]">পণ্য বা সেবার বিবরণ ও সনাক্তকরণ</th>
                    <th className="p-1.5 border-r border-slate-300 w-12 text-center">একক</th>
                    <th className="p-1.5 border-r border-slate-300 w-12 text-center">পরিমাণ</th>
                    <th className="p-1.5 border-r border-slate-300 w-20 text-right">একক মূল্য (কর ছাড়া ৳)</th>
                    <th className="p-1.5 border-r border-slate-300 w-24 text-right">মোট মূল্য (কর ছাড়া ৳)</th>
                    <th className="p-1.5 border-r border-slate-300 w-16 text-right">সম্পূরক শুল্ক (৳)</th>
                    <th className="p-1.5 border-r border-slate-300 w-20 text-right">মূসক (হার ও ৳)</th>
                    <th className="p-1.5 text-right w-24">সর্বমোট মূল্য (করসহ ৳)</th>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-400 text-center text-[8.5px] text-slate-500 font-mono">
                    <th className="p-0.5 border-r border-slate-300">(১)</th>
                    <th className="p-0.5 border-r border-slate-300">(২)</th>
                    <th className="p-0.5 border-r border-slate-300">(৩)</th>
                    <th className="p-0.5 border-r border-slate-300">(৪)</th>
                    <th className="p-0.5 border-r border-slate-300">(৫)</th>
                    <th className="p-0.5 border-r border-slate-300">(৬=৪×৫)</th>
                    <th className="p-0.5 border-r border-slate-300">(৭)</th>
                    <th className="p-0.5 border-r border-slate-300">(৮)</th>
                    <th className="p-0.5 text-right pr-1.5">(৯=৬+৭+৮)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {processedItems.map((item) => (
                    <tr key={item.idx} className="hover:bg-slate-50 text-[10px]">
                      <td className="p-1.5 border-r border-slate-300 text-center font-mono">{item.idx}</td>
                      <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-900">
                        {item.name}
                        {item.sku && <span className="block text-[8.5px] text-slate-500 font-mono">SKU: {item.sku}</span>}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center">{item.unit}</td>
                      <td className="p-1.5 border-r border-slate-300 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{item.unitPrice}</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">{item.baseVal}</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono text-slate-500">{item.sdVal}</td>
                      <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                        <span className="text-[8.5px] text-slate-500 mr-1">({item.vatPercentText})</span>
                        {item.vatVal}
                      </td>
                      <td className="p-1.5 text-right font-mono font-bold text-slate-900">{item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-[10.5px]">
                    <td colSpan="5" className="p-1.5 text-right border-r border-slate-300 uppercase">
                      সর্বমোট যোগফল (TOTAL):
                    </td>
                    <td className="p-1.5 text-right font-mono border-r border-slate-300">{totalTaxableValue}</td>
                    <td className="p-1.5 text-right font-mono border-r border-slate-300">০.০০</td>
                    <td className="p-1.5 text-right font-mono border-r border-slate-300">{totalVatAmount}</td>
                    <td className="p-1.5 text-right font-mono text-xs text-slate-900 font-black">{totalTaka.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* In Words Statutory Requirement */}
            <div className="py-2 px-3 bg-slate-50 border border-slate-300 rounded text-[11px] font-bold text-slate-800 mb-6">
              <span>কথায়: </span>
              <span className="font-extrabold text-slate-900">{totalInWords}</span>
            </div>

            {/* Statutory Compliance Note & Dual Signature & Seal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[11px] pt-4">
              <div>
                <p className="text-[9.5px] text-slate-500 leading-relaxed border-l-2 border-slate-400 pl-2">
                  * এটি জাতীয় রাজস্ব বোর্ডের ভ্যাট আইন ২০১২ ও বিধিমালা ২০১৬ অনুযায়ী সিস্টেম জেনারেটেড ডিজিটাল মূসক-৬.৩ কর চালানপত্র। কোনো ধরনের কাটাকাটি বা ঘষামাজা গ্রহণযোগ্য নয়।
                </p>
                <div className="mt-3 text-[9px] text-slate-400">
                  সফটওয়্যার সরবরাহকারী: LedgerX Digital Khata OS (NBR Certified Schema)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="border-t border-slate-800 pt-2">
                  <p className="font-bold text-slate-800 text-[10.5px]">গ্রহীতার স্বাক্ষর</p>
                  <p className="text-[9px] text-slate-500">Receiver's Signature</p>
                </div>
                <div className="border-t border-slate-800 pt-2">
                  <p className="font-bold text-slate-800 text-[10.5px]">দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর ও সীলমোহর</p>
                  <p className="text-[9px] text-slate-500">Authorized Signature & Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

