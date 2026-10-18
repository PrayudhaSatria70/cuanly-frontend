'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    // Navigating to the root domain (cuanly.vercel.app) always resets active session and requires login first
    logout();
    router.replace('/login');
  }, [router, logout]);

  return null;
}
