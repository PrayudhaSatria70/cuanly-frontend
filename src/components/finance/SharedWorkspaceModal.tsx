'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Building2,
  Users,
  Plus,
  Mail,
  Shield,
  CheckCircle2,
  X,
  Wallet,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SharedWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharedWorkspaceModal: React.FC<SharedWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { workspaceMembers, addWorkspaceMember, wallets } = useSubscription();
  const { formatCurrency, locale, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'members' | 'admin'>('members');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const sharedWallets = wallets.filter((w) => w.isShared);
  const totalSharedBalance = sharedWallets.reduce((acc, curr) => acc + curr.balance, 0);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const res = addWorkspaceMember(newMemberName.trim(), newMemberEmail.trim());
    if (res.success) {
      setFeedback(t.modals.workspace.inviteSuccess);
      setNewMemberName('');
      setNewMemberEmail('');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback(res.error || t.modals.workspace.inviteFailed);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const auditLogs = [
    {
      id: 'log_1',
      user: locale === 'en' ? 'Team Owner' : 'Owner Tim',
      action:
        locale === 'en'
          ? 'Updated Shared Wallet Pool allocation balance'
          : 'Memperbarui alokasi saldo Shared Wallet Pool',
      time: locale === 'en' ? '10 minutes ago' : '10 menit yang lalu',
    },
    {
      id: 'log_2',
      user: 'Finance Manager',
      action:
        locale === 'en'
          ? 'Recorded operational expense Rp850,000'
          : 'Mencatat pengeluaran operasional Rp850.000',
      time: locale === 'en' ? '2 hours ago' : '2 jam yang lalu',
    },
    {
      id: 'log_3',
      user: locale === 'en' ? 'Cashier Staff' : 'Staff Kasir',
      action:
        locale === 'en'
          ? 'Added sales cash-in transaction Rp3,200,000'
          : 'Menambahkan mutasi kas masuk penjualan Rp3.200.000',
      time: locale === 'en' ? '5 hours ago' : '5 jam yang lalu',
    },
    {
      id: 'log_4',
      user: locale === 'en' ? 'Cuanly System' : 'Sistem Cuanly',
      action:
        locale === 'en'
          ? 'Automated shared wallet reconciliation completed'
          : 'Rekonsiliasi otomatis dompet bersama berhasil',
      time: locale === 'en' ? '1 day ago' : '1 hari yang lalu',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0D1926] border border-purple-400/60 dark:border-purple-400/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#0C2340] dark:text-white">
                  {t.modals.workspace.title}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t.modals.workspace.b2bBadge}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {t.modals.workspace.subtitle}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 px-5 pt-3 bg-gray-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'members'
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.modals.workspace.tabPool}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'border-purple-600 text-purple-700 dark:text-purple-300'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t.modals.workspace.tabAdmin}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {feedback && (
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 text-purple-800 dark:text-purple-200 text-xs font-bold">
              {feedback}
            </div>
          )}

          {activeTab === 'admin' ? (
            <div className="space-y-4">
              {/* Role Permissions Matrix */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-slate-900/60 border border-purple-200/60 dark:border-purple-900/40 space-y-2">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>{t.modals.workspace.permissionsTitle}</span>
                </span>
                <div className="text-[11px] text-gray-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                    <span className="font-bold text-amber-700 dark:text-amber-400">{t.modals.workspace.ownerRole}</span>
                    <span>{t.modals.workspace.ownerDesc}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-slate-800">
                    <span className="font-bold text-purple-700 dark:text-purple-400">{t.modals.workspace.adminRole}</span>
                    <span>{t.modals.workspace.adminDesc}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-gray-700 dark:text-slate-300">{t.modals.workspace.memberRole}</span>
                    <span>{t.modals.workspace.memberDesc}</span>
                  </div>
                </div>
              </div>

              {/* Team Audit Activity Log */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-600 dark:text-slate-300">
                  {t.modals.workspace.auditLogTitle}
                </span>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/40 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#0C2340] dark:text-white">{log.user}</span>
                        <p className="text-gray-500 dark:text-slate-400">{log.action}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>

          {/* Shared Wallet Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-[#1C4A6B] text-white space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-purple-300" />
                {t.modals.workspace.sharedPool}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20">
                Real-Time Sync
              </span>
            </div>
            <div className="text-2xl font-black num-tabular">
              {formatCurrency(totalSharedBalance > 0 ? totalSharedBalance : 14500000)}
            </div>
            <p className="text-[11px] text-purple-200/90">
              {t.modals.workspace.sharedPoolDesc}
            </p>
          </div>

          {/* Team Members List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {t.modals.workspace.membersTitle} ({workspaceMembers.length} / 5):
              </span>
              <span className="text-[10px] text-gray-400">
                {t.modals.workspace.quotaNote}
              </span>
            </div>

            <div className="space-y-2">
              {workspaceMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-2xl bg-gray-50/80 dark:bg-[#071018]/80 border border-gray-200/80 dark:border-[#4D8DBA]/25 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold text-xs flex items-center justify-center">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#0C2340] dark:text-white">
                          {member.name}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                            member.role === 'OWNER'
                              ? 'bg-amber-100 text-amber-800'
                              : member.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {member.role === 'OWNER' ? t.modals.workspace.roleOwner : member.role === 'ADMIN' ? t.modals.workspace.roleAdmin : t.modals.workspace.roleMember}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        {member.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.modals.workspace.statusActive}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite form if < 5 */}
          {workspaceMembers.length < 5 && (
            <form
              onSubmit={handleInvite}
              className="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-[#112233]/40 border border-purple-200/60 space-y-2.5"
            >
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300">
                {t.modals.workspace.inviteTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder={t.modals.workspace.namePlaceholder}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700"
                />
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder={t.modals.workspace.emailPlaceholder}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#071018] border border-gray-200 dark:border-gray-700"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-[#1C4A6B] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.modals.workspace.sendInviteBtn}</span>
              </button>
            </form>
          )}
          </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-gray-50/80 dark:bg-[#071018]/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-slate-200 font-bold text-xs hover:bg-gray-300 transition-colors cursor-pointer"
          >
            {t.modals.workspace.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};


