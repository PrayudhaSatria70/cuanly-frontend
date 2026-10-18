'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Receipt, PieChart, User, Plus } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      name: t.nav.home,
      href: '/beranda',
      icon: Home,
      isActive: pathname === '/beranda',
    },
    {
      name: t.nav.transactions,
      href: '/transaksi',
      icon: Receipt,
      isActive: pathname.startsWith('/transaksi') && pathname !== '/transaksi/tambah' && pathname !== '/transaksi/scan',
    },
    {
      name: t.nav.budget,
      href: '/budget',
      icon: PieChart,
      isActive: pathname.startsWith('/budget'),
    },
    {
      name: t.nav.profile,
      href: '/profil',
      icon: User,
      isActive: pathname === '/profil',
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden glass-nav pb-safe border-t border-gray-200/80 dark:border-[#4D8DBA]/20">
      <div className="relative flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {/* Item 1: Home */}
        <Link
          href={navItems[0].href}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            navItems[0].isActive
              ? 'text-cuanly-primaryDark dark:text-[#8AD6D1] font-bold'
              : 'text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 ${navItems[0].isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1">{navItems[0].name}</span>
        </Link>

        {/* Item 2: Transactions */}
        <Link
          href={navItems[1].href}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            navItems[1].isActive
              ? 'text-cuanly-primaryDark dark:text-[#8AD6D1] font-bold'
              : 'text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Receipt className={`w-5 h-5 ${navItems[1].isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1">{navItems[1].name}</span>
        </Link>

        {/* Center Prominent CTA: Tambah Pengeluaran (Fitts's Law) */}
        <div className="relative -top-5 flex items-center justify-center px-1">
          <Link
            href="/transaksi/tambah"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1C4A6B] to-[#4D8DBA] text-white flex items-center justify-center shadow-lg shadow-[#4D8DBA]/35 hover:scale-105 active:scale-95 transition-all border-4 border-white dark:border-[#071018]"
            title={t.home.addExpenseBtn}
          >
            <Plus className="w-6 h-6 stroke-[3] text-[#8AD6D1]" />
          </Link>
        </div>

        {/* Item 3: Budget */}
        <Link
          href={navItems[2].href}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            navItems[2].isActive
              ? 'text-cuanly-primaryDark dark:text-[#8AD6D1] font-bold'
              : 'text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <PieChart className={`w-5 h-5 ${navItems[2].isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1">{navItems[2].name}</span>
        </Link>

        {/* Item 4: Profile */}
        <Link
          href={navItems[3].href}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            navItems[3].isActive
              ? 'text-cuanly-primaryDark dark:text-[#8AD6D1] font-bold'
              : 'text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <User className={`w-5 h-5 ${navItems[3].isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1">{navItems[3].name}</span>
        </Link>
      </div>
    </nav>

  );
};
