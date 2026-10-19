'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PremiumCrownBadge } from '@/components/common/PremiumCrownBadge';
import {
  Home,
  Receipt,
  PieChart,
  User,
  Settings,
  PlusCircle,
  Camera,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Activity,
  Layers,
  MessageSquareWarning,
  Crown,
  HandCoins,
  Building2,
  Wallet,
  Building,
  TrendingUp,
  Brain,
  Briefcase,
} from 'lucide-react';

export const DesktopNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { role } = useAuth();
  const {
    tier,
    hasAccess,
  } = useSubscription();

  const userItems = [
    { name: t.nav.home, href: '/beranda', icon: Home },
    { name: t.nav.transactions, href: '/transaksi', icon: Receipt },
    { name: t.nav.scanReceipt, href: '/transaksi/scan', icon: Camera },
    { name: t.transactions.addTitle, href: '/transaksi/tambah', icon: PlusCircle },
    { name: t.nav.budget, href: '/budget', icon: PieChart },
    { name: t.nav.profile, href: '/profil', icon: User },
    { name: t.nav.settings, href: '/settings', icon: Settings },
  ];

  const subscriptionItems = [
    { name: t.nav.multiWallet, href: '/wallets', icon: Wallet, requiredPlan: 'SILVER' as const, colorClass: 'text-[#4D8DBA] dark:text-[#8AD6D1]' },
    { name: t.nav.debtManager, href: '/debts', icon: HandCoins, requiredPlan: 'GOLD' as const, colorClass: 'text-amber-500 dark:text-amber-400' },
    { name: t.nav.teamWorkspace, href: '/workspace', icon: Building2, requiredPlan: 'B2B' as const, colorClass: 'text-purple-600 dark:text-purple-400' },
    { name: 'Bank Sync Otomatis', href: '/bank-sync', icon: Building, requiredPlan: 'GOLD' as const, colorClass: 'text-[#4D8DBA] dark:text-[#8AD6D1]' },
    { name: 'Aset & Investasi', href: '/investasi', icon: TrendingUp, requiredPlan: 'GOLD' as const, colorClass: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'Analitik AI Cuanly', href: '/analitik-ai', icon: Brain, requiredPlan: 'GOLD' as const, colorClass: 'text-violet-600 dark:text-violet-400' },
    { name: 'Bisnis & Pajak UMKM', href: '/bisnis', icon: Briefcase, requiredPlan: 'B2B' as const, colorClass: 'text-blue-600 dark:text-blue-400' },
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
    <aside className="hidden md:flex flex-col w-64 lg:w-72 flex-shrink-0 glass-panel border-r border-gray-200/80 dark:border-[#4D8DBA]/20 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 lg:p-5 space-y-5 justify-between">
      <div className="space-y-5">
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

        {/* Subscription Features - Full Page Navigation like User Menu */}
        <div className="pt-2 border-t border-gray-200/70 dark:border-[#4D8DBA]/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-3 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{t.nav.subscriptionFeatures}</span>
          </span>
          <div className="mt-2 space-y-1">
            {subscriptionItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const hasPlan = hasAccess(item.requiredPlan);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#4D8DBA] text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-300 hover:text-[#2E678E] dark:hover:text-white hover:bg-[#AEC4D4]/15 dark:hover:bg-[#4D8DBA]/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#8AD6D1]' : 'text-gray-400 dark:text-slate-400 group-hover:text-[#4D8DBA]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {!hasPlan && <PremiumCrownBadge plan={item.requiredPlan} />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Section - Only visible when logged in with ADMIN account */}
        {role === 'ADMIN' && (
          <div className="pt-2 border-t border-gray-200/70 dark:border-[#4D8DBA]/20">
            <div className="flex items-center justify-between px-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
                {t.nav.adminBackoffice || 'Admin Backoffice'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                Active
              </span>
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
        )}
      </div>

      {/* Canva-Style Premium Plan Banner Card at bottom of sidebar - ONLY FOR USER / DEMO USER */}
      {role !== 'ADMIN' && (
        <div className="pt-4 border-t border-gray-200/70 dark:border-[#4D8DBA]/20">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-400/10 to-yellow-500/15 border border-amber-400/30 text-amber-950 dark:text-amber-100 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/25 flex items-center justify-center text-amber-500">
                <Crown className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black block text-amber-900 dark:text-amber-200 truncate">
                  {tier === 'FREE' && 'Cuanly Basic (Free)'}
                  {tier === 'SILVER' && 'Cuanly Silver Pro'}
                  {tier === 'GOLD' && 'Cuanly Gold Max'}
                  {tier === 'B2B' && 'Cuanly B2B Enterprise'}
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-300 block truncate">
                  {tier === 'B2B' ? t.nav.fullAccess : t.nav.unlockAllFeatures}
                </span>
              </div>
            </div>
            <Link
              href="/my-plan"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
            >
              <Crown className="w-3.5 h-3.5 fill-amber-300 text-amber-100" />
              <span>{tier === 'B2B' ? t.nav.managePlan : t.nav.upgradePlan}</span>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
};
