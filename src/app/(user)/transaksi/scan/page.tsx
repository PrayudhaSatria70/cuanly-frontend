'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
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
  X,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function ScanReceiptPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, formatCurrency, locale } = useLanguage();
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

  // Modals & Camera states
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fallbackCameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  // Process arbitrary image file
  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await simulateOcrExtraction(file);
      populateForm(result);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger OCR scan on user-uploaded file via file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleProcessFile(file);
    e.target.value = '';
  };

  // Drag and drop handlers for upload box
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  // Device Camera functions
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setCapturedImage(null);
    stopCamera();

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not supported on this browser or context.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const msg = err instanceof Error ? err.message : 'Unable to access device camera.';
      setCameraError(msg);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    video.pause();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    if (videoRef.current && cameraStream) {
      videoRef.current.play().catch(() => {});
    }
  };

  const confirmCapturedPhoto = async () => {
    if (!capturedImage) return;

    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], `receipt_${Date.now()}.jpg`, { type: 'image/jpeg' });

      stopCamera();
      setIsCameraModalOpen(false);
      setCapturedImage(null);

      handleProcessFile(file);
    } catch (err) {
      console.error('Error confirming captured receipt photo:', err);
    }
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const populateForm = (result: ReceiptData) => {
    setScannedData(result);
    setMerchant(result.merchant);
    setTotalAmount(result.totalAmount);
    setDate(result.date);
    setSelectedCatId(result.suggestedCategoryId || 'cat_shopping');
    setNotes(locale === 'en' ? `Receipt from ${result.merchant}` : `Struk belanja dari ${result.merchant}`);
  };

  const handleSaveScannedTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedData || totalAmount <= 0) return;

    const cat = categories.find((c) => c.id === selectedCatId) || categories[2];

    const savedTx = addTransaction({
      userId: user?.id || 'usr_registered',
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
      title: t.transactions.receiptRecordedTitle,
      titleEn: 'Receipt Successfully Recorded',
      message: `${merchant} sebesar ${formatCurrency(totalAmount)} berhasil dicatat ke pengeluaran.`,
      messageEn: `${merchant} of ${formatCurrency(totalAmount)} successfully recorded to expenses.`,
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
          <GlassCard
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => setIsChoiceModalOpen(true)}
            className={`p-8 text-center border-2 border-dashed transition-all group cursor-pointer relative overflow-hidden ${
              isDragging
                ? 'border-[#8AD6D1] bg-[#8AD6D1]/10 scale-[1.01]'
                : 'border-[#AEC4D4]/60 dark:border-[#4D8DBA]/40 hover:border-[#4D8DBA] dark:hover:border-[#8AD6D1]'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs group-hover:scale-105 transition-transform mb-3 border border-emerald-200 dark:border-emerald-800/50">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#0C2340] dark:text-white">
              {t.receipt.uploadPrompt}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {t.receipt.uploadHint}
            </p>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsChoiceModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1C4A6B] via-[#2E678E] to-[#4D8DBA] hover:from-[#153852] hover:to-[#255577] text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer shadow-md shadow-[#4D8DBA]/25 transition-all hover:scale-105 active:scale-95 border border-white/20"
              >
                <Camera className="w-4 h-4 text-[#8AD6D1]" />
                <span>{t.receipt.takePhoto}</span>
              </button>
            </div>

            {/* Hidden Native File Pickers */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={fallbackCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </GlassCard>

          {/* Quick Sample Receipts Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.receipt.sampleReceipts}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_RECEIPTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 bg-white dark:bg-[#0D1926] hover:bg-gray-50 dark:hover:bg-[#112233] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl text-left transition-all hover:shadow-sm hover:border-[#4D8DBA] flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-[#0C2340] dark:text-white truncate">
                      {sample.name}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#071018] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-gray-800">
                      {sample.categoryName}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 num-tabular">
                    {formatCurrency(sample.totalAmount)}
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                    {locale === 'en' ? 'Click to test OCR →' : 'Klik untuk uji OCR →'}
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
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-spin">
            <RotateCw className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0C2340] dark:text-white">
              {t.receipt.processing}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {locale === 'en'
                ? 'Extracting merchant name, date, line items, and transaction total...'
                : 'Mengekstrak nama toko, tanggal, item barang, dan total transaksi...'}
            </p>
          </div>
          <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4"></div>
          </div>
        </GlassCard>
      )}

      {/* Scanned Result Review & Edit Form */}
      {scannedData && !isProcessing && (
        <form onSubmit={handleSaveScannedTransaction} className="space-y-6">
          <GlassCard className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#4D8DBA]/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0C2340] dark:text-white">
                    {t.receipt.resultTitle}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    {locale === 'en' ? 'OCR Confidence: ' : 'Akurasi OCR: '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{scannedData.confidenceScore}%</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScannedData(null)}
                className="text-xs text-gray-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium cursor-pointer"
              >
                {locale === 'en' ? 'Rescan Receipt' : 'Scan Ulang'}
              </button>
            </div>

            {/* Receipt Thumbnail & Key Values */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-36 h-44 rounded-xl overflow-hidden border border-gray-200 dark:border-[#4D8DBA]/30 flex-shrink-0 bg-gray-100 dark:bg-[#071018]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scannedData.receiptImageUrl}
                  alt={locale === 'en' ? 'Receipt' : 'Struk'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-3">
                {/* Merchant Name */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <Store className="w-3.5 h-3.5 text-[#4D8DBA]" />
                    {t.receipt.merchant}
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs sm:text-sm font-semibold bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Total Nominal (Editable) */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <FileText className="w-3.5 h-3.5 text-[#4D8DBA]" />
                    {locale === 'en' ? 'Total Amount (Rp)' : 'Total Nominal (Rp)'}
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 text-base sm:text-lg font-extrabold text-[#0C2340] dark:text-white bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D8DBA]/30 num-tabular"
                  />
                </div>

                {/* Date & Category */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-[#4D8DBA]" />
                      {t.common.date}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                      <Layers className="w-3.5 h-3.5 text-[#4D8DBA]" />
                      {t.common.category}
                    </label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-lg text-gray-900 dark:text-white"
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
              <div className="pt-3 border-t border-gray-100 dark:border-[#4D8DBA]/20">
                <span className="text-xs font-bold text-gray-600 dark:text-slate-300 block mb-2">
                  {t.receipt.itemsBreakdown}
                </span>
                <div className="bg-gray-50 dark:bg-[#0B1520] rounded-xl p-3 divide-y divide-gray-200/60 dark:divide-gray-800 text-xs">
                  {scannedData.lineItems.map((item) => (
                    <div key={item.id} className="py-1.5 flex items-center justify-between">
                      <span className="text-gray-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-semibold text-[#0C2340] dark:text-[#8AD6D1] num-tabular">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1">
                {t.common.notes}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#071018] border border-gray-200 dark:border-[#4D8DBA]/30 rounded-xl text-gray-900 dark:text-white"
              />
            </div>

            {/* Full-width save button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#1C4A6B] via-[#2E678E] to-[#4D8DBA] hover:from-[#153852] hover:to-[#255577] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#4D8DBA]/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer border border-white/20"
              >
                <span>{t.receipt.confirmAndSave}</span>
              </button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* ACTION CHOICE POPUP MODAL */}
      {isChoiceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsChoiceModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#0D1926] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#4D8DBA]/30 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-[#1C4A6B] via-[#2E678E] to-[#4D8DBA] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <Sparkles className="w-5 h-5 text-[#8AD6D1]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    {t.receipt.actionModalTitle}
                  </h3>
                  <p className="text-xs text-gray-200 line-clamp-1">
                    {t.receipt.actionModalSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChoiceModalOpen(false)}
                className="p-1.5 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title={t.receipt.closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Answer Buttons */}
            <div className="p-6 space-y-3.5">
              {/* Option 1: Open Device Camera */}
              <button
                type="button"
                onClick={() => {
                  setIsChoiceModalOpen(false);
                  setIsCameraModalOpen(true);
                  startCamera('environment');
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent hover:from-emerald-500/20 hover:via-emerald-500/10 hover:to-emerald-500/5 dark:from-emerald-950/40 dark:via-emerald-900/20 dark:to-transparent border border-emerald-400/40 dark:border-emerald-700/50 text-left transition-all group cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {t.receipt.openCameraOption}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                    {t.receipt.openCameraOptionDesc}
                  </p>
                </div>
              </button>

              {/* Option 2: Choose File from Device */}
              <button
                type="button"
                onClick={() => {
                  setIsChoiceModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#4D8DBA]/10 via-[#4D8DBA]/5 to-transparent hover:from-[#4D8DBA]/20 hover:via-[#4D8DBA]/10 hover:to-[#4D8DBA]/5 dark:from-[#0B1520] dark:via-[#071018] dark:to-[#0B1520] border border-[#AEC4D4]/60 dark:border-[#4D8DBA]/40 text-left transition-all group cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1C4A6B] to-[#4D8DBA] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-[#4D8DBA]/20 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6 text-[#8AD6D1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#4D8DBA] dark:group-hover:text-[#8AD6D1] transition-colors">
                      {t.receipt.chooseFileOption}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4D8DBA]/15 text-[#1C4A6B] dark:text-[#8AD6D1] border border-[#4D8DBA]/30">
                      Storage
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                    {t.receipt.chooseFileOptionDesc}
                  </p>
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 dark:bg-[#071018] border-t border-gray-100 dark:border-[#4D8DBA]/20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsChoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-[#112233] rounded-xl transition-colors cursor-pointer"
              >
                {t.receipt.closeModal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE DEVICE CAMERA VIEWFINDER MODAL */}
      {isCameraModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#0D1926] rounded-3xl shadow-2xl border border-[#4D8DBA]/40 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#1C4A6B] via-[#2E678E] to-[#4D8DBA] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                  <Camera className="w-5 h-5 text-[#8AD6D1]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">
                    {capturedImage ? t.receipt.capturedPreviewTitle : t.receipt.cameraModalTitle}
                  </h3>
                  <p className="text-[11px] text-gray-200">
                    {t.receipt.cameraModalSubtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setIsCameraModalOpen(false);
                  setCapturedImage(null);
                }}
                className="p-1.5 text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title={t.receipt.closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video or Captured Frame Container */}
            <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
              {capturedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capturedImage}
                  alt="Captured receipt"
                  className="w-full h-full object-contain max-h-[55vh]"
                />
              ) : cameraError ? (
                <div className="p-6 text-center space-y-3 max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {t.receipt.cameraErrorTitle}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {t.receipt.cameraErrorDesc}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        setIsCameraModalOpen(false);
                        fallbackCameraInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#4D8DBA] to-[#2E678E] text-white text-xs font-bold rounded-xl shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                    >
                      {t.receipt.fallbackNativeCamera}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover max-h-[55vh]"
                  />
                  {/* Viewfinder Receipt Frame Guide Overlay */}
                  <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-[#8AD6D1]/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-3 border-l-3 border-[#8AD6D1]" />
                      <div className="w-5 h-5 border-t-3 border-r-3 border-[#8AD6D1]" />
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-black/60 text-[#8AD6D1] backdrop-blur-md border border-[#8AD6D1]/30">
                        {t.receipt.cameraFrameGuide}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-3 border-l-3 border-[#8AD6D1]" />
                      <div className="w-5 h-5 border-b-3 border-r-3 border-[#8AD6D1]" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Camera Bottom Controls */}
            <div className="p-4 bg-[#0B1520] border-t border-[#4D8DBA]/20 flex items-center justify-between gap-3">
              {capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/10 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>{t.receipt.retakePhotoBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={confirmCapturedPhoto}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>{t.receipt.usePhotoBtn}</span>
                  </button>
                </>
              ) : !cameraError ? (
                <>
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-colors cursor-pointer"
                    title={t.receipt.switchCameraBtn}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  {/* Circular Shutter Button */}
                  <button
                    type="button"
                    onClick={snapPhoto}
                    className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 p-1 flex items-center justify-center shadow-xl transition-transform active:scale-90 cursor-pointer ring-4 ring-[#8AD6D1]/60"
                    title={t.receipt.snapPhotoBtn}
                  >
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#1C4A6B] to-[#4D8DBA] flex items-center justify-center text-white">
                      <Camera className="w-6 h-6 text-[#8AD6D1]" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setIsCameraModalOpen(false);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    {t.receipt.closeModal}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setIsCameraModalOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.receipt.closeModal}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
