import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { poishaToTaka } from '../../utils/currency';
import { Printer, X, Receipt, ArrowLeft } from 'lucide-react';

export default function Mushak63Invoice({ sale, isOpen, onClose, onSwitchToThermal }) {
  const { isBengali, formatNumber } = useLocale();
  const { activeTenant } = useTenant();

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const vatRate = 0.05; // 5% standard retail VAT
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl sm:max-w-5xl w-full flex flex-col max-h-[94vh] overflow-hidden border border-gray-200">
        {/* Top Control Bar */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-[#E2136E]" />
            <span className="text-xs font-bold text-gray-800">
              {isBengali ? 'জাতীয় রাজস্ব বোর্ড (NBR) মূসক-৬.৩ কর চালানপত্র' : 'NBR Form Mushak-6.3 Tax Invoice'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToThermal && (
              <button
                onClick={onSwitchToThermal}
                className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {isBengali ? '← থার্মাল মোড' : '← Thermal Mode'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#E2136E] hover:bg-[#c0105d] transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Printer size={13} />
              <span>{isBengali ? 'প্রিন্ট চালান' : 'Print A4/A5'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Mushak Form */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-gray-100 flex justify-center custom-scrollbar">
          <div
            id="mushak-63-form"
            className="bg-white shadow p-6 sm:p-8 max-w-4xl w-full text-gray-900 font-sans text-xs border border-gray-300 rounded-sm"
          >
            {/* Government Heading */}
            <div className="text-center pb-3 border-b-2 border-gray-800">
              <h3 className="text-xs font-medium">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h3>
              <h2 className="text-sm font-extrabold text-gray-900">জাতীয় রাজস্ব বোর্ড, ঢাকা</h2>
              <h1 className="text-base font-black tracking-wide text-[#E2136E] mt-1">
                কর চালানপত্র (TAX INVOICE)
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                [বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও (চ) দ্রষ্টব্য]
              </p>
              <span className="inline-block mt-1 px-3 py-0.5 border border-gray-800 rounded text-[11px] font-bold">
                মূসক-৬.৩ / MUSHAK-6.3
              </span>
            </div>

            {/* Vendor & Buyer Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-3 border-b border-gray-300 text-[11px]">
              <div>
                <p>
                  <strong>নিবন্ধিত ব্যক্তির নাম:</strong> {activeTenant?.name || 'স্বত্ব সুপার শপ ও ডিপার্টমেন্টাল স্টোর'}
                </p>
                <p>
                  <strong>বিআইএন (BIN):</strong> {activeTenant?.bin || '00129384-0101'}
                </p>
                <p>
                  <strong>চালান ইস্যুর ঠিকানা:</strong> {activeTenant?.address || 'দোকান নং ৪২, নিউ মার্কেট, ঢাকা'}
                </p>
              </div>
              <div className="sm:text-right">
                <p>
                  <strong>চালানপত্র নম্বর:</strong> {invoiceNumber}
                </p>
                <p>
                  <strong>ইস্যুর তারিখ ও সময়:</strong> {new Date(sale.timestamp || Date.now()).toLocaleString()}
                </p>
                <p>
                  <strong>ক্রেতার নাম:</strong> {sale.customerName || 'সাধারণ খুচরা গ্রাহক (Retail Counter)'}
                </p>
              </div>
            </div>

            {/* Items Breakdown Table with Horizontal Containment */}
            <div className="w-full overflow-x-auto my-3 border border-gray-400 rounded-sm">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-400 text-center font-bold">
                    <th className="p-1.5 border-r border-gray-300 w-8">ক্র.</th>
                    <th className="p-1.5 border-r border-gray-300 text-left min-w-[120px]">পণ্য বা সেবার বিবরণ</th>
                    <th className="p-1.5 border-r border-gray-300 w-12 text-center">একক</th>
                    <th className="p-1.5 border-r border-gray-300 w-12 text-center">পরিমাণ</th>
                    <th className="p-1.5 border-r border-gray-300 w-20 text-right">একক মূল্য (৳)</th>
                    <th className="p-1.5 border-r border-gray-300 w-24 text-right">মূল্য (কর ছাড়া)</th>
                    <th className="p-1.5 border-r border-gray-300 w-14 text-center">মূসক হার</th>
                    <th className="p-1.5 border-r border-gray-300 w-20 text-right">মূসক (৳)</th>
                    <th className="p-1.5 text-right w-24">সর্বমোট (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {processedItems.map((item) => (
                    <tr key={item.idx} className="hover:bg-gray-50 text-[10px]">
                      <td className="p-1.5 border-r border-gray-300 text-center">{item.idx}</td>
                      <td className="p-1.5 border-r border-gray-300 font-semibold">{item.name}</td>
                      <td className="p-1.5 border-r border-gray-300 text-center">{item.unit}</td>
                      <td className="p-1.5 border-r border-gray-300 text-center font-bold">{item.quantity}</td>
                      <td className="p-1.5 border-r border-gray-300 text-right">{item.unitPrice}</td>
                      <td className="p-1.5 border-r border-gray-300 text-right">{item.baseVal}</td>
                      <td className="p-1.5 border-r border-gray-300 text-center">{item.vatPercentText}</td>
                      <td className="p-1.5 border-r border-gray-300 text-right">{item.vatVal}</td>
                      <td className="p-1.5 text-right font-bold">{item.lineTotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-400 text-[10px]">
                    <td colSpan="5" className="p-1.5 text-right border-r border-gray-300">
                      সর্বমোট যোগফল (Total):
                    </td>
                    <td className="p-1.5 text-right border-r border-gray-300">{totalTaxableValue}</td>
                    <td className="p-1.5 border-r border-gray-300"></td>
                    <td className="p-1.5 text-right border-r border-gray-300">{totalVatAmount}</td>
                    <td className="p-1.5 text-right text-xs text-[#E2136E] font-black">{totalTaka.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Note & Authorized Signature */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px]">
              <div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  * এটি জাতীয় রাজস্ব বোর্ডের ভ্যাট আইন ২০১২ অনুযায়ী সিস্টেম জেনারেটেড ডিজিটাল মূসক-৬.৩ কর চালান।
                  কোনো ধরনের কাটাকাটি বা ঘষামাজা গ্রহণযোগ্য নয়।
                </p>
              </div>
              <div className="text-center pt-6 sm:pt-8 border-t border-gray-600 sm:border-t-0 sm:border-t border-gray-600">
                <p className="font-bold text-gray-800">কর্তৃপক্ষের স্বাক্ষর ও সীলমোহর</p>
                <p className="text-[10px] text-gray-500">Authorized Signature & Seal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
