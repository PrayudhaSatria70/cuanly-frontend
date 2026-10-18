'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { ArrowLeft, User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const { allUsers, toggleUserStatus } = useAdmin();
  const { formatDate, locale, t } = useLanguage();

  const user = allUsers.find((u) => u.id === userId);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-700">
          {locale === 'en' ? 'User Not Found' : 'Pengguna Tidak Ditemukan'}
        </h2>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cuanly-primaryDark text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'en' ? 'Back to Users List' : 'Kembali ke Daftar Pengguna'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-cuanly-primaryDark px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>
        <h1 className="text-base sm:text-lg font-bold text-cuanly-primaryDark">
          {locale === 'en' ? 'User Account Details' : 'Detail Akun Pengguna'}
        </h1>
        <div className="w-12"></div>
      </div>

      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 text-cuanly-primaryDark font-bold text-2xl flex items-center justify-center flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-cuanly-primaryDark">{user.name}</h2>
              <Badge variant={user.role === 'ADMIN' ? 'info' : 'neutral'}>
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{user.email}</p>
            <span className="text-[10px] text-gray-400">ID: {user.id}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gray-400" />
              Email
            </span>
            <span className="font-semibold text-gray-800">{user.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-gray-400" />
              {locale === 'en' ? 'Phone Number' : 'No. Handphone'}
            </span>
            <span className="font-semibold text-gray-800">{user.phone || '0812-3344-5566'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              {locale === 'en' ? 'Registered Date' : 'Tanggal Terdaftar'}
            </span>
            <span className="font-semibold text-gray-800">{formatDate(user.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gray-400" />
              {locale === 'en' ? 'Account Status' : 'Status Akun'}
            </span>
            <span className="font-semibold text-emerald-600">
              {locale === 'en' ? 'Active & Verified' : 'Aktif & Terverifikasi'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={() => toggleUserStatus(user.id)}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
          >
            {locale === 'en' ? 'Change Account Status' : 'Ubah Status Akun'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
