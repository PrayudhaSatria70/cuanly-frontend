'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { id } from '@/i18n/id';
import { en } from '@/i18n/en';
import { Currency } from '@/types';

type Locale = 'id' | 'en';
type TranslationDictionary = typeof id;

export const INITIAL_CURRENCIES: Currency[] = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
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
    const sanitized: Currency = {
      code: newCurrency.code.trim().toUpperCase(),
      symbol: newCurrency.symbol.trim(),
      name: newCurrency.name.trim(),
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

    let symbol = activeCurrency.symbol;
    if (customSymbolOrCode) {
      const match = allCurrencies.find(
        (c) =>
          c.code.toUpperCase() === customSymbolOrCode.toUpperCase() ||
          c.symbol === customSymbolOrCode
      );
      symbol = match ? match.symbol : customSymbolOrCode;
    }

    // Default currency is Rupiah (Rp)
    const formattedNumber =
      locale === 'id'
        ? abs.toLocaleString('id-ID')
        : abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    if (symbol === '$' || symbol === '£' || symbol === '€' || symbol === '¥') {
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
