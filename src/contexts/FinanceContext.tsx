'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Category, BudgetLimit, FinancialSummary } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from '@/services/mockData';
import { transactionsApi, categoriesApi, financeApi } from '@/services/api';
import { useAuth } from './AuthContext';

interface CategoryBudgetInfo {
  limit: number;
  spent: number;
  percent: number;
  status: 'SAFE' | 'WARNING' | 'DANGER';
}

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetLimit[];
  monthlyAllowance: number;
  setMonthlyAllowance: (newAllowance: number) => void;
  summary: FinancialSummary;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (categoryId: string, limitAmount: number) => void;
  getCategorySpent: (categoryIdOrSlug: string) => number;
  getCategoryBudgetInfo: (categoryIdOrSlug: string) => CategoryBudgetInfo;
  activeBudgetWarning: { categoryId: string; categoryName: string; categorySlug: string; percent: number; isOverbudget: boolean } | null;
  dismissWarning: () => void;
  resetToDefaultData: () => void;
  importFinancialData: (data: { transactions?: Transaction[]; budgets?: BudgetLimit[]; monthlyAllowance?: number; categories?: Category[] }) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const isDemoUser = userId === 'usr_demo_1';

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyAllowance, setMonthlyAllowanceState] = useState<number>(0);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  // Synchronize and initialize user-scoped financial data
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      setMonthlyAllowanceState(0);
      return;
    }

    if (isDemoUser) {
      // Demo account loads demo dataset
      try {
        const storedTx = localStorage.getItem('cuanly_transactions_usr_demo_1') || localStorage.getItem('cuanly_transactions');
        setTransactions(storedTx ? JSON.parse(storedTx) : INITIAL_TRANSACTIONS);

        const storedBudgets = localStorage.getItem('cuanly_budgets_usr_demo_1') || localStorage.getItem('cuanly_budgets');
        setBudgets(storedBudgets ? JSON.parse(storedBudgets) : INITIAL_BUDGETS);

        const storedAllowance = localStorage.getItem('cuanly_monthly_allowance_usr_demo_1') || localStorage.getItem('cuanly_monthly_allowance');
        setMonthlyAllowanceState(storedAllowance ? Number(storedAllowance) : 6700000);
      } catch {
        setTransactions(INITIAL_TRANSACTIONS);
        setBudgets(INITIAL_BUDGETS);
        setMonthlyAllowanceState(6700000);
      }
      return;
    }

    // Registered user: strictly user-scoped data starting from 0
    try {
      const userTxKey = `cuanly_transactions_${userId}`;
      const userBudgetKey = `cuanly_budgets_${userId}`;
      const userAllowanceKey = `cuanly_monthly_allowance_${userId}`;

      const storedTx = localStorage.getItem(userTxKey);
      const storedBudgets = localStorage.getItem(userBudgetKey);
      const storedAllowance = localStorage.getItem(userAllowanceKey);

      setTransactions(storedTx ? JSON.parse(storedTx) : []);
      setBudgets(storedBudgets ? JSON.parse(storedBudgets) : []);
      setMonthlyAllowanceState(storedAllowance ? Number(storedAllowance) : 0);
    } catch {
      setTransactions([]);
      setBudgets([]);
      setMonthlyAllowanceState(0);
    }

    // Fetch live user data from Database via Backend API
    transactionsApi
      .getAll()
      .then((items) => {
        if (Array.isArray(items)) {
          setTransactions(items);
          try {
            localStorage.setItem(`cuanly_transactions_${userId}`, JSON.stringify(items));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Backend transactions sync notice (offline or local session):', err?.message);
      });

    financeApi
      .getBudgets()
      .then((items) => {
        if (Array.isArray(items)) {
          setBudgets(items);
          try {
            localStorage.setItem(`cuanly_budgets_${userId}`, JSON.stringify(items));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Backend budgets sync notice (offline or local session):', err?.message);
      });

    financeApi
      .getSummary()
      .then((sum) => {
        if (sum && typeof sum.monthlyAllowance === 'number' && sum.monthlyAllowance > 0) {
          setMonthlyAllowanceState(sum.monthlyAllowance);
          try {
            localStorage.setItem(`cuanly_monthly_allowance_${userId}`, sum.monthlyAllowance.toString());
          } catch {}
        }
      })
      .catch(() => {});
  }, [user, userId, isDemoUser]);

  // Save to localStorage when state updates
  const persistTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    try {
      const key = userId ? `cuanly_transactions_${userId}` : 'cuanly_transactions';
      localStorage.setItem(key, JSON.stringify(newTx));
    } catch {
      // ignore
    }
  };

  const persistBudgets = (newBudgets: BudgetLimit[]) => {
    setBudgets(newBudgets);
    try {
      const key = userId ? `cuanly_budgets_${userId}` : 'cuanly_budgets';
      localStorage.setItem(key, JSON.stringify(newBudgets));
    } catch {
      // ignore
    }
  };

  const setMonthlyAllowance = (amount: number) => {
    setMonthlyAllowanceState(amount);
    try {
      const key = userId ? `cuanly_monthly_allowance_${userId}` : 'cuanly_monthly_allowance';
      localStorage.setItem(key, amount.toString());
    } catch {
      // ignore
    }

    // Persist to PostgreSQL database via Backend API
    financeApi.updateAllowance(amount).catch((err) => {
      console.warn('Backend allowance sync notice:', err?.message);
    });
  };

  const resetToDefaultData = () => {
    if (isDemoUser) {
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setCategories(INITIAL_CATEGORIES);
      setMonthlyAllowanceState(6700000);
      try {
        localStorage.setItem('cuanly_transactions_usr_demo_1', JSON.stringify(INITIAL_TRANSACTIONS));
        localStorage.setItem('cuanly_budgets_usr_demo_1', JSON.stringify(INITIAL_BUDGETS));
        localStorage.setItem('cuanly_monthly_allowance_usr_demo_1', '6700000');
      } catch {}
    } else {
      setTransactions([]);
      setBudgets([]);
      setCategories(INITIAL_CATEGORIES);
      setMonthlyAllowanceState(0);
      if (userId) {
        try {
          localStorage.removeItem(`cuanly_transactions_${userId}`);
          localStorage.removeItem(`cuanly_budgets_${userId}`);
          localStorage.removeItem(`cuanly_monthly_allowance_${userId}`);
        } catch {}
      }
    }
  };

  const importFinancialData = (data: {
    transactions?: Transaction[];
    budgets?: BudgetLimit[];
    monthlyAllowance?: number;
    categories?: Category[];
  }) => {
    if (data.transactions && Array.isArray(data.transactions)) {
      persistTransactions(data.transactions);
    }
    if (data.budgets && Array.isArray(data.budgets)) {
      persistBudgets(data.budgets);
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
      try {
        const key = userId ? `cuanly_categories_${userId}` : 'cuanly_categories';
        localStorage.setItem(key, JSON.stringify(data.categories));
      } catch {
        // ignore
      }
    }
    if (data.monthlyAllowance && typeof data.monthlyAllowance === 'number') {
      setMonthlyAllowance(data.monthlyAllowance);
    }
  };

  // Helper to calculate spending per category in current month
  const getCategorySpent = useCallback((categoryIdOrSlug: string): number => {
    const target = categories.find(
      (c) => c.id === categoryIdOrSlug || c.slug === categoryIdOrSlug
    );
    if (!target) return 0;

    return transactions
      .filter((t) => t.type === 'EXPENSE' && (t.categoryId === target.id || t.categorySlug === target.slug))
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [categories, transactions]);

  const getCategoryBudgetInfo = useCallback((categoryIdOrSlug: string): CategoryBudgetInfo => {
    const target = categories.find(
      (c) => c.id === categoryIdOrSlug || c.slug === categoryIdOrSlug
    );
    if (!target) {
      return { limit: 0, spent: 0, percent: 0, status: 'SAFE' };
    }

    const budget = budgets.find(
      (b) => b.categoryId === target.id || b.categorySlug === target.slug
    );
    const limit = budget ? budget.limitAmount : 0;
    const spent = getCategorySpent(target.id);
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    let status: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
    if (percent >= 100) {
      status = 'DANGER';
    } else if (percent >= 75) {
      status = 'WARNING';
    }

    return { limit, spent, percent, status };
  }, [categories, budgets, getCategorySpent]);

  // Overall financial summary calculation
  const summary: FinancialSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INCOME') totalIncome += tx.amount;
      if (tx.type === 'EXPENSE') totalExpense += tx.amount;
    });

    const totalBudgetLimit = monthlyAllowance > 0 ? monthlyAllowance : budgets.reduce((acc, b) => acc + b.limitAmount, 0);
    const totalBudgetSpent = categories
      .filter((c) => c.type === 'EXPENSE')
      .reduce((acc, c) => acc + getCategorySpent(c.id), 0);

    const remainingBudget = Math.max(0, totalBudgetLimit - totalBudgetSpent);
    const totalBalance = totalIncome - totalExpense;

    return {
      totalBalance,
      thisMonthIncome: totalIncome,
      thisMonthExpense: totalExpense,
      totalBudgetLimit,
      totalBudgetSpent,
      remainingBudget,
      monthlyAllowance: totalBudgetLimit,
    };
  }, [transactions, budgets, categories, getCategorySpent, monthlyAllowance]);

  // Active budget warning detection (find first category >= 80%)
  const activeBudgetWarning = useMemo(() => {
    if (isWarningDismissed) return null;

    for (const cat of categories.filter((c) => c.type === 'EXPENSE')) {
      const info = getCategoryBudgetInfo(cat.id);
      if (info.limit > 0 && info.percent >= 80) {
        return {
          categoryId: cat.id,
          categoryName: cat.fallbackName,
          categorySlug: cat.slug,
          percent: info.percent,
          isOverbudget: info.percent >= 100,
        };
      }
    }
    return null;
  }, [categories, getCategoryBudgetInfo, isWarningDismissed]);

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const targetCat = categories.find((c) => c.id === data.categoryId || c.slug === data.categorySlug);
    const tempId = `tx_${Date.now()}`;
    const newTx: Transaction = {
      ...data,
      id: tempId,
      userId: userId || 'usr_registered',
      currency: data.currency || 'IDR',
      currencySymbol: data.currencySymbol || 'Rp',
      categoryName: targetCat ? targetCat.fallbackName : data.categoryName,
      categorySlug: targetCat ? targetCat.slug : data.categorySlug,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    persistTransactions(updated);
    setIsWarningDismissed(false);

    // Persist to PostgreSQL database via Backend API
    transactionsApi
      .create({
        userId: newTx.userId,
        type: newTx.type,
        amount: newTx.amount,
        categoryId: newTx.categoryId,
        categoryName: newTx.categoryName,
        categorySlug: newTx.categorySlug,
        date: newTx.date,
        notes: newTx.notes,
        currency: newTx.currency,
        currencySymbol: newTx.currencySymbol,
        walletId: newTx.walletId,
        receipt: newTx.receipt,
      })
      .then((saved) => {
        if (saved && saved.id) {
          setTransactions((prev) => {
            const synced = prev.map((t) => (t.id === tempId ? { ...t, id: saved.id } : t));
            if (userId) {
              try {
                localStorage.setItem(`cuanly_transactions_${userId}`, JSON.stringify(synced));
              } catch {}
            }
            return synced;
          });
        }
      })
      .catch((err) => {
        console.warn('DB transaction sync notice (offline or local session):', err?.message);
      });

    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    persistTransactions(updated);

    // Persist to PostgreSQL database via Backend API
    transactionsApi.update(id, updates).catch((err) => {
      console.warn('DB transaction update notice:', err?.message);
    });
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    persistTransactions(updated);

    // Persist to PostgreSQL database via Backend API
    transactionsApi.delete(id).catch((err) => {
      console.warn('DB transaction delete notice:', err?.message);
    });
  };

  const updateBudget = (categoryId: string, limitAmount: number) => {
    const existingIndex = budgets.findIndex((b) => b.categoryId === categoryId);
    let updated: BudgetLimit[];

    const cat = categories.find((c) => c.id === categoryId);
    const slug = cat ? cat.slug : categoryId;

    if (existingIndex >= 0) {
      updated = [...budgets];
      updated[existingIndex] = { ...updated[existingIndex], limitAmount };
    } else {
      updated = [
        ...budgets,
        {
          id: `bgt_${Date.now()}`,
          userId: userId || 'usr_registered',
          categoryId,
          categorySlug: slug,
          limitAmount,
          period: '2026-10',
        },
      ];
    }
    persistBudgets(updated);

    // Persist to PostgreSQL database via Backend API
    financeApi.updateBudget(categoryId, limitAmount).catch((err) => {
      console.warn('DB budget sync notice:', err?.message);
    });
  };

  const dismissWarning = () => {
    setIsWarningDismissed(true);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        budgets,
        monthlyAllowance,
        setMonthlyAllowance,
        summary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        getCategorySpent,
        getCategoryBudgetInfo,
        activeBudgetWarning,
        dismissWarning,
        resetToDefaultData,
        importFinancialData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
