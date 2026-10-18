'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import {
  ArrowLeft,
  MessageSquareWarning,
  CheckCircle,
  User,
  Mail,
  Calendar,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { ComplaintStatus } from '@/types';

export default function AdminComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = params.id as string;

  const { complaints, updateComplaint } = useAdmin();
  const { formatDate, locale, t } = useLanguage();

  const ticket = complaints.find((c) => c.id === complaintId);

  const [status, setStatus] = useState<ComplaintStatus>(ticket?.status || 'OPEN');
  const [resolutionNote, setResolutionNote] = useState(ticket?.resolutionNote || '');
  const [successMsg, setSuccessMsg] = useState('');

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-700">
          {locale === 'en' ? 'Complaint Ticket Not Found' : 'Tiket Keluhan Tidak Ditemukan'}
        </h2>
        <Link
          href="/admin/complaints"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cuanly-primaryDark text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'en' ? 'Back to Complaints List' : 'Kembali ke Daftar Keluhan'}</span>
        </Link>
      </div>
    );
  }

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    updateComplaint(ticket.id, status, resolutionNote);
    setSuccessMsg(locale === 'en' ? 'Ticket status updated successfully!' : 'Status tiket berhasil diperbarui!');
    setTimeout(() => {
      router.push('/admin/complaints');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/complaints"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-cuanly-primaryDark px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>
        <h1 className="text-base sm:text-lg font-bold text-cuanly-primaryDark">
          {locale === 'en' ? 'Complaint Ticket Management' : 'Penanganan Tiket Keluhan'}
        </h1>
        <div className="w-12"></div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Ticket Card */}
      <GlassCard className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                {ticket.ticketId}
              </span>
              <Badge
                variant={
                  ticket.priority === 'HIGH'
                    ? 'danger'
                    : ticket.priority === 'MEDIUM'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {locale === 'en' ? 'Priority' : 'Prioritas'}: {ticket.priority}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-cuanly-primaryDark">
              {ticket.title}
            </h2>
          </div>

          <Badge
            variant={
              ticket.status === 'RESOLVED'
                ? 'success'
                : ticket.status === 'IN_PROGRESS'
                ? 'warning'
                : 'danger'
            }
          >
            {ticket.status}
          </Badge>
        </div>

        {/* Reporter Info */}
        <div className="p-3 bg-gray-50 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-400 block text-[10px]">
                {locale === 'en' ? 'Reporter' : 'Pelapor'}
              </span>
              <span className="font-bold text-gray-800">{ticket.userName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-400 block text-[10px]">
                {locale === 'en' ? 'Email' : 'Email'}
              </span>
              <span className="font-semibold text-gray-800">{ticket.userEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-400 block text-[10px]">
                {locale === 'en' ? 'Report Date' : 'Tanggal Laporan'}
              </span>
              <span className="font-medium text-gray-800">{formatDate(ticket.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-gray-400 block text-[10px]">
                {locale === 'en' ? 'User ID' : 'ID Pengguna'}
              </span>
              <span className="font-mono text-gray-800">{ticket.userId}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
            {locale === 'en' ? 'Complaint / Issue Details:' : 'Rincian Keluhan / Masalah:'}
          </label>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 leading-relaxed">
            {ticket.description}
          </div>
        </div>

        {/* Status Updater Form */}
        <form onSubmit={handleSaveResolution} className="space-y-4 pt-2 border-t border-gray-100">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              {locale === 'en' ? 'Update Ticket Status' : 'Perbarui Status Tiket'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 font-bold"
            >
              <option value="OPEN">
                OPEN ({locale === 'en' ? 'Awaiting Action' : 'Menunggu Penanganan'})
              </option>
              <option value="IN_PROGRESS">
                IN_PROGRESS ({locale === 'en' ? 'Under Review / Working' : 'Sedang Dikerjakan Tim'})
              </option>
              <option value="RESOLVED">
                RESOLVED ({locale === 'en' ? 'Complaint Resolved' : 'Keluhan Terselesaikan'})
              </option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              {locale === 'en' ? 'Resolution Notes / Admin Response' : 'Catatan Resolusi / Tanggapan Admin'}
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder={
                locale === 'en'
                  ? 'Enter resolution action or response given to the user...'
                  : 'Tuliskan tindakan atau jawaban yang telah diberikan kepada pengguna...'
              }
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-cuanly-primaryDark hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-[0.99]"
            >
              {locale === 'en' ? 'Save Ticket Resolution' : 'Simpan Tindak Lanjut Tiket'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
