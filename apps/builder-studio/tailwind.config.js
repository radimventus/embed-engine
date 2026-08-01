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
          canvas: '#F5F7FB',
          ink: '#23334C',
          muted: '#7A879B',
          line: '#E7ECF3',
          lineSoft: '#E6EBF3',
          navy: '#18428F',
          navyDeep: '#123173',
          panel: '#EEF4FF',
          panelBorder: '#D7E4FF',
          soft: '#EEF3FA',
          hover: '#F7F9FC',
          success: '#138D45',
          successBg: '#E6F7ED',
          successBorder: '#C2ECCF',
          draft: '#E28A00',
          draftBg: '#FFF5E5',
          draftBorder: '#FFE3C2',
          section: '#FAFBFD',
          sectionBorder: '#E6ECF3',
          contentBorder: '#E4EAF2',
          divider: '#EFF2F6',
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
