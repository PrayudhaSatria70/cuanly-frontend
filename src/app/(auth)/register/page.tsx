'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Wallet, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (pin.length < 4) {
      setErrorMsg('PIN minimal harus terdiri dari 4 atau 6 digit.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, pin);
      if (res.success) {
        router.push('/beranda');
      } else {
        setErrorMsg(res.error || 'Pendaftaran gagal.');
      }
    } finally {
      setLoading(false);
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
            Daftar Akun Cuan<span className="text-emerald-600">ly</span>
          </h1>
          <p className="text-xs text-gray-500">
            Mulai kelola keuangan Anda dengan pintar, rapi, dan terkontrol
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
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
                />
              </div>
            </div>

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
                  placeholder="nama@email.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                No. Handphone (Opsional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">
                Buat PIN Transaksi (6 Digit)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 123456"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30 num-tabular tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cuanly-primaryDark hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Mendaftarkan...' : 'Buat Akun Saya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-emerald-600 hover:underline">
              Masuk di Sini
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
