'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Users, Store, Search, ChevronRight, UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { allUsers, mitraList, toggleUserStatus } = useAdmin();
  const { t, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<'USERS' | 'MITRA'>('USERS');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMitra = mitraList.filter(
    (m) =>
      m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
          {t.admin.usersManagement}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Kelola data pengguna terdaftar dan mitra bisnis dalam ekosistem Cuanly
        </p>
      </div>

      {/* Tabs & Search */}
      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('USERS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'USERS'
                  ? 'bg-white text-cuanly-primaryDark shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.admin.userDirectory} ({allUsers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MITRA')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'MITRA'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-gray-500 hover:text-purple-700'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t.admin.mitraDirectory} ({mitraList.length})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl"
            />
          </div>
        </div>
      </GlassCard>

      {/* Tab 1: Users Directory */}
      {activeTab === 'USERS' && (
        <GlassCard className="p-2 sm:p-4">
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="py-3 px-3 flex items-center justify-between gap-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-cuanly-primaryDark truncate">
                        {u.name}
                      </h4>
                      <Badge variant={u.role === 'ADMIN' ? 'info' : 'neutral'} size="sm">
                        {u.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    <span className="text-[10px] text-gray-400">
                      Bergabung: {formatDate(u.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleUserStatus(u.id)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                  >
                    Status
                  </button>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="p-1.5 text-gray-400 hover:text-cuanly-primaryDark rounded-lg hover:bg-gray-100"
                    title="Lihat Detail"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Tab 2: Mitra Directory */}
      {activeTab === 'MITRA' && (
        <GlassCard className="p-2 sm:p-4">
          <div className="divide-y divide-gray-100">
            {filteredMitra.map((m) => (
              <div
                key={m.id}
                className="py-3.5 px-3 flex items-center justify-between gap-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold flex-shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-cuanly-primaryDark truncate">
                        {m.businessName}
                      </h4>
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
                    <p className="text-xs text-gray-500">
                      Pemilik: {m.ownerName} • {m.category}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      Email: {m.email} | Kontak: {m.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/verification/${m.id}`}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    Verifikasi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
