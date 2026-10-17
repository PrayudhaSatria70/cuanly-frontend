'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { useNotification } from '@/contexts/NotificationContext';
import { GlassCard } from '@/components/common/GlassCard';
import {
  SAMPLE_RECEIPTS,
  simulateOcrExtraction,
  SampleReceipt,
} from '@/lib/ocr-simulator';
import { ReceiptData } from '@/types';
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle2,
  Sparkles,
  Store,
  Calendar,
  Layers,
  FileText,
  RotateCw,
} from 'lucide-react';
import Link from 'next/link';

export default function ScanReceiptPage() {
  const router = useRouter();
  const { t, formatCurrency } = useLanguage();
  const { categories, addTransaction } = useFinance();
  const { addNotification } = useNotification();

  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null);

  // Form editable states
  const [merchant, setMerchant] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [date, setDate] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('cat_shopping');
  const [notes, setNotes] = useState('');

  // Trigger OCR scan on selected sample receipt
  const handleSelectSample = async (sample: SampleReceipt) => {
    setIsProcessing(true);
    try {
      const result = await simulateOcrExtraction(sample.imageUrl, sample.id);
      populateForm(result);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger OCR scan on user-uploaded file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await simulateOcrExtraction(file);
      populateForm(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const populateForm = (result: ReceiptData) => {
    setScannedData(result);
    setMerchant(result.merchant);
    setTotalAmount(result.totalAmount);
    setDate(result.date);
    setSelectedCatId(result.suggestedCategoryId || 'cat_shopping');
    setNotes(`Struk belanja dari ${result.merchant}`);
  };

  const handleSaveScannedTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedData || totalAmount <= 0) return;

    const cat = categories.find((c) => c.id === selectedCatId) || categories[2];

    const savedTx = addTransaction({
      userId: 'usr_demo_01',
      type: 'EXPENSE',
      amount: totalAmount,
      categoryId: cat.id,
      categoryName: cat.fallbackName,
      categorySlug: cat.slug,
      date: new Date(date).toISOString(),
      notes,
      receipt: {
        ...scannedData,
        merchant,
        totalAmount,
        date,
        suggestedCategoryId: selectedCatId,
      },
    });

    addNotification({
      title: 'Struk Berhasil Dimasukkan',
      message: `${merchant} sebesar ${formatCurrency(totalAmount)} berhasil dicatat ke pengeluaran.`,
      type: 'SUCCESS',
      link: `/transaksi/${savedTx.id}`,
    });

    router.push(`/transaksi/${savedTx.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/transaksi"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-cuanly-primaryDark px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>
        <div className="text-center">
          <h1 className="text-base sm:text-lg font-bold text-cuanly-primaryDark flex items-center justify-center gap-1.5">
            <Camera className="w-5 h-5 text-emerald-600" />
            {t.receipt.scannerTitle}
          </h1>
          <p className="text-xs text-gray-500">{t.receipt.scannerSubtitle}</p>
        </div>
        <div className="w-12"></div>
      </div>

      {!scannedData && !isProcessing && (
        <div className="space-y-6">
          {/* Upload Area */}
          <GlassCard className="p-8 text-center border-2 border-dashed border-gray-300 hover:border-cuanly-primaryDark transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform mb-3">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-cuanly-primaryDark">
              {t.receipt.uploadPrompt}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {t.receipt.uploadHint}
            </p>

            <div className="mt-5 flex justify-center">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-cuanly-primaryDark hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{t.receipt.takePhoto}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </GlassCard>

          {/* Quick Sample Receipts Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.receipt.sampleReceipts}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_RECEIPTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-left transition-all hover:shadow-sm hover:border-cuanly-primary flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-cuanly-primaryDark truncate">
                      {sample.name}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {sample.categoryName}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-600 num-tabular">
                    {formatCurrency(sample.totalAmount)}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    Klik untuk uji OCR &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing Animation */}
      {isProcessing && (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
            <RotateCw className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-cuanly-primaryDark">
              {t.receipt.processing}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mengekstrak nama toko, tanggal, item barang, dan total transaksi...
            </p>
          </div>
          <div className="w-48 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </GlassCard>
      )}

      {/* Scanned Result Review & Edit Form */}
      {scannedData && !isProcessing && (
        <form onSubmit={handleSaveScannedTransaction} className="space-y-6">
          <GlassCard className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-cuanly-primaryDark">
                    {t.receipt.resultTitle}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Akurasi OCR: <span className="font-bold text-emerald-600">{scannedData.confidenceScore}%</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScannedData(null)}
                className="text-xs text-gray-500 hover:text-rose-600 font-medium"
              >
                Scan Ulang
              </button>
            </div>

            {/* Receipt Thumbnail & Key Values */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-36 h-44 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scannedData.receiptImageUrl}
                  alt="Struk"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                {/* Merchant Name */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
                    <Store className="w-3.5 h-3.5" />
                    {t.receipt.merchant}
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30"
                  />
                </div>

                {/* Total Nominal (Editable) */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    Total Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 text-base sm:text-lg font-extrabold text-cuanly-primaryDark bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cuanly-primary/30 num-tabular"
                  />
                </div>

                {/* Date & Category */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {t.common.date}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
                      <Layers className="w-3.5 h-3.5" />
                      {t.common.category}
                    </label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg"
                    >
                      {categories.filter((c) => c.type === 'EXPENSE').map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.fallbackName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items extracted */}
            {scannedData.lineItems && scannedData.lineItems.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-600 block mb-2">
                  {t.receipt.itemsBreakdown}
                </span>
                <div className="bg-gray-50 rounded-xl p-3 divide-y divide-gray-200/60 text-xs">
                  {scannedData.lineItems.map((item) => (
                    <div key={item.id} className="py-1.5 flex items-center justify-between">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-semibold text-cuanly-primaryDark num-tabular">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                {t.common.notes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl"
              />
            </div>

            {/* Full-width save button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-cuanly-primaryDark hover:bg-black text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <span>{t.receipt.confirmAndSave}</span>
              </button>
            </div>
          </GlassCard>
        </form>
      )}
    </div>
  );
}
