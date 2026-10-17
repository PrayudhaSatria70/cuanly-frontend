'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { GlassCard } from '@/components/common/GlassCard';
import {
  ArrowLeft,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  MoreHorizontal,
  Wallet,
  Briefcase,
  TrendingUp,
  Camera,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function TambahTransaksiPage() {
  const router = useRouter();
  const { t, formatCurrency } = useLanguage();
  const { categories, addTransaction } = useFinance();
  const { addNotification } = useNotification();

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCatId, setSelectedCatId] = useState<string>('cat_food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Available categories based on selected type
  const availableCategories = categories.filter((c) => c.type === type);

  // Icon mapper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'Car':
        return <Car className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'Film':
        return <Film className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      case 'Wallet':
        return <Wallet className="w-5 h-5" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <MoreHorizontal className="w-5 h-5" />;
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only numeric characters
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(amountStr, 10);

    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('Masukkan nominal transaksi yang valid.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === selectedCatId);
    if (!selectedCategory) {
      setErrorMsg('Pilih salah satu kategori.');
      return;
    }

    const newTx = addTransaction({
      userId: 'usr_demo_01',
      type,
      amount: numericAmount,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.fallbackName,
      categorySlug: selectedCategory.slug,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    });

    // Notify user
    addNotification({
      title: type === 'EXPENSE' ? 'Pengeluaran Dicatat' : 'Pemasukan Dicatat',
      message: `${selectedCategory.fallbackName} sebesar ${formatCurrency(numericAmount)} berhasil disimpan.`,
      type: 'SUCCESS',
      link: `/transaksi/${newTx.id}`,
    });

    router.push('/beranda');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/transaksi"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-cuanly-primaryDark px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>

        <h1 className="text-base sm:text-lg font-bold text-cuanly-primaryDark">
          {t.transactions.addTitle}
        </h1>

        <Link
          href="/transaksi/scan"
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200"
          title="Scan Struk Belanja"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Scan Struk</span>
        </Link>
      </div>

      {/* Main Card Form */}
      <GlassCard className="p-5 sm:p-7 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Segmented Type Toggle (Pengeluaran vs Pemasukan) */}
          <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/80">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setSelectedCatId('cat_food');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t.transactions.typeExpense}
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setSelectedCatId('cat_salary');
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t.transactions.typeIncome}
            </button>
          </div>

          {/* Large Nominal Input (Fitts's Law) */}
          <div className="space-y-1 text-center py-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              {t.common.amount} ({type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'})
            </label>
            <div className="relative inline-flex items-center justify-center w-full">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-400 mr-2">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr ? parseInt(amountStr, 10).toLocaleString('id-ID') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className="text-3xl sm:text-4xl font-extrabold text-cuanly-primaryDark bg-transparent border-b-2 border-gray-200 focus:border-cuanly-primaryDark focus:outline-none text-center max-w-[280px] num-tabular"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold mt-1">{errorMsg}</p>
            )}
          </div>

          {/* 6 Core Categories Grid (Hick's Law: 6 Choices) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 block">
              {t.transactions.selectCategory}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {availableCategories.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-cuanly-primaryDark bg-cuanly-primaryDark text-white shadow-sm scale-[1.02]'
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <span className="text-xs font-semibold truncate flex-1">
                      {cat.fallbackName}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Notes Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                {t.common.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                {t.common.notes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.transactions.notesPlaceholder}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
              />
            </div>
          </div>

          {/* Wide Prominent Action Button (Fitts's Law) */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="w-full py-3.5 bg-cuanly-primaryDark hover:bg-black text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>
                {type === 'EXPENSE'
                  ? t.transactions.saveButton
                  : t.transactions.saveIncomeButton}
              </span>
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
