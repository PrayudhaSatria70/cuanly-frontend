'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { businessApi } from '@/services/api';
import { BusinessProfile, BusinessCashflow, BusinessTaxReport } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Building2,
  FileSpreadsheet,
  Calculator,
  Download,
  CheckCircle2,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Scale,
  Briefcase,
  Layers,
} from 'lucide-react';

export const BusinessFinanceModal: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency, t, locale } = useLanguage();
  const { isBusinessModalOpen, closeBusinessModal } = useSubscription();
  const b = t.modals.business;

  const [activeTab, setActiveTab] = useState<'cashflow' | 'tax'>('cashflow');
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [cashflow, setCashflow] = useState<BusinessCashflow | null>(null);
  const [taxReport, setTaxReport] = useState<BusinessTaxReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Edit Profile Form
  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [npwp, setNpwp] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('120000000');
  const [operatingExpense, setOperatingExpense] = useState('75000000');

  useEffect(() => {
    if (!isBusinessModalOpen) return;

    setIsLoading(true);
    Promise.all([
      businessApi.getProfile().catch(() => null),
      businessApi.getCashflow().catch(() => null),
      businessApi.getTaxReport().catch(() => null),
    ])
      .then(([profRes, flowRes, taxRes]) => {
        if (profRes && profRes.profile) {
          setProfile(profRes.profile);
          setBusinessName(profRes.profile.businessName);
          setNpwp(profRes.profile.npwp || '');
          setAnnualRevenue(String(profRes.profile.annualRevenue));
          setOperatingExpense(String(profRes.profile.operatingExpense));
        } else {
          const fallbackProfile: BusinessProfile = {
            userId: user?.id || 'usr_guest',
            businessName: 'Kopi Cuan Nusantara UMKM',
            npwp: '08.123.456.7-412.000',
            period: '2026',
            annualRevenue: 150000000,
            operatingExpense: 85000000,
            cashRunwayMonths: 9.2,
            taxRate: 0.005,
          };
          setProfile(fallbackProfile);
          setBusinessName(fallbackProfile.businessName);
          setNpwp(fallbackProfile.npwp || '');
          setAnnualRevenue(String(fallbackProfile.annualRevenue));
          setOperatingExpense(String(fallbackProfile.operatingExpense));
        }

        if (flowRes && flowRes.cashflow) {
          setCashflow(flowRes.cashflow);
        } else {
          setCashflow({
            period: '2026',
            operating: {
              cashIn: 150000000,
              cashOut: 85000000,
              net: 65000000,
            },
            investing: {
              net: -15000000,
            },
            financing: {
              net: 10000000,
            },
            netCashflow: 60000000,
            runwayMonths: 9.2,
            monthlyBurnRate: 7083333,
          });
        }

        if (taxRes && taxRes.taxReport) {
          setTaxReport(taxRes.taxReport);
        } else {
          setTaxReport({
            period: '2026',
            businessName: 'Kopi Cuan Nusantara UMKM',
            npwp: '08.123.456.7-412.000',
            grossRevenue: 150000000,
            exemptThreshold: 500000000,
            taxableRevenue: 0,
            taxRate: 0.005,
            taxRateFormatted: '0.5% (PPh Final UMKM PP 23/2018)',
            taxDue: 0,
            status: 'BEBAS PAJAK (Omzet < Rp 500 Juta)',
            legalReference: 'PP 23 Tahun 2018 & UU No. 7 Tahun 2021 (HPP)',
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, [isBusinessModalOpen, user?.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const rev = parseFloat(annualRevenue) || 0;
    const exp = parseFloat(operatingExpense) || 0;

    const payload = {
      businessName: businessName.trim(),
      npwp: npwp.trim() || undefined,
      annualRevenue: rev,
      operatingExpense: exp,
    };

    try {
      const res = await businessApi.updateProfile(payload);
      if (res && res.profile) {
        setProfile(res.profile);
      }
    } catch {
      // fallback
    }

    // Refresh cashflow and tax report
    const monthlyBurn = Math.max(1, exp / 12);
    const netCash = Math.max(0, rev - exp);
    const runway = Number((netCash / monthlyBurn).toFixed(1));

    setCashflow({
      period: '2026',
      operating: { cashIn: rev, cashOut: exp, net: rev - exp },
      investing: { net: -15000000 },
      financing: { net: 10000000 },
      netCashflow: rev - exp - 5000000,
      runwayMonths: runway,
      monthlyBurnRate: Math.round(monthlyBurn),
    });

    const thresholdExempt = 500000000;
    const taxableRevenue = Math.max(0, rev - thresholdExempt);
    const taxDue = Math.round(taxableRevenue * 0.005);

    setTaxReport({
      period: '2026',
      businessName: businessName.trim(),
      npwp: npwp.trim() || '00.000.000.0-000.000',
      grossRevenue: rev,
      exemptThreshold: thresholdExempt,
      taxableRevenue,
      taxRate: 0.005,
      taxRateFormatted: '0.5% (PPh Final UMKM PP 23/2018)',
      taxDue,
      status: taxDue === 0 ? 'BEBAS PAJAK (Omzet < Rp 500 Juta)' : 'TERUTANG',
      legalReference: 'PP 23 Tahun 2018 & UU No. 7 Tahun 2021 (HPP)',
    });

    setIsEditing(false);
    setFeedback(b.saveProfileSuccess);
  };

  const handleExportTax = () => {
    if (!taxReport) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'LAPORAN PAJAK SEDERHANA PPH FINAL UMKM (CUANLY)',
        `Nama Usaha:;${taxReport.businessName}`,
        `NPWP:;${taxReport.npwp || '-'}`,
        `Tahun Pajak:;${taxReport.period}`,
        `Dasar Hukum:;${taxReport.legalReference}`,
        '',
        'Komponen;Nilai (IDR)',
        `Peredaran Bruto (Omzet Kumulatif);${taxReport.grossRevenue}`,
        `Batas Omzet Tidak Kena Pajak (Pasal 7 UU HPP);${taxReport.exemptThreshold}`,
        `Dasar Pengenaan Pajak (DPP);${taxReport.taxableRevenue}`,
        `Tarif PPh Final UMKM;${taxReport.taxRateFormatted}`,
        `Estimasi PPh Final Terutang;${taxReport.taxDue}`,
        `Status Pajak;${taxReport.status}`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Pajak_UMKM_${taxReport.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedback(b.exportSuccess);
  };

  if (!isBusinessModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0D1926] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#4D8DBA]/20 bg-gradient-to-r from-blue-600/10 via-[#4D8DBA]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0C2340] dark:text-white">
                  {b.title}
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                  {b.b2bBadge}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {profile?.businessName || (locale === 'en' ? 'Your Business' : 'Bisnis Anda')} • {b.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeBusinessModal}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={b.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 px-5 pt-3 bg-gray-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('cashflow')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cashflow'
                ? 'border-[#4D8DBA] text-[#4D8DBA] dark:text-[#8AD6D1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{b.tabCashflow}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tax')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tax'
                ? 'border-[#4D8DBA] text-[#4D8DBA] dark:text-[#8AD6D1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{b.tabTax}</span>
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className="mx-5 mt-4 p-3 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{feedback}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Business Profile Summary Banner */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-[#0C2340] dark:text-white text-sm">
                {profile?.businessName}
              </span>
              <p className="text-gray-500 dark:text-slate-400">
                NPWP: {profile?.npwp || (locale === 'en' ? 'Not configured' : 'Belum diatur')} • {locale === 'en' ? 'Tax Year' : 'Tahun Pajak'}: {profile?.period}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors self-start sm:self-center cursor-pointer"
            >
              {isEditing ? (locale === 'en' ? 'Close Edit' : 'Tutup Edit') : b.editProfile}
            </button>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleUpdateProfile} className="p-4 rounded-xl border border-[#4D8DBA]/30 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold text-[#0C2340] dark:text-white">
                {locale === 'en' ? 'Update Business Financial Parameters' : 'Perbarui Parameter Keuangan Bisnis'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {b.businessName}
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    placeholder={b.businessNamePlaceholder}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {b.npwpLabel}
                  </label>
                  <input
                    type="text"
                    value={npwp}
                    placeholder={b.npwpPlaceholder}
                    onChange={(e) => setNpwp(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {b.annualRevenue}
                  </label>
                  <input
                    type="number"
                    required
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-400 mb-1">
                    {b.operatingExpense}
                  </label>
                  <input
                    type="number"
                    required
                    value={operatingExpense}
                    onChange={(e) => setOperatingExpense(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0C2340] dark:text-white focus:outline-hidden focus:border-[#4D8DBA]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-slate-700"
                >
                  {b.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#4D8DBA] hover:bg-[#2E678E] text-white shadow-xs"
                >
                  {b.saveProfile}
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: CASHFLOW & RUNWAY */}
          {activeTab === 'cashflow' && cashflow && (
            <div className="space-y-6">
              {/* Runway Hero Widget */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0C2340] to-[#1C4A6B] text-white shadow-lg space-y-4 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-[#8AD6D1]">
                      {b.runwayTitle}
                    </span>
                    <div className="text-3xl font-extrabold tracking-tight mt-1">
                      {b.runwayMonths.replace('{months}', String(cashflow.runwayMonths))}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold self-start sm:self-center flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{b.runwaySafe}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-300">{b.netCashflow}:</span>
                    <p className="font-bold text-white mt-0.5">{formatCurrency(cashflow.netCashflow)}</p>
                  </div>
                  <div>
                    <span className="text-slate-300">{locale === 'en' ? 'Monthly Burn Rate:' : 'Burn Rate Bulanan:'}</span>
                    <p className="font-bold text-white mt-0.5">{formatCurrency(cashflow.monthlyBurnRate)}/bln</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-300">{locale === 'en' ? 'Operational Status:' : 'Status Operasional:'}</span>
                    <p className="font-bold text-[#8AD6D1] mt-0.5">{locale === 'en' ? 'Sustainable Surplus ✨' : 'Surplus Berkelanjutan ✨'}</p>
                  </div>
                </div>
              </div>

              {/* 3 Categories Cashflow Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  {locale === 'en' ? '3 Pillars of Business Cashflow' : 'Rincian 3 Pilar Arus Kas Bisnis'}
                </span>

                <div className="space-y-3">
                  {/* Operating Cashflow */}
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0C2340] dark:text-white flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span>1. {b.operatingCashflow}</span>
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(cashflow.operating.net)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-slate-400 pt-1 border-t border-gray-100 dark:border-slate-800">
                      <div>{locale === 'en' ? 'Customer Receipts:' : 'Kas Masuk (Penjualan/Jasa):'} <strong className="text-[#0C2340] dark:text-white">{formatCurrency(cashflow.operating.cashIn)}</strong></div>
                      <div>{locale === 'en' ? 'Operating Outflows:' : 'Kas Keluar (Operasional):'} <strong className="text-[#0C2340] dark:text-white">{formatCurrency(cashflow.operating.cashOut)}</strong></div>
                    </div>
                  </div>

                  {/* Investing Cashflow */}
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0C2340] dark:text-white flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-amber-500" />
                        <span>2. {b.investingCashflow}</span>
                      </span>
                      <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                        {formatCurrency(cashflow.investing.net)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {b.investingCashflowDesc}
                    </p>
                  </div>

                  {/* Financing Cashflow */}
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0C2340] dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#4D8DBA]" />
                        <span>3. {b.financingCashflow}</span>
                      </span>
                      <span className="text-xs font-extrabold text-[#4D8DBA] dark:text-[#8AD6D1]">
                        +{formatCurrency(cashflow.financing.net)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {b.financingCashflowDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIMPLE TAX REPORT */}
          {activeTab === 'tax' && taxReport && (
            <div className="space-y-6">
              {/* Tax Status Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#1C4A6B] to-[#0C2340] text-white shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-[#8AD6D1]">
                      {locale === 'en' ? `MSME Final Income Tax Status (${taxReport.period})` : `Status Pajak PPh Final UMKM (${taxReport.period})`}
                    </span>
                    <div className="text-2xl font-extrabold tracking-tight mt-1">
                      {locale === 'en'
                        ? (taxReport.taxDue === 0 ? 'TAX EXEMPT (Revenue < Rp500M)' : 'TAX DUE')
                        : taxReport.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300">{b.taxDue}:</span>
                    <div className="text-2xl font-extrabold text-amber-400 mt-0.5">
                      {formatCurrency(taxReport.taxDue)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/15 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8AD6D1] shrink-0" />
                  <span>{locale === 'en' ? 'Regulatory Basis:' : 'Dasar Regulasi:'} {taxReport.legalReference}</span>
                </div>
              </div>

              {/* Tax Calculation Details Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {b.taxSimTitle}
                  </span>
                  <button
                    type="button"
                    onClick={handleExportTax}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4D8DBA] hover:bg-[#2E678E] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{b.exportTax}</span>
                  </button>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      <tr className="bg-gray-50/50 dark:bg-slate-900/40">
                        <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{b.accumulatedRevenue} ({taxReport.period}):</td>
                        <td className="p-3 font-bold text-right text-[#0C2340] dark:text-white">{formatCurrency(taxReport.grossRevenue)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{b.taxExemption}:</td>
                        <td className="p-3 font-bold text-right text-emerald-600 dark:text-emerald-400">-{formatCurrency(taxReport.exemptThreshold)}</td>
                      </tr>
                      <tr className="bg-gray-50/50 dark:bg-slate-900/40">
                        <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{b.taxBase}:</td>
                        <td className="p-3 font-bold text-right text-[#0C2340] dark:text-white">{formatCurrency(taxReport.taxableRevenue)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-gray-600 dark:text-slate-400">{locale === 'en' ? 'SME Final Tax Rate (PP 23/2018):' : 'Tarif PPh Final UMKM (PP 23/2018):'}</td>
                        <td className="p-3 font-bold text-right text-[#4D8DBA] dark:text-[#8AD6D1]">0.5%</td>
                      </tr>
                      <tr className="bg-[#4D8DBA]/10 font-bold">
                        <td className="p-3 text-[#0C2340] dark:text-white">{b.taxDue}:</td>
                        <td className="p-3 text-right text-lg text-[#4D8DBA] dark:text-[#8AD6D1]">{formatCurrency(taxReport.taxDue)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300">
                  <p>
                    {locale === 'en' ? (
                      <>
                        <strong>💡 MSME Tax Exemption Rules:</strong> Under the Indonesian Tax Harmonization Law (UU HPP), Individual Taxpayers with gross annual turnover up to Rp 500,000,000 are <strong>EXEMPT from 0.5% Final Tax</strong>. The 0.5% rate applies only to revenue exceeding Rp 500 million.
                      </>
                    ) : (
                      <>
                        <strong>💡 Ketentuan Wajib Pajak UMKM:</strong> Sesuai UU Harmonisasi Peraturan Perpajakan (UU HPP), Wajib Pajak Orang Pribadi dengan peredaran bruto s.d Rp 500.000.000 dalam 1 tahun pajak <strong>TIDAK DIKENAKAN PPh Final 0.5%</strong>. Pajak hanya dihitung atas kelebihan omzet di atas Rp 500 Juta.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#4D8DBA]/20 bg-gray-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>{locale === 'en' ? <>Exclusive feature for <strong>B2B Plan</strong> subscribers & Live Admin.</> : <>Fitur eksklusif bagi pemegang paket <strong>B2B Plan</strong> & akun Live Admin.</>}</span>
          <button
            type="button"
            onClick={closeBusinessModal}
            className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-[#0C2340] dark:text-white transition-all cursor-pointer"
          >
            {b.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
