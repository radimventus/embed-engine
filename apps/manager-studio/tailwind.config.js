import { colors, typography } from '@embed-engine/design-tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        embed: {
          white: colors.white,
          black: colors.black,
          neutral: colors.neutral,
          status: colors.status,
          background: colors.background,
          foreground: colors.foreground,
          border: colors.border,
          brand: colors.brand,
          surface: colors.surface,
          action: colors.action,
        },
      },
      spacing: {
        section: '24px',
        header: '72px',
      },
      width: {
        sidebar: '14rem',
      },
      height: {
        header: '72px',
      },
      fontFamily: {
        sans: typography.fontFamily.sans.split(',').map((font) => font.trim()),
      },
      letterSpacing: {
        brand: typography.letterSpacing.brand,
        wide: typography.letterSpacing.wide,
      },
    },
  },
  plugins: [],
};
