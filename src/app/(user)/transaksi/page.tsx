'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { GlassCard } from '@/components/common/GlassCard';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  Search,
  Plus,
  Camera,
  Filter,
  Trash2,
  ChevronRight,
  Receipt as ReceiptIcon,
  Download,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';

export default function TransaksiPage() {
  const { t, locale, formatCurrency, formatDate } = useLanguage();
  const { transactions, categories, deleteTransaction } = useFinance();
  const { hasAccess, openUpgradeModal } = useSubscription();

  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  // Handle Export CSV (Silver Plan Feature)
  const handleExportCsv = () => {
    if (!hasAccess('SILVER')) {
      openUpgradeModal(
        locale === 'en' ? 'Export Financial Reports to CSV / Excel' : 'Ekspor Laporan ke CSV / Excel',
        'SILVER',
        locale === 'en'
          ? 'Export entire financial mutation books to CSV and Excel files, exclusive for Silver Plan subscribers and above.'
          : 'Fitur ekspor seluruh pembukuan keuangan ke file CSV dan Excel eksklusif untuk pelanggan Silver Plan ke atas.',
        locale === 'en'
          ? [
              'Download full financial book in CSV/Excel anytime',
              'Unlimited Wallets without account limits',
              'Custom date-range mutation and chart filters',
              'Ad-free uninterrupted financial workflow',
            ]
          : [
              'Unduh pembukuan lengkap dalam format CSV/Excel kapan saja',
              'Unlimited Wallets tanpa batasan dompet',
              'Akses filter grafik kustom berdasarkan rentang tanggal',
              'Bebas iklan tanpa gangguan',
            ]
      );
      return;
    }

    // Sanitize CSV cells against CSV Formula Injection (CWE-1236)
    const sanitizeCsvCell = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      const safeStr = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
      return `"${safeStr.replace(/"/g, '""')}"`;
    };

    // Generate CSV content
    const headers = [locale === 'en' ? 'ID,Date,Type,Category,Amount,Note,Merchant' : 'ID,Tanggal,Tipe,Kategori,Nominal,Catatan,Merchant'];
    const rows = filtered.map((tx) =>
      [
        sanitizeCsvCell(tx.id),
        sanitizeCsvCell(tx.date),
        sanitizeCsvCell(tx.type),
        sanitizeCsvCell(tx.categoryName),
        tx.amount,
        sanitizeCsvCell(tx.notes || ''),
        sanitizeCsvCell(tx.receipt?.merchant || ''),
      ].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cuanly-transaksi-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Custom Date Range toggle (Silver Plan Feature)
  const handleToggleCustomDate = () => {
    if (!hasAccess('SILVER')) {
      openUpgradeModal(
        locale === 'en' ? 'Custom Date Range Chart Filter' : 'Akses Filter Grafik Kustom (by Rentang Tanggal)',
        'SILVER',
        locale === 'en'
          ? 'Filter transaction mutation history and charts by custom date ranges, exclusive for Silver Plan subscribers and above.'
          : 'Filter riwayat mutasi dan grafik berdasarkan rentang tanggal kustom eksklusif untuk pelanggan Silver Plan ke atas.',
        locale === 'en'
          ? [
              'Set start and end dates with precision',
              'Analyze specific period spending without monthly calendar boundaries',
              'Export transaction mutation records to CSV/Excel',
              'Unlimited Wallets without account limits',
            ]
          : [
              'Pilih tanggal awal dan akhir transaksi secara presisi',
              'Analisis pengeluaran periode tertentu tanpa batasan bulan kalender',
              'Ekspor laporan mutasi ke format CSV/Excel',
              'Unlimited Wallets tanpa batasan dompet',
            ]
      );
      return;
    }
    setIsCustomDateOpen(!isCustomDateOpen);
  };

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Type tab
    if (activeTab === 'EXPENSE' && tx.type !== 'EXPENSE') return false;
    if (activeTab === 'INCOME' && tx.type !== 'INCOME') return false;

    // Category
    if (selectedCategory !== 'ALL' && tx.categoryId !== selectedCategory && tx.categorySlug !== selectedCategory) {
      return false;
    }

    // Custom date range filter (Silver)
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;

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

        <div className="flex items-center flex-wrap gap-2">
          {/* Canva-style Button: Ekspor CSV / Excel with Crown 👑 */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#0D1926] hover:bg-gray-50 dark:hover:bg-[#112233] text-gray-700 dark:text-slate-200 border border-[#AEC4D4]/60 dark:border-[#4D8DBA]/35 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer group"
            title={t.nav.exportCsv}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#4D8DBA] dark:text-[#8AD6D1]" />
            <span>{t.nav.exportCsv}</span>
            {!hasAccess('SILVER') && <PremiumCrownBadge plan="SILVER" size="sm" />}
          </button>

          <Link
            href="/transaksi/scan"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#0D1926] hover:bg-gray-50 text-cuanly-primaryDark border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all"
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
              className="w-full sm:w-48 py-2 px-3 text-xs sm:text-sm bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
            >
              <option value="ALL">{t.common.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {(t.categories as Record<string, string>)[c.id] || c.fallbackName}
                </option>
              ))}
            </select>

            {/* Canva-style Button: Filter Rentang Tanggal with Crown 👑 */}
            <button
              type="button"
              onClick={handleToggleCustomDate}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                startDate || endDate || isCustomDateOpen
                  ? 'bg-[#4D8DBA]/15 border-[#4D8DBA] text-[#1C4A6B] dark:text-[#8AD6D1]'
                  : 'bg-white dark:bg-[#071018] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50'
              }`}
              title={t.nav.dateRange}
            >
              <Calendar className="w-4 h-4 text-[#4D8DBA] dark:text-[#8AD6D1]" />
              <span className="hidden sm:inline">{t.nav.dateRange}</span>
              <span className="sm:hidden">{t.common.date}</span>
              {!hasAccess('SILVER') && <PremiumCrownBadge plan="SILVER" size="sm" />}
            </button>
          </div>
        </div>

        {/* Collapsible Date Range Inputs (when Silver+ unlocked) */}
        {isCustomDateOpen && hasAccess('SILVER') && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#EDF5FA] to-white dark:from-[#0B1520] dark:to-[#071018] border border-[#8AD6D1]/50 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="font-bold text-[#1C4A6B] dark:text-[#8AD6D1] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t.nav.period}
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071018]"
                />
                <span className="text-gray-400">{t.nav.to}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071018]"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{locale === 'en' ? 'Reset Dates' : 'Reset Tanggal'}</span>
              </button>
            )}
          </div>
        )}
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
                className="py-3.5 px-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 dark:hover:bg-[#112233]/60 rounded-xl transition-all duration-200 hover:translate-x-1 group"
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
                        {(t.categories as Record<string, string>)[tx.categoryId] || tx.categoryName}
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
