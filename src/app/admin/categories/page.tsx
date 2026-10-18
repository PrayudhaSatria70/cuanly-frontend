'use client';

import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Badge } from '@/components/common/Badge';
import { Layers, Plus, X, Check } from 'lucide-react';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { categories, getCategorySpent } = useFinance();
  const { t, formatCurrency } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [color, setColor] = useState('#6366F1');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      slug,
      nameKey: slug,
      fallbackName: name.trim(),
      icon: 'MoreHorizontal',
      color,
      type,
    };

    categories.push(newCat);
    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-cuanly-primaryDark">
            {t.admin.categoryManagement}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Kelola kategori pengeluaran dan layanan platform untuk mempermudah klasifikasi
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.addCategory}</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const spent = getCategorySpent(cat.id);
          return (
            <GlassCard key={cat.id} className="p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-cuanly-primaryDark">
                      {cat.fallbackName}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">
                      slug: {cat.slug}
                    </span>
                  </div>
                </div>

                <Badge variant={cat.type === 'INCOME' ? 'success' : 'neutral'} size="sm">
                  {cat.type}
                </Badge>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Penggunaan:</span>
                <span className="font-bold text-cuanly-primaryDark num-tabular">
                  {formatCurrency(spent)}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-cuanly-primaryDark">
                Tambah Kategori Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Langganan SaaS, Hewan Peliharaan"
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Tipe Kategori
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'EXPENSE' | 'INCOME')}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl"
                >
                  <option value="EXPENSE">Pengeluaran (Expense)</option>
                  <option value="INCOME">Pemasukan (Income)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Warna Indikator
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 p-1 border border-gray-200 rounded-xl cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-purple-700 rounded-xl"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
