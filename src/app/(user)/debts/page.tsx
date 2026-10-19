'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DebtItem } from '@/types';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  HandCoins,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User as UserIcon,
  Sparkles,
  Lock,
  ChevronRight,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function DebtsPage() {
  const { user } = useAuth();
  const {
    debts,
    addDebt,
    toggleSettleDebt,
    deleteDebt,
    hasAccess,
    tier,
    openUpgradeModal,
  } = useSubscription();
  const { formatCurrency, formatDate, locale, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'ALL' | 'RECEIVABLE' | 'DEBT' | 'SETTLED'>('ALL');
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [type, setType] = useState<'RECEIVABLE' | 'DEBT'>('RECEIVABLE');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tenorMonths, setTenorMonths] = useState('1');
  const [interestRate, setInterestRate] = useState('0');

  const isGoldOrHigher = hasAccess('GOLD');
  const hasTriggeredModalRef = useRef(false);

  // Auto-trigger upgrade modal on mount if account is Free plan / not Gold
  useEffect(() => {
    if (!hasTriggeredModalRef.current && user?.role !== 'ADMIN' && !hasAccess('GOLD')) {
      hasTriggeredModalRef.current = true;
      openUpgradeModal(
        t.modals.debt.title,
        'GOLD',
        t.modals.debt.subtitle
      );
    }
  }, [hasAccess, user?.role, openUpgradeModal, t.modals.debt]);

  // Calculations
  const activeReceivables = debts.filter((d) => d.type === 'RECEIVABLE' && !d.isSettled);
  const totalReceivables = activeReceivables.reduce((sum, d) => sum + (Number(d.amount) - (Number(d.paidAmount) || 0)), 0);

  const activeDebts = debts.filter((d) => d.type === 'DEBT' && !d.isSettled);
  const totalDebts = activeDebts.reduce((sum, d) => sum + (Number(d.amount) - (Number(d.paidAmount) || 0)), 0);

  const settledCount = debts.filter((d) => d.isSettled).length;
  const netPosition = totalReceivables - totalDebts;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !amount) return;

    const baseAmt = Number(amount);
    const tenor = parseInt(tenorMonths, 10) || 1;
    const rate = parseFloat(interestRate) || 0;
    const totalWithInterest = Math.round(baseAmt * (1 + rate / 100));
    const installmentAmt = Math.round(totalWithInterest / Math.max(1, tenor));

    addDebt({
      userId: user?.id || 'usr_registered',
      type,
      personName: personName.trim(),
      amount: totalWithInterest,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      isSettled: false,
      tenorMonths: tenor,
      interestRate: rate,
      installmentAmount: installmentAmt,
      paidAmount: 0,
    });

    setPersonName('');
    setAmount('');
    setDueDate('');
    setNotes('');
    setTenorMonths('1');
    setInterestRate('0');
    setIsAddingInline(false);
  };

  const filteredDebts = debts.filter((d) => {
    if (activeTab === 'SETTLED') return d.isSettled;
    if (activeTab === 'RECEIVABLE') return d.type === 'RECEIVABLE' && !d.isSettled;
    if (activeTab === 'DEBT') return d.type === 'DEBT' && !d.isSettled;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark dark:text-white">
              {t.nav.debtManager}
            </h1>
            {!isGoldOrHigher && <PremiumCrownBadge plan="GOLD" />}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {locale === 'en'
              ? 'Complete debt & receivables tracker: loan terms, interest rates, installment plans, and due date reminders'
              : 'Pencatatan utang & piutang lengkap: tenor cicilan, margin bunga, jatuh tempo, dan pelunasan bertahap'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isGoldOrHigher ? (
            <button
              type="button"
              onClick={() =>
                openUpgradeModal(
                  t.modals.debt.title,
                  'GOLD',
                  t.modals.debt.subtitle
                )
              }
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{locale === 'en' ? 'Upgrade to Gold' : 'Upgrade ke Gold'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingInline(!isAddingInline)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#4D8DBA] hover:bg-[#3B7B9E] text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{locale === 'en' ? 'Record New Entry' : 'Catat Utang / Piutang'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Banner if not Gold */}
      {!isGoldOrHigher && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/30 dark:border-amber-500/20 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#0C2340] dark:text-white">
                  {locale === 'en' ? 'Exclusive Feature: Gold Plan' : 'Fitur Eksklusif Paket Gold & B2B'}
                </h3>
                <PremiumCrownBadge plan="GOLD" />
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                {locale === 'en'
                  ? 'Track whom you owe and who owes you with scheduled repayment terms, custom interest rates, and automated reminders.'
                  : 'Kelola utang ke pihak lain dan tagihan piutang pihak ketiga dengan tenor cicilan, perhitungan margin bunga, serta notifikasi jatuh tempo otomatis.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#071018]/70 border border-gray-200/80 dark:border-slate-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {locale === 'en' ? 'Installments (1-24 months)' : 'Cicilan Fleksibel (1-24 bulan)'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#071018]/70 border border-gray-200/80 dark:border-slate-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {locale === 'en' ? 'Interest margin calculation' : 'Simulasi Margin Bunga Pinjaman'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-[#071018]/70 border border-gray-200/80 dark:border-slate-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {locale === 'en' ? 'Instant cloud backup' : 'Sinkronisasi Cloud Real-time'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
            <span>{locale === 'en' ? 'Total Receivables (Piutang)' : 'Total Piutang Belum Lunas'}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalReceivables)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {activeReceivables.length} {locale === 'en' ? 'active debtors' : 'debitur berhutang'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
            <span>{locale === 'en' ? 'Total Payables (Utang)' : 'Total Utang Belum Lunas'}</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(totalDebts)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {activeDebts.length} {locale === 'en' ? 'creditors' : 'kreditor terdaftar'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
            <span>{locale === 'en' ? 'Net Position' : 'Posisi Saldo Bersih'}</span>
            <HandCoins className="w-4 h-4 text-[#4D8DBA]" />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-2 ${netPosition >= 0 ? 'text-[#0C2340] dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(netPosition)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {netPosition >= 0 ? (locale === 'en' ? 'Positive cash claims' : 'Klaim piutang lebih besar') : (locale === 'en' ? 'Debt exceeds claims' : 'Beban utang lebih besar')}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
            <span>{locale === 'en' ? 'Settled History' : 'Catatan Lunas'}</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0C2340] dark:text-white mt-2">
            {settledCount} {locale === 'en' ? 'Settled' : 'Lunas'}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {debts.length} {locale === 'en' ? 'total historical entries' : 'total riwayat tercatat'}
          </div>
        </div>
      </div>

      {/* Inline Form */}
      {isAddingInline && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200 dark:border-[#4D8DBA]/30 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0C2340] dark:text-white">
              {locale === 'en' ? 'Record New Debt or Receivable' : 'Catat Utang / Piutang Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs"
            >
              {locale === 'en' ? 'Cancel' : 'Batal'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => setType('RECEIVABLE')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                type === 'RECEIVABLE'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'
              }`}
            >
              {locale === 'en' ? 'Receivable (Piutang)' : 'Piutang (Orang Berhutang)'}
            </button>
            <button
              type="button"
              onClick={() => setType('DEBT')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                type === 'DEBT'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'
              }`}
            >
              {locale === 'en' ? 'Payable (Utang)' : 'Utang (Saya Berhutang)'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Counterparty Name' : 'Nama Orang / Perusahaan'}
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Hendro Wijaya, PT Sinar"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Principal Amount (IDR)' : 'Nominal Pokok (Rp)'}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000000"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Tenor (Months)' : 'Tenor Cicilan'}
              </label>
              <select
                value={tenorMonths}
                onChange={(e) => setTenorMonths(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
              >
                <option value="1">1 Bulan (Pelunasan Langsung)</option>
                <option value="2">2 Bulan</option>
                <option value="3">3 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="12">12 Bulan (1 Tahun)</option>
                <option value="24">24 Bulan (2 Tahun)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Due Date' : 'Tanggal Jatuh Tempo'}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4D8DBA] hover:bg-[#3B7B9E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {locale === 'en' ? 'Save Record' : 'Simpan Catatan'}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'bg-[#4D8DBA] text-white shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {locale === 'en' ? 'All Active' : 'Semua Aktif'} ({debts.filter((d) => !d.isSettled).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RECEIVABLE')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'RECEIVABLE'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {locale === 'en' ? 'Receivables' : 'Piutang'} ({activeReceivables.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DEBT')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'DEBT'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {locale === 'en' ? 'Payables' : 'Utang'} ({activeDebts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SETTLED')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SETTLED'
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {locale === 'en' ? 'Settled' : 'Lunas'} ({settledCount})
        </button>
      </div>

      {/* Debts List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-xs sm:text-sm">
            {locale === 'en' ? 'No debt or receivable records in this filter.' : 'Tidak ada catatan utang piutang pada filter ini.'}
          </div>
        ) : (
          filteredDebts.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.isSettled
                  ? 'bg-gray-50 dark:bg-[#071018]/50 border-gray-200/60 dark:border-slate-800/60 opacity-75'
                  : 'bg-white dark:bg-[#0D1926] border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.isSettled
                      ? 'bg-gray-200 dark:bg-slate-800 text-gray-500'
                      : item.type === 'RECEIVABLE'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                  }`}
                >
                  {item.isSettled ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : item.type === 'RECEIVABLE' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-sm text-[#0C2340] dark:text-white ${item.isSettled ? 'line-through text-gray-400' : ''}`}>
                      {item.personName}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        item.type === 'RECEIVABLE'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {item.type === 'RECEIVABLE' ? (locale === 'en' ? 'Receivable' : 'Piutang') : (locale === 'en' ? 'Debt' : 'Utang')}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.notes}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {locale === 'en' ? 'Due:' : 'Jatuh tempo:'} {item.dueDate}
                    </span>
                    {item.tenorMonths && item.tenorMonths > 1 && (
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        Tenor: {item.tenorMonths} bln @ {formatCurrency(item.installmentAmount || 0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                <div className="text-right">
                  <div
                    className={`font-black text-base sm:text-lg ${
                      item.isSettled
                        ? 'text-gray-400 line-through'
                        : item.type === 'RECEIVABLE'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatCurrency(item.amount)}
                  </div>
                  {item.paidAmount && item.paidAmount > 0 && !item.isSettled ? (
                    <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {locale === 'en' ? 'Paid:' : 'Terbayar:'} {formatCurrency(item.paidAmount)}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSettleDebt(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      item.isSettled
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{item.isSettled ? (locale === 'en' ? 'Reopen' : 'Buka') : (locale === 'en' ? 'Settle' : 'Lunas')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteDebt(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title={locale === 'en' ? 'Delete' : 'Hapus'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
