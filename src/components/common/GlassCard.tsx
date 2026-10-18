import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'dark' | 'gradient';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  let baseStyle = 'glass-panel rounded-2xl';

  if (variant === 'subtle') {
    baseStyle = 'glass-panel-subtle rounded-2xl';
  } else if (variant === 'dark') {
    baseStyle = 'glass-panel-dark rounded-2xl';
  } else if (variant === 'gradient') {
    baseStyle = 'bg-gradient-to-br from-[#1C4A6B] via-[#2E678E] to-[#4D8DBA] text-white rounded-2xl shadow-lg border border-white/20';
  }

  const hoverStyle = hoverEffect
    ? 'transition-all duration-300 hover:shadow-glass-hover hover:-translate-y-0.5'
    : '';

  return (
    <div className={`${baseStyle} ${hoverStyle} p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};
