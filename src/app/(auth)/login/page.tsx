'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { t, locale } = useLanguage();

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

  // Auto-fill form values with username or email
  const handleAutoFill = (role: 'USER' | 'ADMIN', useEmail: boolean = false) => {
    if (role === 'USER') {
      setIdentifier(useEmail ? 'user@cuanly.com' : 'user');
      setPin('123456');
    } else {
      setIdentifier(useEmail ? 'admin@cuanly.com' : 'admin');
      setPin('999999');
    }
    setErrorMsg('');
  };

  // Instant 1-click login
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
      {/* Top Bar with Brand Logo & Language Switcher */}
      <div className="flex items-center justify-between">
        <Link href="/login" className="hover:opacity-90 transition-opacity">
          <CuanlyLogo size="sm" variant="full" />
        </Link>
        <LanguageSwitcher compact />
      </div>

      {/* Hero Welcome with Official Logo */}
      <div className="text-center space-y-2 pt-2">
        <div className="flex justify-center pb-1">
          <CuanlyLogo size="xl" variant="icon" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0C2340] tracking-tight">
          {t.auth.loginTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          {t.auth.loginSubtitle}
        </p>
      </div>

      {/* Main Login Card */}
      <GlassCard className="p-6 space-y-5 shadow-lg">
        {/* Session Inactivity Timeout Alert */}
        {isSessionTimeout && (
          <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 text-amber-900 rounded-xl flex items-start gap-3 shadow-xs">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 text-xs">
              <h4 className="font-bold text-amber-950">
                {t.auth.sessionTimeoutTitle}
              </h4>
              <p className="text-amber-800 leading-relaxed text-[11px] sm:text-xs">
                {t.auth.sessionTimeoutDesc}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <KeyRound className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username or Email input */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              {t.auth.identifierLabel}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.auth.identifierPlaceholder}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30 transition-all font-medium"
              />
            </div>
          </div>

          {/* PIN / Password input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                {t.auth.pinInputLabel}
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                User: 123456 | Admin: 999999
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                maxLength={6}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.auth.pinInputPlaceholder}
                required
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30 transition-all font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                title={showPin ? t.auth.hidePin : t.auth.showPin}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#4D8DBA] hover:bg-[#2E678E] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#4D8DBA]/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? t.auth.verifying : t.common.login}</span>
            <ArrowRight className="w-4 h-4 text-[#8AD6D1]" />
          </button>
        </form>

        {/* Text "Belum punya akun? Daftar Akun Baru di Sini" */}
        <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-500">
          {t.auth.noAccount}{' '}
          <Link href="/register" className="font-bold text-[#4D8DBA] hover:text-[#2E678E] hover:underline">
            {t.auth.registerHere}
          </Link>
        </div>

        {/* Dedicated Demo Accounts (Placed directly below "Belum punya akun?") */}
        <div className="pt-4 border-t border-dashed border-gray-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Sparkles className="w-3.5 h-3.5 text-[#4D8DBA]" />
              <span>{t.auth.demoTitle}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8AD6D1]/25 text-[#1C4A6B]">
              {t.auth.demoBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Demo 1: USER */}
            <div className="p-3 bg-[#EDF5FA] hover:bg-[#E2F0F8] border border-[#AEC4D4]/60 rounded-xl transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C4A6B] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#4D8DBA]" />
                  {t.auth.userAccountTitle}
                </span>
                <span className="text-[10px] bg-[#8AD6D1]/30 text-[#1C4A6B] px-1.5 py-0.5 rounded font-mono font-bold">
                  user
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAutoFill('USER', false)}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-50 border border-[#AEC4D4] text-[#1C4A6B] rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs active:scale-95"
                  title={t.auth.fillFormTooltip}
                >
                  {t.auth.fillFormBtn}
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('USER')}
                  className="flex-1 py-1.5 px-2 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-lg text-[11px] font-bold transition-all text-center shadow-xs cursor-pointer active:scale-95"
                  title={t.auth.oneClickTooltip}
                >
                  {t.auth.oneClickLoginBtn}
                </button>
              </div>
            </div>

            {/* Demo 2: ADMIN */}
            <div className="p-3 bg-[#F4F8FA] hover:bg-[#EBF3F7] border border-[#AEC4D4]/60 rounded-xl transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C4A6B] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#2E678E]" />
                  {t.auth.adminAccountTitle}
                </span>
                <span className="text-[10px] bg-[#AEC4D4]/30 text-[#1C4A6B] px-1.5 py-0.5 rounded font-mono font-bold">
                  admin
                </span>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAutoFill('ADMIN', false)}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-50 border border-[#AEC4D4] text-[#1C4A6B] rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs active:scale-95"
                  title={t.auth.fillFormTooltip}
                >
                  {t.auth.fillFormBtn}
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('ADMIN')}
                  className="flex-1 py-1.5 px-2 bg-[#1C4A6B] hover:bg-[#153852] text-white rounded-lg text-[11px] font-bold transition-all text-center shadow-xs cursor-pointer active:scale-95"
                  title={t.auth.oneClickTooltip}
                >
                  {t.auth.oneClickLoginBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
