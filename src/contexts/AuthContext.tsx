'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { DEMO_USER, DEMO_ADMIN } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: Role) => void;
  register: (name: string, email: string, pin: string) => Promise<{ success: boolean; error?: string }>;
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
        // Default to Demo User on first run for instant wow factor & testing
        setUser(DEMO_USER);
        localStorage.setItem('cuanly_auth_user', JSON.stringify(DEMO_USER));
      }
    } catch {
      setUser(DEMO_USER);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = async (email: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    // Quick credential matching
    if (email === DEMO_ADMIN.email && pin === DEMO_ADMIN.pin) {
      setUser(DEMO_ADMIN);
      localStorage.setItem('cuanly_auth_user', JSON.stringify(DEMO_ADMIN));
      return { success: true };
    }

    if (email === DEMO_USER.email && pin === DEMO_USER.pin) {
      setUser(DEMO_USER);
      localStorage.setItem('cuanly_auth_user', JSON.stringify(DEMO_USER));
      return { success: true };
    }

    // Check custom registered users from localStorage
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('cuanly_registered_users') || '[]');
      const found = registeredUsers.find((u: User) => u.email === email && u.pin === pin);
      if (found) {
        setUser(found);
        localStorage.setItem('cuanly_auth_user', JSON.stringify(found));
        return { success: true };
      }
    } catch {
      // ignore
    }

    // Allow flexible test login if valid format
    if (email.includes('@') && pin.length >= 4) {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'USER',
        pin,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('cuanly_auth_user', JSON.stringify(newUser));
      return { success: true };
    }

    return { success: false, error: 'Email atau PIN salah. Gunakan akun demo atau daftar.' };
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

  const register = async (name: string, email: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!name || !email || !pin) {
      return { success: false, error: 'Semua kolom wajib diisi.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'USER',
      pin,
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
