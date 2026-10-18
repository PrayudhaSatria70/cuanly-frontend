'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/common/GlassCard';
import { CuanlyLogo } from '@/components/common/CuanlyLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, locale } = useLanguage();
  const { isDark, toggleTheme } = useTheme();


  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 4) {
      setErrorMsg(t.auth.pinMinError);
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, username, phone);
      if (res.success) {
        router.push('/beranda');
      } else {
        setErrorMsg(res.error || t.auth.registerFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 space-y-6">
      {/* Top Navigation with Back to Previous Menu Button & Language Switcher */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#4D8DBA] bg-white/90 hover:bg-white border border-gray-200/90 rounded-xl transition-all shadow-xs hover:shadow-sm active:scale-95 group backdrop-blur-xs cursor-pointer"
          title={t.auth.backToPrevious}
        >
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-1 group-hover:text-[#4D8DBA] transition-all" />
          <span>{t.auth.backToPrevious}</span>
        </button>
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


      {/* Brand Logo & Title with Official Logo */}
      <div className="text-center space-y-2">
        <div className="flex justify-center pb-1">
          <CuanlyLogo size="lg" variant="full" />
        </div>
        <p className="text-xs text-gray-500">
          {t.auth.registerSubtitle}
        </p>
      </div>

      {/* Register Card with Gradient and Frosted Glass Effect */}
      <GlassCard className="p-6 sm:p-7 space-y-5 shadow-2xl bg-gradient-to-b from-white/95 via-white/85 to-[#F4F8FA]/90 dark:from-[#0D1926]/95 dark:via-[#0B1520]/90 dark:to-[#071018]/95 backdrop-blur-2xl border border-white/80 dark:border-[#4D8DBA]/30 rounded-3xl relative overflow-hidden">
        {/* Subtle decorative gradient ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#8AD6D1]/20 to-[#4D8DBA]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-[#4D8DBA]/15 to-[#8AD6D1]/10 rounded-full blur-2xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {errorMsg && (
            <div className="p-3 bg-gradient-to-r from-rose-500/15 via-rose-500/10 to-transparent backdrop-blur-md border border-rose-500/40 dark:border-rose-700/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl shadow-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
              {t.auth.fullNameLabel}
            </label>
            <div className="relative group">
              <User className="w-4 h-4 text-[#4D8DBA] group-focus-within:text-[#2E678E] dark:text-[#8AD6D1] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.fullNamePlaceholder}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-white/90 to-[#F8FAFC]/80 dark:from-[#071018]/80 dark:to-[#0B1520]/80 backdrop-blur-md border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/35 focus:border-[#4D8DBA] dark:focus:border-[#8AD6D1] transition-all font-medium text-gray-900 dark:text-white shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
              {t.auth.emailFieldLabel}
            </label>
            <div className="relative group">
              <Mail className="w-4 h-4 text-[#4D8DBA] group-focus-within:text-[#2E678E] dark:text-[#8AD6D1] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-white/90 to-[#F8FAFC]/80 dark:from-[#071018]/80 dark:to-[#0B1520]/80 backdrop-blur-md border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/35 focus:border-[#4D8DBA] dark:focus:border-[#8AD6D1] transition-all font-medium text-gray-900 dark:text-white shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
              {t.auth.usernameOptionalLabel}
            </label>
            <div className="relative group">
              <span className="w-4 h-4 text-[#4D8DBA] group-focus-within:text-[#2E678E] dark:text-[#8AD6D1] absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs flex items-center justify-center font-bold">@</span>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder={t.auth.usernameOptionalPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-white/90 to-[#F8FAFC]/80 dark:from-[#071018]/80 dark:to-[#0B1520]/80 backdrop-blur-md border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/35 focus:border-[#4D8DBA] dark:focus:border-[#8AD6D1] transition-all font-mono text-gray-900 dark:text-white shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
              {t.auth.phoneOptionalLabel}
            </label>
            <div className="relative group">
              <Phone className="w-4 h-4 text-[#4D8DBA] group-focus-within:text-[#2E678E] dark:text-[#8AD6D1] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.auth.phonePlaceholder}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-white/90 to-[#F8FAFC]/80 dark:from-[#071018]/80 dark:to-[#0B1520]/80 backdrop-blur-md border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/35 focus:border-[#4D8DBA] dark:focus:border-[#8AD6D1] transition-all font-medium text-gray-900 dark:text-white shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
              {t.auth.createPinLabel}
            </label>
            <div className="relative group">
              <Lock className="w-4 h-4 text-[#4D8DBA] group-focus-within:text-[#2E678E] dark:text-[#8AD6D1] absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                maxLength={64}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.createPinPlaceholder}
                required
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-white/90 to-[#F8FAFC]/80 dark:from-[#071018]/80 dark:to-[#0B1520]/80 backdrop-blur-md border border-[#AEC4D4]/50 dark:border-[#4D8DBA]/35 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/35 focus:border-[#4D8DBA] dark:focus:border-[#8AD6D1] transition-all font-mono tracking-wider text-gray-900 dark:text-white shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                title={showPassword ? t.auth.hidePin : t.auth.showPin}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#4D8DBA] via-[#3B7B9E] to-[#2E678E] hover:from-[#2E678E] hover:to-[#1C4A6B] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#4D8DBA]/30 hover:shadow-lg hover:shadow-[#4D8DBA]/40 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-white/20 backdrop-blur-xs"
          >
            <span>{loading ? t.auth.registering : t.auth.createAccountBtn}</span>
            <ArrowRight className="w-4 h-4 text-[#8AD6D1]" />
          </button>
        </form>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-slate-400 relative z-10">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#4D8DBA] dark:hover:text-[#8AD6D1] font-medium transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.auth.back}</span>
          </button>
          <div>
            <span>{t.auth.haveAccount}{' '}</span>
            <Link href="/login" className="font-bold text-[#4D8DBA] hover:text-[#2E678E] dark:text-[#8AD6D1] dark:hover:underline">
              {t.auth.loginHere}
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
