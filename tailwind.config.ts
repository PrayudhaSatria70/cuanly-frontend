import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cuanly: {
          primary: '#6B7072',
          primaryDark: '#2C302E',
          primaryDeep: '#181B19',
          primaryLight: '#8C9294',
          secondary: '#FFFFFF',
          supporting: '#E5E7E8',
          border: '#E2E5E7',
          canvas: '#F6F8F9',
          income: '#10B981',
          incomeBg: '#ECFDF5',
          expense: '#EF4444',
          expenseBg: '#FEF2F2',
          warning: '#F59E0B',
          warningBg: '#FFFBEB',
          info: '#3B82F6',
          infoBg: '#EFF6FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.1)',
        card: '0 2px 10px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
