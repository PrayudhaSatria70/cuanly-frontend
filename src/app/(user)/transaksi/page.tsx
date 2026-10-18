'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { GlassCard } from '@/components/common/GlassCard';
import {
  Search,
  Plus,
  Camera,
  Filter,
  Trash2,
  ChevronRight,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function TransaksiPage() {
  const { t, locale, formatCurrency, formatDate } = useLanguage();
  const { transactions, categories, deleteTransaction } = useFinance();

  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Type tab
    if (activeTab === 'EXPENSE' && tx.type !== 'EXPENSE') return false;
    if (activeTab === 'INCOME' && tx.type !== 'INCOME') return false;

    // Category
    if (selectedCategory !== 'ALL' && tx.categoryId !== selectedCategory && tx.categorySlug !== selectedCategory) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNote = tx.notes?.toLowerCase().includes(q);
      const matchCategory = tx.categoryName.toLowerCase().includes(q);
      const matchMerchant = tx.receipt?.merchant.toLowerCase().includes(q);
      const matchAmount = tx.amount.toString().includes(q);
      if (!matchNote && !matchCategory && !matchMerchant && !matchAmount) return false;
    }

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
            {t.transactions.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {t.transactions.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/transaksi/scan"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-cuanly-primaryDark border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>{t.receipt.scannerTitle}</span>
          </Link>
          <Link
            href="/transaksi/tambah"
            className="flex items-center gap-1.5 px-4 py-2 bg-cuanly-primaryDark hover:bg-black text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t.common.add}</span>
          </Link>
        </div>
      </div>

      {/* Filter Card: Tabs & Search */}
      <GlassCard className="p-4 space-y-4">
        {/* Type Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-cuanly-primaryDark shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.common.all} ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('EXPENSE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'EXPENSE'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-gray-500 hover:text-rose-600'
              }`}
            >
              {t.common.expense}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('INCOME')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'INCOME'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              {t.common.income}
            </button>
          </div>

          <div className="text-xs text-gray-500">
            {t.common.showingData} <span className="font-bold text-cuanly-primaryDark">{filtered.length}</span> {t.common.items}
          </div>
        </div>

        {/* Search Input & Category Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.common.search}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-48 py-2 px-3 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
            >
              <option value="ALL">{t.common.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fallbackName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Transactions List */}
      <GlassCard className="p-2 sm:p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <ReceiptIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-700">
              {t.transactions.emptyTitle}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {t.transactions.emptySubtitle}
            </p>
            <div className="pt-2">
              <Link
                href="/transaksi/tambah"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-cuanly-primaryDark text-white text-xs font-semibold rounded-xl"
              >
                <Plus className="w-4 h-4" />
                <span>{t.transactions.addTitle}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 px-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 rounded-xl transition-all group"
              >
                <Link
                  href={`/transaksi/${tx.id}`}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${
                      tx.type === 'INCOME'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-cuanly-primaryDark border border-gray-200'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-cuanly-primaryDark group-hover:text-emerald-700 transition-colors">
                        {tx.categoryName}
                      </h4>
                      {tx.receipt && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5" />
                          <span>{tx.receipt.merchant}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {tx.notes || (locale === 'en' ? 'No notes' : 'Tanpa catatan')}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(tx.date)}
                    </span>
                  </div>
                </Link>

                {/* Amount and delete button */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold num-tabular ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-cuanly-primaryDark'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </div>
                    <Link
                      href={`/transaksi/${tx.id}`}
                      className="text-[11px] text-gray-400 hover:text-cuanly-primary font-medium flex items-center justify-end gap-0.5 mt-0.5"
                    >
                      <span>{locale === 'en' ? 'Details' : 'Detail'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t.transactions.deleteConfirm)) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="p-1.5 text-gray-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
