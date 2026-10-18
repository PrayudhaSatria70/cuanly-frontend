'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mitra, Complaint, PlatformStats, User, VerificationStatus, ComplaintStatus } from '@/types';
import { INITIAL_MITRA, INITIAL_COMPLAINTS, DEMO_USER, DEMO_ADMIN } from '@/services/mockData';
import { adminApi, usersApi } from '@/services/api';

interface AdminContextType {
  mitraList: Mitra[];
  complaints: Complaint[];
  allUsers: User[];
  stats: PlatformStats;
  verifyMitra: (id: string, status: VerificationStatus, notes?: string) => void;
  updateComplaint: (id: string, status: ComplaintStatus, resolutionNote?: string) => void;
  toggleUserStatus: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mitraList, setMitraList] = useState<Mitra[]>(INITIAL_MITRA);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [allUsers, setAllUsers] = useState<User[]>([
    DEMO_USER,
    DEMO_ADMIN,
    {
      id: 'usr_02',
      name: 'Rian Pratama',
      email: 'rian@gmail.com',
      role: 'USER',
      phone: '0812-1111-2222',
      createdAt: '2026-02-10T00:00:00Z',
    },
    {
      id: 'usr_03',
      name: 'Anisa Kusuma',
      email: 'anisa.k@outlook.com',
      role: 'USER',
      phone: '0813-4444-5555',
      createdAt: '2026-03-01T00:00:00Z',
    },
  ]);

  useEffect(() => {
    try {
      const storedMitra = localStorage.getItem('cuanly_admin_mitra');
      if (storedMitra) setMitraList(JSON.parse(storedMitra));

      const storedComplaints = localStorage.getItem('cuanly_admin_complaints');
      if (storedComplaints) setComplaints(JSON.parse(storedComplaints));

      const storedUsers = localStorage.getItem('cuanly_admin_users');
      if (storedUsers) setAllUsers(JSON.parse(storedUsers));
    } catch {
      // ignore
    }

    // Live backend fetch for Admin
    const token = typeof window !== 'undefined' ? localStorage.getItem('cuanly_auth_token') : null;
    if (token) {
      Promise.all([
        adminApi.getMitraList().catch(() => null),
        adminApi.getComplaints().catch(() => null),
        usersApi.getAllUsers().catch(() => null),
      ]).then(([liveMitra, liveComplaints, liveUsersRes]) => {
        if (liveMitra && Array.isArray(liveMitra) && liveMitra.length > 0) {
          setMitraList(liveMitra);
        }
        if (liveComplaints && Array.isArray(liveComplaints) && liveComplaints.length > 0) {
          setComplaints(liveComplaints);
        }
        if (liveUsersRes && liveUsersRes.users && liveUsersRes.users.length > 0) {
          setAllUsers(liveUsersRes.users);
        }
      });
    }
  }, []);

  const persistMitra = (items: Mitra[]) => {
    setMitraList(items);
    try {
      localStorage.setItem('cuanly_admin_mitra', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const persistComplaints = (items: Complaint[]) => {
    setComplaints(items);
    try {
      localStorage.setItem('cuanly_admin_complaints', JSON.stringify(items));
    } catch {
      // ignore
    }
  };

  const verifyMitra = (id: string, status: VerificationStatus, notes?: string) => {
    const updated = mitraList.map((m) =>
      m.id === id ? { ...m, verificationStatus: status, notes: notes || m.notes } : m
    );
    persistMitra(updated);

    if (typeof window !== 'undefined' && localStorage.getItem('cuanly_auth_token')) {
      adminApi.verifyMitra(id, status, notes).catch((err) => {
        console.warn('Backend verifyMitra warning:', err.message);
      });
    }
  };

  const updateComplaint = (id: string, status: ComplaintStatus, resolutionNote?: string) => {
    const updated = complaints.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            resolutionNote: resolutionNote !== undefined ? resolutionNote : c.resolutionNote,
            updatedAt: new Date().toISOString(),
          }
        : c
    );
    persistComplaints(updated);

    if (typeof window !== 'undefined' && localStorage.getItem('cuanly_auth_token')) {
      adminApi.updateComplaint(id, status, resolutionNote).catch((err) => {
        console.warn('Backend updateComplaint warning:', err.message);
      });
    }
  };

  const toggleUserStatus = (id: string) => {
    // Simulated toggle
    setAllUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, name: u.name.includes('(Nonaktif)') ? u.name.replace(' (Nonaktif)', '') : `${u.name} (Nonaktif)` } : u))
    );

    if (typeof window !== 'undefined' && localStorage.getItem('cuanly_auth_token')) {
      usersApi.toggleUserStatus(id).catch((err) => {
        console.warn('Backend toggleUserStatus warning:', err.message);
      });
    }
  };

  const stats: PlatformStats = {
    totalUsers: allUsers.length + 1280, // Realistic platform scale
    totalVolume: 185450000,
    activeMitraCount: mitraList.filter((m) => m.verificationStatus === 'VERIFIED').length,
    pendingVerificationsCount: mitraList.filter((m) => m.verificationStatus === 'PENDING').length,
    openComplaintsCount: complaints.filter((c) => c.status !== 'RESOLVED').length,
  };

  return (
    <AdminContext.Provider
      value={{
        mitraList,
        complaints,
        allUsers,
        stats,
        verifyMitra,
        updateComplaint,
        toggleUserStatus,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
