'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { id } from '@/i18n/id';
import { en } from '@/i18n/en';

type Locale = 'id' | 'en';
type TranslationDictionary = typeof id;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('id');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cuanly_locale') as Locale;
      if (saved && (saved === 'id' || saved === 'en')) {
        setLocaleState(saved);
      }
    } catch {
      // fallback to id
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

  const formatCurrency = (amount: number): string => {
    const isNegative = amount < 0;
    const abs = Math.abs(amount);
    if (locale === 'en') {
      return `${isNegative ? '-' : ''}$${abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `${isNegative ? '-' : ''}Rp ${abs.toLocaleString('id-ID')}`;
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
    <LanguageContext.Provider value={{ locale, setLocale, t, formatCurrency, formatDate }}>
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
