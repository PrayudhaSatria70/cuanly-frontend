import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Cuanly — Modern Money-Tracking & Budgeting App',
  description:
    'Aplikasi pencatat keuangan modern untuk memantau pemasukan dan pengeluaran, mengatur budget, serta menghindari overspending.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="bg-cuanly-canvas text-cuanly-primaryDark antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <AuthProvider>
            <FinanceProvider>
              <NotificationProvider>
                <AdminProvider>
                  <AppShell>{children}</AppShell>
                </AdminProvider>
              </NotificationProvider>
            </FinanceProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
