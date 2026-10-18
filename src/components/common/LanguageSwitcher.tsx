'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-xl bg-gray-100/80 dark:bg-[#071018] p-0.5 border border-gray-200/80 dark:border-[#4D8DBA]/30 text-xs font-semibold backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          locale === 'en'
            ? 'bg-white dark:bg-[#4D8DBA] text-cuanly-primaryDark dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
        }`}
        title="English (Default)"
      >
        {!compact && <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />}
        <span>EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLocale('id')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
          locale === 'id'
            ? 'bg-white dark:bg-[#4D8DBA] text-cuanly-primaryDark dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
        }`}
        title="Bahasa Indonesia"
      >
        {!compact && <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" />}
        <span>ID</span>
      </button>
    </div>
  );
};
