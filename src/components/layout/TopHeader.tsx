'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { CuanlyLogo } from '@/components/common/CuanlyLogo';
import { Bell, Camera, Shield, User as UserIcon, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const TopHeader: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, openDrawer } = useNotification();
  const pathname = usePathname();

  // Determine current section title based on route
  const getPageTitle = () => {
    if (pathname.includes('/transaksi/scan')) return t.receipt.scannerTitle;
    if (pathname.includes('/transaksi/tambah')) return t.transactions.addTitle;
    if (pathname.includes('/transaksi')) return t.transactions.title;
    if (pathname.includes('/budget')) return t.budget.title;
    if (pathname.includes('/profil')) return t.profile.title;
    if (pathname.includes('/admin')) return t.nav.adminBackoffice || 'Admin Backoffice';
    return t.appName;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-gray-200/80 dark:border-[#4D8DBA]/20">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo using user's official logo design */}
        <div className="flex items-center gap-3">
          <Link href="/beranda" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <CuanlyLogo size="md" variant="full" theme={isDark ? 'light' : 'dark'} />
          </Link>

          {/* Current Page Breadcrumb / Title on Mobile */}
          <div className="sm:hidden pl-2 border-l border-gray-200 dark:border-[#4D8DBA]/30">
            <h1 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle Button: Situated directly to the left of Smart Receipt */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center justify-center p-2 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-[#0D1926] text-amber-300 border-[#4D8DBA]/40 hover:bg-[#112233] hover:text-amber-200 shadow-sm'
                : 'bg-white text-slate-700 border-[#AEC4D4]/60 hover:bg-[#AEC4D4]/15 hover:text-[#1C4A6B] shadow-xs'
            }`}
            title={isDark ? (t.common.lightMode || 'Mode Terang') : (t.common.darkMode || 'Mode Gelap')}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#4D8DBA] transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Quick Scan Smart Receipt Button */}
          <Link
            href="/transaksi/scan"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8AD6D1]/15 hover:bg-[#8AD6D1]/25 text-[#2E678E] dark:text-[#8AD6D1] border border-[#8AD6D1]/50 dark:border-[#8AD6D1]/40 rounded-xl text-xs font-semibold transition-all shadow-xs"
            title={t.receipt.scannerTitle}
          >
            <Camera className="w-3.5 h-3.5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
            <span className="hidden sm:inline">{t.receipt.scannerTitle}</span>
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher compact />

          {/* Role Switcher Button (Demo feature) */}
          <button
            type="button"
            onClick={switchRole}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              role === 'ADMIN'
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
                : 'bg-[#AEC4D4]/20 text-[#1C4A6B] border-[#AEC4D4]/50 hover:bg-[#AEC4D4]/30 dark:bg-[#4D8DBA]/20 dark:text-[#8AD6D1] dark:border-[#4D8DBA]/40'
            }`}
            title={`Role: ${role}. Click to switch.`}
          >
            {role === 'ADMIN' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden md:inline">Admin Mode</span>
                <span className="md:hidden">Adm</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
                <span className="hidden md:inline">User Mode</span>
                <span className="md:hidden">User</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={openDrawer}
            className="relative p-2 text-gray-600 dark:text-slate-200 hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] rounded-xl hover:bg-[#AEC4D4]/20 transition-colors"
            aria-label="Buka Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <Link
            href="/profil"
            className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-[#4D8DBA]/50 hover:ring-2 hover:ring-[#4D8DBA]/30 transition-all flex-shrink-0"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-[#112233] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-slate-300">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
