'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '@/types';
import { DEMO_USER, DEMO_ADMIN } from '@/services/mockData';

// 3 Minutes Session Inactivity Timeout (180,000 ms)
export const SESSION_TIMEOUT_MS = 3 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (identifier: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: Role) => void;
  register: (name: string, email: string, pin: string, username?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: () => void;
  sessionTimeoutMs: number;
  setSessionTimeoutDuration: (ms: number) => void;
  updateUserPin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  updateUserProfile: (updates: Partial<Omit<User, 'id' | 'role' | 'createdAt'>>) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionTimeoutMs, setSessionTimeoutMs] = useState<number>(SESSION_TIMEOUT_MS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication & enforce session freshness
  useEffect(() => {
    try {
      const storedTimeout = localStorage.getItem('cuanly_session_timeout_ms');
      let effectiveTimeout = SESSION_TIMEOUT_MS;
      if (storedTimeout) {
        const parsedTimeout = Number(storedTimeout);
        if (!isNaN(parsedTimeout) && parsedTimeout >= 60000) {
          effectiveTimeout = parsedTimeout;
          setSessionTimeoutMs(parsedTimeout);
        }
      }

      const stored = localStorage.getItem('cuanly_auth_user');
      const lastActivityStr = localStorage.getItem('cuanly_last_activity');
      const now = Date.now();

      if (stored && lastActivityStr) {
        const lastActivity = Number(lastActivityStr);
        // If last activity was strictly within session timeout, restore session
        if (!isNaN(lastActivity) && now - lastActivity < effectiveTimeout) {
          setUser(JSON.parse(stored));
          localStorage.setItem('cuanly_last_activity', now.toString());
        } else {
          // Session expired -> Require login
          localStorage.removeItem('cuanly_auth_user');
          localStorage.removeItem('cuanly_last_activity');
          sessionStorage.setItem('cuanly_session_timed_out', 'true');
          setUser(null);
        }
      } else {
        // No active session or fresh arrival -> Require explicit login first
        localStorage.removeItem('cuanly_auth_user');
        localStorage.removeItem('cuanly_last_activity');
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const handleTimeout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('cuanly_auth_user');
      localStorage.removeItem('cuanly_last_activity');
      sessionStorage.setItem('cuanly_session_timed_out', 'true');
    } catch {
      // ignore
    }
    // Hard navigate to ensure clean state and display timeout notification
    window.location.href = '/login?reason=timeout';
  }, []);

  // Real-time 3-minute inactivity listener and periodic timeout check
  useEffect(() => {
    if (!user) return;

    let lastWriteTime = Date.now();

    // Throttled user activity recorder
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastWriteTime > 2000) {
        lastWriteTime = now;
        try {
          localStorage.setItem('cuanly_last_activity', now.toString());
        } catch {
          // ignore
        }
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, recordActivity, { passive: true });
    });

    // Check inactivity every 2 seconds
    const intervalId = setInterval(() => {
      try {
        const lastActivityStr = localStorage.getItem('cuanly_last_activity');
        const lastActivity = lastActivityStr ? Number(lastActivityStr) : 0;
        const now = Date.now();

        if (now - lastActivity >= sessionTimeoutMs) {
          handleTimeout();
        }
      } catch {
        // ignore
      }
    }, 2000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, recordActivity);
      });
      clearInterval(intervalId);
    };
  }, [user, handleTimeout, sessionTimeoutMs]);

  const persistSession = (loggedInUser: User) => {
    setUser(loggedInUser);
    try {
      localStorage.setItem('cuanly_auth_user', JSON.stringify(loggedInUser));
      localStorage.setItem('cuanly_last_activity', Date.now().toString());
      sessionStorage.removeItem('cuanly_session_timed_out');
    } catch {
      // ignore
    }
  };

  const login = async (identifier: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanId || !cleanPin) {
      return { success: false, error: 'Username atau Email serta PIN wajib diisi.' };
    }

    // 1. Check Demo Admin (Username 'admin' or email 'admin@cuanly.com')
    const isAdminMatch =
      cleanId === DEMO_ADMIN.email.toLowerCase() ||
      cleanId === DEMO_ADMIN.username?.toLowerCase() ||
      cleanId === 'admin';
    if (isAdminMatch && cleanPin === DEMO_ADMIN.pin) {
      persistSession(DEMO_ADMIN);
      return { success: true };
    }

    // 2. Check Demo User (Username 'user' or email 'user@cuanly.com')
    const isUserMatch =
      cleanId === DEMO_USER.email.toLowerCase() ||
      cleanId === DEMO_USER.username?.toLowerCase() ||
      cleanId === 'user';
    if (isUserMatch && cleanPin === DEMO_USER.pin) {
      persistSession(DEMO_USER);
      return { success: true };
    }

    // 3. Check custom registered users from localStorage
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('cuanly_registered_users') || '[]');
      const found = registeredUsers.find((u: User) => {
        const matchesEmail = u.email && u.email.toLowerCase() === cleanId;
        const matchesUsername = u.username && u.username.toLowerCase() === cleanId;
        return (matchesEmail || matchesUsername) && u.pin === cleanPin;
      });
      if (found) {
        persistSession(found);
        return { success: true };
      }
    } catch {
      // ignore
    }

    // 4. Flexible test login if identifier has at least 3 chars and pin >= 4 digits
    if (cleanId.length >= 3 && cleanPin.length >= 4) {
      const isEmail = cleanId.includes('@');
      const role: Role = cleanId.includes('admin') ? 'ADMIN' : 'USER';
      const username = isEmail ? cleanId.split('@')[0] : cleanId;
      const email = isEmail ? cleanId : `${cleanId}@cuanly.com`;

      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username,
        email,
        role,
        pin: cleanPin,
        createdAt: new Date().toISOString(),
      };
      persistSession(newUser);
      return { success: true };
    }

    return {
      success: false,
      error: 'Kredensial tidak sesuai. Gunakan akun demo (Username: user / 123456 atau admin / 999999).',
    };
  };

  const loginAsDemo = (targetRole: Role) => {
    const selected = targetRole === 'ADMIN' ? DEMO_ADMIN : DEMO_USER;
    persistSession(selected);
  };

  const register = async (
    name: string,
    email: string,
    pin: string,
    username?: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || !email || !pin) {
      return { success: false, error: 'Semua kolom wajib diisi.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const resolvedUsername = username
      ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      username: resolvedUsername,
      email: cleanEmail,
      phone: phone?.trim(),
      role: 'USER',
      pin: pin.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const registeredUsers = JSON.parse(localStorage.getItem('cuanly_registered_users') || '[]');
      registeredUsers.push(newUser);
      localStorage.setItem('cuanly_registered_users', JSON.stringify(registeredUsers));
      persistSession(newUser);
      return { success: true };
    } catch {
      persistSession(newUser);
      return { success: true };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('cuanly_auth_user');
      localStorage.removeItem('cuanly_last_activity');
      sessionStorage.removeItem('cuanly_session_timed_out');
    } catch {
      // ignore
    }
  }, []);

  const switchRole = () => {
    if (user?.role === 'ADMIN') {
      loginAsDemo('USER');
    } else {
      loginAsDemo('ADMIN');
    }
  };

  const setSessionTimeoutDuration = (ms: number) => {
    setSessionTimeoutMs(ms);
    try {
      localStorage.setItem('cuanly_session_timeout_ms', ms.toString());
      localStorage.setItem('cuanly_last_activity', Date.now().toString());
    } catch {
      // ignore
    }
  };

  const updateUserPin = (oldPin: string, newPin: string): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'User tidak ditemukan.' };
    if (user.pin && user.pin !== oldPin.trim()) {
      return { success: false, error: 'PIN saat ini tidak cocok.' };
    }
    if (newPin.trim().length < 4 || newPin.trim().length > 6) {
      return { success: false, error: 'PIN baru harus terdiri dari 4-6 digit angka.' };
    }
    const updatedUser = { ...user, pin: newPin.trim() };
    setUser(updatedUser);
    try {
      localStorage.setItem('cuanly_auth_user', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    return { success: true };
  };

  const updateUserProfile = (
    updates: Partial<Omit<User, 'id' | 'role' | 'createdAt'>>
  ): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'User tidak ditemukan.' };

    if (updates.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email.trim())) {
        return { success: false, error: 'Format email tidak valid.' };
      }
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      return { success: false, error: 'Nama lengkap tidak boleh kosong.' };
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : user.name,
      username: updates.username !== undefined ? updates.username.trim() : user.username,
      email: updates.email !== undefined ? updates.email.trim() : user.email,
      phone: updates.phone !== undefined ? updates.phone.trim() : user.phone,
      avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl,
    };

    setUser(updatedUser);

    try {
      localStorage.setItem('cuanly_auth_user', JSON.stringify(updatedUser));

      const storedUsers = localStorage.getItem('cuanly_registered_users');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          const index = parsed.findIndex((u: User) => u.id === user.id);
          if (index !== -1) {
            parsed[index] = { ...parsed[index], ...updatedUser };
            localStorage.setItem('cuanly_registered_users', JSON.stringify(parsed));
          }
        }
      }

      const storedAdminUsers = localStorage.getItem('cuanly_admin_users');
      if (storedAdminUsers) {
        const parsedAdmin = JSON.parse(storedAdminUsers);
        if (Array.isArray(parsedAdmin)) {
          const idx = parsedAdmin.findIndex((u: User) => u.id === user.id);
          if (idx !== -1) {
            parsedAdmin[idx] = { ...parsedAdmin[idx], ...updatedUser };
            localStorage.setItem('cuanly_admin_users', JSON.stringify(parsedAdmin));
          }
        }
      }
    } catch {
      // ignore
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'USER',
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        register,
        logout,
        switchRole,
        sessionTimeoutMs,
        setSessionTimeoutDuration,
        updateUserPin,
        updateUserProfile,
      }}
    >
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
