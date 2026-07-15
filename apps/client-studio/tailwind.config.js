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
        },
      },
      spacing: {
        section: '24px',
      },
      screens: {
        mobile: { max: '767px' },
        tablet: { min: '768px' },
        desktop: { min: '1280px' },
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
        header: '58px',
        'hero-image': '18rem',
        'hero-content': '6.4rem',
        'social-proof': '4.2rem',
        'property-explorer': '44rem',
        'ai-conversation': '24rem',
        'faq-ai': '38rem',
      },
      minHeight: {
        'property-explorer': '44rem',
        'hero-content': '6.4rem',
        'faq-ai': '38rem',
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
