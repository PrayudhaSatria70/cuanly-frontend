'use client';

import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Bell, AlertTriangle, AlertCircle, Info, CheckCircle, Check } from 'lucide-react';
import Link from 'next/link';

export const NotificationDrawer: React.FC = () => {
  const { isDrawerOpen, closeDrawer, notifications, markAllAsRead, markAsRead } = useNotification();
  const { t } = useLanguage();

  if (!isDrawerOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0B1520] shadow-2xl flex flex-col border-l border-gray-200 dark:border-[#4D8DBA]/25">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 dark:border-[#4D8DBA]/25 flex items-center justify-between glass-header">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 dark:bg-[#071018] rounded-xl text-cuanly-primaryDark dark:text-[#8AD6D1]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                  {t.nav.notifications}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {notifications.filter((n) => !n.isRead).length} belum dibaca
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.some((n) => !n.isRead) && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-[#4D8DBA] dark:text-[#8AD6D1] hover:text-[#2E678E] font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#112233]"
                  title="Tandai semua dibaca"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Baca Semua</span>
                </button>
              )}
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#112233] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Belum ada notifikasi baru
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.isRead
                      ? 'bg-white dark:bg-[#0D1926] border-gray-100 dark:border-[#4D8DBA]/20 opacity-75'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-cuanly-primaryDark dark:text-slate-100 truncate">
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={closeDrawer}
                          className="inline-block mt-2 text-xs font-semibold text-[#4D8DBA] dark:text-[#8AD6D1] hover:underline"
                        >
                          Lihat Detail &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
