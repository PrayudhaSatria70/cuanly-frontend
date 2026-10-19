import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { UpgradeModal } from '@/components/common/UpgradeModal';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Cuanly — Modern Money-Tracking & Budgeting App',
  description:
    'Aplikasi pencatat keuangan modern untuk memantau pemasukan dan pengeluaran, mengatur budget, serta menghindari overspending.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('cuanly_theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  /* Safe fallback: Ignore storage access denial in restricted or private browsing mode */
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-cuanly-canvas dark:bg-[#071018] text-cuanly-primaryDark dark:text-slate-100 antialiased min-h-screen flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <FinanceProvider>
                  <NotificationProvider>
                    <AdminProvider>
                      <AppShell>{children}</AppShell>
                      <UpgradeModal />
                    </AdminProvider>
                  </NotificationProvider>
                </FinanceProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
