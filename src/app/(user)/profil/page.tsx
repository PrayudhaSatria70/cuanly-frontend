'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { GlassCard } from '@/components/common/GlassCard';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { EditAllowanceModal } from '@/components/finance/EditAllowanceModal';
import {
  User,
  Shield,
  Download,
  Bell,
  Globe,
  Coins,
  LogOut,
  Info,
  Check,
  Wallet,
  Sun,
  Moon,
  Settings,
  Edit3,
  Camera,
  Crown,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const { t, locale, activeCurrency, formatCurrency } = useLanguage();
  const { user, role, switchRole, logout, updateUserProfile } = useAuth();
  const { transactions, summary } = useFinance();
  const { isDark, toggleTheme } = useTheme();
  const { tier } = useSubscription();

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [isEditAllowanceOpen, setIsEditAllowanceOpen] = useState(false);
  const [avatarUploadStatus, setAvatarUploadStatus] = useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      setAvatarUploadStatus(locale === 'en' ? 'Max photo size is 2.5MB.' : 'Maksimal ukuran foto 2.5MB.');
      setTimeout(() => setAvatarUploadStatus(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUploadStatus(locale === 'en' ? 'Saving photo...' : 'Menyimpan foto...');
        const res = await updateUserProfile({ avatarUrl: dataUrl });
        if (res.success) {
          setAvatarUploadStatus(locale === 'en' ? 'Photo updated successfully!' : 'Foto profil berhasil diperbarui!');
        } else {
          setAvatarUploadStatus(res.error || (locale === 'en' ? 'Failed to upload photo.' : 'Gagal memperbarui foto.'));
        }
        setTimeout(() => setAvatarUploadStatus(null), 3500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleExportData = () => {
    // Generate CSV
    const headers = ['ID,Tanggal,Tipe,Kategori,Nominal,Catatan,MerchantStruk'];
    const rows = transactions.map((tx) =>
      `"${tx.id}","${tx.date}","${tx.type}","${tx.categoryName}","${tx.amount}","${tx.notes || ''}","${tx.receipt?.merchant || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cuanly_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
          {t.profile.title}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          {locale === 'en'
            ? 'Manage your account profile, language preferences, and Cuanly settings'
            : 'Kelola profil akun, preferensi bahasa, dan pengaturan Cuanly'}
        </p>
      </div>

      {/* User Info Card */}
      <GlassCard className="p-6 flex items-center gap-4">
        <div
          onClick={() => avatarInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 flex-shrink-0 bg-gray-100 group cursor-pointer shadow-inner"
          title={locale === 'en' ? 'Click to upload new profile picture' : 'Klik untuk unggah foto profil baru'}
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-cuanly-primaryDark text-white flex items-center justify-center font-bold text-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-semibold">
            <Camera className="w-4 h-4 mb-0.5" />
            <span>{locale === 'en' ? 'Upload' : 'Ubah'}</span>
          </div>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleDirectAvatarUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-cuanly-primaryDark truncate">
              {user?.name || 'Budi Santoso'}
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {role === 'ADMIN' ? t.profile.roleAdmin : t.profile.roleUser}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          {avatarUploadStatus && (
            <p className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded mt-1 inline-block">
              {avatarUploadStatus}
            </p>
          )}
          <p className="text-[10px] text-gray-400 mt-0.5">
            {t.profile.joined} {locale === 'en' ? 'January 15, 2026' : '15 Januari 2026'}
          </p>
        </div>

        <Link
          href="/settings?tab=account&edit=true"
          className="px-3.5 py-2 rounded-xl bg-[#4D8DBA]/10 hover:bg-[#4D8DBA]/20 text-[#4D8DBA] dark:text-[#8AD6D1] border border-[#4D8DBA]/30 text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-2xs"
          title={locale === 'en' ? 'Edit Profile & Avatar in Settings' : 'Edit Profil & Foto di Pengaturan'}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t.profile.editProfileBtn}</span>
        </Link>
      </GlassCard>

      {/* Quick Demo Role Switcher */}
      <GlassCard className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-cuanly-primaryDark">
              {locale === 'en' ? 'Access Mode & Demo Account' : 'Mode Akses & Akun Demo'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            {locale === 'en' ? 'Active:' : 'Aktif:'} {role}
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {locale === 'en'
            ? 'Instantly switch roles to test User features (personal financial ledger) or Admin features (user & partner management, verification, and complaints).'
            : 'Ganti peran secara instan untuk menguji fitur User (pencatatan keuangan personal) atau fitur Admin (kelola user, mitra, verifikasi, dan keluhan).'}
        </p>

        <div className="pt-1 flex gap-2">
          <button
            type="button"
            onClick={switchRole}
            className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all text-center"
          >
            {locale === 'en'
              ? `Switch to ${role === 'ADMIN' ? 'Demo User' : 'Demo Admin'}`
              : `Beralih ke ${role === 'ADMIN' ? 'Demo User' : 'Demo Admin'}`}
          </button>
          {role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="py-2 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              {locale === 'en' ? 'Open Backoffice →' : 'Buka Backoffice →'}
            </Link>
          )}
        </div>
      </GlassCard>

      {/* Full Settings Shortcut Card */}
      <GlassCard className="p-4 bg-gradient-to-r from-[#4D8DBA]/10 to-[#8AD6D1]/10 border-[#4D8DBA]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#4D8DBA] text-white shadow-xs flex-shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-cuanly-primaryDark dark:text-white">
              {t.settings.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t.settings.subtitle}
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="px-3.5 py-2 bg-[#4D8DBA] hover:bg-[#2E678E] text-white text-xs font-bold rounded-xl transition-all shadow-xs text-center flex-shrink-0"
        >
          {locale === 'en' ? 'Open Settings →' : 'Buka Pengaturan →'}
        </Link>
      </GlassCard>

      {/* Application Preferences */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {t.profile.appSettings}
        </h3>

        {/* Language */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#4D8DBA]/20">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-gray-500 dark:text-slate-400" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 block">
                {t.profile.language}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-400">
                {locale === 'en' ? 'Interface Language (English)' : 'Bahasa antarmuka (Indonesia)'}
              </span>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Display Theme */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#4D8DBA]/20">
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Moon className="w-4 h-4 text-[#4D8DBA]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 block">
                {t.common.theme || 'Display Theme'}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-400">
                {isDark ? (t.common.darkMode || 'Dark Mode') : (t.common.lightMode || 'Light Mode')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-[#0D1926] text-amber-300 border-[#4D8DBA]/40 hover:bg-[#112233]'
                : 'bg-white text-slate-700 border-[#AEC4D4]/60 hover:bg-[#AEC4D4]/15'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.common.lightMode || 'Light Mode'}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#4D8DBA]" />
                <span>{t.common.darkMode || 'Dark Mode'}</span>
              </>
            )}
          </button>
        </div>


        {/* Currency */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 block">
                {t.profile.currency}
              </span>
              <span className="text-[10px] text-gray-400">
                {activeCurrency.name} ({activeCurrency.symbol})
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
            {activeCurrency.code} ({activeCurrency.symbol})
          </span>
        </div>

        {/* Subscription Plan (My Plan) */}
        {role !== 'ADMIN' && (
          <Link
            href="/my-plan"
            className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 hover:opacity-85 transition-opacity"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-400">
                <Crown className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-200 block">
                  {t.myPlan.title}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-400">
                  {tier === 'FREE' && 'Cuanly Basic (Free)'}
                  {tier === 'SILVER' && 'Cuanly Silver Pro'}
                  {tier === 'GOLD' && 'Cuanly Gold Max'}
                  {tier === 'B2B' && 'Cuanly B2B Enterprise'}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span>{locale === 'en' ? 'Manage' : 'Kelola'}</span>
              <span>&rarr;</span>
            </span>
          </Link>
        )}

        {/* Monthly Allowance Limit */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 block">
                {t.home.monthlyBudgetUsage}
              </span>
              <span className="text-[10px] text-gray-400">
                {formatCurrency(summary.totalBudgetLimit)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditAllowanceOpen(true)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
          >
            {t.common.edit}
          </button>
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 block">
                {t.profile.notifications}
              </span>
              <span className="text-[10px] text-gray-400">
                {locale === 'en' ? 'Alert when category spending exceeds 80% limit' : 'Peringatan jika pengeluaran > 80% batas'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotifEnabled(!notifEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              notifEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
          </button>
        </div>

        {/* Export Data */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 block">
                {t.profile.exportData}
              </span>
              <span className="text-[10px] text-gray-400">
                {locale === 'en' ? 'Download all ledger transactions as a CSV file' : 'Unduh seluruh data mutasi ke file CSV'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">{locale === 'en' ? 'Saved' : 'Tersimpan'}</span>
              </>
            ) : (
              <span>{locale === 'en' ? 'Download CSV' : 'Unduh CSV'}</span>
            )}
          </button>
        </div>
      </GlassCard>

      {/* About Cuanly */}
      <GlassCard className="p-4 bg-gray-50 border border-gray-200/60 text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-cuanly-primaryDark">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>{t.profile.aboutCuanly}</span>
        </div>
        <p className="leading-relaxed text-[11px] text-gray-500">
          {t.profile.aboutDesc} {locale === 'en' ? 'Engineered using Next.js App Router, Tailwind CSS, and Lucide React.' : 'Dirancang menggunakan Next.js App Router, Tailwind CSS, dan Lucide React.'}
        </p>
      </GlassCard>

      {/* Logout Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={logout}
          className="w-full py-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.common.logout}</span>
        </button>
      </div>

      {/* Edit Allowance Modal */}
      <EditAllowanceModal
        isOpen={isEditAllowanceOpen}
        onClose={() => setIsEditAllowanceOpen(false)}
      />
    </div>
  );
}
