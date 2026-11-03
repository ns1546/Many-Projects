import { toBengaliNumerals } from '../locales/i18n';

/**
 * LedgerX Scaled Integer Currency Engine
 * All internal math strictly uses integer POISHA (1 BDT = 100 Poisha)
 * Eliminates IEEE 754 floating point precision drift.
 */

/**
 * Converts Taka decimal string/number to integer Poisha
 * e.g. 10.50 -> 1050, "1500" -> 150000
 * @param {number | string} taka
 * @returns {number} Integer Poisha
 */
export function takaToPoisha(taka) {
  if (taka === null || taka === undefined || taka === '') return 0;
  const num = Number(taka);
  if (isNaN(num) || !Number.isFinite(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts integer Poisha to decimal Taka number
 * e.g. 1050 -> 10.5, 150000 -> 1500
 * @param {number} poisha
 * @returns {number} Decimal Taka
 */
export function poishaToTaka(poisha) {
  if (poisha === null || poisha === undefined || poisha === '') return 0;
  const num = Number(poisha);
  if (isNaN(num) || !Number.isFinite(num)) return 0;
  return num / 100;
}

export const parseToPoisha = takaToPoisha;

/**
 * Formats Poisha into human readable currency string
 * e.g. 14285000 -> "৳ 1,42,850.00" or "৳ ১,৪২,৮৫০.০০"
 * @param {number} poisha - Integer Poisha
 * @param {object | boolean} optionsOrIsBengali
 * @returns {string} Formatted currency string
 */
export function formatCurrency(
  poisha = 0,
  optionsOrIsBengali = {}
) {
  const safePoisha = Number.isFinite(Number(poisha)) ? Number(poisha) : 0;
  const options = typeof optionsOrIsBengali === 'boolean'
    ? { locale: optionsOrIsBengali ? 'bn' : 'en', useBengaliDigits: optionsOrIsBengali }
    : optionsOrIsBengali;

  const {
    symbol = '৳',
    locale = 'bn',
    showSymbol = true,
    useBengaliDigits = (locale === 'bn')
  } = options || {};
  const isNegative = safePoisha < 0;
  const absolute = Math.abs(safePoisha);
  const taka = Math.floor(absolute / 100);
  const remPoisha = Math.round(absolute % 100);

  // South Asian number format: 1,42,850
  const formattedTaka = taka.toLocaleString('en-IN');
  const formattedPoisha = remPoisha.toString().padStart(2, '0');
  
  let formatted = `${formattedTaka}.${formattedPoisha}`;
  if (useBengaliDigits) {
    formatted = toBengaliNumerals(formatted);
  }

  const prefix = isNegative ? '- ' : '';
  const sym = showSymbol ? `${symbol} ` : '';
  return `${prefix}${sym}${formatted}`;
}

/**
 * Calculates item subtotal in Poisha
 * @param {number} qty 
 * @param {number} unitPricePoisha 
 * @returns {number} Total in Poisha
 */
export function calculateLineTotalPoisha(qty, unitPricePoisha) {
  const q = Number(qty) || 0;
  const price = Number(unitPricePoisha) || 0;
  return Math.round(q * price);
}

/**
 * Calculates Pro-Rata Cost Basis for loose sales from bulk packaging
 * e.g. 25kg bag costs ৳ 1750 (175000 poisha). 1kg costs 7000 poisha.
 * @param {number} bulkCostPoisha 
 * @param {number} conversionFactor 
 * @returns {number} Cost per base unit in Poisha
 */
export function calculateBaseUnitCostPoisha(bulkCostPoisha, conversionFactor) {
  const factor = Number(conversionFactor);
  const cost = Number(bulkCostPoisha) || 0;
  if (!factor || factor <= 0 || isNaN(factor)) return cost;
  return Math.round(cost / factor);
}
