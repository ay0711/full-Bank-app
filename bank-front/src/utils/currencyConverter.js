// Currency conversion utility with real exchange rates
// Base currency is NGN (Nigerian Naira)

export const EXCHANGE_RATES = {
  NGN: 1,        // Base currency
  USD: 0.0013,   // 1 NGN = 0.0013 USD (approx 770 NGN = 1 USD)
  EUR: 0.0012,   // 1 NGN = 0.0012 EUR (approx 833 NGN = 1 EUR)
  GBP: 0.0010,   // 1 NGN = 0.0010 GBP (approx 1000 NGN = 1 GBP)
  JPY: 0.19,     // 1 NGN = 0.19 JPY (approx 5.3 NGN = 1 JPY)
  CNY: 0.0093,   // 1 NGN = 0.0093 CNY (approx 107 NGN = 1 CNY)
};

export const CURRENCY_SYMBOLS = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
};

export const CURRENCY_NAMES = {
  NGN: 'Nigerian Naira',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
};

/**
 * Convert amount from NGN to target currency
 * @param {number} amountInNGN - Amount in Nigerian Naira
 * @param {string} targetCurrency - Target currency code (USD, EUR, GBP, etc.)
 * @returns {number} - Converted amount
 */
export const convertCurrency = (amountInNGN, targetCurrency = 'NGN') => {
  if (typeof amountInNGN !== 'number' || isNaN(amountInNGN)) {
    return 0;
  }
  
  const rate = EXCHANGE_RATES[targetCurrency] || EXCHANGE_RATES.NGN;
  return amountInNGN * rate;
};

/**
 * Format currency with proper symbol and formatting
 * @param {number} amountInNGN - Amount in Nigerian Naira (base currency)
 * @param {string} targetCurrency - Target currency to display
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amountInNGN, targetCurrency = 'NGN', showSymbol = true) => {
  if (typeof amountInNGN !== 'number' || isNaN(amountInNGN)) {
    const symbol = showSymbol ? (CURRENCY_SYMBOLS[targetCurrency] || '₦') : '';
    return `${symbol}0.00`;
  }

  const convertedAmount = convertCurrency(amountInNGN, targetCurrency);
  const symbol = showSymbol ? (CURRENCY_SYMBOLS[targetCurrency] || '₦') : '';
  
  // Different formatting based on currency
  let formatted;
  if (targetCurrency === 'JPY' || targetCurrency === 'CNY') {
    // Japanese Yen and Chinese Yuan don't use decimal places typically
    formatted = Math.round(convertedAmount).toLocaleString('en-US');
  } else {
    formatted = convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  return `${symbol}${formatted}`;
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} - Currency symbol
 */
export const getCurrencySymbol = (currency = 'NGN') => {
  return CURRENCY_SYMBOLS[currency] || '₦';
};

/**
 * Get masked currency display (for hidden balance)
 * @param {string} currency - Currency code
 * @returns {string} - Masked currency string
 */
export const getMaskedCurrency = (currency = 'NGN') => {
  return `${getCurrencySymbol(currency)}****`;
};

export default {
  convertCurrency,
  formatCurrency,
  getCurrencySymbol,
  getMaskedCurrency,
  EXCHANGE_RATES,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES
};
