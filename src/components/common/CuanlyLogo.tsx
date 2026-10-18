import React from 'react';

interface CuanlyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  theme?: 'dark' | 'light' | 'auto'; // 'dark' = white logo/text, 'light' = blue logo/text, 'auto' = responsive
}

export const CuanlyLogo: React.FC<CuanlyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'auto',
}) => {
  // Height classes mapper according to size
  const heightClass = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12',
    xl: 'h-14 sm:h-16',
  }[size];

  // Explicit dark theme requested (White logo + White text)
  if (theme === 'dark') {
    const src = variant === 'full' ? '/images/logo-dark.png' : '/images/logo-dark-icon.png';
    return (
      <div className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Cuanly"
          className={`${heightClass} w-auto object-contain select-none`}
        />
      </div>
    );
  }

  // Explicit light theme requested (Blue logo + Blue text)
  if (theme === 'light') {
    const src = variant === 'full' ? '/images/logo-light.png' : '/images/logo-light-icon.png';
    return (
      <div className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Cuanly"
          className={`${heightClass} w-auto object-contain select-none`}
        />
      </div>
    );
  }

  // Automatic responsive mode:
  // Shows blue logo in light mode, and white logo in dark mode
  const lightSrc = variant === 'full' ? '/images/logo-light.png' : '/images/logo-light-icon.png';
  const darkSrc = variant === 'full' ? '/images/logo-dark.png' : '/images/logo-dark-icon.png';

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Light Mode Logo (Blue logo & Blue text) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={lightSrc}
        alt="Cuanly"
        className={`${heightClass} w-auto object-contain select-none dark:hidden`}
      />
      {/* Dark Mode Logo (White logo & White text) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={darkSrc}
        alt="Cuanly"
        className={`${heightClass} w-auto object-contain select-none hidden dark:inline-block`}
      />
    </div>
  );
};
