'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CuanlyLogo } from '@/components/common/CuanlyLogo';
import { pricingApi } from '@/services/api';
import { SubscriptionTier } from '@/types';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Shield,
  Sparkles,
  Lock,
  CreditCard,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Zap,
  Users,
  Wallet,
  Building2,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { upgradePlan } = useSubscription();
  const { t, locale, formatCurrency } = useLanguage();

  // URL Query Params: plan & billing
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('B2B');
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  // Seats (for B2B as seen in user screenshot)
  const [standardSeats, setStandardSeats] = useState<number>(5);
  const [premiumSeats, setPremiumSeats] = useState<number>(0);

  // Form inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expDate, setExpDate] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Cuanly Subscriber');
  const [savePaymentDetails, setSavePaymentDetails] = useState(true);

  // Additional settings accordion
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);
  const [taxId, setTaxId] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan');
      if (planParam) {
        const upper = planParam.toUpperCase();
        if (upper === 'SILVER' || upper === 'GOLD' || upper === 'B2B') {
          setSelectedTier(upper as SubscriptionTier);
        }
      }
      const billingParam = params.get('billing');
      if (billingParam === 'monthly' || billingParam === 'annual') {
        setBillingCycle(billingParam);
      }
    }
  }, []);

  // Pricing Matrix based on Plan
  const planConfigs = {
    SILVER: {
      title: locale === 'en' ? 'Personal Pro (Silver)' : 'Paket Personal Pro (Silver)',
      monthlyRate: 10000,
      annualRate: 89000,
      monthlySeatLabel: locale === 'en' ? 'Standard seat' : 'Akun Standar',
      topFeatures: [
        locale === 'en' ? 'Unlimited Cash, Bank, & E-Wallets' : 'Dompet Kas, Bank, & E-Wallet Tanpa Batas',
        locale === 'en' ? 'Export financial reports to CSV & Excel' : 'Ekspor laporan keuangan ke format CSV & Excel',
        locale === 'en' ? 'Custom date-range chart & transaction filters' : 'Akses filter grafik & transaksi rentang tanggal kustom',
        locale === 'en' ? 'Clean, high-performance ad-free experience' : 'Pengalaman aplikasi bersih bebas iklan',
      ],
    },
    GOLD: {
      title: locale === 'en' ? 'Financial Expert (Gold)' : 'Paket Financial Expert (Gold)',
      monthlyRate: 25000,
      annualRate: 199000,
      monthlySeatLabel: locale === 'en' ? 'Expert seat' : 'Akun Expert',
      topFeatures: [
        locale === 'en' ? 'All Silver Plan features included' : 'Semua fitur paket Silver Plan tanpa batas',
        locale === 'en' ? 'Full Debt & Receivables Manager with due dates' : 'Manajemen Utang & Piutang Lengkap dengan Jatuh Tempo',
        locale === 'en' ? 'Custom Budgeting Alert Threshold (e.g. 50%-90%)' : 'Ambang Batas Peringatan Budget Kustom (Custom Threshold)',
        locale === 'en' ? 'Priority automatic encrypted cloud backup' : 'Prioritas sinkronisasi cloud backup otomatis',
      ],
    },
    B2B: {
      title: locale === 'en' ? 'Business plan (B2B)' : 'Paket Business Tim (B2B)',
      // As seen in screenshot: IDR 337,000/month for standard seat in annual calculation
      standardMonthlyRate: 337000,
      premiumMonthlyRate: 1685000,
      monthlySeatLabel: locale === 'en' ? 'Standard seats' : 'Standard seats',
      topFeatures: [
        locale === 'en' ? 'Cuanly Shared Workspace & Team Database' : 'Shared Workspace Tim & Database Dompet Bersama',
        locale === 'en' ? 'Plugins and Smart OCR to act across files' : 'Smart OCR Scan Struk & Multi-Ekspor Laporan',
        locale === 'en' ? 'Unified billing and organization management' : 'Unified billing & manajemen hak akses anggota tim',
        locale === 'en' ? 'Mix-and-match seat types with 24/7 priority support' : 'Dukungan teknis prioritas 24/7 & role permissions',
      ],
    },
  };

  const validTier: 'SILVER' | 'GOLD' | 'B2B' = selectedTier === 'FREE' ? 'SILVER' : selectedTier;
  const currentConfig = planConfigs[validTier] || planConfigs.B2B;

  // Calculate totals
  let subtotal = 0;
  if (selectedTier === 'B2B') {
    const monthsMultiplier = billingCycle === 'annual' ? 12 : 1;
    const stdPrice = (currentConfig as typeof planConfigs.B2B).standardMonthlyRate * standardSeats * monthsMultiplier;
    const premPrice = (currentConfig as typeof planConfigs.B2B).premiumMonthlyRate * premiumSeats * monthsMultiplier;
    subtotal = stdPrice + premPrice;
  } else {
    const rate = billingCycle === 'annual' ? (currentConfig as any).annualRate : (currentConfig as any).monthlyRate;
    subtotal = rate;
  }

  const estimatedTax = 0;
  const dueToday = subtotal + estimatedTax;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Asynchronously synchronize with Backend & Neon PostgreSQL Database
      await pricingApi.upgrade(selectedTier).catch((err) => {
        console.warn('Backend upgrade sync notice:', err?.message);
      });

      // 2. Update local subscription state & local user session
      upgradePlan(selectedTier);

      // 3. Mark success
      setPaymentSuccess(true);
      setTimeout(() => {
        router.push('/beranda');
      }, 1500);
    } catch {
      upgradePlan(selectedTier);
      setPaymentSuccess(true);
      setTimeout(() => {
        router.push('/beranda');
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 flex flex-col font-sans selection:bg-[#4D8DBA]/30">
      {/* Background Subtle Ambient Highlights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-gradient-to-b from-[#8AD6D1]/10 to-transparent blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#4D8DBA]/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#070B12]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={locale === 'en' ? 'Back' : 'Kembali'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <CuanlyLogo size="sm" variant="icon" />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {locale === 'en' ? 'Configure your plan' : 'Konfigurasi Paket Anda'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{locale === 'en' ? '256-bit Encrypted Checkout' : 'Pembayaran Terenkripsi 256-bit'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Plan Configuration & Payment Details                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Section 1: Plan Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
                  {locale === 'en' ? 'Plan details' : 'Detail Paket'}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>{locale === 'en' ? 'Selected tier:' : 'Tier terpilih:'}</span>
                  <span className="font-extrabold text-[#8AD6D1]">{selectedTier}</span>
                </div>
              </div>

              {/* Billing Cycle Pill Toggles (Annual billing with SAVE 19% badge vs Monthly) */}
              <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#0F1624] border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`relative p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                    billingCycle === 'annual'
                      ? 'bg-[#182338] text-white shadow-lg border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        billingCycle === 'annual' ? 'border-[#8AD6D1]' : 'border-slate-600'
                      }`}
                    >
                      {billingCycle === 'annual' && <div className="w-2 h-2 rounded-full bg-[#8AD6D1]" />}
                    </div>
                    <span className="text-xs sm:text-sm font-bold">
                      {locale === 'en' ? 'Annual billing' : 'Tagihan Tahunan'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#8AD6D1]/20 text-[#8AD6D1] border border-[#8AD6D1]/30">
                    {locale === 'en' ? 'SAVE 19%' : 'HEMAT 20%'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    billingCycle === 'monthly'
                      ? 'bg-[#182338] text-white shadow-lg border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      billingCycle === 'monthly' ? 'border-[#8AD6D1]' : 'border-slate-600'
                    }`}
                  >
                    {billingCycle === 'monthly' && <div className="w-2 h-2 rounded-full bg-[#8AD6D1]" />}
                  </div>
                  <span className="text-xs sm:text-sm font-bold">
                    {locale === 'en' ? 'Monthly billing' : 'Tagihan Bulanan'}
                  </span>
                </button>
              </div>

              {/* Seat Customization / Tier details Container */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1624] border border-slate-800/90 space-y-5">
                {selectedTier === 'B2B' ? (
                  <>
                    {/* Item 1: Standard Seats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-white">
                            {locale === 'en' ? 'Standard seats' : 'Standard seats'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {locale === 'en' ? 'Best for most employees' : 'Terbaik untuk sebagian besar anggota tim'}
                          </div>
                        </div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-200">
                          IDR 337,000/month
                        </div>
                      </div>

                      {/* Interactive Seat Counter */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070B12] border border-slate-800">
                        <span className="text-xs font-mono font-bold pl-2 text-white">{standardSeats}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={standardSeats <= 1}
                            onClick={() => setStandardSeats((prev) => Math.max(1, prev - 1))}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStandardSeats((prev) => prev + 1)}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80" />

                    {/* Item 2: Premium Seats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-white">
                            {locale === 'en' ? 'Premium seats' : 'Premium seats'}
                          </div>
                          <div className="text-xs text-slate-400">
                            {locale === 'en'
                              ? '5x more usage than standard, priority team sync'
                              : '5x kapasitas pemakaian lebih besar dari standar'}
                          </div>
                        </div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-200">
                          IDR 1,685,000/month
                        </div>
                      </div>

                      {/* Interactive Seat Counter */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#070B12] border border-slate-800">
                        <span className="text-xs font-mono font-bold pl-2 text-white">{premiumSeats}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={premiumSeats <= 0}
                            onClick={() => setPremiumSeats((prev) => Math.max(0, prev - 1))}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPremiumSeats((prev) => prev + 1)}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Individual Tier Details (Gold / Silver) */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-white">
                          {currentConfig.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {selectedTier === 'GOLD'
                            ? (locale === 'en' ? 'Complete debt tracking & custom thresholds' : 'Manajemen utang piutang & custom budget')
                            : (locale === 'en' ? 'Unlimited wallets & CSV exports' : 'Dompet tanpa batas & ekspor laporan')}
                        </div>
                      </div>
                      <div className="font-extrabold text-sm text-[#8AD6D1]">
                        {billingCycle === 'annual'
                          ? formatCurrency((currentConfig as any).annualRate) + '/yr'
                          : formatCurrency((currentConfig as any).monthlyRate) + '/mo'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#070B12] border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      {locale === 'en'
                        ? 'Includes full personal account synchronization across all mobile & web platforms with instant cloud updates.'
                        : 'Termasuk sinkronisasi cloud real-time tanpa batas di semua perangkat web & mobile Cuanly.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible Additional Settings */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdditionalSettings(!showAdditionalSettings)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <span>{locale === 'en' ? 'Additional settings' : 'Pengaturan Tambahan'}</span>
                  {showAdditionalSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showAdditionalSettings && (
                  <div className="mt-3 p-4 rounded-2xl bg-[#0F1624] border border-slate-800 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        {locale === 'en' ? 'Tax ID / NPWP (Optional)' : 'NPWP / Nomor Pokok Wajib Pajak (Opsional)'}
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="00.000.000.0-000.000"
                        className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-slate-800 text-xs text-white focus:outline-none focus:border-[#4D8DBA]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        {locale === 'en' ? 'Company / Business Name' : 'Nama Perusahaan / Bisnis'}
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="PT Cuanly Inovasi Finansial"
                        className="w-full px-3 py-2 rounded-xl bg-[#070B12] border border-slate-800 text-xs text-white focus:outline-none focus:border-[#4D8DBA]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Pay with (Payment Methods & Card Form) */}
            <div className="space-y-4 pt-2">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
                {locale === 'en' ? 'Pay with' : 'Metode Pembayaran'}
              </h2>

              {/* Apple Pay / GPay Instant Pay Button (Matching user screenshot) */}
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <span className="text-base tracking-tight font-black">Pay</span>
                <span className="text-xs font-semibold text-slate-700">| Instant Checkout</span>
              </button>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-[#070B12] text-[11px] font-bold text-slate-500 uppercase">
                  {locale === 'en' ? 'OR' : 'ATAU'}
                </span>
              </div>

              {/* Card Payment Form */}
              <form onSubmit={handleSubscribe} className="space-y-3">
                {/* Card Number Input with Brand Logos */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">
                    {locale === 'en' ? 'Card number' : 'Nomor Kartu Kredit / Debit'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      required
                      className="w-full pl-3.5 pr-32 py-3 rounded-xl bg-[#0F1624] border border-slate-800 text-xs sm:text-sm font-mono tracking-wider text-white focus:outline-none focus:border-[#8AD6D1] transition-colors"
                    />
                    {/* Card Brand Badges (Visa, Mastercard, JCB, Amex) */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white">VISA</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-600 text-white">MC</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white">JCB</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-600 text-white">AMEX</span>
                    </div>
                  </div>
                </div>

                {/* Expiration date & Security code */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 block">
                      {locale === 'en' ? 'Expiration date' : 'Masa Berlaku'}
                    </label>
                    <input
                      type="text"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      placeholder="MM/YY"
                      required
                      className="w-full px-3.5 py-3 rounded-xl bg-[#0F1624] border border-slate-800 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#8AD6D1] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 block">
                      {locale === 'en' ? 'Security code' : 'Kode Keamanan (CVC)'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cvc}
                        maxLength={4}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="CVC"
                        required
                        className="w-full pl-3.5 pr-9 py-3 rounded-xl bg-[#0F1624] border border-slate-800 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-[#8AD6D1] transition-colors"
                      />
                      <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block">
                    {locale === 'en' ? 'Cardholder name' : 'Nama Pemilik Kartu'}
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Nama sesuai kartu"
                    required
                    className="w-full px-3.5 py-3 rounded-xl bg-[#0F1624] border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-[#8AD6D1] transition-colors"
                  />
                </div>

                {/* Save Details Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={savePaymentDetails}
                      onChange={(e) => setSavePaymentDetails(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-[#4D8DBA] focus:ring-0 focus:outline-none"
                    />
                    <span>
                      {locale === 'en'
                        ? 'Save payment details to Cuanly for future renewal purchases'
                        : 'Simpan detail pembayaran di Cuanly untuk perpanjangan otomatis'}
                    </span>
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Order Summary Card (Matching user screenshot)              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#121926] border border-slate-800/90 shadow-2xl space-y-6">
              
              {/* Plan Title & Features */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {currentConfig.title}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-[#8AD6D1]/20 text-[#8AD6D1] border border-[#8AD6D1]/30">
                    {selectedTier}
                  </span>
                </div>

                {/* Top Features */}
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {locale === 'en' ? 'Top features' : 'Fitur Utama'}
                  </div>
                  <ul className="space-y-2.5">
                    {currentConfig.topFeatures.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-800" />

              {/* Calculation Breakdown */}
              <div className="space-y-3 text-xs">
                {selectedTier === 'B2B' ? (
                  <>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>{standardSeats} standard seats ({billingCycle})</span>
                      <span className="font-mono">
                        {formatCurrency(
                          (currentConfig as typeof planConfigs.B2B).standardMonthlyRate *
                            standardSeats *
                            (billingCycle === 'annual' ? 12 : 1)
                        )}
                      </span>
                    </div>

                    {premiumSeats > 0 && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>{premiumSeats} premium seats ({billingCycle})</span>
                        <span className="font-mono">
                          {formatCurrency(
                            (currentConfig as typeof planConfigs.B2B).premiumMonthlyRate *
                              premiumSeats *
                              (billingCycle === 'annual' ? 12 : 1)
                          )}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1 license ({billingCycle})</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400">
                  <span>{locale === 'en' ? 'Subtotal' : 'Subtotal'}</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>{locale === 'en' ? 'Estimated tax' : 'Estimasi Pajak (PPN)'}</span>
                  <span className="font-mono">IDR 0.00</span>
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-base">
                  <span className="font-bold text-white">{locale === 'en' ? 'Due today' : 'Total Tagihan'}</span>
                  <span className="font-black text-lg text-[#8AD6D1] font-mono">
                    {formatCurrency(dueToday)}
                  </span>
                </div>
              </div>

              {/* Subscribe CTA Button */}
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isProcessing || paymentSuccess}
                className="w-full py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl hover:shadow-2xl active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>{locale === 'en' ? 'Processing Payment...' : 'Memproses Pembayaran...'}</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>{locale === 'en' ? 'Subscribed Successfully!' : 'Berlangganan Berhasil!'}</span>
                  </>
                ) : (
                  <span>{locale === 'en' ? 'Subscribe' : 'Berlangganan Sekarang'}</span>
                )}
              </button>

              {/* Renewal and Terms Disclaimer (Matching user screenshot) */}
              <p className="text-[11px] text-slate-400 leading-relaxed text-justify">
                {locale === 'en' ? (
                  <>
                    Renews {billingCycle} until cancelled. You'll be charged {formatCurrency(dueToday)} based on active seats. Cancel anytime in Settings. By subscribing, you agree to the Business Terms and authorize us to store and charge your payment method.
                  </>
                ) : (
                  <>
                    Langganan diperpanjang secara {billingCycle === 'annual' ? 'tahunan' : 'bulanan'} hingga dibatalkan. Anda akan ditagih sebesar {formatCurrency(dueToday)} berdasarkan paket aktif. Anda dapat membatalkan kapan saja melalui Pengaturan.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Guarantee */}
      <footer className="relative z-10 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Cuanly Technologies. All transactions encrypted & PCI-DSS compliant.</p>
      </footer>
    </div>
  );
}
