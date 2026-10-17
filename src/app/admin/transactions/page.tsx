'use client';

import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Activity, Search, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminTransactionsPage() {
  const { transactions } = useFinance();
  const { t, formatCurrency, formatDate } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.categoryName.toLowerCase().includes(q) ||
      tx.notes?.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q)
    );
  });

  const totalVolume = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
          {t.admin.transactionsMonitoring}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Audit log dan pemantauan arus mutasi keuangan platform Cuanly secara real-time
        </p>
      </div>

      {/* Aggregate Volume Card */}
      <GlassCard className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Total Perputaran Transaksi Tercatat
          </span>
          <div className="text-2xl font-extrabold text-cuanly-primaryDark num-tabular mt-0.5">
            {formatCurrency(totalVolume)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Audit Normal (100% Valid)
          </span>
        </div>
      </GlassCard>

      {/* Search Input */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan ID transaksi, kategori, atau catatan..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </GlassCard>

      {/* Global Transaction Table / List */}
      <GlassCard className="p-2 sm:p-4">
        <div className="divide-y divide-gray-100">
          {filtered.map((tx) => (
            <div
              key={tx.id}
              className="py-3 px-3 flex items-center justify-between gap-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    tx.type === 'INCOME'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {tx.type === 'INCOME' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-cuanly-primaryDark truncate">
                      {tx.categoryName}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      [{tx.id}]
                    </span>
                    {tx.receipt && (
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded">
                        Struk: {tx.receipt.merchant}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {tx.notes || 'Tanpa catatan'}
                  </p>
                  <span className="text-[10px] text-gray-400">
                    Waktu: {formatDate(tx.date)}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div
                  className={`text-xs sm:text-sm font-bold num-tabular ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-cuanly-primaryDark'
                  }`}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  Sukses
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
