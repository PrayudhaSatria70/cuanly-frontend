'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { GlassCard } from '@/components/common/GlassCard';
import {
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  Trash2,
  Edit3,
  Camera,
  Store,
  CheckCircle2,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function TransaksiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const txId = params.id as string;

  const { t, locale, formatCurrency, formatDate } = useLanguage();
  const { transactions, deleteTransaction, updateTransaction } = useFinance();

  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editAmount, setEditAmount] = useState(0);

  const tx = transactions.find((item) => item.id === txId);

  if (!tx) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-700">
          {locale === 'en' ? 'Transaction Not Found' : 'Transaksi Tidak Ditemukan'}
        </h2>
        <p className="text-xs text-gray-500">ID: {txId}</p>
        <Link
          href="/transaksi"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cuanly-primaryDark text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditNotes(tx.notes || '');
    setEditAmount(tx.amount);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTransaction(tx.id, {
      notes: editNotes,
      amount: editAmount,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(t.transactions.deleteConfirm)) {
      deleteTransaction(tx.id);
      router.push('/transaksi');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/transaksi"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-cuanly-primaryDark px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>

        <h1 className="text-base sm:text-lg font-bold text-cuanly-primaryDark">
          {t.transactions.detailTitle}
        </h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartEdit}
            className="p-2 text-gray-500 hover:text-cuanly-primaryDark rounded-lg hover:bg-gray-100 transition-colors"
            title={t.common.edit}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
            title={t.common.delete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Detail Card */}
      <GlassCard className="p-6 space-y-6">
        {/* Nominal Hero */}
        <div className="text-center py-4 border-b border-gray-100 space-y-1">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block ${
              tx.type === 'INCOME'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {tx.type === 'INCOME' ? t.common.income : t.common.expense}
          </span>
          <div
            className={`text-3xl sm:text-4xl font-extrabold num-tabular tracking-tight ${
              tx.type === 'INCOME' ? 'text-emerald-600' : 'text-cuanly-primaryDark'
            }`}
          >
            {tx.type === 'INCOME' ? '+' : '-'}
            {formatCurrency(tx.amount)}
          </div>
          <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
        </div>

        {/* Info Grid */}
        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-gray-400" />
              {t.common.category}
            </span>
            <span className="font-bold text-cuanly-primaryDark">
              {(t.categories as Record<string, string>)[tx.categoryId] || tx.categoryName}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              {t.common.date}
            </span>
            <span className="font-semibold text-gray-800">{formatDate(tx.date)}</span>
          </div>

          <div className="flex items-start justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5 mt-0.5">
              <FileText className="w-4 h-4 text-gray-400" />
              {t.common.notes}
            </span>
            <span className="font-medium text-gray-800 text-right max-w-xs">
              {tx.notes || (locale === 'en' ? 'No additional notes' : 'Tanpa catatan tambahan')}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100 text-[11px] text-gray-400">
            <span>{t.transactions.txId}</span>
            <span className="font-mono">{tx.id}</span>
          </div>
        </div>

        {/* Attached Receipt Section if present */}
        {tx.receipt ? (
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cuanly-primaryDark flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                {t.transactions.attachedReceipt}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                OCR Verified ({tx.receipt.confidenceScore}%)
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-3 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 h-40 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tx.receipt.receiptImageUrl}
                  alt={tx.receipt.merchant}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1 text-xs font-bold text-cuanly-primaryDark">
                  <Store className="w-4 h-4 text-gray-500" />
                  <span>{tx.receipt.merchant}</span>
                </div>

                {tx.receipt.lineItems && tx.receipt.lineItems.length > 0 && (
                  <div className="divide-y divide-gray-200 text-xs">
                    {tx.receipt.lineItems.map((item) => (
                      <div key={item.id} className="py-1 flex items-center justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-semibold text-gray-800 num-tabular">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-xl text-center text-xs text-gray-400">
            {t.transactions.noReceipt}
          </div>
        )}
      </GlassCard>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-cuanly-primaryDark">
                {t.transactions.editTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {t.common.amount} ({tx.currencySymbol || 'Rp'})
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 text-base font-bold border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {t.common.notes}
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
    </div>
  );
}
