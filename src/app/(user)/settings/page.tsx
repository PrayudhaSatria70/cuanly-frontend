'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';
import { GlassCard } from '@/components/common/GlassCard';
import {
  Settings,
  Palette,
  Globe,
  Coins,
  PieChart,
  Camera,
  Shield,
  Bell,
  Database,
  User,
  Sun,
  Moon,
  Check,
  AlertTriangle,
  Lock,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
  KeyRound,
  Trash2,
  CheckCircle,
  FileSpreadsheet,
  FileJson,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { locale, setLocale, t, currencies, activeCurrency, setActiveCurrency, addCustomCurrency, formatCurrency } = useLanguage();
  const { user, role, switchRole, logout, sessionTimeoutMs, setSessionTimeoutDuration, updateUserPin, updateUserProfile } = useAuth();
  const { monthlyAllowance, setMonthlyAllowance, transactions, budgets, categories, resetToDefaultData, importFinancialData } = useFinance();
  const { isDark, toggleTheme } = useTheme();
  const { addNotification, clearAllNotifications, notifications } = useNotification();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'appearance' | 'localization' | 'budget' | 'ocr' | 'security' | 'notifications' | 'data' | 'account'
  >('appearance');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const validTabs = ['appearance', 'localization', 'budget', 'ocr', 'security', 'notifications', 'data', 'account'];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam as typeof activeTab);
      }
    }
  }, []);

  // Success / Feedback Toast
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Profile Editor state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileUsername, setProfileUsername] = useState(user?.username || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileUsername(user.username || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  ];

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      showFeedback(
        locale === 'en'
          ? 'File size too large. Maximum allowed size is 2.5MB.'
          : 'Ukuran file terlalu besar. Maksimal 2.5MB.',
        'error'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProfileAvatarUrl(result);
        showFeedback(
          locale === 'en'
            ? 'New photo loaded! Click "Save Profile Changes" to apply.'
            : 'Foto baru dimuat! Klik "Simpan Perubahan Profil" untuk menerapkan.'
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showFeedback(locale === 'en' ? 'Full Name is required.' : 'Nama lengkap wajib diisi.', 'error');
      return;
    }
    if (!profileEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileEmail.trim())) {
      showFeedback(locale === 'en' ? 'Valid email is required.' : 'Email tidak valid.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = updateUserProfile({
        name: profileName.trim(),
        username: profileUsername.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        avatarUrl: profileAvatarUrl.trim(),
      });

      if (res.success) {
        addNotification({
          title: t.profile.title,
          message: t.profile.saveProfileSuccess,
          type: 'SUCCESS',
        });
        showFeedback(t.profile.saveProfileSuccess);
      } else {
        showFeedback(res.error || 'Failed to update profile', 'error');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleResetProfileForm = () => {
    if (user) {
      setProfileName(user.name || '');
      setProfileUsername(user.username || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setProfileAvatarUrl(user.avatarUrl || '');
      showFeedback(locale === 'en' ? 'Form reset to saved profile.' : 'Form dikembalikan ke profil tersimpan.');
    }
  };

  // 1. Monthly Allowance state
  const [allowanceInput, setAllowanceInput] = useState<string>(monthlyAllowance.toString());
  useEffect(() => {
    setAllowanceInput(monthlyAllowance.toString());
  }, [monthlyAllowance]);

  const handleSaveAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(allowanceInput.replace(/[^0-9]/g, ''));
    if (!isNaN(val) && val > 0) {
      setMonthlyAllowance(val);
      addNotification({
        title: t.allowance.modalTitle,
        message: `${t.allowance.successMsg} (${formatCurrency(val)})`,
        type: 'SUCCESS',
      });
      showFeedback(t.allowance.successMsg || 'Allowance updated successfully!');
    } else {
      showFeedback(t.allowance.invalidAmount || 'Invalid allowance amount', 'error');
    }
  };

  // 2. Spending Warning Threshold State
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  useEffect(() => {
    const stored = localStorage.getItem('cuanly_spending_warning_threshold');
    if (stored) {
      const parsed = Number(stored);
      if (!isNaN(parsed)) setWarningThreshold(parsed);
    }
  }, []);

  const handleThresholdChange = (newThreshold: number) => {
    setWarningThreshold(newThreshold);
    try {
      localStorage.setItem('cuanly_spending_warning_threshold', newThreshold.toString());
    } catch {
      // ignore
    }
    showFeedback(
      locale === 'en'
        ? `Spending warning threshold set to ${newThreshold}%.`
        : `Ambang batas peringatan pengeluaran diubah ke ${newThreshold}%.`
    );
  };

  // 3. OCR Settings State
  const [ocrSpeed, setOcrSpeed] = useState<'fast' | 'standard' | 'thorough'>('standard');
  const [ocrAutoCat, setOcrAutoCat] = useState<boolean>(true);
  const [ocrReview, setOcrReview] = useState<boolean>(true);

  useEffect(() => {
    const savedSpeed = localStorage.getItem('cuanly_ocr_speed') as 'fast' | 'standard' | 'thorough';
    if (savedSpeed) setOcrSpeed(savedSpeed);

    const savedAutoCat = localStorage.getItem('cuanly_ocr_autocat');
    if (savedAutoCat !== null) setOcrAutoCat(savedAutoCat === 'true');

    const savedReview = localStorage.getItem('cuanly_ocr_review');
    if (savedReview !== null) setOcrReview(savedReview === 'true');
  }, []);

  const handleOcrSpeedChange = (speed: 'fast' | 'standard' | 'thorough') => {
    setOcrSpeed(speed);
    localStorage.setItem('cuanly_ocr_speed', speed);
    showFeedback(
      locale === 'en' ? `OCR scanning speed set to ${speed}.` : `Kecepatan scan OCR diubah ke ${speed}.`
    );
  };

  const handleToggleAutoCat = () => {
    const nextVal = !ocrAutoCat;
    setOcrAutoCat(nextVal);
    localStorage.setItem('cuanly_ocr_autocat', nextVal.toString());
    showFeedback(
      nextVal
        ? locale === 'en' ? 'Auto-categorization enabled.' : 'Klasifikasi otomatis diaktifkan.'
        : locale === 'en' ? 'Auto-categorization disabled.' : 'Klasifikasi otomatis dinonaktifkan.'
    );
  };

  const handleToggleReview = () => {
    const nextVal = !ocrReview;
    setOcrReview(nextVal);
    localStorage.setItem('cuanly_ocr_review', nextVal.toString());
    showFeedback(
      nextVal
        ? locale === 'en' ? 'Review screen before saving enabled.' : 'Layar review sebelum simpan diaktifkan.'
        : locale === 'en' ? 'Review screen before saving disabled.' : 'Layar review sebelum simpan dinonaktifkan.'
    );
  };

  // 4. Session Timeout Duration Options (in minutes)
  const currentTimeoutMinutes = Math.round(sessionTimeoutMs / 60000);
  const handleTimeoutChange = (minutes: number) => {
    const ms = minutes * 60 * 1000;
    setSessionTimeoutDuration(ms);
    showFeedback(
      locale === 'en'
        ? `Inactivity timeout updated to ${minutes} minute(s).`
        : `Batas inaktivitas sesi diubah ke ${minutes} menit.`
    );
  };

  // 5. Change PIN State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (newPin !== confirmPin) {
      setPinError(locale === 'en' ? 'New PIN confirmation does not match.' : 'Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    if (newPin.length < 4 || newPin.length > 6) {
      setPinError(locale === 'en' ? 'PIN must be 4 to 6 numeric digits.' : 'PIN harus 4 sampai 6 digit.');
      return;
    }

    const res = updateUserPin(oldPin, newPin);
    if (res.success) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      showFeedback(locale === 'en' ? 'PIN updated successfully!' : 'PIN akun berhasil diperbarui!');
    } else {
      setPinError(res.error || 'Failed to update PIN.');
    }
  };

  // 6. Notification Preferences State
  const [notifSpending, setNotifSpending] = useState<boolean>(true);
  const [notifOverbudget, setNotifOverbudget] = useState<boolean>(true);
  const [notifSound, setNotifSound] = useState<boolean>(false);

  useEffect(() => {
    const storedSpending = localStorage.getItem('cuanly_notif_spending');
    if (storedSpending !== null) setNotifSpending(storedSpending === 'true');

    const storedOver = localStorage.getItem('cuanly_notif_overbudget');
    if (storedOver !== null) setNotifOverbudget(storedOver === 'true');

    const storedSound = localStorage.getItem('cuanly_notif_sound');
    if (storedSound !== null) setNotifSound(storedSound === 'true');
  }, []);

  const handleToggleNotif = (key: 'spending' | 'overbudget' | 'sound') => {
    if (key === 'spending') {
      const next = !notifSpending;
      setNotifSpending(next);
      localStorage.setItem('cuanly_notif_spending', next.toString());
    } else if (key === 'overbudget') {
      const next = !notifOverbudget;
      setNotifOverbudget(next);
      localStorage.setItem('cuanly_notif_overbudget', next.toString());
    } else {
      const next = !notifSound;
      setNotifSound(next);
      localStorage.setItem('cuanly_notif_sound', next.toString());
    }
    showFeedback(locale === 'en' ? 'Notification preference updated.' : 'Preferensi notifikasi diperbarui.');
  };

  const handleClearNotifications = () => {
    clearAllNotifications();
    showFeedback(locale === 'en' ? 'All notifications cleared.' : 'Semua notifikasi dibersihkan.');
  };

  // 7. Custom Currency Modal State
  const [isAddCurrencyOpen, setIsAddCurrencyOpen] = useState(false);
  const [newCurrCode, setNewCurrCode] = useState('');
  const [newCurrSymbol, setNewCurrSymbol] = useState('');
  const [newCurrName, setNewCurrName] = useState('');
  const [newCurrDecimals, setNewCurrDecimals] = useState<number>(2);
  const [currencyError, setCurrencyError] = useState('');

  const handleCreateCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrCode.trim() || !newCurrSymbol.trim()) {
      setCurrencyError(locale === 'en' ? 'Code and Symbol are required.' : 'Kode dan simbol wajib diisi.');
      return;
    }

    const created = addCustomCurrency({
      code: newCurrCode.trim().toUpperCase(),
      symbol: newCurrSymbol.trim(),
      name: newCurrName.trim() || newCurrCode.trim().toUpperCase(),
      decimals: Number(newCurrDecimals),
    });

    setNewCurrCode('');
    setNewCurrSymbol('');
    setNewCurrName('');
    setNewCurrDecimals(2);
    setCurrencyError('');
    setIsAddCurrencyOpen(false);

    showFeedback(
      locale === 'en'
        ? `Currency ${created.code} (${created.symbol}) added and activated!`
        : `Mata uang ${created.code} (${created.symbol}) berhasil ditambahkan dan diaktifkan!`
    );
  };

  // 8. Data Export (JSON & CSV)
  const handleExportJson = () => {
    const dataToExport = {
      appName: 'Cuanly',
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
      monthlyAllowance,
      activeCurrency,
      currencies,
      budgets,
      categories,
      transactions,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuanly_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback(locale === 'en' ? 'Backup JSON downloaded.' : 'Cadangan JSON berhasil diunduh.');
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showFeedback(locale === 'en' ? 'No transactions to export.' : 'Tidak ada transaksi untuk diekspor.', 'error');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Currency', 'Note', 'Merchant'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      t.categoryName || t.categorySlug || '',
      t.amount,
      t.currency || activeCurrency.code,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.receipt?.merchant || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuanly_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showFeedback(locale === 'en' ? 'Transactions CSV downloaded.' : 'Buku kas CSV berhasil diunduh.');
  };

  // 9. Data Import (JSON)
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed && (parsed.transactions || parsed.budgets || parsed.monthlyAllowance)) {
          importFinancialData(parsed);
          showFeedback(locale === 'en' ? 'Data backup restored successfully!' : 'Cadangan data berhasil dipulihkan!');
        } else {
          showFeedback(locale === 'en' ? 'Invalid Cuanly backup file.' : 'Format file cadangan tidak valid.', 'error');
        }
      } catch {
        showFeedback(locale === 'en' ? 'Failed to parse JSON file.' : 'Gagal membaca file JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 10. Reset Demo Data Confirmation Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const handleConfirmReset = () => {
    resetToDefaultData();
    setIsResetConfirmOpen(false);
    showFeedback(
      locale === 'en'
        ? 'Data successfully reset to initial demo state.'
        : 'Seluruh data berhasil dikembalikan ke status awal demo.'
    );
  };

  const navTabs = [
    { id: 'appearance', label: locale === 'en' ? 'Appearance' : 'Tampilan', icon: Palette },
    { id: 'localization', label: locale === 'en' ? 'Language & Currency' : 'Bahasa & Mata Uang', icon: Globe },
    { id: 'budget', label: locale === 'en' ? 'Budget & Warning' : 'Anggaran & Warning', icon: PieChart },
    { id: 'ocr', label: locale === 'en' ? 'Smart OCR Scanner' : 'Smart OCR Struk', icon: Camera },
    { id: 'security', label: locale === 'en' ? 'Security & Timeout' : 'Keamanan & Sesi', icon: Shield },
    { id: 'notifications', label: locale === 'en' ? 'Notifications' : 'Notifikasi', icon: Bell },
    { id: 'data', label: locale === 'en' ? 'Backup & Reset' : 'Data & Cadangan', icon: Database },
    { id: 'account', label: locale === 'en' ? 'Profile & Account' : 'Profil & Akun', icon: User },
  ] as const;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Toast Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top-4 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-bold">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4D8DBA]/15 text-[#4D8DBA] dark:text-[#8AD6D1] rounded-2xl border border-[#4D8DBA]/20 shadow-xs">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0C2340] dark:text-white">
              {t.settings.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
              {t.settings.subtitle}
            </p>
          </div>
        </div>

        {/* Current Active Account Mode Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              role === 'ADMIN'
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-[#8AD6D1]/20 text-[#1C4A6B] dark:text-[#8AD6D1] border-[#8AD6D1]/40'
            }`}
          >
            {role === 'ADMIN' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Admin Account</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
                <span>Personal User</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Navigation Tabs (Responsive Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200/80 dark:border-[#4D8DBA]/20">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#4D8DBA] text-white shadow-sm shadow-[#4D8DBA]/30 scale-[1.02]'
                  : 'text-gray-600 dark:text-slate-300 hover:text-[#1C4A6B] dark:hover:text-white hover:bg-[#AEC4D4]/20'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#8AD6D1]' : 'text-gray-400 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE & BRANDING */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <Palette className="w-5 h-5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
              <div>
                <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                  {t.settings.general}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t.settings.themeDescription}
                </p>
              </div>
            </div>

            {/* Dark Mode vs Light Mode Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  if (isDark) toggleTheme();
                  showFeedback(locale === 'en' ? 'Switched to Light Mode.' : 'Beralih ke Mode Terang.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  !isDark
                    ? 'bg-white border-[#4D8DBA] shadow-md ring-2 ring-[#4D8DBA]/25'
                    : 'bg-gray-50/50 dark:bg-[#071018]/50 border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {locale === 'en' ? 'Light Mode' : 'Mode Terang'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {locale === 'en' ? 'Crisp oceanic blue & mint canvas' : 'Latar cerah beraksen biru samudera'}
                    </p>
                  </div>
                </div>
                {!isDark && (
                  <div className="w-6 h-6 rounded-full bg-[#4D8DBA] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDark) toggleTheme();
                  showFeedback(locale === 'en' ? 'Switched to Dark Mode.' : 'Beralih ke Mode Gelap.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isDark
                    ? 'bg-[#0D1926] border-[#8AD6D1] shadow-md ring-2 ring-[#8AD6D1]/25'
                    : 'bg-gray-50/50 dark:bg-[#071018]/50 border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl text-[#8AD6D1] border border-[#4D8DBA]/40">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {locale === 'en' ? 'Dark Mode' : 'Mode Gelap'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {locale === 'en' ? 'Deep midnight navy with glowing teal' : 'Latar gelap elegan hemat daya'}
                    </p>
                  </div>
                </div>
                {isDark && (
                  <div className="w-6 h-6 rounded-full bg-[#8AD6D1] text-[#0C2340] flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            {/* Official Brand Palette Showcase */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                {t.settings.paletteTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#4D8DBA]/30 flex items-center gap-3 bg-white dark:bg-[#0B1520]">
                  <div className="w-10 h-10 rounded-lg bg-[#4D8DBA] shadow-xs flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">Primer</span>
                    <span className="text-[11px] font-mono text-[#4D8DBA] font-bold block">#4D8DBA</span>
                    <span className="text-[10px] text-gray-400">Tombol Utama & Brand</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#4D8DBA]/30 flex items-center gap-3 bg-white dark:bg-[#0B1520]">
                  <div className="w-10 h-10 rounded-lg bg-[#8AD6D1] shadow-xs flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">Sekunder</span>
                    <span className="text-[11px] font-mono text-[#1C4A6B] dark:text-[#8AD6D1] font-bold block">#8AD6D1</span>
                    <span className="text-[10px] text-gray-400">Aksen & Indikator Kas</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-[#4D8DBA]/30 flex items-center gap-3 bg-white dark:bg-[#0B1520]">
                  <div className="w-10 h-10 rounded-lg bg-[#AEC4D4] shadow-xs flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">Tersier</span>
                    <span className="text-[11px] font-mono text-gray-600 dark:text-[#AEC4D4] font-bold block">#AEC4D4</span>
                    <span className="text-[10px] text-gray-400">Border Kaca & Netral</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: LOCALIZATION & MULTI-CURRENCY */}
      {activeTab === 'localization' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <Globe className="w-5 h-5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
              <div>
                <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                  {t.settings.localization}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t.settings.localizationDesc}
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setLocale('en');
                  showFeedback('Language switched to English (Default).');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  locale === 'en'
                    ? 'bg-[#4D8DBA]/10 border-[#4D8DBA] ring-2 ring-[#4D8DBA]/20'
                    : 'bg-white dark:bg-[#0B1520] border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">English (Default)</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#4D8DBA]/20 text-[#2E678E] dark:text-[#8AD6D1]">
                      EN
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Default application language</p>
                </div>
                {locale === 'en' && <Check className="w-5 h-5 text-[#4D8DBA] stroke-[3]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLocale('id');
                  showFeedback('Bahasa antarmuka diubah ke Bahasa Indonesia.');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  locale === 'id'
                    ? 'bg-[#4D8DBA]/10 border-[#4D8DBA] ring-2 ring-[#4D8DBA]/20'
                    : 'bg-white dark:bg-[#0B1520] border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Bahasa Indonesia</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ID
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Lokalisasi penuh Bahasa Indonesia</p>
                </div>
                {locale === 'id' && <Check className="w-5 h-5 text-[#4D8DBA] stroke-[3]" />}
              </button>
            </div>
          </GlassCard>

          {/* Multi-Currency Section */}
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
                <div>
                  <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                    {t.settings.currencySection}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t.settings.currencyDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCurrencyOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.currency.addCustom}</span>
              </button>
            </div>

            {/* Currency Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currencies.map((curr) => {
                const isSelected = activeCurrency.code === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      setActiveCurrency(curr.code);
                      showFeedback(
                        locale === 'en'
                          ? `Active currency set to ${curr.code} (${curr.symbol}).`
                          : `Mata uang aktif diubah ke ${curr.code} (${curr.symbol}).`
                      );
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#4D8DBA]/15 border-[#4D8DBA] ring-2 ring-[#4D8DBA]/25'
                        : 'bg-white dark:bg-[#0B1520] border-gray-200 dark:border-[#4D8DBA]/30 hover:border-[#4D8DBA]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black font-mono text-[#4D8DBA] dark:text-[#8AD6D1]">
                        {curr.symbol}
                      </span>
                      {curr.code === 'IDR' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#8AD6D1]/30 text-[#1C4A6B]">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white block font-mono">
                        {curr.code}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block">
                        {curr.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Formatter Preview */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 block">Sample Formatted Currency</span>
                <span className="text-lg font-extrabold text-[#4D8DBA] dark:text-[#8AD6D1] font-mono">
                  {formatCurrency(1250000)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                Active Code: <strong>{activeCurrency.code}</strong> ({activeCurrency.symbol})
              </span>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 3: BUDGET & ALLOWANCE */}
      {activeTab === 'budget' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <PieChart className="w-5 h-5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
              <div>
                <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                  {t.settings.budgetSection}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t.settings.budgetDesc}
                </p>
              </div>
            </div>

            {/* Monthly Allowance Editor */}
            <form onSubmit={handleSaveAllowance} className="space-y-3">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-200 block">
                {t.allowance.inputLabel} ({activeCurrency.symbol})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={allowanceInput}
                  onChange={(e) => setAllowanceInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/40 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {t.allowance.saveBtn}
                </button>
              </div>
            </form>

            {/* Spending Warning Threshold (Red Banner trigger) */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  {t.settings.warningThreshold}
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {t.settings.warningThresholdDesc}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[70, 75, 80, 85, 90].map((th) => (
                  <button
                    key={th}
                    type="button"
                    onClick={() => handleThresholdChange(th)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      warningThreshold === th
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-400 ring-2 ring-rose-400/25'
                        : 'bg-white dark:bg-[#0B1520] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-slate-300 hover:border-gray-300'
                    }`}
                  >
                    {th}%
                  </button>
                ))}
              </div>
            </div>

            {/* Core Categories Information */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
                Hick&apos;s Law Core 6 Categories
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-2.5 bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-slate-200 truncate">
                      {cat.fallbackName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: SMART RECEIPT SCANNER (AI OCR) */}
      {activeTab === 'ocr' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <Camera className="w-5 h-5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
              <div>
                <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                  {t.settings.ocrSection}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t.settings.ocrDesc}
                </p>
              </div>
            </div>

            {/* OCR Processing Latency */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                {t.settings.ocrLatency}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'fast', label: 'Fast (0.6s)', desc: 'Instant extraction' },
                  { id: 'standard', label: 'Standard (1.2s)', desc: 'Balanced accuracy' },
                  { id: 'thorough', label: 'Thorough (2.0s)', desc: 'Deep line-by-line audit' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleOcrSpeedChange(s.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      ocrSpeed === s.id
                        ? 'bg-[#4D8DBA]/15 border-[#4D8DBA] ring-2 ring-[#4D8DBA]/25'
                        : 'bg-white dark:bg-[#0B1520] border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">{s.label}</span>
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                    {t.settings.ocrAutoCat}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Automatically match merchant receipts to Makanan, Transportasi, or Belanja
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAutoCat}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    ocrAutoCat ? 'bg-[#4D8DBA]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      ocrAutoCat ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                    Require Review Screen Before Save
                  </h4>
                  <p className="text-xs text-gray-500">
                    Always show item breakdown verification modal before commiting expense
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    ocrReview ? 'bg-[#4D8DBA]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      ocrReview ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick Link to Scanner */}
            <div className="pt-2">
              <Link
                href="/transaksi/scan"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#8AD6D1]/20 hover:bg-[#8AD6D1]/30 text-[#1C4A6B] dark:text-[#8AD6D1] rounded-xl text-xs font-bold transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Test Smart Scanner Now &rarr;</span>
              </Link>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 5: SECURITY & SESSION TIMEOUT */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <Shield className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                  {t.settings.securitySection}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t.settings.securityDesc}
                </p>
              </div>
            </div>

            {/* Inactivity Timeout Duration Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#4D8DBA]" />
                    {t.settings.timeoutDuration}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically signs out unattended sessions to protect balances on public/shared screens
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Active: {currentTimeoutMinutes}m
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { min: 1, label: '1 Minute', desc: 'Max Security' },
                  { min: 3, label: '3 Minutes', desc: 'Standard Default' },
                  { min: 5, label: '5 Minutes', desc: 'Comfort' },
                  { min: 10, label: '10 Minutes', desc: 'Extended Testing' },
                ].map((item) => (
                  <button
                    key={item.min}
                    type="button"
                    onClick={() => handleTimeoutChange(item.min)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      currentTimeoutMinutes === item.min
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/25'
                        : 'bg-white dark:bg-[#0B1520] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-slate-300 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[10px] text-gray-400">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Update Transaction PIN */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#4D8DBA]" />
                  {t.settings.pinTitle}
                </h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {t.settings.pinDesc}
                </p>
              </div>

              {pinError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{pinError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePin} className="space-y-3 max-w-md">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 block mb-1">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value)}
                    placeholder="Enter current PIN"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 block mb-1">
                      New PIN (4-6 digits)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 block mb-1">
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Confirm PIN"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Update Security PIN
                </button>
              </form>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
                <div>
                  <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                    {t.settings.notificationsSection}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t.settings.notificationsDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All ({notifications.length})</span>
              </button>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                    Spending Warning Red Banners
                  </h4>
                  <p className="text-xs text-gray-500">
                    Display alert banner when spending reaches category threshold ({warningThreshold}%)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('spending')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifSpending ? 'bg-[#4D8DBA]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      notifSpending ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                    Overbudget Critical Alerts
                  </h4>
                  <p className="text-xs text-gray-500">
                    Receive high-urgency notifications when any category hits 100% limit
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('overbudget')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifOverbudget ? 'bg-[#4D8DBA]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      notifOverbudget ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
                    Sound & Haptic Feedback
                  </h4>
                  <p className="text-xs text-gray-500">
                    Play audio cues for successful transactions and scanner completions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleNotif('sound')}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    notifSound ? 'bg-[#4D8DBA]' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      notifSound ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 7: DATA & BACKUP */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <Database className="w-5 h-5 text-[#4D8DBA] dark:text-[#8AD6D1]" />
              <div>
                <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                  {t.settings.dataSection}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {t.settings.dataDesc}
                </p>
              </div>
            </div>

            {/* Backup & Export Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleExportJson}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#4D8DBA] text-left transition-all bg-white dark:bg-[#0B1520] group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-[#4D8DBA]">
                      {t.settings.exportJson}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Complete state backup (transactions, budgets, currencies)
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 text-left transition-all bg-white dark:bg-[#0B1520] group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-emerald-600">
                      {t.settings.exportCsv}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Export {transactions.length} rows to spreadsheet CSV
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Restore File Uploader */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20 space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                {t.settings.importData}
              </label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#4D8DBA] rounded-2xl cursor-pointer bg-gray-50/50 dark:bg-[#071018]/50 transition-all">
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-700 dark:text-slate-200">
                  Click to browse or drop JSON backup file
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">Accepts .json backup files</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>

            {/* Danger Zone: Reset Demo Data */}
            <div className="pt-4 border-t border-rose-100 dark:border-rose-950/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    {t.settings.resetDemo}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Resets all financial records and budgets back to initial demo dataset
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 8: ACCOUNT & PROFILE EDITING */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#4D8DBA]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#4D8DBA]/15 text-[#4D8DBA] dark:text-[#8AD6D1]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-cuanly-primaryDark dark:text-white">
                    {t.profile.editProfileTitle}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t.profile.editProfileSubtitle}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  role === 'ADMIN'
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-[#8AD6D1]/20 text-[#1C4A6B] dark:text-[#8AD6D1] border-[#8AD6D1]/40'
                }`}
              >
                {role === 'ADMIN' ? 'Admin Role' : 'User Role'}
              </span>
            </div>

            {/* Profile Avatar Section */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/80 via-[#EDF5FA]/40 to-white/70 dark:from-[#0B1520]/80 dark:via-[#071018]/60 dark:to-[#0B1520]/80 border border-[#AEC4D4]/40 dark:border-[#4D8DBA]/25 space-y-4">
              <span className="text-xs font-bold text-gray-700 dark:text-slate-300 block uppercase tracking-wider">
                {t.profile.avatarLabel}
              </span>

              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Large Preview */}
                <div className="relative group self-center sm:self-auto">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#4D8DBA] dark:border-[#8AD6D1] shadow-md bg-gray-100 dark:bg-[#071018] flex items-center justify-center">
                    {profileAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileAvatarUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4D8DBA]/20 text-[#1C4A6B] dark:text-[#8AD6D1] flex items-center justify-center text-3xl font-extrabold">
                        {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-[#4D8DBA] text-white hover:bg-[#2E678E] shadow-md border-2 border-white dark:border-[#0B1520] transition-all cursor-pointer"
                    title={t.profile.uploadPhotoBtn}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Avatar Actions & Presets */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileUpload}
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t.profile.uploadPhotoBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3.5 py-2 bg-white dark:bg-[#071018] hover:bg-gray-50 dark:hover:bg-[#112233] text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {showUrlInput ? (locale === 'en' ? 'Close URL' : 'Tutup URL') : t.profile.photoUrlLabel}
                    </button>

                    {profileAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAvatarUrl('');
                          showFeedback(
                            locale === 'en'
                              ? 'Avatar removed. Save to apply.'
                              : 'Foto profil dihapus. Klik simpan untuk menerapkan.'
                          );
                        }}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.profile.removePhotoBtn}</span>
                      </button>
                    )}
                  </div>

                  {/* Optional Image URL Input */}
                  {showUrlInput && (
                    <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                      <input
                        type="url"
                        value={avatarUrlInput}
                        onChange={(e) => setAvatarUrlInput(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (avatarUrlInput.trim()) {
                            setProfileAvatarUrl(avatarUrlInput.trim());
                            setAvatarUrlInput('');
                            setShowUrlInput(false);
                            showFeedback(
                              locale === 'en'
                                ? 'Avatar URL applied! Click Save to apply.'
                                : 'URL Avatar diterapkan! Klik Simpan untuk menerapkan.'
                            );
                          }
                        }}
                        className="px-3 py-1.5 bg-[#4D8DBA] text-white rounded-xl text-xs font-bold hover:bg-[#2E678E]"
                      >
                        {locale === 'en' ? 'Apply' : 'Terapkan'}
                      </button>
                    </div>
                  )}

                  {/* Preset Avatars Carousel */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 block mb-2">
                      {t.profile.presetAvatarsTitle}:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {PRESET_AVATARS.map((presetUrl, idx) => {
                        const isSelected = profileAvatarUrl === presetUrl;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setProfileAvatarUrl(presetUrl);
                              showFeedback(
                                locale === 'en'
                                  ? 'Preset avatar selected! Click Save to apply.'
                                  : 'Avatar preset dipilih! Klik Simpan untuk menerapkan.'
                              );
                            }}
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                              isSelected
                                ? 'border-[#4D8DBA] ring-2 ring-[#4D8DBA]/40 scale-105'
                                : 'border-gray-200 dark:border-gray-700 hover:border-[#4D8DBA] opacity-75 hover:opacity-100'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={presetUrl}
                              alt={`Preset avatar ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form Details */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    {t.profile.fullNameLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Budi Santoso"
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    {t.profile.usernameLabel}
                  </label>
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    placeholder="e.g. budisantoso"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    {t.profile.emailLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="e.g. user@cuanly.com"
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block mb-1">
                    {t.profile.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="e.g. 0812-3456-7890"
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-semibold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/40 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20">
                <button
                  type="button"
                  onClick={handleResetProfileForm}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {locale === 'en' ? 'Reset to Saved' : 'Batal / Reset'}
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#4D8DBA] to-[#2E678E] hover:from-[#2E678E] hover:to-[#1C4A6B] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#4D8DBA]/30 active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSavingProfile ? (locale === 'en' ? 'Saving...' : 'Menyimpan...') : t.profile.saveProfileBtn}</span>
                </button>
              </div>
            </form>

            {/* Account Metadata Overview */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20">
              <span className="text-[11px] font-bold uppercase text-gray-400 block mb-3">
                {locale === 'en' ? 'Account Details & Session' : 'Ringkasan Akun & Sesi'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Role</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{role}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Session Timeout</span>
                  <span className="text-xs font-mono font-bold text-gray-800 dark:text-slate-200">{currentTimeoutMinutes} Menit</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Joined</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-200">Jan 2026</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#071018] border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Auth Status</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                </div>
              </div>
            </div>

            {/* Switch Demo Role */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                    {t.profile.accountSwitch || 'Switch Demo Account'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {locale === 'en'
                      ? 'Toggle instantly between Demo User and Demo Admin for test evaluation'
                      : 'Beralih seketika antara Demo User dan Demo Admin untuk evaluasi fitur'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={switchRole}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Switch to {role === 'ADMIN' ? 'Demo User' : 'Demo Admin'}
                </button>
              </div>

              {role === 'ADMIN' && (
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
                    <Shield className="w-4 h-4" />
                    <span>Admin Backoffice Access Enabled</span>
                  </div>
                  <Link
                    href="/admin/dashboard"
                    className="text-xs font-bold text-purple-700 dark:text-purple-300 underline hover:no-underline"
                  >
                    Open Dashboard &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="pt-4 border-t border-gray-100 dark:border-[#4D8DBA]/20">
              <button
                type="button"
                onClick={logout}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{t.common.logout}</span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* MODAL 1: ADD CUSTOM CURRENCY */}
      {isAddCurrencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0B1520] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#4D8DBA]/30 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm font-bold text-cuanly-primaryDark dark:text-white">
                <Coins className="w-4 h-4 text-[#4D8DBA]" />
                <span>{t.currency.addModalTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCurrencyOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {currencyError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-2 border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
                <span>{currencyError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCurrency} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                  {t.currency.codeLabel}
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={newCurrCode}
                  onChange={(e) => setNewCurrCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AUD, SGD, JPY, MYR, KRW"
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                  {t.currency.symbolLabel}
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={newCurrSymbol}
                  onChange={(e) => setNewCurrSymbol(e.target.value)}
                  placeholder="e.g. A$, S$, ¥, RM, ₩"
                  required
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                  {t.currency.nameLabel}
                </label>
                <input
                  type="text"
                  value={newCurrName}
                  onChange={(e) => setNewCurrName(e.target.value)}
                  placeholder="e.g. Australian Dollar"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                  {t.currency.decimalsLabel}
                </label>
                <select
                  value={newCurrDecimals}
                  onChange={(e) => setNewCurrDecimals(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30 text-gray-800 dark:text-slate-200"
                >
                  <option value={0}>0 Decimals (e.g. IDR, JPY, KRW)</option>
                  <option value={2}>2 Decimals (e.g. USD, EUR, GBP, SGD, MYR)</option>
                  <option value={3}>3 Decimals (e.g. BHD, KWD, OMR)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">{t.currency.decimalsDesc}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCurrencyOpen(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4D8DBA] hover:bg-[#2E678E] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {t.currency.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET DATA CONFIRMATION */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0B1520] rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-rose-100 text-rose-600 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950 dark:text-rose-100">
                  {t.settings.resetDemo}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {t.settings.resetConfirm}
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] text-rose-800 dark:text-rose-200 leading-relaxed">
              This action will restore default mock transactions, category limits, and reset your allowance to Rp 6.700.000.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
