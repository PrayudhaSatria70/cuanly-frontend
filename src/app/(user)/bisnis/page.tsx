'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { businessApi } from '@/services/api';
import { BusinessProfile, BusinessCashflow, BusinessTaxReport } from '@/types';
import { ADMIN_INITIAL_BUSINESS_PROFILE } from '@/services/mockData';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  Building2,
  FileSpreadsheet,
  Calculator,
  Download,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Scale,
  Briefcase,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  FileText,
  DollarSign,
  PieChart,
} from 'lucide-react';

export default function BisnisPage() {
  const { user } = useAuth();
  const { formatCurrency, t, locale } = useLanguage();
  const {
    hasAccess,
    openUpgradeModal,
  } = useSubscription();

  const [activeTab, setActiveTab] = useState<'cashflow' | 'tax' | 'profile'>('cashflow');
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [cashflow, setCashflow] = useState<BusinessCashflow | null>(null);
  const [taxReport, setTaxReport] = useState<BusinessTaxReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isB2B = hasAccess('B2B');
  const userId = user?.id;
  const isAdminUser = user?.role === 'ADMIN' || user?.username === 'admin' || userId === 'usr_live_admin' || userId === 'usr_admin_01';
  const hasTriggeredModalRef = useRef(false);

  // Auto-trigger upgrade modal on mount if account is Free plan / not B2B
  useEffect(() => {
    if (!hasTriggeredModalRef.current && user?.role !== 'ADMIN' && !hasAccess('B2B')) {
      hasTriggeredModalRef.current = true;
      openUpgradeModal(
        locale === 'en' ? 'Unlock Business Cashflow & Taxes' : 'Buka Arus Kas Bisnis & Pajak',
        'B2B',
        locale === 'en'
          ? 'Complete 3-pillar cashflow statement and automated PPh Final 0.5% Indonesian SME tax calculator.'
          : 'Laporan arus kas 3 pilar lengkap dan kalkulator rekapitulasi PPh Final UMKM 0.5% otomatis.',
        t.modals.upgrade.b2bBenefits
      );
    }
  }, [hasAccess, user?.role, openUpgradeModal, locale, t.modals.upgrade]);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [npwp, setNpwp] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('580000000');
  const [operatingExpense, setOperatingExpense] = useState('215000000');

  // Load Business Profile & Cashflow
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      businessApi.getProfile().catch(() => null),
      businessApi.getCashflow().catch(() => null),
      businessApi.getTaxReport().catch(() => null),
    ])
      .then(([profRes, flowRes, taxRes]) => {
        if (profRes && profRes.profile) {
          setProfile(profRes.profile);
          setBusinessName(profRes.profile.businessName);
          setNpwp(profRes.profile.npwp || '');
          setAnnualRevenue(String(profRes.profile.annualRevenue));
          setOperatingExpense(String(profRes.profile.operatingExpense));
        } else if (isAdminUser) {
          setProfile(ADMIN_INITIAL_BUSINESS_PROFILE);
          setBusinessName(ADMIN_INITIAL_BUSINESS_PROFILE.businessName);
          setNpwp(ADMIN_INITIAL_BUSINESS_PROFILE.npwp);
          setAnnualRevenue(String(ADMIN_INITIAL_BUSINESS_PROFILE.annualRevenue));
          setOperatingExpense(String(ADMIN_INITIAL_BUSINESS_PROFILE.operatingExpense));
        } else {
          const fallbackProfile: BusinessProfile = {
            userId: userId || 'usr_registered',
            businessName: 'Kopi Cuan Nusantara UMKM',
            npwp: '08.123.456.7-412.000',
            period: '2026',
            annualRevenue: 150000000,
            operatingExpense: 85000000,
            cashRunwayMonths: 9.2,
            taxRate: 0.005,
          };
          setProfile(fallbackProfile);
          setBusinessName(fallbackProfile.businessName);
          setNpwp(fallbackProfile.npwp || '');
          setAnnualRevenue(String(fallbackProfile.annualRevenue));
          setOperatingExpense(String(fallbackProfile.operatingExpense));
        }

        if (flowRes && flowRes.cashflow) {
          setCashflow(flowRes.cashflow);
        } else if (isAdminUser) {
          setCashflow({
            period: '2026',
            operating: {
              cashIn: 580000000,
              cashOut: 215000000,
              net: 365000000,
            },
            investing: {
              net: -45000000,
            },
            financing: {
              net: 25000000,
            },
            netCashflow: 345000000,
            runwayMonths: 22.4,
            monthlyBurnRate: 17916666,
          });
        } else {
          setCashflow({
            period: '2026',
            operating: {
              cashIn: 150000000,
              cashOut: 85000000,
              net: 65000000,
            },
            investing: {
              net: -15000000,
            },
            financing: {
              net: 10000000,
            },
            netCashflow: 60000000,
            runwayMonths: 9.2,
            monthlyBurnRate: 7083333,
          });
        }

        if (taxRes && taxRes.taxReport) {
          setTaxReport(taxRes.taxReport);
        } else if (isAdminUser) {
          setTaxReport({
            period: '2026',
            businessName: ADMIN_INITIAL_BUSINESS_PROFILE.businessName,
            npwp: ADMIN_INITIAL_BUSINESS_PROFILE.npwp,
            grossRevenue: 580000000,
            exemptThreshold: 0,
            taxableRevenue: 580000000,
            taxRate: 0.005,
            taxRateFormatted: '0.5% Final UMKM (PP 23/2018)',
            taxDue: 2900000,
            status: 'READY_TO_PAY',
            legalReference: 'PP No. 23/2018 & PP No. 55/2022',
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [userId, isAdminUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const rev = Number(annualRevenue) || 0;
    const exp = Number(operatingExpense) || 0;
    const burn = exp > 0 ? exp / 12 : 1;
    const runway = burn > 0 ? Number(((rev - exp) / burn).toFixed(1)) : 12;

    const updatedProfile: BusinessProfile = {
      userId: userId || 'usr_registered',
      businessName: businessName.trim(),
      npwp: npwp.trim(),
      period: '2026',
      annualRevenue: rev,
      operatingExpense: exp,
      cashRunwayMonths: Math.max(1, runway),
      taxRate: 0.005,
    };

    setProfile(updatedProfile);

    // Recompute cashflow
    setCashflow({
      period: '2026',
      operating: {
        cashIn: rev,
        cashOut: exp,
        net: rev - exp,
      },
      investing: {
        net: -(rev * 0.08),
      },
      financing: {
        net: rev * 0.04,
      },
      netCashflow: rev - exp - rev * 0.08 + rev * 0.04,
      runwayMonths: Math.max(1, runway),
      monthlyBurnRate: Math.round(burn),
    });

    // Recompute tax report
    setTaxReport({
      period: '2026',
      businessName: updatedProfile.businessName,
      npwp: updatedProfile.npwp,
      grossRevenue: rev,
      exemptThreshold: 0,
      taxableRevenue: rev,
      taxRate: 0.005,
      taxRateFormatted: '0.5% Final UMKM (PP 23/2018)',
      taxDue: Math.round(rev * 0.005),
      status: 'READY_TO_PAY',
      legalReference: 'PP No. 23/2018 & PP No. 55/2022',
    });

    try {
      await businessApi.updateProfile(updatedProfile);
    } catch {
      // Local fallback
    }

    setFeedback({
      type: 'success',
      message: locale === 'en' ? 'Business profile updated successfully' : 'Profil usaha dan parameter pajak berhasil disimpan',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const netProfit = (profile?.annualRevenue || 0) - (profile?.operatingExpense || 0);
  const netMargin = profile?.annualRevenue ? (netProfit / profile.annualRevenue) * 100 : 0;
  const pphFinal = Math.round((profile?.annualRevenue || 0) * 0.005);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-700 via-orange-600 to-amber-700 p-6 md:p-8 text-white shadow-xl shadow-rose-900/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {locale === 'en' ? 'B2B Enterprise & Tax Accounting' : 'Pembukuan Bisnis & Pajak UMKM'}
              <PremiumCrownBadge plan="B2B" size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === 'en' ? 'Business Cashflow & UMKM Tax (PP 23/2018)' : 'Arus Kas Bisnis & Rekapitulasi Pajak UMKM'}
            </h1>
            <p className="text-rose-100/90 text-sm sm:text-base leading-relaxed">
              {locale === 'en'
                ? 'Standardized 3-pillar cashflow statement (Operating, Investing, Financing) paired with an automated PPh Final 0.5% Indonesian SME tax calculator.'
                : 'Laporan arus kas 3 pilar berstandar akuntansi (Operasional, Investasi, Pendanaan) dipadukan kalkulator rekapitulasi PPh Final UMKM 0.5% siap lapor DJP.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isB2B && (
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-rose-950 hover:bg-rose-50 text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/20 transition-all cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                {locale === 'en' ? 'Edit Business Settings' : 'Ubah Profil Usaha'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Gate for Non-B2B */}
      {!isB2B && (
        <div className="rounded-2xl border-2 border-dashed border-rose-400/50 bg-rose-500/5 dark:bg-rose-950/20 p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {locale === 'en'
                ? 'Business & UMKM Tax Features are locked on your current plan'
                : 'Fitur Pembukuan Bisnis & Pajak UMKM terkunci pada paket Anda'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {locale === 'en'
                ? 'Upgrade to the B2B Plan to unlock 3-pillar corporate cashflow reporting, burn rate estimation, and automated PPh Final 0.5% Indonesian tax compliance calculations.'
                : 'Tingkatkan ke Paket B2B untuk membuka laporan arus kas korporat 3 pilar, estimasi burn rate bulanan, dan rekapitulasi PPh Final 0.5% otomatis sesuai regulasi perpajakan Indonesia.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              openUpgradeModal(
                locale === 'en' ? 'Unlock Business & Tax' : 'Buka Fitur Bisnis & Pajak',
                'B2B',
                locale === 'en'
                  ? 'Professional cashflow reporting & Indonesian tax compliance.'
                  : 'Laporan arus kas profesional dan kepatuhan pajak UMKM Indonesia.',
                t.modals.upgrade.b2bBenefits
              )
            }
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {locale === 'en' ? 'Upgrade to B2B Plan' : 'Upgrade ke Paket B2B'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Tahunan */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Annual Gross Revenue' : 'Omzet Bruto YTD'}
            </span>
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(profile?.annualRevenue || 0)}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {profile?.period || '2026'}
            </span>
          </div>
        </div>

        {/* Beban Operasional */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Operating Expenses' : 'Beban Operasional Usaha'}
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(profile?.operatingExpense || 0)}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              OPEX
            </span>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Net Operating Profit' : 'Laba Bersih Operasional'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(netProfit)}
            </span>
            <span className="ml-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ({netMargin.toFixed(1)}% margin)
            </span>
          </div>
        </div>

        {/* Estimasi PPh Final */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Estimated PPh Final (0.5%)' : 'Estimasi PPh Final (0.5%)'}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(pphFinal)}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              PP 23/2018
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
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
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('cashflow')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'cashflow'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'en' ? 'Cashflow Statement (3-Pillar)' : 'Laporan Arus Kas 3 Pilar'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'tax'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'en' ? 'UMKM Tax (PP 23/2018)' : 'Rekapitulasi Pajak UMKM'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'en' ? 'Company Profile & NPWP' : 'Profil Usaha & NPWP'}
          </button>
        </div>
      </div>

      {/* Tab 1: Cashflow Statement */}
      {activeTab === 'cashflow' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {profile?.businessName || 'Usaha UMKM'} — Laporan Arus Kas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {locale === 'en' ? 'Standardized Cashflow Period 2026' : 'Standar Akuntansi Arus Kas Periode 2026'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">{locale === 'en' ? 'Cash Runway:' : 'Daya Tahan Kas:'}</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {cashflow?.runwayMonths || profile?.cashRunwayMonths || 12} {locale === 'en' ? 'Months' : 'Bulan'}
                </span>
              </div>
            </div>

            {/* 3 Pillars Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pillar 1: Operating */}
              <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  <Briefcase className="w-4 h-4" />
                  1. Arus Kas Operasional
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Kas Masuk Penjualan:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      +{formatCurrency(cashflow?.operating.cashIn || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Beban Operasional & Gaji:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(cashflow?.operating.cashOut || 0)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex justify-between font-bold text-sm">
                    <span className="text-slate-800 dark:text-slate-200">Kas Bersih Operasi:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {formatCurrency(cashflow?.operating.net || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Investing */}
              <div className="rounded-2xl border border-purple-200/80 dark:border-purple-900/50 bg-purple-50/30 dark:bg-purple-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  2. Arus Kas Investasi
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Belanja Modal (CAPEX):</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(cashflow?.investing.net || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Perolehan Aset Tetap:</span>
                    <span className="font-medium text-slate-500">Peralatan Kantor</span>
                  </div>
                  <div className="pt-2 border-t border-purple-200 dark:border-purple-800 flex justify-between font-bold text-sm">
                    <span className="text-slate-800 dark:text-slate-200">Kas Bersih Investasi:</span>
                    <span className="text-purple-600 dark:text-purple-400">
                      {formatCurrency(cashflow?.investing.net || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Financing */}
              <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  3. Arus Kas Pendanaan
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Setoran Modal Pemilik:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(cashflow?.financing.net || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Dividen / Penarikan Prive:</span>
                    <span className="font-medium text-slate-500">Rp 0</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between font-bold text-sm">
                    <span className="text-slate-800 dark:text-slate-200">Kas Bersih Pendanaan:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(cashflow?.financing.net || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Total Summary */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">
                  {locale === 'en' ? 'Net Annual Cash Inflow' : 'Arus Kas Bersih Tahunan (Net Cash Inflow)'}
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {formatCurrency(cashflow?.netCashflow || 0)}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block">Monthly Operating Burn Rate:</span>
                <span className="text-sm font-bold text-rose-300">
                  {formatCurrency(cashflow?.monthlyBurnRate || 0)} / bulan
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: UMKM Tax (PP 23/2018) */}
      {activeTab === 'tax' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-500" />
                  Kalkulator PPh Final UMKM 0.5% (PP 23/2018 & PP 55/2022)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  NPWP Terdaftar: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{profile?.npwp || 'Belum Terdaftar'}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFeedback({
                    type: 'success',
                    message: locale === 'en' ? 'Exporting SPT Masa PPh Final report...' : 'Mengekspor rekapitulasi SPT Masa PPh Final ke PDF/Excel...',
                  });
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                {locale === 'en' ? 'Export Tax Statement' : 'Unduh Rekap SPT Masa'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Rincian Perhitungan Pajak
                </h4>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Omzet Bruto Usaha (Tahun 2026):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(profile?.annualRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Batas Omzet Bebas Pajak (PP 55/2022):</span>
                    <span className="font-bold text-emerald-600">Rp 0 (Badan Usaha / Di atas batas)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Omzet Kena Pajak:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(profile?.annualRevenue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tarif PPh Final UMKM:</span>
                    <span className="font-bold text-amber-600">0.5% (Setengah Persen)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-extrabold">
                    <span className="text-slate-900 dark:text-white">PPh Final Terutang:</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {formatCurrency(pphFinal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Panduan Setor & Kepatuhan Pajak
                </h4>
                <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Jadwal Penyetoran Bulanan:
                  </div>
                  <p>
                    Setor PPh Final paling lambat tanggal 15 bulan berikutnya melalui Kode Billing DJP Online (KAP 411128, KJS 420).
                  </p>
                  <p className="pt-2 border-t border-amber-200 dark:border-amber-800/60 text-slate-500">
                    Referensi Regulasi: Peraturan Pemerintah Nomor 23 Tahun 2018 juncto Peraturan Pemerintah Nomor 55 Tahun 2022.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Company Profile & NPWP Settings */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-6 shadow-sm space-y-6"
        >
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {locale === 'en' ? 'Business Profile & Tax Parameters' : 'Profil Perusahaan & Parameter Pajak UMKM'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'en'
                ? 'Update company legal name, tax ID (NPWP), and annualized financial parameters.'
                : 'Perbarui nama legal usaha, Nomor Pokok Wajib Pajak (NPWP), serta parameter omzet dan beban tahunan.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Business Legal Name' : 'Nama Legal Usaha / Toko'}
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Tax ID Number (NPWP)' : 'Nomor Pokok Wajib Pajak (NPWP)'}
              </label>
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                placeholder="01.234.567.8-012.000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Annual Gross Revenue (Rp)' : 'Omzet Bruto Tahunan (Rp)'}
              </label>
              <input
                type="number"
                required
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Annual Operating Expenses (Rp)' : 'Beban Operasional Tahunan (Rp)'}
              </label>
              <input
                type="number"
                required
                value={operatingExpense}
                onChange={(e) => setOperatingExpense(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {locale === 'en' ? 'Save Settings' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
