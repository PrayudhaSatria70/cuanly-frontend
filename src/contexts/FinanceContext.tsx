'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Category, BudgetLimit, FinancialSummary } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_BUDGETS, INITIAL_TRANSACTIONS } from '@/services/mockData';
import { transactionsApi, categoriesApi, financeApi } from '@/services/api';

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
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [budgets, setBudgets] = useState<BudgetLimit[]>(INITIAL_BUDGETS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [monthlyAllowance, setMonthlyAllowanceState] = useState<number>(6700000);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTx = localStorage.getItem('cuanly_transactions');
      if (storedTx) setTransactions(JSON.parse(storedTx));

      const storedBudgets = localStorage.getItem('cuanly_budgets');
      if (storedBudgets) setBudgets(JSON.parse(storedBudgets));

      const storedCategories = localStorage.getItem('cuanly_categories');
      if (storedCategories) setCategories(JSON.parse(storedCategories));

      const storedAllowance = localStorage.getItem('cuanly_monthly_allowance');
      if (storedAllowance) {
        const parsed = Number(storedAllowance);
        if (!isNaN(parsed) && parsed > 0) setMonthlyAllowanceState(parsed);
      }
    } catch {
      // fallback to initial
    }
  }, []);

  // Save to localStorage when state updates
  const persistTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    try {
      localStorage.setItem('cuanly_transactions', JSON.stringify(newTx));
    } catch {
      // ignore
    }
  };

  const persistBudgets = (newBudgets: BudgetLimit[]) => {
    setBudgets(newBudgets);
    try {
      localStorage.setItem('cuanly_budgets', JSON.stringify(newBudgets));
    } catch {
      // ignore
    }
  };

  const setMonthlyAllowance = (amount: number) => {
    setMonthlyAllowanceState(amount);
    try {
      localStorage.setItem('cuanly_monthly_allowance', amount.toString());
    } catch {
      // ignore
    }
  };

  const resetToDefaultData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setCategories(INITIAL_CATEGORIES);
    setMonthlyAllowanceState(6700000);
    try {
      localStorage.setItem('cuanly_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('cuanly_budgets', JSON.stringify(INITIAL_BUDGETS));
      localStorage.setItem('cuanly_categories', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem('cuanly_monthly_allowance', '6700000');
    } catch {
      // ignore
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
        localStorage.setItem('cuanly_categories', JSON.stringify(data.categories));
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
    const limit = budget ? budget.limitAmount : 1000000;
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
      if (info.percent >= 80) {
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
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}`,
      currency: data.currency || 'IDR',
      currencySymbol: data.currencySymbol || 'Rp',
      categoryName: targetCat ? targetCat.fallbackName : data.categoryName,
      categorySlug: targetCat ? targetCat.slug : data.categorySlug,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTx, ...transactions];
    persistTransactions(updated);
    setIsWarningDismissed(false); // Reset warning if new expense alters limit
    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    persistTransactions(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    persistTransactions(updated);
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
          userId: 'usr_demo_01',
          categoryId,
          categorySlug: slug,
          limitAmount,
          period: '2026-10',
        },
      ];
    }
    persistBudgets(updated);
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
