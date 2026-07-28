import { typography } from '@embed-engine/design-tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
      },
      width: {
        'builder-sidebar': '260px',
        'builder-publish': '360px',
      },
      height: {
        'builder-header': '72px',
      },
      fontFamily: {
        sans: typography.fontFamily.sans.split(',').map((font) => font.trim()),
      },
    },
  },
  plugins: [],
};
