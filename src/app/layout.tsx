import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopNav } from '@/components/layout/DesktopNav';
import { NotificationDrawer } from '@/components/layout/NotificationDrawer';

export const metadata: Metadata = {
  title: 'Cuanly — Modern Money-Tracking & Budgeting App',
  description:
    'Aplikasi pencatat keuangan modern untuk memantau pemasukan dan pengeluaran, mengatur budget, serta menghindari overspending.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-cuanly-canvas text-cuanly-primaryDark antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <FinanceProvider>
              <NotificationProvider>
                <AdminProvider>
                  {/* Top Navigation Header */}
                  <TopHeader />

                  {/* Notification Drawer Slide-over */}
                  <NotificationDrawer />

                  {/* Main App Container with Desktop Sidebar & Content */}
                  <div className="flex-1 flex w-full max-w-7xl mx-auto">
                    <DesktopNav />
                    <main className="flex-1 w-full p-4 sm:p-6 md:p-8 pb-24 md:pb-12 overflow-x-hidden">
                      {children}
                    </main>
                  </div>

                  {/* Mobile Bottom Navigation */}
                  <BottomNav />
                </AdminProvider>
              </NotificationProvider>
            </FinanceProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
