import React from 'react';

interface CuanlyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  theme?: 'dark' | 'light'; // dark = dark navy wallet (for light backgrounds), light = white wallet (for dark backgrounds)
}

export const CuanlyLogo: React.FC<CuanlyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'dark',
}) => {
  // Dimensions mapper
  const sizeMap = {
    sm: { iconWidth: 28, iconHeight: 24, fontSize: 'text-base' },
    md: { iconWidth: 38, iconHeight: 32, fontSize: 'text-xl' },
    lg: { iconWidth: 50, iconHeight: 42, fontSize: 'text-2xl sm:text-3xl' },
    xl: { iconWidth: 64, iconHeight: 54, fontSize: 'text-3xl sm:text-4xl' },
  }[size];

  const walletColor = theme === 'light' ? '#8AD6D1' : '#4D8DBA';
  const textColor = theme === 'light' ? 'text-white' : 'text-[#1C4A6B] dark:text-white';
  const claspHoleColor = theme === 'light' ? '#071018' : '#FFFFFF';


  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Wallet SVG Icon */}
      <svg
        width={sizeMap.iconWidth}
        height={sizeMap.iconHeight}
        viewBox="0 0 100 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* 1. Sekunder (#8AD6D1) Bill Peeking from Top */}
        <path
          d="M26 14C26 10.6863 28.6863 8 32 8H64C67.3137 8 70 10.6863 70 14V18H26V14Z"
          fill="#8AD6D1"
          transform="rotate(-4 48 13)"
        />

        {/* 2. Main Wallet Body (Primer #4D8DBA) */}
        <rect
          x="10"
          y="16"
          width="70"
          height="54"
          rx="14"
          fill={walletColor}
        />

        {/* 3. Right Clasp */}
        <rect
          x="65"
          y="35"
          width="24"
          height="16"
          rx="8"
          fill={walletColor}
        />
        {/* Clasp center dot */}
        <circle cx="77" cy="43" r="3.5" fill={claspHoleColor} />

        {/* 4. Bottom-Left Segmented Dial */}
        <g transform="translate(26, 52)">
          {/* Outer dial ring */}
          <circle cx="0" cy="0" r="14" fill={walletColor} />
          {/* Segmented radial ticks (Sekunder #8AD6D1) */}
          <circle
            cx="0"
            cy="0"
            r="11.5"
            fill="none"
            stroke="#8AD6D1"
            strokeWidth="4"
            strokeDasharray="2.2 1.6"
            strokeLinecap="butt"
          />
          {/* Tersier (#AEC4D4) top-left arc highlight */}
          <path
            d="M -11.5 0 A 11.5 11.5 0 0 1 0 -11.5"
            fill="none"
            stroke="#AEC4D4"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Inner core */}
          <circle cx="0" cy="0" r="7.5" fill={walletColor} />
        </g>
      </svg>

      {/* Logotype "Cuanly" */}
      {variant === 'full' && (
        <span
          className={`font-black tracking-tight ${sizeMap.fontSize} ${textColor} select-none font-sans`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Cuanly
        </span>
      )}
    </div>
  );
};
