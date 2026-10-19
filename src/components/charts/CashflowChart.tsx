'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFinance } from '@/contexts/FinanceContext';
import { TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const CashflowChart: React.FC = () => {
  const { t, formatCurrency, locale } = useLanguage();
  const { summary } = useFinance();
  const [activeMonth, setActiveMonth] = useState('Oct');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Realistic 4-month comparison data
  const data = [
    { month: 'Jul', income: 10500000, expense: 6200000 },
    { month: 'Aug', income: 11000000, expense: 7100000 },
    { month: 'Sep', income: 14000000, expense: 8500000 },
    { month: 'Oct', income: summary.thisMonthIncome, expense: summary.thisMonthExpense },
  ];

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 15000000);
  const current = data.find((d) => d.month === activeMonth) || data[3];
  const savingsRate = current.income > 0 ? Math.round(((current.income - current.expense) / current.income) * 100) : 0;

  return (
    <div className="w-full animate-chart-entrance">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-cuanly-primaryDark flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            {t.home.cashflowOverview}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t.home.thisMonthIncome} vs {t.home.thisMonthExpense}
          </p>
        </div>

        {/* Month selector pills */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-0.5 rounded-lg border border-gray-200/60 text-xs font-medium">
          {data.map((d) => (
            <button
              key={d.month}
              type="button"
              onClick={() => setActiveMonth(d.month)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeMonth === d.month
                  ? 'bg-white text-cuanly-primaryDark font-semibold shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {d.month}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly summary highlight */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-200/50 mb-5">
        <div>
          <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            {t.common.income} ({activeMonth})
          </span>
          <p className="text-sm font-bold text-emerald-600 num-tabular">
            {formatCurrency(current.income)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            {t.common.expense} ({activeMonth})
          </span>
          <p className="text-sm font-bold text-rose-600 num-tabular">
            {formatCurrency(current.expense)}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-gray-200/70 pt-2 sm:pt-0 sm:pl-3">
          <span className="text-[11px] font-medium text-gray-500">Savings Rate</span>
          <p className="text-sm font-bold text-cuanly-primaryDark flex items-center gap-1">
            <span className={savingsRate >= 20 ? 'text-emerald-600' : 'text-amber-600'}>
              {savingsRate}%
            </span>
            <span className="text-[10px] text-gray-400 font-normal">
              {savingsRate >= 20 ? '(Optimal)' : (locale === 'en' ? '(Tighten)' : '(Perketat)')}
            </span>
          </p>
        </div>
      </div>

      {/* SVG / CSS Bar Chart */}
      <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 pt-4 pb-2 border-b border-gray-200">
        {data.map((d, index) => {
          const targetIncomeHeight = Math.max(12, Math.round((d.income / maxVal) * 140));
          const targetExpenseHeight = Math.max(12, Math.round((d.expense / maxVal) * 140));
          const incomeHeight = isMounted ? targetIncomeHeight : 0;
          const expenseHeight = isMounted ? targetExpenseHeight : 0;
          const isSelected = d.month === activeMonth;

          return (
            <div
              key={d.month}
              onClick={() => setActiveMonth(d.month)}
              className={`flex-1 flex flex-col items-center cursor-pointer group transition-all duration-300 ${
                isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-75 hover:opacity-100'
              }`}
            >
              <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-36">
                {/* Income Bar */}
                <div
                  style={{
                    height: `${incomeHeight}px`,
                    transitionProperty: 'height, transform, opacity',
                    transitionDuration: '700ms',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.25, 0.64, 1)',
                    transitionDelay: `${index * 80}ms`,
                  }}
                  className="w-3.5 sm:w-5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all group-hover:brightness-110 group-hover:scale-y-105 shadow-sm relative group/bar"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 shadow-md">
                    +{formatCurrency(d.income)}
                  </div>
                </div>

                {/* Expense Bar */}
                <div
                  style={{
                    height: `${expenseHeight}px`,
                    transitionProperty: 'height, transform, opacity',
                    transitionDuration: '700ms',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.25, 0.64, 1)',
                    transitionDelay: `${index * 80 + 40}ms`,
                  }}
                  className="w-3.5 sm:w-5 bg-gradient-to-t from-rose-600 to-red-400 rounded-t-md transition-all group-hover:brightness-110 group-hover:scale-y-105 shadow-sm relative group/bar"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 shadow-md">
                    -{formatCurrency(d.expense)}
                  </div>
                </div>
              </div>

              <span
                className={`mt-2 text-xs transition-all ${
                  isSelected ? 'text-cuanly-primaryDark font-bold underline decoration-2 decoration-[#4D8DBA]' : 'text-gray-500 font-semibold'
                }`}
              >
                {d.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-emerald-500 to-teal-400"></span>
          <span>{t.common.income}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-rose-500 to-red-400"></span>
          <span>{t.common.expense}</span>
        </div>
      </div>
    </div>
  );
};
