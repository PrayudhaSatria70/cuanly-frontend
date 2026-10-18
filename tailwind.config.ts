import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Direct Palette Tokens
        primer: '#4D8DBA',
        sekunder: '#8AD6D1',
        tersier: '#AEC4D4',

        cuanly: {
          // Primer: #4D8DBA
          primary: '#4D8DBA',
          primaryDark: '#2E678E',
          primaryDeep: '#1C4A6B',
          primaryLight: '#7BAFD4',

          // Sekunder: #8AD6D1
          secondary: '#8AD6D1',
          secondaryDark: '#4FA8A2',
          secondaryLight: '#C9EFEF',

          // Tersier: #AEC4D4
          tertiary: '#AEC4D4',
          tertiaryDark: '#6A899F',
          tertiaryLight: '#E8F0F5',

          supporting: '#AEC4D4',
          border: '#AEC4D4',
          canvas: '#F4F8FA',

          income: '#10B981',
          incomeBg: '#E8F8F7',
          expense: '#EF4444',
          expenseBg: '#FEF2F2',
          warning: '#F59E0B',
          warningBg: '#FFFBEB',
          info: '#4D8DBA',
          infoBg: '#EDF5FA',
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
