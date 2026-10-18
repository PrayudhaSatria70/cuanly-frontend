'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { CuanlyLogo } from '@/components/common/CuanlyLogo';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, locale } = useLanguage();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (pin.length < 4) {
      setErrorMsg(t.auth.pinMinError);
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, pin, username, phone);
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
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0C2340] bg-white/90 hover:bg-white border border-gray-200/90 rounded-xl transition-all shadow-xs hover:shadow-sm active:scale-95 group backdrop-blur-xs cursor-pointer"
          title={t.auth.backToPrevious}
        >
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:-translate-x-1 transition-transform" />
          <span>{t.auth.backToPrevious}</span>
        </button>
        <LanguageSwitcher compact />
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

      {/* Register Card */}
      <GlassCard className="p-6 space-y-5 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">
              {t.auth.fullNameLabel}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.auth.fullNamePlaceholder}
                required
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">
              {t.auth.emailFieldLabel}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.auth.emailPlaceholder}
                required
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">
              {t.auth.usernameOptionalLabel}
            </label>
            <div className="relative">
              <span className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs flex items-center justify-center font-bold">@</span>
              <input
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder={t.auth.usernameOptionalPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30 font-mono text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">
              {t.auth.phoneOptionalLabel}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.auth.phonePlaceholder}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">
              {t.auth.createPinLabel}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder={t.auth.createPinPlaceholder}
                required
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30 num-tabular tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#0C2340] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? t.auth.registering : t.auth.createAccountBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#0C2340] font-medium transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.auth.back}</span>
          </button>
          <div>
            <span>{t.auth.haveAccount}{' '}</span>
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              {t.auth.loginHere}
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
