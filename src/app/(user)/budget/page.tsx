'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { EditAllowanceModal } from '@/components/finance/EditAllowanceModal';
import { CustomThresholdModal } from '@/components/finance/CustomThresholdModal';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  PieChart,
  Edit2,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  Wallet,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
  const { t, locale, formatCurrency, activeCurrency } = useLanguage();
  const { categories, summary, getCategoryBudgetInfo, updateBudget } = useFinance();
  const { hasAccess, openUpgradeModal, warningThresholdPercent } = useSubscription();

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState<number>(0);
  const [isEditAllowanceOpen, setIsEditAllowanceOpen] = useState<boolean>(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const handleOpenEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditingLimit(currentLimit);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCatId && editingLimit > 0) {
      updateBudget(editingCatId, editingLimit);
      setEditingCatId(null);
    }
  };

  const totalUsedPercent =
    summary.totalBudgetLimit > 0
      ? Math.min(100, Math.round((summary.totalBudgetSpent / summary.totalBudgetLimit) * 100))
      : 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
            {t.budget.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {t.budget.subtitle}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Canva-style Button: Custom Threshold with Crown 👑 */}
          <button
            type="button"
            onClick={() => {
              if (!hasAccess('GOLD')) {
                openUpgradeModal(
                  t.modals.threshold.title,
                  'GOLD',
                  t.modals.threshold.subtitle,
                  locale === 'en'
                    ? [
                        'Customize category spending warning threshold with flexible percentages',
                        'Proactive overspending prevention before your budget is exhausted',
                        'Comprehensive manual debt and receivables tracking',
                        'Priority encrypted cloud backup sync with redundant SLA servers',
                      ]
                    : [
                        'Tentukan ambang batas peringatan pengeluaran per kategori secara fleksibel',
                        'Pencegahan overspending lebih dini sebelum saldo habis',
                        'Manajemen utang dan piutang manual tercatat rapi',
                        'Prioritas sinkronisasi cloud backup otomatis & cepat',
                      ]
                );
              } else {
                setIsThresholdModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#0D1926] hover:bg-gray-50 border border-amber-400/60 text-[#0C2340] dark:text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            title={t.modals.threshold.title}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Threshold: {warningThresholdPercent}%</span>
            {!hasAccess('GOLD') && <PremiumCrownBadge plan="GOLD" size="sm" />}
          </button>

          <button
            type="button"
            onClick={() => setIsEditAllowanceOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-[#4D8DBA]/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-[#8AD6D1]" />
            <span>{t.budget.editOverallAllowance}</span>
          </button>
        </div>
      </div>

      {/* Total Budget Summary Hero */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-[#4D8DBA]" />
              {t.budget.totalAllocation}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1C4A6B] num-tabular mt-0.5">
              {formatCurrency(summary.totalBudgetLimit)}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500 block">{t.budget.used}</span>
              <span className="font-bold text-rose-600 num-tabular">
                {formatCurrency(summary.totalBudgetSpent)}
              </span>
            </div>
            <div className="border-l pl-4 border-gray-200">
              <span className="text-gray-500 block">{t.budget.remaining}</span>
              <span className="font-bold text-[#2E678E] num-tabular">
                {formatCurrency(summary.remainingBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>{t.budget.overallUsage}</span>
            <span className="num-tabular">{totalUsedPercent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalUsedPercent >= 100
                  ? 'bg-rose-500'
                  : totalUsedPercent >= 75
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-[#8AD6D1] to-[#4D8DBA]'
              }`}
              style={{ width: `${totalUsedPercent}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* Category Budgets Grid (6 Core Categories per Hick's Law) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expenseCategories.map((cat) => {
          const info = getCategoryBudgetInfo(cat.id);
          const isOver = info.percent >= 100;
          const isWarning = info.percent >= 75 && !isOver;

          return (
            <GlassCard
              key={cat.id}
              className="p-5 flex flex-col justify-between hover:border-gray-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="text-sm sm:text-base font-bold text-cuanly-primaryDark">
                      {(t.categories as Record<string, string>)[cat.id] || cat.fallbackName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOver ? (
                      <Badge variant="danger" size="sm">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {t.common.overbudget}
                      </Badge>
                    ) : isWarning ? (
                      <Badge variant="warning" size="sm">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {t.common.caution}
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t.common.safe}
                      </Badge>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat.id, info.limit)}
                      className="p-1 text-gray-400 hover:text-cuanly-primaryDark rounded-md hover:bg-gray-100 transition-colors"
                      title={t.budget.setBudgetBtn}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amounts & Percentage */}
                <div className="flex items-baseline justify-between text-xs sm:text-sm mb-2">
                  <span className="text-gray-500">
                    {t.budget.spent}:{' '}
                    <strong className="text-cuanly-primaryDark num-tabular font-bold">
                      {formatCurrency(info.spent)}
                    </strong>
                  </span>
                  <span className="text-gray-500">
                    {t.budget.limit}:{' '}
                    <strong className="text-cuanly-primaryDark num-tabular font-bold">
                      {formatCurrency(info.limit)}
                    </strong>
                  </span>
                </div>

                {/* Visual Progress Bar with Thresholds */}
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, info.percent)}%` }}
                  />
                </div>
              </div>

              {/* Card Footer linking to Dynamic Route */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-semibold num-tabular">
                  {info.percent}% {t.budget.used}
                </span>
                <Link
                  href={`/budget/${cat.slug}`}
                  className="font-bold text-cuanly-primary hover:text-cuanly-primaryDark flex items-center gap-0.5"
                >
                  <span>{t.budget.categoryDetail}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Edit Budget Modal */}
      {editingCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-cuanly-primaryDark">
                {t.budget.modalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCatId(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {t.budget.limitAmount} ({activeCurrency.symbol || 'Rp'})
                </label>
                <input
                  type="number"
                  step="50000"
                  value={editingLimit}
                  onChange={(e) => setEditingLimit(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-lg font-bold border border-gray-200 rounded-xl num-tabular"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCatId(null)}
                  className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-cuanly-primaryDark rounded-xl"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Overall Allowance Modal */}
      <EditAllowanceModal
        isOpen={isEditAllowanceOpen}
        onClose={() => setIsEditAllowanceOpen(false)}
      />

      {/* Gold Plan: Custom Threshold Modal */}
      <CustomThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
      />
    </div>
  );
}
