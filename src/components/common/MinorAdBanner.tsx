'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, X, ArrowRight } from 'lucide-react';

export const MinorAdBanner: React.FC = () => {
  const { tier, isAdmin, openPlanModal } = useSubscription();
  const { t } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);

  // Minor ads only appear on the Basic (Free) tier for non-admin accounts
  if (tier !== 'FREE' || isAdmin || isDismissed) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 dark:border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-[#4D8DBA]/10 to-transparent backdrop-blur-md p-4 sm:p-5 shadow-xs transition-all animate-fadeIn">
      {/* Background ambient accent */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {t.minorAd.badge}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                {t.minorAd.tips}
              </span>
            </div>
            <p className="text-sm font-bold text-[#0C2340] dark:text-white">
              {t.minorAd.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-300 max-w-xl">
              {t.minorAd.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={() => openPlanModal('SILVER')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#4D8DBA] to-[#2E678E] hover:from-[#2E678E] hover:to-[#1C4A6B] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>{t.minorAd.adFreeBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            title={t.minorAd.dismissTooltip}
            aria-label={t.minorAd.dismissTooltip}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
