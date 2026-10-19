import { apiClient } from './apiClient';
import {
  User,
  Transaction,
  Category,
  BudgetLimit,
  FinancialSummary,
  Mitra,
  Complaint,
  Wallet,
  DebtItem,
  WorkspaceMember,
  InvestmentAsset,
  InvestmentSummary,
  BankConnection,
  AiInsightsData,
  BusinessProfile,
  BusinessCashflow,
  BusinessTaxReport,
} from '@/types';

export const authApi = {
  login: (data: { identifier: string; password: string }) =>
    apiClient.post<{ success: boolean; token: string; user: User }>('/auth/login', data),

  register: (data: { name: string; email: string; password: string; pin?: string; username?: string; phone?: string; plan?: string; subscriptionTier?: string }) =>
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

export const pricingApi = {
  getPlans: () =>
    apiClient.get<{ success: boolean; plans: any[] }>('/pricing'),

  getMyPlan: () =>
    apiClient.get<{
      success: boolean;
      currentTier: string;
      effectivePlan: any;
      isAdmin: boolean;
      allPlans: any[];
    }>('/pricing/my-plan'),

  upgrade: (plan: string) =>
    apiClient.post<{ success: boolean; message: string; tier: string; user: User }>('/pricing/upgrade', { plan }),

  subscribe: (plan: string) =>
    apiClient.put<{ success: boolean; message: string; tier: string; user: User }>('/pricing/subscribe', { plan }),
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

export const investmentsApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; items: InvestmentAsset[]; summary: InvestmentSummary }>('/investments'),

  create: (data: { name: string; category: string; quantity?: number; buyPrice: number; currentPrice: number; notes?: string }) =>
    apiClient.post<{ success: boolean; asset: InvestmentAsset }>('/investments', data),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean; id: string }>(`/investments/${id}`),
};

export const bankSyncApi = {
  getConnections: () =>
    apiClient.get<{ success: boolean; connections: BankConnection[] }>('/bank-sync/connections'),

  connect: (data: { institution: string; accountNumber: string; accountName: string; autoSync?: boolean }) =>
    apiClient.post<{ success: boolean; connection: BankConnection }>('/bank-sync/connect', data),

  syncNow: (id: string) =>
    apiClient.post<{ success: boolean; message: string; syncedTransactionsCount: number; connection: BankConnection }>(`/bank-sync/sync/${id}`),

  disconnect: (id: string) =>
    apiClient.delete<{ success: boolean; id: string }>(`/bank-sync/${id}`),
};

export const aiAnalyticsApi = {
  getInsights: () =>
    apiClient.get<{ success: boolean; insights: AiInsightsData }>('/ai-analytics/insights'),
};

export const businessApi = {
  getProfile: () =>
    apiClient.get<{ success: boolean; profile: BusinessProfile }>('/business/profile'),

  updateProfile: (data: { businessName: string; npwp?: string; annualRevenue?: number; operatingExpense?: number }) =>
    apiClient.post<{ success: boolean; profile: BusinessProfile }>('/business/profile', data),

  getCashflow: () =>
    apiClient.get<{ success: boolean; cashflow: BusinessCashflow }>('/business/cashflow'),

  getTaxReport: () =>
    apiClient.get<{ success: boolean; taxReport: BusinessTaxReport }>('/business/tax-report'),
};

