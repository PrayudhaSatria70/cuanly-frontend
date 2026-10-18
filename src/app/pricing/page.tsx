'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionTier } from '@/types';
import { CuanlyLogo } from '@/components/common/CuanlyLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Shield,
  Zap,
  Wallet,
  Users,
  Sun,
  Moon,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  ChevronDown,
  Building2,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { tier, upgradePlan } = useSubscription();

  // Billing toggle: 'monthly' or 'annual'
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Selected plan modal for simulated checkout / registration
  const [selectedPlanModal, setSelectedPlanModal] = useState<{
    id: string;
    name: string;
    price: string;
    target: string;
  } | null>(null);

  // FAQ accordion active item
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const p = t.pricing;

  const handleSelectPlan = (planId: string, planName: string, price: string, target: string) => {
    if (isAuthenticated) {
      setSelectedPlanModal({ id: planId, name: planName, price, target });
    } else {
      router.push(`/register?plan=${planId}&billing=${billingCycle}`);
    }
  };

  return (
    <div className="min-h-screen bg-cuanly-canvas dark:bg-[#071018] text-[#0C2340] dark:text-slate-100 transition-colors duration-200">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#8AD6D1]/20 via-[#4D8DBA]/15 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-96 -left-32 w-96 h-96 bg-[#4D8DBA]/10 rounded-full blur-3xl" />
        <div className="absolute top-[800px] -right-32 w-96 h-96 bg-[#8AD6D1]/15 rounded-full blur-3xl" />
      </div>

      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 w-full glass-header border-b border-gray-200/80 dark:border-[#4D8DBA]/20 backdrop-blur-xl bg-white/80 dark:bg-[#071018]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Back Button & Cuanly Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={isAuthenticated ? '/beranda' : '/login'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#4D8DBA]/35 text-xs font-bold text-gray-700 dark:text-slate-200 hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] hover:border-[#4D8DBA] dark:hover:border-[#8AD6D1] hover:bg-[#AEC4D4]/15 transition-all shadow-2xs group cursor-pointer"
              title={isAuthenticated ? p.backToHome : p.backToLogin}
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{isAuthenticated ? p.backToHome : p.backToLogin}</span>
            </Link>

            <div className="h-5 w-px bg-gray-200 dark:bg-[#4D8DBA]/30 hidden sm:block" />

            <Link href="/" className="hover:opacity-90 transition-opacity flex items-center">
              <CuanlyLogo size="sm" variant="full" />
            </Link>
          </div>

          {/* Right: Theme Toggle, Language Switcher, & Auth Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                isDark
                  ? 'bg-[#0D1926] text-amber-300 border-[#4D8DBA]/40 hover:bg-[#112233]'
                  : 'bg-white text-slate-700 border-[#AEC4D4]/60 hover:bg-[#AEC4D4]/15'
              }`}
              title={isDark ? (t.common.lightMode || 'Mode Terang') : (t.common.darkMode || 'Mode Gelap')}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#4D8DBA]" />
              )}
            </button>

            <LanguageSwitcher compact />

            {!isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-[#4D8DBA]/30">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-200 hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] transition-colors"
                >
                  {t.common.login}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#4D8DBA] to-[#2E678E] hover:from-[#2E678E] hover:to-[#1C4A6B] rounded-xl shadow-xs transition-all hover:shadow-md"
                >
                  {t.common.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Summary Cuanly itu apa & Hook untuk Subscribing           */}
        {/* ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#8AD6D1]/20 dark:bg-[#8AD6D1]/15 text-[#1C4A6B] dark:text-[#8AD6D1] border border-[#8AD6D1]/40 shadow-2xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
            <span>{p.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0C2340] dark:text-white leading-[1.15]">
            {p.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 font-medium">
            {p.heroSubtitle}
          </p>

          {/* ===================================================================== */}
          {/* MANDATORY BOX 1: Kalimat Summary Cuanly itu Apa                        */}
          {/* MANDATORY BOX 2: Hook untuk Subscribing                               */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-3">
            {/* Summary Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-[#EDF5FA]/80 dark:from-[#0D1926]/90 dark:via-[#0B1520]/80 dark:to-[#071018]/90 backdrop-blur-xl border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/30 shadow-lg relative overflow-hidden group hover:border-[#4D8DBA] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4D8DBA]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[#4D8DBA] dark:text-[#8AD6D1]">
                <div className="p-1.5 rounded-lg bg-[#4D8DBA]/15 text-[#4D8DBA] dark:text-[#8AD6D1]">
                  <Wallet className="w-4 h-4" />
                </div>
                <span>{p.cuanlySummaryTitle}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-normal">
                {p.cuanlySummaryText}
              </p>
            </div>

            {/* Hook Subscribing Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#EDF5FA]/90 via-white/80 to-[#E3F4F3]/70 dark:from-[#0B1A28]/90 dark:via-[#091520]/80 dark:to-[#081F26]/90 backdrop-blur-xl border border-[#8AD6D1]/50 dark:border-[#8AD6D1]/30 shadow-lg relative overflow-hidden group hover:border-[#8AD6D1] transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8AD6D1]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[#2E678E] dark:text-[#8AD6D1]">
                <div className="p-1.5 rounded-lg bg-[#8AD6D1]/25 text-[#1C4A6B] dark:text-[#8AD6D1]">
                  <Zap className="w-4 h-4" />
                </div>
                <span>{p.subscriptionHookTitle}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-normal">
                {p.subscriptionHookText}
              </p>
            </div>
          </div>

          {/* Billing Cycle Switcher (Monthly vs Annual with Savings Badge) */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <div className="p-1.5 bg-gray-200/70 dark:bg-[#0D1926] rounded-2xl flex items-center border border-gray-300/80 dark:border-[#4D8DBA]/35 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-[#4D8DBA] text-[#1C4A6B] dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p.billingMonthly}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-white dark:bg-[#4D8DBA] text-[#1C4A6B] dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{p.billingAnnual}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#8AD6D1] text-[#0C2340] shadow-2xs">
                  {p.annualSavingsBadge}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. THE 4 PRICING PLAN CARDS (Matching user image specifications)           */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {/* ------------------------------------------------------------- */}
            {/* CARD 1: Basic (Free)                                          */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white/95 via-white/85 to-[#F4F8FA]/90 dark:from-[#0D1926]/95 dark:via-[#0B1520]/90 dark:to-[#071018]/95 backdrop-blur-2xl border border-white/80 dark:border-[#4D8DBA]/25 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden group">
              <div>
                {/* Header & Target Persona */}
                <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-slate-300">
                    {p.starterBadge}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0C2340] dark:text-white">
                    {p.basicPlanName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <span className="font-semibold text-[#4D8DBA] dark:text-[#8AD6D1]">
                      Target:
                    </span>
                    <span>{p.basicTarget}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="py-5 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#0C2340] dark:text-white">
                      {p.basicPriceDisplay}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                      {p.basicPeriod}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {locale === 'en' ? 'Rp0 (Forever) with no hidden fees' : 'Rp0 (Selamanya) tanpa biaya tersembunyi'}
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
                    {p.colFeatures}
                  </span>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-slate-300">
                    {p.basicFeatureList.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPlan('basic', p.basicPlanName, p.basicPrice, p.basicTarget)
                  }
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#0C2340] dark:text-white transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{p.ctaStartFree}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 2: Silver Plan                                           */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white/95 via-white/85 to-[#EDF5FA]/90 dark:from-[#0D1926]/95 dark:via-[#0B1520]/90 dark:to-[#071018]/95 backdrop-blur-2xl border border-[#8AD6D1]/60 dark:border-[#8AD6D1]/35 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden group">
              <div>
                {/* Header & Target Persona */}
                <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#8AD6D1]/20 text-[#1C4A6B] dark:text-[#8AD6D1]">
                    {p.popularBadge}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0C2340] dark:text-white">
                    {p.silverPlanName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <span className="font-semibold text-[#4D8DBA] dark:text-[#8AD6D1]">
                      Target:
                    </span>
                    <span>{p.silverTarget}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="py-5 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#0C2340] dark:text-white">
                      {billingCycle === 'annual' ? p.silverPriceAnnual : p.silverPriceMonthly}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                      {billingCycle === 'annual' ? p.silverAnnualPeriod : p.silverMonthlyPeriod}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4D8DBA] dark:text-[#8AD6D1] font-semibold">
                    {billingCycle === 'annual'
                      ? (locale === 'en' ? 'Equivalent to Rp7,416/mo (Save Rp31,000)' : 'Setara Rp7.416/bulan (Hemat Rp31.000)')
                      : p.silverAnnualAlt}
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 block">
                    {p.colFeatures}
                  </span>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-slate-300">
                    {p.silverFeatureList.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#4D8DBA] dark:text-[#8AD6D1] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className={idx === 0 ? 'font-bold text-[#1C4A6B] dark:text-white' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPlan(
                      'silver',
                      p.silverPlanName,
                      billingCycle === 'annual' ? 'Rp89.000/tahun' : 'Rp10.000/bulan',
                      p.silverTarget
                    )
                  }
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#4D8DBA] to-[#2E678E] hover:from-[#2E678E] hover:to-[#1C4A6B] text-white transition-all shadow-md shadow-[#4D8DBA]/25 hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{p.ctaChooseSilver}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8AD6D1]" />
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 3: Gold Plan (HIGHLIGHTED / BEST VALUE)                   */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white/95 via-amber-50/30 to-[#EDF5FA]/90 dark:from-[#0D1926]/95 dark:via-[#191F26]/90 dark:to-[#071018]/95 backdrop-blur-2xl border-2 border-amber-400/80 dark:border-amber-400/60 shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all relative overflow-hidden group xl:-mt-2 xl:mb-2">
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-[#0C2340] text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-xl shadow-xs">
                {p.recommendedBadge}
              </div>

              <div>
                {/* Header & Target Persona */}
                <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-700 dark:text-amber-300">
                    Power User
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0C2340] dark:text-white flex items-center gap-1.5">
                    <span>{p.goldPlanName}</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      Target:
                    </span>
                    <span>{p.goldTarget}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="py-5 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#0C2340] dark:text-white">
                      {billingCycle === 'annual' ? p.goldPriceAnnual : p.goldPriceMonthly}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                      {billingCycle === 'annual' ? p.goldAnnualPeriod : p.goldMonthlyPeriod}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                    {billingCycle === 'annual'
                      ? (locale === 'en' ? 'Equivalent to Rp16,583/mo (Save Rp101,000)' : 'Setara Rp16.583/bulan (Hemat Rp101.000)')
                      : p.goldAnnualAlt}
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    {p.colFeatures}
                  </span>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-slate-300">
                    {p.goldFeatureList.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className={idx === 1 ? 'font-bold text-[#0C2340] dark:text-white' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPlan(
                      'gold',
                      p.goldPlanName,
                      billingCycle === 'annual' ? 'Rp199.000/tahun' : 'Rp25.000/bulan',
                      p.goldTarget
                    )
                  }
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{p.ctaChooseGold}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-200" />
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 4: B2B Plan                                              */}
            {/* ------------------------------------------------------------- */}
            <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-white/95 via-white/85 to-[#EDF5FA]/90 dark:from-[#0D1926]/95 dark:via-[#0B1520]/90 dark:to-[#071018]/95 backdrop-blur-2xl border border-[#4D8DBA]/60 dark:border-[#4D8DBA]/40 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden group">
              <div>
                {/* Header & Target Persona */}
                <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {p.enterpriseBadge}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0C2340] dark:text-white flex items-center gap-1.5">
                    <span>{p.b2bPlanName}</span>
                    <Building2 className="w-4 h-4 text-[#4D8DBA]" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      Target:
                    </span>
                    <span>{p.b2bTarget}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="py-5 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-[#0C2340] dark:text-white">
                      {p.b2bPriceMonthly}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                      {p.b2bMonthlyPeriod}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-600 dark:text-purple-300 font-bold">
                    {p.b2bAccountsNote}
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                    {p.colFeatures}
                  </span>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-slate-300">
                    {p.b2bFeatureList.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className={idx === 1 ? 'font-bold text-[#0C2340] dark:text-white' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectPlan('b2b', p.b2bPlanName, p.b2bPrice, p.b2bTarget)
                  }
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-700 to-[#1C4A6B] hover:from-purple-800 hover:to-[#0C2340] text-white transition-all shadow-md shadow-purple-900/20 hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{p.ctaChooseB2B}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. EXACT COMPARATIVE TABLE VIEW (Matching the image 1:1)                  */}
        {/* ========================================================================= */}
        <section className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-lg sm:text-2xl font-black text-[#0C2340] dark:text-white">
                <span className="text-xl">📊</span>
                <h2>{p.tableTitle}</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 pt-1">
                {p.tableSubtitle}
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/30 overflow-hidden shadow-2xl bg-white/90 dark:bg-[#0D1926]/90 backdrop-blur-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#4D8DBA]/30 bg-gray-50/90 dark:bg-[#071018]/90 text-gray-700 dark:text-slate-300 font-extrabold uppercase tracking-wider text-[11px]">
                    <th scope="col" className="p-4 sm:p-5 w-[18%]">
                      {p.colPlan}
                    </th>
                    <th scope="col" className="p-4 sm:p-5 w-[20%]">
                      {p.colTarget}
                    </th>
                    <th scope="col" className="p-4 sm:p-5 w-[22%]">
                      {p.colPrice}
                    </th>
                    <th scope="col" className="p-4 sm:p-5 w-[40%]">
                      {p.colFeatures}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                  {/* Row 1: Basic (Free) */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#112233]/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#0C2340] dark:text-white whitespace-nowrap">
                      {p.basicPlanName}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-slate-300">
                      {p.basicTarget}
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-[#1C4A6B] dark:text-[#8AD6D1]">
                      {p.basicPrice}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-700 dark:text-slate-300 leading-relaxed">
                      {locale === 'en' ? (
                        <>
                          Basic manual recording, maximum <strong>2 Wallets</strong>, standard monthly chart reports, basic cloud synchronization.
                        </>
                      ) : (
                        <>
                          Pencatatan manual dasar, maksimal <strong>2 Wallets</strong>, laporan grafik bulanan standar, sinkronisasi cloud dasar.
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Silver Plan */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#112233]/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#0C2340] dark:text-white whitespace-nowrap">
                      {p.silverPlanName}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-slate-300 italic">
                      {p.silverTarget}
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="font-bold text-[#1C4A6B] dark:text-[#8AD6D1]">
                        {locale === 'en' ? 'Rp10,000 / month' : 'Rp10.000 / bulan'}
                      </div>
                      <div className="text-[11px] text-gray-400 italic">
                        {locale === 'en' ? '(or Rp89,000/year)' : '(atau Rp89.000/tahun)'}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-700 dark:text-slate-300 leading-relaxed">
                      {locale === 'en' ? (
                        <>
                          <strong>Unlimited Wallets</strong>, export reports to CSV/Excel, custom date-range chart filter access, ad-free.
                        </>
                      ) : (
                        <>
                          <strong>Unlimited Wallets</strong>, ekspor laporan ke CSV/Excel, akses filter grafik kustom (by rentang tanggal), bebas iklan.
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 3: Gold Plan */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#112233]/40 transition-colors bg-amber-500/5">
                    <td className="p-4 sm:p-5 font-bold text-[#0C2340] dark:text-white whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <span>{p.goldPlanName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-[#0C2340]">
                          HOT
                        </span>
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-slate-300 italic">
                      {p.goldTarget}
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="font-bold text-amber-600 dark:text-amber-400">
                        {locale === 'en' ? 'Rp25,000 / month' : 'Rp25.000 / bulan'}
                      </div>
                      <div className="text-[11px] text-gray-400 italic">
                        {locale === 'en' ? '(or Rp199,000/year)' : '(atau Rp199.000/tahun)'}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-700 dark:text-slate-300 leading-relaxed">
                      {locale === 'en' ? (
                        <>
                          All Silver features + <strong>Budgeting Feature (Custom Threshold)</strong>, manual debt/receivables tracking, priority <em>cloud backup</em>.
                        </>
                      ) : (
                        <>
                          Semua fitur Silver + <strong>Fitur Budgeting (Custom Threshold)</strong>, manajemen utang/piutang manual, prioritas <em>cloud backup</em>.
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 4: B2B Plan */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-[#112233]/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#0C2340] dark:text-white whitespace-nowrap">
                      {p.b2bPlanName}
                    </td>
                    <td className="p-4 sm:p-5 text-gray-600 dark:text-slate-300">
                      {p.b2bTarget}
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="font-bold text-purple-700 dark:text-purple-300">
                        {locale === 'en' ? 'Rp59,000 / month' : 'Rp59.000 / bulan'}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {locale === 'en' ? '(Max. 3-5 accounts)' : '(Maks. 3-5 akun)'}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-700 dark:text-slate-300 leading-relaxed">
                      {locale === 'en' ? (
                        <>
                          All Gold features + <strong>Shared Workspace</strong> (Single wallet database accessible and editable collaboratively by team members).
                        </>
                      ) : (
                        <>
                          Semua fitur Gold + <strong>Shared Workspace</strong> (Satu database dompet yang bisa diakses dan di-edit bersama oleh beberapa akun tim).
                        </>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. FREQUENTLY ASKED QUESTIONS (FAQ) & TRUST SECTION                       */}
        {/* ========================================================================= */}
        <section className="max-w-4xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0C2340] dark:text-white">
              {p.faqTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              {locale === 'en'
                ? 'Clear answers regarding subscriptions, billing, and team workspaces'
                : 'Jawaban transparan seputar paket langganan, pembayaran, dan sistem kolaborasi'}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { q: p.faq1Q, a: p.faq1A },
              { q: p.faq2Q, a: p.faq2A },
              { q: p.faq3Q, a: p.faq3A },
              { q: p.faq4Q, a: p.faq4A },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 dark:border-[#4D8DBA]/25 bg-white/80 dark:bg-[#0D1926]/80 backdrop-blur-md overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#0C2340] dark:text-white hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#4D8DBA] dark:text-[#8AD6D1] flex-shrink-0" />
                    <span>{item.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-[#4D8DBA]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-gray-600 dark:text-slate-300 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. BOTTOM CTA BANNER: Final hook for registration / subscribing           */}
        {/* ========================================================================= */}
        <section className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#1C4A6B] via-[#2E678E] to-[#4D8DBA] text-white shadow-2xl relative overflow-hidden border border-white/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#8AD6D1]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8AD6D1]/30 text-white border border-white/30 inline-block">
              {locale === 'en' ? '🚀 Start in 60 Seconds' : '🚀 Mulai Dalam 60 Detik'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {locale === 'en'
                ? 'Ready to Take Full Control of Your Financial Future?'
                : 'Siap Mengambil Kendali Penuh atas Masa Depan Finansial Anda?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed">
              {locale === 'en'
                ? 'Join thousands of users who have streamlined their cashflow and avoided overspending with Cuanly. Start free or unlock full power with Silver, Gold, or B2B.'
                : 'Bergabunglah dengan ribuan pengguna yang telah merapikan cashflow dan menghindari boncos bersama Cuanly. Mulai gratis sekarang atau buka fitur tak terbatas dengan paket langganan terbaik.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-[#1C4A6B] hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] inline-flex items-center gap-2"
              >
                <span>{locale === 'en' ? 'Get Started Now' : 'Daftar Akun Baru Sekarang'}</span>
                <ArrowRight className="w-4 h-4 text-[#4D8DBA]" />
              </Link>
              <Link
                href="/login"
                className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all active:scale-[0.98]"
              >
                {t.common.login}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: Active user plan selection confirmation                            */}
      {/* ========================================================================= */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0D1926] border border-[#AEC4D4]/60 dark:border-[#4D8DBA]/40 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-[#8AD6D1]/20 text-[#1C4A6B] dark:text-[#8AD6D1]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#0C2340] dark:text-white">
                  {locale === 'en' ? 'Confirm Selected Plan' : 'Konfirmasi Pilihan Paket'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EDF5FA]/80 to-white dark:from-[#071018] dark:to-[#0B1520] border border-[#AEC4D4]/40 dark:border-[#4D8DBA]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{locale === 'en' ? 'Selected Plan:' : 'Paket Terpilih:'}</span>
                <span className="text-xs font-extrabold text-[#4D8DBA] dark:text-[#8AD6D1]">
                  {selectedPlanModal.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{locale === 'en' ? 'Price:' : 'Harga:'}</span>
                <span className="text-sm font-black text-[#0C2340] dark:text-white">
                  {selectedPlanModal.price}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{locale === 'en' ? 'Target Persona:' : 'Target Persona:'}</span>
                <span className="text-xs text-gray-700 dark:text-slate-300">
                  {selectedPlanModal.target}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              {locale === 'en'
                ? 'Your account is connected. Click the button below to activate this subscription plan simulation.'
                : 'Status akun Anda saat ini terhubung. Klik tombol di bawah untuk melanjutkan aktivasi simulasi paket langganan ini ke akun Anda.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetTier = selectedPlanModal.id.toUpperCase() as SubscriptionTier;
                  upgradePlan(targetTier);
                  setSelectedPlanModal(null);
                  router.push('/beranda');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#4D8DBA] to-[#2E678E] text-white text-xs font-bold hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{locale === 'en' ? 'Activate Now' : 'Aktifkan Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <footer className="border-t border-gray-200/80 dark:border-[#4D8DBA]/20 py-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Cuanly. {p.securityGuarantee}</p>
      </footer>
    </div>
  );
}
