'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Currency } from '@/types';
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
  ChevronDown,
  Plus,
  Coins,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function TambahTransaksiPage() {
  const router = useRouter();
  const { t, formatCurrency, currencies, activeCurrency, addCustomCurrency, setActiveCurrency } = useLanguage();
  const { categories, addTransaction } = useFinance();
  const { addNotification } = useNotification();

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCatId, setSelectedCatId] = useState<string>('cat_food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Currency selection & custom currency addition
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(activeCurrency);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
  const [newCurrCode, setNewCurrCode] = useState('');
  const [newCurrSymbol, setNewCurrSymbol] = useState('');
  const [newCurrName, setNewCurrName] = useState('');
  const [newCurrDecimals, setNewCurrDecimals] = useState<number>(2);
  const [addCurrError, setAddCurrError] = useState('');

  // Keep selectedCurrency synced with activeCurrency
  useEffect(() => {
    setSelectedCurrency(activeCurrency);
  }, [activeCurrency]);

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

  const handleSelectCurrency = (curr: Currency) => {
    setSelectedCurrency(curr);
    setActiveCurrency(curr.code);
    setIsCurrencyDropdownOpen(false);
  };

  const handleSaveCustomCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrCode.trim() || !newCurrSymbol.trim()) {
      setAddCurrError('Currency Code and Symbol are required.');
      return;
    }

    const created = addCustomCurrency({
      code: newCurrCode.trim().toUpperCase(),
      symbol: newCurrSymbol.trim(),
      name: newCurrName.trim() || newCurrCode.trim().toUpperCase(),
      decimals: Number(newCurrDecimals),
    });

    setSelectedCurrency(created);
    setNewCurrCode('');
    setNewCurrSymbol('');
    setNewCurrName('');
    setNewCurrDecimals(2);
    setAddCurrError('');
    setIsAddCurrencyModalOpen(false);
    setIsCurrencyDropdownOpen(false);

    addNotification({
      title: t.currency.title,
      message: `${t.currency.successMsg} (${created.code} - ${created.symbol})`,
      type: 'SUCCESS',
    });
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
      currency: selectedCurrency.code,
      currencySymbol: selectedCurrency.symbol,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.fallbackName,
      categorySlug: selectedCategory.slug,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    });

    // Notify user
    addNotification({
      title: type === 'EXPENSE' ? 'Pengeluaran Dicatat' : 'Pemasukan Dicatat',
      message: `${selectedCategory.fallbackName} sebesar ${formatCurrency(numericAmount, selectedCurrency.symbol)} berhasil disimpan.`,
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
          <span className="hidden sm:inline">{t.receipt.scannerTitle}</span>
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

          {/* Currency Selector & Nominal Input */}
          <div className="space-y-2 text-center py-2">
            <div className="flex items-center justify-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t.common.amount} ({type === 'EXPENSE' ? t.transactions.typeExpense : t.transactions.typeIncome})
              </label>

              {/* Currency Dropdown Selector */}
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 text-cuanly-primaryDark border border-gray-200/80 transition-all shadow-2xs"
                  title={t.currency.selectCurrency}
                >
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedCurrency.code} ({selectedCurrency.symbol})</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {isCurrencyDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsCurrencyDropdownOpen(false)}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 mt-1.5 w-60 rounded-2xl bg-white dark:bg-[#0B1520] shadow-xl border border-gray-100 dark:border-[#4D8DBA]/30 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                        {t.currency.selectCurrency}
                      </div>

                      <div className="max-h-52 overflow-y-auto py-1">
                        {currencies.map((curr) => {
                          const isSelected = selectedCurrency.code === curr.code;
                          return (
                            <button
                              key={curr.code}
                              type="button"
                              onClick={() => handleSelectCurrency(curr)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#112233]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold w-8 text-center text-gray-900 dark:text-white bg-gray-100 dark:bg-[#172D42] rounded px-1 py-0.5">
                                  {curr.symbol}
                                </span>
                                <div>
                                  <span className="block">{curr.code}</span>
                                  <span className="text-[10px] text-gray-400 dark:text-slate-400 block truncate max-w-[120px]">
                                    {curr.name}
                                  </span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Add Custom Currency CTA Button */}
                      <div className="p-1.5 border-t border-gray-100 dark:border-[#4D8DBA]/20">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCurrencyDropdownOpen(false);
                            setIsAddCurrencyModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.currency.addCustom}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Big Amount Input */}
            <div className="relative inline-flex items-center justify-center w-full pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-400 mr-2">
                {selectedCurrency.symbol}
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
              className="w-full py-3.5 bg-[#4D8DBA] hover:bg-[#2E678E] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#4D8DBA]/25 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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

      {/* Add Custom Currency Modal */}
      {isAddCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white dark:bg-[#0B1520] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#4D8DBA]/30 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="px-6 py-5 bg-gradient-to-r from-[#1C4A6B] to-[#4D8DBA] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                  <Coins className="w-5 h-5 text-[#8AD6D1]" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{t.currency.addModalTitle}</h3>
                  <p className="text-xs text-gray-200">{t.currency.addModalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCurrencyModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomCurrency} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-slate-300 block mb-1">
                  {t.currency.codeLabel}
                </label>
                <input
                  type="text"
                  value={newCurrCode}
                  onChange={(e) => setNewCurrCode(e.target.value.toUpperCase())}
                  placeholder={t.currency.codePlaceholder}
                  maxLength={5}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:bg-white dark:focus:bg-[#0B1520] focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 uppercase font-mono font-bold text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-slate-300 block mb-1">
                  {t.currency.symbolLabel}
                </label>
                <input
                  type="text"
                  value={newCurrSymbol}
                  onChange={(e) => setNewCurrSymbol(e.target.value)}
                  placeholder={t.currency.symbolPlaceholder}
                  maxLength={6}
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:bg-white dark:focus:bg-[#0B1520] focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 font-bold text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-slate-300 block mb-1">
                  {t.currency.nameLabel}
                </label>
                <input
                  type="text"
                  value={newCurrName}
                  onChange={(e) => setNewCurrName(e.target.value)}
                  placeholder={t.currency.namePlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:bg-white dark:focus:bg-[#0B1520] focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-slate-300 block mb-1">
                  {t.currency.decimalsLabel}
                </label>
                <select
                  value={newCurrDecimals}
                  onChange={(e) => setNewCurrDecimals(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:bg-white dark:focus:bg-[#0B1520] focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 font-semibold text-gray-800 dark:text-slate-200"
                >
                  <option value={0}>0 Decimals (e.g. IDR, JPY, KRW)</option>
                  <option value={2}>2 Decimals (e.g. USD, EUR, GBP, SGD, MYR)</option>
                  <option value={3}>3 Decimals (e.g. BHD, KWD, OMR)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">{t.currency.decimalsDesc}</p>
              </div>

              {addCurrError && (
                <p className="text-xs text-rose-600 font-semibold">{addCurrError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCurrencyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4D8DBA] hover:bg-[#2E678E] text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t.currency.saveBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
