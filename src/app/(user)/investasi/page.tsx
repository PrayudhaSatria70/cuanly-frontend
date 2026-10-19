'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { investmentsApi } from '@/services/api';
import { InvestmentAsset, InvestmentCategory, InvestmentSummary } from '@/types';
import { ADMIN_INITIAL_INVESTMENTS } from '@/services/mockData';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  Trash2,
  Coins,
  Building,
  Landmark,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Lock,
  ArrowRight,
  Briefcase,
  Layers,
  Search,
} from 'lucide-react';

const CATEGORY_META: Record<
  InvestmentCategory,
  { nameId: string; nameEn: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  REKSADANA: { nameId: 'Reksadana', nameEn: 'Mutual Funds', icon: Landmark, color: '#4D8DBA', bg: 'bg-[#4D8DBA]' },
  SAHAM: { nameId: 'Saham (IDX)', nameEn: 'Stocks / Equities', icon: TrendingUp, color: '#10B981', bg: 'bg-emerald-500' },
  EMAS: { nameId: 'Emas Fisik', nameEn: 'Physical Gold', icon: Coins, color: '#F59E0B', bg: 'bg-amber-500' },
  CRYPTO: { nameId: 'Kripto (Crypto)', nameEn: 'Cryptocurrency', icon: CircleDollarSign, color: '#8B5CF6', bg: 'bg-purple-500' },
  PROPERTI: { nameId: 'Properti', nameEn: 'Real Estate / Property', icon: Building, color: '#EC4899', bg: 'bg-pink-500' },
};

export default function InvestasiPage() {
  const { user } = useAuth();
  const { formatCurrency, t, locale } = useLanguage();
  const {
    hasAccess,
    openUpgradeModal,
    openInvestmentModal,
  } = useSubscription();

  const [items, setItems] = useState<InvestmentAsset[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | InvestmentCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InvestmentCategory>('SAHAM');
  const [quantity, setQuantity] = useState('1');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [notes, setNotes] = useState('');

  const isGoldOrB2B = hasAccess('GOLD');
  const userId = user?.id;
  const isAdminUser = user?.role === 'ADMIN' || user?.username === 'admin' || userId === 'usr_live_admin' || userId === 'usr_admin_01';
  const isDemoUser = userId === 'usr_demo_1' || userId === 'usr_demo_01';

  const calculateFullAsset = (raw: {
    id: string;
    userId: string;
    name: string;
    category: InvestmentCategory;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    notes?: string;
    createdAt?: string;
  }): InvestmentAsset => {
    const totalBuy = raw.quantity * raw.buyPrice;
    const totalCurrent = raw.quantity * raw.currentPrice;
    const gainLossAmount = totalCurrent - totalBuy;
    const gainLossPercent = totalBuy > 0 ? (gainLossAmount / totalBuy) * 100 : 0;
    return {
      ...raw,
      totalBuy,
      totalCurrent,
      gainLossAmount,
      gainLossPercent: Number(gainLossPercent.toFixed(2)),
      createdAt: raw.createdAt || new Date().toISOString(),
    };
  };

  // Load Data
  useEffect(() => {
    investmentsApi
      .getAll()
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          setItems(res.items);
        } else {
          try {
            const stored = localStorage.getItem(`cuanly_investments_${userId}`);
            if (stored) {
              setItems(JSON.parse(stored));
            } else if (isAdminUser) {
              const mapped = ADMIN_INITIAL_INVESTMENTS.map((ast) =>
                calculateFullAsset({
                  id: ast.id,
                  userId: ast.userId,
                  name: ast.name,
                  category: ast.category as InvestmentCategory,
                  quantity: ast.quantity,
                  buyPrice: ast.buyPrice,
                  currentPrice: ast.currentPrice,
                  notes: ast.notes,
                })
              );
              setItems(mapped);
            } else if (isDemoUser) {
              const demoAssets: InvestmentAsset[] = [
                calculateFullAsset({
                  id: 'inv_1',
                  userId: 'usr_demo_1',
                  name: 'Sucorinvest Sharia Money Market Fund',
                  category: 'REKSADANA',
                  quantity: 12500,
                  buyPrice: 1200,
                  currentPrice: 1275,
                  notes: 'Alokasi dana darurat pasar uang',
                }),
                calculateFullAsset({
                  id: 'inv_2',
                  userId: 'usr_demo_1',
                  name: 'BBCA (Bank Central Asia Tbk)',
                  category: 'SAHAM',
                  quantity: 1500,
                  buyPrice: 8900,
                  currentPrice: 10250,
                  notes: 'Saham dividen perbankan',
                }),
              ];
              setItems(demoAssets);
            } else {
              setItems([]);
            }
          } catch {
            setItems([]);
          }
        }
      })
      .catch(() => setItems([]));
  }, [userId, isAdminUser, isDemoUser]);

  const saveAssets = (updated: InvestmentAsset[]) => {
    setItems(updated);
    if (userId) {
      localStorage.setItem(`cuanly_investments_${userId}`, JSON.stringify(updated));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(quantity);
    const bp = Number(buyPrice);
    const cp = Number(currentPrice);

    if (!name.trim() || isNaN(q) || isNaN(bp) || isNaN(cp) || q <= 0 || bp <= 0 || cp <= 0) {
      setFeedback({
        type: 'error',
        message: locale === 'en' ? 'Please fill in all asset fields correctly' : 'Mohon lengkapi seluruh data aset dengan benar',
      });
      return;
    }

    const newAsset = calculateFullAsset({
      id: `inv_${Date.now()}`,
      userId: userId || 'usr_registered',
      name: name.trim(),
      category,
      quantity: q,
      buyPrice: bp,
      currentPrice: cp,
      notes: notes.trim() || undefined,
    });

    saveAssets([newAsset, ...items]);
    setName('');
    setQuantity('1');
    setBuyPrice('');
    setCurrentPrice('');
    setNotes('');
    setIsAddingInline(false);
    setFeedback({
      type: 'success',
      message: locale === 'en' ? 'Asset added to portfolio' : 'Aset berhasil ditambahkan ke portofolio',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((a) => a.id !== id);
    saveAssets(updated);
    setFeedback({
      type: 'success',
      message: locale === 'en' ? 'Asset deleted' : 'Aset berhasil dihapus dari portofolio',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Calculations
  const totalInvested = useMemo(() => items.reduce((acc, cur) => acc + cur.totalBuy, 0), [items]);
  const totalCurrentValue = useMemo(() => items.reduce((acc, cur) => acc + cur.totalCurrent, 0), [items]);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  // Breakdown by category
  const categoryAllocations = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + item.totalCurrent;
    });
    return Object.entries(map).map(([cat, val]) => ({
      category: cat as InvestmentCategory,
      value: val,
      percentage: totalCurrentValue > 0 ? (val / totalCurrentValue) * 100 : 0,
    }));
  }, [items, totalCurrentValue]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedFilter === 'ALL' || item.category === selectedFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-teal-900/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-teal-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {locale === 'en' ? 'Wealth & Portfolio Tracker' : 'Pelacak Portofolio & Aset'}
              <PremiumCrownBadge plan="GOLD" size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === 'en' ? 'Assets & Investment Portfolio' : 'Aset & Portofolio Investasi'}
            </h1>
            <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
              {locale === 'en'
                ? 'Track your stocks, mutual funds, physical gold, cryptocurrency, and real estate in one unified dashboard. Real-time capital gain calculations and asset class allocation.'
                : 'Pantau portofolio saham, reksadana, emas batangan, kripto, hingga properti komersial dalam satu layar. Perhitungan capital gain otomatis dengan pembobotan alokasi aset.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openInvestmentModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              {locale === 'en' ? 'Open Quick Modal' : 'Buka Quick Modal'}
            </button>
            {isGoldOrB2B && (
              <button
                type="button"
                onClick={() => setIsAddingInline((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 text-xs sm:text-sm font-bold shadow-lg shadow-teal-950/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {locale === 'en' ? 'Add Asset' : 'Tambah Aset'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Gate for Free / Silver */}
      {!isGoldOrB2B && (
        <div className="rounded-2xl border-2 border-dashed border-amber-400/50 bg-amber-500/5 dark:bg-amber-950/20 p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {locale === 'en'
                ? 'Investment Portfolio Tracking is locked on your plan'
                : 'Fitur Pelacak Investasi terkunci pada paket Anda'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {locale === 'en'
                ? 'Upgrade to the Gold Plan to monitor your multi-asset portfolio, evaluate unrealized gains/losses, and maintain optimal wealth diversification.'
                : 'Tingkatkan ke Paket Gold untuk memantau portofolio multi-aset, mengevaluasi imbal hasil (gain/loss), serta mendiversifikasi kekayaan secara terukur.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              openUpgradeModal(
                locale === 'en' ? 'Unlock Investment Tracker' : 'Buka Pelacak Investasi',
                'GOLD',
                locale === 'en'
                  ? 'Track multi-asset classes and automatic net-worth growth.'
                  : 'Pantau kelas aset multi-instrumen dan pertumbuhan kekayaan bersih.',
                t.modals.upgrade.goldBenefits
              )
            }
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            {locale === 'en' ? 'Upgrade to Gold Plan' : 'Upgrade ke Paket Gold'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Total Portfolio Value' : 'Nilai Pasar Portofolio'}
            </span>
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(totalCurrentValue)}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              ({items.length} {locale === 'en' ? 'assets' : 'aset'})
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Total Capital Invested' : 'Total Modal Masuk'}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(totalInvested)}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {locale === 'en' ? 'Cost basis' : 'Harga perolehan'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Unrealized Gain / Loss' : 'Total Capital Gain / Loss'}
            </span>
            <div
              className={`p-2 rounded-xl ${
                totalGainLoss >= 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
              }`}
            >
              {totalGainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-black ${
                totalGainLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {totalGainLoss >= 0 ? '+' : ''}
              {formatCurrency(totalGainLoss)}
            </span>
            <span
              className={`ml-2 text-xs font-bold ${
                totalGainLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              ({totalGainLossPercent >= 0 ? '+' : ''}
              {totalGainLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Asset Classes' : 'Diversifikasi Kelas'}
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {categoryAllocations.length} / 5
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {locale === 'en' ? 'Well diversified' : 'Terdiversifikasi baik'}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Allocation Visual Bar */}
      {totalCurrentValue > 0 && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {locale === 'en' ? 'Portfolio Allocation Breakdown' : 'Komposisi Alokasi Portofolio'}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              100% {locale === 'en' ? 'total assets' : 'total aset'}
            </span>
          </div>

          <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
            {categoryAllocations.map((alloc) => {
              const meta = CATEGORY_META[alloc.category];
              return (
                <div
                  key={alloc.category}
                  style={{ width: `${alloc.percentage}%`, backgroundColor: meta.color }}
                  className="h-full transition-all duration-300"
                  title={`${meta.nameId}: ${alloc.percentage.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            {categoryAllocations.map((alloc) => {
              const meta = CATEGORY_META[alloc.category];
              return (
                <div key={alloc.category} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {locale === 'en' ? meta.nameEn : meta.nameId}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {alloc.percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Form Add Asset */}
      {isAddingInline && isGoldOrB2B && (
        <form
          onSubmit={handleAddSubmit}
          className="rounded-3xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/20 p-6 space-y-4 shadow-md transition-all animate-in slide-in-from-top-4 duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              {locale === 'en' ? 'Add Asset to Portfolio' : 'Tambah Aset ke Portofolio'}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {locale === 'en' ? 'Cancel' : 'Batal'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Asset Name / Ticker' : 'Nama Aset / Kode Saham'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BBCA, Emas Antam, BTC"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Category' : 'Kategori Instrumen'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InvestmentCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {locale === 'en' ? meta.nameEn : meta.nameId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Quantity / Units' : 'Jumlah Unit / Lembar'}
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Average Buy Price' : 'Harga Beli Rata-Rata (Rp)'}
              </label>
              <input
                type="number"
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="e.g. 9000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Current Market Price' : 'Harga Pasar Saat Ini (Rp)'}
              </label>
              <input
                type="number"
                required
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="e.g. 10250"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Notes / Strategy' : 'Catatan / Alokasi'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Dana pensiun jangka panjang"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {locale === 'en' ? 'Save Asset' : 'Simpan Aset'}
            </button>
          </div>
        </form>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'en' ? 'All Classes' : 'Semua Instrumen'} ({items.length})
          </button>
          {Object.entries(CATEGORY_META).map(([cat, meta]) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat as InvestmentCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedFilter === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                {locale === 'en' ? meta.nameEn : meta.nameId} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'en' ? 'Search portfolio...' : 'Cari aset...'}
            className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-full sm:w-40"
          />
        </div>
      </div>

      {/* Asset Table / Cards */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Coins className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              {locale === 'en' ? 'No Assets Found' : 'Belum Ada Aset Terdaftar'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {locale === 'en'
                ? 'Add your first stock, mutual fund, or physical gold above to begin tracking.'
                : 'Tambahkan aset saham, reksadana, atau emas fisik Anda di atas untuk mulai memantau.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.map((item) => {
              const meta = CATEGORY_META[item.category];
              const Icon = meta.icon;
              const isProfit = item.gainLossAmount >= 0;

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className="p-3 rounded-2xl text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: meta.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span
                          className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          {locale === 'en' ? meta.nameEn : meta.nameId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.quantity.toLocaleString()} {locale === 'en' ? 'units' : 'unit'} • @ {formatCurrency(item.currentPrice)} (Buy: {formatCurrency(item.buyPrice)})
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left sm:text-right">
                      <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(item.totalCurrent)}
                      </span>
                      <span
                        className={`text-xs font-bold inline-flex items-center gap-1 ${
                          isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isProfit ? '+' : ''}
                        {formatCurrency(item.gainLossAmount)} ({item.gainLossPercent >= 0 ? '+' : ''}
                        {item.gainLossPercent.toFixed(2)}%)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title={locale === 'en' ? 'Delete asset' : 'Hapus aset'}
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
    </div>
  );
}
