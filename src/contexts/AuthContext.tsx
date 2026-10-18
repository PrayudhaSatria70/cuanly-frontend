'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { DEMO_USER, DEMO_ADMIN } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (identifier: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: Role) => void;
  register: (name: string, email: string, pin: string, username?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cuanly_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Require explicit login by default
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

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
      setUser(DEMO_ADMIN);
      localStorage.setItem('cuanly_auth_user', JSON.stringify(DEMO_ADMIN));
      return { success: true };
    }

    // 2. Check Demo User (Username 'user' or email 'user@cuanly.com')
    const isUserMatch =
      cleanId === DEMO_USER.email.toLowerCase() ||
      cleanId === DEMO_USER.username?.toLowerCase() ||
      cleanId === 'user';
    if (isUserMatch && cleanPin === DEMO_USER.pin) {
      setUser(DEMO_USER);
      localStorage.setItem('cuanly_auth_user', JSON.stringify(DEMO_USER));
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
        setUser(found);
        localStorage.setItem('cuanly_auth_user', JSON.stringify(found));
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
      setUser(newUser);
      localStorage.setItem('cuanly_auth_user', JSON.stringify(newUser));
      return { success: true };
    }

    return {
      success: false,
      error: 'Kredensial tidak sesuai. Gunakan akun demo (Username: user / 123456 atau admin / 999999).',
    };
  };

  const loginAsDemo = (targetRole: Role) => {
    const selected = targetRole === 'ADMIN' ? DEMO_ADMIN : DEMO_USER;
    setUser(selected);
    try {
      localStorage.setItem('cuanly_auth_user', JSON.stringify(selected));
    } catch {
      // ignore
    }
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
      setUser(newUser);
      localStorage.setItem('cuanly_auth_user', JSON.stringify(newUser));
      return { success: true };
    } catch {
      setUser(newUser);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('cuanly_auth_user');
    } catch {
      // ignore
    }
  };

  const switchRole = () => {
    if (user?.role === 'ADMIN') {
      loginAsDemo('USER');
    } else {
      loginAsDemo('ADMIN');
    }
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
