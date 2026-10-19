'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { DebtItem } from '@/types';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  HandCoins,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';

interface DebtManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebtManagerModal: React.FC<DebtManagerModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { debts, addDebt, toggleSettleDebt, deleteDebt, hasAccess, openUpgradeModal } =
    useSubscription();
  const { formatCurrency, formatDate, locale, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'ALL' | 'RECEIVABLE' | 'DEBT'>('ALL');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [type, setType] = useState<'RECEIVABLE' | 'DEBT'>('RECEIVABLE');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tenorMonths, setTenorMonths] = useState('1');
  const [interestRate, setInterestRate] = useState('0');

  if (!isOpen) return null;

  const handleCreateDebt = (e: React.FormEvent) => {
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
    setIsAddingNew(false);
  };

  const filteredDebts = debts.filter((d) => {
    if (activeTab === 'RECEIVABLE') return d.type === 'RECEIVABLE';
    if (activeTab === 'DEBT') return d.type === 'DEBT';
    return true;
  });

  const totalReceivable = debts
    .filter((d) => d.type === 'RECEIVABLE' && !d.isSettled)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebt = debts
    .filter((d) => d.type === 'DEBT' && !d.isSettled)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0D1926] border border-amber-400/50 dark:border-amber-400/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-300">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#0C2340] dark:text-white">
                  {t.modals.debt.title}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t.modals.debt.goldBadge}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {t.modals.debt.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            aria-label={t.common.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Mini Cards */}
        <div className="p-5 sm:p-6 pb-2 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
              <span>{t.modals.debt.totalReceivable}</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-300 mt-1 num-tabular">
              {formatCurrency(totalReceivable)}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>{t.modals.debt.totalDebt}</span>
            </div>
            <div className="text-base sm:text-lg font-black text-rose-800 dark:text-rose-300 mt-1 num-tabular">
              {formatCurrency(totalDebt)}
            </div>
          </div>
        </div>

        {/* Content & List */}
        <div className="p-5 sm:p-6 pt-2 space-y-4 max-h-[50vh] overflow-y-auto">
          {/* Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === 'ALL' ? 'bg-white dark:bg-[#0D1926] shadow-xs' : 'text-gray-500'
                }`}
              >
                {t.modals.debt.tabAll} ({debts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('RECEIVABLE')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === 'RECEIVABLE'
                    ? 'bg-white dark:bg-[#0D1926] text-emerald-600 shadow-xs'
                    : 'text-gray-500'
                }`}
              >
                {t.modals.debt.tabReceivable}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('DEBT')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === 'DEBT'
                    ? 'bg-white dark:bg-[#0D1926] text-rose-600 shadow-xs'
                    : 'text-gray-500'
                }`}
              >
                {t.modals.debt.tabDebt}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.modals.debt.addNewBtn}</span>
            </button>
          </div>

          {/* Add form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateDebt}
              className="p-4 rounded-2xl bg-amber-50/60 dark:bg-[#112233]/50 border border-amber-300/50 space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.debt.typeLabel}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'RECEIVABLE' | 'DEBT')}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700"
                  >
                    <option value="RECEIVABLE">{t.modals.debt.typeReceivable}</option>
                    <option value="DEBT">{t.modals.debt.typeDebt}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.debt.personLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder={t.modals.debt.personPlaceholder}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.debt.amountLabel}
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.debt.dueDateLabel}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                  {t.modals.debt.notesLabel}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.modals.debt.notesPlaceholder}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-300 block mb-1">
                    Tenor (Bulan Cicilan)
                  </label>
                  <select
                    value={tenorMonths}
                    onChange={(e) => setTenorMonths(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#071018] border border-amber-400/30 font-bold"
                  >
                    <option value="1">1 Bulan (Lunas Langsung)</option>
                    <option value="3">3 Bulan (Cicilan 3x)</option>
                    <option value="6">6 Bulan (Cicilan 6x)</option>
                    <option value="12">12 Bulan (Cicilan 12x)</option>
                    <option value="24">24 Bulan (Cicilan 24x)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-amber-800 dark:text-amber-300 block mb-1">
                    Estimasi Bunga / Margin (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="0%"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#071018] border border-amber-400/30 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 text-gray-600 dark:text-slate-300"
                >
                  {t.modals.debt.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors cursor-pointer"
                >
                  {t.modals.debt.saveBtn}
                </button>
              </div>
            </form>
          )}

          {/* List items */}
          <div className="space-y-2">
            {filteredDebts.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                {t.modals.debt.empty}
              </div>
            ) : (
              filteredDebts.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    item.isSettled
                      ? 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-60'
                      : 'bg-white dark:bg-[#071018] border-gray-200/80 dark:border-[#4D8DBA]/25 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSettleDebt(item.id)}
                      className={`p-1.5 rounded-lg border mt-0.5 cursor-pointer transition-colors ${
                        item.isSettled
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-gray-300 hover:border-emerald-500 text-transparent'
                      }`}
                      title={item.isSettled ? (locale === 'en' ? 'Mark as Unsettled' : 'Tandai Belum Lunas') : t.modals.debt.markSettled}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs sm:text-sm ${item.isSettled ? 'line-through text-gray-400' : 'text-[#0C2340] dark:text-white'}`}>
                          {item.personName}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            item.type === 'RECEIVABLE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {item.type === 'RECEIVABLE' ? t.modals.debt.tabReceivable : t.modals.debt.tabDebt}
                        </span>
                        {item.isSettled && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                            {t.modals.debt.settled}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.modals.debt.due} {formatDate(item.dueDate)}
                        </span>
                        {item.tenorMonths && item.tenorMonths > 1 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                            Tenor {item.tenorMonths}x • {item.installmentAmount ? formatCurrency(item.installmentAmount) : ''}/bln
                          </span>
                        )}
                        {item.notes && <span>• {item.notes}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs sm:text-sm font-black num-tabular ${
                        item.type === 'RECEIVABLE' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.type === 'RECEIVABLE' ? '+' : '-'} {formatCurrency(item.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteDebt(item.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 cursor-pointer"
                      title={locale === 'en' ? 'Delete record' : 'Hapus catatan'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-gray-50/80 dark:bg-[#071018]/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-slate-200 font-bold text-xs hover:bg-gray-300 transition-colors cursor-pointer"
          >
            {locale === 'en' ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
