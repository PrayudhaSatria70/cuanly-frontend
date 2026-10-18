'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { MessageSquareWarning, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminComplaintsPage() {
  const { complaints } = useAdmin();
  const { t, formatDate } = useLanguage();

  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const filtered = complaints.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
          {t.admin.complaintsManagement}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Tangani laporan kendala teknis dan keluhan pelanggan secara responsif
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
            Semua ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('OPEN')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'OPEN'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-gray-500 hover:text-rose-700'
            }`}
          >
            Baru Masuk ({complaints.filter((c) => c.status === 'OPEN').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'IN_PROGRESS'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-gray-500 hover:text-amber-700'
            }`}
          >
            Diproses ({complaints.filter((c) => c.status === 'IN_PROGRESS').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('RESOLVED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === 'RESOLVED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-emerald-700'
            }`}
          >
            Selesai ({complaints.filter((c) => c.status === 'RESOLVED').length})
          </button>
        </div>
      </GlassCard>

      {/* Complaints List */}
      <GlassCard className="p-2 sm:p-4">
        <div className="divide-y divide-gray-100">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="py-4 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 mt-0.5 ${
                    item.status === 'RESOLVED'
                      ? 'bg-emerald-50 text-emerald-600'
                      : item.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <MessageSquareWarning className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {item.ticketId}
                    </span>
                    <h3 className="text-sm font-bold text-cuanly-primaryDark">
                      {item.title}
                    </h3>
                    <Badge
                      variant={
                        item.priority === 'HIGH'
                          ? 'danger'
                          : item.priority === 'MEDIUM'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                    <span>Pelapor: {item.userName} ({item.userEmail})</span>
                    <span>• {formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center self-end flex-shrink-0">
                <Link
                  href={`/admin/complaints/${item.id}`}
                  className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <span>Respon</span>
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
