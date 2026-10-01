// @ts-check
/**
 * Currency and number formatting in the Indian numbering system.
 * Shared by the browser UI and the API, so it must stay DOM-free.
 */

/** @typedef {'en' | 'hi'} Lang */

const UNITS = {
  en: { crore: 'crore', lakh: 'lakh' },
  hi: { crore: 'करोड़', lakh: 'लाख' },
};

const groupedFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/**
 * Format a rupee amount with Indian digit grouping, e.g. 250000 → "₹2,50,000".
 * @param {number} amount
 * @returns {string}
 */
export function formatINR(amount) {
  return `₹${groupedFormatter.format(Math.round(amount))}`;
}

/**
 * Format a rupee amount using lakh / crore units, e.g. 250000 → "₹2.5 lakh".
 * Amounts below one lakh are shown in full.
 * @param {number} amount
 * @param {Lang} [lang]
 * @returns {string}
 */
export function formatCompactINR(amount, lang = 'en') {
  const units = UNITS[lang] ?? UNITS.en;
  if (amount >= 1e7) return `₹${trimDecimal(amount / 1e7)} ${units.crore}`;
  if (amount >= 1e5) return `₹${trimDecimal(amount / 1e5)} ${units.lakh}`;
  return formatINR(amount);
}

/**
 * Round to at most two decimals and drop trailing zeros (2.50 → "2.5", 3.00 → "3").
 * @param {number} value
 */
function trimDecimal(value) {
  return String(Math.round(value * 100) / 100);
}

/**
 * Join list items in natural language: ["a", "b", "c"] → "a, b or c".
 * @param {string[]} items
 * @param {Lang} [lang]
 * @param {'or' | 'and'} [conjunction]
 */
export function joinList(items, lang = 'en', conjunction = 'or') {
  const word = lang === 'hi' ? (conjunction === 'or' ? 'या' : 'और') : conjunction;
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${word} ${items[items.length - 1]}`;
}
