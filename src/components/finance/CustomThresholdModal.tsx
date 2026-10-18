'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sliders,
  AlertTriangle,
  Sparkles,
  X,
  Check,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface CustomThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomThresholdModal: React.FC<CustomThresholdModalProps> = ({ isOpen, onClose }) => {
  const { warningThresholdPercent, setWarningThresholdPercent } = useSubscription();
  const { locale, t } = useLanguage();
  const [val, setVal] = useState<number>(warningThresholdPercent);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setWarningThresholdPercent(val);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0D1926] border border-amber-400/60 dark:border-amber-400/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#0C2340] dark:text-white">
                  {t.modals.threshold.title}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t.modals.threshold.goldBadge}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {t.modals.threshold.subtitle}
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/40 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              {t.modals.threshold.info}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                {t.modals.threshold.label}
              </label>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {val}%
              </span>
            </div>

            <input
              type="range"
              min={40}
              max={95}
              step={5}
              value={val}
              onChange={(e) => setVal(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            <div className="flex justify-between text-[11px] text-gray-400">
              <span>{locale === 'en' ? 'Strict (40%)' : 'Ketat (40%)'}</span>
              <span>{locale === 'en' ? 'Standard (80%)' : 'Standar (80%)'}</span>
              <span>{locale === 'en' ? 'Relaxed (95%)' : 'Longgar (95%)'}</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[50, 70, 80, 90].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setVal(preset)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    val === preset
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{locale === 'en' ? 'Saved!' : 'Tersimpan!'}</span>
                </>
              ) : (
                <span>{t.modals.threshold.saveBtn}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

