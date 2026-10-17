'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Wallet, Shield, User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await login(email, pin);
      if (result.success) {
        if (email.includes('admin')) {
          router.push('/admin/dashboard');
        } else {
          router.push('/beranda');
        }
      } else {
        setErrorMsg(result.error || 'Login gagal.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'USER' | 'ADMIN') => {
    loginAsDemo(role);
    if (role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/beranda');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2C302E] to-[#6B7072] text-white flex items-center justify-center mx-auto shadow-md">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-cuanly-primaryDark tracking-tight">
            Masuk ke Cuan<span className="text-emerald-600">ly</span>
          </h1>
          <p className="text-xs text-gray-500">
            {t.tagline}
          </p>
        </div>

        {/* 1-Click Demo Quick Login Section */}
        <GlassCard className="p-4 bg-purple-50/40 border border-purple-200/60 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Akses Cepat (Demo Instant 1-Klik)</span>
          </div>
          <p className="text-[11px] text-gray-600">
            Coba aplikasi langsung tanpa mengetik kredensial:
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDemo('USER')}
              className="py-2.5 px-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-purple-200" />
              <span>Demo Admin</span>
            </button>
          </div>
        </GlassCard>

        {/* Manual Login Card */}
        <GlassCard className="p-6 space-y-5 shadow-lg">
          <form onSubmit={handleManualLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@cuanly.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                PIN / Password (6 Digit)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cuanly-primaryDark hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Memeriksa...' : t.common.login}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-emerald-600 hover:underline">
              Daftar Akun Baru
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
