'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/common/GlassCard';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { CuanlyLogo } from '@/components/common/CuanlyLogo';
import {
  Shield,
  User,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { t, locale } = useLanguage();
  const { isDark, toggleTheme } = useTheme();


  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSessionTimeout, setIsSessionTimeout] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTimeoutQuery = window.location.search.includes('reason=timeout');
      const isTimeoutStorage = sessionStorage.getItem('cuanly_session_timed_out') === 'true';
      if (isTimeoutQuery || isTimeoutStorage) {
        setIsSessionTimeout(true);
        sessionStorage.removeItem('cuanly_session_timed_out');
      }
    }
  }, []);

  // Instant direct demo login
  const handleDirectDemoLogin = (role: 'USER' | 'ADMIN') => {
    loginAsDemo(role);
    if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/beranda');
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await login(identifier, pin);
      if (result.success) {
        if (identifier.toLowerCase().includes('admin')) {
          router.push('/admin/dashboard');
        } else {
          router.push('/beranda');
        }
      } else {
        setErrorMsg(t.auth.loginError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 space-y-6">
      {/* Top Bar with Brand Logo, Dark Mode Toggle & Language Switcher */}
      <div className="flex items-center justify-between">
        <Link href="/login" className="hover:opacity-90 transition-opacity">
          <CuanlyLogo size="sm" variant="full" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark
                ? 'bg-[#0D1926] text-amber-300 border-[#4D8DBA]/40 hover:bg-[#112233]'
                : 'bg-white text-slate-700 border-[#AEC4D4]/60 hover:bg-[#AEC4D4]/15'
            }`}
            title={isDark ? (t.common.lightMode || 'Mode Terang') : (t.common.darkMode || 'Mode Gelap')}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#4D8DBA]" />
            )}
          </button>
          <LanguageSwitcher compact />
        </div>
      </div>

      {/* Hero Welcome with Official Logo */}
      <div className="text-center space-y-2 pt-2">
        <div className="flex justify-center pb-1">
          <CuanlyLogo size="xl" variant="icon" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0C2340] dark:text-white tracking-tight">
          {t.auth.loginTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          {t.auth.loginSubtitle}
        </p>
      </div>


      {/* Main Login Card with Gradient and Frosted Glass Effect */}
      <GlassCard className="p-6 sm:p-7 space-y-5 shadow-2xl bg-gradient-to-b from-white/95 via-white/85 to-[#F4F8FA]/90 dark:from-[#0D1926]/95 dark:via-[#0B1520]/90 dark:to-[#071018]/95 backdrop-blur-2xl border border-white/80 dark:border-[#4D8DBA]/30 rounded-3xl relative overflow-hidden">
        {/* Subtle decorative gradient ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#8AD6D1]/20 to-[#4D8DBA]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#4D8DBA]/15 to-[#8AD6D1]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Session Inactivity Timeout Alert with Gradient Glass */}
        {isSessionTimeout && (
          <div className="relative z-10 p-3.5 bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-rose-500/5 dark:from-rose-950/60 dark:via-rose-900/40 dark:to-transparent backdrop-blur-md border border-rose-500/40 dark:border-rose-700/60 text-rose-900 dark:text-rose-200 rounded-2xl flex items-start gap-3 shadow-xs">
            <div className="p-2 bg-gradient-to-br from-rose-100 to-rose-200/80 dark:from-rose-900/80 dark:to-rose-950 rounded-xl text-rose-700 dark:text-rose-300 flex-shrink-0 mt-0.5 shadow-2xs border border-rose-300/40 dark:border-rose-700/50">
              <Clock className="w-4 h-4 text-rose-600 dark:text-rose-300" />
            </div>
            <div className="space-y-0.5 text-xs">
              <h4 className="font-bold text-rose-950 dark:text-rose-100">
                {t.auth.sessionTimeoutTitle}
              </h4>
              <p className="text-rose-800 dark:text-rose-200/90 leading-relaxed text-[11px] sm:text-xs">
                {t.auth.sessionTimeoutDesc}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4 relative z-10">
          {errorMsg && (
            <div className="p-3 bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent backdrop-blur-md border border-rose-500/40 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs">
              <KeyRound className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username or Email input with frosted glass effect */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
              {t.auth.identifierLabel}
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-[#4D8DBA] group-focus-within:text-[#2E678E] dark:text-[#8AD6D1] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.auth.identifierPlaceholder}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-white/90 to-[#F8FAFC]/80 dark:from-[#071018]/80 dark:to-[#0B1520]/80 backdrop-blur-md border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/35 focus:border-[#4D8DBA] dark:focus:border-[#8AD6D1] transition-all font-medium text-gray-900 dark:text-white shadow-2xs"
              />
            </div>
          </div>

          {/* PIN / Password input with frosted glass effect */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                {t.auth.pinInputLabel}
              </label>
              <span className="text-[10px] text-gray-400 dark:text-slate-400 font-mono">
                User: 123456 | Admin: 999999
              </span>
            </div>
            <div className="relative group">
              <Lock className="w-4 h-4 text-[#4D8DBA] group-focus-within:text-[#2E678E] dark:text-[#8AD6D1] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                maxLength={64}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.auth.pinInputPlaceholder}
                required
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-white/90 to-[#F8FAFC]/80 dark:from-[#071018]/80 dark:to-[#0B1520]/80 backdrop-blur-md border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/35 focus:border-[#4D8DBA] dark:focus:border-[#8AD6D1] transition-all font-mono tracking-wider text-gray-900 dark:text-white shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                title={showPin ? t.auth.hidePin : t.auth.showPin}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button with Gradient and Glass Specular Border */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#4D8DBA] via-[#3B7B9E] to-[#2E678E] hover:from-[#2E678E] hover:to-[#1C4A6B] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#4D8DBA]/30 hover:shadow-lg hover:shadow-[#4D8DBA]/40 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-white/20 backdrop-blur-xs"
          >
            <span>{loading ? t.auth.verifying : t.common.login}</span>
            <ArrowRight className="w-4 h-4 text-[#8AD6D1]" />
          </button>
        </form>

        {/* Text "Belum punya akun? Daftar Akun Baru di Sini" */}
        <div className="text-center pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-slate-400 relative z-10">
          {t.auth.noAccount}{' '}
          <Link href="/register" className="font-bold text-[#4D8DBA] hover:text-[#2E678E] dark:text-[#8AD6D1] dark:hover:underline">
            {t.auth.registerHere}
          </Link>
        </div>

        {/* Dedicated Demo Accounts Card Container with Gradient and Glass Effect */}
        <div className="pt-2 relative z-10">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-white/70 via-[#EDF5FA]/50 to-white/60 dark:from-[#0B1520]/70 dark:via-[#071018]/60 dark:to-[#0B1520]/70 backdrop-blur-xl border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/25 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-slate-200">
                <div className="p-1 rounded-md bg-[#4D8DBA]/15 text-[#4D8DBA] dark:text-[#8AD6D1]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>{t.auth.demoTitle}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-[#8AD6D1]/30 to-[#8AD6D1]/15 text-[#1C4A6B] dark:text-[#8AD6D1] border border-[#8AD6D1]/40">
                {t.auth.demoBadge}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Demo Button 1: Demo User with Gradient Glass Effect */}
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('USER')}
                className="group py-2.5 px-3 bg-gradient-to-br from-white/90 via-[#EDF5FA]/90 to-[#E2F0F8]/80 dark:from-[#0B1520]/90 dark:via-[#112233]/70 dark:to-[#071018]/90 hover:from-white hover:via-[#DFF0FA] hover:to-[#CEE7F6] dark:hover:from-[#112233] dark:hover:to-[#172D42] backdrop-blur-xl border border-white/80 dark:border-[#4D8DBA]/35 hover:border-[#4D8DBA] dark:hover:border-[#8AD6D1] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.98]"
                title="Demo User"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white to-[#EDF5FA] dark:from-[#0D1926] dark:to-[#172D42] group-hover:from-[#4D8DBA] group-hover:to-[#2E678E] text-[#4D8DBA] group-hover:text-white flex items-center justify-center transition-all shadow-2xs border border-[#AEC4D4]/30 dark:border-[#4D8DBA]/30 flex-shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#1C4A6B] dark:text-slate-200 group-hover:text-[#4D8DBA] dark:group-hover:text-[#8AD6D1] transition-colors whitespace-nowrap">
                  {t.auth.demoUser || 'Demo User'}
                </span>
              </button>

              {/* Demo Button 2: Demo Admin with Gradient Glass Effect */}
              <button
                type="button"
                onClick={() => handleDirectDemoLogin('ADMIN')}
                className="group py-2.5 px-3 bg-gradient-to-br from-white/90 via-[#F4F8FA]/90 to-[#EBF3F7]/80 dark:from-[#0B1520]/90 dark:via-[#112233]/70 dark:to-[#071018]/90 hover:from-white hover:via-[#E7F1F7] hover:to-[#D7E8F2] dark:hover:from-[#112233] dark:hover:to-[#1A334D] backdrop-blur-xl border border-white/80 dark:border-[#4D8DBA]/35 hover:border-[#1C4A6B] dark:hover:border-[#8AD6D1] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.98]"
                title="Demo Admin"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white to-[#F4F8FA] dark:from-[#0D1926] dark:to-[#172D42] group-hover:from-[#1C4A6B] group-hover:to-[#2E678E] text-[#2E678E] group-hover:text-white flex items-center justify-center transition-all shadow-2xs border border-[#AEC4D4]/30 dark:border-[#4D8DBA]/30 flex-shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#1C4A6B] dark:text-slate-200 group-hover:text-[#1C4A6B] dark:group-hover:text-[#8AD6D1] transition-colors whitespace-nowrap">
                  {t.auth.demoAdmin || 'Demo Admin'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
