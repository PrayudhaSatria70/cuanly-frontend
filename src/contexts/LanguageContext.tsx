'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { id } from '@/i18n/id';
import { en } from '@/i18n/en';
import { Currency } from '@/types';

type Locale = 'id' | 'en';
type TranslationDictionary = typeof id;

// Standard decimal precision lookup for ISO currencies
export const getCurrencyDecimals = (currencyOrCode?: Currency | string): number => {
  if (!currencyOrCode) return 0;
  if (typeof currencyOrCode === 'object' && typeof currencyOrCode.decimals === 'number') {
    return currencyOrCode.decimals;
  }
  const code = (typeof currencyOrCode === 'object' ? currencyOrCode.code : currencyOrCode)
    .toUpperCase()
    .trim();

  // 0 Decimals currencies (Rupiah, Yen, Won, Dong, Chilean Peso, etc.)
  if (['IDR', 'RP', 'JPY', '¥', 'KRW', '₩', 'VND', '₫', 'CLP', 'PYG', 'RWF', 'UGX'].includes(code)) {
    return 0;
  }

  // 3 Decimals currencies (Dinars/Rials: Bahrain, Kuwait, Oman, Jordan, Tunisia, Iraq, Libya)
  if (['BHD', 'KWD', 'OMR', 'JOD', 'TND', 'IQD', 'LYD'].includes(code)) {
    return 3;
  }

  // Standard 2 Decimals (USD, EUR, GBP, SGD, MYR, AUD, CAD, CHF, CNY, etc.)
  return 2;
};

// Standard formatting locale for currency separators (thousands vs decimals)
export const getCurrencyLocale = (currencyOrCode?: Currency | string): string => {
  if (!currencyOrCode) return 'id-ID';
  if (typeof currencyOrCode === 'object' && currencyOrCode.locale) {
    return currencyOrCode.locale;
  }
  const code = (typeof currencyOrCode === 'object' ? currencyOrCode.code : currencyOrCode)
    .toUpperCase()
    .trim();

  if (code === 'IDR' || code === 'RP') return 'id-ID';
  if (code === 'USD' || code === '$') return 'en-US';
  if (code === 'EUR' || code === '€') return 'de-DE'; // European decimal convention (thousands ., decimals ,)
  if (code === 'GBP' || code === '£') return 'en-GB';
  if (code === 'JPY' || code === '¥') return 'ja-JP';
  if (code === 'SGD' || code === 'S$') return 'en-SG';
  if (code === 'MYR' || code === 'RM') return 'ms-MY';
  if (code === 'AUD' || code === 'A$') return 'en-AU';
  if (code === 'CAD' || code === 'C$') return 'en-CA';
  if (code === 'CHF') return 'de-CH';
  if (code === 'CNY') return 'zh-CN';
  if (code === 'KRW' || code === '₩') return 'ko-KR';

  return 'en-US';
};

export const INITIAL_CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, locale: 'id-ID' },
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, locale: 'de-DE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2, locale: 'en-SG' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, locale: 'ja-JP' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, locale: 'ms-MY' },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, locale: 'en-GB' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2, locale: 'en-AU' },
];

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
  currencies: Currency[];
  activeCurrency: Currency;
  setActiveCurrency: (code: string) => void;
  addCustomCurrency: (currency: Currency) => Currency;
  formatCurrency: (amount: number, customSymbolOrCode?: string) => string;
  formatDate: (dateStr: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Localization: Default to 'en' (English), with 'id' (Indonesian) optional
  const [locale, setLocaleState] = useState<Locale>('en');

  // Currency: Default to IDR (Rupiah), customizable by user
  const [customCurrencies, setCustomCurrencies] = useState<Currency[]>([]);
  const [activeCurrencyCode, setActiveCurrencyCode] = useState<string>('IDR');

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('cuanly_locale') as Locale;
      if (savedLocale && (savedLocale === 'id' || savedLocale === 'en')) {
        setLocaleState(savedLocale);
      } else {
        // Explicitly set 'en' as default
        setLocaleState('en');
      }

      const storedCustom = localStorage.getItem('cuanly_custom_currencies');
      if (storedCustom) {
        setCustomCurrencies(JSON.parse(storedCustom));
      }

      const savedCurrency = localStorage.getItem('cuanly_active_currency');
      if (savedCurrency) {
        setActiveCurrencyCode(savedCurrency);
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('cuanly_locale', newLocale);
    } catch {
      // ignore
    }
  };

  const t = locale === 'en' ? en : id;

  const allCurrencies = [...INITIAL_CURRENCIES, ...customCurrencies];
  const activeCurrency =
    allCurrencies.find((c) => c.code.toUpperCase() === activeCurrencyCode.toUpperCase()) ||
    INITIAL_CURRENCIES[0]; // Default IDR (Rupiah)

  const setActiveCurrency = (code: string) => {
    setActiveCurrencyCode(code);
    try {
      localStorage.setItem('cuanly_active_currency', code);
    } catch {
      // ignore
    }
  };

  const addCustomCurrency = (newCurrency: Currency): Currency => {
    const code = newCurrency.code.trim().toUpperCase();
    const sanitized: Currency = {
      code,
      symbol: newCurrency.symbol.trim(),
      name: newCurrency.name.trim() || code,
      decimals: typeof newCurrency.decimals === 'number' ? newCurrency.decimals : getCurrencyDecimals(code),
      locale: newCurrency.locale || getCurrencyLocale(code),
    };

    // Prevent duplicate codes
    const exists = allCurrencies.some(
      (c) => c.code.toUpperCase() === sanitized.code.toUpperCase()
    );

    let updatedList = customCurrencies;
    if (!exists) {
      updatedList = [...customCurrencies, sanitized];
      setCustomCurrencies(updatedList);
      try {
        localStorage.setItem('cuanly_custom_currencies', JSON.stringify(updatedList));
      } catch {
        // ignore
      }
    }

    setActiveCurrency(sanitized.code);
    return sanitized;
  };

  const formatCurrency = (amount: number, customSymbolOrCode?: string): string => {
    const isNegative = amount < 0;
    const abs = Math.abs(amount);

    let targetCurrency: Currency = activeCurrency;
    let symbol = activeCurrency.symbol;

    if (customSymbolOrCode) {
      const trimmed = customSymbolOrCode.trim();
      const match = allCurrencies.find(
        (c) =>
          c.code.toUpperCase() === trimmed.toUpperCase() ||
          c.symbol === trimmed ||
          c.symbol.toUpperCase() === trimmed.toUpperCase()
      );
      if (match) {
        targetCurrency = match;
        symbol = match.symbol;
      } else {
        symbol = trimmed;
        targetCurrency = {
          code: trimmed.length <= 4 ? trimmed.toUpperCase() : 'CUSTOM',
          symbol: trimmed,
          name: trimmed,
          decimals: getCurrencyDecimals(trimmed),
          locale: getCurrencyLocale(trimmed),
        };
      }
    }

    const decimals = getCurrencyDecimals(targetCurrency);
    const targetLocale = getCurrencyLocale(targetCurrency);

    // Format number strictly with its currency's standard decimal places and separator conventions
    const formattedNumber = abs.toLocaleString(targetLocale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    // Formatting placement:
    // USD ($), GBP (£), JPY (¥), EUR (€): directly affixed with standard symbol
    // IDR (Rp), MYR (RM), SGD (S$), AUD (A$), etc.: separated by a space
    if (symbol === '$' || symbol === '£' || symbol === '¥' || symbol === '€') {
      return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
    }

    return `${isNegative ? '-' : ''}${symbol} ${formattedNumber}`;
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        currencies: allCurrencies,
        activeCurrency,
        setActiveCurrency,
        addCustomCurrency,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
