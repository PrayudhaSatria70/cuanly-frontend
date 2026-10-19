'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useFinance } from '@/contexts/FinanceContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import {
  Users,
  ShieldCheck,
  Activity,
  MessageSquareWarning,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { t, formatCurrency, formatDate, locale } = useLanguage();
  const { stats, mitraList, complaints } = useAdmin();
  const { transactions } = useFinance();

  const pendingMitra = mitraList.filter((m) => m.verificationStatus === 'PENDING');
  const openComplaints = complaints.filter((c) => c.status !== 'RESOLVED');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            Cuanly Backoffice
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark mt-1">
          {t.admin.dashboardTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          {t.admin.dashboardSubtitle}
        </p>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              {t.admin.totalUsers}
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cuanly-primaryDark num-tabular">
            {stats.totalUsers.toLocaleString(locale === 'en' ? 'en-US' : 'id-ID')}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +12% {locale === 'en' ? 'this month' : 'bulan ini'}
          </p>
        </GlassCard>

        {/* Total Platform Volume */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              {t.admin.totalVolume}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark num-tabular truncate">
            {formatCurrency(stats.totalVolume)}
          </div>
          <p className="text-[11px] text-gray-400">
            {locale === 'en' ? 'Total system turnover' : 'Total mutasi sistem'}
          </p>
        </GlassCard>

        {/* Active & Pending Mitra */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              {t.admin.activeMitra}
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cuanly-primaryDark num-tabular">
            {stats.activeMitraCount} {locale === 'en' ? 'Partners' : 'Mitra'}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">
            {stats.pendingVerificationsCount} {locale === 'en' ? 'pending verification' : 'menunggu verifikasi'}
          </div>
        </GlassCard>

        {/* Complaints */}
        <GlassCard className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              {t.admin.openComplaints}
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 num-tabular">
            {stats.openComplaintsCount} {locale === 'en' ? 'Tickets' : 'Tiket'}
          </div>
          <p className="text-[11px] text-gray-400">
            {locale === 'en' ? 'Requires follow-up' : 'Memerlukan tindak lanjut'}
          </p>
        </GlassCard>
      </div>

      {/* 2-Column Section: Pending Verifications & Open Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm sm:text-base font-bold text-cuanly-primaryDark">
                {locale === 'en' ? 'Partner Verification Queue' : 'Antrean Verifikasi Mitra'}
              </h3>
            </div>
            <Link
              href="/admin/verification"
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
            >
              <span>{t.common.seeAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingMitra.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              {locale === 'en'
                ? 'No partners awaiting verification at this time.'
                : 'Tidak ada mitra menunggu verifikasi saat ini.'}
            </p>
          ) : (
            <div className="space-y-3">
              {pendingMitra.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-cuanly-primaryDark">
                      {m.businessName}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      {locale === 'en' ? 'Owner' : 'Pemilik'}: {m.ownerName} • {m.category}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {locale === 'en' ? 'Document' : 'Dokumen'}: {m.documentType} ({m.documentNumber})
                    </span>
                  </div>

                  <Link
                    href={`/admin/verification/${m.id}`}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex-shrink-0"
                  >
                    {locale === 'en' ? 'Review' : 'Tinjau'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Complaints Queue */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm sm:text-base font-bold text-cuanly-primaryDark">
                {locale === 'en' ? 'User Complaints & Reports' : 'Keluhan & Laporan Pengguna'}
              </h3>
            </div>
            <Link
              href="/admin/complaints"
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5"
            >
              <span>{t.common.seeAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {openComplaints.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              {locale === 'en'
                ? 'All tickets and reports have been resolved.'
                : 'Semua laporan dan keluhan sudah tertangani.'}
            </p>
          ) : (
            <div className="space-y-3">
              {openComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/60 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-cuanly-primaryDark">
                        {c.title}
                      </h4>
                      <Badge
                        variant={c.priority === 'HIGH' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {c.priority}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-1">
                      {c.description}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {locale === 'en' ? 'By' : 'Oleh'} {c.userName} ({c.userEmail})
                    </span>
                  </div>

                  <Link
                    href={`/admin/complaints/${c.id}`}
                    className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-xs flex-shrink-0 mt-1"
                  >
                    {locale === 'en' ? 'Respond' : 'Respon'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <Link
          href="/admin/users"
          className="p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-center space-y-1 cuanly-card-interactive group cursor-pointer"
        >
          <Users className="w-5 h-5 mx-auto text-purple-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-cuanly-primaryDark block">
            {t.nav.users}
          </span>
        </Link>
        <Link
          href="/admin/verification"
          className="p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-center space-y-1 cuanly-card-interactive group cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-cuanly-primaryDark block">
            {t.nav.verification}
          </span>
        </Link>
        <Link
          href="/admin/transactions"
          className="p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-center space-y-1 cuanly-card-interactive group cursor-pointer"
        >
          <Activity className="w-5 h-5 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-cuanly-primaryDark block">
            {t.nav.allTransactions}
          </span>
        </Link>
        <Link
          href="/admin/categories"
          className="p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-center space-y-1 cuanly-card-interactive group cursor-pointer"
        >
          <Layers className="w-5 h-5 mx-auto text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-cuanly-primaryDark block">
            {t.nav.categories}
          </span>
        </Link>
      </div>
    </div>
  );
}
