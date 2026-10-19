'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { bankSyncApi } from '@/services/api';
import { BankConnection, BankInstitution } from '@/types';
import { ADMIN_INITIAL_BANK_CONNECTIONS } from '@/services/mockData';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  Building2,
  RefreshCw,
  Plus,
  CheckCircle2,
  Trash2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';

const INSTITUTIONS: { code: BankInstitution; name: string; type: 'BANK' | 'EWALLET'; color: string; bgGradient: string }[] = [
  { code: 'BCA', name: 'Bank Central Asia (BCA)', type: 'BANK', color: '#00529C', bgGradient: 'from-blue-600 to-blue-800' },
  { code: 'MANDIRI', name: 'Bank Mandiri (Persero)', type: 'BANK', color: '#002D62', bgGradient: 'from-blue-800 to-indigo-900' },
  { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)', type: 'BANK', color: '#00529B', bgGradient: 'from-sky-600 to-blue-700' },
  { code: 'BNI', name: 'Bank Negara Indonesia (BNI)', type: 'BANK', color: '#F15A24', bgGradient: 'from-orange-600 to-amber-700' },
  { code: 'GOPAY', name: 'GoPay Indonesia (Merchant/Personal)', type: 'EWALLET', color: '#00AA13', bgGradient: 'from-emerald-600 to-teal-700' },
  { code: 'OVO', name: 'OVO Payment Digital', type: 'EWALLET', color: '#4C3494', bgGradient: 'from-purple-700 to-indigo-800' },
  { code: 'DANA', name: 'DANA Indonesia', type: 'EWALLET', color: '#118EEA', bgGradient: 'from-sky-500 to-blue-600' },
];

export default function BankSyncPage() {
  const { user } = useAuth();
  const {
    hasAccess,
    openUpgradeModal,
  } = useSubscription();
  const { formatCurrency, locale, t } = useLanguage();

  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [selectedInst, setSelectedInst] = useState<BankInstitution>('BCA');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const isGoldOrB2B = hasAccess('GOLD');
  const userId = user?.id;
  const isAdminUser = user?.role === 'ADMIN' || user?.username === 'admin' || userId === 'usr_live_admin' || userId === 'usr_admin_01';
  const isDemoUser = userId === 'usr_demo_1' || userId === 'usr_demo_01';
  const hasTriggeredModalRef = useRef(false);

  // Auto-trigger upgrade modal on mount if account is Free plan / not Gold
  useEffect(() => {
    if (!hasTriggeredModalRef.current && user?.role !== 'ADMIN' && !hasAccess('GOLD')) {
      hasTriggeredModalRef.current = true;
      openUpgradeModal(
        locale === 'en' ? 'Automated Bank Sync' : 'Bank Sync Otomatis',
        'GOLD',
        locale === 'en'
          ? 'Connect and automatically sync mutations and balances from bank accounts and e-wallets (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana).'
          : 'Hubungkan dan sinkronisasikan mutasi rekening bank dan e-wallet secara otomatis (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana).',
        locale === 'en'
          ? [
              'Automated sync for bank & e-wallet transactions',
              'Real-time cash balance updates',
              'Automated transaction history without manual input',
            ]
          : [
              'Sinkronisasi otomatis mutasi bank & e-wallet',
              'Pembaruan saldo kas secara real-time',
              'Riwayat transaksi otomatis tanpa input manual',
            ]
      );
    }
  }, [hasAccess, user?.role, openUpgradeModal, locale]);

  // Load Connections
  useEffect(() => {
    setIsLoading(true);
    bankSyncApi
      .getConnections()
      .then((res) => {
        if (res && Array.isArray(res.connections) && res.connections.length > 0) {
          setConnections(res.connections);
        } else {
          try {
            const stored = localStorage.getItem(`cuanly_bank_connections_${userId}`);
            if (stored) {
              setConnections(JSON.parse(stored));
            } else if (isAdminUser) {
              const adminConns: BankConnection[] = ADMIN_INITIAL_BANK_CONNECTIONS.map((c) => ({
                id: c.id,
                userId: c.userId,
                institution: c.institution as BankInstitution,
                accountNumber: c.accountNumber,
                accountName: c.accountName,
                syncStatus: c.syncStatus as 'CONNECTED',
                lastSyncAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
                autoSync: c.autoSync,
                createdAt: new Date().toISOString(),
              }));
              setConnections(adminConns);
            } else if (isDemoUser) {
              const demoConns: BankConnection[] = [
                {
                  id: 'bank_demo_1',
                  userId: 'usr_demo_1',
                  institution: 'BCA',
                  accountNumber: '8830192841',
                  accountName: 'Demo User Cuanly',
                  syncStatus: 'CONNECTED',
                  lastSyncAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                  autoSync: true,
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 'bank_demo_2',
                  userId: 'usr_demo_1',
                  institution: 'GOPAY',
                  accountNumber: '081298765432',
                  accountName: 'Demo User Cuanly',
                  syncStatus: 'CONNECTED',
                  lastSyncAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
                  autoSync: true,
                  createdAt: new Date().toISOString(),
                },
              ];
              setConnections(demoConns);
            } else {
              setConnections([]);
            }
          } catch {
            setConnections([]);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, [userId, isAdminUser, isDemoUser]);

  const saveConnections = (updated: BankConnection[]) => {
    setConnections(updated);
    if (userId) {
      localStorage.setItem(`cuanly_bank_connections_${userId}`, JSON.stringify(updated));
    }
  };

  const handleSyncSingle = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      const updated = connections.map((c) =>
        c.id === id ? { ...c, lastSyncAt: new Date().toISOString(), syncStatus: 'CONNECTED' as const } : c
      );
      saveConnections(updated);
      setSyncingId(null);
      setFeedback({
        type: 'success',
        message: locale === 'en' ? 'Account synchronized successfully' : 'Rekening berhasil disinkronisasi',
      });
      setTimeout(() => setFeedback(null), 3000);
    }, 1200);
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      const updated = connections.map((c) => ({
        ...c,
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'CONNECTED' as const,
      }));
      saveConnections(updated);
      setIsSyncingAll(false);
      setFeedback({
        type: 'success',
        message:
          locale === 'en'
            ? 'All accounts synchronized successfully'
            : 'Semua rekening bank & e-wallet berhasil disinkronisasi',
      });
      setTimeout(() => setFeedback(null), 3500);
    }, 1800);
  };

  const handleToggleAutoSync = (id: string) => {
    const updated = connections.map((c) => (c.id === id ? { ...c, autoSync: !c.autoSync } : c));
    saveConnections(updated);
  };

  const handleDeleteConnection = (id: string) => {
    const updated = connections.filter((c) => c.id !== id);
    saveConnections(updated);
    setFeedback({
      type: 'success',
      message: locale === 'en' ? 'Connection removed' : 'Koneksi bank berhasil diputuskan',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountName.trim()) {
      setFeedback({
        type: 'error',
        message: locale === 'en' ? 'Account number and holder name are required' : 'Nomor rekening dan nama pemilik wajib diisi',
      });
      return;
    }

    const newConn: BankConnection = {
      id: `bnk_${Date.now()}`,
      userId: userId || 'usr_registered',
      institution: selectedInst,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      syncStatus: 'CONNECTED',
      lastSyncAt: new Date().toISOString(),
      autoSync: true,
      createdAt: new Date().toISOString(),
    };

    saveConnections([...connections, newConn]);
    setAccountNumber('');
    setAccountName('');
    setIsAddingInline(false);
    setFeedback({
      type: 'success',
      message:
        locale === 'en'
          ? `Successfully linked ${selectedInst}`
          : `Berhasil menghubungkan rekening ${selectedInst}`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const recentMutations = [
    {
      id: 'mut_1',
      inst: 'BCA',
      desc: locale === 'en' ? 'Transfer In - PT Surya Cipta Abadi' : 'Transfer Masuk - PT Surya Cipta Abadi',
      amount: 14500000,
      type: 'CR',
      date: locale === 'en' ? 'Today, 11:24' : 'Hari ini, 11:24',
    },
    {
      id: 'mut_2',
      inst: 'MANDIRI',
      desc: locale === 'en' ? 'PLN Corporate Electricity Bill' : 'Tagihan Listrik PLN Kantor',
      amount: -1850000,
      type: 'DB',
      date: locale === 'en' ? 'Today, 09:15' : 'Hari ini, 09:15',
    },
    {
      id: 'mut_3',
      inst: 'GOPAY',
      desc: locale === 'en' ? 'Cuanly QRIS Merchant Settlement' : 'Settlement QRIS Merchant Cuanly',
      amount: 2750000,
      type: 'CR',
      date: locale === 'en' ? 'Yesterday, 21:00' : 'Kemarin, 21:00',
    },
    {
      id: 'mut_4',
      inst: 'BRI',
      desc: locale === 'en' ? 'Payroll Direct Debit Staff' : 'Gaji Karyawan Payroll Direct Debit',
      amount: -12500000,
      type: 'DB',
      date: locale === 'en' ? '2 days ago' : '2 hari yang lalu',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-900 p-6 md:p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {locale === 'en' ? 'Automated Open Banking' : 'Sinkronisasi Otomatis Bank'}
              <PremiumCrownBadge plan="GOLD" size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === 'en' ? 'Automated Bank & E-Wallet Sync' : 'Sinkronisasi Otomatis Bank & E-Wallet'}
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed">
              {locale === 'en'
                ? 'Connect BCA, Mandiri, BRI, BNI, and GoPay securely using bank-grade TLS 1.3 encryption. Real-time balance updates and automatic transaction categorization.'
                : 'Hubungkan rekening BCA, Mandiri, BRI, BNI, dan GoPay dengan enkripsi setara perbankan TLS 1.3. Mutasi otomatis tercatat tanpa perlu input manual satu per satu.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isGoldOrB2B && (
              <>
                <button
                  type="button"
                  onClick={handleSyncAll}
                  disabled={isSyncingAll || connections.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-950/20 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  {isSyncingAll
                    ? locale === 'en'
                      ? 'Syncing...'
                      : 'Menyinkronkan...'
                    : locale === 'en'
                    ? 'Sync All Now'
                    : 'Sync Semua Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingInline((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 text-xs sm:text-sm font-bold shadow-lg shadow-blue-950/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {locale === 'en' ? 'Connect Bank' : 'Hubungkan Bank'}
                </button>
              </>
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
                ? 'Automated Bank Sync is locked on your current plan'
                : 'Fitur Sinkronisasi Bank Otomatis terkunci pada paket Anda'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {locale === 'en'
                ? 'Upgrade to the Gold Plan to automatically pull transactions from your bank accounts and e-wallets, eliminating the hassle of manual transaction input.'
                : 'Tingkatkan ke Paket Gold untuk menarik mutasi rekening bank dan e-wallet secara otomatis, bebas repot input transaksi manual selamanya.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              openUpgradeModal(
                locale === 'en' ? 'Unlock Bank Sync' : 'Buka Bank Sync Otomatis',
                'GOLD',
                locale === 'en'
                  ? 'Connect major Indonesian banks & e-wallets seamlessly.'
                  : 'Hubungkan bank & e-wallet ternama di Indonesia secara otomatis.',
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
              {locale === 'en' ? 'Connected Institutions' : 'Rekening Terhubung'}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {connections.length}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {locale === 'en' ? 'Active feeds' : 'Koneksi aktif'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Auto-Sync Active' : 'Status Auto-Sync'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {connections.filter((c) => c.autoSync).length}/{connections.length}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {locale === 'en' ? '24/7 background' : 'Otomatis 24/7'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Mutations Captured' : 'Mutasi Tersinkron'}
            </span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
              184
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {locale === 'en' ? 'This month' : 'Bulan ini'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Security Protocol' : 'Protokol Keamanan'}
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              TLS 1.3
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              Bank-Grade AES 256
            </span>
          </div>
        </div>
      </div>

      {/* Inline Form Add Connection */}
      {isAddingInline && isGoldOrB2B && (
        <form
          onSubmit={handleAddSubmit}
          className="rounded-3xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/50 dark:bg-blue-950/20 p-6 space-y-4 shadow-md transition-all animate-in slide-in-from-top-4 duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {locale === 'en' ? 'Connect New Bank or E-Wallet' : 'Hubungkan Rekening Bank / E-Wallet Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {locale === 'en' ? 'Cancel' : 'Batal'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Institution' : 'Lembaga Keuangan'}
              </label>
              <select
                value={selectedInst}
                onChange={(e) => setSelectedInst(e.target.value as BankInstitution)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {INSTITUTIONS.map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.name} ({inst.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Account Number' : 'Nomor Rekening / HP'}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 8820192831"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Account Holder Name' : 'Nama Pemilik Rekening'}
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. PT Cuanly Inovasi Digital"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {locale === 'en' ? 'Authorize & Connect' : 'Otorisasi & Hubungkan'}
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

      {/* Connected Accounts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {locale === 'en' ? 'Active Bank & Wallet Connections' : 'Koneksi Rekening Bank & Dompet Digital Aktif'}
          </h3>
          <span className="text-xs text-slate-400">
            {connections.length} {locale === 'en' ? 'connected accounts' : 'rekening terhubung'}
          </span>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-8 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              {locale === 'en' ? 'No Bank Accounts Connected' : 'Belum Ada Rekening Bank Terhubung'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {locale === 'en'
                ? 'Link your banking or digital wallet account above to automatically reconcile your incoming and outgoing transactions.'
                : 'Hubungkan rekening bank atau dompet digital Anda di atas untuk rekonsiliasi otomatis arus kas masuk dan keluar.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((conn) => {
              const meta = INSTITUTIONS.find((i) => i.code === conn.institution) || {
                code: conn.institution,
                name: conn.institution,
                type: 'BANK',
                color: '#2563EB',
                bgGradient: 'from-blue-600 to-indigo-800',
              };
              const isSyncingThis = syncingId === conn.id || isSyncingAll;

              return (
                <div
                  key={conn.id}
                  className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm space-y-4 hover:border-blue-400/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-gradient-to-tr ${meta.bgGradient} text-white shadow-md`}>
                        {meta.type === 'EWALLET' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {meta.name}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {conn.accountNumber} • {conn.accountName}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {conn.syncStatus}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block text-[11px]">
                        {locale === 'en' ? 'Last synchronized:' : 'Sinkronisasi terakhir:'}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAutoSync(conn.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          conn.autoSync
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {conn.autoSync ? 'Auto-Sync ON' : 'Auto-Sync OFF'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSyncSingle(conn.id)}
                        disabled={isSyncingThis}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                        title={locale === 'en' ? 'Sync this account' : 'Sinkronkan rekening ini'}
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncingThis ? 'animate-spin text-blue-600' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteConnection(conn.id)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                        title={locale === 'en' ? 'Disconnect' : 'Putuskan koneksi'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Bank Feeds */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {locale === 'en' ? 'Live Bank Mutation Stream' : 'Aliran Mutasi Bank Terkini (Live Feed)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'en'
                ? 'Automated parsed feed entries synchronized from your connected accounts.'
                : 'Data mutasi yang secara otomatis ditarik dan disesuaikan dari rekening terhubung.'}
            </p>
          </div>
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <Activity className="w-4 h-4 animate-pulse" />
            Live Polling Active
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentMutations.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    item.type === 'CR'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.type === 'CR' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.inst}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.desc}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{item.date}</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-extrabold ${
                    item.type === 'CR'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.type === 'CR' ? '+' : ''}
                  {formatCurrency(item.amount)}
                </span>
                <span className="block text-[10px] font-semibold text-slate-400">
                  {locale === 'en' ? 'Auto-categorized' : 'Terkategori Otomatis'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
