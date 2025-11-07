// Currency formatting utility
const CURRENCY_CONFIG = {
  USD: { symbol: '$', locale: 'en-US' },
  INR: { symbol: '₹', locale: 'en-IN' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' }
};

const DEFAULT_CURRENCY = 'USD';

export const getCurrency = () => {
  return localStorage.getItem('currency') || DEFAULT_CURRENCY;
};

export const setCurrency = (currency) => {
  if (CURRENCY_CONFIG[currency]) {
    localStorage.setItem('currency', currency);
  }
};

export const formatCurrency = (amount, currency = null) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  
  const curr = currency || getCurrency();
  const config = CURRENCY_CONFIG[curr] || CURRENCY_CONFIG[DEFAULT_CURRENCY];
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Number(amount));
};

export const getCurrencySymbol = (currency = null) => {
  const curr = currency || getCurrency();
  return CURRENCY_CONFIG[curr]?.symbol || CURRENCY_CONFIG[DEFAULT_CURRENCY].symbol;
};

export const AVAILABLE_CURRENCIES = Object.keys(CURRENCY_CONFIG);
