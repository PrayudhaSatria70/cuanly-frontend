'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  Building2,
  Users,
  Plus,
  Mail,
  Shield,
  CheckCircle2,
  Wallet,
  Sparkles,
  Lock,
  ArrowRight,
  UserCheck,
  Clock,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';

export default function WorkspacePage() {
  const { user } = useAuth();
  const {
    workspaceMembers,
    addWorkspaceMember,
    wallets,
    hasAccess,
    openUpgradeModal,
  } = useSubscription();
  const { formatCurrency, locale, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'members' | 'logs' | 'shared_pool'>('members');
  const [isInvitingInline, setIsInvitingInline] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isB2B = hasAccess('B2B');
  const hasTriggeredModalRef = useRef(false);

  // Auto-trigger upgrade modal on mount if account is Free plan / not B2B
  useEffect(() => {
    if (!hasTriggeredModalRef.current && user?.role !== 'ADMIN' && !hasAccess('B2B')) {
      hasTriggeredModalRef.current = true;
      openUpgradeModal(
        locale === 'en' ? 'Unlock Team Workspace' : 'Buka Fitur Team Workspace',
        'B2B',
        locale === 'en'
          ? 'Collaborate seamlessly with staff, accountants, and partners.'
          : 'Kolaborasi tanpa hambatan dengan staf, akuntan, dan mitra bisnis.',
        t.modals.upgrade.b2bBenefits
      );
    }
  }, [hasAccess, user?.role, openUpgradeModal, locale, t.modals.upgrade]);

  // Shared pool calculations
  const sharedWallets = wallets.filter((w) => w.isShared);
  const totalSharedBalance = sharedWallets.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      setFeedback({
        type: 'error',
        message: locale === 'en' ? 'Name and email are required' : 'Nama dan email wajib diisi',
      });
      return;
    }

    const res = addWorkspaceMember(newMemberName.trim(), newMemberEmail.trim());
    if (res.success) {
      setFeedback({
        type: 'success',
        message: locale === 'en' ? 'Invitation sent successfully' : 'Undangan berhasil dikirim ke anggota tim',
      });
      setNewMemberName('');
      setNewMemberEmail('');
      setIsInvitingInline(false);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || (locale === 'en' ? 'Failed to invite member' : 'Gagal mengundang anggota tim'),
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const auditLogs = [
    {
      id: 'log_1',
      user: locale === 'en' ? 'Super Admin (You)' : 'Super Admin (Anda)',
      role: 'OWNER',
      action:
        locale === 'en'
          ? 'Updated Shared Wallet Pool allocation balance'
          : 'Memperbarui alokasi saldo Shared Wallet Pool',
      time: locale === 'en' ? '12 minutes ago' : '12 menit yang lalu',
      type: 'FINANCE',
    },
    {
      id: 'log_2',
      user: 'Siti Rahmawati',
      role: 'FINANCE ADMIN',
      action:
        locale === 'en'
          ? 'Approved operational reimbursement Rp 1,750,000'
          : 'Menyetujui reimbursement operasional Rp 1.750.000',
      time: locale === 'en' ? '1 hour ago' : '1 jam yang lalu',
      type: 'APPROVAL',
    },
    {
      id: 'log_3',
      user: 'Budi Santoso',
      role: 'OPERATIONS',
      action:
        locale === 'en'
          ? 'Recorded supplier invoice payment Rp 4,500,000'
          : 'Mencatat pelunasan invoice supplier Rp 4.500.000',
      time: locale === 'en' ? '4 hours ago' : '4 jam yang lalu',
      type: 'EXPENSE',
    },
    {
      id: 'log_4',
      user: 'Dewi Lestari',
      role: 'TAX AUDITOR',
      action:
        locale === 'en'
          ? 'Exported monthly VAT & PPh final transaction report'
          : 'Mengekspor laporan rekapitulasi PPN & PPh Final bulanan',
      time: locale === 'en' ? 'Yesterday' : 'Kemarin',
      type: 'REPORT',
    },
    {
      id: 'log_5',
      user: locale === 'en' ? 'Cuanly Security Engine' : 'Engine Keamanan Cuanly',
      role: 'SYSTEM',
      action:
        locale === 'en'
          ? 'Automated shared wallet reconciliation completed with zero variance'
          : 'Rekonsiliasi otomatis dompet bersama selesai tanpa selisih',
      time: locale === 'en' ? '2 days ago' : '2 hari yang lalu',
      type: 'SYSTEM',
    },
  ];

  const filteredMembers = workspaceMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Feature Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 p-6 md:p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {locale === 'en' ? 'Enterprise B2B Feature' : 'Fitur Enterprise B2B'}
              <PremiumCrownBadge plan="B2B" size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === 'en' ? 'Team Workspace & Multi-User RBAC' : 'Team Workspace & Kolaborasi Multi-User'}
            </h1>
            <p className="text-purple-100/90 text-sm sm:text-base leading-relaxed">
              {locale === 'en'
                ? 'Manage financial access, assign roles, collaborate with staff and accountants, and maintain an immutable audit trail for team transparency.'
                : 'Kelola hak akses finansial, tetapkan peran anggota, kolaborasi dengan akuntan dan staf, serta pantau jejak audit transaksi secara transparan.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isB2B && (
              <button
                type="button"
                onClick={() => setIsInvitingInline((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 text-xs sm:text-sm font-bold shadow-lg shadow-purple-950/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {locale === 'en' ? 'Invite Member' : 'Undang Anggota'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Gate for Non-B2B */}
      {!isB2B && (
        <div className="rounded-2xl border-2 border-dashed border-purple-400/50 bg-purple-500/5 dark:bg-purple-950/20 p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
            <Lock className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {locale === 'en' ? 'Team Workspace is locked on your current plan' : 'Fitur Team Workspace terkunci pada paket Anda'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {locale === 'en'
                ? 'Upgrade to the B2B Plan to unlock unlimited multi-user team members, shared company wallets, role-based access control, and complete audit trail logs.'
                : 'Tingkatkan ke Paket B2B untuk membuka anggota tim tanpa batas, kas bersama kantor, kontrol peran (RBAC), serta log jejak audit menyeluruh.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              openUpgradeModal(
                locale === 'en' ? 'Unlock Team Workspace' : 'Buka Fitur Team Workspace',
                'B2B',
                locale === 'en'
                  ? 'Collaborate seamlessly with staff, accountants, and partners.'
                  : 'Kolaborasi tanpa hambatan dengan staf, akuntan, dan mitra bisnis.',
                t.modals.upgrade.b2bBenefits
              )
            }
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {locale === 'en' ? 'Upgrade to B2B Plan' : 'Upgrade ke Paket B2B'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Team Members' : 'Total Anggota'}
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {workspaceMembers.length}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {locale === 'en' ? 'Active accounts' : 'Akun terdaftar'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Shared Wallet Pool' : 'Kas Bersama Pool'}
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(totalSharedBalance)}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              ({sharedWallets.length} {locale === 'en' ? 'wallets' : 'dompet'})
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'RBAC Roles' : 'Struktur Hak Akses'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              4 Roles
            </span>
            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Owner, Admin, Member, Auditor
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'en' ? 'Security & Audit' : 'Keamanan & Audit'}
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              100%
            </span>
            <span className="ml-2 text-xs text-slate-400 font-medium">
              {locale === 'en' ? 'Immutable log' : 'Log terlindungi'}
            </span>
          </div>
        </div>
      </div>

      {/* Inline Form Add Member */}
      {isInvitingInline && isB2B && (
        <form
          onSubmit={handleInviteSubmit}
          className="rounded-3xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 p-6 space-y-4 shadow-md transition-all animate-in slide-in-from-top-4 duration-150"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              {locale === 'en' ? 'Invite New Team Member' : 'Undang Rekan Kerja Baru'}
            </h3>
            <button
              type="button"
              onClick={() => setIsInvitingInline(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {locale === 'en' ? 'Cancel' : 'Batal'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Full Name' : 'Nama Lengkap'}
              </label>
              <input
                type="text"
                required
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder={locale === 'en' ? 'e.g. Siti Rahmawati' : 'Contoh: Siti Rahmawati'}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Email Address' : 'Alamat Email Perusahaan'}
              </label>
              <input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="siti.finance@cuanly.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {locale === 'en' ? 'Access Role' : 'Peran Akses'}
              </label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ADMIN">Finance Admin (Full Edit & Approval)</option>
                <option value="MEMBER">Team Member (Record Transactions)</option>
                <option value="VIEWER">Auditor / Viewer (Read Only)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {locale === 'en' ? 'Send Invitation' : 'Kirim Undangan Sekarang'}
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
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'en' ? 'Members & Access' : 'Anggota & Hak Akses'} ({workspaceMembers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shared_pool')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'shared_pool'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'en' ? 'Shared Wallet Pool' : 'Kas Bersama Pool'} ({sharedWallets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'en' ? 'Audit Trail' : 'Log Audit Aktivitas'}
          </button>
        </div>

        {activeTab === 'members' && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'en' ? 'Search members...' : 'Cari anggota...'}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-36"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Members Table */}
      {activeTab === 'members' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {locale === 'en' ? 'Registered Team Members' : 'Daftar Anggota Tim Terdaftar'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {locale === 'en'
                  ? 'All members currently authorized to interact with workspace resources.'
                  : 'Seluruh pengguna yang memiliki otorisasi pada workspace dan pembukuan tim.'}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-purple-500/20">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {member.name}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          member.role === 'OWNER'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/40'
                            : member.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300/40'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/40'
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {member.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="block text-[11px] font-semibold text-slate-400">
                      {locale === 'en' ? 'Joint Wallet Access' : 'Akses Kas Bersama'}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center sm:justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {locale === 'en' ? 'Authorized' : 'Terotorisasi'}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-xl ${
                      member.status === 'ACTIVE'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Shared Pool */}
      {activeTab === 'shared_pool' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sharedWallets.length === 0 ? (
              <div className="col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1926] p-8 text-center space-y-2">
                <Wallet className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                  {locale === 'en' ? 'No shared wallets found' : 'Belum ada dompet kas bersama'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {locale === 'en'
                    ? 'Create a wallet and toggle "Shared with Workspace" to allow team expenses.'
                    : 'Buat dompet baru dan aktifkan "Bagikan ke Workspace" untuk mencatat operasional tim.'}
                </p>
              </div>
            ) : (
              sharedWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="rounded-3xl border border-purple-200/80 dark:border-purple-800/60 bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-[#0D1926] dark:via-[#0D1926] dark:to-purple-950/20 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-300">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {wallet.name}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {wallet.accountNumber || (locale === 'en' ? 'Internal Pool' : 'Kas Internal Pool')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/40">
                      SHARED POOL
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {locale === 'en' ? 'Available Balance' : 'Saldo Kas Tersedia'}
                    </span>
                    <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                      {formatCurrency(Number(wallet.balance) || 0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0D1926] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {locale === 'en' ? 'Immutable Audit Logs' : 'Log Jejak Audit Terverifikasi'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {locale === 'en'
                  ? 'Real-time timeline of multi-user transactions, approval triggers, and settings updates.'
                  : 'Kronologi real-time mutasi tim, persetujuan reimbursement, dan perubahan konfigurasi.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              {locale === 'en' ? 'Cryptographically Sealed' : 'Tervalidasi Sistem'}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {log.user}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {log.role}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{log.time}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
