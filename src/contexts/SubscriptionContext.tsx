'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SubscriptionTier, Wallet, DebtItem, WorkspaceMember } from '@/types';
import { INITIAL_WALLETS, INITIAL_DEBTS, INITIAL_WORKSPACE_MEMBERS } from '@/services/mockData';
import { walletsApi, debtsApi, workspaceApi, pricingApi } from '@/services/api';
import { useAuth } from './AuthContext';

interface UpgradeModalData {
  featureName: string;
  requiredPlan: SubscriptionTier;
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
    requiredPlan: SubscriptionTier,
    featureDescription?: string,
    benefits?: string[]
  ) => void;
  openPlanModal: (tier: SubscriptionTier) => void;
  closeUpgradeModal: () => void;

  // Global modals control for Wallets, Debts, and Shared Workspace
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;

  isDebtModalOpen: boolean;
  openDebtModal: () => void;
  closeDebtModal: () => void;

  isWorkspaceModalOpen: boolean;
  openWorkspaceModal: () => void;
  closeWorkspaceModal: () => void;

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

  // Bank Sync feature (Gold+)
  isBankSyncModalOpen: boolean;
  openBankSyncModal: () => void;
  closeBankSyncModal: () => void;

  // Investment tracking feature (Gold+)
  isInvestmentModalOpen: boolean;
  openInvestmentModal: () => void;
  closeInvestmentModal: () => void;

  // AI Analytics feature (Gold+)
  isAiAnalyticsModalOpen: boolean;
  openAiAnalyticsModal: () => void;
  closeAiAnalyticsModal: () => void;

  // Business Cashflow & Tax feature (B2B)
  isBusinessModalOpen: boolean;
  openBusinessModal: () => void;
  closeBusinessModal: () => void;
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

  // Global modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  const openWalletModal = useCallback(() => setIsWalletModalOpen(true), []);
  const closeWalletModal = useCallback(() => setIsWalletModalOpen(false), []);

  const openDebtModal = useCallback(() => setIsDebtModalOpen(true), []);
  const closeDebtModal = useCallback(() => setIsDebtModalOpen(false), []);

  const openWorkspaceModal = useCallback(() => setIsWorkspaceModalOpen(true), []);
  const closeWorkspaceModal = useCallback(() => setIsWorkspaceModalOpen(false), []);

  // Wallets state
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Debts state (Gold)
  const [debts, setDebts] = useState<DebtItem[]>([]);

  // Workspace members (B2B)
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

  // Budgeting custom threshold percent (default 80%, Gold users can customize e.g. 50%, 75%, 90%)
  const [warningThresholdPercent, setWarningThresholdPercentState] = useState<number>(80);

  const userId = user?.id;
  const isDemoUser = userId === 'usr_demo_1';

  // Synchronize and initialize user-scoped wallets, debts, and workspace
  useEffect(() => {
    // 1. Plan synchronization
    try {
      const storedPlan = localStorage.getItem('cuanly_subscription_tier') as SubscriptionTier;
      if (storedPlan && ['FREE', 'SILVER', 'GOLD', 'B2B'].includes(storedPlan)) {
        setPlanState(storedPlan);
      } else {
        setPlanState('FREE');
      }

      const storedThreshold = localStorage.getItem('cuanly_custom_budget_threshold');
      if (storedThreshold) {
        const parsed = Number(storedThreshold);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
          setWarningThresholdPercentState(parsed);
        }
      }
    } catch {
      // fallback
    }

    if (!user) {
      setWallets([]);
      setDebts([]);
      setWorkspaceMembers([]);
      return;
    }

    if (isDemoUser) {
      try {
        const storedWallets = localStorage.getItem('cuanly_wallets_usr_demo_1') || localStorage.getItem('cuanly_wallets');
        setWallets(storedWallets ? JSON.parse(storedWallets) : INITIAL_WALLETS);

        const storedDebts = localStorage.getItem('cuanly_debts_usr_demo_1') || localStorage.getItem('cuanly_debts');
        setDebts(storedDebts ? JSON.parse(storedDebts) : INITIAL_DEBTS);

        const storedMembers = localStorage.getItem('cuanly_workspace_members_usr_demo_1') || localStorage.getItem('cuanly_workspace_members');
        setWorkspaceMembers(storedMembers ? JSON.parse(storedMembers) : INITIAL_WORKSPACE_MEMBERS);
      } catch {
        setWallets(INITIAL_WALLETS);
        setDebts(INITIAL_DEBTS);
        setWorkspaceMembers(INITIAL_WORKSPACE_MEMBERS);
      }
      return;
    }

    // Registered user: strictly user-scoped data starting from 0
    try {
      const storedWallets = localStorage.getItem(`cuanly_wallets_${userId}`);
      const storedDebts = localStorage.getItem(`cuanly_debts_${userId}`);
      const storedMembers = localStorage.getItem(`cuanly_workspace_members_${userId}`);

      setWallets(storedWallets ? JSON.parse(storedWallets) : []);
      setDebts(storedDebts ? JSON.parse(storedDebts) : []);
      setWorkspaceMembers(storedMembers ? JSON.parse(storedMembers) : []);
    } catch {
      setWallets([]);
      setDebts([]);
      setWorkspaceMembers([]);
    }

    // Fetch live user data from Database via Backend API
    walletsApi
      .getAll()
      .then((items) => {
        if (Array.isArray(items)) {
          setWallets(items);
          try {
            localStorage.setItem(`cuanly_wallets_${userId}`, JSON.stringify(items));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Backend wallets sync notice (offline or local session):', err?.message);
      });

    debtsApi
      .getAll()
      .then((items) => {
        if (Array.isArray(items)) {
          setDebts(items);
          try {
            localStorage.setItem(`cuanly_debts_${userId}`, JSON.stringify(items));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Backend debts sync notice (offline or local session):', err?.message);
      });

    workspaceApi
      .getMembers()
      .then((items) => {
        if (Array.isArray(items)) {
          setWorkspaceMembers(items);
          try {
            localStorage.setItem(`cuanly_workspace_members_${userId}`, JSON.stringify(items));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Backend workspace sync notice (offline or local session):', err?.message);
      });
  }, [user, userId, isDemoUser]);

  // Synchronize plan from authenticated user profile
  useEffect(() => {
    if (user?.subscriptionTier && ['FREE', 'SILVER', 'GOLD', 'B2B'].includes(user.subscriptionTier)) {
      setPlanState(user.subscriptionTier);
    } else if (user?.subscriptionPlan && ['FREE', 'SILVER', 'GOLD', 'B2B'].includes(user.subscriptionPlan)) {
      setPlanState(user.subscriptionPlan);
    }
  }, [user]);

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

      // Persist to user session in localStorage
      try {
        const storedUser = localStorage.getItem('cuanly_auth_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.subscriptionPlan = newPlan;
          parsed.subscriptionTier = newPlan;
          localStorage.setItem('cuanly_auth_user', JSON.stringify(parsed));
        }
      } catch {}

      // Asynchronously synchronize with Backend & Database
      pricingApi.upgrade(newPlan).catch((err) => {
        console.warn('Backend upgrade sync notice (offline or local session):', err?.message);
      });
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
      requiredPlan: SubscriptionTier,
      featureDescription?: string,
      benefits?: string[]
    ) => {
      setUpgradeModalData({
        featureName,
        requiredPlan,
        featureDescription,
        benefits,
      });
      setIsUpgradeModalOpen(true);
    },
    []
  );

  const openPlanModal = useCallback(
    (targetTier: SubscriptionTier) => {
      const planHighlights: Record<SubscriptionTier, { name: string; desc: string }> = {
        FREE: {
          name: 'Core Smart Money Tracking & OCR',
          desc: 'Pencatatan harian arus kas, scan struk otomatis dengan AI OCR, dan laporan grafik bulanan.',
        },
        SILVER: {
          name: 'Unlimited Multi-Wallets & CSV Export',
          desc: 'Kelola seluruh pos rekening dan e-wallet tanpa batasan jumlah serta ekspor laporan ke format CSV/Excel.',
        },
        GOLD: {
          name: 'Debt & Receivables Manager',
          desc: 'Track loans and receivables due for settlement with custom budgeting alerts and priority backup.',
        },
        B2B: {
          name: 'Team Shared Workspace & Collaborative Multi-Wallets',
          desc: 'Satu database dompet kas bersama yang dapat diakses, dipantau, dan diedit oleh seluruh anggota tim Anda.',
        },
      };

      setUpgradeModalData({
        featureName: planHighlights[targetTier].name,
        requiredPlan: targetTier,
        featureDescription: planHighlights[targetTier].desc,
      });
      setIsUpgradeModalOpen(true);
    },
    []
  );

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalData(null);
  }, []);

  // Modals state for new features
  const [isBankSyncModalOpen, setIsBankSyncModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isAiAnalyticsModalOpen, setIsAiAnalyticsModalOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  const closeBankSyncModal = useCallback(() => setIsBankSyncModalOpen(false), []);
  const closeInvestmentModal = useCallback(() => setIsInvestmentModalOpen(false), []);
  const closeAiAnalyticsModal = useCallback(() => setIsAiAnalyticsModalOpen(false), []);
  const closeBusinessModal = useCallback(() => setIsBusinessModalOpen(false), []);

  const openBankSyncModal = useCallback(() => {
    if (!isAdmin && !hasAccess('GOLD')) {
      openUpgradeModal(
        'Bank Sync Otomatis',
        'GOLD',
        'Hubungkan dan sinkronisasikan mutasi rekening bank dan e-wallet secara otomatis (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana).',
        [
          'Sinkronisasi otomatis mutasi bank & e-wallet',
          'Pembaruan saldo kas secara real-time',
          'Riwayat transaksi otomatis tanpa input manual',
        ]
      );
      return;
    }
    setIsBankSyncModalOpen(true);
  }, [isAdmin, hasAccess, openUpgradeModal]);

  const openInvestmentModal = useCallback(() => {
    if (!isAdmin && !hasAccess('GOLD')) {
      openUpgradeModal(
        'Pelacakan Aset & Investasi',
        'GOLD',
        'Monitor portofolio reksadana, saham, emas, crypto, dan properti lengkap dengan kalkulasi net worth dan gain/loss.',
        [
          'Pantau nilai bersih (Net Worth) secara real-time',
          'Pelacakan keuntungan / kerugian (Gain/Loss %)',
          'Alokasi diversifikasi portofolio investasi terpadu',
        ]
      );
      return;
    }
    setIsInvestmentModalOpen(true);
  }, [isAdmin, hasAccess, openUpgradeModal]);

  const openAiAnalyticsModal = useCallback(() => {
    if (!isAdmin && !hasAccess('GOLD')) {
      openUpgradeModal(
        'Laporan Analitik AI',
        'GOLD',
        'Dapatkan skor kesehatan finansial, deteksi anomali pengeluaran, proyeksi arus kas 30 hari, dan rekomendasi cerdas dari AI.',
        [
          'Skor kesehatan finansial real-time (0-100)',
          'Deteksi dini anomali dan lonjakan pengeluaran',
          'Proyeksi ketahanan arus kas & rekomendasi tabungan cerdas',
        ]
      );
      return;
    }
    setIsAiAnalyticsModalOpen(true);
  }, [isAdmin, hasAccess, openUpgradeModal]);

  const openBusinessModal = useCallback(() => {
    if (!isAdmin && !hasAccess('B2B')) {
      openUpgradeModal(
        'Manajemen Arus Kas Bisnis & Laporan Pajak Sederhana',
        'B2B',
        'Kelola arus kas operasional, investasi, dan pendanaan UMKM lengkap dengan kalkulator runway dan estimasi PPh Final 0.5% (PP 23/2018).',
        [
          'Manajemen arus kas operasional, investasi & pendanaan bisnis',
          'Kalkulator ketahanan kas (Business Runway)',
          'Laporan pajak sederhana PPh Final UMKM 0.5%',
        ]
      );
      return;
    }
    setIsBusinessModalOpen(true);
  }, [isAdmin, hasAccess, openUpgradeModal]);

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

    const tempId = `wlt_${Date.now()}`;
    const newWallet: Wallet = {
      ...wallet,
      id: tempId,
      userId: userId || 'usr_registered',
    };

    const updated = [...wallets, newWallet];
    setWallets(updated);
    try {
      const key = userId ? `cuanly_wallets_${userId}` : 'cuanly_wallets';
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to PostgreSQL database via Backend API
    walletsApi
      .create({
        userId: newWallet.userId,
        name: newWallet.name,
        type: newWallet.type,
        accountNumber: newWallet.accountNumber,
        balance: newWallet.balance,
        color: newWallet.color,
        isShared: newWallet.isShared,
      })
      .then((res: any) => {
        const saved = res?.wallet || res;
        if (saved && saved.id) {
          setWallets((prev) => {
            const synced = prev.map((w) => (w.id === tempId ? { ...w, id: saved.id } : w));
            if (userId) {
              try {
                localStorage.setItem(`cuanly_wallets_${userId}`, JSON.stringify(synced));
              } catch {}
            }
            return synced;
          });
        }
      })
      .catch((err) => {
        console.warn('DB wallet create notice (offline or local session):', err?.message);
      });

    return { success: true };
  };

  const deleteWallet = (id: string) => {
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    try {
      const key = userId ? `cuanly_wallets_${userId}` : 'cuanly_wallets';
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to PostgreSQL database via Backend API
    walletsApi.delete(id).catch((err) => {
      console.warn('DB wallet delete notice:', err?.message);
    });
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

    const tempId = `debt_${Date.now()}`;
    const newDebt: DebtItem = {
      ...debt,
      id: tempId,
      userId: userId || 'usr_registered',
      createdAt: new Date().toISOString(),
    };

    const updated = [newDebt, ...debts];
    setDebts(updated);
    try {
      const key = userId ? `cuanly_debts_${userId}` : 'cuanly_debts';
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to PostgreSQL database via Backend API
    debtsApi
      .create({
        userId: newDebt.userId,
        type: newDebt.type,
        personName: newDebt.personName,
        amount: newDebt.amount,
        dueDate: newDebt.dueDate,
        notes: newDebt.notes,
        isSettled: newDebt.isSettled,
      })
      .then((res: any) => {
        const saved = res?.debt || res;
        if (saved && saved.id) {
          setDebts((prev) => {
            const synced = prev.map((d) => (d.id === tempId ? { ...d, id: saved.id } : d));
            if (userId) {
              try {
                localStorage.setItem(`cuanly_debts_${userId}`, JSON.stringify(synced));
              } catch {}
            }
            return synced;
          });
        }
      })
      .catch((err) => {
        console.warn('DB debt create notice (offline or local session):', err?.message);
      });

    return { success: true };
  };

  const toggleSettleDebt = (id: string) => {
    const updated = debts.map((d) => (d.id === id ? { ...d, isSettled: !d.isSettled } : d));
    setDebts(updated);
    try {
      const key = userId ? `cuanly_debts_${userId}` : 'cuanly_debts';
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to PostgreSQL database via Backend API
    debtsApi.toggleSettle(id).catch((err) => {
      console.warn('DB debt toggleSettle notice:', err?.message);
    });
  };

  const deleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    try {
      const key = userId ? `cuanly_debts_${userId}` : 'cuanly_debts';
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to PostgreSQL database via Backend API
    debtsApi.delete(id).catch((err) => {
      console.warn('DB debt delete notice:', err?.message);
    });
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

    const tempId = `mem_${Date.now()}`;
    const newMember: WorkspaceMember = {
      id: tempId,
      name,
      email,
      role: 'MEMBER',
      status: 'INVITED',
    };

    const updated = [...workspaceMembers, newMember];
    setWorkspaceMembers(updated);
    try {
      const key = userId ? `cuanly_workspace_members_${userId}` : 'cuanly_workspace_members';
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to PostgreSQL database via Backend API
    workspaceApi
      .addMember({
        name,
        email,
        role: 'MEMBER',
      })
      .then((res: any) => {
        const saved = res?.member || res;
        if (saved && saved.id) {
          setWorkspaceMembers((prev) => {
            const synced = prev.map((m) => (m.id === tempId ? { ...m, id: saved.id } : m));
            if (userId) {
              try {
                localStorage.setItem(`cuanly_workspace_members_${userId}`, JSON.stringify(synced));
              } catch {}
            }
            return synced;
          });
        }
      })
      .catch((err) => {
        console.warn('DB workspace member notice (offline or local session):', err?.message);
      });

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
        openPlanModal,
        closeUpgradeModal,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        isDebtModalOpen,
        openDebtModal,
        closeDebtModal,
        isWorkspaceModalOpen,
        openWorkspaceModal,
        closeWorkspaceModal,
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
        isBankSyncModalOpen,
        openBankSyncModal,
        closeBankSyncModal,
        isInvestmentModalOpen,
        openInvestmentModal,
        closeInvestmentModal,
        isAiAnalyticsModalOpen,
        openAiAnalyticsModal,
        closeAiAnalyticsModal,
        isBusinessModalOpen,
        openBusinessModal,
        closeBusinessModal,
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
