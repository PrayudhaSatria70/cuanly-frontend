'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SubscriptionTier, Wallet, DebtItem, WorkspaceMember } from '@/types';
import { INITIAL_WALLETS, INITIAL_DEBTS, INITIAL_WORKSPACE_MEMBERS } from '@/services/mockData';
import { walletsApi, debtsApi, workspaceApi } from '@/services/api';
import { useAuth } from './AuthContext';

interface UpgradeModalData {
  featureName: string;
  requiredPlan: 'SILVER' | 'GOLD' | 'B2B';
  featureDescription?: string;
  benefits?: string[];
}

interface SubscriptionContextType {
  plan: SubscriptionTier;
  tier: SubscriptionTier;
  isAdmin: boolean;
  setPlan: (tier: SubscriptionTier) => void;
  setTier: (tier: SubscriptionTier) => void;
  hasAccess: (requiredPlan: SubscriptionTier) => boolean;
  upgradePlan: (newPlan: SubscriptionTier) => void;
  isUpgradeModalOpen: boolean;
  upgradeModalData: UpgradeModalData | null;
  openUpgradeModal: (
    featureName: string,
    requiredPlan: 'SILVER' | 'GOLD' | 'B2B',
    featureDescription?: string,
    benefits?: string[]
  ) => void;
  closeUpgradeModal: () => void;

  // Wallets feature (Free max 2, Silver+ Unlimited)
  wallets: Wallet[];
  addWallet: (wallet: Omit<Wallet, 'id'>) => { success: boolean; error?: string };
  deleteWallet: (id: string) => void;

  // Debt & Receivables feature (Gold+)
  debts: DebtItem[];
  addDebt: (debt: Omit<DebtItem, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  toggleSettleDebt: (id: string) => void;
  deleteDebt: (id: string) => void;

  // Shared Workspace feature (B2B)
  workspaceMembers: WorkspaceMember[];
  addWorkspaceMember: (name: string, email: string) => { success: boolean; error?: string };

  // Budget custom threshold (Gold+)
  warningThresholdPercent: number;
  setWarningThresholdPercent: (percent: number) => void;
}

const TIER_LEVELS: Record<SubscriptionTier, number> = {
  FREE: 0,
  SILVER: 1,
  GOLD: 2,
  B2B: 3,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const isAdmin = role === 'ADMIN' || user?.role === 'ADMIN';

  const [plan, setPlanState] = useState<SubscriptionTier>('FREE');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalData, setUpgradeModalData] = useState<UpgradeModalData | null>(null);

  // Wallets state
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_WALLETS);

  // Debts state (Gold)
  const [debts, setDebts] = useState<DebtItem[]>(INITIAL_DEBTS);

  // Workspace members (B2B)
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(INITIAL_WORKSPACE_MEMBERS);

  // Budgeting custom threshold percent (default 80%, Gold users can customize e.g. 50%, 75%, 90%)
  const [warningThresholdPercent, setWarningThresholdPercentState] = useState<number>(80);

  // Load subscription plan from localStorage on mount
  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem('cuanly_subscription_tier') as SubscriptionTier;
      if (storedPlan && ['FREE', 'SILVER', 'GOLD', 'B2B'].includes(storedPlan)) {
        setPlanState(storedPlan);
      } else {
        // Default to FREE so Canva-style premium locks and upgrade pop-up modals are visible
        setPlanState('FREE');
      }

      const storedWallets = localStorage.getItem('cuanly_wallets');
      if (storedWallets) {
        setWallets(JSON.parse(storedWallets));
      }

      const storedDebts = localStorage.getItem('cuanly_debts');
      if (storedDebts) {
        setDebts(JSON.parse(storedDebts));
      }

      const storedMembers = localStorage.getItem('cuanly_workspace_members');
      if (storedMembers) {
        setWorkspaceMembers(JSON.parse(storedMembers));
      }

      const storedThreshold = localStorage.getItem('cuanly_custom_budget_threshold');
      if (storedThreshold) {
        const parsed = Number(storedThreshold);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
          setWarningThresholdPercentState(parsed);
        }
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  const setPlan = useCallback((tier: SubscriptionTier) => {
    setPlanState(tier);
    try {
      localStorage.setItem('cuanly_subscription_tier', tier);
    } catch {
      // ignore
    }
  }, []);

  const upgradePlan = useCallback(
    (newPlan: SubscriptionTier) => {
      setPlan(newPlan);
      setIsUpgradeModalOpen(false);
      setUpgradeModalData(null);
    },
    [setPlan]
  );

  // Effective plan: Admin always has full features (B2B equivalent / no restrictions)
  const effectivePlan: SubscriptionTier = isAdmin ? 'B2B' : plan;

  const hasAccess = useCallback(
    (requiredPlan: SubscriptionTier): boolean => {
      // Admin and demo admin are strictly full feature and never restricted by pricing plans
      if (isAdmin) return true;
      return TIER_LEVELS[plan] >= TIER_LEVELS[requiredPlan];
    },
    [isAdmin, plan]
  );

  const openUpgradeModal = useCallback(
    (
      featureName: string,
      requiredPlan: 'SILVER' | 'GOLD' | 'B2B',
      featureDescription?: string,
      benefits?: string[]
    ) => {
      // Admin and demo admin never see the upgrade modal
      if (isAdmin) return;

      setUpgradeModalData({
        featureName,
        requiredPlan,
        featureDescription,
        benefits,
      });
      setIsUpgradeModalOpen(true);
    },
    [isAdmin]
  );

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalData(null);
  }, []);

  // Wallets handling
  const addWallet = (wallet: Omit<Wallet, 'id'>) => {
    // If user is on Free tier and already has 2 or more wallets, block and prompt upgrade to Silver
    if (!hasAccess('SILVER') && wallets.length >= 2) {
      openUpgradeModal(
        'Unlimited Wallets',
        'SILVER',
        'Paket Basic (Free) dibatasi maksimal 2 Wallets. Upgrade ke Silver Plan untuk membuat dan mengelola dompet tanpa batas (Unlimited Wallets).',
        [
          'Bebas buat dompet bank, e-wallet, dan pos tabungan tanpa batas',
          'Ekspor laporan keuangan ke format CSV/Excel kapan saja',
          'Akses filter grafik kustom berdasarkan rentang tanggal',
          'Pengalaman aplikasi bebas iklan',
        ]
      );
      return {
        success: false,
        error: 'Batas 2 Wallets tercapai. Upgrade ke Silver Plan untuk Unlimited Wallets.',
      };
    }

    const newWallet: Wallet = {
      ...wallet,
      id: `wlt_${Date.now()}`,
      userId: user?.id || 'usr_demo_01',
    };

    const updated = [...wallets, newWallet];
    setWallets(updated);
    try {
      localStorage.setItem('cuanly_wallets', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return { success: true };
  };

  const deleteWallet = (id: string) => {
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    try {
      localStorage.setItem('cuanly_wallets', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Debt & Receivables handling (Gold+)
  const addDebt = (debt: Omit<DebtItem, 'id' | 'createdAt'>) => {
    if (!hasAccess('GOLD')) {
      openUpgradeModal(
        'Manajemen Utang & Piutang',
        'GOLD',
        'Fitur pencatatan dan monitoring utang/piutang manual eksklusif untuk pelanggan Gold Plan ke atas.',
        [
          'Catat utang ke rekan atau piutang yang harus ditagih dengan rapi',
          'Pengingat jatuh tempo tanggal pembayaran',
          'Fitur Budgeting kustom dengan ambang batas alert fleksibel',
          'Prioritas sinkronisasi cloud backup otomatis',
        ]
      );
      return { success: false, error: 'Fitur memerlukan Gold Plan.' };
    }

    const newDebt: DebtItem = {
      ...debt,
      id: `debt_${Date.now()}`,
      userId: user?.id || 'usr_demo_01',
      createdAt: new Date().toISOString(),
    };

    const updated = [newDebt, ...debts];
    setDebts(updated);
    try {
      localStorage.setItem('cuanly_debts', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return { success: true };
  };

  const toggleSettleDebt = (id: string) => {
    const updated = debts.map((d) => (d.id === id ? { ...d, isSettled: !d.isSettled } : d));
    setDebts(updated);
    try {
      localStorage.setItem('cuanly_debts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const deleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    try {
      localStorage.setItem('cuanly_debts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Workspace members handling (B2B)
  const addWorkspaceMember = (name: string, email: string) => {
    if (!hasAccess('B2B')) {
      openUpgradeModal(
        'Shared Workspace (Tim)',
        'B2B',
        'Shared Workspace memungkinkan kolaborasi beberapa akun tim (3-5 user) untuk mengakses dan mengedit satu database kas dompet bersama secara real-time.',
        [
          'Satu database dompet bersama yang sinkron di semua akun tim',
          'Akses multi-pengguna hingga 3-5 akun terdaftar',
          'Kontrol hak akses (Owner, Admin, Member)',
          'Seluruh fitur Gold Plan termasuk Budgeting dan Utang/Piutang',
        ]
      );
      return { success: false, error: 'Fitur memerlukan B2B Plan.' };
    }

    if (workspaceMembers.length >= 5) {
      return { success: false, error: 'B2B Plan mendukung maksimal 3-5 akun tim.' };
    }

    const newMember: WorkspaceMember = {
      id: `mem_${Date.now()}`,
      name,
      email,
      role: 'MEMBER',
      status: 'INVITED',
    };

    const updated = [...workspaceMembers, newMember];
    setWorkspaceMembers(updated);
    try {
      localStorage.setItem('cuanly_workspace_members', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return { success: true };
  };

  // Custom budget threshold setting (Gold+)
  const setWarningThresholdPercent = (percent: number) => {
    if (!hasAccess('GOLD')) {
      openUpgradeModal(
        'Fitur Budgeting (Custom Threshold)',
        'GOLD',
        'Kustomisasi persentase ambang batas peringatan overspending (misal: 50%, 70%, 90%) eksklusif pada Gold Plan.',
        [
          'Tentukan ambang batas peringatan pengeluaran per kategori secara fleksibel',
          'Pencegahan overspending lebih dini sebelum saldo habis',
          'Prioritas sinkronisasi cloud backup otomatis',
          'Manajemen utang dan piutang manual lengkap',
        ]
      );
      return;
    }

    setWarningThresholdPercentState(percent);
    try {
      localStorage.setItem('cuanly_custom_budget_threshold', percent.toString());
    } catch {
      // ignore
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        plan: effectivePlan,
        tier: effectivePlan,
        isAdmin,
        setPlan,
        setTier: setPlan,
        hasAccess,
        upgradePlan,
        isUpgradeModalOpen,
        upgradeModalData,
        openUpgradeModal,
        closeUpgradeModal,
        wallets,
        addWallet,
        deleteWallet,
        debts,
        addDebt,
        toggleSettleDebt,
        deleteDebt,
        workspaceMembers,
        addWorkspaceMember,
        warningThresholdPercent,
        setWarningThresholdPercent,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
