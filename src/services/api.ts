import { apiClient } from './apiClient';
import { User, Transaction, Category, BudgetLimit, FinancialSummary, Mitra, Complaint, Wallet, DebtItem, WorkspaceMember } from '@/types';

export const authApi = {
  login: (data: { identifier: string; password: string }) =>
    apiClient.post<{ success: boolean; token: string; user: User }>('/auth/login', data),

  register: (data: { name: string; email: string; password: string; pin?: string; username?: string; phone?: string }) =>
    apiClient.post<{ success: boolean; token: string; user: User }>('/auth/register', data),

  getMe: () =>
    apiClient.get<{ success: boolean; user: User }>('/auth/me'),

  updatePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient.put<{ success: boolean; message: string }>('/auth/password', data),

  updateProfile: (data: Partial<Omit<User, 'id' | 'role' | 'createdAt'>>) =>
    apiClient.put<{ success: boolean; user: User }>('/auth/profile', data),

  uploadAvatar: (avatarUrl: string) =>
    apiClient.post<{ success: boolean; user: User }>('/auth/avatar', { avatarUrl }),

  logout: () =>
    apiClient.post<{ success: boolean }>('/auth/logout'),
};

export const usersApi = {
  getSettings: () =>
    apiClient.get<{ success: boolean; settings: any }>('/users/settings'),

  updateSettings: (data: any) =>
    apiClient.put<{ success: boolean; message: string; settings: any }>('/users/settings', data),

  getAllUsers: () =>
    apiClient.get<{ success: boolean; users: User[] }>('/admin/users'),

  toggleUserStatus: (id: string) =>
    apiClient.put<{ success: boolean; message: string; user: User }>(`/admin/users/${id}/toggle-status`),
};

export const transactionsApi = {
  getAll: (filters?: { type?: string; category?: string; search?: string; period?: string }) =>
    apiClient.get<Transaction[]>('/transactions', { params: filters }),

  getById: (id: string) =>
    apiClient.get<Transaction>(`/transactions/${id}`),

  create: (data: Omit<Transaction, 'id' | 'createdAt'>) =>
    apiClient.post<Transaction>('/transactions', data),

  update: (id: string, data: Partial<Transaction>) =>
    apiClient.put<Transaction>(`/transactions/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; id: string }>(`/transactions/${id}`),
};

export const categoriesApi = {
  getAll: () =>
    apiClient.get<Category[]>('/categories'),

  create: (data: Omit<Category, 'id' | 'isSystem' | 'createdAt'>) =>
    apiClient.post<Category>('/categories', data),
};

export const financeApi = {
  getSummary: () =>
    apiClient.get<FinancialSummary>('/finance/summary'),

  getBudgets: (period?: string) =>
    apiClient.get<BudgetLimit[]>('/budgets', { params: { period } }),

  updateBudget: (categoryId: string, limitAmount: number, period?: string) =>
    apiClient.put<{ success: boolean; categoryId: string; newLimit: number }>(`/budgets/${categoryId}`, {
      limitAmount,
      period,
    }),

  updateAllowance: (monthlyAllowance: number) =>
    apiClient.put<{ success: boolean; monthlyAllowance: number }>('/finance/allowance', {
      monthlyAllowance,
    }),
};

export const walletsApi = {
  getAll: () =>
    apiClient.get<Wallet[]>('/wallets'),

  create: (data: Omit<Wallet, 'id'>) =>
    apiClient.post<{ success: boolean; wallet: Wallet }>('/wallets', data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; id: string }>(`/wallets/${id}`),
};

export const debtsApi = {
  getAll: () =>
    apiClient.get<DebtItem[]>('/debts'),

  create: (data: Omit<DebtItem, 'id' | 'createdAt'>) =>
    apiClient.post<{ success: boolean; debt: DebtItem }>('/debts', data),

  toggleSettle: (id: string) =>
    apiClient.put<{ success: boolean; debt: DebtItem }>(`/debts/${id}/settle`),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; id: string }>(`/debts/${id}`),
};

export const workspaceApi = {
  getMembers: () =>
    apiClient.get<WorkspaceMember[]>('/workspace/members'),

  addMember: (data: { name: string; email: string; role?: string }) =>
    apiClient.post<{ success: boolean; member: WorkspaceMember }>('/workspace/members', data),
};

export const ocrApi = {
  scan: (data: { sampleId?: string; imageUrl?: string }) =>
    apiClient.post<any>('/ocr/scan', data),
};

export const adminApi = {
  getStats: () =>
    apiClient.get<any>('/admin/stats'),

  getMitraList: () =>
    apiClient.get<Mitra[]>('/admin/mitra'),

  verifyMitra: (id: string, status: string, notes?: string) =>
    apiClient.put<{ success: boolean; mitra: Mitra }>(`/admin/mitra/${id}/verify`, { status, notes }),

  getComplaints: () =>
    apiClient.get<Complaint[]>('/admin/complaints'),

  updateComplaint: (id: string, status: string, resolutionNote?: string) =>
    apiClient.put<{ success: boolean; complaint: Complaint }>(`/admin/complaints/${id}/status`, {
      status,
      resolutionNote,
    }),
};
