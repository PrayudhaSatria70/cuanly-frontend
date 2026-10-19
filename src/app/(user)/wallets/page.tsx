'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet } from '@/types';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  Wallet as WalletIcon,
  Plus,
  Trash2,
  Building,
  Smartphone,
  CreditCard,
  Layers,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function WalletsPage() {
  const { user } = useAuth();
  const {
    wallets,
    addWallet,
    deleteWallet,
    hasAccess,
    tier,
    openUpgradeModal,
  } = useSubscription();
  const { formatCurrency, locale, t } = useLanguage();

  const [isAddingInline, setIsAddingInline] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<Wallet['type']>('BANK');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculations
  const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  const bankWallets = wallets.filter((w) => w.type === 'BANK');
  const totalBank = bankWallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  const cashAndEwallet = wallets.filter((w) => w.type === 'CASH' || w.type === 'E_WALLET');
  const totalCashAndEwallet = cashAndEwallet.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
  const sharedWallets = wallets.filter((w) => w.isShared);
  const totalShared = sharedWallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);

  const isFreePlan = !hasAccess('SILVER');
  const isAtLimit = isFreePlan && wallets.length >= 2;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!walletName.trim()) {
      setErrorMsg(locale === 'en' ? 'Wallet name is required' : 'Nama dompet wajib diisi');
      return;
    }

    if (isAtLimit) {
      openUpgradeModal(
        t.modals.wallet.unlimitedTitle,
        'SILVER',
        t.modals.wallet.unlimitedDesc,
        t.modals.upgrade.silverBenefits
      );
      return;
    }

    const res = addWallet({
      userId: user?.id || 'usr_registered',
      name: walletName.trim(),
      type: walletType,
      balance: Number(initialBalance) || 0,
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
      setIsAddingInline(false);
    } else {
      setErrorMsg(res.error || '');
    }
  };

  const getWalletIcon = (type: Wallet['type']) => {
    switch (type) {
      case 'CASH':
        return <WalletIcon className="w-5 h-5 text-emerald-500" />;
      case 'BANK':
        return <Building className="w-5 h-5 text-blue-500" />;
      case 'E_WALLET':
        return <Smartphone className="w-5 h-5 text-cyan-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark dark:text-white">
              {t.nav.multiWallet}
            </h1>
            {!hasAccess('SILVER') && <PremiumCrownBadge plan="SILVER" />}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
            {locale === 'en'
              ? 'Consolidated multi-account management: bank accounts, cash reserves, e-wallets, and shared team treasury'
              : 'Pusat pengelolaan multi-rekening perbankan, dompet tunai kas kecil, e-wallet, dan kas bersama tim'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFreePlan && (
            <button
              type="button"
              onClick={() =>
                openUpgradeModal(
                  t.modals.wallet.unlimitedTitle,
                  'SILVER',
                  t.modals.wallet.unlimitedDesc,
                  t.modals.upgrade.silverBenefits
                )
              }
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === 'en' ? 'Unlock Unlimited Wallets' : 'Buka Dompet Tanpa Batas'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isAtLimit) {
                openUpgradeModal(
                  t.modals.wallet.unlimitedTitle,
                  'SILVER',
                  t.modals.wallet.unlimitedDesc,
                  t.modals.upgrade.silverBenefits
                );
              } else {
                setIsAddingInline(!isAddingInline);
              }
            }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#4D8DBA] hover:bg-[#3B7B9E] text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'en' ? 'Add New Wallet' : 'Tambah Dompet'}</span>
          </button>
        </div>
      </div>

      {/* Free Plan Quota Notice Banner */}
      {isFreePlan && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {locale === 'en' ? 'Free Plan Quota:' : 'Kuota Dompet Paket Free:'}
              </span>{' '}
              <span className="text-amber-800 dark:text-amber-300">
                {wallets.length} / 2 {locale === 'en' ? 'wallets used.' : 'dompet tersimpan.'}
              </span>
            </div>
          </div>
          <Link
            href="/pricing"
            className="font-bold text-[#4D8DBA] hover:underline flex-shrink-0"
          >
            {locale === 'en' ? 'View Plans' : 'Lihat Paket'}
          </Link>
        </div>
      )}

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>{locale === 'en' ? 'Consolidated Total' : 'Total Saldo Terkonsolidasi'}</span>
            <Layers className="w-4 h-4 text-[#4D8DBA]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0C2340] dark:text-white mt-2">
            {formatCurrency(totalBalance)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {wallets.length} {locale === 'en' ? 'active wallets' : 'dompet aktif'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>{locale === 'en' ? 'Bank Accounts' : 'Rekening Bank'}</span>
            <Building className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0C2340] dark:text-white mt-2">
            {formatCurrency(totalBank)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {bankWallets.length} {locale === 'en' ? 'bank accounts' : 'rekening terdaftar'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>{locale === 'en' ? 'Cash & E-Wallets' : 'Dompet Tunai & E-Wallet'}</span>
            <Smartphone className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0C2340] dark:text-white mt-2">
            {formatCurrency(totalCashAndEwallet)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {cashAndEwallet.length} {locale === 'en' ? 'accounts' : 'akun digital'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-slate-400 text-xs font-semibold">
            <span>{locale === 'en' ? 'Team Shared Pool' : 'Kas Bersama Tim'}</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0C2340] dark:text-white mt-2">
            {formatCurrency(totalShared)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
            {sharedWallets.length} {locale === 'en' ? 'shared workspaces' : 'workspace bersama'}
          </div>
        </div>
      </div>

      {/* Inline Add Form */}
      {isAddingInline && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200 dark:border-[#4D8DBA]/30 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0C2340] dark:text-white">
              {locale === 'en' ? 'Create New Wallet' : 'Tambah Dompet Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs"
            >
              {locale === 'en' ? 'Cancel' : 'Batal'}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Wallet Name' : 'Nama Dompet'}
              </label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="e.g. BCA Prioritas, GoPay"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Category Type' : 'Jenis Dompet'}
              </label>
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value as Wallet['type'])}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
              >
                <option value="BANK">Bank Account</option>
                <option value="CASH">Cash (Tunai)</option>
                <option value="E_WALLET">E-Wallet</option>
                <option value="SAVINGS">Savings & Deposito</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Account Number (Optional)' : 'Nomor Rekening / Akun (Opsional)'}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="8820-192-381"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                {locale === 'en' ? 'Initial Balance' : 'Saldo Awal'}
              </label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-slate-800 text-xs sm:text-sm text-[#0C2340] dark:text-white focus:outline-none focus:border-[#4D8DBA]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4D8DBA] hover:bg-[#3B7B9E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {locale === 'en' ? 'Save Wallet' : 'Simpan Dompet'}
            </button>
          </div>
        </form>
      )}

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0D1926] border border-gray-200/80 dark:border-[#4D8DBA]/20 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF5FA] dark:bg-[#071018] border border-gray-100 dark:border-slate-800 flex items-center justify-center">
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0C2340] dark:text-white">
                      {wallet.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      {wallet.type}
                    </span>
                  </div>
                </div>

                {wallet.isShared && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    Shared
                  </span>
                )}
              </div>

              {wallet.accountNumber && (
                <div className="mt-4 text-xs font-mono text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-[#071018] px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-slate-800/80 w-fit">
                  {wallet.accountNumber}
                </div>
              )}

              <div className="mt-5">
                <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-400">
                  {locale === 'en' ? 'Current Balance' : 'Saldo Saat Ini'}
                </div>
                <div className="text-xl font-black text-[#0C2340] dark:text-white mt-1">
                  {formatCurrency(wallet.balance)}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                {locale === 'en' ? 'Active Account' : 'Akun Terverifikasi'}
              </span>

              {wallets.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteWallet(wallet.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title={locale === 'en' ? 'Delete wallet' : 'Hapus dompet'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
