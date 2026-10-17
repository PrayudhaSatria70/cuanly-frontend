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
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 glass-panel border-r border-gray-200/80 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      {/* User Section */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3">
          Menu Pengguna
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
                    ? 'bg-cuanly-primaryDark text-white shadow-sm'
                    : 'text-gray-600 hover:text-cuanly-primaryDark hover:bg-gray-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Admin Section (Always accessible for easy testing or if role is ADMIN) */}
      <div className="pt-4 border-t border-gray-200/70">
        <div className="flex items-center justify-between px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
            Admin Backoffice
          </span>
          {role === 'ADMIN' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
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
                    : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
