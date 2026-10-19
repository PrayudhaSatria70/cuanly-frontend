'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionTier } from '@/types';
import Link from 'next/link';
import {
  Crown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wallet,
  Receipt,
  FileSpreadsheet,
  Building2,
  Activity,
  Layers,
  Scale,
  Calendar,
  CreditCard,
  Lock,
  ArrowLeft,
  RefreshCw,
  Trash2,
  X,
  HelpCircle,
} from 'lucide-react';

export default function MyPlanPage() {
  const { user, role } = useAuth();
  const { plan, tier, isAdmin, cancelPlan, upgradePlan } = useSubscription();
  const { formatCurrency, locale, t } = useLanguage();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const activeTier: SubscriptionTier = isAdmin ? 'B2B' : tier;
  const isFree = activeTier === 'FREE';

  const PLAN_DETAILS: Record<
    SubscriptionTier,
    {
      name: string;
      priceMonth: number;
      priceYear: number;
      badgeColor: string;
      gradient: string;
      textColor: string;
      description: string;
      renewalCycle: string;
    }
  > = {
    FREE: {
      name: locale === 'en' ? 'Cuanly Basic (Free)' : 'Cuanly Basic (Gratis)',
      priceMonth: 0,
      priceYear: 0,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/40',
      gradient: 'from-slate-700 via-slate-800 to-slate-900',
      textColor: 'text-slate-100',
      description:
        locale === 'en'
          ? 'Essential daily financial tracking, basic categories, and up to 2 active wallets forever.'
          : 'Pencatatan keuangan harian dasar, kategori standar, dan hingga 2 dompet aktif tanpa biaya selamanya.',
      renewalCycle: locale === 'en' ? 'Free Forever (No Billing)' : 'Gratis Selamanya (Tanpa Tagihan)',
    },
    SILVER: {
      name: locale === 'en' ? 'Cuanly Silver Pro' : 'Cuanly Silver Pro',
      priceMonth: 29000,
      priceYear: 290000,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/40',
      gradient: 'from-blue-700 via-sky-700 to-indigo-900',
      textColor: 'text-sky-100',
      description:
        locale === 'en'
          ? 'Unlimited wallets, unlimited AI receipt scans, 100% ad-free experience, and custom budget allowance.'
          : 'Dompet tanpa batas, pemindaian struk AI tanpa batas, 100% bebas iklan, dan batas pengeluaran kustom.',
      renewalCycle: locale === 'en' ? 'Active Auto-Renew (Monthly)' : 'Perpanjangan Otomatis (Bulanan)',
    },
    GOLD: {
      name: locale === 'en' ? 'Cuanly Gold Max' : 'Cuanly Gold Max',
      priceMonth: 59000,
      priceYear: 590000,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40',
      gradient: 'from-amber-600 via-amber-700 to-yellow-800',
      textColor: 'text-amber-100',
      description:
        locale === 'en'
          ? 'Complete personal wealth tracking: Debts & receivables, Open Banking sync, multi-class investments, and AI diagnostics.'
          : 'Manajemen kekayaan pribadi lengkap: Utang-piutang, sinkronisasi bank otomatis, portofolio investasi, dan analitik AI.',
      renewalCycle: locale === 'en' ? 'Active Auto-Renew (Monthly)' : 'Perpanjangan Otomatis (Bulanan)',
    },
    B2B: {
      name: locale === 'en' ? 'Cuanly B2B Enterprise' : 'Cuanly B2B Enterprise',
      priceMonth: 149000,
      priceYear: 1490000,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/40',
      gradient: 'from-purple-700 via-indigo-800 to-slate-900',
      textColor: 'text-purple-100',
      description:
        locale === 'en'
          ? 'Enterprise collaborative financial hub: Multi-user team RBAC, shared wallet pool, 3-pillar cashflow, and UMKM tax compliance.'
          : 'Pusat kolaborasi finansial bisnis: Multi-user RBAC tim, kas bersama kantor, arus kas 3 pilar, dan kepatuhan pajak UMKM.',
      renewalCycle: locale === 'en' ? 'Active Auto-Renew (Enterprise)' : 'Perpanjangan Otomatis (Enterprise)',
    },
  };

  const currentDetails = PLAN_DETAILS[activeTier];

  const FEATURES_LIST = [
    {
      title: locale === 'en' ? 'Multi-Wallets Management' : 'Kelola Banyak Dompet (Multi-Wallets)',
      desc:
        activeTier === 'FREE'
          ? locale === 'en'
            ? 'Capped at 2 active wallets'
            : 'Maksimal 2 dompet aktif'
          : locale === 'en'
          ? 'Unlimited bank accounts, e-wallets, and cash'
          : 'Tanpa batas rekening bank, e-wallet, dan kas',
      included: true,
      silverPlus: false,
    },
    {
      title: locale === 'en' ? 'AI Smart Receipt Scanner (OCR)' : 'Pindai Struk Pintar AI (OCR)',
      desc:
        activeTier === 'FREE'
          ? locale === 'en'
            ? '10 scans per month'
            : '10 pemindaian struk per bulan'
          : locale === 'en'
          ? 'Unlimited high-speed OCR parsing'
          : 'Pemindaian struk berkecepatan tinggi tanpa batas',
      included: true,
      silverPlus: false,
    },
    {
      title: locale === 'en' ? '100% Ad-Free Experience' : 'Pengalaman 100% Bebas Iklan',
      desc:
        locale === 'en'
          ? 'Clean workspace without financial sponsor banners'
          : 'Tampilan bersih tanpa banner sponsor finansial',
      included: activeTier !== 'FREE',
      minTier: 'SILVER',
    },
    {
      title: locale === 'en' ? 'Debts & Receivables (Utang Piutang)' : 'Catatan Utang & Piutang (Cicilan & Tenor)',
      desc:
        locale === 'en'
          ? 'Track installments, due dates, and interest rates'
          : 'Pencatatan cicilan, tanggal jatuh tempo, dan bunga',
      included: activeTier === 'GOLD' || activeTier === 'B2B',
      minTier: 'GOLD',
    },
    {
      title: locale === 'en' ? 'Automated Bank & E-Wallet Sync' : 'Sinkronisasi Otomatis Bank & E-Wallet',
      desc:
        locale === 'en'
          ? 'BCA, Mandiri, BRI, BNI, GoPay auto-reconciliation'
          : 'Tarik mutasi rekening otomatis dengan enkripsi TLS 1.3',
      included: activeTier === 'GOLD' || activeTier === 'B2B',
      minTier: 'GOLD',
    },
    {
      title: locale === 'en' ? 'Multi-Class Investment Portfolio' : 'Pelacak Portofolio Aset & Investasi',
      desc:
        locale === 'en'
          ? 'Stocks, mutual funds, physical gold, crypto, and property'
          : 'Pantau saham, reksadana, emas fisik, kripto, dan properti',
      included: activeTier === 'GOLD' || activeTier === 'B2B',
      minTier: 'GOLD',
    },
    {
      title: locale === 'en' ? 'Cuanly AI Financial Intelligence' : 'Analitik AI Cuanly & Skor Kesehatan',
      desc:
        locale === 'en'
          ? 'Health score, spending anomalies, and runway forecasting'
          : 'Skor kesehatan finansial, deteksi anomali, dan proyeksi kas',
      included: activeTier === 'GOLD' || activeTier === 'B2B',
      minTier: 'GOLD',
    },
    {
      title: locale === 'en' ? 'Multi-User Team Workspace (RBAC)' : 'Team Workspace & Kolaborasi Multi-User',
      desc:
        locale === 'en'
          ? 'Invite staff, assign roles (Admin, Member, Auditor), audit trail'
          : 'Undang rekan kerja, atur peran hak akses, dan log jejak audit',
      included: activeTier === 'B2B',
      minTier: 'B2B',
    },
    {
      title: locale === 'en' ? 'Corporate Cashflow & UMKM Tax (PP 23/2018)' : 'Arus Kas 3 Pilar & Rekapitulasi Pajak UMKM',
      desc:
        locale === 'en'
          ? 'Operating, Investing, Financing statement & 0.5% PPh final'
          : 'Laporan arus kas 3 pilar dan kalkulator PPh Final 0.5%',
      included: activeTier === 'B2B',
      minTier: 'B2B',
    },
  ];

  const handleConfirmCancel = () => {
    cancelPlan();
    setIsCancelModalOpen(false);
    setFeedback({
      type: 'success',
      message: t.myPlan.cancelSuccess,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Feature Header */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentDetails.gradient} p-6 md:p-8 text-white shadow-xl shadow-slate-900/10`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-white">
              <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{t.myPlan.currentPlan}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentDetails.name}
            </h1>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed">
              {currentDetails.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold shadow-lg shadow-black/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              {t.myPlan.viewAllPlans}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Stat Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Subscription Status */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Plan Status' : 'Status Langganan'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {isFree ? t.myPlan.statusFree : t.myPlan.statusActive}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            {currentDetails.renewalCycle}
          </span>
        </div>

        {/* Card 2: Plan Price / Fee */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Recurring Fee' : 'Biaya Langganan'}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(currentDetails.priceMonth)}
            </span>
            <span className="ml-1 text-xs text-slate-400 font-medium">
              /{locale === 'en' ? 'month' : 'bulan'}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            {isFree ? t.myPlan.freeLifetime : `${formatCurrency(currentDetails.priceYear)} / ${locale === 'en' ? 'year' : 'tahun'}`}
          </span>
        </div>

        {/* Card 3: Multi-Wallets Quota */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Wallet Quota' : 'Batas Dompet'}
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {isFree ? '2 Dompet' : (locale === 'en' ? 'Unlimited' : 'Tanpa Batas')}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            {isFree
              ? (locale === 'en' ? 'Upgrade to unlock more' : 'Upgrade untuk dompet tak terbatas')
              : (locale === 'en' ? 'Cash, Bank, E-Wallet & Shared' : 'Kas, Bank, E-Wallet & Kas Bersama')}
          </span>
        </div>

        {/* Card 4: Security Standard */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Data Protection' : 'Perlindungan Akun'}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              TLS 1.3
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            Bank-Grade 256-bit Encryption
          </span>
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/60 dark:bg-purple-950/30 p-4 flex items-center gap-3 text-xs text-purple-900 dark:text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span>{t.myPlan.adminNotice}</span>
        </div>
      )}

      {/* Features List Section */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.myPlan.featuresTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'en'
                ? `Capabilities enabled under your active ${currentDetails.name} plan.`
                : `Daftar fasilitas dan kuota yang terbuka pada ${currentDetails.name} Anda.`}
            </p>
          </div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${currentDetails.badgeColor}`}>
            {activeTier} PLAN
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {FEATURES_LIST.map((feat, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    feat.included
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {feat.included ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className={`font-bold text-sm block ${feat.included ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {feat.title}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {feat.desc}
                  </span>
                </div>
              </div>

              <div>
                {feat.included ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/50">
                    {locale === 'en' ? 'Included' : 'Tersedia'}
                  </span>
                ) : (
                  <Link
                    href="/pricing"
                    className="text-xs font-bold text-amber-700 dark:text-amber-300 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{feat.minTier} Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Management & Cancellation Actions */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.myPlan.manageSectionTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'en'
              ? 'You can switch tiers at any time or cancel your subscription to revert to the Free Plan.'
              : 'Anda dapat mengganti paket kapan saja atau membatalkan langganan untuk kembali menggunakan Paket Free.'}
          </p>
        </div>

        {/* Buttons / Actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-xl bg-[#0C2340] dark:bg-white text-white dark:text-[#0C2340] hover:bg-[#183659] dark:hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {t.myPlan.upgradeCta}
            </Link>
          </div>

          {!isAdmin && (
            <div>
              {isFree ? (
                <span className="text-xs text-slate-400 italic">
                  {t.myPlan.alreadyFree}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.myPlan.cancelPlanBtn}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Plan Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0D1926] border border-rose-300 dark:border-rose-900/60 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {t.myPlan.modalTitle}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.myPlan.modalDesc}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{t.myPlan.modalDataSafe}</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t.myPlan.modalKeepPlan}
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.myPlan.modalConfirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
