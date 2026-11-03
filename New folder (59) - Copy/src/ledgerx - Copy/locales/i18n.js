import bn from './bn.json';
import en from './en.json';

const dictionaries = { bn, en };

/**
 * Universal bilingual translation helper
 * @param {string} key
 * @param {'bn' | 'en'} locale
 * @param {Record<string, string | number>} params
 * @returns {string}
 */
export function t(key, locale = 'bn', params = {}) {
  const dict = dictionaries[locale] || dictionaries.bn;
  let text = dict[key] || dictionaries.en[key] || key;

  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
  }
  return text;
}

/**
 * Converts English standard numerals to Bengali numerals
 * @param {string | number} input
 * @returns {string}
 */
export function toBengaliNumerals(input) {
  if (input === null || input === undefined) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(input).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
}

/**
 * Formats a number according to active locale
 * @param {number | string} val
 * @param {'bn' | 'en'} locale
 * @param {boolean} useBengaliDigits
 * @returns {string}
 */
export function formatNumber(val, locale = 'bn', useBengaliDigits = false) {
  const num = typeof val === 'number' ? val.toLocaleString('en-IN') : String(val);
  if (useBengaliDigits || locale === 'bn') {
    return toBengaliNumerals(num);
  }
  return num;
}
