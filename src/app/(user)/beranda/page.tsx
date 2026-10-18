'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { GlassCard } from '@/components/common/GlassCard';
import { CashflowChart } from '@/components/charts/CashflowChart';
import { CategoryDonutChart } from '@/components/charts/CategoryDonutChart';
import { EditAllowanceModal } from '@/components/finance/EditAllowanceModal';
import { WalletManagerModal } from '@/components/finance/WalletManagerModal';
import { DebtManagerModal } from '@/components/finance/DebtManagerModal';
import { SharedWorkspaceModal } from '@/components/finance/SharedWorkspaceModal';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  AlertCircle,
  Plus,
  Camera,
  ChevronRight,
  Receipt,
  Sparkles,
  Edit3,
  HandCoins,
  Building2,
  Crown,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function BerandaPage() {
  const { t, locale, formatCurrency, formatDate } = useLanguage();
  const { user } = useAuth();
  const { summary, activeBudgetWarning, dismissWarning, transactions } = useFinance();
  const { tier, hasAccess, openUpgradeModal, wallets, debts, workspaceMembers } = useSubscription();

  const [isEditAllowanceOpen, setIsEditAllowanceOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  const recentTransactions = transactions.slice(0, 5);

  const budgetUsagePercent =
    summary.totalBudgetLimit > 0
      ? Math.min(100, Math.round((summary.totalBudgetSpent / summary.totalBudgetLimit) * 100))
      : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* User Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8AD6D1]/20 text-[#1C4A6B] border border-[#8AD6D1]/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#4D8DBA]" />
              Cuanly Personal
            </span>
            {user?.role === 'ADMIN' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>Admin Full Feature</span>
              </span>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
                title="Lihat / Kelola Paket Langganan"
              >
                <Crown className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>
                  {tier === 'FREE' && 'Plan: Basic (Free)'}
                  {tier === 'SILVER' && 'Plan: Silver Pro'}
                  {tier === 'GOLD' && 'Plan: Gold Max'}
                  {tier === 'B2B' && 'Plan: B2B Enterprise'}
                </span>
              </Link>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark mt-1">
            {t.home.greeting} {user?.name || 'Kawan Cuanly'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {t.tagline}
          </p>
        </div>

        {/* Quick Action Buttons on Desktop / Top */}
        <div className="flex items-center gap-2">
          <Link
            href="/transaksi/scan"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-[#1C4A6B] border border-[#AEC4D4]/60 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all hover:shadow-sm"
          >
            <Camera className="w-4 h-4 text-[#4D8DBA]" />
            <span>{t.receipt.scannerTitle}</span>
          </Link>
          <Link
            href="/transaksi/tambah"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-[#4D8DBA]/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#8AD6D1]" />
            <span>{t.home.addExpenseBtn}</span>
          </Link>
        </div>
      </div>

      {/* Hero Balance Card with Gradient & Glass Accents */}
      <GlassCard variant="gradient" className="relative overflow-hidden p-6 sm:p-7">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#8AD6D1]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Balance info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#8AD6D1]" />
                {t.home.totalBalance}
              </span>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title={t.nav.myWallets}
              >
                <span>{wallets.length} {locale === 'en' ? 'Wallets' : 'Dompet'}</span>
                {!hasAccess('SILVER') && (
                  <PremiumCrownBadge plan="SILVER" />
                )}
              </button>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight num-tabular text-white">
              {formatCurrency(summary.totalBalance)}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <p className="text-xs text-gray-200">
                {t.home.remainingBudget}:{' '}
                <span className="font-bold text-white num-tabular">
                  {formatCurrency(summary.remainingBudget)}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setIsEditAllowanceOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8AD6D1] hover:text-white underline hover:no-underline transition-colors"
                title={t.home.editAllowance}
              >
                <Edit3 className="w-3 h-3 text-[#8AD6D1]" />
                <span>{t.home.editAllowance}</span>
              </button>
            </div>
          </div>

          {/* Income vs Expense Pill Indicators */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-white/20">
            <div>
              <div className="flex items-center gap-1 text-[11px] text-[#8AD6D1] font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{t.common.income}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[#8AD6D1] num-tabular mt-0.5">
                +{formatCurrency(summary.thisMonthIncome)}
              </div>
            </div>
            <div className="border-l border-white/20 pl-3 sm:pl-4">
              <div className="flex items-center gap-1 text-[11px] text-rose-200 font-medium">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>{t.common.expense}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-rose-300 num-tabular mt-0.5">
                -{formatCurrency(summary.thisMonthExpense)}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Budget Usage Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-gray-200 mb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{t.home.monthlyBudgetUsage}</span>
              <button
                type="button"
                onClick={() => setIsEditAllowanceOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition-all hover:scale-105 active:scale-95"
                title={t.home.editAllowance}
              >
                <Edit3 className="w-3 h-3 text-[#8AD6D1]" />
                <span>{t.home.editAllowance}</span>
              </button>
            </div>
            <span className="font-bold text-white num-tabular">
              {budgetUsagePercent}% ({t.home.usedOf} {formatCurrency(summary.totalBudgetSpent)} / {formatCurrency(summary.totalBudgetLimit)})
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent >= 100
                  ? 'bg-rose-500'
                  : budgetUsagePercent >= 75
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-[#8AD6D1] to-[#4D8DBA]'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Subscription Features Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Feature 1: Dompet Multi-Akun */}
        <button
          type="button"
          onClick={() => setIsWalletModalOpen(true)}
          className="p-4 rounded-2xl bg-white/80 dark:bg-[#0B1520]/80 backdrop-blur-xl border border-gray-200/80 dark:border-[#4D8DBA]/20 hover:border-[#4D8DBA] transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#4D8DBA] dark:text-[#8AD6D1] flex items-center justify-center border border-blue-200/50">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#4D8DBA]">
                  {t.nav.myWallets}
                </h4>
                {!hasAccess('SILVER') && (
                  <PremiumCrownBadge plan="SILVER" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {wallets.length} {t.nav.walletsSaved} {!hasAccess('SILVER') && t.nav.max2}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Feature 2: Manajemen Utang & Piutang (Gold Plan) */}
        <button
          type="button"
          onClick={() => {
            if (!hasAccess('GOLD')) {
              openUpgradeModal(
                t.modals.debt.title,
                'GOLD',
                t.modals.debt.subtitle
              );
              return;
            }
            setIsDebtModalOpen(true);
          }}
          className="p-4 rounded-2xl bg-white/80 dark:bg-[#0B1520]/80 backdrop-blur-xl border border-gray-200/80 dark:border-[#4D8DBA]/20 hover:border-amber-400 transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-amber-600">
                  {t.nav.debtManager}
                </h4>
                {!hasAccess('GOLD') && (
                  <PremiumCrownBadge plan="GOLD" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {hasAccess('GOLD')
                  ? `${debts.length} ${locale === 'en' ? 'active records' : 'catatan aktif'}`
                  : (locale === 'en' ? 'Requires Gold Plan' : 'Perlu Gold Plan')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Feature 3: Shared Workspace Tim (B2B Plan) */}
        <button
          type="button"
          onClick={() => {
            if (!hasAccess('B2B')) {
              openUpgradeModal(
                t.modals.workspace.title,
                'B2B',
                t.modals.workspace.subtitle
              );
              return;
            }
            setIsWorkspaceModalOpen(true);
          }}
          className="p-4 rounded-2xl bg-white/80 dark:bg-[#0B1520]/80 backdrop-blur-xl border border-gray-200/80 dark:border-[#4D8DBA]/20 hover:border-purple-400 transition-all text-left flex items-center justify-between group shadow-xs hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200/50">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600">
                  {t.nav.teamWorkspace}
                </h4>
                {!hasAccess('B2B') && (
                  <PremiumCrownBadge plan="B2B" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {hasAccess('B2B')
                  ? `${workspaceMembers.length} ${locale === 'en' ? 'active team members' : 'anggota tim aktif'}`
                  : (locale === 'en' ? 'Requires B2B Plan' : 'Perlu B2B Plan')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Smart Budget Warning Alert Banner */}
      {activeBudgetWarning && (() => {
        const warningCatName =
          (activeBudgetWarning.categoryId && (t.categories as Record<string, string>)[activeBudgetWarning.categoryId]) ||
          activeBudgetWarning.categoryName;

        return (
          <div
            className="p-4 rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-[#112233] shadow-xs mt-0.5">
                {activeBudgetWarning.isOverbudget ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                  {activeBudgetWarning.isOverbudget
                    ? (locale === 'en'
                        ? `Warning: Category ${warningCatName} Exceeded Limit!`
                        : `Perhatian: Kategori ${warningCatName} Melebihi Batas!`)
                    : t.home.budgetWarningTitle}
                </h4>
                <p className="text-xs mt-0.5 leading-relaxed text-rose-800 dark:text-rose-200/90">
                  {locale === 'en'
                    ? `Your spending for category ${warningCatName} has reached `
                    : 'Pengeluaran untuk kategori '}
                  <strong>{warningCatName}</strong>{' '}
                  {locale === 'en' ? 'has reached ' : 'telah mencapai '}
                  <span className="font-bold">{activeBudgetWarning.percent}%</span>{' '}
                  {locale === 'en' ? 'of your specified budget limit.' : 'dari batas yang Anda tentukan.'}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    href={`/budget/${activeBudgetWarning.categorySlug}`}
                    className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 underline hover:no-underline"
                  >
                    {locale === 'en' ? 'View Budget Details →' : 'Lihat Detail Budget →'}
                  </Link>
                  <button
                    type="button"
                    onClick={dismissWarning}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 cursor-pointer"
                  >
                    {locale === 'en' ? 'Dismiss Alert' : 'Tutup Peringatan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2-Column Analytics Section: Cashflow Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <CashflowChart />
        </GlassCard>

        <GlassCard>
          <CategoryDonutChart />
        </GlassCard>
      </div>

      {/* Recent Transactions List with "See All" */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-cuanly-primaryDark flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cuanly-primary" />
              {t.home.recentTransactions}
            </h3>
            <p className="text-xs text-gray-500">
              {locale === 'en' ? '5 most recent transactions logged' : '5 mutasi terakhir yang dicatat'}
            </p>
          </div>
          <Link
            href="/transaksi"
            className="flex items-center gap-1 text-xs font-bold text-cuanly-primary hover:text-cuanly-primaryDark px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>{t.common.seeAll}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentTransactions.map((tx) => (
            <Link
              key={tx.id}
              href={`/transaksi/${tx.id}`}
              className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 px-2 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                    tx.type === 'INCOME'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-cuanly-primaryDark border border-gray-200'
                  }`}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-cuanly-primaryDark truncate group-hover:text-emerald-700 transition-colors">
                      {(t.categories as Record<string, string>)[tx.categoryId] || tx.categoryName}
                    </h4>
                    {tx.receipt && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {locale === 'en' ? 'Receipt' : 'Struk'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate max-w-xs sm:max-w-md">
                    {tx.notes || formatDate(tx.date)}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div
                  className={`text-sm font-bold num-tabular ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-cuanly-primaryDark'
                  }`}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </div>
                <span className="text-[10px] text-gray-400">
                  {formatDate(tx.date)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* Edit Allowance Modal */}
      <EditAllowanceModal
        isOpen={isEditAllowanceOpen}
        onClose={() => setIsEditAllowanceOpen(false)}
      />

      {/* Wallet Manager Modal */}
      <WalletManagerModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Debt Manager Modal */}
      <DebtManagerModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
      />

      {/* Shared Workspace Modal */}
      <SharedWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />
    </div>
  );
}
