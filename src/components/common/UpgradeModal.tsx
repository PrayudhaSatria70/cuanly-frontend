'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  Zap,
  Lock,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const UpgradeModal: React.FC = () => {
  const router = useRouter();
  const { isUpgradeModalOpen, upgradeModalData, closeUpgradeModal, upgradePlan, plan: currentPlan } =
    useSubscription();
  const { t, locale } = useLanguage();

  if (!isUpgradeModalOpen || !upgradeModalData) return null;

  const { featureName, requiredPlan, featureDescription, benefits } = upgradeModalData;

  const planInfo = {
    SILVER: {
      title: t.modals.upgrade.silverTitle,
      badge: t.modals.upgrade.silverBadge,
      price: t.modals.upgrade.silverPrice,
      color: 'from-[#4D8DBA] to-[#2E678E]',
      border: 'border-[#8AD6D1]/60',
      badgeBg: 'bg-[#8AD6D1]/20 text-[#1C4A6B] dark:text-[#8AD6D1]',
      defaultBenefits: t.modals.upgrade.silverBenefits,
    },
    GOLD: {
      title: t.modals.upgrade.goldTitle,
      badge: t.modals.upgrade.goldBadge,
      price: t.modals.upgrade.goldPrice,
      color: 'from-amber-500 via-amber-600 to-amber-700',
      border: 'border-amber-400/80',
      badgeBg: 'bg-amber-400/20 text-amber-800 dark:text-amber-300',
      defaultBenefits: t.modals.upgrade.goldBenefits,
    },
    B2B: {
      title: t.modals.upgrade.b2bTitle,
      badge: t.modals.upgrade.b2bBadge,
      price: t.modals.upgrade.b2bPrice,
      color: 'from-purple-600 via-purple-700 to-[#1C4A6B]',
      border: 'border-purple-400/80',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
      defaultBenefits: t.modals.upgrade.b2bBenefits,
    },
  }[requiredPlan];

  const displayBenefits = benefits && benefits.length > 0 ? benefits : planInfo.defaultBenefits;

  const handleInstantActivate = () => {
    upgradePlan(requiredPlan);
  };

  const handleViewPricing = () => {
    closeUpgradeModal();
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D1926] border border-[#AEC4D4]/70 dark:border-[#4D8DBA]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-[#8AD6D1] to-[#4D8DBA]" />
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 shadow-md shadow-amber-400/30 flex-shrink-0 mt-0.5">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                  {t.modals.upgrade.badge}
                </span>
                <span className="text-xs text-gray-400">
                  {t.modals.upgrade.yourStatus} <strong className="text-[#4D8DBA] dark:text-[#8AD6D1]">{currentPlan}</strong>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0C2340] dark:text-white mt-1">
                {t.modals.upgrade.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeUpgradeModal}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label={t.common.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Target Feature Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EDF5FA] to-white dark:from-[#071018] dark:to-[#0B1520] border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                {t.modals.upgrade.targetFeature}
              </span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${planInfo.badgeBg}`}>
                {t.modals.upgrade.requires} {planInfo.title}
              </span>
            </div>
            <h3 className="text-base font-black text-[#1C4A6B] dark:text-[#8AD6D1] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{featureName}</span>
            </h3>
            <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
              {featureDescription ||
                t.modals.upgrade.defaultDesc.replace('{plan}', planInfo.title)}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-[#112233]/40 border border-gray-200/80 dark:border-[#4D8DBA]/25">
            <div>
              <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 block">
                {t.modals.upgrade.priceEstimate}
              </span>
              <span className="text-sm font-black text-[#0C2340] dark:text-white">
                {planInfo.price}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700 text-[#4D8DBA] dark:text-[#8AD6D1] shadow-2xs">
              {t.modals.upgrade.startSub}
            </span>
          </div>

          {/* Benefits Checklist */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
              {t.modals.upgrade.benefitsTitle}
            </span>
            <ul className="space-y-2 text-xs text-gray-700 dark:text-slate-300">
              {displayBenefits.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 sm:p-6 pt-3 bg-gray-50/80 dark:bg-[#071018]/80 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleViewPricing}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-[#4D8DBA]/40 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-white dark:hover:bg-[#0D1926] hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>{t.modals.upgrade.viewPricing}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleInstantActivate}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${planInfo.color} hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-200" />
            <span>{t.modals.upgrade.instantActivate.replace('{plan}', requiredPlan)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


