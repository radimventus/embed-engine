import { colors, typography } from '@embed-engine/design-tokens';

/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
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
      screens: {
        // RCS-01 breakpoint system — desktop (≥1280) is SSOT geometry.
        mobile: { max: '767px' },
        tablet: { min: '768px' },
        tabletMin: { min: '768px', max: '1199px' },
        tabletMax: { min: '1200px', max: '1439px' },
        desktop: { min: '1280px' },
        desktopWide: { min: '1440px' },
      },
      width: {
        sidebar: '48px',
        canvas: '1432px',
      },
      minWidth: {
        canvas: '1432px',
      },
      maxWidth: {
        canvas: '1432px',
      },
      height: {
        header: '72px',
        'hero-image': '584px',
        'hero-overlay': '112px',
        'social-proof': '90px',
        'chapter-title': '60px',
        'spatial-terminal-surface': '484px',
        'thumbnail-rail': '80px',
        'faq-row': '45px',
        'property-explorer': '44rem',
        'ai-conversation': '24rem',
        'faq-ai': '400px',
        'chapter-spacing': '30px',
      },
      minHeight: {
        'spatial-terminal-surface': '484px',
        'property-explorer': '44rem',
        'faq-ai': '400px',
        'ai-conversation': '24rem',
      },
      maxHeight: {
        'ai-conversation': '24rem',
      },
      gridTemplateRows: {
        'media-gallery': '7fr 3fr',
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
