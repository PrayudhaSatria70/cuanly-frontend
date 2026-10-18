import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  const variantClass = {
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    danger: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
    info: 'bg-[#4D8DBA]/10 dark:bg-[#4D8DBA]/20 text-[#2E678E] dark:text-[#8AD6D1] border border-[#4D8DBA]/30 dark:border-[#4D8DBA]/40',
    neutral: 'bg-gray-100 dark:bg-[#0B1520] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-[#4D8DBA]/30',
  }[variant];


  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};
