'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopNav } from '@/components/layout/DesktopNav';
import { NotificationDrawer } from '@/components/layout/NotificationDrawer';
import { WalletManagerModal } from '@/components/finance/WalletManagerModal';
import { DebtManagerModal } from '@/components/finance/DebtManagerModal';
import { SharedWorkspaceModal } from '@/components/finance/SharedWorkspaceModal';
import { useSubscription } from '@/contexts/SubscriptionContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const {
    isWalletModalOpen,
    closeWalletModal,
    isDebtModalOpen,
    closeDebtModal,
    isWorkspaceModalOpen,
    closeWorkspaceModal,
  } = useSubscription();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPricingPage = pathname === '/pricing';
  const isStandalonePage = isAuthPage || isPricingPage;

  useEffect(() => {
    if (!mounted) return;

    // 1. If not authenticated and trying to access protected route -> redirect to /login
    if (!isAuthenticated && !isStandalonePage) {
      router.replace('/login');
      return;
    }

    // 2. If non-admin user trying to access /admin -> redirect to /beranda
    if (isAuthenticated && user?.role !== 'ADMIN' && pathname.startsWith('/admin')) {
      router.replace('/beranda');
    }
  }, [mounted, isAuthenticated, isStandalonePage, pathname, router, user]);

  if (!mounted) {
    return null;
  }

  // Auth pages (Login / Register): clean, dedicated layout
  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-cuanly-canvas dark:bg-[#071018] text-cuanly-primaryDark dark:text-slate-100 transition-colors duration-200">
        {children}
      </main>
    );
  }

  // Standalone full-width public page (Pricing Plan)
  if (isPricingPage) {
    return (
      <div className="min-h-screen w-full bg-cuanly-canvas dark:bg-[#071018] text-cuanly-primaryDark dark:text-slate-100 transition-colors duration-200">
        {children}
      </div>
    );
  }

  // Protected App Shell with Navigation
  return (
    <div className="min-h-screen flex flex-col w-full bg-cuanly-canvas dark:bg-[#071018] text-cuanly-primaryDark dark:text-slate-100 transition-colors duration-200">

      <TopHeader />
      <NotificationDrawer />
      <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)]">
        <DesktopNav />
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 overflow-x-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
      {/* Global feature modals accessible across all routes and roles */}
      <WalletManagerModal isOpen={isWalletModalOpen} onClose={closeWalletModal} />
      <DebtManagerModal isOpen={isDebtModalOpen} onClose={closeDebtModal} />
      <SharedWorkspaceModal isOpen={isWorkspaceModalOpen} onClose={closeWorkspaceModal} />
    </div>
  );
};
