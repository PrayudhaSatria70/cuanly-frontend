'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-xl bg-gray-100/80 p-0.5 border border-gray-200/80 text-xs font-semibold backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          locale === 'en'
            ? 'bg-white text-cuanly-primaryDark shadow-sm'
            : 'text-gray-500 hover:text-gray-800'
        }`}
        title="English (Default)"
      >
        {!compact && <Globe className="w-3.5 h-3.5 text-gray-400" />}
        <span>EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLocale('id')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          locale === 'id'
            ? 'bg-white text-cuanly-primaryDark shadow-sm'
            : 'text-gray-500 hover:text-gray-800'
        }`}
        title="Bahasa Indonesia"
      >
        {!compact && <Globe className="w-3.5 h-3.5 text-gray-400" />}
        <span>ID</span>
      </button>
    </div>
  );
};
