'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { ShieldCheck, Store, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminVerificationQueuePage() {
  const { mitraList } = useAdmin();
  const { t, formatDate } = useLanguage();

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');

  const filtered = mitraList.filter((m) => {
    if (filter === 'ALL') return true;
    return m.verificationStatus === filter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
          {t.admin.verificationTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          {t.admin.verificationSubtitle}
        </p>
      </div>

      {/* Filter Tabs */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'ALL'
                ? 'bg-white text-cuanly-primaryDark shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Semua ({mitraList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'PENDING'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-gray-500 hover:text-amber-700'
            }`}
          >
            Menunggu Verifikasi ({mitraList.filter((m) => m.verificationStatus === 'PENDING').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('VERIFIED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'VERIFIED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-emerald-700'
            }`}
          >
            Terverifikasi ({mitraList.filter((m) => m.verificationStatus === 'VERIFIED').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('REJECTED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'REJECTED'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-gray-500 hover:text-rose-700'
            }`}
          >
            Ditolak ({mitraList.filter((m) => m.verificationStatus === 'REJECTED').length})
          </button>
        </div>
      </GlassCard>

      {/* Queue List */}
      <GlassCard className="p-2 sm:p-4">
        <div className="divide-y divide-gray-100">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-cuanly-primaryDark">
                      {m.businessName}
                    </h3>
                    <Badge
                      variant={
                        m.verificationStatus === 'VERIFIED'
                          ? 'success'
                          : m.verificationStatus === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {m.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pemilik: {m.ownerName} | Bidang: {m.category}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Dokumen: <span className="font-semibold">{m.documentType}</span> (No: {m.documentNumber})
                  </p>
                  <span className="text-[10px] text-gray-400">
                    Diajukan pada: {formatDate(m.submissionDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center self-end flex-shrink-0">
                <Link
                  href={`/admin/verification/${m.id}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <span>Tinjau Berkas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
