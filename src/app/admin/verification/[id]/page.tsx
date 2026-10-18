'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import {
  ArrowLeft,
  Store,
  FileCheck,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminVerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mitraId = params.id as string;

  const { mitraList, verifyMitra } = useAdmin();
  const { formatDate, locale, t } = useLanguage();

  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mitra = mitraList.find((m) => m.id === mitraId);

  if (!mitra) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-700">
          {locale === 'en' ? 'Partner Data Not Found' : 'Data Mitra Tidak Ditemukan'}
        </h2>
        <Link
          href="/admin/verification"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cuanly-primaryDark text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'en' ? 'Back to Verification Queue' : 'Kembali ke Antrean Verifikasi'}</span>
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    verifyMitra(
      mitra.id,
      'VERIFIED',
      notes || (locale === 'en' ? 'Documents verified and confirmed valid.' : 'Dokumen lengkap dan terverifikasi valid.')
    );
    setSuccessMsg(locale === 'en' ? 'Partner account verified successfully!' : 'Akun mitra berhasil diverifikasi!');
    setTimeout(() => {
      router.push('/admin/verification');
    }, 1200);
  };

  const handleReject = () => {
    verifyMitra(
      mitra.id,
      'REJECTED',
      notes || (locale === 'en' ? 'Documents do not meet legality criteria.' : 'Dokumen belum memenuhi persyaratan legalitas.')
    );
    setSuccessMsg(locale === 'en' ? 'Partner application rejected.' : 'Permohonan mitra ditolak.');
    setTimeout(() => {
      router.push('/admin/verification');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/verification"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-cuanly-primaryDark px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>
        <h1 className="text-base sm:text-lg font-bold text-cuanly-primaryDark">
          {locale === 'en' ? 'Partner Document Verification Review' : 'Tinjauan Berkas Verifikasi Mitra'}
        </h1>
        <div className="w-12"></div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Verification Card */}
      <GlassCard className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-cuanly-primaryDark">
                {mitra.businessName}
              </h2>
              <p className="text-xs text-gray-500">
                {locale === 'en' ? 'Business Sector' : 'Bidang Usaha'}: <span className="font-semibold">{mitra.category}</span>
              </p>
            </div>
          </div>

          <Badge
            variant={
              mitra.verificationStatus === 'VERIFIED'
                ? 'success'
                : mitra.verificationStatus === 'REJECTED'
                ? 'danger'
                : 'warning'
            }
          >
            {mitra.verificationStatus}
          </Badge>
        </div>

        {/* Business & Owner Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-gray-400">
              {locale === 'en' ? 'Business Owner Name' : 'Nama Pemilik Usaha'}
            </span>
            <p className="font-bold text-cuanly-primaryDark">{mitra.ownerName}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-gray-400">
              {locale === 'en' ? 'Phone Contact' : 'Kontak Telepon'}
            </span>
            <p className="font-bold text-cuanly-primaryDark">{mitra.phone}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-gray-400">
              {locale === 'en' ? 'Business Email' : 'Email Bisnis'}
            </span>
            <p className="font-bold text-cuanly-primaryDark">{mitra.email}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-gray-400">
              {locale === 'en' ? 'Application Date' : 'Tanggal Pengajuan'}
            </span>
            <p className="font-bold text-cuanly-primaryDark">{formatDate(mitra.submissionDate)}</p>
          </div>
        </div>

        {/* Legal Document Certificate Preview Card */}
        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
            <FileCheck className="w-4 h-4 text-purple-600" />
            <span>{locale === 'en' ? 'Attached Legal Documents' : 'Dokumen Legalitas Terlampir'}</span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-purple-200/60 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-gray-800">{mitra.documentType}</p>
              <p className="text-gray-500 font-mono text-[11px]">
                {locale === 'en' ? 'Registration No:' : 'No. Registrasi:'} {mitra.documentNumber}
              </p>
            </div>
            <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
              {locale === 'en' ? 'Valid Format' : 'Format Valid'}
            </span>
          </div>

          {mitra.notes && (
            <p className="text-xs text-gray-600 italic">
              {locale === 'en' ? 'System notes' : 'Catatan sistem'}: {mitra.notes}
            </p>
          )}
        </div>

        {/* Verification Notes Input */}
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1">
            {locale === 'en' ? 'Verifier Notes / Justification (Optional)' : 'Catatan Verifikator / Alasan (Opsional)'}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              locale === 'en'
                ? 'Example: Business license verified via official registry'
                : 'Contoh: Dokumen NIB telah diverifikasi sesuai OSS'
            }
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Verification Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleReject}
            className="flex-1 py-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <XCircle className="w-4 h-4" />
            <span>{locale === 'en' ? 'Reject Application' : 'Tolak Permohonan'}</span>
          </button>

          <button
            type="button"
            onClick={handleApprove}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{locale === 'en' ? 'Approve & Verify' : 'Verifikasi & Setujui'}</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
