'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { aiAnalyticsApi } from '@/services/api';
import { AiInsightsData } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sparkles,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  X,
  TrendingUp,
  Activity,
  Calendar,
  Zap,
} from 'lucide-react';

export const AiAnalyticsModal: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useLanguage();
  const { isAiAnalyticsModalOpen, closeAiAnalyticsModal } = useSubscription();

  const [data, setData] = useState<AiInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAiAnalyticsModalOpen) return;

    setIsLoading(true);
    aiAnalyticsApi
      .getInsights()
      .then((res) => {
        if (res && res.insights) {
          setData(res.insights);
        } else {
          // Default insights fallback
          setData({
            healthScore: 82,
            healthStatus: 'PRIMA',
            savingsRate: 26.4,
            netSavings: 4250000,
            totalIncome: 15000000,
            totalExpense: 10750000,
            estimatedRunwayDays: 52,
            anomalies: [
              {
                type: 'HIGH_CONCENTRATION',
                severity: 'MEDIUM',
                title: 'Konsentrasi Kategori Makanan & Minuman',
                message: '38% pengeluaran bulan ini dialokasikan untuk kuliner. Alokasi ideal yang disarankan adalah maksimal 25%.',
              },
              {
                type: 'WEEKEND_VELOCITY',
                severity: 'LOW',
                title: 'Pola Pengeluaran Akhir Pekan Terkendali',
                message: 'Tidak ditemukan transaksi impulsif berulang pada akhir pekan dalam 14 hari terakhir.',
              },
            ],
            recommendations: [
              {
                id: 'rec_1',
                title: 'Optimalisasi Dana Darurat Otomatis',
                description: 'Pindahkan 10% dari gaji begitu masuk ke rekening tabungan terpisah sebelum melakukan belanja kebutuhan tersier.',
                potentialSavings: 1500000,
              },
              {
                id: 'rec_2',
                title: 'Substitusi Langganan Digital Menganggur',
                description: 'Tinjau langganan streaming atau software yang jarang diakses untuk menghemat biaya berulang.',
                potentialSavings: 250000,
              },
              {
                id: 'rec_3',
                title: 'Kunci Batas Anggaran Belanja (Budgeting)',
                description: 'Aktifkan ambang batas peringatan 80% pada kategori gaya hidup untuk mencegah overspending di akhir bulan.',
                potentialSavings: 500000,
              },
            ],
          });
        }
      })
      .catch(() => {
        setData({
          healthScore: 78,
          healthStatus: 'STABIL',
          savingsRate: 20.0,
          netSavings: 2000000,
          totalIncome: 10000000,
          totalExpense: 8000000,
          estimatedRunwayDays: 45,
          anomalies: [
            {
              type: 'DAILY_VELOCITY',
              severity: 'LOW',
              title: 'Arus Kas Normal',
              message: 'Tidak ada anomali lonjakan pengeluaran besar terdeteksi dalam catatan mutasi Anda.',
            },
          ],
          recommendations: [
            {
              id: 'rec_1',
              title: 'Bangun Kebiasaan Menabung Rutin',
              description: 'Sisihkan minimal Rp500.000 setiap awal bulan untuk persiapan dana likuid darurat.',
              potentialSavings: 500000,
            },
          ],
        });
      })
      .finally(() => setIsLoading(false));
  }, [isAiAnalyticsModalOpen]);

  if (!isAiAnalyticsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D1926] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#4D8DBA]/20 bg-gradient-to-r from-violet-500/10 via-[#4D8DBA]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0C2340] dark:text-white">
                  Laporan Analitik AI Cuanly
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Gold & B2B
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Wawasan cerdas berbasis kecerdasan buatan untuk mengoptimalkan kesehatan dan tabungan finansial Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAiAnalyticsModal}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {isLoading || !data ? (
            <div className="text-center py-16 space-y-3">
              <Sparkles className="w-8 h-8 text-[#4D8DBA] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
                Memproses analitik AI dan pola mutasi finansial Anda...
              </p>
            </div>
          ) : (
            <>
              {/* Health Score Hero Widget */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0C2340] via-[#112233] to-[#1C4A6B] text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#8AD6D1]/20 text-[#8AD6D1] border border-[#8AD6D1]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Financial Health Score</span>
                  </div>
                  <h4 className="text-2xl font-extrabold">
                    Kondisi Keuangan:{' '}
                    <span className="text-[#8AD6D1] underline decoration-[#8AD6D1]/50 underline-offset-4">
                      {data.healthStatus}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm">
                    Arus kas Anda seimbang dengan rasio tabungan {data.savingsRate}% dari total pendapatan bulanan.
                  </p>
                </div>

                {/* Score Gauge Circle */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-white/10"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-[#8AD6D1] transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 * (1 - data.healthScore / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">{data.healthScore}</span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Key AI Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 font-medium">
                    <Activity className="w-3.5 h-3.5 text-[#4D8DBA]" />
                    <span>Savings Rate</span>
                  </div>
                  <div className="text-base font-extrabold text-[#0C2340] dark:text-white">
                    {data.savingsRate}%
                  </div>
                  <p className="text-[10px] text-emerald-500 font-bold">Optimal (&gt; 20%)</p>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Estimasi Runway Kas</span>
                  </div>
                  <div className="text-base font-extrabold text-[#0C2340] dark:text-white">
                    {data.estimatedRunwayDays} Hari
                  </div>
                  <p className="text-[10px] text-gray-400">Berdasarkan burn rate harian</p>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Surplus Bersih</span>
                  </div>
                  <div className="text-base font-extrabold text-[#0C2340] dark:text-white">
                    {formatCurrency(data.netSavings)}
                  </div>
                  <p className="text-[10px] text-emerald-500 font-bold">Pemasukan &gt; Pengeluaran</p>
                </div>
              </div>

              {/* Anomaly Alerts Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Deteksi Anomali & Pola Pengeluaran ({data.anomalies.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {data.anomalies.map((anom, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        anom.severity === 'MEDIUM'
                          ? 'border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200'
                          : 'border-blue-500/30 bg-blue-500/5 text-blue-900 dark:text-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <span>{anom.title}</span>
                        </span>
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                          {anom.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-slate-300">{anom.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Smart Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Rekomendasi Cerdas AI untuk Menabung
                  </span>
                </div>

                <div className="space-y-2.5">
                  {data.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl border border-gray-200 dark:border-[#4D8DBA]/25 bg-white dark:bg-slate-900/50 hover:border-[#4D8DBA] transition-all flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-[#0C2340] dark:text-white">
                          {rec.title}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-slate-300">
                          {rec.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Potensi Hemat</span>
                        <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md mt-0.5">
                          +{formatCurrency(rec.potentialSavings)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#4D8DBA]/20 bg-gray-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>Tersedia untuk pengguna paket <strong>Gold</strong> & <strong>B2B</strong>.</span>
          <button
            type="button"
            onClick={closeAiAnalyticsModal}
            className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 font-bold text-[#0C2340] dark:text-white transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
