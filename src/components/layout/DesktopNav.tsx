'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Receipt,
  PieChart,
  User,
  PlusCircle,
  Camera,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  MessageSquareWarning,
} from 'lucide-react';

export const DesktopNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { role } = useAuth();

  const userItems = [
    { name: t.nav.home, href: '/beranda', icon: Home },
    { name: t.nav.transactions, href: '/transaksi', icon: Receipt },
    { name: t.nav.scanReceipt, href: '/transaksi/scan', icon: Camera },
    { name: t.transactions.addTitle, href: '/transaksi/tambah', icon: PlusCircle },
    { name: t.nav.budget, href: '/budget', icon: PieChart },
    { name: t.nav.profile, href: '/profil', icon: User },
  ];

  const adminItems = [
    { name: t.nav.dashboard, href: '/admin/dashboard', icon: LayoutDashboard },
    { name: t.nav.users, href: '/admin/users', icon: Users },
    { name: t.nav.verification, href: '/admin/verification', icon: ShieldCheck },
    { name: t.nav.allTransactions, href: '/admin/transactions', icon: Activity },
    { name: t.nav.categories, href: '/admin/categories', icon: Layers },
    { name: t.nav.complaints, href: '/admin/complaints', icon: MessageSquareWarning },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 glass-panel border-r border-gray-200/80 dark:border-[#4D8DBA]/20 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 lg:p-5 space-y-6">
      {/* User Section */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 px-3">
          {t.nav.userMenu || 'User Menu'}
        </span>
        <div className="mt-2 space-y-1">
          {userItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#4D8DBA] text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-300 hover:text-[#2E678E] dark:hover:text-white hover:bg-[#AEC4D4]/15 dark:hover:bg-[#4D8DBA]/15'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#8AD6D1]' : 'text-gray-400 dark:text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Section (Always accessible for easy testing or if role is ADMIN) */}
      <div className="pt-4 border-t border-gray-200/70 dark:border-[#4D8DBA]/20">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
            {t.nav.adminBackoffice || 'Admin Backoffice'}
          </span>
          {role === 'ADMIN' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
              Active
            </span>
          )}
        </div>
        <div className="mt-2 space-y-1">
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-sm font-semibold'
                    : 'text-gray-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400 dark:text-purple-300'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );

};
