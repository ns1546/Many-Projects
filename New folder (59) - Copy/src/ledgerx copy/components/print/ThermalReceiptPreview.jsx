import React, { useState, useMemo } from 'react';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { useKhata } from '../../context/KhataContext';
import { poishaToTaka, formatCurrency } from '../../utils/currency';
import { Printer, X, FileText, QrCode, DollarSign, Check, Store, Package, Sparkles, Award } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Generates clean SVG barcode bars for retail memo verification
 */
function ReceiptBarcode({ value = 'POS-1001' }) {
  // Deterministic bar widths based on char codes
  const bars = useMemo(() => {
    const str = String(value).toUpperCase();
    const pattern = [];
    // Guard bars
    pattern.push({ width: 2, isBlack: true });
    pattern.push({ width: 1, isBlack: false });
    pattern.push({ width: 1, isBlack: true });

    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      pattern.push({ width: (code % 3) + 1, isBlack: true });
      pattern.push({ width: ((code >> 1) % 2) + 1, isBlack: false });
      pattern.push({ width: ((code >> 2) % 3) + 1, isBlack: true });
      pattern.push({ width: 1, isBlack: false });
    }

    // Stop bars
    pattern.push({ width: 2, isBlack: true });
    pattern.push({ width: 1, isBlack: false });
    pattern.push({ width: 2, isBlack: true });
    return pattern;
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center my-2 select-none">
      <svg className="h-10 w-full max-w-[200px]" preserveAspectRatio="none" viewBox="0 0 100 36">
        {bars.map((bar, idx) => {
          const totalWidth = bars.reduce((s, b) => s + b.width, 0);
          const xOffset = bars.slice(0, idx).reduce((s, b) => s + b.width, 0);
          const xPercent = (xOffset / totalWidth) * 100;
          const barWidthPercent = (bar.width / totalWidth) * 100;
          if (!bar.isBlack) return null;
          return (
            <rect
              key={idx}
              x={`${xPercent}%`}
              y="0"
              width={`${barWidthPercent}%`}
              height="36"
              fill="#000000"
            />
          );
        })}
      </svg>
      <span className="text-[9px] font-mono tracking-widest text-slate-800 font-bold mt-0.5">
        *{value}*
      </span>
    </div>
  );
}

export default function ThermalReceiptPreview({ sale, isOpen, onClose, onSwitchToMushak }) {
  const { isBengali } = useLocale();
  const { activeTenant, printerConfig } = useTenant();
  const { customers } = useKhata ? useKhata() : { customers: [] };

  const cfg = printerConfig || activeTenant?.printerConfig || {};
  const [paperWidth, setPaperWidth] = useState(cfg.paperWidth || activeTenant?.paperWidth || '80mm'); // '58mm' | '80mm'

  if (!isOpen || !sale) return null;

  const totalPoisha = sale.grandTotalPoisha ?? sale.totalPoisha ?? 0;
  const subtotalPoisha = sale.subtotalPoisha ?? totalPoisha;
  const invoiceDiscountPoisha = sale.discountPoisha ?? 0;

  // Calculate itemized line discounts and total savings (Shwapno signature feature)
  const items = sale.items || [];
  const totalItemCount = items.length;
  const totalQuantityCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const lineDiscountsPoisha = items.reduce((sum, item) => {
    const lineDisc = item.lineDiscountPoisha || 0;
    const mrpDiff = item.mrpPoisha && item.unitPricePoisha && item.mrpPoisha > item.unitPricePoisha
      ? (item.mrpPoisha - item.unitPricePoisha) * (Number(item.quantity) || 1)
      : 0;
    return sum + lineDisc + mrpDiff;
  }, 0);

  const totalSavingsPoisha = lineDiscountsPoisha + invoiceDiscountPoisha;

  // Tendered and change calculation
  const cashPaidPoisha = sale.cashPoisha || (sale.paymentMethod === 'Cash' || !sale.paymentMethod ? (sale.paidPoisha || (sale.dueAmountPoisha === 0 ? totalPoisha : 0)) : 0);
  const cashTenderedPoisha = sale.cashTenderedPoisha || (cashPaidPoisha > totalPoisha ? cashPaidPoisha : totalPoisha);
  const changeReturnedPoisha = sale.changeReturnedPoisha !== undefined
    ? sale.changeReturnedPoisha
    : Math.max(0, cashTenderedPoisha - totalPoisha);

  // Resolve customer khata details for due and returnable containers
  const matchedCustomer = sale.customerId ? customers?.find((c) => c.id === sale.customerId) : null;
  const isOpticsStore = activeTenant?.businessType === 'OPTICS';
  const activePrescription = isOpticsStore ? (sale.prescription || matchedCustomer?.prescription || null) : null;
  const hasValidPrescription = Boolean(
    isOpticsStore &&
    activePrescription &&
    (activePrescription.rightEye?.sph || activePrescription.leftEye?.sph || activePrescription.lensType || activePrescription.doctorName)
  );
  const prevDuePoisha = sale.previousDuePoisha ?? (matchedCustomer?.currentDuePoisha || matchedCustomer?.balancePoisha || 0);
  const currentSaleDuePoisha = sale.dueAmountPoisha || 0;
  const totalOutstandingDuePoisha = prevDuePoisha + currentSaleDuePoisha;
  const containersDueCount = sale.containersDueCount ?? (matchedCustomer?.containersDueCount || 0);

  const memoNumber = sale.memoNumber 
    || sale.invoiceNumber 
    || `POS-${String(sale.id || Date.now()).slice(-8)}`;

  const saleDateObj = new Date(sale.timestamp || sale.saleDate || Date.now());
  const dateFormatted = saleDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeFormatted = saleDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

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

  const shopName = cfg.shopTitle || activeTenant?.name || 'মেসার্স ডিজিটাল বিজনেস ও সুপারশপ';
  const shopSubtitle = cfg.shopSubtitle || activeTenant?.tagline || 'রিটেইল চেইন ও সুপারশপ ডিভিশন';
  const shopAddress = cfg.shopAddress || activeTenant?.address || 'আউটলেট নং ০১, ঢাকা, বাংলাদেশ';
  const shopPhone = cfg.shopPhone || activeTenant?.phone || '০১৭০০-০০০০০০';
  const shopBin = cfg.vatBinNumber || activeTenant?.vatBinNumber || activeTenant?.bin || '00129384-0101';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full flex flex-col max-h-[94vh] overflow-hidden border border-slate-200 animate-in zoom-in-95">
        
        {/* Header Controls (Non-printable) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
              <Printer size={18} />
            </span>
            <div>
              <span className="text-sm font-black text-white block leading-tight">
                {isBengali ? 'সুপারশপ থার্মাল ক্যাশ মেমো' : 'Super Shop Thermal Receipt'}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {isBengali ? 'স্বপ্ন / আগোরা স্ট্যান্ডার্ড ফরম্যাট' : 'Shwapno / Agora Retail Standard'}
              </span>
            </div>
            <div className="flex bg-slate-800 p-0.5 rounded-xl text-xs font-bold ml-2 border border-slate-700">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  paperWidth === '58mm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  paperWidth === '80mm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
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
                className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-xl border border-amber-500/40 transition cursor-pointer"
              >
                <FileText size={14} />
                <span>{isBengali ? 'মূসক ৬.৩ চালান' : 'Mushak 6.3'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center custom-scrollbar">
          <div
            id="thermal-receipt"
            className={`bg-white shadow-md p-4 sm:p-5 text-slate-950 font-mono text-xs transition-all border border-slate-300 rounded-sm ${
              paperWidth === '58mm' ? 'paper-58mm' : 'paper-80mm'
            }`}
            style={{
              width: paperWidth === '58mm' ? '260px' : '360px',
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            {/* ── 1. Store Header Block ─────────────────────────────────── */}
            <div className="text-center pb-2.5 border-b border-dashed border-slate-400">
              <p className="text-[10px] font-bold text-slate-700 tracking-wider mb-0.5">
                {cfg.headerCustomText || 'বিসমিল্লাহির রাহমানির রাহিম'}
              </p>
              
              <h1 className="text-base font-black uppercase tracking-tight text-slate-900 leading-snug">
                {shopName}
              </h1>
              
              <p className="text-[10px] font-semibold text-slate-700 leading-tight">
                {shopSubtitle}
              </p>
              
              <p className="text-[9.5px] leading-tight text-slate-600 mt-0.5">
                {shopAddress}
              </p>
              
              <p className="text-[9.5px] text-slate-600">
                হটলাইন: <strong className="text-slate-800 font-mono">{shopPhone}</strong>
              </p>

              {shopBin && (
                <p className="text-[9.5px] font-bold text-slate-700 mt-0.5">
                  মূসক নিবন্ধন / BIN: <span className="font-mono">{shopBin}</span>
                </p>
              )}

              {cfg.drugLicenseNo && (
                <p className="text-[9px] text-slate-600">
                  ড্রাগ লাইসেন্স: {cfg.drugLicenseNo}
                </p>
              )}

              <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-wider">
                *** {cfg.receiptTitle || (isBengali ? 'ক্যাশ মেমো' : 'CASH MEMO')} ***
              </div>
            </div>

            {/* ── 2. Invoice & Cashier Metadata ─────────────────────────── */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>MEMO NO: <strong className="font-mono">{memoNumber}</strong></span>
                <span>{timeFormatted}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>DATE: <strong className="font-mono">{dateFormatted}</strong></span>
                <span>POS: #01</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>কাউন্টার: #০১</span>
                <span>ক্যাশিয়ার: {sale.cashierName || sale.soldByName || 'অপারেটর'}</span>
              </div>
              
              {sale.customerName ? (
                <div className="pt-1 mt-1 border-t border-dotted border-slate-300 font-bold text-slate-900 flex justify-between">
                  <span>গ্রাহক: {sale.customerName}</span>
                  {sale.customerPhone && <span className="font-mono font-normal text-slate-600">{sale.customerPhone}</span>}
                </div>
              ) : (
                <div className="pt-0.5 text-slate-500 text-[9px]">
                  <span>গ্রাহক: সাধারণ খুচরা ক্রেতা (Walk-in Customer)</span>
                </div>
              )}

              {sale.customerClubId && (
                <div className="text-[9px] text-indigo-900 font-bold">
                  <span>সুপার মেম্বারশিপ আইডি: {sale.customerClubId}</span>
                </div>
              )}
            </div>

            {/* ── 3. Itemized Table (Shwapno Format) ────────────────────── */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[11px]">
              <div className="flex justify-between font-black pb-1 text-[10px] border-b border-slate-900 uppercase">
                <span className="w-1/2">আইটেমের বিবরণ</span>
                <span className="w-1/4 text-center">পরিমাণ</span>
                <span className="w-1/4 text-right">মূল্য (৳)</span>
              </div>
              
              <div className="divide-y divide-dotted divide-slate-200 py-1">
                {items.map((item, idx) => {
                  const qty = Number(item.quantity) || 1;
                  const unitPriceTaka = poishaToTaka(item.unitPricePoisha || 0);
                  const lineTotalPoisha = item.lineTotalPoisha !== undefined 
                    ? item.lineTotalPoisha 
                    : Math.round(qty * (item.unitPricePoisha || 0));
                  const lineTotalTaka = poishaToTaka(lineTotalPoisha);
                  const unitLabel = item.unitName || item.unit || 'পিস';
                  const skuCode = item.sku || item.barcode || '';
                  const lineDiscTaka = poishaToTaka(item.lineDiscountPoisha || 0);

                  return (
                    <div key={idx} className="py-1">
                      {/* Line 1: Item Name */}
                      <div className="font-bold text-slate-900 leading-tight">
                        {idx + 1}. {item.name}
                      </div>

                      {/* Line 2: SKU / Barcode & Rate Breakdown */}
                      <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                        <span className="truncate pr-1">
                          {skuCode && <span className="font-mono text-slate-400 text-[9px] mr-1">[{skuCode}]</span>}
                          {qty} {unitLabel} × ৳{unitPriceTaka.toFixed(2)}
                          {lineDiscTaka > 0 && (
                            <span className="text-emerald-700 font-bold ml-1">
                              (-৳{lineDiscTaka.toFixed(2)})
                            </span>
                          )}
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">
                          ৳{lineTotalTaka.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 4. Item & Quantity Count Strip ───────────────────────── */}
            <div className="py-1.5 border-b border-dashed border-slate-400 flex justify-between text-[10px] font-bold text-slate-700 bg-slate-50 px-1">
              <span>মোট আইটেম: {totalItemCount} টি</span>
              <span>মোট সংখ্যা: {totalQuantityCount} টি</span>
            </div>

            {/* ── 4.5 Optics Prescription Box (চশমার পাওয়ার মেমো) ─────── */}
            {hasValidPrescription && (
              <div className="my-2 p-2 bg-slate-50 border border-dashed border-slate-400 rounded text-[10px] space-y-1">
                <div className="font-bold text-center border-b border-slate-300 pb-1 text-slate-800">
                  👓 চোখের পাওয়ার বিবরণী (PRESCRIPTION MEMO)
                </div>
                <div className="grid grid-cols-5 text-center font-bold text-slate-600 text-[9px] border-b border-slate-200 pb-0.5">
                  <span>চোখ</span>
                  <span>SPH</span>
                  <span>CYL</span>
                  <span>AXIS</span>
                  <span>ADD</span>
                </div>
                <div className="grid grid-cols-5 text-center font-mono font-bold text-slate-900 py-0.5">
                  <span className="font-sans text-left pl-1">OD (ডান)</span>
                  <span>{activePrescription.rightEye?.sph || '-'}</span>
                  <span>{activePrescription.rightEye?.cyl || '-'}</span>
                  <span>{activePrescription.rightEye?.axis || '-'}</span>
                  <span>{activePrescription.rightEye?.add || '-'}</span>
                </div>
                <div className="grid grid-cols-5 text-center font-mono font-bold text-slate-900 py-0.5 border-b border-slate-200">
                  <span className="font-sans text-left pl-1">OS (বাম)</span>
                  <span>{activePrescription.leftEye?.sph || '-'}</span>
                  <span>{activePrescription.leftEye?.cyl || '-'}</span>
                  <span>{activePrescription.leftEye?.axis || '-'}</span>
                  <span>{activePrescription.leftEye?.add || '-'}</span>
                </div>
                {(activePrescription.pd || activePrescription.lensType) && (
                  <div className="flex justify-between text-[9px] text-slate-600 pt-0.5">
                    {activePrescription.pd && <span>PD: {activePrescription.pd}</span>}
                    {activePrescription.lensType && <span className="truncate max-w-[150px]">লেন্স: {activePrescription.lensType}</span>}
                  </div>
                )}
                <div className="text-[8.5px] text-amber-800 text-center font-bold bg-amber-50 rounded py-0.5">
                  ⭐ পরামর্শ: সুস্থ দৃষ্টির জন্য নিয়মিত লেন্স পরীক্ষা করান।
                </div>
              </div>
            )}

            {/* ── 5. Financial Summary Calculations ─────────────────────── */}
            <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>উপ-মোট (SUBTOTAL):</span>
                <span className="font-mono">৳{poishaToTaka(subtotalPoisha).toFixed(2)}</span>
              </div>

              {invoiceDiscountPoisha > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>বিশেষ ছাড় (DISCOUNT):</span>
                  <span className="font-mono">-৳{poishaToTaka(invoiceDiscountPoisha).toFixed(2)}</span>
                </div>
              )}

              {sale.vatPoisha > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>অন্তর্ভুক্ত মূসক (VAT 5% NBR 6.3):</span>
                  <span className="font-mono">৳{poishaToTaka(sale.vatPoisha).toFixed(2)}</span>
                </div>
              )}

              {sale.roundingPoisha !== undefined && sale.roundingPoisha !== 0 && (
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>রাউন্ডিং অ্যাডজাস্টমেন্ট:</span>
                  <span className="font-mono">৳{poishaToTaka(sale.roundingPoisha).toFixed(2)}</span>
                </div>
              )}

              {/* Net Payable Highlight Box */}
              <div className="flex justify-between items-center font-black text-sm pt-2 mt-1 border-t-2 border-slate-900 text-slate-900">
                <span className="uppercase tracking-tight">সর্বমোট দেয় (NET TOTAL):</span>
                <span className="font-mono text-base font-extrabold text-slate-900">
                  ৳{poishaToTaka(totalPoisha).toFixed(2)}
                </span>
              </div>
            </div>

            {/* ── 6. Hallmark Shwapno "YOU SAVED" Banner ────────────────── */}
            {totalSavingsPoisha > 0 && (
              <div className="my-2 p-2 border-2 border-emerald-600 bg-emerald-50 rounded text-center text-emerald-950 font-bold shwapno-savings-badge">
                <div className="flex items-center justify-center gap-1 text-[11px] font-black text-emerald-800">
                  <span>🎉</span>
                  <span>আপনি সাশ্রয় করেছেন: ৳{poishaToTaka(totalSavingsPoisha).toFixed(2)}</span>
                  <span>🎉</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold mt-0.5">
                  ⭐ YOU SAVED: BDT {poishaToTaka(totalSavingsPoisha).toFixed(2)} ⭐
                </div>
              </div>
            )}

            {/* ── 7. Payment Tender & Change Breakdown ──────────────────── */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10.5px] space-y-0.5">
              <div className="flex justify-between">
                <span>নগদ গ্রহণ (CASH TENDERED):</span>
                <span className="font-mono font-bold">
                  ৳{poishaToTaka(cashTenderedPoisha).toFixed(2)}
                </span>
              </div>

              {changeReturnedPoisha > 0 && (
                <div className="flex justify-between text-slate-900 font-extrabold text-[11px] bg-slate-100 p-1 rounded">
                  <span>ফেরত দেওয়া হলো (CHANGE DUE):</span>
                  <span className="font-mono text-emerald-700 font-black">
                    ৳{poishaToTaka(changeReturnedPoisha).toFixed(2)}
                  </span>
                </div>
              )}

              {sale.bkashPoisha > 0 && (
                <div className="flex justify-between text-[#E2136E] font-bold">
                  <span>বিকাশ মার্চেন্ট পেমেন্ট:</span>
                  <span className="font-mono">৳{poishaToTaka(sale.bkashPoisha).toFixed(2)}</span>
                </div>
              )}

              {sale.cardPoisha > 0 && (
                <div className="flex justify-between text-indigo-700 font-bold">
                  <span>কার্ড পেমেন্ট (POS POS):</span>
                  <span className="font-mono">৳{poishaToTaka(sale.cardPoisha).toFixed(2)}</span>
                </div>
              )}

              {sale.dueAmountPoisha > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>বর্তমান বিলে বাকি:</span>
                  <span className="font-mono">৳{poishaToTaka(sale.dueAmountPoisha).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* ── 8. Customer Khata Statement (If Credit/Regular Khata) ─── */}
            {cfg.showCustomerDue && (sale.dueAmountPoisha > 0 || prevDuePoisha > 0) && (
              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5 bg-amber-50/70 p-2 rounded">
                <p className="font-bold text-amber-900 border-b border-amber-200 pb-0.5">গ্রাহকের সর্বমোট বকেয়া খাতা:</p>
                <div className="flex justify-between text-slate-700">
                  <span>পূর্বের বকেয়া পাওনা:</span>
                  <span className="font-mono">৳{poishaToTaka(prevDuePoisha).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>বর্তমান বিল বাকি:</span>
                  <span className="font-mono">৳{poishaToTaka(currentSaleDuePoisha).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-amber-900 pt-0.5 border-t border-amber-300">
                  <span>সর্বমোট বকেয়া জের:</span>
                  <span className="font-mono">৳{poishaToTaka(totalOutstandingDuePoisha).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ── 9. Returnable Containers / Crates ─────────────────────── */}
            {cfg.showReturnableContainers && containersDueCount > 0 && (
              <div className="py-1.5 border-b border-dashed border-slate-400 text-[10px] bg-slate-50 p-1.5 rounded">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>বকেয়া খালি ক্যারেট / বস্তা দেনা:</span>
                  <span className="text-[#E2136E] font-black">{containersDueCount} টি</span>
                </div>
                <p className="text-[8.5px] text-slate-500">পরবর্তী ক্রয়ে খালি পাত্র ফেরত প্রযোজ্য</p>
              </div>
            )}

            {/* ── 10. Barcode & QR Code Section ─────────────────────────── */}
            <div className="py-2 border-b border-dashed border-slate-400 text-center">
              <ReceiptBarcode value={memoNumber} />

              {cfg.showBkashQr && (
                <div className="mt-2 pt-2 border-t border-dotted border-slate-300">
                  <div className="w-20 h-20 mx-auto bg-slate-50 border border-slate-300 rounded-lg p-1 flex flex-col items-center justify-center">
                    <QrCode size={48} className="text-[#E2136E]" />
                    <span className="text-[7px] font-bold text-[#E2136E] uppercase tracking-tighter mt-0.5">
                      bKash Merchant
                    </span>
                  </div>
                  <p className="text-[8.5px] text-slate-700 font-bold mt-1">
                    মার্চেন্ট বিকাশ: {cfg.bkashMerchantNumber || activeTenant?.bKashMerchantNumber || activeTenant?.phone || '০১৭১১-০০০০০০'}
                  </p>
                </div>
              )}
            </div>

            {/* ── 11. Return Policy & Conditions ────────────────────────── */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[8.5px] text-slate-600 leading-tight">
              <p className="font-bold text-slate-800 mb-0.5">শর্তাবলী ও ফেরত নীতি:</p>
              <p>
                {cfg.returnPolicy || 'পণ্য পরিবর্তনের জন্য ৭ দিনের মধ্যে অক্ষত অবস্থায় মূল ক্যাশ মেমোসহ যোগাযোগ করুন। কাঁচা বাজার, মাছ-মাংস ও ফ্রোজেন পণ্য ফেরতযোগ্য নয়।'}
              </p>
            </div>

            {/* ── 12. Friendly Closing & Footnotes ──────────────────────── */}
            <div className="text-center pt-2 text-[9px] text-slate-600 space-y-0.5">
              <p className="font-extrabold text-slate-900 text-[10px]">
                {cfg.footerGreeting || 'ধন্যবাদ! আবার আসবেন।'}
              </p>
              <p className="text-[8.5px] uppercase tracking-wider text-slate-500">
                Thank you for shopping with us!
              </p>
              <p className="text-[7.5px] text-slate-400 pt-1">
                Powered by LedgerX Enterprise OS • Digital Khata Platform
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar (Non-printable) */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
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
              className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
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


