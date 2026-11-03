import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import { formatCurrency } from '../../utils/currency';
import { Layers } from 'lucide-react';

export default function DualUnitSelector({
  product,
  isBulkSelected,
  onToggleUnit,
  quantity,
  onChangeQuantity,
}) {
  const { isBengali, locale } = useLocale();

  if (!product.hasBulkUnit) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
            className="w-7 h-7 rounded bg-white font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            -
          </button>
          <span className="w-10 text-center font-bold text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => onChangeQuantity(quantity + 1)}
            className="w-7 h-7 rounded bg-white font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-500 font-medium">{product.baseUnit}</span>
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
          <Layers size={13} className="text-[#E2136E]" />
          {isBengali ? 'একক নির্বাচন:' : 'Select Unit:'}
        </span>

        {/* Dual-Unit Pill Switcher */}
        <div className="flex items-center bg-white p-0.5 rounded-lg border border-pink-200 text-xs">
          <button
            type="button"
            onClick={() => onToggleUnit(true)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              isBulkSelected
                ? 'bg-[#E2136E] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#E2136E]'
            }`}
          >
            {product.bulkUnitName || (isBengali ? 'বস্তা' : 'Bulk')} ({product.bulkConversionFactor} {product.baseUnit})
          </button>
          <button
            type="button"
            onClick={() => onToggleUnit(false)}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              !isBulkSelected
                ? 'bg-[#E2136E] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#E2136E]'
            }`}
          >
            {isBengali ? 'খুচরা' : 'Loose'} ({product.baseUnit})
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Quantity Stepper */}
        <div className="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded bg-gray-50 font-bold text-gray-700 hover:bg-gray-100"
          >
            -
          </button>
          <input
            type="number"
            step={isBulkSelected ? '1' : '0.5'}
            value={quantity}
            onChange={(e) => onChangeQuantity(Math.max(0.1, parseFloat(e.target.value || '1')))}
            className="w-16 text-center font-bold text-sm bg-transparent focus:outline-none tabular-nums"
          />
          <button
            type="button"
            onClick={() => onChangeQuantity(quantity + 1)}
            className="w-8 h-8 rounded bg-gray-50 font-bold text-gray-700 hover:bg-gray-100"
          >
            +
          </button>
        </div>

        {/* Unit Price indicator */}
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-semibold">{isBengali ? 'দর' : 'Rate'}</p>
          <p className="text-xs font-bold text-gray-800 tabular-nums">
            {formatCurrency(
              isBulkSelected ? product.bulkSellingPricePoisha : product.sellingPriceBasePoisha,
              { locale }
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
