'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { PieChart } from 'lucide-react';
import Link from 'next/link';

export const CategoryDonutChart: React.FC = () => {
  const { t, formatCurrency } = useLanguage();
  const { categories, getCategorySpent } = useFinance();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  const categoryData = expenseCategories.map((cat) => {
    const spent = getCategorySpent(cat.id);
    return {
      ...cat,
      spent,
    };
  });

  const totalExpense = categoryData.reduce((acc, c) => acc + c.spent, 0);

  // Calculate slice angles for SVG donut
  let cumulativePercent = 0;
  const slices = categoryData.map((cat) => {
    const percent = totalExpense > 0 ? (cat.spent / totalExpense) * 100 : 0;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += percent;
    const endAngle = (cumulativePercent / 100) * 360;

    return {
      ...cat,
      percent: Math.round(percent),
      startAngle,
      endAngle,
    };
  });

  // Helper to convert polar coords to cartesian for SVG path
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const activeCategory = slices.find((s) => s.slug === hoveredSlug) || slices[0];

  return (
    <div className="w-full animate-chart-entrance">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-cuanly-primaryDark flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cuanly-primary" />
          {t.home.expenseCategoryChart}
        </h3>
        <span className="text-xs font-semibold text-gray-500">
          Total: {formatCurrency(totalExpense)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 flex items-center justify-center animate-donut-sweep">
          <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
            {slices.length === 0 || totalExpense === 0 ? (
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#E5E7E8"
                strokeWidth="15"
              />
            ) : (
              slices.map((slice) => {
                if (slice.percent === 0) return null;
                const pathD = describeArc(50, 50, 38, slice.startAngle, slice.endAngle);
                const isHovered = hoveredSlug === slice.slug;

                return (
                  <path
                    key={slice.id}
                    d={pathD}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? '17' : '14'}
                    strokeLinecap="round"
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 8px ${slice.color})` : 'none',
                      transition: 'stroke-width 0.25s ease, filter 0.25s ease, opacity 0.3s ease',
                      opacity: hoveredSlug && !isHovered ? 0.45 : 1,
                    }}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredSlug(slice.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                  />
                );
              })
            )}
          </svg>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none animate-donut-center">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate max-w-[90px]">
              {activeCategory
                ? ((t.categories as Record<string, string>)[activeCategory.id] || activeCategory.fallbackName)
                : t.common.total}
            </span>
            <span className="text-sm font-bold text-cuanly-primaryDark num-tabular">
              {activeCategory ? `${activeCategory.percent}%` : '100%'}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 num-tabular truncate max-w-[95px]">
              {activeCategory ? formatCurrency(activeCategory.spent) : formatCurrency(totalExpense)}
            </span>
          </div>
        </div>

        {/* 6 Category Pills Legend */}
        <div className="flex-1 grid grid-cols-2 gap-2 w-full">
          {slices.map((slice, idx) => {
            const isHovered = hoveredSlug === slice.slug;
            return (
              <Link
                key={slice.id}
                href={`/budget/${slice.slug}`}
                onMouseEnter={() => setHoveredSlug(slice.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                style={{
                  animationDelay: `${120 + idx * 55}ms`,
                  borderColor: isHovered ? slice.color : undefined,
                }}
                className={`animate-legend-pill p-2.5 rounded-xl border transition-all duration-300 text-left flex flex-col justify-between ${
                  isHovered
                    ? 'bg-white shadow-md scale-[1.03]'
                    : 'bg-white/60 border-gray-200/80 hover:bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-300"
                      style={{
                        backgroundColor: slice.color,
                        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                    <span className="text-xs font-medium text-gray-700 truncate">
                      {(t.categories as Record<string, string>)[slice.id] || slice.fallbackName}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-cuanly-primaryDark num-tabular">
                    {slice.percent}%
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-gray-600 num-tabular">
                  {formatCurrency(slice.spent)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
