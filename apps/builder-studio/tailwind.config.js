import { colors, typography } from '@embed-engine/design-tokens';

/**
 * Builder Studio Tailwind theme.
 * Includes Builder chrome tokens + Embed Experience tokens so CAP-BLD-07
 * Runtime Preview can compile Client Studio CSS (`text-embed-*` / @apply)
 * under the Builder Vite host without a parallel design system.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../client-studio/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        builder: {
          canvas: '#F7F6F4',
          ink: '#001930',
          muted: '#64748B',
          line: '#E3E3E3',
          lineSoft: '#E3E3E3',
          navy: '#001930',
          navyDeep: '#001930',
          panel: '#F7F6F4',
          panelBorder: '#E3E3E3',
          soft: '#F7F6F4',
          hover: '#E8E5E0',
          success: '#137A43',
          successBg: '#EAF5EE',
          successBorder: '#C5E6D1',
          draft: '#B45309',
          draftBg: '#FFF4E5',
          draftBorder: '#E3E3E3',
          danger: '#A93226',
          dangerBg: '#F8EBE9',
          section: '#FFFFFF',
          sectionBorder: '#E3E3E3',
          contentBorder: '#E3E3E3',
          divider: '#E3E3E3',
          creamMid: '#E8E5E0',
          creamDark: '#D9D4CC',
        },
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
        header: '70px',
      },
      screens: {
        mobile: { max: '767px' },
        tablet: { min: '768px' },
        desktop: { min: '1280px' },
      },
      width: {
        'builder-sidebar': '260px',
        'builder-publish': '340px',
        sidebar: '48px',
        canvas: '1432px',
      },
      height: {
        'builder-header': '70px',
        header: '70px',
        'chapter-title': '60px',
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
