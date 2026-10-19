export type Role = 'USER' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'SILVER' | 'GOLD' | 'B2B';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: Role;
  subscriptionPlan?: SubscriptionTier;
  subscriptionTier?: SubscriptionTier;
  password?: string;
  pin?: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: 'CASH' | 'BANK' | 'E_WALLET' | 'SAVINGS';
  accountNumber?: string;
  balance: number;
  color?: string;
  isShared?: boolean;
}

export interface DebtItem {
  id: string;
  userId: string;
  type: 'DEBT' | 'RECEIVABLE'; // DEBT = Utang saya ke orang, RECEIVABLE = Piutang (orang berutang ke saya)
  personName: string;
  amount: number;
  dueDate: string;
  notes?: string;
  isSettled: boolean;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  avatarUrl?: string;
  status: 'ACTIVE' | 'INVITED';
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface ReceiptLineItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  totalAmount: number;
  receiptImageUrl: string;
  lineItems: ReceiptLineItem[];
  suggestedCategoryId: string;
  confidenceScore: number;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimals?: number;
  locale?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  currencySymbol?: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  date: string;
  notes?: string;
  receipt?: ReceiptData;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  nameKey: string; // key in i18n
  fallbackName: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface BudgetLimit {
  id: string;
  userId: string;
  categoryId: string;
  categorySlug: string;
  limitAmount: number;
  period: string; // YYYY-MM
}

export interface FinancialSummary {
  totalBalance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  totalBudgetLimit: number;
  totalBudgetSpent: number;
  remainingBudget: number;
  monthlyAllowance: number;
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Mitra {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  verificationStatus: VerificationStatus;
  submissionDate: string;
  documentType: string;
  documentNumber: string;
  notes?: string;
}

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Complaint {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  resolutionNote?: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalVolume: number;
  activeMitraCount: number;
  pendingVerificationsCount: number;
  openComplaintsCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  titleEn?: string;
  messageEn?: string;
  type: 'WARNING' | 'ALERT' | 'INFO' | 'SUCCESS';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export type Theme = 'light' | 'dark';

