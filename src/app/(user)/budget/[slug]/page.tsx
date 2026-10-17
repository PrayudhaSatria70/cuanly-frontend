'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import {
  ArrowLeft,
  PieChart,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Receipt,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function CategoryBudgetDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { t, formatCurrency, formatDate } = useLanguage();
  const { categories, transactions, getCategoryBudgetInfo, updateBudget } = useFinance();

  const currentCat = categories.find((c) => c.slug === slug);
  const info = currentCat ? getCategoryBudgetInfo(currentCat.id) : null;

  const [newLimit, setNewLimit] = useState(info?.limit || 1000000);
  const [isSaved, setIsSaved] = useState(false);

  if (!currentCat || !info) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-700">Kategori Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500">Slug: {slug}</p>
        <Link
          href="/budget"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cuanly-primaryDark text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Budget</span>
        </Link>
      </div>
    );
  }

  // Filter transactions for this category
  const categoryTransactions = transactions.filter(
    (tx) => tx.categoryId === currentCat.id || tx.categorySlug === currentCat.slug
  );

  const isOver = info.percent >= 100;
  const isWarning = info.percent >= 75 && !isOver;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLimit > 0) {
      updateBudget(currentCat.id, newLimit);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/budget"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-cuanly-primaryDark px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>

        <h1 className="text-base sm:text-lg font-bold text-cuanly-primaryDark flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentCat.color }}
          />
          {currentCat.fallbackName}
        </h1>

        <div className="w-12"></div>
      </div>

      {/* Main Stats Card */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block">
              Penggunaan Bulan Ini
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-cuanly-primaryDark num-tabular mt-0.5">
              {formatCurrency(info.spent)}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              dari batas {formatCurrency(info.limit)} ({info.percent}%)
            </p>
          </div>

          <div>
            {isOver ? (
              <Badge variant="danger">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Overbudget ({info.percent}%)
              </Badge>
            ) : isWarning ? (
              <Badge variant="warning">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Mendekati Batas ({info.percent}%)
              </Badge>
            ) : (
              <Badge variant="success">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Aman ({info.percent}%)
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, info.percent)}%` }}
          />
        </div>

        {/* Update Limit Form */}
        <form onSubmit={handleUpdate} className="pt-4 border-t border-gray-100 space-y-3">
          <label className="text-xs font-bold text-cuanly-primaryDark block">
            Sesuaikan Batas Budget ({currentCat.fallbackName})
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                Rp
              </span>
              <input
                type="number"
                step="50000"
                value={newLimit}
                onChange={(e) => setNewLimit(parseInt(e.target.value, 10) || 0)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-bold border border-gray-200 rounded-xl num-tabular"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-cuanly-primaryDark hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
            >
              Simpan Limit
            </button>
          </div>
          {isSaved && (
            <p className="text-xs text-emerald-600 font-bold">
              ✓ Batas budget berhasil diperbarui!
            </p>
          )}
        </form>
      </GlassCard>

      {/* Transactions in this category */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <h3 className="text-sm sm:text-base font-bold text-cuanly-primaryDark flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-cuanly-primary" />
            <span>Riwayat Pengeluaran ({currentCat.fallbackName})</span>
          </h3>
          <span className="text-xs text-gray-400">
            {categoryTransactions.length} transaksi
          </span>
        </div>

        {categoryTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 space-y-2">
            <p>Belum ada transaksi di kategori ini bulan ini.</p>
            <Link
              href="/transaksi/tambah"
              className="inline-flex items-center gap-1 text-xs font-bold text-cuanly-primaryDark underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pengeluaran</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categoryTransactions.map((tx) => (
              <Link
                key={tx.id}
                href={`/transaksi/${tx.id}`}
                className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-xl transition-colors"
              >
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-cuanly-primaryDark">
                    {tx.notes || tx.categoryName}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {formatDate(tx.date)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-rose-600 num-tabular">
                  -{formatCurrency(tx.amount)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
