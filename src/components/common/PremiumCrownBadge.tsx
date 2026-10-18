'use client';

import React from 'react';
import { Crown } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface PremiumCrownBadgeProps {
  plan?: 'SILVER' | 'GOLD' | 'B2B';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon-only' | 'pill' | 'chip';
  className?: string;
}

export const PremiumCrownBadge: React.FC<PremiumCrownBadgeProps> = ({
  plan = 'SILVER',
  size = 'sm',
  variant = 'icon-only',
  className = '',
}) => {
  const { isAdmin } = useSubscription();

  // Admin and demo admin are strictly exempt from pricing plans and have 100% full feature access.
  // Lock / crown badges are only for user and user demo.
  if (isAdmin) {
    return null;
  }
  // Canva-style luxury gold/amber gradient styling
  const planColor =
    plan === 'B2B'
      ? 'from-purple-500 to-indigo-600 text-white'
      : plan === 'GOLD'
      ? 'from-amber-400 via-amber-500 to-yellow-600 text-[#0C2340]'
      : 'from-[#4D8DBA] to-[#8AD6D1] text-white';

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${planColor} shadow-xs border border-white/30 backdrop-blur-xs select-none ${className}`}
        title={`Fitur Premium (${plan} Plan)`}
      >
        <Crown className={`${iconSize} fill-current drop-shadow-2xs`} />
        <span>{plan}</span>
      </span>
    );
  }

  if (variant === 'chip') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/50 shadow-2xs ${className}`}
        title={`Fitur Premium (${plan} Plan)`}
      >
        <Crown className={`${iconSize} fill-amber-400 text-amber-500`} />
        <span>PRO</span>
      </span>
    );
  }

  // Default: Canva-style crown thumbnail icon right on the button
  return (
    <span
      className={`inline-flex items-center justify-center p-0.5 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 shadow-xs ring-1 ring-amber-400/60 flex-shrink-0 animate-pulse duration-1000 ${className}`}
      title={`Fitur Berlangganan: ${plan} Plan (Klik untuk Upgrade)`}
    >
      <Crown className={`${iconSize} fill-amber-900 text-amber-950`} />
    </span>
  );
};
