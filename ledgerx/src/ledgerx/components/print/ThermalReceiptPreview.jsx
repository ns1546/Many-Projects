import React, { useState } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { useKhata } from '../../context/KhataContext';
import { poishaToTaka, formatCurrency } from '../../utils/currency';
import { Printer, X, FileText, QrCode, DollarSign, Check, Store, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ThermalReceiptPreview({ sale, isOpen, onClose, onSwitchToMushak }) {
  const { isBengali, locale } = useLocale();
  const { activeTenant, printerConfig } = useTenant();
  const { customers } = useKhata ? useKhata() : { customers: [] };

  const cfg = printerConfig || activeTenant?.printerConfig || {};
  const [paperWidth, setPaperWidth] = useState(cfg.paperWidth || activeTenant?.paperWidth || '58mm'); // '58mm' | '80mm'

  if (!isOpen || !sale) return null;

  const totalPoisha = sale.grandTotalPoisha ?? sale.totalPoisha ?? 0;
  const subtotalPoisha = sale.subtotalPoisha ?? totalPoisha;
  const discountPoisha = sale.discountPoisha ?? 0;

  // Resolve customer khata details for due and returnable containers
  const matchedCustomer = sale.customerId ? customers?.find((c) => c.id === sale.customerId) : null;
  const prevDuePoisha = sale.previousDuePoisha ?? (matchedCustomer?.currentDuePoisha || matchedCustomer?.balancePoisha || 0);
  const currentSaleDuePoisha = sale.dueAmountPoisha || 0;
  const totalOutstandingDuePoisha = prevDuePoisha + currentSaleDuePoisha;
  const containersDueCount = sale.containersDueCount ?? (matchedCustomer?.containersDueCount || 0);

  const handlePrint = () => {
    // If Electron is present, invoke raw ESC/POS spooler
    if (window.electronAPI?.printRawEscpos) {
      window.electronAPI.printRawEscpos({
        saleId: sale.id,
        items: sale.items,
        totalPoisha,
        printerConfig: cfg,
      });
      toast.success(isBengali ? 'থার্মাল প্রিন্টারে পাঠানো হয়েছে!' : 'Sent to thermal printer!');
    } else {
      // Standard browser print dialog
      window.print();
    }
  };

  const handleKickDrawer = () => {
    if (window.electronAPI?.kickCashDrawer) {
      window.electronAPI.kickCashDrawer();
      toast.success(isBengali ? 'ক্যাশ ড্রয়ার খোলা হয়েছে!' : 'Cash drawer kicked open!');
    } else {
      toast(isBengali ? 'ড্রয়ার ওপেন সিগন্যাল পাঠানো হয়েছে (ESC p 0 25 250)' : 'Drawer kick pulse simulated', {
        icon: '💵',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 animate-in zoom-in-95">
        {/* Header Controls */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#E2136E]/10 text-[#E2136E] flex items-center justify-center">
              <Printer size={18} />
            </span>
            <div>
              <span className="text-sm font-black text-slate-900 block leading-tight">
                {isBengali ? 'থার্মাল ক্যাশ মেমো রসিদ' : 'Thermal Cash Memo'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {cfg.receiptTitle || (isBengali ? 'ক্যাশ মেমো' : 'Cash Memo')}
              </span>
            </div>
            <div className="flex bg-slate-200 p-0.5 rounded-xl text-xs font-bold ml-2">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  paperWidth === '58mm' ? 'bg-white shadow-xs text-[#E2136E]' : 'text-slate-600'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  paperWidth === '80mm' ? 'bg-white shadow-xs text-[#E2136E]' : 'text-slate-600'
                }`}
              >
                80mm
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToMushak && (
              <button
                type="button"
                onClick={onSwitchToMushak}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition cursor-pointer"
              >
                <FileText size={14} />
                <span>{isBengali ? 'মূসক ৬.৩ চালান' : 'Mushak 6.3'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div
            id="thermal-receipt"
            className="bg-white shadow-md p-5 text-slate-900 font-mono text-xs transition-all border border-slate-300 rounded-sm"
            style={{
              width: paperWidth === '58mm' ? '250px' : '350px',
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            {/* Store Banner */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              {cfg.showBismillah && (
                <p className="text-[10px] font-bold text-slate-700 mb-1 tracking-wide">
                  {cfg.headerCustomText || 'বিসমিল্লাহির রাহমানির রাহিম'}
                </p>
              )}
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {cfg.shopTitle || activeTenant?.name || 'LEDGERX STORE'}
              </h2>
              {cfg.shopSubtitle && (
                <p className="text-[10px] font-medium text-slate-600 leading-tight mt-0.5">
                  {cfg.shopSubtitle}
                </p>
              )}
              <p className="text-[10px] leading-tight text-slate-600 mt-0.5">
                {cfg.shopAddress || activeTenant?.address || 'ঢাকা, বাংলাদেশ'}
              </p>
              <p className="text-[10px] text-slate-600">
                মোবাইল: {cfg.shopPhone || activeTenant?.phone || '০১৭০০-০০০০০০'}
                {cfg.showVatBin && (cfg.vatBinNumber || activeTenant?.vatBinNumber) && (
                  <span> | BIN: {cfg.vatBinNumber || activeTenant?.vatBinNumber}</span>
                )}
                {cfg.drugLicenseNo && (
                  <span> | ড্রাগ লাইসেন্স: {cfg.drugLicenseNo}</span>
                )}
              </p>
              <div className="mt-1.5 inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[9px] font-bold text-slate-800 uppercase">
                *** {cfg.receiptTitle || 'ক্যাশ মেমো'} ***
              </div>
            </div>

            {/* Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>MEMO: #{sale.memoNumber || String(sale.id || Date.now()).slice(-8)}</span>
                <span>{new Date(sale.timestamp || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE: {new Date(sale.timestamp || Date.now()).toLocaleDateString()}</span>
                <span>POS: #01</span>
              </div>
              {cfg.showCashierName && (
                <div className="flex justify-between text-slate-600">
                  <span>কাউন্টার: #০১</span>
                  <span>ক্যাশিয়ার: {sale.cashierName || 'শামীম'}</span>
                </div>
              )}
              {sale.customerName && (
                <div className="pt-0.5 font-bold text-slate-800 flex justify-between">
                  <span>গ্রাহক: {sale.customerName}</span>
                  {sale.customerPhone && <span className="font-normal text-slate-600">{sale.customerPhone}</span>}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px]">
              <div className="flex justify-between font-bold pb-1 text-[10px] border-b border-slate-300">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/4 text-center">QTY</span>
                <span className="w-1/4 text-right">TOTAL</span>
              </div>
              <div className="divide-y divide-dotted divide-slate-200 py-1">
                {(sale.items || []).map((item, idx) => {
                  const lineTotal = item.lineTotalPoisha ?? Math.round(item.quantity * item.unitPricePoisha);
                  return (
                    <div key={idx} className="py-1">
                      <div className="font-semibold truncate">{item.name}</div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>
                          {item.quantity} {item.unitName || item.unit || 'পিস'} @ ৳{poishaToTaka(item.unitPricePoisha).toFixed(2)}
                        </span>
                        <span className="font-bold text-slate-900">
                          ৳{poishaToTaka(lineTotal).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculations */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>৳{poishaToTaka(subtotalPoisha).toFixed(2)}</span>
              </div>
              {discountPoisha > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>DISCOUNT:</span>
                  <span>-৳{poishaToTaka(discountPoisha).toFixed(2)}</span>
                </div>
              )}
              {sale.vatPoisha > 0 && (
                <div className="flex justify-between">
                  <span>VAT (NBR 6.3):</span>
                  <span>৳{poishaToTaka(sale.vatPoisha).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1.5 border-t border-slate-800">
                <span>NET TOTAL:</span>
                <span>৳{poishaToTaka(totalPoisha).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>পরিশোধ (নগদ ক্যাশ):</span>
                <span className="font-bold">৳{poishaToTaka(sale.cashPoisha || (sale.dueAmountPoisha === 0 ? totalPoisha : 0)).toFixed(2)}</span>
              </div>
              {sale.bkashPoisha > 0 && (
                <div className="flex justify-between text-[#E2136E]">
                  <span>পরিশোধ (বিকাশ মার্চেন্ট):</span>
                  <span className="font-bold">৳{poishaToTaka(sale.bkashPoisha).toFixed(2)}</span>
                </div>
              )}
              {sale.dueAmountPoisha > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>বর্তমান বিলে বাকি:</span>
                  <span>৳{poishaToTaka(sale.dueAmountPoisha).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Customer Due Khata Statement (Configurable by Dokan Malik) */}
            {cfg.showCustomerDue && (sale.dueAmountPoisha > 0 || prevDuePoisha > 0) && (
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5 bg-amber-50/60 p-2 rounded">
                <p className="font-bold text-amber-900 border-b border-amber-200 pb-0.5">গ্রাহকের সর্বমোট বকেয়া খাতা:</p>
                <div className="flex justify-between text-slate-700">
                  <span>পূর্বের বকেয়া পাওনা:</span>
                  <span>৳{poishaToTaka(prevDuePoisha).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>বর্তমান বিল বাকি:</span>
                  <span>৳{poishaToTaka(currentSaleDuePoisha).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-amber-900 pt-0.5 border-t border-amber-300">
                  <span>সর্বমোট বকেয়া জের:</span>
                  <span>৳{poishaToTaka(totalOutstandingDuePoisha).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Returnable Containers Khata on Challan (Crates, Sacks, Gas Cylinders) */}
            {cfg.showReturnableContainers && containersDueCount > 0 && (
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] bg-slate-50 p-2 rounded">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>বকেয়া খালি ক্যারেট / বস্তা দেনা:</span>
                  <span className="text-[#E2136E] font-black">{containersDueCount} টি</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-0.5">পরবর্তী চালানে খালি পাত্র ফেরত প্রযোজ্য</p>
              </div>
            )}

            {/* bKash Dynamic QR representation (Configurable) */}
            {cfg.showBkashQr && (
              <div className="py-2.5 text-center border-b border-dashed border-slate-400">
                <div className="w-24 h-24 mx-auto bg-slate-50 border border-slate-300 rounded-xl p-1.5 flex flex-col items-center justify-center">
                  <QrCode size={56} className="text-[#E2136E]" />
                  <span className="text-[8px] font-bold text-[#E2136E] uppercase tracking-tighter mt-0.5">
                    Scan to Pay bKash
                  </span>
                </div>
                <p className="text-[9px] text-slate-600 font-bold mt-1">
                  মার্চেন্ট বিকাশ: {cfg.bkashMerchantNumber || activeTenant?.bKashMerchantNumber || activeTenant?.phone || '০১৭১১-০০০০০০'}
                </p>
                <p className="text-[8px] text-slate-400">
                  Ref: #{String(sale.id || Date.now()).slice(-8)} | Amt: ৳{poishaToTaka(totalPoisha).toFixed(2)}
                </p>
              </div>
            )}

            {/* Return Policy & Terms */}
            {cfg.returnPolicy && (
              <div className="py-2 border-b border-dashed border-slate-400 text-[9px] text-slate-600 leading-tight">
                <p className="font-bold text-slate-700 mb-0.5">শর্তাবলী ও ফেরত নীতি:</p>
                <p>{cfg.returnPolicy}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-2.5 text-[9px] text-slate-500">
              <p className="font-bold text-slate-800">{cfg.footerGreeting || 'THANK YOU FOR YOUR BUSINESS!'}</p>
              <p className="text-[8px] text-slate-400 mt-0.5">Powered by LedgerX Desktop — Digital Khata OS</p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleKickDrawer}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <DollarSign size={16} className="text-emerald-600" />
            <span>{isBengali ? 'ক্যাশ ড্রয়ার খুলুন' : 'Open Drawer'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {isBengali ? 'বন্ধ করুন' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#E2136E] to-[#B00F55] hover:from-[#c0105d] hover:to-[#900c45] shadow-md shadow-pink-600/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Printer size={16} />
              <span>{isBengali ? 'প্রিন্ট মেমো' : 'Print Receipt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

