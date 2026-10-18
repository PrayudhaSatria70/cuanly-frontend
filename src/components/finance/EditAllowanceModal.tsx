'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { X, Check, Wallet, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

interface EditAllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditAllowanceModal: React.FC<EditAllowanceModalProps> = ({ isOpen, onClose }) => {
  const { t, formatCurrency } = useLanguage();
  const { summary, monthlyAllowance, setMonthlyAllowance } = useFinance();
  const { addNotification } = useNotification();

  const [amountStr, setAmountStr] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setAmountStr((monthlyAllowance || summary.totalBudgetLimit || 6700000).toString());
      setErrorMsg('');
    }
  }, [isOpen, monthlyAllowance, summary.totalBudgetLimit]);

  if (!isOpen) return null;

  const currentNumeric = parseInt(amountStr, 10) || 0;
  const projectedRemaining = Math.max(0, currentNumeric - summary.totalBudgetSpent);
  const projectedPercent =
    currentNumeric > 0
      ? Math.min(100, Math.round((summary.totalBudgetSpent / currentNumeric) * 100))
      : 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmountStr(raw);
    setErrorMsg('');
  };

  const handleSetPreset = (presetAmount: number) => {
    setAmountStr(presetAmount.toString());
    setErrorMsg('');
  };

  const handleAddDelta = (delta: number) => {
    const next = Math.max(0, currentNumeric + delta);
    setAmountStr(next.toString());
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNumeric || currentNumeric <= 0) {
      setErrorMsg(t.allowance.invalidAmount);
      return;
    }

    setMonthlyAllowance(currentNumeric);

    addNotification({
      title: t.allowance.modalTitle,
      message: `${t.allowance.successMsg} (${formatCurrency(currentNumeric)})`,
      type: 'SUCCESS',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0D1926] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#4D8DBA]/30 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#1C4A6B] to-[#4D8DBA] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <Wallet className="w-5 h-5 text-[#8AD6D1]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {t.allowance.modalTitle}
              </h3>
              <p className="text-xs text-gray-200">
                {t.allowance.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main Amount Input */}
          <div className="space-y-1.5 text-center">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              {t.allowance.inputLabel}
            </label>
            <div className="relative flex items-center justify-center">
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
                className="text-3xl sm:text-4xl font-extrabold text-[#1C4A6B] dark:text-white bg-transparent border-b-2 border-[#4D8DBA] focus:outline-none text-center max-w-[280px] num-tabular"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Quick Presets & Adders */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">
              {t.allowance.quickPresets}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSetPreset(5000000)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#AEC4D4]/20 hover:bg-[#AEC4D4]/35 dark:bg-[#4D8DBA]/20 dark:hover:bg-[#4D8DBA]/30 text-[#1C4A6B] dark:text-slate-200 border border-[#AEC4D4]/40 dark:border-[#4D8DBA]/40 transition-colors"
              >
                Rp 5.000.000
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(7500000)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#AEC4D4]/20 hover:bg-[#AEC4D4]/35 dark:bg-[#4D8DBA]/20 dark:hover:bg-[#4D8DBA]/30 text-[#1C4A6B] dark:text-slate-200 border border-[#AEC4D4]/40 dark:border-[#4D8DBA]/40 transition-colors"
              >
                Rp 7.500.000
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset(10000000)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#AEC4D4]/20 hover:bg-[#AEC4D4]/35 dark:bg-[#4D8DBA]/20 dark:hover:bg-[#4D8DBA]/30 text-[#1C4A6B] dark:text-slate-200 border border-[#AEC4D4]/40 dark:border-[#4D8DBA]/40 transition-colors"
              >
                Rp 10.000.000
              </button>
              <button
                type="button"
                onClick={() => handleAddDelta(500000)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#8AD6D1]/20 hover:bg-[#8AD6D1]/30 dark:bg-[#8AD6D1]/15 dark:hover:bg-[#8AD6D1]/25 text-[#1C4A6B] dark:text-[#8AD6D1] border border-[#8AD6D1]/50 dark:border-[#8AD6D1]/40 transition-colors"
              >
                +500rb
              </button>
              <button
                type="button"
                onClick={() => handleAddDelta(1000000)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#8AD6D1]/20 hover:bg-[#8AD6D1]/30 dark:bg-[#8AD6D1]/15 dark:hover:bg-[#8AD6D1]/25 text-[#1C4A6B] dark:text-[#8AD6D1] border border-[#8AD6D1]/50 dark:border-[#8AD6D1]/40 transition-colors"
              >
                +1 Juta
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-[#F4F8FA] dark:bg-[#071018] border border-[#AEC4D4]/40 dark:border-[#4D8DBA]/30 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-slate-400 block mb-0.5">{t.allowance.currentSpent}</span>
              <span className="font-bold text-rose-600 text-sm num-tabular">
                {formatCurrency(summary.totalBudgetSpent)}
              </span>
            </div>
            <div className="border-l pl-4 border-gray-200 dark:border-[#4D8DBA]/20">
              <span className="text-gray-500 dark:text-slate-400 block mb-0.5">{t.allowance.projectedRemaining}</span>
              <span className="font-bold text-[#2E678E] dark:text-[#8AD6D1] text-sm num-tabular">
                {formatCurrency(projectedRemaining)}
              </span>
            </div>

            {/* Progress bar preview */}
            <div className="col-span-2 pt-2 border-t border-gray-200/70 dark:border-[#4D8DBA]/20">
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 mb-1">
                <span>Estimasi Pemakaian:</span>
                <span className="font-bold text-[#1C4A6B] dark:text-slate-100">{projectedPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#112233] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    projectedPercent >= 100
                      ? 'bg-rose-500'
                      : projectedPercent >= 75
                      ? 'bg-amber-400'
                      : 'bg-gradient-to-r from-[#8AD6D1] to-[#4D8DBA]'
                  }`}
                  style={{ width: `${projectedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#4D8DBA]/30 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#112233] text-xs sm:text-sm font-semibold transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4D8DBA] hover:bg-[#2E678E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4D8DBA]/25 hover:scale-[1.01] active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 text-[#8AD6D1]" />
              <span>{t.allowance.saveBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  );
};
