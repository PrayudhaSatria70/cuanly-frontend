'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '@/types';
import { DEMO_USER, DEMO_ADMIN } from '@/services/mockData';
import { authApi } from '@/services/api';

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
  updateUserPassword: (oldPassword: string, newPassword: string) => { success: boolean; error?: string };
  updateUserPin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  updateUserProfile: (updates: Partial<Omit<User, 'id' | 'role' | 'createdAt'>>) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (avatarUrl: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getCredentialsOverrides = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('cuanly_credentials_override') || '{}');
  } catch {
    return {};
  }
};

const getAuthLocale = (): 'en' | 'id' => {
  if (typeof window === 'undefined') return 'en';
  try {
    return (localStorage.getItem('cuanly_locale') as 'en' | 'id') || 'en';
  } catch {
    return 'en';
  }
};

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
      localStorage.removeItem('cuanly_auth_token');
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
      return {
        success: false,
        error:
          getAuthLocale() === 'en'
            ? 'Username or Email and Password are required.'
            : 'Username atau Email serta Password wajib diisi.',
      };
    }

    const overrides = getCredentialsOverrides();

    // 1. Demo User Hardcoded Local Login (stays hardcoded without BE integration)
    const isDemoUserMatch =
      (cleanId === DEMO_USER.email.toLowerCase() ||
       cleanId === DEMO_USER.username?.toLowerCase() ||
       cleanId === 'user') &&
      (cleanPin === DEMO_USER.pin || cleanPin === (DEMO_USER.password || 'user123') || cleanPin === '123456');

    if (isDemoUserMatch) {
      const expectedUserPassword =
        overrides['usr_demo_01'] ||
        overrides['user'] ||
        overrides['user@cuanly.com'] ||
        DEMO_USER.password ||
        DEMO_USER.pin ||
        '123456';
      localStorage.removeItem('cuanly_auth_token');
      persistSession({ ...DEMO_USER, password: expectedUserPassword, pin: expectedUserPassword });
      return { success: true };
    }

    // 2. Demo Admin Hardcoded Local Login (via Demo PIN 999999 or hardcoded admin overrides)
    if (cleanPin === '999999' && (cleanId === 'admin' || cleanId === 'admin@cuanly.com')) {
      localStorage.removeItem('cuanly_auth_token');
      persistSession({ ...DEMO_ADMIN, password: '999999', pin: '999999' });
      return { success: true };
    }

    // 3. Live Backend Authentication (Live Admin admin/admin123 & Registered Accounts via Username/Email + Password/PIN)
    try {
      const res = await authApi.login({ identifier: cleanId, password: cleanPin });
      if (res && res.success && res.user) {
        if (res.token) {
          localStorage.setItem('cuanly_auth_token', res.token);
        }
        persistSession({
          ...res.user,
          password: cleanPin,
          pin: cleanPin,
        });
        return { success: true };
      }
    } catch (apiErr: any) {
      // If error is 401 or invalid credentials, capture it
      if (apiErr.statusCode === 401) {
        return {
          success: false,
          error: apiErr.message || (getAuthLocale() === 'en' ? 'Invalid credentials' : 'Password atau kredensial salah'),
        };
      }
      console.warn('Backend login attempt fell back to local registry:', apiErr.message);
    }

    // 4. Local Registered Users fallback (if backend is unreachable or local-only)
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('cuanly_registered_users') || '[]');
      const found = registeredUsers.find((u: User) => {
        const matchesEmail = u.email && u.email.toLowerCase() === cleanId;
        const matchesUsername = u.username && u.username.toLowerCase() === cleanId;
        return matchesEmail || matchesUsername;
      });
      if (found) {
        const expectedPassword =
          overrides[found.id] ||
          (found.username ? overrides[found.username.toLowerCase()] : undefined) ||
          overrides[found.email.toLowerCase()] ||
          found.password ||
          found.pin;

        if (cleanPin === expectedPassword) {
          persistSession({ ...found, password: expectedPassword, pin: expectedPassword });
          return { success: true };
        } else {
          return {
            success: false,
            error:
              getAuthLocale() === 'en'
                ? 'Incorrect account password.'
                : 'Password akun tidak sesuai.',
          };
        }
      }
    } catch {
      // ignore
    }

    return {
      success: false,
      error:
        getAuthLocale() === 'en'
          ? 'Invalid credentials. Please use admin / admin123, registered account, or demo (user / 123456).'
          : 'Kredensial tidak sesuai. Gunakan akun admin / admin123, akun registrasi, atau demo (user / 123456).',
    };
  };

  const loginAsDemo = (targetRole: Role) => {
    localStorage.removeItem('cuanly_auth_token');
    const selected = targetRole === 'ADMIN' ? DEMO_ADMIN : DEMO_USER;
    const overrides = getCredentialsOverrides();
    const effectiveCred =
      overrides[selected.id] ||
      (selected.username ? overrides[selected.username.toLowerCase()] : undefined) ||
      (selected.email ? overrides[selected.email.toLowerCase()] : undefined) ||
      selected.password ||
      selected.pin;
    persistSession({ ...selected, password: effectiveCred, pin: effectiveCred });
  };

  const register = async (
    name: string,
    email: string,
    passwordOrPin: string,
    username?: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || !email || !passwordOrPin) {
      return {
        success: false,
        error:
          getAuthLocale() === 'en' ? 'All fields are required.' : 'Semua kolom wajib diisi.',
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passwordOrPin.trim();
    const resolvedUsername = username
      ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '');

    // 1. Try Backend Registration
    try {
      const res = await authApi.register({
        name: name.trim(),
        email: cleanEmail,
        password: cleanPass,
        pin: cleanPass,
        username: resolvedUsername,
        phone: phone?.trim(),
      });

      if (res && res.success && res.user) {
        if (res.token) {
          localStorage.setItem('cuanly_auth_token', res.token);
        }
        const createdUser: User = {
          ...res.user,
          password: cleanPass,
          pin: cleanPass,
        };
        // Also save to registeredUsers in local cache
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('cuanly_registered_users') || '[]');
          registeredUsers.push(createdUser);
          localStorage.setItem('cuanly_registered_users', JSON.stringify(registeredUsers));

          const overrides = getCredentialsOverrides();
          overrides[createdUser.id] = cleanPass;
          overrides[cleanEmail] = cleanPass;
          if (resolvedUsername) overrides[resolvedUsername] = cleanPass;
          localStorage.setItem('cuanly_credentials_override', JSON.stringify(overrides));
        } catch {}

        persistSession(createdUser);
        return { success: true };
      }
    } catch (apiErr: any) {
      if (apiErr.statusCode === 409 || apiErr.statusCode === 400) {
        return {
          success: false,
          error: apiErr.message || (getAuthLocale() === 'en' ? 'Registration failed' : 'Registrasi gagal'),
        };
      }
      console.warn('Backend register attempt fell back to local:', apiErr.message);
    }

    // Fallback local registration
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      username: resolvedUsername,
      email: cleanEmail,
      phone: phone?.trim(),
      role: 'USER',
      password: cleanPass,
      pin: cleanPass,
      createdAt: new Date().toISOString(),
    };

    try {
      const registeredUsers = JSON.parse(localStorage.getItem('cuanly_registered_users') || '[]');
      registeredUsers.push(newUser);
      localStorage.setItem('cuanly_registered_users', JSON.stringify(registeredUsers));

      const overrides = getCredentialsOverrides();
      overrides[newUser.id] = cleanPass;
      overrides[cleanEmail] = cleanPass;
      if (resolvedUsername) overrides[resolvedUsername] = cleanPass;
      localStorage.setItem('cuanly_credentials_override', JSON.stringify(overrides));

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

  const updateUserPassword = (
    oldPassword: string,
    newPassword: string
  ): { success: boolean; error?: string } => {
    const isEn = getAuthLocale() === 'en';
    if (!user) return { success: false, error: isEn ? 'User not found.' : 'User tidak ditemukan.' };

    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();

    if (!cleanOld) {
      return { success: false, error: isEn ? 'Current password is required.' : 'Password saat ini wajib diisi.' };
    }

    const overrides = getCredentialsOverrides();
    const currentExpected =
      overrides[user.id] ||
      (user.username ? overrides[user.username.toLowerCase()] : undefined) ||
      (user.email ? overrides[user.email.toLowerCase()] : undefined) ||
      user.password ||
      user.pin ||
      (user.role === 'ADMIN' ? '999999' : '123456');

    // Also accept default pins or passwords if unchanged
    const isValidOld =
      cleanOld === currentExpected ||
      cleanOld === user.password ||
      cleanOld === user.pin ||
      (user.role === 'ADMIN' && (cleanOld === '999999' || cleanOld === 'admin123')) ||
      (user.role === 'USER' && (cleanOld === '123456' || cleanOld === 'user123'));

    if (!isValidOld) {
      return { success: false, error: isEn ? 'Current password does not match.' : 'Password saat ini tidak cocok.' };
    }

    if (cleanNew.length < 6) {
      return { success: false, error: isEn ? 'New password must be at least 6 characters.' : 'Password baru minimal harus 6 karakter.' };
    }

    if (cleanNew === cleanOld) {
      return { success: false, error: isEn ? 'New password cannot be the same as current password.' : 'Password baru tidak boleh sama dengan password saat ini.' };
    }

    const updatedUser: User = {
      ...user,
      password: cleanNew,
      pin: cleanNew,
    };
    setUser(updatedUser);

    try {
      localStorage.setItem('cuanly_auth_user', JSON.stringify(updatedUser));

      // Persist credentials override
      const newOverrides = { ...overrides };
      if (user.id) newOverrides[user.id] = cleanNew;
      if (user.email) newOverrides[user.email.toLowerCase()] = cleanNew;
      if (user.username) newOverrides[user.username.toLowerCase()] = cleanNew;
      if (user.role === 'ADMIN' && (user.id === DEMO_ADMIN.id || user.username === 'admin')) {
        newOverrides['admin'] = cleanNew;
        newOverrides['admin@cuanly.com'] = cleanNew;
      }
      if (user.role === 'USER' && (user.id === DEMO_USER.id || user.username === 'user')) {
        newOverrides['user'] = cleanNew;
        newOverrides['user@cuanly.com'] = cleanNew;
      }
      localStorage.setItem('cuanly_credentials_override', JSON.stringify(newOverrides));

      // Update in cuanly_registered_users if present
      const storedUsers = localStorage.getItem('cuanly_registered_users');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed)) {
          const index = parsed.findIndex((u: User) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
          if (index !== -1) {
            parsed[index] = { ...parsed[index], password: cleanNew, pin: cleanNew };
            localStorage.setItem('cuanly_registered_users', JSON.stringify(parsed));
          }
        }
      }

      // Update in cuanly_admin_users if present
      const storedAdminUsers = localStorage.getItem('cuanly_admin_users');
      if (storedAdminUsers) {
        const parsedAdmin = JSON.parse(storedAdminUsers);
        if (Array.isArray(parsedAdmin)) {
          const idx = parsedAdmin.findIndex((u: User) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
          if (idx !== -1) {
            parsedAdmin[idx] = { ...parsedAdmin[idx], password: cleanNew, pin: cleanNew };
            localStorage.setItem('cuanly_admin_users', JSON.stringify(parsedAdmin));
          }
        }
      }
    } catch {
      // ignore
    }

    return { success: true };
  };

  const updateUserPin = (oldPin: string, newPin: string): { success: boolean; error?: string } => {
    return updateUserPassword(oldPin, newPin);
  };

  const updateUserProfile = async (
    updates: Partial<Omit<User, 'id' | 'role' | 'createdAt'>>
  ): Promise<{ success: boolean; error?: string }> => {
    const isEn = getAuthLocale() === 'en';
    if (!user) return { success: false, error: isEn ? 'User not found.' : 'User tidak ditemukan.' };

    if (updates.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email.trim())) {
        return { success: false, error: isEn ? 'Invalid email format.' : 'Format email tidak valid.' };
      }
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      return { success: false, error: isEn ? 'Full name cannot be empty.' : 'Nama lengkap tidak boleh kosong.' };
    }

    let finalAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl;

    // Synchronize with backend API if user has active session
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('cuanly_auth_token');
      if (token) {
        try {
          const apiRes = await authApi.updateProfile({
            name: updates.name !== undefined ? updates.name.trim() : user.name,
            username: updates.username !== undefined ? updates.username.trim() : user.username,
            email: updates.email !== undefined ? updates.email.trim() : user.email,
            phone: updates.phone !== undefined ? updates.phone.trim() : user.phone,
            avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl,
          });
          if (apiRes?.user?.avatarUrl !== undefined) {
            finalAvatar = apiRes.user.avatarUrl;
          }
        } catch (apiErr: any) {
          console.warn('Backend updateProfile sync notice:', apiErr);
          const errMsg = apiErr?.response?.data?.message;
          if (errMsg && typeof errMsg === 'string') {
            return { success: false, error: errMsg };
          }
        }
      }
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : user.name,
      username: updates.username !== undefined ? updates.username.trim() : user.username,
      email: updates.email !== undefined ? updates.email.trim() : user.email,
      phone: updates.phone !== undefined ? updates.phone.trim() : user.phone,
      avatarUrl: finalAvatar,
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

  const uploadAvatar = async (avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
    return updateUserProfile({ avatarUrl });
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
        updateUserPassword,
        updateUserPin,
        updateUserProfile,
        uploadAvatar,
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
