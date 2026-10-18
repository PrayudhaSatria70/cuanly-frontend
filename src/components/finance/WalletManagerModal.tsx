'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wallet } from '@/types';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  Wallet as WalletIcon,
  Plus,
  Trash2,
  X,
  CreditCard,
  Building,
  Smartphone,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';

interface WalletManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletManagerModal: React.FC<WalletManagerModalProps> = ({ isOpen, onClose }) => {
  const { wallets, addWallet, deleteWallet, hasAccess, plan, openUpgradeModal } = useSubscription();
  const { formatCurrency, locale, t } = useLanguage();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<Wallet['type']>('BANK');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddNewClick = () => {
    // If on Free tier and already has 2 wallets, trigger Canva-style upgrade prompt
    if (!hasAccess('SILVER') && wallets.length >= 2) {
      openUpgradeModal(
        t.modals.wallet.unlimitedTitle,
        'SILVER',
        t.modals.wallet.unlimitedDesc,
        t.modals.upgrade.silverBenefits
      );
      return;
    }
    setIsAddingNew(true);
  };

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!walletName.trim()) {
      setErrorMsg(t.modals.wallet.nameRequired);
      return;
    }

    const balanceNum = Number(initialBalance) || 0;

    const res = addWallet({
      userId: 'usr_demo_01',
      name: walletName.trim(),
      type: walletType,
      balance: balanceNum,
      accountNumber: accountNumber.trim() || undefined,
      color:
        walletType === 'CASH'
          ? '#10B981'
          : walletType === 'BANK'
          ? '#2563EB'
          : walletType === 'E_WALLET'
          ? '#06B6D4'
          : '#8B5CF6',
    });

    if (res.success) {
      setWalletName('');
      setInitialBalance('');
      setAccountNumber('');
      setIsAddingNew(false);
    } else {
      setErrorMsg(res.error || (locale === 'en' ? 'Failed to add wallet.' : 'Gagal menambahkan dompet.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0D1926] border border-[#AEC4D4]/60 dark:border-[#4D8DBA]/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4D8DBA]/15 text-[#4D8DBA] dark:text-[#8AD6D1]">
              <WalletIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#0C2340] dark:text-white">
                  {t.modals.wallet.title}
                </h3>
                {!hasAccess('SILVER') ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    {t.modals.wallet.basicLimit}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8AD6D1]/20 text-[#1C4A6B] dark:text-[#8AD6D1] border border-[#8AD6D1]/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#4D8DBA]" />
                    {t.modals.wallet.unlimitedTitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {t.modals.wallet.subtitle}
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Wallets list */}
          <div className="space-y-2.5">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-[#071018]/80 border border-gray-200/80 dark:border-[#4D8DBA]/25 flex items-center justify-between gap-3 hover:border-[#4D8DBA] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-2xs"
                    style={{ backgroundColor: w.color || '#4D8DBA' }}
                  >
                    {w.type === 'CASH' ? (
                      <WalletIcon className="w-5 h-5" />
                    ) : w.type === 'BANK' ? (
                      <Building className="w-5 h-5" />
                    ) : (
                      <Smartphone className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs sm:text-sm text-[#0C2340] dark:text-white">
                        {w.name}
                      </span>
                      {w.isShared && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          Shared
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 block font-mono">
                      {w.accountNumber || (w.type === 'CASH' ? (locale === 'en' ? 'Physical Cash' : 'Uang Fisik') : 'Digital Wallet')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-500 block">
                      {locale === 'en' ? 'Balance' : 'Saldo'}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-[#1C4A6B] dark:text-[#8AD6D1] num-tabular">
                      {formatCurrency(w.balance)}
                    </span>
                  </div>
                  {wallets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteWallet(w.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title={locale === 'en' ? 'Delete wallet' : 'Hapus dompet'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form to Add New Wallet */}
          {isAddingNew && (
            <form onSubmit={handleCreateWallet} className="p-4 rounded-2xl bg-blue-50/50 dark:bg-[#112233]/40 border border-[#4D8DBA]/35 space-y-3">
              <h4 className="text-xs font-extrabold text-[#1C4A6B] dark:text-[#8AD6D1]">
                {t.modals.wallet.formTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.wallet.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder={t.modals.wallet.namePlaceholder}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4D8DBA]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.wallet.typeLabel}
                  </label>
                  <select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value as Wallet['type'])}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4D8DBA]"
                  >
                    <option value="CASH">{t.modals.wallet.typeCash}</option>
                    <option value="BANK">{t.modals.wallet.typeBank}</option>
                    <option value="E_WALLET">{t.modals.wallet.typeEWallet}</option>
                    <option value="SAVINGS">{t.modals.wallet.typeSavings}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.wallet.balanceLabel}
                  </label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="1000000"
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4D8DBA]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-300 block mb-1">
                    {t.modals.wallet.accountNumberLabel}
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={t.modals.wallet.accountNumberPlaceholder}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4D8DBA]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-100 cursor-pointer"
                >
                  {t.modals.wallet.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#4D8DBA] hover:bg-[#2E678E] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {t.modals.wallet.saveBtn}
                </button>
              </div>
            </form>
          )}

          {/* Canva-style Button: Tambah Dompet Baru with Canva Crown 👑 */}
          {!isAddingNew && (
            <button
              type="button"
              onClick={handleAddNewClick}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#AEC4D4] dark:border-[#4D8DBA]/40 hover:border-[#4D8DBA] dark:hover:border-[#8AD6D1] bg-white/50 dark:bg-[#071018]/50 text-xs font-bold text-[#1C4A6B] dark:text-[#8AD6D1] flex items-center justify-center gap-2 hover:bg-[#8AD6D1]/10 transition-all cursor-pointer group shadow-2xs"
            >
              <Plus className="w-4 h-4 text-[#4D8DBA] dark:text-[#8AD6D1]" />
              <span>{t.modals.wallet.addWalletBtn}</span>
              {!hasAccess('SILVER') && (
                <PremiumCrownBadge plan="SILVER" size="sm" />
              )}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-gray-50/80 dark:bg-[#071018]/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {locale === 'en' ? 'Total Wallets:' : 'Total Dompet:'} <strong>{wallets.length}</strong>
          </span>
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
