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
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};
