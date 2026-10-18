'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { CuanlyLogo } from '@/components/common/CuanlyLogo';
import {
  Bell,
  Camera,
  Shield,
  Sun,
  Moon,
  User,
  Globe,
  LogOut,
  Settings,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const TopHeader: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, openDrawer } = useNotification();
  const pathname = usePathname();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile shortcut modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  // Determine current section title based on route
  const getPageTitle = () => {
    if (pathname.includes('/transaksi/scan')) return t.receipt.scannerTitle;
    if (pathname.includes('/transaksi/tambah')) return t.transactions.addTitle;
    if (pathname.includes('/transaksi')) return t.transactions.title;
    if (pathname.includes('/budget')) return t.budget.title;
    if (pathname.includes('/profil')) return t.profile.title;
    if (pathname.includes('/settings')) return t.settings?.title || 'Settings';
    if (pathname.includes('/admin')) return t.nav.adminBackoffice || 'Admin Backoffice';
    return t.appName;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-gray-200/80 dark:border-[#4D8DBA]/20">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo using user's official logo design */}
        <div className="flex items-center gap-3">
          <Link href="/beranda" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <CuanlyLogo size="md" variant="full" />
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

          {/* Admin Mode Indicator (Only visible when logged in as ADMIN) */}
          {role === 'ADMIN' && (
            <button
              type="button"
              onClick={switchRole}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 transition-all shadow-2xs cursor-pointer"
              title="Role: ADMIN. Klik untuk beralih ke User."
            >
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden md:inline">Admin Mode</span>
              <span className="md:hidden">Adm</span>
            </button>
          )}

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

          {/* User Profile Avatar with Shortcut Dropdown Modal */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center gap-1.5 p-0.5 rounded-full border transition-all cursor-pointer ${
                isProfileMenuOpen
                  ? 'border-[#4D8DBA] ring-2 ring-[#4D8DBA]/35 shadow-sm'
                  : 'border-gray-300 dark:border-[#4D8DBA]/50 hover:ring-2 hover:ring-[#4D8DBA]/30'
              }`}
              title="Profile & Quick Menu"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#4D8DBA]/15 text-[#1C4A6B] dark:text-[#8AD6D1] flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </button>

            {/* Profile Shortcut Modal / Dropdown Below Avatar */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 bg-white/95 dark:bg-[#0B1520]/95 backdrop-blur-xl border border-gray-200/90 dark:border-[#4D8DBA]/30 shadow-2xl rounded-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* 1. User Identity Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-[#4D8DBA]/20">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4D8DBA] flex-shrink-0">
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4D8DBA]/20 text-[#1C4A6B] dark:text-[#8AD6D1] flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user?.name || 'Cuanly User'}
                      </h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#8AD6D1]/30 text-[#1C4A6B] dark:text-[#8AD6D1]">
                        {role}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                      {user?.email || 'user@cuanly.com'}
                    </p>
                  </div>
                </div>

                {/* 2. Shortcuts Menu List */}
                <div className="space-y-1">
                  {/* Shortcut A: Edit Profile */}
                  <Link
                    href="/settings?tab=account"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-[#AEC4D4]/15 dark:hover:bg-[#4D8DBA]/15 hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#071018] group-hover:bg-[#4D8DBA]/15 text-gray-500 group-hover:text-[#4D8DBA] dark:group-hover:text-[#8AD6D1] transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">
                          {locale === 'en' ? 'Edit Profile' : 'Edit Profil'}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {locale === 'en' ? 'Personal information & credentials' : 'Data akun & preferensi'}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold">
                      &rarr;
                    </span>
                  </Link>

                  {/* Shortcut B: Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-[#AEC4D4]/15 dark:hover:bg-[#4D8DBA]/15 hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#071018] group-hover:bg-[#4D8DBA]/15 text-gray-500 group-hover:text-[#4D8DBA] dark:group-hover:text-[#8AD6D1] transition-colors">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block font-bold">
                          {t.settings?.title || (locale === 'en' ? 'Settings' : 'Pengaturan')}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {locale === 'en' ? 'Features, currency, security' : 'Fitur, mata uang, keamanan'}
                        </span>
                      </div>
                    </div>
                    <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform text-xs font-bold">
                      &rarr;
                    </span>
                  </Link>
                </div>

                {/* 3. Shortcut C: Bahasa (Language Switcher Inside Modal) */}
                <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#071018]/80 border border-gray-100 dark:border-[#4D8DBA]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
                      <span>{locale === 'en' ? 'Language' : 'Bahasa'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase">
                      {locale === 'en' ? 'English' : 'Indonesia'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLocale('en')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        locale === 'en'
                          ? 'bg-[#4D8DBA] text-white shadow-xs'
                          : 'bg-white dark:bg-[#0B1520] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>English</span>
                      {locale === 'en' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocale('id')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        locale === 'id'
                          ? 'bg-[#4D8DBA] text-white shadow-xs'
                          : 'bg-white dark:bg-[#0B1520] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>Indonesia</span>
                      {locale === 'id' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </div>
                </div>

                {/* 4. Shortcut D: Logout */}
                <div className="pt-2 border-t border-gray-100 dark:border-[#4D8DBA]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t.common.logout}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
