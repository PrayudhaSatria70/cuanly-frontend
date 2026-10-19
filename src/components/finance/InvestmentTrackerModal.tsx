'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { investmentsApi } from '@/services/api';
import { InvestmentAsset, InvestmentCategory, InvestmentSummary } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  Trash2,
  X,
  Coins,
  Building,
  Landmark,
  CircleDollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_META: Record<
  InvestmentCategory,
  { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string }
> = {
  REKSADANA: { icon: Landmark, color: '#4D8DBA' },
  SAHAM: { icon: TrendingUp, color: '#10B981' },
  EMAS: { icon: Coins, color: '#F59E0B' },
  CRYPTO: { icon: CircleDollarSign, color: '#8B5CF6' },
  PROPERTI: { icon: Building, color: '#EC4899' },
};

export const InvestmentTrackerModal: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency, t, locale } = useLanguage();
  const { isInvestmentModalOpen, closeInvestmentModal } = useSubscription();

  const getCategoryLabel = (cat: InvestmentCategory) => {
    switch (cat) {
      case 'REKSADANA':
        return t.modals.investments.categories.reksadana;
      case 'SAHAM':
        return t.modals.investments.categories.saham;
      case 'EMAS':
        return t.modals.investments.categories.emas;
      case 'CRYPTO':
        return t.modals.investments.categories.crypto;
      case 'PROPERTI':
        return t.modals.investments.categories.properti;
      default:
        return cat;
    }
  };

  const [items, setItems] = useState<InvestmentAsset[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary>({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    assetCount: 0,
    categoryBreakdown: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InvestmentCategory>('REKSADANA');
  const [quantity, setQuantity] = useState('1');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [notes, setNotes] = useState('');

  const userId = user?.id;

  const calculateSummary = (assetList: InvestmentAsset[]): InvestmentSummary => {
    const totalInvested = assetList.reduce((acc, cur) => acc + cur.totalBuy, 0);
    const totalCurrentValue = assetList.reduce((acc, cur) => acc + cur.totalCurrent, 0);
    const totalGainLoss = totalCurrentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const categoryBreakdown: Record<string, { value: number; count: number }> = {};
    assetList.forEach((item) => {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { value: 0, count: 0 };
      }
      categoryBreakdown[item.category].value += item.totalCurrent;
      categoryBreakdown[item.category].count += 1;
    });

    return {
      totalInvested,
      totalCurrentValue,
      totalGainLoss,
      totalGainLossPercent: Number(totalGainLossPercent.toFixed(2)),
      assetCount: assetList.length,
      categoryBreakdown,
    };
  };

  useEffect(() => {
    if (!isInvestmentModalOpen) return;

    setIsLoading(true);
    investmentsApi
      .getAll()
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          setItems(res.items);
          setSummary(res.summary);
        } else {
          // Check local storage for user scoped investments
          try {
            const stored = localStorage.getItem(`cuanly_investments_${userId}`);
            if (stored) {
              const parsed = JSON.parse(stored);
              setItems(parsed);
              setSummary(calculateSummary(parsed));
            } else if (userId === 'usr_demo_1') {
              const demoAssets: InvestmentAsset[] = [
                {
                  id: 'inv_1',
                  userId: 'usr_demo_1',
                  name: 'Sucorinvest Sharia Money Market Fund',
                  category: 'REKSADANA',
                  quantity: 12500,
                  buyPrice: 1200,
                  currentPrice: 1275,
                  totalBuy: 15000000,
                  totalCurrent: 15937500,
                  gainLossAmount: 937500,
                  gainLossPercent: 6.25,
                  notes: 'Alokasi dana darurat pasar uang',
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 'inv_2',
                  userId: 'usr_demo_1',
                  name: 'BBCA (Bank Central Asia Tbk)',
                  category: 'SAHAM',
                  quantity: 2000,
                  buyPrice: 9100,
                  currentPrice: 10450,
                  totalBuy: 18200000,
                  totalCurrent: 20900000,
                  gainLossAmount: 2700000,
                  gainLossPercent: 14.84,
                  notes: 'Dividen berkala & pertumbuhan modal',
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 'inv_3',
                  userId: 'usr_demo_1',
                  name: 'Emas Logam Mulia Antam (10 Gram)',
                  category: 'EMAS',
                  quantity: 1,
                  buyPrice: 12500000,
                  currentPrice: 14200000,
                  totalBuy: 12500000,
                  totalCurrent: 14200000,
                  gainLossAmount: 1700000,
                  gainLossPercent: 13.6,
                  notes: 'Lindung nilai inflasi jangka panjang',
                  createdAt: new Date().toISOString(),
                },
              ];
              setItems(demoAssets);
              setSummary(calculateSummary(demoAssets));
            } else {
              setItems([]);
              setSummary(calculateSummary([]));
            }
          } catch {
            setItems([]);
            setSummary(calculateSummary([]));
          }
        }
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem(`cuanly_investments_${userId}`);
          const parsed = stored ? JSON.parse(stored) : [];
          setItems(parsed);
          setSummary(calculateSummary(parsed));
        } catch {
          setItems([]);
          setSummary(calculateSummary([]));
        }
      })
      .finally(() => setIsLoading(false));
  }, [isInvestmentModalOpen, userId]);

  const saveAssets = (updated: InvestmentAsset[]) => {
    setItems(updated);
    setSummary(calculateSummary(updated));
    if (userId) {
      localStorage.setItem(`cuanly_investments_${userId}`, JSON.stringify(updated));
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 1;
    const bPrice = Math.round(parseFloat(buyPrice) || 0);
    const cPrice = Math.round(parseFloat(currentPrice) || 0);

    if (!name.trim() || bPrice <= 0 || cPrice <= 0) {
      setFeedback({
        message:
          locale === 'id'
            ? 'Nama instrumen, harga beli, dan harga saat ini harus diisi valid.'
            : 'Instrument name, buy price, and current price must be valid.',
        type: 'error',
      });
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      quantity: qty,
      buyPrice: bPrice,
      currentPrice: cPrice,
      notes: notes.trim() || undefined,
    };

    try {
      const res = await investmentsApi.create(payload);
      if (res && res.asset) {
        saveAssets([res.asset, ...items]);
      } else {
        const totalBuy = bPrice * qty;
        const totalCurrent = cPrice * qty;
        const gainLossAmount = totalCurrent - totalBuy;
        const gainLossPercent = totalBuy > 0 ? (gainLossAmount / totalBuy) * 100 : 0;
        const newAsset: InvestmentAsset = {
          id: `asset_${Date.now()}`,
          userId: userId || 'usr_guest',
          ...payload,
          totalBuy,
          totalCurrent,
          gainLossAmount,
          gainLossPercent: Number(gainLossPercent.toFixed(2)),
          createdAt: new Date().toISOString(),
        };
        saveAssets([newAsset, ...items]);
      }
      setFeedback({
        message:
          locale === 'id'
            ? `Berhasil menambahkan aset ${name}!`
            : `Successfully added asset ${name}!`,
        type: 'success',
      });
      setIsAdding(false);
      setName('');
      setBuyPrice('');
      setCurrentPrice('');
      setQuantity('1');
      setNotes('');
    } catch {
      const totalBuy = bPrice * qty;
      const totalCurrent = cPrice * qty;
      const gainLossAmount = totalCurrent - totalBuy;
      const gainLossPercent = totalBuy > 0 ? (gainLossAmount / totalBuy) * 100 : 0;
      const newAsset: InvestmentAsset = {
        id: `asset_${Date.now()}`,
        userId: userId || 'usr_guest',
        ...payload,
        totalBuy,
        totalCurrent,
        gainLossAmount,
        gainLossPercent: Number(gainLossPercent.toFixed(2)),
        createdAt: new Date().toISOString(),
      };
      saveAssets([newAsset, ...items]);
      setFeedback({
        message:
          locale === 'id'
            ? `Berhasil menambahkan aset ${name}!`
            : `Successfully added asset ${name}!`,
        type: 'success',
      });
      setIsAdding(false);
      setName('');
      setBuyPrice('');
      setCurrentPrice('');
      setQuantity('1');
      setNotes('');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await investmentsApi.delete(id);
    } catch {
      // fallback
    }
    const updated = items.filter((a) => a.id !== id);
    saveAssets(updated);
    setFeedback({ message: t.modals.investments.deleteSuccess, type: 'success' });
  };

  if (!isInvestmentModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0D1926] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#4D8DBA]/20 bg-gradient-to-r from-emerald-500/10 via-[#4D8DBA]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0C2340] dark:text-white">
                  {t.modals.investments.title}
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {t.modals.investments.goldB2bBadge}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {t.modals.investments.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeInvestmentModal}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Portfolio Net Worth Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0C2340] to-[#1C4A6B] text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-48 h-48 bg-[#8AD6D1]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-[#8AD6D1]">
                  {t.modals.investments.totalNetWorth}
                </span>
                <div className="text-3xl font-extrabold tracking-tight mt-1">
                  {formatCurrency(summary.totalCurrentValue)}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                    summary.totalGainLoss >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {summary.totalGainLoss >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  )}
                  <span>
                    {summary.totalGainLoss >= 0 ? '+' : ''}
                    {formatCurrency(summary.totalGainLoss)} ({summary.totalGainLoss >= 0 ? '+' : ''}
                    {summary.totalGainLossPercent}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs relative z-10">
              <div>
                <span className="text-slate-300">{t.modals.investments.totalInvested}:</span>
                <p className="font-bold text-white mt-0.5">{formatCurrency(summary.totalInvested)}</p>
              </div>
              <div>
                <span className="text-slate-300">{locale === 'id' ? 'Jumlah Aset:' : 'Total Assets:'}</span>
                <p className="font-bold text-white mt-0.5">
                  {summary.assetCount} {locale === 'id' ? 'Instrumen' : 'Assets'}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-300">{locale === 'id' ? 'Status Kinerja:' : 'Performance:'}</span>
                <p className="font-bold text-[#8AD6D1] mt-0.5">
                  {summary.totalGainLoss >= 0
                    ? locale === 'id'
                      ? 'Surplus Bertumbuh 🚀'
                      : 'Growing Surplus 🚀'
                    : locale === 'id'
                    ? 'Evaluasi Alokasi ⚠️'
                    : 'Review Allocation ⚠️'}
                </p>
              </div>
            </div>
          </div>

          {/* Asset Allocation Breakdown */}
          {summary.totalCurrentValue > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                {locale === 'id' ? 'Alokasi Portofolio Berdasarkan Kategori' : 'Portfolio Allocation by Category'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(Object.keys(CATEGORY_META) as InvestmentCategory[]).map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const catData = summary.categoryBreakdown[cat] || { value: 0, count: 0 };
                  const percent =
                    summary.totalCurrentValue > 0
                      ? Math.round((catData.value / summary.totalCurrentValue) * 100)
                      : 0;

                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300">
                        <meta.icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        <span className="truncate">{getCategoryLabel(cat)}</span>
                      </div>
                      <div className="text-sm font-extrabold text-[#0C2340] dark:text-white">
                        {percent}%
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate">
                        {formatCurrency(catData.value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Bar */}
          {!isAdding ? (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                {locale === 'id'
                  ? `Daftar Instrumen Portofolio (${items.length})`
                  : `Portfolio Asset List (${items.length})`}
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4D8DBA] hover:bg-[#2E678E] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.modals.investments.addAssetBtn}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddAsset} className="p-4 rounded-xl border border-[#4D8DBA]/30 bg-gray-50 dark:bg-slate-900/60 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0C2340] dark:text-white">
                  {t.modals.investments.formTitle}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                >
                  {t.modals.investments.cancelBtn}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {t.modals.investments.assetNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.modals.investments.assetNamePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {t.modals.investments.categoryLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InvestmentCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  >
                    {(Object.keys(CATEGORY_META) as InvestmentCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {getCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {t.modals.investments.quantityLabel}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.0001"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {t.modals.investments.buyPriceLabel}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {t.modals.investments.currentPriceLabel}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="12500"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {t.modals.investments.notesLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={t.modals.investments.notesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t.modals.investments.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#4D8DBA] to-[#2E678E] hover:from-[#2E678E] hover:to-[#1C4A6B] text-white shadow-xs cursor-pointer"
                >
                  {t.modals.investments.saveBtn}
                </button>
              </div>
            </form>
          )}

          {/* Asset Items List */}
          {items.length === 0 ? (
            <div className="text-center py-10 space-y-3 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              <Briefcase className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0C2340] dark:text-white">
                  {t.modals.investments.empty}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                  {locale === 'id'
                    ? 'Catat reksadana, saham, emas, atau aset kripto Anda untuk melihat estimasi kekayaan bersih (Net Worth) secara menyeluruh.'
                    : 'Record your mutual funds, stocks, gold, or crypto assets to track your total net worth seamlessly.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#4D8DBA] text-white hover:bg-[#2E678E] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.modals.investments.addAssetBtn}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((asset) => {
                const meta = CATEGORY_META[asset.category] || CATEGORY_META.REKSADANA;
                const isGain = asset.gainLossAmount >= 0;

                return (
                  <div
                    key={asset.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-[#4D8DBA]/25 bg-white dark:bg-slate-900/50 hover:border-[#4D8DBA] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2.5 rounded-xl text-white shrink-0 shadow-2xs mt-0.5"
                        style={{ backgroundColor: meta.color }}
                      >
                        <meta.icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0C2340] dark:text-white">
                            {asset.name}
                          </span>
                          <span
                            className="text-[10px] font-extrabold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: meta.color }}
                          >
                            {getCategoryLabel(asset.category)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {asset.quantity} {locale === 'id' ? 'unit' : 'units'} • {locale === 'id' ? 'Beli @' : 'Buy @'} {formatCurrency(asset.buyPrice)} • {locale === 'id' ? 'Sekarang @' : 'Current @'} {formatCurrency(asset.currentPrice)}
                        </p>
                        {asset.notes && (
                          <p className="text-[11px] text-gray-400 dark:text-slate-500 italic">
                            “{asset.notes}”
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-slate-800">
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-[#0C2340] dark:text-white">
                          {formatCurrency(asset.totalCurrent)}
                        </div>
                        <div
                          className={`text-xs font-bold flex items-center justify-end gap-1 ${
                            isGain ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                          }`}
                        >
                          {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>
                            {isGain ? '+' : ''}
                            {formatCurrency(asset.gainLossAmount)} ({isGain ? '+' : ''}
                            {asset.gainLossPercent}%)
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(asset.id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={locale === 'id' ? 'Hapus aset' : 'Delete asset'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#4D8DBA]/20 bg-gray-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>
            {locale === 'id' ? (
              <>Tersedia untuk pengguna paket <strong>Gold</strong> & <strong>B2B</strong>.</>
            ) : (
              <>Available for <strong>Gold</strong> & <strong>B2B</strong> tier subscribers.</>
            )}
          </span>
          <button
            type="button"
            onClick={closeInvestmentModal}
            className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-[#0C2340] dark:text-white transition-all cursor-pointer"
          >
            {t.modals.investments.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
